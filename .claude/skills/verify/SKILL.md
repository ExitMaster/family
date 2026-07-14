---
name: verify
description: 이 리포의 단일 파일 HTML 앱(index.html, timer.html)을 헤드리스 Chromium으로 구동해 검증하는 방법
---

# 검증 방법

이 리포의 앱은 전부 빌드 없는 단일 HTML 파일이다. 서버 불필요 — `file://` URL로 바로 연다.

## 구동 (원격 실행 환경 기준)

전역 Playwright(`/opt/node22/lib/node_modules/playwright`) + 사전 설치 Chromium 사용. `playwright install` 금지.

```js
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'
});
const page = await browser.newPage({ viewport: { width: 844, height: 390 } }); // 폰 가로 = TV 미러링
await page.goto('file:///home/user/family/timer.html');
```

- 버전이 바뀌면 `ls /opt/pw-browsers/`로 headless_shell 경로 확인.
- Google Fonts 요청이 `ERR_CONNECTION_RESET`으로 실패하는 콘솔 에러는 샌드박스 네트워크 차단 때문 — 무시 (폰트 폴백으로 동작).

## 구동해볼 플로우

- **timer.html**: 시작 🚀 → +10분 칩 → 다음 → 할 일 선택 → 시작 → `#remainBig` 카운트다운 확인 → 새로고침 후 세션 복원 확인. 시간 의존 상태(임박/완료)는 `page.evaluate`로 `ST.session.targetAt`을 조작한 뒤 `save(); lastUrg=null; render();`. `confirm`/`alert`은 `page.once('dialog', ...)`로 처리.
- **index.html**(카피바라): 상태는 localStorage `capy-v2-state`.
- 가로(844×390)와 세로(390×844) 두 뷰포트 모두 스크린샷.

## 주의

- 앱 상태는 localStorage에 남는다. 깨끗한 상태로 재검증하려면 새 브라우저 컨텍스트를 쓰거나 `localStorage.clear()`.
- 전체 재렌더 방식이라 클릭 후 `waitForTimeout(200~400)` 필요.
