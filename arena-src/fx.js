/* ---------- Stickseum's effects (spawnFx0, its particle shapes, screen flashes), played top-down ----------
   The art draws side-on: x across, y down, gravity pulls down. Top-down the screen's vertical axis doubles as height:
   what falls lands on the ground line of the spot it came from (FX_GY), and an effect that only ever pointed left or right
   (a dash cut, a sand wall, an afterimage line) is built pointing right and then turned to the real direction (rot). */
const droneKick = {}, DS_DRAGONS = {}, DS_STATE = {}, TIDES = [], otherSettings = {};
let fleetShows = [], swings = [], hitStopUntil = 0;
function playSfx(n, x, y) {
  if (x !== undefined && player && Math.hypot(player.x - x, player.y - y) > 900) return;
  const m = { explosion: [90, .35, 'sawtooth', .06, .4], beam: [900, .25, 'sawtooth', .04, .3], portalwarp: [600, .2, 'sine', .04, 2], flame: [200, .2, 'sawtooth', .03, .6] }[n];
  if (m) sfx(...m);
}
function dmgText() {}            // (the damage numbers are drawn by the match itself)
function showDiceBanner() {}
function svFlash(a, col) { samFlash(a, col); }
/* ---------- 타격감: every hit gets a weight from its damage (the numbers are x10 since STAT_X): light / medium / heavy ----------
   the one hit flashes white and leans away, my own hits stop the picture for a blink and shake it a little, heavy ones throw shards and a ring. All of it is drawing only. */
const HIT_TIER = v => v >= 400 ? 3 : v >= 150 ? 2 : 1;
function hitReact(e) {
  const v = +e.v || 0; if (!(v > 0)) return;
  let best = null, bd = 70;
  for (const f of fighters) { if (!f || f.dead) continue; const d = Math.hypot(f.x - e.x, f.y + BODY - e.y); if (d < bd) { bd = d; best = f; } }
  const tier = HIT_TIER(v), now = performance.now(), ang = +e.ang || 0;
  if (best) { best.stg = { at: now, dir: Math.cos(ang) >= 0 ? 1 : -1, s: [0, .45, .75, 1][tier], ka: ang, tier }; best._hf = now; best._hfT = [0, 90, 120, 160][tier]; }
  const meHit = best && best === player;
  if (meHit) { buzz(tier === 3 ? 45 : 22); hurtAt = now; hurtK = [0, .5, .75, 1][tier]; }
  const mine = !meHit && player && !player.dead && e.color === TC(player.team) && Math.hypot(player.x - e.x, player.y + BODY - e.y) < 420;
  if (!NET.role && (meHit || mine)) hitStopUntil = Math.max(hitStopUntil, now + (meHit ? [0, 30, 60, 95] : [0, 0, 45, 80])[tier]);
  if (mine && typeof shakeFrom === 'function') shakeFrom(e.x, e.y, [0, 1.5, 3.5, 7][tier], 600);
  if (mine || meHit) hitSnd(tier, meHit);
  if (!(NET.role === 'guest' && mine)) impactPop(e.x, e.y, ang, e.color || '#ffffff', tier);
  const col = e.color || '#ffffff', x = e.x, y = e.y;
  if (tier >= 2) {
    addP({ x, y, life: .12, color: '#ffffff', shape: 'flash', size: tier === 3 ? 60 : 40 });
    addP({ x, y, life: .32, color: col, shape: 'ring', r0: 6, r1: tier === 3 ? 80 : 48, lw: tier === 3 ? 6 : 4 });
    const n = lowFx() ? 3 : tier === 3 ? 9 : 5;
    for (let i = 0; i < n; i++) { const a = ang + RND(-.7, .7), sp = RND(380, 820); addP({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, drag: 3.2, life: RND(.18, .32), size: RND(3, 5), color: i % 2 ? '#ffffff' : col, shape: 'streak' }); }
    if (tier === 3) { const px = -Math.sin(ang), py = Math.cos(ang); addP({ x: x - px * 34, y: y - py * 34, x2: x + px * 34, y2: y + py * 34, life: .18, color: '#ffffff', shape: 'slash', size: 6 }); }
  }
}
function staggerAngle(f) {             // tail.js turns the figure by this; while the hit flash lasts the figure is also drawn bright (the flash ends with tail.js's own ctx.restore)
  if (f._hf) { const a = performance.now() - f._hf; if (a < f._hfT && !lowFx()) ctx.filter = a < 45 ? 'brightness(0) invert(1)' : 'brightness(' + (1 + 2.2 * (1 - a / f._hfT)).toFixed(2) + ')'; else f._hf = 0; }
  atkKick(f);
  const st = f.stg; if (!st) return 0;
  const age = performance.now() - st.at; if (age > 240 || age < 0) { f.stg = null; return 0; }
  if (!lowFx() && st.ka !== undefined) {   // the body itself is pushed along the hit and springs back, squashed flat for a blink
    const k = age < 50 ? age / 50 : Math.max(0, 1 - (age - 50) / 150), push = [0, 5, 9, 14][st.tier || 1] * k;
    ctx.translate(Math.cos(st.ka) * push, Math.sin(st.ka) * push * .5);
    const q = age < 130 ? Math.sin(Math.PI * age / 130) * [0, .1, .16, .22][st.tier || 1] : 0;
    if (q) ctx.scale(1 + q, 1 - q);
  }
  return st.dir * .26 * st.s * Math.sin(Math.PI * age / 240);
}
function rotQ(q, ox, oy, c, s) {
  const rp = (px, py) => [ox + (px - ox) * c - (py - oy) * s, oy + (px - ox) * s + (py - oy) * c];
  [q.x, q.y] = rp(q.x, q.y); if (q.x2 !== undefined) [q.x2, q.y2] = rp(q.x2, q.y2);
  const vx = q.vx * c - q.vy * s, vy = q.vx * s + q.vy * c; q.vx = vx; q.vy = vy;
  if (q.gy !== undefined) q.gy = Math.max(q.gy, q.y + 30);
}
/* play one of the original effects: every screen does this itself, the host only sends the name and the numbers */
FXF.sp = (type, x, y, ex) => {
  ex = ex || {};
  if (!fxInView(x, y) && type !== 'cfleet') return;
  if (type === 'cards') { if (state !== 'play') return; const c = document.getElementById('diceBannerContainer'); if (c) c.textContent = ''; }
  FX_GY = ex.gy != null ? ex.gy : y + 30; FX_NEW = ex.rot ? [] : null; FX_WID = ex.wid || null; FX_COS = ex.cos || null; FX_ANG = ex.rot || 0;
  try { spawnFx0(Object.assign({ type, x, y }, ex)); } catch (e) {}
  if (ex.rot && FX_NEW) { const c = Math.cos(ex.rot), s = Math.sin(ex.rot); for (const q of FX_NEW) rotQ(q, x, y, c, s); }
  FX_GY = null; FX_NEW = null; FX_WID = null; FX_COS = null;
};
function fx(type, x, y, ex) { fxPlay('sp', type, Math.round(x), Math.round(y), ex || {}); }
const fxAt = (f, type, ex) => fx(type, f.x, f.y + BODY, Object.assign({ gy: f.y + 16 }, ex));
/* a line effect from a to b, built pointing right and turned */
function fxLine(type, x0, y0, x1, y1, ex) { const d = Math.hypot(x1 - x0, y1 - y0) || 1, a = Math.atan2(y1 - y0, x1 - x0); fx(type, x0, y0, Object.assign({ x2: Math.round(x0 + d), y2: Math.round(y0), rot: +a.toFixed(3), dir: 1 }, ex)); }
const themeCol = id => (ULT_THEMES[id] || ULT_THEMES._).c[0];

