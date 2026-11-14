/* =====================================================================
   unimai sample games – real 3D (Three.js r128, loaded on demand).
   10 game engines + Drive a Tesla. Each catalog entry at the bottom
   uses  play:"<engine>"  and  cfg:{...}  for its theme.
   ===================================================================== */

const THREE_URL = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
let threeP = null;
const loadThree = () => window.THREE ? Promise.resolve() : (threeP = threeP || new Promise((res, rej) => {
  const s = document.createElement("script"); s.src = THREE_URL; s.onload = res; s.onerror = () => { threeP = null; rej(); }; document.head.appendChild(s); }));

(() => { const css = document.createElement("style"); css.textContent = `
.g3d{position:relative;border-radius:16px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,.4);background:#0b1626;max-height:100%}
.g3d canvas{display:block;width:100%;height:100%;touch-action:none}
.g3d-hud{position:absolute;left:0;right:0;top:0;display:flex;justify-content:space-between;align-items:center;gap:8px;padding:10px 14px;
  background:linear-gradient(rgba(0,0,0,.45),transparent);color:#fff;font-weight:700;font-size:17px;pointer-events:none;text-shadow:0 2px 3px rgba(0,0,0,.5)}
.g3d-hud .c{font-size:14px;font-weight:600}.g3d-hud .r{color:#ffe8a3;font-weight:600}
.g3d-banner{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;text-align:center;padding:20px;
  background:rgba(8,20,40,.55);color:#fff;pointer-events:none}
.g3d-banner b{font-size:clamp(26px,6vw,40px)}.g3d-banner small{font-size:16px;color:#cfe3ff;font-weight:500}
.g3d-banner[hidden]{display:none}
.g3d-load{position:absolute;inset:0;display:grid;place-items:center;color:#cfe3ff;font-size:18px}`;
  document.head.appendChild(css); })();

const pick = a => a[Math.random() * a.length | 0];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/* ---------- small Three.js helpers (created lazily once THREE exists) ---------- */
const H3 = {
  mats:{}, tex:{}, smats:{},
  mat(c, o = {}) { const k = c + JSON.stringify(o); return this.mats[k] || (this.mats[k] = new THREE.MeshStandardMaterial(Object.assign({color:c, roughness:.55, metalness:.05}, o))); },
  box(w, h, d, c, o) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), this.mat(c, o)); m.castShadow = m.receiveShadow = true; return m; },
  cyl(rt, rb, h, c, seg = 20, o) { const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), this.mat(c, o)); m.castShadow = m.receiveShadow = true; return m; },
  plane(w, d, c) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), this.mat(c, {roughness:.9})); m.rotation.x = -Math.PI/2; m.receiveShadow = true; return m; },
  blob(r) { const m = new THREE.Mesh(new THREE.CircleGeometry(r, 24), new THREE.MeshBasicMaterial({color:0, transparent:true, opacity:.28, depthWrite:false})); m.rotation.x = -Math.PI/2; m.position.y = .02; return m; },
  emojiTex(ch) { if (this.tex[ch]) return this.tex[ch];
    const c = document.createElement("canvas"); c.width = c.height = 128; const x = c.getContext("2d");
    x.font = '100px "Noto Color Emoji","Apple Color Emoji","Segoe UI Emoji",serif'; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText(ch, 64, 70);
    const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; return this.tex[ch] = t; },
  sprite(ch, size) { const m = this.smats[ch] || (this.smats[ch] = new THREE.SpriteMaterial({map:this.emojiTex(ch), transparent:true}));
    const s = new THREE.Sprite(m); s.scale.set(size, size, 1); return s; },
  textTex(str, bg = "#fff", fg = "#3d2c5e", w = 256, h = 128, size = 64) {
    const c = document.createElement("canvas"); c.width = w; c.height = h; const x = c.getContext("2d");
    if (bg) { x.fillStyle = bg; x.beginPath(); x.roundRect(4, 4, w-8, h-8, 24); x.fill(); }
    x.fillStyle = fg; x.font = `700 ${size}px Fredoka, system-ui, sans-serif`; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText(str, w/2, h/2 + 4);
    const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; return t; },
  textSprite(str, scale = 4, fg = "#fff") { const t = this.textTex(str, null, fg, 512, 128, 84);
    const s = new THREE.Sprite(new THREE.SpriteMaterial({map:t, transparent:true, depthTest:false})); s.scale.set(scale, scale/4, 1); s.renderOrder = 10; return s; },
  car(color, sleek) {
    const g = new THREE.Group();
    const body = this.box(2, .7, 4.2, color, sleek ? {metalness:.3, roughness:.3} : {}); body.position.y = .65; g.add(body);
    const cab = this.box(1.7, .62, sleek ? 2.5 : 2, sleek ? 0x16202c : 0x26323f, {metalness:.6, roughness:.15}); cab.position.set(0, 1.3, sleek ? -.05 : .25); g.add(cab);
    if (sleek) { const nose = this.box(1.9, .35, .8, color, {metalness:.3, roughness:.3}); nose.position.set(0, .55, -2.3); g.add(nose); }
    const wg = new THREE.CylinderGeometry(.42, .42, .36, 18);
    for (const [x, z] of [[-1, -1.35], [1, -1.35], [-1, 1.35], [1, 1.35]]) { const w = new THREE.Mesh(wg, this.mat(0x111111)); w.rotation.z = Math.PI/2; w.position.set(x, .42, z); w.castShadow = true; g.add(w); }
    const hl = new THREE.Mesh(new THREE.BoxGeometry(1.6, .1, .06), new THREE.MeshBasicMaterial({color: sleek ? 0xd6ecff : 0xfff2b0})); hl.position.set(0, .82, sleek ? -2.72 : -2.12); g.add(hl);
    const tl = new THREE.Mesh(new THREE.BoxGeometry(1.7, .12, .06), new THREE.MeshBasicMaterial({color:0xff3344})); tl.position.set(0, .85, 2.12); g.add(tl);
    return g; },
  modelYL() { // long 3-row electric crossover, pearl white — smooth extruded profile
    const g = new THREE.Group(), W = 0xf3f4f6;
    const paint = this.mat(W, {metalness:.45, roughness:.22}), glass = this.mat(0x0d131b, {metalness:.85, roughness:.06}),
      black = this.mat(0x1a1c20, {roughness:.7}), rimM = this.mat(0xb7bec6, {metalness:.9, roughness:.25});
    const ext = (shape, width, bev, mat) => { const geo = new THREE.ExtrudeGeometry(shape, {depth:width - 2*bev, bevelEnabled:true, bevelThickness:bev, bevelSize:bev*.8, bevelSegments:4, curveSegments:18});
      geo.translate(0, 0, -(width - 2*bev)/2); const m = new THREE.Mesh(geo, mat); m.rotation.y = Math.PI/2; m.castShadow = m.receiveShadow = true; return m; };
    const WF = 1.68, WR = -1.78, WY = .46, AR = .58; // wheel positions (front is +u → -z)
    const b = new THREE.Shape(); b.moveTo(-2.58, .36); b.lineTo(WR - AR, .36); b.lineTo(WR - AR, WY); b.absarc(WR, WY, AR, Math.PI, 0, true); b.lineTo(WR + AR, .3);
    b.lineTo(WF - AR, .3); b.lineTo(WF - AR, WY); b.absarc(WF, WY, AR, Math.PI, 0, true); b.lineTo(WF + AR, .34);
    b.lineTo(2.55, .38); b.quadraticCurveTo(2.74, .52, 2.7, .82); b.quadraticCurveTo(2.62, .98, 2.25, 1.02); b.quadraticCurveTo(1.7, 1.08, 1.25, 1.14);
    b.lineTo(-2.3, 1.16); b.quadraticCurveTo(-2.62, 1.12, -2.64, .9); b.lineTo(-2.62, .5); b.quadraticCurveTo(-2.62, .38, -2.58, .36);
    g.add(ext(b, 2.02, .16, paint));
    const c = new THREE.Shape(); c.moveTo(1.3, 1.08); c.quadraticCurveTo(.55, 1.55, .05, 1.74); c.quadraticCurveTo(-.9, 1.82, -1.75, 1.74);
    c.quadraticCurveTo(-2.25, 1.6, -2.42, 1.1); c.lineTo(1.3, 1.08);
    g.add(ext(c, 1.72, .14, glass));
    const pil = this.box(.08, .5, .1, W, {metalness:.45, roughness:.22}); // B/C pillars in body colour
    for (const z of [.35, 1.35]) for (const x of [-.86, .86]) { const q = pil.clone(); q.position.set(x, 1.42, z); g.add(q); }
    const clad = new THREE.Mesh(new THREE.BoxGeometry(2.06, .16, 2.1), black); clad.position.set(0, .38, .05); g.add(clad);
    const fb = new THREE.Mesh(new THREE.BoxGeometry(1.7, .16, .1), black); fb.position.set(0, .45, -2.7); g.add(fb);
    for (const x of [-1, 1]) { // headlights, mirrors
      const hl = new THREE.Mesh(new THREE.BoxGeometry(.5, .07, .06), new THREE.MeshBasicMaterial({color:0xeaf6ff})); hl.position.set(x*.66, .86, -2.69); hl.rotation.y = x*.25; g.add(hl);
      const mr = new THREE.Mesh(new THREE.BoxGeometry(.22, .14, .3), black); mr.position.set(x*1.1, 1.2, -1.0); g.add(mr); }
    const tl = new THREE.Mesh(new THREE.BoxGeometry(1.9, .07, .05), new THREE.MeshBasicMaterial({color:0xff1f33})); tl.position.set(0, 1.0, 2.66); g.add(tl);
    const tg = new THREE.CylinderGeometry(.46, .46, .3, 26), rg = new THREE.CylinderGeometry(.33, .33, .32, 5), hg = new THREE.CylinderGeometry(.09, .09, .34, 10);
    for (const [x, z] of [[-.96, -WF], [.96, -WF], [-.96, -WR], [.96, -WR]]) {
      const w = new THREE.Group(); w.add(new THREE.Mesh(tg, black), new THREE.Mesh(rg, rimM), new THREE.Mesh(hg, black));
      w.children.forEach(m => m.castShadow = true); w.rotation.z = Math.PI/2; w.position.set(x, WY, z); g.add(w); }
    const sh = this.blob(2.4); sh.scale.set(.62, 1.22, 1); g.add(sh);
    return g; },
  tree() { const g = new THREE.Group(); const t = this.cyl(.18, .25, 1.2, 0x6b4226, 8); t.position.y = .6; g.add(t);
    const c = new THREE.Mesh(new THREE.ConeGeometry(1.1, 2.6, 9), this.mat(0x2d8a3e)); c.position.y = 2.3; c.castShadow = true; g.add(c); return g; },
};

