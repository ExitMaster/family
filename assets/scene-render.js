// 다람쥐 장면 렌더러 — squirrel.html과 scripts/render-scenes.js가 함께 쓴다.
//  한 장의 정지 컷을 캔버스에 그리는 일만 한다. 재생·자막·UI는 호출하는 쪽 몫.
(function (root) {
'use strict';

// ── 장면 설정 ──────────────────────────
//  문단 하나 = 장면 하나. 계절에 따라 하늘·날씨·바닥색이 바뀌고
//  하람쥐 형제가 스크롤되는 숲을 걸어간다. 전부 캔버스 실시간 렌더.
const SCENE_MS = 6800;
const DIP_MS = 620;          // 슬라이드 사이 암전 길이
// 문단 7개에 대응하는 7컷. 각 컷은 숲의 다른 지점(world)을 다른 화각으로 잡고,
// 슬라이드가 진행되는 동안 카메라가 아주 천천히 밀거나 당긴다 (켄 번스).
const SHOTS = [
  {world:  120, z0:1.00, z1:1.14, px0:  0, px1: -26, elder:null,                       younger:null,                       note:'establishing'},
  {world:  980, z0:1.22, z1:1.10, px0:-30, px1:   8, elder:{x:.30,y:0.635,s:1.30},        younger:{x:.55,y:0.615,s:.82},        note:'setting off'},
  {world: 1840, z0:1.45, z1:1.62, px0: 20, px1: -14, elder:{x:.36,y:0.655,s:1.55},        younger:{x:.63,y:0.635,s:.98},        note:'trouble, closer in'},
  {world: 2650, z0:1.08, z1:1.00, px0:-18, px1:  22, elder:{x:.24,y:0.645,s:1.22},        younger:{x:.44,y:0.625,s:.78},        friend:true, note:'the friend'},
  {world: 3400, z0:1.30, z1:1.46, px0: 14, px1: -20, elder:{x:.38,y:0.650,s:1.42},       younger:{x:.62,y:0.630,s:.92},       note:'the discovery'},
  {world: 4180, z0:1.70, z1:1.58, px0: -8, px1:  10, elder:{x:.34,y:0.670,s:1.85},       younger:{x:.66,y:0.650,s:1.20},      note:'two brothers, close'},
  {world: 4960, z0:1.05, z1:1.20, px0: 16, px1: -18, elder:{x:.42,y:0.635,s:1.18},        younger:{x:.58,y:0.625,s:.76},        note:'home'}
];
const easeInOut = t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
const SEASON_ART = {
  '봄':   {sky:['#8fb2cc','#d8e4d2'], haze:'#cdd9cf', hill:'#6d8560', ground:'#5f6b45', litter:'#7a8450', weather:'petal',   particle:'#e8dcc8'},
  '여름': {sky:['#6f9dc4','#cfe0d4'], haze:'#c2d2c6', hill:'#4a6b45', ground:'#415433', litter:'#586b38', weather:'firefly', particle:'#f2e6a8'},
  '가을': {sky:['#a9a08a','#e2d3b4'], haze:'#d8c8a8', hill:'#7d6438', ground:'#6b512f', litter:'#8a6431', weather:'leaf',    particle:'#a8652c'},
  '겨울': {sky:['#8e9db0','#dfe6ec'], haze:'#dbe3ea', hill:'#7d8794', ground:'#c9d3dc', litter:'#aab6c2', weather:'snow',    particle:'#f4f8fb'},
  '장마': {sky:['#6f7c85','#b8c3c4'], haze:'#b3bdbd', hill:'#4f5f4c', ground:'#47543a', litter:'#5b6742', weather:'rain',    particle:'#c6d6de'},
  '밤':   {sky:['#141c30','#31405c'], haze:'#2b3852', hill:'#1d2537', ground:'#232b3a', litter:'#2c3547', weather:'star',    particle:'#e8e2c4'}
};
function seasonOf(seasonLine) {
  if (/[Ww]inter|snow/.test(seasonLine)) return '겨울';
  if (/rain/.test(seasonLine)) return '장마';
  if (/night|stars/.test(seasonLine)) return '밤';
  if (/[Mm]idsummer|cicada/.test(seasonLine)) return '여름';
  if (/[Aa]utumn/.test(seasonLine)) return '가을';
  return '봄';
}


const lightenHex = (hex, amt) => {
  const h = hex.replace('#', '');
  const f = i => {
    const c = parseInt(h.slice(i, i + 2), 16);
    return Math.round(c + (255 - c) * amt).toString(16).padStart(2, '0');
  };
  return '#' + f(0) + f(2) + f(4);
};

// 형제의 털색은 매일 같다 — 같은 등장인물이므로 고정한다.
const FUR = '#8a6a4d';
const KID_FUR = lightenHex(FUR, .16);

let ctx;                     // 그리는 동안만 유지되는 현재 컨텍스트
let density = 1;             // 털·잎 밀도 배수. 미리 굽는 이미지는 크게 올린다.

function drawScene(context, opt) {
  ctx = context;
  density = opt.density || 1;
  // 그림은 640×360 좌표계로 짜여 있다. 출력 해상도가 얼마든 그 좌표계로 그린 뒤
  // 통째로 확대해서 구도를 유지한다 (벡터라 확대해도 뭉개지지 않는다).
  const S = opt.height / 360;
  const W = opt.width / S, H = 360;
  const season = opt.season, A = SEASON_ART[season] || SEASON_ART['봄'];
  const shot = SHOTS[opt.shot % SHOTS.length];
  const local = opt.progress === undefined ? 0.5 : opt.progress;
  const fur = FUR, kidFur = KID_FUR;
  const scroll = shot.world + local * 26;
  const e = easeInOut(local);
  const zoom = shot.z0 + (shot.z1 - shot.z0) * e;
  const panX = shot.px0 + (shot.px1 - shot.px0) * e;
  const ms = local * 6800;

  // 배경 요소는 컷마다 결정적으로 뿌린다 (같은 입력 → 같은 그림).
  const trees = Array.from({length: 26}, (_, i) => ({
    x: i * 120 + (i % 3) * 37, h: 90 + (i % 5) * 26, layer: i % 2, w: 16 + (i % 3) * 5
  }));
  const bits = Array.from({length: 70}, (_, i) => ({
    x: ((i * 9973) % 1000) / 1000 * W, y: ((i * 7919) % 1000) / 1000 * H,
    sp: 0.4 + ((i * 37) % 100) / 100 * 1.6, sw: ((i * 53) % 628) / 100, sz: 1.5 + ((i * 29) % 100) / 100 * 3
  }));

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, opt.width, opt.height);
  ctx.save();
  ctx.scale(S, S);
  ctx.translate(W / 2 + panX, H / 2);
  ctx.scale(zoom, zoom);
  ctx.translate(-W / 2, -H / 2);

    const g = ctx.createLinearGradient(0, 0, 0, H * 0.72);          // 하늘
    g.addColorStop(0, A.sky[0]); g.addColorStop(1, A.sky[1]);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

    if (season === '밤') {
      ctx.fillStyle = 'rgba(240,236,214,.85)';
      ctx.beginPath(); ctx.arc(W - 78, 58, 21, 0, 6.29); ctx.fill();
      ctx.fillStyle = 'rgba(240,236,214,.10)';
      ctx.beginPath(); ctx.arc(W - 78, 58, 40, 0, 6.29); ctx.fill();
    } else {
      ctx.fillStyle = 'rgba(255,255,255,.28)';                      // 낮은 구름층
      for (let i = 0; i < 4; i++) {
        const cx = (((i * 260 - scroll * 0.12) % (W + 340)) + W + 340) % (W + 340) - 170;
        ctx.beginPath(); ctx.ellipse(cx, 46 + i * 13, 100, 15, 0, 0, 6.29); ctx.fill();
      }
    }

    // 원경: 안개에 잠긴 나무 실루엣 세 겹. 뒤로 갈수록 흐리게 (대기원근).
    for (let d = 0; d < 3; d++) {
      const depth = 1 - d * 0.3;
      ctx.globalAlpha = 0.16 + d * 0.16;
      ctx.filter = `blur(${(2 - d) * 1.8}px)`;
      ctx.fillStyle = A.hill;
      const baseY = H * (0.45 + d * 0.05);
      const sp = 0.06 + d * 0.10;
      ctx.beginPath(); ctx.moveTo(0, H);
      for (let x = -40; x <= W + 40; x += 14) {
        const n = Math.sin((x + scroll * sp) / 37) + Math.sin((x + scroll * sp) / 91) * 1.6;
        ctx.lineTo(x, baseY - n * 11 * depth - (Math.abs(Math.sin((x + d * 50) / 23)) > 0.86 ? 26 * depth : 0));
      }
      ctx.lineTo(W, H); ctx.closePath(); ctx.fill();
      ctx.globalAlpha = 1; ctx.filter = 'none';
    }
    ctx.fillStyle = A.haze; ctx.globalAlpha = 0.14;                 // 안개 띠
    ctx.fillRect(0, H * 0.43, W, H * 0.14); ctx.globalAlpha = 1;

    // 중경/근경 나무: 줄기 명암 + 불규칙한 잎 덩어리
    for (const layer of [0, 1]) {
      const sp = layer ? 1 : 0.42;
      const span = 120 * 26;
      const leafBase = season === '겨울' ? '#8d9aa6' : (season === '가을' ? '#8a6a34' : '#3f5e39');
      for (const tr of trees) {
        if (tr.layer !== layer) continue;
        let x = ((tr.x - scroll * sp) % span + span) % span - 60;
        if (x < -110 || x > W + 110) continue;
        const base = H * (layer ? 0.74 : 0.64);
        const hh = tr.h * (layer ? 1 : 0.72);
        ctx.globalAlpha = layer ? 1 : 0.5;
        ctx.filter = layer ? 'none' : 'blur(3px)';
        const bark = ctx.createLinearGradient(x - tr.w / 2, 0, x + tr.w / 2, 0);
        bark.addColorStop(0, '#3d2f22'); bark.addColorStop(0.45, '#5c4632'); bark.addColorStop(1, '#2f2417');
        ctx.fillStyle = bark;
        ctx.beginPath();
        ctx.moveTo(x - tr.w / 2.4, base);
        ctx.lineTo(x - tr.w / 4.5, base - hh * 0.62);
        ctx.lineTo(x + tr.w / 4.5, base - hh * 0.62);
        ctx.lineTo(x + tr.w / 2.4, base); ctx.closePath(); ctx.fill();
        if (season !== '겨울' || layer === 0) {
          const clumps = Math.round(5 * Math.min(3, density));
          for (let c = 0; c < clumps; c++) {                         // 잎 덩어리
            const a = c * 1.7 + tr.x;
            const cxp = x + Math.cos(a) * tr.w * 1.5;
            const cyp = base - hh * (0.66 + Math.abs(Math.sin(a)) * 0.28);
            ctx.fillStyle = c % 2 ? leafBase : shade(leafBase, -0.22);
            ctx.beginPath();
            ctx.ellipse(cxp, cyp, tr.w * 1.5, tr.w * 1.15, a, 0, 6.29);
            ctx.fill();
            const leaves = Math.round(14 * density);                 // 덩어리 가장자리를 잎으로 흩는다
            for (let l = 0; l < leaves; l++) {
              const la = l * 2.399 + c;
              const lr = 0.75 + ((l * 0.31) % 0.5);
              ctx.fillStyle = (l % 3 === 0) ? lightenHex(leafBase, .18)
                            : (l % 3 === 1) ? leafBase : shade(leafBase, -0.34);
              ctx.beginPath();
              ctx.ellipse(cxp + Math.cos(la) * tr.w * 1.5 * lr,
                          cyp + Math.sin(la) * tr.w * 1.15 * lr,
                          tr.w * 0.30, tr.w * 0.20, la, 0, 6.29);
              ctx.fill();
            }
          }
        }
        ctx.globalAlpha = 1; ctx.filter = 'none';
      }
    }

    // 바닥: 흙 그라디언트 + 낙엽/풀 잔결
    const gg = ctx.createLinearGradient(0, H * 0.62, 0, H);
    gg.addColorStop(0, A.ground); gg.addColorStop(1, shade(A.ground, -0.30));
    ctx.fillStyle = gg; ctx.fillRect(0, H * 0.62, W, H * 0.38);
    ctx.strokeStyle = A.litter; ctx.lineWidth = 1.1; ctx.globalAlpha = 0.55;
    for (let i = 0; i < 90; i++) {
      const gx = ((i * 71 - scroll) % (W + 60) + W + 60) % (W + 60) - 30;
      const gy = H * 0.63 + ((i * 37) % Math.round(H * 0.36));
      ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(gx + ((i % 5) - 2) * 2, gy - 4 - (i % 4)); ctx.stroke();
    }
    ctx.globalAlpha = 1;

    const walk = local * 26;                                    // 정지컷이라 숨쉬는 정도로만 움직인다
    ctx.save();
    ctx.shadowColor = 'rgba(20,14,8,.45)'; ctx.shadowBlur = 10; ctx.shadowOffsetY = 3;
    if (shot.friend) drawCompanion(W * 0.70, H * 0.630, 0.9);
    if (shot.elder)   drawSquirrel(W * shot.elder.x,   H * shot.elder.y,   shot.elder.s,   fur,    walk);
    if (shot.younger) drawSquirrel(W * shot.younger.x, H * shot.younger.y, shot.younger.s, kidFur, walk + 1.6);
    ctx.restore();

    for (const b of bits) {                                   // 날씨 입자
      ctx.fillStyle = A.particle;
      if (A.weather === 'rain') {
        const y = (b.y + ms * b.sp * 0.55) % H;
        ctx.globalAlpha = .55; ctx.fillRect(b.x, y, 1.6, 12); ctx.globalAlpha = 1;
      } else if (A.weather === 'star' || A.weather === 'firefly') {
        const tw = 0.4 + 0.6 * Math.abs(Math.sin(ms / 500 + b.sw));
        ctx.globalAlpha = tw;
        const y = A.weather === 'star' ? b.y * 0.6 : b.y * 0.9;
        ctx.beginPath(); ctx.arc(b.x, y, b.sz * 0.7, 0, 6.29); ctx.fill();
        ctx.globalAlpha = 1;
      } else {
        const y = (b.y + ms * b.sp * 0.06) % H;
        const x = b.x + Math.sin(ms / 700 + b.sw) * 18;
        ctx.globalAlpha = .85;
        ctx.beginPath(); ctx.ellipse(x, y, b.sz, b.sz * (A.weather === 'snow' ? 1 : 0.6), b.sw, 0, 6.29); ctx.fill();
        ctx.globalAlpha = 1;
      }
    }

    // 렌즈 느낌: 앞쪽 흐린 잎 몇 장이 화면 가장자리를 스친다 (전경 아웃포커스)
    ctx.save();
    ctx.filter = 'blur(9px)';
    ctx.globalAlpha = 0.30;
    ctx.fillStyle = season === '겨울' ? '#8ea0b2' : (season === '가을' ? '#5f4420' : '#24391f');
    for (let i = 0; i < 3; i++) {
      const fx = ((i * 430 - scroll * 2.8) % (W + 760) + W + 760) % (W + 760) - 380;
      const fy = i % 2 ? H * 0.03 : H * 0.94;          // 위아래 가장자리만 스치게
      ctx.beginPath();
      ctx.ellipse(fx, fy, 96, 40, i * 0.7, 0, 6.29);
      ctx.fill();
    }
    ctx.restore();

    // 필름 그레인 — 매끈한 벡터 느낌을 덜어 준다
    ctx.globalAlpha = 0.045;
    for (let i = 0; i < 900; i++) {
      const gx = (i * 6997 + Math.floor(ms / 90) * 131) % W;
      const gy = (i * 3571 + Math.floor(ms / 90) * 977) % H;
      ctx.fillStyle = (i % 2) ? '#fff' : '#000';
      ctx.fillRect(gx, gy, 1, 1);
    }
    ctx.globalAlpha = 1;

    const grade = ctx.createLinearGradient(0, 0, W, H);        // 색 보정
    grade.addColorStop(0, season === '밤' ? 'rgba(40,60,120,.14)' : 'rgba(255,186,112,.06)');
    grade.addColorStop(1, 'rgba(18,26,34,.09)');
    ctx.fillStyle = grade; ctx.fillRect(0, 0, W, H);

    const vg = ctx.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 0.95);
    vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.32)');
    ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);


  ctx.restore();
}

