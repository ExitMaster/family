// Vercel Serverless Function — Claude API 프록시 (SPEC 2, 4.2, 6)
// Firebase ID 토큰 검증 → 허용 이메일 확인 → 컨텍스트 프로필 주입 → Anthropic 호출.
// 키는 서버에만 존재. LLM은 의미 판단만, 최종 정렬·날짜 계산은 코드가 결정론적으로 수행.
import { createRemoteJWKSet, jwtVerify } from 'jose';

const CLAUDE_MODEL = process.env.CLAUDE_MODEL || 'claude-sonnet-4-6';
const JWKS = createRemoteJWKSet(
  new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com')
);

async function verifyUser(req) {
  const authz = req.headers.authorization || '';
  const token = authz.startsWith('Bearer ') ? authz.slice(7) : null;
  if (!token) return null;
  const projectId = process.env.FIREBASE_PROJECT_ID;
  try {
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: `https://securetoken.google.com/${projectId}`,
      audience: projectId,
    });
    if (payload.email !== process.env.ALLOWED_EMAIL || !payload.email_verified) return null;
    return payload;
  } catch {
    return null;
  }
}

async function askClaude(system, userText, maxTokens = 2048) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': process.env.CLAUDE_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: maxTokens,
      system,
      messages: [{ role: 'user', content: userText }],
    }),
  });
  if (!res.ok) throw new Error(`Anthropic API ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.content?.[0]?.text ?? '';
}

// Claude 응답에서 JSON 블록만 안전하게 추출
function parseJson(text) {
  const m = text.match(/\[[\s\S]*\]|\{[\s\S]*\}/);
  if (!m) throw new Error('AI 응답에서 JSON을 찾지 못함');
  return JSON.parse(m[0]);
}

// ── 컨텍스트 프로필 주입 (SPEC 2, 3.4) ──────────────────────
// 클라이언트가 payload.profile로 전달 (1인 신뢰 모델 §6 — 위조 유인 없음). 조립은 서버가 수행.
function profileBlock(profile) {
  if (!profile) return '';
  const parts = [];
  if (profile.fixedRules) parts.push(`[불변 규칙]\n${profile.fixedRules}`);
  if (profile.quarterFocus) parts.push(`[분기 초점]\n${profile.quarterFocus}`);
  if (profile.weeklyStatus) parts.push(`[이번 주 상황]\n${profile.weeklyStatus}`);
  if (parts.length === 0) return '';
  return (
    '\n\n다음은 사용자의 우선순위 판단 기준(컨텍스트 프로필)이다. ' +
    '평가와 제안은 이 기준을 최우선으로 반영하라:\n' +
    parts.join('\n\n')
  );
}

// ── 날짜 계산 (코드 담당, SPEC 4.2 LLM/코드 역할 분리) ───────
// today는 클라이언트 로컬 날짜(YYYY-MM-DD)를 받아 시간대 문제를 피한다.
function daysLeft(dueISO, todayISO) {
  if (!dueISO) return null;
  const due = new Date(dueISO + 'T00:00:00');
  const today = new Date(todayISO + 'T00:00:00');
  return Math.round((due - today) / 86400000);
}

// 날짜 근거 문구는 코드가 생성. 기한 언급은 D-1 이하(당일·경과 포함)만 (SPEC 4.2).
function dueReason(d) {
  if (d == null || d > 1) return null;
  if (d < 0) return '기한이 지났어요';
  if (d === 0) return '오늘까지예요';
  return '내일까지예요';
}

const ACTIONS = {
  // 인박스 일괄 분류 — { items:[{id,content}], profile } → { results:[{id,category}] }
  async classify({ items, profile }) {
    const system =
      '너는 브레인 덤프 항목 분류기다. 각 항목을 다음 중 하나로 분류하라: ' +
      'project(장기·다단계 작업), task(1건짜리 실행 과업), shopping(구매 목록), ' +
      'idea(디벨롭이 필요한 아이디어), note(실행 불필요한 생각·일기). ' +
      profileBlock(profile) +
      '\n\nJSON 배열만 출력: [{"id":"...","category":"..."}]';
    const out = await askClaude(system, JSON.stringify(items));
    return { results: parseJson(out) };
  },

  // 하이브리드 우선순위 엔진 (SPEC 4.2) — LLM은 항목별 평가만, 코드가 최종 정렬.
  // payload: { items, profile, today(YYYY-MM-DD), isDeepWorkDay, activeProjects:[{name,goal,milestones}] }
  async prioritize({ items, profile, today, isDeepWorkDay, activeProjects = [] }) {
    const projectCtx =
      activeProjects.length > 0
        ? '\n\n진행 중 프로젝트(목표·미완료 마일스톤):\n' +
          activeProjects
            .map(
              (p) =>
                `- ${p.name} (${p.tagName}): ${p.goal || '목표 미정'}` +
                (p.milestones?.length ? ` / 마일스톤: ${p.milestones.join(', ')}` : '')
            )
            .join('\n')
        : '';
    const system =
      '너는 ADHD 사용자의 할일 평가자다. 전체 순위는 매기지 말고, 각 항목을 독립적으로 평가만 하라. ' +
      '위치나 순서에 영향받지 말고 항목 내용만 보라.' +
      profileBlock(profile) +
      projectCtx +
      `\n\n오늘은 딥워크 요일${isDeepWorkDay ? '이다' : '이 아니다'}. ` +
      '각 항목에 대해 JSON으로 평가하라. 날짜·D-day는 절대 계산하지 말고 기한을 근거 문구에 넣지 마라(코드가 처리한다). ' +
      'reason은 의미 판단만 담은 부드러운 한국어 한 줄(예: "논문작업 초고 마일스톤에 직결돼요"). ' +
      '출력 JSON 배열: [{"id":"...","importance":1~5,"goalRelevant":true/false,' +
      '"suggest":null|"split"|"discard","reason":"..."}]';
    const out = await askClaude(system, JSON.stringify(items), 4096);
    const evals = parseJson(out);
    const evalMap = Object.fromEntries(evals.map((e) => [e.id, e]));

    // ── 코드: 결정론적 최종 정렬 ──
    // 계수 근거: 중요도(1~5)를 주축(×10)으로, 목표연관은 보조 가점(+3),
    // D-1 이하 임박은 프로필 규칙 2에 따라 이때만 큰 보너스(+50)로 최상위 승격.
    // D-1 전에는 기한을 점수에 반영하지 않는다(장기 기한 추적 = 피로원).
    // pinned는 별도 트랙으로 항상 상단 보호. 동점은 직전 priority(안정성 앵커)로 tie-break.
    const scored = items.map((it) => {
      const ev = evalMap[it.id] || { importance: 3, goalRelevant: false, suggest: null, reason: '' };
      const d = daysLeft(it.dueDate, today);
      const dueBonus = d != null && d <= 1 ? 50 : 0;
      const score = ev.importance * 10 + (ev.goalRelevant ? 3 : 0) + dueBonus;
      const dr = dueReason(d);
      return {
        id: it.id,
        pinned: !!it.pinned,
        score,
        prevPriority: it.priority ?? 9999,
        // 날짜 근거(코드) 우선, 없으면 LLM 의미 근거
        reason: dr || ev.reason || null,
        suggest: ev.suggest || null,
      };
    });

    scored.sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1; // pinned 상단 보호
      if (b.score !== a.score) return b.score - a.score; // 점수 내림차순
      return a.prevPriority - b.prevPriority; // 안정성 앵커
    });

    const results = scored.map((s, i) => ({
      id: s.id,
      priority: i + 1,
      reason: s.reason,
      suggest: s.suggest,
    }));
    return { results };
  },

  // 할일 쪼개기 — "시작할 수 있는 최소 단위" 3~4단계 (SPEC 4.6)
  async split({ content, profile }) {
    const system =
      '너는 ADHD 사용자를 위한 할일 분해 도우미다. 주어진 할일을 "지금 바로 시작할 수 있는 ' +
      '최소 단위" 3~4단계로 쪼개라. 각 단계는 구체적 동사로 시작하는 짧은 한국어 문장.' +
      profileBlock(profile) +
      '\n\nJSON 배열만 출력: ["1단계", "2단계", ...]';
    const out = await askClaude(system, content, 1024);
    return { steps: parseJson(out) };
  },

  // 마일스톤 제안 — 목표→세부 목표 하향 분해 3~5개 (SPEC 4.7)
  async milestones({ goal, tasks = [], profile }) {
    const system =
      '너는 프로젝트 목표를 세부 목표(마일스톤)로 나누는 도우미다. ' +
      '마일스톤은 여러 할일의 완수로 달성되는 중간 목표이지 개별 행동이 아니다. ' +
      'goal과 기존 할일들을 참고해 마일스톤 3~5개를 순서대로 제안하라.' +
      profileBlock(profile) +
      '\n\nJSON 배열만 출력: ["마일스톤1", "마일스톤2", ...]';
    const out = await askClaude(system, JSON.stringify({ goal, tasks }), 1024);
    return { milestones: parseJson(out) };
  },

  // 아이디어 주간 리뷰 — 승격/폐기/보류 제안 (SPEC 4.3)
  // payload에 active 프로젝트 목록 주입 (동시 3개 초과 금지 규칙 판단용)
  async ideas({ items, profile, activeProjects = [] }) {
    const projectCtx =
      '\n\n현재 진행 중(active) 프로젝트 ' +
      activeProjects.length +
      '개' +
      (activeProjects.length ? ': ' + activeProjects.map((p) => p.name).join(', ') : '') +
      '. 프로필의 "동시 진행 3개 초과 금지"를 고려해 project 승격은 보수적으로 제안하라.';
    const system =
      '너는 아이디어 트리아지 도우미다. 각 아이디어에 대해 다음 중 하나를 제안하라: ' +
      '"task"(할일로 전환), "project"(프로젝트로 승격), "discard"(폐기), "hold"(보류). ' +
      'reason은 부드러운 한국어 한 줄.' +
      profileBlock(profile) +
      projectCtx +
      '\n\nJSON 배열만 출력: [{"id":"...","action":"...","reason":"..."}]';
    const out = await askClaude(system, JSON.stringify(items), 4096);
    return { results: parseJson(out) };
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method not allowed' });
  const user = await verifyUser(req);
  if (!user) return res.status(401).json({ error: 'unauthorized' });

  const { action, ...payload } = req.body || {};
  const fn = ACTIONS[action];
  if (!fn) return res.status(400).json({ error: `unknown action: ${action}` });
  try {
    res.status(200).json(await fn(payload));
  } catch (e) {
    res.status(502).json({ error: String(e.message || e) });
  }
}