/* ---------- shared 3D game shell ---------- */
function arcade3d(root, g, aspect, hint, def){
  const wrap = document.createElement("div"); wrap.className = "g3d";
  wrap.style.width = `min(100%, calc((100dvh - 130px) * ${aspect}))`; wrap.style.aspectRatio = aspect;
  wrap.innerHTML = `<div class="g3d-hud"><span class="l"></span><span class="c"></span><span class="r"></span></div>
    <div class="g3d-banner"><b></b><small></small></div><div class="g3d-load">Loading 3D…</div>`;
  root.appendChild(wrap);
  if (hint) root.insertAdjacentHTML("beforeend", `<div class="hint">${hint}</div>`);
  let alive = true, raf = 0, renderer = null; const offs = [];
  const on = (t, ev, f, o) => { t.addEventListener(ev, f, o); offs.push(() => t.removeEventListener(ev, f, o)); };
  const cleanup = () => { alive = false; cancelAnimationFrame(raf); offs.forEach(f => f()); if (renderer) { renderer.dispose(); renderer.forceContextLoss && renderer.forceContextLoss(); } };
  loadThree().then(() => alive && boot()).catch(() => { wrap.querySelector(".g3d-load").textContent = "Couldn't load the 3D engine — check your connection."; });

  function boot(){
    wrap.querySelector(".g3d-load").remove();
    renderer = new THREE.WebGLRenderer({antialias:true});
    renderer.setPixelRatio(Math.min(2, devicePixelRatio || 1));
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; renderer.outputEncoding = THREE.sRGBEncoding;
    wrap.prepend(renderer.domElement);
    const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(55, aspect, .1, 500);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x556677, .62));
    const sun = new THREE.DirectionalLight(0xffffff, .75); sun.position.set(8, 20, 10); sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024); Object.assign(sun.shadow.camera, {left:-30, right:30, top:30, bottom:-30, far:100});
    scene.add(sun, sun.target);
    const resize = () => { const w = wrap.clientWidth, h = wrap.clientHeight; if (!w || !h) return; renderer.setSize(w, h, false); cam.aspect = w/h; cam.updateProjectionMatrix(); };
    resize(); on(window, "resize", resize);

    const key = "s:" + g.slug, cfg = g.cfg || {};
    const st = {state:"ready", score:0, best:store.get(key), keys:{}, nx:0, ny:0, wx:0, t:0, x:0, cfg, scene, cam, sun, canvas:renderer.domElement, g};
    const ray = new THREE.Raycaster(), plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), hitP = new THREE.Vector3();
    const ndc = e => { const r = renderer.domElement.getBoundingClientRect(); return {x:((e.clientX-r.left)/r.width)*2-1, y:-((e.clientY-r.top)/r.height)*2+1}; };
    const track = p => { st.nx = p.x; st.ny = p.y; plane.constant = -(def.planeY || 0); ray.setFromCamera(p, cam); if (ray.ray.intersectPlane(plane, hitP)) st.wx = hitP.x; st.moved = true; };
    st.over = () => { if (st.state !== "play") return; st.state = "over"; st.cool = .6; if ((st.score|0) > st.best) store.set(key, st.best = st.score|0); };
    st.steer = (dt, range, speed) => {
      if (st.keys.ArrowLeft || st.keys.KeyA) { st.x -= speed*dt; st.moved = false; }
      else if (st.keys.ArrowRight || st.keys.KeyD) { st.x += speed*dt; st.moved = false; }
      else if (st.moved) st.x += (st.wx - st.x) * Math.min(1, dt*12);
      st.x = clamp(st.x, -range, range); };
    st.pick = (p, list, posFn, maxPx = 70) => { const r = renderer.domElement.getBoundingClientRect(); let best = -1, bd = 1e9;
      list.forEach((o, i) => { const v = posFn(o).clone().project(cam); const d = Math.hypot((v.x-p.x)*r.width/2, (v.y-p.y)*r.height/2); if (d < bd) { bd = d; best = i; } });
      return bd < maxPx * r.width/400 ? best : -1; };
    const fresh = () => { if (st.group) scene.remove(st.group); st.group = new THREE.Group(); scene.add(st.group); st.score = 0; st.t = 0; st.x = 0; def.reset(st); };
    const start = () => { fresh(); st.state = "play"; };
    def.setup(st); fresh();

    on(window, "keydown", e => { st.keys[e.code] = true;
      if (st.state !== "play") { if (["Space","Enter","ArrowUp"].includes(e.code) && !(st.cool > 0)) start(); return; }
      def.key && def.key(st, e); });
    on(window, "keyup", e => { st.keys[e.code] = false; });
    on(renderer.domElement, "pointerdown", e => { const p = ndc(e); track(p);
      if (st.state !== "play") { if (!(st.cool > 0)) start(); return; }
      def.tap && def.tap(st, p); });
    on(renderer.domElement, "pointermove", e => track(ndc(e)));

    const hl = wrap.querySelector(".l"), hc = wrap.querySelector(".c"), hr = wrap.querySelector(".r"), ban = wrap.querySelector(".g3d-banner");
    let last = performance.now(), lastBan = "";
    const step = now => { if (!alive) return;
      const dt = Math.min(.05, (now - last)/1000); last = now; if (st.cool > 0) st.cool -= dt;
      if (st.state === "play") { st.t += dt; def.update(st, dt); } else if (def.idle) def.idle(st, dt);
      renderer.render(scene, cam);
      hl.textContent = def.unit ? def.unit(st) : `Score ${st.score|0}`; hc.textContent = def.hud ? def.hud(st) : ""; hr.textContent = `Best ${st.best|0}`;
      const bt = st.state === "ready" ? [g.name, def.how || "Tap or press Space to start"] : st.state === "over" ? [def.overText ? def.overText(st) : "Game Over", `Score ${st.score|0} · tap to play again`] : null;
      const bk = bt ? bt.join("|") : "";
      if (bk !== lastBan) { lastBan = bk; ban.hidden = !bt; if (bt) { ban.querySelector("b").textContent = bt[0]; ban.querySelector("small").textContent = bt[1]; } }
      raf = requestAnimationFrame(step); };
    raf = requestAnimationFrame(step);
  }
  return cleanup;
}

