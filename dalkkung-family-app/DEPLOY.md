# 꿍스 배포 안내

- Firebase project: `salmon-logs`
- Hosting site/target: `kkoongs`
- Production URL: https://kkoongs.web.app
- 배포 대상: **Hosting + Firestore Rules** (둘 다)

배포 경로는 두 가지이고, 둘 다 같은 대상을 배포한다.

| 경로 | 명령 | 언제 |
| --- | --- | --- |
| 자동 (권장) | `family` 브랜치에 push | 평소 |
| 수동 (fallback) | `npm run deploy` | Actions 가 막혔을 때 |

---

## 자동 배포

`.github/workflows/kkoongs-deploy.yml` 이 `family` 브랜치 push 때 돌아가고,
`dalkkung-family-app/**` 이 바뀐 경우에만 배포한다. 수동 실행은 Actions 탭의
**Run workflow**(`workflow_dispatch`).

워크플로가 실행하는 명령은 `npm run deploy` 와 같다.

```
firebase deploy --only firestore:rules,hosting:kkoongs --project salmon-logs
```

즉 `firestore.rules` 를 고쳐서 push 하면 규칙도 함께 production 에 반영된다.

### 준비 상태

자동 배포는 GitHub Secret `FIREBASE_SERVICE_ACCOUNT_SALMON_LOGS` 하나만 있으면 된다.
이 Secret 이 없으면 워크플로 첫 단계가 안내 메시지와 함께 즉시 멈춘다.

아래 1~3단계는 GitHub/Google Cloud 콘솔에서 사람이 직접 해야 한다.

---

## 1단계 — 서비스 계정 만들기

Google Cloud Console → `salmon-logs` 프로젝트 → **IAM 및 관리자 → 서비스 계정 → 서비스 계정 만들기**

- 이름: `github-action-kkoongs`
- 계정 ID: `github-action-kkoongs`
- 전체 주소는 `github-action-kkoongs@salmon-logs.iam.gserviceaccount.com` 가 된다

> `firebase init hosting:github` 은 이 단계에서 401 로 실패했다. 반복하지 말고
> 콘솔에서 직접 만든다.

## 2단계 — 권한 주기

같은 화면의 **IAM** 에서 위 서비스 계정에 아래 역할을 모두 부여한다.
Hosting 만으로는 Firestore Rules 를 못 올리기 때문에 네 개가 다 필요하다.

| 역할 | ID | 용도 |
| --- | --- | --- |
| Firebase Hosting 관리자 | `roles/firebasehosting.admin` | Hosting 배포 |
| Firebase 규칙 관리자 | `roles/firebaserules.admin` | Firestore Rules 배포 |
| Firebase 뷰어 | `roles/firebase.viewer` | 프로젝트/사이트 조회 |
| 서비스 사용량 소비자 | `roles/serviceusage.serviceUsageConsumer` | API 호출 |

## 3단계 — 키를 GitHub Secret 으로 넣기

1. 서비스 계정 → **키 → 키 추가 → 새 키 만들기 → JSON** → 파일 다운로드
2. GitHub `ExitMaster/family` → **Settings → Secrets and variables → Actions → New repository secret**
   - Name: `FIREBASE_SERVICE_ACCOUNT_SALMON_LOGS`
   - Secret: 내려받은 JSON 파일의 **전체 내용을 그대로** 붙여넣기 (`{` 부터 `}` 까지)
3. 내려받은 JSON 파일은 로컬에서 삭제한다. **저장소에 commit 하지 않는다.**

## 4단계 — 확인

Actions 탭 → **Deploy Kkoongs to Firebase** → **Run workflow** 로 한 번 돌린다.

- 첫 단계 로그에 `service account: github-action-kkoongs@salmon-logs.iam.gserviceaccount.com` 가 찍히면 Secret 은 정상
- 마지막 단계에서 `hosting:kkoongs` 와 `firestore` 가 모두 성공하면 완료
- https://kkoongs.web.app 접속 확인

---

## 수동 배포 (fallback)

Cloud Shell 등에서:

```bash
cd dalkkung-family-app
npm run deploy
```

---

## 저장소에 절대 넣지 않는 것

- Firebase service account private key (JSON)
- Firebase Admin private key
- Google Drive 의료파일 비밀번호
- 기존 스프레드시트 금융 비밀번호
- 실제 데이터가 든 `private/seed-data.json`

`app.js` 안의 Firebase Web App config(apiKey 등)는 공개되는 클라이언트 설정이라
비밀이 아니다. 접근 통제는 Firestore Rules 와 `access/allowlist` 가 담당한다.
