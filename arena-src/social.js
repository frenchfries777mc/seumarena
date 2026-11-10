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
  n.textContent = PROF.name; n.style.color = nameColorFor(COS.name);
  b.hidden = false;
  if (!PROF.online) { b.textContent = '게스트'; b.disabled = true; b.title = 'Frenchfries777 계정 로그인은 frenchfries777.com에 올린 게임에서 쓸 수 있어요'; }
  else { b.disabled = false; b.title = ''; b.textContent = PROF.guest ? '로그인' : '프로필'; }
}

/* cosmetics: everything the original game sells or gives is free to wear here */
const COS_KEY = 'seumArenaCos';
let COS = { skin: {}, col: null, name: null, kfx: null, pose: 'pose_cheer', emo: [0, 1, 2, 3, 4, 5, 6, 7] };
try { const s = JSON.parse(localStorage.getItem(COS_KEY) || 'null'); if (s && typeof s === 'object') COS = Object.assign(COS, s); } catch (e) {}
const saveCos = () => { try { localStorage.setItem(COS_KEY, JSON.stringify(COS)); } catch (e) {} };
const cosOk = (id, cat) => !!(id && COSMETICS[id] && COSMETICS[id].cat === cat);
function cleanCos(c, hero) {       // what a fighter wears, checked (it also comes from other screens over the network)
  c = c || {};
  const sk = cosOk(c.skin, 'skin') && COSMETICS[c.skin].char === hero ? c.skin : null;
  return { skin: sk, col: cosOk(c.col, 'bcol') ? c.col : null, name: cosOk(c.name, 'name') ? c.name : null, kfx: cosOk(c.kfx, 'kfx') ? c.kfx : null,
    pose: cosOk(c.pose, 'pose') ? c.pose : 'pose_cheer', emo: Array.isArray(c.emo) ? c.emo.filter(i => Number.isInteger(i) && i >= 0 && i < EMOTES.length).slice(0, 8) : [0, 1, 2, 3, 4, 5, 6, 7] };
}
const myCos = hero => cleanCos({ skin: COS.skin[hero], col: COS.col, name: COS.name, kfx: COS.kfx, pose: COS.pose, emo: COS.emo }, hero);
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

/* the 치장품 screen */
const COS_TABS = [['skin', '스킨'], ['bcol', '캐릭터 색'], ['name', '이름 색'], ['kfx', '킬 이펙트'], ['pose', '승리 포즈'], ['emo', '이모트']];
let cosTab = 'skin';
function cosEquipped(id) {
  const it = COSMETICS[id];
  if (it.cat === 'skin') return COS.skin[it.char] === id;
  if (it.cat === 'emo') return COS.emo.includes(it.emIdx);
  return COS[{ bcol: 'col', name: 'name', kfx: 'kfx', pose: 'pose' }[it.cat]] === id;
}
function cosToggle(id) {
  const it = COSMETICS[id];
  if (it.cat === 'skin') { if (COS.skin[it.char] === id) delete COS.skin[it.char]; else COS.skin[it.char] = id; }
  else if (it.cat === 'emo') { const i = COS.emo.indexOf(it.emIdx); if (i >= 0) { if (COS.emo.length > 1) COS.emo.splice(i, 1); } else { if (COS.emo.length >= 8) COS.emo.shift(); COS.emo.push(it.emIdx); } }
  else { const k = { bcol: 'col', name: 'name', kfx: 'kfx', pose: 'pose' }[it.cat]; COS[k] = COS[k] === id && it.cat !== 'pose' ? null : id; }
  saveCos(); renderCos(); accountUi();
}
function renderCos() {
  const tabs = document.getElementById('cosTabs'), grid = document.getElementById('cosGrid'), hint = document.getElementById('cosHint');
  tabs.textContent = '';
  for (const [k, nm] of COS_TABS) { const b = document.createElement('button'); b.type = 'button'; b.textContent = nm; b.setAttribute('aria-pressed', String(k === cosTab)); b.addEventListener('click', () => { cosTab = k; renderCos(); }); tabs.append(b); }
  let ids = COS_IDS(cosTab);
  if (cosTab === 'skin') ids = ids.filter(id => COSMETICS[id].char === chosen && HEROES[COSMETICS[id].char]);
  hint.textContent = { skin: HEROES[chosen].name + '의 스킨이에요. 다른 캐릭터의 스킨은 캐릭터를 바꾸면 보여요.', bcol: '몸 색을 바꿔요. 팀은 발밑 고리와 이름 색으로 구분돼요.', name: '머리 위 닉네임 색이에요.', kfx: '내가 상대를 쓰러뜨리면 터지는 효과예요.', pose: '이긴 경기가 끝나면 이 포즈로 춤춰요.', emo: '이모트 휠(V)에 넣을 이모트를 최대 8개 골라요.' }[cosTab];
  grid.textContent = '';
  if (!ids.length) { const p = document.createElement('p'); p.className = 'hint'; p.textContent = '이 캐릭터는 스킨이 없어요.'; grid.append(p); }
  for (const id of ids) {
    const it = COSMETICS[id], b = document.createElement('button');
    b.type = 'button'; b.className = 'cosCard'; b.id = 'cos-' + id; b.setAttribute('aria-pressed', String(cosEquipped(id)));
    const pv = document.createElement('div'); pv.className = 'cosPv';
    if (it.cat === 'emo') pv.textContent = it.em;
    else if (it.cat === 'kfx' || it.cat === 'pose') pv.textContent = it.icon || '';
    else if (it.cat === 'name') { pv.textContent = 'Aa'; pv.style.color = nameColorFor(id); pv.style.fontWeight = '700'; }
    else { const cv2 = document.createElement('canvas'); try { drawItemPreview(cv2, id, performance.now()); } catch (e) {} pv.append(cv2); }
    const nm = document.createElement('span'); nm.textContent = it.name;
    b.append(pv, nm); b.addEventListener('click', () => cosToggle(id));
    grid.append(b);
  }
}
