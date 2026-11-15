/* leaving a match by reloading or closing the tab counts as a loss (user 2026-11-15). While a match is played a mark sits in localStorage
   (refreshed every 2 s); a normal end, the lobby button or a lost connection takes it off (hooks in tail.js enterPlay/endGame/toMenu, net.js).
   A mark still there on the next load is that lost match: the win streak ends and it counts as a game played and not won; nothing is paid and
   quests do not move. A mark another open tab is still refreshing is left alone. */
const LEAVE_K = 'seumArenaLive', TAB_ID = (() => { try { let t = sessionStorage.getItem('seumTab'); if (!t) { t = Math.random().toString(36).slice(2); sessionStorage.setItem('seumTab', t); } return t; } catch (e) { return 'x'; } })();
let leaveOn = false;
function leaveMark(on) {
  try {
    if (on && player && !DED) { leaveOn = true; localStorage.setItem(LEAVE_K, JSON.stringify({ tab: TAB_ID, t: Date.now(), mode: curMode, hero: player.h0.id, k: player.kos | 0, d: player.deaths | 0 })); }
    else if (leaveOn) { leaveOn = false; const m = JSON.parse(localStorage.getItem(LEAVE_K) || 'null'); if (!m || m.tab === TAB_ID) localStorage.removeItem(LEAVE_K); }
  } catch (e) { quietErr(e); }
  document.documentElement.classList.toggle('inMatch', leaveOn);
}
setInterval(() => { if (leaveOn && state === 'play') leaveMark(true); }, 2000);
function leaveCheck() {
  let m = null; try { m = JSON.parse(localStorage.getItem(LEAVE_K) || 'null'); } catch (e) { quietErr(e); }
  if (!m || (m.tab !== TAB_ID && Date.now() - m.t < 6000)) return;
  try { localStorage.removeItem(LEAVE_K); } catch (e) { quietErr(e); }
  const ls = COS.ls | 0; streakStep(false, false, false); COS.ls = ls;      // the streak ends; quitting does not build up the comeback bonus
  try { achMatch({ mode: m.mode, win: false, first: false, kills: m.k | 0, deaths: m.d | 0, hero: m.hero, n: 0, mvp: false }); } catch (e) { quietErr(e); }
  saveCos(); goldUi();
  const show = () => { if (document.getElementById('introCv') || !document.getElementById('menuScreen').classList.contains('active') || document.getElementById('devPick') && !document.getElementById('devPick').hidden) { setTimeout(show, 300); return; } leaveNote('지난 경기 도중 나가서 패배로 기록됐어요', 4200); }; setTimeout(show, 600);      // after the intro and the device question
}
function leaveNote(txt, ms) {
  const n = document.createElement('div'); n.className = 'leaveNote'; n.textContent = txt; document.body.append(n);
  setTimeout(() => n.classList.add('out'), ms); setTimeout(() => n.remove(), ms + 400);
}
/* F5 / Ctrl+R / Cmd+R during a match: the reload waits behind the game's own question (the browser's reload button and closing the tab can not be stopped this way) */
function leaveAsk() {
  if (document.getElementById('leaveAsk')) return;
  const d = document.createElement('div'); d.id = 'leaveAsk';
  d.innerHTML = '<div class="laCard"><b>새로고침하면 이 경기는 패배로 기록돼요</b><div class="laBtns"><button class="laStay">계속하기</button><button class="laGo">새로고침</button></div></div>';
  const close = () => d.remove();
  d.querySelector('.laStay').onclick = close; d.addEventListener('pointerdown', e => { if (e.target === d) close(); });
  d.querySelector('.laGo').onclick = () => location.reload();
  document.body.append(d); try { for (const k in keys) keys[k] = false; mouse.down = false; pvCancelAll(); } catch (e) { quietErr(e); }
}
addEventListener('keydown', e => {
  const r = e.code === 'F5' || ((e.ctrlKey || e.metaKey) && e.code === 'KeyR'), box = document.getElementById('leaveAsk');
  if (box) { if (e.code === 'Escape') box.remove(); else if (r || e.code === 'Enter') location.reload(); e.preventDefault(); e.stopImmediatePropagation(); return; }
  if (r && state === 'play' && leaveOn) { e.preventDefault(); e.stopImmediatePropagation(); leaveAsk(); }
}, true);
setTimeout(leaveCheck, 0);