/* melee swings: the original weapon arcs (drawProjectileBase with a swing angle), drawn where the arm swings */
function addSwing(f, ang) {
  const life = Math.min(.28, Math.max(.12, f.h.cd || .3));
  const s = { x: f.x + Math.cos(ang) * 26, y: f.y + BODY + Math.sin(ang) * 26, wid: f.h.id, swingAngle: ang, life, life0: life, color: TC(f.team), vx: 0, vy: 0, dmgless: true };
  swings.push(s); evt(['w', Math.round(s.x), Math.round(s.y), s.wid, +ang.toFixed(2), +life.toFixed(2), f.team]);
}
const SHAPE_WID = {}; for (const id in WEAPONS) { const sh = WEAPONS[id].shape; if (sh && !SHAPE_WID[sh] && WEAPONS[id].kind !== 'melee') SHAPE_WID[sh] = id; }
SHAPE_WID.bullet = 'pistol'; SHAPE_WID.fireball = 'wizard'; SHAPE_WID.bomb = 'grenade'; SHAPE_WID.rocket = 'bazooka'; SHAPE_WID.arrow = 'bow';
/* ---------- 기사 강타: a real jump (up fast, hang, slam down), the sword high over the head, cracks where it lands ---------- */
let leapCracks = [];
FXF.leap = (fi, dur, h) => {
  const f = fighters[fi]; if (!f) return;
  f._leap = { at: performance.now(), dur: Math.max(.15, +dur || .3) * 1000, h: +h || 80 };
  if (!lowFx()) for (let i = 0; i < 8; i++) { const a = Math.PI * (.1 + .8 * Math.random()); addP({ x: f.x + RND(-10, 10), y: f.y + 16, vx: Math.cos(a) * RND(-120, 120), vy: -Math.sin(a) * RND(20, 60), drag: 2.4, life: RND(.3, .5), size: RND(5, 9), color: '#b9b2a4', shape: 'smoke' }); }
};
function leapLift(f) {                 // tail.js calls this with the fighter's feet as the origin: draws the shadow and lifts the figure
  const L = f._leap; if (!L) return;
  const k = (performance.now() - L.at) / L.dur;
  if (k >= 1 || f.dead) { f._leap = null; if (!f.dead) leapImpact(f); return; }
  const up = .5, h = k < up ? L.h * Math.sin(k / up * Math.PI / 2) : L.h * (1 - Math.pow((k - up) / (1 - up), 2.2));   // (the way down speeds up: the slam)
  const s = 1 - .45 * h / L.h;
  ctx.save(); ctx.globalAlpha *= .35 + .25 * s; ctx.fillStyle = '#000'; ctx.beginPath(); ctx.ellipse(0, 0, 22 * s, 7 * s, 0, 0, 7); ctx.fill(); ctx.restore();
  if (f.h && f.h.id === 'sword') f.swing = .2195;           // the sword stays raised the whole jump, and chops down when he lands
  if (k > up && !lowFx() && Math.random() < .7) addP({ x: f.x + RND(-6, 6), y: f.y + 16 - h - 30, vx: 0, vy: 260, life: .14, size: 2.4, color: '#e8eef8', shape: 'streak' });
  ctx.translate(0, -h);
}
function leapImpact(f) {
  const x = f.x + Math.cos(f.aim) * 30, y = f.y + 16 + Math.sin(f.aim) * 14;
  addP({ x, y, life: .35, r0: 10, r1: 95, lw: 7, color: '#f3f6ff', shape: 'ring' });
  addP({ x, y, life: .5, r0: 20, r1: 130, lw: 3, color: '#ffd34d', shape: 'ring' });
  if (!lowFx()) {
    for (let i = 0; i < 14; i++) { const a = Math.random() * 6.283, sp = RND(160, 420); addP({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp * .55, drag: 3, life: RND(.25, .45), size: RND(2, 3.4), color: i % 3 ? '#e8eef8' : '#ffd34d', shape: 'streak' }); }
    for (let i = 0; i < 10; i++) { const a = Math.random() * 6.283; addP({ x: x + Math.cos(a) * 20, y: y + Math.sin(a) * 8, vx: Math.cos(a) * RND(60, 160), vy: Math.sin(a) * RND(20, 60), drag: 2.2, life: RND(.4, .7), size: RND(6, 11), color: '#a9a294', shape: 'smoke' }); }
  }
  const lines = []; for (let i = 0; i < 7; i++) { const a = i / 7 * 6.283 + RND(-.3, .3); let px = 0, py = 0; const pts = [[0, 0]]; for (let j = 0; j < 3; j++) { const l = RND(14, 24); px += Math.cos(a + RND(-.5, .5)) * l; py += Math.sin(a + RND(-.5, .5)) * l * .5; pts.push([px, py]); } lines.push(pts); }
  leapCracks.push({ x, y, at: performance.now(), lines });
  if (typeof shakeFrom === 'function') shakeFrom(x, y, 8, 520);
}
function drawLeapCracks(now) {
  for (let i = leapCracks.length - 1; i >= 0; i--) {
    const c = leapCracks[i], k = (now - c.at) / 900; if (k >= 1) { leapCracks.splice(i, 1); continue; }
    ctx.save(); ctx.translate(c.x, c.y); ctx.globalAlpha = (1 - k) * .85; ctx.strokeStyle = '#14100c'; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for (const p of c.lines) { ctx.beginPath(); p.forEach(([x, y], j) => j ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke(); }
    ctx.strokeStyle = 'rgba(255,211,77,' + (.6 * (1 - k)) + ')'; ctx.lineWidth = 1.2; for (const p of c.lines) { ctx.beginPath(); p.forEach(([x, y], j) => j ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke(); }
    ctx.restore();
  }
}

/* ---------- 폭발광's bombs fly in an arc: up from the hand, down onto the spot (a shadow stays on the ground under them) ---------- */
let bombPrev = [];
function bombArc(b) {
  if (b._sx === undefined) {                                  // a guest gets new bullet objects with every snapshot: carry the start over from the bomb that was here a moment ago
    let best = null, bd = 60;
    for (const p of bombPrev) { if (p.team !== b.team) continue; const d = Math.hypot(p.x - b.x, p.y - b.y); if (d < bd) { bd = d; best = p; } }
    if (best && best.tr < Math.hypot(best.sx - b.x, best.sy - b.y) + 40) { b._sx = best.sx; b._sy = best.sy; b._tot = best.tot; }
    else { b._sx = b.x; b._sy = b.y; b._tot = b.life != null && b.life > 0 ? b.life : ((HEROES.grenade && HEROES.grenade.range) || 500); }
  }
  const tr = Math.hypot(b.x - b._sx, b.y - b._sy), k = Math.min(1, tr / Math.max(1, b._tot)), H = Math.min(120, b._tot * .3);
  b._tr = tr;
  return { k, h: H * 4 * k * (1 - k), dh: H * 4 * (1 - 2 * k) / Math.max(1, b._tot), H };
}
function bombFrame() { bombPrev = []; for (const b of bullets) if (b.shape === 'bomb' && b._sx !== undefined) bombPrev.push({ x: b.x, y: b.y, sx: b._sx, sy: b._sy, tot: b._tot, tr: b._tr || 0, team: b.team }); }
/* ---------- 더블 킬 · 트리플 킬 (Stickseum's showMultiKillBig): kills within 6 s of each other add up; everybody sees it, bigger when it is mine ---------- */
const MK_WIN = 6, MK_NAMES = ['', '', '더블 킬', '트리플 킬', '쿼드라 킬', '펜타 킬'];
const MK_TIERS = { 2: { c: '#ffd34d', px: 64, n: 22 }, 3: { c: '#ff9f43', px: 84, n: 34 }, 4: { c: '#ff5d5d', px: 104, n: 48 }, 5: { c: '#d58bff', px: 124, n: 64 } };
const mkSeen = new Map(); let mkEl = null, mkFl = null;
function mkCheck() {
  if (state !== 'play') { if (mkSeen.size) mkSeen.clear(); return; }
  const now = performance.now() / 1000;
  for (const f of fighters) {
    if (!f || f.minion) continue;
    const k = f.kos || 0, m = mkSeen.get(f);
    if (!m) { mkSeen.set(f, { k, n: 0, t: -99 }); continue; }
    if (k < m.k) { m.k = k; m.n = 0; continue; }
    if (k > m.k) { if (f === player) buzz([35, 55, 35]); m.n = (now - m.t <= MK_WIN ? m.n : 0) + (k - m.k); m.k = k; m.t = now; if (m.n >= 2) showMultiKill(f, m.n); }
  }
}
function mkEnsure() {
  if (mkEl) return;
  const st = document.createElement('style');
  st.textContent = '#multiKillBig{position:fixed;left:50%;top:32%;transform:translate(-50%,-50%) scale(.2);z-index:7;pointer-events:none;opacity:0;text-align:center;font-family:Rajdhani,"Black Han Sans","IBM Plex Sans KR",sans-serif;font-weight:900;white-space:nowrap;letter-spacing:2px;-webkit-text-stroke:3px rgba(0,0,0,.8);paint-order:stroke fill;line-height:1}'
    + '#multiKillBig .mkSub{font-size:.32em;letter-spacing:1px;margin-top:6px;-webkit-text-stroke:2px rgba(0,0,0,.8);color:#fff;font-family:"IBM Plex Sans KR",sans-serif;font-weight:700}'
    + '#multiKillBig.show{animation:mkPop 2.1s cubic-bezier(.2,1.4,.4,1) forwards}'
    + '@keyframes mkPop{0%{opacity:0;transform:translate(-50%,-50%) scale(.2) rotate(-6deg)}12%{opacity:1;transform:translate(-50%,-50%) scale(1.3) rotate(2deg)}22%{transform:translate(-50%,-50%) scale(1) rotate(0)}80%{opacity:1;transform:translate(-50%,-50%) scale(1.04)}100%{opacity:0;transform:translate(-50%,-34%) scale(1.15)}}'
    + '#mkFlash{position:fixed;inset:0;z-index:6;pointer-events:none;opacity:0}#mkFlash.show{animation:mkFl .5s ease-out forwards}@keyframes mkFl{0%{opacity:var(--a,.3)}100%{opacity:0}}'
    + '@media (max-width:600px),(max-height:500px){#multiKillBig{top:28%}}'
    + '@media (prefers-reduced-motion: reduce){#multiKillBig.show{animation-duration:2.1s;animation-timing-function:linear}}';
  document.head.append(st);
  mkEl = document.createElement('div'); mkEl.id = 'multiKillBig'; mkEl.setAttribute('aria-live', 'polite'); document.body.append(mkEl);
  mkFl = document.createElement('div'); mkFl.id = 'mkFlash'; document.body.append(mkFl);
}
function showMultiKill(f, n) {
  mkEnsure();
  const T = MK_TIERS[Math.min(5, n)], title = MK_NAMES[n] || (n + '연속 처치'), mine = f === player, name = f.nick || (f.h0 && f.h0.name) || f.h.name || '';
  const vw = Math.min(innerWidth, innerHeight * 1.8), px = Math.round(T.px * (mine ? 1 : .72) * Math.min(1, vw / 900));
  mkEl.className = ''; mkEl.style.fontSize = Math.max(34, px) + 'px'; mkEl.style.color = T.c; mkEl.style.textShadow = '0 0 18px ' + T.c + ', 0 0 46px ' + T.c + ', 0 4px 0 rgba(0,0,0,.6)';
  mkEl.textContent = title + '!'; const sub = document.createElement('div'); sub.className = 'mkSub'; sub.textContent = mine ? '🔥 내가 해냈어요!' : name + '님'; mkEl.append(sub);
  void mkEl.offsetWidth; mkEl.classList.add('show'); clearTimeout(mkEl._t); mkEl._t = setTimeout(() => mkEl.classList.remove('show'), 2200);
  if (n >= 4 || (mine && n >= 3)) { mkFl.style.background = n >= 5 ? '#ffffff' : T.c; mkFl.style.setProperty('--a', mine ? (n >= 5 ? .5 : .3) : .16); mkFl.className = ''; void mkFl.offsetWidth; mkFl.className = 'show'; }
  if (!f.dead && (mine || visibleTo(f, VIEW))) {               // a burst around the one who did it
    const x = f.x, y = f.y + BODY, cols = [T.c, '#ffffff', '#ffe9a8'], m = lowFx() ? .4 : 1;
    addP({ x, y, life: .6, r0: 14, r1: 150, lw: 9, color: T.c, shape: 'ring' });
    if (n >= 3) addP({ x, y, life: .5, r0: 10, r1: 110, lw: 5, color: '#ffffff', shape: 'ring' });
    for (let i = 0; i < Math.round(T.n * m); i++) { const a = Math.random() * 6.283, sp = RND(200, 520); addP({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, drag: 2, life: RND(.4, .8), size: RND(2, 3.6), color: cols[i % cols.length], shape: 'streak' }); }
  }
  try { const notes = [523, 659, 784, 1047, 1319]; for (let i = 0; i < Math.min(5, n); i++) setTimeout(() => sfx(notes[i], .12, 'triangle', mine ? .07 : .045, 1.02), i * 85); } catch (e) { }
}
/* ---------- 마술사 모자 던지기: a real top hat spinning through the air (sparkles behind it), the camera rides with it, and he pops out of it in a puff of smoke and cards ---------- */
function drawHatThrow(f) {                 // tail.js calls this instead of its two black boxes while he is 'gone'
  const h = f.st && f.st.hat; if (!h) return;
  const now = performance.now(), t = now / 1000;
  if (!f._hatT0) f._hatT0 = now;
  const age = (now - f._hatT0) / 1000, lift = 26 + Math.sin(Math.min(1, age / .5) * Math.PI) * 26, x = h.x, gy = h.y + 16, y = gy - lift;
  ctx.save(); ctx.globalAlpha = .3; ctx.fillStyle = '#000'; ctx.beginPath(); ctx.ellipse(x, gy, 16, 5, 0, 0, 7); ctx.fill(); ctx.restore();
  if (!lowFx() && Math.random() < .8) addP({ x: x + RND(-8, 8), y: y + RND(-6, 6), vx: RND(-20, 20), vy: RND(-30, 10), drag: 2, life: RND(.35, .6), size: RND(1.6, 3), color: ['#ffd34d', '#ffffff', '#ff7bd9'][Math.floor(Math.random() * 3)] });
  ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(t * 9) * .25); ctx.scale(Math.cos(t * 14) * .25 + .95, 1);
  ctx.lineJoin = 'round'; ctx.strokeStyle = '#05060a'; ctx.lineWidth = 2;
  ctx.fillStyle = '#1d1f27'; ctx.beginPath(); ctx.ellipse(0, 6, 20, 5.5, 0, 0, 7); ctx.fill(); ctx.stroke();       // brim
  ctx.beginPath(); ctx.moveTo(-11, 5); ctx.lineTo(-12, -18); ctx.quadraticCurveTo(0, -22, 12, -18); ctx.lineTo(11, 5); ctx.closePath(); ctx.fill(); ctx.stroke();   // crown
  ctx.fillStyle = '#d62839'; ctx.fillRect(-11.5, -2, 23, 5);                                                       // band
  ctx.fillStyle = 'rgba(255,255,255,.18)'; ctx.fillRect(-8, -16, 3, 13);
  ctx.restore();
}
let hatCam = null;
function hatCamTarget(ft) {                // tail.js: what the camera follows (the hat while he is inside it; eased so it never jumps)
  const gone = ft && ft.form === 'gone' && ft.st && ft.st.hat;
  if (gone) { if (!hatCam) hatCam = { x: ft.x, y: ft.y, out: 0 }; hatCam.out = 0; hatCam.x += (ft.st.hat.x - hatCam.x) * .3; hatCam.y += (ft.st.hat.y - hatCam.y) * .3; return hatCam; }
  if (hatCam) { hatCam.x += (ft.x - hatCam.x) * .3; hatCam.y += (ft.y - hatCam.y) * .3; if (++hatCam.out > 20 || Math.hypot(ft.x - hatCam.x, ft.y - hatCam.y) < 2) { hatCam = null; return ft; } return hatCam; }
  return ft;
}
function hatPops() {                       // the moment he steps out of the hat
  for (const f of fighters) {
    if (!f) continue;
    const g = f.form === 'gone' && f.st && f.st.hat;
    if (g) f._hatAt = { x: f.st.hat.x, y: f.st.hat.y };
    else if (f._hatAt) {
      const x = f.x, y = f.y + BODY; f._hatAt = null; f._hatT0 = 0;
      if (!f.dead && (state === 'menu' || visibleTo(f, VIEW))) {
        addP({ x, y, life: .25, color: '#ffffff', shape: 'flash', size: 140 }); addP({ x, y, life: .45, color: '#ff7bd9', shape: 'ring', r0: 8, r1: 90, lw: 5 });
        for (let i = 0; i < 12; i++) { const a = Math.random() * 6.283; addP({ x: x + Math.cos(a) * 10, y: y + Math.sin(a) * 6 + 10, vx: Math.cos(a) * RND(40, 120), vy: Math.sin(a) * RND(20, 60) - 30, drag: 2, life: RND(.5, .8), size: RND(8, 13), color: '#cfc8dc', shape: 'smoke', add: false }); }
        if (!lowFx()) for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 + RND(-1.2, 1.2), sp = RND(220, 380); addP({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, grav: 700, drag: .6, life: RND(.6, .9), size: 6, color: i % 2 ? '#d62839' : '#ffffff', shape: 'card', add: false, rot: RND(0, 6), vr: RND(-12, 12) }); }
      }
    }
  }
}
function drawShot(b) {          // a projectile in the original art, turned along its flight
  const wid = b.wid || SHAPE_WID[b.shape];
  if (!wid) return false;
  let vx = b.vx != null ? b.vx : Math.cos(b.ang) * 100, vy = b.vy != null ? b.vy : Math.sin(b.ang) * 100, y = b.y;
  if (b.shape === 'bomb') {
    if (!vx && !vy) { vx = Math.cos(b.ang) * 100; vy = Math.sin(b.ang) * 100; }
    const A = bombArc(b), sp = Math.hypot(vx, vy), s = 1 - .5 * A.h / Math.max(1, A.H);
    ctx.save(); ctx.globalAlpha = .28 + .2 * s; ctx.fillStyle = '#000'; ctx.beginPath(); ctx.ellipse(b.x, b.y + 30, 11 * s, 4.5 * s, 0, 0, 7); ctx.fill(); ctx.restore();
    y = b.y - A.h; vy -= A.dh * sp;                             // (the bomb turns along the arc: nose up, then down)
  }
  ctx.save();
  try { drawProjectileBase({ x: b.x, y, vx: vx || Math.cos(b.ang), vy: vy || Math.sin(b.ang), wid, life: 1, life0: 1, color: TC(b.team), ult: b.r > 8, scale: b.r > 8 ? b.r / 6 : 1, owner: 'x' }); } catch (e) { ctx.restore(); return false; }
  ctx.restore();
  return true;
}
function drawSwings(dt) {
  drawBuffAuras(dt);
  for (let i = swings.length - 1; i >= 0; i--) {
    const s = swings[i]; s.life -= dt; if (s.life <= 0) { swings.splice(i, 1); continue; }
    ctx.save(); try { drawProjectileBase(s); } catch (e) {} ctx.restore();
  }
}

