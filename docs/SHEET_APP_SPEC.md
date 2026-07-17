# 악보 앱 기획서 (SPEC v1.0)

> **한 줄 요약**: 악보 이미지를 MusicXML로 변환해, 아이별 수준에 맞춰 자동 단순화·정규화하여 표시하는 개인용 악보 앱.

---

## 0. 프로젝트 컨텍스트

### 0.1 배경

두 아이가 집에서 악기를 연습한다. 여러 출처에서 구한 악보 캡처 이미지를 보는데, 악보마다 형식·난이도·조성·계이름 표기가 제각각이라 아이가 혼란스러워한다. 특히 6세는 원곡 편곡 악보를 그대로 연주하지 못한다.

부모가 매번 아이 수준에 맞는 악보를 찾아주는 것은 시간이 많이 든다.

### 0.2 목표

**하나의 악보 원본에서 아이별 수준에 맞는 악보를 자동 생성한다.**

이것이 앱의 존재 이유다. 수집·저장·뷰어는 부속 기능이다.

### 0.3 사용자

| | A | B |
|---|---|---|
| 나이 | 6세 | 10세 |
| 악기 | 피아노(키보드) | 리코더, 트럼펫 |
| 수준 | 초급. C장조, 단순 리듬만 | 중급 |
| 계이름 | 필요 (도레미) | 불필요 |

부모(관리자)가 악보를 등록·교정하고, 아이는 등록된 악보를 골라 연주한다.

### 0.4 제약 및 비목표

**제약**
- **AI API 호출 0회.** 모든 처리는 로컬/온디바이스.
- 안드로이드 태블릿 1대 전용. 멀티 디바이스 동기화 불필요.
- 곡 수: 수십 곡 규모. 성능 최적화 불필요.

**비목표 (하지 않는 것)**
- 스토어 배포, 수익화, 다중 사용자, 계정 시스템
- 오디오 채보 (음원 → 악보)
- 유튜브 링크 입력
- 반주 자동 생성 / 코드 자동 인식
- 저작권 처리 (사적 이용 범위)

---

## 1. 아키텍처

```
[수집]  악보 이미지 업로드
   ↓
[변환]  OMR (oemer) → MusicXML          ※ 앱 외부 배치 실행 허용
   ↓                    └→ 실패 시 → 손 입력
[교정]  에디터  (부모, 목표 5분/곡)
   ↓
[저장]  원본 MusicXML → IndexedDB
   ↓
[단순화 엔진] ★ 핵심 — 프로필별 변환
   ↓
[렌더링] OSMD → SVG
   ↓
[연주]  보조 기능
```

### 1.1 핵심 설계 원칙

**원본 MusicXML은 절대 파괴하지 않는다.**

프로필별 출력은 **렌더링 시점에 변환**한다. 변환 결과를 저장하지 않는다.

```
원본 MusicXML (1개)
   ├─→ [변환: 6세 프로필] → 렌더 → C장조 + 왼손 근음 + 계이름
   └─→ [변환: 10세 프로필] → 렌더 → 원조 유지 + 계이름 없음
```

이유: 프로필 설정을 바꾸면 즉시 반영되어야 하고, 저장본이 여러 개면 원본 교정 시 동기화 문제가 생긴다.

### 1.2 기술 스택

| 레이어 | 선택 | 비고 |
|---|---|---|
| 플랫폼 | PWA | 네이티브 불필요. 태블릿 홈화면 추가 |
| 렌더링 | **OpenSheetMusicDisplay (OSMD)** | MusicXML → SVG |
| 오디오 | **Tone.js** | MIDI 재생, 메트로놈 |
| 음악 데이터 | **MusicXML** (표준) | 파싱: OSMD 내장 or `musicxml-interfaces` |
| 저장 | **IndexedDB** (`idb` 래퍼 권장) | 로컬 우선 |
| 백업 | Google Drive 폴더 export/import | 수동. 자동 동기화 불필요 |
| OMR | **oemer** (Python, 오픈소스) | **v1에서는 앱 외부** — 아래 참조 |
| 프레임워크 | React + Vite | 자유 |

