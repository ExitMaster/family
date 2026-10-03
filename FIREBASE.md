# Firebase Console 배포 준비 가이드

## Publishing the database rules — for a grown-up

가족용 웹앱들이 **하나의 Firebase 데이터베이스**(`Unimai Game Hub`)를 같이 씁니다.
규칙은 게임별로 따로 게시할 수 없고 **데이터베이스 전체가 한 덩어리**입니다.
그래서 이 저장소에는 **전체 규칙 한 벌**이 파일 하나로 들어 있습니다:

> ### 👉 [`firebase-rules.json`](firebase-rules.json)

All three family games share **one** Firebase database, and Realtime Database
rules are published for the **whole** database at once — not per game. So the
complete set lives in one file, and that file is the one you paste.

---

## 시작 전에 확인할 것

아래 작업에는 `unimai-game-hub` Firebase 프로젝트의 **소유자 또는 편집자 권한**이
필요합니다. 먼저 배포할 웹 주소를 정해 두세요. 예를 들어 GitHub Pages 주소가
`https://exitmaster.github.io/family/`라면 다음과 같습니다.

- 승인된 도메인: `exitmaster.github.io` (프로토콜과 경로를 제외한 호스트 이름만 입력)
- 한글마켓 초대 링크: `https://exitmaster.github.io/family/market/?invite=hangul-market`

`/market/?invite=hangul-market`만으로는 완전한 인터넷 주소가 아닙니다. 실제 배포 주소의
도메인과 저장소 경로를 앞에 붙여야 합니다. Firebase Console 설정은 데이터베이스와
로그인을 준비할 뿐, 이 저장소의 HTML을 자동으로 배포하지는 않습니다.

## 1. 프로젝트가 맞는지 확인하기

