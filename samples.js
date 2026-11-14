/* =====================================================================
   unimai sample games – 10 small game engines + themed variants.
   Loaded before the main script in index.html. Each entry in
   SAMPLE_GAMES uses  play:"<engine>"  and  cfg:{...}  for its theme.
   ===================================================================== */

const em = (ctx, ch, x, y, size) => { ctx.font = `${size}px "Noto Color Emoji","Apple Color Emoji","Segoe UI Emoji",serif`; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(ch, x, y); };
const pick = a => a[Math.random() * a.length | 0];
const hit = (a, b, r) => Math.hypot(a.x - b.x, a.y - b.y) < r;

/* shared arcade shell: ready → play → over, score + best, input */
function arcade(root, g, W, H, hint, def){
  const k = kit(root, W, H, hint), key = "s:" + g.slug, cfg = g.cfg || {};
  const st = {state:"ready", score:0, best:store.get(key), keys:{}, px:W/2, py:H/2, t:0, W, H, cfg, k};
  st.over = () => { if (st.state !== "play") return; st.state = "over"; st.cool = .5; if ((st.score|0) > st.best) store.set(key, st.best = st.score|0); };
  const start = () => { st.score = 0; st.t = 0; def.reset(st); st.state = "play"; };
  k.on(window, "keydown", e => { st.keys[e.code] = true;
    if (st.state !== "play") { if (["Space","Enter","ArrowUp"].includes(e.code) && !(st.cool > 0)) start(); return; }
    def.key && def.key(st, e); });
  k.on(window, "keyup", e => { st.keys[e.code] = false; });
  k.on(k.c, "pointerdown", e => { const p = k.pos(e); st.px = p.x; st.py = p.y;
    if (st.state !== "play") { if (!(st.cool > 0)) start(); return; }
    def.tap && def.tap(st, p); });
  k.on(k.c, "pointermove", e => { const p = k.pos(e); st.px = p.x; st.py = p.y; st.moved = true; });
  def.reset(st);
  k.loop(dt => {
    if (st.cool > 0) st.cool -= dt;
    if (st.state === "play") { st.t += dt; def.update(st, dt); }
    def.draw(st, k.ctx);
    k.ctx.fillStyle = "rgba(0,0,0,.28)"; k.ctx.fillRect(0, 0, W, 48);
    k.text(`${def.unit ? def.unit(st) : "Score " + (st.score|0)}`, 14, 25, 20, "#fff", 700, "left");
    k.text(`Best ${st.best|0}`, W-14, 25, 18, "#ffe8a3", 600, "right");
    if (def.hud) def.hud(st, k);
    if (st.state === "ready") k.banner(g.name, def.how || "Tap or press Space to start");
    if (st.state === "over") k.banner(def.overText ? def.overText(st) : "Game Over", `Score ${st.score|0} · tap to play again`);
  });
  return k.cleanup;
}
const sky = (st, ctx, c1, c2) => { const gr = ctx.createLinearGradient(0,0,0,st.H); gr.addColorStop(0, c1); gr.addColorStop(1, c2); ctx.fillStyle = gr; ctx.fillRect(0,0,st.W,st.H); };
const steer = (st, dt, speed=420) => {
  if (st.keys.ArrowLeft || st.keys.KeyA) { st.x -= speed*dt; st.moved = false; }
  else if (st.keys.ArrowRight || st.keys.KeyD) { st.x += speed*dt; st.moved = false; }
  else if (st.moved) st.x += (st.px - st.x) * Math.min(1, dt*14);
  st.x = Math.max(24, Math.min(st.W-24, st.x));
};

