// v1.1 간병 기록 수정/삭제와 색상 구분을 헤드리스 Chromium 으로 검증한다.
//
//   node scripts/verify-care.mjs          (dalkkung-family-app 안에서)
//
// 실서버에 붙지 않는다. www.gstatic.com 의 Firebase SDK 요청을
// scripts/fake-firebase-module.js 로 가로채고 인메모리 Firestore 를 쓴다.
// 쓰기 권한은 firestore.rules 의 care_events/attachments 규칙을 옮겨 적은 것이다.

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('/opt/node22/lib/node_modules/playwright');

const HERE = path.dirname(fileURLToPath(import.meta.url));
const APP_DIR = path.resolve(HERE, '..');
const STUB = fs.readFileSync(path.join(HERE, 'fake-firebase-module.js'), 'utf8');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json', '.webmanifest': 'application/manifest+json' };

const results = [];
const ok = (name, cond, detail = '') => { results.push({ name, pass: !!cond }); console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${detail && !cond ? `\n        ${detail}` : ''}`); };

const ADMIN = { uid: 'uid-admin', email: 'admin@example.com', password: 'test1234', emailVerified: true, isAdmin: true };
const MEMBER = { uid: 'uid-member', email: 'member@example.com', password: 'test1234', emailVerified: true, isAdmin: false };

function seed() {
  const docs = {
    'access/allowlist': { emails: [ADMIN.email, MEMBER.email], admins: [ADMIN.email] },
    'families/dalkkung': { name: '꿍스' },
    'families/dalkkung/members/uid-admin': { email: ADMIN.email, display_name: '하영', role: 'admin', household_id: 'hayoung' },
    'families/dalkkung/members/uid-member': { email: MEMBER.email, display_name: '하림', role: 'member', household_id: 'harim' },
    'families/dalkkung/households/hayoung': { name: '하영', sort_order: 1 },
    'families/dalkkung/households/harim': { name: '하림', sort_order: 2 },
    'families/dalkkung/households/kyungsu': { name: '경수', sort_order: 3 },
    'families/dalkkung/categories/expense_health': { type: 'expense', name: '건강·의료', sort_order: 2 },
    'families/dalkkung/care_events/c-report': { event_date: '2026-08-10', event_type: '환자보고', place: '집', content: '오늘 컨디션 좋음', created_by: ADMIN.uid },
    'families/dalkkung/care_events/c-visit': { event_date: '2026-08-12', event_type: '병문안', place: '서울대병원', content: '함께 다녀옴', created_by: MEMBER.uid },
    'families/dalkkung/care_events/c-chemo': { event_date: '2026-08-14', event_type: '항암', place: '서울대병원', chemo_cycle: 3, created_by: MEMBER.uid },
    'families/dalkkung/attachments/a-visit': { care_event_id: 'c-visit', drive_url: 'https://drive.google.com/file/d/abc/view', label: '혈액검사결과지', password_protected: true, created_by: MEMBER.uid }
  };
  for (let i = 1; i <= 12; i++) docs[`families/dalkkung/chemo_cycles/${i}`] = { cycle_number: i, cycle_date: i <= 3 ? `2026-08-0${i}` : null };
  return docs;
}

const startServer = () => new Promise(resolve => {
  const server = http.createServer((req, res) => {
    const rel = decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/, '') || 'index.html';
    const file = path.join(APP_DIR, rel);
    if (!file.startsWith(APP_DIR) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end('not found'); }
    res.writeHead(200, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream', 'cache-control': 'no-store' });
    res.end(fs.readFileSync(file));
  });
  server.listen(0, '127.0.0.1', () => resolve({ server, base: `http://127.0.0.1:${server.address().port}` }));
});

