# 한글마켓 개발 인수인계서

이 문서는 다른 개발자 또는 AI가 기존 대화 없이도 한글마켓 작업을 이어갈 수 있도록
현재 구현, 제품 요구사항, Firebase 구성, 데이터 구조, 배포 절차, 검증 방법과 알려진
위험을 한곳에 정리한 문서입니다.

## 1. 제품 목표와 확정 요구사항

한글마켓은 약 20명의 지인이 한 번의 플리마켓을 준비하면서 물건을 미리 공유하고
선착순 예약하는 **모바일 우선 정적 웹앱**입니다.

- 앱 이름: 한글마켓
- 행사: 1회성, 행사별 관리와 거래 기록 장기 보관은 불필요
- 접근: 초대 링크를 받은 사람만 접근
- 사용자: 누구나 판매와 예약 가능
- 사용자 정보: 닉네임, 연락처
- 별도 관리자 계정: 없음
- 상품 정보: 상품명, 사진 1~5장, 정가 또는 무료나눔, 설명, 수량, 판매자 정보
- 목록: 최신 등록순 단일 게시판, 판매자 필터, 찜 필터
- 상품: 상세 화면과 공유 링크 제공
- 예약: 재고 내 선착순, 본인 예약 취소 가능
- 상태: 판매중, 예약중, 판매완료
- 판매자 권한: 자기 상품 수정, 삭제, 판매완료/판매중 전환
- 제외 범위: 앱 내 결제, 채팅, 알림, 정산, CSV, 카테고리, 관리자 화면
- 주 사용 환경: 휴대폰 브라우저
- 디자인 방향: 심플하고 실용적
- 예상 운영비: 월 US$20 이하

초대 링크는 인증이나 비밀 링크가 아니라 가벼운 진입 장벽이다. 링크를 전달받은 사람은
누구나 앱에 들어올 수 있으므로 민감정보를 저장하는 서비스로 확대하면 안 된다.

## 2. 관련 파일

| 파일 | 역할 |
|---|---|
| `market/index.html` | UI, CSS, Firebase SDK 호출을 모두 포함한 단일 페이지 앱 |
| `market/README.md` | 사용자/배포 담당자를 위한 짧은 소개와 준비 목록 |
| `market/HANDOFF.md` | 개발 인수인계 문서(현재 파일) |
| `market/tests/` | Realtime Database 규칙 테스트(Emulator) |
| `firebase-rules.json` | 이 저장소의 모든 앱이 공유하는 Realtime Database 전체 규칙 |
| `FIREBASE.md` | Firebase Console 설정, 전체 규칙 복사본, 배포 후 점검 절차 |

앱에는 빌드 시스템, 패키지 관리자, 번들러가 없다(테스트 전용 `market/tests/package.json`만 있다). 정적 서버로 저장소 루트를
서비스하면 `/market/`에서 실행된다. Firebase JavaScript SDK는 gstatic CDN의 ES module을
직접 불러온다.

## 3. 현재 Firebase 연결 정보

`market/index.html`의 `firebaseConfig`가 다음 기존 프로젝트를 가리킨다.

- Firebase 프로젝트 이름: `Unimai Game Hub`
- 프로젝트 ID: `unimai-game-hub`
- Realtime Database:
  `https://unimai-game-hub-default-rtdb.asia-southeast1.firebasedatabase.app`
- 데이터 루트: `/hangulMarket`
- 인증: Firebase Authentication 익명 로그인
- 현재 SDK 버전: `10.12.5`

Firebase 웹 설정값은 공개 클라이언트 식별자이며 비밀번호가 아니다. 실제 접근 통제는
`firebase-rules.json`이 담당한다. 프로젝트를 바꾸지 않는 한 Firebase Console에서 새 웹
앱을 만들거나 설정값을 다시 발급할 필요가 없다.

## 4. URL과 초대 처리

- 초대 토큰 상수: `hangul-market`
- 앱 상대 주소: `/market/?invite=hangul-market`
- 현재 문서의 GitHub Pages 예시:
  `https://exitmaster.github.io/family/market/?invite=hangul-market`
- 상품 공유 주소:
  `/market/?invite=hangul-market&item=<Firebase product key>`

