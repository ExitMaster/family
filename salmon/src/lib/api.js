// Claude API는 반드시 서버리스 프록시(/api/claude) 경유 — 키는 서버에만 존재 (SPEC 2)
// 트리아지 호출에는 컨텍스트 프로필(3.4)을 항상 실어 보낸다. 조립은 서버가 수행.
import { auth } from '../firebase';
import { todayISO, isDeepWorkDay } from './dates';

async function callAI(action, payload) {
  const user = auth.currentUser;
  if (!user) throw new Error('로그인이 필요합니다');
  const token = await user.getIdToken();
  const res = await fetch('/api/claude', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ action, ...payload }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`AI 호출 실패 (${res.status}) ${body.slice(0, 200)}`);
  }
  return res.json();
}

const profileOf = (settings) => settings?.contextProfile || null;

// active 프로젝트 요약 (goal + 미완료 마일스톤 제목) — 프롬프트 주입용
function activeProjectsCtx(projects) {
  return (projects || [])
    .filter((p) => p.status === 'active')
    .map((p) => ({
      name: p.name,
      tagName: p.tagName,
      goal: p.goal || '',
      milestones: (p.milestones || []).filter((m) => m.status === 'open').map((m) => m.title),
    }));
}

// 인박스 일괄 분류 제안 (저녁 정리 직전 batch 1회)
export function classifyInbox(items, settings) {
  return callAI('classify', {
    items: items.map(({ id, content }) => ({ id, content })),
    profile: profileOf(settings),
  });
}

// 하이브리드 우선순위 엔진 — "정리하기" 버튼 클릭 시에만 (SPEC 4.2)
// 평가 대상 = 미완료 할일 + 기한 있는 프로젝트
export function prioritize(items, settings, projects) {
  return callAI('prioritize', {
    items: items.map((e) => ({
      id: e.id,
      content: e.content,
      category: e.category,
      dueDate: e.dueDate ? e.dueDate.toDate().toISOString().slice(0, 10) : null,
      migratedCount: e.migratedCount || 0,
      skipCount: e.skipCount || 0,
      pinned: !!e.pinned,
      priority: e.priority ?? null,
      tags: e.tags || [],
    })),
    profile: profileOf(settings),
    today: todayISO(),
    isDeepWorkDay: isDeepWorkDay(settings?.deepWorkSchedule),
    activeProjects: activeProjectsCtx(projects),
  });
}

// 할일 쪼개기 마법사
export function splitTask(content, settings) {
  return callAI('split', { content, profile: profileOf(settings) });
}

// 마일스톤 제안 (목표 → 세부 목표 하향 분해)
export function suggestMilestones(goal, tasks, settings) {
  return callAI('milestones', { goal, tasks, profile: profileOf(settings) });
}

// 아이디어 주간 리뷰 — active 프로젝트 목록 주입
export function reviewIdeas(items, settings, projects) {
  return callAI('ideas', {
    items: items.map(({ id, content }) => ({ id, content })),
    profile: profileOf(settings),
    activeProjects: activeProjectsCtx(projects),
  });
}
