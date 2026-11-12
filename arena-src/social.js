/* ---------- account, nickname, cosmetics, emotes, chat, kill effects, win poses ---------- */
const RND = (a, b) => a + Math.random() * (b - a);      // the Stickseum art uses these two
let fxQuality = 2;
/* settings (kept in this browser): volume, aim sensitivity (touch), fewer effects */
const SET = { vol: 100, aim: 100, fx: false };
try { const o = JSON.parse(localStorage.getItem('seumArenaSet') || '{}'); if (o.vol >= 0 && o.vol <= 100) SET.vol = o.vol | 0; if (o.aim >= 50 && o.aim <= 200) SET.aim = o.aim | 0; SET.fx = !!o.fx; } catch (e) {}
function saveSet() { try { localStorage.setItem('seumArenaSet', JSON.stringify(SET)); } catch (e) {} }
function lowFx() { return reduceMotion || SET.fx; }
/* the sound and particle functions are wrapped here so the settings work without touching engine.js or the art files */
{ const baseSfx = sfx; sfx = (f, d, t, v, sl) => { if (SET.vol <= 0) return; baseSfx(f, d, t, (v || .05) * SET.vol / 100, sl); }; }
{
  const baseP = addP, THIN = { dot: .35, streak: .35, smoke: .3, square: .35, fire: .5, flash: .5 };
  addP = o => { if (SET.fx && o) { const k = THIN[o.shape]; if (k !== undefined && (Math.random() > k || (o.shape === 'flash' && o.size >= 100))) return; } baseP(o); };
}
function fxInView(x, y) { return Math.abs(x - cam.x) < W / 2 / cam.s + 240 && Math.abs(y - cam.y) < H / 2 / cam.s + 240; }
function shakeFrom(x, y, amp, range) { if (lowFx()) return; let k = 1; if (player) k = clamp(1 - Math.hypot(player.x - x, player.y - y) / (range || 600), 0, 1); shake = Math.max(shake, amp * k * .8); }

/* account: the Frenchfries777 login (ff-auth.js, Supabase). Where it cannot load (the page is not on frenchfries777.com, or the
   network is closed), the player is a guest named 게스트 + six digits, kept in this browser. */
function nameColorFor(id) {       // (from Stickseum) the colour of a name tag
  if (!id || !COSMETICS[id]) return '#e8eaf0';
  if (id === 'name_rainbow') return 'hsl(' + ((performance.now() / 6) % 360) + ',95%,68%)';
  return COSMETICS[id].color;
}
const PROF = { name: '', guest: true, uid: null, online: false };
function guestName() {
  let n = null; try { n = localStorage.getItem('seumArenaGuest'); } catch (e) {}
  if (!/^게스트\d{6}$/.test(n || '')) { n = '게스트' + String(Math.floor(Math.random() * 1e6)).padStart(6, '0'); try { localStorage.setItem('seumArenaGuest', n); } catch (e) {} }
  return n;
}
PROF.name = guestName();
const cleanName = s => String(s || '').replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, 16);
function syncAccount() {
  const A = window.FFAuth, u = A && A.user && A.user();
  if (u) { PROF.guest = false; PROF.uid = u.id; PROF.name = cleanName(A.nickname && A.nickname()) || PROF.name; }
  else { PROF.guest = true; PROF.uid = null; PROF.name = guestName(); }
  accountUi(); if (typeof updatePick === 'function') updatePick();
  if (typeof cloudAuth === 'function') cloudAuth();
}
function loadAccount() {
  accountUi();
  const s = document.createElement('script'); s.src = 'https://frenchfries777.com/games/ff-auth.js'; s.async = true;
  s.onload = () => {
    const A = window.FFAuth; if (!A) return;
    PROF.online = true;
    try { A.ready.then(syncAccount, () => {}); } catch (e) {}
    try { A.onChange(syncAccount); A.onNick(syncAccount); } catch (e) {}
    accountUi();
  };
  s.onerror = () => { PROF.online = false; accountUi(); };
  document.head.appendChild(s);
}
function accountUi() {
  const n = document.getElementById('acctName'), b = document.getElementById('acctBtn'); if (!n) return;
  n.textContent = PROF.name; n.style.color = nameColorFor(COS.name); goldUi();
  b.hidden = false;
  if (!PROF.online) { b.textContent = '게스트'; b.disabled = true; b.title = 'Frenchfries777 계정 로그인은 frenchfries777.com에 올린 게임에서 쓸 수 있어요'; }
  else { b.disabled = false; b.title = ''; b.textContent = PROF.guest ? '로그인' : '프로필'; }
}

/* cosmetics: everything the original game sells or gives is free to wear here */
const COS_KEY = 'seumArenaCos';
const cosDefault = () => ({ skin: {}, col: null, name: null, kfx: null, pose: 'pose_cheer', emo: [0, 1, 2, 3, 4, 5, 6, 7], gold: 500, own: null, v: 0 });
function cosNorm(C) {      // the save-version fixes, run on this browser's save and on one that comes from the account (cloud.js)
  if (!Array.isArray(C.own) || !(C.v >= 2)) { C.own = []; C.skin = {}; C.gold = Math.max(500, +C.gold || 0); C.v = 2; }      // skins worn before gold existed are not owned: they have to be bought (v2 also takes back the ones an earlier build handed out)
  C.gold = Math.max(0, Math.floor(+C.gold || 0)); C.karma = Math.max(0, Math.floor(+C.karma || 0)); if (!Array.isArray(C.kr) || C.v < 3) C.kr = [];
  if (C.v < 4) for (const k of ['col', 'name', 'kfx']) if (C[k] && !C.own.includes(C[k])) C[k] = null;      // v4: character colours, name colours and kill effects are bought with gold too
  C.v = 4;      // v3: the road got new steps, nothing on it is taken yet
  C.xp = Math.max(0, Math.floor(+C.xp || 0)); if (!C.mp || typeof C.mp !== 'object') C.mp = {};
  return C;
}
let COS = cosDefault();
try { const s = JSON.parse(localStorage.getItem(COS_KEY) || 'null'); if (s && typeof s === 'object') COS = Object.assign(COS, s); } catch (e) {}
cosNorm(COS);
const saveCos = () => { try { localStorage.setItem(COS_KEY, JSON.stringify(COS)); } catch (e) {} if (typeof cloudMark === 'function') cloudMark(); };
/* gold: earned by playing, spent on skins. Prices only follow how cheap or dear the skin is in Stickseum (its gold price, rank reward, soul or season skin), on this game's own scale */
function skinPrice(id) {
  const it = COSMETICS[id]; if (!it) return 0;
  if (it.cat === 'bcol' || it.cat === 'name' || it.cat === 'kfx') {      // the same idea for colours and kill effects: Stickseum's free ones are the cheapest, its season rewards are dear
    const q = +it.price || 0;
    if (!q) return it.seasonOnly ? 2000 : 150;
    return q <= 400 ? 300 : q <= 900 ? 600 : q <= 1500 ? 1000 : q <= 2000 ? 1500 : q <= 3000 ? 2500 : q <= 4500 ? 3000 : 4000;
  }
  if (it.cat !== 'skin') return 0;
  if (it.tier) return it.lux >= 4 ? 4000 : 2000;
  if (it.premium) return 2500;
  if (/_soul$/.test(id)) return 3000;
  if (it.isNew) return 1500;
  const p = +it.price || 0;
  if (!p) return it.seasonOnly ? 2000 : 300;
  return p <= 400 ? 300 : p <= 900 ? 600 : p <= 1500 ? 1000 : p <= 2000 ? 1500 : 2500;
}
const skinOwned = id => COS.own.includes(id);
const cosLocked = id => skinPrice(id) > 0 && !skinOwned(id);      // has a price and is not bought yet
const COS_SLOT = { bcol: 'col', name: 'name', kfx: 'kfx', pose: 'pose' };
function goldUi() { for (const el of document.querySelectorAll('.goldN')) el.textContent = COS.gold.toLocaleString('en-US'); for (const el of document.querySelectorAll('.karmaN')) el.textContent = COS.karma.toLocaleString('en-US'); const sk = document.getElementById('streak'); if (sk) { sk.hidden = !((COS.ws | 0) >= 2); sk.querySelector('b').textContent = COS.ws | 0; }
  { const kb = document.querySelector('#karmaBar i'); if (kb) { let lo = 0, hi = 0; for (const r of KARMA_ROAD) { if (COS.karma >= r[0]) lo = r[0]; else { hi = r[0]; break; } } kb.style.width = (hi ? Math.round((COS.karma - lo) / (hi - lo) * 100) : 100) + '%'; } }      // the banner's bar: the way to the next step of the road
  const kd = document.getElementById('karmaDot'); if (kd) kd.hidden = !karmaOpen(); questUi();
  const ai = document.getElementById('acctIcon'); if (ai) { const l = levelOf(); ai.textContent = l.lv; ai.style.setProperty('--p', Math.round(l.into / l.need * 100)); ai.title = '레벨 ' + l.lv + ' · ' + l.into + ' / ' + l.need; } }