**OMR 결정 (중요)**

v1에서 OMR을 앱에 내장하지 마라. 부모가 PC에서 `oemer input.png -o output.musicxml`을 돌려 MusicXML을 만들고, 앱에는 **MusicXML 파일을 업로드**한다.

이유:
- 브라우저에서 oemer(TF 기반) 구동은 무겁고 불확실하다
- 하루 5곡 규모라 수동 실행 비용이 무시할 만하다
- v1의 스코프를 절반으로 줄인다

앱 내장은 v2 이후 검토. **v1의 입력은 `.musicxml` / `.mxl` 파일이다.**

---

## 2. 데이터 모델

### 2.1 Score (곡)

```ts
interface Score {
  id: string;              // uuid
  title: string;
  composer?: string;
  arranger?: string;
  sourceImage?: Blob;      // 원본 악보 이미지 (참고용, 선택)
  musicXml: string;        // 원본 MusicXML — 단일 진실 원천
  refAudioUrl?: string;    // 유튜브 링크 등 참고 음원
  tags: string[];          // ['피아노', '리코더', 'OST']
  createdAt: number;
  updatedAt: number;
}
```

### 2.2 Profile (아이)

```ts
interface Profile {
  id: string;
  name: string;            // '첫째', '둘째'
  color: string;           // UI 구분용

  // ── 단순화 엔진 설정 ──
  transposeMode: 'none' | 'toKey' | 'instrument';
  targetKey?: string;                 // 'C' — transposeMode='toKey'일 때
  instrument: 'piano' | 'recorder' | 'trumpet';

  leftHand: 'original' | 'rootOnly' | 'hidden';
  noteNames: 'none' | 'solfege' | 'letter';   // 도레미 | CDE
  fingering: boolean;
  octaveFold: boolean;                // 음역 밖 음표를 옥타브 이동
  tempoScale: number;                 // 1.0 = 원본, 0.6 = 60%

  // ── 레이아웃 ──
  staffScale: number;                 // 1.0 ~ 2.5
  measuresPerLine: number;            // 2 | 3 | 4
}
```

**초기값**

```ts
// 6세
{ name: '첫째', transposeMode: 'toKey', targetKey: 'C',
  instrument: 'piano', leftHand: 'rootOnly', noteNames: 'solfege',
  fingering: true, octaveFold: true, tempoScale: 0.7,
  staffScale: 2.0, measuresPerLine: 2 }

// 10세
{ name: '둘째', transposeMode: 'instrument',
  instrument: 'recorder', leftHand: 'hidden', noteNames: 'none',
  fingering: false, octaveFold: true, tempoScale: 1.0,
  staffScale: 1.3, measuresPerLine: 4 }
```

### 2.3 PracticeLog (연습 기록)

```ts
interface PracticeLog {
  id: string;
  scoreId: string;
  profileId: string;
  date: string;            // 'YYYY-MM-DD'
  count: number;           // 그 날 연주 횟수
}
```

### 2.4 Annotation (메모 레이어)

```ts
interface Annotation {
  id: string;
  scoreId: string;
  profileId: string;
  strokes: Stroke[];       // 손가락 낙서. SVG path 또는 좌표 배열
}
```

메모는 **프로필별로 분리**한다. 6세 악보와 10세 악보는 레이아웃이 다르므로 좌표를 공유할 수 없다.

### 2.5 PracticeQueue (오늘의 연습)

```ts
interface PracticeQueue {
  profileId: string;
  date: string;
  scoreIds: string[];      // 순서 있음
}
```

---

## 3. 단순화 엔진 (★ 핵심 모듈)

`src/engine/` — 이 앱의 심장. **순수 함수로 구현하고 단위 테스트를 붙일 것.**

```ts
function transform(musicXml: string, profile: Profile): string
```

