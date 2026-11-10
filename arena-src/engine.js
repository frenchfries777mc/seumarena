/* ===== arena engine ===== */
const T = 64, BODY = -14, U = .6;
const MAPS = [
  { id:'roof', name:'옥상 정원', desc:'가운데 화단을 두고 맞붙는 기본 맵. 양옆 풀숲으로 돌아 들어가기 좋습니다.',
    th:{ f1:'#2a2850', f2:'#2f2d5b', wt:'#f4b942', ws:'#c98a1b', b1:'#1f9d78', b2:'#2fc797', wa:'#3a7fc4', wa2:'#63a4e0' },
    rows:['#############','#............','#..gg....##..','#..gg........','#......#....g','#..#...#....g','#..#.......##','#....gg......','#....gg...#..','#....gg......','#..#.......##','#..#...#....g','#......#....g','#..gg........','#..gg....##..','#............','#############'] },
  { id:'ruins', name:'사막 유적', desc:'기둥이 드문드문 선 탁 트인 맵. 원거리 캐릭터가 유리합니다.',
    th:{ f1:'#b99a62', f2:'#c2a46c', wt:'#8a5a3c', ws:'#5e3a24', b1:'#5f8234', b2:'#7fa646', wa:'#3a7fc4', wa2:'#63a4e0' },
    rows:['#############','#............','#....#....g..','#....#....g..','#.......#....','#..gg...#...#','#..gg.......#','#.....##.....','#.....##..g..','#.....##.....','#..gg.......#','#..gg...#...#','#.......#....','#....#....g..','#....#....g..','#............','#############'] },
  { id:'lake', name:'얼음 호수', desc:'한가운데 호수는 걸어서 건널 수 없지만 총알은 지나갑니다.',
    th:{ f1:'#9fc0d6', f2:'#abcbe0', wt:'#6f8fb0', ws:'#4b6887', b1:'#2f7f6c', b2:'#4aa58e', wa:'#2f6fb3', wa2:'#5c9bd6' },
    rows:['#############','#............','#..##.....gg.','#.........gg.','#.....ww.....','#.....ww...#.','#...........w','#..g......www','#..g..#...www','#..g......www','#...........w','#.....ww...#.','#.....ww.....','#.........gg.','#..##.....gg.','#............','#############'] },
  { id:'forge', name:'용암 공장', desc:'벽이 많은 좁은 통로. 용암 웅덩이는 건널 수 없고, 근접 캐릭터가 숨어들기 좋습니다.',
    th:{ f1:'#2b2b30', f2:'#323238', wt:'#7a7f8c', ws:'#4b4f5a', b1:'#5a4a3a', b2:'#7a6450', wa:'#e2551a', wa2:'#ffb347' },
    rows:['#############','#............','#.###..#..w..','#......#..w..','#..g...#.....','#..g.......##','#.....##.....','#.....#...g..','#.........g.#','#.....#...g..','#.....##.....','#..g.......##','#..g...#.....','#......#..w..','#.###..#..w..','#............','#############'] },
  { id:'forest', name:'숲속 미로', desc:'풀숲이 가득한 맵. 숨어 있다가 기습하기 좋습니다.',
    th:{ f1:'#2f5d3a', f2:'#356642', wt:'#7a5634', ws:'#4a321e', b1:'#1c7a3f', b2:'#27a153', wa:'#3a7fc4', wa2:'#63a4e0' },
    rows:['#############','#............','#.gg..#..ggg.','#.gg..#..ggg.','#.........#..','#....gg...#..','#..#.gg......','#..#......gg.','#.......#.gg.','#..#......gg.','#..#.gg......','#....gg...#..','#.........#..','#.gg..#..ggg.','#.gg..#..ggg.','#............','#############'] }
];
for (const m of MAPS) m.grid = m.rows.map(r => r + [...r.slice(0, 12)].reverse().join(''));
const COLS = 25, ROWS = 17, WW = COLS * T, WH = ROWS * T;
let MAP = MAPS[0].grid, TH = MAPS[0].th, ROAM = [], curMap = 0;
const tempWalls = new Map();
const tile = (c, r) => { if (c < 0 || r < 0 || c >= COLS || r >= ROWS) return '#'; if (tempWalls.size && tempWalls.get(c + r * COLS) > time) return '#'; return MAP[r][c]; };
const solid = (c, r) => tile(c, r) === '#';
const blocked = (c, r) => { const t = tile(c, r); return t === '#' || t === 'w'; };
const solidAt = (x, y) => solid(Math.floor(x / T), Math.floor(y / T));
const blockedAt = (x, y) => blocked(Math.floor(x / T), Math.floor(y / T));
const bushAt = (x, y) => tile(Math.floor(x / T), Math.floor(y / T)) === 'g';
const TEAM = ['#4d9dff', '#ff5d5d'];
/* online state (net.js): the host runs the match, guests draw what it sends */
const NET = { role: null, peer: null, conns: [], hostConn: null, members: [], phase: 'idle', rec: false, evs: [], room: -1, me: -1, mapVer: 0 };
let VIEW = 0;      // the team this screen plays for: drawn blue, its score on the left
const TC = t => TEAM[t === VIEW ? 0 : 1];
const evt = a => { if (NET.rec) NET.evs.push(a); };
function addText(o) { texts.push(o); evt(['t', Math.round(o.x), Math.round(o.y), o.txt, o.color, o.small ? 1 : 0, o.life]); }
function addPart(p) { parts.push(p); evt(['p', Math.round(p.x), Math.round(p.y), Math.round(p.vx), Math.round(p.vy), +p.life.toFixed(2), p.color, +(p.r || 3).toFixed(1)]); }
const WIN_SCORE = 10, MATCH_TIME = 150, MAX_HP = 600, ULT_CD = 20, CD1 = 5, CD2 = 10, DASH_D = 3.2 * T, SPEED = 205;

const rnd = (a, b) => a + Math.random() * (b - a);
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const pick = a => a[Math.floor(Math.random() * a.length)];
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const angTo = (a, b) => Math.atan2(b.y - a.y, b.x - a.x);
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- state ---------- */
const cv = document.getElementById('game'), ctx = cv.getContext('2d');
let W = 0, H = 0, DPR = 1;
let state = 'menu', time = 0, timeLeft = MATCH_TIME, score = [0, 0];
let fighters = [], bullets = [], parts = [], texts = [], rings = [], zones = [], minions = [], timers = [], strikes = [], player = null;
let bulletSeq = 0, AUTO = false, chosen = 'sword', mapChoice = -1, shake = 0, loadouts = {};
const cam = { x: WW / 2, y: WH / 2, s: 1 };
const keys = {}, mouse = { x: 0, y: 0, down: false };
let touchMode = false, stickM = null, stickA = null, pendingFire = null, wantUlt = false, wantDash = false, wantSk = [false, false];

function resize() {
  DPR = Math.min(window.devicePixelRatio || 1, 2);
  W = window.innerWidth; H = window.innerHeight;
  cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
}
addEventListener('resize', resize); resize();

