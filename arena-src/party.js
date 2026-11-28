/* 파티 (user 2026-11-26): friends from frenchfries777.com who are in SeumArena right now play together.
   Up to 3 people. The leader (👑) picks the mode (no one-player-per-side modes) and presses start; the others follow into the same server room
   and the same team. An invite lasts 60 s. The party stays together after a match; when the leader leaves, the party breaks up.
   Messages: Supabase Realtime (the site's own project). Presence channel 'sa-online' (who is in the game, lobby or match) and one broadcast
   inbox per player 'sa-u-<uid>'. A message is only taken from someone on one's own accepted friend list (MYFR.fr, net.js).
   Test hook: window.__ptFake = { uid, name, fr: [uids], names: {uid: name} } swaps Realtime for a BroadcastChannel (3 tabs on one machine). */
const ptEl = id => document.getElementById(id);
const PT_MAX = 3, PT_INV_MS = 60000;
let PT = null;      // { id, lead, mem: [{ uid, n }], mode }
const PTI = { inv: [], sent: {}, me: '', name: '', on: {}, fr: [], names: {}, site: {}, last: '', busy: false };      // inv: invites received; sent: uid -> expiry; on: presence uid -> { st, n }
const ptSize = () => PT ? PT.mem.length : 1;
const ptLead = () => !!PT && PT.lead === PTI.me;
const ptIsMem = () => !!PT && PT.lead !== PTI.me;
const ptHello = () => PT && PT.mem.length > 1 ? { pt: PT.id, pn: PT.mem.length } : null;
const ptNewId = () => Math.random().toString(36).slice(2, 12).replace(/[^a-z0-9]/g, 'x').padEnd(8, 'x');
const ptEsc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const ptCol = uid => ['#3fe0c5', '#ffd34d', '#b98cff', '#4da3ff', '#ff9a5d', '#ff7aa8'][[...String(uid)].reduce((a, c) => a + c.charCodeAt(0), 0) % 6];

/* ---------- transport ---------- */
const PTX = { ok: false, send() {}, track() {} };
function ptStart() {
  if (PTX.ok || DED) return;
  const F = window.__ptFake;
  if (F && isUid(F.uid)) {
    PTI.me = F.uid; PTI.name = F.name || '친구'; PTI.fr = (F.fr || []).filter(isUid); PTI.names = Object.assign({}, F.names || {});
    const bc = new BroadcastChannel('ptbus'), seen = {}; let st = 'lobby';
    bc.onmessage = ({ data: d }) => {
      if (!d) return;
      if (d.k === 'p') { seen[d.uid] = { st: d.st, n: d.n, at: Date.now() }; }
      else if (d.k === 'm' && d.to === PTI.me) ptIn(d.msg);
    };
    const beat = () => { bc.postMessage({ k: 'p', uid: PTI.me, st, n: PTI.name }); const now = Date.now(), on = {}; for (const u in seen) if (now - seen[u].at < 7000) on[u] = seen[u]; PTI.on = on; ptPres(); };
    setInterval(beat, 1500); beat();
    Object.assign(PTX, { ok: true, send: (to, msg) => bc.postMessage({ k: 'm', to, msg: Object.assign({ from: PTI.me, n: PTI.name }, msg) }), track: s => { st = s; beat(); } });
    return;
  }
  const A = window.FFAuth, u = A && A.user && A.user(), sb = A && A.client && A.client();
  if (!u || !isUid(u.id) || !sb || typeof sb.channel !== 'function') return;
  PTI.me = u.id; PTI.name = (typeof PROF === 'object' && PROF.name) || '친구';
  let st = 'lobby', pres = null, box = null; const out = {};
  try {
    pres = sb.channel('sa-online', { config: { presence: { key: u.id } } });
    pres.on('presence', { event: 'sync' }, () => {
      const s = pres.presenceState(), on = {};
      for (const k in s) { const a = s[k] && s[k][0]; if (isUid(k) && a) on[k] = { st: a.st === 'play' ? 'play' : 'lobby', n: typeof a.n === 'string' ? a.n.slice(0, 24) : '' }; }
      PTI.on = on; ptPres();
    });
    pres.subscribe(s => { if (s === 'SUBSCRIBED') try { pres.track({ st, n: PTI.name }); } catch (e) { quietErr(e); } });
    box = sb.channel('sa-u-' + u.id, { config: { broadcast: { self: false } } });
    box.on('broadcast', { event: 'm' }, ({ payload }) => ptIn(payload));
    box.subscribe();
  } catch (e) { quietErr(e); return; }
  const chan = to => {      // a friend's inbox, joined once and kept
    if (out[to]) return out[to];
    const c = sb.channel('sa-u-' + to, { config: { broadcast: { self: false, ack: false } } }); const q = [];
    out[to] = { c, q, ready: false };
    c.subscribe(s => { if (s === 'SUBSCRIBED') { out[to].ready = true; for (const p of q.splice(0)) c.send({ type: 'broadcast', event: 'm', payload: p }); } });
    return out[to];
  };
  Object.assign(PTX, { ok: true,
    send: (to, msg) => { if (!isUid(to)) return; const o = chan(to), p = Object.assign({ from: PTI.me, n: PTI.name }, msg); if (o.ready) o.c.send({ type: 'broadcast', event: 'm', payload: p }); else o.q.push(p); },
    track: s => { st = s; try { pres.track({ st, n: PTI.name }); } catch (e) { quietErr(e); } } });
}
/* friends list + names (profiles) + who is on the site (ff_presence, last 3 minutes) */
async function ptFriends() {
  if (window.__ptFake) return;
  try { await netFriends(); } catch (e) { quietErr(e); }
  PTI.fr = MYFR.fr.slice();
  if (!MYFR.tok || !PTI.fr.length) return;
  const H = { apikey: typeof ACH_KEY === 'string' ? ACH_KEY : '', Authorization: 'Bearer ' + MYFR.tok }, ids = PTI.fr.slice(0, 200).join(','), B = 'https://kebsbuvuutilitwlvxzv.supabase.co/rest/v1/';
  try { const r = await fetch(B + 'profiles?select=id,username,display_name&id=in.(' + ids + ')', { headers: H, cache: 'no-store' }); if (r.ok) for (const p of await r.json()) if (p && isUid(p.id)) PTI.names[p.id] = String(p.display_name || p.username || '친구').slice(0, 24); } catch (e) { quietErr(e); }
  try { const since = new Date(Date.now() - 180000).toISOString(), r = await fetch(B + 'ff_presence?select=user_id,at&user_id=in.(' + ids + ')&at=gte.' + since, { headers: H, cache: 'no-store' }); PTI.site = {}; if (r.ok) for (const p of await r.json()) if (p && isUid(p.user_id)) PTI.site[p.user_id] = 1; } catch (e) { quietErr(e); }
}
const ptFriend = uid => PTI.fr.includes(uid);
const ptName = uid => uid === PTI.me ? PTI.name : (PTI.on[uid] && PTI.on[uid].n) || PTI.names[uid] || '친구';