입력 MusicXML + 프로필 → 변환된 MusicXML. 부수효과 없음.

### 3.1 변환 파이프라인 (순서 중요)

```
원본 MusicXML
  ↓ 1. parse
  ↓ 2. transpose        (이조)
  ↓ 3. leftHandReduce   (왼손 축약)
  ↓ 4. octaveFold       (음역 클램프)
  ↓ 5. tempoScale       (템포)
  ↓ 6. annotate         (계이름 / 운지)
  ↓ 7. layout           (오선 크기, 한 줄 마디 수)
  ↓ 8. serialize
변환된 MusicXML
```

**순서가 중요한 이유:**
- 이조(2) 전에 계이름(6)을 붙이면 계이름이 틀린다
- 왼손 축약(3) 전에 옥타브 접기(4)를 하면 화음 구조가 깨진다
- 옥타브 접기(4)는 이조(2) 후에 해야 실제 음역을 안다

### 3.2 각 변환의 명세

#### 2. transpose (이조)

```ts
transpose(doc, mode, targetKey?, instrument)
```

- `mode='none'`: 통과
- `mode='toKey'`: 원곡 조성을 감지해 `targetKey`까지의 반음 차를 계산, 전체 음표 이동. 조표(`<key>`) 갱신.
  - 조성 감지: MusicXML `<key><fifths>` 값을 사용 (신뢰). 없으면 첫 마디 음표로 추정.
  - **단조/장조 판별 필요**: `<mode>` 태그 확인. 없으면 마지막 음으로 추정.
  - 예: He's A Pirate = Dm(♭2, fifths=-1) → Am(fifths=0) 은 +2 반음? **아니다.** Dm→Am은 -5 또는 +7 반음. 상대조 매핑 테이블을 쓸 것.
- `mode='instrument'`: 악기 이조
  - piano: 0
  - recorder (소프라노 C관): 0
  - **trumpet (Bb관): 기보음 = 실음 + 장2도(+2 반음)**

**주의**: 이조 후 조표가 ♯/♭ 5개를 넘으면 이명동조(enharmonic)로 정리할 것. (예: fifths=-7 → +5)

#### 3. leftHandReduce (왼손 축약)

MusicXML의 `<staff>2</staff>` 파트를 대상으로 한다.

- `'original'`: 통과
- `'rootOnly'`: 각 `<chord>` 그룹에서 **최저음만 남기고 나머지 삭제**
  - 구현: `<note>` 중 `<chord/>` 자식을 가진 것들이 앞 음표와 같은 화음. 그 그룹의 pitch를 비교해 최저음 선택
  - 나머지 `<note>`는 제거 (duration 유지, 화음이므로 시간축 영향 없음)
- `'hidden'`: staff 2 전체 제거. 대보표 → 단선보로 변경 (`<staves>1</staves>`)
  - **리코더/트럼펫 프로필에서 필수.** 이 악기들은 화음을 못 낸다.

#### 4. octaveFold (음역 클램프)

악기별 음역:

| 악기 | 음역 (실음) | MIDI |
|---|---|---|
| piano (6세) | C3 ~ C6 | 48 ~ 84 |
| recorder (소프라노) | C5 ~ D7 | 72 ~ 98 |
| trumpet | F#3 ~ C6 | 54 ~ 84 |

음역 밖 음표는 **옥타브 단위로 이동**해 범위 안에 넣는다. 반음 이동은 금지(멜로디가 깨짐).

```ts
while (midi < min) midi += 12;
while (midi > max) midi -= 12;
```

**경고 필수**: 옥타브 이동이 발생한 마디를 반환해 UI에 표시. 멜로디 윤곽이 바뀌므로 부모가 확인해야 한다.

#### 5. tempoScale

`<sound tempo="200"/>` 및 `<metronome>` 값에 `tempoScale`을 곱한다. 표기만 바꾼다. **음표는 건드리지 않는다.**

#### 6. annotate (계이름 / 운지)

