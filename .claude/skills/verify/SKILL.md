---
name: verify
description: 이 리포의 단일 파일 HTML 앱(index.html, routine.html, timer.html, jump/)을 헤드리스 Chromium으로 구동해 검증하는 방법
---

# 검증 방법

이 리포의 앱은 전부 빌드 없는 단일 HTML 파일이다. 서버 불필요 — `file://` URL로 바로 연다.

예외: `jump/index.html`은 Firebase에 붙는 온라인 멀티플레이라 `file://`만으로는
검증되지 않는다. 아래 "jump/index.html" 절 참고.

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
- **jump/local.html**: 칩으로 플레이어 선택 → Start race → `runners` 길이·점수 확인.
- 가로(844×390)와 세로(390×844) 두 뷰포트 모두 스크린샷.

## jump/index.html (온라인 멀티플레이)

이 환경은 네트워크 정책상 `www.gstatic.com`(Firebase SDK)과 Firebase 서버에
접속할 수 없다. 실서버 검증은 불가능하므로 **가짜 Firebase를 주입해서** 검증한다.

`fakedb.js`(이 폴더)가 인메모리 RTDB + 익명 로그인 스텁을 제공한다.
`page.route`로 `**/firebasejs/**` 요청을 가로채 스텁 ES 모듈을 돌려주고,
`page.exposeFunction`으로 Node 쪽 공유 저장소에 연결한다. 브라우저 컨텍스트를
여러 개 띄우면 실제 다인 경주를 재현할 수 있다.

```js
const fake = require('/home/user/family/.claude/skills/verify/fakedb');
await fake.install(page);          // page.goto 전에 호출
```

내부 상태는 `<script type="module">` 스코프라 `page.evaluate`에서 안 보인다.
검사할 때는 원본을 고치지 말고 **복사본 끝에 훅을 덧붙여** 그 복사본을 연다:

```js
Object.defineProperty(window, "T", { get: () => ({
  uid, ready, room, players, game, lanes, views, me, running, obstacles, raceTime, laneOrder
})});
```

확인할 것: 로비 인원 일치 / 기기별 `laneOrder()` 동일 / `game.seed` 동일 /
`obstacles` 배치 동일 / 카운트다운 후 `raceTime() > 0` / 상대 `views[id].y`가
계속 갱신되는지 / 종료 시 **전원**이 같은 결과 문구를 보는지.

## 주의

- 앱 상태는 localStorage에 남는다. 깨끗한 상태로 재검증하려면 새 브라우저 컨텍스트를 쓰거나 `localStorage.clear()`.
- 전체 재렌더 방식이라 클릭 후 `waitForTimeout(200~400)` 필요.