앱은 `invite` 쿼리가 맞으면 같은 탭의 `sessionStorage`에 `hangul-invited=1`을 저장한다.
따라서 같은 탭에서는 쿼리가 사라져도 계속 입장할 수 있지만 새 브라우저/시크릿 창에서는
초대 쿼리가 다시 필요하다. 잘못된 토큰이면 Firebase 연결 전에 “초대가 필요해요” 화면을
렌더링한다.

## 5. 인증과 브라우저 저장소

앱 시작 시 `signInAnonymously()`를 호출하고 Firebase 익명 UID를 소유권 식별자로 사용한다.

| 저장 위치 | 키/경로 | 내용 |
|---|---|---|
| Firebase Auth | 익명 사용자 UID | 상품 소유자와 예약자 식별 |
| Realtime Database | `hangulMarket/profiles/<uid>` | `{ nickname, contact }` |
| `localStorage` | `hangul-profile` | 현재 브라우저의 닉네임과 연락처 |
| `localStorage` | `hangul-favorites` | 찜한 product key 배열; 서버 공유 안 됨 |
| `sessionStorage` | `hangul-invited` | 현재 탭에서 초대 링크 확인 여부 |

브라우저 사이트 데이터를 삭제하거나 Firebase Console에서 익명 사용자를 삭제하면 새 UID가
발급될 수 있다. 이 경우 같은 사람도 과거 상품의 소유자나 과거 예약자로 인정되지 않는다.
행사 종료 전에는 참여자의 익명 계정을 정리하지 않는다.

현재 프로필 수정 UI와 로그아웃/기기 이전 기능은 없다. 저장된 프로필을 바꾸려면 개발자
도구에서 `hangul-profile`을 삭제하거나 별도 UI를 구현해야 한다.

## 6. Realtime Database 데이터 모델

예시는 실제 형태를 설명하기 위한 것으로 key와 시간 값은 매번 달라진다.

```json
{
  "hangulMarket": {
    "profiles": {
      "<anonymous-uid>": {
        "nickname": "마켓친구",
        "contact": "카카오톡 market-friend"
      }
    },
    "products": {
      "<push-key>": {
        "name": "머그컵",
        "price": 5000,
        "priceType": "price",
        "quantity": 2,
        "description": "사용감이 조금 있어요.",
        "thumb": "data:image/jpeg;base64,...",
        "photoCount": 2,
        "owner": "<seller-anonymous-uid>",
        "sellerName": "마켓친구",
        "sellerContact": "카카오톡 market-friend",
        "createdAt": 1700000000000,
        "updatedAt": 1700000000000,
        "sold": false,
        "slots": {
          "0": "<buyer-anonymous-uid>",
          "1": true
        },
        "reservations": {
          "<buyer-anonymous-uid>": {
            "nickname": "구매친구",
            "contact": "010-0000-0000",
            "at": 1700000001000,
            "slot": "0"
          }
        }
      }
    },
    "photos": {
      "<push-key>": ["data:image/jpeg;base64,...", "data:image/jpeg;base64,..."]
    }
  }
}
```

- `priceType`은 `price` 또는 `free`이며 무료나눔일 때 `price`는 `0`이다.
- `quantity` 범위는 UI에서 1~99로 제한한다.
- `slots`는 수량만큼의 예약 칸이다. 빈 칸은 `true`, 찬 칸은 예약자 UID다. 상품 등록 시
  판매자가 만들고, 수정 시 판매자 트랜잭션이 찬 칸을 유지한 채 수량에 맞게 늘이거나 줄인다.
  예약된 수보다 적게 줄일 수는 없다.
- 예약은 `slots/<n>`과 `reservations/<uid>`(`slot: "<n>"`)를 한 번의 다중 경로 `update()`로
  함께 쓰고, 취소는 칸을 `true`로 되돌리며 예약을 지운다. 둘 중 한쪽만 쓰면 규칙이 거부한다.
- 한 UID는 같은 상품을 한 번만 예약할 수 있다.
- 예약 개수는 `Object.keys(reservations).length`로 계산한다.
- `sold=true`이면 수량과 무관하게 판매완료로 표시한다.
- 사진은 Storage가 아니라 JPEG data URL로 Realtime Database에 직접 저장한다. 목록에는 상품의
  `thumb`(긴 변 360px)만 내려가고, 원본(긴 변 800px, 최대 5장)은 `hangulMarket/photos/<id>`에
  따로 두어 상세·수정 화면을 열 때만 `get()`으로 받는다. 상품과 원본 사진은 등록·삭제 시
  `hangulMarket` 기준 다중 경로 `update()`로 함께 쓰고 지운다.
