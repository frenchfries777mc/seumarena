/* ---------- 연습장 (practice range; mockup approved 2026-11-26: button A, own map with 3 rooms, plain stickman dummies, user: no practice tools, cooldowns exactly as in a match, like Brawl's training cave) ----------
   From the character window (button under the get/lock button, every hero, locked ones too). Alone on a cleared map with dummies that never attack:
   three standing at near/middle/far range and one walking back and forth. A killed dummy comes back at its spot after 2s.
   No clock, nothing paid out or recorded (endGame is never called), leaving is not a lost match; 나가기 goes back to the same character window.
   engine.js: step() hands the match to prStep while PRAC.on; a .dummy fighter with .walk moves along it instead of asking the AI. */
const PRAC = { on: false, id: null, ds: [], el: null };
function prStart(id) {
  if (PRAC.on || TUT.on || state !== 'menu' || NET.role || DED || !HEROES[id]) return false;
  if (typeof newsOpen === 'function') newsOpen(false);
  const keep = [modeChoice, mapChoice];
  modeChoice = 'solo'; { const ms = modeNow().maps; mapChoice = ms[1 % ms.length]; }      // (the stone floor from the approved mockup)
  try { setup(true, [{ hero: id, lo: loadoutOf(id), local: true, cos: myCos(id), name: PROF.name }]); } finally { modeChoice = keep[0]; mapChoice = keep[1]; }
  for (let r = 1; r < ROWS - 1; r++) for (let c = 1; c < COLS - 1; c++) MAP[r][c] = '.';
  const put = (c, r, ch) => { if (r > 0 && r < ROWS - 1 && c > 0 && c < COLS - 1) MAP[r][c] = ch; };
  const wall = (c0, r0, c1, r1, ch) => { for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) put(c, r, ch || '#'); };
  /* rooms: dividers, a front wall with one centred door per room */
  wall(22, 1, 23, 31); wall(45, 1, 46, 31);
  wall(1, 31, 8, 31); wall(14, 31, 21, 31); wall(24, 31, 31, 31); wall(37, 31, 44, 31); wall(47, 31, 54, 31); wall(60, 31, 67, 31);
  /* left room (crowd): four corner blocks */
  for (const [c, r] of [[4, 5], [17, 5], [4, 25], [17, 25]]) wall(c, r, c + 1, r + 1);
  /* middle (range): cover pairs either side of the lane at each step */
  for (const r of [22, 15]) { wall(28, r, 30, r); wall(38, r, 40, r); }
  wall(26, 4, 27, 8); wall(41, 4, 42, 8);
  /* right room (big one): four blocks round it */
  for (const [c, r] of [[51, 10], [62, 10], [51, 21], [62, 21]]) wall(c, r, c + 1, r + 1);
  /* yard */
  wall(5, 36, 8, 39, 'g'); wall(60, 36, 63, 39, 'g'); wall(25, 36, 27, 37); wall(41, 36, 43, 37); wall(15, 40, 17, 41); wall(51, 40, 53, 41);
  tempWalls.clear(); NET.mapVer++; MA.main.length = 0; FLAGS = []; GALE.until = 0; envNext.gale = envNext.vent = 1e9;
  const P = player, at = (c, r) => [(c + .5) * T, (r + .5) * T];
  [P.x, P.y] = at(34, 41); P.aim = -Math.PI / 2; P.inv = 0;
  const mk = (c, r, o) => { const d = makeFighter(1, 1, 'sword', false, null, null, null); d.dummy = true; d.plain = true; d.nick = '허수아비'; [d.hx, d.hy] = at(c, r); d.x = d.hx; d.y = d.hy; d.aim = Math.PI / 2; d.inv = 0; d.deadT = 0;
    if (o && o.big) { d.big = 2.2; d.mhp = d.hp = d.mhp * 10; d.nick = '튼튼한 허수아비'; }
    if (o && o.walk) { d.wdir = 1; d.walk = f => { if (f.x > f.hx + 4 * T) f.wdir = -1; else if (f.x < f.hx - 4 * T) f.wdir = 1; return [f.wdir * .45, 0]; }; }
    return d; };
  const crowd = []; for (const r of [13, 16, 19]) for (const c of [8, 11, 14]) crowd.push(mk(c, r));      // 3 x 3, centred on the left door (col 11)
  PRAC.ds = [...crowd, mk(34, 26), mk(34, 19), mk(34, 12), mk(34, 5, { walk: 1 }), mk(57, 16, { big: 1 })];      // range on the middle door's line; big one centred in the right room
  fighters = [P, ...PRAC.ds]; score = [0, 0]; timeLeft = 600; overtime = false;
  PRAC.on = true; PRAC.id = id;
  enterPlay(); leaveMark(false);      // (leaving the practice range is not a lost match)
  document.body.classList.add('prOn'); prUi();
  return true;
}
function prUi() {
  if (PRAC.el) PRAC.el.remove();
  const el = PRAC.el = document.createElement('div'); el.id = 'prBar';
  el.innerHTML = '<button type="button" class="prEx"><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M14 4h5v16h-5M10 8l-4 4 4 4M6 12h10" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>나가기</button><span class="prT"><i>연습장</i></span><button type="button" class="prSk">⚙ 스킬</button>';
  el.querySelector('.prT').append(HEROES[PRAC.id].name);
  document.body.appendChild(el);
  el.querySelector('.prEx').addEventListener('click', () => prEnd(true));
  el.querySelector('.prSk').addEventListener('click', () => prSkWin(true));
}
function prOff() {
  if (!PRAC.on) return false;
  PRAC.on = false; PRAC.ds = []; document.body.classList.remove('prOn'); prSkWin(false);
  if (PRAC.el) { PRAC.el.remove(); PRAC.el = null; }
  return true;
}
function prEnd(back) {
  const id = PRAC.id; if (!prOff()) return;
  toMenu();
  if (back && id) { showScreen('weaponScreen'); openDetail(id); }      // back to the character window it came from
}
function prStep(dt) {
  const P = player; if (!P) return;
  if (P.dead) respawn(P);
  for (const d of PRAC.ds) {
    if (d.dead) { d.deadT += dt; if (d.deadT >= 2) { respawn(d); d.x = d.hx; d.y = d.hy; d.inv = 0; d.deadT = 0; d.wdir = 1; } continue; }
    d.aim = angTo(d, P);
    if (time - d.lastHit > 3 && d.hp < d.mhp) d.hp = Math.min(d.mhp, d.hp + d.mhp * .5 * dt);      // heals back up when left alone
  }
}
/* skill picker (mockup 5-A approved 2026-11-26): a "스킬" button beside the practice chip opens a window of every skill of the hero,
   locked ones too (practice only; the real loadout is not changed). A slot that gets a new skill starts with its cooldown at 0. */