/* what each skill adds on top of its own work, when it is used (the original's per-skill effects) */
const SKILL_FX = {
  'sword:3': f => fxAt(f, 'skillring', { color: '#dfe6f0', r: 110 }),
  'sword:4': f => fxAt(f, 'blink', { color: '#ffd34d' }),
  'bat:1': f => fxAt(f, 'skillring', { color: '#ffffff', r: 80 }),
  'shotgun:1': f => fxAt(f, 'gust', { r: 120 }),
  'shotgun:5': f => fxAt(f, 'skillring', { color: '#c9a36a' }),
  'rifle:3': f => fxAt(f, 'skillring', { color: '#7be86a' }),
  'rifle:5': f => fxAt(f, 'shieldup'),
  'smg:3': f => fxAt(f, 'dash', { dir: 1, rot: +f.aim.toFixed(2) }),
  'gloves:2': f => fxAt(f, 'shieldup'),
  'dagger:3': f => fxAt(f, 'skillring', { color: '#8fe04a' }),
  'dagger:4': f => fxAt(f, 'smokeveil'),
  'dracula:1': f => fxAt(f, 'skillring', { color: '#b01030' }),
  'dracula:3': f => fxAt(f, 'skillring', { color: '#d01030' }),
  'wizard:1': f => fxAt(f, 'gust', { r: 130 }),
  'wizard:5': f => fxAt(f, 'skillring', { color: '#9d7bff' }),
  'magiccard:4': f => fxAt(f, 'skillring', { color: '#ff9ad0' }),
  'boomerang:1': f => fxAt(f, 'gust', { r: 160 }),
  'boomerang:3': f => fxAt(f, 'skillring', { color: '#ffd34d' }),
  'flamethrower:3': f => fxAt(f, 'skillring', { color: '#ff7a2b' }),
  'vacuum:1': f => fxAt(f, 'vacvortex', { r: px(330) }),
  'vacuum:2': f => fxAt(f, 'smokeland'),
  'vacuum:3': f => fxAt(f, 'skillring', { color: '#8fd3ff' }),
  'pirate:3': f => fxAt(f, 'skillring', { color: '#d98c2b' }),
  'samurai:2': f => fxAt(f, 'skillring', { color: '#ffd34d' }),
  'samurai:4': f => fxAt(f, 'skillring', { color: '#dfe9ff' }),
  'harald:1': f => fxAt(f, 'skillring', { color: '#ff5a3a' }),
  'harald:4': f => fxAt(f, 'shieldup'),
  'horemheb:2': f => fxAt(f, 'sandpuff'),
  'horemheb:3': f => fxAt(f, 'sandpuff'),
  'pizarro:1': f => fxAt(f, 'skillring', { color: '#ffd34d' }),
  'pizarro:4': f => fxAt(f, 'skillring', { color: '#ffd34d', r: 220 }),
  'edward:2': f => fxAt(f, 'skillring', { color: '#b3202a' }),
  'edward:4': f => fxAt(f, 'skillring', { color: '#f4f1e8' }),
  'plague:5': f => fxAt(f, 'skillring', { color: '#9be06a' }),
  'dragonslayer:1': f => fxAt(f, 'skillring', { color: '#ff8a3d' }),
  'dragonslayer:2': f => fxAt(f, 'shieldup'),
  'dragonslayer:5': f => fxAt(f, 'skillring', { color: '#ff8a3d' }),
  'shade:3': f => fxAt(f, 'skillring', { color: '#7dffd8' }),
  'kan:5': f => fxAt(f, 'skillring', { color: '#7ddc7a' }),
  'kurus:1': f => fxAt(f, 'darksplash'),
  'kurus:3': f => fxAt(f, 'darksplash'),
  'cleon:1': f => fxAt(f, 'skillring', { color: '#ff7ac8' }),
  'cleon:5': f => fxAt(f, 'shieldup'),
  'pel:1': f => fxAt(f, 'skillring', { color: '#7fd8ff' }),
  'pel:3': f => fxAt(f, 'shieldup'),
  'pel:5': f => fxAt(f, 'skillring', { color: '#7dff9a' }),
  'tionis:2': f => fxAt(f, 'skillring', { color: '#4ddb7a' }),
  'tell:3': f => fxAt(f, 'skillring', { color: '#ffe14a' }),
  'tell:5': f => fxAt(f, 'skillring', { color: '#9ae26a' }),
  'pistol:1': f => fxAt(f, 'skillring', { color: '#ffd34d' }),
  'pistol:3': f => fxAt(f, 'skillring', { color: '#ffd34d' }),
  'pistol:4': f => fxAt(f, 'skillring', { color: '#7bf3ff' }),
  'medium:2': f => fxAt(f, 'skillring', { color: '#8b5cf6' }),
  /* skills that used to show only the plain ring */
  'sword:2': f => fxPlay('leap', fighters.indexOf(f), .3, 90),
  'sword:5': f => fx('spark', f.x + Math.cos(f.aim) * 46, f.y + BODY + Math.sin(f.aim) * 46, { ang: +f.aim.toFixed(2), color: '#ffffff' }),
  'pistol:2': f => fx('spark', f.x + Math.cos(f.aim) * 40, f.y + BODY + Math.sin(f.aim) * 40, { ang: +f.aim.toFixed(2), color: '#ffd34d' }),
  'edward:3': f => fx('spark', f.x + Math.cos(f.aim) * 40, f.y + BODY + Math.sin(f.aim) * 40, { ang: +f.aim.toFixed(2), color: '#ffd34d' }),
  'edward:4': f => fxAt(f, 'shieldup'),
  'harald:2': f => fx('dustblast', f.x + Math.cos(f.aim) * 30, f.y + BODY + Math.sin(f.aim) * 30, { ang: +f.aim.toFixed(2) }),
  'tell:1': f => { const e = nearest(f, 9 * T, null, 0); if (e) fx('lockon', e.x, e.y + BODY); fxAt(f, 'skillring', { color: '#9ae26a', r: 80 }); },
  'tell:3': f => fxAt(f, 'arrowwarn'),
  'tell:4': f => { const e = nearest(f, 9 * T, null, 0); if (e) fx('lockon', e.x, e.y - 60); fxAt(f, 'skillring', { color: '#ff6a6a', r: 80 }); },
  'tell:5': f => fxAt(f, 'arrowwarn'),
  'kan:2': f => fxAt(f, 'smellburst'),
  'plague:5': f => { fxAt(f, 'smellburst'); fxAt(f, 'skillring', { color: '#9be06a' }); },
  'puppeteer:2': f => fxAt(f, 'magiccircle'),
  'dragonslayer:1': f => { fx('flamepuff', f.x + Math.cos(f.aim) * 20, f.y + BODY + Math.sin(f.aim) * 20, { ang: +f.aim.toFixed(2) }); fxAt(f, 'skillring', { color: '#ff8a3d' }); },
  'magiccard:2': f => fxAt(f, 'blink', { color: '#ffffff' }),
  'magiccard:3': f => fxAt(f, 'blink', { color: '#ff9ad0' })
};
function skillFx(f, def) {
  fx('skill', f.x, f.y - 66, { name: typeof def.name === 'function' ? def.name(f) : def.name, color: TC(f.team) });
  const g = SKILL_FX[f.h.id + ':' + def.n]; if (g) g(f);
  else fxAt(f, 'skillring', { color: themeCol(f.h.id), r: 90 });
  syncAuras(def.k === 'buff' ? f : null, themeCol(f.h.id));
}
function ultFx(f) {
  fxAt(f, 'ult', { name: f.h.ult.name });
  fxAt(f, 'ultfx', { w: f.h.id });
  syncAuras(f, themeCol(f.h.id));
}
/* the layers every cast gets on top of its own effect (the original builds a skill from a wind-up, the strike itself and an after-glow:
   rings that come in, a fan of streaks along the aim, a column of light, staged ripples) */
