// 카테고리 정의 — 불렛저널 색인 스타일 (SPEC 3.1)
export const CATEGORIES = [
  { key: 'project', sign: '★', label: '프로젝트' },
  { key: 'task', sign: '•', label: '할일' },
  { key: 'shopping', sign: '▢', label: '쇼핑' },
  { key: 'idea', sign: '!', label: '아이디어' },
  { key: 'note', sign: '—', label: '생각' },
];
export const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map((c) => [c.key, c]));
export const INBOX = { key: 'inbox', sign: '◇', label: '인박스' };

// 주제 태그 — 고정 6종 (부기능 연동용)
export const TOPIC_TAGS = ['#일기', '#심리', '#교육', '#의료', '#일', '#금융'];

// 뽀모도로 고정 패턴 (분)
export const POMODORO_PHASES = [
  { kind: 'work', min: 25 },
  { kind: 'break', min: 5 },
  { kind: 'work', min: 25 },
  { kind: 'break', min: 5 },
  { kind: 'work', min: 25 },
  { kind: 'break', min: 15 },
];

export const DEFAULT_SETTINGS = {
  eveningReviewHour: 20,
  dopamineMenu: ['5분 스트레칭', '따뜻한 차 한 잔', '창밖 보며 물 마시기'],
  biometricEnabled: false,
  lastIdeaReviewAt: null,
};

export const MIGRATION_LIMIT = 3; // 이월 3회 초과 시 쪼개기/폐기 제안
export const SKIP_LIMIT = 3; // 건너뛰기 3회 이상 시 쪼개기/폐기 제안
