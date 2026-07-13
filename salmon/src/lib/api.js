// Claude API는 반드시 서버리스 프록시(/api/claude) 경유 — 키는 서버에만 존재 (SPEC 2)
import { auth } from '../firebase';

export async function callAI(action, payload) {
  const user = auth.currentUser;
  if (!user) throw new Error('로그인이 필요합니다');
  const token = await user.getIdToken();
  const res = await fetch('/api/claude', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ action, ...payload }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`AI 호출 실패 (${res.status}) ${body.slice(0, 200)}`);
  }
  return res.json();
}

// 인박스 일괄 분류 제안 (저녁 정리 직전 batch 1회)
export function classifyInbox(items) {
  return callAI('classify', { items: items.map(({ id, content }) => ({ id, content })) });
}

// 우선순위 재계산 — "정리하기" 버튼 클릭 시에만
export function prioritize(items) {
  return callAI('prioritize', {
    items: items.map((e) => ({
      id: e.id,
      content: e.content,
      category: e.category,
      dueDate: e.dueDate ? e.dueDate.toDate().toISOString().slice(0, 10) : null,
      migratedCount: e.migratedCount || 0,
      skipCount: e.skipCount || 0,
      pinned: !!e.pinned,
      tags: e.tags || [],
    })),
  });
}

// 할일 쪼개기 마법사
export function splitTask(content) {
  return callAI('split', { content });
}

// 아이디어 주간 리뷰 제안
export function reviewIdeas(items) {
  return callAI('ideas', { items: items.map(({ id, content }) => ({ id, content })) });
}
