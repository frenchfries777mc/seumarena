/* ---------- online: PeerJS matchmaking without room codes ----------
   Rooms are fixed PeerJS ids per game mode (seumarena-v3-<mode>-room-0 .. 7, e.g. seumarena-v3-team-room-0), so a search only meets rooms of the mode picked in the lobby. Game start asks all eight at once ('peek'): a room whose host is waiting for
   players answers 'info' (ok), one that is full or already playing answers ok:false, an id nobody holds gives PeerJS's 'peer-unavailable'
   (which the PeerServer only sends after its expire_timeout, ~5-6 s by default, and which names the id). The fullest open room is joined
   ('hello' -> 'welcome'); if there is none, the lowest free id is claimed and this screen becomes the host of a new room. The host waits WAIT_SEC seconds for others (or until the room is full),
   then starts; empty slots get bots. The host runs the whole match and sends snapshots; guests send only their controls. */
const NET_PREFIX = 'seumarena-v3-', NET_ROOMS = 8, WAIT_SEC = 15, MAX_PLAYERS = 6, SNAP_DT = 1 / 20, IN_DT = 1 / 30;
/* Own PeerServer (e.g. on Oracle Cloud): fill this in and the game uses it instead of the free PeerJS cloud.
   { host: 'peer.example.com', port: 443, path: '/', secure: true, key: 'peerjs' }   (null = PeerJS cloud)
   On that server start the PeerServer with a short expire_timeout (e.g. { expire_timeout: 1500, cleanup_out_msgs: 300 }): that is the time an
   empty room needs to be recognised as free, so it is the length of the room search on an empty server. */
const PEER_SERVER = null;
/* Own TURN server (coturn) for players behind strict NATs: { urls: 'turn:turn.example.com:3478', username: '...', credential: '...' } entries, tried in addition to the public ones below */
const ICE_EXTRA = [      // the Oracle server's coturn (shared with Stickseum)
  { urls: 'turn:140.238.55.153:3478?transport=udp', username: 'ffturn', credential: 'a2daa08340367f7b1d03ff30' },
  { urls: 'turn:140.238.55.153:3478?transport=tcp', username: 'ffturn', credential: 'a2daa08340367f7b1d03ff30' }
];
/* dedicated host (?dedicated=1): a headless page on the server holds one room and runs the match without playing in it (sa-host.js drives it through window.__sad) */
const DED = /[?&]dedicated=1(&|$)/.test(location.search);
const hostN = () => NET.members.length + (DED ? 0 : 1);      // people in the room, counting the host's own player
const PEERJS_ICE_CONFIG = { config: { iceServers: [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun.relay.metered.ca:80' },
  { urls: 'turn:global.relay.metered.ca:80', username: 'openrelayproject', credential: 'openrelayproject' },
  { urls: 'turn:global.relay.metered.ca:443', username: 'openrelayproject', credential: 'openrelayproject' },
  { urls: 'turn:global.relay.metered.ca:443?transport=tcp', username: 'openrelayproject', credential: 'openrelayproject' }
].concat(ICE_EXTRA) } };
const NET_BUFFS = ['ally', 'block', 'reflect', 'sand', 'inv', 'counter', 'guard', 'stealth', 'stun', 'charm', 'root', 'mute', 'blind', 'slow', 'infect', 'reveal', 'fly'];
/* game modes: the registry (MODES, setMode / curMode, modeSnap / applyModeSnap) lives with the rules in engine.js; everything here is guarded so a build
   without it plays the plain team match. The mode id goes into the room id, so it must stay a short lowercase word (digits allowed, e.g. flag5). */
function modeEntry(id) { try { if (typeof MODES === 'undefined' || !MODES) return null; return Array.isArray(MODES) ? MODES.find(m => m && m.id === id) || null : MODES[id] || null; } catch (e) { return null; } }
function netModeOf(v) {      // the mode actually played: unknown or not-ready ids become the default, the same way the engine's modeOf() does
  if (typeof v !== 'string' || !/^[a-z][a-z0-9]{1,9}$/.test(v)) v = 'team';
  try { if (typeof modeOf === 'function') return modeOf(v).id; } catch (e) {}
  const e = modeEntry(v); return e && e.ready !== false ? v : 'team';
}
const lobbyMode = () => netModeOf(typeof modeChoice === 'string' ? modeChoice : 'team');
function modeMax(id) { const e = modeEntry(id), n = e ? (e.max | 0) || (e.teams | 0) * (e.per | 0) : 0;      // room size: the entry's max, else every seat of every team (5v5 = 10)
  return n >= 2 && n <= 12 ? n : id === 'duel' ? 2 : MAX_PLAYERS; }
function useMode(id) { try { if (typeof setMode === 'function') setMode(id); else if (typeof curMode !== 'undefined') curMode = id; } catch (e) {} }
function startMatchIn(id, humans) {      // setup() takes the lobby's modeChoice: make sure it is the room's mode while the match is made
  let keep; try { if (typeof modeChoice !== 'undefined') { keep = modeChoice; modeChoice = id; } } catch (e) {}
  try { startMatch(humans); } finally { try { if (keep !== undefined) modeChoice = keep; } catch (e) {} }
  useMode(id);
}
function modeState() { try { if (typeof modeSnap === 'function') return modeSnap(); } catch (e) {} }
const roomId = k => NET_PREFIX + NET.mode + '-room-' + k;
/* light network mode for phones / busy connections (the device setting 'seum_device' = 'mobile' | 'pc', set on first start and in the settings; before that: a touch screen counts as mobile).
   A light guest asks the host for 10 snapshots a second instead of 20, sends its controls 20 times a second instead of 30, and keeps a larger buffer against jitter */
function netLite() { let v = null; try { v = localStorage.getItem('seum_device'); } catch (e) {} if (v === 'mobile') return true; if (v === 'pc') return false; try { return matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0; } catch (e) { return false; } }
let NET_LITE = netLite();
window.netDeviceChanged = () => { NET_LITE = netLite(); };      // the device setting changed: used from the next room on
let netToken = 0, netClaimTries = 0, netBad = new Set(), netSq = 0, inHist = [], snapAcc = 0, snapTick = 0, inAcc = 0, mapSentVer = -1, mapSentAt = 0, netOut = null;

/* 원 레프트: a host who leaves while others are still fighting (lobby / again / closing the tab after being knocked out) ends the match for them
   with the standings at that moment, so they get their result and reward instead of a bare "the host left" */