/* ---------- progression: karma road, boxes, player level, character mastery ---------- */
/* karma road: [karma needed, kind, amount]. kinds: g gold · rx mastery points for a random character · cx mastery points for the picked character · box / ebox · skin (amount = dearest tier). Taken steps are kept in COS.kr */
const KARMA_ROAD = [[15, 'g', 100], [30, 'rx', 200], [50, 'box'], [100, 'g', 200], [250, 'cx', 300], [500, 'box'], [1000, 'ebox'], [1500, 'g', 500], [2000, 'box'], [2500, 'cx', 600], [3000, 'ebox'], [3500, 'g', 800], [4000, 'box'], [4500, 'rx', 800], [5000, 'ebox'],
  [5500, 'g', 1200], [6000, 'box'], [8000, 'ebox'], [10000, 'skin', 4000]];
/* what a box can hold: [chance weight, kind, least, most] */
const BOX_LOOT = { box: [[50, 'g', 150, 400], [30, 'rx', 150, 300], [12, 'cx', 150, 250], [8, 'skin', 1000, 1000]], ebox: [[35, 'g', 600, 1200], [20, 'rx', 500, 800], [20, 'cx', 400, 600], [25, 'skin', 2500, 2500]] };
/* character mastery: every step is MP_STEP points (about 16 matches at ~50 a match) */
const MP_STEP = 800, MASTERY = [];
for (const [nm, n, col] of [['브론즈', 3, '#c8803a'], ['실버', 3, '#c0c8d4'], ['골드', 3, '#ffd34d'], ['플래티넘', 3, '#6fe0d0'], ['다이아', 3, '#6fb8ff'], ['아메시스트', 3, '#b07cff'], ['마스터', 5, '#ff8a4d'], ['그랜드마스터', 5, '#ff4d6d']]) for (let i = 0; i < n; i++) MASTERY.push({ name: nm + ' ' + ['I', 'II', 'III', 'IV', 'V'][i], col });
MASTERY.push({ name: '챔피언', col: '#fff3b0' });
const mpOf = h => Math.max(0, Math.floor(+(COS.mp || {})[h] || 0));
function masteryOf(h) { const mp = mpOf(h), i = Math.min(MASTERY.length - 1, Math.floor(mp / MP_STEP)), top = i === MASTERY.length - 1; return { i, name: MASTERY[i].name, col: MASTERY[i].col, into: top ? MP_STEP : mp - i * MP_STEP, need: MP_STEP, top, mp }; }
function addMp(h, n) { if (!HEROES[h]) return; COS.mp[h] = mpOf(h) + Math.max(0, Math.round(n)); }
/* player level: level L needs 150 + 50 (L - 1) xp to pass */
function levelOf() { let xp = Math.max(0, Math.floor(+COS.xp || 0)), lv = 1; while (xp >= 150 + 50 * (lv - 1) && lv < 999) { xp -= 150 + 50 * (lv - 1); lv++; } return { lv, into: xp, need: 150 + 50 * (lv - 1) }; }
/* what a match pays, by mode: kk karma per kill, kw karma for the win, mm mastery multiplier */
const MODE_PAY = { team: { kk: 1, kw: 3, mm: 1 }, flag: { kk: 1, kw: 4, mm: 1.2 }, duel: { kk: 1, kw: 2, mm: .7 }, solo: { kk: 2, kw: 6, mm: 1 } };
/* 원 레프트 karma by finishing place (user 2026-11-11): the last three places (4th to 6th of 6) get only their kills (no place bonus);
   1st gets kills + the win bonus, 2nd and 3rd kills + a smaller bonus */
function soloKarma(place, k, pm) { const n = 6; return k * pm.kk + (place >= 1 && place <= n - 3 ? [pm.kw, 4, 2][place - 1] : 0); }
function matchPay(o) {      // o: { mode, win, draw, kills, place }
  if (o.mode === 'flag5') o = Object.assign({}, o, { mode: 'flag' });      // capture the flag pays the same whatever the team size
  const pm = MODE_PAY[o.mode] || MODE_PAY.team, solo = o.mode === 'solo', k = Math.max(0, o.kills | 0), good = o.win ? 2 : o.draw || (solo && o.place <= 3) ? 1 : 0;
  return { gold: Math.round(([30, 40, 60][good] + 5 * Math.min(10, k)) * (o.mode === 'duel' ? .6 : 1)), karma: solo ? soloKarma(o.place, k, pm) : k * pm.kk + (o.win ? pm.kw : 0),
    mp: Math.round(([30, 42, 55][good] + 3 * Math.min(10, k)) * pm.mm), xp: [40, 55, 70][good] + 4 * Math.min(10, k) };
}
/* streaks: every win in a row after the first adds 1 karma to the next win (up to +5); after three losses in a row the next match pays half as much gold again.
   A draw, or a top 3 place in solo, leaves the streaks as they are. COS.ws wins in a row, COS.ls losses in a row */
