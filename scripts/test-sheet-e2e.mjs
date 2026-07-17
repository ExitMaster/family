#!/usr/bin/env node
// sheet.html E2E 검증: 업로드 → OSMD 렌더 → 프로필 전환(이조) → 새로고침 복원.
// scripts/test-engine.mjs가 엔진 로직을 검증한다면, 이 스크립트는 UI 배선을 검증한다.
//
// 실행: node scripts/test-sheet-e2e.mjs

import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import playwright from '/opt/node22/lib/node_modules/playwright/index.js';
const { chromium } = playwright;

const __dirname = dirname(fileURLToPath(import.meta.url));
const SHEET_URL = 'file://' + join(__dirname, '..', 'sheet.html');
const FIXTURE = join(__dirname, 'fixtures', 'sample.musicxml');

let failCount = 0;
function check(name, pass, detail) {
  console.log(`${pass ? '✓' : '✗'} ${name}${pass || !detail ? '' : ` — ${detail}`}`);
  if (!pass) failCount++;
}

async function main() {
  const browser = await chromium.launch({
    executablePath: '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell',
  });
  const page = await browser.newPage({ viewport: { width: 1024, height: 768 } });

  const pageErrors = [];
  page.on('pageerror', (err) => pageErrors.push(err.message));

  await page.goto(SHEET_URL);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForTimeout(300);

  check('초기 상태: 플레이스홀더 표시', await page.isVisible('#placeholder'));

  await page.setInputFiles('#fileInput', FIXTURE);
  await page.waitForTimeout(800);

  const err1 = (await page.textContent('#errorBanner')).trim();
  const info1 = (await page.textContent('#infobar')).replace(/\s+/g, ' ').trim();
  check('업로드(첫째): 에러 없음', err1 === '', err1);
  check('업로드(첫째): 라단조 → 가단조 이조', info1.includes('라단조') && info1.includes('가단조'), info1);
  check('업로드(첫째): SVG 렌더됨', (await page.locator('#osmd-container svg').count()) >= 1);

  await page.click('button[data-id="second"]');
  await page.waitForTimeout(800);

  const err2 = (await page.textContent('#errorBanner')).trim();
  const info2 = (await page.textContent('#infobar')).replace(/\s+/g, ' ').trim();
  check('전환(둘째): 에러 없음', err2 === '', err2);
  check('전환(둘째): 리코더는 무이조(라단조 유지)', info2.includes('recorder') && info2.split('라단조').length === 3, info2);
  check('전환(둘째): SVG 렌더됨', (await page.locator('#osmd-container svg').count()) >= 1);

  await page.reload();
  await page.waitForTimeout(800);

  check('새로고침: 악보 복원', (await page.locator('#osmd-container svg').count()) >= 1);
  check('새로고침: 프로필 유지(둘째)', (await page.getAttribute('.profile-btn.active', 'data-id')) === 'second');

  const realErrors = pageErrors.filter((m) => !m.includes('ERR_CONNECTION_RESET'));
  check('페이지 JS 에러 없음', realErrors.length === 0, realErrors.join(' | '));

  await browser.close();

  console.log(`\n${failCount === 0 ? '모두 통과' : `${failCount}개 실패`}`);
  if (failCount > 0) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
