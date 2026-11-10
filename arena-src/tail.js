/* ---------- drawing ---------- */
function drawStick(c, id, col, ang, walk, swing, t, cos) {
  const h = HEROES[id], HIP = -22, SH = -42, HEADCY = -52, HEADR = 9, face = Math.cos(ang) >= 0 ? 1 : -1;
  const sid = skinOf(cos, id), it = sid ? COSMETICS[sid] : null, tint = it ? it.tint : undefined, cp = sid ? conceptOfSkin(sid) : '', now = performance.now();
  const spec = !!(it && skinIsSpecial(sid)), lux = spec ? (it.lux || 0) : 0;
  if (cos && cos.col) col = bodyColor(cos, col);
  let a = ang, reach = 24;
  if (swing > 0 && h && h.type === 'melee') { if (h.w.thrust) reach = 24 + Math.sin(swing * Math.PI) * 12; else a = ang + (swing - .5) * 2.2 * face; }
  const ax = Math.cos(a), ay = Math.sin(a);
  PERSONA_FACE = face;
  c.save();
  if (lux >= 3) { c.save(); try { drawSkinLux(c, lux, tint, now, 7, 'back'); } catch (e) {} c.restore(); }
  if (spec) { try { const mo = skinMotion(sid, now / 1000); c.translate(mo.dx, mo.dy); c.rotate(mo.rot); } catch (e) {} }
  c.save(); try { if (id === 'dracula') drawDraculaCape(c, -face, 3, SH, tint); if (id === 'kadas') drawKadasBack(c, -face, SH, HIP, t, cp); } catch (e) {} c.restore();
  const body = () => { c.strokeStyle = col; c.fillStyle = col; c.lineWidth = 5; c.lineCap = 'round'; c.lineJoin = 'round'; };
  body();
  const s = Math.sin(walk) * 6;
  c.beginPath(); c.moveTo(0, HIP); c.lineTo(-7 + s, 0); c.stroke();
  c.beginPath(); c.moveTo(0, HIP); c.lineTo(7 - s, 0); c.stroke();
  c.beginPath(); c.moveTo(0, HIP); c.lineTo(0, SH); c.stroke();
  c.beginPath(); c.arc(0, HEADCY, HEADR, 0, 7); c.fill();
  c.save(); try { if (WEAPON_PERSONA_NAME[id]) drawWeaponPersona(c, id, 0, HEADCY, HEADR, SH, tint, cp); } catch (e) {} c.restore();
  body();
  const hx = ax * reach, hy = SH + 6 + ay * reach;
  c.beginPath(); c.moveTo(0, SH + 6); c.lineTo(hx, hy); c.stroke();
  if (id === 'kadas') { c.strokeStyle = '#c4182e'; c.beginPath(); c.moveTo(0, SH + 6); c.lineTo(hx, hy); c.stroke(); }
  c.save(); try { drawHeldWeapon(c, id, ax, ay, hx, hy, swing, cp); } catch (e) {} c.restore();
  if (it && it.fx) { c.save(); try { drawSkinFx(c, lux >= 4 ? 'sparkle' : it.fx, lux >= 4 ? auroraHex(now / 1000 * .9, 1) : tint, 0, HEADCY, HEADR * 1.3, now); } catch (e) {} c.restore(); }
  if (cos && cos.col && COSMETICS[cos.col] && COSMETICS[cos.col].shine) { c.save(); try { drawShineGlints(c, now, 0); } catch (e) {} c.restore(); }
  c.restore();
  if (lux >= 3) { c.save(); try { drawSkinLux(c, lux, tint, now, 7, 'front'); } catch (e) {} c.restore(); }
}
function drawFighter(f, alpha) {
  const st = f.st, col = B(f, 'ally') ? TC(1 - f.team) : TC(f.team);
  if (f.form === 'gone') { if (st.hat) { ctx.fillStyle = '#16181f'; ctx.fillRect(st.hat.x - 10, st.hat.y - 44, 20, 16); ctx.fillRect(st.hat.x - 16, st.hat.y - 28, 32, 4); } return; }
  ctx.save(); ctx.translate(f.x, f.y + 16); { const sa = staggerAngle(f); if (sa) ctx.rotate(sa); }
  if (f.inv > 0 && Math.sin(time * 30) > 0) alpha *= .45;
  if (f.form === 'spirit') alpha *= .55;
  ctx.globalAlpha = alpha;
  if (f.form === 'sub') { ctx.fillStyle = '#12061f'; ctx.beginPath(); ctx.ellipse(0, 0, 26 + Math.sin(time * 8) * 3, 11, 0, 0, 6.3); ctx.fill(); ctx.strokeStyle = '#9a4cff'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore(); return; }
  ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.beginPath(); ctx.ellipse(0, 1, 18, 7, 0, 0, 6.3); ctx.fill();
  ctx.strokeStyle = f.isPlayer ? '#ffd34d' : col; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(0, 1, 22, 9, 0, 0, 6.3); ctx.stroke();
  if (f.spin > 0) { ctx.strokeStyle = 'rgba(255,255,255,.6)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(0, -30, (f.h.range || 80) * (f.h.type === 'melee' ? 1 : .3), time * 30, time * 30 + 4.5); ctx.stroke(); }
  if (f.shield > 0) { ctx.strokeStyle = '#7ef0a8'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, -30, 40, 0, 6.3); ctx.stroke(); }
  if (B(f, 'reflect') || B(f, 'sand') || B(f, 'inv') || B(f, 'counter') || B(f, 'guard')) { ctx.strokeStyle = B(f, 'sand') ? '#d8b46a' : '#ffffff'; ctx.globalAlpha = alpha * .6; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, -30, 38, 0, 6.3); ctx.stroke(); ctx.globalAlpha = alpha; }
  if (B(f, 'block') || st.fsh) { ctx.strokeStyle = st.fsh && !B(f, 'block') ? '#ff7a1a' : '#ffd34d'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(0, -30, 44, f.aim - 1.1, f.aim + 1.1); ctx.stroke(); }
  if (f.form === 'bat' || f.form === 'dove') {
    const w = Math.sin(time * 22) * 10; ctx.translate(0, -34); ctx.fillStyle = f.form === 'bat' ? '#2a0a14' : '#f4f4f4'; ctx.strokeStyle = col; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-26, -8 - w); ctx.lineTo(-14, 6); ctx.lineTo(0, 10); ctx.lineTo(14, 6); ctx.lineTo(26, -8 - w); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 0, 8, 0, 6.3); ctx.fill(); ctx.stroke();
    if (f.form === 'dove') { ctx.fillStyle = '#16181f'; ctx.fillRect(-6, -18, 12, 9); ctx.fillRect(-9, -10, 18, 3); }
    ctx.restore(); ctx.globalAlpha = 1; return;
  }
  ctx.save(); ctx.scale(1.15, 1.15);
  drawStick(ctx, f.h.id, col, f.aim, f.bob, f.swing > 0 ? 1 - f.swing / .22 : 0, time, f.cos);
  ctx.restore(); ctx.globalAlpha = alpha;
  if (f.h.id === 'pel') for (let i = 0; i < st.dr; i++) { const an = time * 2 + i * 6.283 / st.dr, x = Math.cos(an) * 34, y = Math.sin(an) * 22 - 56; ctx.fillStyle = '#2b3140'; ctx.strokeStyle = '#7df0ff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(x, y, 9, 5, 0, 0, 6.3); ctx.fill(); ctx.stroke(); }
  if (st.orb && st.orb.n > 0) for (let i = 0; i < st.orb.n; i++) { const a = time * 3 + i * 6.283 / 5; ctx.fillStyle = '#ff8a2a'; ctx.beginPath(); ctx.arc(Math.cos(a) * 54, Math.sin(a) * 54 - 16, 7, 0, 6.3); ctx.fill(); }
  ctx.restore(); ctx.globalAlpha = 1;
  const th = st.thread; if (th && !th.dead) { ctx.strokeStyle = '#ff7bd9'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(f.x, f.y - 30); ctx.lineTo(th.x, th.y - 30); ctx.stroke(); }
}
function drawBars(f) {
  if (f.form === 'gone' || f.form === 'sub') return;
  const w = 54, x = f.x - w / 2, y = f.y - 72, st = f.st, col = B(f, 'ally') ? TC(1 - f.team) : TC(f.team);
  ctx.font = '700 14px Rajdhani, "IBM Plex Sans KR", sans-serif'; ctx.textAlign = 'center';
  ctx.lineWidth = 4; ctx.strokeStyle = '#0c0e13'; ctx.fillStyle = f.isPlayer ? '#ffd34d' : (f.nick && f.cos && f.cos.name ? nameColorFor(f.cos.name) : col);
  let label = f.nick || f.h0.name;
  if (f.isPlayer) { const h = f.h.id; if (h === 'gambler') label += ' · 칩 ' + (st.chip || 0); if (h === 'vacuum') label += ' · 스택 ' + (st.stack || 0); if (h === 'pizarro') label += ' · ' + ((st.pz || 0) + 1) + '단계'; if (h === 'pel') label += ' · 드론 ' + st.dr; if (h === 'flamethrower') label += st.over > 0 ? ' · 과열' : ' · 열 ' + Math.round((st.heat || 0) / 9 * 100) + '%'; }
  ctx.strokeText(label, f.x, y - 6); ctx.fillText(label, f.x, y - 6);
  ctx.fillStyle = '#0c0e13'; ctx.beginPath(); ctx.roundRect(x - 2, y - 2, w + 4, 11, 4); ctx.fill();
  ctx.fillStyle = st.morph ? '#7ef0a8' : (B(f, 'infect') || st.pn) ? '#8dff7c' : col; ctx.beginPath(); ctx.roundRect(x, y, Math.max(0, w * f.hp / f.mhp), 7, 3); ctx.fill();
  if (f.shield > 0) { ctx.fillStyle = '#7ef0a8'; ctx.fillRect(x, y - 4, w * Math.min(1, f.shield / 50), 2); }
  let s = '';
  if (B(f, 'stun')) s = '기절'; else if (B(f, 'charm')) s = '조종'; else if (B(f, 'root')) s = '속박'; else if (B(f, 'mute')) s = '봉인'; else if (B(f, 'blind')) s = '실명'; else if (st.pn) s = '독 ' + st.pn; else if (B(f, 'infect')) s = '감염'; else if (B(f, 'slow')) s = '둔화';
  if (s) { ctx.font = '700 12px "IBM Plex Sans KR", sans-serif'; ctx.fillStyle = '#ffd34d'; ctx.strokeText(s, f.x, y + 22); ctx.fillText(s, f.x, y + 22); }
  if (fighters.some(o => o.st.mark === f)) { ctx.fillStyle = '#ff4d4d'; ctx.beginPath(); ctx.arc(f.x, y - 26, 6, 0, 6.3); ctx.fill(); }
  if (st.g > 0) { ctx.fillStyle = '#0c0e13'; ctx.fillRect(x - 1, y + 10, w + 2, 6); ctx.fillStyle = st.g >= 1 ? '#ffd34d' : '#e8eaf0'; ctx.fillRect(x, y + 11, w * st.g, 4); }
  if (st.neck) { const ph = ((time - st.neck) * 1.8) % 2, pos = ph < 1 ? ph : 2 - ph; ctx.fillStyle = '#c4182e'; ctx.fillRect(x - 8, y + 10, w + 16, 7); ctx.fillStyle = '#3fe07a'; ctx.fillRect(x - 8 + (w + 16) * .37, y + 10, (w + 16) * .26, 7); ctx.fillStyle = '#fff'; ctx.fillRect(x - 9 + (w + 16) * pos, y + 8, 3, 11); }
}
function drawMinion(m) {
  const col = TC(m.team), k = m.kind;
  ctx.save(); ctx.translate(m.x, m.y);
  if (k === 'guard' || k === 'clone' || k === 'body' || k === 'doll') {
    ctx.translate(0, 16); if (k === 'body') ctx.globalAlpha = .75; const sc = k === 'doll' ? .55 : k === 'guard' ? .95 : 1.15; ctx.scale(sc, sc);
    drawStick(ctx, k === 'guard' ? 'guard' : k === 'clone' ? 'tionis' : k === 'body' ? 'medium' : 'puppeteer', k === 'body' ? '#8890a4' : col, m.aim || 0, m.bob || 0, m.sw && time - m.sw < .22 ? (time - m.sw) / .22 : 0, time);
  } else if (k === 'turret') { ctx.fillStyle = '#3a3f4a'; ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, 18, 0, 6.3); ctx.fill(); ctx.stroke(); ctx.rotate(m.aim || 0); ctx.fillStyle = '#16181f'; ctx.fillRect(0, -7, 34, 14); }
  else if (k === 'dragon' && typeof drawFireDragon === 'function') { ctx.restore(); drawDragonMinion(m); return; }
  else if (k === 'dragon') { const w = Math.sin(time * 9) * 16; ctx.fillStyle = '#b3261e'; ctx.strokeStyle = '#ffb347'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, -10); ctx.lineTo(-60, -30 - w); ctx.lineTo(-30, 10); ctx.lineTo(0, 24); ctx.lineTo(30, 10); ctx.lineTo(60, -30 - w); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.arc(0, -8, 16, 0, 6.3); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#ffd34d'; ctx.beginPath(); ctx.arc(-6, -10, 3, 0, 6.3); ctx.arc(6, -10, 3, 0, 6.3); ctx.fill(); }
  else if (k === 'crow') { ctx.restore(); drawCrowMinion(m); return; }
  else if (k === 'crow-old') { const w = Math.sin(time * 26) * 7; ctx.fillStyle = '#0d0f14'; ctx.strokeStyle = '#8dff7c'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-18, -6 - w); ctx.lineTo(-6, 6); ctx.lineTo(6, 6); ctx.lineTo(18, -6 - w); ctx.closePath(); ctx.fill(); ctx.stroke(); }
  else if (k === 'drone') { ctx.fillStyle = '#2b3140'; ctx.strokeStyle = '#7df0ff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(0, 0, 11, 6, 0, 0, 6.3); ctx.fill(); ctx.stroke(); }
  else if (k === 'slot') { ctx.fillStyle = '#7a1f2b'; ctx.strokeStyle = '#ffd34d'; ctx.lineWidth = 3; ctx.beginPath(); ctx.roundRect(-20, -52, 40, 60, 6); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#fff'; ctx.fillRect(-14, -40, 28, 14); ctx.fillStyle = '#c4182e'; ctx.font = '700 12px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('7 7 7', 0, -29); }
  ctx.restore();
  if (m.hit && k !== 'body') { ctx.fillStyle = '#0c0e13'; ctx.fillRect(m.x - 17, m.y - 66, 34, 6); ctx.fillStyle = col; ctx.fillRect(m.x - 16, m.y - 65, 32 * clamp(m.hp / m.max, 0, 1), 4); }
}
const SHAPE_COL = { bullet:'#ffe27a', kdgun:'#b86bff', dronebolt:'#7df0ff', needle:'#f0f0f0', blowgun:'#8dff7c', pellet:'#ffe27a', chip:'#ff5d5d', fireball:'#ff8a2a', cleonorb:'#ff7bd9', potion:'#9a4cff', mask:'#f4f4f4', card:'#ffffff', star:'#cfd3dc', boomerang:'#c98a4b', bomb:'#3a3f4a', rocket:'#cfd3dc', arrow:'#c9a463', quarrel:'#c9a463' };
function drawBullet(b) {
  const col = SHAPE_COL[b.shape] || '#ffe27a', big = b.r > 8 ? b.r / 5 : 1, s = b.shape;
  ctx.save(); ctx.translate(b.x, b.y); ctx.scale(big, big);
  ctx.lineCap = 'round'; ctx.lineWidth = 2; ctx.strokeStyle = TC(b.team); ctx.fillStyle = col;
  if (s === 'star' || s === 'boomerang' || s === 'card' || s === 'mask' || s === 'chip') {
    ctx.rotate(time * 18); ctx.beginPath();
    if (s === 'star') { for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, r = i % 2 ? 3 : 9; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.closePath(); }
    else if (s === 'boomerang') { ctx.moveTo(-11, 7); ctx.lineTo(0, -6); ctx.lineTo(11, 7); ctx.lineTo(0, 0); ctx.closePath(); }
    else if (s === 'card') ctx.roundRect(-6, -8, 12, 16, 2);
    else ctx.arc(0, 0, s === 'mask' ? 8 : 6, 0, 6.3);
    ctx.fill(); ctx.stroke();
  } else if (s === 'arrow' || s === 'quarrel' || s === 'needle' || s === 'blowgun') {
    ctx.rotate(b.ang); ctx.strokeStyle = col; ctx.lineWidth = s === 'needle' || s === 'blowgun' ? 2 : 3;
    ctx.beginPath(); ctx.moveTo(-14, 0); ctx.lineTo(8, 0); ctx.stroke();
    ctx.fillStyle = TC(b.team); ctx.beginPath(); ctx.moveTo(13, 0); ctx.lineTo(5, -4); ctx.lineTo(5, 4); ctx.closePath(); ctx.fill();
  } else if (s === 'bomb' || s === 'rocket' || s === 'potion' || s === 'fireball' || s === 'cleonorb') {
    ctx.rotate(b.ang);
    if (s === 'rocket') { ctx.beginPath(); ctx.roundRect(-11, -5, 22, 10, 5); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#ff8a2a'; ctx.beginPath(); ctx.arc(-13, 0, 4, 0, 6.3); ctx.fill(); }
    else { if (s !== 'bomb') { ctx.globalAlpha = .35; ctx.beginPath(); ctx.arc(0, 0, 12, 0, 6.3); ctx.fill(); ctx.globalAlpha = 1; } ctx.beginPath(); ctx.arc(0, 0, 7.5, 0, 6.3); ctx.fill(); ctx.stroke(); }
  } else {
    ctx.rotate(b.ang); ctx.strokeStyle = TC(b.team); ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(-8, 0); ctx.lineTo(5, 0); ctx.stroke();
    ctx.strokeStyle = col; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-8, 0); ctx.lineTo(5, 0); ctx.stroke();
  }
  ctx.restore();
}
function drawTiles(c, c0, c1, r0, r1, pass) {
  for (let r = r0; r <= r1; r++) for (let cc = c0; cc <= c1; cc++) {
    const t = tile(cc, r), x = cc * T, y = r * T;
    if (pass === 0) {
      c.fillStyle = (r + cc) % 2 ? TH.f1 : TH.f2; c.fillRect(x, y, T + 1, T + 1);
      if (t === 'w') { c.fillStyle = TH.wa; c.fillRect(x, y, T + 1, T + 1); c.strokeStyle = TH.wa2; c.lineWidth = 3; c.lineCap = 'round';
        const o = Math.sin(time * 2 + cc + r) * 5; c.beginPath(); c.moveTo(x + 12 + o, y + 22); c.lineTo(x + 30 + o, y + 22); c.moveTo(x + 32 - o, y + 44); c.lineTo(x + 52 - o, y + 44); c.stroke(); }
    } else if (pass === 1 && t === '#') {
      const tmp = MAP[r][cc] !== '#';
      if (tile(cc, r + 1) !== '#') { c.fillStyle = tmp ? '#2b6f8a' : TH.ws; c.fillRect(x, y + T - 14, T + 1, 14); }
      c.fillStyle = tmp ? '#56b4e9' : TH.wt; c.fillRect(x, y - 14, T + 1, T);
      c.strokeStyle = tmp ? '#2b6f8a' : TH.ws; c.globalAlpha = .55; c.lineWidth = 3; c.strokeRect(x + 7, y - 7, T - 14, T - 14); c.globalAlpha = 1;
    } else if (pass === 2 && t === 'g') {
      const sd = (cc * 7 + r * 13) % 5;
      c.fillStyle = TH.b1; c.beginPath(); c.roundRect(x - 3, y - 9, T + 6, T + 6, 18); c.fill();
      c.fillStyle = TH.b2; c.beginPath(); c.arc(x + 18 + sd * 2, y + 12, 15, 0, 6.3); c.arc(x + 46 - sd, y + 26 + sd, 13, 0, 6.3); c.arc(x + 22, y + 42 - sd, 12, 0, 6.3); c.fill();
    }
  }
}
function renderMapPreview(i, canvas) {
  const c = canvas.getContext('2d'), sm = MAP, st = TH, tw = new Map(tempWalls);
  MAP = MAPS[i].grid; TH = MAPS[i].th; tempWalls.clear();
  c.setTransform(canvas.width / WW, 0, 0, canvas.height / WH, 0, 0);
  for (let p = 0; p < 3; p++) drawTiles(c, 0, COLS - 1, 0, ROWS - 1, p);
  for (let t = 0; t < 2; t++) { c.fillStyle = TC(t); c.globalAlpha = .55; c.beginPath(); c.roundRect((t ? COLS - 2 : 1) * T + 6, 6 * T, T - 12, 5 * T, 16); c.fill(); c.globalAlpha = 1; }
  MAP = sm; TH = st; for (const [k, v] of tw) tempWalls.set(k, v);
}
function render() {
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  ctx.fillStyle = '#0c0e13'; ctx.fillRect(0, 0, W, H);
  const menu = state === 'menu', me = driven();
  if (menu || !player) { cam.s = Math.max(W / WW, H / WH); cam.x = WW / 2; cam.y = WH / 2; }
  else {
    cam.s = Math.min(W, H) / (10.5 * T) * (H > W * 1.15 && W <= 600 ? 1.2 : 1);   // upright phone: zoom in a little so the fighters are bigger
    const hw = W / 2 / cam.s, hh = H / 2 / cam.s;
    cam.x = WW <= hw * 2 ? WW / 2 : clamp(me.x, hw, WW - hw);
    cam.y = WH <= hh * 2 ? WH / 2 : clamp(me.y, hh, WH - hh);
  }
  const sh = lowFx() ? 0 : shake;
  ctx.translate(W / 2 + rnd(-sh, sh), H / 2 + rnd(-sh, sh)); ctx.scale(cam.s, cam.s); ctx.translate(-cam.x, -cam.y);
  const c0 = Math.max(0, Math.floor((cam.x - W / 2 / cam.s) / T) - 1), c1 = Math.min(COLS - 1, Math.ceil((cam.x + W / 2 / cam.s) / T));
  const r0 = Math.max(0, Math.floor((cam.y - H / 2 / cam.s) / T) - 1), r1 = Math.min(ROWS - 1, Math.ceil((cam.y + H / 2 / cam.s) / T));
  drawTiles(ctx, c0, c1, r0, r1, 0);
  for (let t = 0; t < 2; t++) { ctx.fillStyle = TC(t); ctx.globalAlpha = .18; ctx.beginPath(); ctx.roundRect((t ? COLS - 2 : 1) * T + 6, 6 * T, T - 12, 5 * T, 16); ctx.fill(); ctx.globalAlpha = 1; }
  for (const z of zones) {
    if (z.hidden && z.team !== VIEW && !menu) continue;
    ctx.globalAlpha = (z.op || .28) * (z.kind === 'fire' ? .7 + Math.sin(time * 20 + z.x) * .3 : 1) * Math.min(1, z.t * 3);
    ctx.fillStyle = z.col; ctx.beginPath(); ctx.arc(z.x, z.y, z.r, 0, 6.3); ctx.fill();
    ctx.globalAlpha = Math.min(1, z.t * 3) * .8; ctx.strokeStyle = z.key ? TC(z.team) : z.col; ctx.lineWidth = 2; ctx.stroke(); ctx.globalAlpha = 1;
  }
  for (const s of strikes) { const k = 1 - s.t / s.max; ctx.globalAlpha = .18; ctx.fillStyle = s.col; ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 6.3); ctx.fill(); ctx.globalAlpha = .9; ctx.strokeStyle = s.col; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(s.x, s.y, s.r * k, 0, 6.3); ctx.stroke(); ctx.globalAlpha = 1; }

  const inBush = [];
  if (me && state === 'play') { if (!drawPreviews(me)) drawBasicGuide(me); }
  const order = fighters.filter(f => !f.dead).concat(minions.filter(m => m.kind !== 'dragon' && m.kind !== 'crow')).sort((a, b) => a.y - b.y);
  for (const f of order) {
    if (f.minion) { drawMinion(f); continue; }
    if (!menu && !visibleTo(f, VIEW)) continue;
    if (!menu && bushAt(f.x, f.y)) { inBush.push(f); continue; }
    drawFighter(f, B(f, 'stealth') && !menu ? .4 : 1);
  }
  drawFleet();
  for (const b of bullets) if (!drawShot(b)) drawBullet(b);
  { const now = performance.now(); drawSwings(Math.min(.05, (now - (render.last || now)) / 1000)); render.last = now; }
  drawTiles(ctx, c0, c1, r0, r1, 1);
  drawTiles(ctx, c0, c1, r0, r1, 2);
  for (const f of inBush) drawFighter(f, f.team === VIEW ? .6 : .85);
  for (const m of minions) if (m.kind === 'dragon' || m.kind === 'crow') drawMinion(m);
  for (const p of parts) { ctx.globalAlpha = clamp(p.life / p.max, 0, 1); ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.3); ctx.fill(); }
  drawParticles();
  for (const g of rings) { const k = 1 - g.life / g.max; ctx.globalAlpha = 1 - k; ctx.strokeStyle = g.color; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(g.x, g.y, g.r * (.4 + .6 * k), 0, 6.3); ctx.stroke(); }
  ctx.globalAlpha = 1;
  if (!menu) {
    for (const f of fighters) if (!f.dead && visibleTo(f, VIEW)) drawBars(f);
    for (const f of fighters) if (f && !f.dead && visibleTo(f, VIEW)) { drawEmoteBubble(f); drawChatBubble(f); }
    ctx.textAlign = 'center';
    for (const t of texts) { ctx.font = t.small ? '700 15px "IBM Plex Sans KR", sans-serif' : '700 20px Rajdhani, sans-serif'; ctx.globalAlpha = clamp(t.life / .4, 0, 1); ctx.lineWidth = 4; ctx.strokeStyle = '#0c0e13'; ctx.strokeText(t.txt, t.x, t.y); ctx.fillStyle = t.color; ctx.fillText(t.txt, t.x, t.y); }
    ctx.globalAlpha = 1;
  }
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  if (state === 'play' && player && !player.dead && B(player, 'blind')) {
    const sx = (player.x - cam.x) * cam.s + W / 2, sy = (player.y + BODY - cam.y) * cam.s + H / 2, g = ctx.createRadialGradient(sx, sy, 60 * cam.s, sx, sy, 190 * cam.s);
    g.addColorStop(0, 'rgba(12,14,19,0)'); g.addColorStop(1, 'rgba(12,14,19,.96)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  }
  if (!lowFx()) drawSamScreen();
  if (state === 'play') for (const s of [stickM, stickA]) {
    if (!s) continue;
    ctx.fillStyle = 'rgba(232,234,240,.12)'; ctx.beginPath(); ctx.arc(s.ox, s.oy, 52, 0, 6.3); ctx.fill();
    ctx.fillStyle = s === stickA ? 'rgba(255,211,77,.7)' : 'rgba(232,234,240,.55)'; ctx.beginPath(); ctx.arc(s.ox + s.dx * 48, s.oy + s.dy * 48, 24, 0, 6.3); ctx.fill();
  }
}

/* ---------- HUD ---------- */
const $ = id => document.getElementById(id);
const hud = $('hud'), feed = $('feed'), notice = $('notice'), ultBtn = $('ultBtn'), dashBtn = $('dashBtn'), skBtn = [$('sk1Btn'), $('sk2Btn')], soundBtn = $('soundBtn');
const nameOf = (d, f) => typeof d.name === 'function' ? d.name(f || { st: {} }) : d.name;
let lastHud = '', ovtSeen = false, ovtUntil = 0;
function updateHud() {
  const p = player; if (!p) return;
  const tl = Math.max(0, Math.ceil(timeLeft)), c = cdInfo(p), pc = (v, m) => Math.round(clamp(1 - v / (m || 1), 0, 1) * 100);
  const up = pc(c.u, c.uM), dp = pc(c.d, c.dM), sp = [0, 1].map(i => pc(c.s[i], c.sM[i])), sn = c.sn;
  const dead = p.dead ? Math.ceil(p.respawnT) : 0, mine = score[VIEW], theirs = score[1 - VIEW];
  const ot = typeof overtime !== 'undefined' && !!overtime;
  if (ot && !ovtSeen) ovtUntil = performance.now() + 2600; ovtSeen = ot;
  const ovtBanner = ot && !dead && performance.now() < ovtUntil, di = dead ? deathInfo : null;
  const key = [mine, theirs, tl, up, dp, sp, sn, c.un, dead, touchMode, ot, ovtBanner, di ? (di.by ? fighters.indexOf(di.by) : -1) + di.src : ''].join();
  if (key === lastHud) return; lastHud = key;
  $('sb').textContent = mine; $('sr').textContent = theirs;
  $('timer').textContent = ot ? '연장전' : Math.floor(tl / 60) + ':' + String(tl % 60).padStart(2, '0');
  $('timer').classList.toggle('hot', ot || tl <= 15);
  ultBtn.style.setProperty('--p', up); ultBtn.classList.toggle('ready', up >= 100);
  $('ultName').textContent = c.un; $('ultHint').textContent = up >= 100 ? (touchMode ? '궁극기' : 'R') : Math.ceil(c.u) + '초';
  dashBtn.style.setProperty('--p', dp); dashBtn.classList.toggle('ready', dp >= 100); $('dashHint').textContent = touchMode ? '' : 'Q';
  for (let i = 0; i < 2; i++) { skBtn[i].style.setProperty('--p', sp[i]); skBtn[i].classList.toggle('ready', sp[i] >= 100); $('sk' + (i + 1) + 'Name').textContent = sn[i]; $('sk' + (i + 1) + 'Hint').textContent = sp[i] >= 100 ? (touchMode ? (i + 1) + '스킬' : 'FE'[i]) : Math.ceil(c.s[i]) + '초'; }
  notice.hidden = !dead && !ovtBanner; notice.textContent = '';
  if (dead) {
    notice.append(dead + '초 뒤에 다시 나갑니다');
    if (di && (di.by || di.src)) {
      const kb = document.createElement('span'), sm = document.createElement('small'); kb.className = 'kb';
      if (di.by) { const b = document.createElement('b'); b.className = di.by.team === VIEW ? 'b' : 'r'; b.textContent = di.by.nick || di.by.h0.name; kb.append('처치 ', b); sm.textContent = [di.by.nick ? di.by.h0.name : '', di.src].filter(Boolean).map(s => ' · ' + s).join(''); }
      else sm.textContent = di.src + '에 쓰러졌어요';
      kb.append(sm); notice.append(kb);
    }
  } else if (ovtBanner) notice.textContent = '연장전!';
}
let deathInfo = null;
function addFeed(owner, victim, src) {
  if (victim === player) deathInfo = { by: owner || null, src: src || (victim.killer && victim.killer.src) || '' };
  evt(['f', owner ? fighters.indexOf(owner) : -1, fighters.indexOf(victim)]);
  const d = document.createElement('div');
  const who = f => { const s = document.createElement('span'); s.className = f.team === VIEW ? 'b' : 'r'; s.textContent = f.nick || f.h0.name; return s; };
  if (owner) d.append(who(owner), ' → ', who(victim)); else d.append(who(victim), ' 쓰러짐');
  feed.append(d);
  while (feed.children.length > 3) feed.firstChild.remove();
  setTimeout(() => d.remove(), 3500);
}
function showPlayUi(on) { hud.hidden = feed.hidden = ultBtn.hidden = dashBtn.hidden = skBtn[0].hidden = skBtn[1].hidden = soundBtn.hidden = $('emoteBtn').hidden = $('chatBtn').hidden = $('setBtn').hidden = $('chatFeed').hidden = !on; if (!on) { setOpen(false); notice.hidden = true; emoteWheel(false); chatOpen(false); pvClear(); } }
function tapBtnUi(b, fn) { b.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); fn(); }); }

