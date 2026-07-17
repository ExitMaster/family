#!/usr/bin/env node
// sheet.html의 단순화 엔진(순수 함수) 단위 테스트.
//
// 엔진은 DOM 파서(DOMParser/XMLSerializer)를 쓰므로 순수 Node에서 못 돌린다.
// .claude/skills/verify 와 동일하게 사전 설치된 헤드리스 Chromium을 빌려 쓴다:
// sheet.html에서 ===ENGINE:START/END=== 사이 코드만 뽑아 빈 페이지에 주입하고,
// 브라우저 안에서 assertion을 실행한다. 빌드/새 의존성 없음.
//
// 실행: node scripts/test-engine.mjs

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import playwright from '/opt/node22/lib/node_modules/playwright/index.js';
const { chromium } = playwright;

const __dirname = dirname(fileURLToPath(import.meta.url));
const SHEET_HTML = join(__dirname, '..', 'sheet.html');

function extractEngineCode() {
  const html = readFileSync(SHEET_HTML, 'utf8');
  const start = html.indexOf('// ===ENGINE:START===');
  const end = html.indexOf('// ===ENGINE:END===');
  if (start === -1 || end === -1 || end <= start) {
    throw new Error('sheet.html에서 ENGINE 마커를 찾지 못했습니다.');
  }
  return html.slice(start, end);
}

// He's A Pirate류 픽스처: 라단조(fifths=-1, minor), A4 음표 하나
function fixtureDMinor() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<score-partwise version="3.1">
  <part id="P1">
    <measure number="1">
      <attributes>
        <divisions>4</divisions>
        <key><fifths>-1</fifths><mode>minor</mode></key>
        <time><beats>6</beats><beat-type>8</beat-type></time>
      </attributes>
      <note>
        <pitch><step>A</step><octave>4</octave></pitch>
        <duration>2</duration>
        <voice>1</voice>
        <type>eighth</type>
      </note>
    </measure>
  </part>
</score-partwise>`;
}

// 다장조(fifths=0, major), C4 / B4 음표 — 옥타브 캐리 확인용
function fixtureCMajor() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<score-partwise version="3.1">
  <part id="P1">
    <measure number="1">
      <attributes>
        <divisions>4</divisions>
        <key><fifths>0</fifths><mode>major</mode></key>
        <time><beats>4</beats><beat-type>4</beat-type></time>
      </attributes>
      <note>
        <pitch><step>C</step><octave>4</octave></pitch>
        <duration>4</duration>
        <voice>1</voice>
        <type>quarter</type>
      </note>
      <note>
        <pitch><step>B</step><octave>4</octave></pitch>
        <duration>4</duration>
        <voice>1</voice>
        <type>quarter</type>
      </note>
    </measure>
  </part>
</score-partwise>`;
}

function fixtureBroken() {
  return `<score-partwise><part id="P1"><measure number="1">`; // 태그 안 닫힘
}

