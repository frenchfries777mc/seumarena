/* ---------- 길드 (user 2026-11-17): 최대 50명, 채팅, [태그], 길드 순위, 길드 대항전. Lobby button: PC = end of the top row (B), phone = every top button in one bottom row (C).
   Everything lives in Supabase (supabase/seumarena-guild-rank.sql), only through its functions. Signed-in players only.
   Placeholders (user may change): cost 1,000 gold, level 8, war rewards (GW_REWARD). ---------- */
const GUILD = { g: null, role: 0, members: [], reqs: [], myReqs: [], loaded: false, busy: false, lastChat: 0, seen: 0, unread: 0 };
const GW = { left: 0, gnum: null, grp: null, day: false, league: 0, off: false, claim: null, week: 0 };
const G_COST = 1000, G_LV = 8, G_MAX = 50;
const G_COLS = ['#ff5d5d', '#ff9a3d', '#ffd34d', '#5fd36a', '#3ddbb4', '#4d9dff', '#b48cff', '#ff7ab8'];
const G_LEAGUES = [['브론즈', '#c8803a'], ['실버', '#c0c8d4'], ['골드', '#ffd34d'], ['다이아', '#6fb8ff'], ['챔피언', '#fff3b0']];
const G_JOIN = ['누구나', '승인 후', '초대만'];
const G_ROLE = ['멤버', '부길드장', '길드장'];
/* war rewards by place in the group (placeholder): crystals grow with the league, 1st also gets an epic box */
const GW_REWARD = (place, league) => { const r = [['cr', [40, 30, 20, 10, 10][Math.max(0, Math.min(4, place - 1))] + 20 * league]]; if (place === 1) r.push(['ebox', 1]); else if (place === 2 && league >= 2) r.push(['box', 2]); return r; };
/* 12 logo shapes (24x24), filled with the guild colour */
const G_SHAPES = [
  'M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5z', 'M12 2l9 4-2 10-7 6-7-6-2-10z', 'M4 3h16v9c0 5-4 8-8 10-4-2-8-5-8-10z', 'M12 2l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z',
  'M12 2a10 10 0 1 0 .01 0z', 'M12 2l10 10-10 10L2 12z', 'M5 2h14l3 6-10 14L2 8z', 'M12 3c4 0 8 2 8 6 0 6-8 12-8 12S4 15 4 9c0-4 4-6 8-6z',
  'M3 4l4 3 5-5 5 5 4-3-2 14H5z', 'M12 2l9 5v10l-9 5-9-5V7z', 'M12 2c2 4 6 5 9 5-1 8-4 12-9 15-5-3-8-7-9-15 3 0 7-1 9-5z', 'M2 6l10-4 10 4-3 12-7 4-7-4z'];
function guildLogo(logo, color, size, border) {
  const NS = 'http://www.w3.org/2000/svg', s = document.createElementNS(NS, 'svg'), c = G_COLS[color | 0] || G_COLS[0];
  s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('width', size); s.setAttribute('height', size); s.setAttribute('class', 'gLogo' + (border ? ' gold' : ''));
  s.innerHTML = '<path d="' + (G_SHAPES[logo | 0] || G_SHAPES[0]) + '" fill="' + c + '"/><path d="' + (G_SHAPES[logo | 0] || G_SHAPES[0]) + '" fill="#000" opacity=".22" transform="translate(12 12) scale(.62) translate(-12 -12)"/>'
    + '<circle cx="12" cy="12" r="2.6" fill="#fff" opacity=".92"/>';
  return s;
}
const gwDayNow = () => { const d = new Date().getUTCDay(); return d === 5 || d === 6 || d === 0; };      // 금·토·일 (GMT)
function gwBlock() {
  if (!signedIn()) return '로그인 필요';
  if (!GUILD.g) return '길드 가입 필요';
  if (!gwDayNow()) return '금·토·일에 열려요';
  if (GW.off) return '참가 신청 필요';
  if (GW.grp == null) return '상대 길드 부족';
  if ((GW.left | 0) <= 0) return '오늘 표를 다 썼어요';
  return '';
}
const gwPending = () => gwDayNow() && ((!window.FFAuth && performance.now() < 15000) || (signedIn() && !GUILD.loaded));
const gwMyPts = () => { const m = (GW.grp || []).find(x => x.me); return m ? m.pts | 0 : 0; };
function guildMates() { if (NET.mode !== 'gw' || !GUILD.g) return []; return GUILD.members.map(m => m.u).filter(u => isUid(u) && u !== MYFR.uid); }      // guild war: guild mates play on one side
function netName() { const n = PROF.name || '게스트'; return GUILD.g ? '[' + GUILD.g.tag + '] ' + n : n; }