- `noteNames='solfege'`: 각 음표에 `<lyric>` 추가, 텍스트 = 도레미
  - **이조 후의 실제 음이름 기준.** C=도 고정도법 (fixed do). 한국 초등 관행.
  - ♯/♭: '도#' 또는 '#도' — 6세용이므로 가급적 C장조 이조로 반음을 없애는 게 낫다
- `noteNames='letter'`: C, D, E...
- `fingering=true`: `<notations><technical><fingering>` 추가
  - **piano**: 규칙 기반 근사. 오른손 기준, 5음 이내 순차진행이면 1-2-3-4-5. 도약 시 리셋. **완벽할 수 없다 — 에디터에서 수동 수정 가능해야 함**
  - **recorder**: 지공 그림. MusicXML 표준에 없음 → 렌더링 레이어에서 SVG 오버레이로 처리
  - **trumpet**: 밸브 번호(0, 1, 2, 12, 13, 23, 123). 음이름 → 밸브 룩업 테이블. 정확히 결정 가능

#### 7. layout

- `staffScale`: OSMD의 `zoom` 옵션 또는 `EngravingRules.StaffHeight`
- `measuresPerLine`: OSMD `EngravingRules.RenderXMeasuresPerLineAkaSystem`
- 여백 최소화: `EngravingRules.PageLeftMargin` 등을 축소

### 3.3 자동화 불가 영역 (명시)

**리듬 단순화는 자동화하지 않는다.**

16분음표 뭉치를 4분음표로 줄이는 것은 편곡 판단이다. 알고리즘으로 "어떤 음을 남길지" 결정할 수 없다.

→ **에디터에서 사람이 처리한다.** (§4 참조)

이것이 이 앱의 알려진 한계다. 자동 단순화는 "연주 가능"까지 못 가고 "덜 어려움"까지만 간다.

---

## 4. 에디터

**단순화 엔진 다음으로 중요한 모듈.** 안전장치이자 유일한 편곡 수단.

### 4.1 대상

**원본 MusicXML을 편집한다.** 변환 결과가 아니다.

이유: 변환은 프로필별로 매번 다시 일어난다. 교정은 원본에 해야 모든 프로필에 반영된다.

### 4.2 필수 기능

| 기능 | 우선순위 | 비고 |
|---|---|---|
| 음표 선택 | P0 | 클릭/탭 |
| 음정 변경 | P0 | 위/아래 화살표, 드래그 |
| 음길이 변경 | P0 | 4분/8분/16분/점음표 |
| **음표 삭제** | **P0** | 리듬 단순화의 핵심 |
| **음표 병합** | **P0** | 16분×4 → 4분 하나. 선택 후 '병합' |
| 음표 추가 | P0 | 손 입력 경로 |
| 쉼표 삽입 | P1 | |
| 마디 삭제 | P1 | 반복 구간 잘라내기 |
| 조표/박자표 수정 | P1 | OMR이 자주 틀리는 지점 |
| 운지 수동 수정 | P2 | 자동 운지 보정 |
| Undo/Redo | **P0** | 필수 |

**목표: 곡당 교정 5분 이내.** 이 숫자를 못 맞추면 손 입력이 빠르다.

### 4.3 백지 입력 경로

OMR 실패 시 또는 OMR 없이 직접 입력.

- 화면 피아노 건반 탭 → 음표 입력
- 또는 계이름 타이핑 (`도 레 미 미 |` 형식)
- 박자 먼저 선택 후 순차 입력

**동요 한 곡(32마디, 음표 60개) 기준 10분 이내가 목표.**

### 4.4 구현 참고

OSMD는 렌더링 전용이라 편집 기능이 없다. 선택지:

1. **OSMD + 커스텀 오버레이** — SVG 위에 클릭 핸들러, 편집은 MusicXML DOM 직접 조작 후 재렌더. 느리지만 단순. **권장.**
2. VexFlow 직접 사용 — 유연하나 구현량 큼
3. 외부 에디터 위임 — MuseScore로 열기. 앱 밖으로 나감