let ac = null, muted = false;
function sfx(freq, dur, type, vol, slide) {
  if (!ac || muted || state !== 'play') return;
  try {
    const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime;
    o.type = type || 'square'; o.frequency.setValueAtTime(freq, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq * slide), t + dur);
    g.gain.setValueAtTime(vol || .05, t); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + dur);
  } catch (e) {}
}

/* ---------- buffs ---------- */
const B = (f, k) => { const o = f.b[k]; return !!o && o.t > 0; };
const V = (f, k, d) => { const o = f.b[k]; return o && o.t > 0 ? o.v : d; };
function buff(f, k, t, v) {
  if (f.minion && k !== 'stun' && k !== 'slow' && k !== 'root') return;
  const o = f.b[k];
  if (o && o.t > 0 && k === 'slow' && o.v < v && o.t > t) return;
  if (!f.minion && !f.dead && !(o && o.t > 0) && (k === 'stun' || (k === 'slow' && t >= .5)) && typeof fxAt === 'function' && state !== 'menu') fxAt(f, k);
  f.b[k] = { t, v: v === undefined ? 1 : v };
}
const unbuff = (f, k) => { if (f.b[k]) f.b[k].t = 0; };
const teamOf = f => B(f, 'charm') ? f.b.charm.v.team : f.team;
function foes(f) {
  const tm = teamOf(f), out = [];
  for (const e of fighters) if (e !== f && !e.dead && e.team !== tm && !e.ghost) out.push(e);
  for (const m of minions) if (m.hit && !m.dead && (m.team !== tm || m.both)) out.push(m);
  return out;
}
const allies = f => fighters.filter(e => !e.dead && e.team === f.team);
function status(e, o) {
  if (o.stun) buff(e, 'stun', o.stun);
  if (o.root) buff(e, 'root', o.root);
  if (o.mute) buff(e, 'mute', o.mute);
  if (o.slow) buff(e, 'slow', o.slow[1], o.slow[0]);
  if (o.burn) e.dots && e.dots.push({ t: o.burn[1], dps: o.burn[0], by: o.by, kind: 'fire', tick: .5 });
  if (o.infect) buff(e, 'infect', 5, o.by);
}
function heal(f, n) { if (f.dead || n <= 0) return; if (f.h.healMul) n *= f.h.healMul(f); const b = f.hp; f.hp = Math.min(f.mhp, f.hp + n); if (f.hp - b >= 3) fx('heal', f.x, f.y - 40, { v: Math.round(f.hp - b) }); }
function say(f, txt, col) { addText({ x: f.x, y: f.y - 96, txt, life: 1, color: col || '#ffd34d', small: 1 }); }
function later(t, fn, f) { timers.push({ t, fn, f }); }
function seq(f, n, gap, fn) { for (let i = 0; i < n; i++) later(i * gap, () => fn(i), f); }

/* ---------- world helpers ---------- */
const spawnPos = (team, slot) => ({ x: (team === 0 ? 1.5 : COLS - 1.5) * T, y: (6.5 + slot * 2) * T });
function los(ax, ay, bx, by, walk) {
  const d = Math.hypot(bx - ax, by - ay), n = Math.ceil(d / 14), test = walk ? blockedAt : solidAt;
  for (let i = 1; i < n; i++) { const t = i / n; if (test(ax + (bx - ax) * t, ay + (by - ay) * t)) return false; }
  return true;
}
function losWide(ax, ay, bx, by) {
  const d = Math.hypot(bx - ax, by - ay) || 1, px = -(by - ay) / d * 20, py = (bx - ax) / d * 20;
  return los(ax, ay, bx, by, 1) && los(ax + px, ay + py, bx + px, by + py, 1) && los(ax - px, ay - py, bx - px, by - py, 1);
}
function visibleTo(f, team) {
  if (f.minion || f.team === team) return true;
  if (f.form === 'sub' || f.form === 'gone') return false;
  if (B(f, 'reveal')) return true;
  const hidden = B(f, 'stealth'), bush = bushAt(f.x, f.y);
  if (!hidden && !bush) return true;
  if (!hidden && (time - f.lastFire < .8 || time - f.lastHit < .8)) return true;
  const near = (hidden ? 1.5 : 2.3) * T;
  for (const o of fighters) if (o.team === team && !o.dead && Math.hypot(o.x - f.x, o.y - f.y) < near) return true;
  return false;
}
function bfs(gc, gr) {
  const d = new Int16Array(COLS * ROWS).fill(-1), q = [gc + gr * COLS];
  d[q[0]] = 0;
  for (let i = 0; i < q.length; i++) {
    const cur = q[i], c = cur % COLS, r = (cur / COLS) | 0;
    for (const [dc, dr] of [[1,0],[-1,0],[0,1],[0,-1]]) {
      const nc = c + dc, nr = r + dr;
      if (blocked(nc, nr)) continue;
      const ni = nc + nr * COLS;
      if (d[ni] < 0) { d[ni] = d[cur] + 1; q.push(ni); }
    }
  }
  return d;
}
const norm = (x, y) => { const d = Math.hypot(x, y); return d > 1e-4 ? [x / d, y / d] : [0, 0]; };
function pathTo(f, gx, gy) {
  if (losWide(f.x, f.y, gx, gy)) return norm(gx - f.x, gy - f.y);
  const a = f.ai, gc = clamp(Math.floor(gx / T), 0, COLS - 1), gr = clamp(Math.floor(gy / T), 0, ROWS - 1);
  if (blocked(gc, gr)) return norm(gx - f.x, gy - f.y);
  if (!a.dist || time > a.pathNext || gc !== a.gc || gr !== a.gr) { a.dist = bfs(gc, gr); a.pathNext = time + .4; a.gc = gc; a.gr = gr; }
  const c = Math.floor(f.x / T), r = Math.floor(f.y / T);
  let best = a.dist[c + r * COLS], bc = c, br = r;
  for (const [dc, dr] of [[1,0],[-1,0],[0,1],[0,-1]]) {
    const nc = c + dc, nr = r + dr;
    if (blocked(nc, nr)) continue;
    const d = a.dist[nc + nr * COLS];
    if (d >= 0 && (best < 0 || d < best)) { best = d; bc = nc; br = nr; }
  }
  if (bc === c && br === r) return norm(gx - f.x, gy - f.y);
  return norm((bc + .5) * T - f.x, (br + .5) * T - f.y);
}
const flying = f => B(f, 'fly') || (f.dash && f.dash.fly);
function moveFighter(f, dx, dy) {
  const ox = f.x, oy = f.y, r = 20, fl = flying(f), blk = fl ? solid : blocked;
  f.x += dx; f.y += dy;
  for (let it = 0; it < 2; it++) {
    const c0 = Math.floor((f.x - r) / T), c1 = Math.floor((f.x + r) / T), r0 = Math.floor((f.y - r) / T), r1 = Math.floor((f.y + r) / T);
    for (let rr = r0; rr <= r1; rr++) for (let cc = c0; cc <= c1; cc++) {
      if (!blk(cc, rr)) continue;
      const nx = clamp(f.x, cc * T, cc * T + T), ny = clamp(f.y, rr * T, rr * T + T);
      const ddx = f.x - nx, ddy = f.y - ny, d2 = ddx * ddx + ddy * ddy;
      if (d2 >= r * r) continue;
      if (d2 > 1e-6) { const d = Math.sqrt(d2); f.x = nx + ddx / d * r; f.y = ny + ddy / d * r; }
      else { f.x = ox; f.y = oy; }
    }
  }
}
function unstick(f) {       // standing inside something that is not walkable: step to the nearest free tile
  const c0 = Math.floor(f.x / T), r0 = Math.floor(f.y / T);
  if (!blocked(c0, r0)) return;
  let best = null, bd = 1e9;
  for (let r = 1; r < ROWS - 1; r++) for (let c = 1; c < COLS - 1; c++) { if (blocked(c, r)) continue; const d = Math.hypot((c + .5) * T - f.x, (r + .5) * T - f.y); if (d < bd) { bd = d; best = [c, r]; } }
  if (best) { f.x = (best[0] + .5) * T; f.y = (best[1] + .5) * T; }
}
function blink(f, ang, d, fly) {       // straight jump of up to d: stops in front of the first wall (water too unless fly)
  const x0 = f.x, y0 = f.y, ax = Math.cos(ang), ay = Math.sin(ang), blk = fly ? solidAt : blockedAt;
  let ok = 0;
  for (let s = 8; s <= d; s += 8) { if (blk(x0 + ax * s, y0 + ay * s) || blk(x0 + ax * (s + 18), y0 + ay * (s + 18))) break; ok = s; }
  f.x = x0 + ax * ok; f.y = y0 + ay * ok; moveFighter(f, 0, 0); if (fly) unstick(f);
  fx('blink', x0, y0 + BODY, { color: TC(f.team), gy: y0 + 16 }); fx('blink', f.x, f.y + BODY, { color: TC(f.team), gy: f.y + 16 });
  return { x0, y0, d: ok };
}
function blinkTo(f, x, y) { if (!f.minion) fx('blink', f.x, f.y + BODY, { color: TC(f.team), gy: f.y + 16 }); f.x = clamp(x, T * 1.4, WW - T * 1.4); f.y = clamp(y, T * 1.4, WH - T * 1.4); unstick(f); moveFighter(f, 0, 0); if (!f.minion) fx('blink', f.x, f.y + BODY, { color: TC(f.team), gy: f.y + 16 }); }
function aimPt(f, max) {       // the point the fighter aims at, at most max away, inside the arena
  let dx = f.tx - f.x, dy = f.ty - f.y; const d = Math.hypot(dx, dy) || 1;
  if (d > max) { dx *= max / d; dy *= max / d; }
  return { x: clamp(f.x + dx, T * 1.2, WW - T * 1.2), y: clamp(f.y + dy, T * 1.2, WH - T * 1.2) };
}
function nearest(f, r, ang, half, needLos) {
  let best = null, bd = r;
  for (const e of foes(f)) {
    if (!visibleTo(e, teamOf(f))) continue;
    const d = dist(f, e); if (d > bd) continue;
    if (ang !== undefined && ang !== null) { let da = angTo(f, e) - ang; da = Math.atan2(Math.sin(da), Math.cos(da)); if (Math.abs(da) > half && d > 26) continue; }
    if (needLos !== false && !los(f.x, f.y, e.x, e.y)) continue;
    bd = d; best = e;
  }
  return best;
}
function knock(e, x, y, force) { const dx = e.x - x, dy = e.y - y, d = Math.hypot(dx, dy) || 1; e.kx += dx / d * force; e.ky += dy / d * force; }

