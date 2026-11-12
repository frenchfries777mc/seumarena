/* ===== arena engine ===== */
const T = 64, BODY = -14, U = .6;
const MAPS = [
  { id:'roof', name:'옥상 정원', desc:'가운데 화단을 두고 맞붙는 기본 맵. 양옆 풀숲으로 돌아 들어가기 좋습니다.',
    th:{ f1:'#2a2850', f2:'#2f2d5b', wt:'#f4b942', ws:'#c98a1b', b1:'#1f9d78', b2:'#2fc797', wa:'#3a7fc4', wa2:'#63a4e0' },
    rows:['#############','#............','#..gg....##..','#..gg........','#......#....g','#..#...#....g','#..#.......##','#....gg......','#....gg...#..','#....gg......','#..#.......##','#..#...#....g','#......#....g','#..gg........','#..gg....##..','#............','#############'] },
  { id:'ruins', name:'사막 유적', desc:'기둥이 드문드문 선 탁 트인 맵. 가끔 모래바람이 불어 멀리 있는 상대가 보이지 않게 돼요.',
    env:{ gale:1 },
    th:{ f1:'#b99a62', f2:'#c2a46c', wt:'#8a5a3c', ws:'#5e3a24', b1:'#5f8234', b2:'#7fa646', wa:'#3a7fc4', wa2:'#63a4e0' },
    rows:['#############','#............','#....#....g..','#....#....g..','#.......#....','#..gg...#...#','#..gg.......#','#.....##.....','#.....##..g..','#.....##.....','#..gg.......#','#..gg...#...#','#.......#....','#....#....g..','#....#....g..','#............','#############'] },
  { id:'lake', name:'얼음 호수', desc:'한가운데 호수는 걸어서 건널 수 없지만 총알은 지나갑니다. 호수 둘레는 얼음 바닥이에요.',
    th:{ f1:'#9fc0d6', f2:'#abcbe0', wt:'#6f8fb0', ws:'#4b6887', b1:'#2f7f6c', b2:'#4aa58e', wa:'#2f6fb3', wa2:'#5c9bd6' },
    rows:['#############','#............','#..##.....gg.','#.........gg.','#...iiww.....','#...iiww...#.','#...ii......w','#..g.iii..www','#..g.i#i..www','#..g.iii..www','#...ii......w','#...iiww...#.','#...iiww.....','#.........gg.','#..##.....gg.','#............','#############'] },
  { id:'forge', name:'용암 공장', desc:'벽이 많은 좁은 통로. 몇 초마다 바닥 틈에서 용암이 분출해요. 붉은 경고 원에서 비켜나세요!',
    env:{ vents:1 },
    th:{ f1:'#2b2b30', f2:'#323238', wt:'#7a7f8c', ws:'#4b4f5a', b1:'#5a4a3a', b2:'#7a6450', wa:'#e2551a', wa2:'#ffb347' },
    rows:['#############','#............','#.###..#..w..','#......#..w..','#..g...#.....','#..g....v..##','#.....##.....','#.....#...g..','#..v......g.#','#.....#...g..','#.....##.....','#..g....v..##','#..g...#.....','#......#..w..','#.###..#..w..','#............','#############'] },
  { id:'forest', name:'숲속 미로', desc:'풀숲이 가득한 맵. 양옆의 초록 치유 패드에서 체력을 채울 수 있어요.',
    th:{ f1:'#2f5d3a', f2:'#356642', wt:'#7a5634', ws:'#4a321e', b1:'#1c7a3f', b2:'#27a153', wa:'#3a7fc4', wa2:'#63a4e0' },
    rows:['#############','#............','#.gg..#..ggg.','#.gg..#..ggg.','#.........#..','#....gg...#..','#..#.gg......','#..#......gg.','#...h...#.gg.','#..#......gg.','#..#.gg......','#....gg...#..','#.........#..','#.gg..#..ggg.','#.gg..#..ggg.','#............','#############'] },
  { id:'neon', name:'네온 시티', desc:'위아래 길의 속도 패드를 밟으면 잠깐 빨라지고, 한가운데 초록 치유 패드에서 체력을 채워요.',
    th:{ f1:'#1b1233', f2:'#221840', wt:'#7b3fe4', ws:'#4a2299', b1:'#0f6b66', b2:'#16a79c', wa:'#3a7fc4', wa2:'#63a4e0' },
    rows:['#############','#............','#.##.....##..','#.#..pppp....','#.#.......#..','#.....g...#..','#..#.....g...','#..#...#.....','#.....#...h.h','#..#...#.....','#..#.....g...','#.....g...#..','#.#.......#..','#.#..pppp....','#.##.....##..','#............','#############'] },
  { id:'glacier', name:'빙하 활주로', desc:'바닥이 온통 얼음으로 덮인 넓은 활주로예요. 기둥 뒤에 숨어 싸우세요.',
    th:{ f1:'#bcd7e8', f2:'#c8e0ef', wt:'#5f86a8', ws:'#3f607f', b1:'#2f7f6c', b2:'#4aa58e', wa:'#2f6fb3', wa2:'#5c9bd6' },
    rows:['#############','#..iiiiiiiiii','#..ii#iiiiiii','#..iiiiiiiiii','#..iiiiii#iii','#..ii#iiiiiii','#..iiiiiiiiii','#..iiiiii#iii','#..iiii#i#iii','#..iiiiii#iii','#..iiiiiiiiii','#..ii#iiiiiii','#..iiiiii#iii','#..iiiiiiiiii','#..ii#iiiiiii','#..iiiiiiiiii','#############'] },
  /* big maps (37 x 25) for 원 레프트 only */
  { id:'big_island', name:'외딴 섬', desc:'바다로 둘러싸인 넓은 섬. 수풀이 많아 숨기 좋아요.', big:1,
    th:{ f1:'#d9c38a', f2:'#e0cb95', wt:'#8a6a44', ws:'#5f4529', b1:'#2f8f4a', b2:'#49b565', wa:'#2f8fc4', wa2:'#63b8e0' },
    rows:['###################','#wwwww.............','#www...gg.....##...','#ww....gg..........','#w.........#....gg.','#....##....#....gg.','#....#.........w...','#.......gg....www..','#..gg...gg.....w...','#..gg.............#','#......#....##.....','#......#...........','#..........h....g..','#......#...........','#......#....##.....','#..gg.............#','#..gg...gg.....w...','#.......gg....www..','#....#.........w...','#....##....#....gg.','#w.........#....gg.','#ww....gg..........','#www...gg.....##...','#wwwww.............','###################'] },
  { id:'big_temple', name:'고대 신전', desc:'벽과 기둥이 많은 신전. 한가운데 치유 패드가 있어요.', big:1,
    th:{ f1:'#5a5346', f2:'#625b4d', wt:'#c9b27a', ws:'#8f7a4a', b1:'#3f7a3a', b2:'#58a04f', wa:'#3a7fc4', wa2:'#63a4e0' },
    rows:['###################','#..................','#.##..#####..##....','#.#...........#...#','#.....gg..#.......#','#..#..gg..#..###...','#..#.........#.....','#..###...........g.','#........##..#...g.','#.gg......#..#.....','#.gg..#.......##...','#.....#..p.........','#.....#.......#...h','#.....#..p.........','#.gg..#.......##...','#.gg......#..#.....','#........##..#...g.','#..###...........g.','#..#.........#.....','#..#..gg..#..###...','#.....gg..#.......#','#.#...........#...#','#.##..#####..##....','#..................','###################'] },
  { id:'big_snow', name:'설원 기지', desc:'눈 덮인 넓은 기지. 속도 패드로 빠르게 움직일 수 있어요.', big:1,
    th:{ f1:'#dfe9f2', f2:'#e8f0f7', wt:'#5c6f86', ws:'#3c4c61', b1:'#2f6f5c', b2:'#46957d', wa:'#2f6fb3', wa2:'#5c9bd6' },
    rows:['###################','#........iiii......','#..##....iiii..gg..','#..#...........gg..','#......###.........','#.gg.....#....#....','#.gg..........#..ii','#.....p....g..#..ii','#..#.......g.......','#..#..ii.......##..','#.....ii..#.....#..','#.........#........','#...##.......gg....','#.........#........','#.....ii..#.....#..','#..#..ii.......##..','#..#.......g.......','#.....p....g..#..ii','#.gg..........#..ii','#.gg.....#....#....','#......###.........','#..#...........gg..','#..##....iiii..gg..','#........iiii......','###################'] },
  { id:'big_crater', name:'화산 분화구', desc:'용암 웅덩이가 흩어진 분화구. 바닥 틈에서 용암이 분출해요.', big:1,
    env:{ vents:1 },
    th:{ f1:'#33292b', f2:'#3b2f31', wt:'#8a6f66', ws:'#57433d', b1:'#5a4a3a', b2:'#7a6450', wa:'#e2551a', wa2:'#ffb347' },
    rows:['###################','#..................','#..ww....#....v....','#..ww....#.........','#......v.....##....','#.##.........#...ww','#..#....ww.......ww','#.......ww..g......','#...g.......g...#..','#...g..#........#..','#......##...v......','#.w.............##.','#.w....g...........','#.w.............##.','#......##...v......','#...g..#........#..','#...g.......g...#..','#.......ww..g......','#..#....ww.......ww','#.##.........#...ww','#......v.....##....','#..ww....#.........','#..ww....#....v....','#..................','###################'] }
];
for (const m of MAPS) m.grid = m.rows.map(r => r + [...r.slice(0, r.length - 1)].reverse().join(''));
let COLS = 25, ROWS = 17, WW = COLS * T, WH = ROWS * T;      // set by loadMap(): the big 원 레프트 maps are larger
let MAP = MAPS[0].grid, TH = MAPS[0].th, ROAM = [], curMap = 0;
const tempWalls = new Map();
const tile = (c, r) => { if (c < 0 || r < 0 || c >= COLS || r >= ROWS) return '#'; if (tempWalls.size && tempWalls.get(c + r * COLS) > time) return '#'; return MAP[r][c]; };
const solid = (c, r) => tile(c, r) === '#';
const arenaEdge = (c, r) => c <= 0 || r <= 0 || c >= COLS - 1 || r >= ROWS - 1;      // the outer wall ring: even a leap cannot cross it
const blocked = (c, r) => { const t = tile(c, r); return t === '#' || t === 'w'; };
const solidAt = (x, y) => solid(Math.floor(x / T), Math.floor(y / T));
const blockedAt = (x, y) => blocked(Math.floor(x / T), Math.floor(y / T));
const bushAt = (x, y) => { const t = tile(Math.floor(x / T), Math.floor(y / T)); return t === 'g' || t === 'G'; };      // 'G' = a bush planted by 정원사 (gardener.js)
const TEAM = ['#4d9dff', '#ff5d5d'];
/* online state (net.js): the host runs the match, guests draw what it sends */
const NET = { role: null, peer: null, conns: [], hostConn: null, members: [], phase: 'idle', rec: false, evs: [], room: -1, me: -1, mapVer: 0 };
let VIEW = 0;      // the team this screen plays for: drawn blue, its score on the left
const TC = t => TEAM[t === VIEW ? 0 : 1];
const evt = a => { if (NET.rec) NET.evs.push(a); };
function addText(o) { texts.push(o); evt(['t', Math.round(o.x), Math.round(o.y), o.txt, o.color, o.small ? 1 : 0, o.life]); }
function addPart(p) { parts.push(p); evt(['p', Math.round(p.x), Math.round(p.y), Math.round(p.vx), Math.round(p.vy), +p.life.toFixed(2), p.color, +(p.r || 3).toFixed(1)]); }
const OT_MAX = 60;       // sudden-death overtime when the clock runs out level: first kill wins, a draw if nobody scores within this many seconds
const STAT_X = 10;       // every hp and every damage/heal/shield number written in the kits is multiplied by this (damage() and heal() do it, so kit code keeps the original small numbers)
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
/* ===== game modes =====
   id / name / size: what the lobby shows · maps: indexes into MAPS this mode may use · ready: false = not playable yet (the lobby locks it)
   teams × per: how many sides and fighters per side · respawn: do the dead come back · win: score that ends the match · time: seconds on the clock (per round when rounds > 0)
   rounds: round wins needed (0 = no rounds). The UI sets `modeChoice` and calls setup(); the engine reads the rules with modeNow(). */