function streakStep(win, draw, place) {
  COS.ws = Math.max(0, COS.ws | 0); COS.ls = Math.max(0, COS.ls | 0); const comfort = COS.ls >= 3; let karma = 0;
  if (win) { COS.ws++; COS.ls = 0; karma = Math.min(5, COS.ws - 1); }
  else if (!draw && !(place >= 1 && place <= 3)) { COS.ws = 0; COS.ls++; }
  if (comfort) COS.ls = 0;
  return { karma, gm: comfort ? 1.5 : 1 };
}
/* gives one reward and says what it was: { kind, n, hero, skin } */
function giveReward(kind, n) {
  if (kind === 'box' || kind === 'ebox') { const L = BOX_LOOT[kind]; let r = Math.random() * L.reduce((a, l) => a + l[0], 0), l = L[0]; for (const x of L) { if ((r -= x[0]) < 0) { l = x; break; } } return giveReward(l[1], Math.round((l[2] + Math.random() * (l[3] - l[2])) / 10) * 10); }
  if (kind === 'skin') {      // a skin not owned yet, from the dearest tier allowed; nothing left to give: its worth in gold
    const pool = COS_IDS('skin').filter(id => HEROES[COSMETICS[id].char] && !skinOwned(id) && skinPrice(id) <= n), top = Math.max(0, ...pool.map(skinPrice)), best = pool.filter(id => skinPrice(id) === top);
    if (best.length) { const id = pick(best); COS.own.push(id); return { kind, skin: id, hero: COSMETICS[id].char }; }
    kind = 'g';
  }
  if (kind === 'g') { COS.gold += n; return { kind, n }; }
  if (kind === 'px') { COS.xp += n; return { kind, n }; }
  if (kind === 'k') { COS.karma += n; return { kind, n }; }
  const hero = kind === 'cx' && HEROES[chosen] ? chosen : pick(Object.keys(HEROES)); addMp(hero, n); return { kind, n, hero };
}
const karmaOpen = () => KARMA_ROAD.some(r => COS.karma >= r[0] && !COS.kr.includes(r[0]));
function karmaTake(r) {
  if (COS.karma < r[0] || COS.kr.includes(r[0])) return null;
  COS.kr.push(r[0]); const got = giveReward(r[1], r[2]);
  try { sfx(880, .18, 'triangle', .06); } catch (e) {}
  saveCos(); goldUi(); return got;
}
const RW_ICON = { g: null, rx: 'ic-xpR', cx: 'ic-xpC', px: 'ic-xpP', box: 'ic-box', ebox: 'ic-ebox', skin: 'ic-skin' };
function rewardIcon(kind) { const i = document.createElement('i'); if (kind === 'k') { i.innerHTML = '<svg aria-hidden="true"><use href="#mi-karma"/></svg>'; return i; } i.className = kind === 'g' ? 'coin' : 'rwI ' + RW_ICON[kind]; return i; }
function renderKarma(got) {
  const tr = document.getElementById('karmaTrack'); tr.textContent = '';
  const fill = document.createElement('div'); fill.id = 'karmaFill'; tr.append(fill);
  let lastX = 0, prevN = 0, fillW = 0, focus = null, open = false;
  const LBL = { g: '골드', rx: '랜덤 캐릭터 XP', cx: '선택 캐릭터 XP', box: '랜덤상자', ebox: '에픽상자', skin: '스킨' };
  for (const r of KARMA_ROAD) {
    const b = document.createElement('button'), box = document.createElement('span'), pin = document.createElement('span'), num = document.createElement('span');
    const done = COS.kr.includes(r[0]), reach = !done && COS.karma >= r[0];
    b.type = 'button'; b.className = 'kStep ' + (done ? 'done' : reach ? 'reach' : 'lock') + ' k-' + r[1]; b.dataset.k = r[0]; box.className = 'kBox'; pin.className = 'kPin'; num.className = 'kNum'; num.textContent = r[0].toLocaleString('en-US');
    box.append(rewardIcon(r[1]), r[1] === 'g' || r[1] === 'rx' || r[1] === 'cx' ? r[2].toLocaleString('en-US') : LBL[r[1]]);
    b.setAttribute('aria-label', r[0] + ' 카르마: ' + LBL[r[1]] + (r[2] && r[1] !== 'skin' ? ' ' + r[2] : '')); b.title = LBL[r[1]];
    b.disabled = !reach; b.append(box, pin, num);
    if (reach) b.addEventListener('click', () => renderKarma(karmaTake(r) || null));
    tr.append(b);
    if (!focus && !done) focus = b;
  }
  /* the bar: full up to the last step reached, then part of the way to the next one */
  [...tr.querySelectorAll('.kStep')].forEach((el, i) => { const n = KARMA_ROAD[i][0], cx = el.offsetLeft + el.offsetWidth / 2; if (COS.karma >= n) { fillW = lastX = cx; prevN = n; } else if (!open) { open = true; fillW = lastX + (cx - lastX) * Math.max(0, COS.karma - prevN) / (n - prevN); } });
  fill.style.width = Math.round(fillW) + 'px';
  const road = document.getElementById('karmaRoad'); if (got === undefined && focus) road.scrollLeft = Math.max(0, focus.offsetLeft - road.clientWidth / 2 + 46);
  showGot(document.getElementById('karmaGot'), got);
}
/* the line that says what a reward turned out to be */
function showGot(g, got) {
  const cvs = g.querySelector('canvas'), ic = g.querySelector('i'), nm = g.querySelector('b'); g.hidden = !got; if (!got) return;
  cvs.hidden = !got.skin; ic.hidden = !!got.skin; ic.textContent = ''; ic.className = got.skin || got.kind === 'k' ? '' : got.kind === 'g' ? 'coin' : 'rwI ' + RW_ICON[got.kind];
  if (got.kind === 'k') ic.innerHTML = '<svg aria-hidden="true"><use href="#mi-karma"/></svg>';
  if (got.skin) { nm.textContent = HEROES[got.hero].name + ' · ' + COSMETICS[got.skin].name; try { drawItemPreview(cvs, got.skin, performance.now()); } catch (e) {} }
  else nm.textContent = (got.hero ? HEROES[got.hero].name + ' ' : '') + '+' + got.n.toLocaleString('en-US');
}
/* ---------- daily quests: three a day (one easy, one middling, one hard), picked by the date on this device. COS.dq = { d: day, p: progress x3, c: taken x3 } ---------- */
const dqDay = () => { const d = new Date(); return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate(); };
function dqList(day) {
  let sd = (day * 2654435761) >>> 0; const rnd = () => { sd = (sd + 0x6D2B79F5) >>> 0; let t = Math.imul(sd ^ sd >>> 15, 1 | sd); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }, pk = a => a[Math.floor(rnd() * a.length)];
  const modes = (typeof MODES !== 'undefined' ? MODES : []).filter(m => m.ready !== false), m1 = pk(modes), m2 = pk(modes), h1 = pk(ROSTER), h2 = pk(ROSTER), solo = modes.find(m => m.id === 'solo');
  const hn = h => HEROES[h] ? HEROES[h].name : h;
  const easy = [{ t: 'play', n: 3, txt: '3판 하기' }, { t: 'kill', n: 8, txt: '8킬' }, m1 && { t: 'play', n: 2, mode: m1.id, txt: m1.name + ' 2판' }].filter(Boolean);
  const mid = [{ t: 'win', n: 2, txt: '2승' }, h1 && { t: 'kill', n: 5, hero: h1, txt: hn(h1) + ' 5킬' }, { t: 'dmg', n: 10000, txt: '피해 10,000' }].filter(Boolean);
  const hard = [{ t: 'kill', n: 20, txt: '20킬' }, h2 && { t: 'win', n: 2, hero: h2, txt: hn(h2) + ' 2승' }, m2 && { t: 'win', n: 2, mode: m2.id, txt: m2.name + ' 2승' }, solo && { t: 'top3', n: 2, mode: 'solo', txt: solo.name + ' 3등 안 2번' }].filter(Boolean);
  const a = pk(easy), b = pk(mid.filter(q => q.t !== a.t || q.hero)), c = pk(hard.filter(q => (q.t !== a.t && q.t !== b.t) || q.hero || q.mode));
  a.rw = ['g', 150]; b.rw = ['k', 10]; c.rw = ['box'];
  return [a, b, c];
}
function dqState() { const d = dqDay(), q = COS.dq; if (!q || q.d !== d || !Array.isArray(q.p) || !Array.isArray(q.c)) COS.dq = { d, p: [0, 0, 0], c: [0, 0, 0] }; return COS.dq; }
/* a finished match: { mode, win, kills, place, hero, dealt } */
function dqMatch(m) {
  const st = dqState();
  dqList(st.d).forEach((q, i) => {
    if ((q.mode && q.mode !== m.mode) || (q.hero && q.hero !== m.hero)) return;
    const add = q.t === 'play' ? 1 : q.t === 'win' ? (m.win ? 1 : 0) : q.t === 'kill' ? m.kills | 0 : q.t === 'dmg' ? Math.round(m.dealt || 0) : q.t === 'top3' ? (m.place >= 1 && m.place <= 3 ? 1 : 0) : 0;
    st.p[i] = Math.min(q.n, (+st.p[i] || 0) + Math.max(0, add));
  });
  saveCos(); questUi();
}
function dqTake(i) {
  const st = dqState(), q = dqList(st.d)[i]; if (!q || st.c[i] || !(st.p[i] >= q.n)) return null;
  st.c[i] = 1; const got = giveReward(q.rw[0], q.rw[1]);
  try { sfx(880, .18, 'triangle', .06); } catch (e) {}
  saveCos(); goldUi(); return got;
}
/* ---------- achievements ----------
   [id, tier 0 basic · 1 normal · 2 hard · 3 extreme, text, goal, value now]. Lifetime numbers live in COS.st; COS.ach[id] = 1 reached · 2 reward taken.
   The ids also go to the server that counts how many players have each one, so never reuse or rename one. */