/* ---------- combat primitives ---------- */
function burst(x, y, color, n, spd) {
  evt(['b', Math.round(x), Math.round(y), color, n, Math.round(spd)]);
  for (let i = 0; i < n; i++) { const a = Math.random() * 6.283, s = rnd(.3, 1) * spd; parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: rnd(.25, .55), max: .55, color, r: rnd(2, 5) }); }
}
const ring = (x, y, r, color, life) => { evt(['r', Math.round(x), Math.round(y), Math.round(r), color || '#ffb347', life || .3]); rings.push({ x, y, r, life: life || .3, max: life || .3, color: color || '#ffb347' }); };
function damage(e, dmg, by, o) {
  o = o || {};
  if (e.dead || !(dmg > 0)) return 0;
  if (by && !by.minion && !o.raw) dmg *= V(by, 'dmg', 1);
  if (e.minion) { if (e.onDmg) return e.onDmg(e, dmg, by, o); e.hp -= dmg; if (e.hp <= 0) { e.dead = true; burst(e.x, e.y + BODY, '#cfd3dc', 10, 200); } return dmg; }
  if (e.inv > 0 || B(e, 'inv')) return 0;
  if (e.h.onHurt) { const r = e.h.onHurt(e, dmg, by, o); if (r === 0) return 0; if (r > 0) dmg = r; }
  dmg *= V(e, 'dr', 1) * (B(e, 'expose') ? 1.1 : 1);
  if (e.h.resist && o.el) dmg *= .7;
  if (e.shield > 0) { const a = Math.min(e.shield, dmg); e.shield -= a; dmg -= a; if (e.shield <= 0 && e.onShieldBreak) { const fn = e.onShieldBreak; e.onShieldBreak = null; fn(e); } if (dmg <= 0) return 0; }
  e.hp -= dmg; e.lastHit = time; e.recent.push([time, dmg]);
  if (by && by !== e) { by.dealt = (by.dealt || 0) + dmg; if (!by.minion && by.h.onDeal) by.h.onDeal(by, e, dmg, o); }
  if (o.quiet) { e.acc += dmg; if (e.acc >= 8) { addText({ x: e.x + rnd(-10, 10), y: e.y - 70, txt: String(Math.round(e.acc)), life: .6, color: '#ffb347' }); e.acc = 0; } }
  else {
    addText({ x: e.x + rnd(-10, 10), y: e.y - 70, txt: String(Math.round(dmg)), life: .7, color: e === player ? '#ff5d5d' : '#ffffff' });
    fx('hit', e.x, e.y + BODY, { ang: by && by !== e ? +angTo(by, e).toFixed(2) : 0, color: by ? TC(by.team) : '#ffffff', v: Math.round(dmg), gy: e.y + 16 });
    if (e === player) { shake = 7; sfx(120, .12, 'square', .06, .6); } else if (by === player) sfx(700, .05, 'triangle', .05);
  }
  if (e.hp <= 0) kill(e, by && by.minion ? by.by : by);
  return dmg;
}
/* melee arc: everybody of the other side inside the cone; o: kb stun root mute slow burn infect fn quiet el */
function arc(f, ang, range, half, dmg, o) {
  o = o || {}; const out = [];
  for (const e of foes(f)) {
    const dx = e.x - f.x, dy = e.y - f.y, d = Math.hypot(dx, dy);
    if (d > range + 18) continue;
    let da = Math.atan2(dy, dx) - ang; da = Math.atan2(Math.sin(da), Math.cos(da));
    if (Math.abs(da) > half && d > 26) continue;
    if (!los(f.x, f.y, e.x, e.y)) continue;
    if (o.kb && d > 1) { e.kx += dx / d * o.kb; e.ky += dy / d * o.kb; }
    o.by = f; status(e, o);
    damage(e, dmg, f, o); if (o.fn) o.fn(e); out.push(e);
  }
  return out;
}
function circ(by, x, y, r, dmg, o) {
  o = o || {}; const out = [];
  for (const e of foes(by)) {
    const d = Math.hypot(e.x - x, e.y - y);
    if (d > r + 18) continue;
    if (o.kb) knock(e, x, y, o.kb);
    o.by = by; status(e, o);
    if (dmg) damage(e, dmg, by, o); if (o.fn) o.fn(e); out.push(e);
  }
  return out;
}
function boom(by, x, y, r, dmg, o) { if (o && o.col) { fx('skillring', x, y, { color: o.col, r }); burst(x, y, o.col, 12, 260); } else fx(r >= 70 ? 'explosion' : 'bombexplode', x, y, { gy: y + 30 }); return circ(by, x, y, r, dmg, Object.assign({ kb: 160 }, o)); }
function pathHit(f, x0, y0, x1, y1, w, dmg, o) {       // everybody close to the segment
  o = o || {}; const out = [], dx = x1 - x0, dy = y1 - y0, l2 = dx * dx + dy * dy || 1;
  for (const e of foes(f)) {
    const t = clamp(((e.x - x0) * dx + (e.y - y0) * dy) / l2, 0, 1), d = Math.hypot(e.x - (x0 + dx * t), e.y - (y0 + dy * t));
    if (d > w + 18) continue;
    o.by = f; status(e, o); if (dmg) damage(e, dmg, f, o); if (o.fn) o.fn(e); out.push(e);
  }
  return out;
}
function emit(f, ang, o) {
  o = o || {}; const h = f.h, n = o.count || h.count || 1, fan = o.fan != null ? o.fan : (h.fan || 0);
  if (h.pre && !o.skill) o = h.pre(f, Object.assign({}, o)) || o;
  for (let i = 0; i < n; i++) {
    const a = ang + (n > 1 ? (i / (n - 1) - .5) * fan : 0) + rnd(-1, 1) * (o.spread != null ? o.spread : (h.spread || 0)), spd = o.spd || h.bspd || 800;
    const b = { x: f.x + Math.cos(a) * 24 + (o.ox || 0), y: f.y + BODY + Math.sin(a) * 24 + (o.oy || 0), vx: Math.cos(a) * spd, vy: Math.sin(a) * spd, spd, ang: a,
      life: o.range || h.range || 500, dmg: o.dmg != null ? o.dmg : (h.dmgf ? h.dmgf(f) : h.dmg), team: teamOf(f), owner: f, r: o.r || 5, shape: o.shape || h.w.shape,
      pierce: o.pierce != null ? o.pierce : (h.pierce || 0), splash: o.splash != null ? o.splash : (o.skill ? 0 : (h.splash || 0)), boom: o.boom ? 1 : 0, phase: 0, wp: o.wp,
      o, hit: new Set(), born: time, basic: !o.skill, x0: f.x, y0: f.y, wid: o.skill || o.shape ? null : h.id };
    if (o.homing) { b.home = o.homing; b.homeT = o.homeT || 9; }
    if (o.wave) { b.wave = o.wave; b.bx = b.x; b.by = b.y; b.trav = 0; }
    bullets.push(b);
  }
}
function zone(o) { const z = Object.assign({ t: 3, r: 80, col: '#ffffff', acc: 0, team: o.by ? teamOf(o.by) : 0 }, o); zones.push(z); return z; }
const inZone = (z, e) => Math.hypot(e.x - z.x, e.y - z.y) < z.r + 10;
function strike(by, x, y, r, delay, fn, col) { strikes.push({ by, x, y, r, t: delay, max: delay, fn, col: col || '#ff5d5d' }); }
function minion(o) { const m = Object.assign({ minion: true, vx: 0, vy: 0, kx: 0, ky: 0, b: {}, dead: false, hp: 1, t: 5, hit: false, lastFire: -9, lastHit: -9, acc: 0, born: time }, o); m.team = o.by ? teamOf(o.by) : o.team; m.max = m.hp; minions.push(m); return m; }
function lunge(f, ang, d, dur, o) { f.dash = Object.assign({ t: dur, dx: Math.cos(ang), dy: Math.sin(ang), v: d / dur, hit: new Set(), skill: 1 }, o); }

