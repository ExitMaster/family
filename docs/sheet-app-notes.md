# 악보 앱 — 구현 노트 (v1 첫 커밋)

전체 기획은 [`SHEET_APP_SPEC.md`](./SHEET_APP_SPEC.md) 참고. 이 문서는 실제 구현 시 스펙과
다르게 결정한 부분과, 이 커밋에서 아직 안 만든 부분을 기록한다.

## 이 커밋에서 한 것

스펙 §11.4 "첫 커밋 목표": **MusicXML 업로드 → OSMD 렌더링 → 프로필 선택 시 이조 적용**

- `sheet.html` — 단일 파일 앱 (이 리포의 `index.html`/`timer.html` 관습을 따름)
- `assets/osmd/opensheetmusicdisplay.min.js` — OSMD 2.0.0 (BSD-3-Clause, npm에서 받아 로컬에
  vendoring). CDN 대신 로컬 파일로 둔 이유: 이 앱은 오프라인 태블릿 전용이라 인터넷 없이도
  동작해야 한다.
- 엔진(`sheet.html` 안 `// ===ENGINE:START/END===` 블록): `transposeMusicXml(musicXml, opts)` —
  순수 함수, `toKey`/`instrument`/`none` 세 모드 지원. 조성 감지, 이명동조 정리(♯/♭ >6개),
  한국어 조성 라벨(다장조/라단조 등) 포함.
- `scripts/test-engine.mjs` — 엔진 단위 테스트. `.claude/skills/verify`와 같은 방식으로
  사전 설치된 헤드리스 Chromium을 빌려 써서 `DOMParser`/`XMLSerializer`를 진짜 브라우저에서
  검증한다 (Node 자체엔 DOMParser가 없음). `node scripts/test-engine.mjs`로 실행.

## 스펙과 다르게 결정한 부분

- **React+Vite 대신 단일 HTML**: 사용자가 이 리포 관습(빌드 없는 단일 파일)을 명시적으로
  선택함. §1.2의 스택 표는 참고만 하고 따르지 않았다.
- **저장은 IndexedDB 대신 localStorage**: 첫 커밋 범위엔 곡이 1개뿐이라 스펙 §2.1의
  Score 여러 개 저장 구조가 아직 필요 없다. IndexedDB 전환은 Phase 1(곡 목록)에서.

## 아직 안 만든 것 (Phase 1 이후)

- `leftHandReduce`, `octaveFold`, `tempoScale`, `annotate`(계이름/운지) — 엔진 파이프라인
  §3.1의 나머지 단계
- 에디터(§4), 연주 보조(§6), 서랍(§7) 전부
- `.mxl`(압축 MusicXML) 업로드 — 현재는 명확한 에러 메시지로 안내만 함
- 여러 곡 저장/목록 (IndexedDB)

## 알아둘 점

- 조성 감지는 문서에서 **첫 번째** `<key>`만 읽는다. 곡 중간에 전조가 있어도 반영 안 됨(v1
  한계, 대부분의 동요엔 해당 없음).
- `<mode>` 태그가 없으면 장조로 가정한다 (스펙은 "마지막 음으로 추정"을 제안했지만 첫 커밋
  범위에서는 생략 — 실제 아이들 악보엔 거의 항상 `<mode>`가 있음).
- 이조 시 임시표 표기는 목표 조표가 플랫계면 플랫, 샤프계면 샤프로 통일한다 (음별 최적
  스펠링 판단은 하지 않음).
