// 검증 전용 가짜 Firebase SDK.
// app.js 가 import 하는 firebase-app / firebase-auth / firebase-firestore 세 URL 에
// 모두 이 모듈을 돌려준다. 세 URL 은 서로 다른 모듈 인스턴스가 되므로 상태는
// globalThis 에 둬서 공유한다.
//
// Firestore 쓰기 권한은 firestore.rules 의 care_events / attachments 규칙을
// 그대로 옮겨 적은 것이다. 실제 규칙 파일을 평가하지는 않는다.

const G = (globalThis.__fakeFirebase ||= {
  users: [],
  currentUser: null,
  authListeners: [],
  docs: new Map(),       // 'families/dalkkung/care_events/c1' -> {…}
  colListeners: [],      // {path, next}
  autoId: 0,
  writeLog: []
});

const SENTINEL = { __serverTimestamp: true };
const clone = v => (v === undefined ? undefined : JSON.parse(JSON.stringify(v)));
const resolveValues = obj => {
  const out = {};
  for (const [k, v] of Object.entries(obj)) out[k] = v === SENTINEL ? new Date().toISOString() : v;
  return out;
};
const parentPath = p => p.slice(0, p.lastIndexOf('/'));

/* ---------------- app ---------------- */
export function initializeApp(options) { return { name: '[DEFAULT]', options }; }

/* ---------------- auth ---------------- */
export function getAuth() {
  return {
    get currentUser() { return G.currentUser; }
  };
}
function emitAuth() { G.authListeners.forEach(cb => cb(G.currentUser)); }
export function onAuthStateChanged(auth, cb) {
  G.authListeners.push(cb);
  Promise.resolve().then(() => cb(G.currentUser));
  return () => { G.authListeners = G.authListeners.filter(x => x !== cb); };
}
export async function signInWithEmailAndPassword(auth, email, password) {
  const u = G.users.find(x => x.email === String(email).toLowerCase() && x.password === password);
  if (!u) { const e = new Error('bad credential'); e.code = 'auth/invalid-credential'; throw e; }
  G.currentUser = u; emitAuth(); return { user: u };
}
export async function createUserWithEmailAndPassword(auth, email, password) {
  const u = { uid: 'uid-' + (++G.autoId), email: String(email).toLowerCase(), password, emailVerified: false };
  G.users.push(u); G.currentUser = u; emitAuth(); return { user: u };
}
export async function sendEmailVerification() {}
export async function reload(user) { const u = G.users.find(x => x.uid === user.uid); if (u) user.emailVerified = u.emailVerified; }
export async function signOut() { G.currentUser = null; emitAuth(); }

/* ---------------- firestore ---------------- */
export function getFirestore() { return { __db: true }; }

export function doc(...args) {
  // doc(db, 'a', 'b', …) | doc(collectionRef) | doc(collectionRef, id)
  if (args[0] && args[0].__col) {
    const id = args[1] != null ? String(args[1]) : 'auto-' + (++G.autoId);
    return { __doc: true, path: `${args[0].path}/${id}`, id };
  }
  const segs = args.slice(1).map(String);
  return { __doc: true, path: segs.join('/'), id: segs[segs.length - 1] };
}
export function collection(...args) {
  if (args[0] && args[0].__doc) return { __col: true, path: `${args[0].path}/${args.slice(1).join('/')}` };
  return { __col: true, path: args.slice(1).map(String).join('/') };
}
export function serverTimestamp() { return SENTINEL; }

export async function getDoc(ref) {
  const data = G.docs.get(ref.path);
  return { id: ref.id, exists: () => data !== undefined, data: () => clone(data) };
}
export async function getDocs(colRef) {
  const docs = [...G.docs.entries()]
    .filter(([p]) => parentPath(p) === colRef.path)
    .map(([p, d]) => ({ id: p.slice(p.lastIndexOf('/') + 1), data: () => clone(d) }));
  return { docs, empty: docs.length === 0, size: docs.length };
}

function collectionOf(path) {
  const parent = parentPath(path);
  return parent.slice(parent.lastIndexOf('/') + 1);
}

// firestore.rules 의 care_events / attachments 규칙을 옮겨 적은 것.
function guard(op, path, incoming) {
  const col = collectionOf(path);
  if (col !== 'care_events' && col !== 'attachments') {
    if (op === 'delete') throw permissionDenied(path, 'delete 는 care_events/attachments 에서만 허용된다');
    return;
  }
  if (op === 'create') return;
  const existing = G.docs.get(path);
  if (!existing) throw permissionDenied(path, '문서가 없다');
  const uid = G.currentUser?.uid;
  const isAdmin = !!G.currentUser?.isAdmin;
  if (!isAdmin && existing.created_by !== uid) throw permissionDenied(path, '작성자도 관리자도 아니다');
  if (op === 'update' && incoming && 'created_by' in incoming && incoming.created_by !== existing.created_by) {
    throw permissionDenied(path, 'created_by 는 바꿀 수 없다');
  }
}
function permissionDenied(path, why) {
  const e = new Error(`Missing or insufficient permissions (${path}: ${why})`);
  e.code = 'permission-denied';
  return e;
}

function applySet(path, data, opts) {
  const value = resolveValues(data);
  const exists = G.docs.has(path);
  guard(exists ? 'update' : 'create', path, value);
  G.docs.set(path, opts?.merge && exists ? { ...G.docs.get(path), ...value } : value);
  G.writeLog.push({ op: 'set', path });
}
function applyUpdate(path, data) {
  const value = resolveValues(data);
  guard('update', path, value);
  G.docs.set(path, { ...(G.docs.get(path) || {}), ...value });
  G.writeLog.push({ op: 'update', path });
}
function applyDelete(path) {
  guard('delete', path);
  G.docs.delete(path);
  G.writeLog.push({ op: 'delete', path });
}

export async function setDoc(ref, data, opts) { applySet(ref.path, data, opts); notify(); }
export async function updateDoc(ref, data) { applyUpdate(ref.path, data); notify(); }
export async function deleteDoc(ref) { applyDelete(ref.path); notify(); }
export async function addDoc(colRef, data) {
  const ref = doc(colRef);
  applySet(ref.path, data);
  notify();
  return ref;
}
export function writeBatch() {
  const ops = [];
  return {
    set: (ref, data, opts) => { ops.push(() => applySet(ref.path, data, opts)); },
    update: (ref, data) => { ops.push(() => applyUpdate(ref.path, data)); },
    delete: ref => { ops.push(() => applyDelete(ref.path)); },
    commit: async () => { ops.forEach(fn => fn()); notify(); }
  };
}

export function onSnapshot(colRef, next) {
  const entry = { path: colRef.path, next };
  G.colListeners.push(entry);
  Promise.resolve().then(() => fire(entry));
  return () => { G.colListeners = G.colListeners.filter(x => x !== entry); };
}
function fire(entry) {
  const docs = [...G.docs.entries()]
    .filter(([p]) => parentPath(p) === entry.path)
    .map(([p, d]) => ({ id: p.slice(p.lastIndexOf('/') + 1), data: () => clone(d) }));
  entry.next({ docs, empty: docs.length === 0, size: docs.length });
}
function notify() { G.colListeners.slice().forEach(fire); }

// 테스트가 임의 시점에 실시간 갱신을 흉내낼 수 있도록 노출한다.
globalThis.__fakeFirebaseNotify = notify;