- 모든 필드는 규칙의 `.validate`로 타입·길이·범위를 검사하고, 정의되지 않은 필드는 거부한다
  (상품명 40자, 설명 1000자, 닉네임 12자, 연락처 30자, 수량 1~99 정수, 사진 5장·장당 40만 자,
  썸네일 6만 자, 무료나눔이면 가격 0).

## 7. 화면 및 주요 코드 흐름

`market/index.html`은 압축된 스타일과 스크립트를 포함한다. 함수별 책임은 다음과 같다.

| 함수/영역 | 책임 |
|---|---|
| `boot()` | 초대 확인, Firebase 초기화, 익명 로그인, 프로필 화면 또는 앱 진입 |
| `enter()` | 프로필 저장, `products` 실시간 구독 시작 |
| `render()` | 최신순 목록, 판매자 필터, 찜 필터와 카드 렌더링 |
| `status()` | `sold`, 수량, 예약 수를 이용해 판매 상태 계산 |
| `openDetail()` | 상세 화면, 연락처, 사진, 예약/판매자 버튼 렌더링 |
| `toggleReserve()` | 빈 예약 칸을 차례로 시도하는 선착순 예약, 또는 칸을 되돌리는 예약 취소 |
| `openEditor()` | 신규 등록/기존 상품 수정 폼 초기화 |
| `handlePhotos()` / `compress()` / `thumbnail()` | 최대 5장 선택, 원본 긴 변 800px·JPEG 0.72(상한 초과 시 품질을 낮춤), 썸네일 360px |
| `fetchPhotos()` / `loadPhotos()` | 원본 사진을 상품 `updatedAt` 기준으로 캐시하며 필요할 때만 받음 |
| 폼 `onsubmit` | 신규 등록(`slots` 생성) 또는 판매자 트랜잭션으로 수정(`resizeSlots()`) |
| `share()` | Web Share API 사용, 미지원 시 Clipboard API로 URL 복사 |

상품 목록은 `hangulMarket/products`에 `onValue`를 걸어 전체 스냅샷을 다시 렌더링한다.
열려 있는 상세 화면도 같은 스냅샷으로 다시 그려 예약 상태가 실시간 반영된다.
20명 규모를 전제로 한 구현이며 페이지네이션이나 서버 검색은 없다.

## 8. 보안 규칙 의도

`firebase-rules.json`은 한글마켓 전용 파일이 아니다. `rooms`, `banks`, `obbyScores`,
`obbySaves`, `tripPlans`, `obbyLive` 등 다른 앱 규칙도 포함하므로 **항상 파일 전체를
게시**해야 한다.

한글마켓 규칙의 의도는 다음과 같다.

- 인증된 익명 사용자만 `/hangulMarket` 읽기 가능
- 프로필은 자기 UID 아래에만 쓰기 가능
- 상품 생성 시 `owner`가 현재 UID여야 함
- 생성 이후 상품 수정/삭제는 원래 소유자만 가능
- 예약은 예약자 자신의 UID 노드만 생성/삭제 가능

### 예약 선착순 설계 (2026-10 수정)

처음 구현은 `reservations` 부모 경로에서 `runTransaction()`을 실행했는데, 규칙은
`reservations/<uid>` 자식에만 구매자 쓰기를 허용해 구매자 예약이 항상
`PERMISSION_DENIED`였다(Emulator에서 재현). 부모 경로에 쓰기를 열면 남의 예약을 덮어쓰거나
수량을 넘길 수 있으므로, 서버 함수 없이 규칙만으로 선착순을 강제하는 **예약 칸** 방식으로
바꿨다.

- 구매자는 `slots/<n>`이 `true`일 때만 자기 UID로 바꿀 수 있고, 같은 쓰기에서
  `reservations/<uid>/slot`이 `<n>`이어야 한다. 같은 칸을 동시에 노리면 한 명만 통과한다.