const MODES = [
  { id: 'team', name: '팀 아웃', size: '3v3', teams: 2, per: 3, respawn: true, win: WIN_SCORE, time: MATCH_TIME, rounds: 0, maps: [0, 1, 2, 3, 4, 5, 6], ready: true },
  { id: 'solo', name: '원 레프트', size: '6명', teams: 6, per: 1, respawn: false, win: 1, time: 150, rounds: 0, maps: [7, 8, 9, 10], ready: true },
  { id: 'flag', name: '캡쳐 플래그', size: '3v3', teams: 2, per: 3, respawn: true, win: 3, time: 180, rounds: 0, maps: [0, 1, 2, 3, 4, 5, 6], ready: true },
  { id: 'duel', name: '듀얼 배틀', size: '1v1', teams: 2, per: 1, respawn: false, win: 2, time: 60, rounds: 2, maps: [0, 1, 2, 3, 4, 5, 6], ready: true }
];
for (const m of MODES) m.max = m.teams * m.per;      // room size, for matchmaking
/* modeChoice: picked in the lobby (UI) · curMode: the mode of the match being played (setup() copies modeChoice; a guest gets it from the host's start message) */
let modeChoice = 'team', curMode = 'team', RD = { n: 1, pause: 0, win: -1, out: [] };
/* 원 레프트 safe zone: a circle that closes in on the middle of the map; standing outside it hurts */
/* 캡쳐 플래그: one flag per team. by = index of the fighter carrying it (-1 = on the ground), home = standing on its base, back = seconds until a dropped flag goes home by itself */
let FLAGS = [];
const FLAG_BACK = 8, FLAG_R = 38;
const SZ = { on: false, x: 0, y: 0, r: 0, r0: 0, gx: 0, gy: 0, acc: 0 }, SZ_WAIT = 12, SZ_MIN = 2.2 * T;
const modeOf = id => MODES.find(m => m.id === id && m.ready) || MODES[0];
const modeNow = () => modeOf(curMode);
/* the small mode state that rides in every snapshot (net.js: `md`) so guests can draw it: round number, and later the flags / safe zone */
function modeSnap() { const o = { rn: RD.n, rp: RD.pause > 0 ? 1 : 0 }; if (SZ.on) { o.z = [Math.round(SZ.x), Math.round(SZ.y), Math.round(SZ.r)]; o.w = RD.win; o.o = RD.out; } if (FLAGS.length) o.f = FLAGS.map(g => [Math.round(g.x), Math.round(g.y), g.by, g.home ? 1 : 0, Math.round(g.back * 10) / 10]); return o; }
function applyModeSnap(o) {
  if (!o || typeof o !== 'object') return;
  if (o.rn > 0) RD.n = o.rn | 0; RD.pause = o.rp ? 1 : 0;
  SZ.on = Array.isArray(o.z) && o.z.length === 3;
  if (Array.isArray(o.f) && o.f.length === 2) { if (FLAGS.length !== 2) flagsReset(); o.f.forEach((v, t) => { if (!Array.isArray(v)) return; const g = FLAGS[t]; g.x = +v[0] || 0; g.y = +v[1] || 0; g.by = v[2] | 0; g.home = !!v[3]; g.back = +v[4] || 0; }); } else FLAGS = [];
  if (SZ.on) { SZ.x = +o.z[0] || 0; SZ.y = +o.z[1] || 0; SZ.r = Math.max(0, +o.z[2] || 0); RD.win = o.w | 0; RD.out = Array.isArray(o.o) ? o.o.slice(0, 8).map(v => v | 0) : []; }
}
/* what the HUD and the result screen show, whatever the mode: a / b = the two numbers (원 레프트: my kills / fighters left), win / draw for this screen, place = finishing place in 원 레프트 */
function modeOutcome() {
  if (curMode === 'solo') {
    const left = fighters.filter(f => !f.dead).length, oi = RD.out.indexOf(VIEW);
    return { a: score[VIEW] | 0, b: left, win: RD.win === VIEW, draw: RD.win < 0 && oi < 0, place: RD.win === VIEW ? 1 : oi < 0 ? left : fighters.length - oi };
  }
  const a = score[VIEW] | 0, b = score[1 - VIEW] | 0;
  return { a, b, win: a > b, draw: a === b, place: 0 };
}
let fighters = [], bullets = [], parts = [], texts = [], rings = [], zones = [], minions = [], timers = [], strikes = [], player = null;
let neckNp = null;       // 목 베기 bar position caught on the key / button press (preview.js pvInstant)
let overtime = false, otT = 0, SRC = null;       // SRC: what is dealing damage right now (a label like '1스킬: 돌진 베기'), carried through timers/zones/bullets/buffs so kills can say what did them in
let bulletSeq = 0, AUTO = false, chosen = 'sword', mapChoice = -1, shake = 0, loadouts = {};
const cam = { x: WW / 2, y: WH / 2, s: 1 };
const keys = {}, mouse = { x: 0, y: 0, down: false };
let touchMode = false, mouseRel = false, stickM = null, stickA = null, pendingFire = null, wantUlt = false, wantDash = false, wantSk = [false, false];

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
  f.b[k] = { t, v: v === undefined ? 1 : v, src: SRC };
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
  if (o.burn) e.dots && addDot(e, { t: o.burn[1], dps: o.burn[0], by: o.by, kind: 'fire', tick: .5 });
  if (o.infect) buff(e, 'infect', 5, o.by);
}
const addDot = (e, d) => { d.src = SRC; e.dots.push(d); };
const withSrc = (s, fn) => { const o = SRC; SRC = s; try { return fn(); } finally { SRC = o; } };
const skName = (d, f) => typeof d.name === 'function' ? d.name(f) : d.name;
function heal(f, n) { if (f.dead || n <= 0) return; n *= STAT_X; if (f.h.healMul) n *= f.h.healMul(f); const b = f.hp; f.hp = Math.min(f.mhp, f.hp + n); f.healed = (f.healed || 0) + (f.hp - b); if (f.hp - b >= 3 * STAT_X) fx('heal', f.x, f.y - 40, { v: Math.round(f.hp - b) }); }
function say(f, txt, col) { addText({ x: f.x, y: f.y - 96, txt, life: 1, color: col || '#ffd34d', small: 1 }); }
function later(t, fn, f) { timers.push({ t, fn, f, src: SRC }); }
function seq(f, n, gap, fn) { for (let i = 0; i < n; i++) later(i * gap, () => fn(i), f); }

