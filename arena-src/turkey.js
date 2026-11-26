/* ===== 칠면조 잡기 (mode 'turkey', season "The key of Turkey", user 2026-11-25): 3v3, 3:00. A turkey appears in the middle of the map; whoever lands
   the last hit on it scores 1 for their team and 1 for themselves (f.tk). The next turkey comes TK_GAP s later. Most turkeys when the clock runs out wins;
   a tie goes to the usual overtime (next turkey wins). Kills give no points here. The turkey is a minion of no team (TK_TEAM) that both teams can hit:
   it rides in the host snapshot like any minion (kind 'turkey'), so guests draw it with no extra net code. Each player keeps their own count as
   칠면조 다리 (season currency, social.js COS.tl) at the end of the match. Numbers here are placeholders the user may change. ===== */
const TK_TEAM = 9, TK_HP = 300, TK_GAP = 6, TK_FIRST = 3, TK_SPD = 150, TK_FLEE = 4.2, TK_ROAM = 5.5;
const TK = { on: false, next: 0, n: 0 };
function turkeyStart() { Object.assign(TK, { on: true, next: TK_FIRST, n: 0 }); for (const f of fighters) f.tk = 0; }
function turkeyAlive() { return minions.find(m => m.kind === 'turkey' && !m.dead); }
function turkeySpawn() {
  const p = freeNear(WW / 2, WH / 2);
  minion({ kind: 'turkey', team: TK_TEAM, hit: true, both: true, hp: TK_HP, t: 1e9, x: p.x, y: p.y, cx: p.x, cy: p.y, a: 0, wt: 0, wx: p.x, wy: p.y, last: null, upd: turkeyUpd, onDmg: turkeyHit });
  TK.n++; fx('blink', p.x, p.y + 10, { color: '#f2c14e', gy: p.y + 16 }); burst(p.x, p.y, '#f2c14e', 18, 260);
  addText({ x: p.x, y: p.y - 70, txt: '칠면조 등장!', life: 1.4, color: '#ffd08a' }); sfx(520, .25, 'triangle', .07);
}
/* wanders near the middle; runs from the nearest fighter that comes close */
function turkeyUpd(m, dt) {
  let near = null, nd = TK_FLEE * T;
  for (const f of fighters) if (!f.dead && !f.minion) { const d = Math.hypot(f.x - m.x, f.y - m.y); if (d < nd) { nd = d; near = f; } }
  let dx, dy, sp = TK_SPD;
  if (near) { dx = m.x - near.x; dy = m.y - near.y; sp = TK_SPD * 1.15; if (Math.hypot(m.x - m.cx, m.y - m.cy) > TK_ROAM * T) { dx += (m.cx - m.x) * .8; dy += (m.cy - m.y) * .8; } }
  else { m.wt -= dt; if (m.wt <= 0 || Math.hypot(m.wx - m.x, m.wy - m.y) < 12) { m.wt = 1.2 + Math.random() * 1.6; const a = Math.random() * 6.283, r = Math.random() * TK_ROAM * T * .7; m.wx = m.cx + Math.cos(a) * r; m.wy = m.cy + Math.sin(a) * r; } dx = m.wx - m.x; dy = m.wy - m.y; sp = TK_SPD * .55; }
  if (B(m, 'slow')) sp *= .55;
  const d = Math.hypot(dx, dy); if (d < 1) return;
  const vx = dx / d * sp * dt, vy = dy / d * sp * dt, ok = (x, y) => ![[-14, -10], [14, -10], [-14, 12], [14, 12]].some(([ox, oy]) => blockedAt(x + ox, y + oy));
  if (ok(m.x + vx, m.y)) m.x += vx; else m.wt = 0;
  if (ok(m.x, m.y + vy)) m.y += vy; else m.wt = 0;
  m.x = clamp(m.x, T * 1.4, WW - T * 1.4); m.y = clamp(m.y, T * 1.4, WH - T * 1.4); m.a = Math.atan2(dy, dx); m.bob = (m.bob || 0) + dt * (near ? 14 : 7);
}
function turkeyHit(m, dmg, by) {
  const ow = by && (by.minion ? by.by : by); if (ow && ow.h) m.last = ow;
  m.hp -= dmg; m.hitT = time;
  addText({ x: m.x + (Math.random() - .5) * 20, y: m.y - 50, txt: String(Math.round(dmg)), life: .6, color: '#fff3d0', small: 1 });
  if (m.hp <= 0 && !m.dead) {
    m.dead = true; const k = m.last; burst(m.x, m.y, '#e8892e', 24, 320); burst(m.x, m.y, '#f2c14e', 14, 240);
    if (k && score[k.team] != null && state === 'play') { score[k.team]++; k.tk = (k.tk | 0) + 1; say(k, '+1 칠면조!', '#ffd08a'); }
    TK.next = TK_GAP; sfx(880, .2, 'triangle', .08);
  }
  return dmg;
}
/* the mode's clock: no early win; the clock, then overtime (next turkey wins, a draw after OT_MAX) */
function turkeyStep(dt) {
  if (!TK.on) return;
  if (!turkeyAlive()) { TK.next -= dt; if (TK.next <= 0) turkeySpawn(); }
  if (overtime) otT += dt; else timeLeft = Math.max(0, timeLeft - dt);
  if (overtime) { if (score[0] !== score[1] || otT >= OT_MAX) endGame(); }
  else if (timeLeft <= 0) { if (score[0] !== score[1]) endGame(); else startOvertime(); }
}
/* drawn by tail.js drawMinion (kind 'turkey'): fan tail, body, head; flat fills, no outlines */
function drawTurkeyArt(c, s, t, hit) {
  c.save(); c.scale(s / 40, s / 40);
  c.fillStyle = 'rgba(0,0,0,.22)'; c.beginPath(); c.ellipse(0, 30, 30, 9, 0, 0, 7); c.fill();
  const F = ['#8a4a24', '#c0582a', '#e8892e', '#f2c14e', '#e8892e', '#c0582a', '#8a4a24'];
  for (let i = 0; i < 7; i++) { const a = -1.25 + i * 2.5 / 6 + Math.sin(t * 3 + i) * .03; c.save(); c.rotate(a); c.fillStyle = F[i]; c.beginPath(); c.ellipse(0, -30, 10, 26, 0, 0, 7); c.fill(); c.fillStyle = i % 2 ? '#fff3d0' : '#f8d88a'; c.beginPath(); c.ellipse(0, -50, 6, 6, 0, 0, 7); c.fill(); c.fillStyle = F[i]; c.beginPath(); c.ellipse(0, -50, 3, 3, 0, 0, 7); c.fill(); c.restore(); }
  const st = Math.sin(t) * 3;
  c.fillStyle = '#f2a93b'; c.fillRect(-11, 20, 5, 11 + st * .5); c.fillRect(6, 20, 5, 11 - st * .5);
  c.fillStyle = hit ? '#b06a40' : '#6e3b1c'; c.beginPath(); c.ellipse(0, 6, 22, 20, 0, 0, 7); c.fill();
  c.fillStyle = '#8f5028'; c.beginPath(); c.ellipse(-12, 8, 10, 14, .35, 0, 7); c.fill(); c.beginPath(); c.ellipse(12, 8, 10, 14, -.35, 0, 7); c.fill();
  c.fillStyle = '#7a4422'; c.beginPath(); c.ellipse(0, -10, 8, 12, 0, 0, 7); c.fill();
  c.fillStyle = '#f0c6b4'; c.beginPath(); c.arc(0, -20, 9, 0, 7); c.fill();
  c.fillStyle = '#e23b3b'; c.beginPath(); c.ellipse(3, -11, 3.5, 6, 0, 0, 7); c.fill(); c.beginPath(); c.ellipse(-1, -29, 2.5, 4, 0, 0, 7); c.fill();
  c.fillStyle = '#f2a93b'; c.beginPath(); c.moveTo(-3, -18); c.lineTo(3, -18); c.lineTo(0, -13); c.fill();
  c.fillStyle = '#1a1410'; c.beginPath(); c.arc(-4, -22, 1.8, 0, 7); c.arc(4, -22, 1.8, 0, 7); c.fill();
  c.restore();
}
function drawTurkeyMinion(m) {
  ctx.save(); ctx.translate(0, -6); if (Math.cos(m.a || 0) < 0) ctx.scale(-1, 1);
  drawTurkeyArt(ctx, 34, m.bob || time * 4, m.hitT && time - m.hitT < .08); ctx.restore();
  const w = 64, f = Math.max(0, m.hp / (m.max || 1));      // its health bar
  ctx.fillStyle = 'rgba(20,12,6,.75)'; ctx.fillRect(-w / 2 - 2, -72, w + 4, 10); ctx.fillStyle = '#ffd08a'; ctx.fillRect(-w / 2, -70, w * f, 6);
  ctx.font = "800 12px 'IBM Plex Sans KR',sans-serif"; ctx.textAlign = 'center'; ctx.fillStyle = '#fff'; ctx.fillText('칠면조', 0, -78);
}
/* the drumstick icon (칠면조 다리) as a data URL, for CSS (.ic-leg) and the reward cards */
const LEG_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><g transform="rotate(-40 24 24)"><rect x="21" y="22" width="6" height="20" rx="3" fill="#f3ead8"/><circle cx="20" cy="42" r="4" fill="#f3ead8"/><circle cx="28" cy="42" r="4" fill="#f3ead8"/><path d="M24 2c9 0 14 7 14 14 0 6-4 10-8 10h-12c-4 0-8-4-8-10 0-7 5-14 14-14z" fill="#b8662e"/><path d="M18 7c3-2 7-2 9-1-4 1-7 4-8 8-2-1-2-5-1-7z" fill="#d98a46"/><rect x="16" y="22" width="16" height="4" rx="2" fill="#8f4a1f"/></g></svg>';
function turkeyIcon(sz) { const cv = document.createElement('canvas'); cv.width = cv.height = sz * 2; cv.style.width = cv.style.height = sz + 'px'; const g = cv.getContext('2d'); g.translate(sz, sz * 1.08); drawTurkeyArt(g, sz * .62, 0, false); return cv; }
/* the line under the score bar in 칠면조 잡기: my turkeys and the legs they are worth (head.html #tkHud, inside #hud) */
function tkHudUpd(p) {
  const el = document.getElementById('tkHud'); if (!el) return; const on = curMode === 'turkey';
  if (el.hidden === on) el.hidden = !on; if (!on) return;
  const n = p.tk | 0; if (el.dataset.n !== String(n)) { el.dataset.n = n; el.querySelector('b').textContent = n; el.querySelector('.tkL').textContent = '+' + n; }
}