/* ---------- settings window ---------- */
const setEl = $('settings');
function setFill() {
  $('setVol').value = SET.vol; $('setVolV').textContent = SET.vol + '%';
  $('setAim').value = SET.aim; $('setAimV').textContent = (SET.aim / 100).toFixed(1) + '×';
  $('setFx').checked = SET.fx;
}
function setOpen(on) {
  if (on === undefined) on = setEl.hidden;
  if (on) {
    setFill(); $('setAimRow').hidden = !(touchMode || navigator.maxTouchPoints > 0 || matchMedia('(pointer:coarse)').matches);
    for (const k in keys) keys[k] = false; mouse.down = false; emoteWheel(false); chatOpen(false); pvCancelAll();
  }
  setEl.hidden = !on;
}
function setBeep() {
  try {
    if (!ac) ac = new (window.AudioContext || window.webkitAudioContext)();
    if (ac.state === 'suspended') ac.resume();
    if (SET.vol <= 0 || muted) return;
    const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime;
    o.type = 'triangle'; o.frequency.value = 660; g.gain.setValueAtTime(.07 * SET.vol / 100, t); g.gain.exponentialRampToValueAtTime(.0001, t + .18);
    o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + .18);
  } catch (e) {}
}
function setMusicVol() { try { if (window.SeumMusic && SeumMusic.setVolume) SeumMusic.setVolume(SET.vol / 100 * .5); } catch (e) {} }      // music default is half of the slider: slider 100% = music 0.5
setMusicVol();
$('setVol').addEventListener('input', e => { SET.vol = +e.target.value; $('setVolV').textContent = SET.vol + '%'; saveSet(); setMusicVol(); });
$('setVol').addEventListener('change', setBeep);
$('setAim').addEventListener('input', e => { SET.aim = +e.target.value; $('setAimV').textContent = (SET.aim / 100).toFixed(1) + '×'; saveSet(); });
$('setFx').addEventListener('change', e => { SET.fx = e.target.checked; saveSet(); });
$('setReset').addEventListener('click', () => { SET.vol = 100; SET.aim = 100; SET.fx = false; setFill(); saveSet(); setMusicVol(); });
$('setClose').addEventListener('click', () => setOpen(false));
setEl.addEventListener('pointerdown', e => { e.stopPropagation(); if (e.target === setEl) setOpen(false); });
$('setLobbyBtn').addEventListener('click', () => setOpen(true));
tapBtnUi($('setBtn'), () => setOpen(true));
addEventListener('keydown', e => { if (setEl.hidden) return; if (e.code === 'Escape') setOpen(false); e.stopPropagation(); }, true);   // the game does not see keys while the window is open