async function guildLoad() {
  if (!signedIn()) { GUILD.g = null; GUILD.loaded = false; guildTile(); return; }
  if (GUILD.busy) return; GUILD.busy = true;
  try {
    const r = await sbRpc('seumarena_guild_mine', {});
    if (r && r.r === 'ok') { GUILD.g = r.g; GUILD.role = r.role | 0; GUILD.members = r.members || []; GUILD.reqs = r.reqs || []; GUILD.loaded = true; await gwLoad(); }
    else if (r && r.r === 'none') { GUILD.g = null; GUILD.role = 0; GUILD.members = []; GUILD.reqs = []; GUILD.myReqs = r.reqs || []; GUILD.loaded = true; }
  } finally { GUILD.busy = false; }
  guildTile(); if (state === 'menu') try { updatePick(); } catch (e) { quietErr(e); }
  if ($('guildScreen') && $('guildScreen').classList.contains('active')) guildRender();
}
async function gwLoad() {
  const r = await sbRpc('seumarena_gw_me', {});
  if (r && r.r === 'ok') Object.assign(GW, { left: r.left | 0, gnum: r.gnum == null ? null : r.gnum | 0, grp: r.grp || null, day: !!r.day, league: r.league | 0, off: !!r.off, claim: r.claim || null, week: r.week | 0 });
  return GW;
}
async function guildUnread() {
  if (!GUILD.g || state !== 'menu') return;
  const r = await sbRpc('seumarena_guild_chat_since', { p_id: GUILD.seen || 0 });
  if (Array.isArray(r)) { GUILD.unread = r.filter(m => !m.me).length; if (!GUILD.seen && r.length) { GUILD.seen = r[r.length - 1].id; GUILD.unread = 0; } }
  guildTile();
}

/* the lobby button */
function guildTile() {
  const b = $('guild'); if (!b) return;
  const lg = b.querySelector('.gIco'); lg.textContent = '';
  lg.append(GUILD.g ? guildLogo(GUILD.g.logo, GUILD.g.color, 28, GUILD.g.border) : guildLogo(0, 4, 28));
  b.querySelector('b').textContent = GUILD.g ? GUILD.g.tag : '길드';
  $('guildDot').hidden = !(GUILD.g && (GUILD.unread > 0 || (GUILD.role >= 1 && GUILD.reqs.length) || GW.claim));
}

/* ---------- the guild screen ---------- */
let GTAB = '', gChatT = 0, gTop = 'g';
const gEl = (t, c, x) => { const e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; };
const gBtn = (txt, cls, fn) => { const b = gEl('button', cls || 'gBtn', txt); b.type = 'button'; b.addEventListener('click', fn); return b; };
function gToast(t) { const e = $('gToast'); e.textContent = t; e.hidden = false; clearTimeout(gToast.t); gToast.t = setTimeout(() => { e.hidden = true; }, 2600); }
const G_ERR = { login: '로그인이 필요해요', already: '이미 길드에 있어요', name: '이름은 2~12자, 나쁜 말은 안 돼요', tag: '태그는 2~4자 (영어 대문자·숫자·한글)', name_taken: '같은 이름의 길드가 있어요', tag_taken: '같은 태그의 길드가 있어요',
  gone: '길드를 찾을 수 없어요', full: '길드가 꽉 찼어요 (50명)', karma: '카르마가 모자라요', code: '초대 코드가 틀렸어요', role: '권한이 없어요', slow: '조금 천천히 보내 주세요', none: '길드가 없어요', bad: '할 수 없어요' };
const gErr = r => r ? (G_ERR[r.r] || '실패했어요') + (r.r === 'karma' && r.min ? ' (' + r.min + ' 필요)' : '') : '서버에 연결할 수 없어요';
function guildOpen() { showScreen('guildScreen'); GTAB = GTAB || (GUILD.g ? 'chat' : 'find'); guildRender(); guildLoad(); }
function guildRender() {
  const body = $('gBody'); body.textContent = ''; clearInterval(gChatT); gChatT = 0;
  if (!signedIn()) {
    const box = gEl('div', 'gEmpty'); box.append(gEl('b', '', '길드는 로그인한 계정만 쓸 수 있어요'), gEl('span', '', '로그인하면 길드에 들어가거나 만들 수 있어요.'));
    if (window.FFAuth && FFAuth.openLogin) box.append(gBtn('로그인', 'btn-primary gBig', () => FFAuth.openLogin()));
    body.append(box); return;
  }
  if (!GUILD.loaded) { body.append(gEl('div', 'gEmpty', '불러오는 중…')); return; }
  const tabs = GUILD.g ? [['chat', '채팅'], ['mem', '멤버' + (GUILD.role >= 1 && GUILD.reqs.length ? ' •' : '')], ['war', '대항전' + (GW.claim ? ' •' : '')], ['top', '순위']].concat(GUILD.role >= 1 ? [['set', '설정']] : [])
    : [['find', '찾기'], ['make', '만들기'], ['code', '초대 코드'], ['top', '순위']];
  if (!tabs.some(t => t[0] === GTAB)) GTAB = tabs[0][0];
  const wrap = gEl('div', GUILD.g ? 'gWrap' : 'gWrap one'), side = gEl('aside', 'gSide'), main = gEl('section', 'gMain'), tb = gEl('div', 'gTabs'), pane = gEl('div', 'gPane');
  for (const [k, t] of tabs) { const b = gBtn(t, 'gTab' + (k === GTAB ? ' on' : ''), () => { GTAB = k; guildRender(); }); tb.append(b); }
  if (GUILD.g) {
    const g = GUILD.g, lg = G_LEAGUES[g.league] || G_LEAGUES[0];
    side.append(guildLogo(g.logo, g.color, 72, g.border), gEl('b', 'gName', g.name), gEl('span', 'gTag', '[' + g.tag + ']'));
    const st = gEl('div', 'gStats'), lgE = gEl('span', '', '대항전 ' + lg[0] + ' 리그'); lgE.style.color = lg[1];
    st.append(lgE, gEl('span', '', '멤버 ' + GUILD.members.length + '/' + G_MAX), gEl('span', '', G_JOIN[g.join] + (g.min ? ' · 카르마 ' + g.min + '+' : '')));
    side.append(st); if (g.intro) side.append(gEl('p', 'gIntro', g.intro));
    side.append(gBtn('길드 나가기', 'gBtn gWarn', async () => { if (!confirmIn(side, GUILD.role === 2 && GUILD.members.length > 1 ? '나가면 길드장이 다른 사람에게 넘어가요. 나갈까요?' : '정말 나갈까요?')) return; const r = await sbRpc('seumarena_guild_leave', {}); if (r && r.r === 'ok') { gToast('길드에서 나왔어요'); GTAB = 'find'; await guildLoad(); } else gToast(gErr(r)); }));
    wrap.append(side);
  }
  main.append(tb, pane); wrap.append(main); body.append(wrap);
  ({ chat: gChat, mem: gMembers, war: gWar, top: gRank, set: gSettings, find: gFind, make: gMake, code: gCode })[GTAB](pane);
}
/* a confirm step inside the page (no browser dialogs): the first tap arms the button, the second within 3 s does it */
function confirmIn(host, txt) { const now = Date.now(); if (confirmIn.at && now - confirmIn.at < 3000 && confirmIn.txt === txt) { confirmIn.at = 0; return true; } confirmIn.at = now; confirmIn.txt = txt; gToast(txt + ' (한 번 더 누르면 돼요)'); return false; }

