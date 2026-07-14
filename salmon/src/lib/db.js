// Firestore CRUD 헬퍼 — 컬렉션: entries / projects / settings (SPEC 3.3)
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  setDoc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  Timestamp,
  increment,
} from 'firebase/firestore';
import { db } from '../firebase';
import { DEFAULT_SETTINGS, SEED_CONTEXT_PROFILE, SEED_DEEP_WORK_SCHEDULE } from '../config';

// ── entries ──────────────────────────────────────────────
export function addEntry({ content, category, dueDate = null, tags = [] }) {
  return addDoc(collection(db, 'entries'), {
    content,
    category, // 'project'|'task'|'shopping'|'idea'|'note'|'inbox'
    suggestedCategory: null,
    status: 'open',
    priority: null,
    priorityReason: null,
    suggest: null, // 'split'|'discard'|null (정리하기 제안)
    pinned: false,
    dueDate: dueDate ? Timestamp.fromDate(dueDate) : null,
    tags,
    migratedCount: 0,
    skipCount: 0,
    lastFocusedAt: null,
    classifiedBy: category === 'inbox' ? 'auto' : 'manual',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export function updateEntry(id, patch) {
  return updateDoc(doc(db, 'entries', id), { ...patch, updatedAt: serverTimestamp() });
}

// 기본 로드 = 미완료(open)만 (SPEC 4.2 로드 범위). done/archived/discarded 제외.
export function subscribeOpenEntries(cb) {
  const q = query(
    collection(db, 'entries'),
    where('status', '==', 'open'),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
}

// 완료/보관 토글 시 최근순 페이지네이션으로 추가 로드 (SPEC 4.2)
export async function loadArchived(after = null, pageSize = 30) {
  const clauses = [
    collection(db, 'entries'),
    where('status', 'in', ['done', 'archived', 'discarded']),
    orderBy('createdAt', 'desc'),
    limit(pageSize),
  ];
  if (after) clauses.push(startAfter(after));
  const snap = await getDocs(query(...clauses));
  return {
    items: snap.docs.map((d) => ({ id: d.id, ...d.data() })),
    cursor: snap.docs[snap.docs.length - 1] || null,
    done: snap.docs.length < pageSize,
  };
}

// 이월: 죄책감 없는 마이그레이션 — status 불변, dueDate 갱신 + migratedCount 증가만 (SPEC 3.3)
export function migrateEntry(entry, days) {
  const base = new Date();
  base.setHours(0, 0, 0, 0);
  base.setDate(base.getDate() + days);
  return updateEntry(entry.id, {
    dueDate: Timestamp.fromDate(base),
    migratedCount: increment(1),
    lastFocusedAt: null,
  });
}

export { increment, Timestamp };

// ── projects ─────────────────────────────────────────────
export function addProject({ name, goal = '', dueDate = null }) {
  return addDoc(collection(db, 'projects'), {
    name,
    tagName: '.' + name.replace(/\s+/g, ''),
    goal,
    milestones: [], // {id,title,dueDate?,status,order}
    dueDate: dueDate ? Timestamp.fromDate(dueDate) : null,
    status: 'active',
    createdAt: serverTimestamp(),
  });
}

export function updateProject(id, patch) {
  return updateDoc(doc(db, 'projects', id), patch);
}

export function subscribeProjects(cb) {
  const q = query(collection(db, 'projects'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
}

// 마일스톤은 projects.milestones 배열로 관리 (entries에 참조 필드 없음, SPEC 4.7)
export function newMilestone(title, order) {
  return {
    id: 'm_' + Math.random().toString(36).slice(2, 9),
    title,
    dueDate: null,
    status: 'open',
    order,
  };
}

// ── settings (단일 문서) ─────────────────────────────────
const settingsRef = () => doc(db, 'settings', 'main');

// 최초 실행 시 프로필·딥워크 스케줄을 시드 (SPEC 3.4). 이미 있으면 건드리지 않음.
export async function ensureSettings() {
  const snap = await getDoc(settingsRef());
  if (!snap.exists()) {
    await setDoc(settingsRef(), {
      eveningReviewHour: DEFAULT_SETTINGS.eveningReviewHour,
      dopamineMenu: DEFAULT_SETTINGS.dopamineMenu,
      biometricEnabled: false,
      lastIdeaReviewAt: null,
      contextProfile: SEED_CONTEXT_PROFILE,
      deepWorkSchedule: SEED_DEEP_WORK_SCHEDULE,
    });
  }
}

export function subscribeSettings(cb) {
  return onSnapshot(settingsRef(), (snap) =>
    cb(snap.exists() ? { ...DEFAULT_SETTINGS, ...snap.data() } : { ...DEFAULT_SETTINGS })
  );
}

export function updateSettings(patch) {
  return setDoc(settingsRef(), patch, { merge: true });
}

// 컨텍스트 프로필 부분 갱신 (weeklyStatus 원탭 갱신 등)
export function updateContextProfile(patch) {
  return setDoc(settingsRef(), { contextProfile: patch }, { merge: true });
}