const later2 = (s, fn) => setTimeout(() => { try { fn(); } catch (e) { } }, s * 1000);
function castLayers(f, def) {
  const c = themeCol(f.h.id), a = +f.aim.toFixed(2), ca = Math.cos(f.aim), sa = Math.sin(f.aim), fy = f.y + BODY;
  fxAt(f, 'converge', { color: c, r: def.k === 'buff' ? 74 : 58 });
  if (def.k === 'hit') fx('fan', f.x + ca * 22, fy + sa * 22, { ang: a, color: c, n: 9, spread: .42, len: 330 });
  else if (def.k === 'move') fx('afterimage', f.x, fy, { x2: Math.round(f.x + ca * 170), y2: Math.round(fy + sa * 170), color: c });
  else fxAt(f, 'column', { color: c, h: 70 });
}
function ultStage(f) {
  const T = (ULT_THEMES[f.h.id] || ULT_THEMES._), c = T.c, fy = f.y + BODY, big = { gy: f.y + 16 };
  fx('glyph', f.x, f.y + 6, { color: c[0], r: 130, gy: f.y + 16 });
  fx('column', f.x, fy, Object.assign({ color: c[0], h: 170 }, big));
  for (let i = 0; i < 8; i++) fx('spark', f.x, fy - 8, Object.assign({ ang: +(i * Math.PI / 4).toFixed(2), color: i % 2 ? c[1] : c[0] }, big));
  later2(.10, () => { if (f.dead) return; fx('skillring', f.x, fy, { color: c[1], r: 170 }); });
  later2(.22, () => { if (f.dead) return; fx('skillring', f.x, fy, { color: c[2], r: 250 }); });
}

/* ---------- buffs you can see: while a power-up lasts, the one who has it shows it ----------
   (before, a buff was a ring at the moment of casting and then nothing). The host looks at the buffs a skill just gave (to the caster or
   to anyone else) and sends 'aura' with the name and the seconds; every screen then draws the same thing, so nothing has to travel with the snapshots. */
const AURA = {
  haste: ['wind', '#7be8ff'], rush: ['wind', '#ffd34d'], freedash: ['wind', '#bfefff'],
  dmg: ['power', '#ff5a4a'], rage: ['power', '#ff7a2b'], over: ['power', '#ff3b3b'], flame: ['power', '#ff8a2b'], gas: ['power', '#9be06a'], rapid: ['power', '#ffe14a'], full: ['power', '#ffd34d'],
  dr: ['guard', '#8fb8ff'], march: ['guard', '#d8c07a'], parade: ['guard', '#ffd34d'],
  auto: ['aim', '#7dffd8'], focus: ['aim', '#ffd34d'], dual: ['orbit', '#ffe14a'], fresh: ['plus', '#7dffa3'], apple: ['plus', '#ff6a6a'], wings: ['wings', '#35d08a']
};
function syncAuras(caster, col) {
  for (const f of fighters) {
    if (!f || f.dead || f.minion) continue;
    const have = f.fxAura || (f.fxAura = {}), now = performance.now();
    let any = false;
    for (const k in AURA) { const o = f.b && f.b[k]; if (o && o.t > .25 && (have[k] || 0) < now + 120) { fxPlay('aura', fighters.indexOf(f), k, +o.t.toFixed(2)); any = true; } }
    if (f === caster && !any && !(have.gen > now)) fxPlay('aura', fighters.indexOf(f), 'gen', 1.3, col);          // (a skill that only changes how the next shots fly: a short glow so the cast still shows)
  }
}
FXF.aura = (fi, k, dur, col) => { const f = fighters[fi]; if (!f) return; (f.fxAura || (f.fxAura = {}))[k] = performance.now() + dur * 1000; if (col) f.fxAuraCol = col; };
function drawBatFormArt(c, tint) {     // 드라큘라's bat form, as in Stickseum (drawBatForm): flapping wings, red glow and eyes
  const flap = Math.sin(performance.now() / 55);
  c.save(); c.globalCompositeOperation = 'lighter'; c.fillStyle = 'rgba(255,45,45,.16)'; c.beginPath(); c.arc(0, -28, 32, 0, 7); c.fill(); c.restore();
  const ws = 25 + flap * 5; c.fillStyle = '#15161c';
  for (const sd of [-1, 1]) { c.beginPath(); c.moveTo(0, -32); c.quadraticCurveTo(sd * ws * .6, -46 - flap * 7, sd * ws, -26 - flap * 4); c.quadraticCurveTo(sd * ws * .65, -26, sd * ws * .4, -18); c.quadraticCurveTo(sd * ws * .2, -24, 0, -20); c.closePath(); c.fill(); }
  c.fillStyle = '#2a0a0a'; c.beginPath(); c.ellipse(0, -27, 7, 10, 0, 0, 7); c.fill();
  c.beginPath(); c.moveTo(-5, -35); c.lineTo(-8, -45); c.lineTo(-1.5, -36.5); c.closePath(); c.fill();
  c.beginPath(); c.moveTo(5, -35); c.lineTo(8, -45); c.lineTo(1.5, -36.5); c.closePath(); c.fill();
  c.fillStyle = '#ff2d2d'; c.beginPath(); c.arc(-3, -28, 1.3, 0, 7); c.fill(); c.beginPath(); c.arc(3, -28, 1.3, 0, 7); c.fill();
}

