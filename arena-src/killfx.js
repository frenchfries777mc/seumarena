/* ===== killfx.js: the match-winning knock-out in slow motion, and shots that spark off walls =====
   Slow motion is only on screen: the match itself is already over (state 'over' stops the host's simulation), so nothing the
   others see is slowed. The result screen comes up once it has played. */
let FX_TS = 1, KCAM = null, lastKO = null;
const addFeed0 = addFeed;
addFeed = function (owner, victim, src) { if (victim && !victim.minion) lastKO = { f: victim, by: owner || null, at: performance.now() }; return addFeed0.apply(this, arguments); };
const endGame0 = endGame, KC_MS = 1250;      // 0.3s of the fight, played at a quarter speed
endGame = function (keep) {
  if (keep === true || KCAM || DED || state !== 'play') return endGame0.apply(this, arguments);
  const k = lastKO && performance.now() - lastKO.at < 700 ? lastKO : null;
  if (!k) return endGame0.apply(this, arguments);
  state = 'over';
  if (NET.role === 'guest' && NET.stats) try { applyMatchStats(NET.stats); } catch (e) {}      // (the connection is closed before the result screen comes up)
  const v = k.f, by = k.by && !k.by.dead && Math.hypot(k.by.x - v.x, k.by.y - v.y) < 9 * T ? k.by : null;
  KCAM = { t0: performance.now(), x: by ? (v.x + by.x) / 2 : v.x, y: (by ? (v.y + by.y) / 2 : v.y) + BODY, vx: v.x, vy: v.y + BODY, col: TC(by ? by.team : 1 - v.team), done: false };
  kcamSound();
  try { showPlayUi(false); } catch (e) {}
  setTimeout(() => { KCAM = null; FX_TS = 1; endGame0.call(null, keep); }, KC_MS);
};
function kcamSound() {      // a deep slowed-down boom with a falling ring over it
  if (!ac || muted) return;
  try {
    const t = ac.currentTime, v = (typeof SET === 'object' && SET.vol != null ? SET.vol / 100 : 1);
    const tone = (f0, f1, d, type, g0) => { const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + d); g.gain.setValueAtTime(g0 * v, t); g.gain.exponentialRampToValueAtTime(.0001, t + d); o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + d); };
    tone(110, 32, 1.1, 'sine', .22); tone(1320, 330, .9, 'triangle', .05); tone(660, 160, .7, 'sawtooth', .025);
  } catch (e) {}
}
function kcamK() { return KCAM ? Math.min(1, (performance.now() - KCAM.t0) / KC_MS) : 0; }
function kcamCam() {      // (tail.js render, after the camera is placed) ease in on the knock-out
  if (!KCAM) return;
  const k = kcamK(), e = k < .2 ? k / .2 : 1, z = 1 + .35 * e * (2 - e);
  FX_TS = k < .85 ? .25 : .25 + (k - .85) / .15 * .75;
  cam.x += (KCAM.x - cam.x) * e; cam.y += (KCAM.y - cam.y) * e; cam.s *= z;
  if (!KCAM.done) { KCAM.done = true; if (typeof addP === 'function') { const n = fxLow() ? 8 : 18; for (let i = 0; i < n; i++) { const a = i / n * 6.283, s = RND(260, 520); addP({ x: KCAM.vx, y: KCAM.vy, vx: Math.cos(a) * s, vy: Math.sin(a) * s, drag: 2.4, life: RND(.5, .8), size: RND(2.6, 4), color: i % 3 ? KCAM.col : '#ffffff', shape: 'streak' }); } } }
}
function kcamOverlay() {      // (tail.js render, screen space) white flash, dark bars top and bottom, edges dimmed, speed lines toward the knock-out
  if (!KCAM) return;
  const k = kcamK(), c = ctx, sx = (KCAM.vx - cam.x) * cam.s + W / 2, sy = (KCAM.vy - cam.y) * cam.s + H / 2;
  c.save();
  if (k < .12) { c.globalAlpha = (1 - k / .12) * .55; c.fillStyle = '#fff'; c.fillRect(0, 0, W, H); }
  const bar = H * .09 * Math.min(1, k / .15) * (k > .9 ? (1 - k) / .1 : 1);
  c.globalAlpha = 1; c.fillStyle = '#000'; c.fillRect(0, 0, W, bar); c.fillRect(0, H - bar, W, bar);
  if (!fxLow()) {
    const g = c.createRadialGradient(sx, sy, Math.min(W, H) * .2, sx, sy, Math.max(W, H) * .75);
    g.addColorStop(0, 'rgba(10,12,20,0)'); g.addColorStop(1, 'rgba(10,12,20,.55)'); c.fillStyle = g; c.fillRect(0, 0, W, H);
    c.globalAlpha = .35 * (1 - k); c.strokeStyle = '#fff'; c.lineWidth = 2; c.beginPath();
    const R = Math.max(W, H), sd = Math.floor(performance.now() / 70);
    for (let i = 0; i < 22; i++) { const a = i / 22 * 6.283 + ((sd * 7 + i * 13) % 10) * .02, r0 = R * (.32 + ((i * 37 + sd) % 9) * .02); c.moveTo(sx + Math.cos(a) * r0, sy + Math.sin(a) * r0); c.lineTo(sx + Math.cos(a) * R, sy + Math.sin(a) * R); }
    c.stroke();
  }
  c.restore();
}