async function main() {
  const engineCode = extractEngineCode();
  const browser = await chromium.launch({
    executablePath: '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell',
  });
  const page = await browser.newPage();
  await page.setContent('<!DOCTYPE html><html><body></body></html>');
  await page.addScriptTag({ content: engineCode });

  // 순수 계산 함수는 evaluate 안에서 직접 값을 비교하고 결과만 돌려받는다.
  const out = await page.evaluate(({ dMinor, cMajor, broken }) => {
    const E = window.SheetEngine;
    const r = [];
    const eq = (name, actual, expected) => {
      const pass = JSON.stringify(actual) === JSON.stringify(expected);
      r.push({ name, pass, actual, expected });
    };
    const throws = (name, fn) => {
      try {
        fn();
        r.push({ name, pass: false, actual: '(예외 없음)', expected: 'throw' });
      } catch (e) {
        r.push({ name, pass: true, actual: e.message, expected: 'throw' });
      }
    };

    // 1. 이명동조 정리 (부록 B)
    eq('normalizeFifths(-7) === 5', E.normalizeFifths(-7), 5);
    eq('normalizeFifths(7) === -5', E.normalizeFifths(7), -5);
    eq('normalizeFifths(3) === 3 (그대로)', E.normalizeFifths(3), 3);

    // 2. 한국어 조성 라벨 — 플랫 조성은 내림 표기 (올림가장조 아님)
    eq("keyLabel(-1,'minor') === '라단조'", E.keyLabel(-1, 'minor'), '라단조');
    eq("keyLabel(0,'major') === '다장조'", E.keyLabel(0, 'major'), '다장조');
    eq("keyLabel(-2,'major') === '내림나장조'", E.keyLabel(-2, 'major'), '내림나장조');
    eq("keyLabel(-3,'major') === '내림마장조'", E.keyLabel(-3, 'major'), '내림마장조');
    eq("keyLabel(2,'major') === '라장조'", E.keyLabel(2, 'major'), '라장조');
    eq("keyLabel(6,'major') === '올림바장조'", E.keyLabel(6, 'major'), '올림바장조');

    // 3. 반음->fifths 변화량
    eq('semitonesToFifthsDelta(2) === 2 (트럼펫)', E.semitonesToFifthsDelta(2), 2);
    eq('semitonesToFifthsDelta(0) === 0 (리코더/피아노)', E.semitonesToFifthsDelta(0), 0);

    // 4. 조성 감지
    eq('detectKey(dMinor)', E.detectKey(dMinor), { fifths: -1, mode: 'minor' });

    // 5. toKey 이조: He's A Pirate 케이스 — Dm(-1) → Am(0), -5반음 (부록 B)
    {
      const out1 = E.transposeMusicXml(dMinor, { transposeMode: 'toKey', targetKey: 'C' });
      const key1 = E.detectKey(out1);
      eq('toKey C: 결과 fifths === 0', key1.fifths, 0);
      eq('toKey C: mode는 minor 유지', key1.mode, 'minor');
      const doc = new DOMParser().parseFromString(out1, 'application/xml');
      const p = doc.querySelector('pitch');
      const step = p.querySelector('step').textContent;
      const octave = p.querySelector('octave').textContent;
      // A4 - 5반음 = E4
      eq('toKey C: A4 -> E4 (도약 없이 -5반음)', `${step}${octave}`, 'E4');
    }

    // 6. instrument 이조: 트럼펫 (+2반음, fifths도 +2)
    {
      const out2 = E.transposeMusicXml(cMajor, { transposeMode: 'instrument', instrument: 'trumpet' });
      const key2 = E.detectKey(out2);
      eq('trumpet: 결과 fifths === 2', key2.fifths, 2);
      const doc = new DOMParser().parseFromString(out2, 'application/xml');
      const pitches = doc.querySelectorAll('pitch');
      const first = pitches[0];
      const last = pitches[1];
      eq('trumpet: C4 -> D4', `${first.querySelector('step').textContent}${first.querySelector('octave').textContent}`, 'D4');
      // B4 + 2반음 = C#5 (옥타브 캐리 확인: 4옥타브 B에서 반음 2개 올리면 5옥타브로 넘어간다)
      const alterEl = last.querySelector('alter');
      eq('trumpet: B4 -> C#5 (step)', last.querySelector('step').textContent, 'C');
      eq('trumpet: B4 -> C#5 (alter)', alterEl ? alterEl.textContent : null, '1');
      eq('trumpet: B4 -> C#5 (옥타브 캐리)', last.querySelector('octave').textContent, '5');
    }

    // 7. instrument 이조: 리코더 (0반음, 무변화)
    {
      const out3 = E.transposeMusicXml(cMajor, { transposeMode: 'instrument', instrument: 'recorder' });
      const key3 = E.detectKey(out3);
      eq('recorder: 결과 fifths === 0 (무변화)', key3.fifths, 0);
    }

    // 7.5. 동률(±6반음) 이조는 아래쪽을 택한다: C장조 → F#장조, C4는 F#4가 아니라 F#3
    {
      const out = E.transposeMusicXml(cMajor, { transposeMode: 'toKey', targetKey: 'F#' });
      const doc = new DOMParser().parseFromString(out, 'application/xml');
      const p = doc.querySelector('pitch');
      const alterEl = p.querySelector('alter');
      eq('동률 이조: C4 -> F#3 (step)', p.querySelector('step').textContent, 'F');
      eq('동률 이조: C4 -> F#3 (alter)', alterEl ? alterEl.textContent : null, '1');
      eq('동률 이조: C4 -> F#3 (아래 옥타브)', p.querySelector('octave').textContent, '3');
    }

    // 8. mode:'none'은 원본 그대로 반환 (문자열 동일)
    eq("transposeMusicXml(mode:'none') === 원본", E.transposeMusicXml(cMajor, { transposeMode: 'none' }), cMajor);

    // 9. 에러 처리: 알 수 없는 악기/모드/조성은 조용히 넘어가지 않고 throw
    throws('알 수 없는 악기 -> throw', () => E.transposeMusicXml(cMajor, { transposeMode: 'instrument', instrument: 'tuba' }));
    throws('알 수 없는 목표 조성 -> throw', () => E.transposeMusicXml(cMajor, { transposeMode: 'toKey', targetKey: 'Zb' }));
    throws('깨진 XML -> throw', () => E.detectKey(broken));
    throws('깨진 <fifths> 값 -> throw (NaN 전파 금지)', () =>
      E.detectKey(cMajor.replace('<fifths>0</fifths>', '<fifths>abc</fifths>')));

    return r;
  }, { dMinor: fixtureDMinor(), cMajor: fixtureCMajor(), broken: fixtureBroken() });

  await browser.close();

  let failCount = 0;
  for (const r of out) {
    const mark = r.pass ? '✓' : '✗';
    console.log(`${mark} ${r.name}`);
    if (!r.pass) {
      failCount++;
      console.log(`    expected: ${JSON.stringify(r.expected)}`);
      console.log(`    actual:   ${JSON.stringify(r.actual)}`);
    }
  }
  console.log(`\n${out.length - failCount}/${out.length} passed`);
  if (failCount > 0) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