function gChat(p) {
  const list = gEl('div', 'gChat'), form = gEl('form', 'gSay'), inp = gEl('input'); inp.maxLength = 120; inp.placeholder = '길드에 한마디'; inp.autocomplete = 'off';
  form.append(inp, gBtn('보내기', 'btn-primary gSend', () => form.requestSubmit())); p.append(list, form);
  let last = 0; const add = rows => { for (const m of rows) { if (m.id <= last) continue; last = m.id; const row = gEl('div', 'gMsg' + (m.k ? ' sys' : m.me ? ' me' : '')); if (!m.k) row.append(gEl('b', '', m.n)); row.append(gEl('span', '', m.t)); list.append(row); } list.scrollTop = list.scrollHeight; if (last) { GUILD.seen = last; GUILD.unread = 0; guildTile(); } if (rows.some(m => m.k && m.id > (GUILD.newsAt || 0))) { const fresh = GUILD.newsAt; GUILD.newsAt = last; if (fresh) guildLoad(); } };      // someone joined / left: the member list again
  const pull = async () => { const r = await sbRpc('seumarena_guild_chat_since', { p_id: last }); if (Array.isArray(r)) add(r); };
  form.addEventListener('submit', async e => { e.preventDefault(); const t = inp.value.trim(); if (!t) return; inp.value = ''; const r = await sbRpc('seumarena_guild_say', { p_txt: t, p_nick: PROF.name }); if (!r || r.r !== 'ok') gToast(gErr(r)); pull(); });
  pull(); gChatT = setInterval(() => { if ($('guildScreen').classList.contains('active') && GTAB === 'chat') pull(); else { clearInterval(gChatT); gChatT = 0; } }, 3000);
}
function gMembers(p) {
  if (GUILD.role >= 1 && GUILD.reqs.length) {
    p.append(gEl('h3', '', '가입 신청 ' + GUILD.reqs.length));
    for (const q of GUILD.reqs) { const row = gEl('div', 'gRow'); row.append(gEl('b', '', q.n), gEl('span', 'gDim', '카르마 ' + q.k), gBtn('받기', 'gBtn gOk', () => gAct('seumarena_guild_answer', { p_uid: q.u, p_ok: true })), gBtn('거절', 'gBtn', () => gAct('seumarena_guild_answer', { p_uid: q.u, p_ok: false }))); p.append(row); }
    p.append(gEl('h3', '', '멤버 ' + GUILD.members.length + '/' + G_MAX));
  }
  const list = gEl('div', 'gList');
  for (const m of GUILD.members) {
    const row = gEl('div', 'gRow'), t = rankOf(m.rp), cv = gEl('canvas', 'gRk'); drawRankLogo(cv, t.i);
    const nm = gEl('b', '', m.n || '이름 없음'), rl = gEl('span', 'gRole r' + m.role, G_ROLE[m.role]), tr = gEl('span', 'gDim', t.name); tr.style.color = t.col;
    row.append(cv, nm, rl, tr);
    if (m.u !== MYFR.uid && GUILD.role >= 1 && m.role < GUILD.role) {
      const acts = gEl('span', 'gActs');
      if (GUILD.role === 2) acts.append(m.role === 0 ? gBtn('부길드장', 'gBtn', () => gAct('seumarena_guild_member', { p_uid: m.u, p_act: 'up' })) : gBtn('멤버로', 'gBtn', () => gAct('seumarena_guild_member', { p_uid: m.u, p_act: 'down' })),
        gBtn('길드장 넘기기', 'gBtn', () => { if (confirmIn(row, m.n + ' 님에게 길드장을 넘길까요?')) gAct('seumarena_guild_member', { p_uid: m.u, p_act: 'lead' }); }));
      acts.append(gBtn('내보내기', 'gBtn gWarn', () => { if (confirmIn(row, m.n + ' 님을 내보낼까요?')) gAct('seumarena_guild_member', { p_uid: m.u, p_act: 'kick' }); }));
      row.append(acts);
    }
    list.append(row);
  }
  p.append(list);
}
async function gAct(fn, args) { const r = await sbRpc(fn, args); if (!r || r.r !== 'ok') gToast(gErr(r)); await guildLoad(); }
function gWar(p) {
  const lg = G_LEAGUES[GW.league] || G_LEAGUES[0], head = gEl('div', 'gWarHead'), lgE = gEl('b', '', lg[0] + ' 리그'); lgE.style.color = lg[1];
  const d = new Date().getUTCDay(), toFri = (5 - d + 7) % 7;
  head.append(lgE, gEl('span', '', gwDayNow() ? '전투일 · 오늘 남은 표 ' + Math.max(0, GW.left) + '/4' : '금·토·일에 열려요' + (toFri ? ' (' + toFri + '일 뒤)' : '')));
  p.append(head);
  if (GW.claim) {
    const c = GW.claim, box = gEl('div', 'gClaim'), rw = GW_REWARD(c.place | 0, c.league | 0);
    box.append(gEl('b', '', '지난 주 결과: 조 ' + c.place + '등 / ' + c.n + '길드'), gBtn('보상 받기', 'btn-primary gBig', async () => {
      const r = await sbRpc('seumarena_gw_claim', { p_week: c.week });
      if (r && r.r === 'ok') { for (const [k, n] of GW_REWARD(r.place | 0, r.league | 0)) { const got = giveReward(k, n); got.why = '길드 대항전'; rewardFx(got); } saveCos(); goldUi(); GW.claim = null; await gwLoad(); guildTile(); guildRender(); }
      else gToast(r && r.r === 'taken' ? '이미 받았어요' : gErr(r));
    }));
    box.append(gEl('span', 'gDim', rw.map(([k, n]) => (k === 'cr' ? '크리스탈 ' : k === 'ebox' ? '에픽상자 ' : k === 'box' ? '랜덤상자 ' : '') + n).join(' · ')));
    p.append(box);
  }
  if (GW.off) {
    const box = gEl('div', 'gClaim'); box.append(gEl('b', '', '2주 연속 0점이라 조 짜기에서 빠졌어요'));
    if (GUILD.role >= 1) box.append(gBtn('다시 참가하기', 'btn-primary gBig', () => gAct('seumarena_gw_rejoin', {}).then(() => gToast('다음 월요일 조 짜기에 들어가요'))));
    p.append(box);
  }
  if (GW.grp) {
    const t = gEl('div', 'gList');
    GW.grp.forEach((x, i) => { const row = gEl('div', 'gRow' + (x.me ? ' me' : '')); row.append(gEl('b', 'gPlace', String(i + 1)), guildLogo(x.logo, x.color, 26), gEl('b', '', x.name), gEl('span', 'gDim', '[' + x.tag + ']'), gEl('span', 'gPts', x.pts + '점')); t.append(row); });
    p.append(gEl('h3', '', '이번 주 우리 조'), t);
  } else p.append(gEl('p', 'gDim', '이번 주에는 조가 없어요. 상대 길드가 모자라거나, 월요일 조 짜기 뒤에 만든 길드예요.'));
  const rules = gEl('p', 'gDim gRules', '승리 4점 · 패배 1점 · 같은 조 다른 길드를 만나면 2배 · 우리 길드원과 같은 팀이면 +1 · 하루 4판까지. 조 1등은 위 리그로, 꼴찌는 아래 리그로.');
  p.append(rules);
  if (!gwBlock()) p.append(gBtn('대항전 하러 가기', 'btn-primary gBig', () => { modeView = 'gw'; modePick(); }));
}
async function gRank(p) {
  const sw = gEl('div', 'gSwitch'); sw.append(gBtn('길드 순위', 'gBtn' + (gTop === 'g' ? ' on' : ''), () => { gTop = 'g'; guildRender(); }), gBtn('개인 랭크', 'gBtn' + (gTop === 'r' ? ' on' : ''), () => { gTop = 'r'; guildRender(); }));
  const list = gEl('div', 'gList', '불러오는 중…'); p.append(sw, list);
  const r = await sbRpc(gTop === 'g' ? 'seumarena_guild_top' : 'seumarena_rank_top', { p_season: GAME_VER }, true);
  list.textContent = ''; if (!Array.isArray(r)) { list.textContent = '서버에 연결할 수 없어요'; return; }
  if (!r.length) { list.textContent = gTop === 'g' ? '아직 길드가 없어요' : '아직 이번 시즌 랭크전 기록이 없어요'; return; }
  r.forEach((x, i) => {
    const row = gEl('div', 'gRow' + (GUILD.g && x.id === GUILD.g.id ? ' me' : '')); row.append(gEl('b', 'gPlace', String(i + 1)));
    if (gTop === 'g') row.append(guildLogo(x.logo, x.color, 26), gEl('b', '', x.name), gEl('span', 'gDim', '[' + x.tag + '] · ' + x.cnt + '명'), gEl('span', 'gPts', x.rp.toLocaleString('en-US')));
    else { const t = rankOf(x.rp), cv = gEl('canvas', 'gRk'); drawRankLogo(cv, t.i); const tr = gEl('span', 'gDim', t.name); tr.style.color = t.col; row.append(cv, gEl('b', '', (x.g ? '[' + x.g + '] ' : '') + x.n), tr, gEl('span', 'gPts', x.rp + '점')); }
    list.append(row);
  });
}
/* logo + colour + intro + join form (create and settings share it) */
function gForm(p, g, make) {
  const f = { logo: g ? g.logo : 0, color: g ? g.color : 4 }, pv = gEl('div', 'gPv');
  const redraw = () => { pv.textContent = ''; pv.append(guildLogo(f.logo, f.color, 64)); for (const b of p.querySelectorAll('.gPick button')) b.classList.toggle('on', +b.dataset.v === f[b.dataset.k]); };
  const field = (lbl, el) => { const w = gEl('label', 'gField'); w.append(gEl('span', '', lbl), el); return w; };
  const name = gEl('input'); name.maxLength = 12; name.placeholder = '2~12자';
  const tag = gEl('input'); tag.maxLength = 4; tag.placeholder = 'FF'; tag.addEventListener('input', () => { tag.value = tag.value.toUpperCase(); });
  const intro = gEl('textarea'); intro.maxLength = 100; intro.rows = 2; intro.value = g ? g.intro : '';
  const join = gEl('select'); G_JOIN.forEach((t, i) => { const o = gEl('option', '', t); o.value = i; join.append(o); }); join.value = g ? g.join : 0;
  const min = gEl('input'); min.type = 'number'; min.min = 0; min.max = 100000; min.step = 50; min.value = g ? g.min : 0;
  const pick = (k, n, draw) => { const w = gEl('div', 'gPick'); for (let i = 0; i < n; i++) { const b = gEl('button'); b.type = 'button'; b.dataset.k = k; b.dataset.v = i; b.append(draw(i)); b.addEventListener('click', () => { f[k] = i; redraw(); }); w.append(b); } return w; };
  const top = gEl('div', 'gFormTop'); top.append(pv);
  const col = gEl('div', 'gFormCol'); if (make) col.append(field('길드 이름', name), field('태그', tag)); col.append(field('소개', intro)); top.append(col);
  p.append(top, gEl('h3', '', '로고'), pick('logo', 12, i => guildLogo(i, f.color, 30)), gEl('h3', '', '색'), pick('color', 8, i => { const s = gEl('i', 'gSw'); s.style.background = G_COLS[i]; return s; }));
  const row = gEl('div', 'gFormRow'); row.append(field('가입 방식', join), field('최소 카르마', min)); p.append(row);
  redraw();
  return () => ({ name: name.value.trim(), tag: tag.value.trim().toUpperCase(), intro: intro.value.trim(), logo: f.logo, color: f.color, join: +join.value, min: Math.max(0, +min.value | 0) });
}
function gMake(p) {
  const lv = levelOf().lv, read = gForm(p, null, true), note = gEl('p', 'gDim', '만들기: 골드 ' + G_COST.toLocaleString('en-US') + ' · 레벨 ' + G_LV + ' 이상 (지금 레벨 ' + lv + ', 골드 ' + COS.gold.toLocaleString('en-US') + ')');
  p.append(note, gBtn('길드 만들기 (' + G_COST.toLocaleString('en-US') + ' 골드)', 'btn-primary gBig', async () => {
    if (levelOf().lv < G_LV) return gToast('레벨 ' + G_LV + '부터 만들 수 있어요');
    if (COS.gold < G_COST) return gToast('골드가 모자라요');
    const v = read(); if (v.name.length < 2) return gToast(G_ERR.name); if (!/^[0-9A-Z가-힣]{2,4}$/.test(v.tag)) return gToast(G_ERR.tag);
    const r = await sbRpc('seumarena_guild_create', { p_name: v.name, p_tag: v.tag, p_logo: v.logo, p_color: v.color, p_intro: v.intro, p_join: v.join, p_min: v.min, p_nick: PROF.name });
    if (r && r.r === 'ok') { COS.gold -= G_COST; saveCos(); goldUi(); gToast('길드를 만들었어요!'); GTAB = 'chat'; await guildLoad(); } else gToast(gErr(r));
  }));
}
function gSettings(p) {
  const g = GUILD.g, read = gForm(p, g, false);
  p.append(gBtn('저장', 'btn-primary gBig', async () => { const v = read(); const r = await sbRpc('seumarena_guild_update', { p_intro: v.intro, p_logo: v.logo, p_color: v.color, p_join: v.join, p_min: v.min, p_newcode: false }); if (r && r.r === 'ok') { gToast('저장했어요'); await guildLoad(); } else gToast(gErr(r)); }));
  const code = gEl('div', 'gCode'); code.append(gEl('span', '', '초대 코드'), gEl('b', '', g.code || '------'), gBtn('새 코드', 'gBtn', async () => { const r = await sbRpc('seumarena_guild_update', { p_intro: null, p_logo: null, p_color: null, p_join: null, p_min: null, p_newcode: true }); if (r && r.r === 'ok') await guildLoad(); else gToast(gErr(r)); }));
  p.append(code, gEl('p', 'gDim', '초대 코드를 아는 사람은 가입 방식과 상관없이 바로 들어올 수 있어요.'));
}
function gFind(p) {
  const form = gEl('form', 'gSay'), q = gEl('input'); q.placeholder = '길드 이름이나 태그'; q.maxLength = 12;
  form.append(q, gBtn('찾기', 'btn-primary gSend', () => form.requestSubmit()));
  const list = gEl('div', 'gList'); p.append(form, list);
  const go = async () => {
    list.textContent = '불러오는 중…'; const r = await sbRpc('seumarena_guild_search', { p_q: q.value.trim() }); list.textContent = '';
    if (!Array.isArray(r)) { list.textContent = '서버에 연결할 수 없어요'; return; } if (!r.length) { list.textContent = '길드가 없어요. 먼저 만들어 보세요!'; return; }
    for (const g of r) {
      const row = gEl('div', 'gRow gFindRow'), info = gEl('div', 'gInfo'), lg = G_LEAGUES[g.league] || G_LEAGUES[0];
      info.append(gEl('b', '', g.name + ' [' + g.tag + ']'), gEl('span', 'gDim', g.cnt + '/' + G_MAX + '명 · ' + G_JOIN[g.join] + (g.min ? ' · 카르마 ' + g.min + '+' : '') + ' · ' + lg[0] + ' 리그'));
      if (g.intro) info.append(gEl('span', 'gDim', g.intro));
      const asked = GUILD.myReqs.includes(g.id), btn = gBtn(g.join === 2 ? '초대만' : asked ? '신청함' : g.join === 1 ? '신청' : '들어가기', 'gBtn gOk', async () => {
        const r2 = await sbRpc('seumarena_guild_join', { p_gid: g.id, p_code: null, p_nick: PROF.name });
        if (r2 && r2.r === 'ok') { gToast(g.name + ' 길드에 들어왔어요!'); GTAB = 'chat'; await guildLoad(); } else if (r2 && r2.r === 'asked') { gToast('가입 신청을 보냈어요'); GUILD.myReqs.push(g.id); btn.textContent = '신청함'; } else gToast(gErr(r2));
      });
      btn.disabled = g.join === 2 || g.cnt >= G_MAX; row.append(guildLogo(g.logo, g.color, 40), info, btn); list.append(row);
    }
  };
  form.addEventListener('submit', e => { e.preventDefault(); go(); }); go();
}
function gCode(p) {
  const form = gEl('form', 'gSay'), q = gEl('input'); q.placeholder = '초대 코드 6자리'; q.maxLength = 6; q.addEventListener('input', () => { q.value = q.value.toUpperCase(); });
  form.append(q, gBtn('들어가기', 'btn-primary gSend', () => form.requestSubmit())); p.append(gEl('p', 'gDim', '길드장·부길드장에게 받은 초대 코드를 넣으면 바로 들어가요.'), form);
  form.addEventListener('submit', async e => { e.preventDefault(); const r = await sbRpc('seumarena_guild_join', { p_gid: null, p_code: q.value.trim(), p_nick: PROF.name }); if (r && r.r === 'ok') { gToast('길드에 들어왔어요!'); GTAB = 'chat'; await guildLoad(); } else gToast(gErr(r)); });
}