/* ---------- world helpers ---------- */
const spawnPos = (team, slot) => curMode === 'solo' && SOLO_SP[team] ? SOLO_SP[team] : ({ x: (team === 0 ? 1.5 : COLS - 1.5) * T, y: (ROWS / 2 - 2 + slot * 2) * T });
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
  if (galeOn()) { let near = false; for (const o of fighters) if (o.team === team && !o.dead && Math.hypot(o.x - f.x, o.y - f.y) < GALE_VIS) { near = true; break; } if (!near) return false; }
  const hidden = B(f, 'stealth'), bush = bushAt(f.x, f.y);
  if (!hidden && !bush) return true;
  if (!hidden) { const rv = f.h && f.h.reveal ? f.h.reveal(f) : .8; if (time - f.lastFire < rv || time - f.lastHit < .8) return true; }      // (정원사: .4 inside his own bushes)
  const near = (hidden ? 1.5 : 1.1) * T;      // bush: only somebody standing right next to it sees in (UI thread, user request 2026-11-11; was 2.3)
  for (const o of fighters) if (o.team === team && !o.dead && Math.hypot(o.x - f.x, o.y - f.y) < near) return true;
  return false;
}
let SOLO_SP = [];
/* the middle of the nearest open floor tile to a point (spawn points, the safe-zone goal for bots) */
function freeNear(x, y) {
  let best = null, bd = 1e9;
  for (let r = 1; r < ROWS - 1; r++) for (let c = 1; c < COLS - 1; c++) { if (MAP[r][c] !== '.') continue; const d = Math.hypot((c + .5) * T - x, (r + .5) * T - y); if (d < bd) { bd = d; best = { x: (c + .5) * T, y: (r + .5) * T }; } }
  return best || { x, y };
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
  const ox = f.x, oy = f.y, r = 20, fl = flying(f), blk = (f.dash && f.dash.fly === 2) ? arenaEdge : fl ? solid : blocked;      // dash.fly 2 = a leap that clears walls and water
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
  if (!o.px) { dmg *= STAT_X; const ow = by && (by.minion ? by.by : by); if (ow && ow.h && ow.h.xm) dmg *= ow.h.xm; }   // o.px: already in scaled units (re-entry from onDmg / onDeal) · h.xm = per-hero damage multiplier (balance knob, kits2.js DMG_MUL)
  if (by && !by.minion && !o.raw) dmg *= V(by, 'dmg', 1);
  if (e.minion) { if (e.onDmg) return e.onDmg(e, dmg, by, o); e.hp -= dmg; if (e.hp <= 0) { e.dead = true; burst(e.x, e.y + BODY, '#cfd3dc', 10, 200); } return dmg; }
  if (e.inv > 0 || B(e, 'inv')) return 0;
  if (e.h.onHurt) { const r = e.h.onHurt(e, dmg, by, o); if (r === 0) return 0; if (r > 0) dmg = r; }
  dmg *= V(e, 'dr', 1) * (B(e, 'expose') ? 1.1 : 1);
  if (e.h.resist && o.el) dmg *= .7;
  if (e.shield > 0) { const a = Math.min(e.shield, dmg); e.shield -= a; dmg -= a; if (e.shield <= 0 && e.onShieldBreak) { const fn = e.onShieldBreak; e.onShieldBreak = null; fn(e); } if (dmg <= 0) return 0; }
  e.hp -= dmg; e.lastHit = time; e.recent.push([time, dmg / STAT_X]); e.taken = (e.taken || 0) + dmg;
  e.lastDmg = { src: o.src || SRC || (o.basic ? '기본 공격' : '패시브'), t: time };
  if (by && by !== e) { by.dealt = (by.dealt || 0) + dmg; if (!by.minion && by.h.onDeal) by.h.onDeal(by, e, dmg, o); }
  if (o.quiet) { e.acc += dmg; if (e.acc >= 8 * STAT_X) { addText({ x: e.x + rnd(-10, 10), y: e.y - 70, txt: String(Math.round(e.acc)), life: .6, color: '#ffb347' }); e.acc = 0; } }
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
      src: SRC, life: o.range || h.range || 500, dmg: o.dmg != null ? o.dmg : (h.dmgf ? h.dmgf(f) : h.dmg), team: teamOf(f), owner: f, r: o.r || 5, shape: o.shape || h.w.shape,
      pierce: o.pierce != null ? o.pierce : (h.pierce || 0), splash: o.splash != null ? o.splash : (o.skill ? 0 : (h.splash || 0)), boom: o.boom ? 1 : 0, phase: 0, bnc: o.bnc != null ? o.bnc : (o.skill ? 0 : (h.w.bounces || 0)), nb: 0, wp: o.wp != null ? o.wp : (o.shape || h.w.shape) === 'bomb',      // thrown bombs fly over walls (they arc)
     
      o, hit: new Set(), born: time, basic: !o.skill, x0: f.x, y0: f.y, wid: o.skill || o.shape ? null : h.id };
    if (o.homing) { b.home = o.homing; b.homeT = o.homeT || 9; }
    if (o.wave) { b.wave = o.wave; b.bx = b.x; b.by = b.y; b.trav = 0; }
    if (b.basic && b.wp && f.h.splash && f.tx != null && !o.full) b.life *= bombFrac(f);      // thrown bombs land where you aim (cursor / drag length), up to the full range
    bullets.push(b);
  }
}
function bombFrac(f) { return f.tx == null ? 1 : clamp(Math.hypot(f.tx - f.x, f.ty - f.y) / f.h.range, .25, 1); }
function zone(o) { const z = Object.assign({ t: 3, r: 80, col: '#ffffff', acc: 0, src: SRC, team: o.by ? teamOf(o.by) : 0 }, o); zones.push(z); return z; }
const inZone = (z, e) => Math.hypot(e.x - z.x, e.y - z.y) < z.r + 10;
function strike(by, x, y, r, delay, fn, col, env) { strikes.push({ by, x, y, r, t: delay, max: delay, fn, col: col || '#ff5d5d', src: SRC, env }); }
function minion(o) { const m = Object.assign({ minion: true, vx: 0, vy: 0, kx: 0, ky: 0, b: {}, dead: false, hp: 1, t: 5, hit: false, lastFire: -9, lastHit: -9, acc: 0, born: time, src: SRC }, o); if (o.hp) m.hp = o.hp * STAT_X; m.team = o.by ? teamOf(o.by) : o.team; m.max = m.hp; minions.push(m); return m; }
function leapLand(f, d) {       // a leap that ends inside a wall keeps going to the first free spot beyond it (so it really clears the wall)
  const free = (x, y) => ![[-16, -16], [16, -16], [-16, 16], [16, 16], [0, 0]].some(([ox, oy]) => blockedAt(x + ox, y + oy));
  if (free(f.x, f.y)) return;
  for (let s = T / 4; s <= 3 * T; s += T / 4) { const x = f.x + d.dx * s, y = f.y + d.dy * s; if (free(x, y)) { f.x = x; f.y = y; return; } }
}
function lunge(f, ang, d, dur, o) { f.dash = Object.assign({ t: dur, dx: Math.cos(ang), dy: Math.sin(ang), v: d / dur, hit: new Set(), skill: 1, src: SRC }, o); }

/* ---------- fighters ---------- */
function makeFighter(team, slot, id, isPlayer, lo0, cos, nick) {
  const h = HEROES[id], p = spawnPos(team, slot);
  const f = { team, slot, h, h0: h, isPlayer, x: p.x, y: p.y, tx: p.x, ty: p.y, vx: 0, vy: 0, kx: 0, ky: 0, mv: [0, 0], aim: team === 0 ? 0 : Math.PI,
    hp: h.hp, mhp: h.hp, dead: false, respawnT: 0, inv: 1.5, lastHit: -9, lastFire: -9, lastMove: 0, fireCd: 0, ucd: 6, dcd: 0, scd: [0, 0], sk: [null, null],
    queue: [], dash: null, swing: 0, spin: 0, shield: 0, onShieldBreak: null, dots: [], recent: [], b: {}, x_: 0, st: {}, acc: 0, dealt: 0, hold: false, washold: false, tapT: 0, form: null, ghost: false,
    kos: 0, deaths: 0, taken: 0, healed: 0, killer: null, lastDmg: null, bob: Math.random() * 6, infTick: 0,
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
  curMap = i; MAP = MAPS[i].grid.map(r => r.split('')); ROWS = MAP.length; COLS = MAP[0].length; WW = COLS * T; WH = ROWS * T; TH = MAPS[i].th; tempWalls.clear(); NET.mapVer++; envReset();
  const d = bfs(1, ROWS >> 1); ROAM = [];
  SOLO_SP = []; for (let k = 0; k < 6; k++) { const a = (k + .5) * Math.PI / 3; SOLO_SP.push(freeNear(WW / 2 + Math.cos(a) * (WW / 2 - 2.5 * T), WH / 2 + Math.sin(a) * (WH / 2 - 2.5 * T))); }
  for (let r = 1; r < ROWS - 1; r += 2) for (let c = 4; c < COLS - 4; c += 2) if (!blocked(c, r) && d[c + r * COLS] > 0) ROAM.push([c, r]);
}
/* humans: [{ hero, lo, local } | { hero, lo, remote }]; they take turns blue / red, the middle slot first; bots fill the rest */
function setup(withPlayer, humans) {
  curMode = modeOf(modeChoice).id; const MODE = modeNow(); RD = { n: 1, pause: 0, win: -1, out: [] }; SZ.on = false; FLAGS = [];
  loadMap(mapChoice < 0 || !MODE.maps.includes(mapChoice) ? pick(MODE.maps) : mapChoice);
  fighters = []; bullets = []; parts = []; texts = []; rings = []; zones = []; minions = []; timers = []; strikes = []; score = new Array(MODE.teams).fill(0); timeLeft = MODE.time; overtime = false; otT = 0; player = null; VIEW = 0;
  humans = humans || (withPlayer ? [{ hero: chosen, lo: loadoutOf(chosen), local: true, cos: myCos(chosen), name: PROF.name }] : []);
  const per = MODE.per, nt = MODE.teams, grid = Array.from({ length: nt }, () => new Array(per).fill(null)), ORDER = per === 3 ? [1, 0, 2] : [...Array(per).keys()];
  humans.forEach((h, i) => { grid[i % nt][ORDER[Math.floor(i / nt)]] = h; });
  const used = new Set(humans.map(h => h.hero)), pool = ROSTER.filter(k => !used.has(k)).sort(() => Math.random() - .5);
  for (let team = 0; team < nt; team++) for (let i = 0; i < per; i++) {
    const hm = grid[team][i];
    const f = makeFighter(team, per === 1 ? 1 : i, hm ? hm.hero : pool.pop(), !!(hm && hm.local), hm && hm.lo, hm && hm.cos, hm && hm.name);
    if (hm) { f.human = true; if (hm.local) player = f; if (hm.remote) { f.remote = hm.remote; f.netIn = null; hm.remote.f = f; hm.remote.fi = fighters.length; } }
    fighters.push(f);
  }
  modeStart();
}
const canAct = f => !f.dead && !B(f, 'stun') && !f.dash && f.form !== 'gone';
const canAtk = f => canAct(f) && !B(f, 'mute') && !f.noAtk && f.form !== 'sub' && f.form !== 'dove';
function cdOf(f) { const h = f.h; return (h.cdf ? h.cdf(f) : h.cd) * V(f, 'rapid', 1); }
function basic(f, ang) { return withSrc('기본 공격', () => basic0(f, ang)); }
function basic0(f, ang) {
  const h = f.h;
  if (h.atk && h.atk(f, ang) !== undefined) return;
  if (h.type === 'melee') { f.swing = .22; addSwing(f, ang); const hits = arc(f, ang, h.range, h.half, h.dmgf ? h.dmgf(f) : h.dmg, Object.assign({ kb: h.kb, basic: 1 }, h.mo ? h.mo(f) : null)); if (h.onSwing) h.onSwing(f, hits, ang); return; }
  for (let i = 0; i < (h.burst || 1); i++) f.queue.push({ t: i * (h.bdelay || 0), ang, o: null, src: SRC });
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
  const r = withSrc((i + 1) + '스킬: ' + skName(def, f), () => def.f(f, f.aim, i));
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
  const r = withSrc('궁극기: ' + u.name, () => u.f(f, f.aim));
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
  const ki = by && by !== e ? fighters.indexOf(by) : -1, src = e.lastDmg && time - e.lastDmg.t < .6 ? e.lastDmg.src : '패시브';
  e.killer = { i: ki, src }; fxPlay('killinfo', fighters.indexOf(e), ki, src);
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
    if (curMode === 'team') score[1 - e.team]++;
    else if (curMode === 'solo') { RD.out.push(e.team); e.respawnT = 0; const k = by && by !== e ? (by.minion ? by.by : by) : null; if (k && k.team !== e.team && score[k.team] != null) score[k.team]++; }
    addFeed(by && by !== e ? by : null, e);
    sfx(e === player ? 200 : 600, .3, 'triangle', .07, e === player ? .3 : 1.8);
  }
}
function respawn(f) {
  const p = spawnPos(f.team, f.slot);
  Object.assign(f, { killer: null, lastDmg: null, ivx: 0, ivy: 0, x: p.x, y: p.y, hp: f.mhp, dead: false, inv: 2, kx: 0, ky: 0, lastHit: -9, lastFire: -9, fireCd: 0, st: {}, b: {}, dots: [], recent: [], shield: 0, form: null, ghost: false, noAtk: false, noSkill: false, boomOut: false });
  if (f.h.spawn) f.h.spawn(f);
  fx('respawn', f.x, f.y - 20, { color: TC(f.team) });
}

