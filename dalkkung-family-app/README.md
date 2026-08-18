# 꿍스

가족 최대 8명이 공동으로 사용하는 모바일 웹앱입니다. 기존 스프레드시트의 장부·정산·간병·항암 기록을 웹앱 구조로 옮겼습니다.

## Backend

- **Firebase project:** `salmon-logs`
- **Firebase Authentication:** 이메일/비밀번호 + 이메일 인증
- **Cloud Firestore:** 장부, 정산, 간병, 항암, 건강상태 기록
- **Firebase Hosting site:** `kkoongs`
- **Production URL:** `https://kkoongs.web.app`
- **Google Drive:** 의료 첨부파일 원본 보관

의료파일은 Firebase에 업로드하지 않습니다. 앱에는 **Drive URL과 자료명만 저장**합니다. 의료파일 비밀번호와 기존 금융 비밀번호는 앱·Firestore·GitHub 어디에도 저장하지 않습니다.

## 최초 Firebase 설정

1. Firebase Console → Authentication → Sign-in method에서 **Email/Password** 활성화
2. Cloud Firestore 생성
3. Firestore에 문서 `access/allowlist` 생성
4. 필드 두 개를 Array로 생성:

```text
emails: ["관리자이메일@example.com"]
admins: ["관리자이메일@example.com"]
```

이메일은 소문자로 입력합니다. 최초 관리자 로그인 이후에는 앱의 **설정 → 승인 이메일**에서 나머지 가족 이메일을 최대 8명까지 관리할 수 있습니다.

> `salmon-logs`에서 이미 다른 앱이 Firestore를 사용하고 있다면 `firestore.rules`를 그대로 배포하지 마세요. Firebase Rules는 데이터베이스 전체 ruleset을 교체하므로 기존 규칙과 병합해야 합니다.

## 배포

프로젝트와 Hosting target은 `.firebaserc`에 다음과 같이 고정되어 있습니다.

- Firebase project: `salmon-logs`
- Hosting target/site: `kkoongs`

배포:

```bash
firebase deploy --only firestore:rules,hosting:kkoongs --project salmon-logs
```

또는:

```bash
npm run deploy
```

배포 URL:

```text
https://kkoongs.web.app
```

Firebase Hosting 배포본에서는 `/__/firebase/init.json`으로 Web App 설정을 자동으로 읽으므로 production용 `config.js`는 필요하지 않습니다.

로컬 테스트에서만 `config.example.js`를 `config.js`로 복사해 Firebase Web App config를 넣습니다.

## 접근 보안

Firestore Rules는 다음을 모두 요구합니다.

1. Firebase 로그인
2. 이메일 인증 완료
3. `access/allowlist.emails` 등록
4. 이 앱의 가족 데이터 공간만 접근

관리자만 앱에서 승인 이메일 목록을 수정할 수 있고 관리자 목록 자체는 클라이언트에서 변경할 수 없습니다.

## 기존 데이터 이관

실제 의료·금융 데이터가 들어 있는 `private/seed-data.json`은 public GitHub에 올리지 않습니다.

첫 관리자로 로그인한 뒤:

```text
설정 → 기존 자료 이관 → JSON 이관
```

에서 로컬 seed JSON을 선택합니다. 브라우저가 파일을 직접 읽어 Firestore로 기록합니다. 비밀번호 관련 필드가 발견되면 이관을 중단합니다.

## 의료 첨부

간병 기록에는 다음만 저장합니다.

- 자료명
- Google Drive URL
- 파일 자체 비밀번호 보호 여부

`drive.google.com` 또는 `docs.google.com` 링크만 허용합니다.

## 주요 화면

- **홈:** 잔액, 총수입, 총지출, 미정산, 치료 진행, 최근 간병기록
- **장부:** 공동계좌 수입/지출
- **정산:** 3가정 대납 및 분담 상태
- **간병:** 항암 1~12회, 진료/병문안 타임라인, 건강상태, Drive 의료자료 링크
- **설정:** 가족 사용자, 8인 allowlist, 가정 연결, 기존자료 이관