const achSt = () => { const s = COS.st && typeof COS.st === 'object' ? COS.st : (COS.st = {}); for (const k of ['k', 'w', 'g', 'mk', 'nd', 'sa']) s[k] = Math.max(0, Math.floor(+s[k] || 0)); for (const k of ['mw', 'mg', 'hw']) if (!s[k] || typeof s[k] !== 'object') s[k] = {}; return s; };
const achTopRank = () => Math.max(0, ...Object.keys(HEROES).map(h => masteryOf(h).i));
const ACH_PAY = [['g', 100], ['g', 300], ['box'], ['ebox']];
const ACHS = [
  ['k10', 0, '킬 10번', 10, s => s.k], ['g5', 0, '5판 하기', 5, s => s.g], ['w1', 0, '1승', 1, s => s.w], ['mk4', 0, '한 게임에서 4킬', 4, s => s.mk], ['modes', 0, '모든 모드 1판씩', 4, s => ['team', 'solo', 'flag', 'duel'].filter(m => s.mg[m]).length],
  ['k100', 1, '킬 100번', 100, s => s.k], ['w10', 1, '10승', 10, s => s.w], ['mk7', 1, '한 게임에서 7킬', 7, s => s.mk], ['nd1', 1, '팀 아웃에서 죽지 않고 승리', 1, s => s.nd], ['solo1', 1, '원 레프트 1등', 1, s => s.mw.solo | 0], ['duel5', 1, '듀얼 배틀 5승', 5, s => s.mw.duel | 0], ['flag5', 1, '캡쳐 플래그 5승', 5, s => s.mw.flag | 0],
  ['silver', 1, '한 캐릭터 실버 I', 3, () => achTopRank()], ['lv10', 1, '레벨 10', 10, () => levelOf().lv],
  ['k1000', 2, '킬 1,000번', 1000, s => s.k], ['w100', 2, '100승', 100, s => s.w], ['mk10', 2, '한 게임에서 10킬', 10, s => s.mk], ['solo10', 2, '원 레프트 1등 10번', 10, s => s.mw.solo | 0], ['allhero', 2, '모든 캐릭터로 1승', 0, s => Object.keys(HEROES).filter(h => s.hw[h]).length],
  ['dia', 2, '한 캐릭터 다이아 I', 12, () => achTopRank()], ['karma1k', 2, '카르마 1,000', 1000, () => COS.karma],
  ['k10000', 3, '킬 10,000번', 10000, s => s.k], ['w1000', 3, '1,000승', 1000, s => s.w], ['mk15', 3, '한 게임에서 15킬', 15, s => s.mk], ['soloall', 3, '원 레프트에서 나 빼고 모두 처치', 1, s => s.sa], ['champ', 3, '한 캐릭터 챔피언', MASTERY.length - 1, () => achTopRank()]
].map(a => ({ id: a[0], t: a[1], txt: a[2], n: a[3] || Object.keys(HEROES).length, v: a[4] }));
function achScan() {      // marks what has just been reached; true when something new was
  const s = achSt(); if (!COS.ach || typeof COS.ach !== 'object') COS.ach = {}; let nu = false;
  for (const a of ACHS) if (!COS.ach[a.id] && a.v(s) >= a.n) { COS.ach[a.id] = 1; nu = true; }
  return nu;
}
const achOpen = () => !!COS.ach && ACHS.some(a => COS.ach[a.id] === 1);
/* a finished match: { mode, win, kills, deaths, hero, n: fighters in it } */
function achMatch(m) {
  const s = achSt(), k = Math.max(0, m.kills | 0); if (m.mode === 'flag5') m = Object.assign({}, m, { mode: 'flag' });      // one capture the flag count, whatever the team size
  s.g++; s.k += k; s.mk = Math.max(s.mk, k); s.mg[m.mode] = (s.mg[m.mode] | 0) + 1;
  if (m.win) { s.w++; s.mw[m.mode] = (s.mw[m.mode] | 0) + 1; if (HEROES[m.hero]) s.hw[m.hero] = 1; if (m.mode === 'team' && !m.deaths) s.nd++; if (m.mode === 'solo' && m.n > 1 && k >= m.n - 1) s.sa++; }
  if (achScan()) achSync(true);
  saveCos(); questUi();
}
function achTake(id) {
  const a = ACHS.find(x => x.id === id); if (!a || COS.ach[id] !== 1) return null;
  COS.ach[id] = 2; const got = giveReward(ACH_PAY[a.t][0], ACH_PAY[a.t][1]);
  try { sfx(880, .18, 'triangle', .06); } catch (e) {}
  achScan(); saveCos(); goldUi(); return got;
}
/* how many players have each one: a random id made here (no account, no name) and the ids reached go to the server, the counts come back. Without the network the last counts seen are shown, or nothing */
const ACH_API = 'https://kebsbuvuutilitwlvxzv.supabase.co/rest/v1/rpc/seumarena_ach_sync', ACH_KEY = 'sb_publishable_4Egu0zm3p6cxWGvP_-GlIw_mlCpO1Nf';
let achRates = null, achSyncAt = 0;
try { const r = JSON.parse(localStorage.getItem('seumArenaAchRates') || 'null'); if (r && r.players > 0 && r.ach) achRates = r; } catch (e) {}
function achPid() {
  let p = null; try { p = localStorage.getItem('seumArenaPid'); } catch (e) {}
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(p || '')) {
    const b = new Uint8Array(16); try { crypto.getRandomValues(b); } catch (e) { for (let i = 0; i < 16; i++) b[i] = Math.random() * 256; }
    b[6] = b[6] & 15 | 64; b[8] = b[8] & 63 | 128; const x = [...b].map(v => v.toString(16).padStart(2, '0')).join('');
    p = x.slice(0, 8) + '-' + x.slice(8, 12) + '-' + x.slice(12, 16) + '-' + x.slice(16, 20) + '-' + x.slice(20);
    try { localStorage.setItem('seumArenaPid', p); } catch (e) {}
  }
  return p;
}
function achSync(force) {
  const now = Date.now(); if (!force && now - achSyncAt < 60000) return; achSyncAt = now;
  if (typeof fetch !== 'function') return;
  try {
    fetch(ACH_API, { method: 'POST', headers: { 'Content-Type': 'application/json', apikey: ACH_KEY }, body: JSON.stringify({ p_pid: achPid(), p_achs: ACHS.filter(a => COS.ach && COS.ach[a.id]).map(a => a.id) }) })
      .then(r => r.ok ? r.json() : null).then(r => {
        if (!r || !(r.players > 0) || !r.ach || typeof r.ach !== 'object') return;
        achRates = { players: +r.players, ach: r.ach }; try { localStorage.setItem('seumArenaAchRates', JSON.stringify(achRates)); } catch (e) {}
        const el = document.getElementById('achList'); if (el && !el.hidden) renderAch();
      }).catch(() => {});
  } catch (e) {}
}
function achRate(id) { if (!achRates) return ''; const p = Math.min(100, Math.max(0, (+achRates.ach[id] || 0) / achRates.players * 100)); return (p > 0 && p < 1 ? p.toFixed(1) : Math.round(p)) + '%'; }
function renderAch(got) {
  achScan(); const s = achSt(), box = document.getElementById('achList'), keep = box.scrollTop; box.textContent = '';
  const ord = a => COS.ach[a.id] === 1 ? 0 : COS.ach[a.id] === 2 ? 2 : 1;
  for (const a of ACHS.slice().sort((x, y) => ord(x) - ord(y))) {
    const row = document.createElement('div'), t = document.createElement('span'), pc = document.createElement('small'), bar = document.createElement('div'), fill = document.createElement('i'), num = document.createElement('span'), rw = document.createElement('button');
    const state = COS.ach[a.id] | 0, p = state ? a.n : Math.min(a.n, Math.max(0, Math.floor(a.v(s)))), pay = ACH_PAY[a.t];
    row.className = 'qRow aRow a-' + a.t + (state === 2 ? ' took' : state === 1 ? ' done' : ''); t.className = 'qTxt'; t.append(a.txt); pc.textContent = achRate(a.id); if (pc.textContent) { pc.title = '달성한 플레이어'; t.append(pc); }
    bar.className = 'qBar'; fill.style.width = Math.round(p / a.n * 100) + '%'; num.textContent = p.toLocaleString('en-US') + ' / ' + a.n.toLocaleString('en-US'); bar.append(fill, num);
    rw.type = 'button'; rw.className = 'qRw'; rw.disabled = state !== 1; rw.append(rewardIcon(pay[0])); if (pay[1]) rw.append(String(pay[1]));
    rw.setAttribute('aria-label', state === 2 ? '받음' : '보상 받기');
    if (state === 1) rw.addEventListener('click', () => renderAch(achTake(a.id) || null));
    row.append(t, bar, rw); box.append(row);
  }
  box.scrollTop = got === undefined ? 0 : keep;
  showGot(document.getElementById('questGot'), got); questUi();
}
function questTab(ach) {
  document.getElementById('qTabD').classList.toggle('on', !ach); document.getElementById('qTabA').classList.toggle('on', !!ach);
  document.getElementById('questList').hidden = !!ach; document.getElementById('achList').hidden = !ach;
  if (ach) { renderAch(); achSync(); } else renderQuests();
}
const dqOpen = () => { const st = dqState(); return dqList(st.d).some((q, i) => st.p[i] >= q.n && !st.c[i]); };
function questUi() {
  const n = document.getElementById('questN'), dot = document.getElementById('questDot'); if (!n) return;
  const st = dqState(), L = dqList(st.d);
  n.textContent = L.filter((q, i) => st.p[i] >= q.n).length + '/3'; dot.hidden = !(L.some((q, i) => st.p[i] >= q.n && !st.c[i]) || achOpen());
  const ad = document.getElementById('achDot'); if (ad) ad.hidden = !achOpen();
}
function renderQuests(got) {
  const st = dqState(), box = document.getElementById('questList'); box.textContent = '';
  dqList(st.d).forEach((q, i) => {
    const row = document.createElement('div'), t = document.createElement('span'), bar = document.createElement('div'), fill = document.createElement('i'), num = document.createElement('span'), rw = document.createElement('button');
    const p = Math.min(q.n, +st.p[i] || 0), done = p >= q.n, took = !!st.c[i];
    row.className = 'qRow' + (took ? ' took' : done ? ' done' : ''); t.className = 'qTxt'; t.textContent = q.txt; bar.className = 'qBar'; fill.style.width = Math.round(p / q.n * 100) + '%'; num.textContent = p.toLocaleString('en-US') + ' / ' + q.n.toLocaleString('en-US'); bar.append(fill, num);
    rw.type = 'button'; rw.className = 'qRw'; rw.disabled = !done || took; rw.append(rewardIcon(q.rw[0])); if (q.rw[1]) rw.append(String(q.rw[1]));
    rw.setAttribute('aria-label', took ? '받음' : '보상 받기');
    if (done && !took) rw.addEventListener('click', () => renderQuests(dqTake(i) || null));
    row.append(t, bar, rw); box.append(row);
  });
  showGot(document.getElementById('questGot'), got);
}
/* karma: 1 per kill, 3 per win; it only goes up */
function addKarma(n) { COS.karma = Math.max(0, COS.karma + Math.round(n)); saveCos(); goldUi(); }
function addGold(n) { COS.gold = Math.max(0, COS.gold + Math.round(n)); saveCos(); goldUi(); }
const cosOk = (id, cat) => !!(id && COSMETICS[id] && COSMETICS[id].cat === cat);
function cleanCos(c, hero) {       // what a fighter wears, checked (it also comes from other screens over the network)
  c = c || {};
  const sk = cosOk(c.skin, 'skin') && COSMETICS[c.skin].char === hero ? c.skin : null;
  return { skin: sk, col: cosOk(c.col, 'bcol') ? c.col : null, name: cosOk(c.name, 'name') ? c.name : null, kfx: cosOk(c.kfx, 'kfx') ? c.kfx : null,
    pose: cosOk(c.pose, 'pose') ? c.pose : 'pose_cheer', emo: Array.isArray(c.emo) ? c.emo.filter(i => Number.isInteger(i) && i >= 0 && i < EMOTES.length).slice(0, 8) : [0, 1, 2, 3, 4, 5, 6, 7] };
}
const myCos = hero => cleanCos({ skin: skinOwned(COS.skin[hero]) ? COS.skin[hero] : null, col: cosLocked(COS.col) ? null : COS.col, name: cosLocked(COS.name) ? null : COS.name, kfx: cosLocked(COS.kfx) ? null : COS.kfx, pose: COS.pose, emo: COS.emo }, hero);
const COS_IDS = cat => Object.keys(COSMETICS).filter(id => COSMETICS[id].cat === cat);
function botCos(hero) {
  const skins = COS_IDS('skin').filter(id => COSMETICS[id].char === hero);
  return cleanCos({ skin: skins.length && Math.random() < .4 ? pick(skins) : null, kfx: Math.random() < .3 ? pick(COS_IDS('kfx')) : null, pose: pick(COS_IDS('pose')), name: Math.random() < .2 ? pick(COS_IDS('name')) : null }, hero);
}
const skinOf = (cos, id) => cos && cos.skin && COSMETICS[cos.skin] && COSMETICS[cos.skin].char === id ? cos.skin : null;
function bodyColor(cos, fallback) {
  const it = cos && cos.col && COSMETICS[cos.col];
  if (!it) return fallback;
  return it.shine ? bodyShineColor(cos.col, performance.now(), 0) : it.color;
}