/* ---------- zones drawn like Stickseum's own (the plain circle that tail.js draws is only the fallback) ---------- */
const KD_PAL = { a: '#9a4cff', b: '#c9a0ff', wing: '#24083a', mid: '#3a1668' };
function drawDarkLump(z) {            // 카다스's lump of darkness (Stickseum's drawFieldZones 'kdhole'): a writhing blob, a spiral turning inside it, a purple glow around it
  const now = performance.now(), K = KD_PAL, R = Math.max(2, +z.r || 0), tt = now / 1000, fo = Math.max(0, Math.min(1, (R - 18) / 30)) * Math.min(1, (z.t || 1) * 3);
  const me = player, inside = !!(me && !me.dead && Math.hypot(me.x - z.x, me.y + BODY - z.y) <= R);
  ctx.save(); ctx.globalAlpha = fo * (inside ? .4 : 1);
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; const og = ctx.createRadialGradient(z.x, z.y, R * .4, z.x, z.y, R * 1.5); og.addColorStop(0, hexA(K.a, .38)); og.addColorStop(1, hexA(K.a, 0)); ctx.fillStyle = og; ctx.beginPath(); ctx.arc(z.x, z.y, R * 1.5, 0, 7); ctx.fill(); ctx.restore();
  const blob = rr => { ctx.beginPath(); for (let i = 0; i <= 40; i++) { const a = i / 40 * Math.PI * 2, w = 1 + .12 * Math.sin(a * 3 + tt * 2.2) + .08 * Math.sin(a * 5 - tt * 3.1) + .05 * Math.sin(a * 7 + tt * 4); const x = z.x + Math.cos(a) * rr * w, y = z.y + Math.sin(a) * rr * w; if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); } ctx.closePath(); };
  blob(R); const bg = ctx.createRadialGradient(z.x, z.y, 0, z.x, z.y, R); bg.addColorStop(0, '#030008'); bg.addColorStop(.7, K.wing); bg.addColorStop(1, K.mid); ctx.fillStyle = bg; ctx.fill();
  ctx.shadowColor = K.a; ctx.shadowBlur = 18; ctx.strokeStyle = K.b; ctx.lineWidth = 2.4; ctx.stroke(); ctx.shadowBlur = 0;
  ctx.strokeStyle = hexA(K.b, .5); ctx.lineWidth = 1.4;
  for (let k = 0; k < 3; k++) { ctx.beginPath(); for (let i = 0; i <= 34; i++) { const f = i / 34, a = tt * (1.6 - k * .3) + k * 2.1 + f * 5.5, rr = R * (.15 + .8 * f); const x = z.x + Math.cos(a) * rr, y = z.y + Math.sin(a) * rr; if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); } ctx.stroke(); }
  ctx.restore();
  if (fo > .5 && Math.random() < .3 && !lowFx()) { const a = Math.random() * 6.283; addP({ x: z.x + Math.cos(a) * R * 1.05, y: z.y + Math.sin(a) * R * 1.05, vx: -Math.cos(a) * 46, vy: -Math.sin(a) * 46, drag: .8, life: RND(.5, .9), size: RND(2, 3.6), color: Math.random() < .5 ? K.a : K.b }); }   // (wisps drawn into the lump)
}
let kdVeilA = 0, kdVeilCv = null;
function drawDarkVeil(dt) {            // trapped in an enemy's lump: the picture goes dark, only a circle around me stays clear (Stickseum's drawKdVeil)
  const me = player; let want = 0;
  if (me && !me.dead && state === 'play') for (const z of zones) if (z.col === '#9a4cff' && !z.kind && z.team !== me.team && Math.hypot(me.x - z.x, me.y + BODY - z.y) <= z.r) { want = 1; break; }
  kdVeilA += (want - kdVeilA) * Math.min(1, dt * (want ? 8 : 5)); if (kdVeilA < .02) { kdVeilA = 0; return; }
  const cw = ctx.canvas.width, ch = ctx.canvas.height;
  if (!kdVeilCv) kdVeilCv = document.createElement('canvas');
  if (kdVeilCv.width !== cw || kdVeilCv.height !== ch) { kdVeilCv.width = cw; kdVeilCv.height = ch; }
  const c = kdVeilCv.getContext('2d'); c.globalCompositeOperation = 'source-over'; c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, cw, ch);
  c.fillStyle = 'rgba(6,0,14,' + (.66 * kdVeilA) + ')'; c.fillRect(0, 0, cw, ch);
  c.globalCompositeOperation = 'destination-out';
  const sx = (me.x - cam.x) * cam.s + cw / 2, sy = (me.y + BODY - cam.y) * cam.s + ch / 2, r = 190 * cam.s, g = c.createRadialGradient(sx, sy, 10 * cam.s, sx, sy, r);
  g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(.6, 'rgba(0,0,0,.7)'); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.beginPath(); c.arc(sx, sy, r, 0, 7); c.fill();
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(kdVeilCv, 0, 0); ctx.restore();
}
function drawScreenVeil() { const now = performance.now(), dt = Math.min(.05, (now - (drawScreenVeil.last || now)) / 1000); drawScreenVeil.last = now; drawDarkVeil(dt); drawHurtVignette(now); }
function drawZoneArt(z, menu) {       // tail.js asks this for every zone first; true = drawn here
  if ((z.kind === 'sprout' || z.kind === 'vine') && typeof drawGardenZone === 'function') return drawGardenZone(z);      // (정원사: gardener.js)
  if (z.col === '#9a4cff' && !z.kind) { drawDarkLump(z); return true; }
  return false;
}
function drawMuzzles() {               // the flash at the mouth of whatever fired (the original's drawMuzzle): bright for a few frames
  for (const b of bullets) {
    if (b.born === undefined || b.x0 === undefined || b.ang === undefined) continue;
    const age = time - b.born; if (!(age >= 0 && age < .07)) continue;
    const t = age / .07, size = (b.shape === 'rocket' || b.shape === 'bomb' ? 42 : (b.shape === 'card' || b.shape === 'boomerang' ? 15 : 30)) * (1 - t);
    if (!(size > 1)) continue;
    const sx = b.x0 + Math.cos(b.ang) * 24, sy = b.y0 + BODY + Math.sin(b.ang) * 24;
    ctx.save(); ctx.translate(sx, sy); ctx.rotate(b.ang); ctx.globalCompositeOperation = 'lighter';
    const rg = ctx.createRadialGradient(size * .4, 0, 0, size * .4, 0, size); rg.addColorStop(0, 'rgba(255,243,176,.95)'); rg.addColorStop(1, 'rgba(255,170,60,0)');
    ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(size * .4, 0, size, 0, 7); ctx.fill();
    ctx.fillStyle = 'rgba(255,220,120,' + (.85 * (1 - t)) + ')';
    ctx.beginPath(); ctx.moveTo(0, -size * .25); ctx.lineTo(size * 1.9, 0); ctx.lineTo(0, size * .25); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(size * .7, -size * .95); ctx.lineTo(size * .35, 0); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(size * .7, size * .95); ctx.lineTo(size * .35, 0); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
}
function drawPizarroAura(f, now) {     // 피사로: the more stacks of conquest, the stronger the golden glow (the original's drawPizarroAura)
  const n = Math.min(3, f.st && f.st.pz || 0); if (!n) return;
  const pulse = .85 + .15 * Math.sin(now / 180), r = 24 + n * 9;
  ctx.save(); ctx.translate(f.x, f.y); ctx.globalCompositeOperation = 'lighter';
  const gr = ctx.createRadialGradient(0, -30, 4, 0, -30, r * pulse); gr.addColorStop(0, 'rgba(255,214,90,' + (.16 + .09 * n) + ')'); gr.addColorStop(1, 'rgba(255,170,40,0)');
  ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(0, -30, r * pulse, 0, 7); ctx.fill();
  if (n >= 3) for (let i = 0; i < 5; i++) { const fx0 = (i - 2) * 8 + Math.sin(now / 90 + i * 2) * 1.5, fh = 10 + ((now / 60 + i * 7) % 9); ctx.fillStyle = 'rgba(255,' + (150 + i * 18) + ',60,.75)'; ctx.beginPath(); ctx.moveTo(fx0 - 3, 0); ctx.quadraticCurveTo(fx0, -fh * .6, fx0 + Math.sin(now / 70 + i) * 2, -fh); ctx.quadraticCurveTo(fx0 + 1, -fh * .4, fx0 + 3, 0); ctx.closePath(); ctx.fill(); }
  ctx.restore();
}
function drawKanWings(now) {           // 칸's ultimate: two wings of quetzal feathers on the back (the original's drawKanWings)
  const c = ctx, fl = Math.sin(now / 90) * .22;
  c.save(); c.translate(0, -40);
  for (const sd of [-1, 1]) { c.save(); c.scale(sd, 1); c.rotate(-.55 + fl);
    for (let i = 0; i < 5; i++) { c.rotate(.24); c.fillStyle = i % 2 ? '#1faa6a' : '#35d08a'; c.beginPath(); c.ellipse(24 + i * 2, 0, 21 - i * 1.6, 3.8, 0, 0, 7); c.fill(); c.fillStyle = '#e0334a'; c.beginPath(); c.ellipse(40 + i * 1.5, 0, 3, 2.2, 0, 0, 7); c.fill(); }
    c.restore(); }
  c.restore();
}
function drawBuffAuras(dt) {
  const now = performance.now(), T = now / 1000, menu = state === 'menu';
  drawMuzzles(); drawImpacts(); doveFeathers(dt); predictHits(); deathWatch(); drawHaraldAxes(now); drawLeapCracks(now); bombFrame(); mkCheck(); hatPops();
  for (const f of fighters) { if (f && !f.dead && !f.minion && f.st && f.st.pz && (menu || (visibleTo(f, VIEW) && !bushAt(f.x, f.y)))) drawPizarroAura(f, now); }
  for (const f of fighters) {
    const a = f && f.fxAura; if (!a || f.minion) continue;
    if (f.dead) { f.fxAura = null; continue; }
    if (!menu && (!visibleTo(f, VIEW) || bushAt(f.x, f.y))) continue;
    const kinds = {}; let n = 0;
    for (const k in a) { if (a[k] <= now) { delete a[k]; continue; } const d = AURA[k]; if (d && !kinds[d[0]] && n < 3) { kinds[d[0]] = { c: d[1], left: (a[k] - now) / 1000 }; n++; } }
    const gen = a.gen > now ? (a.gen - now) / 1000 : 0;
    if (!n && !gen) continue;
    ctx.save(); ctx.translate(f.x, f.y);
    const sp = Math.hypot(f.vx || 0, f.vy || 0), seed = (f.slot || 0) * 1.7;
    if (kinds.wind) {
      const c = kinds.wind.c; ctx.strokeStyle = c; ctx.lineCap = 'round';
      if (sp > 25) {
        const dx = -f.vx / sp, dy = -f.vy / sp;
        for (let i = 0; i < 4; i++) { const ph = (T * 3.2 + i * .27 + seed) % 1, y0 = -6 - i * 12, x0 = dx * (10 + ph * 18), L = 20 + (i % 2) * 12; ctx.globalAlpha = .65 * (1 - ph); ctx.lineWidth = 3 - i * .4; ctx.beginPath(); ctx.moveTo(x0, y0 + dy * (10 + ph * 18)); ctx.lineTo(x0 + dx * L, y0 + dy * (10 + ph * 18 + L)); ctx.stroke(); }
      } else { for (let i = 0; i < 2; i++) { ctx.globalAlpha = .5; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.ellipse(0, -4, 26, 10, 0, T * 5 + i * Math.PI, T * 5 + i * Math.PI + 1.3); ctx.stroke(); } }
    }
    if (kinds.power) {
      const c = kinds.power.c; ctx.fillStyle = c; ctx.strokeStyle = c; ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = .35 + .15 * Math.sin(T * 9); ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(0, 1, 24 + Math.sin(T * 9) * 2, 10, 0, 0, 6.3); ctx.stroke();
      for (let i = 0; i < 7; i++) { const ph = (T * .95 + i / 7 + seed) % 1; ctx.globalAlpha = (1 - ph) * .9; ctx.beginPath(); ctx.arc(Math.sin(i * 2.3 + T * 2.2) * 15, -6 - ph * 60, 2.8 * (1 - ph * .5) + .6, 0, 6.3); ctx.fill(); }
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = .85; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; const ph = (T * 1.4 + seed) % 1; ctx.globalAlpha = (1 - ph) * .9;
      ctx.beginPath(); ctx.moveTo(-7, -78 - ph * 10 + 5); ctx.lineTo(0, -78 - ph * 10 - 2); ctx.lineTo(7, -78 - ph * 10 + 5); ctx.stroke();            // (a small arrow rising over the head: "stronger")
    }
    if (kinds.guard) {
      const c = kinds.guard.c, pulse = kinds.guard.left < 1 ? (Math.sin(T * 22) > 0 ? .35 : 1) : 1;          // (blinks in the last second)
      ctx.strokeStyle = c; ctx.fillStyle = c; ctx.globalAlpha = .1 * pulse; ctx.beginPath(); ctx.arc(0, -30, 33, 0, 6.3); ctx.fill();
      ctx.globalAlpha = .75 * pulse; ctx.lineWidth = 3; ctx.setLineDash([7, 9]); ctx.lineDashOffset = -T * 40; ctx.beginPath(); ctx.arc(0, -30, 33, 0, 6.3); ctx.stroke(); ctx.setLineDash([]);
    }
    if (kinds.aim) {
      const c = kinds.aim.c; ctx.strokeStyle = c; ctx.lineWidth = 2; ctx.globalAlpha = .85; ctx.save(); ctx.translate(0, -62); ctx.rotate(T * 2.4);
      ctx.beginPath(); ctx.arc(0, 0, 15, 0, 6.3); ctx.stroke(); for (let i = 0; i < 4; i++) { ctx.rotate(Math.PI / 2); ctx.beginPath(); ctx.moveTo(11, 0); ctx.lineTo(21, 0); ctx.stroke(); } ctx.restore();
    }
    if (kinds.orbit) {
      const c = kinds.orbit.c; ctx.fillStyle = c; ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 2; i++) { const an = T * 4.2 + i * Math.PI; ctx.globalAlpha = .9; ctx.beginPath(); ctx.arc(Math.cos(an) * 27, -30 + Math.sin(an) * 12, 4.2, 0, 6.3); ctx.fill(); ctx.globalAlpha = .25; ctx.beginPath(); ctx.arc(Math.cos(an) * 27, -30 + Math.sin(an) * 12, 8, 0, 6.3); ctx.fill(); }
      ctx.globalCompositeOperation = 'source-over';
    }
    if (kinds.plus) {
      const c = kinds.plus.c; ctx.strokeStyle = c; ctx.lineWidth = 3; ctx.lineCap = 'round';
      for (let i = 0; i < 3; i++) { const ph = (T * .8 + i / 3 + seed) % 1, x = Math.sin(i * 2.9 + 1) * 15, y = -10 - ph * 52; ctx.globalAlpha = (1 - ph) * .95; ctx.beginPath(); ctx.moveTo(x - 4, y); ctx.lineTo(x + 4, y); ctx.moveTo(x, y - 4); ctx.lineTo(x, y + 4); ctx.stroke(); }
    }
    if (kinds.wings) { ctx.save(); ctx.translate(0, -2); drawKanWings(now); ctx.restore(); }
    if (gen) {
      const c = f.fxAuraCol || '#ffd34d', k = Math.min(1, gen / 1.3); ctx.strokeStyle = c; ctx.fillStyle = c; ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = .55 * k; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(0, -30, 25 + (1 - k) * 8, 34 + (1 - k) * 8, 0, 0, 6.3); ctx.stroke();
      for (let i = 0; i < 5; i++) { const ph = (T * 1.1 + i / 5 + seed) % 1; ctx.globalAlpha = (1 - ph) * .85 * k; ctx.beginPath(); ctx.arc(Math.sin(i * 3.1 + T) * 17, -4 - ph * 60, 2.3, 0, 6.3); ctx.fill(); }
      ctx.globalCompositeOperation = 'source-over';
    }
    ctx.restore();
  }
  ctx.globalAlpha = 1;
}
/* 도박사: the cards turn over in a banner (the original's), for whoever plays them in sight */
function cardFx(f, cs, total, tags) {
  if (state !== 'play' || (!f.human && player && Math.hypot(player.x - f.x, player.y - f.y) > 6 * T)) return;
  const R = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  const cards = cs.map(c => c >= 52 ? { joker: 1, r: '', s: '', red: 0 } : { r: R[c % 13], s: '♠♥♦♣'[Math.floor(c / 13)], red: (Math.floor(c / 13) === 1 || Math.floor(c / 13) === 2) ? 1 : 0 });
  fx('cards', f.x, f.y + BODY, { name: f.nick || f.h0.name, cards, total, tags: tags || [] });
}
/* the dragon and the crows in the original art */
function drawDragonMinion(m) {
  const face = Math.cos(m.a * .7 + Math.PI / 2) >= 0 ? -1 : 1;
  ctx.save(); ctx.translate(m.x, m.y - 40); ctx.scale(1.25, 1.25);
  ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.beginPath(); ctx.ellipse(0, 120, 70, 16, 0, 0, 6.3); ctx.fill();
  try { drawFireDragon(ctx, performance.now(), face, 3, m.breath && time - m.breath < .42 ? 1 - (time - m.breath) / .42 : 0); } catch (e) {}
  ctx.restore();
}
function drawCrowMinion(m) {
  const now = performance.now(), ang = m.a || 0, f = Math.cos(ang) >= 0 ? 1 : -1, fl = Math.sin(now / 55 + (m.x | 0)) * .9;
  ctx.save(); ctx.translate(m.x, m.y - 30); ctx.scale(f, 1); ctx.rotate(Math.atan2(Math.sin(ang), Math.abs(Math.cos(ang))) * .5);
  ctx.globalAlpha = .28; ctx.fillStyle = '#8fd36a'; ctx.beginPath(); ctx.arc(0, 0, 24, 0, 7); ctx.fill(); ctx.globalAlpha = 1;
  ctx.fillStyle = '#14141b'; ctx.strokeStyle = '#9aa0b8'; ctx.lineWidth = 1.4;
  ctx.beginPath(); ctx.moveTo(-4, -2); ctx.quadraticCurveTo(-8, -14 + fl * 8, -22, -22 + fl * 20); ctx.quadraticCurveTo(-18, -6 + fl * 6, -30, -2 + fl * 14); ctx.quadraticCurveTo(-16, 2, -2, 5); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(0, 0, 17, 8.5, 0, 0, 7); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-14, 0); ctx.lineTo(-29, -4); ctx.lineTo(-26, 5); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.arc(15, -3, 7, 0, 7); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#3a3a48'; ctx.beginPath(); ctx.moveTo(20, -6); ctx.lineTo(31, -2); ctx.lineTo(20, 1); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#ff5a5a'; ctx.beginPath(); ctx.arc(17, -4.5, 1.7, 0, 7); ctx.fill();
  ctx.restore();
}