function hostLeaving() {
  if (NET.role !== 'host' || NET.phase !== 'play' || state !== 'play' || !NET.members.length || NET.mode !== 'solo') return false;
  let st; try { if (typeof matchStats === 'function') st = matchStats(); } catch (e) {}
  const msg = { t: 'over', sc: score, e: NET.evs, st, md: modeState(), left: 1 };
  for (const m of NET.members) try { m.conn.send(msg); } catch (e) {}
  return true;
}
function netReset() {
  const linger = hostLeaving();
  netToken++;
  const cs = NET.members.map(m => m.conn), pr = NET.peer;
  const shut = () => { for (const c of cs) try { c.close(); } catch (e) {} if (pr) try { pr.destroy(); } catch (e) {} };
  if (linger) setTimeout(shut, 600); else shut();      // give the last message time to leave before the connections go
  if (NET.hostConn) try { NET.hostConn.close(); } catch (e) {}
  Object.assign(NET, { role: null, peer: null, conns: [], hostConn: null, members: [], phase: 'idle', rec: false, evs: [], room: -1, me: -1, waitEnd: 0, onRoomGone: null, heard: 0, ps: null, rtt: 0, tOff: null, jit: .02, delay: .1, tok: null, rc: null, gone: [] }); netBadge(false);
  netOut = null; netSq = 0; inHist = [];
}
const newPeer = id => new Peer(id, Object.assign({ debug: 0 }, PEER_SERVER, PEERJS_ICE_CONFIG));
function keepAlive(p) { p.on('disconnected', () => { setTimeout(() => { if (!p.destroyed && p.disconnected) try { p.reconnect(); } catch (e) {} }, 400); }); }
function roomUi(title, status, n, left) {
  $('roomTitle').textContent = title; $('roomStatus').textContent = status;
  const slots = $('roomSlots'); slots.textContent = '';
  if (n) for (let i = 0; i < (NET.max || MAX_PLAYERS); i++) { const d = document.createElement('i'); if (i < n) d.className = 'on'; slots.append(d); }
  $('roomCount').textContent = left != null ? String(left) : '';
}

/* game start: look for a room, else make one */
function startOnline() {
  if (!ac) { try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {} }
  if (ac && ac.state === 'suspended') ac.resume();
  netReset(); netClaimTries = 0; netBad = new Set();
  NET.mode = lobbyMode(); NET.max = modeMax(NET.mode); useMode(NET.mode);      // also what a fallback bot match plays
  showScreen('roomScreen');
  netSearch();
}
function netSearch() {
  const tok = netToken;
  roomUi('방 찾는 중', '빈자리가 있는 방을 찾고 있어요');
  if (typeof Peer === 'undefined') return netFallback('온라인 모듈을 불러오지 못했어요.');
  let p; try { p = newPeer(undefined); } catch (e) { return netFallback('온라인에 연결할 수 없어요.'); }
  NET.peer = p; NET.phase = 'search'; keepAlive(p);
  const to = setTimeout(() => { if (tok === netToken && NET.phase === 'search' && !p.open) netFallback('온라인 서버에 연결할 수 없어요.'); }, 7000);
  p.on('open', () => { if (tok !== netToken) return; clearTimeout(to); netProbeAll(tok); });
  p.on('error', e => {
    if (tok !== netToken) return;
    if (e.type === 'peer-unavailable') { const m = /room-(\d+)/.exec(String(e.message || '')); if (NET.onRoomGone) NET.onRoomGone(m ? +m[1] : -1); return; }      // names the id that is not there
    if (NET.phase === 'search') { clearTimeout(to); netFallback('온라인 연결에 실패했어요 (' + e.type + ').'); }
  });
}
/* ask all rooms at once. room states: pend (no answer yet) / free (nobody holds the id) / busy (full, playing, or gone) / avail (host is waiting and has a seat) */
function netProbeAll(tok) {
  const SOFT = 3500, HARD = 8000, R = [];
  let decided = false, joining = -1, soft = false, hard = false, grace = 0;
  for (let k = 0; k < NET_ROOMS; k++) R[k] = { s: 'pend', c: null, n: 0, jt: 0 };
  const alive = () => tok === netToken && !decided;
  const closeAll = keep => R.forEach((r, k) => { if (k !== keep && r.c) try { r.c.close(); } catch (e) {} });
  const finish = fn => { decided = true; NET.onRoomGone = null; clearTimeout(grace); clearTimeout(ts); clearTimeout(th); R.forEach(r => clearTimeout(r.jt)); fn(); };
  const status = () => roomUi('방 찾는 중', '방을 확인하고 있어요 (' + R.filter(r => r.s !== 'pend').length + ' / ' + NET_ROOMS + ')');
  const join = () => {
    let best = -1; R.forEach((r, k) => { if (r.s === 'avail' && (best < 0 || r.n > R[best].n)) best = k; });      // the fullest waiting room
    if (best < 0) return false;
    joining = best; const r = R[best];
    try { r.c.send({ t: 'hello', lite: NET_LITE ? 1 : 0, mode: NET.mode, hero: chosen, lo: loadoutOf(chosen), name: PROF.name, cos: myCos(chosen) }); } catch (e) { r.s = 'busy'; joining = -1; return false; }
    r.jt = setTimeout(() => { if (alive() && joining === best) { r.s = 'busy'; joining = -1; decide(); } }, 4500);
    return true;
  };
  function decide() {
    if (!alive() || joining >= 0) return;
    if (R.some(r => r.s === 'avail')) { if (!grace) grace = setTimeout(() => { grace = 0; if (alive() && joining < 0 && !join()) decide(); }, 250); return; }      // a short pause so answers that arrive together can be compared
    const free = R.findIndex((r, k) => r.s === 'free' && !netBad.has(k));
    if (R.some(r => r.s === 'pend') && !hard && !(soft && free >= 0)) return;
    const k = free >= 0 ? free : R.findIndex((r, k) => r.s === 'pend' && hard && !netBad.has(k));      // no answer at all by the deadline: try to take it, the server decides
    if (k >= 0) return finish(() => { closeAll(-1); netClaim(k); });
    finish(() => netFallback('모든 방이 차 있어요.'));
  }
  const ts = setTimeout(() => { soft = true; decide(); }, SOFT), th = setTimeout(() => { hard = true; decide(); }, HARD);
  NET.onRoomGone = k => { if (!alive() || k < 0 || k >= NET_ROOMS || R[k].s !== 'pend') return; R[k].s = 'free'; try { R[k].c.close(); } catch (e) {} status(); decide(); };
  status();
  R.forEach((r, k) => {
    let c; try { c = r.c = NET.peer.connect(roomId(k), { reliable: true }); } catch (e) { r.s = 'busy'; return; }
    c.on('open', () => { if (r.s === 'pend' && alive()) try { c.send({ t: 'peek' }); } catch (e) {} });
    c.on('data', m => {
      if (tok !== netToken || !m) return;
      if (NET.hostConn === c) return guestMsg(m);
      if (decided) return;
      if (m.t === 'info') { r.s = m.ok && (m.mode == null || m.mode === NET.mode) ? 'avail' : 'busy'; r.n = m.n | 0; status(); decide(); }
      else if (m.t === 'busy') { clearTimeout(r.jt); r.s = 'busy'; if (joining === k) joining = -1; decide(); }
      else if (m.t === 'welcome' && joining === k) finish(() => { closeAll(k); becomeGuest(c, k, m); });
    });
    c.on('close', () => {
      if (tok !== netToken) return;
      if (NET.hostConn === c) return guestLink();
      if (!decided && (r.s === 'pend' || r.s === 'avail')) { r.s = 'busy'; if (joining === k) joining = -1; decide(); }
    });
  });
  if (!R.some(r => r.c)) finish(() => netFallback('온라인에 연결할 수 없어요.'));
}
function netClaim(k) {
  const tok = netToken;
  NET.phase = 'claim';
  try { NET.peer.destroy(); } catch (e) {}
  roomUi('방 만드는 중', (k + 1) + '번 방을 열고 있어요');
  let p; try { p = newPeer(roomId(k)); } catch (e) { return netFallback('온라인에 연결할 수 없어요.'); }
  NET.peer = p; keepAlive(p);
  const to = setTimeout(() => { if (tok === netToken && NET.phase === 'claim') netFallback('방을 열지 못했어요.'); }, 7000);
  p.on('open', () => { if (tok !== netToken) return; clearTimeout(to); becomeHost(k); });
  p.on('error', e => {
    if (tok !== netToken) return;
    if (e.type === 'unavailable-id' && NET.phase === 'claim') { clearTimeout(to); netBad.add(k); try { p.destroy(); } catch (er) {} if (++netClaimTries > 3) return netFallback('방을 열지 못했어요.'); netToken++; return netSearch(); }      // someone opened it a moment ago: look again
    if (NET.phase === 'claim') { clearTimeout(to); netFallback('온라인 연결에 실패했어요 (' + e.type + ').'); }
  });
  p.on('connection', c => hostAccept(c, tok));
}
function netFallback(why) {
  netReset(); NET.phase = 'fallback'; const tok = netToken;
  roomUi('봇과 경기', why + ' 봇과 함께 시작합니다.');
  setTimeout(() => { if (tok === netToken && NET.phase === 'fallback') { NET.phase = 'idle'; startMatch(null); } }, 1800);
}