/* ---------- party state ---------- */
function ptSendAll(msg, skip) { if (!PT) return; for (const m of PT.mem) if (m.uid !== PTI.me && m.uid !== skip) PTX.send(m.uid, msg); }
function ptShare() { if (!ptLead()) return; PT.mode = modeSel; ptSendAll({ t: 'st', pt: PT }); ptUi(); }
function ptEnd(note) {
  const was = PT; PT = null; PTI.sent = {};
  if (was && NET.phase !== 'idle' && state !== 'play' && ptEl('roomScreen').classList.contains('active') && !NET.role) { netReset(); showScreen('menuScreen'); }      // was waiting for the leader's room
  ptUi(); if (note) ptNote(note);
}
function ptLeave() {
  if (!PT) return;
  if (ptLead()) { ptSendAll({ t: 'bye', pid: PT.id }); ptEnd('파티를 해산했어요.'); }
  else { PTX.send(PT.lead, { t: 'leave', pid: PT.id }); ptEnd('파티에서 나왔어요.'); }
}
function ptInvite(uid) {
  if (!PTX.ok || !ptFriend(uid) || ptIsMem() || ptSize() >= PT_MAX) return;
  if (!PT) PT = { id: ptNewId(), lead: PTI.me, mem: [{ uid: PTI.me, n: PTI.name }], mode: modeSel };
  const exp = Date.now() + PT_INV_MS; PTI.sent[uid] = exp;
  PTX.send(uid, { t: 'inv', pid: PT.id, exp, ms: PT_INV_MS });
  ptUi(); ptList();
}
/* everything that arrives (only from friends) */
function ptIn(m) {
  if (!m || typeof m !== 'object' || !isUid(m.from) || m.from === PTI.me || !ptFriend(m.from) && !(PT && PT.mem.some(x => x.uid === m.from))) return;
  const from = m.from, nm = typeof m.n === 'string' ? m.n.slice(0, 24) : '';
  if (nm) PTI.names[from] = nm;
  if (m.t === 'inv') {
    if (typeof m.pid !== 'string' || (PT && PT.mem.length > 1)) return;      // already in a party with someone: the invite is dropped
    const ms = Math.max(1000, Math.min(PT_INV_MS, +m.ms || PT_INV_MS));
    PTI.inv = PTI.inv.filter(x => x.from !== from); PTI.inv.push({ from, pid: m.pid, until: Date.now() + ms }); ptToast(); ptUi();
  } else if (m.t === 'acc') {
    if (!ptLead() || m.pid !== PT.id) return;
    const ok = PTI.sent[from] && PTI.sent[from] > Date.now() && PT.mem.length < PT_MAX && !PT.mem.some(x => x.uid === from) && NET.phase === 'idle';
    delete PTI.sent[from];
    if (!ok) { PTX.send(from, { t: 'no', pid: m.pid }); return; }
    PT.mem.push({ uid: from, n: nm || ptName(from) }); ptFixMode(); ptShare(); ptList(); ptNote(ptName(from) + '님이 파티에 들어왔어요.');
  } else if (m.t === 'dec') { if (PTI.sent[from]) { delete PTI.sent[from]; ptList(); ptNote(ptName(from) + '님이 초대를 거절했어요.'); } ptCleanSolo(); }
  else if (m.t === 'no') { if (PT && PT.id === m.pid && ptIsMem()) ptEnd('파티에 들어가지 못했어요 (자리가 없거나 초대가 끝났어요).'); }
  else if (m.t === 'st') {
    const p = m.pt; if (!p || typeof p.id !== 'string' || p.lead !== from || !Array.isArray(p.mem)) return;
    const mem = p.mem.filter(x => x && isUid(x.uid)).slice(0, PT_MAX).map(x => ({ uid: x.uid, n: typeof x.n === 'string' ? x.n.slice(0, 24) : '' }));
    if (!mem.some(x => x.uid === PTI.me)) { if (PT && PT.id === p.id) ptEnd('파티에서 빠졌어요.'); return; }
    if (!PT || PT.id !== p.id || PT.lead !== from) return;      // only the party we accepted (stops a forged 'st' pulling us in)
    PT = { id: p.id, lead: from, mem, mode: typeof p.mode === 'string' ? p.mode : modeSel }; PTI.inv = []; ptToast();
    ptFollowMode(); ptUi();
  } else if (m.t === 'leave') {
    if (!ptLead() || m.pid !== PT.id) return;
    PT.mem = PT.mem.filter(x => x.uid !== from); ptNote(ptName(from) + '님이 파티에서 나갔어요.'); ptShare(); ptCleanSolo();
  } else if (m.t === 'bye') { if (PT && PT.id === m.pid && PT.lead === from) ptEnd('파티장이 나가서 파티가 깨졌어요.'); }
  else if (m.t === 'q') { if (PT && PT.lead === from && PT.id === m.pid) ptWaitLead(); }
  else if (m.t === 'stop') { if (PT && PT.lead === from && PT.id === m.pid && !NET.role && ptEl('roomScreen').classList.contains('active')) { netReset(); NET.phase = 'fallback'; roomUi('파티', '파티장이 방을 찾지 못했어요. 로비로 돌아가요.'); const tk = netToken; setTimeout(() => { if (tk === netToken) { NET.phase = 'idle'; showScreen('menuScreen'); } }, 2200); } }
  else if (m.t === 'go') { if (PT && PT.lead === from && PT.id === m.pid && Number.isInteger(m.k) && m.k >= 0 && m.k < NET_ROOMS) ptFollow(m.k, String(m.mode || '')); }
}
function ptCleanSolo() { if (ptLead() && PT.mem.length < 2 && !Object.values(PTI.sent).some(t => t > Date.now())) { PT = null; ptUi(); } }
function ptAccept(i) {
  const v = PTI.inv[i]; if (!v) return; PTI.inv.splice(i, 1);
  if (v.until < Date.now()) { ptToast(); ptNote('초대가 끝났어요.'); return; }
  if (PT && ptLead() && PT.mem.length > 1) { ptToast(); return; }
  if (NET.phase !== 'idle' || state === 'play') { ptToast(); ptNote('경기 중에는 파티에 들어갈 수 없어요.'); return; }
  PT = { id: v.pid, lead: v.from, mem: [{ uid: v.from, n: ptName(v.from) }, { uid: PTI.me, n: PTI.name }], mode: modeSel };      // until the leader's state arrives
  PTX.send(v.from, { t: 'acc', pid: v.pid });
  for (const o of PTI.inv) PTX.send(o.from, { t: 'dec', pid: o.pid }); PTI.inv = [];
  ptToast(); ptUi();
}
function ptDecline(i) { const v = PTI.inv[i]; if (!v) return; PTI.inv.splice(i, 1); PTX.send(v.from, { t: 'dec', pid: v.pid }); ptToast(); ptUi(); }