/* ---------- 타격감 2: the one attacking moves too, numbers have weight, the bar keeps a white trail, phones buzz ---------- */
function atkKick(f) {                   // called inside the figure's own save/restore (staggerAngle): a gun pushes the body back, a blade winds back then lunges
  if (!f.h || lowFx()) return;
  const a = f.aim || 0;
  let k = 0;
  if (f.h.type === 'melee') { if (f.swing > 0) { const s = 1 - f.swing / .22; k = s < .18 ? -5 * s / .18 : 8 * Math.sin(Math.PI * Math.min(1, (s - .18) / .82)); } }
  else { const age = time - (f.lastFire || -9); if (age >= 0 && age < .12) k = -6 * (1 - age / .12); }
  if (k) ctx.translate(Math.cos(a) * k, Math.sin(a) * k * .6);
}
const NUM_RE = /^\d+$/;
if (typeof addText === 'function') {   // hits on the same spot within a moment add into one number that pops bigger
  const addText0 = addText;
  addText = function (o) {
    addText0(o);
    if (!o || o.small || !NUM_RE.test(o.txt)) return;
    o.v = +o.txt; o.n = 1; o.pt = performance.now(); o.ox = o.x; o.oy = o.y;
    for (const t of texts) {
      if (t === o || !t.n || t.color !== o.color || t.life < .3 || Math.abs(t.ox - o.ox) > 26 || Math.abs(t.oy - o.oy) > 8) continue;
      t.v += o.v; t.n++; t.txt = String(t.v); t.pt = o.pt; t.life = Math.max(t.life, o.life);
      const i = texts.indexOf(o); if (i >= 0) texts.splice(i, 1);
      break;
    }
  };
}
function drawDmgText(t) {               // tail.js draws every floating text through this when it is a number
  if (t.small || !NUM_RE.test(t.txt)) return false;
  const v = +t.txt, tier = HIT_TIER(v), me = t.color === '#ff5d5d';
  const px = [0, 20, 25, 32][tier] + Math.min(8, ((t.n || 1) - 1) * 1.5);
  const pa = t.pt ? (performance.now() - t.pt) / 1000 : 1, pop = pa < .14 ? 1 + .6 * (1 - pa / .14) : 1;
  const col = me ? t.color : (t.color === '#ffffff' ? (tier === 3 ? '#ffd34d' : tier === 2 ? '#fff0b8' : '#ffffff') : t.color);
  ctx.save(); ctx.translate(t.x, t.y); if (pop !== 1) ctx.scale(pop, pop);
  ctx.font = '800 ' + px + 'px Rajdhani, sans-serif'; ctx.globalAlpha = clamp(t.life / .4, 0, 1);
  ctx.lineWidth = tier === 3 ? 5 : 4; ctx.strokeStyle = tier === 3 && !me ? '#5a2a00' : '#0c0e13'; ctx.strokeText(t.txt, 0, 0);
  ctx.fillStyle = col; ctx.fillText(t.txt, 0, 0);
  if (pa < .08) { ctx.globalAlpha *= 1 - pa / .08; ctx.fillStyle = '#ffffff'; ctx.fillText(t.txt, 0, 0); }
  ctx.restore();
  return true;
}
function hpGhost(f, x, y, w) {          // tail.js calls this just before the hp bar: the lost part stays white for a moment, then drains
  const now = performance.now(), hp = f.hp / f.mhp;
  if (f._gh == null || hp >= f._gh || f.dead) { f._gh = hp; f._ght = now; return; }
  if (f._ghl !== hp) { f._ghl = hp; f._ght = now; }
  if (now - f._ght > 380) f._gh = Math.max(hp, f._gh - .9 * Math.min(.05, (now - (f._ghd || now)) / 1000));
  f._ghd = now;
  ctx.fillStyle = 'rgba(255,255,255,.9)'; ctx.beginPath(); ctx.roundRect(x, y, Math.max(0, w * f._gh), 7, 3); ctx.fill();
}
let VIB = true; try { VIB = localStorage.getItem('seum_vib') !== '0'; } catch (e) { }
function buzz(p) { if (!VIB || !navigator.vibrate || !(touchMode || navigator.maxTouchPoints > 0)) return; try { navigator.vibrate(p); } catch (e) { } }
(function vibRow() {                    // one switch in the settings window, only where the phone can buzz
  if (!('vibrate' in navigator)) return;
  const fxIn = document.getElementById('setFx'); if (!fxIn) return;
  const row = document.createElement('label'); row.className = 'setRow';
  row.innerHTML = '<span>진동</span><input id="setVib" class="setSwitch" type="checkbox" role="switch">';
  fxIn.closest('.setRow').after(row);
  const c = row.querySelector('input'); c.checked = VIB;
  c.addEventListener('change', () => { VIB = c.checked; try { localStorage.setItem('seum_vib', VIB ? '1' : '0'); } catch (e) { } if (VIB) buzz(30); });
})();