/* host */
function becomeHost(k) {
  Object.assign(NET, { role: 'host', phase: 'wait', room: k, waitEnd: performance.now() + WAIT_SEC * 1000, members: [], conns: [] });
}
/* what a guest says about its controls is never trusted as is: numbers are clamped, the move vector cannot be longer than 1 */
const numIn = (v, lo, hi, d) => typeof v === 'number' && isFinite(v) ? Math.max(lo, Math.min(hi, v)) : d;
function cleanIn(m) {
  let mx = numIn(m.mx, -1, 1, 0), my = numIn(m.my, -1, 1, 0); const len = Math.hypot(mx, my); if (len > 1) { mx /= len; my /= len; }
  const pf = m.pf && typeof m.pf === 'object' ? (m.pf.auto ? { auto: true } : { ang: numIn(m.pf.ang, -7, 7, 0) }) : null;
  return { mx, my, aim: numIn(m.aim, -7, 7, 0), tx: numIn(m.tx, -1e5, 1e5, 0), ty: numIn(m.ty, -1e5, 1e5, 0), hold: !!m.hold, touch: !!m.touch, aiming: !!m.aiming,
    pf, ult: !!m.ult, dash: !!m.dash, sk: [!!(m.sk && m.sk[0]), !!(m.sk && m.sk[1])], np: m.np == null ? undefined : numIn(m.np, 0, 1, 0), manual: !!m.manual };
}
function hostAccept(c, tok) {
  c.on('data', m => {
    if (tok !== netToken || !m || typeof m !== 'object') return;
    if (m.t === 'peek') {      // a searching screen asks whether this room has a free seat; it is not a member yet
      try { c.send({ t: 'info', ok: NET.phase === 'wait' && hostN() < NET.max, n: hostN(), max: NET.max, mode: NET.mode }); } catch (e) {}
    } else if (m.t === 'hello') {
      if (NET.members.some(x => x.conn === c)) return;
      if (NET.phase !== 'wait' || hostN() >= NET.max || m.mode !== NET.mode || typeof m.hero !== 'string' || !Object.prototype.hasOwnProperty.call(HEROES, m.hero)) { try { c.send({ t: 'busy' }); } catch (e) {} setTimeout(() => { try { c.close(); } catch (e) {} }, 500); return; }
      const mem = { conn: c, hero: m.hero, lo: Array.isArray(m.lo) ? m.lo : null, name: cleanName(m.name) || '게스트', cos: cleanCos(m.cos, m.hero), f: null, fi: -1, heard: performance.now(), inAt: 0, sq: 0, sqAt: 0, lite: !!m.lite, evq: [], mv: -1 };
      NET.members.push(mem); NET.conns.push(c);
      if (NET.waitEnd - performance.now() < 5000) NET.waitEnd = performance.now() + 5000;      // someone just arrived: leave time for the next one to find the room too
      mem.tok = Math.random().toString(36).slice(2, 12); c.send({ t: 'welcome', room: NET.room, tok: mem.tok });
      hostLobby();
      if (hostN() >= NET.max) hostStart();
    } else if (m.t === 'rejoin') {      // a guest whose connection broke comes back to its own fighter
      const now = performance.now();
      const old = typeof m.tok === 'string' && NET.members.find(x => x.tok === m.tok); if (old) hostDrop(old.conn, tok);      // the old link may still look open on this side
      NET.gone = (NET.gone || []).filter(g => now - g.at < 60000);
      const g = NET.phase === 'play' && state === 'play' && typeof m.tok === 'string' ? NET.gone.find(x => x.mem.tok === m.tok) : null;
      if (!g || !g.mem.f || !fighters.includes(g.mem.f)) { try { c.send({ t: 'busy' }); } catch (e) {} setTimeout(() => { try { c.close(); } catch (e) {} }, 500); return; }
      NET.gone = NET.gone.filter(x => x !== g);
      const mem = Object.assign(g.mem, { conn: c, heard: now, inAt: 0, sq: 0, sqAt: 0, evq: [], mv: -1, lite: !!m.lite });
      mem.f.remote = mem; mem.f.human = true; mem.f.netIn = null; mem.fi = fighters.indexOf(mem.f);
      NET.members.push(mem); NET.conns.push(c); NET.rec = true; NET.rejoins = (NET.rejoins || 0) + 1;
      const roster = fighters.map(f => ({ nm: f.nick, cos: f.cos, hu: f.human ? 1 : 0 }));
      try { c.send({ t: 'start', re: 1, you: mem.fi, team: mem.f.team, map: curMap, mode: NET.mode, roster, tok: mem.tok }); } catch (e) {}
    } else if (m.t === 'in' || m.t === 'ping') {
      const mem = NET.members.find(x => x.conn === c); if (!mem) return;
      const now = performance.now(); mem.heard = now;
      if (m.t === 'ping') { try { c.send({ t: 'pong', ts: m.ts }); } catch (e) {} return; }
      if (!mem.f) return;
      const n = cleanIn(m), o = mem.f.netIn;
      if (o) { n.pf = n.pf || o.pf; n.ult = n.ult || o.ult; n.dash = n.dash || o.dash; n.sk = [n.sk[0] || o.sk[0], n.sk[1] || o.sk[1]]; n.manual = n.manual || o.manual; }
      mem.f.netIn = n; mem.inAt = now;
      if (Number.isInteger(m.sq) && m.sq > mem.sq) { mem.sq = m.sq; mem.sqAt = now; }
    } else if (m.t === 'emo' || m.t === 'chat') {
      const mem = NET.members.find(x => x.conn === c); if (!mem || !mem.f || NET.phase !== 'play') return;
      if (m.t === 'emo') doEmote(mem.f, m.i | 0); else hostChat(mem.f, m.x);
    }
  });
  c.on('close', () => hostDrop(c, tok));
}
function hostDrop(c, tok) {
    if (tok !== netToken) return;
    const i = NET.members.findIndex(x => x.conn === c); if (i < 0) return;
    try { c.close(); } catch (e) {}
    const mem = NET.members[i]; NET.members.splice(i, 1); NET.conns = NET.conns.filter(x => x !== c);
    if (mem.f) { mem.f.remote = null; mem.f.human = false; mem.f.netIn = null; }      // a player who left mid-match: a bot takes over the fighter
    if (mem.f && mem.tok && NET.phase === 'play') (NET.gone || (NET.gone = [])).push({ mem, at: performance.now() });      // ...until the same player comes back (rejoin) within a minute
    if (NET.phase === 'wait') hostLobby();
    NET.rec = NET.members.length > 0 && state === 'play';
}
function hostLobby() {
  const left = Math.max(0, Math.ceil((NET.waitEnd - performance.now()) / 1000)), n = hostN();
  roomUi('방 대기 중', n + ' / ' + NET.max + '명 · ' + left + '초 뒤에 시작해요. 빈자리는 봇이 채워요.', n, left);
  for (const m of NET.members) try { m.conn.send({ t: 'lobby', n, left, max: NET.max }); } catch (e) {}
}
function hostStart() {
  if (NET.phase !== 'wait') return;
  NET.phase = 'play';
  const humans = (DED ? [] : [{ hero: chosen, lo: loadoutOf(chosen), local: true, cos: myCos(chosen), name: PROF.name }]).concat(NET.members.map(m => ({ hero: m.hero, lo: m.lo, remote: m, cos: m.cos, name: m.name })));
  startMatchIn(NET.mode, humans);
  if (!NET.members.length) { const p = NET.peer; NET.peer = null; NET.role = null; NET.phase = 'idle'; try { p.destroy(); } catch (e) {} return; }      // nobody came: the room closes, the match is offline
  NET.rec = true; NET.evs = []; snapAcc = 0; mapSentVer = -1;
  const roster = fighters.map(f => ({ nm: f.nick, cos: f.cos, hu: f.human ? 1 : 0 }));
  for (const m of NET.members) try { m.conn.send({ t: 'start', you: m.fi, team: m.f.team, map: curMap, mode: NET.mode, roster }); } catch (e) {}
}
const r1 = v => Math.round(v * 10) / 10, r2 = v => Math.round(v * 100) / 100, r3 = v => Math.round(v * 1000) / 1000;
/* what a guest needs to predict its own walking: the highest input number the host has taken in, how long ago, and the speed (0 = do not predict) */
const canWalk = f => !f.dead && !f.dash && !B(f, 'stun') && !B(f, 'root') && !f.rooted && f.form !== 'gone' && !B(f, 'charm') && !B(f, 'puppet') && !f.h.moveOk;
/* the host's walking speed for f: the engine's own moveSpeed() when it has one, else the same formula as updateFighter (keep the two in step) */
function walkSpeed(f) {
  if (typeof moveSpeed === 'function') return moveSpeed(f);
  return SPEED * V(f, 'haste', 1) * V(f, 'slow', 1) * V(f, 'pad', 1) * (B(f, 'infect') ? .9 : 1) * (f.h.spd ? f.h.spd(f) : 1) * (typeof carrying === 'function' && carrying(f) ? .85 : 1);
}
function predInfo(f) {
  const mem = f.remote, now = performance.now();
  return { ak: mem.sq, ao: r3(Math.min(.25, Math.max(0, (now - mem.sqAt) / 1000))), pm: canWalk(f) ? r1(walkSpeed(f)) : 0 };
}
function cdInfo(p) {
  if (p.net) return p.net;
  return Object.assign(p.remote ? predInfo(p) : {}, { u: r1(Math.max(0, p.ucd)), uM: r1(ULT_CD * (p.h.cdMul ? p.h.cdMul(p) : 1)), d: r1(Math.max(0, p.dcd)), dM: r1(dashCdOf(p)) || 1,
    sk: [0, 1].map(i => p.sk[i] ? p.sk[i].n : 0), s: [0, 1].map(i => r1(Math.max(0, p.scd[i]))), sM: [0, 1].map(i => p.sk[i] ? r1(skillCd(p, i)) : 1), sn: [0, 1].map(i => p.sk[i] ? nameOf(p.sk[i], p) : '-'), un: p.h.ult.name });
}
function snapFighter(f) {
  const ix = o => o ? fighters.indexOf(o) : -1;
  let bb = 0; NET_BUFFS.forEach((k, i) => { if (B(f, k)) bb |= 1 << i; });
  const st = {}, s0 = f.st;
  if (s0.hat) st.hat = [Math.round(s0.hat.x), Math.round(s0.hat.y)];
  if (s0.orb && s0.orb.n > 0) st.orb = s0.orb.n;
  if (s0.dr != null) st.dr = s0.dr;
  if (s0.thread && !s0.thread.dead) st.th = ix(s0.thread);
  if (s0.mark && !s0.mark.dead) st.mk = ix(s0.mark);
  if (s0.fsh) st.fsh = 1;
  if (s0.neck) st.nk = r2(time - s0.neck);
  for (const k of ['g', 'chip', 'stack', 'pz', 'over', 'heat', 'pn']) if (s0[k]) st[k] = r2(s0[k]);
  if (s0.morph) st.morph = 1;
  const s = { h: f.h.id, h0: f.h0.id, tm: f.team, x: Math.round(f.x), y: Math.round(f.y), a: r2(f.aim), hp: Math.ceil(f.hp), mh: f.mhp, d: f.dead ? 1 : 0, rt: r1(f.respawnT),
    fm: f.form || 0, sw: r2(f.swing), sp: r2(f.spin), sh: Math.round(f.shield), iv: f.inv > 0 ? 1 : 0, bb, st, k: f.kos, de: f.deaths, lf: r1(Math.min(9, time - f.lastFire)), lh: r1(Math.min(9, time - f.lastHit)), hu: f.human ? 1 : 0 };
  if (f.remote) s.cd = cdInfo(f);
  if (f.em != null && f.emT > time) s.em = [f.em, r1(f.emT - time)];
  return s;
}
function hostSnap() {
  const s = { t: 's', tl: r1(timeLeft), sc: score, f: fighters.map(snapFighter),
    b: bullets.map(b => [Math.round(b.x), Math.round(b.y), Math.round(b.svx || 0), Math.round(b.svy || 0), r2(b.ang), b.shape, b.team, r1(b.r), b.wid || 0]),
    z: zones.map(z => [Math.round(z.x), Math.round(z.y), Math.round(z.r), r1(Math.min(z.t, 99)), z.col, z.op || 0, z.kind || 0, z.key ? 1 : 0, z.team, z.hidden ? 1 : 0]),
    m: minions.map(m => [m.kind, Math.round(m.x), Math.round(m.y), m.team, Math.ceil(m.hp), m.max, m.hit ? 1 : 0, r2(m.aim || m.a || 0), m.sw ? r2(time - m.sw) : 9, m.side || 0]),
    k: strikes.map(k => [Math.round(k.x), Math.round(k.y), Math.round(k.r), r2(k.t), r2(k.max), k.col]),
    w: [...tempWalls].filter(e => e[1] > time).map(e => [e[0], r1(e[1] - time)]), e: NET.evs };
  const md = modeState(); if (md !== undefined) s.md = md;      // flags, rounds, safe zone ... whatever the mode keeps
  s.ts = r3(time);      // the host's match clock: guests place what they see on it (interpolation)
  const ev = NET.evs; NET.evs = []; snapTick++;
  const now = performance.now(), mapAll = now - mapSentAt > 2000; if (mapAll) mapSentAt = now;
  let mr = null; const rows = () => mr || (mr = MAP.map(r => r.join('')));
  for (const m of NET.members) {
    if (m.lite && snapTick % 2) { if (ev.length) m.evq.push(...ev); continue; }      // a light guest gets every other snapshot; its events wait for the next one it gets
    const o = Object.assign({}, s, { e: m.evq.length ? m.evq.concat(ev) : ev }); m.evq = [];
    if (m.mv !== NET.mapVer || mapAll) { o.mr = rows(); m.mv = NET.mapVer; }
    try { if (m.conn.open) m.conn.send(o); } catch (e) {}
  }
}
function hostEnd() {
  if (NET.role !== 'host') return;
  /* end-of-match stats: the result screen's author defines matchStats() (a JSON-safe value, e.g. an array indexed like `fighters`); it rides along in 'over' and lands in NET.stats on guests */
  let st; try { if (typeof matchStats === 'function') st = matchStats(); } catch (e) {}
  for (const m of NET.members) try { m.conn.send({ t: 'over', sc: score, e: NET.evs, st }); } catch (e) {}
  NET.rec = false; const tok = netToken;
  setTimeout(() => { if (tok === netToken) netReset(); }, 1500);
}