// 주어진 Firestore 상태로 앱을 새로 띄운다. 새 context 라 새로고침과 같은 조건이다.
async function openApp(browser, base, docs) {
  const context = await browser.newContext({ viewport: { width: 420, height: 900 } });
  // 크로스 오리진 모듈이라 access-control-allow-origin 이 없으면 CORS 로 막힌다.
  await context.route('**/firebasejs/**', route => route.fulfill({ status: 200, contentType: 'text/javascript', headers: { 'access-control-allow-origin': '*', 'cache-control': 'no-store' }, body: STUB }));
  await context.route('**/sw.js', route => route.fulfill({ status: 404, body: '' }));   // 서비스워커는 검증에 방해된다
  await context.addInitScript(([d, users]) => {
    globalThis.__fakeFirebase = { users, currentUser: null, authListeners: [], docs: new Map(Object.entries(d)), colListeners: [], autoId: 0, writeLog: [] };
  }, [docs, [ADMIN, MEMBER]]);
  const page = await context.newPage();
  await page.goto(base);
  return { context, page };
}

async function login(page, user) {
  await page.waitForSelector('#authForm');
  await page.fill('input[name="email"]', user.email);
  await page.fill('input[name="password"]', user.password);
  await page.click('#authForm button.btn');
  await page.waitForSelector('.shell', { timeout: 15000 });
}

const goCare = async page => { await page.click('[data-tab="care"]'); await page.waitForSelector('.timeline'); };
const store = page => page.evaluate(() => Object.fromEntries(globalThis.__fakeFirebase.docs));
const editableIds = page => page.$$eval('.timeline .event', els => els.map(e => e.dataset.editCare || null));

