# 연어항해일지

ADHD 작업기억 보조 — 브레인 덤프 + AI 트리아지 PWA. 상세 기획은 레포 루트의 [SPEC.md](../SPEC.md).

## 로컬 실행

```bash
cd salmon
npm install
cp .env.example .env   # Firebase 값 입력
npm run dev
```

`.env` 없이 실행하면 설정 안내 화면만 표시된다.

주의: AI 기능(`/api/claude`)은 Vercel 서버리스 함수라 `npm run dev`(vite)에서는 동작하지
않는다. 로컬에서 AI까지 테스트하려면 `vercel dev`를 사용할 것.

## 초기 설정 체크리스트

1. **Firebase 콘솔** (기존 프로젝트 재사용 가능)
   - Authentication → Google 로그인 활성화, 승인된 도메인에 Vercel 도메인 추가
   - Firestore 생성 → `firestore.rules` 내용 배포 (허용 이메일 확인)
   - `firestore.indexes.json` 배포 (entries status+createdAt 복합 인덱스 — open-only 구독/아카이브 페이지네이션용). `firebase deploy --only firestore:indexes` 또는 첫 실행 시 콘솔이 안내하는 링크로 생성
   - 프로젝트 설정에서 웹 앱 등록 → 구성값을 `.env`와 Vercel 환경변수에 입력
2. **Vercel**
   - GitHub 레포 연결, **Root Directory를 `salmon`으로 지정**
   - 환경변수 등록:
     - `VITE_FIREBASE_*` 6종 (클라이언트)
     - `CLAUDE_API_KEY`, `ALLOWED_EMAIL`, `FIREBASE_PROJECT_ID` (서버 전용)
     - 선택: `CLAUDE_MODEL` (기본 claude-sonnet-4-6), `GOOGLE_VISION_API_KEY` (부기능)
3. **폰 설치 (갤럭시 Z 폴드 7)**
   - 배포 URL을 Chrome으로 열고 "홈 화면에 추가"
   - 빠른 실행: 홈 화면 아이콘 롱프레스 → "새 덤프" 바로가기
   - 사이드 버튼 연결: 설정 → 유용한 기능 → 사이드 버튼 → 두 번 누르기 → 앱 실행 →
     연어항해일지 선택 (One UI 버전에 따라 메뉴명이 다를 수 있음)

## 구조

```
salmon/
├── api/claude.js        # Vercel 서버리스 — Claude 프록시 (토큰 검증 + 4개 액션)
├── firestore.rules      # 허용 이메일 1인만 읽기/쓰기
├── scripts/gen-icons.mjs# PWA 아이콘 생성 (zlib 기반, npm run gen-icons)
└── src/
    ├── config.js        # 카테고리·태그·뽀모도로 패턴 등 상수
    ├── firebase.js      # 초기화 + 오프라인 persistence
    ├── lib/db.js        # Firestore CRUD (entries/projects/settings)
    ├── lib/api.js       # /api/claude 클라이언트 (classify/prioritize/split/ideas)
    ├── components/TagBar.jsx
    └── screens/         # Dump / Organize / Focus / Evening / ProjectSetup / Settings
```

## 구현 상태 (SPEC v2.1 개발 순서 기준)

구현 완료: 1~16단계 — 컨텍스트 프로필(시드/주입/편집), 덤프·인박스, 정리 화면
(표시 시점 오버레이 + 완료/보관 페이지네이션), 프로젝트·마일스톤(제안 포함),
저녁 정리 4단계(인박스 분류·이월·아이디어 리뷰·프로필 갱신), 하이브리드 우선순위
엔진(LLM 항목평가 + 코드 결정론 정렬), 포커스 모드, 쪼개기, 뽀모도로, 설정.

아직 안 만든 것 (17~19단계, 부기능):
- 레퍼런스 탭 (사진 OCR / 유튜브 / 기사 요약)
- 카운슬러 탭 (심리 마스터 요약)
- 생체인증(WebAuthn) 옵션

핵심 로직 참고:
- `src/lib/dates.js` — 표시 시점 오버레이(pinned > D-1 이하 > 딥워크 > priority), 딥워크 요일 판정. 모두 코드 담당(LLM 없음).
- `api/claude.js` — 하이브리드 엔진: LLM은 항목별 평가만, 서버 코드가 점수 가중합산 + pinned 보호 + 안정성 앵커로 최종 정렬. 날짜 근거 문구는 코드 생성(D-1 이하만).