const sky = (st, top, fogFar = 120) => { st.scene.background = new THREE.Color(top); st.scene.fog = new THREE.Fog(top, fogFar*.45, fogFar); };

/* ---------- falling-objects arena (catch + dodge) ---------- */
const fallArena = (mode) => ({
  how: mode === "catch" ? "Catch the goodies, dodge the bad ones!" : "Dodge everything that falls!",
  setup: st => { const c = st.cfg;
    sky(st, c.c1 || (mode === "catch" ? "#bde0fe" : "#1d2d50"), 90);
    const floor = H3.plane(40, 30, c.c2 || (mode === "catch" ? "#ffc8dd" : "#3a0ca3")); st.scene.add(floor);
    const wall = H3.box(40, 22, 1, c.c2 || "#3a0ca3"); wall.position.set(0, 11, -9); wall.material = H3.mat(new THREE.Color(c.c2 || "#3a0ca3").multiplyScalar(.75).getHex()); st.scene.add(wall);
    for (const x of [-10, 10]) { const p = H3.box(1.2, 3 + Math.random()*3, 1.2, 0xffffff); p.position.set(x, 1.5, -4); st.scene.add(p); }
    st.cam.position.set(0, 10, 19); st.cam.lookAt(0, 3.6, 0); },
  planeY: 1,
  reset: st => { st.items = []; st.spawn = 0; st.lives = 3;
    st.player = H3.sprite(st.cfg.player, 2.6); st.player.position.set(0, 1.3, 0); st.group.add(st.player);
    st.pshadow = H3.blob(1.1); st.group.add(st.pshadow); },
  hud: st => mode === "catch" ? "❤️".repeat(Math.max(0, st.lives)) : "",
  update: (st, dt) => { const c = st.cfg;
    st.steer(dt, 6.3, 16); st.player.position.x = st.x; st.pshadow.position.x = st.x;
    st.player.position.y = 1.3 + Math.abs(Math.sin(st.t*10))*.12;
    if (mode === "dodge") st.score = st.t*10;
    if ((st.spawn -= dt) <= 0) {
      st.spawn = mode === "catch" ? Math.max(.32, .85 - st.t*.012) : Math.max(.12, .6 - st.t*.015);
      const bad = mode === "dodge" || Math.random() < .25 + Math.min(.15, st.t*.004);
      const ch = mode === "dodge" ? pick(c.hazards) : bad ? pick(c.bad) : pick(c.good);
      const s = H3.sprite(ch, mode === "dodge" ? 1.4 + Math.random()*.9 : 1.7), sh = H3.blob(.6);
      s.position.set(-6.3 + Math.random()*12.6, 16, (Math.random()-.5)*1.5); sh.position.x = s.position.x; sh.position.z = s.position.z;
      st.group.add(s, sh);
      st.items.push({s, sh, bad, v:(mode === "catch" ? 6 : 8) + st.t*(mode === "catch" ? .2 : .35) + Math.random()*2.5, spin:(Math.random()-.5)*4}); }
    for (const it of st.items) {
      it.s.position.y -= it.v*dt; it.s.material.rotation = 0;
      const k = clamp(1 - it.s.position.y/16, 0, 1); it.sh.scale.setScalar(.3 + k); it.sh.material.opacity = .1 + k*.25;
      const near = Math.abs(it.s.position.x - st.x) < 1.4 && it.s.position.y < 2.4 && it.s.position.y > .2;
      if (near && !it.gone) {
        if (mode === "dodge") return st.over();
        it.gone = true; if (it.bad) { st.lives--; if (st.lives <= 0) st.over(); } else st.score++; }
      if (it.s.position.y < -.5) it.gone = true; }
    st.items = st.items.filter(it => { if (it.gone) { st.group.remove(it.s, it.sh); it.sh.geometry.dispose(); } return !it.gone; }); },
});