/* ---------- fighters ---------- */
function makeFighter(team, slot, id, isPlayer, lo0, cos, nick) {
  const h = HEROES[id], p = spawnPos(team, slot);
  const f = { team, slot, h, h0: h, isPlayer, x: p.x, y: p.y, tx: p.x, ty: p.y, vx: 0, vy: 0, kx: 0, ky: 0, mv: [0, 0], aim: team === 0 ? 0 : Math.PI,
    hp: h.hp, mhp: h.hp, dead: false, respawnT: 0, inv: 1.5, lastHit: -9, lastFire: -9, lastMove: 0, fireCd: 0, ucd: 6, dcd: 0, scd: [0, 0], sk: [null, null],
    queue: [], dash: null, swing: 0, spin: 0, shield: 0, onShieldBreak: null, dots: [], recent: [], b: {}, x_: 0, st: {}, acc: 0, dealt: 0, hold: false, washold: false, tapT: 0, form: null, ghost: false,
    kos: 0, deaths: 0, bob: Math.random() * 6, infTick: 0,
    ai: { cool: rnd(.3, 1), strafeT: 0, sdir: Math.random() < .5 ? 1 : -1, roamT: 0, rx: 0, ry: 0, dist: null, pathNext: 0, gc: -1, gr: -1, sx: p.x, sy: p.y, stT: 0, thr: .7 } };
  const lo = lo0 ? loadoutValid(h, lo0[0], lo0[1]) : isPlayer ? loadoutOf(id) : botLoadout(h);
  f.human = !!isPlayer; f.cos = cos ? cleanCos(cos, id) : botCos(id); f.nick = nick || null;
  f.sk = lo.map(n => h.skills.find(s => s.n === n)); f.sk0 = f.sk;
  if (h.spawn) h.spawn(f);
  return f;
}
function loadoutValid(h, a, b) {
  const ea = h.skills.find(s => s.n === a), eb = h.skills.find(s => s.n === b);
  if (!ea || !eb || a === b || eb.only1) { const d = h.skills.filter(s => !s.only1); return [h.skills[0].n, (d.find(s => s.n !== h.skills[0].n) || h.skills[0]).n]; }
  return [a, b];
}
function loadoutOf(id) { const h = HEROES[id], l = loadouts[id]; return l ? loadoutValid(h, l[0], l[1]) : loadoutValid(h, h.skills[0].n, (h.skills[1] || h.skills[0]).n); }
function botLoadout(h) { const p = h.skills.slice().sort(() => Math.random() - .5); let a = p[0], b = p.find(s => s !== a && !s.only1); if (!b) { b = a; a = p.find(s => s !== b) || a; } return loadoutValid(h, a.n, b.n); }
function loadMap(i) {
  curMap = i; MAP = MAPS[i].grid.map(r => r.split('')); TH = MAPS[i].th; tempWalls.clear(); NET.mapVer++;
  const d = bfs(1, 8); ROAM = [];
  for (let r = 1; r < ROWS - 1; r += 2) for (let c = 4; c < COLS - 4; c += 2) if (!blocked(c, r) && d[c + r * COLS] > 0) ROAM.push([c, r]);
}
/* humans: [{ hero, lo, local } | { hero, lo, remote }]; they take turns blue / red, the middle slot first; bots fill the rest */
function setup(withPlayer, humans) {
  loadMap(mapChoice < 0 ? Math.floor(Math.random() * MAPS.length) : mapChoice);
  fighters = []; bullets = []; parts = []; texts = []; rings = []; zones = []; minions = []; timers = []; strikes = []; score = [0, 0]; timeLeft = MATCH_TIME; player = null; VIEW = 0;
  humans = humans || (withPlayer ? [{ hero: chosen, lo: loadoutOf(chosen), local: true, cos: myCos(chosen), name: PROF.name }] : []);
  const grid = [[null, null, null], [null, null, null]], ORDER = [1, 0, 2];
  humans.forEach((h, i) => { grid[i % 2][ORDER[Math.floor(i / 2)]] = h; });
  const used = new Set(humans.map(h => h.hero)), pool = ROSTER.filter(k => !used.has(k)).sort(() => Math.random() - .5);
  for (let team = 0; team < 2; team++) for (let i = 0; i < 3; i++) {
    const hm = grid[team][i];
    const f = makeFighter(team, i, hm ? hm.hero : pool.pop(), !!(hm && hm.local), hm && hm.lo, hm && hm.cos, hm && hm.name);
    if (hm) { f.human = true; if (hm.local) player = f; if (hm.remote) { f.remote = hm.remote; f.netIn = null; hm.remote.f = f; hm.remote.fi = fighters.length; } }
    fighters.push(f);
  }
}
const canAct = f => !f.dead && !B(f, 'stun') && !f.dash && f.form !== 'gone';
const canAtk = f => canAct(f) && !B(f, 'mute') && !f.noAtk && f.form !== 'sub' && f.form !== 'dove';
function cdOf(f) { const h = f.h; return (h.cdf ? h.cdf(f) : h.cd) * V(f, 'rapid', 1); }
function basic(f, ang) {
  const h = f.h;
  if (h.atk && h.atk(f, ang) !== undefined) return;
  if (h.type === 'melee') { f.swing = .22; addSwing(f, ang); const hits = arc(f, ang, h.range, h.half, h.dmgf ? h.dmgf(f) : h.dmg, Object.assign({ kb: h.kb, basic: 1 }, h.mo ? h.mo(f) : null)); if (h.onSwing) h.onSwing(f, hits, ang); return; }
  for (let i = 0; i < (h.burst || 1); i++) f.queue.push({ t: i * (h.bdelay || 0), ang, o: null });
}
function fire(f, ang) {
  if (f.fireCd > 0 || !canAtk(f) || f.boomOut) return false;
  f.aim = ang; f.lastFire = time; unbuff(f, 'stealth'); unbuff(f, 'ally');
  f.fireCd = cdOf(f);
  basic(f, ang);
  if (f.isPlayer) sfx(f.h.type === 'melee' ? 300 : 560, .08, f.h.type === 'melee' ? 'sawtooth' : 'square', .045, .5);
  return true;
}
function useSkill(f, i) {
  const def = f.sk[i];
  if (!def || f.scd[i] > 0 || !canAct(f) || B(f, 'charm') || f.noSkill) return false;
  const r = def.f(f, f.aim, i);
  if (r === false) return false;
  unbuff(f, 'ally'); if (def.k !== 'buff' && def.k !== 'move') unbuff(f, 'stealth');
  if (r !== 'hold') f.scd[i] = skillCd(f, i);
  f.lastFire = def.k === 'buff' ? f.lastFire : time;
  skillFx(f, def);
  if (state === 'play' && (f.isPlayer || visibleTo(f, VIEW))) sfx(def.k === 'buff' ? 520 : def.k === 'move' ? 380 : 260, .16, 'triangle', .05, 1.6);
  return true;
}
function skillCd(f, i) { const def = f.sk[i]; let cd = i === 0 ? (def.cd1 || CD1) : CD2; if (f.h.cdMul) cd *= f.h.cdMul(f); return cd; }
function useUlt(f) {
  const u = f.h.ult;
  if (f.ucd > 0 || !canAct(f) || B(f, 'charm') || f.noSkill) return false;
  const r = u.f(f, f.aim);
  if (r === false) return false;
  unbuff(f, 'ally'); if (!u.quiet) unbuff(f, 'stealth');
  if (r !== 'hold') f.ucd = ULT_CD * (f.h.cdMul ? f.h.cdMul(f) : 1);
  ultFx(f);
  if (state === 'play') sfx(220, .35, 'sawtooth', .06, 3);
  return true;
}
function dashCdOf(f) { return f.h.dashCd ? f.h.dashCd(f) : 1.5; }
function tryDash(f, dx, dy) {
  if (f.dcd > 0 || !canAct(f) || B(f, 'root') || f.form === 'sub' || (!dx && !dy)) return false;
  f.dash = { t: .16, dx, dy, v: DASH_D / .16 }; f.dcd = dashCdOf(f); f.lastDash = time;
  fxAt(f, 'dash', { dir: 1, rot: +Math.atan2(dy, dx).toFixed(2), color: TC(f.team) });
  if (f.isPlayer) sfx(400, .1, 'triangle', .05, 2);
  return true;
}
function kill(e, by) {
  if (e.h.onDeath) e.h.onDeath(e);
  e.dead = true; e.respawnT = 3; e.deaths++; e.queue = []; e.dash = null; e.hp = 0; e.boomOut = false; e.dots = []; e.b = {}; e.shield = 0; e.form = null; e.ghost = false; e.noAtk = false; e.noSkill = false;
  if (e.h !== e.h0) { e.h = e.h0; e.sk = e.sk0; }
  bullets = bullets.filter(b => !(b.boom && b.owner === e));
  for (const m of minions) if (m.by === e && m.bound) m.dead = true;
  fxAt(e, 'death', { color: TC(e.team) });
  if (by && by !== e) {
    by.kos++; if (by.h.onKill) by.h.onKill(by, e);
    if (by.cos && by.cos.kfx) fxPlay('kfx', by.cos.kfx, Math.round(e.x), Math.round(e.y + BODY), Math.round(e.y + 16), bodyColor(e.cos, TC(e.team)));
    if (!by.human && Math.random() < .3) later(.4, () => doEmote(by, pick([0, 1, 4, 5])), by);
  }
  if (state === 'play') {
    score[1 - e.team]++;
    addFeed(by && by !== e ? by : null, e);
    sfx(e === player ? 200 : 600, .3, 'triangle', .07, e === player ? .3 : 1.8);
  }
}
function respawn(f) {
  const p = spawnPos(f.team, f.slot);
  Object.assign(f, { x: p.x, y: p.y, hp: f.mhp, dead: false, inv: 2, kx: 0, ky: 0, lastHit: -9, lastFire: -9, fireCd: 0, st: {}, b: {}, dots: [], recent: [], shield: 0, form: null, ghost: false, noAtk: false, noSkill: false, boomOut: false });
  if (f.h.spawn) f.h.spawn(f);
  fx('respawn', f.x, f.y - 20, { color: TC(f.team) });
}