v1은 1번. 재렌더가 200ms 안에 끝나면 체감상 문제없다.

---

## 5. 렌더링

### 5.1 OSMD 설정

```ts
const osmd = new OpenSheetMusicDisplay(container, {
  autoResize: true,
  drawTitle: true,
  drawComposer: false,        // 6세에겐 노이즈
  drawLyricist: false,
  drawPartNames: false,
  drawMeasureNumbers: true,
  followCursor: true,
});
osmd.EngravingRules.RenderXMeasuresPerLineAkaSystem = profile.measuresPerLine;
osmd.zoom = profile.staffScale;
```

### 5.2 리코더 운지 오버레이

MusicXML 표준에 리코더 지공 표기가 없다. 렌더 후 SVG에 직접 그린다.

- 음표 좌표: `osmd.GraphicSheet.MeasureList` 순회로 획득
- 각 음표 아래에 지공 그림(작은 원 8개, 채움/비움) SVG 삽입
- 룩업 테이블: 음이름 → 지공 패턴

### 5.3 프로필 전환

프로필을 바꾸면 `transform()` 재실행 → OSMD `load()` → `render()`.

수십 마디 규모면 1초 이내. 로딩 인디케이터만 있으면 충분.

---

## 6. 연주 보조 기능

| 기능 | 구현 | 비고 |
|---|---|---|
| MIDI 재생 | Tone.js + OSMD 커서 연동 | SoundFont 1개로 3악기 커버 |
| 템포 조절 | 재생 속도 슬라이더 | 프로필 `tempoScale`과 별개, 즉석 조절 |
| 구간 반복 | 마디 A~B 지정 후 루프 | |
| 재생 커서 | `osmd.cursor` | **6세에게 특히 유효** |
| 메트로놈 | Tone.js | 박자표 인식해 강박 구분 |
| 화면 켜짐 유지 | **Wake Lock API** | 연주 화면 진입 시 |
| 페이지 넘김 | 화면 좌우 1/4 영역 큰 탭 | 손에 악기 들고 있음 |
| 메모 레이어 | Canvas 오버레이 | 프로필별 저장 |
| 연습 기록 | 재생 완료 시 카운트 | 날짜별 스탬프 |

### 6.1 연주 화면 UI 원칙

- **전체화면.** 상단바/하단바 자동 숨김
- 여백 최소화 — 악보를 최대한 크게
- 컨트롤은 탭 한 번으로 나타나고 3초 후 사라짐
- 6세 대상: 글자 최소화, 아이콘 중심

---

## 7. 서랍 기능

### 7.1 화면 구조

```
[프로필 선택]  첫째 | 둘째
      ↓
[홈]
  ├─ 오늘의 연습 (큐)  ← 기본 진입점
  ├─ 전체 곡 목록      ← 태그 필터
  └─ 설정
      ↓
[연주 화면]
```

### 7.2 오늘의 연습 큐

**부모가 미리 채운다. 아이는 순서대로 넘기기만 한다.**

6세용 검색 UI를 만드는 것보다 훨씬 단순하고 실제로 잘 굴러간다.

- 부모 모드에서 곡 3~5개를 드래그로 큐에 추가
- 아이는 큐 화면에서 큰 썸네일 탭 → 연주
- 완료 시 체크 표시 + 연습 기록 자동 적립

### 7.3 곡 목록

- 썸네일 그리드 (첫 페이지 렌더 이미지)
- 태그 필터: 악기, 장르
- 즐겨찾기 상단 고정
- 검색: 제목 (10세용)

### 7.4 참고 음원

곡마다 유튜브 링크 첨부. 연주 화면에서 "들어보기" 버튼 → 외부 브라우저 열기.

**"이 곡 어떻게 소리나?"가 아이의 가장 잦은 질문이다.**

---

## 8. 개발 로드맵

### Phase 0 — 검증 (착수 전, 반나절)

**개발 시작 전에 반드시 할 것.**

