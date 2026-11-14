/* ===== 볼 배틀 (mode 'ball'): 3v3 on the pitch map (MAPS entry with ball:1). Nobody carries the ball: walking into it dribbles it, a dash kicks it,
   basic attacks and skills hit it (melee swings send it where you aim, shots along the shot, blasts away from the blast). A goal = the ball's centre
   inside a goal mouth (the floor tiles in column 1 / COLS-2). After a goal everyone goes back to their side for a kickoff after BALL_PAUSE s.
   First to MODE.win goals, or the most when the clock runs out; level = the usual overtime (next goal wins, a draw after OT_MAX).
   The host runs the ball; it rides in the mode snapshot (`bl`) and guests slide it along its speed between snapshots. ===== */
const BALL_R = 18, BALL_MAX = 1150, BALL_FRIC = 1, BALL_PAUSE = 3;
const BALL = { on: false, x: 0, y: 0, vx: 0, vy: 0, rot: 0, last: null, gt: -1, gy0: 0, gy1: 0, pp: new Map(), dx: 0, dy: 0, st: 0 };
function ballStart() {
  BALL.on = true; let r0 = 1e9, r1 = -1;
  for (let r = 1; r < ROWS - 1; r++) if (MAP[r][1] !== '#') { r0 = Math.min(r0, r); r1 = Math.max(r1, r); }
  if (r1 < 0) { r0 = (ROWS >> 1) - 2; r1 = r0 + 4; }
  BALL.gy0 = r0 * T; BALL.gy1 = (r1 + 1) * T; ballReset();
}
function ballReset() { Object.assign(BALL, { sci: -1, x: WW / 2, y: WH / 2, vx: 0, vy: 0, last: null, gt: -1, dx: WW / 2, dy: WH / 2 }); BALL.pp.clear(); }
const ballSpawn = (team, slot) => freeNear((team === 0 ? 4.5 : COLS - 4.5) * T, (ROWS / 2 + ((slot | 0) - 1) * 2.6) * T);
const ballGoalOf = t => ({ x: (t === 0 ? 1.2 : COLS - 1.2) * T, y: (BALL.gy0 + BALL.gy1) / 2 });      // the goal team t defends
/* every kick: the ball's speed along (nx, ny) becomes at least p (kicks do not stack into a rocket); by = who touched it last */
function ballKick(by, nx, ny, p) {
  if (!BALL.on || RD.pause > 0 || !(p > 0)) return;
  const d = Math.hypot(nx, ny); if (d < 1e-4) return; nx /= d; ny /= d;
  const vn = BALL.vx * nx + BALL.vy * ny; if (vn < p) { BALL.vx += nx * (p - vn); BALL.vy += ny * (p - vn); }
  const s = Math.hypot(BALL.vx, BALL.vy); if (s > BALL_MAX) { BALL.vx *= BALL_MAX / s; BALL.vy *= BALL_MAX / s; }
  const ow = by && (by.minion ? by.by : by); if (ow && ow.h) BALL.last = ow;
}
function ballArc(f, ang, range, half, kb) {
  const dx = BALL.x - f.x, dy = BALL.y - f.y, d = Math.hypot(dx, dy);
  if (d > range + BALL_R + 6) return;
  let da = Math.atan2(dy, dx) - ang; da = Math.atan2(Math.sin(da), Math.cos(da)); if (Math.abs(da) > half + .25 && d > 30) return;
  if (!los(f.x, f.y, BALL.x, BALL.y)) return;
  ballKick(f, Math.cos(ang), Math.sin(ang), clamp(720 + (kb || 0) * 1.2, 720, 1100));
}
function ballCirc(by, x, y, r, dmg, o) {
  if (!(dmg > 0) && !o.kb) return;
  const dx = BALL.x - x, dy = BALL.y - y, d = Math.hypot(dx, dy);
  if (d > r + BALL_R) return;
  const a = d > 8 ? null : (by && by.aim) || 0;
  ballKick(by, a === null ? dx : Math.cos(a), a === null ? dy : Math.sin(a), clamp((dmg > 12 || o.kb ? 380 : 240) + (o.kb || 0) * 1.6 + (dmg || 0) * 1.5, 240, 1050));
}
function ballPath(f, x0, y0, x1, y1, w) {
  const dx = x1 - x0, dy = y1 - y0, l2 = dx * dx + dy * dy || 1, t = clamp(((BALL.x - x0) * dx + (BALL.y - y0) * dy) / l2, 0, 1);
  if (Math.hypot(BALL.x - (x0 + dx * t), BALL.y - (y0 + dy * t)) > w + BALL_R) return;
  ballKick(f, dx, dy, 650);
}
/* a shot touching the ball: true = the shot stops there */
function ballShot(b) {
  if (b.hitBall || Math.hypot(BALL.x - b.x, BALL.y + BODY - b.y) >= BALL_R + (b.r || 5) + 6) return false;
  b.hitBall = 1; ballKick(b.owner, b.vx, b.vy, clamp(480 + (b.dmg || 0) * 5, 520, 1000));
  if (fxInView(b.x, b.y)) burst(BALL.x, BALL.y + BODY, '#ffffff', 5, 160);
  return !b.boom && !(b.pierce > 0);
}
function ballMove(dt) {
  const s = Math.hypot(BALL.vx, BALL.vy), n = Math.max(1, Math.ceil(s * dt / 10)), h = dt / n;
  for (let i = 0; i < n; i++) {
    BALL.x += BALL.vx * h;
    if (solidAt(BALL.x + Math.sign(BALL.vx) * BALL_R, BALL.y) || solidAt(BALL.x + Math.sign(BALL.vx) * BALL_R, BALL.y - BALL_R * .7) || solidAt(BALL.x + Math.sign(BALL.vx) * BALL_R, BALL.y + BALL_R * .7)) { BALL.x -= BALL.vx * h; BALL.vx *= -.72; }
    BALL.y += BALL.vy * h;
    if (solidAt(BALL.x, BALL.y + Math.sign(BALL.vy) * BALL_R) || solidAt(BALL.x - BALL_R * .7, BALL.y + Math.sign(BALL.vy) * BALL_R) || solidAt(BALL.x + BALL_R * .7, BALL.y + Math.sign(BALL.vy) * BALL_R)) { BALL.y -= BALL.vy * h; BALL.vy *= -.72; }
  }
  BALL.x = clamp(BALL.x, BALL_R, WW - BALL_R); BALL.y = clamp(BALL.y, BALL_R, WH - BALL_R);
  const k = Math.exp(-BALL_FRIC * dt); BALL.vx *= k; BALL.vy *= k; if (Math.hypot(BALL.vx, BALL.vy) < 6) BALL.vx = BALL.vy = 0;
  BALL.rot += Math.hypot(BALL.vx, BALL.vy) * dt / BALL_R * Math.sign(BALL.vx || 1);
}
/* bodies: walking into the ball dribbles it ahead a little faster than you walk; a dash kicks it */
function ballBodies(dt) {
  for (const f of fighters) {
    if (f.dead || f.ghost || f.form === 'gone' || f.form === 'sub' || (f.dash && f.dash.fly)) { BALL.pp.delete(f); continue; }
    const p = BALL.pp.get(f), fvx = p && dt > 0 ? (f.x - p[0]) / dt : 0, fvy = p && dt > 0 ? (f.y - p[1]) / dt : 0;
    BALL.pp.set(f, [f.x, f.y]);
    const dx = BALL.x - f.x, dy = BALL.y - f.y, d = Math.hypot(dx, dy), md = BALL_R + 20;
    if (d >= md) continue;
    const nx = d > 1e-3 ? dx / d : Math.cos(f.aim || 0), ny = d > 1e-3 ? dy / d : Math.sin(f.aim || 0);
    if (!solidAt(f.x + nx * md, f.y + ny * md)) { BALL.x = f.x + nx * md; BALL.y = f.y + ny * md; }
    const fv = Math.min(700, fvx * nx + fvy * ny);
    ballKick(f, nx, ny, f.dash ? 780 : Math.max(60, fv * 1.3 + 40));
  }
}
/* true while a goal is being celebrated (step() skips its own end checks then) */
function ballStep(dt) {
  if (!BALL.on) return false;
  ballMove(dt);
  if (RD.pause > 0) {
    RD.pause -= dt; BALL.vx *= .9; BALL.vy *= .9;
    if (RD.pause > 0) return true;
    const MODE = modeNow();
    if (score[0] >= MODE.win || score[1] >= MODE.win || (overtime && score[0] !== score[1])) { endGame(); return true; }
    ballKickoff(); return true;
  }
  ballBodies(dt);
  if (BALL.y > BALL.gy0 && BALL.y < BALL.gy1) {
    const t = BALL.x < 2 * T - BALL_R * .4 ? 1 : BALL.x > WW - 2 * T + BALL_R * .4 ? 0 : -1;      // into team 0's goal (left) = a goal for team 1
    if (t >= 0) {
      if (BALL.last && BALL.last.team === t) ballGoal(t);
      else {      // no own goals: the ball bounces back out of your own goal (2026-11-14, user)
        BALL.x = t === 1 ? 2 * T + BALL_R * .2 : WW - 2 * T - BALL_R * .2; BALL.vx = (t === 1 ? 1 : -1) * Math.max(380, Math.abs(BALL.vx) * .7);
        if (fxInView(BALL.x, BALL.y)) ring(BALL.x, BALL.y, 46, '#ffffff', .25);
      }
    }
  }
  return RD.pause > 0;
}
function ballGoal(t) {
  score[t]++; BALL.gt = t; RD.pause = BALL_PAUSE; BALL.vx *= .25; BALL.vy *= .25;
  const sc = BALL.last && BALL.last.team === t ? BALL.last : null; BALL.sci = sc ? fighters.indexOf(sc) : -1;
  if (sc) { sc.goals = (sc.goals | 0) + 1; addText({ x: sc.x, y: sc.y - 110, txt: '골!', life: 1.6, color: '#ffd34d' }); }
  const g = ballGoalOf(1 - t);
  fx('respawn', g.x, g.y - 20, { color: TC(t) }); burst(BALL.x, BALL.y, '#ffd34d', 26, 380); burst(BALL.x, BALL.y, TC(t), 18, 300);
  shake = Math.max(shake, 9); sfx(660, .5, 'triangle', .08, 1.6); later(.18, () => sfx(880, .45, 'triangle', .07, 1.4));
}
/* everybody back to their side, full health; the ball in the middle */
function ballKickoff() {
  ballReset(); bullets = []; zones = []; minions = []; strikes = []; timers = []; tempWalls.clear(); NET.mapVer++;
  for (const f of fighters) { f.queue = []; f.dash = null; if (f.h !== f.h0) { f.h = f.h0; f.sk = f.sk0; } respawn(f); f.inv = 1; }
}
/* bots: the one nearest the ball goes for it from behind (pushing / kicking it at the other goal), the next one comes along ahead of it,
   the last one waits between the ball and our goal and clears it when it comes close */
