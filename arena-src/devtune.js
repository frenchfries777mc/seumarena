/* 시험 모드 (user 2026-11-26, plan D): the developer tool artifact makes a code (SA1...) with changed numbers.
   In the game: Settings -> tap the "설정" title 5 times -> a hidden 시험 모드 row; paste the code -> it applies on THIS device only.
   While it is on: a 시험 모드 badge shows and online play is blocked (other players would not have the same numbers). Turning it off restores the originals. */
const TUNE_KEY = 'seum_tune';
const TUNE0 = {};      // original values, kept so 끄기 can put them back without a reload
function tuneRead() { try { const c = localStorage.getItem(TUNE_KEY); return c ? tuneParse(c) : null; } catch (e) { return null; } }
function tuneParse(code) {
  code = String(code || '').trim(); if (!code.startsWith('SA1')) return null;
  try { const t = JSON.parse(decodeURIComponent(escape(atob(code.slice(3))))); return t && typeof t === 'object' ? t : null; } catch (e) { return null; }
}
function tuneApply(t) {
  for (const id in TUNE0) { const h = HEROES[id], o = TUNE0[id]; if (!h) continue; h.hp = o.hp; h.dmg = o.dmg; h.cd = o.cd; h.spd = o.spd; }
  tuneMisc(null);
  if (!t) return 0;
  let n = tuneMisc(t);
  if (!t.hero) return n;
  for (const id in t.hero) {
    const h = HEROES[id], v = t.hero[id]; if (!h || !v) continue;
    if (!TUNE0[id]) TUNE0[id] = { hp: h.hp, dmg: h.dmg, cd: h.cd, spd: h.spd };
    if (v.hp > 0) h.hp = +v.hp; if (v.dmg > 0) h.dmg = +v.dmg; if (v.cd > 0) h.cd = +v.cd;
    if (v.spd > 0) { const s = +v.spd; h.spd = () => s; }
    n++;
  }
  return n;
}
/* other numbers, skins and emotes (기타 수치 / 외형·스킨 탭) */
const TUNE_OBJ = () => ({ pay: PAY_CFG, modePay: MODE_PAY, karma: KARMA_TABLE, tkTix: TK_TIX, tkDraw: TK_DRAW, tkNew: TK_NEW });
let TUNE_SNAP = null, TUNE_ADDED = { skins: [], emo: 0 };
function tuneMerge(dst, src) { for (const k in src) { if (src[k] && typeof src[k] === 'object' && dst[k] && typeof dst[k] === 'object') tuneMerge(dst[k], src[k]); else if (k in dst && typeof src[k] === typeof dst[k]) dst[k] = src[k]; } }
function tuneMisc(t) {
  const O = TUNE_OBJ();
  if (!TUNE_SNAP) TUNE_SNAP = JSON.parse(JSON.stringify(O));
  if (!t) {      // put everything back
    for (const k in O) tuneMerge(O[k], TUNE_SNAP[k]);
    for (const id of TUNE_ADDED.skins) { delete COSMETICS[id]; const i = COS.own.indexOf(id); if (i >= 0) COS.own.splice(i, 1); }
    for (let i = 0; i < TUNE_ADDED.emo; i++) { const em = EMOTES.length - 1; delete COSMETICS['emo_' + em]; EMOTES.pop(); }
    TUNE_ADDED = { skins: [], emo: 0 }; return 0;
  }
  let n = 0;
  for (const k in O) if (t[k]) { tuneMerge(O[k], t[k]); n++; }
  for (const sk of t.skins || []) {      // test skins: added and owned on this device only, removed again when 시험 모드 is turned off
    if (!HEROES[sk.char]) continue; const id = 'skin_test_' + (TUNE_ADDED.skins.length + 1);
    COSMETICS[id] = { cat: 'skin', char: sk.char, name: String(sk.name || '시험 스킨').slice(0, 20), price: +sk.price || 900, tint: sk.tint || '#ffffff', lux: sk.lux | 0 || undefined, fx: sk.fx || undefined, isNew: true };
    if (!COS.own.includes(id)) COS.own.push(id); TUNE_ADDED.skins.push(id); n++;
  }
  for (const e of t.emotes || []) { const i = EMOTES.length; EMOTES.push(String(e[0])); COSMETICS['emo_' + i] = { cat: 'emo', name: String(e[1] || '시험 이모트'), price: +e[2] || 0, free: true, em: String(e[0]), emIdx: i }; TUNE_ADDED.emo++; n++; }
  return n;
}
let TUNE_ON = false;
function tuneBadge() {
  let b = document.getElementById('tuneBadge');
  if (!b) { b = document.createElement('div'); b.id = 'tuneBadge'; b.textContent = '🧪 시험 모드'; b.style.cssText = 'position:fixed;left:8px;bottom:8px;z-index:9999;background:#7b4dff;color:#fff;font:700 12px system-ui,sans-serif;padding:5px 9px;border-radius:999px;pointer-events:none;opacity:.9'; document.body.append(b); }
  b.hidden = !TUNE_ON;
}
function tuneSet(code) {
  const t = code ? tuneParse(code) : null;
  if (code && !t) return -1;
  try { if (t) localStorage.setItem(TUNE_KEY, code.trim()); else localStorage.removeItem(TUNE_KEY); } catch (e) { quietErr(e); }
  const n = tuneApply(t); TUNE_ON = !!t; tuneBadge(); return n;
}
{ const t = tuneRead(); if (t) { tuneApply(t); TUNE_ON = true; } }
{ const k = COS.own.filter(id => String(id).startsWith('skin_test_') && !COSMETICS[id]); if (k.length) COS.own = COS.own.filter(id => !k.includes(id)); }      // leftovers from an earlier 시험 모드
{ const so = startOnline; startOnline = function () { if (TUNE_ON) { try { leaveNote('시험 모드에서는 온라인 경기를 할 수 없어요. 설정에서 시험 모드를 꺼 주세요.', 3600); } catch (e) { quietErr(e); } return; } return so.apply(this, arguments); }; }
function tuneUi() {
  const title = document.getElementById('setTitle'), box = title && title.parentNode; if (!box) return;
  let taps = [];
  title.addEventListener('click', () => {
    const now = Date.now(); taps = taps.filter(x => now - x < 3000); taps.push(now);
    if (taps.length < 5 || document.getElementById('tuneRow')) return;
    const row = document.createElement('div'); row.id = 'tuneRow'; row.className = 'setRow'; row.style.cssText = 'flex-wrap:wrap;gap:6px';
    const lb = document.createElement('span'); lb.textContent = '시험 모드';
    const inp = document.createElement('input'); inp.placeholder = '개발자 도구의 시험 코드'; inp.style.cssText = 'flex:1;min-width:140px;font:inherit;padding:6px;border-radius:8px;border:1px solid #556;background:#111622;color:#fff';
    const on = document.createElement('button'); on.className = 'btn-plain'; on.type = 'button'; on.textContent = '적용';
    const off = document.createElement('button'); off.className = 'btn-plain'; off.type = 'button'; off.textContent = '끄기';
    const msg = document.createElement('div'); msg.style.cssText = 'width:100%;font-size:12px;opacity:.8';
    const say = () => { msg.textContent = TUNE_ON ? '켜짐: 이 기기에서만 바뀐 수치로 혼자 하기(봇 경기)를 할 수 있어요.' : '꺼짐: 원래 수치예요.'; };
    on.onclick = () => { const n = tuneSet(inp.value); if (n < 0) msg.textContent = '코드가 맞지 않아요. 개발자 도구에서 다시 복사해 주세요.'; else { say(); msg.textContent += ' (' + n + '명 바뀜)'; } };
    off.onclick = () => { tuneSet(''); inp.value = ''; say(); };
    row.append(lb, inp, on, off, msg); title.insertAdjacentElement('afterend', row); say();
  });
  tuneBadge();
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', tuneUi); else tuneUi();
