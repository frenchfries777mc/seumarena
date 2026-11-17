/* ---------- 랭크전 (user 2026-11-17): 1대1 듀얼 배틀 규칙, 로그인 + 레벨 10, 봇 없음, 오라클 서버 방에서만 (점수는 서버가 Supabase에 기록).
   Tiers use the mastery names without 아메시스트 (user's list): 브론즈 · 실버 · 골드 · 플래티넘 · 다이아 I-III, 마스터 · 그랜드마스터 I-V, 챔피언. 100 points a step.
   Before the match each player bans one character for the other, then picks three (draft screen below). Points: supabase/seumarena-guild-rank.sql.
   Placeholders (user may change): rewards per tier (RK_REWARD), ban 15 s / pick 25 s, matching range 150 points + 100 every 15 s. ---------- */
const SB_URL = 'https://kebsbuvuutilitwlvxzv.supabase.co', SB_KEY = 'sb_publishable_4Egu0zm3p6cxWGvP_-GlIw_mlCpO1Nf';
async function sbTok() {
  try { const A = window.FFAuth, sb = A && A.client && A.client(); if (!sb || !sb.auth) return ''; const r = await sb.auth.getSession(); return (r && r.data && r.data.session && r.data.session.access_token) || ''; } catch (e) { return ''; }
}
/* a database function call; anon = without the account (public lists). Resolves to the JSON it returns, or null when it could not be reached */
async function sbRpc(fn, args, anon) {
  try {
    const t = anon ? '' : await sbTok(); if (!anon && !t) return null;
    let ctl = null; try { ctl = new AbortController(); setTimeout(() => ctl.abort(), 10000); } catch (e) { quietErr(e); }
    const r = await fetch(SB_URL + '/rest/v1/rpc/' + fn, { method: 'POST', cache: 'no-store', signal: ctl ? ctl.signal : undefined, body: JSON.stringify(args || {}),
      headers: { apikey: SB_KEY, Authorization: 'Bearer ' + (t || SB_KEY), 'Content-Type': 'application/json' } });
    if (!r.ok) return null; return await r.json();
  } catch (e) { return null; }
}
const signedIn = () => { try { const A = window.FFAuth, u = A && A.user && A.user(); return !!(u && u.id); } catch (e) { return false; } };

/* tiers */
const RK_TIERS = MS_TIERS.filter(t => t[0] !== '아메시스트'), RK_SLOTS = [];
RK_TIERS.forEach(([nm, n, col], g) => { for (let i = 0; i < n; i++) RK_SLOTS.push({ name: n > 1 ? nm + ' ' + ['I', 'II', 'III', 'IV', 'V'][i] : nm, col, g }); });
const RK_STEP = 100, RK_TOP = RK_SLOTS.length - 1;      // 25 = 챔피언 (no ceiling; the board ranks it)
function rankOf(rp) { rp = Math.max(0, rp | 0); const i = Math.min(RK_TOP, Math.floor(rp / RK_STEP)), top = i === RK_TOP; return Object.assign({ i, rp, into: top ? rp - RK_TOP * RK_STEP : rp - i * RK_STEP, top }, RK_SLOTS[i]); }
const rkMsIndex = i => { let k = 0; for (const t of MS_TIERS) { if (t[0] === '아메시스트') { if (i >= k) i += t[1]; } k += t[1]; } return i; };      // the mastery shield of the same name
function drawRankLogo(cv, i) { drawMasteryLogo(cv, rkMsIndex(Math.max(0, Math.min(RK_TOP, i | 0)))); }
/* first reach of a tier group this season (placeholder amounts): 실버 .. 챔피언 */
const RK_REWARD = { 1: [['g', 300]], 2: [['g', 500], ['cr', 30]], 3: [['g', 800], ['cr', 50]], 4: [['ebox', 1], ['cr', 80]], 5: [['ebox', 1], ['g', 1000], ['cr', 150]], 6: [['ebox', 2], ['cr', 200]], 7: [['ebox', 3], ['g', 2000], ['cr', 300]] };

