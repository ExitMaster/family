// 날짜·딥워크·표시 시점 오버레이 — 모두 코드 담당(결정론적, LLM 호출 없음) (SPEC 4.2)
import { WEEKDAYS, DEEP_WORK_TAG, DUE_MENTION_THRESHOLD_DAYS } from '../config';

// 로컬 자정 기준 오늘 (YYYY-MM-DD)
export function todayISO(now = new Date()) {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function weekdayKey(now = new Date()) {
  return WEEKDAYS[now.getDay()];
}

// 오늘이 딥워크 요일인가 — 해당 요일 배정 시간 > 0 (SPEC 4.2). AI가 추측하지 않는다.
export function isDeepWorkDay(deepWorkSchedule, now = new Date()) {
  if (!deepWorkSchedule) return false;
  return (deepWorkSchedule[weekdayKey(now)] || 0) > 0;
}

// dueDate(Timestamp|null) → 남은 일수. 없으면 null. 음수=경과.
export function daysLeftOf(dueTs, now = new Date()) {
  if (!dueTs) return null;
  const due = dueTs.toDate ? dueTs.toDate() : new Date(dueTs);
  const a = new Date(due.getFullYear(), due.getMonth(), due.getDate());
  const b = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((a - b) / 86400000);
}

export function isDueMentionable(dueTs, now = new Date()) {
  const d = daysLeftOf(dueTs, now);
  return d != null && d <= DUE_MENTION_THRESHOLD_DAYS;
}

// ── 표시 시점 오버레이 (SPEC 4.2) ──────────────────────────
// 저장된 priority는 "정리하기" 때만 갱신되므로, 날짜 의존 규칙(딥워크·D-1·pinned)은
// 로드할 때마다 "오늘" 기준으로 재적용한다. 서열: pinned > D-1 이하 > 딥워크 > priority.
function overlayTier(entry, { deepWork, now }) {
  if (entry.pinned) return 0;
  const d = daysLeftOf(entry.dueDate, now);
  if (d != null && d <= 1) return 1; // 당일·경과 포함 최상위 승격
  if (deepWork && (entry.tags || []).includes(DEEP_WORK_TAG)) return 2;
  return 3;
}

// open 할일 배열을 오버레이 서열로 정렬해 반환 (원본 불변)
export function orderByOverlay(tasks, { deepWorkSchedule, now = new Date() } = {}) {
  const deepWork = isDeepWorkDay(deepWorkSchedule, now);
  const withTier = tasks.map((e) => ({
    e,
    tier: overlayTier(e, { deepWork, now }),
    d: daysLeftOf(e.dueDate, now),
  }));
  withTier.sort((x, y) => {
    if (x.tier !== y.tier) return x.tier - y.tier;
    // tier 1(기한 임박·경과) 내부는 급한 순(남은 일수 오름차순 — 경과가 가장 위)
    if (x.tier === 1 && x.d !== y.d) return x.d - y.d;
    const px = x.e.priority ?? 9999;
    const py = y.e.priority ?? 9999;
    if (px !== py) return px - py; // priority 오름차순 (1이 최상위)
    const cx = x.e.createdAt?.toMillis?.() ?? 0;
    const cy = y.e.createdAt?.toMillis?.() ?? 0;
    return cy - cx; // 동률/미정렬: 최신순
  });
  return withTier.map((w) => w.e);
}
