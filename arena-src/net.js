/* ---------- online: PeerJS matchmaking without room codes ----------
   Rooms are fixed PeerJS ids (seumarena-v1-room-0 .. 7). Game start looks through them in order: a room that answers 'welcome'
   is joined; one that is full or already playing answers 'busy' and the next is tried. If none takes us, the first free id is
   claimed and this screen becomes the host of a new room. The host waits WAIT_SEC seconds for others (or until the room is full),
   then starts; empty slots get bots. The host runs the whole match and sends snapshots; guests send only their controls. */
const NET_PREFIX = 'seumarena-v1-room-', NET_ROOMS = 8, WAIT_SEC = 15, MAX_PLAYERS = 6, SNAP_DT = 1 / 20, IN_DT = 1 / 30;
const PEERJS_ICE_CONFIG = { config: { iceServers: [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun.relay.metered.ca:80' },
  { urls: 'turn:global.relay.metered.ca:80', username: 'openrelayproject', credential: 'openrelayproject' },
  { urls: 'turn:global.relay.metered.ca:443', username: 'openrelayproject', credential: 'openrelayproject' },
  { urls: 'turn:global.relay.metered.ca:443?transport=tcp', username: 'openrelayproject', credential: 'openrelayproject' }
] } };
const NET_BUFFS = ['ally', 'block', 'reflect', 'sand', 'inv', 'counter', 'guard', 'stealth', 'stun', 'charm', 'root', 'mute', 'blind', 'slow', 'infect', 'reveal', 'fly'];
let netToken = 0, netClaimTries = 0, snapAcc = 0, inAcc = 0, mapSentVer = -1, mapSentAt = 0, netOut = null;

function netReset() {
  netToken++;
  for (const m of NET.members) try { m.conn.close(); } catch (e) {}
  if (NET.hostConn) try { NET.hostConn.close(); } catch (e) {}
  if (NET.peer) try { NET.peer.destroy(); } catch (e) {}
  Object.assign(NET, { role: null, peer: null, conns: [], hostConn: null, members: [], phase: 'idle', rec: false, evs: [], room: -1, me: -1, waitEnd: 0, onUnavail: null, heard: 0 });
  netOut = null;
}
const newPeer = id => new Peer(id, Object.assign({ debug: 0 }, PEERJS_ICE_CONFIG));
function keepAlive(p) { p.on('disconnected', () => { setTimeout(() => { if (!p.destroyed && p.disconnected) try { p.reconnect(); } catch (e) {} }, 400); }); }
function roomUi(title, status, n, left) {
  $('roomTitle').textContent = title; $('roomStatus').textContent = status;
  const slots = $('roomSlots'); slots.textContent = '';
  if (n) for (let i = 0; i < MAX_PLAYERS; i++) { const d = document.createElement('i'); if (i < n) d.className = 'on'; slots.append(d); }
  $('roomCount').textContent = left != null ? String(left) : '';
}