/* named effects that every screen plays itself (the host sends only the name and where) */
const FXF = {
  kfx(k, x, y, gy, vc) { FX_GY = gy; try { spawnKillEffect({ k, vc }, x, y, addP, burstP, shakeFrom); } catch (e) {} FX_GY = null; }
};
function fxPlay(name, ...a) { evt(['x', name].concat(a)); if (FXF[name]) FXF[name](...a); }

/* emotes */

let emoteCd = 0;
function doEmote(f, i) {
  if (!f || f.dead || !Number.isInteger(i) || i < 0 || i >= EMOTES.length) return;
  if (time < (f.emCd || 0)) return;
  f.em = i; f.emT = time + EMOTE_SEC; f.emCd = time + 1.2;
}
function wantEmote(i) {
  if (state !== 'play') return;
  if (NET.role === 'guest') { if (NET.hostConn && NET.hostConn.open && performance.now() > emoteCd) { emoteCd = performance.now() + 1200; try { NET.hostConn.send({ t: 'emo', i }); } catch (e) {} } return; }
  doEmote(player, i);
}
function drawEmoteBubble(f) {
  if (f.em == null || !(f.emT > time) || f.dead || f.form === 'gone' || f.form === 'sub') return;
  const rem = f.emT - time, age = EMOTE_SEC - rem, pop = Math.min(1, age / .18), sc = .4 + .6 * pop + (pop < 1 ? .25 * Math.sin(pop * Math.PI) : 0);
  const fx = (COSMETICS['emo_' + f.em] || {}).fx;
  ctx.save(); ctx.globalAlpha = Math.min(1, rem / .4); ctx.translate(f.x, f.y - 112 + Math.sin(age * 5) * 2.5); ctx.scale(sc, sc);
  if (fx === 'royal') { const g = ctx.createRadialGradient(-6, -7, 2, 0, 0, 21); g.addColorStop(0, '#fff3b0'); g.addColorStop(.55, '#ffd34d'); g.addColorStop(1, '#c9921a'); ctx.fillStyle = g; ctx.strokeStyle = '#fff6c8'; ctx.lineWidth = 3; }
  else if (fx === 'meteor') { const g = ctx.createLinearGradient(0, -19, 0, 19); g.addColorStop(0, '#0b1330'); g.addColorStop(1, '#2a2f6a'); ctx.fillStyle = g; ctx.strokeStyle = '#9fc2ff'; ctx.lineWidth = 2.5; }
  else { ctx.fillStyle = 'rgba(255,255,255,.95)'; ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.lineWidth = 2; }
  ctx.beginPath(); ctx.arc(0, 0, 19, 0, 6.3); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-6, 16); ctx.lineTo(0, 27); ctx.lineTo(6, 16); ctx.closePath(); ctx.fill();
  if (fx === 'meteor') { ctx.fillStyle = '#fff'; for (let i = 0; i < 7; i++) { const sx = ((i * 37) % 34) - 17, sy = ((i * 53) % 30) - 15; ctx.globalAlpha = .4 + .6 * (Math.sin(age * 3 + i * 1.9) + 1) / 2; ctx.fillRect(sx - 1, sy - .5, 2, 1); } ctx.globalAlpha = 1; }
  ctx.font = '24px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#000'; ctx.fillText(EMOTES[f.em] || '', 0, 1);
  ctx.restore();
}
function emoteWheel(open) {
  const w = document.getElementById('emoteWheel');
  if (open === undefined) open = w.hidden;
  if (!open || state !== 'play') { w.hidden = true; return; }
  w.textContent = '';
  const list = (COS.emo && COS.emo.length ? COS.emo : [0, 1, 2, 3, 4, 5, 6, 7]);
  list.forEach((ei, k) => {
    const a = -Math.PI / 2 + k * 2 * Math.PI / list.length, b = document.createElement('button');
    b.type = 'button'; b.textContent = EMOTES[ei]; b.title = (k + 1) + '번';
    b.style.left = 'calc(50% + ' + Math.round(Math.cos(a) * 78) + 'px - 24px)'; b.style.top = 'calc(50% + ' + Math.round(Math.sin(a) * 78) + 'px - 24px)';
    b.addEventListener('click', e => { e.stopPropagation(); wantEmote(ei); emoteWheel(false); });
    w.append(b);
  });
  w.hidden = false;
}