function furStrands(cx, cy, rx, ry, n, color, len, seedOff, dir) {
  ctx.strokeStyle = color; ctx.lineCap = 'round';
  n = Math.round(n * density);
  for (let i = 0; i < n; i++) {
    const a = (i * 2.399 + seedOff) % 6.283;
    const rr = 0.35 + ((i * 0.37) % 0.62);
    const px = cx + Math.cos(a) * rx * rr, py = cy + Math.sin(a) * ry * rr;
    const wob = Math.sin(i * 1.7) * 0.35;
    const ang = (dir === undefined ? a : dir + wob);
    const l = len * (0.55 + ((i * 0.19) % 0.6));
    ctx.lineWidth = (0.30 + (i % 3) * 0.14) / Math.max(1, Math.sqrt(density) * 0.7);
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.quadraticCurveTo(px + Math.cos(ang) * l * 0.6, py + Math.sin(ang) * l * 0.6 - 0.6,
                         px + Math.cos(ang) * l,       py + Math.sin(ang) * l);
    ctx.stroke();
  }
}


function drawSquirrel(x, y, k, f, phase) {
  const dark  = shade(f, -0.34), mid = shade(f, -0.15);
  const light = lightenHex(f, 0.30), belly = lightenHex(f, 0.62);
  const bob = Math.sin(phase) * 2.2 * k;
  ctx.save();
  ctx.translate(x, y + bob);
  ctx.scale(k, k);
  ctx.lineJoin = 'round';

  // 땅 그림자 (몸 아래로 눌린 타원)
  ctx.fillStyle = 'rgba(30,22,12,.22)';
  ctx.beginPath(); ctx.ellipse(4, 2 - bob / k, 34, 5.5, 0, 0, 6.29); ctx.fill();

  // ── 꼬리: 뒤쪽에 크게. 겉털(밝음) 위에 속털(어두움)을 겹친다.
  ctx.save();
  ctx.translate(-24, -14);
  ctx.rotate(Math.sin(phase * 0.7) * 0.10);
  const tg = ctx.createLinearGradient(-30, -40, 10, 10);
  tg.addColorStop(0, lightenHex(f, .18)); tg.addColorStop(0.5, f); tg.addColorStop(1, dark);
  ctx.fillStyle = tg;
  ctx.beginPath();
  ctx.moveTo(6, 6);
  ctx.bezierCurveTo(-34, 8, -46, -34, -22, -62);
  ctx.bezierCurveTo(-6, -78, 16, -70, 20, -52);
  ctx.bezierCurveTo(6, -62, -12, -54, -14, -34);
  ctx.bezierCurveTo(-16, -16, -2, -6, 8, -2);
  ctx.closePath(); ctx.fill();
  ctx.save(); ctx.clip();
  // 꼬리털은 뿌리에서 바깥으로 뻗으며 방향이 조금씩 달라진다. 한 올씩 얹는다.
  const hairs = Math.round(300 * density);
  for (let i = 0; i < hairs; i++) {
    const u = (i * 0.6180339887) % 1, v = (i * 0.7548776662) % 1;
    const ang = -2.35 + u * 2.7, rad = 24 + v * 28;
    const px = -8 + Math.cos(ang) * rad * 0.9, py = -30 + Math.sin(ang) * rad;
    const out = ang + (v - 0.5) * 0.55;
    const hl = 7 + ((i * 13) % 10);
    const tone = i % 3;
    ctx.strokeStyle = tone === 0 ? 'rgba(255,246,230,.15)'
                    : tone === 1 ? 'rgba(35,24,14,.14)'
                                 : 'rgba(150,120,90,.12)';
    ctx.lineWidth = 0.26 + (i % 4) * 0.09;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.quadraticCurveTo(px + Math.cos(out) * hl * 0.6, py + Math.sin(out) * hl * 0.6,
                         px + Math.cos(out) * hl,       py + Math.sin(out) * hl);
    ctx.stroke();
  }
  ctx.restore();
  ctx.restore();

  // ── 뒷다리(허벅지) → 몸통 → 앞다리 순으로 겹친다.
  ctx.fillStyle = mid;
  ctx.beginPath(); ctx.ellipse(-8, -16, 17, 15, -0.15, 0, 6.29); ctx.fill();   // 허벅지
  ctx.fillStyle = dark;
  ctx.beginPath(); ctx.ellipse(-4, -3, 11, 4.5, -0.12, 0, 6.29); ctx.fill();   // 뒷발

  const bg2 = ctx.createLinearGradient(0, -40, 0, -2);
  bg2.addColorStop(0, mid); bg2.addColorStop(0.62, f); bg2.addColorStop(1, belly);
  ctx.fillStyle = bg2;
  ctx.beginPath();
  ctx.moveTo(-20, -12);
  ctx.bezierCurveTo(-22, -34, -6, -44, 10, -40);   // 등
  ctx.bezierCurveTo(22, -37, 26, -24, 24, -14);    // 가슴
  ctx.bezierCurveTo(20, -4, -8, -2, -20, -12);     // 배
  ctx.closePath(); ctx.fill();
  ctx.save(); ctx.clip();
  furStrands(0, -26, 22, 17, 260, 'rgba(30,20,10,.12)',   6, 1.2, 0.45);
  furStrands(6, -16, 18, 11, 190, 'rgba(255,252,244,.14)', 5, 3.4, 0.55);
  furStrands(-6, -34, 18, 10, 150, 'rgba(255,250,240,.11)', 5, 5.1, 0.15);
  ctx.restore();

  ctx.fillStyle = mid;                                                          // 앞다리
  ctx.beginPath();
  ctx.moveTo(18, -22); ctx.bezierCurveTo(24, -16, 24, -8, 21, -3);
  ctx.bezierCurveTo(17, -2, 15, -8, 14, -18); ctx.closePath(); ctx.fill();
  ctx.fillStyle = dark;
  ctx.beginPath(); ctx.ellipse(21, -2.5, 5, 2.6, 0, 0, 6.29); ctx.fill();       // 앞발

  // ── 머리: 주둥이가 앞으로 나온 쐐기 모양.
  const hg = ctx.createLinearGradient(10, -58, 10, -30);
  hg.addColorStop(0, mid); hg.addColorStop(1, f);
  ctx.fillStyle = hg;
  ctx.beginPath();
  ctx.moveTo(8, -34);
  ctx.bezierCurveTo(6, -50, 18, -58, 28, -55);     // 이마
  ctx.bezierCurveTo(38, -52, 42, -45, 41, -41);    // 코끝
  ctx.bezierCurveTo(38, -36, 30, -32, 20, -32);    // 턱
  ctx.closePath(); ctx.fill();

  ctx.fillStyle = belly;                                                        // 목·뺨 밝은 털
  ctx.beginPath(); ctx.ellipse(24, -36, 9, 4.5, -0.15, 0, 6.29); ctx.fill();

  ctx.fillStyle = f;                                                            // 귀 + 귀털
  ctx.beginPath(); ctx.ellipse(16, -55, 4.5, 7, -0.25, 0, 6.29); ctx.fill();
  ctx.fillStyle = shade(f, -0.45);
  ctx.beginPath(); ctx.ellipse(16, -54, 2.2, 4.2, -0.25, 0, 6.29); ctx.fill();
  ctx.strokeStyle = light; ctx.lineWidth = 0.45;
  const tufts = Math.round(10 * density);
  for (let i = 0; i < tufts; i++) {
    const o = (i / tufts - 0.5) * 7;
    ctx.beginPath();
    ctx.moveTo(16 + o * 0.7, -60);
    ctx.quadraticCurveTo(15 + o, -64, 13.5 + o * 1.25, -66.5 - (i % 3));
    ctx.stroke();
  }

  ctx.save();                                                                   // 머리 털결
  ctx.beginPath();
  ctx.moveTo(8, -34); ctx.bezierCurveTo(6, -50, 18, -58, 28, -55);
  ctx.bezierCurveTo(38, -52, 42, -45, 41, -41);
  ctx.bezierCurveTo(38, -36, 30, -32, 20, -32); ctx.closePath(); ctx.clip();
  furStrands(22, -45, 13, 10, 150, 'rgba(30,20,10,.11)',   3.4, 0.9, 0.30);
  furStrands(20, -50, 11,  7, 110, 'rgba(255,250,240,.12)', 3.0, 2.6, -0.2);
  ctx.restore();

  ctx.fillStyle = 'rgba(255,255,255,.30)';                                      // 눈 둘레 밝은 털
  ctx.beginPath(); ctx.ellipse(27, -48, 4.4, 3.9, 0, 0, 6.29); ctx.fill();
  ctx.fillStyle = '#14100c';                                                    // 눈
  ctx.beginPath(); ctx.ellipse(27, -48, 2.4, 2.3, 0, 0, 6.29); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.75)';
  ctx.beginPath(); ctx.arc(27.8, -48.8, 0.7, 0, 6.29); ctx.fill();

  ctx.fillStyle = '#2b1d14';                                                    // 코
  ctx.beginPath(); ctx.ellipse(41, -42, 1.9, 1.5, 0.3, 0, 6.29); ctx.fill();
  ctx.lineWidth = 0.3;                                                          // 수염
  for (let i = 0; i < 7; i++) {
    const drop = i * 2.2 - 4;
    ctx.strokeStyle = `rgba(255,255,255,${0.14 + (i % 2) * 0.09})`;
    ctx.beginPath(); ctx.moveTo(38.5, -42 + i * 0.6);
    ctx.quadraticCurveTo(46, -44 + drop * 0.8, 51 + (i % 3) * 2.5, -39 + drop * 1.4);
    ctx.stroke();
  }
  ctx.restore();
}