/* ---------- modes: the leader picks; nothing with fewer seats per side than the party ---------- */
const ptModeFits = m => !PT || PT.mem.length < 2 || ((m.per | 0) >= PT.mem.length && m.id !== 'rank' && m.id !== 'gw');      // 랭크전 = 1v1; 길드 대항전 = guild only
{
  const ok0 = typeof modeExtraOk === 'function' ? modeExtraOk : () => true, why0 = typeof modeLockText === 'function' ? modeLockText : () => '';
  modeExtraOk = m => ok0(m) && ptModeFits(m);
  modeLockText = m => !ptModeFits(m) && m.id !== 'gw' && (typeof modeOpen !== 'function' || modeOpen(m.id)) ? '파티로는 못 해요' : why0(m);
}
function ptFixMode() {      // the party grew: a mode that no longer fits changes to one that does (팀 아웃 first)
  const cur = MODE_LIST.find(x => x.id === modeSel); if (cur && modeOk(cur)) return;
  const t = MODE_LIST.find(x => x.id === 'team'); if (t && modeOk(t)) modeSel = 'team';
  mapByMode = {}; mapChoice = -1; modeApply(); savePrefs(); if (state === 'menu') setup(false);
}
function ptFollowMode() {
  if (!ptIsMem() || !PT.mode || PT.mode === modeSel || state === 'play') return;
  const m = MODE_LIST.find(x => x.id === PT.mode); if (!m) return;
  mapByMode = {}; modeSel = PT.mode; mapChoice = -1; modeApply(); savePrefs(); if (state === 'menu') setup(false);
  if (typeof updatePick === 'function') try { updatePick(); } catch (e) { quietErr(e); }
}