/* ---------- AI ---------- */
function ai(f, dt) { const mv = ai0(f, dt), fl = envFlee(f) || zoneFlee(f) || flagGoal(f); return fl || mv; }
/* ranged bots kite: when an enemy gets close they back off along the safest open direction (away from every nearby enemy, not into walls or
   corners) while still shooting, and dash away from a melee enemy that is about to land a hit */
let AI_KITE = true;
/* how sharp bots are (2026-11-11: a little easier than before; the old values were aim .1, lead .7, cool ranged .2-.7 / melee .05-.3, skill .05, ult .06 per frame) */
const AI_LV = { aim: .13, lead: .62, coolR: [.24, .78], coolM: [.07, .34], sk: .045, ult: .055 };
function kiteStep(f, reach) {
  const ts = foes(f).filter(e => !e.dead && !e.minion && !B(e, 'ally') && dist(f, e) < reach * 1.2 && visibleTo(e, teamOf(f)));
  if (!ts.length) return null;
  const a = f.ai; let best = null, bs = -1e9;
  for (let k = 0; k < 16; k++) {
    const ang = k / 16 * Math.PI * 2, dx = Math.cos(ang), dy = Math.sin(ang);
    let ok = true; for (const s of [.5, 1, 1.6]) if (blockedAt(f.x + dx * s * T, f.y + dy * s * T)) { ok = false; break; }
    if (!ok) continue;
    const px = f.x + dx * 1.4 * T, py = f.y + dy * 1.4 * T;
    let s = 0;
    for (const e of ts) { const d = Math.hypot(px - e.x, py - e.y), w = e.h.type === 'shot' ? .5 : 2; s += Math.min(d, 9 * T) * w; }
    let open = 0; for (const m of [2.4, 3.4]) if (!blockedAt(f.x + dx * m * T, f.y + dy * m * T)) open += 1;
    s += open * .6 * T;
    if (a.kdir !== undefined) s += Math.cos(ang - a.kdir) * .5 * T;
    if (s > bs) { bs = s; best = ang; }
  }
  if (best === null) return null;
  a.kdir = best; return [Math.cos(best), Math.sin(best)];
}
function ai0(f, dt) {
  const a = f.ai, h = f.h, L = a.lv || AI_LV;
  f.hold = false;
  a.cool -= dt; a.strafeT -= dt; a.roamT -= dt; a.stT -= dt;
  if (a.stT <= 0) { if (Math.hypot(f.x - a.sx, f.y - a.sy) < 8) { a.roamT = 0; a.sdir *= -1; } a.sx = f.x; a.sy = f.y; a.stT = .7; }
  let tgt = null, bd = 1e9;
  if (!B(f, 'blind')) for (const e of foes(f)) {
    if (!visibleTo(e, teamOf(f)) || B(e, 'ally')) continue;
    const d = dist(f, e) + (e.minion ? 60 : 0);
    if (d < bd) { bd = d; tgt = e; }
  }
  a.bd = tgt ? bd : 1e9;
  if (tgt && bd < 13 * T) {
    const see = los(f.x, f.y, tgt.x, tgt.y), ang = angTo(f, tgt), close = h.type !== 'shot';
    f.aim = ang; f.tx = tgt.x; f.ty = tgt.y;
    const reach = h.rangef ? h.rangef(f) : h.range, inRange = bd < (close ? reach + 6 : reach * .95);
    if (see && !B(f, 'charm')) {
      const u = h.ult;
      if (f.ucd <= 0 && bd >= u.r[0] && bd <= u.r[1] && (!u.ok || u.ok(f, tgt, bd)) && Math.random() < L.ult) useUlt(f);
      for (let i = 0; i < 2; i++) { const d = f.sk[i]; if (d && f.scd[i] <= 0 && bd >= d.r[0] && bd <= d.r[1] && (!d.ok || d.ok(f, tgt, bd)) && Math.random() < L.sk) useSkill(f, i); }
    }
    if ((see || h.w.shape === 'bomb') && inRange) {      // bombs arc over walls, so a bomber throws at an enemy behind cover too
      if (h.fireHeld) { f.hold = h.aiHold ? h.aiHold(f, a) : true; }
      else if (a.cool <= 0 && f.fireCd <= 0) {
        if (!close) { const t = bd / (h.bspd || 800) * L.lead; f.aim = Math.atan2(tgt.y + tgt.vy * t - f.y, tgt.x + tgt.vx * t - f.x) + rnd(-L.aim, L.aim); }
        f.hold = true; a.cool = close ? rnd(L.coolM[0], L.coolM[1]) : rnd(L.coolR[0], L.coolR[1]);
      }
    }
    const low = f.hp < f.mhp * .3 && !B(f, 'charm') && modeNow().respawn;      // (no running home in modes without respawn: nothing waits there)
    if (low) {
      const s = spawnPos(f.team, f.slot);
      if (Math.hypot(s.x - f.x, s.y - f.y) > 1.5 * T) { const mv = pathTo(f, s.x, s.y); if (bd < 3 * T) tryDash(f, mv[0], mv[1]); return mv; }
    }
    if (AI_KITE && h.type === 'shot' && !tgt.minion) {
      const melee = tgt.h && tgt.h.type !== 'shot', danger = melee ? Math.max(5 * T, reach * .55) : reach * .42;
      if (bd < danger) {
        const k = kiteStep(f, Math.max(reach, 6 * T));
        if (k) { if (melee && bd < 2.6 * T && f.dcd <= 0) tryDash(f, k[0], k[1]); return k; }
      }
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
    if (aiming) aim = Math.atan2(stickA.dy, stickA.dx);      // (the drag length also sets how far a bomb is thrown, below)
    else if (len > .15) aim = Math.atan2(my, mx);
    const e = nearest(f, 9 * T, null, 0, false);
    if (e && !aiming) { tx = e.x; ty = e.y; } else { const dl = aiming && f.h.splash && f.h.w.shape === 'bomb' ? clamp(Math.hypot(stickA.dx, stickA.dy), .3, 1) * f.h.range : 5 * T; tx = f.x + Math.cos(aim) * dl; ty = f.y + Math.sin(aim) * dl; }
  } else {
    const wx = (mouse.x - W / 2) / cam.s + cam.x, wy = (mouse.y - H / 2) / cam.s + cam.y;
    aim = Math.atan2(wy - (f.y + BODY), wx - f.x); tx = wx; ty = wy - BODY;
  }
  if (pendingFire && pendingFire.len != null && f.h.splash && f.h.w.shape === 'bomb') { const dl = clamp(pendingFire.len, .3, 1) * f.h.range; tx = f.x + Math.cos(pendingFire.ang) * dl; ty = f.y + Math.sin(pendingFire.ang) * dl; }      // phone: the drag length sets the bomb's distance
  if (mouseRel) { mouseRel = false; if (!f.h.fireHeld && !touchMode) pendingFire = { ang: aim }; }      // PC: the basic attack goes out when the button is released, towards the cursor
  const inp = { mx, my, aim, tx, ty, hold: (mouse.down && !!f.h.fireHeld) || (aiming && !!f.h.fireHeld), touch: touchMode, aiming, pf: pendingFire, ult: wantUlt, dash: wantDash, sk: wantSk.slice() };
  if (neckNp != null) { inp.np = neckNp; neckNp = null; }       // 목 베기: where the bar was the moment the key went down (sent only with that press, so a later frame can't overwrite it)
  else if (f.st.neck && (inp.sk[0] || inp.sk[1])) { const ph = ((time - f.st.neck) * 1.8) % 2; inp.np = ph < 1 ? ph : 2 - ph; }
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
/* walking speed with every modifier (net.js uses the same function to predict a guest's own movement) */
function moveSpeed(f) { const h = f.h; return SPEED * V(f, 'haste', 1) * V(f, 'slow', 1) * V(f, 'pad', 1) * (B(f, 'infect') ? .9 : 1) * (h.spd ? h.spd(f) : 1) * (carrying(f) ? .85 : 1); }
function updateFighter(f, dt) {
  if (f.dead) { if (!modeNow().respawn) return; f.respawnT -= dt; if (f.respawnT <= 0) respawn(f); return; }
  const h = f.h;
  f.inv = Math.max(0, f.inv - dt); f.fireCd -= dt; f.ucd -= dt; f.dcd -= dt; f.scd[0] -= dt; f.scd[1] -= dt; f.tapT -= dt;
  f.swing = Math.max(0, f.swing - dt); f.spin = Math.max(0, f.spin - dt);
  for (const k of Object.keys(f.b)) { const o = f.b[k]; if (o && o.t > 0) { o.t -= dt; if (o.t <= 0 && o.end) withSrc(o.src, () => o.end(f)); if (f.dead) return; } }       // an end() can kill the fighter (kill() swaps f.b for a fresh {}): do not read the old keys from the new object
  while (f.recent.length && time - f.recent[0][0] > 3) f.recent.shift();
  if (h.tick) h.tick(f, dt);
  poisonTick(f, dt);
  if (f.dead) return;
  for (let i = f.dots.length - 1; i >= 0; i--) { const d = f.dots[i]; d.t -= dt; d.tick -= dt; if (d.tick <= 0) { d.tick += .5; withSrc(d.src, () => damage(f, d.dps * .5, d.by, { quiet: 1, el: 1, raw: 1 })); if (f.dead) return; } if (d.t <= 0) f.dots.splice(i, 1); }
  if (B(f, 'infect')) {
    f.infTick -= dt;
    if (f.infTick <= 0) { f.infTick = .5; const by = f.b.infect.v; damage(f, 1, by, { quiet: 1, el: 1, raw: 1 }); if (f.dead) return; for (const o of fighters) if (o !== f && !o.dead && o.team === f.team && !B(o, 'infect') && dist(o, f) < 46) buff(o, 'infect', 5, by); }
  }
  if (time - Math.max(f.lastHit, f.lastFire) > (h.rest || 3) && f.hp < f.mhp) f.hp = Math.min(f.mhp, f.hp + f.mhp * .1 * dt);
  for (let i = f.queue.length - 1; i >= 0; i--) { const q = f.queue[i]; q.t -= dt; if (q.t <= 0) { withSrc(q.src, () => emit(f, q.ang, q.o)); f.queue.splice(i, 1); } }
  const px = f.x, py = f.y, stunned = B(f, 'stun');
  if (f.dash) {
    const d = f.dash, src0 = SRC; SRC = d.src || null;
    if (d.inv) f.inv = Math.max(f.inv, .05);
    const bx = f.x, by = f.y;
    for (let i = 0; i < 4; i++) moveFighter(f, d.dx * d.v * dt / 4, d.dy * d.v * dt / 4);
    if (d.onHit || d.dmg) for (const e of foes(f)) { if (d.hit.has(e) || dist(e, f) > 44) continue; d.hit.add(e); if (d.dmg) damage(e, d.dmg, f, d); status(e, Object.assign(d, { by: f })); if (d.onHit && d.onHit(e) === 'stop') { d.t = 0; break; } }
    if (d.trail) d.trail(f);
    addPart({ x: f.x, y: f.y + BODY, vx: 0, vy: 0, life: .2, max: .2, color: d.col || TC(f.team), r: 9 });
    d.t -= dt;
    if (d.t <= 0 || (d.skill && Math.hypot(f.x - bx, f.y - by) < d.v * dt * .2)) { f.dash = null; if (d.fly === 2) leapLand(f, d); unstick(f); if (d.end) d.end(f); }
    SRC = src0;
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
      if (f.hold) { if (h.fireHeld) withSrc('기본 공격', () => h.fireHeld(f, dt)); else fire(f, f.aim); }
      else if (f.washold && h.fireUp) withSrc('기본 공격', () => h.fireUp(f));
    }
    f.washold = f.hold;
    if (stunned || B(f, 'root') || f.rooted) mv = [0, 0];
    let sp = moveSpeed(f);
    if (h.moveOk && !h.moveOk(f, f.x + mv[0] * sp * dt, f.y + mv[1] * sp * dt)) mv = [0, 0];
    if (mv[0] || mv[1]) f.lastMove = time;
    const ice = onIce(f), tvx = mv[0] * sp, tvy = mv[1] * sp;
    if (ice && !B(f, 'root') && !f.rooted) { const k = 1 - Math.exp(-2.2 * dt); f.ivx = (f.ivx || 0) + (tvx - (f.ivx || 0)) * k; f.ivy = (f.ivy || 0) + (tvy - (f.ivy || 0)) * k; }      // ice: steering lags behind, you slide on
    else { f.ivx = tvx; f.ivy = tvy; }
    const wnd = galeOn() ? GALE_PUSH : 0;
    moveFighter(f, (f.ivx + f.kx + Math.cos(GALE.ang) * wnd) * dt, (f.ivy + f.ky + Math.sin(GALE.ang) * wnd) * dt);
    if (!flying(f) && blockedAt(f.x, f.y)) unstick(f);
    padStep(f, dt);
  }
  const kd = Math.exp(-(onIce(f) ? 3.2 : 8) * dt); f.kx *= kd; f.ky *= kd;
  f.vx = (f.x - px) / dt; f.vy = (f.y - py) / dt;
  f.bob += Math.hypot(f.vx, f.vy) * dt * .06;
}
function updateBullets(dt) {
  const src0 = SRC;
  for (let i = bullets.length - 1; i >= 0; i--) {
    const b = bullets[i], o = b.o, bx0 = b.x, by0 = b.y; let dead = false; SRC = b.src || null;
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
        if (b.bnc > 0 && b.life > 0 && !b.wp && !b.wave && solidAt(b.x, b.y)) {      // bouncing shots (차원 여행자): mirror off the wall face that was hit
          const px0 = b.x - b.vx * dt / 2, py0 = b.y - b.vy * dt / 2, hx = solidAt(b.x, py0), hy = solidAt(px0, b.y);
          if (hx || !hy) b.vx = -b.vx; if (hy || !hx) b.vy = -b.vy;
          b.x = px0; b.y = py0; b.ang = Math.atan2(b.vy, b.vx); b.bnc--; b.nb++; b.hit.clear();
          if (o.bmul) b.dmg = Math.min(o.bcap || 1e9, b.dmg * o.bmul);
          if (fxInView(b.x, b.y)) fx('spark', b.x, b.y, { ang: +b.ang.toFixed(2), color: TC(b.team), gy: b.y + 24 });
          continue;
        }
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
      if (b.splash && o.onBoom) o.onBoom(b.x, b.y);      // e.g. 폭발광 강력한 폭탄 breaks walls where it lands
      if (o.onEnd && !b.silent) o.onEnd(b);
      bullets.splice(i, 1);
    }
  }
  SRC = src0;
}
function fxStep(dt) {
  for (let i = parts.length - 1; i >= 0; i--) { const p = parts[i]; p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= .92; p.vy *= .92; p.life -= dt; if (p.life <= 0) parts.splice(i, 1); }
  for (let i = texts.length - 1; i >= 0; i--) { const t = texts[i]; t.y -= 46 * dt; t.life -= dt; if (t.life <= 0) texts.splice(i, 1); }
  for (let i = rings.length - 1; i >= 0; i--) { rings[i].life -= dt; if (rings[i].life <= 0) rings.splice(i, 1); }
  shake = Math.max(0, shake - 40 * dt);
}
function step(dt) {
  time += dt;
  for (let i = timers.length - 1; i >= 0; i--) { const t = timers[i]; t.t -= dt; if (t.t <= 0) { timers.splice(i, 1); if (!t.f || !t.f.dead) withSrc(t.src, t.fn); } }
  for (const f of fighters) updateFighter(f, dt);
  updateBullets(dt);
  for (let i = zones.length - 1; i >= 0; i--) { const z = zones[i]; z.t -= dt; if (z.fn) withSrc(z.src, () => z.fn(z, dt)); if (z.t <= 0 || z.dead) { if (z.end) withSrc(z.src, () => z.end(z)); zones.splice(i, 1); } }
  for (let i = strikes.length - 1; i >= 0; i--) { const s = strikes[i]; s.t -= dt; if (s.t <= 0) { strikes.splice(i, 1); withSrc(s.src, () => s.fn(s)); } }
  for (let i = minions.length - 1; i >= 0; i--) { const m = minions[i]; m.t -= dt; for (const k in m.b) m.b[k].t -= dt; if (!m.dead && m.upd && !B(m, 'stun')) withSrc(m.src, () => m.upd(m, dt)); if (m.t <= 0 || m.dead || (m.bound && m.by.dead)) { if (m.end) withSrc(m.src, () => m.end(m)); minions.splice(i, 1); } }
  if (typeof gardenStep === 'function') gardenStep();      // (gardener.js: planted bushes wither)
  fxStep(dt);
  if (state === 'play') {
    envStep(dt);
    const MODE = modeNow();
    if (MODE.rounds) { roundStep(dt); return; }
    if (MODE.id === 'solo') { soloStep(dt); return; }
    if (MODE.id === 'flag') flagStep(dt);
    if (overtime) otT += dt; else timeLeft = Math.max(0, timeLeft - dt);
    if (score[0] >= MODE.win || score[1] >= MODE.win) endGame();
    else if (overtime) { if (score[0] !== score[1] || otT >= OT_MAX) endGame(); }
    else if (timeLeft <= 0) { if (score[0] !== score[1]) endGame(); else startOvertime(); }
  }
}

