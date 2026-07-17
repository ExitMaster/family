# research: 단일 HTML·무빌드에서 MusicXML 렌더링 + 조옮김 + 계이름 오버레이

> GitHub issue [#5](https://github.com/ExitMaster/family/issues/5) (parent map [#4](https://github.com/ExitMaster/family/issues/4)) 해소 노트.
> 목표 제약: **빌드 도구 없음**, 단일 HTML 파일(라이브러리 인라인 또는 CDN `<script>` 1개), **`file://`로 직접 열기**, 폰→TV 미러링. 사용자 = 만 6·9세.

## 결론 (TL;DR)

**OpenSheetMusicDisplay (OSMD)를 권장한다.** 순수 JS(WASM 없음) UMD 번들 하나(`opensheetmusicdisplay.min.js`, 약 1MB)를 `<script>`로 인라인/CDN하면 `file://`에서 그대로 동작한다. `.mxl`(zip) 압축 해제를 내장(JSZip)하고, `TransposeCalculator` + `Sheet.Transpose`로 반음 단위 조옮김(트럼펫 Bb = 장2도 = +2 반음)을 기본 제공하며, 라이선스는 **MIT**로 가정용에 문제없다. 계이름 오버레이는 (a) 렌더된 SVG 위에 절대좌표 텍스트를 얹거나, (b) MusicXML `<lyric>`로 계이름을 주입하는 두 경로가 모두 열려 있다.

Verovio는 조판 품질이 가장 좋지만 **WASM 파일을 별도 fetch** 하는 구조라 `file://`에서 막히는 것이 결정적 탈락 사유다. abcjs는 가볍지만 **MusicXML을 직접 못 읽어** 손실 있는 XML→ABC 변환 단계가 필요해 "심장"(MusicXML 가져오기)에 부적합하다.

## 비교표

| 라이브러리 | 무빌드·단일 `<script>`·`file://` | 크기(대략) | 조옮김 | 계이름(per-note) 오버레이 | `.mxl`(zip) | 라이선스 |
|---|---|---|---|---|---|---|
| **OpenSheetMusicDisplay (OSMD)** | ✅ 순수 JS UMD 1개, WASM 없음 → `file://` OK (파일은 `<input type=file>`+`FileReader`로 문자열 로드) | ~1MB (min.js) | ✅ 내장 `TransposeCalculator` + `Sheet.Transpose`(반음), 악기별 `Instruments[i].Transpose` | ✅ 중~하: `PositionAndShape` bbox → 픽셀 좌표 변환, 또는 `<lyric>` 주입 | ✅ 내장(JSZip 번들) | **MIT** |
| **Verovio (WASM toolkit)** | ⚠️ `verovio-toolkit-wasm.js`가 별도 `.wasm`를 **fetch** → `file://`에서 CORS/fetch 차단, 로컬 웹서버 필요 | 무거움(수 MB, wasm 포함) | ✅ 최상: `setOptions({transpose:"-2"})`, `-t"P4"` 등 인터벌/반음 | ✅ 상: SVG가 MEI 구조 보존, `@id`로 note element 직접 조회 | ✅ 내장 | **LGPLv3** |
| **abcjs (+ xml2abc-js)** | ✅ abcjs는 순수 JS지만, **MusicXML→ABC 변환 단계**가 추가로 필요 | abcjs ~0.5MB + xml2abc | ✅ ABC 변환 후 `visualTranspose` 옵션 | ⚠️ ABC 가사/주석으로 가능하나 파이프라인 복잡 | ❌ 직접 불가(변환 필요) | MIT(abcjs) |

## 각 라이브러리 상세

### OpenSheetMusicDisplay (OSMD) — 권장
- **무빌드/`file://`**: TypeScript로 작성되었지만 배포물은 **UMD 번들 하나**(`build/opensheetmusicdisplay.min.js`, 공식 문서 기준 약 1MB). WASM/워커 없이 VexFlow로 SVG를 그린다. `file://`에서 URL fetch는 CORS로 막히지만, `load()`는 **MusicXML 문자열 또는 `Document` 객체**를 직접 받으므로 `<input type="file">` + `FileReader`로 읽어 넘기면 서버 없이 완전 동작한다. 완전 오프라인을 원하면 min.js 내용을 `<script>`에 인라인하면 CDN도 불필요.
- **크기**: min.js ~1MB (공식 Getting Started 문서가 "about 1MB" 명시).
- **조옮김**: 내장. `osmd.TransposeCalculator = new opensheetmusicdisplay.TransposeCalculator(); osmd.Sheet.Transpose = 2; osmd.updateGraphic(); osmd.render();` (양수=위, 음수=아래 반음). 악기 단위는 `osmd.Sheet.Instruments[0].Transpose = 2`. 트럼펫 Bb(장2도 위 표기) = **+2**. 알려진 소소한 버그: 재조옮김 시 F#/B 등 특정 키에서 이슈 → 재로드 후 초기 렌더 전에 설정하는 워크어라운드 권장.
- **계이름 오버레이**: 두 경로.
  - (a) **좌표 오버레이**: 각 `GraphicalNote.PositionAndShape` 바운딩박스(OSMD 단위, 1단위=오선 반칸)를 픽셀로 변환(스태프 라인 간격 = 10px × `osmd.zoom`)해 SVG `<text>` 또는 절대배치 `<div>`를 note 위/아래에 배치. `note.Pitch`(원음)/`note.TransposedPitch`(조옮김 후)로 계이름 계산.
  - (b) **가사 주입**: OSMD는 MusicXML `<lyric>`을 오선 아래 텍스트로 렌더하므로, 로드 전 각 음표에 계이름(도·레·미…)을 `<lyric>`으로 삽입하면 별도 좌표계산 없이 on/off 가능. 가정용 개인 편곡 성격상 가장 견고.
- **`.mxl`**: JSZip을 번들하여 압축 MusicXML을 내부에서 자동 해제.
- **라이선스**: **MIT** (BSD 계열 오해 주의 — 공식은 MIT). 가정 비공개 사용에 무제한.
- **아이 가독성**: VexFlow 기반 표준 오선, `zoom`·기본 폰트 크기 조절 용이 → TV 미러링에 적합.

### Verovio (WASM toolkit)
- **조판 품질/기능은 최상**(전문 음악학 도구, MEI 기반). `setOptions({transpose:"-2"})` 또는 `-t "P4"` 같은 **인터벌 문자열** 조옮김 지원 → Bb 트럼펫을 정확한 인터벌로 지정 가능. SVG가 MEI 트리를 보존해 각 note에 `@id`가 붙어 **계이름 오버레이가 매우 쉽다**(`document.getElementById` / 속성 조회).
- **탈락 사유**: 최신 배포물은 `MODULARIZE=1` 팩토리(`createVerovioModule`)로 **별도 `.wasm` 파일을 fetch**한다. 브라우저는 WASM/`fetch`에 대해 HTTPS 또는 `localhost`+올바른 MIME을 요구하므로 `file://`에서 직접 열면 실패한다(로컬 웹서버 필요). 이는 이 리포의 핵심 제약(폰에서 `file://` 더블클릭)과 정면 충돌. wasm까지 인라인/base64 임베드하는 커스텀 빌드는 "무빌드" 원칙과도 어긋남. 크기도 수 MB로 큼.
- **라이선스**: LGPLv3 (동적 링크·비배포라 가정용은 무방하나, 위 `file://` 문제로 후보에서 제외).

### abcjs (+ MusicXML→ABC 변환)
- abcjs 자체는 순수 JS(MIT, ~0.5MB)로 `file://` OK이고 `visualTranspose`로 조옮김도 된다. 그러나 **MusicXML을 직접 읽지 못한다.** `xml2abc-js`(Wim Vree) 같은 변환기를 앞단에 붙여야 하는데, ABC 2.1 표준을 벗어나는 MusicXML 요소(일부 위치정보·스태프 걸친 이음줄 등)는 변환에서 **손실**된다. 파이프라인이 2단계(변환→렌더)로 늘고 화음·다성부 충실도가 떨어져, "MusicXML 가져오기가 심장"인 이 앱의 요구와 맞지 않는다.

## 권장 구현 스케치 (OSMD)

자작 모티프 예시(저작권 무관): **C–D–E–C** 4분음표.

```html
<!DOCTYPE html>
<div id="score"></div>
<input type="file" id="f" accept=".xml,.musicxml,.mxl">
<script src="opensheetmusicdisplay.min.js"></script> <!-- 인라인하면 완전 오프라인 -->
<script>
const osmd = new opensheetmusicdisplay.OpenSheetMusicDisplay("score", { drawTitle:true });

document.getElementById("f").addEventListener("change", async e => {
  const file = e.target.files[0];
  // .mxl(zip)이면 ArrayBuffer, 아니면 텍스트 — OSMD가 둘 다 처리
  const data = file.name.endsWith(".mxl")
    ? await file.arrayBuffer()      // OSMD 내장 JSZip이 해제
    : await file.text();
  await osmd.load(data);

  // 조옮김: 트럼펫 Bb = 장2도 위 표기 = +2 반음
  osmd.TransposeCalculator = new opensheetmusicdisplay.TransposeCalculator();
  osmd.Sheet.Transpose = 2;
  osmd.updateGraphic();
  osmd.render();

  overlaySolfege(osmd);           // 계이름 on/off 시 호출
});

// 계이름 오버레이(좌표 방식 개요)
const NAMES = ["도","도#","레","레#","미","파","파#","솔","솔#","라","라#","시"];
function overlaySolfege(osmd) {
  const svg = document.querySelector("#score svg");
  const unit = 10 * osmd.zoom;     // 오선 반칸 = 10px * zoom
  for (const m of osmd.GraphicSheet.MeasureList)
    for (const staff of m)
      for (const se of staff.staffEntries)
        for (const gn of se.graphicalVoiceEntries.flatMap(v => v.notes)) {
          const p = gn.sourceNote.TransposedPitch || gn.sourceNote.Pitch;
          if (!p) continue;                       // 쉼표 스킵
          const bb = gn.PositionAndShape.AbsolutePosition;
          const t = document.createElementNS("http://www.w3.org/2000/svg","text");
          t.setAttribute("x", bb.x * unit);
          t.setAttribute("y", bb.y * unit + 40);  // 음표 아래
          t.setAttribute("font-size", 12);
          t.setAttribute("text-anchor","middle");
          t.textContent = NAMES[p.getHalfTone ? p.getHalfTone()%12 : p.fundamentalNote]; // 계이름 매핑
          svg.appendChild(t);
        }
}
</script>
```

- 좌표 방식이 번거로우면 **대안**: 로드 전 MusicXML 각 `<note>`에 `<lyric><text>도</text></lyric>`를 넣어 OSMD 기본 가사 렌더로 표기(별도 좌표 계산 불필요, on/off = 가사 포함/제외 두 문자열 로드).
- **계이름 규칙 결정 필요**(map #4로 위임): 고정도(written pitch 기준) vs 이동도(조성 기준). 아이 교육용은 보통 고정도. 이 값은 위 매핑 테이블만 바꾸면 됨.

## 미해결/후속(map #4로 환류)

- 계이름 표기 규칙: 고정도 vs 이동도, 반음(#/♭) 표기 방식.
- MusicXML 지원 범위(화음·다성부·못갖춘마디·가사) — OSMD는 대부분 지원하나 리코더 좁은 음역 자동조정·단순화는 앱 로직에서 별도 구현.
- min.js 인라인(완전 오프라인) vs CDN 1개 — 폰 `file://` 신뢰성 위해 인라인 권장.

## 출처

- OpenSheetMusicDisplay — GitHub / 공식 사이트: <https://github.com/opensheetmusicdisplay/opensheetmusicdisplay>, <https://opensheetmusicdisplay.org/>
- OSMD Getting Started(번들·1MB·load(문자열/URL)): <https://github.com/opensheetmusicdisplay/opensheetmusicdisplay/wiki/Getting-Started>
- OSMD Transposing(`TransposeCalculator`·`Sheet.Transpose`·악기별): <https://github.com/opensheetmusicdisplay/opensheetmusicdisplay/wiki/Transposing>
- OSMD 좌표→픽셀(스태프 간격 10px, PositionAndShape): <https://github.com/opensheetmusicdisplay/opensheetmusicdisplay/issues/504>, <https://opensheetmusicdisplay.github.io/classdoc/classes/GraphicalNote.html>
- OSMD 조옮김 플러그인/라이선스(MIT): <https://opensheetmusicdisplay.org/blog/music-xml-transposition-plugin/>
- Verovio — GitHub / 리퍼런스북(포맷·LGPL): <https://github.com/rism-digital/verovio>, <https://book.verovio.org/toolkit-reference/toolkit-options.html>
- Verovio 조옮김(transpose 옵션/인터벌): <https://book.verovio.org/advanced-topics/transposition.html>
- Verovio JS/WASM 로딩(별도 wasm·팩토리): <https://book.verovio.org/installing-or-building-from-sources/javascript-and-webassembly.html>
- abcjs 소프트웨어·xml2abc-js(변환 한계): <https://abcnotation.com/software>, <https://wim.vree.org/js/xml2abc-js_index.html>