/* ---------- start: the leader searches, the members follow into the room it got ---------- */
{
  const start0 = startOnline;
  startOnline = function () {
    if (ptIsMem()) { ptNote('게임 시작은 파티장만 할 수 있어요.'); if (state !== 'menu') { VIEW = 0; state = 'menu'; setup(false); showScreen('menuScreen'); } return; }
    if (ptLead() && PT.mem.length > 1) {
      const cur = MODE_LIST.find(x => x.id === modeSel);
      if (!cur || !modeOk(cur)) { ptFixMode(); ptShare(); }
      const off = PT.mem.filter(x => x.uid !== PTI.me && !PTI.on[x.uid]);
      if (off.length && PTX.ok && !window.__ptFake) { /* presence can lag a moment: still go */ }
      ptShare(); ptSendAll({ t: 'q', pid: PT.id });
    }
    return start0.apply(this, arguments);
  };
  const give0 = netGiveUp;
  netGiveUp = function (why) { if (ptLead() && PT.mem.length > 1) ptSendAll({ t: 'stop', pid: PT.id }); return give0.apply(this, arguments); };
}
function ptJoined(k) { if (ptLead() && PT.mem.length > 1) ptSendAll({ t: 'go', pid: PT.id, k, mode: NET.mode }); }
function ptWaitLead() {      // the leader pressed start: this screen waits for the room number
  if (NET.role || state === 'play') return;
  if (state !== 'menu') { VIEW = 0; state = 'menu'; setup(false); }
  netReset(); ptFollowMode(); NET.mode = lobbyMode(); NET.max = modeMax(NET.mode); useMode(NET.mode);
  NET.phase = 'ptwait'; showScreen('roomScreen'); roomUi('파티', '파티장이 방을 찾고 있어요');
  const tk = netToken; setTimeout(() => { if (tk === netToken && NET.phase === 'ptwait') { NET.phase = 'idle'; showScreen('menuScreen'); ptNote('파티장이 방을 찾지 못했어요.'); } }, 60000);
}
function ptFollow(k, mode) {
  if (NET.role === 'guest' || state === 'play') return;
  if (state !== 'menu') { VIEW = 0; state = 'menu'; setup(false); }
  netReset(); netFriends();
  if (mode && PT) PT.mode = mode; ptFollowMode();
  NET.mode = mode && modeEntry(mode) ? mode : lobbyMode(); NET.max = modeMax(NET.mode); useMode(NET.mode);
  showScreen('roomScreen'); roomUi('파티', '파티장이 있는 방으로 들어가요');
  const tk = netToken, fail = why => { if (tk !== netToken) return; netGiveUp(why); };
  if (typeof Peer === 'undefined') { if (window.__peerLoad) { Promise.race([window.__peerLoad(), new Promise(r => setTimeout(r, 8000))]).then(() => { if (tk === netToken) ptFollow(k, mode); }); return; } return fail('온라인 모듈을 불러오지 못했어요.'); }
  let p; try { p = newPeer(undefined); } catch (e) { return fail('온라인에 연결할 수 없어요.'); }
  NET.peer = p; NET.phase = 'search'; keepAlive(p);
  const to = setTimeout(() => { if (tk === netToken && NET.phase === 'search') fail('파티장 방에 들어가지 못했어요.'); }, 9000);
  p.on('error', e => { if (tk === netToken && NET.phase === 'search' && (e.type === 'peer-unavailable' || !p.open)) { clearTimeout(to); fail('파티장 방에 들어가지 못했어요.'); } });
  p.on('open', () => {
    if (tk !== netToken) return;
    const c = p.connect(roomId(k), { reliable: true });
    c.on('open', () => { try { c.send(Object.assign({ t: 'hello', lite: NET_LITE ? 1 : 0, mode: NET.mode, hero: chosen, lo: loadoutOf(chosen), name: netName(), cos: myCos(chosen), line: myDuelLine(), uid: MYFR.uid || PTI.me || undefined, fr: MYFR.uid ? MYFR.fr.slice(0, 560) : PTI.fr.slice(0, 560) }, ptHello())); } catch (e) { quietErr(e); } });
    c.on('data', m => {
      if (tk !== netToken || !m) return;
      if (NET.hostConn === c) return guestMsg(m);
      if (m.t === 'welcome') { clearTimeout(to); becomeGuest(c, k, m); }
      else if (m.t === 'busy') { clearTimeout(to); fail('파티장 방이 가득 찼어요.'); }
    });
    c.on('close', () => { if (tk !== netToken) return; if (NET.hostConn === c) return guestLink(); if (NET.phase === 'search') { clearTimeout(to); fail('파티장 방에 들어가지 못했어요.'); } });
  });
}