const RK = { ok: false, rp: 0, peak: 0, pos: 0, ban: 0, banAt: 0, games: 0, wins: 0, last: null, lastPeak: null, busy: false, at: 0 };
async function rankLoad() {
  if (!signedIn() || RK.busy) return RK;
  RK.busy = true;
  try {
    const r = await sbRpc('seumarena_rank_me', { p_season: GAME_VER, p_nick: PROF.name || '' });
    if (r && r.r === 'ok') { Object.assign(RK, { ok: true, rp: r.rp | 0, peak: r.peak | 0, pos: r.pos | 0, ban: r.ban | 0, banAt: performance.now(), games: r.games | 0, wins: r.wins | 0, last: r.last_season || null, lastPeak: r.last_peak, at: Date.now() }); rankRewards(); }
  } finally { RK.busy = false; }
  if (state === 'menu') try { updatePick(); } catch (e) { quietErr(e); }
  return RK;
}
function rankRewards() {
  const g = rankOf(RK.peak).g; if (!Array.isArray(COS.rkr)) COS.rkr = [];
  let gave = false;
  for (let k = 1; k <= g; k++) { const key = GAME_VER + ':' + k; if (COS.rkr.includes(key) || !RK_REWARD[k]) continue; COS.rkr.push(key); gave = true; for (const [kind, n] of RK_REWARD[k]) { const got = giveReward(kind, n); got.why = RK_TIERS[k][0] + ' 달성'; rewardFx(got); } }
  if (gave) { saveCos(); goldUi(); }
}
const rankBanLeft = () => Math.max(0, RK.ban - (performance.now() - RK.banAt) / 1000);
function rankBlock() {
  if (!signedIn()) return '로그인 필요';
  if (levelOf().lv < 10) return 'LV 10부터';
  if (!RK.ok) return '불러오는 중';
  const b = rankBanLeft(); if (b > 0) return Math.ceil(b / 60) + '분 금지';
  return '';
}
/* tail.js hooks: which online-only modes can be played, and why not */
/* still finding out (the account script or the points have not answered yet): count as open, so a saved 랭크전 choice is not lost on reload; the start button checks again */
const rankPending = () => (!window.FFAuth && performance.now() < 15000) || (signedIn() && levelOf().lv >= 10 && !RK.ok && !rankBanLeft());
function modeExtraOk(m) { return m.id === 'rank' ? !rankBlock() || rankPending() : m.id === 'gw' ? !gwBlock() || gwPending() : true; }
function modeLockText(m) { return m.id === 'rank' ? rankBlock() : m.id === 'gw' ? (gwDayNow() ? gwBlock() : '') : ''; }      // '' = not shown (길드 대항전 on other days)
function onlineModeBlock(id) { return id === 'rank' ? rankBlock() : id === 'gw' ? gwBlock() : ''; }
function modeChipExtra(m) {
  if (m.id === 'rank') { const t = rankOf(RK.rp); $('modeChipMeta').textContent = RK.ok ? t.name + ' · ' + (t.top ? RK.rp + '점' : t.into + '/' + RK_STEP) : '불러오는 중'; $('modeChipMeta').style.color = RK.ok ? t.col : ''; }
  else if (m.id === 'gw') { $('modeChipMeta').textContent = '표 ' + Math.max(0, GW.left | 0) + '/4 · 우리 길드 ' + gwMyPts() + '점'; $('modeChipMeta').style.color = ''; }
  else $('modeChipMeta').style.color = '';
}

