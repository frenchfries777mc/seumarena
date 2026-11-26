/* ===== 칠면조 스킨 (season "The key of Turkey", user 2026-11-25): one concept 'tk' for every hero. Each hero gets its own turkey-themed outfit
   (tkPersona: head and chest), a feather cape behind the body (tkBack), its own weapon (tkHeld) and its own shots and swings (tkShot) for the
   basic attack, skills and ultimate; an awakened fighter's are the gold "roast" version of the same (glazed, steaming). Flat fills, no outlines. ===== */
const TKC = { br: '#6e3b1c', br2: '#8f5028', dk: '#3e1f0c', or: '#e8892e', rd: '#c0582a', gd: '#f2c14e', cr: '#fff3d0', bn: '#f3ead8', wt: '#e23b3b', bk: '#1a1410', lf: '#d9541e', lf2: '#f0a020', gn: '#6a8a2a' };
const TKA = { br: '#b8661c', br2: '#d98a2a', dk: '#7a4210', or: '#ffb02e', rd: '#ff8a1e', gd: '#ffd34d', cr: '#fff8d8', bn: '#fff6d0', wt: '#ff7a2a', bk: '#5a3008', lf: '#ffb02e', lf2: '#ffe27a', gn: '#d9b02a' };
const TK_FAN = ['#8a4a24', '#c0582a', '#e8892e', '#f2c14e', '#e8892e', '#c0582a', '#8a4a24'];
const TK_FANA = ['#c97a1e', '#ffb02e', '#ffd34d', '#fff3b0', '#ffd34d', '#ffb02e', '#c97a1e'];
let TK_AW = false;      // set while an awakened fighter's turkey art is drawn (gold roast colours)
const tkP = () => TK_AW ? TKA : TKC;
/* ---------- small pieces ---------- */
function tkFeather(c, x, y, a, len, w, col, eye) {      // one tail feather from (x,y) pointing at angle a
  c.save(); c.translate(x, y); c.rotate(a); c.fillStyle = col; c.beginPath(); c.ellipse(len / 2, 0, len / 2, w, 0, 0, 7); c.fill();
  if (eye) { c.fillStyle = eye; c.beginPath(); c.ellipse(len * .82, 0, w * .55, w * .55, 0, 0, 7); c.fill(); }
  c.restore();
}
function tkFan(c, x, y, R, n, a0, spread, t, aw) {      // a fan of tail feathers centred on angle a0
  const F = aw ? TK_FANA : TK_FAN;
  for (let i = 0; i < n; i++) { const k = n > 1 ? i / (n - 1) : .5, a = a0 - spread / 2 + k * spread + Math.sin((t || 0) * 3 + i) * .03; tkFeather(c, x, y, a, R, R * .2, F[Math.round(k * 6)], i % 2 ? (aw ? '#fff8d8' : '#fff3d0') : (aw ? '#ffe27a' : '#f8d88a')); }
}
function tkDrum(c, x, y, s, a) {      // a roast drumstick, bone end at +x
  const P = tkP(); c.save(); c.translate(x, y); c.rotate(a); c.scale(s, s);
  c.fillStyle = P.bn; c.fillRect(2, -1.6, 9, 3.2); c.beginPath(); c.arc(11.5, -2, 2.2, 0, 7); c.arc(11.5, 2, 2.2, 0, 7); c.fill();
  c.fillStyle = P.br2; c.beginPath(); c.ellipse(-4, 0, 8, 5.6, 0, 0, 7); c.fill(); c.fillStyle = P.rd; c.beginPath(); c.ellipse(-5, -1.6, 4.5, 2, -.2, 0, 7); c.fill();
  c.restore();
}
function tkLeaf(c, x, y, s, a, col) {      // a maple leaf (five points)
  c.save(); c.translate(x, y); c.rotate(a); c.scale(s, s); c.fillStyle = col || tkP().lf; c.beginPath();
  const pts = [[0, -10], [2.5, -4], [8, -6], [5.5, -1], [9, 2], [3, 2.5], [2.5, 7], [0, 4], [-2.5, 7], [-3, 2.5], [-9, 2], [-5.5, -1], [-8, -6], [-2.5, -4]];
  c.moveTo(pts[0][0], pts[0][1]); for (const p of pts) c.lineTo(p[0], p[1]); c.closePath(); c.fill();
  c.fillStyle = 'rgba(0,0,0,.18)'; c.fillRect(-.5, -2, 1, 11); c.restore();
}
function tkCorn(c, x, y, s, a) {      // a corn cob with husks, tip at +x
  const P = tkP(); c.save(); c.translate(x, y); c.rotate(a); c.scale(s, s);
  c.fillStyle = P.gn; c.beginPath(); c.moveTo(-8, 0); c.quadraticCurveTo(-2, -7, 6, -3); c.lineTo(-3, 0); c.quadraticCurveTo(-2, 7, 6, 3); c.closePath(); c.fill();
  c.fillStyle = P.gd; c.beginPath(); c.ellipse(4, 0, 8, 3.6, 0, 0, 7); c.fill();
  c.fillStyle = TK_AW ? '#fff3b0' : '#ffe27a'; for (let i = 0; i < 4; i++) { c.fillRect(-1 + i * 3, -2.4, 1.6, 1.6); c.fillRect(-.2 + i * 3, .6, 1.6, 1.6); }
  c.restore();
}
function tkPumpkin(c, x, y, r, stem) {
  const P = tkP(); c.save(); c.translate(x, y);
  c.fillStyle = P.rd; c.beginPath(); c.ellipse(-r * .45, 0, r * .6, r * .85, 0, 0, 7); c.ellipse(r * .45, 0, r * .6, r * .85, 0, 0, 7); c.fill();
  c.fillStyle = P.or; c.beginPath(); c.ellipse(0, 0, r * .62, r * .9, 0, 0, 7); c.fill();
  if (stem !== false) { c.fillStyle = P.gn; c.fillRect(-r * .12, -r * 1.15, r * .26, r * .4); }
  c.restore();
}
function tkPie(c, x, y, r, a) {      // a pumpkin pie seen from above, a slice gone
  const P = tkP(); c.save(); c.translate(x, y); c.rotate(a || 0);
  c.fillStyle = P.gd; c.beginPath(); c.arc(0, 0, r, .5, 6.1); c.lineTo(0, 0); c.closePath(); c.fill();
  c.fillStyle = P.or; c.beginPath(); c.arc(0, 0, r * .78, .5, 6.1); c.lineTo(0, 0); c.closePath(); c.fill();
  c.fillStyle = P.cr; c.beginPath(); c.arc(-r * .25, -r * .2, r * .16, 0, 7); c.fill(); c.restore();
}
function tkTurkeyHead(c, x, y, s, f) {      // a little turkey face (eyes, beak, red wattle), facing f
  const P = tkP(); c.save(); c.translate(x, y); c.scale(s * (f || 1), s);
  c.fillStyle = TK_AW ? '#ffd8b0' : '#f0c6b4'; c.beginPath(); c.arc(0, 0, 5, 0, 7); c.fill();
  c.fillStyle = P.wt; c.beginPath(); c.ellipse(3.2, 5, 1.8, 3.4, 0, 0, 7); c.fill(); c.beginPath(); c.ellipse(-.5, -5.6, 1.4, 2.2, 0, 0, 7); c.fill();
  c.fillStyle = P.or; c.beginPath(); c.moveTo(3, -.5); c.lineTo(8, 1); c.lineTo(3, 2.6); c.fill();
  c.fillStyle = P.bk; c.beginPath(); c.arc(1.6, -1.4, 1, 0, 7); c.fill(); c.restore();
}
function tkSteam(c, x, y, t, n) { c.save(); c.fillStyle = 'rgba(255,255,255,.35)'; for (let i = 0; i < (n || 3); i++) { const k = ((t * .8 + i / (n || 3)) % 1); c.globalAlpha = .55 * (1 - k); c.beginPath(); c.arc(x + Math.sin(t * 3 + i * 2) * 3 + (i - 1) * 4, y - k * 16, 2 + k * 3, 0, 7); c.fill(); } c.restore(); }
/* ---------- what each hero wears (head and chest), drawn over the head; f = which way it faces ---------- */
function tkCollar(c, hx, shy, f, col) { const P = tkP(); c.fillStyle = col || P.cr; c.beginPath(); c.moveTo(hx - 8, shy - 1); c.lineTo(hx + 8, shy - 1); c.lineTo(hx + 5, shy + 5); c.lineTo(hx, shy + 2); c.lineTo(hx - 5, shy + 5); c.closePath(); c.fill(); }
function tkPilgrim(c, hx, hy, r, s, band) {      // the tall pilgrim hat with a gold buckle
  const P = tkP(); s = s || 1; c.fillStyle = TK_AW ? '#3a2410' : '#2a2420'; c.fillRect(hx - r * 1.35 * s, hy - r * .78, r * 2.7 * s, r * .34);
  c.beginPath(); c.moveTo(hx - r * .82 * s, hy - r * .7); c.lineTo(hx - r * .7 * s, hy - r * 2.1 * s); c.lineTo(hx + r * .7 * s, hy - r * 2.1 * s); c.lineTo(hx + r * .82 * s, hy - r * .7); c.closePath(); c.fill();
  c.fillStyle = band || P.rd; c.fillRect(hx - r * .79 * s, hy - r * 1.15, r * 1.58 * s, r * .3); c.fillStyle = P.gd; c.fillRect(hx - r * .2, hy - r * 1.22, r * .4, r * .44); c.fillStyle = band || P.rd; c.fillRect(hx - r * .1, hy - r * 1.12, r * .2, r * .24);
}
function tkHood(c, hx, hy, r, f, t) {      // a turkey hood: brown cap over the head, the turkey's face on top, a little fan behind
  const P = tkP(); tkFan(c, hx - f * r * .3, hy - r * .4, r * 1.25, 5, -Math.PI / 2 - f * .5, 1.6, t, TK_AW);
  c.fillStyle = P.br; c.beginPath(); c.arc(hx, hy, r * 1.08, Math.PI * .92, Math.PI * 2.08); c.closePath(); c.fill();
  tkTurkeyHead(c, hx + f * r * .3, hy - r * 1.05, r * .1, f);
}
function tkWattleFace(c, hx, hy, r, f) { const P = tkP(); c.fillStyle = P.or; c.beginPath(); c.moveTo(hx + f * r * .7, hy - r * .05); c.lineTo(hx + f * r * 1.35, hy + r * .1); c.lineTo(hx + f * r * .7, hy + r * .3); c.fill(); c.fillStyle = P.wt; c.beginPath(); c.ellipse(hx + f * r * .85, hy + r * .62, r * .16, r * .34, 0, 0, 7); c.fill(); }
function tkPersona(c, wid, hx, hy, r, shy) {
  const f = (typeof PERSONA_FACE !== 'undefined' && PERSONA_FACE) || 1, P = tkP(), t = performance.now() / 1000;
  switch (wid) {
    case 'sword': {      // 칠면조 기사: a knight's helm shaped like a turkey (beak visor, wattle, a crest of tail feathers), a cream collar
      tkFan(c, hx - f * 2, hy - r * .9, r * 1.4, 5, -Math.PI / 2 - f * .2, 1.3, t, TK_AW);
      c.fillStyle = TK_AW ? '#ffe27a' : '#c9ced6'; c.beginPath(); c.arc(hx, hy, r * 1.08, Math.PI, Math.PI * 2); c.lineTo(hx + r * 1.08, hy + r * .35); c.lineTo(hx - r * 1.08, hy + r * .35); c.closePath(); c.fill();
      c.fillStyle = P.bk; c.fillRect(hx + f * r * .05 - (f < 0 ? r * .95 : 0), hy - r * .1, r * .95, r * .2);
      tkWattleFace(c, hx, hy, r, f); tkCollar(c, hx, shy, f, P.rd); return true; }
    case 'pistol': {      // 추수감사 제임스: pilgrim hat, white collar, a gold buckle belt
      tkPilgrim(c, hx, hy, r, 1); tkCollar(c, hx, shy, f); c.fillStyle = P.gd; c.fillRect(hx - 2.5, shy + 12, 5, 4); return true; }
    case 'bow': {      // 칠면조 사냥꾼 로빈: a feathered cap (three long turkey feathers), an autumn-leaf cloak clasp
      c.fillStyle = TK_AW ? '#d9a02a' : '#8a5a22'; c.beginPath(); c.moveTo(hx - r * 1.2, hy - r * .4); c.quadraticCurveTo(hx, hy - r * 1.9, hx + r * 1.25, hy - r * .4); c.closePath(); c.fill();
      for (let i = 0; i < 3; i++) tkFeather(c, hx - f * r * .5, hy - r * .9, -Math.PI / 2 - f * (.5 + i * .3), r * 1.9, r * .22, TK_FAN[2 + i], P.cr);
      tkLeaf(c, hx + f * 3, shy + 2, .55, .3); tkLeaf(c, hx - f * 4, shy + 3, .45, -.5, P.lf2); return true; }
    case 'shuriken': {      // 단풍 닌자: an orange mask with tails, a maple leaf on the brow
      c.fillStyle = P.rd; c.fillRect(hx - r * 1.05, hy - r * .55, r * 2.1, r * .5);
      c.save(); c.translate(hx - f * r, hy - r * .3); c.rotate(-f * .4 + Math.sin(t * 6) * .15); c.fillRect(-f * r * 1.5 - (f > 0 ? 0 : 0), -1.5, f * -r * .1 + r * 0, 3); c.restore();
      c.fillStyle = P.rd; c.beginPath(); c.moveTo(hx - f * r, hy - r * .4); c.quadraticCurveTo(hx - f * r * 2, hy - r * .1 + Math.sin(t * 7) * 2, hx - f * r * 2.6, hy + r * .5); c.lineTo(hx - f * r * 2.3, hy + r * .7); c.quadraticCurveTo(hx - f * r * 1.7, hy, hx - f * r, hy - r * .1); c.fill();
      tkLeaf(c, hx + f * r * .1, hy - r * .35, .38, 0, P.gd); c.fillStyle = P.dk; c.fillRect(hx - r * 1.02, hy + r * .1, r * 2.04, r * .55); return true; }
    case 'shotgun': {      // 옥수수 농부: a straw hat with a corn cob in the band, a checked neckerchief
      c.fillStyle = TK_AW ? '#ffe27a' : '#e6c46a'; c.beginPath(); c.ellipse(hx, hy - r * .55, r * 1.75, r * .38, 0, 0, 7); c.fill(); c.beginPath(); c.ellipse(hx, hy - r * .85, r * .9, r * .7, 0, Math.PI, Math.PI * 2); c.fill();
      c.fillStyle = P.rd; c.fillRect(hx - r * .9, hy - r * .78, r * 1.8, r * .22); tkCorn(c, hx - f * r * .4, hy - r * .95, .55, -f * .3);
      c.fillStyle = P.wt; c.beginPath(); c.moveTo(hx - 7, shy - 1); c.lineTo(hx + 7, shy - 1); c.lineTo(hx, shy + 7); c.fill(); return true; }
    case 'rifle': {      // 개척민 군인: a brown tricorne with a turkey feather, a cream collar
      c.fillStyle = TK_AW ? '#b87a1e' : P.dk; c.beginPath(); c.moveTo(hx - r * 1.45, hy - r * .55); c.lineTo(hx, hy - r * 1.85); c.lineTo(hx + r * 1.45, hy - r * .55); c.quadraticCurveTo(hx, hy - r * .1, hx - r * 1.45, hy - r * .55); c.fill();
      c.fillStyle = P.gd; c.fillRect(hx - r * 1.2, hy - r * .66, r * 2.4, r * .14); tkFeather(c, hx - f * r * .7, hy - r * .9, -Math.PI / 2 - f * .9, r * 1.6, r * .2, TK_FAN[3], P.cr); tkCollar(c, hx, shy, f); return true; }
    case 'smg': {      // 팝콘 요리사: a tall chef hat with a drumstick pin, a striped apron bib
      c.fillStyle = TK_AW ? '#fff3b0' : '#f4f1ea'; c.fillRect(hx - r * .85, hy - r * 1.55, r * 1.7, r * .95); c.beginPath(); c.arc(hx - r * .5, hy - r * 1.65, r * .6, 0, 7); c.arc(hx + r * .5, hy - r * 1.65, r * .6, 0, 7); c.arc(hx, hy - r * 1.95, r * .65, 0, 7); c.fill();
      tkDrum(c, hx + f * r * .3, hy - r * .95, .45, f > 0 ? -.4 : Math.PI + .4);
      c.fillStyle = '#f4f1ea'; c.fillRect(hx - 5, shy + 1, 10, 10); c.fillStyle = P.wt; c.fillRect(hx - 5, shy + 1, 2.5, 10); c.fillRect(hx, shy + 1, 2.5, 10); return true; }
    case 'gloves': {      // 칠면조 복서: the turkey hood (face on top, fan behind) and a red wattle-tassel robe collar
      tkHood(c, hx, hy, r, f, t); tkCollar(c, hx, shy, f, P.wt); return true; }
    case 'grenade': {      // 호박 폭발광: a hollowed pumpkin helmet with a vine, goggles
      tkPumpkin(c, hx, hy - r * .55, r * .95, true); c.fillStyle = P.gn; c.beginPath(); c.moveTo(hx + r * .1, hy - r * 1.55); c.quadraticCurveTo(hx + f * r * 1.2, hy - r * 2.1, hx + f * r * 1.4, hy - r * 1.3); c.lineTo(hx + f * r * 1.2, hy - r * 1.3); c.quadraticCurveTo(hx + f * r, hy - r * 1.8, hx + r * .1, hy - r * 1.4); c.fill();
      c.fillStyle = P.bk; c.fillRect(hx - r, hy - r * .15, r * 2, r * .3); c.fillStyle = P.gd; c.beginPath(); c.arc(hx + f * r * .45, hy, r * .3, 0, 7); c.fill(); return true; }
    case 'bazooka': {      // 로스트 포병: a helmet with a roast-turkey crest, two drumsticks crossed on the chest
      c.fillStyle = TK_AW ? '#c9a02a' : '#5d6b3a'; c.beginPath(); c.arc(hx, hy - r * .1, r * 1.12, Math.PI, Math.PI * 2); c.fill(); c.fillRect(hx - r * 1.3, hy - r * .2, r * 2.6, r * .25);
      c.fillStyle = P.br2; c.beginPath(); c.ellipse(hx, hy - r * 1.25, r * .75, r * .42, 0, 0, 7); c.fill(); c.fillStyle = P.bn; c.beginPath(); c.arc(hx - r * .75, hy - r * 1.4, r * .2, 0, 7); c.arc(hx + r * .75, hy - r * 1.4, r * .2, 0, 7); c.fill();
      tkDrum(c, hx, shy + 8, .42, -.7); tkDrum(c, hx, shy + 8, .42, Math.PI + .7); return true; }
    case 'wizard': {      // 수확의 마법사: a tall pointed hat in autumn brown, leaves on the band, a little pumpkin on the tip
      c.fillStyle = TK_AW ? '#c9861e' : '#6a3a1a'; c.beginPath(); c.moveTo(hx - r * 1.5, hy - r * .55); c.lineTo(hx - f * r * .6, hy - r * 3.1); c.lineTo(hx + r * 1.5, hy - r * .55); c.closePath(); c.fill();
      c.fillStyle = P.gd; c.fillRect(hx - r * 1.1, hy - r * 1.05, r * 2.2, r * .3); tkLeaf(c, hx - r * .5, hy - r * 1.0, .38, -.4); tkLeaf(c, hx + r * .4, hy - r * .95, .34, .5, P.lf2);
      tkPumpkin(c, hx - f * r * .6, hy - r * 3.1, r * .32, true); return true; }
    case 'magiccard': {      // 추수감사 마술사: a top hat with a fan of turkey feathers, a red bow tie
      c.fillStyle = TK_AW ? '#3a2410' : '#1d1a1e'; c.fillRect(hx - r * 1.25, hy - r * .78, r * 2.5, r * .28); c.fillRect(hx - r * .8, hy - r * 2.3, r * 1.6, r * 1.6);
      c.fillStyle = P.rd; c.fillRect(hx - r * .8, hy - r * 1.05, r * 1.6, r * .28); tkFan(c, hx + f * r * .45, hy - r * 1.1, r * 1.1, 5, -Math.PI / 2 + f * .25, 1.2, t, TK_AW);
      c.fillStyle = P.wt; c.beginPath(); c.moveTo(hx, shy + 1); c.lineTo(hx - 5, shy - 2); c.lineTo(hx - 5, shy + 4); c.closePath(); c.moveTo(hx, shy + 1); c.lineTo(hx + 5, shy - 2); c.lineTo(hx + 5, shy + 4); c.closePath(); c.fill(); return true; }
    case 'samurai': {      // 칠면조 사무라이: a kabuto whose crest is a turkey fan, wattle tassels on the chin cord
      tkFan(c, hx, hy - r * 1.05, r * 1.3, 7, -Math.PI / 2, 1.9, t, TK_AW);
      c.fillStyle = TK_AW ? '#d9a02a' : '#3a2416'; c.beginPath(); c.arc(hx, hy - r * .05, r * 1.12, Math.PI, Math.PI * 2); c.fill(); c.fillRect(hx - r * 1.55, hy - r * .15, r * 3.1, r * .3);
      c.fillStyle = P.gd; c.beginPath(); c.moveTo(hx, hy - r * 1.05); c.lineTo(hx - r * .9, hy - r * 1.7); c.lineTo(hx - r * .3, hy - r * .95); c.moveTo(hx, hy - r * 1.05); c.lineTo(hx + r * .9, hy - r * 1.7); c.lineTo(hx + r * .3, hy - r * .95); c.fill();
      c.fillStyle = P.wt; c.beginPath(); c.ellipse(hx + f * r * .8, hy + r * .9, r * .2, r * .38, 0, 0, 7); c.fill(); return true; }
    case 'harald': {      // 칠면조 하랄드: a viking helm with two drumsticks as horns, a braided ginger beard
      c.fillStyle = TK_AW ? '#ffe27a' : '#9aa1ab'; c.beginPath(); c.arc(hx, hy - r * .1, r * 1.1, Math.PI, Math.PI * 2); c.fill(); c.fillStyle = P.gd; c.fillRect(hx - r * 1.1, hy - r * .3, r * 2.2, r * .25);
      tkDrum(c, hx - r * 1.1, hy - r * 1.0, .5, -Math.PI / 2 - .5); tkDrum(c, hx + r * 1.1, hy - r * 1.0, .5, -Math.PI / 2 + .5);
      c.fillStyle = P.or; c.beginPath(); c.moveTo(hx - r * .6, hy + r * .3); c.lineTo(hx + r * .6, hy + r * .3); c.lineTo(hx + f * r * .1, hy + r * 1.6); c.closePath(); c.fill(); return true; }
    case 'shade': {      // 칠면조 네온: a glowing orange visor and a neon feather crest (its colours come from nnPal 'tk')
      const N = nnPal('tk'); c.save(); c.shadowColor = N.a; c.shadowBlur = 8; c.fillStyle = N.a; c.fillRect(hx - r * .2 + (f > 0 ? 0 : -r * .9), hy - r * .25, r * 1.2, r * .35);
      for (let i = 0; i < 5; i++) tkFeather(c, hx - f * r * .3, hy - r * .6, -Math.PI / 2 - f * (.2 + i * .25), r * 1.6, r * .14, i % 2 ? N.a : N.b, null); c.restore(); return true; }
    case 'tionis': {      // 칠면조 티오니스: a cook's cap with a feather and a white half-mask, the rest is a brown cloak
      c.fillStyle = TK_AW ? '#fff3b0' : '#f4f1ea'; c.beginPath(); c.ellipse(hx, hy - r * .9, r * 1.15, r * .55, 0, 0, 7); c.fill(); c.fillStyle = P.rd; c.fillRect(hx - r * 1.05, hy - r * .78, r * 2.1, r * .2);
      tkFeather(c, hx - f * r * .7, hy - r * .9, -Math.PI / 2 - f * .7, r * 1.4, r * .2, TK_FAN[2], P.cr);
      c.fillStyle = '#f4f4f4'; c.beginPath(); c.arc(hx, hy, r * .95, Math.PI / 2, Math.PI * 1.5); c.fill(); c.fillStyle = P.br; c.beginPath(); c.moveTo(hx - 9, shy); c.lineTo(hx + 9, shy); c.lineTo(hx + 6, shy + 10); c.lineTo(hx - 6, shy + 10); c.fill(); return true; }
    case 'gardener': {      // 호박밭 정원사: a wide straw hat with autumn leaves and a little pumpkin on the brim, a green neckerchief
      c.fillStyle = TK_AW ? '#ffe27a' : '#e6c46a'; c.beginPath(); c.ellipse(hx, hy - r * .5, r * 1.8, r * .4, 0, 0, 7); c.fill(); c.beginPath(); c.ellipse(hx, hy - r * .8, r * .95, r * .75, 0, Math.PI, Math.PI * 2); c.fill();
      c.fillStyle = P.gn; c.fillRect(hx - r * .95, hy - r * .75, r * 1.9, r * .22); tkLeaf(c, hx - f * r * .7, hy - r * .9, .42, -.6); tkLeaf(c, hx - f * r * .2, hy - r * 1.0, .36, .3, P.lf2); tkPumpkin(c, hx + f * r * .6, hy - r * .95, r * .32, true);
      c.fillStyle = P.gn; c.beginPath(); c.moveTo(hx - 7, shy - 1); c.lineTo(hx + 7, shy - 1); c.lineTo(hx, shy + 7); c.fill(); return true; }
    case 'herbal': {      // 크랜베리 약초꾼: an orange hood with wheat ears and a cranberry sprig, a belt of sauce jars
      c.fillStyle = TK_AW ? '#ffb02e' : '#c0582a'; c.beginPath(); c.arc(hx, hy - 1, r + 3, Math.PI * .85, Math.PI * 2.15); c.lineTo(hx - f * (r + 6), hy + 9); c.closePath(); c.fill();
      c.strokeStyle = P.gd; c.lineWidth = 1.6; for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(hx - f * 2, hy - r - 1); c.lineTo(hx - f * (5 + i * 3), hy - r - 9 + i); c.stroke(); c.fillStyle = P.gd; c.beginPath(); c.ellipse(hx - f * (5 + i * 3), hy - r - 9 + i, 1.4, 2.4, -f * .6, 0, 7); c.fill(); }
      c.fillStyle = TK_AW ? '#ff9a2a' : '#b3122a'; for (const [dx, dy] of [[3, -1], [5, 1], [2, 2]]) { c.beginPath(); c.arc(hx + f * (r * .3 + dx), hy - r - 2 + dy, 1.6, 0, 7); c.fill(); }
      for (const dx of [-5, 0, 5]) { c.fillStyle = TK_AW ? '#ff9a2a' : '#b3122a'; c.fillRect(hx + dx - 1.6, shy + 18, 3.2, 4); c.fillStyle = P.cr; c.fillRect(hx + dx - 1.8, shy + 17, 3.6, 1.4); } return true; }
    case 'shieldman': {      // 파이 방패병: a steel helm with a turkey-feather plume, a cream collar (the pie shield is in tkHeld)
      c.fillStyle = TK_AW ? '#ffe27a' : '#b9c1cb'; c.beginPath(); c.arc(hx, hy - 1, r + 1.5, Math.PI, 0); c.fill(); c.fillRect(hx - r - 1.5, hy - 1, 2 * r + 3, 3);
      for (let i = 0; i < 4; i++) tkFeather(c, hx - f * 1, hy - r - 1, -Math.PI / 2 - f * (.7 + i * .22) + Math.sin(t * 5) * .05, r * 1.8, r * .2, TK_FAN[1 + i], P.cr);
      tkCollar(c, hx, shy, f); return true; }
    case 'portalgun': {      // 오븐 차원여행자: oven-mitt goggles strap, a pie-tin halo ring that turns
      c.fillStyle = P.rd; c.fillRect(hx - r * 1.05, hy - r * .45, r * 2.1, r * .34); c.fillStyle = TK_AW ? '#fff3b0' : '#ffd08a'; c.beginPath(); c.arc(hx + f * r * .35, hy - r * .3, r * .38, 0, 7); c.fill(); c.fillStyle = P.dk; c.beginPath(); c.arc(hx + f * r * .35, hy - r * .3, r * .2, 0, 7); c.fill();
      c.save(); c.strokeStyle = P.gd; c.lineWidth = 2.4; c.setLineDash([3, 2]); c.lineDashOffset = -t * 12; c.beginPath(); c.ellipse(hx, hy - r * 1.55, r * 1.1, r * .32, 0, 0, 7); c.stroke(); c.restore(); return true; }
  }
  return false;
}
/* the feather cape behind the body (drawn before the stick figure), sized per hero */
function tkBack(c, id, t, f, aw) {
  TK_AW = !!aw; const big = { sword: 1.15, harald: 1.2, samurai: 1.1, gloves: 1, bazooka: 1.05 }[id] || .9;
  tkFan(c, -f * 3, -34, 26 * big, 7, -Math.PI / 2 - f * .25, 1.9, t, aw); TK_AW = false;
}
/* ---------- weapons (return true when drawn: drawHeldWeapon then skips its own) ---------- */
let TK_HD = false;      // 하랄드: hdShield/hdAxe draw the roasting-pan shield and the carving cleaver while this is set
function tkHdShield(c, rx, ry) { const P = tkP(); c.fillStyle = '#9aa1ab'; c.beginPath(); c.ellipse(0, 0, rx, ry, 0, 0, 7); c.fill(); c.fillStyle = '#6e757f'; c.beginPath(); c.ellipse(0, 0, rx * .82, ry * .84, 0, 0, 7); c.fill(); c.fillStyle = P.br2; c.beginPath(); c.ellipse(0, 0, rx * .62, ry * .6, 0, 0, 7); c.fill(); c.fillStyle = P.rd; c.beginPath(); c.ellipse(-rx * .15, -ry * .15, rx * .3, ry * .22, 0, 0, 7); c.fill(); }
function tkHdAxe(c) { const P = tkP(); c.strokeStyle = P.dk; c.lineWidth = 3.8; c.lineCap = 'round'; c.beginPath(); c.moveTo(-9, 0); c.lineTo(41, 0); c.stroke(); c.fillStyle = TK_AW ? '#ffe27a' : '#d4d9e1'; c.beginPath(); c.moveTo(28, -3); c.lineTo(50, -3); c.lineTo(50, 14); c.quadraticCurveTo(38, 17, 28, 12); c.closePath(); c.fill(); c.fillStyle = P.dk; c.beginPath(); c.arc(45, 2, 2, 0, 7); c.fill(); }
function tkHeld(c, wid, ax, ay, hx, hy, swing) {
  const P = tkP(), ang = Math.atan2(ay, ax), fl = ax < 0 ? -1 : 1, t = performance.now() / 1000;
  if (wid === 'harald') { TK_HD = true; try { drawHaraldBody(c, ax, ay); } finally { TK_HD = false; } return true; }
  if (wid === 'bow') {      // a bow of autumn wood with leaves at the tips, a corn arrow on the string
    c.save(); c.translate(hx, hy); c.scale(fl, 1); c.lineCap = 'round';
    c.strokeStyle = TK_AW ? '#d9a02a' : '#8a5a22'; c.lineWidth = 3.4; c.beginPath(); c.moveTo(-2, -20); c.quadraticCurveTo(14, 0, -2, 20); c.stroke();
    c.strokeStyle = P.cr; c.lineWidth = 1; c.beginPath(); c.moveTo(-2, -20); c.lineTo(-4, 0); c.lineTo(-2, 20); c.stroke();
    tkLeaf(c, -2, -21, .5, -.4); tkLeaf(c, -2, 21, .5, Math.PI + .4, P.lf2); tkCorn(c, 10, 0, .7, 0); tkFeather(c, -4, 0, Math.PI - .35, 9, 2, P.or); tkFeather(c, -4, 0, Math.PI + .35, 9, 2, P.rd);
    c.restore(); return true; }
  if (wid === 'tionis') {      // a white-and-brown turkey theatre mask in hand
    c.save(); c.translate(hx + Math.cos(ang) * 14, hy + Math.sin(ang) * 14);
    c.fillStyle = '#f4f4f4'; c.beginPath(); c.arc(0, 0, 6.5, Math.PI / 2, Math.PI * 1.5); c.fill(); c.fillStyle = P.br; c.beginPath(); c.arc(0, 0, 6.5, -Math.PI / 2, Math.PI / 2); c.fill();
    c.fillStyle = P.wt; c.beginPath(); c.ellipse(2.5, 4.5, 1.4, 2.6, 0, 0, 7); c.fill(); c.fillStyle = P.or; c.beginPath(); c.moveTo(1, 0); c.lineTo(5.5, 1); c.lineTo(1, 2); c.fill();
    tkFan(c, 0, -3, 7, 5, -Math.PI / 2, 1.6, t, TK_AW); c.restore(); return true; }
  if (wid === 'gardener') {      // a forked-branch slingshot with a roast chestnut in the pouch
    c.save(); c.translate(hx, hy); c.rotate(ang); c.strokeStyle = TK_AW ? '#d9a02a' : '#8a5a22'; c.lineWidth = 2.8; c.lineCap = 'round';
    c.beginPath(); c.moveTo(-4, 0); c.lineTo(5, 0); c.lineTo(10, -6); c.moveTo(5, 0); c.lineTo(10, 6); c.stroke(); tkLeaf(c, 10, -7, .3, 0); const pull = swing > 0 ? Math.sin(Math.min(1, swing) * Math.PI) : 0, bx = 10 - pull * 14;
    c.strokeStyle = P.rd; c.lineWidth = 1.2; c.beginPath(); c.moveTo(10, -6); c.lineTo(bx, 0); c.lineTo(10, 6); c.stroke(); c.fillStyle = P.dk; c.beginPath(); c.ellipse(bx, 0, 2.6, 3, 0, 0, 7); c.fill(); c.restore(); return true; }
  if (wid === 'herbal') {      // a jar of cranberry sauce with a cloth lid
    c.save(); c.translate(hx + 2, hy - 2); c.fillStyle = 'rgba(235,240,245,.8)'; c.beginPath(); c.roundRect(-4.5, -5, 9, 11, 2); c.fill(); c.fillStyle = TK_AW ? '#ff9a2a' : '#b3122a'; c.beginPath(); c.roundRect(-3.6, -2, 7.2, 7.4, 1.6); c.fill();
    c.fillStyle = P.or; c.fillRect(-5.5, -7, 11, 3); c.fillStyle = P.cr; c.fillRect(-1, -7, 2, 3); c.restore(); return true; }
  if (wid === 'shieldman') {      // a roasting spit for a spear (a drumstick on it) and a pumpkin-pie shield
    const f = ax < 0 ? -1 : 1; c.save(); c.translate(hx, hy); c.rotate(ang); c.strokeStyle = TK_AW ? '#fff3b0' : '#b9c1cb'; c.lineWidth = 2.4; c.lineCap = 'round'; c.beginPath(); c.moveTo(-12, 0); c.lineTo(30, 0); c.stroke();
    c.fillStyle = TK_AW ? '#fff3b0' : '#d6dde3'; c.beginPath(); c.moveTo(34, 0); c.lineTo(28, -3); c.lineTo(28, 3); c.closePath(); c.fill(); tkDrum(c, 16, 0, .55, Math.PI); c.restore();
    c.save(); c.translate(f * 9, -30); c.scale(.62, 1.35); tkPie(c, 0, 0, 10, Math.PI * .5); c.restore(); return true; }
  const w = WEAPONS[wid]; if (!w) return false;
  const a2 = ang + (w.shape === 'club' ? ((swing || 0) - .5) * 1.1 : 0);
  c.save(); c.translate(hx, hy); c.rotate(a2); if (fl < 0) c.scale(1, -1); c.lineCap = 'round';
  let ok = true;
  switch (wid) {
    case 'sword':      // a greatsword whose blade is a long glazed roast and whose pommel is the bone
      c.fillStyle = P.bn; c.fillRect(-7, -1.6, 9, 3.2); c.beginPath(); c.arc(-8, -2, 2.3, 0, 7); c.arc(-8, 2, 2.3, 0, 7); c.fill();
      c.fillStyle = P.gd; c.fillRect(2, -6, 3, 12);
      c.fillStyle = P.br2; c.beginPath(); c.moveTo(5, -4); c.quadraticCurveTo(20, -6.5, 36, -1.5); c.lineTo(38, 0); c.lineTo(36, 1.5); c.quadraticCurveTo(20, 6.5, 5, 4); c.closePath(); c.fill();
      c.fillStyle = P.rd; c.beginPath(); c.moveTo(7, -2.5); c.quadraticCurveTo(20, -4, 33, -1); c.lineTo(33, 0); c.quadraticCurveTo(20, -1, 7, 0); c.closePath(); c.fill();
      if (TK_AW) tkSteam(c, 22, -6, t, 3); break;
    case 'pistol':      // a gravy baster: red bulb, clear tube half full of gravy
      c.fillStyle = P.wt; c.beginPath(); c.ellipse(-3, 0, 5.5, 4.2, 0, 0, 7); c.fill(); c.fillStyle = 'rgba(235,240,245,.85)'; c.fillRect(2, -2.4, 20, 4.8);
      c.fillStyle = P.br; c.fillRect(2, -.4, 17, 2.8); c.fillStyle = 'rgba(235,240,245,.9)'; c.beginPath(); c.moveTo(22, -2.4); c.lineTo(27, -1); c.lineTo(27, 1); c.lineTo(22, 2.4); c.fill();
      c.fillStyle = '#2a2b30'; c.fillRect(-1, 2, 4, 6); break;
    case 'shuriken': tkLeaf(c, 9, 0, .85, t * 3, P.lf); tkLeaf(c, 9, 0, .45, t * 3 + .6, P.lf2); break;
    case 'shotgun':      // a cornucopia blunderbuss: a wicker horn for a barrel, corn spilling at the muzzle
      c.fillStyle = TK_AW ? '#d9a02a' : '#8a5a22'; c.fillRect(-10, -2, 10, 5); c.fillStyle = TK_AW ? '#ffd34d' : '#c99a4a';
      c.beginPath(); c.moveTo(-2, -2.5); c.quadraticCurveTo(14, -4, 28, -8); c.lineTo(28, 8); c.quadraticCurveTo(14, 4, -2, 3); c.closePath(); c.fill();
      c.strokeStyle = TK_AW ? '#b87a1e' : '#8a5a22'; c.lineWidth = 1; for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(4 + i * 6, -3 - i * 1.2); c.lineTo(4 + i * 6, 3 + i * 1.2); c.stroke(); }
      tkCorn(c, 30, -3, .4, -.3); c.fillStyle = P.or; c.beginPath(); c.arc(29, 4, 2.6, 0, 7); c.fill(); break;
    case 'rifle':      // a pilgrim musket: long wooden stock, flared brass muzzle, a turkey feather tied on
      c.fillStyle = TK_AW ? '#d9a02a' : '#7a4a22'; c.beginPath(); c.moveTo(-13, -2); c.lineTo(10, -2.5); c.lineTo(10, 2.5); c.lineTo(-13, 5); c.closePath(); c.fill();
      c.fillStyle = TK_AW ? '#fff3b0' : '#4a4d55'; c.fillRect(6, -2, 24, 2.6); c.fillStyle = P.gd; c.beginPath(); c.moveTo(29, -2.6); c.lineTo(34, -4); c.lineTo(34, 2.4); c.lineTo(29, 1); c.fill();
      tkFeather(c, 4, 3, 2.2, 10, 2, P.or, P.cr); break;
    case 'smg':      // a popcorn popper: a red-and-white striped box gun with popcorn heaped on top
      for (let i = 0; i < 5; i++) { c.fillStyle = i % 2 ? '#f4f1ea' : P.wt; c.fillRect(-4 + i * 4, -4, 4, 8); } c.fillStyle = '#2a2b30'; c.fillRect(16, -1.6, 10, 3.2); c.fillRect(0, 3, 3.5, 5);
      for (let i = 0; i < 5; i++) { c.fillStyle = i % 2 ? '#fff8e0' : P.cr; c.beginPath(); c.arc(-2 + i * 4, -5 - (i % 2) * 1.5, 2.4, 0, 7); c.fill(); } break;
    case 'gloves':      // a quilted orange oven mitt
      c.fillStyle = P.or; c.beginPath(); c.ellipse(9, 0, 8, 6.4, 0, 0, 7); c.fill(); c.beginPath(); c.ellipse(6, -6, 3, 2.4, -.5, 0, 7); c.fill();
      c.fillStyle = P.cr; c.fillRect(0, -5, 3, 10); c.strokeStyle = P.rd; c.lineWidth = .8; c.beginPath(); c.moveTo(6, -5); c.lineTo(13, 5); c.moveTo(10, -6); c.lineTo(16, 2); c.stroke(); break;
    case 'grenade': c.rotate(-a2 * (fl < 0 ? -1 : 1)); tkPumpkin(c, 12 * Math.cos(a2), 12 * Math.sin(a2) * fl, 7, true); c.fillStyle = P.gd; c.fillRect(12 * Math.cos(a2) - 1, 12 * Math.sin(a2) * fl - 11, 2, 3); break;
    case 'bazooka':      // a launcher painted like a roast turkey: glazed brown tube, drumstick bones at both ends
      c.fillStyle = P.br2; c.fillRect(-12, -4.6, 38, 9.2); c.fillStyle = P.rd; c.fillRect(-12, -4.6, 38, 2.6); c.fillStyle = P.bn; c.beginPath(); c.arc(-13, -3, 2.6, 0, 7); c.arc(-13, 3, 2.6, 0, 7); c.arc(27, -3, 2.6, 0, 7); c.arc(27, 3, 2.6, 0, 7); c.fill();
      c.fillStyle = P.dk; c.fillRect(2, 4, 4, 6); if (TK_AW) tkSteam(c, 10, -6, t, 3); break;
    case 'wizard':      // a gnarled staff with a cornucopia head and a glowing little pumpkin in it
      c.strokeStyle = TK_AW ? '#d9a02a' : '#6a3a1a'; c.lineWidth = 3; c.beginPath(); c.moveTo(-10, 0); c.lineTo(24, 0); c.stroke();
      c.fillStyle = TK_AW ? '#ffd34d' : '#c99a4a'; c.beginPath(); c.moveTo(22, -2); c.quadraticCurveTo(28, -9, 36, -8); c.lineTo(36, 8); c.quadraticCurveTo(28, 9, 22, 2); c.closePath(); c.fill();
      tkPumpkin(c, 36, 0, 4.4, true); c.save(); c.globalAlpha = .35 + .15 * Math.sin(t * 5); c.fillStyle = P.gd; c.beginPath(); c.arc(36, 0, 9, 0, 7); c.fill(); c.restore(); break;
    case 'magiccard': tkCard(c, 9, 0, 1, 0); break;
    case 'samurai':      // a long carving knife: wide steel blade, wooden handle with brass rivets
      c.fillStyle = TK_AW ? '#d9a02a' : '#5a3418'; c.fillRect(-8, -2.2, 12, 4.4); c.fillStyle = P.gd; c.fillRect(-5, -.6, 1.6, 1.6); c.fillRect(0, -.6, 1.6, 1.6);
      c.fillStyle = TK_AW ? '#fff3b0' : '#dfe4ec'; c.beginPath(); c.moveTo(4, -2.4); c.lineTo(32, -2.4); c.quadraticCurveTo(38, -1, 39, 1); c.lineTo(4, 4.5); c.closePath(); c.fill();
      c.fillStyle = 'rgba(255,255,255,.7)'; c.fillRect(6, -2.4, 24, 1.1); break;
    case 'shade': ok = false; break;      // (네온: the base blade, coloured by nnPal 'tk')
    case 'portalgun':      // an oven-orange gun with a pie-tin ring floating at the muzzle
      c.fillStyle = P.rd; c.fillRect(-4, -3.5, 18, 7); c.fillStyle = P.or; c.fillRect(-4, -3.5, 18, 2.4); c.fillStyle = '#2a2b30'; c.fillRect(-1, 3, 4, 6);
      c.save(); c.translate(22, 0); c.rotate(t * 3); c.strokeStyle = P.gd; c.lineWidth = 2.6; c.setLineDash([3, 2]); c.beginPath(); c.ellipse(0, 0, 4, 8, 0, 0, 7); c.stroke(); c.restore(); break;
    default: ok = false;
  }
  c.restore(); return ok;
}
function tkCard(c, x, y, s, a) {      // a playing card whose back is a turkey fan on orange
  const P = tkP(); c.save(); c.translate(x, y); c.rotate(a); c.scale(s, s);
  c.fillStyle = P.cr; c.beginPath(); c.roundRect(-7, -10, 14, 20, 2.4); c.fill(); c.fillStyle = P.or; c.beginPath(); c.roundRect(-5.6, -8.6, 11.2, 17.2, 1.6); c.fill();
  tkFan(c, 0, 4, 6.5, 5, -Math.PI / 2, 2, 0, TK_AW); c.fillStyle = P.br; c.beginPath(); c.arc(0, 4, 2.6, 0, 7); c.fill(); c.restore();
}
/* ---------- shots and swings. kind: 0 basic, 1 skill, 2 ultimate; aw: awakened (gold roast) ---------- */
function tkKind(b) { const s = b.src || ''; return /^궁극기/.test(s) || b.ult ? 2 : /^\d스킬/.test(s) ? 1 : 0; }
function tkShot(b) {
  const swing = b.swingAngle !== undefined, k = tkKind(b), aw = !!b.aw, t = performance.now() / 1000;
  TK_AW = aw; const P = tkP();
  try {
    if (swing) { tkSwing(b, k, aw, t); return true; }
    if (b.dmgless) return false;
    const a = Math.atan2(b.vy || 0, b.vx || 1), sc = (k === 2 ? 1.7 : k === 1 ? 1.3 : 1) * Math.min(2.2, b.scale || 1);
    tkTrail(b, a, k, aw, sc);
    ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(a); ctx.scale(sc, sc);
    switch (b.wid) {
      case 'pistol': ctx.fillStyle = P.br; ctx.beginPath(); ctx.moveTo(9, 0); ctx.quadraticCurveTo(0, -6, -6, -4.6); ctx.arc(-6, 0, 4.6, -Math.PI / 2, Math.PI / 2, true); ctx.quadraticCurveTo(0, 6, 9, 0); ctx.fill(); ctx.fillStyle = P.cr; ctx.beginPath(); ctx.arc(-6, -1.6, 1.4, 0, 7); ctx.fill(); break;      // a drop of gravy
      case 'bow': tkCorn(ctx, 4, 0, 1.05, 0); tkFeather(ctx, -6, 0, Math.PI - .35, 10, 2.4, P.or); tkFeather(ctx, -6, 0, Math.PI + .35, 10, 2.4, P.rd); tkFeather(ctx, -6, 0, Math.PI, 11, 2.4, P.gd); break;      // a corn-cob arrow with turkey fletching
      case 'shuriken': ctx.rotate(t * 18); tkLeaf(ctx, 0, 0, 1, 0, k ? P.lf2 : P.lf); break;      // a spinning maple leaf
      case 'shotgun': ctx.fillStyle = P.gd; ctx.beginPath(); ctx.ellipse(0, 0, 4.4, 3.4, 0, 0, 7); ctx.fill(); ctx.fillStyle = TK_AW ? '#fff3b0' : '#fff0a0'; ctx.beginPath(); ctx.arc(1.4, -1, 1.2, 0, 7); ctx.fill(); break;      // a corn kernel
      case 'rifle': ctx.fillStyle = TK_AW ? '#ff9a2a' : '#b3122a'; ctx.beginPath(); ctx.arc(0, 0, 4.2, 0, 7); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.beginPath(); ctx.arc(-1.2, -1.4, 1.2, 0, 7); ctx.fill(); break;      // a cranberry
      case 'smg': ctx.rotate(t * 9 + b.x * .01); ctx.fillStyle = TK_AW ? '#fff3b0' : '#fff8e0'; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(Math.cos(i * 1.6) * 2.4, Math.sin(i * 1.6) * 2.4, 2.6, 0, 7); ctx.fill(); } ctx.fillStyle = P.gd; ctx.beginPath(); ctx.arc(0, 0, 1.4, 0, 7); ctx.fill(); break;      // a piece of popcorn
      case 'grenade': ctx.rotate(-a + t * 6); tkPumpkin(ctx, 0, 0, 7, true); ctx.fillStyle = P.gd; ctx.fillRect(-1, -11, 2, 3); break;      // a little pumpkin
      case 'bazooka': ctx.save(); ctx.scale(1.1, 1.1); ctx.fillStyle = P.br2; ctx.beginPath(); ctx.ellipse(0, 0, 11, 7.5, 0, 0, 7); ctx.fill(); ctx.fillStyle = P.rd; ctx.beginPath(); ctx.ellipse(1, -2.6, 7, 3, 0, 0, 7); ctx.fill(); ctx.fillStyle = P.bn; ctx.beginPath(); ctx.arc(-11, -4, 2.2, 0, 7); ctx.arc(-11, 4, 2.2, 0, 7); ctx.fill(); ctx.restore(); if (aw) tkSteam(ctx, 0, -8, t, 3); break;      // a flying roast turkey
      case 'wizard': { const pulse = 1 + Math.sin(t * 14) * .08; ctx.fillStyle = hexA(P.or, .35); ctx.beginPath(); ctx.arc(0, 0, 13 * pulse, 0, 7); ctx.fill(); ctx.rotate(-a); tkPumpkin(ctx, 0, 0, 7, true); ctx.fillStyle = P.dk; ctx.beginPath(); ctx.moveTo(-3, -1); ctx.lineTo(-1.5, -3); ctx.lineTo(0, -1); ctx.moveTo(0, -1); ctx.lineTo(1.5, -3); ctx.lineTo(3, -1); ctx.fill(); ctx.fillRect(-3, 2, 6, 1.4); break; }      // a jack-o'-lantern fireball
      case 'magiccard': ctx.rotate(Math.PI / 2 + t * 10); tkCard(ctx, 0, 0, .9, 0); break;
      case 'tionis': ctx.rotate(-a); ctx.fillStyle = '#f4f4f4'; ctx.beginPath(); ctx.arc(0, 0, 7, Math.PI / 2, Math.PI * 1.5); ctx.fill(); ctx.fillStyle = P.br; ctx.beginPath(); ctx.arc(0, 0, 7, -Math.PI / 2, Math.PI / 2); ctx.fill(); ctx.fillStyle = P.wt; ctx.beginPath(); ctx.ellipse(3, 5, 1.4, 2.6, 0, 0, 7); ctx.fill(); break;
      case 'portalgun': ctx.rotate(t * 8); ctx.strokeStyle = P.gd; ctx.lineWidth = 3; ctx.setLineDash([3, 2]); ctx.beginPath(); ctx.arc(0, 0, 6, 0, 7); ctx.stroke(); ctx.setLineDash([]); ctx.fillStyle = P.or; ctx.beginPath(); ctx.arc(0, 0, 3.4, 0, 7); ctx.fill(); break;      // a spinning pie tin
      case 'gardener': ctx.rotate(t * 8); ctx.fillStyle = P.dk; ctx.beginPath(); ctx.ellipse(0, 0, 4.6, 4, 0, 0, 7); ctx.fill(); ctx.fillStyle = P.gd; ctx.beginPath(); ctx.ellipse(0, 2.2, 4, 1.6, 0, 0, 7); ctx.fill(); break;      // a roast chestnut
      case 'herbal': ctx.rotate(-a + t * 7); ctx.fillStyle = 'rgba(235,240,245,.85)'; ctx.beginPath(); ctx.roundRect(-4.5, -5, 9, 10, 2); ctx.fill(); ctx.fillStyle = TK_AW ? '#ff9a2a' : '#b3122a'; ctx.fillRect(-3.6, -2, 7.2, 6.4); ctx.fillStyle = P.or; ctx.fillRect(-5.5, -7, 11, 3); break;      // a jar of cranberry sauce
      default: tkDrum(ctx, 0, 0, .9, Math.PI);
    }
    if (k === 2 || aw) { ctx.rotate(t * 4); ctx.fillStyle = hexA(aw ? '#fff3b0' : P.gd, .9); for (let i = 0; i < 4; i++) { const q = i * Math.PI / 2; ctx.fillRect(Math.cos(q) * 13 - 1, Math.sin(q) * 13 - 3, 2, 6); } }
    ctx.restore();
  } finally { TK_AW = false; }
  return true;
}
function tkTrail(b, a, k, aw, sc) {      // behind every shot: a few tumbling feathers (skills add leaves, the ultimate a ring of feathers; awakened: steam and sparkles)
  const P = tkP(), sp = Math.hypot(b.vx || 0, b.vy || 0); if (sp < 50) return;
  const ux = Math.cos(a), uy = Math.sin(a), now = performance.now() / 1000;
  ctx.save(); for (let i = 1; i <= (k ? 4 : 3); i++) { const d = i * 9 * sc, j = Math.sin(now * 20 + i * 2) * 4; ctx.globalAlpha = .8 - i * .15; tkFeather(ctx, b.x - ux * d - uy * j, b.y - uy * d + ux * j, a + Math.PI + Math.sin(now * 9 + i) * .5, 8 * sc * (1 - i * .12), 1.8 * sc, i % 2 ? P.or : (k === 1 ? P.lf : P.rd)); }
  ctx.restore();
  if (typeof skP === 'function' && Math.random() < (k ? .5 : .25)) skP({ x: b.x - ux * 10, y: b.y - uy * 10, vx: -ux * 40 + RND(-40, 40), vy: -uy * 40 + RND(-40, 40), life: RND(.4, .7), size: RND(4, 7), color: aw ? '#ffd34d' : (k === 1 ? TKC.lf : TKC.or), shape: k === 1 ? 'tkleaf' : 'tkfeather', rot: RND(0, 6), vr: RND(-6, 6), grav: 40, drag: 2, add: false });
  if (aw && typeof skP === 'function' && Math.random() < .5) skP({ x: b.x + RND(-6, 6), y: b.y + RND(-6, 6), vx: RND(-20, 20), vy: RND(-60, -20), life: RND(.4, .8), size: RND(3, 5), color: '#ffffff', shape: 'smoke', add: false });
}
function tkSwing(b, k, aw, t) {      // a melee swing: an arc of tail feathers sweeping round (gloves: a mitt-shaped puff; harald: a cleaver arc)
  const a = b.swingAngle, cx = b.x - Math.cos(a) * 30, cy = b.y - Math.sin(a) * 30, q = b.life0 ? clamp(b.life / b.life0, 0, 1) : 1, R = (b.wid === 'gloves' ? 40 : b.wid === 'harald' ? 70 : 62) * (k === 2 ? 1.25 : 1);
  const F = aw ? TK_FANA : TK_FAN, n = b.wid === 'gloves' ? 5 : 9, sp = b.wid === 'gloves' ? 1.1 : 1.8;
  ctx.save(); ctx.globalAlpha = Math.min(1, q * 1.6);
  if (b.wid === 'shade') { const N = nnPal('tk'); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = hexA(N.a, .7 * q); ctx.lineWidth = 8 * q + 2; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(cx, cy, R + 14, a - .9, a + .9); ctx.stroke(); ctx.globalCompositeOperation = 'source-over'; }
  for (let i = 0; i < n; i++) { const kk = i / (n - 1), qa = a - sp / 2 + kk * sp + (1 - q) * .25; tkFeather(ctx, cx + Math.cos(qa) * R * .35, cy + Math.sin(qa) * R * .35, qa, R * (.75 + .25 * Math.sin(kk * Math.PI)), R * .09, F[Math.round(kk * 6)], aw ? '#fff8d8' : '#fff3d0'); }
  if (b.wid === 'harald') { ctx.fillStyle = aw ? '#ffe27a' : '#d4d9e1'; ctx.beginPath(); ctx.arc(cx, cy, R * 1.05, a - .8, a + .8); ctx.arc(cx, cy, R * .9, a + .8, a - .8, true); ctx.closePath(); ctx.fill(); }
  if (b.wid === 'gloves') { TK_AW = aw; ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(a); ctx.scale(1.4, 1.4); ctx.fillStyle = tkP().or; ctx.beginPath(); ctx.ellipse(0, 0, 8, 6.4, 0, 0, 7); ctx.fill(); ctx.restore(); }
  if (b.wid === 'samurai' && k) { ctx.strokeStyle = aw ? '#fff3b0' : '#dfe4ec'; ctx.lineWidth = 3 * q; ctx.beginPath(); ctx.moveTo(b.x - 26, b.y - 26); ctx.lineTo(b.x + 26, b.y + 26); ctx.moveTo(b.x + 26, b.y - 26); ctx.lineTo(b.x - 26, b.y + 26); ctx.stroke(); }
  ctx.restore();
  if (typeof skP === 'function' && Math.random() < .5) { const qa = a + RND(-.8, .8); skP({ x: cx + Math.cos(qa) * R, y: cy + Math.sin(qa) * R, vx: Math.cos(qa) * RND(60, 160), vy: Math.sin(qa) * RND(60, 160) - 40, life: RND(.5, .9), size: RND(5, 8), color: aw ? '#ffd34d' : TKC.or, shape: 'tkfeather', rot: qa, vr: RND(-5, 5), grav: 60, drag: 1.6, add: false }); }
}
/* the two particle pictures (fxengine.js drawParticles: shape 'tkfeather' / 'tkleaf') */
function tkPart(q, a) { ctx.save(); ctx.globalAlpha = Math.min(1, a * 1.6); if (q.shape === 'tkleaf') tkLeaf(ctx, q.x, q.y, q.size / 9, q.rot || 0, q.color); else tkFeather(ctx, q.x, q.y, q.rot || 0, q.size * 1.8, q.size * .35, q.color, '#fff3d0'); ctx.restore(); }
let TK_DRAW_AW = false;      // the fighter being drawn is awakened (tail.js drawFighter sets it round drawStick)