function ballBot(f) {
  if (curMode !== 'ball' || !BALL.on || f.dead || f.minion || B(f, 'charm') || state !== 'play') return null;
  if (RD.pause > 0) { const s = ballSpawn(f.team, f.slot); return pathTo(f, s.x, s.y); }
  const mates = fighters.filter(o => !o.dead && !o.minion && o.team === f.team).sort((a, b) => Math.hypot(a.x - BALL.x, a.y - BALL.y) - Math.hypot(b.x - BALL.x, b.y - BALL.y));
  const role = mates.indexOf(f), OG = ballGoalOf(f.team), EG = ballGoalOf(1 - f.team), bd = f.ai.bd || 1e9;
  const nearOwn = Math.hypot(BALL.x - OG.x, BALL.y - OG.y) < 7 * T;
  const last = role === mates.length - 1 && mates.length > 1;
  if (role === 0 || (last && nearOwn)) {
    if (bd < 1.0 * T) return null;      // somebody is in my face: fight
    const [dx, dy] = role === 0 && !(nearOwn && last) ? norm(EG.x - BALL.x, EG.y - BALL.y) : norm(BALL.x - OG.x, BALL.y - OG.y);
    const fx0 = BALL.x - f.x, fy0 = BALL.y - f.y, d = Math.hypot(fx0, fy0), along = fx0 * dx + fy0 * dy, side = fx0 * dy - fy0 * dx;
    if (along > 0 && Math.abs(side) < Math.max(34, along * .35)) {      // lined up behind the ball: run through it, and hit it
      const reach = f.h.type === 'melee' ? (f.h.range || 60) + BALL_R : Math.min(f.h.range || 400, 6 * T);
      if (d < reach) fire(f, Math.atan2(fy0, fx0));
      return pathTo(f, BALL.x + dx * 40, BALL.y + dy * 40);
    }
    const bx = BALL.x - dx * (BALL_R + 40), by = BALL.y - dy * (BALL_R + 40);
    if (d < 90 && along < 0) { const s = side >= 0 ? 1 : -1; return pathTo(f, bx - dy * s * 70, by + dx * s * 70); }      // on the wrong side: go round it
    return pathTo(f, bx, by);
  }
  if (last) {
    if (bd < 4 * T) return null;
    const [ux, uy] = norm(BALL.x - OG.x, BALL.y - OG.y); return pathTo(f, OG.x + ux * 3.5 * T, OG.y + uy * 3.5 * T);
  }
  if (bd < 5 * T) return null;
  const [ux, uy] = norm(EG.x - BALL.x, EG.y - BALL.y), sd = f.slot % 2 ? 1 : -1;
  const tx = clamp(BALL.x + ux * 3 * T - uy * sd * 2 * T, 2.5 * T, WW - 2.5 * T), ty = clamp(BALL.y + uy * 3 * T + ux * sd * 2 * T, 1.5 * T, WH - 1.5 * T);
  const p = freeNear(tx, ty); return pathTo(f, p.x, p.y);
}
/* ----- drawing ----- */
function drawPitch(c) {       // world space, on the floor: lines, centre circle, goal mouths with nets
  if (!BALL.on) return;
  const x0 = 2 * T, x1 = WW - 2 * T, y0 = T, y1 = WH - T, gy0 = BALL.gy0, gy1 = BALL.gy1;
  c.save(); c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = 5;
  c.strokeRect(x0, y0, x1 - x0, y1 - y0);
  c.beginPath(); c.moveTo(WW / 2, y0); c.lineTo(WW / 2, y1); c.stroke();
  c.beginPath(); c.arc(WW / 2, WH / 2, 1.8 * T, 0, 7); c.stroke();
  c.fillStyle = 'rgba(255,255,255,.6)'; c.beginPath(); c.arc(WW / 2, WH / 2, 7, 0, 7); c.fill();
  for (const s of [0, 1]) {
    const bx = s ? x1 - 3 * T : x0, gx = s ? x1 : T;
    c.strokeRect(bx, gy0 - T, 3 * T, gy1 - gy0 + 2 * T);
    c.beginPath(); c.arc(s ? x1 - 3 * T : x0 + 3 * T, WH / 2, T * .9, s ? Math.PI / 2 : -Math.PI / 2, s ? Math.PI * 1.5 : Math.PI / 2); c.stroke();
    c.fillStyle = TC(s); c.globalAlpha = .28; c.fillRect(gx, gy0, T, gy1 - gy0); c.globalAlpha = 1;
    c.save(); c.strokeStyle = 'rgba(255,255,255,.28)'; c.lineWidth = 2; c.beginPath();
    for (let y = gy0 + 14; y < gy1; y += 16) { c.moveTo(gx, y); c.lineTo(gx + T, y); }
    for (let x = gx + 14; x < gx + T; x += 16) { c.moveTo(x, gy0); c.lineTo(x, gy1); }
    c.stroke(); c.restore();
    c.strokeStyle = TC(s); c.lineWidth = 7; c.beginPath(); c.moveTo(gx + (s ? 0 : T), gy0); c.lineTo(gx + (s ? T : 0), gy0); c.lineTo(gx + (s ? T : 0), gy1); c.lineTo(gx + (s ? 0 : T), gy1); c.stroke();
    c.strokeStyle = '#ffffff'; c.lineWidth = 6; c.beginPath(); c.moveTo(s ? x1 : x0, gy0); c.lineTo(s ? x1 : x0, gy1); c.stroke();
    c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = 5;
  }
  c.restore();
}
function ballPos() {       // where to draw: the host draws the real ball; a guest slides it along its last known speed between snapshots
  if (NET.role !== 'guest') return [BALL.x, BALL.y];
  const now = performance.now(), e = clamp((now - BALL.st) / 1000, 0, .15), tx = BALL.x + BALL.vx * e, ty = BALL.y + BALL.vy * e, k = clamp(((now - (BALL.dt0 || now)) / 1000) * 18, 0, 1);
  BALL.dt0 = now; if (Math.hypot(tx - BALL.dx, ty - BALL.dy) > 3 * T) { BALL.dx = tx; BALL.dy = ty; } else { BALL.dx += (tx - BALL.dx) * k; BALL.dy += (ty - BALL.dy) * k; }
  BALL.rot += Math.hypot(BALL.vx, BALL.vy) * .016 / BALL_R * Math.sign(BALL.vx || 1);
  return [BALL.dx, BALL.dy];
}
function drawBall(c) {       // world space, after the walls and before the fighters
  if (!BALL.on) return;
  const [x, y] = ballPos(), s = Math.hypot(BALL.vx, BALL.vy);
  c.save();
  if (s > 260 && !lowFx()) { const [ux, uy] = norm(BALL.vx, BALL.vy), l = Math.min(70, s * .07); c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineCap = 'round'; c.lineWidth = BALL_R * 1.1; c.beginPath(); c.moveTo(x, y - 4); c.lineTo(x - ux * l, y - 4 - uy * l); c.stroke(); }
  c.fillStyle = 'rgba(0,0,0,.3)'; c.beginPath(); c.ellipse(x + 3, y + BALL_R - 3, BALL_R * 1.05, BALL_R * .4, 0, 0, 7); c.fill();
  c.translate(x, y - 4); c.fillStyle = '#ffffff'; c.strokeStyle = '#1b1d24'; c.lineWidth = 3; c.beginPath(); c.arc(0, 0, BALL_R, 0, 7); c.fill();
  c.save(); c.clip(); c.rotate(BALL.rot); c.fillStyle = '#1b1d24';
  c.beginPath(); for (let i = 0; i < 5; i++) { const a = i * 1.2566 - 1.5708; c.lineTo(Math.cos(a) * 6.5, Math.sin(a) * 6.5); } c.closePath(); c.fill();
  for (let i = 0; i < 5; i++) { const a = i * 1.2566 + .628; c.beginPath(); c.arc(Math.cos(a) * 16, Math.sin(a) * 16, 5.5, 0, 7); c.fill(); }
  c.restore(); c.beginPath(); c.arc(0, 0, BALL_R, 0, 7); c.stroke();
  c.fillStyle = 'rgba(255,255,255,.7)'; c.beginPath(); c.arc(-6, -7, 4, 0, 7); c.fill();
  c.restore();
}
function drawBallOverlay() {       // screen space: an arrow to the ball when it is off screen, and GOAL! after a goal
  if (!BALL.on || state !== 'play') return;
  const [bx, by] = ballPos(), sx = (bx - cam.x) * cam.s + W / 2, sy = (by - cam.y) * cam.s + H / 2, m = 34;
  if (sx < 0 || sy < 0 || sx > W || sy > H) {
    const ax = clamp(sx, m, W - m), ay = clamp(sy, m + 50, H - m), a = Math.atan2(sy - ay, sx - ax);
    ctx.save(); ctx.translate(ax, ay); ctx.fillStyle = 'rgba(12,14,19,.6)'; ctx.beginPath(); ctx.arc(0, 0, 17, 0, 7); ctx.fill();
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(0, 0, 9, 0, 7); ctx.fill(); ctx.rotate(a); ctx.beginPath(); ctx.moveTo(26, 0); ctx.lineTo(16, -8); ctx.lineTo(16, 8); ctx.closePath(); ctx.fill(); ctx.restore();
  }
  if (RD.pause > 0 && BALL.gt >= 0) {      // GOAL!: a slanted ribbon in the scoring team's colour, with the scorer's name
    const col = TC(BALL.gt), k = Math.min(W / 760, 1.25), sc = fighters[BALL.sci] && fighters[BALL.sci].team === BALL.gt ? fighters[BALL.sci] : null, nm = sc ? (sc.nick || sc.h0.name) : '';
    const txt = (s, x, y, size, fill, lw, font) => { ctx.font = (font || '800 ') + Math.round(size) + 'px Rajdhani, "Black Han Sans", "IBM Plex Sans KR", sans-serif'; ctx.lineWidth = lw; ctx.strokeStyle = '#0c0e13'; ctx.strokeText(s, x, y); ctx.fillStyle = fill; ctx.fillText(s, x, y); };
    ctx.save(); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
    ctx.translate(W / 2, H * .46); ctx.rotate(-.08);
    ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fillRect(-W, 8 * k, W * 2, 110 * k);
    const g = ctx.createLinearGradient(-W / 2, 0, W / 2, 0); g.addColorStop(0, col); g.addColorStop(.5, '#ffffff'); g.addColorStop(1, col);
    ctx.fillStyle = col; ctx.fillRect(-W, -60 * k, W * 2, 120 * k); ctx.globalAlpha = .25; ctx.fillStyle = g; ctx.fillRect(-W, -60 * k, W * 2, 120 * k); ctx.globalAlpha = 1;
    ctx.fillStyle = '#ffd34d'; ctx.fillRect(-W, -66 * k, W * 2, 6 * k); ctx.fillRect(-W, 60 * k, W * 2, 6 * k);
    txt('GOAL!', 0, -6 * k, 96 * k, '#ffffff', 12 * k);
    txt(nm ? nm + ' 골!' : BALL.gt === VIEW ? '우리 팀 골!' : '상대 팀 골', 0, 44 * k, 22 * k, '#ffd34d', 6 * k, '700 ');
    ctx.restore();
  }
}