/* match making (net.js): what a ranked player tells the room, what a room tells a searcher, which room to take */
function netRankHello() {
  if (NET.mode === 'rank') return { tok: MYFR.tok, rp: RK.rp | 0 };
  return { tok: MYFR.tok, g: GUILD.g ? GUILD.g.id : 0, grp: GW.gnum == null ? -1 : GW.gnum };
}
function netRankInfo() {
  const now = performance.now();
  if (NET.mode === 'rank') { const m = NET.members[0]; return m ? { rp: m.rp, rw: Math.round((now - m.at) / 1000) } : {}; }
  return { gs: NET.members.map(m => [m.g, m.grp]) };
}
const rkRange = sec => 150 + 100 * Math.floor(sec / 15);
/* -2 = nobody near enough yet (look again), -1 = no preference, else the room */
function netRankPick(R) {
  const waited = (performance.now() - (NET.t0 || performance.now())) / 1000, av = R.map((r, k) => [r, k]).filter(([r]) => r.s === 'avail');
  if (!av.length) return -1;
  if (NET.mode === 'rank') {
    const full = av.filter(([r]) => r.n >= 1), near = full.filter(([r]) => Math.abs((r.rp | 0) - RK.rp) <= rkRange(Math.max(waited, r.rw | 0))).sort((a, b) => Math.abs(a[0].rp - RK.rp) - Math.abs(b[0].rp - RK.rp));
    if (near.length) return near[0][1];
    if (full.length) return -2;      // someone waits but is far in points: wait until the range opens instead of sitting alone in another room
    return av[0][1];
  }
  if (waited >= 20) return -1;      // 길드 대항전: after 20 s anyone
  const g = GUILD.g ? GUILD.g.id : 0, sc = r => (r.gs || []).some(x => x[1] === GW.gnum && x[0] !== g) ? 2 : (r.gs || []).some(x => x[1] === GW.gnum) ? 1 : 0;
  const best = av.slice().sort((a, b) => sc(b[0]) - sc(a[0]) || b[0].n - a[0].n)[0];
  if (sc(best[0]) > 0) return best[1];
  const empty = av.find(([r]) => !r.n); return empty ? empty[1] : -1;
}
function netWaitText() {
  const s = Math.max(0, Math.floor((performance.now() - (NET.t0 || performance.now())) / 1000)), t = Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  return NET.mode === 'rank' ? '비슷한 점수의 상대를 찾고 있어요 · ' + t + ' (봇 없음)' : '같은 조 길드원을 먼저 찾고 있어요 · ' + t;
}

/* ---------- draft (host side, in the server room): ban 15 s, then pick 25 s ---------- */
const RK_BAN_S = 15, RK_PICK_S = 25;
function rankDraftStart() {
  if (NET.members.length < 2 || NET.draft) return;
  NET.draft = { step: 'ban', until: performance.now() + RK_BAN_S * 1000 };
  for (const m of NET.members) { m.ban = null; m.picked = false; }
  rankDraftSend();
}
function rankDraftSend() {
  const d = NET.draft; if (!d) return;
  const left = Math.max(0, Math.round((d.until - performance.now()) / 1000));
  for (const m of NET.members) {
    const o = NET.members.find(x => x !== m);
    try { m.conn.send({ t: 'draft', step: d.step, left, opp: o ? { name: o.name, rp: o.rp | 0 } : null, ban: d.step === 'pick' && o ? o.ban : null, mine: m.ban }); } catch (e) { quietErr(e); }
  }
}
function rankDraftIn(mem, m) {
  const d = NET.draft; if (!d) return;
  if (m.t === 'ban' && d.step === 'ban' && typeof m.hero === 'string' && HEROES[m.hero]) { mem.ban = m.hero; if (NET.members.every(x => x.ban)) rankToPick(); }
  else if (m.t === 'pick' && d.step === 'pick' && Array.isArray(m.line)) {
    const o = NET.members.find(x => x !== mem), no = o && o.ban, seen = new Set();
    mem.line = m.line.slice(0, DUEL_N).map(e => e && typeof e.hero === 'string' && HEROES[e.hero] && e.hero !== no && !seen.has(e.hero) && seen.add(e.hero) ? { hero: e.hero, lo: Array.isArray(e.lo) ? e.lo.slice(0, 2) : null, cos: cleanCos(e.cos, e.hero) } : null).filter(Boolean);
    mem.picked = true; if (NET.members.every(x => x.picked)) rankDraftEnd();
  }
}
function rankToPick() { NET.draft = { step: 'pick', until: performance.now() + RK_PICK_S * 1000 }; rankDraftSend(); }
function rankDraftEnd() {
  for (const m of NET.members) {      // anything missing is filled: the player's own lobby line first, then random characters
    const o = NET.members.find(x => x !== m), no = o && o.ban, seen = new Set(), ok = id => HEROES[id] && id !== no && !seen.has(id) && seen.add(id);
    const line = (m.line || []).filter(e => e && ok(e.hero));
    for (const e of [{ hero: m.hero, lo: m.lo, cos: m.cos }].concat(m.line0 || [])) if (line.length < DUEL_N && e && ok(e.hero)) line.push(e);
    const rest = Object.keys(HEROES).filter(id => !seen.has(id) && id !== no);
    while (line.length < DUEL_N && rest.length) { const id = rest.splice(Math.floor(Math.random() * rest.length), 1)[0]; seen.add(id); line.push({ hero: id, lo: null, cos: cleanCos(null, id) }); }
    m.line = line; m.hero = line[0].hero; m.lo = line[0].lo; m.cos = line[0].cos;
  }
  NET.draft = null; hostStart();
}
function rankDraftTick() {
  const d = NET.draft; if (!d) return;
  if (NET.members.length < 2) { NET.draft = null; return; }
  if (performance.now() > d.until) { if (d.step === 'ban') rankToPick(); else rankDraftEnd(); return; }
  const left = Math.ceil((d.until - performance.now()) / 1000); if (left !== d.sent) { d.sent = left; rankDraftSend(); }
}
/* someone left: before the match the other one waits for a new opponent; in the match 20 s to come back, else the match is lost */
function rankDropped(mem) {
  if (NET.draft || NET.phase === 'wait') { NET.draft = null; for (const m of NET.members) { try { m.conn.send({ t: 'draft', step: 'cancel' }); } catch (e) { quietErr(e); } m.ban = null; m.picked = false; m.line = m.line0 || m.line; } return; }
  if (NET.phase === 'play' && state === 'play') NET.rkDrop = { mem, at: performance.now() };
}
function rankPlayTick() {
  const d = NET.rkDrop; if (!d || state !== 'play') return;
  if (NET.members.includes(d.mem)) { NET.rkDrop = null; return; }      // came back
  if (performance.now() - d.at < 20000 || !d.mem.f) return;
  NET.rkDrop = null; NET.rkLeaver = d.mem;
  const w = 1 - d.mem.f.team; score[w] = Math.max(score[w] | 0, modeNow().win);
  for (const f of fighters) if (!f.dead && f.team === w) say(f, '상대가 나갔어요 · 승리!', '#ffd34d');
  endGame();
}
/* what the server records (net.js hostEnd -> __sad.status().res -> sa-host.js) */
function rankResult() {
  const all = NET.members.concat((NET.gone || []).map(g => g.mem)).filter((m, i, a) => m && m.tok && m.f && a.indexOf(m) === i);
  const win = score[0] > score[1] ? 0 : score[1] > score[0] ? 1 : -1;
  return { mode: NET.mode, season: GAME_VER, win, players: all.map(m => ({ tok: m.tok, team: m.f.team, nick: cleanName(m.name).replace(/^\[[^\]]*\]\s*/, ''), left: m === NET.rkLeaver || !NET.members.includes(m) ? 1 : 0 })) };
}