/* ---------- lobby ---------- */
try { const s = JSON.parse(localStorage.getItem('seumArena') || '{}'); if (HEROES[s.c]) chosen = s.c; if (s.m >= -1 && s.m < MAPS.length) mapChoice = s.m | 0; if (s.l && typeof s.l === 'object') loadouts = s.l; } catch (e) {}
const savePrefs = () => { try { localStorage.setItem('seumArena', JSON.stringify({ c: chosen, m: mapChoice, l: loadouts })); } catch (e) {} };
const KIND_LABEL = { melee: '근접', shot: '원거리', flame: '방사', cone: '흡입' }, SK_LABEL = { hit: '공격', move: '이동', buff: '강화' };
function attackText(h) {
  const tiles = (h.range / T).toFixed(1) + '칸';
  if (h.type === 'melee') return '데미지 ' + h.dmg + ' · 쿨타임 ' + h.cd + '초 · 근접 사거리 ' + tiles + (h.w.thrust ? ' · 앞으로 찌르기' : ' · 넓게 휘두르기') + (h.w.kbMult ? ' · 크게 밀쳐 냄' : '');
  if (h.type === 'flame') return '누르고 있는 동안 화염 방사 · 초당 31 피해 · 사거리 ' + tiles + ' · 쏜 시간이 합쳐서 9초가 되면 2초간 과열';
  if (h.type === 'cone') return '데미지 ' + h.dmg + ' · 쿨타임 ' + h.cd + '초 · 사거리 ' + tiles;
  if (h.id === 'tell') return '꾹 눌렀다 놓으면 발사 · 데미지 1~64 · 최대 사거리 ' + tiles;
  return '데미지 ' + (h.id === 'gambler' ? '4~36' : h.id === 'bow' ? '10~36' : h.dmg) + (h.count > 1 ? ' × ' + h.count + '발' : '') + (h.burst > 1 ? ' · ' + h.burst + '연발' : '') + ' · 쿨타임 ' + h.cd + '초 · 사거리 ' + tiles + (h.splash ? ' · 폭발 범위 피해' : '') + (h.pierce ? ' · 한 명 관통' : '');
}
const lobby = $('lobby');
function showScreen(id) {
  for (const s of lobby.querySelectorAll('.card')) s.classList.toggle('active', s.id === id);
  const menu = id === 'menuScreen';
  $('brandDisplay').classList.toggle('show', menu); $('lobbyChar').classList.toggle('show', menu); $('acct').hidden = !menu;
  if (menu) { updatePick(); lobbyCharPlace(); }
}
/* the lobby figure stands on the bottom-left corner of the lowest menu button: its feet on the button's bottom edge, its body just left of the corner */
function lobbyCharPlace() {
  const box = $('lobbyChar'), cvs = $('lobbyCharCanvas'), btns = [...document.querySelectorAll('#menuScreen .menu-float-btn')];
  if (!box || !btns.length || !box.classList.contains('show')) return;
  const rs = btns.map(b => b.getBoundingClientRect()), top = Math.min(...rs.map(r => r.top)), r = rs.reduce((a, b) => b.bottom > a.bottom ? b : a);
  const narrow = innerWidth <= 640 && innerHeight > 520;
  cvs.style.width = ''; box.style.visibility = '';
  if (narrow) {
    /* phone held upright: the figure stands between the title and the first button, centered; it shrinks to the room that is left (hidden if there is almost none) */
    const br = $('brandDisplay').getBoundingClientRect(), avail = top - br.bottom - 8, fh = Math.min(130, avail - 40);
    if (!top || fh < 56) { box.style.visibility = 'hidden'; return; }
    const dh = fh / .51, dw = Math.round(dh * 360 / 414);
    cvs.style.width = dw + 'px';
    const cr = cvs.getBoundingClientRect(); if (!cr.height) return;
    box.style.bottom = 'auto';
    box.style.top = Math.round(top - 36 - cr.height * .71) + 'px';
    box.style.left = Math.round((innerWidth - cr.width) / 2) + 'px';
    $('lobbyCharName').style.marginTop = Math.round(-(cr.height * .3) + 8) + 'px';
    return;
  }
  const cr = cvs.getBoundingClientRect(); if (!r.height || !cr.height) return;
  const dw = cr.width, dh = cr.height, feet = dh * .7;
  box.style.bottom = 'auto';
  box.style.top = Math.round(r.bottom - feet) + 'px';
  box.style.left = Math.round(Math.max(80, Math.min(150, innerWidth * .1 + 40)) - dw / 2) + 'px';      // the figure stands near the left edge of the screen (the empty sides of the canvas may run off-screen)
  $('lobbyCharName').style.marginTop = Math.round(-(dh * .3) + 8) + 'px';
}
addEventListener('resize', () => lobbyCharPlace());
function updatePick() {
  const el = $('lobbyPick'), h = HEROES[chosen], lo = loadoutOf(chosen); el.textContent = '';
  const b1 = document.createElement('b'), b2 = document.createElement('b'), b3 = document.createElement('b');
  b1.textContent = mapChoice < 0 ? '무작위' : MAPS[mapChoice].name; b2.textContent = h.name; b3.textContent = lo.map(n => nameOf(h.skills.find(s => s.n === n))).join(' / ');
  el.append('맵 ', b1, ' · 캐릭터 ', b2, document.createElement('br'), '스킬 ', b3);
  $('lobbyCharName').textContent = h.name;
}
function drawPortrait(canvas, id, breathe) {
  const c = canvas.getContext('2d'), k = canvas.width / 200;
  c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, canvas.width, canvas.height);
  c.translate(canvas.width / 2 - (id === 'shade' ? 16 * k : 0), canvas.height * .7); c.scale(1.8 * k, 1.8 * k);
  if (breathe) { const br = Math.sin(performance.now() / 620); c.scale(1 - .012 * br, 1 + .02 * br); }
  drawStick(c, id, '#3fe0c5', .3, 0, 0, performance.now() / 1000, myCos(id));
}
function drawIcon(canvas, id) {
  canvas.width = 128; canvas.height = 128;
  const c = canvas.getContext('2d'); c.translate(54, 112); c.scale(1.55, 1.55);
  drawStick(c, id, '#cfd3dc', .3, 0, 0, 0, null);
}
let viewing = null;
function buildChars() {
  const grid = $('weaponGrid');
  for (const id of ROSTER) {
    const h = HEROES[id], b = document.createElement('button');
    b.type = 'button'; b.className = 'wpnCard'; b.dataset.wid = id; b.id = 'char-' + id;
    const cvs = document.createElement('canvas'); drawIcon(cvs, id);
    const n = document.createElement('div'); n.className = 'wn'; n.textContent = h.name;
    const k = document.createElement('div'); k.className = 'wk'; k.textContent = h.wname + ' · ' + KIND_LABEL[h.type];
    b.append(cvs, n, k);
    b.addEventListener('click', () => openDetail(id));
    grid.append(b);
  }
  markSel();
}
function markSel() { for (const el of $('weaponGrid').children) el.classList.toggle('sel', el.dataset.wid === chosen); }
function renderLoadout(id) {
  const h = HEROES[id], box = $('weaponLoadout'), lo = loadoutOf(id); box.textContent = '';
  const head = document.createElement('div'); head.className = 'loHead'; head.textContent = h.skills.length > 2 ? '스킬 ' + h.skills.length + '개 중 2개를 골라 칸에 넣으세요 · 1스킬 칸은 쿨타임 ' + CD1 + '초, 2스킬 칸은 ' + CD2 + '초' : '스킬이 2개뿐이라 어느 칸에 넣을지만 고릅니다 · 1스킬 칸은 쿨타임 ' + CD1 + '초, 2스킬 칸은 ' + CD2 + '초';
  box.append(head);
  for (const s of h.skills) {
    const row = document.createElement('div'); row.className = 'skRow' + (lo.includes(s.n) ? ' on' : '');
    const t = document.createElement('div'); t.className = 'skText';
    const nm = document.createElement('b'); nm.textContent = nameOf(s);
    const tag = document.createElement('i'); tag.textContent = SK_LABEL[s.k];
    const d = document.createElement('p'); d.textContent = s.d;
    t.append(nm, tag, d);
    const btns = document.createElement('div'); btns.className = 'skBtns';
    for (let slot = 0; slot < 2; slot++) {
      const b = document.createElement('button'); b.type = 'button'; b.id = 'lo-' + id + '-' + s.n + '-' + (slot + 1); b.textContent = (slot + 1) + '스킬'; b.setAttribute('aria-pressed', String(lo[slot] === s.n));
      if (slot === 1 && s.only1) { b.disabled = true; b.title = '1스킬 칸에만 넣을 수 있어요'; }
      b.addEventListener('click', () => { const cur = loadoutOf(id); const nw = cur.slice(); if (cur[1 - slot] === s.n) nw[1 - slot] = cur[slot]; nw[slot] = s.n; loadouts[id] = loadoutValid(h, nw[0], nw[1]); savePrefs(); renderLoadout(id); });
      btns.append(b);
    }
    row.append(t, btns); box.append(row);
  }
}
function openDetail(id) {
  viewing = id; const h = HEROES[id];
  $('weaponScreen').classList.add('wDetail');
  $('weaponPortraitName').textContent = h.name;
  const d = $('weaponDetail'); d.textContent = '';
  const line = (label, text) => { const p = document.createElement('p'), s = document.createElement('strong'); s.textContent = label; p.append(s, text); return p; };
  d.append(line('무기', h.wname + ' · ' + attackText(h)), line('패시브', h.p[0] + ' · ' + h.p[1]), line('궁극기', h.ult.name + ' · ' + h.ult.d + (id === 'medium' ? '' : ' (쿨타임 ' + ULT_CD + '초)')), line('체력', h.hp + ' · 대쉬 쿨타임 ' + (h.dashCd ? h.dashCd({ st: {}, b: {} }) : 1.5) + '초'));
  renderLoadout(id);
  $('weaponLockBtn').textContent = id === chosen ? '확인 (스킬은 바로 저장돼요)' : '이 캐릭터로 정하기'; $('weaponLockBtn').disabled = false;
  $('weaponScreen').scrollTop = 0;
}
function closeDetail() { viewing = null; $('weaponScreen').classList.remove('wDetail'); }
$('weaponSearch').addEventListener('input', e => {
  const q = e.target.value.trim().toLowerCase();
  for (const el of $('weaponGrid').children) { const h = HEROES[el.dataset.wid]; el.style.display = (!q || (h.name + ' ' + h.wname + ' ' + h.id).toLowerCase().includes(q)) ? '' : 'none'; }
});
$('weaponLockBtn').addEventListener('click', () => { chosen = viewing; savePrefs(); markSel(); closeDetail(); showScreen('menuScreen'); });
$('weaponBackListBtn').addEventListener('click', closeDetail);
$('weaponBrowseBackBtn').addEventListener('click', () => { closeDetail(); showScreen('menuScreen'); });
$('goCharBtn').addEventListener('click', () => { showScreen('weaponScreen'); openDetail(chosen); });       // one button: the picked character's skills first, the list one tap away

