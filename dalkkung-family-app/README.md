# 딸꿍또꿍아꿍 가족 웹앱

기존 Excel/Google Sheet의 `출납장부`, `정산`, `요약`, `설정`, `간병일지`를 가족 최대 8명이 공동 사용하는 모바일 웹앱으로 재구성한 버전입니다.

## 구조

- **Firebase Authentication**: 이메일/비밀번호 + 이메일 인증
- **Cloud Firestore**: 장부, 정산, 간병, 항암, 건강상태 기록
- **Firestore Security Rules**: 승인된 가족 이메일 최대 8명만 접근
- **Firebase Hosting**: 정적 PWA 배포
- **Google Drive**: 의료 첨부파일 원본 보관
- 앱에는 의료파일 자체가 아니라 **Drive URL과 자료명만 저장**
- 의료파일 비밀번호 및 기존 금융 비밀번호는 앱/Firestore/GitHub에 저장하지 않음

로그인 사용자는 부모님 2명 + 형제 3명 + 배우자 3명까지 총 8명입니다. 금전 정산 단위는 기존대로 `하영`, `하림`, `경수` 3가정을 유지합니다.

## Firebase 설정

### 1. Authentication

Firebase Console → **Authentication → Sign-in method**에서 **Email/Password**를 활성화합니다.

이 앱은 allowlist에 등록된 이메일이라도 **Firebase 이메일 인증이 완료되지 않으면 Firestore 접근을 차단**합니다.

### 2. Cloud Firestore

Cloud Firestore Standard database를 만듭니다.

새로 만드는 경우 한국 가족용 앱이므로 **서울 `asia-northeast3`** 리전을 권장합니다. 이미 Firestore가 존재하면 기존 위치를 그대로 사용합니다.

Firestore Console에서 아래 문서를 수동으로 한 번 생성합니다.

```text
access/allowlist
```

필드:

```text
emails: ["관리자이메일@example.com"]   // array
admins: ["관리자이메일@example.com"]   // array
```

이메일은 소문자로 입력합니다. 처음에는 관리자 1명만 넣고, 이후 앱의 `설정 → 승인 이메일`에서 나머지 가족 이메일을 추가할 수 있습니다. 최대 8명입니다.

### 3. Firebase Hosting

Firebase Hosting으로 배포하면 앱은 `/__/firebase/init.json`에서 해당 Hosting 프로젝트의 Web config를 **자동으로 읽습니다**. 따라서 production 배포에는 `config.js`가 필요하지 않습니다.

로컬에서 `python3 -m http.server` 등으로 테스트할 때만 `config.example.js`를 `config.js`로 복사해 Firebase Web App config를 넣으세요.

### 4. 배포

Firebase CLI에서 프로젝트를 선택한 뒤:

```bash
firebase login
firebase use --add
firebase deploy --only firestore,hosting
```

`firestore.rules`는 다음을 모두 요구합니다.

1. Firebase 로그인
2. 이메일 인증 완료
3. `access/allowlist.emails`에 이메일 등록
4. 고정된 `families/dalkkung` 공간만 접근

관리자만 앱에서 allowlist를 수정할 수 있고 `admins` 자체는 클라이언트에서 변경할 수 없습니다.

## 기존 스프레드시트 데이터 이관

실제 의료·금융 데이터가 들어 있는 `private/seed-data.json`은 **public GitHub 저장소에 커밋하지 않습니다**.

첫 관리자로 로그인한 뒤:

```text
설정 → 기존 자료 이관 → JSON 이관
```

에서 로컬 `seed-data.json`을 선택합니다. 브라우저가 파일을 로컬에서 읽어 Firestore로 직접 기록합니다.

`password`, `passwd`, `passcode`, `PIN`, `비번`, `비밀번호` 같은 필드명이 발견되면 이관을 중단하도록 검사합니다.

## 의료 첨부파일

의료파일 원본은 Firebase Storage에 저장하지 않습니다.

간병 기록에는 아래만 저장합니다.

- 자료명
- Google Drive URL
- 파일 자체 비밀번호 보호 여부

`drive.google.com` 또는 `docs.google.com` 링크만 의료자료 링크로 허용합니다. 가능하면 Drive 공유권한도 가족 Google 계정으로 제한하고, 파일 비밀번호는 별도 채널로 관리하세요.

## 주요 화면

- **홈**: 잔액, 총수입, 총지출, 미정산, 치료 진행, 최근 간병기록
- **장부**: 공동계좌 수입/지출
- **정산**: 3가정 대납 및 분담 상태
- **간병**: 항암 1~12회, 진료/병문안 타임라인, 상태 기록, Drive 의료자료 링크
- **설정**: 가족 사용자, 8인 allowlist, 가정 연결, 기존자료 이관