/* ---------- AI ---------- */
function ai(f, dt) {
  const a = f.ai, h = f.h;
  f.hold = false;
  a.cool -= dt; a.strafeT -= dt; a.roamT -= dt; a.stT -= dt;
  if (a.stT <= 0) { if (Math.hypot(f.x - a.sx, f.y - a.sy) < 8) { a.roamT = 0; a.sdir *= -1; } a.sx = f.x; a.sy = f.y; a.stT = .7; }
  let tgt = null, bd = 1e9;
  if (!B(f, 'blind')) for (const e of foes(f)) {
    if (!visibleTo(e, teamOf(f)) || B(e, 'ally')) continue;
    const d = dist(f, e) + (e.minion ? 60 : 0);
    if (d < bd) { bd = d; tgt = e; }
  }
  if (tgt && bd < 13 * T) {
    const see = los(f.x, f.y, tgt.x, tgt.y), ang = angTo(f, tgt), close = h.type !== 'shot';
    f.aim = ang; f.tx = tgt.x; f.ty = tgt.y;
    const reach = h.rangef ? h.rangef(f) : h.range, inRange = bd < (close ? reach + 6 : reach * .95);
    if (see && !B(f, 'charm')) {
      const u = h.ult;
      if (f.ucd <= 0 && bd >= u.r[0] && bd <= u.r[1] && (!u.ok || u.ok(f, tgt, bd)) && Math.random() < .06) useUlt(f);
      for (let i = 0; i < 2; i++) { const d = f.sk[i]; if (d && f.scd[i] <= 0 && bd >= d.r[0] && bd <= d.r[1] && (!d.ok || d.ok(f, tgt, bd)) && Math.random() < .05) useSkill(f, i); }
    }
    if (see && inRange) {
      if (h.fireHeld) { f.hold = h.aiHold ? h.aiHold(f, a) : true; }
      else if (a.cool <= 0 && f.fireCd <= 0) {
        if (!close) { const t = bd / (h.bspd || 800) * .7; f.aim = Math.atan2(tgt.y + tgt.vy * t - f.y, tgt.x + tgt.vx * t - f.x) + rnd(-.1, .1); }
        f.hold = true; a.cool = close ? rnd(.05, .3) : rnd(.2, .7);
      }
    }
    const low = f.hp < f.mhp * .3 && !B(f, 'charm');
    if (low) {
      const s = spawnPos(f.team, f.slot);
      if (Math.hypot(s.x - f.x, s.y - f.y) > 1.5 * T) { const mv = pathTo(f, s.x, s.y); if (bd < 3 * T) tryDash(f, mv[0], mv[1]); return mv; }
    }
    if (!see || bd > reach * .8) {
      const mv = pathTo(f, tgt.x, tgt.y);
      if (close && see && bd > reach && bd < 5 * T && Math.random() < .05) tryDash(f, mv[0], mv[1]);
      return mv;
    }
    if (a.strafeT <= 0) { a.strafeT = rnd(.6, 1.5); if (Math.random() < .6) a.sdir *= -1; }
    const p = ang + Math.PI / 2 * a.sdir, want = reach * .6, k = bd < want * .75 ? -.8 : bd > want ? .6 : 0;
    return norm(Math.cos(p) + Math.cos(ang) * k, Math.sin(p) + Math.sin(ang) * k);
  }
  if (h.aiIdle) h.aiIdle(f);
  if (a.roamT <= 0 || Math.hypot(a.rx - f.x, a.ry - f.y) < T) { const r = pick(ROAM); a.rx = (r[0] + .5) * T; a.ry = (r[1] + .5) * T; a.roamT = rnd(4, 8); }
  const mv = pathTo(f, a.rx, a.ry);
  if (mv[0] || mv[1]) { f.aim = Math.atan2(mv[1], mv[0]); f.tx = f.x + mv[0] * 200; f.ty = f.y + mv[1] * 200; }
  return mv;
}