/* ---------- draft screen (player side) ---------- */
let RKD = null;
function rankDraftHide() { const o = $('rkDraft'); if (o) o.hidden = true; clearInterval(RKD && RKD.iv); RKD = null; }
function rankDraftUi(m) {
  if (m.step === 'cancel') { rankDraftHide(); roomUi('상대를 찾는 중', '상대가 나갔어요. 새 상대를 찾고 있어요.'); return; }
  let o = $('rkDraft');
  if (!o) { o = document.createElement('div'); o.id = 'rkDraft'; document.body.append(o); }
  const same = RKD && RKD.step === m.step;
  if (same) { RKD.until = performance.now() + (m.left | 0) * 1000; return; }
  clearInterval(RKD && RKD.iv);
  RKD = { step: m.step, until: performance.now() + (m.left | 0) * 1000, sel: m.step === 'pick' ? duelIds().filter(id => id && HEROES[id] && id !== m.ban).slice(0, DUEL_N) : [], ban: m.ban, sent: false, iv: 0 };
  o.hidden = false; o.textContent = '';
  const el = (t, c, x) => { const e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; };
  const head = el('div', 'rkdHead'), opp = m.opp ? rankOf(m.opp.rp) : null;
  head.append(el('b', 'rkdT', m.step === 'ban' ? '상대가 못 쓸 캐릭터 1명' : '내 캐릭터 3명 (1번부터 나가요)'), el('span', 'rkdTime', ''));
  const vs = el('div', 'rkdVs'); if (m.opp) { const n = el('b', '', m.opp.name || '상대'), t = el('small', '', opp.name); t.style.color = opp.col; vs.append('상대 ', n, t); }
  if (m.step === 'pick' && m.ban) vs.append(el('span', 'rkdBan', '못 씀: ' + HEROES[m.ban].name));
  const grid = el('div', 'rkdGrid'), btn = el('button', 'btn-primary rkdGo', m.step === 'ban' ? '금지하기' : '확정'); btn.type = 'button';
  const cards = {};
  for (const id of ROSTER) {
    const b = el('button', 'rkdCard'), cv = el('canvas'); b.type = 'button'; drawIcon(cv, id); b.append(cv, el('span', '', HEROES[id].name), el('i', 'rkdNo'));
    if (m.step === 'pick' && id === m.ban) { b.disabled = true; b.classList.add('out'); }
    b.addEventListener('click', () => {
      if (RKD.sent) return;
      if (RKD.step === 'ban') RKD.sel = [id];
      else { const k = RKD.sel.indexOf(id); if (k >= 0) RKD.sel.splice(k, 1); else if (RKD.sel.length < DUEL_N) RKD.sel.push(id); }
      mark();
    });
    cards[id] = b; grid.append(b);
  }
  function mark() {
    for (const id in cards) { const k = RKD.sel.indexOf(id); cards[id].classList.toggle('on', k >= 0); cards[id].querySelector('.rkdNo').textContent = k >= 0 ? (RKD.step === 'ban' ? '✕' : k + 1) : ''; }
    btn.disabled = RKD.sent || (RKD.step === 'ban' ? RKD.sel.length !== 1 : !RKD.sel.length);
    btn.textContent = RKD.sent ? '상대를 기다리는 중' : RKD.step === 'ban' ? '금지하기' : '확정 (' + RKD.sel.length + '/' + DUEL_N + ')';
  }
  btn.addEventListener('click', () => {
    if (RKD.sent || !NET.hostConn) return; RKD.sent = true;
    try { NET.hostConn.send(RKD.step === 'ban' ? { t: 'ban', hero: RKD.sel[0] } : { t: 'pick', line: RKD.sel.map(id => ({ hero: id, lo: loadoutOf(id), cos: myCos(id) })) }); } catch (e) { quietErr(e); }
    mark();
  });
  o.append(head, vs, grid, btn); mark();
  const tick = () => { if (!RKD) return; const s = Math.max(0, Math.ceil((RKD.until - performance.now()) / 1000)); o.querySelector('.rkdTime').textContent = s + '초'; };
  tick(); RKD.iv = setInterval(tick, 250);
}