/* ---------- presence: who is where; the leader gone = the party is over ---------- */
let ptGoneAt = {};
function ptPres() {
  const now = Date.now();
  if (!PT) { ptGoneAt = {}; return ptList(); }
  for (const m of PT.mem) { if (m.uid === PTI.me) continue; if (PTI.on[m.uid]) delete ptGoneAt[m.uid]; else if (!ptGoneAt[m.uid]) ptGoneAt[m.uid] = now; }
  if (ptIsMem() && ptGoneAt[PT.lead] && now - ptGoneAt[PT.lead] > 15000) { ptEnd('파티장이 나가서 파티가 깨졌어요.'); return; }      // the leader closed the game (no 'bye' got out)
  if (ptLead()) { const gone = PT.mem.filter(m => m.uid !== PTI.me && ptGoneAt[m.uid] && now - ptGoneAt[m.uid] > 15000); if (gone.length && NET.phase === 'idle') { PT.mem = PT.mem.filter(m => !gone.includes(m)); for (const g of gone) delete ptGoneAt[g.uid]; ptNote(gone.map(g => g.n || ptName(g.uid)).join(', ') + '님이 나갔어요.'); ptShare(); ptCleanSolo(); } }
  ptList();
}
addEventListener('pagehide', () => { if (PT && ptLead() && PT.mem.length > 1) ptSendAll({ t: 'bye', pid: PT.id }); else if (ptIsMem()) PTX.send(PT.lead, { t: 'leave', pid: PT.id }); });

