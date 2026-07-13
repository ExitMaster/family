// Firestore CRUD 헬퍼 — 컬렉션: entries / projects / settings (SPEC 3.3)
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  setDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
  increment,
} from 'firebase/firestore';
import { db } from '../firebase';
import { DEFAULT_SETTINGS } from '../config';

// ── entries ──────────────────────────────────────────────
export function addEntry({ content, category, dueDate = null, tags = [] }) {
  return addDoc(collection(db, 'entries'), {
    content,
    category, // 'project'|'task'|'shopping'|'idea'|'note'|'inbox'
    suggestedCategory: null,
    status: 'open',
    priority: null,
    priorityReason: null,
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

export function subscribeEntries(cb) {
  const q = query(collection(db, 'entries'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
}

// 이월: 죄책감 없는 마이그레이션 — 기한을 옮기고 횟수만 기록
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

// ── projects ─────────────────────────────────────────────
export function addProject({ name, goal = '', dueDate = null }) {
  return addDoc(collection(db, 'projects'), {
    name,
    tagName: '.' + name.replace(/\s+/g, ''),
    goal,
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

// ── settings (단일 문서) ─────────────────────────────────
const settingsRef = () => doc(db, 'settings', 'main');

export function subscribeSettings(cb) {
  return onSnapshot(settingsRef(), (snap) =>
    cb(snap.exists() ? { ...DEFAULT_SETTINGS, ...snap.data() } : { ...DEFAULT_SETTINGS })
  );
}

export function updateSettings(patch) {
  return setDoc(settingsRef(), patch, { merge: true });
}