/* guest */
function becomeGuest(c, k, m) {
  Object.assign(NET, { role: 'guest', hostConn: c, room: k, phase: 'joined', tok: m && typeof m.tok === 'string' ? m.tok : null, rc: null });
  roomUi('방에 들어왔어요', (k + 1) + '번 방 · 방장이 경기를 시작하기를 기다리고 있어요');
}
function guestMsg(m) {
  NET.heard = performance.now();
  if (m.t === 'lobby' && NET.phase === 'joined') { if (m.max >= 2 && m.max <= 8) NET.max = m.max | 0; roomUi('방에 들어왔어요', m.n + ' / ' + NET.max + '명 · ' + m.left + '초 뒤에 시작해요. 빈자리는 봇이 채워요.', m.n, m.left); }
  else if (m.t === 'pong') { if (typeof m.ts === 'number') { const r = performance.now() - m.ts; NET.rtt = NET.rtt ? NET.rtt * .7 + r * .3 : r; } }
  else if (m.t === 'start') guestStart(m);
  else if (m.t === 's' && state === 'play' && NET.phase === 'play') applySnap(m);
  else if (m.t === 'over' && NET.phase === 'play') { if (m.e) replayEvents(m.e); if (m.md !== undefined && typeof applyModeSnap === 'function') try { applyModeSnap(m.md); } catch (e) {} score = m.sc; NET.stats = m.st; NET.phase = 'over'; endGame(); const tok = netToken; setTimeout(() => { if (tok === netToken) netReset(); }, 300); }
}
/* reconnect: when the link to the host breaks mid-match (wifi <-> LTE, a tunnel, a dropped packet storm), the host's bot keeps the fighter
   going and this screen keeps trying a new connection to the same room for 20 s, then takes the fighter back */