/* ---------- 마술사's 비둘기 변신: a real rock pigeon (grey body, green-purple neck, dark wing bars, orange eye) in the magician's top hat ---------- */
const DOVE_F = [];
function drawDoveFormArt(c, tint, f) {      // drawn in the figure's own space (feet at 0,0); faces where it is flying
  const now = performance.now(), T = now / 1000;
  if (f._dpx !== undefined) { const dx = f.x - f._dpx; if (Math.abs(dx) > .3) f._ddir = dx > 0 ? 1 : -1; }
  f._dpx = f.x; const dir = f._ddir || (Math.cos(f.aim || 0) >= 0 ? 1 : -1);
  if (!f._dvLast || now - f._dvLast > 400) doveBurst(f.x, f.y - 34, lowFx() ? 4 : 12);      // a puff of feathers as the magician turns into the bird
  f._dvLast = now;
  if (Math.random() < .06 && !lowFx()) doveBurst(f.x - dir * 14, f.y - 34, 1);
  const flap = Math.sin(T * 26), bob = Math.sin(T * 13) * 2.5, head = Math.sin(T * 9) * 3;
  c.save();
  c.fillStyle = 'rgba(0,0,0,.22)'; c.beginPath(); c.ellipse(0, 2, 18, 5, 0, 0, 7); c.fill();      // shadow on the ground, the bird hovers above it
  c.translate(0, -36 + bob); c.scale(dir * 1.15, 1.15); c.rotate(-.12);
  c.lineJoin = 'round'; c.lineCap = 'round';
  const wing = (back) => {                  // one wing, hinged at the shoulder; the far one is darker and a little behind
    c.save(); c.translate(-2, -5); c.rotate((back ? -.35 : -.15) - flap * .95);
    c.fillStyle = back ? '#7d8596' : '#a9b1c0'; c.strokeStyle = '#3c4252'; c.lineWidth = 1.4;
    c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(-6, -14, -10, -27); c.lineTo(-14, -30); c.lineTo(-17, -27); c.lineTo(-20, -25); c.lineTo(-22, -21); c.quadraticCurveTo(-20, -8, -6, 5); c.closePath(); c.fill(); c.stroke();
    c.fillStyle = '#2e3340';                // dark primaries at the tip
    c.beginPath(); c.moveTo(-10, -27); c.lineTo(-14, -30); c.lineTo(-17, -27); c.lineTo(-20, -25); c.lineTo(-22, -21); c.quadraticCurveTo(-17, -20, -12, -21); c.closePath(); c.fill();
    if (!back) { c.strokeStyle = '#353a48'; c.lineWidth = 2.2; c.beginPath(); c.moveTo(-5, -6); c.lineTo(-13, -10); c.moveTo(-7, -1); c.lineTo(-16, -4); c.stroke(); }      // the two black wing bars
    c.restore();
  };
  wing(true);
  c.fillStyle = '#5c6373'; c.strokeStyle = '#3c4252'; c.lineWidth = 1.4;      // tail fan with its dark band
  c.beginPath(); c.moveTo(-12, 0); c.lineTo(-30, -3); c.lineTo(-31, 4); c.lineTo(-12, 6); c.closePath(); c.fill(); c.stroke();
  c.fillStyle = '#2e3340'; c.fillRect(-31, -3, 4, 7.5);
  const g = c.createLinearGradient(0, -12, 0, 12); g.addColorStop(0, '#b8c0ce'); g.addColorStop(1, '#8c94a5');
  c.fillStyle = g; c.beginPath(); c.ellipse(-1, 1, 17, 10, -.08, 0, 7); c.fill(); c.stroke();
  c.save(); c.translate(head * .5, 0);     // the neck nods forward and back like a pigeon walking
  const ng = c.createLinearGradient(6, -14, 14, 4); ng.addColorStop(0, '#5fbf8f'); ng.addColorStop(.5, '#8a6fc0'); ng.addColorStop(1, '#9aa3b4');
  c.fillStyle = ng; c.beginPath(); c.moveTo(4, -6); c.quadraticCurveTo(10, -16, 15, -15); c.lineTo(16, -6); c.quadraticCurveTo(14, 4, 6, 6); c.closePath(); c.fill();
  c.translate(head * .5, 0);
  c.fillStyle = '#8b93a4'; c.strokeStyle = '#3c4252'; c.beginPath(); c.arc(16, -18, 6.5, 0, 7); c.fill(); c.stroke();
  c.fillStyle = '#e8e4dc'; c.beginPath(); c.ellipse(22, -19, 2, 1.4, 0, 0, 7); c.fill();      // the pale cere over the beak
  c.fillStyle = '#2b2b33'; c.beginPath(); c.moveTo(21.5, -18.5); c.lineTo(27, -17.2); c.lineTo(21.5, -16); c.closePath(); c.fill();
  c.fillStyle = '#ff8a2a'; c.beginPath(); c.arc(17.5, -19.5, 2.2, 0, 7); c.fill();
  c.fillStyle = '#111'; c.beginPath(); c.arc(17.8, -19.5, 1.1, 0, 7); c.fill();
  c.save(); c.translate(14, -24); c.rotate(-.18);      // the magician's top hat, banded in the team colour
  c.fillStyle = '#16181f'; c.fillRect(-5, -11, 10, 11); c.fillRect(-8, -1, 16, 2.6);
  c.fillStyle = tint; c.fillRect(-5, -4, 10, 2.4); c.restore();
  c.restore();
  c.strokeStyle = '#d9707a'; c.lineWidth = 1.8; c.beginPath(); c.moveTo(-1, 10); c.lineTo(-5, 14); c.moveTo(3, 10); c.lineTo(0, 14.5); c.stroke();      // pink feet tucked up
  wing(false);
  c.restore();
}
function doveBurst(x, y, n) { for (let i = 0; i < n; i++) DOVE_F.push({ x: x + RND(-10, 10), y: y + RND(-8, 8), vx: RND(-90, 90), vy: RND(-110, 10), r: RND(0, 6.3), vr: RND(-6, 6), t: 0, life: RND(.7, 1.2), s: RND(.8, 1.3), c: Math.random() < .5 ? '#ffffff' : '#b8c0ce' }); }
function doveFeathers(dt) {                 // little curved feathers that drift down and sway
  dt = Math.min(.05, dt || .016);
  for (let i = DOVE_F.length - 1; i >= 0; i--) {
    const q = DOVE_F[i]; q.t += dt; if (q.t > q.life) { DOVE_F.splice(i, 1); continue; }
    q.vx *= 1 - 2.5 * dt; q.vy = q.vy * (1 - 2.5 * dt) + 60 * dt; q.x += (q.vx + Math.sin(q.t * 7 + q.r) * 25) * dt; q.y += q.vy * dt; q.r += q.vr * dt;
    ctx.save(); ctx.globalAlpha = Math.min(1, (q.life - q.t) * 2.5); ctx.translate(q.x, q.y); ctx.rotate(q.r + Math.sin(q.t * 7) * .5); ctx.scale(q.s, q.s);
    ctx.fillStyle = q.c; ctx.strokeStyle = 'rgba(60,66,82,.7)'; ctx.lineWidth = .8;
    ctx.beginPath(); ctx.moveTo(-6, 0); ctx.quadraticCurveTo(0, -4, 6, 0); ctx.quadraticCurveTo(0, 3, -6, 0); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-7, .5); ctx.lineTo(6, 0); ctx.stroke(); ctx.restore();
  }
}

