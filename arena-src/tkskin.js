/* ===== 칠면조 스킨 in the match (season "The key of Turkey", user 2026-11-25). The pictures are art/tkart.js. While a fighter in a turkey skin
   attacks or uses a skill or ultimate (engine.js awOwn sets tkCur), every effect colour it makes turns to the turkey colours (awakened: the gold
   roast ones) and its effects throw a few feathers (skills: autumn leaves too). The host sends the recoloured effects, so guests see the same. ===== */
function tkOf(f) {
  if (!f || !f.h || !f.cos) return false;
  if (f._tkCos === f.cos && f._tkId === f.h.id) return f._tk;
  f._tkCos = f.cos; f._tkId = f.h.id; const sk = skinOf(f.cos, f.h.id); return f._tk = !!(sk && conceptOfSkin(sk) === 'tk');
}
const TK_RECOL = ['#e8892e', '#c0582a', '#f2c14e', '#d9541e', '#ffb35a'], TK_RECOLA = ['#ffd34d', '#ffb02e', '#fff3b0', '#ff9a1e', '#ffe27a'];
function tkCol(c, aw) { if (typeof c !== 'string' || c[0] !== '#') return c; if (/^#f{3,6}$/i.test(c)) return aw ? '#fff8d8' : '#fff3d0'; let h = 0; for (let i = 0; i < c.length; i++) h = (h * 31 + c.charCodeAt(i)) | 0; return (aw ? TK_RECOLA : TK_RECOL)[Math.abs(h) % 5]; }
let tkFxT = 0;
function tkFx(type, x, y, ex) {
  const aw = !!awCur; ex = Object.assign({}, ex || {});
  if (ex.color) ex.color = tkCol(ex.color, aw); if (ex.col) ex.col = tkCol(ex.col, aw);
  if (time - tkFxT > .06) { tkFxT = time; const s = String(SRC || ''); fxPlay('tkf', Math.round(x), Math.round(y), /^궁극기/.test(s) ? 2 : /^\d스킬/.test(s) ? 1 : 0, aw ? 1 : 0); }
  return ex;
}
FXF.tkf = (x, y, k, aw) => {      // a puff of feathers (skill: and maple leaves; ultimate: a ring of them and a flash; awakened: gold, with steam)
  if (typeof addP !== 'function' || (typeof visibleAt === 'function' && !visibleAt(x, y))) return;
  const n = (k === 2 ? 16 : k === 1 ? 9 : 5) * ((typeof lowFx === 'function' && lowFx()) ? .5 : 1), C = aw ? TK_RECOLA : TK_RECOL;
  for (let i = 0; i < n; i++) { const a = Math.random() * 6.283, sp = RND(80, k === 2 ? 340 : 200), leaf = k === 1 && i % 2; addP({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 60, life: RND(.6, 1.1), size: RND(5, 9), color: C[i % 5], shape: leaf ? 'tkleaf' : 'tkfeather', rot: a, vr: RND(-6, 6), grav: 90, drag: 1.8, add: false }); }
  if (k === 2) { addP({ x, y, life: .5, color: aw ? '#ffd34d' : '#e8892e', shape: 'ring', r0: 10, r1: 170, lw: 6 }); addP({ x, y, life: .25, color: aw ? '#fff3b0' : '#f2c14e', shape: 'flash', size: 150 }); }
  if (aw) for (let i = 0; i < 4; i++) addP({ x: x + RND(-12, 12), y: y + RND(-8, 8), vx: RND(-15, 15), vy: RND(-70, -30), life: RND(.6, 1), size: RND(5, 8), color: '#ffffff', shape: 'smoke', add: false });
};
/* tkon(aw) / tkon(-1): every particle made in between (fxengine.js addP -> tkPartOf) takes the turkey colours, and the little pictures that fly out
   (ultimate emoji, 사무라이's 斬, 네온's ghosts) become turkey ones. Sent round every effect a turkey-skinned fighter starts (social.js fxPlay). */
let FX_TK = 0;
FXF.tkon = aw => { FX_TK = aw < 0 ? 0 : aw ? 2 : 1; };
const TK_PICS = ['🦃', '🍗', '🍂', '🌽', '🥧'];
function tkPartOf(o) {
  const aw = FX_TK === 2; o = Object.assign({}, o);
  if (o.color) o.color = tkCol(o.color, aw); if (o.colors) o.colors = o.colors.map(c => tkCol(c, aw));
  if ((o.shape === 'text' || o.shape === 'ktext') && typeof o.text === 'string' && /^[^\x00-\x7F가-힣ㄱ-ㅎ]{1,4}$/u.test(o.text)) { o.text = TK_PICS[Math.floor(Math.random() * TK_PICS.length)]; if (o.shape === 'ktext') { o.shape = 'text'; o.outline = 'rgba(0,0,0,.35)'; } }
  return o;
}