function netBadge(on) {
  let b = document.getElementById('netBadge');
  if (!b && on) { b = document.createElement('div'); b.id = 'netBadge'; b.style.cssText = 'position:fixed;left:50%;top:8px;transform:translateX(-50%);z-index:60;padding:4px 12px;border-radius:12px;background:rgba(20,20,30,.78);color:#ffd36a;font:600 13px/1.4 sans-serif;pointer-events:none'; b.textContent = '연결 다시 잇는 중…'; document.body.append(b); }
  if (b) b.hidden = !on;
}
function guestLink() {
  if (NET.role !== 'guest' || NET.phase !== 'play' || state !== 'play' || !NET.tok) return hostLost();
  if (NET.rc) return;
  const now = performance.now(); NET.rc = { until: now + 20000, next: now + 300, n: 0, c: null };
  try { NET.hostConn && NET.hostConn.close(); } catch (e) {} NET.hostConn = null; netOut = null;
  netBadge(true);
}
function rejoinTry() {
  const rc = NET.rc, tok = netToken; rc.next = performance.now() + 2500; rc.n++;
  if (rc.c) try { rc.c.close(); } catch (e) {}
  let p = NET.peer;
  if (!p || p.destroyed) { try { p = NET.peer = newPeer(undefined); keepAlive(p); } catch (e) { return; } }
  else if (p.disconnected) { try { p.reconnect(); } catch (e) {} if (rc.n % 3) return; try { p.destroy(); } catch (e) {} try { p = NET.peer = newPeer(undefined); keepAlive(p); } catch (e) { return; } }      // a new network: the old signalling link is dead, a fresh peer is quicker
  const go = () => {
    if (tok !== netToken || NET.rc !== rc) return;
    let c; try { c = rc.c = p.connect(roomId(NET.room), { reliable: true }); } catch (e) { return; }
    c.on('open', () => { try { c.send({ t: 'rejoin', tok: NET.tok, lite: NET_LITE ? 1 : 0 }); } catch (e) {} });
    c.on('data', m => {
      if (tok !== netToken || !m) return;
      if (NET.hostConn === c) return guestMsg(m);
      if (NET.rc !== rc) return;
      if (m.t === 'start' && m.re) { NET.rc = null; NET.hostConn = c; NET.heard = performance.now(); NET.rejoined = (NET.rejoined || 0) + 1; netBadge(false); guestStart(m); }
      else if (m.t === 'busy') { NET.rc = null; netBadge(false); hostLost(); }
    });
    c.on('close', () => { if (tok === netToken && NET.hostConn === c) guestLink(); });
  };
  if (p.open) go(); else p.once('open', go);
}
function hostLost() {
  NET.rc = null; netBadge(false);
  const was = NET.phase; netReset();
  if (was === 'play' && state === 'play' && NET.mode === 'solo') endGame();      // 원 레프트: the result as it stands (the host's tab went away without a word)
  else if (was === 'play' && state === 'play') { state = 'over'; notice.hidden = false; notice.textContent = '방장이 나가서 경기가 끝났어요'; setTimeout(() => { if (state === 'over' && !NET.role) toMenu(); }, 2200); }
  else if (was === 'joined') { netSearch(); }
}
function guestStart(m) {
  NET.mode = netModeOf(m.mode); useMode(NET.mode);
  NET.phase = 'play'; NET.me = m.you; VIEW = m.team; NET.roster = Array.isArray(m.roster) ? m.roster : [];
  loadMap(Number.isInteger(m.map) && MAPS[m.map] ? m.map : 0);
  fighters = []; bullets = []; parts = []; texts = []; rings = []; zones = []; minions = []; timers = []; strikes = []; tempWalls.clear();
  score = [0, 0]; timeLeft = MATCH_TIME; player = null; inAcc = 0; netOut = null; netSq = 0; inHist = []; NET.ps = null;
  enterPlay();
}
function guestFighter(i, s) {
  let f = fighters[i];
  if (!f) {
    f = { team: s.tm, slot: i % 3, x: s.x, y: s.y, nx: s.x, ny: s.y, na: s.a, vx: 0, vy: 0, kx: 0, ky: 0, aim: s.a, b: {}, st: {}, dots: [], recent: [], mv: [0, 0], bob: Math.random() * 6,
      inv: 0, tapT: 0, hold: false, scd: [0, 0], sk: [null, null], queue: [], minion: false, isPlayer: i === NET.me, lastFire: -9, lastHit: -9, swing: 0, spin: 0, shield: 0, hp: s.hp, mhp: s.mh };
    fighters[i] = f;
    if (i === NET.me) player = f;
    const r = (NET.roster || [])[i] || {}; f.nick = r.nm ? cleanName(r.nm) : null; f.cos = cleanCos(r.cos, s.h0);
  }
  return f;
}
function applySnap(s) {
  NET.heard = performance.now();
  if (s.ts != null) netClock(s.ts);
  timeLeft = s.tl; score = s.sc;
  if (s.mr) MAP = s.mr.map(r => r.split(''));
  tempWalls.clear(); for (const w of s.w) tempWalls.set(w[0], time + w[1]);
  s.f.forEach((d, i) => {
    const f = guestFighter(i, d), me = f === player;
    if (me && !f.dead && d.hp < f.hp - .5 && !d.d) { shake = 7; sfx(120, .12, 'square', .06, .6); }
    if (me && d.lf < (f.lfPrev == null ? 9 : f.lfPrev) - .05 && d.lf < .2) sfx(f.h && f.h.type === 'melee' ? 300 : 560, .08, 'square', .045, .5);
    f.lfPrev = d.lf;
    f.h = HEROES[d.h]; f.h0 = HEROES[d.h0]; f.team = d.tm; f.human = !!d.hu;
    if (f.dead && !d.d) { f.x = d.x; f.y = d.y; }
    f.nx = d.x; f.ny = d.y; f.na = d.a;
    if (!me && s.ts != null) { const h = f.ih || (f.ih = []); if (h.length && s.ts < h[h.length - 1].t) h.length = 0; h.push({ t: s.ts, x: d.x, y: d.y }); while (h.length > 2 && s.ts - h[0].t > 1) h.shift(); if (d.d || (f.dead && !d.d)) h.length = 0, h.push({ t: s.ts, x: d.x, y: d.y }); } if (!me) f.aim = f.aim == null ? d.a : f.aim;
    f.hp = d.hp; f.mhp = d.mh; f.dead = !!d.d; f.respawnT = d.rt; f.form = d.fm || null; f.ghost = f.form === 'gone' || f.form === 'sub' || f.form === 'spirit';
    f.swing = d.sw; f.spin = d.sp; f.shield = d.sh; f.inv = d.iv ? .1 : 0; f.kos = d.k; f.deaths = d.de;
    f.lastFire = time - d.lf; f.lastHit = time - d.lh;
    f.b = {}; NET_BUFFS.forEach((k, j) => { if (d.bb & (1 << j)) f.b[k] = { t: 1, v: k === 'charm' ? { team: 1 - d.tm } : 1 }; });
    const st = d.st; f.st = { hat: st.hat ? { x: st.hat[0], y: st.hat[1] } : null, orb: st.orb ? { n: st.orb, t: 1 } : null, dr: st.dr, fsh: st.fsh ? { hp: 1 } : null, neck: st.nk != null ? time - st.nk : 0, morph: st.morph ? 1 : null, th: st.th, mk: st.mk };
    for (const k of ['g', 'chip', 'stack', 'pz', 'over', 'heat', 'pn']) f.st[k] = st[k] || 0;
    f.net = d.cd || null;
    if (me) NET.ps = d.cd && d.cd.pm && !d.d ? { x: d.x, y: d.y, ak: d.cd.ak | 0, ao: d.cd.ao || 0, sp: d.cd.pm } : null;
    if (d.cd) { f.sk = (d.cd.sk || []).map(k => f.h.skills.find(x => x.n === k) || null); f.ucd = d.cd.u; f.dcd = d.cd.d; f.scd = d.cd.s.slice(); }
    if (d.em) { f.em = d.em[0]; f.emT = time + d.em[1]; } else f.emT = 0;
  });
  fighters.length = s.f.length;
  for (const f of fighters) { f.st.thread = f.st.th >= 0 ? fighters[f.st.th] : null; f.st.mark = f.st.mk >= 0 ? fighters[f.st.mk] : null; }
  bullets = s.b.map(b => ({ x: b[0], y: b[1], vx: b[2], vy: b[3], ang: b[4], shape: b[5], team: b[6], r: b[7], wid: b[8] || null }));
  zones = s.z.map(z => ({ x: z[0], y: z[1], r: z[2], t: z[3], col: z[4], op: z[5], kind: z[6] || null, key: z[7] ? 'k' : null, team: z[8], hidden: !!z[9] }));
  minions = s.m.map(m => ({ minion: true, kind: m[0], x: m[1], y: m[2], team: m[3], hp: m[4], max: m[5], hit: !!m[6], aim: m[7], a: m[7], sw: time - m[8], side: m[9], b: {}, dead: false, bob: time * 8 }));
  strikes = s.k.map(k => ({ x: k[0], y: k[1], r: k[2], t: k[3], max: k[4], col: k[5] }));
  if (s.md !== undefined && typeof applyModeSnap === 'function') try { applyModeSnap(s.md); } catch (e) {}
  replayEvents(s.e);
}
function replayEvents(es) {
  for (const e of es || []) {
    switch (e[0]) {
      case 'b': burst(e[1], e[2], e[3], e[4], e[5]); break;
      case 'r': rings.push({ x: e[1], y: e[2], r: e[3], color: e[4], life: e[5], max: e[5] }); break;
      case 't': texts.push({ x: e[1], y: e[2], txt: e[3], color: e[4], small: !!e[5], life: e[6] }); break;
      case 'p': parts.push({ x: e[1], y: e[2], vx: e[3], vy: e[4], life: e[5], max: e[5], color: e[6], r: e[7] }); break;
      case 'c': showChat(fighters[e[1]], e[2]); break;
      case 'w': swings.push({ x: e[1], y: e[2], wid: e[3], swingAngle: e[4], life: e[5], life0: e[5], color: TC(e[6]), vx: 0, vy: 0, dmgless: true }); break;
      case 'x': if (FXF[e[1]]) FXF[e[1]](...e.slice(2)); break;
      case 'f': { const o = e[1] >= 0 ? fighters[e[1]] : null, v = fighters[e[2]]; if (v) { addFeed(o, v); if (v === player || o === player) sfx(v === player ? 200 : 600, .3, 'triangle', .07, v === player ? .3 : 1.8); } break; }
    }
  }
}
/* where this screen's own fighter will be once the host has taken in every input sent so far: the host's last position, then the inputs it has not seen yet
   (the one it is part-way through only for the time it has left), walked with the same collision. Never used while stunned, dashing, rooted and so on. */