/* ===== rounds (듀얼 배틀): nobody respawns inside a round; a round goes to the side left standing, or on time to the side with more health left;
   score[] counts round wins and the first to MODE.win takes the match. A double knockout or an exact health tie replays the round. ===== */
function roundStep(dt) {
  const MODE = modeNow();
  if (RD.pause > 0) { RD.pause -= dt; for (const f of fighters) if (f.dead) f.respawnT = Math.max(0, RD.pause); if (RD.pause <= 0) { if (score[0] >= MODE.win || score[1] >= MODE.win) endGame(); else newRound(); } return; }
  timeLeft = Math.max(0, timeLeft - dt);
  const hpOf = t => fighters.filter(f => f.team === t && !f.dead).reduce((s, f) => s + f.hp / f.mhp, 0), a = hpOf(0), b = hpOf(1);
  let w = -2;
  if (a <= 0 && b <= 0) w = -1; else if (a <= 0) w = 1; else if (b <= 0) w = 0;
  else if (timeLeft <= 0) w = Math.abs(a - b) < 1e-6 ? -1 : a > b ? 0 : 1;
  if (w === -2) return;
  if (w >= 0) score[w]++;
  RD.pause = 2.5; timeLeft = MODE.time;
  const done = score[0] >= MODE.win || score[1] >= MODE.win;
  for (const f of fighters) if (!f.dead) say(f, w < 0 ? '무승부 · 다시' : f.team === w ? (done ? '승리!' : '라운드 승리') : '라운드 패배', w >= 0 && f.team === w ? '#ffd34d' : '#cfd3dc');
  sfx(520, .3, 'triangle', .07, 1.5);
}
function newRound() {
  RD.n++; bullets = []; zones = []; minions = []; strikes = []; timers = []; tempWalls.clear(); NET.mapVer++; timeLeft = modeNow().time;
  for (const f of fighters) { f.queue = []; f.dash = null; if (f.h !== f.h0) { f.h = f.h0; f.sk = f.sk0; } respawn(f); f.scd = [0, 0]; f.dcd = 0; f.ucd = 6; say(f, RD.n + '라운드', '#ffffff'); }
}