1. He's A Pirate 악보를 MuseScore로 열어 MusicXML export
2. 수동으로: C장조 이조 + 왼손 근음만 + 계이름 부착
3. 6세에게 쳐보게 함

**판단:**
- 칠 수 있으면 → 단순화 엔진이 답. Phase 1 착수
- 못 치면 → 16분음표가 벽. 에디터(§4)에 무게중심 이동. Phase 순서 조정

이 결과 없이 개발 착수하지 말 것.

### Phase 1 — 렌더러 + 프로필 (1주)

- MusicXML 파일 업로드 → IndexedDB 저장
- OSMD 렌더링
- 프로필 CRUD
- **단순화 엔진: transpose + noteNames + layout만**

여기서 6세에게 다시 보여준다. 반응이 스펙을 확정한다.

### Phase 2 — 단순화 엔진 완성 (1주)

- leftHandReduce
- octaveFold + 경고
- fingering (piano, trumpet)
- recorder 지공 오버레이
- tempoScale

**단위 테스트 필수.** 엔진은 순수 함수이므로 테스트하기 쉽다.

### Phase 3 — 에디터 (2주)

- 음표 선택/수정/삭제/병합/추가
- Undo/Redo
- 백지 입력
- 조표/박자표 수정

**가장 오래 걸리는 부분.** 여기서 시간을 아끼지 마라.

### Phase 4 — 연주 보조 (1주)

- Tone.js 재생 + 커서
- 메트로놈, 구간 반복
- Wake Lock, 페이지 넘김
- 메모 레이어

### Phase 5 — 서랍 (3일)

- 오늘의 연습 큐
- 곡 목록, 태그, 즐겨찾기
- 연습 기록
- Drive export/import

### v2 이후 (보류)

- OMR 앱 내장 (oemer WASM)
- 오디오 채보
- 악기 추가 (칼림바 등 — 다이어토닉 근사 필요)

---

## 9. 알려진 리스크

| 리스크 | 영향 | 대응 |
|---|---|---|
| **리듬 단순화 자동화 불가** | 6세가 여전히 못 침 | 에디터에서 수동. Phase 0에서 검증 |
| 자동 운지가 부정확 | 잘못된 습관 | 수동 수정 경로 필수 |
| 옥타브 접기가 멜로디 왜곡 | 곡이 이상해짐 | 경고 표시, 부모 확인 |
| OMR 정확도 (v2) | 교정 시간 폭증 | v1에서 앱 외부로 분리해 리스크 격리 |
| 단조 이조 오류 | 조가 틀림 | 상대조 매핑 테이블, 단위 테스트 |
| OSMD 편집 미지원 | 에디터 구현 난이도 | 오버레이 방식. 재렌더 성능 확인 |

---

## 10. 예시 케이스

### 케이스 A: Golden (케이팝 데몬 헌터스 OST)

원본 특성: 12/8박자, 다장조, 계이름 이미 있음, 왼손 단음, 초보용 채보

- **6세 출력**: 이조 불필요, 왼손 이미 단음, 계이름 있음 → **거의 그대로**. 오선 크기와 한 줄 마디 수만 조정
- **한계**: 12/8박자는 자동으로 못 바꾼다. 부점 리듬은 그대로

### 케이스 B: He's A Pirate

원본 특성: **6/8, 라단조(♭2), ♩=200, 왼손 화음+옥타브, 16분음표 다수, 중급 편곡**

- **6세 출력**:
  - 이조: Dm → Am (fifths -1 → 0)
  - 왼손: 화음 → 근음만
  - 계이름: 부착
  - 템포: 200 → 140
  - 결과: **상당히 쉬워지지만 16분음표는 남는다**
- **10세 트럼펫 출력**:
  - 이조: +2반음 (Bb 악기)
  - 왼손: hidden (단선보)
  - 음역 체크: 트럼펫 F#3~C6
- **에디터 개입 필요**: 16분음표 뭉치 → 8분/4분으로 병합