/* chat */
const CHAT_MAX = 60;
const cleanChat = s => String(s || '').replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, CHAT_MAX);
function showChat(f, text) {
  if (!f || !text) return;
  f.chat = text; f.chatT = time + 4.5;
  const box = document.getElementById('chatFeed'), d = document.createElement('div'), n = document.createElement('b');
  n.textContent = (f.nick || f.h0.name) + ': '; n.className = f.team === VIEW ? 'b' : 'r';
  d.append(n, text); box.append(d);
  while (box.children.length > 6) box.firstChild.remove();
  setTimeout(() => d.remove(), 12000);
}
function hostChat(f, text) { text = cleanChat(text); if (!text || !f) return; if (time < (f.chatCd || 0)) return; f.chatCd = time + .6; evt(['c', fighters.indexOf(f), text]); showChat(f, text); }
function sendChat(text) {
  text = cleanChat(text); if (!text) return;
  if (NET.role === 'guest') { try { NET.hostConn.send({ t: 'chat', x: text }); } catch (e) {} return; }
  hostChat(player, text);
}
function chatOpen(open) {
  const bar = document.getElementById('chatBar'), inp = document.getElementById('chatInput');
  if (open && state === 'play') { bar.hidden = false; inp.value = ''; for (const k in keys) keys[k] = false; mouse.down = false; setTimeout(() => inp.focus(), 0); }
  else { bar.hidden = true; inp.blur(); }
}
function drawChatBubble(f) {
  if (!f.chat || !(f.chatT > time) || f.dead || f.form === 'gone' || f.form === 'sub') return;
  const a = Math.min(1, (f.chatT - time) / .4), y = f.y - 104 - (f.em != null && f.emT > time ? 50 : 0);
  ctx.save(); ctx.globalAlpha = a; ctx.font = '600 14px "IBM Plex Sans KR", sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const w = Math.min(260, ctx.measureText(f.chat).width + 18);
  ctx.fillStyle = 'rgba(12,14,19,.88)'; ctx.strokeStyle = f.team === VIEW ? TEAM[0] : TEAM[1]; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.roundRect(f.x - w / 2, y - 14, w, 28, 9); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#e8eaf0'; ctx.fillText(f.chat, f.x, y, w - 14);
  ctx.restore();
}

