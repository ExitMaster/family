// 장면 이미지를 미리 그려서 assets/scenes/ 에 저장한다.
//  계절 6종 × 컷 7종 = 42장. squirrel.html은 이 파일들을 슬라이드로 넘긴다.
//  실행: node scripts/render-scenes.js
//  (원격 실행 환경 기준. 브라우저 경로가 바뀌면 PW_CHROMIUM 으로 넘긴다.)
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'assets', 'scenes');
const W = 1600, H = 900;
const SEASONS = ['봄', '여름', '가을', '겨울', '장마', '밤'];
const SLUG = { '봄': 'spring', '여름': 'summer', '가을': 'autumn', '겨울': 'winter', '장마': 'rain', '밤': 'night' };

const CHROMIUM = process.env.PW_CHROMIUM ||
  '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';

(async () => {
  const { chromium } = require('/opt/node22/lib/node_modules/playwright');
  fs.mkdirSync(OUT, { recursive: true });

  const browser = await chromium.launch({ executablePath: CHROMIUM });

  // 계절마다 탭 하나. 한 장에 수십 초씩 걸리므로 병렬로 굽는다.
  let n = 0;
  async function renderSeason(season) {
    const page = await browser.newPage({ viewport: { width: 400, height: 300 } });
    page.on('pageerror', e => { throw e; });
    await page.setContent('<canvas id="c"></canvas>');
    await page.addScriptTag({ path: path.join(ROOT, 'assets', 'scene-render.js') });

    for (let shot = 0; shot < 7; shot++) {
      const dataUrl = await page.evaluate(([season, shot, W, H]) => {
        const c = document.getElementById('c');
        c.width = W; c.height = H;
        // 컷 중앙 시점으로 한 장 굽는다. 페이지 쪽에서 다시 확대/이동을 얹는다.
        window.SquirrelScene.drawScene(c.getContext('2d'), {
          width: W, height: H, season, shot, progress: 0.5, density: 2.5
        });
        return c.toDataURL('image/jpeg', 0.86);
      }, [season, shot, W, H]);

      const file = path.join(OUT, `${SLUG[season]}-${shot}.jpg`);
      fs.writeFileSync(file, Buffer.from(dataUrl.split(',')[1], 'base64'));
      n++;
      console.log(`${n}/42  ${path.basename(file)}`);
    }
    await page.close();
  }

  await Promise.all(SEASONS.map(renderSeason));
  await browser.close();

  const bytes = fs.readdirSync(OUT).reduce((a, f) => a + fs.statSync(path.join(OUT, f)).size, 0);
  console.log(`\n${n} scenes → assets/scenes/ (${(bytes / 1048576).toFixed(1)} MB)`);
})().catch(e => { console.error(e); process.exit(1); });