/* game start: look for a room, else make one */
function startOnline() {
  if (!ac) { try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {} }
  if (ac && ac.state === 'suspended') ac.resume();
  netReset(); netClaimTries = 0;
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
  p.on('open', () => { if (tok !== netToken) return; clearTimeout(to); netProbe(0, -1); });
  p.on('error', e => {
    if (tok !== netToken) return;
    if (e.type === 'peer-unavailable') { if (NET.onUnavail) NET.onUnavail(); return; }
    if (NET.phase === 'search') { clearTimeout(to); netFallback('온라인 연결에 실패했어요 (' + e.type + ').'); }
  });
}
function netProbe(k, free) {
  const tok = netToken;
  if (tok !== netToken || NET.phase !== 'search') return;
  if (k >= NET_ROOMS) { if (free < 0) return netFallback('모든 방이 차 있어요.'); return netClaim(free); }
  roomUi('방 찾는 중', (k + 1) + '번 방을 확인하고 있어요');
  let done = false, c = null;
  const next = isFree => { if (done || tok !== netToken) return; done = true; clearTimeout(t); NET.onUnavail = null; try { c.close(); } catch (e) {} netProbe(k + 1, free < 0 && isFree ? k : free); };
  NET.onUnavail = () => next(true);
  try { c = NET.peer.connect(NET_PREFIX + k, { reliable: true }); } catch (e) { return next(true); }
  const t = setTimeout(() => next(false), 4500);
  c.on('open', () => { if (!done) c.send({ t: 'hello', hero: chosen, lo: loadoutOf(chosen), name: PROF.name, cos: myCos(chosen) }); });
  c.on('data', m => {
    if (tok !== netToken || !m) return;
    if (NET.hostConn === c) return guestMsg(m);
    if (done) return;
    if (m.t === 'busy') return next(false);
    if (m.t === 'welcome') { done = true; clearTimeout(t); NET.onUnavail = null; becomeGuest(c, k, m); }
  });
  c.on('close', () => { if (NET.hostConn === c && tok === netToken) hostLost(); });
}
function netClaim(k) {
  const tok = netToken;
  NET.phase = 'claim';
  try { NET.peer.destroy(); } catch (e) {}
  roomUi('방 만드는 중', (k + 1) + '번 방을 열고 있어요');
  let p; try { p = newPeer(NET_PREFIX + k); } catch (e) { return netFallback('온라인에 연결할 수 없어요.'); }
  NET.peer = p; keepAlive(p);
  const to = setTimeout(() => { if (tok === netToken && NET.phase === 'claim') netFallback('방을 열지 못했어요.'); }, 7000);
  p.on('open', () => { if (tok !== netToken) return; clearTimeout(to); becomeHost(k); });
  p.on('error', e => {
    if (tok !== netToken) return;
    if (e.type === 'unavailable-id' && NET.phase === 'claim') { clearTimeout(to); try { p.destroy(); } catch (er) {} if (++netClaimTries > 3) return netFallback('방을 열지 못했어요.'); netToken++; return netSearch(); }      // someone opened it a moment ago: look again
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
function hostAccept(c, tok) {
  c.on('data', m => {
    if (tok !== netToken || !m) return;
    if (m.t === 'hello') {
      if (NET.phase !== 'wait' || NET.members.length + 1 >= MAX_PLAYERS || !HEROES[m.hero]) { try { c.send({ t: 'busy' }); } catch (e) {} setTimeout(() => { try { c.close(); } catch (e) {} }, 500); return; }
      const mem = { conn: c, hero: m.hero, lo: Array.isArray(m.lo) ? m.lo : null, name: cleanName(m.name) || '게스트', cos: cleanCos(m.cos, m.hero), f: null, fi: -1, heard: performance.now() };
      NET.members.push(mem); NET.conns.push(c);
      c.send({ t: 'welcome', room: NET.room });
      hostLobby();
      if (NET.members.length + 1 >= MAX_PLAYERS) hostStart();
    } else if (m.t === 'in' || m.t === 'ping') {
      const mem = NET.members.find(x => x.conn === c); if (mem) mem.heard = performance.now();
      if (m.t === 'ping' || !mem || !mem.f) return;
      const o = mem.f.netIn;
      mem.f.netIn = Object.assign({}, m, o ? { pf: m.pf || o.pf, ult: m.ult || o.ult, dash: m.dash || o.dash, sk: [!!(m.sk && m.sk[0]) || !!(o.sk && o.sk[0]), !!(m.sk && m.sk[1]) || !!(o.sk && o.sk[1])] } : null);
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
    if (NET.phase === 'wait') hostLobby();
    NET.rec = NET.members.length > 0 && state === 'play';
}
function hostLobby() {
  const left = Math.max(0, Math.ceil((NET.waitEnd - performance.now()) / 1000)), n = NET.members.length + 1;
  roomUi('방 대기 중', n + ' / ' + MAX_PLAYERS + '명 · ' + left + '초 뒤에 시작해요. 빈자리는 봇이 채워요.', n, left);
  for (const m of NET.members) try { m.conn.send({ t: 'lobby', n, left }); } catch (e) {}
}
function hostStart() {
  if (NET.phase !== 'wait') return;
  NET.phase = 'play';
  const humans = [{ hero: chosen, lo: loadoutOf(chosen), local: true, cos: myCos(chosen), name: PROF.name }].concat(NET.members.map(m => ({ hero: m.hero, lo: m.lo, remote: m, cos: m.cos, name: m.name })));
  startMatch(humans);
  if (!NET.members.length) { const p = NET.peer; NET.peer = null; NET.role = null; NET.phase = 'idle'; try { p.destroy(); } catch (e) {} return; }      // nobody came: the room closes, the match is offline
  NET.rec = true; NET.evs = []; snapAcc = 0; mapSentVer = -1;
  const roster = fighters.map(f => ({ nm: f.nick, cos: f.cos, hu: f.human ? 1 : 0 }));
  for (const m of NET.members) try { m.conn.send({ t: 'start', you: m.fi, team: m.f.team, map: curMap, roster }); } catch (e) {}
}
const r1 = v => Math.round(v * 10) / 10, r2 = v => Math.round(v * 100) / 100;
function cdInfo(p) {
  if (p.net) return p.net;
  return { u: r1(Math.max(0, p.ucd)), uM: r1(ULT_CD * (p.h.cdMul ? p.h.cdMul(p) : 1)), d: r1(Math.max(0, p.dcd)), dM: r1(dashCdOf(p)) || 1,
    sk: [0, 1].map(i => p.sk[i] ? p.sk[i].n : 0), s: [0, 1].map(i => r1(Math.max(0, p.scd[i]))), sM: [0, 1].map(i => p.sk[i] ? r1(skillCd(p, i)) : 1), sn: [0, 1].map(i => p.sk[i] ? nameOf(p.sk[i], p) : '-'), un: p.h.ult.name };
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
  NET.evs = [];
  const now = performance.now();
  if (NET.mapVer !== mapSentVer || now - mapSentAt > 2000) { s.mr = MAP.map(r => r.join('')); mapSentVer = NET.mapVer; mapSentAt = now; }
  for (const m of NET.members) try { if (m.conn.open) m.conn.send(s); } catch (e) {}
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
  Object.assign(NET, { role: 'guest', hostConn: c, room: k, phase: 'joined' });
  roomUi('방에 들어왔어요', (k + 1) + '번 방 · 방장이 경기를 시작하기를 기다리고 있어요');
}
function guestMsg(m) {
  NET.heard = performance.now();
  if (m.t === 'lobby' && NET.phase === 'joined') roomUi('방에 들어왔어요', m.n + ' / ' + MAX_PLAYERS + '명 · ' + m.left + '초 뒤에 시작해요. 빈자리는 봇이 채워요.', m.n, m.left);
  else if (m.t === 'start') guestStart(m);
  else if (m.t === 's' && state === 'play' && NET.phase === 'play') applySnap(m);
  else if (m.t === 'over' && NET.phase === 'play') { if (m.e) replayEvents(m.e); score = m.sc; NET.stats = m.st; NET.phase = 'over'; endGame(); const tok = netToken; setTimeout(() => { if (tok === netToken) netReset(); }, 300); }
}
function hostLost() {
  const was = NET.phase; netReset();
  if (was === 'play' && state === 'play') { state = 'over'; notice.hidden = false; notice.textContent = '방장이 나가서 경기가 끝났어요'; setTimeout(() => { if (state === 'over' && !NET.role) toMenu(); }, 2200); }
  else if (was === 'joined') { netSearch(); }
}
function guestStart(m) {
  NET.phase = 'play'; NET.me = m.you; VIEW = m.team; NET.roster = Array.isArray(m.roster) ? m.roster : [];
  loadMap(m.map);
  fighters = []; bullets = []; parts = []; texts = []; rings = []; zones = []; minions = []; timers = []; strikes = []; tempWalls.clear();
  score = [0, 0]; timeLeft = MATCH_TIME; player = null; inAcc = 0; netOut = null;
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
    f.nx = d.x; f.ny = d.y; f.na = d.a; if (!me) f.aim = f.aim == null ? d.a : f.aim;
    f.hp = d.hp; f.mhp = d.mh; f.dead = !!d.d; f.respawnT = d.rt; f.form = d.fm || null; f.ghost = f.form === 'gone' || f.form === 'sub' || f.form === 'spirit';
    f.swing = d.sw; f.spin = d.sp; f.shield = d.sh; f.inv = d.iv ? .1 : 0; f.kos = d.k; f.deaths = d.de;
    f.lastFire = time - d.lf; f.lastHit = time - d.lh;
    f.b = {}; NET_BUFFS.forEach((k, j) => { if (d.bb & (1 << j)) f.b[k] = { t: 1, v: k === 'charm' ? { team: 1 - d.tm } : 1 }; });
    const st = d.st; f.st = { hat: st.hat ? { x: st.hat[0], y: st.hat[1] } : null, orb: st.orb ? { n: st.orb, t: 1 } : null, dr: st.dr, fsh: st.fsh ? { hp: 1 } : null, neck: st.nk != null ? time - st.nk : 0, morph: st.morph ? 1 : null, th: st.th, mk: st.mk };
    for (const k of ['g', 'chip', 'stack', 'pz', 'over', 'heat', 'pn']) f.st[k] = st[k] || 0;
    f.net = d.cd || null;
    if (d.cd) { f.sk = (d.cd.sk || []).map(k => f.h.skills.find(x => x.n === k) || null); f.ucd = d.cd.u; f.dcd = d.cd.d; f.scd = d.cd.s.slice(); }
    if (d.em) { f.em = d.em[0]; f.emT = time + d.em[1]; } else f.emT = 0;
  });
  fighters.length = s.f.length;
  for (const f of fighters) { f.st.thread = f.st.th >= 0 ? fighters[f.st.th] : null; f.st.mark = f.st.mk >= 0 ? fighters[f.st.mk] : null; }
  bullets = s.b.map(b => ({ x: b[0], y: b[1], vx: b[2], vy: b[3], ang: b[4], shape: b[5], team: b[6], r: b[7], wid: b[8] || null }));
  zones = s.z.map(z => ({ x: z[0], y: z[1], r: z[2], t: z[3], col: z[4], op: z[5], kind: z[6] || null, key: z[7] ? 'k' : null, team: z[8], hidden: !!z[9] }));
  minions = s.m.map(m => ({ minion: true, kind: m[0], x: m[1], y: m[2], team: m[3], hp: m[4], max: m[5], hit: !!m[6], aim: m[7], a: m[7], sw: time - m[8], side: m[9], b: {}, dead: false, bob: time * 8 }));
  strikes = s.k.map(k => ({ x: k[0], y: k[1], r: k[2], t: k[3], max: k[4], col: k[5] }));
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
function guestStep(dt) {
  time += dt; timeLeft = Math.max(0, timeLeft - dt);
  const k = Math.min(1, dt * 14);
  for (const f of fighters) {
    if (!f || f.dead) continue;
    const px = f.x, py = f.y;
    f.x += (f.nx - f.x) * k; f.y += (f.ny - f.y) * k;
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
  if (inAcc >= IN_DT && NET.hostConn && NET.hostConn.open) {
    inAcc = 0;
    const o = netOut; netOut = null;
    try { NET.hostConn.send({ t: 'in', mx: r2(o.mx), my: r2(o.my), aim: r2(o.aim), tx: Math.round(o.tx), ty: Math.round(o.ty), hold: o.hold, touch: o.touch, aiming: o.aiming, pf: o.pf, ult: o.ult, dash: o.dash, sk: o.sk, np: o.np, manual: o.manual }); } catch (e) {}
  }
}

/* called every frame */
let pingAcc = 0;
function netTick(dt) {
  const now = performance.now();
  if (NET.role === 'host') for (const m of NET.members.slice()) if (now - (m.heard || now) > 6000) hostDrop(m.conn, netToken);      // nothing from a guest for 6 s: gone
  if (NET.role === 'guest' && NET.hostConn) {
    if ((pingAcc += dt) > 1) { pingAcc = 0; try { NET.hostConn.send({ t: 'ping' }); } catch (e) {} }
    if (NET.phase === 'play' && NET.heard && now - NET.heard > 5000) hostLost();       // no snapshot for 5 s: the host is gone
    if (NET.phase === 'joined') { if (!NET.heard) NET.heard = now; if (now - NET.heard > 8000) hostLost(); }
  }
  if (NET.role === 'host' && NET.phase === 'wait') {
    const left = (NET.waitEnd - performance.now()) / 1000;
    if (Math.ceil(left) !== netTick.last) { netTick.last = Math.ceil(left); hostLobby(); }
    if (left <= 0) hostStart();
  }
  if (NET.role === 'host' && NET.phase === 'play' && state === 'play' && NET.members.length) {
    snapAcc += dt;
    if (snapAcc >= SNAP_DT) { snapAcc = 0; hostSnap(); }
  }
}