/* ---------- page setup (after tail.js has run) ---------- */
Promise.resolve().then(() => {
  const defs = $('mi-m-lock') && $('mi-m-lock').parentNode;
  if (defs) defs.insertAdjacentHTML('beforeend', '<symbol id="mi-m-rank" viewBox="0 0 24 24"><path d="M12 2l3 6 6.5 1-4.7 4.6 1.1 6.4L12 17l-5.9 3 1.1-6.4L2.5 9 9 8z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></symbol>'
    + '<symbol id="mi-m-gw" viewBox="0 0 24 24"><path d="M8 3l5 2v4c0 3.5-2.3 6-5 7-2.7-1-5-3.5-5-7V5z M16 8l5 2v4c0 3.5-2.3 6-5 7-2.7-1-5-3.5-5-7v-4z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></symbol>');
  const css = document.createElement('style');
  css.textContent = `
#guild{pointer-events:auto;position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;padding:0;border-radius:12px;border:2px solid #2a9d8f;background:linear-gradient(#1e3a36,#14211f);color:#eef2ff;box-shadow:0 4px 0 rgba(0,0,0,.45);cursor:pointer;font:800 11px/1 'IBM Plex Sans KR',sans-serif}
#guild b{font-size:11px;letter-spacing:.02em}#guild .gIco{display:flex}
#guildDot{position:absolute;top:-5px;right:-5px;width:12px;height:12px;border-radius:50%;background:#ff4d4d;box-shadow:0 0 0 2px #10141f}
body.mob #guild{order:99}
body.mob #topRight #streak{order:100;position:static}@media (orientation:portrait){body.mob #topRight #streak{display:none}}
body.mob #topRight:not([hidden]){position:fixed!important;top:auto!important;right:auto!important;left:50%!important;bottom:max(10px,env(safe-area-inset-bottom,0px))!important;transform:translateX(-50%);display:flex!important;flex-wrap:nowrap!important;gap:8px!important;z-index:6}
.gLogo.gold{filter:drop-shadow(0 0 0 #ffd34d) drop-shadow(0 0 3px #ffd34d)}
#guildScreen.active{position:fixed;inset:0;z-index:40;width:auto;max-width:none;margin:0;border-radius:0;border:0;box-shadow:none;display:grid;grid-template-rows:auto 1fr;box-sizing:border-box;overflow:hidden;color:#eef2ff;font-family:'IBM Plex Sans KR',sans-serif;padding:env(safe-area-inset-top,0px) max(14px,env(safe-area-inset-right,0px)) env(safe-area-inset-bottom,0px) max(14px,env(safe-area-inset-left,0px));background:radial-gradient(90% 70% at 25% 40%,#1e4a44 0,transparent 60%),repeating-linear-gradient(45deg,#ffffff06 0 14px,transparent 14px 28px),#10141f}
#guildScreen .gHead{display:flex;align-items:center;gap:12px;padding:10px 0}
#guildScreen .gBack{width:44px;height:44px;margin:0;border-radius:10px;border:2px solid #0a0f1c;background:linear-gradient(#3b4b78,#26324f);color:#eef2ff;font:900 26px/1 'IBM Plex Sans KR',sans-serif;box-shadow:0 4px 0 #0a0f1c;cursor:pointer}
#guildScreen h2{font:400 26px 'Black Han Sans','IBM Plex Sans KR',sans-serif;margin:0;letter-spacing:1px;text-shadow:0 3px 0 #000}
#guildScreen .gPill{margin-left:auto;display:flex;align-items:center;gap:6px;background:#0b1020cc;border:2px solid #3a4670;border-radius:20px;padding:4px 12px 4px 6px;font:700 15px 'IBM Plex Sans KR',sans-serif}
#guildScreen .gPill .coin{width:20px;height:20px}
#gBody{min-height:0;padding-bottom:12px;display:flex}
.gWrap{flex:1;min-height:0;display:grid;grid-template-columns:minmax(200px,26%) 1fr;gap:14px}.gWrap.one{grid-template-columns:1fr}
.gSide{display:flex;flex-direction:column;align-items:center;gap:6px;padding:16px 12px;border-radius:16px;background:linear-gradient(180deg,#1f3b3a,#141c26);border:2px solid #2b4d4a;overflow:auto;text-align:center}
.gName{font:400 22px 'Black Han Sans','IBM Plex Sans KR',sans-serif}.gTag{color:#9fe7dc;font-weight:800}
.gStats{display:flex;flex-direction:column;gap:2px;font-size:13px;color:#c8cfe4;font-weight:700}.gIntro{margin:4px 0;font-size:13px;color:#dfe5f5;white-space:pre-wrap;word-break:break-word}
.gMain{display:flex;flex-direction:column;min-height:0;min-width:0;border-radius:16px;background:#141a2bcc;border:2px solid #2c3656;overflow:hidden}
.gTabs{display:flex;gap:4px;padding:6px;background:#0d1220}
.gTab{flex:1;margin:0;padding:8px 6px;border-radius:10px;border:0;background:transparent;color:#aab3cf;font:800 14px 'IBM Plex Sans KR',sans-serif;cursor:pointer}.gTab.on{background:#2a9d8f;color:#fff}
.gPane{flex:1;min-height:0;overflow:auto;padding:10px 12px;display:flex;flex-direction:column;gap:8px}
.gPane h3{margin:6px 0 0;font-size:14px;color:#9fe7dc}
.gBtn{margin:0;padding:6px 10px;border-radius:9px;border:2px solid #34416a;background:#202a45;color:#eef2ff;font:700 13px 'IBM Plex Sans KR',sans-serif;cursor:pointer;white-space:nowrap}.gBtn.on{border-color:#2a9d8f;background:#1e3a36}
.gBtn.gOk{border-color:#2a9d8f}.gBtn.gWarn{border-color:#7a2a35;color:#ffb3b3}.gBtn:disabled{opacity:.45;cursor:default}
.gBig{margin:6px auto 0;min-width:200px}
.gEmpty{margin:auto;display:flex;flex-direction:column;align-items:center;gap:10px;text-align:center;color:#c8cfe4}.gEmpty b{font-size:18px;color:#fff}
.gList{display:flex;flex-direction:column;gap:6px}
.gRow{display:flex;align-items:center;gap:8px;padding:7px 10px;border-radius:10px;background:#1a2136;min-width:0}.gRow.me{background:#1e3a36;outline:2px solid #2a9d8f}
.gRow>b{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.gRk{width:26px;height:26px;flex:none}.gDim{color:#9aa3bf;font-size:12.5px}.gPts{margin-left:auto;font-weight:900;color:#ffd34d}.gPlace{width:22px;text-align:center;color:#ffd34d}
.gRole{font-size:11.5px;font-weight:800;padding:1px 7px;border-radius:8px;background:#2a3350}.gRole.r2{background:#6a5208;color:#ffe58a}.gRole.r1{background:#1e3a36;color:#9fe7dc}
.gActs{margin-left:auto;display:flex;gap:4px;flex-wrap:wrap;justify-content:flex-end}
.gChat{flex:1;min-height:120px;overflow:auto;display:flex;flex-direction:column;gap:5px;padding-right:4px}
.gMsg{max-width:85%;padding:6px 10px;border-radius:12px;background:#222b45;font-size:14px;word-break:break-word}.gMsg b{display:block;font-size:12px;color:#9fe7dc}
.gMsg.me{align-self:flex-end;background:#1e4a44}.gMsg.sys{align-self:center;background:transparent;color:#9aa3bf;font-size:12.5px}
.gSay{display:flex;gap:6px}.gSay input{flex:1;min-width:0;padding:9px 12px;border-radius:10px;border:2px solid #34416a;background:#0d1220;color:#fff;font:600 15px 'IBM Plex Sans KR',sans-serif}.gSend{margin:0;padding:0 16px}
.gWarHead{display:flex;align-items:center;gap:12px;font-weight:700}.gWarHead b{font-size:18px}
.gClaim{display:flex;flex-direction:column;align-items:center;gap:4px;padding:10px;border-radius:12px;background:#2a2410;border:2px solid #6a5208}
.gRules{margin:4px 0 0}
.gSwitch{display:flex;gap:6px}
.gFindRow{align-items:flex-start}.gInfo{flex:1;min-width:0;display:flex;flex-direction:column;gap:1px}.gInfo .gDim{overflow:hidden;text-overflow:ellipsis}
.gFormTop{display:flex;gap:12px;align-items:flex-start}.gPv{flex:none;width:72px;height:72px;display:grid;place-items:center;border-radius:14px;background:#0d1220}
.gFormCol{flex:1;display:flex;flex-direction:column;gap:6px;min-width:0}.gFormRow{display:flex;gap:10px;flex-wrap:wrap}
.gField{display:flex;flex-direction:column;gap:3px;font-size:12.5px;color:#9aa3bf;font-weight:700;min-width:0}
.gField input,.gField textarea,.gField select{padding:8px 10px;border-radius:9px;border:2px solid #34416a;background:#0d1220;color:#fff;font:600 14px 'IBM Plex Sans KR',sans-serif;resize:none}
.gPick{display:flex;flex-wrap:wrap;gap:6px}.gPick button{margin:0;padding:4px;border-radius:9px;border:2px solid transparent;background:#1a2136;cursor:pointer;display:grid;place-items:center}.gPick button.on{border-color:#ffd34d}
.gSw{display:block;width:26px;height:26px;border-radius:50%}
.gCode{display:flex;align-items:center;gap:10px}.gCode b{font:900 20px 'IBM Plex Sans KR',monospace;letter-spacing:.15em;color:#ffd34d}
#gToast{position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:80;padding:8px 16px;border-radius:12px;background:#0b1020ee;border:2px solid #2a9d8f;color:#fff;font:700 14px 'IBM Plex Sans KR',sans-serif;pointer-events:none;max-width:90vw;text-align:center}
#gToast[hidden]{display:none}
@media (max-height:520px){#guildScreen .gHead{padding:6px 0}#guildScreen .gBack{width:38px;height:38px}#guildScreen h2{font-size:21px}.gWrap{grid-template-columns:minmax(150px,24%) 1fr;gap:8px}.gSide{padding:8px}.gSide .gLogo{width:44px;height:44px}.gName{font-size:17px}.gPane{padding:6px 8px}.gTab{padding:6px 4px;font-size:13px}}
@media (max-width:640px) and (orientation:portrait){.gWrap{grid-template-columns:1fr;grid-template-rows:auto 1fr}.gSide{flex-direction:row;flex-wrap:wrap;justify-content:center;padding:8px}}`;
  document.head.append(css);
  // lobby button: last in the top row (PC = layout B); on phones body.mob turns the whole row into one bottom row (layout C)
  const tr = $('topRight'), b = document.createElement('button'); b.id = 'guild'; b.type = 'button'; b.setAttribute('aria-label', '길드');
  b.innerHTML = '<span class="gIco"></span><b>길드</b><i id="guildDot" hidden></i>';
  { const q = $('quest'); if (q) { const r = q.getBoundingClientRect(); if (r.width) { b.style.width = r.width + 'px'; b.style.height = r.height + 'px'; } } }
  if (tr) tr.prepend(b);      // row-reverse: first in the code = right end
  const fit = () => { const q = $('quest'); if (!q) return; const r = q.getBoundingClientRect(); if (r.width) { b.style.width = r.width + 'px'; b.style.height = r.height + 'px'; } };
  addEventListener('resize', () => setTimeout(fit, 50)); setTimeout(fit, 300);
  b.addEventListener('click', guildOpen);
  // the screen
  const scr = document.createElement('div'); scr.className = 'card'; scr.id = 'guildScreen';
  scr.innerHTML = '<header class="gHead"><button class="gBack" id="guildBackBtn" type="button" aria-label="뒤로">&lsaquo;</button><h2>길드</h2><span class="gPill"><i class="coin"></i><b class="goldN">0</b></span></header><div id="gBody"></div>';
  const prof = $('profScreen'); prof.parentNode.insertBefore(scr, prof.nextSibling);
  const t = document.createElement('div'); t.id = 'gToast'; t.hidden = true; document.body.append(t);
  $('guildBackBtn').addEventListener('click', () => { clearInterval(gChatT); showScreen('menuScreen'); });
  goldUi(); guildTile();
  let gN = 0; setInterval(() => { if (state === 'menu' && signedIn()) { if (!GUILD.loaded || ++gN % 4 === 0) guildLoad(); else guildUnread(); } }, 30000);      // chat dot every 30 s, the whole guild every 2 minutes
});