const SAMPLE_ENGINES = {
  catch: (root, g) => arcade3d(root, g, 2/3, "Move with mouse / finger or ←→", fallArena("catch")),
  dodge: (root, g) => arcade3d(root, g, 2/3, "Move with mouse / finger or ←→", fallArena("dodge")),

  /* ---- endless runner ---- */
  runner: (root, g) => arcade3d(root, g, 16/10, "Tap, click or Space to jump", {
    how: "Jump over the obstacles!",
    setup: st => { const c = st.cfg; sky(st, c.c1 || "#8ecae6", 110);
      const gr = H3.plane(200, 400, c.c2 || "#ffb703"); gr.position.z = -150; st.scene.add(gr);
      const track = H3.plane(5, 400, c.ground || "#6a994e"); track.position.set(0, .01, -150); st.scene.add(track);
      st.cam.position.set(5.5, 4.2, 8); st.cam.lookAt(0, 1.4, -6);
      st.deco = []; for (let i = 0; i < 26; i++) { const d = Math.random() < .6 ? H3.tree() : H3.box(1.4, 1 + Math.random()*2.5, 1.4, new THREE.Color(c.c2 || "#ffb703").offsetHSL(0, 0, -.15).getHex());
        d.position.set((Math.random() < .5 ? -1 : 1)*(5 + Math.random()*9), 0, -i*8); if (d.geometry) d.position.y = d.geometry.parameters.height/2; st.scene.add(d); st.deco.push(d); }
      st.stripes = []; for (let i = 0; i < 20; i++) { const s = H3.box(4.6, .02, .5, 0xffffff, {transparent:true, opacity:.25}); s.position.set(0, .03, -i*6); st.scene.add(s); st.stripes.push(s); } },
    reset: st => { st.y = 0; st.vy = 0; st.obs = []; st.next = 1; st.speed = 14;
      st.player = H3.sprite(st.cfg.player, 2.2); st.player.position.set(0, 1.1, 0); if (!st.cfg.noFlip) st.player.material = st.player.material; st.group.add(st.player);
      st.pshadow = H3.blob(.8); st.group.add(st.pshadow); },
    key: (st, e) => { if (["Space","ArrowUp","KeyW"].includes(e.code) && st.y <= .01) st.vy = 13; },
    tap: st => { if (st.y <= .01) st.vy = 13; },
    idle: (st, dt) => { st.player && (st.player.position.y = 1.1 + Math.abs(Math.sin(performance.now()/180))*.2); },
    update: (st, dt) => {
      st.speed = 14 + st.t*.5; const d = st.speed*dt; st.score += d/2;
      st.vy -= 36*dt; st.y = Math.max(0, st.y + st.vy*dt); if (st.y === 0) st.vy = 0;
      st.player.position.y = 1.1 + st.y + (st.y === 0 ? Math.abs(Math.sin(st.t*14))*.15 : 0);
      st.pshadow.scale.setScalar(1 - Math.min(.6, st.y/6));
      for (const s of st.stripes) { s.position.z += d; if (s.position.z > 8) s.position.z -= 120; }
      for (const o of st.deco) { o.position.z += d; if (o.position.z > 12) o.position.z -= 208; }
      if ((st.next -= dt) <= 0) { st.next = .75 + Math.random()*1.1 - Math.min(.35, st.t*.01);
        const s = H3.sprite(pick(st.cfg.obstacles), 1.9); s.position.set(0, .95, -90); const sh = H3.blob(.7); sh.position.z = -90; st.group.add(s, sh); st.obs.push({s, sh}); }
      for (const o of st.obs) { o.s.position.z += d; o.sh.position.z = o.s.position.z;
        if (Math.abs(o.s.position.z) < .9 && st.y < 1.5) st.over(); }
      st.obs = st.obs.filter(o => { if (o.s.position.z > 10) { st.group.remove(o.s, o.sh); return false; } return true; }); },
  }),

  /* ---- whack-a-target on a 3D board ---- */
  whack: (root, g) => arcade3d(root, g, 4/5, "Tap the targets — not the decoys!", {
    how: "30 seconds! Tap the targets, avoid the decoys",
    unit: st => `Score ${st.score|0} · ${Math.max(0, Math.ceil(30 - st.t))}s`,
    overText: () => "Time's up!",
    setup: st => { const c = st.cfg; sky(st, c.c1 || "#95d5b2", 80);
      const ground = H3.plane(80, 80, new THREE.Color(c.c2 || "#2d6a4f").getHex()); st.scene.add(ground);
      const board = H3.box(13, 1, 11, new THREE.Color(c.c2 || "#2d6a4f").offsetHSL(0, 0, .12).getHex()); board.position.y = .5; st.scene.add(board);
      st.holes = []; for (let i = 0; i < 9; i++) { const x = (i%3 - 1)*3.8, z = ((i/3|0) - 1)*3.2;
        const h = H3.cyl(1.25, 1.25, .05, 0x1a1a1a, 28); h.position.set(x, 1.01, z); h.castShadow = false; st.scene.add(h);
        const rim = new THREE.Mesh(new THREE.TorusGeometry(1.3, .14, 10, 28), H3.mat(0x7f5539)); rim.rotation.x = Math.PI/2; rim.position.set(x, 1.05, z); st.scene.add(rim);
        st.holes.push({x, z, t:null}); }
      st.cam.position.set(0, 12, 9.5); st.cam.lookAt(0, 0, .8); },
    reset: st => { st.holes.forEach(h => h.t = null); st.spawn = 0; st.fx = []; },
    tap: (st, p) => { const live = st.holes.filter(h => h.t);
      const i = st.pick(p, live, h => new THREE.Vector3(h.x, 1 + h.t.s.position.y - 1, h.z), 75); if (i < 0) return;
      const h = live[i]; const txt = h.t.bad ? "-3" : "+1"; st.score = Math.max(0, st.score + (h.t.bad ? -3 : 1));
      const f = H3.textSprite(txt, 3, h.t.bad ? "#ff4d6d" : "#fff"); f.position.set(h.x, 3, h.z); st.group.add(f); st.fx.push({f, t:0});
      st.group.remove(h.t.s); h.t = null; },
    update: (st, dt) => { const c = st.cfg;
      if (st.t >= 30) return st.over();
      if ((st.spawn -= dt) <= 0) { st.spawn = Math.max(.28, .7 - st.t*.012);
        const free = st.holes.filter(h => !h.t);
        if (free.length) { const h = pick(free), bad = Math.random() < .22, s = H3.sprite(bad ? pick(c.bad) : pick(c.good), 2.6);
          s.position.set(h.x, 0, h.z); st.group.add(s); h.t = {s, bad, life:Math.max(.6, 1.2 - st.t*.015), age:0}; } }
      for (const h of st.holes) if (h.t) { const t = h.t; t.age += dt;
        const up = Math.min(1, t.age*6, (t.life - t.age)*6); t.s.position.y = .3 + up*1.6; t.s.scale.setScalar(2.6*Math.max(.05, up));
        if (t.age >= t.life) { st.group.remove(t.s); h.t = null; } }
      st.fx = st.fx.filter(f => { f.t += dt; f.f.position.y += dt*3; f.f.material.opacity = 1 - f.t/.7; if (f.t > .7) { st.group.remove(f.f); return false; } return true; }); },
  }),

  /* ---- 3-lane racer ---- */
  racer: (root, g) => arcade3d(root, g, 3/5, "←→ or tap left / right side to switch lanes", {
    how: "Switch lanes and don't crash!",
    setup: st => { const c = st.cfg, carTheme = c.rotate !== false;
      const roadCol = c.road || "#3d405b"; sky(st, carTheme ? "#9bd0ff" : new THREE.Color(roadCol).offsetHSL(0, 0, .15).getStyle(), 120);
      const side = H3.plane(200, 400, carTheme ? "#6a994e" : new THREE.Color(roadCol).offsetHSL(0, 0, -.08).getHex()); side.position.z = -150; st.scene.add(side);
      const road = H3.plane(10, 400, roadCol); road.position.set(0, .01, -150); st.scene.add(road);
      st.lines = []; for (const x of [-1.6, 1.6]) for (let i = 0; i < 24; i++) { const l = H3.box(.18, .02, 2.2, 0xffffff, {transparent:true, opacity:.7}); l.position.set(x, .03, -i*6); st.scene.add(l); st.lines.push(l); }
      st.deco = []; if (carTheme) for (let i = 0; i < 24; i++) { const t = H3.tree(); t.position.set((i%2 ? -1 : 1)*(7 + Math.random()*6), 0, -i*9); st.scene.add(t); st.deco.push(t); }
      st.cam.position.set(0, 7, 13.5); st.cam.lookAt(0, 0, -10); },
    make: (st, ch, color) => st.cfg.rotate !== false ? H3.car(color, false) : (() => { const s = H3.sprite(ch, 2.8); s.position.y = 1.4; const gg = new THREE.Group(); gg.add(s, H3.blob(1)); return gg; })(),
    reset: st => { st.lane = 1; st.x = 0; st.cars = []; st.spawn = 0;
      st.player = SAMPLE_ENGINES._racerMake(st, st.cfg.player, 0xe63946); st.group.add(st.player); },
    key: (st, e) => { if (e.code === "ArrowLeft" || e.code === "KeyA") st.lane = Math.max(0, st.lane-1); if (e.code === "ArrowRight" || e.code === "KeyD") st.lane = Math.min(2, st.lane+1); },
    tap: (st, p) => { st.lane = p.x < 0 ? Math.max(0, st.lane-1) : Math.min(2, st.lane+1); },
    update: (st, dt) => {
      const sp = 22 + st.t*.6, d = sp*dt; st.score += d/2.5;
      const tx = (st.lane - 1)*3.2; st.x += (tx - st.x)*Math.min(1, dt*12);
      st.player.position.x = st.x; st.player.rotation.y = (st.x - tx)*.12;
      for (const l of st.lines) { l.position.z += d; if (l.position.z > 8) l.position.z -= 144; }
      for (const t of st.deco) { t.position.z += d; if (t.position.z > 12) t.position.z -= 216; }
      if ((st.spawn -= dt) <= 0) { st.spawn = Math.max(.35, .95 - st.t*.012);
        const lane = Math.random()*3|0, m = SAMPLE_ENGINES._racerMake(st, pick(st.cfg.obstacles), new THREE.Color().setHSL(Math.random(), .6, .5).getHex());
        m.position.set((lane - 1)*3.2, 0, -110); st.group.add(m); st.cars.push({m, v: sp*(.4 + Math.random()*.3)}); }
      for (const c of st.cars) { c.m.position.z += (sp - c.v)*dt;
        if (Math.abs(c.m.position.x - st.x) < 1.8 && Math.abs(c.m.position.z) < 3.9) st.over(); }
      st.cars = st.cars.filter(c => { if (c.m.position.z > 14) { st.group.remove(c.m); return false; } return true; }); },
  }),
  _racerMake: (st, ch, color) => {
    if (st.cfg.rotate !== false) return H3.car(color, false);
    const gg = new THREE.Group(), s = H3.sprite(ch, 2.8); s.position.y = 1.5; gg.add(s, H3.blob(1)); return gg; },

  /* ---- shooter ---- */
  shooter: (root, g) => arcade3d(root, g, 2/3, "Move with mouse / finger or ←→ — you fire automatically", {
    how: "Blast them before they reach you!",
    setup: st => { const c = st.cfg; sky(st, c.c2 || "#10002b", 90);
      const fl = H3.plane(60, 200, new THREE.Color(c.c1 || "#3c096c").getHex()); fl.position.z = -60; st.scene.add(fl);
      const grid = new THREE.GridHelper(200, 100, 0xffffff, 0xffffff); grid.material.opacity = .12; grid.material.transparent = true; grid.position.set(0, .02, -60); st.scene.add(grid); st.grid = grid;
      const pts = new Float32Array(600); for (let i = 0; i < 600; i += 3) { pts[i] = (Math.random()-.5)*120; pts[i+1] = 6 + Math.random()*40; pts[i+2] = -40 - Math.random()*60; }
      const geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.BufferAttribute(pts, 3));
      st.scene.add(new THREE.Points(geo, new THREE.PointsMaterial({color:0xffffff, size:.35})));
      st.cam.position.set(0, 11, 18); st.cam.lookAt(0, 0, -6); },
    planeY: 1.2,
    reset: st => { st.shots = []; st.foes = []; st.cd = 0; st.spawn = 0;
      st.player = H3.sprite(st.cfg.player, 2.4); st.player.position.set(0, 1.3, 5); st.group.add(st.player);
      st.pshadow = H3.blob(.9); st.pshadow.position.z = 5; st.group.add(st.pshadow);
      st.shotMat = new THREE.MeshBasicMaterial({color: st.cfg.shot || "#ffd60a"}); st.shotGeo = new THREE.SphereGeometry(.22, 10, 8); },
    update: (st, dt) => {
      st.steer(dt, 4.8, 14); st.player.position.x = st.pshadow.position.x = st.x;
      st.grid.position.z = -60 + (st.t*6 % 2);
      if ((st.cd -= dt) <= 0) { st.cd = .22; const b = new THREE.Mesh(st.shotGeo, st.shotMat); b.position.set(st.x, 1.3, 4); st.group.add(b); st.shots.push(b); }
      if ((st.spawn -= dt) <= 0) { st.spawn = Math.max(.3, .95 - st.t*.015); const hp = Math.random() < .2 ? 2 : 1;
        const s = H3.sprite(pick(st.cfg.enemies), hp > 1 ? 2.6 : 2); s.position.set(-4.8 + Math.random()*9.6, 1.4, -50); const sh = H3.blob(.8); st.group.add(s, sh);
        st.foes.push({s, sh, hp, v:3.5 + st.t*.12 + Math.random()*2, w:Math.random()*6}); }
      for (const b of st.shots) b.position.z -= 40*dt;
      for (const f of st.foes) { f.s.position.z += f.v*dt; f.s.position.x += Math.sin(st.t*2 + f.w)*1.6*dt; f.s.position.y = 1.4 + Math.sin(st.t*3 + f.w)*.3;
        f.sh.position.set(f.s.position.x, .02, f.s.position.z);
        for (const b of st.shots) if (!b.used && Math.abs(b.position.x - f.s.position.x) < 1.1 && Math.abs(b.position.z - f.s.position.z) < 1) {
          b.used = true; if (--f.hp <= 0) { f.dead = true; st.score++; } else f.s.scale.setScalar(2); }
        if (f.s.position.z > 4) st.over(); }
      st.shots = st.shots.filter(b => { if (b.used || b.position.z < -55) { st.group.remove(b); return false; } return true; });
      st.foes = st.foes.filter(f => { if (f.dead) { st.group.remove(f.s, f.sh); return false; } return true; }); },
  }),

  /* ---- flappy-style, side view with 3D pipes ---- */
  flap: (root, g) => arcade3d(root, g, 3/5, "Tap, click or Space to flap", {
    how: "Tap to flap through the gaps!",
    setup: st => { const c = st.cfg; sky(st, c.c1 || "#023047", 80);
      const back = H3.box(80, 40, 1, new THREE.Color(c.c2 || "#219ebc").getHex()); back.position.set(0, 0, -12); st.scene.add(back);
      const ground = H3.box(80, 2, 10, new THREE.Color(c.pipe || "#38b000").offsetHSL(0, -.2, -.2).getHex()); ground.position.set(0, -10, 0); st.scene.add(ground);
      st.cam.position.set(-2, 1, 21); st.cam.lookAt(1, 0, 0); st.sun.position.set(-6, 14, 12); },
    reset: st => { st.y = 0; st.vy = 0; st.pipes = []; st.next = .6;
      st.player = H3.sprite(st.cfg.player, 2.2); st.player.position.set(-3, 0, 0); st.group.add(st.player); },
    idle: (st) => { if (st.player && st.state === "ready") st.player.position.y = Math.sin(performance.now()/300)*.5; },
    key: (st, e) => { if (["Space","ArrowUp","KeyW"].includes(e.code)) st.vy = 11; },
    tap: st => { st.vy = 11; },
    update: (st, dt) => {
      st.vy -= 32*dt; st.y += st.vy*dt; st.player.position.y = st.y; st.player.material.rotation = clamp(st.vy/25, -.6, .5) * (st.cfg.noFlip ? 1 : -1);
      if ((st.next -= dt) <= 0) { st.next = 1.5; const gap = -4 + Math.random()*8, col = st.cfg.pipe || "#38b000";
        const top = H3.cyl(1.3, 1.3, 20, col), bot = H3.cyl(1.3, 1.3, 20, col), lt = H3.cyl(1.6, 1.6, .8, col), lb = H3.cyl(1.6, 1.6, .8, col);
        const gg = new THREE.Group(); top.position.y = gap + 2.6 + 10; bot.position.y = gap - 2.6 - 10; lt.position.y = gap + 2.9; lb.position.y = gap - 2.9;
        gg.add(top, bot, lt, lb); gg.position.x = 16; st.group.add(gg); st.pipes.push({gg, gap}); }
      for (const p of st.pipes) { p.gg.position.x -= 6*dt;
        if (!p.done && p.gg.position.x < -3) { p.done = true; st.score++; }
        if (Math.abs(p.gg.position.x + 3) < 2.4 && Math.abs(st.y - p.gap) > 1.75) st.over(); }
      st.pipes = st.pipes.filter(p => { if (p.gg.position.x < -22) { st.group.remove(p.gg); return false; } return true; });
      if (st.y < -8.6 || st.y > 11) st.over(); },
  }),

  /* ---- 3D stacker ---- */
  stack: (root, g) => arcade3d(root, g, 2/3, "Tap or Space to drop the block", {
    how: "Drop blocks to build the tallest tower!",
    setup: st => { const c = st.cfg; sky(st, c.c1 || "#ffafcc", 160);
      const fl = H3.plane(200, 200, new THREE.Color(c.c2 || "#a2d2ff").getHex()); fl.position.y = -.5; st.scene.add(fl);
      st.camY = 0; st.cam.position.set(11, 11, 11); st.cam.lookAt(0, 0, 0); },
    col: (st, i) => new THREE.Color().setHSL((((st.cfg.hue || 200) + i*9) % 360)/360, .7, .58).getHex(),
    reset: st => { st.blocks = []; st.drops = [];
      const base = H3.box(5, 1, 5, SAMPLE_ENGINES._stackCol(st, 0)); base.position.y = 0; st.group.add(base);
      st.blocks.push({x:0, z:0, w:5, d:5, m:base}); SAMPLE_ENGINES._stackNext(st);
      if (st.cfg.top) { st.topper = H3.sprite(st.cfg.top, 1.4); st.group.add(st.topper); st.topper.position.set(0, 1.2, 0); } },
    key: (st, e) => { if (["Space","ArrowDown","Enter"].includes(e.code)) SAMPLE_ENGINES._stackDrop(st); },
    tap: st => SAMPLE_ENGINES._stackDrop(st),
    idle: (st, dt) => SAMPLE_ENGINES._stackCam(st, dt),
    update: (st, dt) => { const c = st.cur, sp = 6 + st.score*.35;
      c.p += c.dir*sp*dt; if (c.p > 7) c.dir = -1; if (c.p < -7) c.dir = 1;
      if (c.axis === "x") c.m.position.x = c.p; else c.m.position.z = c.p;
      SAMPLE_ENGINES._stackCam(st, dt); },
  }),
  _stackCol: (st, i) => new THREE.Color().setHSL((((st.cfg.hue || 200) + i*9) % 360)/360, .7, .58).getHex(),
  _stackNext: st => { const top = st.blocks[st.blocks.length-1], i = st.blocks.length, axis = i % 2 ? "x" : "z";
    const m = H3.box(top.w, 1, top.d, SAMPLE_ENGINES._stackCol(st, i)); m.position.set(top.x, i, top.z); st.group.add(m);
    st.cur = {m, axis, p: -7, dir: 1, w: top.w, d: top.d};
    if (axis === "x") m.position.x = -7; else m.position.z = -7; },
  _stackCam: (st, dt) => { if (!st.blocks) return; const h = st.blocks.length;
    st.camY += (h - st.camY)*Math.min(1, dt*4); st.cam.position.set(11, 11 + st.camY, 11); st.cam.lookAt(0, st.camY - 1, 0);
    st.sun.position.set(8, 20 + st.camY, 10); st.sun.target.position.set(0, st.camY, 0);
    for (const d of st.drops) { d.v -= 25*dt; d.m.position.y += d.v*dt; d.m.rotation.x += dt*d.r; }
    st.drops = st.drops.filter(d => { if (d.m.position.y < st.camY - 25) { st.group.remove(d.m); return false; } return true; }); },
  _stackDrop: st => { if (st.state !== "play") return;
    const top = st.blocks[st.blocks.length-1], c = st.cur, ax = c.axis, size = ax === "x" ? top.w : top.d;
    const tc = ax === "x" ? top.x : top.z, cc = ax === "x" ? c.m.position.x : c.m.position.z;
    const lo = Math.max(tc - size/2, cc - size/2), hi = Math.min(tc + size/2, cc + size/2), keep = hi - lo;
    if (keep <= .05) { st.drops.push({m:c.m, v:0, r:2}); return st.over(); }
    const cut = size - keep;
    if (cut > .05) { const cutMid = cc > tc ? hi + cut/2 : lo - cut/2;
      const piece = H3.box(ax === "x" ? cut : top.w, 1, ax === "x" ? top.d : cut, c.m.material.color.getHex());
      piece.position.copy(c.m.position); if (ax === "x") piece.position.x = cutMid; else piece.position.z = cutMid;
      st.group.add(piece); st.drops.push({m:piece, v:0, r:(Math.random()-.5)*4}); }
    const mid = (lo + hi)/2, w = ax === "x" ? keep : top.w, d = ax === "x" ? top.d : keep;
    c.m.geometry.dispose(); c.m.geometry = new THREE.BoxGeometry(w, 1, d);
    if (ax === "x") c.m.position.x = mid; else c.m.position.z = mid;
    st.blocks.push({x:c.m.position.x, z:c.m.position.z, w, d, m:c.m}); st.score++;
    if (st.topper) st.topper.position.set(c.m.position.x, st.blocks.length - .3 + .5, c.m.position.z);
    SAMPLE_ENGINES._stackNext(st); },

  /* ---- quick math with 3D answer blocks ---- */
  math: (root, g) => arcade3d(root, g, 5/7, "Tap the right answer or press 1 / 2 / 3", {
    how: "Answer as many as you can in 30 seconds!",
    unit: st => `Score ${st.score|0} · ${Math.max(0, Math.ceil(30 - st.t))}s`,
    overText: () => "Time's up!",
    setup: st => { const c = st.cfg; sky(st, c.c1 || "#ffd6a5", 80);
      const fl = H3.plane(80, 80, new THREE.Color(c.c2 || "#f28482").getHex()); st.scene.add(fl);
      st.cam.position.set(0, 6.5, 15); st.cam.lookAt(0, 3, 0); },
    reset: st => { st.flash = 0; st.cubes = []; st.qs = null; SAMPLE_ENGINES._mathQ(st); },
    key: (st, e) => { const i = ["Digit1","Digit2","Digit3"].indexOf(e.code); if (i >= 0) SAMPLE_ENGINES._mathA(st, i); },
    tap: (st, p) => { const i = st.pick(p, st.cubes, c => c.m.position, 90); if (i >= 0) SAMPLE_ENGINES._mathA(st, i); },
    idle: (st, dt) => SAMPLE_ENGINES._mathAnim(st, dt),
    update: (st, dt) => { if (st.t >= 30) st.over(); SAMPLE_ENGINES._mathAnim(st, dt); },
  }),
  _mathAnim: (st, dt) => { if (!st.cubes) return; const now = performance.now()/1000;
    st.cubes.forEach((c, i) => { c.m.rotation.y = Math.sin(now*1.5 + i)*.25; c.m.position.y = 1.6 + Math.sin(now*2 + i*1.3)*.15 + (c.jump || 0);
      if (c.jump) c.jump = Math.max(0, c.jump - dt*4); }); },
  _mathQ: st => {
    const ops = st.cfg.ops || ["+"], op = pick(ops), m = st.cfg.max || 10;
    let a = 1 + Math.random()*m | 0, b = 1 + Math.random()*m | 0, ans;
    if (op === "+") ans = a + b; else if (op === "−") { if (b > a) [a, b] = [b, a]; ans = a - b; }
    else if (op === "×") { a = 1 + Math.random()*Math.min(m, 12) | 0; b = 1 + Math.random()*Math.min(m, 12) | 0; ans = a*b; }
    else { b = 1 + Math.random()*9 | 0; ans = 1 + Math.random()*9 | 0; a = ans*b; }
    const opts = new Set([ans]); while (opts.size < 3) opts.add(Math.max(0, ans + (Math.random()*10 | 0) - 5));
    st.q = {ans, opts:[...opts].sort(() => Math.random() - .5)};
    if (st.qs) st.group.remove(st.qs); st.qs = H3.textSprite(`${a} ${op} ${b} = ?`, 8, "#fff"); st.qs.position.set(0, 5.6, 0); st.group.add(st.qs);
    st.cubes.forEach(c => st.group.remove(c.m)); st.cubes = st.q.opts.map((o, i) => {
      const faces = H3.textTex(String(o), "#ffffff", "#3d2c5e", 256, 256, 110);
      const side = H3.mat(new THREE.Color().setHSL(i/3, .65, .6).getHex());
      const front = new THREE.MeshStandardMaterial({map:faces, roughness:.5});
      const m = new THREE.Mesh(new THREE.BoxGeometry(2.3, 2.3, 2.3), [side, side, side, side, front, side]); m.castShadow = true;
      m.position.set((i - 1)*3.2, 1.6, 0); st.group.add(m); return {m, o}; }); },
  _mathA: (st, i) => { if (st.state !== "play") return; const ok = st.q.opts[i] === st.q.ans;
    if (ok) st.score++; else st.t += 2;
    st.scene.background = new THREE.Color(ok ? "#b7f7c9" : "#ffb3c1"); setTimeout(() => { st.scene.background = new THREE.Color(st.cfg.c1 || "#ffd6a5"); }, 180);
    SAMPLE_ENGINES._mathQ(st); },

  /* ---- simon-style memory with 3D pads ---- */
  simon: (root, g) => arcade3d(root, g, 4/5, "Watch the pattern, then repeat it", {
    how: "Watch the pattern, then repeat it!",
    unit: st => `Round ${st.seq ? st.seq.length : 0}`,
    hud: st => st.state === "play" ? (st.mode === "show" ? "Watch…" : "Your turn!") : "",
    setup: st => { sky(st, "#22223b", 80);
      const fl = H3.plane(80, 80, 0x4a4e69); st.scene.add(fl);
      const base = H3.box(10, .8, 10, 0x2b2d42); base.position.y = .4; st.scene.add(base);
      const cols = st.cfg.colors || ["#ff595e", "#1982c4", "#8ac926", "#ffca3a"];
      st.pads = cols.map((c, i) => { const m = new THREE.Mesh(new THREE.BoxGeometry(4, .7, 4), new THREE.MeshStandardMaterial({color:c, roughness:.4, emissive:c, emissiveIntensity:0}));
        m.castShadow = m.receiveShadow = true; const x = (i%2 ? 1 : -1)*2.25, z = (i < 2 ? -1 : 1)*2.25; m.position.set(x, 1.15, z); st.scene.add(m);
        const s = H3.sprite(st.cfg.pads[i], 2.4); s.position.set(x, 2.8, z); st.scene.add(s); return {m, s, x, z}; });
      st.cam.position.set(0, 12, 9); st.cam.lookAt(0, 0, .6); },
    reset: st => { st.seq = [Math.random()*4|0]; st.i = 0; st.show = 0; st.mode = "show"; st.lit = -1; st.timer = .7; },
    key: (st, e) => { const i = ["Digit1","Digit2","Digit3","Digit4"].indexOf(e.code); if (i >= 0) SAMPLE_ENGINES._simonPress(st, i); },
    tap: (st, p) => { const i = st.pick(p, st.pads, q => new THREE.Vector3(q.x, 1.5, q.z), 110); if (i >= 0) SAMPLE_ENGINES._simonPress(st, i); },
    idle: st => SAMPLE_ENGINES._simonDraw(st),
    update: (st, dt) => { st.timer -= dt;
      if (st.mode === "show" && st.timer <= 0) {
        if (st.lit >= 0) { st.lit = -1; st.timer = .18; }
        else if (st.show < st.seq.length) { st.lit = st.seq[st.show++]; st.timer = Math.max(.25, .55 - st.seq.length*.02); }
        else { st.mode = "input"; st.i = 0; } }
      if (st.mode === "input" && st.lit >= 0 && st.timer <= 0) st.lit = -1;
      SAMPLE_ENGINES._simonDraw(st); },
  }),
  _simonDraw: st => { const now = performance.now()/1000;
    st.pads.forEach((p, i) => { const on = st.lit === i;
      p.m.material.emissiveIntensity = on ? .9 : 0; p.m.position.y = on ? 1.0 : 1.15;
      p.s.position.y = 2.8 + Math.sin(now*2 + i)*.15 + (on ? .6 : 0); p.s.scale.setScalar(on ? 3 : 2.4); }); },
  _simonPress: (st, i) => { if (st.state !== "play" || st.mode !== "input") return;
    st.lit = i; st.timer = .2;
    if (st.seq[st.i] !== i) return st.over();
    if (++st.i === st.seq.length) { st.score = st.seq.length; st.seq.push(Math.random()*4|0); st.mode = "show"; st.show = 0; st.timer = .8; } },

  /* ---- Drive a Tesla: free-roam city driving in a Model Y L ---- */
  ev: (root, g) => arcade3d(root, g, 4/3, "↑ gas · ↓ brake/reverse · ←→ steer (or hold left/right side of the screen) · follow the arrow to ⚡", {
    how: "Cruise the city in your Model Y L — grab ⚡ chargers before the battery dies!",
    unit: st => `${(st.score/10).toFixed(1)} km`,
    hud: st => `🔋 ${Math.max(0, st.batt|0)}%  ·  ${Math.abs(Math.round(st.v*4))} km/h  ·  ⚡${st.got|0}`,
    overText: () => "Battery empty!",
    setup: st => { sky(st, "#bfe3ff", 190);
      const P = 34, N = 5, R = 10; st.P = P; st.N = N; st.lim = N*P + 4;
      const ground = H3.plane(2*N*P + 80, 2*N*P + 80, 0x3a3d44); st.scene.add(ground);
      const grass = H3.plane(900, 900, 0x5f8f45); grass.position.y = -.05; st.scene.add(grass);
      for (let k = -N; k <= N; k++) for (const ax of [0, 1]) { const l = H3.box(ax ? .25 : 2*N*P, .02, ax ? 2*N*P : .25, 0xf2d64b); l.position.set(ax ? k*P : 0, .02, ax ? 0 : k*P); l.receiveShadow = true; l.castShadow = false; st.scene.add(l); }
      st.blocks = []; const cols = [0xe9ecef, 0xced4da, 0x9fb7c9, 0xf1e3d3, 0xbfc8d6, 0xd8c3a5, 0x8d99ae, 0xa3b18a];
      for (let i = -N; i < N; i++) for (let j = -N; j < N; j++) {
        const cx = (i + .5)*P, cz = (j + .5)*P, w = P - R; st.blocks.push([cx, cz, w/2]);
        const walk = H3.box(w, .25, w, 0xb8b8b8); walk.position.set(cx, .12, cz); st.scene.add(walk);
        if ((i*7 + j*3 + 50) % 9 === 0) { // park
          const pk = H3.box(w - 2, .3, w - 2, 0x6aa84f); pk.position.set(cx, .2, cz); st.scene.add(pk);
          for (let t = 0; t < 5; t++) { const tr = H3.tree(); tr.scale.setScalar(1.6); tr.position.set(cx + (Math.random()-.5)*(w-6), .3, cz + (Math.random()-.5)*(w-6)); st.scene.add(tr); }
          continue; }
        const q = w/2;
        for (const [ox, oz] of [[-1,-1],[1,-1],[-1,1],[1,1]]) { const h = 5 + Math.random()*(Math.abs(i) + Math.abs(j) < 4 ? 30 : 14);
          const bw = q - 1.5 - Math.random()*2, bd = q - 1.5 - Math.random()*2;
          const bl = H3.box(bw, h, bd, cols[Math.random()*cols.length|0]); bl.position.set(cx + ox*q/2, h/2 + .25, cz + oz*q/2); st.scene.add(bl);
          const win = H3.box(bw + .05, h*.7, bd + .05, 0x2b4a6b, {metalness:.5, roughness:.2, transparent:true, opacity:.45}); win.position.copy(bl.position); win.castShadow = false; st.scene.add(win); }
      }
      st.arrow = new THREE.Mesh(new THREE.ConeGeometry(.6, 1.8, 12), new THREE.MeshBasicMaterial({color:0xffd43b})); st.arrow.rotation.x = -Math.PI/2;
      st.arrowG = new THREE.Group(); st.arrowG.add(st.arrow); st.scene.add(st.arrowG);
      st.hold = 0; const c = st.canvas;
      c.addEventListener("pointerdown", () => st.hold = 1); c.addEventListener("pointerup", () => st.hold = 0); c.addEventListener("pointerleave", () => st.hold = 0);
      st.cam.position.set(0, 7, 14); st.cam.lookAt(0, 1, 0); },
    reset: st => { st.px = 0; st.pz = 0; st.h = 0; st.v = 0; st.batt = 100; st.got = 0; st.charges = []; st.traffic = [];
      st.car = H3.modelYL(); st.group.add(st.car); st.car.position.set(0, 0, 0);
      const P = st.P, N = st.N, rand = () => (Math.floor(Math.random()*(2*N + 1)) - N)*P;
      st.spot = () => { let x, z; do { if (Math.random() < .5) { x = rand(); z = (Math.random()*2 - 1)*N*P; } else { z = rand(); x = (Math.random()*2 - 1)*N*P; } } while (Math.hypot(x - st.px, z - st.pz) < 40); return [x, z]; };
      st.addCharge = () => { const [x, z] = st.spot(), gg = new THREE.Group(), sp = H3.sprite("⚡", 2.4); sp.position.y = 2;
        const ring = new THREE.Mesh(new THREE.TorusGeometry(1.4, .15, 8, 24), new THREE.MeshBasicMaterial({color:0xffe14d})); ring.position.y = 2;
        const post = H3.cyl(.25, .25, 4, 0xffe14d, 8); post.position.y = 2; post.material = new THREE.MeshBasicMaterial({color:0xffe14d, transparent:true, opacity:.35});
        gg.add(sp, ring, post, H3.blob(1.2)); gg.position.set(x, 0, z); st.group.add(gg); st.charges.push({gg, ring}); };
      for (let i = 0; i < 3; i++) st.addCharge();
      for (let i = 0; i < 16; i++) { const ax = i % 2, line = rand(), dir = Math.random() < .5 ? 1 : -1;
        const m = H3.car(new THREE.Color().setHSL(Math.random(), .55, .5).getHex(), false); st.group.add(m);
        st.traffic.push({m, ax, line: line + dir*2.5, dir, s:(Math.random()*2 - 1)*N*P, v:6 + Math.random()*5}); } },
    update: (st, dt) => {
      const K = st.keys, P = st.P, gas = K.ArrowUp || K.KeyW, brake = K.ArrowDown || K.KeyS;
      let steer = (K.ArrowLeft || K.KeyA ? 1 : 0) - (K.ArrowRight || K.KeyD ? 1 : 0);
      if (st.hold && Math.abs(st.nx) > .15) steer = -Math.sign(st.nx);
      const target = gas ? 30 : brake ? -8 : st.hold ? 18 : 0;
      st.v += clamp(target - st.v, -(brake && st.v > 0 ? 40 : 14)*dt, 14*dt);
      st.h += steer*dt*1.9*clamp(st.v/8, -1, 1);
      const fx = -Math.sin(st.h), fz = -Math.cos(st.h), nx = st.px + fx*st.v*dt, nz = st.pz + fz*st.v*dt;
      const hit = (x, z) => Math.abs(x) > st.lim || Math.abs(z) > st.lim || st.blocks.some(([bx, bz, r]) => Math.abs(x - bx) < r + 1.3 && Math.abs(z - bz) < r + 1.3);
      if (hit(nx, nz)) { if (!hit(nx, st.pz)) st.px = nx; else if (!hit(st.px, nz)) st.pz = nz; else { if (Math.abs(st.v) > 8) st.batt -= 4; st.v *= -.3; } }
      else { st.px = nx; st.pz = nz; }
      st.score += Math.abs(st.v)*dt/2.2;
      st.batt -= dt*(.9 + Math.abs(st.v)/25); if (st.batt <= 0) { st.batt = 0; st.over(); }
      st.car.position.set(st.px, 0, st.pz); st.car.rotation.y = st.h; st.car.rotation.z = -steer*clamp(st.v/30, 0, 1)*.05;
      for (const c of st.traffic) { c.s += c.dir*c.v*dt; if (c.s > st.N*P) c.s = -st.N*P; if (c.s < -st.N*P) c.s = st.N*P;
        if (c.ax) c.m.position.set(c.line, 0, c.s), c.m.rotation.y = c.dir > 0 ? Math.PI : 0; else c.m.position.set(c.s, 0, c.line), c.m.rotation.y = c.dir > 0 ? -Math.PI/2 : Math.PI/2;
        const dx = c.m.position.x - st.px, dz = c.m.position.z - st.pz;
        if (Math.hypot(dx, dz) < 3) { st.batt -= 10; st.v = -6; st.px -= fx*2; st.pz -= fz*2; } }
      let near = null, nd = 1e9;
      for (const c of st.charges) { c.ring.rotation.y += dt*3; const d = Math.hypot(c.gg.position.x - st.px, c.gg.position.z - st.pz);
        if (d < 3.2) { c.got = true; st.got++; st.batt = Math.min(100, st.batt + 30); st.score += 50; } else if (d < nd) { nd = d; near = c; } }
      const keep = st.charges.filter(c => !c.got); st.charges.filter(c => c.got).forEach(c => st.group.remove(c.gg)); st.charges = keep;
      while (st.charges.length < 3) st.addCharge();
      st.arrowG.position.set(st.px, 4.2, st.pz); if (near) st.arrowG.rotation.y = Math.atan2(-(near.gg.position.x - st.px), -(near.gg.position.z - st.pz));
      const cx = st.px - fx*12, cz = st.pz - fz*12, k = Math.min(1, dt*4);
      st.cam.position.x += (cx - st.cam.position.x)*k; st.cam.position.z += (cz - st.cam.position.z)*k; st.cam.position.y = 6.5;
      st.cam.lookAt(st.px + fx*4, 1.2, st.pz + fz*4);
      st.sun.position.set(st.px + 8, 20, st.pz + 10); st.sun.target.position.set(st.px, 0, st.pz); },
    idle: (st, dt) => { if (st.car) { st.h += dt*.4; st.car.rotation.y = st.h; } },
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
  L.unshift({name:"Drive a Tesla", desc:"Drive around the city in a Tesla Model Y L", emoji:"🚘", c1:"#e9ecef", c2:"#495057", size:"l", cat:"racing", play:"ev", badge:"new", sample:true});
  return L;
})();
