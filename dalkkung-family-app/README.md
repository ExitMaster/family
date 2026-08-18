# 딸꿍또꿍아꿍 가족 웹앱

기존 Excel/Google Sheet의 `출납장부`, `정산`, `요약`, `설정`, `간병일지`를 가족 8명이 공동으로 사용할 수 있는 모바일 중심 웹앱으로 재구성한 버전입니다.

## 설계 요점

- 사용자: 부모님 2명 + 형제 3명과 배우자 3명 = **최대 8명**
- 사용자와 금전 정산 단위를 분리: 로그인 사용자는 8명, 기존 정산 가정은 `하영`, `하림`, `경수` 3가정
- 모든 핵심 데이터는 Supabase DB에서 실시간 공동 사용
- 이메일/비밀번호 로그인 필수
- 초대 코드가 있어야 가족 공간 참여 가능, DB 함수에서 8명 제한
- 원본 스프레드시트의 **금융 비밀번호 값은 이관하지 않음**
- 의료정보 텍스트는 그대로 이관
- 의료 첨부파일은 Supabase의 private bucket에 저장하고 `password_protected=true`만 기록
- **첨부파일 비밀번호 자체는 앱/DB에 저장하지 않음**
- 기존 카테고리 이름 불일치는 내부 category ID 구조로 해소

## 1. Supabase 프로젝트 만들기

Supabase에서 새 프로젝트를 하나 만든 뒤 SQL Editor에서 `supabase/schema.sql` 전체를 실행합니다.

Auth 설정에서 Email/Password 인증을 사용합니다. 이메일 확인 여부는 가족 사용 방식에 맞게 선택할 수 있습니다.

## 2. 웹앱 연결

`config.example.js`를 `config.js`로 복사합니다.

```bash
cp config.example.js config.js
```

Supabase Project Settings > API에서 URL과 anon public key를 복사해 `config.js`에 넣습니다. anon key는 브라우저에 공개되는 키이므로 정상입니다. 실제 데이터 접근 통제는 `schema.sql`의 RLS가 담당합니다.

## 3. 첫 가족 공간 만들기

정적 서버로 폴더를 서비스합니다. 예:

```bash
python3 -m http.server 8080
```

브라우저에서 `http://localhost:8080`을 열어 첫 사용자가 가입/로그인 후 `새 공간`을 만듭니다. 생성 직후 표시되는 초대 코드를 다른 7명에게 전달합니다.

나머지 가족은 각자 계정으로 가입한 뒤 `초대 코드` 탭에서 같은 공간에 참여합니다.

## 4. 기존 스프레드시트 데이터 이관

첫 사용자가 가족 공간을 만든 뒤 다음 환경변수를 설정합니다.

```bash
export SUPABASE_URL='https://...supabase.co'
export SUPABASE_SERVICE_ROLE_KEY='...'
export SEED_OWNER_EMAIL='첫 사용자의 로그인 이메일'
node scripts/seed.mjs
```

`private/seed-data.json`에 이관 데이터가 들어 있습니다. **이 파일은 Git에 커밋하지 않으며** 프런트엔드 번들에서도 읽지 않습니다. 특히 현재 GitHub 저장소가 public이므로 실제 의료·금융 데이터는 로컬 또는 별도 암호화 저장소에서만 보관하세요. 이관이 끝난 뒤에는 삭제하거나 별도 암호화 보관하는 것을 권장합니다.

> 주의: service role key는 절대로 `config.js`나 웹서버 공개 폴더에 넣지 마세요.

## 5. 배포

이 앱은 정적 파일이므로 Vercel, Netlify, Cloudflare Pages, GitHub Pages 등에서 배포할 수 있습니다. `config.js`도 함께 배포합니다. Supabase anon key는 공개되어도 되지만 RLS를 비활성화하면 안 됩니다.

## 의료 첨부파일 보안

앱은 `family-files` private bucket을 사용합니다. 로그인 및 family membership을 통과한 사용자만 같은 가족 폴더의 파일을 접근할 수 있도록 Storage RLS가 설정됩니다.

사용자가 파일 자체에 별도 비밀번호를 설정하는 경우에도, **그 비밀번호는 이 앱에 입력하거나 저장하지 않는 구조**입니다. 앱에서는 해당 파일이 비밀번호 보호 파일이라는 표시만 저장합니다.

## 주요 화면

- 홈: 잔액, 총수입, 총지출, 미정산, 최근 간병기록
- 장부: 수입/지출 입력 및 목록
- 정산: 대납 가정, 3가정 분담액/상태
- 간병: 항암 1~12회, 전체 타임라인, 상태 기록, 의료 파일 업로드
- 설정: 참여 사용자 8명, 초대 코드, 3가정 송금 계좌, 보안 안내

## UI refresh (2026-08-18)

The mobile UI was redesigned around a warm family-care visual system rather than a spreadsheet-like layout.

- Warm ivory background with coral / teal / blue semantic accents
- Supportive family hero banner on Home
- Icon-based KPI cards and compact quick actions
- 12-cycle chemotherapy progress tracker
- Filterable ledger cards for income / expense
- Settlement summary and household-share status pills
- Caregiving timeline and health metric cards
- Fixed five-tab mobile bottom navigation

`preview.html` is a static, no-login UI preview. The production UI is rendered by `app.js` and retains the existing Supabase authentication, 8-member family limit, RLS, and protected medical-file flow.