1. [Firebase Console](https://console.firebase.google.com/)에 로그인합니다.
2. 프로젝트 목록에서 **Unimai Game Hub** (`unimai-game-hub`)를 선택합니다.
3. 왼쪽 위 프로젝트 이름 옆의 톱니바퀴 → **프로젝트 설정**을 엽니다.
4. **일반** 탭에서 프로젝트 ID가 `unimai-game-hub`인지 확인합니다.

다른 프로젝트에서 설정하면 현재 한글마켓에는 반영되지 않습니다. 한글마켓 코드가
사용하는 프로젝트 ID와 데이터베이스 주소는 `market/index.html`의 `firebaseConfig`에
이미 들어 있으므로 Console에서 새 웹 앱을 추가하거나 키를 다시 복사할 필요는 없습니다.

## 2. 익명 로그인 활성화하기

한글마켓은 이름/비밀번호 대신 브라우저별 Firebase 익명 계정으로 상품 소유자와
예약자를 구분합니다.

1. 왼쪽 메뉴에서 **빌드(Build) → Authentication**을 선택합니다.
2. Authentication을 처음 연 경우 **시작하기(Get started)**를 누릅니다.
3. **로그인 방법(Sign-in method)** 탭을 엽니다.
4. 로그인 제공업체 목록에서 **익명(Anonymous)**을 선택합니다.
5. **사용 설정(Enable)** 스위치를 켜고 **저장(Save)**을 누릅니다.
6. 한글마켓을 한 번 연 뒤 **사용자(Users)** 탭에 제공업체가 `anonymous`인 사용자가
   생기면 정상입니다.

공식 문서: [웹에서 익명 인증 사용](https://firebase.google.com/docs/auth/web/anonymous-auth)

> **중요:** 브라우저 사이트 데이터나 익명 사용자를 삭제하면 새 UID가 발급됩니다.
> 그러면 같은 사람도 이전에 올린 상품을 수정·삭제하거나 기존 예약을 취소할 수 없습니다.
> 행사 종료 전에는 Authentication의 익명 사용자를 수동으로 삭제하지 마세요.

## 3. 배포 도메인 승인하기

1. **Authentication → 설정(Settings)**을 엽니다.
2. **승인된 도메인(Authorized domains)** 탭을 선택합니다.
3. **도메인 추가(Add domain)**를 누릅니다.
4. 실제 배포 URL에서 호스트 이름만 입력합니다.
   - GitHub Pages 예시: `exitmaster.github.io`
   - Firebase Hosting 예시: `unimai-game-hub.web.app`
   - 사용자 도메인 예시: `market.example.com`
5. **추가(Add)**를 누르고 목록에 나타나는지 확인합니다.

`https://`, 마지막 `/`, `/family/market/` 같은 경로, `?invite=...` 쿼리는 입력하지
않습니다. `localhost`는 로컬 시험용이며 실제 배포 도메인을 대신하지 않습니다.

공식 문서: [Authentication 승인 도메인 관리](https://firebase.google.com/docs/auth/web/redirect-best-practices#add_your_custom_domain_to_the_list_of_authorized_domains)

## 4. Realtime Database 규칙 게시하기

1. 왼쪽 메뉴에서 **빌드(Build) → Realtime Database**를 선택합니다.
2. 화면 위 데이터베이스가
   `unimai-game-hub-default-rtdb.asia-southeast1.firebasedatabase.app`인지 확인합니다.
3. **규칙(Rules)** 탭을 엽니다.
4. 만일을 위해 현재 편집기 내용을 별도 메모에 복사해 백업합니다.
5. 편집기 안의 기존 내용을 **전부 선택하여 지웁니다**.
6. 저장소 루트의 [`firebase-rules.json`](firebase-rules.json)을 열고, 첫 `{`부터 마지막
   `}`까지 **파일 전체**를 복사하여 편집기에 붙여넣습니다.
7. Console 편집기에 구문 오류가 표시되지 않는지 확인합니다.
8. **게시(Publish)**를 누르고 확인 창이 나오면 다시 게시를 선택합니다.
9. 새로고침한 뒤 규칙에 `"hangulMarket"` 블록이 남아 있는지 확인합니다.

끝입니다. 새로고침하면 바로 됩니다.

공식 문서: [Realtime Database 보안 규칙 시작하기](https://firebase.google.com/docs/database/security/get-started)

### Console에 붙여넣을 전체 규칙

첨부된 화면의 `Line 1: Expected '{'` 오류는 규칙이 `{`가 아니라 `".read"`부터
시작하기 때문에 발생했습니다. 아래 코드 블록은 **첫 줄의 `{`부터 마지막 줄의 `}`까지**
모두 복사하세요. 왼쪽의 줄 번호는 코드에 포함되지 않습니다. 붙여넣은 다음 Console의
1행이 `{`, 2행이 `  "rules": {`인지 확인하면 됩니다.

```json
{
  "rules": {
    "rooms": {
      "$room": {
        ".read": "auth != null",
        ".write": "auth != null",
        ".validate": "$room.matches(/^[A-Z0-9]{3,6}$/)"
      }
    },
    "banks": {
      "$who": {
        ".read": "auth != null",
        ".write": "auth != null",
        ".validate": "$who.matches(/^[a-z0-9_-]{1,14}$/)"
      }
    },
    "obbyScores": {
      "$board": {
        ".read": "auth != null",
        ".write": "auth != null",
        "$who": {
          ".validate": "newData.hasChildren(['n','v']) && newData.child('v').isNumber() && newData.child('n').isString() && newData.child('n').val().length <= 12"
        }
      }
    },
    "obbySaves": {
      "$who": {
        ".read": "auth != null",
        ".write": "auth != null",
        ".validate": "$who.matches(/^[a-z0-9_-]{1,12}$/) && newData.hasChildren(['orbs'])"
      }
    },
    "tripPlans": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "hangulMarket": {
      ".read": "auth != null",
      "profiles": {
        "$uid": {
          ".write": "auth != null && auth.uid == $uid"
        }
      },
      "products": {
        "$product": {
          ".write": "auth != null && ((!data.exists() && newData.child('owner').val() == auth.uid) || (data.child('owner').val() == auth.uid && (!newData.exists() || newData.child('owner').val() == auth.uid)))",
          "slots": {
            "$slot": {
              ".write": "auth != null && ((data.val() == true && newData.val() == auth.uid && newData.parent().parent().child('reservations').child(auth.uid).child('slot').val() == $slot) || (data.val() == auth.uid && newData.val() == true && !newData.parent().parent().child('reservations').child(auth.uid).exists()))"
            }
          },
          "reservations": {
            "$uid": {
              ".write": "auth != null && auth.uid == $uid && ((!data.exists() && newData.child('slot').isString() && newData.parent().parent().child('sold').val() != true && newData.parent().parent().child('slots').child(newData.child('slot').val()).val() == auth.uid) || (data.exists() && !newData.exists() && newData.parent().parent().child('slots').child(data.child('slot').val()).val() == true))"
            }
          }
        }
      }
    },
    "obbyLive": {
      ".read": "auth != null",
      "$who": {
        ".write": "auth != null",
        ".validate": "newData.hasChildren(['x','y','z']) && newData.child('x').isNumber() && newData.child('y').isNumber() && newData.child('z').isNumber()"
      }
    }
  }
}
```

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
| `hangulMarket` | 🛍️ 한글마켓 | 상품 등록·예약·수정 내용이 참여자끼리 공유되지 않음 |

세 게임 모두 **규칙이 없어도 그냥 조용히 혼자 하는 게임으로 작동합니다.**
빨간 오류가 뜨거나 게임이 멈추지는 않습니다.

Every game degrades gracefully: with no rules published the online half simply
never appears and the game runs as a single-device game. Nothing errors out.

---

## 5. 실제 초대 링크로 최종 점검하기

HTML이 배포된 후 시크릿 창 또는 다른 휴대폰에서 **완전한 초대 링크**를 엽니다.

1. 초대 쿼리 없이 `/market/`만 열었을 때 **초대가 필요해요**가 보이는지 확인합니다.
2. `...?invite=hangul-market`으로 열어 닉네임과 연락처를 저장합니다.
3. 사진이 있는 시험 상품을 등록합니다.
4. 다른 브라우저나 휴대폰에서 같은 초대 링크를 열어 상품이 보이는지 확인합니다.
5. 두 번째 기기에서 예약한 뒤 첫 번째 기기에서 **예약중** 표시를 확인합니다.
6. 두 번째 기기에서 예약을 취소하고, 첫 번째 기기에서 판매 완료/수정/삭제를 시험합니다.
7. Console의 **Realtime Database → 데이터(Data)** 탭에서
   `hangulMarket/profiles`와 `hangulMarket/products`가 생성됐는지 확인합니다.

시험 데이터는 앱에서 상품을 삭제하고, 필요하면 Data 탭의 시험 프로필만 삭제합니다.
실제 참여자의 프로필이나 익명 계정은 행사 중에 삭제하지 않는 편이 안전합니다.

## 문제가 생길 때

| 증상 | 확인할 곳 |
|---|---|
| 입장 후 상품을 불러오거나 저장하지 못함 | 익명 로그인이 켜졌는지, 전체 규칙을 게시했는지 확인 |
| `auth/unauthorized-domain` 오류 | 현재 주소의 호스트가 승인된 도메인 목록에 있는지 확인 |
| `PERMISSION_DENIED` 오류 | 로그인 성공 여부와 `hangulMarket` 규칙 게시 여부 확인 |
| 예전 상품을 수정할 수 없음 | 브라우저 데이터 또는 해당 익명 사용자를 삭제했는지 확인 |
| 초대 화면 대신 “초대가 필요해요” 표시 | URL에 `?invite=hangul-market`이 정확히 있는지 확인 |
| 다른 앱 기능이 갑자기 동작하지 않음 | 규칙 조각이 아니라 `firebase-rules.json` 전체를 게시했는지 확인 |

우선 확인해야 할 설정은 다음 두 가지입니다.

1. **Authentication → Sign-in method → 익명(Anonymous)** 이 **사용 설정됨**
2. **Authentication → Settings → 승인된 도메인**에 실제 배포 호스트가 있음

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