function prSkWin(open) {
  let w = document.getElementById('prSkWin');
  if (!open || !PRAC.on) { if (w) w.remove(); return; }
  for (const k in keys) keys[k] = false; mouse.down = false;
  const P = player, h = P.h0 || P.h;
  if (!w) { w = document.createElement('div'); w.id = 'prSkWin'; document.body.appendChild(w); w.addEventListener('pointerdown', e => { if (e.target === w) prSkWin(false); }); }
  w.textContent = '';
  const box = document.createElement('div'); box.className = 'prSkBox'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true');
  const hd = document.createElement('h3'); hd.append(h.name + ' 스킬 고르기'); const x = document.createElement('button'); x.type = 'button'; x.className = 'prSkX'; x.textContent = '✕ 닫기'; x.addEventListener('click', () => prSkWin(false)); hd.append(x);
  const g = document.createElement('div'); g.className = 'prSkG';
  for (const s of h.skills) {
    const c = document.createElement('div'), at = P.sk.indexOf(s); c.className = 'prSkC' + (at >= 0 ? ' on' : '');
    const t = document.createElement('div'), b = document.createElement('b'), i = document.createElement('i'); b.textContent = nameOf(s); i.textContent = SK_LABEL[s.k] || ''; t.append(b, i); c.append(t);
    if (typeof skOpen === 'function' && !skOpen(h.id, s.n)) { const l = document.createElement('div'); l.className = 'prSkLk'; l.textContent = '🔒 잠김 · 연습장에서는 써 볼 수 있어요'; c.append(l); }
    const row = document.createElement('div'); row.className = 'prSkS';
    for (let k = 0; k < 2; k++) { const bt = document.createElement('button'); bt.type = 'button'; bt.textContent = (k + 1) + '스킬'; if (at === k) bt.className = 'on';
      bt.addEventListener('click', () => { prSkPut(k, s); prSkWin(true); }); row.append(bt); }
    c.append(row); g.append(c);
  }
  const n = document.createElement('div'); n.className = 'prSkN'; n.textContent = '카드의 1스킬 · 2스킬을 누르면 그 칸에 들어가요. 바꾼 칸은 쿨타임 0부터.';
  box.append(hd, g, n); w.append(box);
}
function prSkPut(k, s) {
  const P = player; if (!P || P.sk[k] === s) return;
  const sk = P.sk.slice(), o = sk.indexOf(s);
  if (o >= 0) { sk[o] = sk[k]; P.scd[o] = 0; }      // already in the other slot: the two swap
  sk[k] = s; P.scd[k] = 0; P.sk = sk; P.sk0 = sk;
  lastHud = '';
}