let mapIdx = 0;
function showMap() {
  const cvp = $('mapCarouselPreview'), c = cvp.getContext('2d');
  c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, cvp.width, cvp.height);
  if (mapIdx === 0) {
    for (let i = 0; i < MAPS.length; i++) { const t = document.createElement('canvas'); t.width = 250; t.height = 170; renderMapPreview(i, t); c.drawImage(t, 0, 0, 250, 170, i * cvp.width / MAPS.length, 0, cvp.width / MAPS.length, cvp.height); }
    c.fillStyle = 'rgba(12,14,19,.55)'; c.fillRect(0, 0, cvp.width, cvp.height);
    c.fillStyle = '#ffd34d'; c.font = '700 120px Rajdhani, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('?', cvp.width / 2, cvp.height / 2);
    $('mapCarouselName').textContent = '무작위'; $('mapCarouselMeta').textContent = '판마다 다섯 맵 가운데 하나가 무작위로 나옵니다.';
  } else { const m = MAPS[mapIdx - 1]; renderMapPreview(mapIdx - 1, cvp); $('mapCarouselName').textContent = m.name; $('mapCarouselMeta').textContent = m.desc; }
  const dots = $('mapDots'); dots.textContent = '';
  for (let i = 0; i <= MAPS.length; i++) { const d = document.createElement('i'); if (i === mapIdx) d.className = 'on'; dots.append(d); }
  const cur = mapIdx - 1 === mapChoice;
  $('mapPickBtn').textContent = cur ? '선택됨' : '이 맵으로 하기'; $('mapPickBtn').disabled = cur;
}
$('goMapBtn').addEventListener('click', () => { mapIdx = mapChoice + 1; showMap(); showScreen('mapScreen'); });
$('mapPrevBtn').addEventListener('click', () => { mapIdx = (mapIdx + MAPS.length) % (MAPS.length + 1); showMap(); });
$('mapNextBtn').addEventListener('click', () => { mapIdx = (mapIdx + 1) % (MAPS.length + 1); showMap(); });
$('mapPickBtn').addEventListener('click', () => { mapChoice = mapIdx - 1; savePrefs(); setup(false); showScreen('menuScreen'); });
$('mapBackBtn').addEventListener('click', () => showScreen('menuScreen'));