const SAMPLE_ENGINES = {

  /* ---- catch good things, avoid bad ---- */
  catch: (root, g) => arcade(root, g, 400, 600, "Move with mouse / finger or ←→", {
    how: "Catch the goodies, dodge the bad ones!",
    reset: st => { st.x = st.W/2; st.items = []; st.spawn = 0; st.lives = 3; },
    update: (st, dt) => {
      steer(st, dt);
      if ((st.spawn -= dt) <= 0) { st.spawn = Math.max(.32, .85 - st.t*.012);
        const bad = Math.random() < .25 + Math.min(.15, st.t*.004);
        st.items.push({x:30+Math.random()*(st.W-60), y:30, bad, ch: bad ? pick(st.cfg.bad) : pick(st.cfg.good), v:150+st.t*5+Math.random()*60}); }
      for (const it of st.items) { it.y += it.v*dt;
        if (!it.gone && it.y > st.H-90 && it.y < st.H-30 && Math.abs(it.x-st.x) < 40) { it.gone = true;
          if (it.bad) { st.lives--; if (st.lives <= 0) st.over(); } else st.score++; } }
      st.items = st.items.filter(it => !it.gone && it.y < st.H+30);
    },
    draw: (st, ctx) => { sky(st, ctx, st.cfg.c1 || "#bde0fe", st.cfg.c2 || "#ffc8dd");
      st.items.forEach(it => em(ctx, it.ch, it.x, it.y, 36)); em(ctx, st.cfg.player, st.x, st.H-60, 56); },
    hud: (st, k) => k.text("❤️".repeat(Math.max(0, st.lives)), st.W/2, 25, 16),
  }),

  /* ---- dodge falling hazards, score = seconds survived ---- */
  dodge: (root, g) => arcade(root, g, 400, 600, "Move with mouse / finger or ←→", {
    how: "Dodge everything that falls!",
    reset: st => { st.x = st.W/2; st.items = []; st.spawn = 0; },
    update: (st, dt) => {
      steer(st, dt, 460); st.score = st.t * 10;
      if ((st.spawn -= dt) <= 0) { st.spawn = Math.max(.12, .6 - st.t*.015);
        st.items.push({x:20+Math.random()*(st.W-40), y:-20, ch:pick(st.cfg.hazards), v:200+st.t*9+Math.random()*120, s:28+Math.random()*16}); }
      st.items.forEach(it => { it.y += it.v*dt; if (hit(it, {x:st.x, y:st.H-60}, it.s/2+16)) st.over(); });
      st.items = st.items.filter(it => it.y < st.H+40);
    },
    draw: (st, ctx) => { sky(st, ctx, st.cfg.c1 || "#14213d", st.cfg.c2 || "#3a0ca3");
      st.items.forEach(it => em(ctx, it.ch, it.x, it.y, it.s)); em(ctx, st.cfg.player, st.x, st.H-60, 44); },
  }),

  /* ---- endless runner: jump over obstacles ---- */
  runner: (root, g) => arcade(root, g, 600, 340, "Tap, click or Space to jump", {
    how: "Jump over the obstacles!",
    reset: st => { st.y = 0; st.vy = 0; st.obs = []; st.next = 1; st.speed = 300; st.ground = st.H-60; },
    jump: st => { if (st.y >= 0) st.vy = -620; },
    key: (st, e) => { if (["Space","ArrowUp","KeyW"].includes(e.code)) { if (st.y >= -1) st.vy = -640; } },
    tap: st => { if (st.y >= -1) st.vy = -640; },
    update: (st, dt) => {
      st.speed = 300 + st.t*12; st.score += st.speed*dt/40;
      st.vy += 1900*dt; st.y = Math.min(0, st.y + st.vy*dt); if (st.y === 0) st.vy = 0;
      if ((st.next -= dt) <= 0) { st.next = .7 + Math.random()*1.1 - Math.min(.35, st.t*.01); st.obs.push({x:st.W+30, ch:pick(st.cfg.obstacles)}); }
      st.obs.forEach(o => { o.x -= st.speed*dt; if (Math.abs(o.x-90) < 30 && st.y > -36) st.over(); });
      st.obs = st.obs.filter(o => o.x > -40);
    },
    draw: (st, ctx) => { sky(st, ctx, st.cfg.c1 || "#8ecae6", st.cfg.c2 || "#ffb703");
      ctx.fillStyle = st.cfg.ground || "#6a994e"; ctx.fillRect(0, st.ground+20, st.W, 80);
      ctx.fillStyle = "rgba(0,0,0,.15)"; for (let i=0;i<12;i++) ctx.fillRect(((i*70 - st.t*st.speed) % (st.W+70) + st.W+70) % (st.W+70) - 35, st.ground+40, 30, 6);
      st.obs.forEach(o => em(ctx, o.ch, o.x, st.ground, 40));
      ctx.save(); ctx.translate(90, st.ground + st.y); if (!st.cfg.noFlip) ctx.scale(-1, 1); em(ctx, st.cfg.player, 0, -4, 48); ctx.restore(); },
  }),

  /* ---- whack: tap good targets in a 3x3 grid, 30 seconds ---- */
  whack: (root, g) => arcade(root, g, 420, 520, "Tap the targets — not the decoys!", {
    how: "30 seconds! Tap the targets, avoid the decoys",
    unit: st => `Score ${st.score|0} · ${Math.max(0, Math.ceil(30-st.t))}s`,
    reset: st => { st.holes = Array.from({length:9}, () => null); st.spawn = 0; st.fx = []; },
    tap: (st, p) => st.holes.forEach((h, i) => { if (!h) return; const cx = 70+(i%3)*140, cy = 140+(i/3|0)*130;
      if (Math.hypot(p.x-cx, p.y-cy) < 52) { if (h.bad) { st.score = Math.max(0, st.score-3); st.fx.push({x:cx,y:cy,t:0,txt:"-3"}); } else { st.score++; st.fx.push({x:cx,y:cy,t:0,txt:"+1"}); } st.holes[i] = null; } }),
    update: (st, dt) => {
      if (st.t >= 30) return st.over();
      if ((st.spawn -= dt) <= 0) { st.spawn = Math.max(.28, .7 - st.t*.012);
        const free = st.holes.map((h,i) => h ? -1 : i).filter(i => i >= 0);
        if (free.length) { const bad = Math.random() < .22; st.holes[pick(free)] = {bad, ch: bad ? pick(st.cfg.bad) : pick(st.cfg.good), life: Math.max(.6, 1.2 - st.t*.015)}; } }
      st.holes.forEach((h, i) => { if (h && (h.life -= dt) <= 0) st.holes[i] = null; });
      st.fx = st.fx.filter(f => (f.t += dt) < .6);
    },
    draw: (st, ctx) => { sky(st, ctx, st.cfg.c1 || "#95d5b2", st.cfg.c2 || "#2d6a4f");
      st.holes.forEach((h, i) => { const cx = 70+(i%3)*140, cy = 140+(i/3|0)*130;
        ctx.fillStyle = "rgba(0,0,0,.3)"; ctx.beginPath(); ctx.ellipse(cx, cy+34, 54, 18, 0, 0, 7); ctx.fill();
        if (h) em(ctx, h.ch, cx, cy, 64); });
      st.fx.forEach(f => st.k.text(f.txt, f.x, f.y-40-f.t*60, 26, f.txt[0]==="+" ? "#fff" : "#ff4d6d")); },
    overText: () => "Time's up!",
  }),

  /* ---- 3-lane racer ---- */
  racer: (root, g) => arcade(root, g, 360, 600, "←→ or tap left / right side to switch lanes", {
    how: "Switch lanes and don't crash!",
    reset: st => { st.lane = 1; st.x = 180; st.cars = []; st.spawn = 0; st.road = 0; },
    key: (st, e) => { if (e.code === "ArrowLeft" || e.code === "KeyA") st.lane = Math.max(0, st.lane-1); if (e.code === "ArrowRight" || e.code === "KeyD") st.lane = Math.min(2, st.lane+1); },
    tap: (st, p) => { st.lane = p.x < st.x ? Math.max(0, st.lane-1) : Math.min(2, st.lane+1); },
    update: (st, dt) => {
      const sp = 320 + st.t*10; st.road += sp*dt; st.score += sp*dt/50;
      st.x += (60 + st.lane*120 - st.x) * Math.min(1, dt*14);
      if ((st.spawn -= dt) <= 0) { st.spawn = Math.max(.35, .95 - st.t*.012); st.cars.push({lane: Math.random()*3|0, y:-50, ch:pick(st.cfg.obstacles), v: sp*(.45+Math.random()*.3)}); }
      st.cars.forEach(c => { c.y += c.v*dt; if (Math.abs(60+c.lane*120 - st.x) < 50 && Math.abs(c.y - (st.H-90)) < 56) st.over(); });
      st.cars = st.cars.filter(c => c.y < st.H+60);
    },
    draw: (st, ctx) => { ctx.fillStyle = st.cfg.road || "#3d405b"; ctx.fillRect(0,0,st.W,st.H);
      ctx.fillStyle = st.cfg.lines || "rgba(255,255,255,.6)";
      for (let l=1;l<3;l++) for (let y = (st.road % 60) - 60; y < st.H; y += 60) ctx.fillRect(l*120-3, y, 6, 32);
      const draw = (ch, x, y, s) => { ctx.save(); ctx.translate(x, y); if (st.cfg.rotate !== false) ctx.rotate(Math.PI/2); em(ctx, ch, 0, 0, s); ctx.restore(); };
      st.cars.forEach(c => { ctx.save(); ctx.translate(60+c.lane*120, c.y); if (st.cfg.rotate !== false) ctx.rotate(Math.PI/2); em(ctx, c.ch, 0, 0, 58); ctx.restore(); });
      ctx.save(); ctx.translate(st.x, st.H-90); if (st.cfg.rotate !== false) ctx.rotate(Math.PI/2); em(ctx, st.cfg.player, 0, 0, 62); ctx.restore(); },
  }),

  /* ---- auto-fire shooter ---- */
  shooter: (root, g) => arcade(root, g, 400, 600, "Move with mouse / finger or ←→ — you fire automatically", {
    how: "Blast them before they reach you!",
    reset: st => { st.x = st.W/2; st.shots = []; st.foes = []; st.cd = 0; st.spawn = 0; },
    update: (st, dt) => {
      steer(st, dt, 440);
      if ((st.cd -= dt) <= 0) { st.cd = .22; st.shots.push({x:st.x, y:st.H-90}); }
      if ((st.spawn -= dt) <= 0) { st.spawn = Math.max(.3, .95 - st.t*.015); st.foes.push({x:30+Math.random()*(st.W-60), y:60, ch:pick(st.cfg.enemies), v:60+st.t*3+Math.random()*50, hp: Math.random() < .2 ? 2 : 1, w: Math.random()*6}); }
      st.shots.forEach(s => s.y -= 620*dt); st.shots = st.shots.filter(s => s.y > 40 && !s.used);
      st.foes.forEach(f => { f.y += f.v*dt; f.x += Math.sin(st.t*2 + f.w)*30*dt;
        st.shots.forEach(s => { if (!s.used && hit(s, f, 26)) { s.used = true; if (--f.hp <= 0) { f.dead = true; st.score++; } } });
        if (f.y > st.H-70) st.over(); });
      st.foes = st.foes.filter(f => !f.dead);
    },
    draw: (st, ctx) => { sky(st, ctx, st.cfg.c1 || "#10002b", st.cfg.c2 || "#3c096c");
      ctx.fillStyle = "rgba(255,255,255,.6)"; for (let i=0;i<40;i++) ctx.fillRect((i*97)%st.W, ((i*53 + st.t*40*(1+i%3)) % st.H), 2, 2);
      ctx.fillStyle = st.cfg.shot || "#ffd60a"; st.shots.forEach(s => { ctx.beginPath(); ctx.roundRect(s.x-3, s.y-10, 6, 18, 3); ctx.fill(); });
      st.foes.forEach(f => em(ctx, f.ch, f.x, f.y, f.hp > 1 ? 46 : 38)); em(ctx, st.cfg.player, st.x, st.H-60, 48); },
  }),

  /* ---- flappy-style ---- */
  flap: (root, g) => arcade(root, g, 360, 600, "Tap, click or Space to flap", {
    how: "Tap to flap through the gaps!",
    reset: st => { st.y = st.H/2; st.vy = 0; st.pipes = []; st.next = .6; },
    key: (st, e) => { if (["Space","ArrowUp","KeyW"].includes(e.code)) st.vy = -380; },
    tap: st => { st.vy = -380; },
    update: (st, dt) => {
      st.vy += 1250*dt; st.y += st.vy*dt;
      if ((st.next -= dt) <= 0) { st.next = 1.45; st.pipes.push({x:st.W+30, gap:110+Math.random()*(st.H-320)}); }
      st.pipes.forEach(p => { p.x -= 150*dt; if (!p.done && p.x < 80) { p.done = true; st.score++; }
        if (Math.abs(p.x-90) < 44 && (st.y-16 < p.gap || st.y+16 > p.gap+165)) st.over(); });
      st.pipes = st.pipes.filter(p => p.x > -60);
      if (st.y > st.H-20 || st.y < 10) st.over();
    },
    draw: (st, ctx) => { sky(st, ctx, st.cfg.c1 || "#023047", st.cfg.c2 || "#219ebc");
      if (st.state === "ready") st.y = st.H/2 + Math.sin(performance.now()/300)*10;
      ctx.fillStyle = st.cfg.pipe || "#38b000";
      st.pipes.forEach(p => { ctx.beginPath(); ctx.roundRect(p.x-30, 0, 60, p.gap, 10); ctx.roundRect(p.x-30, p.gap+165, 60, st.H, 10); ctx.fill(); });
      ctx.save(); ctx.translate(90, st.y); ctx.rotate(Math.max(-.4, Math.min(.8, st.vy/700))); if (!st.cfg.noFlip) ctx.scale(-1,1); em(ctx, st.cfg.player, 0, 0, 40); ctx.restore(); },
  }),

  /* ---- stacker: drop the sliding block ---- */
  stack: (root, g) => arcade(root, g, 400, 600, "Tap or Space to drop the block", {
    how: "Drop blocks to build the tallest tower!",
    reset: st => { st.blocks = [{x:100, w:200}]; st.cur = {x:0, w:200, dir:1}; st.cam = 0; st.drops = []; },
    drop: st => {
      const top = st.blocks[st.blocks.length-1], c = st.cur;
      const l = Math.max(top.x, c.x), r = Math.min(top.x+top.w, c.x+c.w);
      if (r - l <= 2) { st.drops.push({x:c.x, w:c.w, y:st.blocks.length, vy:0}); return st.over(); }
      if (c.x < l) st.drops.push({x:c.x, w:l-c.x, y:st.blocks.length, vy:0});
      if (c.x+c.w > r) st.drops.push({x:r, w:c.x+c.w-r, y:st.blocks.length, vy:0});
      st.blocks.push({x:l, w:r-l}); st.score++;
      st.cur = {x: st.blocks.length % 2 ? -(r-l) : st.W, w:r-l, dir: st.blocks.length % 2 ? 1 : -1};
    },
    key: (st, e) => { if (["Space","ArrowDown","Enter"].includes(e.code)) SAMPLE_ENGINES._stackDrop(st); },
    tap: st => SAMPLE_ENGINES._stackDrop(st),
    update: (st, dt) => {
      const c = st.cur, sp = 180 + st.score*12; c.x += c.dir*sp*dt;
      if (c.x > st.W - c.w + 60) c.dir = -1; if (c.x < -60) c.dir = 1;
      st.cam += (Math.max(0, st.blocks.length - 8)*30 - st.cam) * Math.min(1, dt*6);
      st.drops.forEach(d => d.vy += 900*dt);
    },
    draw: (st, ctx) => { sky(st, ctx, st.cfg.c1 || "#ffafcc", st.cfg.c2 || "#a2d2ff");
      const base = st.H - 40 + st.cam, hue = st.cfg.hue || 200;
      const blk = (x, w, i, dy=0) => { ctx.fillStyle = `hsl(${(hue + i*9) % 360},75%,58%)`; ctx.beginPath(); ctx.roundRect(x, base - (i+1)*30 + dy, w, 28, 5); ctx.fill(); };
      st.blocks.forEach((b, i) => blk(b.x, b.w, i));
      st.drops.forEach(d => { d.dy = (d.dy || 0) + d.vy/60; blk(d.x, d.w, d.y, d.dy); });
      if (st.state !== "over") blk(st.cur.x, st.cur.w, st.blocks.length);
      if (st.cfg.top) { const t = st.blocks[st.blocks.length-1]; em(ctx, st.cfg.top, t.x + t.w/2, base - st.blocks.length*30 - 16, 26); } },
  }),
  _stackDrop: st => { if (st.state === "play") {
      const top = st.blocks[st.blocks.length-1], c = st.cur;
      const l = Math.max(top.x, c.x), r = Math.min(top.x+top.w, c.x+c.w);
      if (r - l <= 2) { st.drops.push({x:c.x, w:c.w, y:st.blocks.length, vy:0}); return st.over(); }
      if (c.x < l) st.drops.push({x:c.x, w:l-c.x, y:st.blocks.length, vy:0});
      if (c.x+c.w > r) st.drops.push({x:r, w:c.x+c.w-r, y:st.blocks.length, vy:0});
      st.blocks.push({x:l, w:r-l}); st.score++;
      st.cur = {x: st.blocks.length % 2 ? -(r-l) : st.W, w:r-l, dir: st.blocks.length % 2 ? 1 : -1}; } },

  /* ---- quick math, 30 seconds ---- */
  math: (root, g) => arcade(root, g, 400, 560, "Tap the right answer or press 1 / 2 / 3", {
    how: "Answer as many as you can in 30 seconds!",
    unit: st => `Score ${st.score|0} · ${Math.max(0, Math.ceil(30-st.t))}s`,
    reset: st => { st.flash = 0; SAMPLE_ENGINES._mathQ(st); },
    answer: null,
    key: (st, e) => { const i = ["Digit1","Digit2","Digit3"].indexOf(e.code); if (i >= 0) SAMPLE_ENGINES._mathA(st, i); },
    tap: (st, p) => { for (let i=0;i<3;i++) if (p.y > 300+i*80 && p.y < 370+i*80) SAMPLE_ENGINES._mathA(st, i); },
    update: (st, dt) => { if (st.t >= 30) st.over(); st.flash = Math.max(0, st.flash - dt); },
    draw: (st, ctx) => { sky(st, ctx, st.cfg.c1 || "#ffd6a5", st.cfg.c2 || "#f28482");
      if (st.flash > 0) { ctx.fillStyle = st.ok ? "rgba(80,255,140,.35)" : "rgba(255,60,80,.35)"; ctx.fillRect(0,0,st.W,st.H); }
      st.k.text(st.q.text, st.W/2, 190, 56, "#fff");
      st.q.opts.forEach((o, i) => { ctx.fillStyle = "rgba(255,255,255,.92)"; ctx.beginPath(); ctx.roundRect(50, 300+i*80, 300, 66, 16); ctx.fill();
        st.k.text(`${i+1}.  ${o}`, st.W/2, 334+i*80, 30, "#3d2c5e"); }); },
    overText: () => "Time's up!",
  }),
  _mathQ: st => {
    const ops = st.cfg.ops || ["+"], op = pick(ops), m = st.cfg.max || 10;
    let a = 1 + Math.random()*m | 0, b = 1 + Math.random()*m | 0, ans;
    if (op === "+") ans = a + b; else if (op === "−") { if (b > a) [a, b] = [b, a]; ans = a - b; } else if (op === "×") { a = 1 + Math.random()*Math.min(m,12) | 0; b = 1 + Math.random()*Math.min(m,12) | 0; ans = a*b; }
    else { b = 1 + Math.random()*9 | 0; ans = 1 + Math.random()*9 | 0; a = ans*b; }
    const opts = new Set([ans]); while (opts.size < 3) opts.add(Math.max(0, ans + (Math.random()*10 | 0) - 5));
    st.q = {text:`${a} ${op} ${b} = ?`, ans, opts:[...opts].sort(() => Math.random() - .5)};
  },
  _mathA: (st, i) => { if (st.state !== "play") return; st.ok = st.q.opts[i] === st.q.ans; st.flash = .25;
    if (st.ok) st.score++; else st.t += 2; SAMPLE_ENGINES._mathQ(st); },

  /* ---- simon-style memory sequence ---- */
  simon: (root, g) => arcade(root, g, 400, 520, "Watch the pattern, then repeat it", {
    how: "Watch the pattern, then repeat it!",
    unit: st => `Round ${st.seq ? st.seq.length : 0}`,
    reset: st => { st.seq = [Math.random()*4|0]; st.i = 0; st.show = 0; st.mode = "show"; st.lit = -1; st.timer = .6; },
    key: (st, e) => { const i = ["Digit1","Digit2","Digit3","Digit4"].indexOf(e.code); if (i >= 0) SAMPLE_ENGINES._simonPress(st, i); },
    tap: (st, p) => { for (let i=0;i<4;i++){ const x = 30+(i%2)*180, y = 80+(i/2|0)*210; if (p.x > x && p.x < x+160 && p.y > y && p.y < y+190) SAMPLE_ENGINES._simonPress(st, i); } },
    update: (st, dt) => {
      st.timer -= dt;
      if (st.mode === "show" && st.timer <= 0) {
        if (st.lit >= 0) { st.lit = -1; st.timer = .18; }
        else if (st.show < st.seq.length) { st.lit = st.seq[st.show++]; st.timer = Math.max(.25, .55 - st.seq.length*.02); }
        else { st.mode = "input"; st.i = 0; } }
      if (st.mode === "input" && st.lit >= 0 && st.timer <= 0) st.lit = -1;
    },
    draw: (st, ctx) => { sky(st, ctx, "#22223b", "#4a4e69");
      const cols = st.cfg.colors || ["#ff595e","#1982c4","#8ac926","#ffca3a"];
      for (let i=0;i<4;i++){ const x = 30+(i%2)*180, y = 80+(i/2|0)*210, on = st.lit === i;
        ctx.globalAlpha = on ? 1 : .45; ctx.fillStyle = cols[i]; ctx.beginPath(); ctx.roundRect(x, y, 160, 190, 22); ctx.fill(); ctx.globalAlpha = 1;
        em(ctx, st.cfg.pads[i], x+80, y+95, on ? 92 : 72); }
      if (st.state === "play") st.k.text(st.mode === "show" ? "Watch…" : "Your turn!", st.W/2, 500, 20, "#fff", 600); },
  }),
  _simonPress: (st, i) => { if (st.state !== "play" || st.mode !== "input") return;
    st.lit = i; st.timer = .2;
    if (st.seq[st.i] !== i) return st.over();
    if (++st.i === st.seq.length) { st.score = st.seq.length; st.seq.push(Math.random()*4|0); st.mode = "show"; st.show = 0; st.timer = .7; } },

  /* ---- Drive a Tesla: top-down electric-car driving ---- */
  ev: (root, g) => arcade(root, g, 400, 640, "Steer ←→ or drag · ↑ boost · ↓ brake · grab ⚡ to recharge", {
    how: "Drive, dodge traffic, and keep your battery charged!",
    unit: st => `${(st.score/10).toFixed(1)} km`,
    reset: st => { st.x = 200; st.speed = 220; st.batt = 100; st.road = 0; st.traffic = []; st.charges = []; st.spawn = 1; st.cspawn = 3; },
    update: (st, dt) => {
      const target = st.keys.ArrowUp || st.keys.KeyW ? 520 : st.keys.ArrowDown || st.keys.KeyS ? 140 : 300 + Math.min(160, st.t*4);
      st.speed += (target - st.speed) * Math.min(1, dt*1.6);
      steer(st, dt, 300); st.x = Math.max(70, Math.min(330, st.x));
      st.road += st.speed*dt; st.score += st.speed*dt/100;
      st.batt -= dt * (2.2 + st.speed/260); if (st.batt <= 0) { st.batt = 0; st.over(); }
      if ((st.spawn -= dt) <= 0) { st.spawn = Math.max(.45, 1.3 - st.t*.012);
        st.traffic.push({x: 90 + (Math.random()*4|0)*73, y:-60, v: 120 + Math.random()*80, hue: Math.random()*360}); }
      if ((st.cspawn -= dt) <= 0) { st.cspawn = 2.5 + Math.random()*2; st.charges.push({x: 90 + (Math.random()*4|0)*73, y:-40}); }
      st.traffic.forEach(c => { c.y += (st.speed - c.v)*dt; if (Math.abs(c.x - st.x) < 38 && Math.abs(c.y - (st.H-110)) < 70) st.over(); });
      st.charges.forEach(c => { c.y += st.speed*dt; if (!c.got && Math.abs(c.x - st.x) < 40 && Math.abs(c.y - (st.H-110)) < 50) { c.got = true; st.batt = Math.min(100, st.batt + 35); } });
      st.traffic = st.traffic.filter(c => c.y < st.H+100 && c.y > -200);
      st.charges = st.charges.filter(c => !c.got && c.y < st.H+60);
    },
    draw: (st, ctx) => {
      ctx.fillStyle = "#5a8f3d"; ctx.fillRect(0,0,st.W,st.H);
      ctx.fillStyle = "#3b3f4a"; ctx.fillRect(50,0,300,st.H);
      ctx.fillStyle = "#fff"; ctx.fillRect(54,0,4,st.H); ctx.fillRect(342,0,4,st.H);
      ctx.fillStyle = "rgba(255,255,255,.7)";
      for (let l=1;l<4;l++) for (let y = (st.road % 70) - 70; y < st.H; y += 70) ctx.fillRect(50 + l*75 - 2, y, 4, 36);
      ctx.font = "26px serif"; for (let y = (st.road*1 % 160) - 160; y < st.H; y += 160) { em(ctx, "🌳", 24, y, 30); em(ctx, "🌲", 376, y + 80, 30); }
      st.charges.forEach(c => { ctx.fillStyle = "rgba(255,230,0,.25)"; ctx.beginPath(); ctx.arc(c.x, c.y, 26, 0, 7); ctx.fill(); em(ctx, "⚡", c.x, c.y, 34); });
      const car = (x, y, body, glass, sleek) => {
        ctx.fillStyle = "rgba(0,0,0,.3)"; ctx.beginPath(); ctx.roundRect(x-24, y-46, 52, 96, 18); ctx.fill();
        ctx.fillStyle = body; ctx.beginPath(); ctx.roundRect(x-26, y-50, 52, 100, sleek ? 22 : 12); ctx.fill();
        ctx.fillStyle = glass; ctx.beginPath(); ctx.roundRect(x-19, y-22, 38, 48, 12); ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,.35)"; ctx.fillRect(x-14, y-18, 6, 40);
        ctx.fillStyle = sleek ? "#cfe8ff" : "#ffe9a8"; ctx.fillRect(x-22, y-50, 12, 4); ctx.fillRect(x+10, y-50, 12, 4);
        ctx.fillStyle = "#e63946"; ctx.fillRect(x-22, y+46, 44, 3); };
      st.traffic.forEach(c => car(c.x, c.y, `hsl(${c.hue},60%,50%)`, "#223", false));
      car(st.x, st.H-110, "#f4f6f8", "#1b2430", true);
      // battery + speed HUD
      const bx = st.W/2 - 60; ctx.fillStyle = "rgba(0,0,0,.5)"; ctx.beginPath(); ctx.roundRect(bx, 58, 120, 24, 6); ctx.fill();
      ctx.fillStyle = st.batt > 30 ? "#57cc99" : st.batt > 15 ? "#ffd60a" : "#ff4d6d"; ctx.beginPath(); ctx.roundRect(bx+3, 61, 114*st.batt/100, 18, 4); ctx.fill();
      st.k.text(`🔋 ${st.batt|0}%`, st.W/2, 70, 13, "#fff", 700);
      st.k.text(`${Math.round(st.speed/4)} km/h`, st.W-14, 70, 14, "#fff", 600, "right"); },
    overText: st => st.batt <= 0 ? "Battery empty!" : "Crash!",
  }),
};