function drawCompanion(x, y, k) {
  ctx.save();
  ctx.translate(x, y); ctx.scale(k, k);
  ctx.fillStyle = 'rgba(30,22,12,.22)';
  ctx.beginPath(); ctx.ellipse(0, 2, 26, 5, 0, 0, 6.29); ctx.fill();
  const g = ctx.createLinearGradient(0, -34, 0, 0);
  g.addColorStop(0, '#5a5148'); g.addColorStop(1, '#332c25');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(-24, 0);
  ctx.bezierCurveTo(-26, -22, -8, -32, 8, -30);
  ctx.bezierCurveTo(22, -28, 26, -14, 24, 0);
  ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.arc(18, -28, 11, 0, 6.29); ctx.fill();        // 머리
  ctx.fillStyle = '#241e19';
  ctx.beginPath(); ctx.ellipse(27, -27, 4, 3, 0.2, 0, 6.29); ctx.fill();
  ctx.fillStyle = '#0f0c0a';
  ctx.beginPath(); ctx.arc(21, -31, 1.7, 0, 6.29); ctx.fill();       // 눈
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(-24, 0); ctx.bezierCurveTo(-26, -22, -8, -32, 8, -30);
  ctx.bezierCurveTo(22, -28, 26, -14, 24, 0); ctx.closePath(); ctx.clip();
  furStrands(-2, -16, 22, 14, 90, 'rgba(255,255,255,.10)', 5, 1.4, 0.5);
  ctx.restore();
  ctx.restore();
}


function shade(hex, amt) {
  const h = hex.replace('#', ''), m = Math.abs(amt);
  const f = i => {
    const c = parseInt(h.slice(i, i + 2), 16);
    return Math.round(c * (1 - m)).toString(16).padStart(2, '0');
  };
  return '#' + f(0) + f(2) + f(4);
}


root.SquirrelScene = { drawScene, SHOTS, SEASON_ART, SCENE_MS, DIP_MS, easeInOut, lightenHex, FUR, KID_FUR };
})(typeof window !== 'undefined' ? window : globalThis);