function guestPredict(f) {
  const ps = NET.ps; if (!ps || !f.b) return null;
  const q = { x: ps.x, y: ps.y, b: f.b, dash: null, h: f.h };
  let tot = 0;
  for (let i = 0; i < inHist.length; i++) {
    const h = inHist[i]; if (h.sq < ps.ak) continue;
    let dur = (i + 1 < inHist.length ? inHist[i + 1].t : time) - h.t;
    if (h.sq === ps.ak) dur -= ps.ao;
    dur = Math.min(dur, .3); if (dur <= 0 || tot > .5) continue; tot += dur;
    for (let n = Math.ceil(dur / .02), j = 0; j < n; j++) moveFighter(q, h.mx * ps.sp * dur / n, h.my * ps.sp * dur / n);
  }
  return q;
}
/* guest clock: tOff maps local seconds to the host's match clock. It follows the earliest-arriving snapshots (late ones are jitter), and
   the shown time runs `delay` behind, enough to cover the snapshot gap plus the measured jitter, so remote players move smoothly between two known positions */
let netRT = null;
function netClock(ts) {
  const now = performance.now() / 1000, o = ts - now, gap = NET_LITE ? .1 : .05;
  if (NET.tOff == null || o - NET.tOff > .5 || NET.tOff - o > 1.5) { NET.tOff = o; NET.jit = .02; }      // first snapshot, or the clock jumped (new match)
  else { const d = o - NET.tOff; NET.tOff += d > 0 ? d * .2 : d * .01; NET.jit += (Math.abs(d) - NET.jit) * .05; }
  NET.delay = Math.max(NET_LITE ? .12 : .07, Math.min(.35, gap * 1.2 + NET.jit * 2.5));
}
/* (remote players: interpAt gives the target, and a light touch of smoothing hides the small corrections when a late snapshot lands) */
function interpAt(h, t) {
  let i = h.length - 1;
  if (t >= h[i].t) { if (i < 1) return [h[i].x, h[i].y]; const a = h[i - 1], b = h[i], dt = b.t - a.t, e = Math.min(t - b.t, .2); if (dt <= 0 || Math.hypot(b.x - a.x, b.y - a.y) > 160) return [b.x, b.y]; return [b.x + (b.x - a.x) / dt * e, b.y + (b.y - a.y) / dt * e]; }      // past the newest: a short extrapolation, then hold
  while (i > 0 && h[i - 1].t > t) i--;
  if (i === 0) return [h[0].x, h[0].y];
  const a = h[i - 1], b = h[i], u = (t - a.t) / Math.max(1e-3, b.t - a.t);
  if (Math.hypot(b.x - a.x, b.y - a.y) > 160) return u < .5 ? [a.x, a.y] : [b.x, b.y];      // a teleport / respawn: no sliding across the map
  return [a.x + (b.x - a.x) * u, a.y + (b.y - a.y) * u];
}
function guestStep(dt) {
  netRT = NET.tOff != null ? performance.now() / 1000 + NET.tOff - NET.delay : null;      // the host time being shown now
  time += dt; timeLeft = Math.max(0, timeLeft - dt);
  const k = Math.min(1, dt * 14);
  for (const f of fighters) {
    if (!f || f.dead) continue;
    const px = f.x, py = f.y, q = f === player && NET.ps ? guestPredict(f) : null;
    if (q) { const ex = q.x - f.x, ey = q.y - f.y; if (ex * ex + ey * ey > 8100) { f.x = q.x; f.y = q.y; } else { const kp = Math.min(1, dt * 40); f.x += ex * kp; f.y += ey * kp; } }      // own walking: the host's position plus the inputs it has not yet seen
    else { const ip = f.ih && f.ih.length && netRT != null ? interpAt(f.ih, netRT) : null; if (ip) { const ex = ip[0] - f.x, ey = ip[1] - f.y; if (ex * ex + ey * ey > 25600) { f.x = ip[0]; f.y = ip[1]; } else { const kk = Math.min(1, dt * 22); f.x += ex * kk; f.y += ey * kk; } } else { f.x += (f.nx - f.x) * k; f.y += (f.ny - f.y) * k; } }
    f.vx = (f.x - px) / dt; f.vy = (f.y - py) / dt; f.bob += Math.hypot(f.vx, f.vy) * dt * .06;
    if (f !== player) { let da = f.na - f.aim; da = Math.atan2(Math.sin(da), Math.cos(da)); f.aim += da * k; }
    f.swing = Math.max(0, f.swing - dt); f.spin = Math.max(0, f.spin - dt);
  }
  for (const b of bullets) { b.x += b.vx * dt; b.y += b.vy * dt; }
  for (const z of zones) z.t -= dt;
  for (const s of strikes) s.t = Math.max(.01, s.t - dt);
  fxStep(dt);
  if (!player) return;
  const inp = readLocal(player);
  player.aim = inp.aim; player.tx = inp.tx; player.ty = inp.ty;
  player.ucd -= dt; player.dcd -= dt; player.scd[0] -= dt; player.scd[1] -= dt;
  if (!netOut) netOut = inp;
  else { netOut = Object.assign(inp, { pf: inp.pf || netOut.pf, ult: inp.ult || netOut.ult, dash: inp.dash || netOut.dash, sk: [inp.sk[0] || netOut.sk[0], inp.sk[1] || netOut.sk[1]], np: inp.np != null ? inp.np : netOut.np, manual: inp.manual || netOut.manual }); }
  inAcc += dt;
  if (inAcc >= (NET_LITE ? 1 / 20 : IN_DT) && NET.hostConn && NET.hostConn.open) {
    inAcc = 0;
    const o = netOut; netOut = null;
    const sq = ++netSq; inHist.push({ sq, t: time, mx: r2(o.mx), my: r2(o.my) }); while (inHist.length && time - inHist[0].t > 1.5) inHist.shift();
    try { NET.hostConn.send({ t: 'in', sq, mx: r2(o.mx), my: r2(o.my), aim: r2(o.aim), tx: Math.round(o.tx), ty: Math.round(o.ty), hold: o.hold, touch: o.touch, aiming: o.aiming, pf: o.pf, ult: o.ult, dash: o.dash, sk: o.sk, np: o.np, manual: o.manual }); } catch (e) {}
  }
}