**이 두 케이스를 단위 테스트 픽스처로 쓸 것.**

---

## 11. Claude Code 작업 지침

### 11.1 시작 순서

1. `src/engine/` 부터 만든다. 순수 함수 + 테스트.
2. 렌더러는 그 다음. 엔진 출력을 눈으로 확인하는 도구다.
3. 에디터는 마지막. 가장 크다.

### 11.2 코딩 원칙

- **엔진은 부수효과 없는 순수 함수.** `(musicXml, profile) => musicXml`
- 원본 MusicXML은 절대 변형하지 않는다. 항상 복사본에 작업
- 각 변환 함수는 독립적으로 테스트 가능해야 한다
- MusicXML 조작은 정규식 금지. **DOM 파서 사용** (`DOMParser` / `XMLSerializer`)
- 변환 실패 시 조용히 넘어가지 말고 명시적으로 throw. 부모가 알아야 한다

### 11.3 하지 말 것

- AI API 호출 (프로젝트 제약)
- localStorage (IndexedDB 사용)
- 서버 구축 (전부 클라이언트)
- 다중 사용자/계정 설계
- 성능 최적화 (곡 수가 적다)
- 반응형 디자인 과잉 (태블릿 1대 전용, 가로 모드 고정)

### 11.4 첫 커밋 목표

```
MusicXML 파일 업로드 → OSMD 렌더링 → 프로필 선택 시 이조 적용
```

이것만 되면 Phase 0 검증을 앱 안에서 할 수 있다.

---

## 부록 A: MusicXML 구조 참고

```xml
<score-partwise>
  <part id="P1">
    <measure number="1">
      <attributes>
        <divisions>4</divisions>          <!-- 4분음표당 division -->
        <key><fifths>-1</fifths><mode>minor</mode></key>
        <time><beats>6</beats><beat-type>8</beat-type></time>
        <staves>2</staves>                <!-- 대보표 -->
        <clef number="1"><sign>G</sign><line>2</line></clef>
        <clef number="2"><sign>F</sign><line>4</line></clef>
      </attributes>
      <sound tempo="200"/>
      <note>
        <pitch><step>A</step><octave>4</octave></pitch>
        <duration>2</duration>
        <voice>1</voice>
        <type>eighth</type>
        <staff>1</staff>                  <!-- 오른손 -->
        <lyric><text>라</text></lyric>    <!-- 계이름 삽입 위치 -->
        <notations>
          <technical><fingering>3</fingering></technical>
        </notations>
      </note>
      <note>
        <chord/>                          <!-- 앞 음표와 동시 = 화음 -->
        <pitch><step>C</step><octave>5</octave></pitch>
        ...
      </note>
    </measure>
  </part>
</score-partwise>
```

**핵심 포인트**
- `<chord/>` 태그가 있으면 앞 음표와 같은 화음 → `leftHandReduce`의 판별 기준
- `<staff>2</staff>` = 왼손
- `<alter>` 태그가 임시표 (1=♯, -1=♭)
- 이조 시 `<step>`, `<octave>`, `<alter>`, `<key><fifths>` 모두 갱신 필요

## 부록 B: 조성 매핑 테이블

| fifths | 장조 | 단조 |
|---|---|---|
| 0 | C | Am |
| 1 | G | Em |
| 2 | D | Bm |
| -1 | F | Dm |
| -2 | Bb | Gm |
| -3 | Eb | Cm |

**이조 반음 계산**: 원조 tonic → 목표 tonic의 최단 반음 거리. Dm → Am = +7 또는 -5. **-5를 택한다** (음역이 낮아져 6세에게 유리).

## 부록 C: 트럼펫 밸브 룩업 (일부)

| 음 (기보음) | 밸브 |
|---|---|
| C4 | 0 |
| D4 | 13 |
| E4 | 12 |
| F4 | 1 |
| G4 | 0 |
| A4 | 12 |
| B4 | 2 |
| C5 | 0 |

전체 테이블은 구현 시 확장.