async function main() {
  const { server, base } = await startServer();
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell' });
  const open = docs => openApp(browser, base, docs);
  let saved;

  try {
    /* ===== 1차 세션: 관리자 ===== */
    {
      const { context, page } = await open(seed());
      await login(page, ADMIN);
      await goCare(page);

      const cls = Object.fromEntries((await page.$$eval('.timeline .event', els => els.map(e => [e.dataset.editCare || '?', e.className]))));
      ok('10. 환자보고 = 회색(tone-report)', /tone-report/.test(cls['c-report'] || ''), cls['c-report']);
      ok('11. 병문안 = 핑크(tone-visit)', /tone-visit/.test(cls['c-visit'] || ''), cls['c-visit']);
      ok('12. 항암은 tone 클래스 없음(기존 teal 유지)', cls['c-chemo'] && !/tone-(report|visit)/.test(cls['c-chemo']), cls['c-chemo']);
      ok('1. 관리자는 남이 쓴 기록도 클릭 가능', ['c-report', 'c-visit', 'c-chemo'].every(id => cls[id]), JSON.stringify(Object.keys(cls)));

      await page.click('[data-edit-care="c-report"]');
      await page.waitForSelector('#careForm');
      const shown = await page.evaluate(() => { const f = document.querySelector('#careForm'); return { head: document.querySelector('.modal-head h2').textContent, date: f.elements.date.value, type: f.elements.type.value, place: f.elements.place.value, content: f.elements.content.value, save: f.querySelector('button.btn').textContent, del: !!f.querySelector('button.danger') }; });
      ok('2. 수정 화면이 기존 값과 함께 열림', shown.head === '간병 기록 수정' && shown.date === '2026-08-10' && shown.type === '환자보고' && shown.place === '집' && shown.content === '오늘 컨디션 좋음' && shown.save === '수정 저장' && shown.del, JSON.stringify(shown));

      await page.fill('#careForm textarea[name="content"]', '수정된 내용 A');
      await page.click('#careForm button.btn');
      await page.waitForSelector('#careForm', { state: 'detached' });

      saved = await store(page);
      const careCount = Object.keys(saved).filter(k => k.includes('/care_events/')).length;
      ok('3. 저장하면 같은 문서가 갱신됨 (새 문서 생기지 않음)', saved['families/dalkkung/care_events/c-report']?.content === '수정된 내용 A' && careCount === 3, `content=${saved['families/dalkkung/care_events/c-report']?.content}, care_events=${careCount}건`);
      ok('3-1. created_by 는 그대로 유지', saved['families/dalkkung/care_events/c-report']?.created_by === ADMIN.uid);
      await context.close();
    }

    /* ===== 2차 세션: 저장된 상태로 다시 적재 (= 새로고침) ===== */
    {
      const { context, page } = await open(saved);
      await login(page, ADMIN);
      await goCare(page);
      ok('4. 다시 적재해도 수정값 유지', (await page.textContent('.timeline')).includes('수정된 내용 A'));

      // 첨부가 달린 기록 삭제
      await page.click('[data-edit-care="c-visit"]');
      await page.waitForSelector('#careForm button.danger');
      page.once('dialog', d => d.accept());
      await page.click('#careForm button.danger');
      await page.waitForSelector('#careForm', { state: 'detached' });
      saved = await store(page);
      ok('5. 삭제하면 care_event 가 사라짐', !saved['families/dalkkung/care_events/c-visit']);
      ok('6. 타임라인에서도 사라짐', !(await page.textContent('.timeline')).includes('함께 다녀옴'));
      ok('7. 연결된 attachment 문서만 삭제 (Drive 원본은 호출조차 안 함)', !saved['families/dalkkung/attachments/a-visit']);

      /* 편집 중 실시간 갱신이 들어오는 상황 */
      await page.click('[data-edit-care="c-report"]');
      await page.waitForSelector('#careForm');
      await page.fill('#careForm textarea[name="content"]', '아직 저장하지 않은 초안');
      await page.evaluate(() => globalThis.__fakeFirebaseNotify());   // 다른 가족이 무언가 저장한 상황
      await page.waitForTimeout(300);
      const after = await page.evaluate(() => { const f = document.querySelector('#careForm'); return f ? { content: f.elements.content.value, place: f.elements.place.value, head: document.querySelector('.modal-head h2').textContent, del: !!f.querySelector('button.danger') } : null; });
      ok('13. 편집 중 실시간 갱신이 와도 입력·수정 상태가 유지됨', after && after.content === '아직 저장하지 않은 초안' && after.place === '집' && after.head === '간병 기록 수정' && after.del, JSON.stringify(after));

      await page.screenshot({ path: path.join(HERE, 'verify-care.png'), fullPage: true });
      await context.close();
    }

    /* ===== 3차 세션: 일반 가족 구성원 ===== */
    {
      const { context, page } = await open(seed());
      await login(page, MEMBER);
      await goCare(page);
      const ids = await editableIds(page);
      ok('8. 남이 쓴 기록은 수정/삭제 불가 (관리자가 쓴 c-report)', !ids.includes('c-report'), JSON.stringify(ids));
      ok('9. 본인이 쓴 기록은 수정/삭제 가능 (c-visit, c-chemo)', ids.includes('c-visit') && ids.includes('c-chemo'), JSON.stringify(ids));
      await context.close();
    }

    /* ===== 규칙 파일이 클라이언트 판정과 같은 조건인지 ===== */
    const rules = fs.readFileSync(path.join(APP_DIR, 'firestore.rules'), 'utf8');
    for (const col of ['care_events', 'attachments']) {
      const block = rules.split(`match /${col}/`)[1]?.split('match /')[0] || '';
      ok(`규칙: ${col} 의 update/delete 가 작성자·관리자로 제한됨`,
        /allow update:[\s\S]*?admin\(\)\s*\|\|\s*resource\.data\.created_by == request\.auth\.uid/.test(block)
        && /allow delete:[\s\S]*?admin\(\)\s*\|\|\s*resource\.data\.created_by == request\.auth\.uid/.test(block)
        && /request\.resource\.data\.created_by == resource\.data\.created_by/.test(block));
    }
  } finally {
    await browser.close();
    server.close();
  }

  const failed = results.filter(r => !r.pass).length;
  console.log(`\n${results.length - failed}/${results.length} passed`);
  process.exit(failed ? 1 : 0);
}

main().catch(err => { console.error(err); process.exit(1); });
