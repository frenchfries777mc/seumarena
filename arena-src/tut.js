/* ---------- first-time tutorial (mockup approved 2026-11-23; the practice range of that mockup is NOT built) ----------
   Four steps on a small cleared map, alone with one dummy that never attacks: 1 walk to the yellow mark, 2 hit the dummy, 3 use both skills and the dash once,
   4 fill the ultimate with hits and use it. The hero is always 기사. Nothing is paid out and nothing is recorded (endGame is never called).
   Shown once to a new player (localStorage seum_tut), skippable at any time, and again from 설정 > 튜토리얼 > 다시 보기.
   engine.js: step() hands the match to tutStep while TUT.on, and a fighter with .dummy stands still instead of asking the AI. */
const TUT = { on: false, k: 0, t0: 0, wait: 0, did: [0, 0, 0], pu: 0, tgt: null, dm: null, el: null, endAt: 0 };
const TUT_K = 'seum_tut';
function tutSeen() { try { return localStorage.getItem(TUT_K) === '1'; } catch (e) { return true; } }
function tutMark() { try { localStorage.setItem(TUT_K, '1'); } catch (e) { quietErr(e); } }
const TUT_NAMES = ['이동', '공격', '스킬', '궁극기'];
function tutText(k) {
  const t = touchUi(), key = s => '<b>' + s + '</b>';
  if (k === 1) return t ? '왼쪽 스틱을 끌어서 노란 표시까지 가 보세요' : key('W') + key('A') + key('S') + key('D') + ' 노란 표시까지 걸어가 보세요';
  if (k === 2) return t ? '오른쪽 스틱을 눌러 허수아비를 때려 보세요' : key('클릭') + ' 마우스로 조준해서 허수아비를 때려 보세요';
  if (k === 3) return t ? '스킬 버튼 2개와 대쉬를 한 번씩 눌러 보세요' : key('F') + key('E') + ' 스킬과 ' + key('Q') + ' 대쉬를 한 번씩 써 보세요';
  return t ? '공격을 맞히면 노란 버튼이 차요. 다 차면 눌러요' : '공격을 맞히면 노란 버튼이 차요. 다 차면 ' + key('R');
}
function tutDraw() {
  const el = TUT.el, k = TUT.k; if (!el) return;
  el.querySelector('.tuSt').textContent = '튜토리얼 ' + k + ' / 4 · ' + TUT_NAMES[k - 1];
  el.querySelector('.tuTx').innerHTML = tutText(k);
  el.querySelectorAll('.tuDots i').forEach((d, i) => { d.className = i + 1 < k ? 'done' : i + 1 === k ? 'on' : ''; });
  el.querySelector('.tuTgt').hidden = el.querySelector('.tuArr').hidden = k !== 1;
  el.querySelector('.tuHl').hidden = el.querySelector('.tuTip').hidden = true;
  for (const b of [skBtn[0], skBtn[1], dashBtn, ultBtn]) b.classList.remove('tutHl');
  if (k === 3) { skBtn[0].classList.add('tutHl'); skBtn[1].classList.add('tutHl'); dashBtn.classList.add('tutHl'); }
  if (k === 4) ultBtn.classList.add('tutHl');
}
function tutUi() {
  if (TUT.el) TUT.el.remove();
  const el = TUT.el = document.createElement('div'); el.id = 'tut';
  el.innerHTML = '<button type="button" class="tuSkip">건너뛰기</button><div class="tuBan"><div class="tuSt"></div><div class="tuTx"></div><div class="tuDots"><i></i><i></i><i></i><i></i></div></div>'
    + '<div class="tuArr" hidden></div><div class="tuTgt" hidden></div><div class="tuHl" hidden></div><div class="tuTip" hidden></div>'
    + '<div class="tuEnd" hidden><div class="tuCard" role="dialog" aria-modal="true"><h2>준비 끝!</h2><p>이동, 공격, 스킬, 궁극기를 모두 써 봤어요.</p><button type="button" class="tuGo">첫 경기 시작</button><button type="button" class="tuLobby">로비로</button></div></div>';
  document.body.appendChild(el);
  el.querySelector('.tuSkip').addEventListener('click', () => tutEnd());
  el.querySelector('.tuLobby').addEventListener('click', () => tutEnd());
  el.querySelector('.tuGo').addEventListener('click', () => { tutEnd(); $('startBtn').click(); });
}
function tutStart() {
  if (TUT.on || state !== 'menu' || NET.role || DED) return false;
  tutMark(); if (typeof newsOpen === 'function') newsOpen(false);
  const keep = [modeChoice, mapChoice];
  modeChoice = 'team'; mapChoice = -1;
  try { setup(true, [{ hero: 'sword', lo: loadoutOf('sword'), local: true, cos: myCos('sword'), name: PROF.name }]); } finally { modeChoice = keep[0]; mapChoice = keep[1]; }
  /* the map: everything inside the border cleared, two walls and two bushes around the middle */
  for (let r = 1; r < ROWS - 1; r++) for (let c = 1; c < COLS - 1; c++) MAP[r][c] = '.';
  const cx = COLS >> 1, cy = ROWS >> 1;
  for (const [x, y] of [[-6, -3], [-5, -3], [5, 3], [6, 3]]) MAP[cy + y][cx + x] = '#';
  for (const [x, y] of [[-6, 2], [-5, 2], [-6, 3], [-5, 3], [5, -3], [6, -3], [5, -2], [6, -2]]) MAP[cy + y][cx + x] = 'g';
  tempWalls.clear(); NET.mapVer++; MA.main.length = 0; FLAGS = []; GALE.until = 0; envNext.gale = envNext.vent = 1e9;
  const P = player, X = (cx + .5) * T, Y = (cy + .5) * T;
  const d = makeFighter(1, 1, 'sword', false, null, null, null); d.dummy = true; d.nick = '허수아비'; d.x = X; d.y = Y; d.aim = 0; d.inv = 0;
  fighters = [P]; score = [0, 0]; timeLeft = 600; overtime = false;      // (the clock never runs: step() leaves before it)
  P.x = X; P.y = Y; P.aim = 0; P.inv = 0;      // (phones: the mark is up and to the left, clear of the buttons on the right and the stick below)
  Object.assign(TUT, { on: true, k: 1, t0: time, wait: 0, did: [0, 0, 0], pu: 0, dm: d, tgt: touchUi() ? { x: X - 3.5 * T, y: Y - T } : { x: X + 4 * T, y: Y }, endAt: 0 });
  enterPlay(); leaveMark(false);      // (leaving the tutorial is not a lost match)
  document.body.classList.add('tutOn'); tutUi(); tutDraw();
  return true;
}
function tutEnd() {
  if (!TUT.on) return;
  TUT.on = false; document.body.classList.remove('tutOn');
  for (const b of [skBtn[0], skBtn[1], dashBtn, ultBtn]) b.classList.remove('tutHl');
  if (TUT.el) { TUT.el.remove(); TUT.el = null; }
  toMenu();
}
function tutNext() {
  const P = player; TUT.k++; TUT.t0 = time; TUT.wait = 0;
  if (TUT.k === 2) { const d = TUT.dm; d.x = (COLS >> 1) * T + T / 2; d.y = (ROWS >> 1) * T + T / 2; if (dist(d, P) < 2 * T) d.x = P.x - 3 * T; fighters.push(d); fx('respawn', d.x, d.y - 20, { color: TC(1) }); }
  if (TUT.k === 3) { P.scd = [0, 0]; P.dcd = 0; TUT.did = [0, 0, 0]; }
  if (TUT.k === 4) { P.ucd = 10; TUT.pu = P.ucd; }
  if (TUT.k > 4) { TUT.k = 4; TUT.endAt = 1; for (const k in keys) keys[k] = false; mouse.down = false; TUT.el.querySelector('.tuEnd').hidden = false; TUT.el.querySelector('.tuBan').hidden = TUT.el.querySelector('.tuSkip').hidden = true; ultBtn.classList.remove('tutHl'); TUT.el.querySelector('.tuTip').hidden = true; sfx(660, .25, 'triangle', .06, 1.5); return; }
  sfx(520, .14, 'triangle', .05, 1.6); tutDraw();
}
function tutStep(dt) {
  const P = player, d = TUT.dm; if (!P) return;
  if (P.dead) respawn(P);
  if (fighters.includes(d)) { if (d.dead) { const x = d.x, y = d.y; respawn(d); d.x = x; d.y = y; d.inv = 0; } else if (d.hp < d.mhp * .55) d.hp = d.mhp; d.aim = angTo(d, P); }
  if (!TUT.endAt) {
    if (TUT.wait > 0) { TUT.wait -= dt; if (TUT.wait <= 0) tutNext(); }
    else if (TUT.k === 1) { if (Math.hypot(P.x - TUT.tgt.x, P.y - TUT.tgt.y) < .7 * T) tutNext(); }
    else if (TUT.k === 2) { if (d.lastHit > TUT.t0) TUT.wait = .9; }
    else if (TUT.k === 3) {
      const now = [P.scd[0] > .05, P.scd[1] > .05 || !P.sk[1], P.lastDash > TUT.t0], bs = [skBtn[0], skBtn[1], dashBtn];
      now.forEach((v, i) => { if (v && !TUT.did[i]) { TUT.did[i] = 1; bs[i].classList.remove('tutHl'); } });
      if (TUT.did.every(Boolean)) TUT.wait = .9;
    }
    else if (TUT.k === 4) { if (P.ucd > TUT.pu + 1) TUT.wait = 1.8; TUT.pu = P.ucd; }
  }
  /* the marks that sit on the world or on the phone's stick */
  const el = TUT.el; if (!el) return;
  const sx = wx => (wx - cam.x) * cam.s + W / 2, sy = wy => (wy - cam.y) * cam.s + H / 2;
  if (TUT.k === 1 && !TUT.endAt) {
    const g = el.querySelector('.tuTgt'), a = el.querySelector('.tuArr'), tx = sx(TUT.tgt.x), ty = sy(TUT.tgt.y + 14), px = sx(P.x), py = sy(P.y + 14), r = Math.round(.55 * T * cam.s);
    g.style.left = tx + 'px'; g.style.top = ty + 'px'; g.style.width = g.style.height = r * 2 + 'px';
    const len = Math.hypot(tx - px, ty - py) - r - 34; a.hidden = len < 24;
    if (len >= 24) { const an = Math.atan2(ty - py, tx - px); a.style.left = px + Math.cos(an) * 30 + 'px'; a.style.top = py + Math.sin(an) * 30 + 'px'; a.style.width = len + 'px'; a.style.transform = 'translateY(-50%) rotate(' + an + 'rad)'; }
    const hl = el.querySelector('.tuHl'), tip = el.querySelector('.tuTip');
    if (touchUi()) { const hm = stickHome(false), on = !stickM; hl.hidden = tip.hidden = !on; if (on) { hl.style.left = hm.x + 'px'; hl.style.top = hm.y + 'px'; hl.style.width = hl.style.height = STICK_R * 2 + 14 + 'px'; tip.textContent = '여기를 끌어요'; tip.style.left = Math.max(70, hm.x) + 'px'; tip.style.top = hm.y - STICK_R - 16 + 'px'; } }
    else hl.hidden = tip.hidden = true;
  }
  if (TUT.k === 4 && !TUT.endAt && !touchUi()) { const tip = el.querySelector('.tuTip'), r = ultBtn.getBoundingClientRect(); tip.hidden = TUT.wait > 0; tip.textContent = P.ucd > 0 ? '가득 차면 궁극기' : '지금 궁극기!'; const top = Math.min(r.top, dashBtn.getBoundingClientRect().top, skBtn[1].getBoundingClientRect().top); tip.style.left = Math.min(W - 90, r.left + r.width / 2 - 20) + 'px'; tip.style.top = top - 14 + 'px'; }      // above the whole cluster of buttons, so it covers none of them
}
/* a new player (nothing earned yet on this browser) gets it once, as soon as the lobby is really in front (no intro, no window, no news card over the play button) */
{ let n = 0; const iv = setInterval(() => {
    if (tutSeen() || window.__noIntro || DED || ++n > 600) { clearInterval(iv); return; }
    if (state !== 'menu' || NET.role || lobby.hidden || !$('menuScreen').classList.contains('active') || document.getElementById('introCv')) return;
    const b = $('startBtn'), r = b.getBoundingClientRect(), top = r.width ? document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2) : null; if (!top || !(top === b || b.contains(top))) return;
    clearInterval(iv);
    if ((COS.xp | 0) > 0 || Object.keys(COS.mp || {}).length || (COS.karma | 0) > 0) { tutMark(); return; }      // somebody who has already played
    tutStart();
  }, 500); }
{ const b = document.getElementById('setTut'); if (b) b.addEventListener('click', () => { if (state !== 'menu' || NET.role) return; setOpen(false); showScreen('menuScreen'); tutStart(); }); }