function enterPlay() {
  { const c = document.getElementById('diceBannerContainer'); if (c) c.textContent = ''; }
  state = 'play'; feed.textContent = ''; lastHud = '';
  mouse.down = false; stickM = stickA = pendingFire = null; wantUlt = wantDash = false; wantSk = [false, false]; pvClear();
  lobby.hidden = true; cv.classList.remove('inLobby'); showPlayUi(true);
}
function startMatch(humans) { setup(true, humans); enterPlay(); }
/* result table: every fighter's kills/deaths and damage dealt; the MVP is the best fighter of the winning team (of everyone on a draw) */
function buildOverStats(win, draw) {
  const box = $('overStats'); box.textContent = ''; box.classList.remove('noDmg');
  const fs = fighters.filter(f => !f.minion && f.h0); if (fs.length < 2) return;
  const val = f => (f.kos || 0) * 100 + (f.dealt || 0) / 10 - (f.deaths || 0) * 30;
  const pool = draw ? fs : fs.filter(f => f.team === (win ? VIEW : 1 - VIEW)), mvp = pool.length ? pool.reduce((a, b) => val(b) > val(a) ? b : a) : null;
  const top = Math.max(1, ...fs.map(f => f.dealt || 0));
  box.classList.toggle('noDmg', !fs.some(f => f.dealt > 0));
  const el = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };
  const head = el('div', 'osHead'); head.append(el('span', '', '이름'), el('span', '', '킬/데스'), el('span', '', '딜량')); box.append(head);
  for (const team of [VIEW, 1 - VIEW]) {
    if (team !== VIEW) box.append(el('div', 'osGap'));
    for (const f of fs.filter(f => f.team === team).sort((a, b) => val(b) - val(a))) {
      const r = el('div', 'osRow ' + (team === VIEW ? 'b' : 'r') + (f === player ? ' me' : '')), nm = el('span', 'on');
      if (f === mvp && val(f) > 0) nm.append(el('span', 'mvp', 'MVP'));
      nm.append(f.nick || f.h0.name); if (f.nick) nm.append(el('small', '', f.h0.name));
      const dl = el('span', 'od'), bar = el('i'); bar.style.width = Math.round((f.dealt || 0) / top * 100) + '%'; dl.append(bar, el('em', '', String(Math.round(f.dealt || 0))));
      if (f.taken > 0) r.title = '받은 피해 ' + Math.round(f.taken);
      r.append(nm, el('span', 'ok', (f.kos || 0) + ' / ' + (f.deaths || 0)), dl); box.append(r);
    }
  }
}
function endGame() {
  state = 'over'; showPlayUi(false);
  hostEnd();
  const mine = score[VIEW], theirs = score[1 - VIEW];
  const win = mine > theirs, draw = mine === theirs, rt = $('resultText');
  rt.textContent = draw ? '무승부' : win ? '승리' : '패배';
  rt.className = draw ? 'draw' : win ? 'win' : 'lose';
  $('fb').textContent = mine; $('fr').textContent = theirs;
  $('mine').textContent = player ? MAPS[curMap].name + ' · ' + player.h0.name + ' · ' + player.kos + '킬 ' + player.deaths + '데스' : MAPS[curMap].name;
  buildOverStats(win, draw);
  lobby.hidden = false; cv.classList.add('inLobby'); showScreen('overScreen');
  emoteWheel(false); chatOpen(false);
  winScreen(win, draw);
}
function toMenu() { netReset(); VIEW = 0; state = 'menu'; setup(false); showPlayUi(false); lobby.hidden = false; cv.classList.add('inLobby'); showScreen('menuScreen'); }
$('startBtn').addEventListener('click', startOnline);
$('againBtn').addEventListener('click', () => { if (state !== 'menu') { VIEW = 0; state = 'menu'; setup(false); } startOnline(); });
$('lobbyBtn').addEventListener('click', toMenu);
$('roomCancelBtn').addEventListener('click', () => { netReset(); showScreen('menuScreen'); });
$('goCosBtn').addEventListener('click', () => { showScreen('cosScreen'); renderCos(); });
$('cosBackBtn').addEventListener('click', () => showScreen('menuScreen'));
$('acctBtn').addEventListener('click', () => { const A = window.FFAuth; if (!A) return; try { if (PROF.guest) A.openLogin(); else A.openProfile(); } catch (e) {} });
tapBtnUi($('emoteBtn'), () => emoteWheel());
tapBtnUi($('chatBtn'), () => chatOpen(true));
$('chatSend').addEventListener('click', () => { sendChat($('chatInput').value); chatOpen(false); });
$('emoteWheel').addEventListener('pointerdown', e => e.stopPropagation());