/* ===== 원 레프트: six fighters, everyone for themselves, nobody comes back. The safe zone starts closing after SZ_WAIT seconds and is gone when the clock
   hits zero, so a match cannot outlast the clock by more than a few seconds. score[team] = that fighter's kills; RD.out = teams in the order they fell;
   RD.win = the winner (the last one standing; if the last two fall together, the one who fell last). ===== */
function modeStart() {
  if (curMode === 'flag') flagsReset();
  if (curMode !== 'solo') return;
  const g = freeNear(WW / 2, WH / 2);
  Object.assign(SZ, { on: true, x: WW / 2, y: WH / 2, r0: Math.hypot(WW, WH) / 2, r: Math.hypot(WW, WH) / 2, gx: g.x, gy: g.y, acc: 0 });
}
function soloStep(dt) {
  if (RD.pause > 0) { RD.pause -= dt; if (RD.pause <= 0) endGame(); return; }
  const MODE = modeNow();
  timeLeft = Math.max(0, timeLeft - dt);
  const k = clamp((MODE.time - timeLeft - SZ_WAIT) / (MODE.time - SZ_WAIT), 0, 1);      // 0 = zone still open, 1 = closed
  SZ.r = k < .8 ? SZ.r0 + (SZ_MIN - SZ.r0) * (k / .8) : SZ_MIN * (1 - (k - .8) / .2);
  SZ.acc += dt;
  if (SZ.acc >= .5) {
    SZ.acc -= .5;
    for (const f of fighters) if (!f.dead && Math.hypot(f.x - SZ.x, f.y - SZ.y) > SZ.r) withSrc('안전 구역 밖', () => damage(f, f.mhp * (.05 + .13 * k) * .5, null, { px: 1 }));
  }
  const left = fighters.filter(f => !f.dead);
  if (left.length <= 1) {
    RD.win = left.length ? left[0].team : RD.out.length ? RD.out[RD.out.length - 1] : -1; RD.pause = 2.5;
    if (left.length) say(left[0], '승리!', '#ffd34d');
    sfx(660, .4, 'triangle', .07, 1.5);
  }
}
/* ===== 캡쳐 플래그: walk over the enemy flag to pick it up and bring it to your own base for a point (score[team] = captures; the first to MODE.win,
   or the most when the clock runs out, wins; level = the usual overtime). A carrier who dies drops the flag where they fell; a dropped flag goes
   home when its own team touches it, or by itself after FLAG_BACK seconds. ===== */
const flagHome = t => ({ x: (t === 0 ? 2.5 : COLS - 2.5) * T, y: WH / 2 });
const carrying = f => FLAGS.length > 0 && FLAGS.some(g => g.by >= 0 && fighters[g.by] === f);      // the flag is heavy: its carrier walks 15% slower
function flagsReset() { FLAGS = [0, 1].map(t => { const h = flagHome(t); return { team: t, hx: h.x, hy: h.y, x: h.x, y: h.y, by: -1, home: true, back: 0 }; }); }
function flagStep(dt) {
  for (const g of FLAGS) {
    const c = g.by >= 0 ? fighters[g.by] : null;
    if (g.by >= 0 && (!c || c.dead)) { g.by = -1; g.back = FLAG_BACK; }                     // the carrier fell: the flag stays where they were
    else if (c) {
      g.x = c.x; g.y = c.y;
      const h = FLAGS[c.team];
      if (Math.hypot(c.x - h.hx, c.y - h.hy) < FLAG_R + 10) {                                // brought home: a point
        score[c.team]++; Object.assign(g, { x: g.hx, y: g.hy, by: -1, home: true, back: 0 });
        addText({ x: c.x, y: c.y - 96, txt: '+1', life: 1.2, color: '#ffd34d' }); fx('respawn', h.hx, h.hy - 20, { color: TC(c.team) }); sfx(700, .35, 'triangle', .08, 1.4);
      }
      continue;
    }
    if (!g.home) { g.back -= dt; if (g.back <= 0) { Object.assign(g, { x: g.hx, y: g.hy, home: true }); continue; } }
    for (let i = 0; i < fighters.length; i++) {
      const f = fighters[i];
      if (f.dead || f.ghost || f.form === 'gone' || Math.hypot(f.x - g.x, f.y - g.y) > FLAG_R) continue;
      if (f.team !== g.team) { g.by = i; g.home = false; sfx(520, .2, 'triangle', .07, 1.3); break; }
      if (!g.home) { Object.assign(g, { x: g.hx, y: g.hy, home: true }); sfx(440, .2, 'triangle', .06, 1.2); break; }
    }
  }
}
/* bots and the flags: the carrier runs home; everyone hunts whoever carries their flag; a dropped own flag nearby gets picked back up; the middle slot
   guards the base and the other two go for the enemy flag. A bot in a fight (an enemy within 6 tiles) keeps fighting unless it carries the flag. */
