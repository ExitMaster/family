// Vercel Serverless Function — Claude API 프록시 (SPEC 2, 6)
// Firebase ID 토큰 검증 → 허용 이메일 확인 → Anthropic 호출. 키는 서버에만 존재.
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

const ACTIONS = {
  // 인박스 일괄 분류 — { items: [{id, content}] } → { results: [{id, category}] }
  async classify({ items }) {
    const system =
      '너는 브레인 덤프 항목 분류기다. 각 항목을 다음 중 하나로 분류하라: ' +
      'project(장기·다단계 작업), task(1건짜리 실행 과업), shopping(구매 목록), ' +
      'idea(디벨롭이 필요한 아이디어), note(실행 불필요한 생각·일기). ' +
      'JSON 배열만 출력: [{"id":"...","category":"..."}]';
    const out = await askClaude(system, JSON.stringify(items));
    return { results: parseJson(out) };
  },

  // 우선순위 재계산 — pinned 항목은 순위 유지, 근거 한 줄씩 (SPEC 4.2)
  async prioritize({ items }) {
    const system =
      '너는 ADHD 사용자의 할일 우선순위 조정가다. 기한 임박도, 이월 횟수(migratedCount), ' +
      '건너뛰기 횟수(skipCount), 프로젝트 연관성을 근거로 미완료 항목의 우선순위를 매겨라. ' +
      'pinned=true 항목은 현재 순위를 유지한다. ' +
      'skipCount 3회 이상 또는 migratedCount 3회 초과 항목에는 suggest 필드로 ' +
      '"split"(쪼개기) 또는 "discard"(폐기)를 제안하라. ' +
      'reason은 사용자에게 보여줄 부드러운 한국어 한 줄 (예: "기한이 이틀 남아 올렸어요"). ' +
      'JSON 배열만 출력: [{"id":"...","priority":1,"reason":"...","suggest":null}]';
    const out = await askClaude(system, JSON.stringify(items), 4096);
    return { results: parseJson(out) };
  },

  // 할일 쪼개기 — "시작할 수 있는 최소 단위" 3~4단계 (SPEC 4.6)
  async split({ content }) {
    const system =
      '너는 ADHD 사용자를 위한 할일 분해 도우미다. 주어진 할일을 "지금 바로 시작할 수 있는 ' +
      '최소 단위" 3~4단계로 쪼개라. 각 단계는 구체적 동사로 시작하는 짧은 한국어 문장. ' +
      'JSON 배열만 출력: ["1단계", "2단계", ...]';
    const out = await askClaude(system, content, 1024);
    return { steps: parseJson(out) };
  },

  // 아이디어 주간 리뷰 — 승격/폐기/보류 제안 (SPEC 4.3)
  async ideas({ items }) {
    const system =
      '너는 아이디어 트리아지 도우미다. 각 아이디어에 대해 다음 중 하나를 제안하라: ' +
      '"task"(할일로 전환), "project"(프로젝트로 승격), "discard"(폐기), "hold"(보류). ' +
      'reason은 부드러운 한국어 한 줄. ' +
      'JSON 배열만 출력: [{"id":"...","action":"...","reason":"..."}]';
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