/* ---------- player ---------- */
function autoAim(f) { const e = nearest(f, Math.max((f.h.range || 300) * 1.15, 4 * T), null, 0, false); return e ? angTo(f, e) : f.aim; }
function readLocal(f) {       // what this screen's controls say right now, for the fighter it drives (its own, or a puppet)
  let mx = 0, my = 0;
  if (keys.KeyW || keys.ArrowUp) my -= 1;
  if (keys.KeyS || keys.ArrowDown) my += 1;
  if (keys.KeyA || keys.ArrowLeft) mx -= 1;
  if (keys.KeyD || keys.ArrowRight) mx += 1;
  if (stickM) { mx = stickM.dx; my = stickM.dy; }
  const len = Math.hypot(mx, my);
  if (len > 1) { mx /= len; my /= len; }
  const aiming = !!stickA && Math.hypot(stickA.dx, stickA.dy) > .3;
  let aim = f.aim, tx, ty;
  if (touchMode) {
    if (aiming) aim = Math.atan2(stickA.dy, stickA.dx);
    else if (len > .15) aim = Math.atan2(my, mx);
    const e = nearest(f, 9 * T, null, 0, false);
    if (e && !aiming) { tx = e.x; ty = e.y; } else { tx = f.x + Math.cos(aim) * 5 * T; ty = f.y + Math.sin(aim) * 5 * T; }
  } else {
    const wx = (mouse.x - W / 2) / cam.s + cam.x, wy = (mouse.y - H / 2) / cam.s + cam.y;
    aim = Math.atan2(wy - (f.y + BODY), wx - f.x); tx = wx; ty = wy - BODY;
  }
  const inp = { mx, my, aim, tx, ty, hold: mouse.down || (aiming && !!f.h.fireHeld), touch: touchMode, aiming, pf: pendingFire, ult: wantUlt, dash: wantDash, sk: wantSk.slice() };
  if (f.st.neck) { const ph = ((time - f.st.neck) * 1.8) % 2; inp.np = ph < 1 ? ph : 2 - ph; }
  pvOverride(f, inp); LOCAL_INP = inp;
  pendingFire = null; wantUlt = false; wantDash = false; wantSk = [false, false];
  return inp;
}
function applyInput(f, inp) {       // the same for this screen's player and for a player on another screen (host side)
  if (!inp) return [0, 0];
  f.aim = inp.aim; f.tx = inp.tx; f.ty = inp.ty;
  f.hold = !!inp.hold || f.tapT > 0;
  if (inp.pf) {
    const a = inp.pf.auto ? autoAim(f) : inp.pf.ang; f.aim = a;
    if (f.h.fireHeld) f.tapT = f.h.tapHold || .5; else fire(f, a);
  }
  const own = !B(f, 'charm'), len = Math.hypot(inp.mx, inp.my);
  if (inp.ult) { if (inp.touch && !inp.manual) f.aim = autoAim(f); if (own) useUlt(f); }
  for (let i = 0; i < 2; i++) if (inp.sk && inp.sk[i]) { if (inp.touch && !inp.aiming && !inp.manual) f.aim = autoAim(f); f.netNp = inp.np; if (own) useSkill(f, i); f.netNp = undefined; }
  if (inp.dash) { if (len > .15) tryDash(f, inp.mx / len, inp.my / len); else tryDash(f, Math.cos(f.aim), Math.sin(f.aim)); }
  inp.pf = null; inp.ult = false; inp.dash = false; inp.sk = [false, false]; inp.manual = false;
  return [inp.mx, inp.my];
}
const playerInput = f => applyInput(f, readLocal(f));
const driven = () => (player && player.st.ctrl && !player.st.ctrl.dead && B(player.st.ctrl, 'charm')) ? player.st.ctrl : player;