- 칸은 판매자만 만들 수 있으므로 칸 수가 곧 수량 상한이다.
- `reservations/<uid>`는 새로 만들기와 삭제만 가능해 한 사람이 두 칸을 가질 수 없다.
- 판매완료(`sold == true`) 상품은 예약할 수 없다.
- 취소는 본인 칸을 `true`로 되돌리는 동시에 본인 예약을 지울 때만 허용된다.
- 판매자는 상품 전체 쓰기 권한이 있으므로 남의 예약도 지울 수 있다(판매자 재량으로 둠).

검증: `market/tests/`의 규칙 테스트 17건(아래 §12)과 판매자 1명·구매자 2명 브라우저로 수행한
Emulator 통합 시나리오 18건(동시 예약 포함)이 통과했다. 이 변경 이전에 만든 상품에는
`slots`·`thumb`가 없어 예약하거나 수정할 수 없으므로, 운영 데이터베이스에 시험 상품이 있다면 삭제 후 다시
등록한다.

## 9. 추가로 알려진 제약과 기술 부채

1. **사진 저장 방식:** 여전히 base64로 Realtime Database에 저장한다. 목록은 썸네일만 받으므로
   20명·상품 100개 규모에서는 무료 한도 안이라고 보지만, 실제 사진 수가 훨씬 많아지면 Firebase
   Storage로 옮긴다.
2. **규칙 검증:** 필드 검증은 있으나 판매자는 자기 상품의 `slots`를 수량보다 많이 만들 수 있다
   (규칙으로 자식 수를 셀 수 없음). 판매자 본인 상품에만 영향이 있어 허용한다.
3. **개인정보 노출:** 로그인한 모든 초대 참여자가 모든 판매자의 연락처와 예약자의 연락처를
   읽을 수 있다. 목적상 필요하지만 사용자에게 명확히 고지하고 행사 후 데이터를 삭제한다.
4. **초대 보안:** 토큰이 소스에 하드코딩되어 공개 저장소에서 확인 가능하다.
5. **오류 피드백:** 일부 Firebase 실패는 일반 토스트만 보여주고, 프로필 `set()` 실패는
   무시한다. 운영 진단을 위해 오류 코드별 메시지가 필요하다.
6. **접근성:** 이미지 대체 텍스트, 키보드 포커스, 모달 포커스 고정, 색상 대비를 별도로
   감사하지 않았다.
7. **사진 UX:** 상세 사진 전환은 작은 점을 누르는 방식이며 스와이프는 지원하지 않는다.
8. **상태 모델:** “예약중”은 예약 수가 총 수량에 도달했을 때만 표시된다. 일부 수량만
   예약된 상품은 “판매중”이다.
9. **프로필 변경:** UI가 없고 상품에 판매자 이름/연락처를 복사 저장하므로 프로필만 바꿔도
   기존 상품 정보는 자동 갱신되지 않는다.
10. **테스트:** Emulator 규칙 테스트(`market/tests/`)는 있으나 저장소에 포함된 자동 브라우저
    테스트와 CI는 없다.

## 10. Firebase Console 준비 및 배포

상세 클릭 경로와 붙여넣을 전체 규칙은 루트의 `FIREBASE.md`를 따른다. 핵심 순서는 다음과
같다.

1. Firebase Console에서 프로젝트 ID `unimai-game-hub`를 확인한다.
2. Authentication → 로그인 방법에서 Anonymous를 활성화한다.
3. Authentication → 설정 → 승인된 도메인에 실제 호스트만 추가한다.
   `https://`, 포트, 경로, 쿼리는 넣지 않는다.
4. Realtime Database → 규칙에서 기존 규칙을 백업한다.
5. `firebase-rules.json`의 첫 `{`부터 마지막 `}`까지 전체를 붙여넣고 게시한다.
6. 정적 호스팅에 저장소를 배포한다. Firebase Console 설정만으로 HTML이 배포되지는 않는다.
7. 완전한 초대 URL을 두 기기에서 시험한다.

이 저장소에는 현재 `firebase.json`, `.firebaserc`, GitHub Actions 배포 워크플로가 없다.
즉, 호스팅 배포 방식은 저장소만 보고 확정할 수 없다. 기존 운영자가 GitHub Pages 설정을
사용하는지 먼저 확인한 후 배포 자동화를 추가한다.

## 11. 로컬 실행

저장소 루트에서 다음처럼 정적 서버를 실행한다.

```bash
python3 -m http.server 8765
```

그 후 아래 주소를 연다.

```text
http://127.0.0.1:8765/market/?invite=hangul-market
```