/* ---------- after a ranked / guild war match: the new points from the server ---------- */
function rankAfter() {
  const box = $('rkGain'); if (!box) return;
  if (curMode !== 'rank' && curMode !== 'gw') { box.hidden = true; return; }
  if (NET.role !== 'guest') { box.hidden = true; return; }      // an online match (players are always guests of a server room)
  box.hidden = false; box.textContent = curMode === 'rank' ? '랭크 점수 계산 중…' : '대항전 점수 계산 중…';
  const g0 = RK.games, rp0 = RK.rp, t0 = rankOf(rp0), pts0 = gwMyPts(), left0 = GW.left; let n = 0;
  const poll = async () => {
    n++;
    if (curMode === 'rank') {
      await rankLoad();
      if (RK.games !== g0) {
        const d = RK.rp - rp0, t1 = rankOf(RK.rp); box.textContent = '';
        const cv = document.createElement('canvas'); drawRankLogo(cv, t1.i); const tx = document.createElement('span'), b = document.createElement('b');
        b.textContent = (d >= 0 ? '+' : '') + d; b.style.color = d >= 0 ? '#7dffb0' : '#ff8a8a'; tx.append('랭크 ', b, ' · ' + t1.name + (t1.top ? ' · ' + RK.rp + '점' : ' · ' + t1.into + '/' + RK_STEP));
        if (t1.i !== t0.i) { const up = document.createElement('em'); up.textContent = t1.i > t0.i ? ' ▲ 승급!' : ' ▼ 강등'; up.style.color = t1.i > t0.i ? t1.col : '#ff8a8a'; tx.append(up); }
        box.append(cv, tx); return;
      }
    } else {
      await gwLoad();
      if (GW.left !== left0 || gwMyPts() !== pts0) { const d = gwMyPts() - pts0; box.textContent = '대항전 +' + Math.max(0, d) + '점 · 오늘 남은 표 ' + Math.max(0, GW.left) + '장'; return; }
    }
    if (n < 10) setTimeout(poll, 2000); else box.textContent = '점수가 아직 안 들어왔어요 (서버 확인 중)';
  };
  setTimeout(poll, 1500);
}