/* ---------- input ---------- */
addEventListener('keydown', e => {
  if (state !== 'play') return;
  if (e.target && e.target.id === 'chatInput') {
    if (e.key === 'Enter') { if (!e.isComposing) { sendChat(e.target.value); chatOpen(false); } e.preventDefault(); }
    else if (e.key === 'Escape') chatOpen(false);
    return;
  }
  if (e.code === 'Enter' || e.code === 'NumpadEnter') { chatOpen(true); e.preventDefault(); return; }
  if (e.code === 'KeyV' && !e.repeat) { emoteWheel(); return; }
  const dg = /^Digit([1-8])$/.exec(e.code); if (dg && !$('emoteWheel').hidden) { const l = COS.emo.length ? COS.emo : [0, 1, 2, 3, 4, 5, 6, 7], i = l[+dg[1] - 1]; if (i != null) wantEmote(i); emoteWheel(false); return; }
  if (e.code === 'Escape') { pvCancelAll(); return; }
  if (PV_KEYS[e.code]) { if (e.code === 'Space') e.preventDefault(); if (!e.repeat) pvKeyDown(e.code); return; }      // press = show the picture, release = fire
  keys[e.code] = true;
  if (e.repeat) return;
  if (e.code.startsWith('Arrow')) e.preventDefault();
});
addEventListener('keyup', e => { keys[e.code] = false; pvKeyUp(e.code); });
addEventListener('blur', () => { for (const k in keys) keys[k] = false; mouse.down = false; pvCancelAll(); for (const c in PV.codes) pvKeyUp(c); });
cv.addEventListener('contextmenu', e => e.preventDefault());
function setStick(s, e) { const k = s === stickA ? SET.aim / 100 : 1; let dx = (e.clientX - s.ox) * k / 48, dy = (e.clientY - s.oy) * k / 48; const l = Math.hypot(dx, dy); if (l > 1) { dx /= l; dy /= l; } s.dx = dx; s.dy = dy; }
cv.addEventListener('pointerdown', e => {
  if (state !== 'play') return;
  try { cv.setPointerCapture(e.pointerId); } catch (err) {}
  if (e.pointerType === 'touch') {
    touchMode = true;
    const s = { id: e.pointerId, ox: e.clientX, oy: e.clientY, dx: 0, dy: 0 };
    if (e.clientX < W / 2) { if (!stickM) stickM = s; } else if (!stickA) stickA = s;
  } else {
    touchMode = false; mouse.x = e.clientX; mouse.y = e.clientY;
    if (e.button === 0) mouse.down = true; else if (e.button === 2) { if (pvAny()) pvCancelAll(); else wantUlt = true; }
  }
});
cv.addEventListener('pointermove', e => {
  if (e.pointerType === 'touch') {
    if (stickM && stickM.id === e.pointerId) setStick(stickM, e);
    else if (stickA && stickA.id === e.pointerId) setStick(stickA, e);
  } else { mouse.x = e.clientX; mouse.y = e.clientY; }
});
function pointerEnd(e) {
  if (e.pointerType === 'touch') {
    if (stickM && stickM.id === e.pointerId) stickM = null;
    else if (stickA && stickA.id === e.pointerId) {
      const l = Math.hypot(stickA.dx, stickA.dy);
      if (state === 'play' && e.type === 'pointerup') pendingFire = l > .3 ? { ang: Math.atan2(stickA.dy, stickA.dx) } : { auto: true };
      stickA = null;
    }
  } else if (e.button === 0 || e.type === 'pointercancel') mouse.down = false;
}
cv.addEventListener('pointerup', pointerEnd); cv.addEventListener('pointercancel', pointerEnd);
const tapBtn = (b, fn) => b.addEventListener('pointerdown', e => { e.preventDefault(); if (e.pointerType === 'touch') touchMode = true; fn(); });
for (const [b, t] of [[ultBtn, ['u']], [dashBtn, ['d']], [skBtn[0], ['s', 0]], [skBtn[1], ['s', 1]]]) {
  b.addEventListener('pointerdown', e => { e.preventDefault(); if (e.pointerType === 'touch') touchMode = true; pvTouchStart(t, b, e); });
  b.addEventListener('pointermove', e => { const p = PV.touch, k = SET.aim / 100; if (p && k !== 1 && p.id === e.pointerId) pvTouchMove({ pointerId: e.pointerId, clientX: p.ox + (e.clientX - p.ox) * k, clientY: p.oy + (e.clientY - p.oy) * k }); else pvTouchMove(e); }); b.addEventListener('pointerup', pvTouchEnd); b.addEventListener('pointercancel', pvTouchEnd);
}
soundBtn.addEventListener('click', () => { muted = !muted; soundBtn.textContent = muted ? '소리 끔' : '소리 켬'; });