function flagGoal(f) {
  if (curMode !== 'flag' || FLAGS.length !== 2 || f.dead || B(f, 'charm')) return null;
  const mine = FLAGS[f.team], theirs = FLAGS[1 - f.team], me = fighters.indexOf(f), bd = f.ai.bd || 1e9;
  if (theirs.by === me) return pathTo(f, mine.hx, mine.hy);
  if (bd < 6 * T) return null;
  if (mine.by >= 0) { const c = fighters[mine.by]; return c ? pathTo(f, c.x, c.y) : null; }
  if (!mine.home && Math.hypot(mine.x - f.x, mine.y - f.y) < 9 * T) return pathTo(f, mine.x, mine.y);
  if (f.slot === 1) return Math.hypot(mine.hx - f.x, mine.hy - f.y) > 4 * T ? pathTo(f, mine.hx, mine.hy) : null;
  if (theirs.by < 0) return pathTo(f, theirs.x, theirs.y);
  return null;
}
function drawFlags() {       // screen space
  if (!FLAGS.length || state !== 'play') return;
  const sx = x => (x - cam.x) * cam.s + W / 2, sy = y => (y - cam.y) * cam.s + H / 2, k = cam.s;
  const shade = (hex, m) => { const n = parseInt(hex.slice(1), 16), f = v => clamp(Math.round(v * m), 0, 255); return 'rgb(' + f(n >> 16) + ',' + f((n >> 8) & 255) + ',' + f(n & 255) + ')'; };
  ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  /* the bases: a stone plate with a glowing team ring, brighter while its flag is home */
  for (const g of FLAGS) {
    const col = TC(g.team), x = sx(g.hx), y = sy(g.hy), R = FLAG_R * k, p = .5 + Math.sin(time * 3 + g.team) * .5;
    ctx.globalAlpha = 1; ctx.fillStyle = 'rgba(10,12,18,.35)'; ctx.beginPath(); ctx.ellipse(x, y + 6 * k, R * 1.08, R * .62, 0, 0, 7); ctx.fill();
    const pl = ctx.createLinearGradient(0, y - R * .55, 0, y + R * .55); pl.addColorStop(0, '#9aa0ad'); pl.addColorStop(1, '#4a4f5c');
    ctx.fillStyle = pl; ctx.beginPath(); ctx.ellipse(x, y, R, R * .55, 0, 0, 7); ctx.fill();
    ctx.fillStyle = '#c3c8d2'; ctx.beginPath(); ctx.ellipse(x, y - 3 * k, R * .86, R * .44, 0, 0, 7); ctx.fill();
    ctx.globalAlpha = g.home ? .55 + p * .35 : .3; ctx.strokeStyle = col; ctx.lineWidth = 4 * k; ctx.beginPath(); ctx.ellipse(x, y - 3 * k, R * .72, R * .36, 0, 0, 7); ctx.stroke();
    if (g.home) { ctx.globalAlpha = .25 * p; ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(x, y - 3 * k, R * 1.25, R * .7, 0, 0, 7); ctx.fill(); }
    else { ctx.globalAlpha = .7; ctx.setLineDash([6 * k, 6 * k]); ctx.lineDashOffset = -time * 20 * k; ctx.strokeStyle = col; ctx.lineWidth = 2.5 * k; ctx.beginPath(); ctx.ellipse(x, y - 3 * k, R * 1.15, R * .64, 0, 0, 7); ctx.stroke(); ctx.setLineDash([]); }
  }
  /* the flags */
  for (const g of FLAGS) {
    const col = TC(g.team), c = g.by >= 0 ? fighters[g.by] : null, dropped = !g.home && !c;
    let bx = sx(g.x), by = sy(g.y) - 4 * k, tilt = 0;
    if (c) { bx += 30 * k; by -= 30 * k; tilt = -.18 + Math.sin(time * 9) * .05; }
    else if (dropped) tilt = .55;
    const H = (c ? 84 : 100) * k, fw = 58 * k, fh = 38 * k, sp = c ? 11 : 6;
    ctx.save(); ctx.translate(bx, by); ctx.rotate(tilt); ctx.globalAlpha = 1;
    if (!c) { ctx.fillStyle = 'rgba(10,12,18,.35)'; ctx.beginPath(); ctx.ellipse(0, 0, 9 * k, 4 * k, 0, 0, 7); ctx.fill(); }
    if (c) { const gl = ctx.createRadialGradient(fw * .5, -H + fh * .5, 2, fw * .5, -H + fh * .5, fw); gl.addColorStop(0, shade(col, 1.3)); gl.addColorStop(1, 'rgba(0,0,0,0)'); ctx.globalAlpha = .35 + Math.sin(time * 8) * .1; ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(fw * .5, -H + fh * .5, fw, 0, 7); ctx.fill(); ctx.globalAlpha = 1; }
    /* pole */
    ctx.strokeStyle = '#2a2420'; ctx.lineWidth = 8 * k; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -H); ctx.stroke();
    const pg = ctx.createLinearGradient(-3 * k, 0, 3 * k, 0); pg.addColorStop(0, '#8a5a32'); pg.addColorStop(.5, '#d39a5c'); pg.addColorStop(1, '#6e4426');
    ctx.strokeStyle = pg; ctx.lineWidth = 4.6 * k; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -H); ctx.stroke();
    /* waving cloth: top and bottom edges follow a travelling wave that grows toward the free end */
    const N = 10, top = [], bot = [];
    for (let i = 0; i <= N; i++) { const u = i / N, w = Math.sin(time * sp - u * 5.5 + g.team * 2) * u * 7 * k, dr = (dropped ? u * u * 7 : 0) * k; top.push([u * fw, -H + w + dr]); bot.push([u * fw * .96, -H + fh + w * 1.1 + dr - u * 3 * k]); }
    const cg = ctx.createLinearGradient(0, -H, fw, -H + fh); cg.addColorStop(0, shade(col, .7)); cg.addColorStop(.45, col); cg.addColorStop(1, shade(col, 1.25));
    ctx.beginPath(); ctx.moveTo(top[0][0], top[0][1]); for (const p of top) ctx.lineTo(p[0], p[1]);
    const nt = Math.round(N / 2); ctx.lineTo(fw * .78, (top[N][1] + bot[N][1]) / 2);     // swallow-tail notch
    for (let i = N; i >= 0; i--) ctx.lineTo(bot[i][0], bot[i][1]); ctx.closePath();
    ctx.fillStyle = cg; ctx.fill(); ctx.strokeStyle = '#14141c'; ctx.lineWidth = 2.2 * k; ctx.stroke();
    /* folds: light and dark stripes that move with the wave */
    ctx.save(); ctx.clip();
    for (let i = 1; i < N; i += 2) { const a = top[i], b = bot[i], s = Math.sin(time * sp - i / N * 5.5 + g.team * 2); ctx.globalAlpha = .18; ctx.strokeStyle = s > 0 ? '#ffffff' : '#000000'; ctx.lineWidth = 4 * k; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); }
    ctx.restore();
    /* emblem: a white star riding the cloth */
    const e = top[nt - 1], eb = bot[nt - 1], ex = e[0], ey = (e[1] + eb[1]) / 2, r = 9.5 * k;
    ctx.globalAlpha = 1; ctx.fillStyle = '#fff7e0'; ctx.strokeStyle = '#14141c'; ctx.lineWidth = 1.4 * k; ctx.beginPath();
    for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * .45 : r; ctx.lineTo(ex + Math.cos(a) * rr, ey + Math.sin(a) * rr); }
    ctx.closePath(); ctx.fill(); ctx.stroke();
    /* gold finial */
    const fg = ctx.createRadialGradient(-1.5 * k, -H - 6 * k, 1, 0, -H - 4 * k, 6 * k); fg.addColorStop(0, '#fff3b0'); fg.addColorStop(1, '#c98a1b');
    ctx.fillStyle = fg; ctx.strokeStyle = '#2a2420'; ctx.lineWidth = 1.8 * k; ctx.beginPath(); ctx.arc(0, -H - 5 * k, 6.5 * k, 0, 7); ctx.fill(); ctx.stroke();
    ctx.restore();
    /* a dropped flag shows how long until it flies home */
    if (dropped) {
      const x = sx(g.x), y = sy(g.y) + 18 * k, f = clamp(g.back / FLAG_BACK, 0, 1);
      ctx.globalAlpha = .85; ctx.fillStyle = 'rgba(12,14,19,.7)'; ctx.beginPath(); ctx.arc(x, y, 13 * k, 0, 7); ctx.fill();
      ctx.strokeStyle = col; ctx.lineWidth = 3.5 * k; ctx.beginPath(); ctx.arc(x, y, 10 * k, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * f); ctx.stroke();
    }
    /* sparkles trailing a carried flag */
    if (c && !lowFx() && Math.random() < .5) parts.push({ x: g.x + rnd(0, 40), y: g.y - rnd(60, 95), vx: rnd(-20, 20), vy: rnd(-40, -10), life: .45, max: .45, color: shade(col, 1.3), r: rnd(1.5, 3) });
  }
  ctx.restore();
}
/* 차원 여행자's portals and rifts (zones of kind 'portal' / 'rift'), drawn in screen space: a swirling purple and cyan gate, a dark spiral that pulls */
function drawPortals() {
  if (state !== 'play' && state !== 'over') return;
  const sx = x => (x - cam.x) * cam.s + W / 2, sy = y => (y - cam.y) * cam.s + H / 2, k = cam.s;
  ctx.save(); ctx.lineCap = 'round';
  for (const z of zones) {
    if (z.kind !== 'portal' && z.kind !== 'rift') continue;
    const x = sx(z.x), y = sy(z.y + 10), fade = clamp(z.t * 2, 0, 1), mine = z.team === VIEW;
    if (z.kind === 'portal') {
      const R = z.r * k, rot = time * 3 + (z.other && z.other.x < z.x ? Math.PI : 0);
      const g = ctx.createRadialGradient(x, y, R * .1, x, y, R * 1.15); g.addColorStop(0, 'rgba(20,6,40,.95)'); g.addColorStop(.6, 'rgba(110,40,220,.75)'); g.addColorStop(1, 'rgba(53,224,255,0)');
      ctx.globalAlpha = fade; ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(x, y, R * 1.15, R * .75, 0, 0, 7); ctx.fill();
      for (let i = 0; i < 3; i++) { ctx.strokeStyle = i % 2 ? '#35e0ff' : '#c58bff'; ctx.lineWidth = (3.5 - i) * k; const a0 = rot * (i % 2 ? -1 : 1) + i * 2.1;
        ctx.beginPath(); ctx.ellipse(x, y, R * (1 - i * .22), R * (1 - i * .22) * .65, 0, a0, a0 + 4.2); ctx.stroke(); }
      if (!lowFx() && Math.random() < .4) parts.push({ x: z.x + rnd(-z.r, z.r), y: z.y + 10 + rnd(-z.r, z.r) * .5, vx: 0, vy: rnd(-60, -25), life: .5, max: .5, color: Math.random() < .5 ? '#c58bff' : '#35e0ff', r: rnd(1.5, 3) });
      if (!mine) { ctx.globalAlpha = .6 * fade; ctx.strokeStyle = TC(z.team); ctx.lineWidth = 2 * k; ctx.beginPath(); ctx.ellipse(x, y, R * 1.2, R * .8, 0, 0, 7); ctx.stroke(); }
    } else {
      const R = z.r * k, rot = time * 4;
      const g = ctx.createRadialGradient(x, y, 2, x, y, R); g.addColorStop(0, 'rgba(10,0,25,.85)'); g.addColorStop(.7, 'rgba(90,30,200,.35)'); g.addColorStop(1, 'rgba(90,30,200,0)');
      ctx.globalAlpha = fade; ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, R, 0, 7); ctx.fill();
      ctx.strokeStyle = mine ? '#b48cff' : TC(z.team); ctx.lineWidth = 2.5 * k;
      for (let arm = 0; arm < 3; arm++) { ctx.beginPath(); for (let i = 0; i <= 24; i++) { const u = i / 24, a = rot + arm * 2.09 + u * 4.5, r = R * (1 - u) * .95; const px = x + Math.cos(a) * r, py = y + Math.sin(a) * r; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); } ctx.stroke(); }
      ctx.globalAlpha = .7 * fade; ctx.setLineDash([6 * k, 6 * k]); ctx.lineDashOffset = time * 30 * k; ctx.beginPath(); ctx.arc(x, y, R, 0, 7); ctx.stroke(); ctx.setLineDash([]);
    }
  }
  ctx.restore();
}
/* bots walk back in when they are outside the safe zone or about to be */
function zoneFlee(f) {
  if (!SZ.on) return null;
  const d = Math.hypot(f.x - SZ.x, f.y - SZ.y);
  if (d < SZ.r - 1.3 * T || d < T) return null;
  return pathTo(f, SZ.gx, SZ.gy);
}
function drawSafeZone() {       // screen space
  if (!SZ.on || state !== 'play') return;
  const x = (SZ.x - cam.x) * cam.s + W / 2, y = (SZ.y - cam.y) * cam.s + H / 2, r = Math.max(0, SZ.r * cam.s);
  ctx.save();
  ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.arc(x, y, r, 0, Math.PI * 2, true);
  ctx.fillStyle = 'rgba(190,40,90,.30)'; ctx.fill('evenodd');
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,120,160,' + (.75 + Math.sin(time * 5) * .2) + ')'; ctx.stroke();
  ctx.restore();
}

