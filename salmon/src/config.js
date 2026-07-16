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

// 주제 태그 — 고정 6종 (부기능 연동용) (SPEC 3.2)
export const TOPIC_TAGS = ['#일기', '#심리', '#교육', '#의료', '#일', '#금융'];

// 기능 태그 (v2.1) — 딥워크 요일에 최상위 배치를 발동시킴 (SPEC 3.2, 4.2)
export const DEEP_WORK_TAG = '#딥워크';
export const FUNCTION_TAGS = [DEEP_WORK_TAG];

// 요일 키 (deepWorkSchedule 및 코드 요일 판정용)
export const WEEKDAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
export const WEEKDAY_LABELS = { sun: '일', mon: '월', tue: '화', wed: '수', thu: '목', fri: '금', sat: '토' };

// 뽀모도로 고정 패턴 (분) (SPEC 4.5)
export const POMODORO_PHASES = [
  { kind: 'work', min: 25 },
  { kind: 'break', min: 5 },
  { kind: 'work', min: 25 },
  { kind: 'break', min: 5 },
  { kind: 'work', min: 25 },
  { kind: 'break', min: 15 },
];

// 컨텍스트 프로필 초기 확정본 (SPEC 3.4) — 최초 배포 시 시드. 사용자가 설정에서 수정 가능.
export const SEED_CONTEXT_PROFILE = {
  fixedRules: `충돌 시 서열: 기한 임박(D-1) 할일 > 딥워크(딥워크 요일) > 일반 할일(기한순) > 아이디어 디벨롭
1. #딥워크 태그 항목은, 시스템이 오늘을 딥워크 요일로 알려준 경우 기한과 무관하게 최상위로 배치한다.
2. 기한 있는 할일은 D-1에 최상위로 승격한다. 그 전에는 기한을 이유로 순위를 올리거나 근거 문구에서 기한을 언급하지 않는다 — 장기 기한 추적은 피로를 유발함.
3. 미루는 항목(건너뛰기 3회 이상)에는 쪼개기를 먼저 제안하고, 쪼갠 뒤에도 실행되지 않으면 폐기를 솔직하게 제안한다.
4. 폐기 제안은 과감하게 — 목록이 깔끔한 것이 우선. 단 확정은 항상 사용자가 한다.
5. 분류 기준: 실행에 옮기고 싶거나 옮겨야 하는 것 = 아이디어, 실행 없이 내면에 머무르는 것 = 생각.
6. 아이디어의 할일·프로젝트 승격 제안은 보수적으로 — 산발적 확장보다 진행 중인 일의 완수가 우선이다.`,
  quarterFocus: `- 최우선 가치: 딥워크(논문 학습·작성, 법인 운영, 콘텐츠 제작·배포)의 습관화. 딥워크 항목의 착수와 완수를 다른 무엇보다 우선한다.
- 새 일을 벌이기보다 이미 벌여놓은 할일의 완수를 우선한다.
- 항목 하나하나가 작은 성취가 되도록, 큰 덩어리에는 쪼개기를 적극 제안한다.
- 동시 진행 프로젝트는 3개를 넘기지 않는다 (승격 제안 시 준수).`,
  weeklyStatus: `벌려놓은 할일 목록을 정리해 우선순위를 세우고 실제 실행으로 옮기는 주간 — 신규 확장 억제, 기존 항목 완수 우선.`,
  weeklyStatusUpdatedAt: null,
};

// 컨텍스트 프로필 작성 안내 (설정 화면 노출용, SPEC 3.4)
export const PROFILE_WRITING_GUIDE = [
  '가치 선언("가족이 중요")이 아닌 조건→동작 규칙("아이 관련 항목은 기한 무관 상위 5위 안 배치")으로 쓰세요.',
  '층별 5~7줄, 전체 20줄 이내. 규칙이 많으면 서로 충돌합니다.',
  '불변 규칙 첫 줄에 충돌 시 우선순위 서열을 명시하세요.',
];

// 딥워크 요일·시간 기본값 (시간 단위, SPEC 3.3)
export const SEED_DEEP_WORK_SCHEDULE = { mon: 2, tue: 3, wed: 2, thu: 2, fri: 3, sat: 0, sun: 0 };

export const DEFAULT_SETTINGS = {
  eveningReviewHour: 20,
  dopamineMenu: ['5분 스트레칭', '따뜻한 차 한 잔', '창밖 보며 물 마시기'],
  biometricEnabled: false,
  lastIdeaReviewAt: null,
  contextProfile: SEED_CONTEXT_PROFILE,
  deepWorkSchedule: SEED_DEEP_WORK_SCHEDULE,
};

export const MIGRATION_LIMIT = 3; // 이월 3회 초과 시 쪼개기/폐기 제안 (SPEC 4.2)
export const SKIP_LIMIT = 3; // 건너뛰기 3회 이상 시 쪼개기/폐기 제안 (SPEC 4.2)

// 근거 문구에서 기한 언급을 허용하는 임계 (D-1 이하, 당일·경과 포함) (SPEC 4.2)
export const DUE_MENTION_THRESHOLD_DAYS = 1;