/* called every frame */
let pingAcc = 0;
function netTick(dt) {
  const now = performance.now();
  if (NET.role === 'host') for (const m of NET.members.slice()) {
    if (now - (m.heard || now) > 10000) hostDrop(m.conn, netToken);      // nothing from a guest for 6 s: gone
    else if (m.f && m.f.netIn && m.inAt && now - m.inAt > (m.lite ? 700 : 500)) { m.f.netIn.mx = 0; m.f.netIn.my = 0; m.f.netIn.hold = false; }      // controls gone quiet (frozen tab, bad link): stand still instead of walking on
  }
  if (NET.role === 'guest' && NET.rc) { if (now > NET.rc.until) hostLost(); else if (now > NET.rc.next) rejoinTry(); }      // reconnecting: no way back for 20 s means the host is gone
  if (NET.role === 'guest' && NET.hostConn) {
    if ((pingAcc += dt) > 1) { pingAcc = 0; try { NET.hostConn.send({ t: 'ping', ts: now }); } catch (e) {} }
    if (NET.phase === 'play' && NET.heard && now - NET.heard > 4000 && !NET.rc) guestLink();       // no snapshot for 4 s: the link is probably broken, try a fresh one
    if (NET.phase === 'joined') { if (!NET.heard) NET.heard = now; if (now - NET.heard > 8000) hostLost(); }
  }
  if (NET.role === 'host' && NET.phase === 'wait') {
    if (DED && !NET.members.length) NET.waitEnd = performance.now() + WAIT_SEC * 1000;      // an empty server room waits as long as it takes
    const left = (NET.waitEnd - performance.now()) / 1000;
    if (Math.ceil(left) !== netTick.last) { netTick.last = Math.ceil(left); hostLobby(); }
    if (left <= 0) hostStart();
  }
  if (NET.role === 'host' && NET.phase === 'play' && state === 'play' && NET.members.length) {
    snapAcc += dt;
    if (snapAcc >= SNAP_DT) { snapAcc = 0; hostSnap(); }
  }
}