Firebase 프로젝트가 `localhost`/`127.0.0.1` 요청을 허용하지 않거나 실제 규칙이 게시되지
않았다면 UI는 열려도 데이터 작업은 실패할 수 있다. 운영 데이터를 오염시키지 않으려면
가능한 한 Firebase Emulator 또는 별도 테스트 프로젝트를 사용한다.

## 12. 최소 검증 체크리스트

### 정적 검사

```bash
python3 -m json.tool firebase-rules.json >/dev/null
git diff --check
```

`market/index.html`의 module script를 임시 `.mjs` 파일로 추출해 `node --check`로 문법을
검사할 수도 있다. CDN import는 Node에서 실행하지 말고 문법 검사만 한다.

### 보안 규칙 테스트 (Firebase Emulator)

Java 11 이상과 Node.js 18 이상이 필요하다. 운영 프로젝트에는 접속하지 않는다.

```bash
cd market/tests
npm install
npm test
```

### 실제 브라우저/Firebase 통합 검사

아래 검사는 판매자용 일반 창 A와 구매자용 시크릿 창 B처럼 서로 다른 익명 UID로 수행한다.

1. 초대 쿼리 없이 접근하면 차단 화면이 보인다.
2. 올바른 초대 링크에서 닉네임과 연락처를 저장하고 목록에 진입한다.
3. A에서 사진 1장/5장, 정가/무료나눔, 수량 1/복수 상품을 등록한다.
4. B에서 상품과 판매자 연락처가 실시간으로 보인다.
5. B에서 예약하고 A에서 상태와 남은 수량이 갱신된다.
6. 같은 상품의 마지막 재고를 두 구매자가 동시에 예약했을 때 한 명만 성공한다.
7. B가 자기 예약을 취소할 수 있지만 다른 UID 예약은 삭제하지 못한다.
8. B는 A의 상품을 수정/삭제/판매완료 처리하지 못한다.
9. A는 상품 수정, 판매완료 전환, 삭제를 할 수 있다.
10. 상품 공유 링크를 새 탭에서 열면 해당 상세 화면이 열린다.
11. 새로고침 후 프로필, 익명 소유권, 찜 목록이 유지된다.
12. 모바일 너비에서 폼, 상세 하단 버튼, 사진과 키보드가 겹치지 않는다.

테스트 후 실제 앱과 Firebase Console Data 탭에서 시험 상품과 시험 프로필을 정리한다.

## 13. 권장 다음 작업 순서

1. ~~예약 트랜잭션/보안 규칙 조합 수정~~ — 완료(§8).
2. ~~`hangulMarket` 필드 스키마·길이·수량 검증~~ — 완료.
3. ~~두 익명 UID를 이용한 Emulator 규칙 테스트 추가~~ — 완료(`market/tests/`).
4. 사진은 썸네일/원본 분리까지 완료. Storage 이전은 실제 사진 수를 보고 결정한다.
5. 프로필 수정, 오류 코드 표시, 접근성을 개선한다.
6. 선택한 호스팅 환경에 배포 설정과 간단한 브라우저 스모크 테스트를 추가한다.

## 14. 작업 시 지켜야 할 사항

- `firebase-rules.json`을 변경할 때 다른 앱의 규칙을 삭제하지 않는다.
- `FIREBASE.md` 안의 전체 규칙 복사본도 반드시 같은 내용으로 갱신한다.
- UI에서 막는 것만으로 권한이 보호된다고 간주하지 않는다.
- Firebase의 실제 운영 데이터를 삭제하거나 규칙을 게시하기 전에 기존 상태를 백업한다.
- 사용자의 연락처가 포함되므로 로그, 스크린샷, 테스트 픽스처에 실데이터를 남기지 않는다.
- 기능 변경 후 모바일 브라우저에서 직접 확인하고, 눈에 보이는 변경이면 스크린샷을 남긴다.

## 15. 현재 Git 상태를 해석하는 방법

이 문서는 특정 커밋 해시에 의존하지 않도록 작성했다. 작업 시작 시 반드시 아래 명령으로
현재 브랜치와 최신 변경을 확인한다.

```bash
git status --short --branch
git log --oneline -5
git diff
```

이 문서와 코드가 다르면 코드를 사실의 원천으로 삼되, 차이를 확인한 뒤 이 문서도 함께
갱신한다.
