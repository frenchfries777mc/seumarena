/* ---------- account saves: a signed-in player's progress also lives in Supabase (public.seumarena_saves, one row per account; RLS lets
   only the owner read or write it), so it follows them to another device or a cleared browser.
   Signed out, offline, on the dedicated host or in the claude.ai preview (no ff-auth.js) nothing here talks to the network and the game
   keeps using this browser only, as before.
   What goes up: COS (gold, karma, level, mastery, achievements and their stats, daily/weekly quests, attendance, streaks, title, skins and
   colours owned and worn, emotes) and the lobby choices in 'seumArena' (character, skills per character, mode, maps). Settings stay per device.
   Merging is three-way: "base" is the copy this browser and the server last agreed on, so each side's own changes since then are kept:
   counts add up (gold spent here and earned on the other device both count), records keep the best, owned things are joined, and a choice
   (worn skin, title, emotes...) takes the side that changed it (this device when both did).
   Whose data is in this browser: the account it was last synced with (CL.uid), or nobody (a guest's progress, which joins the first account
   that signs in here). A different account signing in parks the other one's unsynced changes in CL_STASH, to be merged when it comes back. ---------- */
var CL = null;
const CL_META = 'seumArenaCloud', CL_STASH = 'seumArenaCloudStash', CL_BAK = 'seumArenaCloudBak';
const CL_API = 'https://kebsbuvuutilitwlvxzv.supabase.co/rest/v1/seumarena_saves';
/* how each part of COS merges (by path; the nearest listed parent decides). Anything not listed is a choice. */
const CL_RULE = {
  gold: 'add', karma: 'add', xp: 'add', mp: 'add',
  'st.k': 'add', 'st.w': 'add', 'st.g': 'add', 'st.nd': 'add', 'st.sa': 'add', 'st.mw': 'add', 'st.mg': 'add', 'st.hg': 'add', 'st.hk': 'add', 'st.hn': 'add', 'st.d': 'add', 'st.dk': 'add', 'st.mv': 'add', kb: 'max',
  'st.mk': 'max', 'st.hb': 'max', 'st.hw': 'max', ach: 'max', v: 'max',
  own: 'union', kr: 'union', sk: 'union', sx: 'add', cd: 'union', dq: 'day', wq: 'day', sq: 'day', sd: 'day', sw: 'day', att: 'att'
};
const clObj = v => !!v && typeof v === 'object' && !Array.isArray(v);
const clNum = v => (typeof v === 'number' && isFinite(v) ? v : 0);
function clKey(v) { return JSON.stringify(v === undefined ? null : v, (k, x) => clObj(x) ? Object.keys(x).sort().reduce((o, q) => (o[q] = x[q], o), {}) : x); }
const clSame = (a, b) => clKey(a) === clKey(b);
function clRule(path) { for (let p = path; p; p = p.includes('.') ? p.slice(0, p.lastIndexOf('.')) : '') if (CL_RULE[p]) return CL_RULE[p]; return ''; }
function clMerge(b, l, r, path) {
  const rule = clRule(path);
  if (rule === 'add' && (typeof l === 'number' || typeof r === 'number')) return Math.max(0, Math.round(clNum(r) + clNum(l) - clNum(b)));
  if (rule === 'max' && (typeof l === 'number' || typeof r === 'number')) return Math.max(clNum(l), clNum(r));
  if (rule === 'union' && (Array.isArray(l) || Array.isArray(r))) { const o = []; for (const x of [...(Array.isArray(l) ? l : []), ...(Array.isArray(r) ? r : [])]) if (!o.some(y => clSame(x, y))) o.push(x); return o; }
  if (rule === 'day' && clObj(l) && clObj(r)) {      // { d: day, p: progress x3, c: taken x3 }: the later day wins; on the same day progress adds up, taken stays taken
    if (l.d !== r.d) return l.d > r.d ? l : r;
    const bp = clObj(b) && b.d === l.d && Array.isArray(b.p) ? b.p : [], lp = Array.isArray(l.p) ? l.p : [], rp = Array.isArray(r.p) ? r.p : [], lc = Array.isArray(l.c) ? l.c : [], rc = Array.isArray(r.c) ? r.c : [];
    const n = Math.max(lp.length, rp.length, lc.length, rc.length), p = [], c = [];
    for (let i = 0; i < n; i++) { p.push(Math.max(clNum(lp[i]), clNum(rp[i]), clNum(lp[i]) + clNum(rp[i]) - clNum(bp[i]))); c.push(Math.max(clNum(lc[i]), clNum(rc[i]))); }
    return Object.assign({}, r, l, { p, c });
  }
  if (rule === 'att' && clObj(l) && clObj(r)) { const bb = clObj(b) ? b : {}; return { d: Math.max(clNum(l.d), clNum(r.d)), n: Math.max(clNum(l.n), clNum(r.n), Math.round(clNum(l.n) + clNum(r.n) - clNum(bb.n))) }; }
  if (clObj(l) && clObj(r)) {
    const o = {}, bb = clObj(b) ? b : {};
    for (const k of new Set([...Object.keys(r), ...Object.keys(l)])) { const v = clMerge(bb[k], l[k], r[k], path ? path + '.' + k : k); if (v !== undefined) o[k] = v; }
    return o;
  }
  if (l === undefined) return r;
  if (r === undefined) return l;
  return clSame(l, b) ? r : l;      // a choice: whoever changed it; this device when both did
}
/* a save as it is kept on the server and in CL.base: { cos, prefs } (cos through the same save-version fixes as this browser's own) */
function clNorm(d) {
  d = clObj(d) ? d : {};
  const cos = cosNorm(Object.assign(cosDefault(), clObj(d.cos) ? JSON.parse(JSON.stringify(d.cos)) : {}));
  return { cos, prefs: clObj(d.prefs) ? JSON.parse(JSON.stringify(d.prefs)) : {} };
}
const clEmpty = () => clNorm({});
function clPrefs() { try { const p = JSON.parse(localStorage.getItem('seumArena') || '{}'); return clObj(p) ? p : {}; } catch (e) { return {}; } }
const clLocal = () => clNorm({ cos: COS, prefs: clPrefs() });
const clMerge3 = (b, l, r) => clNorm({ cos: clMerge(b.cos, l.cos, r.cos, ''), prefs: clMerge(b.prefs, l.prefs, r.prefs, '') });
function clLoad(k, d) { try { const v = JSON.parse(localStorage.getItem(k) || 'null'); return v == null ? d : v; } catch (e) { return d; } }
function clStore(k, v) { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
function clMetaSave() { if (CL && CL.uid) clStore(CL_META, { uid: CL.uid, rev: CL.rev, base: CL.base, pend: CL.pend }); }
/* puts a save into the running game (in place, so everything holding COS keeps working) and into this browser's storage */
function clApply(m) {
  for (const k of Object.keys(COS)) if (!(k in m.cos)) delete COS[k];
  Object.assign(COS, JSON.parse(JSON.stringify(m.cos)));
  try { localStorage.setItem(COS_KEY, JSON.stringify(COS)); localStorage.setItem('seumArena', JSON.stringify(m.prefs)); } catch (e) {}
  if (state !== 'play') {      // the lobby picks follow at once (outside a match); mode and map follow on the next start
    const P = m.prefs;
    try { if (clObj(P.l)) loadouts = JSON.parse(JSON.stringify(P.l)); if (HEROES[P.c]) chosen = P.c; } catch (e) {}
  }
  try { if (achScan()) localStorage.setItem(COS_KEY, JSON.stringify(COS)); } catch (e) {}      // merged stats may reach an achievement
  for (const f of [goldUi, accountUi, updatePick, markSel]) try { f(); } catch (e) {}
}
/* the server */
async function clToken() {
  const A = window.FFAuth, sb = A && A.client && A.client(); if (!sb || !sb.auth) return '';
  const r = await sb.auth.getSession(), s = r && r.data && r.data.session;
  CL.tok = (s && s.access_token) || ''; return CL.tok;
}
function clFetch(method, q, body, keep) {
  let ctl = null; try { ctl = new AbortController(); setTimeout(() => ctl.abort(), 12000); } catch (e) {}
  return fetch(CL_API + q, { method, keepalive: !!keep, cache: 'no-store', signal: ctl && !keep ? ctl.signal : undefined, body: body ? JSON.stringify(body) : undefined,
    headers: { apikey: ACH_KEY, Authorization: 'Bearer ' + CL.tok, 'Content-Type': 'application/json', Prefer: method === 'POST' ? 'return=minimal' : 'return=representation' } });
}
async function clGet(uid) {
  const r = await clFetch('GET', '?select=data,rev&user_id=eq.' + uid);
  if (!r.ok) throw new Error('get ' + r.status);
  const a = await r.json(); return Array.isArray(a) && a[0] ? { rev: a[0].rev | 0, data: clNorm(a[0].data) } : null;
}
/* writes a save over revision rev (0: no row yet). true when it landed, false when someone else wrote first.
   The attempt is noted in CL.pend first, so a page closed mid-way can tell next time whether it landed (and not count it twice). */
async function clPut(uid, m, rev, keep) {
  CL.pend = { rev: rev + 1, data: m }; clMetaSave();
  const body = { data: { cos: m.cos, prefs: m.prefs, at: new Date().toISOString() }, rev: rev + 1 };
  const r = rev ? await clFetch('PATCH', '?user_id=eq.' + uid + '&rev=eq.' + rev, body, keep) : await clFetch('POST', '', Object.assign({ user_id: uid }, body), keep);
  if (!rev && r.status === 409) return false;
  if (!r.ok) throw new Error('put ' + r.status);
  if (!rev) return true;
  const a = await r.json(); return Array.isArray(a) && a.length === 1;
}
function clAgree(uid, rev, m) { CL.uid = uid; CL.rev = rev; CL.base = m; CL.pend = null; CL.ok = true; CL.fail = 0; try { localStorage.setItem(COS_KEY, JSON.stringify(COS)); } catch (e) {} clMetaSave(); }      // the save and its base are written together
/* another account (or a guest) owned what is in this browser: make it this account's starting point */
function clAdopt(uid) {
  const stash = clLoad(CL_STASH, {}), loc = clLocal();
  if (CL.uid) {
    if (!CL.base || !clSame(loc, CL.base)) stash[CL.uid] = { rev: CL.rev, base: CL.base, data: loc, at: Date.now() };      // its changes not on the server yet wait here for it
    const s = stash[uid]; delete stash[uid];
    if (s && clObj(s.data)) { clApply(clNorm(s.data)); CL.base = s.base ? clNorm(s.base) : clEmpty(); CL.rev = s.rev | 0; }
    else { const e = clEmpty(); clApply(e); CL.base = e; CL.rev = 0; }
    clStore(CL_STASH, Object.keys(stash).length ? stash : null);
  } else { CL.base = clEmpty(); CL.rev = 0; }      // a guest's progress: all of it is new to the account
  CL.uid = uid; CL.pend = null; CL.ok = false; CL.adopt = true; clMetaSave();
}
async function clSync(pull) {      // pull: ask the server even when nothing changed here
  if (!CL || !CL.live) return;
  if (CL.busy) { CL.again = true; return; }
  const uid = CL.live; CL.busy = true; clearTimeout(CL.t); CL.first = 0;
  try {
    if (!(await clToken()) || CL.live !== uid) return;
    if (CL.uid !== uid) clAdopt(uid);
    let loc = clLocal();
    if (CL.ok && !pull && clSame(loc, CL.base)) return;
    if (CL.ok && !clSame(loc, CL.base) && await clPut(uid, loc, CL.rev)) { clAgree(uid, CL.rev + 1, loc); return; }      // the usual case: nobody else wrote since
    for (let i = 0; i < 4 && CL.live === uid; i++) {
      const row = await clGet(uid); if (CL.live !== uid) return;
      loc = clLocal();
      if (!row) { if (await clPut(uid, loc, 0)) { clAgree(uid, 1, loc); return; } continue; }
      if (CL.pend && CL.pend.rev === row.rev && clSame(clNorm(CL.pend.data), row.data)) { CL.base = row.data; CL.rev = row.rev; }      // the last write did land
      if (clSame(loc, row.data)) { clAgree(uid, row.rev, row.data); return; }
      let m = row.rev === CL.rev ? loc : clMerge3(CL.base || clEmpty(), loc, row.data);
      if (CL.adopt) clStore(CL_BAK, { uid, at: Date.now(), server: row.data, here: loc });      // first merge in this browser: both copies kept once, just in case
      if (!clSame(m, loc)) { clApply(m); m = clLocal(); }      // (clLocal again: an achievement the merged stats reach goes up too)
      if (clSame(m, row.data)) { clAgree(uid, row.rev, m); CL.adopt = false; return; }
      if (await clPut(uid, m, row.rev)) { clAgree(uid, row.rev + 1, m); CL.adopt = false; return; }
    }
    CL.again = true;      // kept losing to another device's writes: once more in a moment
  } catch (e) {
    CL.fail = (CL.fail | 0) + 1; clearTimeout(CL.t); CL.t = setTimeout(clSync, Math.min(300000, 5000 * Math.pow(2, CL.fail - 1)));      // offline or blocked: try again later, quietly
  } finally {
    CL.busy = false;
    if (CL.ok && CL.uid === uid && CL.live === uid) clCodes(uid);
    if (CL.again) { CL.again = false; clearTimeout(CL.t); CL.t = setTimeout(clSync, 1500); }
  }
}
/* reward codes typed on the site (public.seumarena_code_uses, own rows only): each code is given once, remembered in COS.cd (merged as a union,
   so another device that already gave it does not give it again). Checked after a sync, at most once a minute. */
async function clCodes(uid) {
  if (CL.codeBusy || Date.now() - (CL.codeAt || 0) < 60000) return;
  CL.codeBusy = true; CL.codeAt = Date.now();
  try {
    const r = await fetch(CL_API.replace('seumarena_saves', 'seumarena_code_uses') + '?select=code,rewards&user_id=eq.' + uid, { cache: 'no-store', headers: { apikey: ACH_KEY, Authorization: 'Bearer ' + CL.tok } });
    if (!r.ok || CL.live !== uid || CL.uid !== uid) return;
    const rows = await r.json(), gots = [];
    for (const row of Array.isArray(rows) ? rows : []) {
      if (!row || typeof row.code !== 'string' || COS.cd.includes(row.code) || !Array.isArray(row.rewards)) continue;
      COS.cd.push(row.code);
      for (const w of row.rewards) if (Array.isArray(w) && /^(g|px|box|ebox|rx|cx|skin)$/.test(w[0]) && w[1] > 0) { const box = /box$/.test(w[0]); for (let k = box ? Math.min(10, Math.floor(w[1])) : 1; k > 0; k--) gots.push(giveReward(w[0], box ? 1 : Math.floor(w[1]))); }
    }
    if (!gots.length) return;
    saveCos(); try { goldUi(); accountUi(); } catch (e) {}
    gots.forEach((g, i) => setTimeout(() => { try { rewardFx(g); } catch (e) {} }, i * 4600));
  } catch (e) {} finally { CL.codeBusy = false; }
}
/* called by saveCos and savePrefs: keeps this browser's base next to the save just written, and sends the change a little later */
function cloudMark() {
  if (!CL) return;
  clMetaSave();
  if (!CL.live || CL.fail) return;
  const now = Date.now(); if (!CL.first) CL.first = now;
  clearTimeout(CL.t); CL.t = setTimeout(clSync, now - CL.first > 20000 ? 0 : 4000);
}
/* called whenever the account changes (social.js syncAccount) */
function cloudAuth() {
  if (!CL) return;
  const u = PROF.guest ? null : PROF.uid || null;
  if (u === CL.live) return;
  CL.live = u; CL.ok = false; CL.fail = 0; clearTimeout(CL.t);
  if (u) clSync();
}
/* leaving the page: the last change goes out right away (keepalive lets it finish after the page is gone) */
function clLeave() {
  if (!CL || !CL.live || !CL.ok || CL.busy || !CL.tok || CL.uid !== CL.live) return;
  const loc = clLocal(); if (clSame(loc, CL.base)) return;
  const uid = CL.live, rev = CL.rev; CL.busy = true; clearTimeout(CL.t); CL.first = 0;      // busy: no other write may start until this one is answered
  const done = () => { CL.busy = false; if (CL.again) { CL.again = false; CL.t = setTimeout(clSync, 1500); } };
  try { clPut(uid, loc, rev, true).then(ok => { if (ok) clAgree(uid, rev + 1, loc); else CL.ok = false; done(); }, () => { CL.ok = false; done(); }); } catch (e) { done(); }
}
if (!DED) {
  const m = clLoad(CL_META, null);
  CL = { uid: null, rev: 0, base: null, pend: null, live: null, ok: false, busy: false, again: false, adopt: false, fail: 0, t: 0, first: 0, tok: '' };
  if (clObj(m) && typeof m.uid === 'string') { CL.uid = m.uid; CL.rev = m.rev | 0; CL.base = m.base ? clNorm(m.base) : null; CL.pend = clObj(m.pend) ? m.pend : null; }
  addEventListener('pagehide', clLeave);
  document.addEventListener('visibilitychange', () => { if (document.hidden) clLeave(); else if (CL.live) clSync(true); });      // coming back: pick up what another device did meanwhile
}