/* ---------- 타격감 3: real-sounding hits (noise crack + low thump instead of one beep), bullets burst where they land,
   a kill freezes the moment, an ultimate shakes the screen, and on a guest my own shots show their impact before the server answers ---------- */
let NOISE = null;
function sndBus() { if (!ac || muted || state !== 'play') return null; const v = (typeof SET !== 'undefined' && SET.vol !== undefined ? SET.vol : 100) / 100; return v > 0 ? v : null; }
function noiseBuf() { if (NOISE) return NOISE; const n = ac.sampleRate * .4 | 0, b = ac.createBuffer(1, n, ac.sampleRate), d = b.getChannelData(0); for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1; return NOISE = b; }
function snd(o) {                       // one layered hit: filtered noise for the crack, a falling sine for the body
  const v = sndBus(); if (!v) return;
  try {
    const t = ac.currentTime, out = ac.createGain(); out.gain.value = v; out.connect(ac.destination);
    if (o.n) { const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(); s.buffer = noiseBuf(); f.type = o.nt || 'bandpass'; f.frequency.value = o.nf || 1800; f.Q.value = o.nq || .9;
      g.gain.setValueAtTime(o.n, t); g.gain.exponentialRampToValueAtTime(.0001, t + (o.nd || .08)); s.connect(f); f.connect(g); g.connect(out); s.start(t); s.stop(t + (o.nd || .08) + .02); }
    if (o.b) { const os = ac.createOscillator(), g = ac.createGain(); os.type = o.bt || 'sine'; os.frequency.setValueAtTime(o.bf || 160, t); os.frequency.exponentialRampToValueAtTime(o.be || 45, t + (o.bd || .12));
      g.gain.setValueAtTime(o.b, t); g.gain.exponentialRampToValueAtTime(.0001, t + (o.bd || .12)); os.connect(g); g.connect(out); os.start(t); os.stop(t + (o.bd || .12) + .02); }
  } catch (e) { }
}
function hitSnd(tier, meHit) {
  if (meHit) snd({ n: .05 + tier * .02, nf: 900, nd: .07, b: .12 + tier * .04, bf: 120, be: 40, bd: .14 });
  else snd({ n: [0, .07, .1, .14][tier], nf: [0, 2600, 2000, 1500][tier], nd: [0, .05, .08, .12][tier], b: [0, .1, .16, .24][tier], bf: [0, 200, 170, 140][tier], be: 45, bd: [0, .08, .12, .18][tier] });
}
const IMPS = [];
function impactPop(x, y, ang, col, tier) {   // a crisp comic hit: a spiky white star rimmed in the shooter's colour, thick speed wedges, chunky outlined shards that bounce
  const n = lowFx() ? 2 : 2 + tier * 2, sh = [];
  for (let i = 0; i < n; i++) { const a = ang + Math.PI + RND(-1.2, 1.2) + (i % 2 ? Math.PI : 0) * .35, sp = RND(110, 230) + tier * 30; sh.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 90, r: RND(0, 6), vr: RND(-14, 14), z: RND(3.5, 6) + tier, gy: y + RND(16, 30), w: i % 3 === 0 ? '#ffffff' : col }); }
  IMPS.push({ x, y, ang, col, tier, t0: performance.now(), rot: RND(0, 6.3), sh, last: performance.now() });
  if (IMPS.length > 40) IMPS.shift();
}
function drawImpacts() {
  const now = performance.now();
  for (let i = IMPS.length - 1; i >= 0; i--) {
    const m = IMPS[i], a = now - m.t0, dt = Math.min(.05, (now - m.last) / 1000); m.last = now;
    if (a > 520) { IMPS.splice(i, 1); continue; }
    ctx.save(); ctx.lineJoin = 'round';
    if (a < 170) {                       // the star: full size at once, holds two frames, then snaps shut
      const k = a < 60 ? 1.15 : Math.max(0, 1 - (a - 60) / 110), R0 = (24 + m.tier * 10) * k, sp = 9;
      ctx.translate(m.x, m.y); ctx.rotate(m.rot);
      ctx.beginPath();
      for (let j = 0; j < sp * 2; j++) { const rr = j % 2 ? R0 * .42 : R0 * (j % 4 ? .8 : 1); const t = j / (sp * 2) * Math.PI * 2; j ? ctx.lineTo(Math.cos(t) * rr, Math.sin(t) * rr) : ctx.moveTo(Math.cos(t) * rr, Math.sin(t) * rr); }
      ctx.closePath(); ctx.fillStyle = a < 50 ? '#ffffff' : '#fff6c8'; ctx.fill();
      ctx.rotate(-m.rot);
      if (!lowFx()) {                     // thick wedges flying outward along the hit
        const L = (30 + m.tier * 14) * (a / 170), o = R0 * .6 + 10 * (a / 170);
        ctx.fillStyle = m.col; ctx.globalAlpha = 1 - a / 170;
        for (let j = -2; j <= 2; j++) { const t = m.ang + j * .45, c = Math.cos(t), s2 = Math.sin(t), px = -s2, py = c, w = 4 - Math.abs(j) + m.tier;
          ctx.beginPath(); ctx.moveTo(c * o + px * w, s2 * o + py * w); ctx.lineTo(c * (o + L), s2 * (o + L)); ctx.lineTo(c * o - px * w, s2 * o - py * w); ctx.closePath(); ctx.fill(); }
      }
      ctx.translate(-m.x, -m.y); ctx.globalAlpha = 1;
    }
    for (const q of m.sh) {               // the shards fall to the ground and hop once
      q.vy += 1100 * dt; q.x += q.vx * dt; q.y += q.vy * dt; q.r += q.vr * dt; q.vx *= 1 - 1.5 * dt;
      if (q.y > q.gy && q.vy > 0) { q.y = q.gy; q.vy *= -.35; q.vx *= .6; q.vr *= .5; }
      ctx.globalAlpha = a > 380 ? Math.max(0, 1 - (a - 380) / 140) : 1;
      ctx.save(); ctx.translate(q.x, q.y); ctx.rotate(q.r);
      ctx.beginPath(); ctx.moveTo(q.z, 0); ctx.lineTo(-q.z * .7, q.z * .65); ctx.lineTo(-q.z * .5, -q.z * .7); ctx.closePath();
      ctx.fillStyle = q.w; ctx.fill(); ctx.restore();
    }
    ctx.restore();
  }
}
let hurtAt = 0, hurtK = 0;
function drawHurtVignette(now) {        // screen space: the edges flash red for a moment when I am hit
  const a = now - hurtAt; if (a > 320 || !player || lowFx()) return;
  const k = hurtK * (1 - a / 320), g = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * .32, W / 2, H / 2, Math.max(W, H) * .72);
  g.addColorStop(0, 'rgba(255,40,40,0)'); g.addColorStop(1, 'rgba(255,40,40,' + (.55 * k).toFixed(3) + ')');
  ctx.save(); ctx.setTransform(DPR, 0, 0, DPR, 0, 0); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore();
}
const PRED = new WeakSet();
function predictHits() {                // guest only: my bullet is drawn touching an enemy, so burst it now; the server's own hit comes a ping later
  if (NET.role !== 'guest' || !player || player.dead) return;
  for (const b of bullets) {
    if (b.team !== player.team || PRED.has(b)) continue;
    for (const f of fighters) {
      if (!f || f.dead || f.team === player.team || f.form === 'gone') continue;
      if (Math.hypot(f.x - b.x, f.y + BODY - b.y) < 26 + (b.r || 6)) { PRED.add(b); const a = Math.atan2(b.vy || 0, b.vx || 1); impactPop(b.x, b.y, a, TC(player.team), 1); hitSnd(1, false); f.stg = { at: performance.now(), dir: Math.cos(a) >= 0 ? 1 : -1, s: .45, ka: a, tier: 1 }; f._hf = performance.now(); f._hfT = 60; break; }
    }
  }
}
const DEADS = new WeakMap();
function deathWatch() {                 // a kill holds the frame for a beat, rings out and booms; bigger when it is mine
  if (state !== 'play') return;
  for (const f of fighters) {
    if (!f || f.minion) continue;
    const was = DEADS.get(f); DEADS.set(f, !!f.dead);
    if (!f.dead || was !== false) continue;
    const near = player && Math.hypot(player.x - f.x, player.y - f.y) < 600, mine = player && f.killer === player, me = f === player;
    if (!near && !mine && !me) continue;
    const now = performance.now(), x = f.x, y = f.y + BODY;
    if (!NET.role && (mine || me)) hitStopUntil = Math.max(hitStopUntil, now + 130);
    if (typeof shakeFrom === 'function') shakeFrom(x, y, mine || me ? 10 : 4, 700);
    addP({ x, y, life: .3, color: '#ffffff', shape: 'flash', size: 170 });
    addP({ x, y, life: .45, color: TC(f.team), shape: 'ring', r0: 10, r1: 120, lw: 7 });
    snd({ n: mine || me ? .16 : .08, nt: 'lowpass', nf: 900, nd: .3, b: mine || me ? .3 : .14, bf: 110, be: 32, bd: .4 });
  }
}
function ultPunch(e) {                  // every ultimate: a hard shake and a deep whoomp, full size for my own, smaller for others near me
  const mine = player && Math.hypot(player.x - e.x, player.y + BODY - e.y) < 40, near = player && Math.hypot(player.x - e.x, player.y - e.y) < 700;
  if (!mine && !near) return;
  if (typeof shakeFrom === 'function') shakeFrom(e.x, e.y, mine ? 9 : 4, 900);
  snd({ n: mine ? .12 : .06, nt: 'lowpass', nf: 1200, nd: .35, b: mine ? .28 : .12, bf: 220, be: 40, bd: .45, bt: 'triangle' });
  if (mine) buzz(40);
}