/* ---------- catalog of sample games ---------- */
const SAMPLE_GAMES = (() => {
  const L = [];
  const add = (engine, cat, list) => list.forEach(([name, emoji, cfg]) => L.push({name, emoji, cat, play:engine, cfg, sample:true}));
  add("catch", "casual", [
    ["Fruit Basket", "🧺", {player:"🧺", good:["🍎","🍌","🍇","🍓","🍑"], bad:["💣"]}],
    ["Candy Catcher", "🍬", {player:"🧺", good:["🍬","🍭","🍫","🧁"], bad:["🦷"], c1:"#ffc8dd", c2:"#cdb4db"}],
    ["Egg Catch", "🥚", {player:"🧺", good:["🥚"], bad:["🪨"], c1:"#fefae0", c2:"#e9c46a"}],
    ["Star Collector", "⭐", {player:"🛸", good:["⭐","🌟","✨"], bad:["☄️"], c1:"#03045e", c2:"#7209b7"}],
    ["Coin Catcher", "💰", {player:"💰", good:["🪙","💎"], bad:["💀"], c1:"#ffe066", c2:"#f08c00"}],
    ["Snowflake Catch", "⛄", {player:"⛄", good:["❄️"], bad:["🔥"], c1:"#e0fbfc", c2:"#98c1d9"}],
    ["Fish Feast", "🐱", {player:"🐱", good:["🐟","🐠"], bad:["🦀"], c1:"#90e0ef", c2:"#0077b6"}],
  ]);
  add("arcade", "arcade", []);
  add("dodge", "arcade", [
    ["Meteor Dodge", "☄️", {player:"🚀", hazards:["☄️","🪨"]}],
    ["Rainy Day", "🌧️", {player:"🐈", hazards:["💧"], c1:"#5c677d", c2:"#979dac"}],
    ["Bee Swarm", "🐝", {player:"🧸", hazards:["🐝"], c1:"#b5e48c", c2:"#52b69a"}],
    ["Sword Rain", "🗡️", {player:"🛡️", hazards:["🗡️"], c1:"#6c757d", c2:"#343a40"}],
    ["Snowball Storm", "⚪", {player:"🧒", hazards:["⚪","❄️"], c1:"#caf0f8", c2:"#48cae4"}],
    ["Lava Drops", "🌋", {player:"🦎", hazards:["🔥"], c1:"#370617", c2:"#d00000"}],
    ["Pumpkin Fall", "🎃", {player:"👻", hazards:["🎃"], c1:"#240046", c2:"#ff6d00"}],
  ]);
  add("runner", "arcade", [
    ["Dino Jump", "🦖", {player:"🦖", obstacles:["🌵"], c1:"#fefae0", c2:"#e9c46a", ground:"#bc6c25"}],
    ["Cat Run", "🐈", {player:"🐈", obstacles:["📦","🪴"]}],
    ["Ninja Run", "🥷", {player:"🥷", obstacles:["🪨","🔥"], c1:"#ffb4a2", c2:"#6d597a", ground:"#3d405b"}],
    ["Bunny Dash", "🐇", {player:"🐇", obstacles:["🍄","🪵"], c1:"#d8f3dc", c2:"#95d5b2"}],
    ["Robot Run", "🤖", {player:"🤖", obstacles:["⚙️","🔩"], c1:"#adb5bd", c2:"#495057", ground:"#212529", noFlip:true}],
    ["Skate Jump", "🛹", {player:"🛹", obstacles:["🚧","🛢️"], c1:"#ffd6ff", c2:"#bbd0ff", ground:"#6c757d"}],
    ["Horse Gallop", "🐎", {player:"🐎", obstacles:["🪵","🌾"], c1:"#ffe5d9", c2:"#ffb703"}],
  ]);
  add("whack", "casual", [
    ["Mole Bonk", "🐹", {good:["🐹"], bad:["💣"]}],
    ["Bug Squash", "🐛", {good:["🐛","🐜","🪲"], bad:["🦋"], c1:"#b7e4c7", c2:"#40916c"}],
    ["Ghost Tap", "👻", {good:["👻"], bad:["😇"], c1:"#3c096c", c2:"#10002b"}],
    ["Balloon Pop", "🎈", {good:["🎈"], bad:["💣"], c1:"#a2d2ff", c2:"#bde0fe"}],
    ["Alien Zap", "👾", {good:["👾","👽"], bad:["👨‍🚀"], c1:"#03071e", c2:"#370617"}],
    ["Fly Swat", "🪰", {good:["🪰","🦟"], bad:["🐞"], c1:"#fefae0", c2:"#ccd5ae"}],
    ["Monster Bop", "👹", {good:["👹","👺"], bad:["🐶"], c1:"#ffbe0b", c2:"#fb5607"}],
  ]);
  add("racer", "racing", [
    ["Highway Rush", "🚗", {player:"🚗", obstacles:["🚙","🚕","🚐"]}],
    ["Taxi Dash", "🚕", {player:"🚕", obstacles:["🚗","🚌","🚙"]}],
    ["Police Chase", "🚓", {player:"🚓", obstacles:["🚗","🚙","🛻"], road:"#22223b"}],
    ["Bike Lanes", "🚲", {player:"🚲", obstacles:["🛴","🛵","🚶"], road:"#6a994e", lines:"rgba(255,255,255,.4)", rotate:false}],
    ["Space Lanes", "🚀", {player:"🚀", obstacles:["🪐","☄️","🛰️"], road:"#10002b", lines:"rgba(180,140,255,.4)", rotate:false}],
    ["Fish Lanes", "🐟", {player:"🐟", obstacles:["🦈","🐙","🪼"], road:"#0077b6", lines:"rgba(255,255,255,.25)", rotate:false}],
  ]);
  add("shooter", "action", [
    ["Space Defender", "👾", {player:"🚀", enemies:["👾","👽"]}],
    ["Bug Blaster", "🐛", {player:"🛸", enemies:["🐛","🪲","🕷️"], c1:"#1b4332", c2:"#081c15"}],
    ["Ghost Buster", "🔦", {player:"🔦", enemies:["👻"], c1:"#240046", c2:"#000"}],
    ["Zombie Defense", "🧟", {player:"🧑‍🌾", enemies:["🧟"], c1:"#3a5a40", c2:"#1b1b1b", shot:"#ff4d6d"}],
    ["Storm Stopper", "🌩️", {player:"🌈", enemies:["🌧️","🌩️"], c1:"#5c677d", c2:"#33415c", shot:"#fff"}],
    ["Asteroid Shot", "🛰️", {player:"🛰️", enemies:["☄️","🪨"]}],
    ["Robot Rumble", "🤖", {player:"🦾", enemies:["🤖"], c1:"#495057", c2:"#212529", shot:"#4cc9f0"}],
  ]);
  add("flap", "arcade", [
    ["Bat Flap", "🦇", {player:"🦇", c1:"#10002b", c2:"#5a189a", pipe:"#7b2cbf", noFlip:true}],
    ["Bee Flap", "🐝", {player:"🐝", c1:"#caffbf", c2:"#9bf6ff", pipe:"#e9c46a"}],
    ["Rocket Flap", "🚀", {player:"🚀", c1:"#000814", c2:"#003566", pipe:"#adb5bd", noFlip:true}],
    ["Fishy Flap", "🐠", {player:"🐠", c1:"#48cae4", c2:"#023e8a", pipe:"#f4a261"}],
    ["Dragon Flap", "🐉", {player:"🐉", c1:"#ffb4a2", c2:"#9d0208", pipe:"#370617"}],
    ["Owl Night", "🦉", {player:"🦉", c1:"#03045e", c2:"#0077b6", pipe:"#2d6a4f", noFlip:true}],
  ]);
  add("stack", "puzzle", [
    ["Tower Stack", "🏗️", {hue:200}],
    ["Cake Stack", "🎂", {hue:330, top:"🍒", c1:"#fff0f3", c2:"#ffccd5"}],
    ["Block Tower", "🧱", {hue:15, c1:"#ffe8d6", c2:"#ddbea9"}],
    ["Neon Stack", "💡", {hue:280, c1:"#10002b", c2:"#3c096c"}],
    ["Pancake Pile", "🥞", {hue:35, top:"🧈", c1:"#fefae0", c2:"#faedcd"}],
    ["Sky Scraper", "🏙️", {hue:190, c1:"#caf0f8", c2:"#0096c7", top:"🚩"}],
  ]);
  add("math", "puzzle", [
    ["Plus Sprint", "➕", {ops:["+"], max:10}],
    ["Minus Mania", "➖", {ops:["−"], max:20, c1:"#bde0fe", c2:"#a2d2ff"}],
    ["Times Table", "✖️", {ops:["×"], max:10, c1:"#caffbf", c2:"#52b69a"}],
    ["Divide Dash", "➗", {ops:["÷"], c1:"#ffc6ff", c2:"#bdb2ff"}],
    ["Mix Math", "🧮", {ops:["+","−","×"], max:12, c1:"#ffd166", c2:"#ef476f"}],
    ["Number Ninja", "🥷", {ops:["+","−"], max:50, c1:"#adb5bd", c2:"#343a40"}],
  ]);
  add("simon", "puzzle", [
    ["Color Echo", "🔴", {pads:["🔴","🔵","🟢","🟡"]}],
    ["Animal Echo", "🐶", {pads:["🐶","🐱","🐮","🐷"]}],
    ["Fruit Memory", "🍎", {pads:["🍎","🫐","🍏","🍋"]}],
    ["Music Pads", "🥁", {pads:["🥁","🎸","🎹","🎺"]}],
    ["Space Echo", "🪐", {pads:["🪐","🌙","🌍","☀️"]}],
    ["Face Echo", "😀", {pads:["😡","😎","🤢","😱"]}],
    ["Weather Echo", "⛅", {pads:["🌹","🌊","🌿","⚡"]}],
  ]);
  // tile colours: spread hues across the grid
  L.forEach((g, i) => { const h = (i * 47) % 360; g.c1 = `hsl(${h},85%,72%)`; g.c2 = `hsl(${(h+40)%360},70%,45%)`; g.size = "s"; });
  L.unshift({name:"Drive a Tesla", emoji:"🚘", c1:"#e9ecef", c2:"#495057", size:"m", cat:"racing", play:"ev", badge:"new", sample:true});
  return L;
})();