/* ===== overtime, per-match stats ===== */
const inOvertime = () => state === 'play' && timeLeft <= 0;       // true on host and guests: the clock sits at 0 only while sudden death runs
function startOvertime() {
  overtime = true; otT = 0; timeLeft = 0;
  for (const f of fighters) if (!f.dead) say(f, '연장전! 먼저 잡으면 승리', '#ffd34d');
  sfx(330, .5, 'sawtooth', .07, 2);
}
/* kos, deaths, damage dealt, damage taken, healing: one row per fighter in `fighters` order (JSON-safe, rides along with the end-of-match message) */
function matchStats() { return { ot: overtime ? 1 : 0, f: fighters.map(f => [f.kos | 0, f.deaths | 0, Math.round(f.dealt || 0), Math.round(f.taken || 0), Math.round(f.healed || 0)]) }; }
function applyMatchStats(st) {       // guests: fill the numbers the host sent into their copies of the fighters
  if (!st || !Array.isArray(st.f)) return;
  st.f.forEach((a, i) => { const f = fighters[i]; if (!f || !Array.isArray(a)) return; f.kos = a[0]; f.deaths = a[1]; f.dealt = a[2]; f.taken = a[3]; f.healed = a[4]; });
  if (st.ot) overtime = true;
}

/* ===== environment: special floor tiles + map gimmicks =====
   i ice (you slide) · p speed pad (1.5x speed while on it and for a moment after) · h heal pad (5% of max hp per second) · v lava vent (erupts every few seconds on the forge map)
   sand wind (ruins): now and then enemies farther than a few tiles from every ally are hidden and everybody is pushed a little */
const GALE = { until: 0, dur: 0, ang: 0 }, GALE_PUSH = 50, GALE_VIS = 4.8 * T;
const galeOn = () => GALE.until > time;
const tileAt = (x, y) => tile(Math.floor(x / T), Math.floor(y / T));
const ICE_SLIDE = false;      // 2026-11-11: user asked for ice that does not slide (tiles and art stay; set true to bring the sliding back)
const onIce = f => ICE_SLIDE && !f.minion && !flying(f) && tileAt(f.x, f.y) === 'i';
const isSpecialTile = t => t === 'i' || t === 'p' || t === 'h' || t === 'v';
const envNext = { gale: 1e9, vent: 1e9 };
function envReset() { GALE.until = 0; const e = MAPS[curMap].env || {}; envNext.gale = e.gale ? rnd(12, 18) : 1e9; envNext.vent = e.vents ? rnd(7, 10) : 1e9; }
function padStep(f, dt) {
  if (f.minion || flying(f)) return;
  const t = tileAt(f.x, f.y);
  if (t === 'p') { if (!B(f, 'pad')) burst(f.x, f.y + 16, '#c6ff3d', 6, 150); buff(f, 'pad', .9, 1.5); f.padT = 0; }
  else if (t === 'h') { f.padT = (f.padT || 0) + dt; if (f.padT >= .5) { f.padT -= .5; if (f.hp < f.mhp) withSrc('치유 패드', () => heal(f, f.mhp * .025 / STAT_X)); } }
  else f.padT = 0;
}
function envStep(dt) {
  const e = MAPS[curMap].env; if (!e) return;
  if (e.gale) { envNext.gale -= dt; if (envNext.gale <= 0) { envNext.gale = rnd(20, 28); fxPlay('gale', 6, +((Math.random() < .5 ? 0 : Math.PI) + rnd(-.45, .45)).toFixed(2)); for (const f of fighters) if (!f.dead) say(f, '모래바람!', '#e3c27a'); } }
  if (e.vents) { envNext.vent -= dt; if (envNext.vent <= 0) { envNext.vent = rnd(7, 11); erupt(); } }
}
function erupt() {       // a vent and its mirror image erupt together, 1.4 s after the warning circles show up
  const vs = []; for (let r = 1; r < ROWS - 1; r++) for (let c = 1; c < COLS >> 1; c++) if (MAP[r][c] === 'v') vs.push([c, r]);
  if (!vs.length) return;
  const [c, r] = pick(vs);
  for (const cc of [c, COLS - 1 - c]) strike(null, (cc + .5) * T, (r + .5) * T, 78, 1.4, s => ventBlast(s.x, s.y), '#ff7a1a', true);
}
function ventBlast(x, y) {
  withSrc('용암 분출', () => {
    fx('firepillar', x, y, { r: 76 }); fx('explosion', x, y, { gy: y + 30 }); ring(x, y, 80, '#ff7a1a', .4); burst(x, y, '#ffb347', 14, 280);
    for (const e of fighters) {
      if (e.dead || e.ghost || Math.hypot(e.x - x, e.y - y) > 78 + 18) continue;
      if (damage(e, 45, null, { el: 1, env: 1 }) && !e.dead) { knock(e, x, y, 420); buff(e, 'slow', 1.5, .7); addDot(e, { t: 2, dps: 8, by: null, kind: 'fire', tick: .5 }); }
    }
  });
}
function envFlee(f) {       // bots step out of the warning circles
  for (const s of strikes) {
    if (!s.env) continue;
    const dx = f.x - s.x, dy = f.y - s.y, d = Math.hypot(dx, dy);
    if (d < s.r + 46) return d > 1 ? [dx / d, dy / d] : [1, 0];
  }
  return null;
}
function drawSpecialTile(c, t, x, y, cc, r) {       // painted on top of the floor by tail.js drawTiles (pass 0)
  const k = time * 3 + cc + r;
  if (t === 'i') {
    c.fillStyle = 'rgba(214,240,255,.42)'; c.fillRect(x, y, T + 1, T + 1);
    c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = 2; c.lineCap = 'round'; c.beginPath();
    const o = ((cc * 7 + r * 5) % 4) * 6; c.moveTo(x + 8 + o, y + 22); c.lineTo(x + 24 + o, y + 10); c.moveTo(x + 30, y + 56 - o); c.lineTo(x + 50, y + 42 - o); c.stroke();
  } else if (t === 'p') {
    c.fillStyle = 'rgba(12,16,28,.55)'; c.fillRect(x + 4, y + 4, T - 6, T - 6);
    c.strokeStyle = '#c6ff3d'; c.globalAlpha = .55 + .35 * Math.sin(k); c.lineWidth = 3; c.strokeRect(x + 6, y + 6, T - 10, T - 10);
    c.fillStyle = '#c6ff3d'; c.beginPath(); c.moveTo(x + 36, y + 10); c.lineTo(x + 20, y + 36); c.lineTo(x + 31, y + 36); c.lineTo(x + 26, y + 56); c.lineTo(x + 46, y + 28); c.lineTo(x + 35, y + 28); c.closePath(); c.fill(); c.globalAlpha = 1;
  } else if (t === 'h') {
    const g = .5 + .5 * Math.sin(k * .7);
    c.fillStyle = 'rgba(40,200,120,' + (.22 + .16 * g) + ')'; c.beginPath(); c.arc(x + 32, y + 32, 29, 0, 6.3); c.fill();
    c.strokeStyle = '#7ef0a8'; c.lineWidth = 3; c.globalAlpha = .8; c.beginPath(); c.arc(x + 32, y + 32, 27, 0, 6.3); c.stroke(); c.globalAlpha = 1;
    c.fillStyle = '#eafff2'; c.fillRect(x + 28, y + 18, 8, 28); c.fillRect(x + 18, y + 28, 28, 8);
  } else if (t === 'v') {
    let hot = 0; for (const s of strikes) if (s.env && Math.hypot(s.x - (x + 32), s.y - (y + 32)) < 20) hot = 1 - s.t / s.max;
    c.fillStyle = 'rgba(8,6,6,.55)'; c.beginPath(); c.ellipse(x + 32, y + 36, 24, 15, 0, 0, 6.3); c.fill();
    c.strokeStyle = 'rgba(255,' + Math.round(120 + 100 * hot) + ',30,' + (.55 + .45 * hot) + ')'; c.lineWidth = 3; c.lineCap = 'round'; c.beginPath();
    c.moveTo(x + 14, y + 36); c.lineTo(x + 26, y + 32); c.lineTo(x + 34, y + 40); c.lineTo(x + 50, y + 34); c.moveTo(x + 30, y + 24); c.lineTo(x + 32, y + 33); c.stroke();
  }
}
function drawEnvOverlay() {       // screen space, called by tail.js render() after the world is drawn
  drawSafeZone(); drawFlags(); drawPortals();
  if (state !== 'play' || !galeOn()) return;
  const left = GALE.until - time, a = clamp(Math.min(left, GALE.dur - left) / .8, 0, 1);
  ctx.fillStyle = 'rgba(216,180,106,' + (.34 * a) + ')'; ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = 'rgba(255,240,200,' + (.45 * a) + ')'; ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.beginPath();
  const dx = Math.cos(GALE.ang), dy = Math.sin(GALE.ang);
  for (let i = 0; i < 34; i++) {
    const s = (i * 0.6180339 % 1) * (W + H), v = ((time * 520 + i * 211) % (W + 400)) - 200;
    const x = (i % 2 ? v : W - v) * (dx >= 0 ? 1 : -1) + (dx >= 0 ? 0 : W), y = (s % H);
    ctx.moveTo(x, y); ctx.lineTo(x + dx * 70, y + dy * 70);
  }
  ctx.stroke();
}
