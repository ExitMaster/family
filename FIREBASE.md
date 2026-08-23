# Firebase 규칙 게시하기 (어른용)

## Publishing the database rules — for a grown-up

가족 게임 세 개가 **하나의 Firebase 데이터베이스**(`Unimai Game Hub`)를 같이 씁니다.
규칙은 게임별로 따로 게시할 수 없고 **데이터베이스 전체가 한 덩어리**입니다.
그래서 이 저장소에는 **전체 규칙 한 벌**이 파일 하나로 들어 있습니다:

> ### 👉 [`firebase-rules.json`](firebase-rules.json)

All three family games share **one** Firebase database, and Realtime Database
rules are published for the **whole** database at once — not per game. So the
complete set lives in one file, and that file is the one you paste.

---

## 게시하는 법 — 5단계

1. <https://console.firebase.google.com> 에 들어가서 **unimai-game-hub** 프로젝트를 엽니다
2. 왼쪽 메뉴에서 **Realtime Database** → 위쪽 **규칙(Rules)** 탭
3. 편집기 안의 **내용을 전부 지웁니다**
4. 이 저장소의 [`firebase-rules.json`](firebase-rules.json) **전체를 복사해서 붙여넣습니다**
5. **게시(Publish)** 버튼

끝입니다. 새로고침하면 바로 됩니다.

> ⚠️ **일부만 붙여넣지 마세요.** 각 게임 README 안에도 규칙 조각이 적혀 있지만
> 그건 그 게임 부분만 설명하는 것입니다. 조각만 붙여넣고 게시하면 **나머지 게임의
> 규칙이 지워집니다.** 붙여넣는 것은 언제나 `firebase-rules.json` 전체입니다.
>
> Never paste a partial block. Publishing replaces the entire ruleset — a
> per-game snippet would silently delete every other game's rules.

---

## 어떤 칸이 어떤 게임인가

| 경로 | 쓰는 게임 | 없으면 생기는 일 |
|---|---|---|
| `rooms` | 🚀 제트팩 점프 · 🐰 버니 | 같이 하기(방 만들기)가 안 됨 |
| `banks` | 🚀 제트팩 점프 | 별·아바타가 기기에만 남음 |
| `obbyScores` | 🧗 오비 | 온라인 순위표 대신 이 기기 기록만 |
| `obbySaves` | 🧗 오비 | 닉네임 진행도가 다른 기기로 안 따라감 |
| `obbyLive` | 🧗 오비 | **멀티플레이가 안 됨** — 서로가 안 보임 |
| `tripPlans` | 🧳 여행 플래너 | 일정이 기기마다 따로 저장됨 (같이 안 보임) |

세 게임 모두 **규칙이 없어도 그냥 조용히 혼자 하는 게임으로 작동합니다.**
빨간 오류가 뜨거나 게임이 멈추지는 않습니다.

Every game degrades gracefully: with no rules published the online half simply
never appears and the game runs as a single-device game. Nothing errors out.

---

## 같이 확인할 것 두 가지

규칙을 게시해도 안 되면 이 둘을 봅니다 — 둘 다 이미 켜져 있어야 합니다.

1. **Authentication → Sign-in method → 익명(Anonymous)** 이 **사용 설정됨**
2. **Authentication → Settings → 승인된 도메인**에 `exitmaster.github.io` 가 있음

---

## 이 값들은 비밀번호가 아닙니다

게임 HTML 안에 있는 `firebaseConfig`(`apiKey` 등)는 **비밀번호가 아니라 주소 라벨**입니다.
웹 앱에 공개적으로 담기도록 설계된 식별자라 저장소가 공개여도 안전합니다.
실제 접근 제어는 전부 위 규칙이 합니다.

The `firebaseConfig` values in the game HTML are an address label, not a
password — they are designed to ship inside a public web page. The access
control is entirely in the rules above.

## 안전

- 로그인한 사람이면 누구나 위 경로에 쓸 수 있습니다. 가족 게임에는 충분하지만
  중요한 데이터를 둘 곳은 아닙니다.
- 닉네임만 쓰게 해 주세요. 실명·학교·주소는 다른 플레이어에게 보입니다.
- `obbyLive`는 몇 초마다 덮어쓰이고 탭을 닫으면 스스로 지워지는 임시 칸입니다.
  남겨 둘 가치가 있는 내용이 들어가지 않습니다.