/* ---------- update ---------- */
function updateFighter(f, dt) {
  if (f.dead) { f.respawnT -= dt; if (f.respawnT <= 0) respawn(f); return; }
  const h = f.h;
  f.inv = Math.max(0, f.inv - dt); f.fireCd -= dt; f.ucd -= dt; f.dcd -= dt; f.scd[0] -= dt; f.scd[1] -= dt; f.tapT -= dt;
  f.swing = Math.max(0, f.swing - dt); f.spin = Math.max(0, f.spin - dt);
  for (const k of Object.keys(f.b)) { const o = f.b[k]; if (o && o.t > 0) { o.t -= dt; if (o.t <= 0 && o.end) o.end(f); if (f.dead) return; } }       // an end() can kill the fighter (kill() swaps f.b for a fresh {}): do not read the old keys from the new object
  while (f.recent.length && time - f.recent[0][0] > 3) f.recent.shift();
  if (h.tick) h.tick(f, dt);
  poisonTick(f, dt);
  if (f.dead) return;
  for (let i = f.dots.length - 1; i >= 0; i--) { const d = f.dots[i]; d.t -= dt; d.tick -= dt; if (d.tick <= 0) { d.tick += .5; damage(f, d.dps * .5, d.by, { quiet: 1, el: 1, raw: 1 }); if (f.dead) return; } if (d.t <= 0) f.dots.splice(i, 1); }
  if (B(f, 'infect')) {
    f.infTick -= dt;
    if (f.infTick <= 0) { f.infTick = .5; const by = f.b.infect.v; damage(f, 1, by, { quiet: 1, el: 1, raw: 1 }); if (f.dead) return; for (const o of fighters) if (o !== f && !o.dead && o.team === f.team && !B(o, 'infect') && dist(o, f) < 46) buff(o, 'infect', 5, by); }
  }
  if (time - Math.max(f.lastHit, f.lastFire) > (h.rest || 3) && f.hp < f.mhp) f.hp = Math.min(f.mhp, f.hp + f.mhp * .1 * dt);
  for (let i = f.queue.length - 1; i >= 0; i--) { const q = f.queue[i]; q.t -= dt; if (q.t <= 0) { emit(f, q.ang, q.o); f.queue.splice(i, 1); } }
  const px = f.x, py = f.y, stunned = B(f, 'stun');
  if (f.dash) {
    const d = f.dash;
    if (d.inv) f.inv = Math.max(f.inv, .05);
    const bx = f.x, by = f.y;
    for (let i = 0; i < 4; i++) moveFighter(f, d.dx * d.v * dt / 4, d.dy * d.v * dt / 4);
    if (d.onHit || d.dmg) for (const e of foes(f)) { if (d.hit.has(e) || dist(e, f) > 44) continue; d.hit.add(e); if (d.dmg) damage(e, d.dmg, f, d); status(e, Object.assign(d, { by: f })); if (d.onHit && d.onHit(e) === 'stop') { d.t = 0; break; } }
    if (d.trail) d.trail(f);
    addPart({ x: f.x, y: f.y + BODY, vx: 0, vy: 0, life: .2, max: .2, color: d.col || TC(f.team), r: 9 });
    d.t -= dt;
    if (d.t <= 0 || (d.skill && Math.hypot(f.x - bx, f.y - by) < d.v * dt * .2)) { f.dash = null; unstick(f); if (d.end) d.end(f); }
  } else {
    let mv = [0, 0];
    f.hold = false;
    if (!stunned && f.form !== 'gone') {
      const ch = B(f, 'charm') ? f.b.charm.v : null;
      if (ch) mv = (ch.isPlayer && !AUTO) ? playerInput(f) : ai(f, dt);
      else if (f.isPlayer && !AUTO) mv = driven() === f ? playerInput(f) : [0, 0];
      else if (f.remote) mv = applyInput(f, f.netIn);
      else mv = ai(f, dt);
      if (B(f, 'puppet')) { const m = f.b.puppet.v.mv; mv = [m[0], m[1]]; if (!mv[0] && !mv[1]) mv = norm(f.b.puppet.v.x - f.x, f.b.puppet.v.y - f.y); }
    }
    f.mv = mv;
    if (canAtk(f)) {
      if (f.hold) { if (h.fireHeld) h.fireHeld(f, dt); else fire(f, f.aim); }
      else if (f.washold && h.fireUp) h.fireUp(f);
    }
    f.washold = f.hold;
    if (stunned || B(f, 'root') || f.rooted) mv = [0, 0];
    let sp = SPEED * V(f, 'haste', 1) * V(f, 'slow', 1) * (B(f, 'infect') ? .9 : 1) * (h.spd ? h.spd(f) : 1);
    if (h.moveOk && !h.moveOk(f, f.x + mv[0] * sp * dt, f.y + mv[1] * sp * dt)) mv = [0, 0];
    if (mv[0] || mv[1]) f.lastMove = time;
    moveFighter(f, (mv[0] * sp + f.kx) * dt, (mv[1] * sp + f.ky) * dt);
    if (!flying(f) && blockedAt(f.x, f.y)) unstick(f);
  }
  const kd = Math.exp(-8 * dt); f.kx *= kd; f.ky *= kd;
  f.vx = (f.x - px) / dt; f.vy = (f.y - py) / dt;
  f.bob += Math.hypot(f.vx, f.vy) * dt * .06;
}
function updateBullets(dt) {
  for (let i = bullets.length - 1; i >= 0; i--) {
    const b = bullets[i], o = b.o, bx0 = b.x, by0 = b.y; let dead = false;
    if (!b.id) b.id = ++bulletSeq;
    for (let s = 0; s < 2 && !dead; s++) {
      if (b.boom && b.phase === 1) {
        const ow = b.owner, dx = ow.x - b.x, dy = ow.y + BODY - b.y, d = Math.hypot(dx, dy) || 1;
        if (ow.dead || d < 26) { ow.boomOut = false; ow.fireCd = Math.max(ow.fireCd, .25); dead = true; b.splash = 0; b.silent = 1; break; }
        b.x += dx / d * b.spd * dt / 2; b.y += dy / d * b.spd * dt / 2;
      } else {
        if (b.home && time - b.born < b.homeT) {
          const tg = b.home === true ? nearest({ x: b.x, y: b.y, team: b.team, b: {} }, 7 * T, null, 0, false) : (b.home.dead ? null : b.home);
          if (tg) { let da = Math.atan2(tg.y + BODY - b.y, tg.x - b.x) - b.ang; da = Math.atan2(Math.sin(da), Math.cos(da)); b.ang += clamp(da, -(o.turn || 5) * dt / 2, (o.turn || 5) * dt / 2); b.vx = Math.cos(b.ang) * b.spd; b.vy = Math.sin(b.ang) * b.spd; }
        }
        if (b.wave) { b.trav += b.spd * dt / 2; b.bx += b.vx * dt / 2; b.by += b.vy * dt / 2; const w = Math.sin(b.trav / 40) * 26 * b.wave; b.x = b.bx - Math.sin(b.ang) * w; b.y = b.by + Math.cos(b.ang) * w; }
        else { b.x += b.vx * dt / 2; b.y += b.vy * dt / 2; }
        b.life -= b.spd * dt / 2;
        if (b.x < 0 || b.y < 0 || b.x > WW || b.y > WH || (!b.wp && solidAt(b.x, b.y)) || b.life <= 0) {
          if (b.boom) { b.phase = 1; b.hit.clear(); } else { dead = true; b.wall = b.life > 0; if (!b.splash && fxInView(b.x, b.y)) fx('spark', b.x, b.y, { ang: +b.ang.toFixed(2), color: TC(b.team), gy: b.y + 24 }); break; }
        }
      }
      for (const e of foes({ team: b.team, b: {} })) {
        if (e === b.owner || b.hit.has(e)) continue;
        if (Math.hypot(e.x - b.x, e.y + BODY - b.y) >= 20 + b.r) continue;
        if (!e.minion) {
          if (B(e, 'sand') || e.form === 'sub') continue;
          if (B(e, 'reflect')) { b.vx = -b.vx; b.vy = -b.vy; b.ang += Math.PI; b.team = teamOf(e); b.owner = e; b.hit.clear(); b.life = Math.max(b.life, 300); b.home = null; ring(e.x, e.y + BODY, 40, '#ffffff', .2); if (e.h.onReflect) e.h.onReflect(e); break; }
          if (B(e, 'block') || e.st.fsh) {
            let da = Math.atan2(b.y - (e.y + BODY), b.x - e.x) - e.aim; da = Math.atan2(Math.sin(da), Math.cos(da));
            if (Math.abs(da) < 1.25) { if (e.st.fsh && !B(e, 'block')) { e.st.fsh.hp -= b.dmg; if (e.st.fsh.hp <= 0) e.st.fsh = null; } ring(b.x, b.y, 24, '#ffd34d', .2); dead = true; b.splash = 0; b.silent = 1; break; }
          }
        }
        b.hit.add(e);
        if (b.splash) { dead = true; b.target = e; break; }
        let dm = b.dmg; if (o.dmgAt) dm = o.dmgAt(b, e);
        o.by = b.owner; status(e, o);
        const done = damage(e, dm, b.owner, { basic: b.basic, el: o.el });
        burst(b.x, b.y, '#ffffff', 4, 150);
        if (o.onHit) o.onHit(e, b, done);
        if (b.basic && b.owner.h.onShot && !b.owner.minion) b.owner.h.onShot(b.owner, e, b, done);
        if (b.boom) continue;
        if (b.pierce > 0) { b.pierce--; if (o.fall) b.dmg *= o.fall; } else { dead = true; b.target = e; break; }
      }
    }
    b.svx = (b.x - bx0) / dt; b.svy = (b.y - by0) / dt;
    if (dead) {
      if (b.splash) boom(b.owner, b.x, b.y, b.splash, b.dmg, Object.assign({}, o, { onHit: null, fn: o.onSplash, by: b.owner }));
      if (o.onEnd && !b.silent) o.onEnd(b);
      bullets.splice(i, 1);
    }
  }
}
function fxStep(dt) {
  for (let i = parts.length - 1; i >= 0; i--) { const p = parts[i]; p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= .92; p.vy *= .92; p.life -= dt; if (p.life <= 0) parts.splice(i, 1); }
  for (let i = texts.length - 1; i >= 0; i--) { const t = texts[i]; t.y -= 46 * dt; t.life -= dt; if (t.life <= 0) texts.splice(i, 1); }
  for (let i = rings.length - 1; i >= 0; i--) { rings[i].life -= dt; if (rings[i].life <= 0) rings.splice(i, 1); }
  shake = Math.max(0, shake - 40 * dt);
}
function step(dt) {
  time += dt;
  for (let i = timers.length - 1; i >= 0; i--) { const t = timers[i]; t.t -= dt; if (t.t <= 0) { timers.splice(i, 1); if (!t.f || !t.f.dead) t.fn(); } }
  for (const f of fighters) updateFighter(f, dt);
  updateBullets(dt);
  for (let i = zones.length - 1; i >= 0; i--) { const z = zones[i]; z.t -= dt; if (z.fn) z.fn(z, dt); if (z.t <= 0 || z.dead) { if (z.end) z.end(z); zones.splice(i, 1); } }
  for (let i = strikes.length - 1; i >= 0; i--) { const s = strikes[i]; s.t -= dt; if (s.t <= 0) { strikes.splice(i, 1); s.fn(s); } }
  for (let i = minions.length - 1; i >= 0; i--) { const m = minions[i]; m.t -= dt; for (const k in m.b) m.b[k].t -= dt; if (!m.dead && m.upd && !B(m, 'stun')) m.upd(m, dt); if (m.t <= 0 || m.dead || (m.bound && m.by.dead)) { if (m.end) m.end(m); minions.splice(i, 1); } }
  fxStep(dt);
  if (state === 'play') {
    timeLeft -= dt;
    if (score[0] >= WIN_SCORE || score[1] >= WIN_SCORE || timeLeft <= 0) endGame();
  }
}