/* the end screen: my side on the left, the other side on the right; the winners do their pose, the losers slump */
let winRun = 0;
function winScreen(won, draw) {
  const cvs = document.getElementById('winCanvas'), c = cvs.getContext('2d'), run = ++winRun, Wc = cvs.width, Hc = cvs.height;
  const mine = fighters.filter(f => f && f.team === VIEW), theirs = fighters.filter(f => f && f.team !== VIEW);
  const figs = [];
  const place = (list, x0, x1, win) => { const n = list.length, sc = n >= 3 ? 1.15 : n === 2 ? 1.5 : 1.9; list.forEach((f, i) => figs.push({ f, win, x: x0 + (x1 - x0) * (n === 1 ? .5 : (i + .5) / n), sc })); };
  place(mine, 10, Wc / 2 - 10, won || draw); place(theirs, Wc / 2 + 10, Wc - 10, !won || draw);
  const conf = []; if (won) for (let i = 0; i < 90; i++) conf.push({ x: Math.random() * Wc, y: -Math.random() * Hc, vy: 40 + Math.random() * 70, vx: (Math.random() - .5) * 30, r: Math.random() * 6, vr: (Math.random() - .5) * 8, w: 5 + Math.random() * 5, h: 3 + Math.random() * 4, col: ['#ff5d73', '#ffd34d', '#5fff8a', '#4dd9ff', '#c17bff'][i % 5] });
  let last = performance.now();
  (function fr(now) {
    if (run !== winRun || state !== 'over') return;
    const dt = Math.min(.05, (now - last) / 1000); last = now; const t = now / 1000;
    c.clearRect(0, 0, Wc, Hc);
    c.save(); c.strokeStyle = 'rgba(255,255,255,.18)'; c.lineWidth = 2; c.setLineDash([6, 6]); c.beginPath(); c.moveTo(Wc / 2, 20); c.lineTo(Wc / 2, Hc - 10); c.stroke(); c.restore();
    for (const q of conf) { q.y += q.vy * dt; q.x += q.vx * dt; q.r += q.vr * dt; if (q.y > Hc + 10) { q.y = -10; q.x = Math.random() * Wc; } c.save(); c.translate(q.x, q.y); c.rotate(q.r); c.fillStyle = q.col; c.fillRect(-q.w / 2, -q.h / 2, q.w, q.h * Math.abs(Math.cos(q.r * 2)) + 1); c.restore(); }
    for (const g of figs) {
      const f = g.f, wid = f.h0.id, sk = skinOf(f.cos, wid), tint = sk ? COSMETICS[sk].tint : undefined, col = bodyColor(f.cos, f.team === VIEW ? TEAM[0] : TEAM[1]);
      c.save(); c.translate(g.x, Hc - 34); c.scale(g.sc, g.sc);
      c.shadowColor = col; c.shadowBlur = 10; c.strokeStyle = col; c.fillStyle = col; c.lineWidth = 5; c.lineCap = 'round'; c.lineJoin = 'round';
      try { if (g.win) drawWinPose(c, (f.cos && f.cos.pose) || 'pose_cheer', t, wid, tint); else drawLosePose(c, t, wid, tint); } catch (e) {}
      c.restore();
      c.save(); c.font = '700 13px "IBM Plex Sans KR", sans-serif'; c.textAlign = 'center'; c.fillStyle = f === player ? '#ffd34d' : (f.nick ? nameColorFor(f.cos && f.cos.name) : '#8890a4');
      c.fillText(f.nick || f.h0.name, g.x, Hc - 12); c.restore();
    }
    requestAnimationFrame(fr);
  })(last);
}