/* ---------- page setup (after tail.js has run) ---------- */
Promise.resolve().then(() => {
  const css = document.createElement('style');
  css.textContent = `
#rkDraft{position:fixed;inset:0;z-index:70;display:flex;flex-direction:column;gap:10px;padding:max(12px,env(safe-area-inset-top,0px)) max(14px,env(safe-area-inset-right,0px)) max(12px,env(safe-area-inset-bottom,0px)) max(14px,env(safe-area-inset-left,0px));box-sizing:border-box;background:radial-gradient(80% 60% at 50% 30%,#4a3a10 0,transparent 60%),#10141f;color:#eef2ff;font-family:'IBM Plex Sans KR',sans-serif}
#rkDraft[hidden]{display:none}
#rkDraft .rkdHead{display:flex;align-items:center;gap:12px}
#rkDraft .rkdT{font:400 24px 'Black Han Sans','IBM Plex Sans KR',sans-serif;text-shadow:0 3px 0 #000;flex:1}
#rkDraft .rkdTime{font:900 22px 'IBM Plex Sans KR',sans-serif;color:#ffcc33;min-width:56px;text-align:right}
#rkDraft .rkdVs{display:flex;align-items:center;gap:8px;font-size:14px;color:#c8cfe4;flex-wrap:wrap}
#rkDraft .rkdVs b{color:#fff}#rkDraft .rkdVs small{font-weight:700}
#rkDraft .rkdBan{margin-left:auto;padding:2px 10px;border-radius:10px;background:#5a1520;color:#ffb3b3;font-weight:700}
#rkDraft .rkdGrid{flex:1;min-height:0;overflow:auto;display:grid;grid-template-columns:repeat(auto-fill,minmax(86px,1fr));gap:8px;align-content:start}
#rkDraft .rkdCard{position:relative;display:flex;flex-direction:column;align-items:center;gap:2px;padding:6px 4px;border-radius:12px;border:2px solid #2c3656;background:#1a2136;color:#eef2ff;font:700 12px 'IBM Plex Sans KR',sans-serif;cursor:pointer}
#rkDraft .rkdCard canvas{width:52px;height:52px}
#rkDraft .rkdCard.on{border-color:#ffcc33;background:#3a2e0e}
#rkDraft .rkdCard.out{opacity:.3;cursor:not-allowed}
#rkDraft .rkdNo{position:absolute;top:4px;right:6px;font:900 16px 'IBM Plex Sans KR',sans-serif;font-style:normal;color:#ffcc33}
#rkDraft .rkdGo{align-self:center;min-width:240px;margin:0}
#rkGain{display:flex;align-items:center;justify-content:center;gap:8px;margin:4px 0;font:700 15px 'IBM Plex Sans KR',sans-serif;color:#eef2ff}
#rkGain[hidden]{display:none}#rkGain canvas{width:30px;height:30px}#rkGain em{font-style:normal;font-weight:900}
@media (max-height:520px){#rkDraft .rkdGrid{grid-template-columns:repeat(auto-fill,minmax(70px,1fr));gap:6px}#rkDraft .rkdCard canvas{width:40px;height:40px}#rkDraft .rkdT{font-size:19px}}`;
  document.head.append(css);
  { const g = $('goldGain'); if (g && !$('rkGain')) { const b = document.createElement('div'); b.id = 'rkGain'; b.hidden = true; g.parentNode.insertBefore(b, g); } }
  { const base = endGame; endGame = function (keep) { const r = base.apply(this, arguments); try { if (keep !== true) rankAfter(); } catch (e) { quietErr(e); } return r; }; }      // the ranked line on the result screen
  { const sa = syncAccount; syncAccount = function () { const r = sa.apply(this, arguments); setTimeout(() => { rankLoad(); if (typeof guildLoad === 'function') guildLoad(); }, 400); return r; }; }      // signed in / name changed: points and guild
  setInterval(() => { if (state === 'menu' && signedIn() && Date.now() - RK.at > 60000) rankLoad(); }, 15000);
});