/* ---------- UI ---------- */
const ptAvatar = (uid, cls) => '<span class="ptAv' + (cls ? ' ' + cls : '') + '" style="--c:' + ptCol(uid) + '"><svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="16" r="9" fill="var(--c)"/><path d="M20 25v10M12 30l8-5 8 5" stroke="var(--c)" stroke-width="4" stroke-linecap="round" fill="none"/></svg></span>';
const PT_ICO = '<svg viewBox="0 0 24 24" fill="none" stroke="#3fe0c5" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-4 3.5-6 6.5-6s5.7 2 6.5 6"/><circle cx="17" cy="9" r="2.6"/><path d="M16 14c3 0 5 1.8 5.5 5"/></svg>';
function ptNote(t) { if (typeof leaveNote === 'function') try { leaveNote(t, 2600); return; } catch (e) { quietErr(e); } }
function ptUi() {
  const box = ptEl('ptBox'), btn = ptEl('ptBtn'); if (!box || !btn) return;
  const menu = state === 'menu' && ptEl('menuScreen').classList.contains('active');
  const dot = ptEl('ptDot'); dot.hidden = !PTI.inv.length; dot.textContent = String(PTI.inv.length);
  btn.hidden = !PTX.ok;
  box.hidden = !PT || !menu;
  if (PT) {
    const lead = ptLead(), n = PT.mem.length;
    let h = '<div class="ptT"><span>파티 <b>' + n + '</b>/' + PT_MAX + '</span><span>' + (lead ? '👑 파티장' : '파티원') + '</span></div><div class="ptRow">';
    for (const m of PT.mem) h += '<div class="ptM">' + ptAvatar(m.uid).replace('</span>', (m.uid === PT.lead ? '<i class="ptCrown">👑</i>' : '') + '</span>') + '<span class="ptNm">' + ptEsc(m.uid === PTI.me ? PTI.name : m.n || ptName(m.uid)) + '</span></div>';
    if (lead && n < PT_MAX) h += '<div class="ptM"><button type="button" class="ptAv ptAdd" id="ptAddBtn" aria-label="친구 초대">+</button><span class="ptNm ptMut">초대</span></div>';
    h += '</div><button type="button" class="ptOut" id="ptOutBtn">' + (lead ? (n > 1 ? '파티 해산' : '초대 취소') : '파티 나가기') + '</button>';
    if (box.dataset.h !== h) { box.dataset.h = h; box.innerHTML = h; const a = ptEl('ptAddBtn'); if (a) a.onclick = ptOpen; ptEl('ptOutBtn').onclick = () => { if (ptLead() && PT.mem.length < 2) { PT = null; PTI.sent = {}; ptUi(); ptList(); } else ptLeave(); }; }
  }
  const mem = ptIsMem(), sb = ptEl('startBtn'), chip = ptEl('modeChip');
  if (sb) { sb.classList.toggle('ptWait', mem); const sp = sb.querySelector('span'); if (sp) { if (mem) { if (!sp.dataset.t0) sp.dataset.t0 = sp.textContent; sp.textContent = '파티장 대기'; } else if (sp.dataset.t0) { sp.textContent = sp.dataset.t0; delete sp.dataset.t0; } } }
  if (chip) chip.classList.toggle('ptLock', mem);
}
function ptOpen() { if (!PTX.ok) { ptNote('로그인하면 친구와 파티를 할 수 있어요.'); return; } ptEl('ptPanel').hidden = false; ptList(); ptFriends().then(ptList, ptList); }
function ptList() {
  const pan = ptEl('ptPanel'); if (!pan || pan.hidden) return;
  const now = Date.now(), rows = PTI.fr.map(uid => {
    const on = PTI.on[uid], inPt = PT && PT.mem.some(x => x.uid === uid), sent = PTI.sent[uid] > now;
    const k = inPt ? 0 : on ? (on.st === 'lobby' ? 1 : 2) : PTI.site[uid] ? 3 : 4;
    return { uid, on, inPt, sent, k };
  }).sort((a, b) => a.k - b.k || ptName(a.uid).localeCompare(ptName(b.uid)));
  const nOn = rows.filter(r => r.on).length, full = ptSize() >= PT_MAX, mem = ptIsMem();
  let h = '<div class="ptSec">접속 중 ' + nOn + ' · 전체 ' + rows.length + '</div><div class="ptList">';
  if (!rows.length) h += '<div class="ptEmpty">아직 친구가 없어요.</div>';
  for (const r of rows) {
    const st = r.inPt ? '<span class="on">● 파티에 있어요</span>' : r.on ? '<span class="on">● SeumArena ' + (r.on.st === 'lobby' ? '로비' : '경기 중') + '</span>' : PTI.site[r.uid] ? '<span class="site">● 사이트 접속 중</span>' : '<span>오프라인</span>';
    let b;
    if (r.inPt) b = '<button class="ptB g" disabled>파티원</button>';
    else if (!r.on) b = '<button class="ptB g" disabled>' + (PTI.site[r.uid] ? '게임 밖' : '오프라인') + '</button>';
    else if (r.on.st !== 'lobby') b = '<button class="ptB g" disabled>경기 중</button>';
    else if (r.sent) b = '<button class="ptB g" disabled>초대 보냄 ' + Math.ceil((PTI.sent[r.uid] - now) / 1000) + '</button>';
    else if (mem || full) b = '<button class="ptB g" disabled>' + (mem ? '파티장만' : '가득 참') + '</button>';
    else b = '<button class="ptB" data-inv="' + r.uid + '">초대</button>';
    h += '<div class="ptFr">' + ptAvatar(r.uid, r.on ? '' : 'off') + '<div class="ptSt"><b>' + ptEsc(ptName(r.uid)) + '</b>' + st + '</div>' + b + '</div>';
  }
  h += '</div><div class="ptSec ptFoot">친구 추가와 요청은 frenchfries777.com에서</div>';
  const body = ptEl('ptPanelBody'); if (body.dataset.h === h) return; body.dataset.h = h; body.innerHTML = h;
  for (const b of body.querySelectorAll('[data-inv]')) b.onclick = () => ptInvite(b.dataset.inv);
}
function ptToast() {
  const t = ptEl('ptToast'); if (!t) return;
  const now = Date.now(); PTI.inv = PTI.inv.filter(v => v.until > now);
  const v = PTI.inv[0]; if (!v || state === 'play') { t.hidden = true; t.dataset.k = ''; return; }
  const k = v.from + v.pid;
  if (t.dataset.k !== k) {
    t.dataset.k = k;
    t.innerHTML = ptAvatar(v.from) + '<div class="ptTm"><div class="ptMsg"><b>' + ptEsc(ptName(v.from)) + '</b>님이 파티에 초대했어요</div><div class="ptSub"></div><div class="ptBar"><i></i></div></div><button class="ptB" type="button">수락</button><button class="ptB r" type="button">거절</button>';
    const bs = t.querySelectorAll('button'); bs[0].onclick = () => ptAccept(PTI.inv.indexOf(v)); bs[1].onclick = () => ptDecline(PTI.inv.indexOf(v));
  }
  const left = Math.max(0, v.until - now); t.querySelector('.ptSub').textContent = Math.ceil(left / 1000) + '초 뒤에 초대가 끝나요'; t.querySelector('.ptBar i').style.width = (left / PT_INV_MS * 100).toFixed(1) + '%';
  t.hidden = false;
}
(function ptInit() {
  if (DED) return;
  const css = document.createElement('style');
  css.textContent = `#topRight #ptBtn{pointer-events:auto;position:relative;box-sizing:border-box;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;width:56px;height:56px;margin:0;padding:0;border-radius:14px;border:2px solid #3fe0c5;background:linear-gradient(180deg,#13302f,#0c1e1d);box-shadow:0 4px 0 #0e5c52;color:#cffff5;font:800 11px/1 'IBM Plex Sans KR',sans-serif;cursor:pointer;transition:transform .08s ease}
#topRight #ptBtn:active{transform:translateY(2px)}#topRight #ptBtn[hidden]{display:none}#ptBtn svg{width:26px;height:26px}
#ptDot{position:absolute;top:-6px;right:-6px;min-width:18px;height:18px;padding:0 4px;box-sizing:border-box;border-radius:99px;background:#ff5d5d;color:#fff;font:700 11px/18px sans-serif;text-align:center}#ptDot[hidden]{display:none}
body.mob #topRight #ptBtn{order:98;width:46px;height:40px;border-radius:12px;box-shadow:0 3px 0 #0e5c52}body.mob #ptBtn svg{width:20px;height:20px}body.mob #ptBtn b{font-size:9px}
@media (max-width:520px){#topRight #ptBtn{width:46px;height:44px;border-radius:12px}#ptBtn svg{width:21px;height:21px}}
#ptBox{position:fixed;z-index:7;left:max(16px,env(safe-area-inset-left,0px));bottom:max(16px,env(safe-area-inset-bottom,0px));background:rgba(12,14,20,.8);border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:10px 14px 8px;color:#e8eaf0;font-family:'IBM Plex Sans KR',sans-serif}
#ptBox[hidden]{display:none}
.ptT{display:flex;justify-content:space-between;gap:24px;font-size:13px;color:#9fb0cc;margin-bottom:8px}.ptT b{color:#ffd34d}
.ptRow{display:flex;gap:12px;align-items:flex-end}.ptM{display:flex;flex-direction:column;align-items:center;gap:4px}
.ptAv{position:relative;display:grid;place-items:center;width:56px;height:56px;box-sizing:border-box;border-radius:50%;background:#1c2232;border:3px solid var(--c,#3fe0c5);flex:none}.ptAv svg{width:70%;height:70%}.ptAv.off{opacity:.5}
.ptAdd{border-style:dashed;border-color:#6b7592;color:#9aa3b5;font:700 28px/1 sans-serif;cursor:pointer;padding:0}
.ptCrown{position:absolute;top:-17px;left:50%;transform:translateX(-50%);font-style:normal;font-size:18px}
.ptNm{font-size:13px;font-weight:700;text-shadow:0 1px 3px #000;white-space:nowrap;max-width:96px;overflow:hidden;text-overflow:ellipsis}.ptMut{color:#9aa3b5}
.ptOut{display:block;margin:8px auto 0;border:0;background:none;color:#ff9a9a;font:700 12px 'IBM Plex Sans KR',sans-serif;cursor:pointer;padding:2px 6px}
body.mob #ptBox{left:max(10px,env(safe-area-inset-left,0px));bottom:auto;top:calc(env(safe-area-inset-top,0px) + 54px);padding:6px 10px 4px;border-radius:12px}body.mob .ptAv{width:38px;height:38px;border-width:2px}body.mob .ptCrown{top:-13px;font-size:13px}body.mob .ptNm{font-size:11px;max-width:70px}body.mob .ptT{font-size:11px;margin-bottom:6px}body.mob .ptOut{font-size:11px;margin-top:4px}
#ptPanel{position:fixed;inset:0;z-index:70;background:rgba(5,6,10,.55);display:flex;justify-content:flex-end;align-items:flex-start;padding:calc(env(safe-area-inset-top,0px) + 76px) max(16px,env(safe-area-inset-right,0px)) 16px 16px;box-sizing:border-box}#ptPanel[hidden]{display:none}
.ptPan{width:min(440px,100%);max-height:100%;display:flex;flex-direction:column;background:#151a26;border:1px solid #2b3550;border-radius:16px;box-shadow:0 12px 36px rgba(0,0,0,.6);overflow:hidden;color:#e8eaf0;font-family:'IBM Plex Sans KR',sans-serif}
.ptHd{display:flex;align-items:center;justify-content:space-between;padding:14px 18px;border-bottom:1px solid #26304a;font:400 22px 'Black Han Sans','IBM Plex Sans KR',sans-serif;color:#cffff5}
.ptX{border:0;background:none;color:#9aa3b5;font:700 20px sans-serif;cursor:pointer;padding:0 4px}
#ptPanelBody{display:flex;flex-direction:column;min-height:0;flex:1}.ptList{overflow:auto;flex:1;min-height:0}
.ptSec{padding:8px 18px;font-size:12px;color:#7f8aa3;font-weight:700}.ptFoot{border-top:1px solid #26304a}.ptEmpty{padding:14px 18px;color:#8ea0be;font-size:14px}
.ptFr{display:flex;align-items:center;gap:12px;padding:9px 18px}.ptFr .ptAv{width:44px;height:44px;border-width:2px}
.ptSt{flex:1;min-width:0}.ptSt b{display:block;font-size:15px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.ptSt span{font-size:12px;color:#8ea0be}.ptSt .on{color:#3fe0c5}.ptSt .site{color:#ffd34d}
.ptB{border:0;border-radius:9px;padding:7px 14px;font:700 13px 'IBM Plex Sans KR',sans-serif;color:#0b2a25;background:#3fe0c5;white-space:nowrap;cursor:pointer}.ptB.g{background:#2a3247;color:#9aa3b5;cursor:default}.ptB.r{background:#3a2430;color:#ff9a9a}
#ptToast{position:fixed;z-index:75;left:50%;top:calc(env(safe-area-inset-top,0px) + 12px);transform:translateX(-50%);display:flex;align-items:center;gap:14px;width:min(520px,calc(100vw - 32px));box-sizing:border-box;background:#151a26;border:2px solid #ffd34d;border-radius:16px;padding:12px 16px;box-shadow:0 12px 36px rgba(0,0,0,.6);color:#e8eaf0;font-family:'IBM Plex Sans KR',sans-serif}#ptToast[hidden]{display:none}
#ptToast .ptAv{width:44px;height:44px;border-width:2px}.ptTm{flex:1;min-width:0}.ptMsg{font-size:15px}.ptMsg b{color:#ffd34d}.ptSub{font-size:12px;color:#8ea0be}.ptBar{height:4px;background:#2a3247;border-radius:9px;margin-top:6px;overflow:hidden}.ptBar i{display:block;height:100%;background:#ffd34d}
body.mob #ptToast{padding:8px 12px;gap:10px}body.mob #ptToast .ptAv{width:34px;height:34px}body.mob .ptMsg{font-size:13px}
#startBtn.ptWait{filter:grayscale(.6) brightness(.8)}#modeChip.ptLock{pointer-events:none;opacity:.7}`;
  document.head.append(css);
  const tr = ptEl('topRight'), b = document.createElement('button'); b.id = 'ptBtn'; b.type = 'button'; b.hidden = true; b.setAttribute('aria-label', '친구');
  b.innerHTML = PT_ICO + '<b>친구</b><i id="ptDot" hidden>0</i>';
  if (tr) { const s = ptEl('seasonBtn'), g = ptEl('guild'); if (s && s.parentNode === tr) s.after(b); else if (g && g.parentNode === tr) g.after(b); else tr.prepend(b); }      // row-reverse: just left of the season / guild buttons
  b.addEventListener('click', ptOpen);
  const box = document.createElement('div'); box.id = 'ptBox'; box.hidden = true; ptEl('lobby').append(box);
  const pan = document.createElement('div'); pan.id = 'ptPanel'; pan.hidden = true;
  pan.innerHTML = '<div class="ptPan" role="dialog" aria-label="친구"><div class="ptHd">친구 <button class="ptX" type="button" aria-label="닫기">✕</button></div><div id="ptPanelBody"></div></div>';
  document.body.append(pan);
  pan.addEventListener('click', e => { if (e.target === pan || e.target.closest('.ptX')) pan.hidden = true; });
  const t = document.createElement('div'); t.id = 'ptToast'; t.hidden = true; document.body.append(t);
  ptEl('roomCancelBtn').addEventListener('click', () => { if (ptLead() && PT.mem.length > 1 && NET.role !== 'guest') ptSendAll({ t: 'stop', pid: PT.id }); }, true);
  ptEl('modeChip').addEventListener('click', e => { if (ptIsMem()) { e.stopImmediatePropagation(); ptNote('모드는 파티장이 골라요.'); } }, true);
  let n = 0;
  setInterval(() => {
    if (!PTX.ok) { ptStart(); if (PTX.ok) ptFriends().then(ptList, ptList); }
    if (!PTX.ok) return;
    const st = state === 'menu' && (NET.phase === 'idle' || NET.phase === 'fallback') ? 'lobby' : 'play';
    if (st !== PTI.last) { PTI.last = st; PTX.track(st); }
    if (ptLead() && PT.mem.length > 1 && PT.mode !== modeSel && NET.phase === 'idle') ptShare();      // the leader changed the mode
    if (ptLead()) { for (const u in PTI.sent) if (PTI.sent[u] <= Date.now()) delete PTI.sent[u]; ptCleanSolo(); }
    if (ptIsMem() && state === 'menu' && NET.phase === 'idle') ptFollowMode();
    if (++n % 30 === 0 && !ptEl('ptPanel').hidden) ptFriends().then(ptList, ptList);
    ptUi(); ptToast(); ptList();
  }, 1000);
})();