/* more emotes: Stickseum's shop emotes, then SeumArena's own (the thumbs down first). Only ever add at the END: an emote travels over the network as its number */
for (const [em, nm] of [...SHOP_EMOTES, ['👎', '역따봉'], ['❤', '하트'], ['👻', '유령'], ['💪', '근육'], ['🤣', '빵 터짐'], ['🙌', '만세'], ['💢', '빠직'], ['✨', '반짝'], ...(typeof MORE_EMOTES !== 'undefined' ? MORE_EMOTES : [])]) { const i = EMOTES.length; EMOTES.push(em); COSMETICS['emo_' + i] = { cat: 'emo', name: nm, price: 0, free: true, em, emIdx: i }; }
/* the 치장품 screen */
const COS_TABS = [['skin', '스킨'], ['bcol', '캐릭터 색'], ['name', '이름 색'], ['kfx', '킬 이펙트'], ['pose', '승리 포즈'], ['emo', '이모트']];
let cosTab = 'skin', cosBuy = null;      // cosBuy: the skin tapped once, waiting for the second tap that buys it
function cosEquipped(id) {
  const it = COSMETICS[id];
  if (it.cat === 'skin') return COS.skin[it.char] === id;
  if (it.cat === 'emo') return COS.emo.includes(it.emIdx);
  return COS[{ bcol: 'col', name: 'name', kfx: 'kfx', pose: 'pose' }[it.cat]] === id;
}
function cosToggle(id) {
  const it = COSMETICS[id];
  if (cosLocked(id)) {
    const p = skinPrice(id);
    if (COS.gold < p) { cosBuy = null; try { sfx(150, .12, 'square', .04); } catch (e) {} const el = document.getElementById('cos-' + id); if (el) { el.classList.remove('no'); void el.offsetWidth; el.classList.add('no'); } return; }
    if (cosBuy !== id) { cosBuy = id; renderCos(); return; }
    cosBuy = null; COS.own.push(id); COS.gold -= p; if (it.cat === 'skin') COS.skin[it.char] = id; else COS[COS_SLOT[it.cat]] = id; try { sfx(880, .18, 'triangle', .06); } catch (e) {}
    saveCos(); goldUi(); renderCos(); accountUi(); return;
  }
  cosBuy = null;
  if (it.cat === 'skin') { if (COS.skin[it.char] === id) delete COS.skin[it.char]; else COS.skin[it.char] = id; }
  else if (it.cat === 'emo') { const i = COS.emo.indexOf(it.emIdx); if (i >= 0) { if (COS.emo.length > 1) COS.emo.splice(i, 1); } else if (COS.emo.length >= 8) { try { sfx(150, .12, 'square', .04); } catch (e) {} const el = document.getElementById('cos-' + id); if (el) { el.classList.remove('no'); void el.offsetWidth; el.classList.add('no'); } return; }      // the wheel is full: take one out first
    else COS.emo.push(it.emIdx); }
  else { const k = { bcol: 'col', name: 'name', kfx: 'kfx', pose: 'pose' }[it.cat]; COS[k] = COS[k] === id && it.cat !== 'pose' ? null : id; }
  saveCos(); renderCos(); accountUi();
}
function renderCos() {
  const tabs = document.getElementById('cosTabs'), grid = document.getElementById('cosGrid'), hint = document.getElementById('cosHint');
  tabs.textContent = '';
  for (const [k, nm] of COS_TABS) { const b = document.createElement('button'); b.type = 'button'; b.textContent = nm; b.setAttribute('aria-pressed', String(k === cosTab)); b.addEventListener('click', () => { cosTab = k; cosBuy = null; renderCos(); }); tabs.append(b); }
  let ids = COS_IDS(cosTab);
  if (cosTab === 'skin') {      // every character's skins, the picked character first
    const order = [chosen, ...Object.keys(HEROES).filter(h => h !== chosen)];
    ids = ids.filter(id => HEROES[COSMETICS[id].char]).sort((a, b) => order.indexOf(COSMETICS[a].char) - order.indexOf(COSMETICS[b].char) || skinPrice(a) - skinPrice(b));
  }
  else if (cosTab === 'bcol' || cosTab === 'name' || cosTab === 'kfx') ids = ids.slice().sort((a, b) => skinPrice(a) - skinPrice(b));
  goldUi();
  hint.textContent = { skin: '스킨을 누르고 한 번 더 누르면 골드로 사요.', bcol: '몸 색을 바꿔요. 팀은 발밑 고리와 이름 색으로 구분돼요.', name: '머리 위 닉네임 색이에요.', kfx: '내가 상대를 쓰러뜨리면 터지는 효과예요.', pose: '이긴 경기가 끝나면 이 포즈로 춤춰요.', emo: '이모트 휠(V)에 넣을 이모트를 최대 8개 골라요.' }[cosTab];
  grid.textContent = '';
  if (!ids.length) { const p = document.createElement('p'); p.className = 'hint'; p.textContent = '이 캐릭터는 스킨이 없어요.'; grid.append(p); }
  let grp = null;
  for (const id of ids) {
    const it = COSMETICS[id], b = document.createElement('button');
    if (it.cat === 'skin' && it.char !== grp) { grp = it.char; const hd = document.createElement('h3'); hd.className = 'cosGrp'; hd.textContent = HEROES[grp].name; grid.append(hd); }
    b.type = 'button'; b.className = 'cosCard'; b.id = 'cos-' + id; b.setAttribute('aria-pressed', String(cosEquipped(id)));
    const pv = document.createElement('div'); pv.className = 'cosPv';
    if (it.cat === 'emo') { pv.textContent = it.em; if (cosEquipped(id)) { const off = document.createElement('span'); off.className = 'cosOff'; off.textContent = '선택해제'; b.append(pv, off); } }
    else if (it.cat === 'kfx' || it.cat === 'pose') pv.textContent = it.icon || '';
    else if (it.cat === 'name') { pv.textContent = 'Aa'; pv.style.color = nameColorFor(id); pv.style.fontWeight = '700'; }
    else { const cv2 = document.createElement('canvas'); try { drawItemPreview(cv2, id, performance.now()); } catch (e) {} pv.append(cv2); }
    const nm = document.createElement('span'); nm.textContent = it.name;
    b.append(pv, nm);
    if (cosLocked(id)) {
      const pr = document.createElement('span'), co = document.createElement('i'), p = skinPrice(id);
      pr.className = 'cosPrice' + (COS.gold < p ? ' poor' : ''); co.className = 'coin'; pr.append(co, cosBuy === id ? '구매 ' + p.toLocaleString('en-US') : p.toLocaleString('en-US'));
      b.classList.add('lock'); if (cosBuy === id) b.classList.add('buy'); b.append(pr);
    }
    b.addEventListener('click', () => cosToggle(id));
    grid.append(b);
  }
}
