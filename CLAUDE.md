# Family 저장소 개발 지침

이 저장소는 두 개의 독립 결과물을 담는다. 서로 참조하지 않는다.

| 경로 | 내용 |
|---|---|
| `/index.html`, `/assets/` | 카피바라 숙제 탐험대 (기존 정적 앱) — 연어항해일지 작업 시 건드리지 않는다 |
| `/salmon/` | 연어항해일지 — ADHD 브레인 덤프 + AI 트리아지 PWA |
| `/SPEC.md` | 연어항해일지 설계 문서 (단일 진실 소스, 현재 v2.1) |

## 연어항해일지 (salmon/) 작업 규칙

- **설계 판단은 항상 SPEC.md를 따른다.** 구현과 스펙이 충돌하면 스펙이 우선이며, 스펙을 바꿀 일은 사용자와 합의 후 SPEC.md부터 갱신한다.
- **신뢰 모델 (SPEC §6)**: 개발자와 사용자(ku.hayoungkim@gmail.com)는 다른 사람이다. 앱 데이터는 사용자 소유 Firebase 프로젝트 안에서만 통제되고, 개발자의 다른 데이터·저장소·전역 설정을 참조하지 않는다. 이 파일은 자체 완결적으로 유지한다.
- **개발 데이터 원칙**: 개발·디버깅은 시드(가짜) 데이터로만 한다. 운영 Firestore에 테스트 데이터를 넣지 않는다. 로컬 검증은 Firebase 에뮬레이터 또는 별도 테스트 프로젝트를 사용한다.
- **비용 원칙**: AI 자동 호출은 인박스 batch 분류(저녁 정리 직전 1회)뿐. 나머지는 전부 버튼 클릭 시에만. 새 AI 기능을 붙일 때도 이 원칙을 유지한다.
- **LLM/코드 역할 분리**: 날짜 계산·D-day·최종 정렬·요일 판정은 코드가 한다. LLM에는 의미 판단(중요도·연관성·제안·근거 문구)만 시킨다. LLM에게 전체 순위를 출력시키지 않는다.
- **미니멀 디자인**: 애니메이션·사운드·게이미피케이션 금지. 완료 피드백은 취소선/페이드 수준까지만.

## 명령어 (salmon/ 안에서)

```bash
npm install        # 의존성
npm run dev        # 로컬 개발 (AI 프록시 미동작 — vercel dev 필요)
npm run build      # 프로덕션 빌드 (커밋 전 통과 확인)
npm run gen-icons  # PWA 아이콘 재생성
```

- 커밋 전 `npm run build`가 통과해야 한다.
- Claude API 프록시는 `salmon/api/claude.js` (Vercel 함수). 클라이언트에서 Anthropic을 직접 호출하는 코드를 만들지 않는다.
- Claude 모델명은 서버 환경변수 `CLAUDE_MODEL`(기본 claude-sonnet-4-6) 한 곳에서만 관리한다.

## 배포 구성 요약

- Vercel: Root Directory = `salmon`, GitHub push 시 자동 배포
- 서버 환경변수: `CLAUDE_API_KEY`, `ALLOWED_EMAIL`, `FIREBASE_PROJECT_ID`, (선택) `CLAUDE_MODEL`, `GOOGLE_VISION_API_KEY`
- 클라이언트 환경변수: `VITE_FIREBASE_*` 6종 (`salmon/.env.example` 참조)
- Firestore 규칙: `salmon/firestore.rules` (허용 이메일 1인)