if (DED) {
  const ded = { err: null, started: false, ended: false };
  window.__sad = {
    modes: () => (typeof MODES !== 'undefined' && Array.isArray(MODES) ? MODES.filter(m => m && m.ready !== false).map(m => m.id) : ['team']),
    open(mode, k) {
      netReset(); Object.assign(ded, { err: null, started: false, ended: false });
      NET.mode = netModeOf(mode); NET.max = modeMax(NET.mode); useMode(NET.mode);
      const tok = netToken; NET.phase = 'claim';
      let p; try { p = newPeer(roomId(k | 0)); } catch (e) { ded.err = 'peer'; return; }
      NET.peer = p; keepAlive(p);
      p.on('open', () => { if (tok === netToken) becomeHost(k | 0); });
      p.on('error', e => { if (tok !== netToken) return; if (e.type === 'peer-unavailable') return; if (NET.phase === 'claim' || e.type === 'unavailable-id') ded.err = e.type === 'unavailable-id' ? 'taken' : String(e.type); });
      p.on('connection', c => hostAccept(c, tok));
    },
    status() {
      if (NET.phase === 'play' && state === 'play') ded.started = true;
      if (ded.started && (state !== 'play' || NET.role !== 'host')) ded.ended = true;
      return { live: NET.role === 'host', mode: NET.mode, room: NET.room, phase: NET.phase, humans: NET.members.length, started: ded.started, ended: ded.ended, err: ded.err };
    }
  };
}