/* ---------- loop ---------- */
let last = performance.now();
function frame(now) {
  lastFrameAt = performance.now();
  const dt = Math.min(.033, (now - last) / 1000); last = now;
  if (NET.role === 'guest' && state === 'play') { if (dt > 0) guestStep(dt); }
  else if (state !== 'over' && dt > 0 && !(performance.now() < hitStopUntil)) step(dt);
  netTick(dt);
  if (state === 'play') updateHud();
  render();
  if (!lobby.hidden) {
    if ($('menuScreen').classList.contains('active')) drawPortrait($('lobbyCharCanvas'), chosen, true);
    else if (viewing) drawPortrait($('weaponPortraitCanvas'), viewing, true);
  }
  requestAnimationFrame(frame);
}
/* a host whose tab is in the background still has to run the match for the others: timers keep it going (throttled, so it catches up in steps) */
let bgLast = performance.now(), lastFrameAt = performance.now();
setInterval(() => {
  const now = performance.now(), el = Math.min(1, (now - bgLast) / 1000); bgLast = now;
  if (NET.role !== 'host' || now - lastFrameAt < 250) return;      // the page stopped drawing (hidden tab, minimised window): keep the match going
  for (let t = el; t > 0; t -= .033) { if (state === 'play') step(Math.min(.033, t)); netTick(Math.min(.033, t)); }
}, 50);
addEventListener('beforeunload', () => netReset());
buildChars(); updatePick(); setup(false); loadAccount();
if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => lobbyCharPlace());
setTimeout(lobbyCharPlace, 60);
for (let i = 0; i < 90; i++) step(.033);
requestAnimationFrame(frame);
window.__arena = { get state() { return state; }, get score() { return score; }, get player() { return player; }, get fighters() { return fighters; }, step, MAPS, ROSTER, HEROES, useSkill, useUlt, render,
  setChar(id) { chosen = id; }, setMap(i) { mapChoice = i; }, auto(v) { AUTO = v; }, nearest, angTo, get NET() { return NET; }, get VIEW() { return VIEW; }, get PV() { return { sk: PV.sk, ult: PV.ult, dash: PV.dash }; }, get bullets() { return bullets; }, offline() { netReset(); startMatch(null); } };
})();
</script>
