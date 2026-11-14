/* ===== 복서 (gloves): re-enabled 2026-11-13 (kit in kits1.js). Per-skill effects and sounds, played on every screen through fxPlay. ===== */
const BX = { col: '#ff3d3d', gold: '#ffd23f' };
function bxFist(x, y, ang, s, col) {      // a glove-shaped burst: knuckle flash, impact lines, a few sparks
  addP({ x, y, life: .16, color: col || '#fff2c0', shape: 'flash', size: 46 * s });
  addP({ x, y, life: .22, color: col || BX.gold, shape: 'ring', r0: 6 * s, r1: 34 * s, lw: 4 });
  for (let i = 0; i < (fxLow() ? 3 : 6); i++) { const a = ang + RND(-.9, .9), l = RND(26, 46) * s; addP({ x: x + Math.cos(a) * 10, y: y + Math.sin(a) * 10, x2: x + Math.cos(a) * l, y2: y + Math.sin(a) * l, life: .14, color: '#ffffff', shape: 'slash', size: 3 }); }
}
FXF.bxupper = (fi, ang) => {      // 어퍼컷: the fist rises from the floor, a column of sparks flies up, stars spin over the struck spot
  const f = fighters[fi]; if (!f) return; const x = f.x + Math.cos(ang) * 50, y = f.y + BODY + Math.sin(ang) * 50; if (!fxInView(x, y)) return;
  addP({ x, y: y + 20, x2: x, y2: y - 90, life: .22, color: BX.gold, shape: 'slash', size: 14 });
  for (let i = 0; i < (fxLow() ? 6 : 14); i++) addP({ x: x + RND(-14, 14), y, vx: RND(-60, 60), vy: RND(-520, -260), drag: 2.2, life: RND(.3, .55), size: RND(2, 4), color: i % 2 ? '#ffd23f' : '#ff7a3d', shape: 'streak' });
  bxFist(x, y - 30, -Math.PI / 2, 1.3);
  addP({ x, y: y - 70, vy: -40, life: .6, color: '#ffd23f', shape: 'ktext', text: '★', size: 30 });
  try { snd({ n: .07, nt: 'highpass', nf: 1400, nd: .08, b: .14, bf: 180, be: 420, bd: .18, bt: 'triangle' }); } catch (e) {}
};
FXF.bxguard = fi => {      // 가드: two gloves cross in front, a gold shield arc pulses
  const f = fighters[fi]; if (!f || !fxInView(f.x, f.y)) return; const y = f.y + BODY;
  for (let k = 0; k < 3; k++) addP({ x: f.x, y, life: .25 + k * .12, color: k ? '#ffe9a0' : BX.gold, shape: 'ring', r0: 30, r1: 52 + k * 8, lw: 5 - k });
  addP({ x: f.x - 20, y: y - 26, x2: f.x + 20, y2: y + 8, life: .3, color: BX.col, shape: 'slash', size: 9 });
  addP({ x: f.x + 20, y: y - 26, x2: f.x - 20, y2: y + 8, life: .3, color: BX.col, shape: 'slash', size: 9 });
  try { snd({ n: .03, nt: 'bandpass', nf: 2600, nd: .05, b: .1, bf: 520, be: 300, bd: .2, bt: 'square' }); } catch (e) {}
};
FXF.bxjab = (fi, ang) => {      // 잽 연타: three quick knuckle pops in a row in front, each with its own tap
  const f = fighters[fi]; if (!f) return;
  for (let i = 0; i < 3; i++) later2(i * .1, () => { const g = fighters[fi]; if (!g || !fxInView(g.x, g.y)) return; const a = ang + (i - 1) * .22, d = 52 + i * 6;
    bxFist(g.x + Math.cos(a) * d, g.y + BODY + Math.sin(a) * d, a, .8, i === 2 ? '#ffb0a0' : null);
    try { snd({ n: .04, nt: 'highpass', nf: 1800, nd: .04, b: .06, bf: 260 + i * 60, be: 140, bd: .08, bt: 'sine' }); } catch (e) {} });
};
FXF.bxclinch = (fi, x, y) => {      // 클린치: red ropes wind tight round the grabbed one
  if (!fxInView(x, y)) return;
  for (let k = 0; k < 3; k++) addP({ x, y, life: .35 + k * .15, color: k % 2 ? '#ffffff' : BX.col, shape: 'ring', r0: 70 - k * 10, r1: 22, lw: 4 });
  for (let i = 0; i < (fxLow() ? 4 : 8); i++) { const a = i / 8 * 6.28; addP({ x: x + Math.cos(a) * 60, y: y + Math.sin(a) * 60, x2: x + Math.cos(a + .9) * 26, y2: y + Math.sin(a + .9) * 26, life: .3, color: '#c42a2a', shape: 'slash', size: 5 }); }
  addP({ x, y: y - 50, vy: -30, life: .55, color: '#ffffff', shape: 'ktext', text: '꽉!', size: 22 });
  try { snd({ n: .06, nt: 'lowpass', nf: 700, nd: .2, b: .12, bf: 120, be: 70, bd: .25, bt: 'sine' }); } catch (e) {}
};
FXF.bxhook = (fi, ang) => {      // 훅 돌진: a curved red hook swipe at the start, wind streaks behind
  const f = fighters[fi]; if (!f || !fxInView(f.x, f.y)) return; const x = f.x, y = f.y + BODY, n = ang + Math.PI / 2;
  addP({ x: x + Math.cos(n) * 40, y: y + Math.sin(n) * 40, x2: x + Math.cos(ang) * 70, y2: y + Math.sin(ang) * 70, life: .22, color: BX.col, shape: 'slash', size: 16 });
  for (let i = 0; i < (fxLow() ? 4 : 10); i++) { const s = RND(300, 600), a = ang + Math.PI + RND(-.3, .3); addP({ x: x + RND(-12, 12), y: y + RND(-12, 12), vx: Math.cos(a) * s, vy: Math.sin(a) * s, drag: 4, life: .3, size: 3, color: '#ffd6c8', shape: 'streak' }); }
  try { snd({ n: .1, nt: 'bandpass', nf: 1100, nd: .22, b: .05, bf: 300, be: 160, bd: .15, bt: 'sawtooth' }); } catch (e) {}
};
FXF.bxko = (fi, ang) => {      // 연타 러시 finish: a huge KO punch, comic POW, screen shake
  const f = fighters[fi]; if (!f) return; const x = f.x + Math.cos(ang) * 70, y = f.y + BODY + Math.sin(ang) * 70; if (!fxInView(x, y)) return;
  addP({ x, y, life: .3, color: '#fff2c0', shape: 'flash', size: 150 });
  for (let k = 0; k < 2; k++) addP({ x, y, life: .4 + k * .15, color: k ? BX.col : BX.gold, shape: 'ring', r0: 10, r1: 110 + k * 30, lw: 7 });
  for (let i = 0; i < (fxLow() ? 6 : 14); i++) { const a = ang + RND(-1.1, 1.1), l = RND(70, 140); addP({ x, y, x2: x + Math.cos(a) * l, y2: y + Math.sin(a) * l, life: .25, color: i % 2 ? '#ffffff' : BX.gold, shape: 'slash', size: 6 }); }
  addP({ x, y: y - 40, vy: -50, life: .8, color: BX.gold, shape: 'ktext', text: 'KO!', size: 42, rot0: -.15 });
  try { snd({ n: .16, nt: 'lowpass', nf: 2200, nd: .35, b: .2, bf: 150, be: 45, bd: .4, bt: 'triangle' }); sfx(900, .08, 'square', .04, .3); } catch (e) {}
  if (typeof shakeFrom === 'function') shakeFrom(x, y, 9, 320);
};
Object.assign(SKILL_FX, {
  'gloves:1': f => fxPlay('bxupper', fighters.indexOf(f), +f.aim.toFixed(2)),
  'gloves:2': f => { fxAt(f, 'shieldup'); fxPlay('bxguard', fighters.indexOf(f)); },
  'gloves:3': f => fxPlay('bxjab', fighters.indexOf(f), +f.aim.toFixed(2)),
  'gloves:4': f => { const e = nearest(f, 90, f.aim, 1.4); fxPlay('bxclinch', fighters.indexOf(f), Math.round(e ? e.x : f.x + Math.cos(f.aim) * 50), Math.round((e ? e.y : f.y) + BODY)); },
  'gloves:5': f => { fxPlay('bxhook', fighters.indexOf(f), +f.aim.toFixed(2)); fxPlay('trail', fighters.indexOf(f), .3, '#ff5a4a', 'dash'); }
});
