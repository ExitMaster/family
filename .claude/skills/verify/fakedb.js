// A tiny in-Node stand-in for Firebase RTDB + anonymous auth, injected into the
// page by intercepting the gstatic module URLs. Lets us test real two-player
// sync without network access.

const store = {};
let uidSeq = 0;

const split = p => p.split('/').filter(Boolean);

function getPath(path) {
  let n = store;
  for (const k of split(path)) { if (n == null || typeof n !== 'object') return null; n = n[k]; }
  return n === undefined ? null : n;
}
function setPath(path, val) {
  const parts = split(path);
  let n = store;
  for (const k of parts.slice(0, -1)) { if (typeof n[k] !== 'object' || n[k] === null) n[k] = {}; n = n[k]; }
  const last = parts[parts.length - 1];
  if (val === null) delete n[last]; else n[last] = val;
}
function updatePath(path, patch) {
  const cur = getPath(path);
  setPath(path, Object.assign({}, (cur && typeof cur === 'object') ? cur : {}, patch));
}

// resolve {__sv:'ts'} sentinels
function resolve(v) {
  if (v && typeof v === 'object') {
    if (v.__sv === 'ts') return Date.now();
    const out = Array.isArray(v) ? [] : {};
    for (const k of Object.keys(v)) out[k] = resolve(v[k]);
    return out;
  }
  return v;
}

const api = {
  __newUid: async () => 'uid' + (++uidSeq).toString().padStart(3, '0'),
  __get:    async (path) => JSON.stringify(getPath(path)),
  __set:    async (path, json) => { setPath(path, resolve(JSON.parse(json))); },
  __update: async (path, json) => { updatePath(path, resolve(JSON.parse(json))); },
  __remove: async (path) => { setPath(path, null); },
};

// The ES module text served in place of the real Firebase SDK.
const MODULE = `
const g = globalThis;
export function initializeApp(cfg) { return { cfg }; }
export function getAuth() { return {}; }
export async function signInAnonymously() { return { user: { uid: await g.__newUid() } }; }
export function getDatabase() { return {}; }
export function ref(db, path) { return { path: String(path) }; }
export function serverTimestamp() { return { __sv: 'ts' }; }
export async function set(r, v)    { await g.__set(r.path, JSON.stringify(v)); }
export async function update(r, v) { await g.__update(r.path, JSON.stringify(v)); }
export async function remove(r)    { await g.__remove(r.path); }
export function onDisconnect() { return { remove() {} }; }
export function onValue(r, cb) {
  let last = '__none__';
  const tick = async () => {
    if (r.path === '.info/serverTimeOffset') { cb({ val: () => 0 }); return; }
    const j = await g.__get(r.path);
    if (j !== last) { last = j; const v = JSON.parse(j); cb({ val: () => v }); }
  };
  tick();
  const h = setInterval(tick, 60);   // stands in for realtime push
  return () => clearInterval(h);
}
`;

async function install(page) {
  for (const [name, fn] of Object.entries(api)) {
    await page.exposeFunction(name, fn).catch(() => {});
  }
  await page.route('**/firebasejs/**', route =>
    route.fulfill({ status: 200, contentType: 'application/javascript', body: MODULE }));
}

module.exports = { install, store, getPath };