/* a shot stopped by a wall: hot sparks thrown back off the face it hit, chips of the wall, a scorch that fades, and a short tink.
   side: 1 the wall was hit from the left/right (an x face), 2 from above/below (a y face), 0 a corner */
let wsTink = 0;
const wsMarks = [];
FXF.wspark = (x, y, ang, side, col) => {
  if (!fxInView(x, y)) return;
  let nx = -Math.cos(ang), ny = -Math.sin(ang);
  if (side === 1) { nx = Math.sign(nx) || 1; ny = 0; } else if (side === 2) { ny = Math.sign(ny) || 1; nx = 0; }
  const rf = side === 1 ? Math.atan2(Math.sin(ang), -Math.cos(ang)) : side === 2 ? Math.atan2(-Math.sin(ang), Math.cos(ang)) : ang + Math.PI;      // the bounce angle
  const low = fxLow(), wc = (TH && TH.wt) || '#8a8f9c';
  for (let i = 0; i < (low ? 5 : 11); i++) { const a = rf + RND(-.55, .55), s = RND(260, 620); addP({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, drag: 3.4, life: RND(.12, .26), size: RND(1.6, 2.8), color: i % 3 ? '#ffe28a' : i % 2 ? col : '#ffffff', shape: 'streak' }); }
  for (let i = 0; i < (low ? 2 : 5); i++) { const a = Math.atan2(ny, nx) + RND(-1, 1), s = RND(90, 230); addP({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, drag: 4, grav: 420, life: RND(.3, .5), size: RND(2.4, 4), color: wc, shape: 'square', vr: RND(-12, 12) }); }
  addP({ x, y, life: .12, color: '#ffffff', shape: 'ring', r0: 2, r1: 14, lw: 2 });
  if (!low) { wsMarks.push({ x: x - nx * 2, y: y - ny * 2, t: performance.now(), col }); if (wsMarks.length > 24) wsMarks.shift(); }
  const now = performance.now();
  if (now - wsTink > 70 && typeof sfx === 'function') { wsTink = now; sfx(RND(1900, 2600), .045, 'triangle', .022, .55); sfx(RND(380, 520), .05, 'square', .012, .5); }
};
function drawWallMarks(c) {      // (drawn with the particles) a small glowing scorch where the shot hit, cooling from orange to dark
  const now = performance.now();
  for (let i = wsMarks.length - 1; i >= 0; i--) {
    const m = wsMarks[i], a = (now - m.t) / 700;
    if (a >= 1) { wsMarks.splice(i, 1); continue; }
    c.globalAlpha = (1 - a) * .9; c.fillStyle = a < .3 ? '#ffd27a' : '#ff7a3d'; c.beginPath(); c.arc(m.x, m.y, 4.5 - a * 2, 0, 6.283); c.fill();
    c.globalAlpha = (1 - a) * .35; c.fillStyle = '#1a1410'; c.beginPath(); c.arc(m.x, m.y, 7, 0, 6.283); c.fill();
  }
  c.globalAlpha = 1;
}
