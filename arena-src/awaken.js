/* ---------- 각성 (awakening): the common frame only (user 2026-11-24, mockup https://claude.ai/artifact/MgXdM3msTa5hXhVigiybuD) ----------
   A character that fills its own gauge awakens for AWAKE_SEC seconds: body turns gold (a variant of the worn skin's colour), a little yellow
   flame rises from the body, then everything goes back to normal and the gauge starts again from 0. Works in every mode, for bots too.
   WHAT IS NOT DECIDED YET (the user picks these hero by hero together with Claude, 2026-11-24):
     - each hero's CONDITION  -> AW_COND below. Every row is a TEMP placeholder (damage dealt) so that the frame can be seen at all.
     - each hero's BOOST      -> AW_BOOST below. Every row is EMPTY on purpose: for now an awakened hero only LOOKS awakened.
   engine.js hooks: damage() -> awGain, kill() -> awGain 'ko', step() -> awStep, respawn() clears. tail.js: drawFighter0 -> awCol / awDraw, frame() -> awHud. */
const AWAKE_SEC = 8;      // user 2026-11-25: 5 s + 3 s. One place to change.
const AW_GOLDS = ['#ffd34d', '#ffb020', '#fff2b0', '#ffc21a'];
function awGold(c) { if (typeof c !== 'string') return c; let h = 0; for (let i = 0; i < c.length; i++) h = (h * 31 + c.charCodeAt(i)) | 0; return AW_GOLDS[Math.abs(h) % 4]; }      // every effect colour made by an awakened fighter turns gold (user 2026-11-25)
const AW_PREVIEW = true;      // true: every hero uses AW_COND so the frame can be tried. false: only heroes with a decided row awaken.
/* hero id -> { kind: 'dmg' (damage dealt, the numbers shown on screen) | 'hit' (hits landed) | 'ko' (knock-outs) | 'card' (마술사 cards landed), need: how much fills the gauge, temp: true while not decided }.
   ALL 20 ROWS ARE TEMP PLACEHOLDERS, NOT DECISIONS. */
const AW_COND = {
  sword: { kind: 'sky', need: 1 }      /* the live number is need: 1 (the note after it is the first number the user decided 2026-11-24): enemies hit by 천검, added up over casts (two hits in total) */, wizard: { kind: 'pen', need: 15 }      /* the live number is need: 15 (the note after it is the first number the user decided 2026-11-24): 25 hits with the wizard's piercing bullets (all of them pierce, so every bullet hit counts) */, magiccard: { kind: 'card', need: 24 }      /* the live number is need: 24 (the note after it is the first number the user decided 2026-11-24): 20 cards landed on an enemy */,
  bow: { kind: 'far', need: 2 }      /* the live number is need: 2 (the note after it is the first number the user decided 2026-11-24): an arrow that hit from 6+ tiles away, 10 times (the 6 tiles are from the candidate list the user picked) */, shade: { kind: 'dash', need: 8 }, tionis: { kind: 'morph', need: 600 }      /* the live number is need: 600 (the note after it is the first number the user decided 2026-11-24): damage dealt to enemies while disguised (변장) adds up to 1500 */,
  harald: { kind: 'basic', need: 7 }      /* the live number is need: 7 (the note after it is the first number the user decided 2026-11-24): 8 basic attack hits */, pistol: { kind: 'red', need: 3 }      /* the live number is need: 3 (the note after it is the first number the user decided 2026-11-24): 6 hits with a red bullet */, rifle: { kind: 'dmg', need: 4000 }      /* the live number is need: 4000 (the note after it is the first number the user decided 2026-11-24): damage dealt 3000 */,
  smg: { kind: 'bul', need: 50 }      /* the live number is need: 50 (the note after it is the first number the user decided 2026-11-24): 40 bullet hits */, shuriken: { kind: 'stl', need: 3 }      /* the live number is need: 3 (the note after it is the first number the user decided 2026-11-24): hit enemies 8 times while hidden (an attack ends the hiding, so a hit counts when the stealth was on up to 0.7 s before it; the 0.7 s is TEMP) */, grenade: { kind: 'bomb', need: 15 }      /* the live number is need: 15 (the note after it is the first number the user decided 2026-11-24): 9 enemies hit by bombs */,
  shotgun: { kind: 'dmg', need: 4500 }      /* the live number is need: 4500 (the note after it is the first number the user decided 2026-11-24): damage dealt 3000 */, portalgun: { kind: 'bnc', need: 2 }      /* the live number is need: 2 (the note after it is the first number the user decided 2026-11-24): 8 hits with a bullet that had bounced */, gloves: { kind: 'taken', need: 5500 }      /* the live number is need: 5500 (the note after it is the first number the user decided 2026-11-24): damage taken adds up to 3000 (the numbers shown on screen) */,
  samurai: { kind: 'chain', need: 7, gap: 1 }      /* the live number is need: 7 (the note after it is the first number the user decided 2026-11-24): hit an enemy 8 times in a row (the ultimate counts as ONE hit; the 1 s gap that breaks the chain is TEMP) */, bazooka: { kind: 'skh', need: 6 }      /* the live number is need: 6 (the note after it is the first number the user decided 2026-11-24): 4 enemies hit by skill rockets */, gardener: { kind: 'bush', need: 1 }      /* the live number is need: 1 (the note after it is the first number the user decided 2026-11-24): 6 hits on enemies while standing in a planted bush */,
  herbal: { kind: 'heal', need: 2100 }      /* the live number is need: 2100 (the note after it is the first number the user decided 2026-11-24): 1500 health given to allies and herself in total */, shieldman: { kind: 'skill', need: 4 }      /* the live number is need: 4 (the note after it is the first number the user decided 2026-11-25): 6 skill uses (the ultimate does not count) */, chef: { kind: 'ladle', need: 9 }      /* the live number is need: 9 (the note after it is the first number the user decided 2026-11-25): 9 thrown-ladle hits (the user lets Claude retune it) */
};
/* hero id -> what changes while awakened (basic attack / skills / ultimate: movement, effects, not just numbers). EMPTY until decided.
   Hooks a row may have (all optional): start(f), end(f), shot(f, o) -> o   (changes a projectile's options before it is made; o.skill is set for skill shots),
   atk(f, ang)  (after a basic attack), sk(f, i, ang)  (after skill i), ult(f, ang)  (after the ultimate). */
const AW_BOOST = {
  sword: {}, wizard: {}, magiccard: null, bow: {}, shade: {}, tionis: {}, harald: {}, pistol: {}, rifle: {}, smg: {},
  shuriken: {}, grenade: {}, shotgun: {}, portalgun: {}, gloves: {}, samurai: {}, bazooka: {}, gardener: {}, herbal: {}, shieldman: {}, chef: {}
};
const awDmgM = f => f.awT > 0 ? ((awBoost(f) || {}).dmgm || 1) : 1;      // basic attack damage factor while awakened (방패병 +20 %)
const awRng = f => f.awT > 0 ? ((awBoost(f) || {}).rng || 1) : 1;      // basic attack reach factor while awakened (melee heroes)
const awHalf = (f, half) => f.awT > 0 ? ((awBoost(f) || {}).half || half) : half;      // basic attack cone half-angle while awakened (기사: a full circle)
const awAtkCd = f => f.awT > 0 ? ((awBoost(f) || {}).atkCd || 1) : 1;      // basic attack cooldown factor while awakened (1 = unchanged)
/* 마술사: DECIDED with the user 2026-11-24 (which change goes where). EVERY NUMBER IN THIS BLOCK IS A TEMP PLACEHOLDER (user gave none except 20 cards, 5 cards, cooldown -20%, 3-card fan x 5 volleys). */
function awPetals(f, x, y, R) {      // 궁극기: the petals stay where the rose burst (TEMP: 4 s, slow 25 %, 3 per half second)
  zone({ x, y, r: R, t: 4, col: '#ff9ad0', op: .22, by: f, acc: 0, fn: (z, dt) => { z.acc += dt; const tk = z.acc >= .5; if (tk) z.acc -= .5;
    for (const e of foes(f)) if (Math.hypot(e.x - z.x, e.y - z.y) < z.r) { buff(e, 'slow', .4, .75); if (tk) damage(e, 3, f, { quiet: 1, el: 1, src: '각성: 장미 폭죽' }); } } });
}
AW_BOOST.magiccard = {
  atkCd: .8,      // 일반 공격 쿨타임 -20% (user)
  shot(f, o) {
    if (o.skill) { if (o.shape === 'redball') { const R = 155 * 1.4; o.splash = R; o.onBoom = (x, y) => { fxPlay('rose', Math.round(x), Math.round(y), R); awPetals(f, x, y, R); }; } return o; }      // 궁극기: blast radius x1.4 (TEMP) + petals
    if (f.st.flower) { o.count = 5; o.fan = .6; o.pierce = 1; return o; }      // 4 꽃 마술: 5 flowers (it already threw 3), pierce 1 (TEMP)
    o.count = 5; o.fan = (f.h.fan || .3) * 2; return o;      // 일반 공격: 5 cards, same gap between cards as the 3-card fan (user)
  },
  run(f, i, def) {
    if (def.n === 1) { const got = new Map(); seq(f, 5, .16, () => emit(f, f.aim, { skill: 1, skin: 1, count: 3, fan: .45, dmg: 8, onHit: e => { const n = (got.get(e) || 0) + 1; got.set(e, n); if (n === 8) { buff(e, 'stun', .8); fxAt(e, 'combo'); } } })); return true; }      // 1: 3-card fan x 5 volleys (user); stun at 8 cards on one enemy (TEMP)
    if (def.n === 5) { seq(f, 5, .15, () => emit(f, f.aim)); return true; }      // 5: 5 volleys instead of 3, .15 s apart instead of .25 (TEMP)
  },
  dove(f, e) { withSrc('각성: 비둘기 변신', () => { damage(e, 30, f, {}); knock(e, f.x, f.y, 320); buff(e, 'stun', 1.4); }); },      // 2: damage + knockback + stun (user; numbers TEMP)
  sk(f, i, ang, def) {
    if (def.n !== 3) return;      // 3 모자 던지기: hurts everybody on the hat's way, and bursts where the magician appears again (TEMP numbers)
    withSrc('각성: 모자 던지기', () => { const hit = new Set(); let lx = f.x, ly = f.y, seen = false;
      const step = () => { const p = f.st.hat;
        if (f.form === 'gone' && p) { seen = true; for (const e of foes(f)) { if (hit.has(e)) continue; const dx = p.x - lx, dy = p.y - ly, l2 = dx * dx + dy * dy || 1, t = clamp(((e.x - lx) * dx + (e.y - ly) * dy) / l2, 0, 1); if (Math.hypot(e.x - (lx + dx * t), e.y - (ly + dy * t)) < 44) { hit.add(e); damage(e, 20, f, {}); } } lx = p.x; ly = p.y; later(.04, step, f); }
        else if (seen && !f.dead) boom(f, f.x, f.y, 110, 24, { col: '#ff9ad0', kb: 200 }); };
      step(); });
  }
};
/* 사무라이: DECIDED with the user 2026-11-24. Given by the user: condition (8 hits in a row, ultimate = 1), basic = longer reach + long dash on the final X, 십자 베기 = an X-shaped sword wave flies,
   거합 = iai and then back to where it started (two hits), 검 던지기 = three swords in a fan, 흘려 베기 = candidate A, 쌍검 난무 = candidate B. EVERY NUMBER BELOW IS A TEMP PLACEHOLDER. */
AW_BOOST.samurai = {
  rng: 1.35,      // 일반 공격 사거리 x1.35 (TEMP)
  atk(f) { if (f.st.cb % 4 === 0) lunge(f, f.aim, 3 * T, .18, { dmg: 25, kb: 0 }); },      // the 4th (X) hit: a long dash forward (3 tiles, 25 damage on the way; TEMP)
  run(f, i, def) {
    if (def.n === 2) {      // 거합: slash through, then slash back to where it started
      const x0 = f.x, y0 = f.y; def.f(f, f.aim, i);
      later(.22, () => { if (f.dead || f.awT <= 0 || B(f, 'stun')) return; const x1 = f.x, y1 = f.y, d = Math.hypot(x0 - x1, y0 - y1); if (d < 20) return;
        withSrc('각성: 거합 되돌아 베기', () => { const r = blink(f, Math.atan2(y0 - y1, x0 - x1), d); f.st.lh = f.st.lh === 1 ? 0 : 1; f.st.hand = f.st.lh; f.swing = .22; fxLine('iai', r.x0, r.y0 + BODY, f.x, f.y + BODY, { wid: 'samurai', cos: f.cos, gy: f.y + 16 }); pathHit(f, r.x0, r.y0, f.x, f.y, 34, 30); }); }, f);
      return true;
    }
    if (def.n === 3) {      // 검 던지기: three swords in a fan (TEMP fan .5 rad)
      const a = f.aim; emit(f, a, { skill: 1, dmg: 40, range: 5 * T, r: 10, spd: 1400, pierce: 99, shape: 'katana', count: 3, fan: .5 }); later(.35, () => { if (!f.dead) blink(f, a, 5 * T); }, f); return true;
    }
    if (def.n === 4) { buff(f, 'parry', 1, 1); return true; }      // 흘려 베기 A: the stance lasts 1 s (TEMP); the counter hits everybody around (kits2.js onHurt)
  },
  sk(f, i, ang, def) {
    if (def.n === 1) withSrc('각성: 검기', () => emit(f, ang, { skill: 1, dmg: 54, range: 4 * T, r: 14, spd: 900, pierce: 99, shape: 'xwave' }));      // 십자 베기: an X-shaped sword wave flies on (4 tiles, same damage as the slash; TEMP)
  },
  ult(f) {      // 쌍검 난무 B: cannot be hurt during it, and the last X sends out a big shockwave
    f.inv = Math.max(f.inv || 0, 1.5);
    later(1.4, () => { if (!f.dead) withSrc('각성: 난무 충격파', () => boom(f, f.x, f.y, 230, 40, { col: '#dfe9ff', kb: 650 })); }, f);
  }
};
/* 궁수: DECIDED with the user 2026-11-24. Given by the user: condition (10 arrow hits from 6+ tiles), basic = bigger arrow + passes walls and players + damage +7.5%, 갈고리 = 100% auto aim and 100% hit,
   화살비 = A (8 -> 16 arrows, wider), 폭발 화살 = after the blast small blast arrows fly out in several directions in a small arc and burst, 덫 = B (it explodes when stepped on: damage + everybody around is rooted),
   연속 사격 = B (the 3 arrows follow the aimed enemy), 불화살 = A (3 -> 5 arrows, a fire stays where it hit). EVERY OTHER NUMBER IS A TEMP PLACEHOLDER. */
function awMiniBlasts(f, x0, y0) {      // 폭발 화살: 6 small blast arrows fly a short arc in all directions and burst (TEMP: 6 arrows, 90-150 px, .55 s, radius 45, damage 6)
  const a0 = rnd(0, 6.28), L = [];
  for (let i = 0; i < 6; i++) { const a = a0 + i * 6.2832 / 6, d = rnd(90, 150); L.push({ x1: clamp(x0 + Math.cos(a) * d, T * 1.3, WW - T * 1.3), y1: clamp(y0 + Math.sin(a) * d, T * 1.3, WH - T * 1.3) }); }
  zone({ x: x0, y: y0, r: 1, t: .55, col: '#ffd34d', op: 0, by: f, u: 0, fn: (z, dt) => { z.u = Math.min(1, z.u + dt / .55);
      for (const l of L) { const x = x0 + (l.x1 - x0) * z.u, y = y0 + (l.y1 - y0) * z.u - 4 * 46 * z.u * (1 - z.u); addPart({ x, y: y + BODY * .3, vx: 0, vy: 0, life: .22, max: .22, color: '#ffd34d', r: 4 }); addPart({ x, y: y + BODY * .3, vx: 0, vy: 0, life: .12, max: .12, color: '#ffffff', r: 2 }); } },
    end: () => { for (const l of L) boom(f, l.x1, l.y1, 45, 6, { col: '#ffb020', kb: 160 }); } });
}
function awFire(f, x, y, r, t, d) {      // a fire stays where the arrow hit (TEMP: radius 55, 3 s, 4 damage per half second); 복서 훅 돌진 uses it for its flame trail
  zone({ x, y, r: r || 55, t: t || 3, col: '#ff7a1a', op: .22, by: f, acc: 0, fn: (z, dt) => { z.acc += dt; if (z.acc < .5) return; z.acc -= .5;
    for (const e of foes(f)) if (Math.hypot(e.x - z.x, e.y - z.y) < z.r + 10) damage(e, d || 4, f, { quiet: 1, el: 1, src: '각성: 불길' }); } });
}
AW_BOOST.bow = {
  shot(f, o) {
    if (f.st.awHome) { o.homing = f.st.awHome; o.turn = 40; f.st.awHome = null; }      // 갈고리: the arrow chases the enemy it was aimed at
    if (!o.skill) { o.r = 10; o.wp = true; o.pierce = 99; o.dmgMul = 1.075; return o; }      // 일반 공격: bigger arrow (TEMP size), flies through walls and players, damage +7.5% (user)
    if (o.splash === 70) { o.onBoom = (x, y) => awMiniBlasts(f, x, y); return o; }      // 폭발 화살
    if (o.burn) { o.count = 5; o.fan = .5; o.onEnd = b => awFire(f, b.x, b.y); return o; }      // 불화살 A
    return o;
  },
  run(f, i, def) {
    if (def.n === 1) { const e = nearest(f, 8 * T, f.aim, .8) || nearest(f, 8 * T); if (!e) return; f.aim = angTo(f, e); f.st.awHome = e; def.f(f, f.aim, i); f.st.awHome = null; return true; }      // 갈고리: aims by itself and cannot miss
    if (def.n === 2) {      // 화살비 A: 16 arrows over a wider field (TEMP: +-105 px, radius 44, .06 s apart)
      const p = aimPt(f, 8 * T); fx('arrowwarn', p.x, p.y);
      seq(f, 16, .06, () => { const x = p.x + rnd(-105, 105), y = p.y + rnd(-105, 105); strike(f, x, y, 44, .25, () => { circ(f, x, y, 44, 8); burst(x, y, '#c9a463', 4, 120); }, '#c9a463'); });
      return true;
    }
    if (def.n === 4) {      // 덫 화살 B: the trap explodes when stepped on (TEMP: radius 110, damage 20, root 3 s for everybody inside)
      emit(f, f.aim, { skill: 1, dmg: 0, range: Math.min(8 * T, Math.max(2 * T, Math.hypot(f.tx - f.x, f.ty - f.y))), onEnd: b => trap(f, clamp(b.x - Math.cos(b.ang) * 20, T * 1.3, WW - T * 1.3), clamp(b.y - Math.sin(b.ang) * 20 - BODY, T * 1.3, WH - T * 1.3), 15, 3, 'bowtrap',
        e => { withSrc('각성: 덫 폭발', () => { fx('bombexplode', e.x, e.y, { gy: e.y + 30 }); circ(f, e.x, e.y, 110, 20, { root: 3, kb: 0 }); }); }) });
      return true;
    }
    if (def.n === 5) {      // 연속 사격 B: the 3 arrows follow the aimed enemy
      const e = nearest(f, 9 * T, f.aim, .8) || nearest(f, 9 * T);
      seq(f, 3, .12, () => { const t = e && !e.dead ? e : null; emit(f, t ? angTo(f, t) : f.aim, { skill: 1, dmg: 10, shape: 'arrow', homing: t, turn: 14 }); });
      return true;
    }
  }
};
/* 마법사: DECIDED with the user 2026-11-24. Given: condition (25 bullet hits), basic = candidate A (3-bullet fan), 충격파 knockback x2.5, 마력 압축 = bullet x1.5 and +100 health per hit, 파동 쏘기 = when both hit the same enemy,
   magic bullets fly from that enemy in 8 directions, 마력 보호 = 10 orbs, 마법진 = allies inside run faster + a much flashier look. 마력 연사: B (3 bullets on crossing wave paths). EVERY OTHER NUMBER IS A TEMP PLACEHOLDER. */
AW_BOOST.wizard = {
  shot(f, o) {
    if (o.awx) return o;
    if (!o.skill) { o.count = 3; o.fan = .35; return o; }      // 일반 공격 A: 3 bullets in a fan (fan .35 rad is TEMP)
    if (o.r === 10 && o.dmg === 20 && o.pierce === 99) { o.r = 15; o.onHit = () => heal(f, 10); return o; }      // 마력 압축: x1.5 size, every hit gives +100 health (user)
    return o;
  },
  run(f, i, def) {
    if (def.n === 1) { const inC = zones.some(z => z.kind === 'circle' && z.by === f && inZone(z, f)); ring(f.x, f.y, 130, '#b98cff'); circ(f, f.x, f.y, 130, 10, { kb: (inC ? 1800 : 900) * 2.5 }); return true; }      // 충격파: knockback x2.5 (user)
    if (def.n === 4) {      // 파동 쏘기: both bullets on the same enemy -> 8 magic bullets from that enemy (TEMP: 8 bullets, normal bullet damage, 4 tiles)
      const a = f.aim, got = new Set();
      for (const sg of [-1, 1]) emit(f, a, { skill: 1, dmg: 14, wave: sg, onHit: e => { if (got.has(e)) { damage(e, 15, f); withSrc('각성: 파동 퍼짐', () => { for (let k = 0; k < 8; k++) { const g = k * Math.PI / 4 + .2; emit(f, g, { skill: 1, awx: 1, dmg: 14, range: 4 * T, ox: e.x - f.x - Math.cos(g) * 24 + Math.cos(g) * 40, oy: e.y - f.y - Math.sin(g) * 24 + Math.sin(g) * 40, shape: 'bullet' }); } }); } got.add(e); } });
      return true;
    }
    if (def.n === 3) { for (const sg of [-1.2, 0, 1.2]) emit(f, f.aim, { skill: 1, dmg: 14, pierce: 99, wave: sg }); return true; }      // 마력 연사 B (the user answered "B" to the candidate list): 3 bullets at once on wave paths that cross each other (wave width 1.2 is TEMP)
    if (def.n === 5) { f.st.orb = { n: 10, m: 10, t: 8, src: SRC }; return true; }      // 마력 보호: 10 orbs (user)
  },
  ult(f) {      // 마법진: allies inside run faster (TEMP +25 %) and the circle is much more showy (rings, runes of light, rising sparks)
    const z = zones.filter(q => q.kind === 'circle' && q.by === f).pop(); if (!z) return;
    const fn0 = z.fn; z.ak = 0; z.ar = 0;
    for (let k = 0; k < 4; k++) later(k * .12, () => { ring(z.x, z.y, z.r * (.55 + k * .15), k % 2 ? '#ffffff' : '#b98cff', .7); }, f);
    burst(z.x, z.y, '#ffffff', 26, 420); burst(z.x, z.y, '#b98cff', 22, 300);
    z.fn = (zz, dt) => {
      if (fn0) fn0(zz, dt);
      for (const a of allies(f)) if (inZone(zz, a)) buff(a, 'haste', .4, 1.25);
      zz.ak += dt; zz.ar += dt;
      while (zz.ak >= .05) { zz.ak -= .05; const g = rnd(0, 6.283), rr = zz.r * (rnd(.2, 1)), x = zz.x + Math.cos(g) * rr, y = zz.y + Math.sin(g) * rr * .8;
        addPart({ x, y, vx: 0, vy: rnd(-110, -190), life: .8, max: .8, color: Math.random() < .5 ? '#ffffff' : (Math.random() < .5 ? '#b98cff' : '#7df0ff'), r: rnd(2, 4.5) }); }
      if (zz.ar >= .7) { zz.ar -= .7; ring(zz.x, zz.y, zz.r * .98, '#b98cff', .6); ring(zz.x, zz.y, zz.r * .5, '#ffffff', .5); }
    };
  }
};
/* 복서: DECIDED with the user 2026-11-24. Given: condition (3000 damage taken), basic = every 3rd punch sends a shockwave forward, 어퍼컷 = a second hit after the lift, 가드 = A (a hit taken while guarding is answered with a shockwave
   of the same damage), 잽 연타 = A (6 jabs, the last one knocks back), 클린치 = B (hold, then throw: hits the enemy behind, both are hurt), 훅 돌진 = B (flame afterimage along the dash hurts), 연타 러시 = A (6 s, attack speed x3: kits1.js).
   EVERY OTHER NUMBER IS A TEMP PLACEHOLDER. */
let awInCtr = false;      // a counter must not trigger another counter (two awakened guards hitting each other recursed until the stack overflowed)
function awCounter(f, d) { if (awInCtr) return; awInCtr = true; try { withSrc('각성: 가드 반격', () => { ring(f.x, f.y, 130, '#ffb020', .4); burst(f.x, f.y + BODY, '#ffb020', 14, 320); circ(f, f.x, f.y, 130, d, { px: 1, raw: 1, kb: 500 }); }); } finally { awInCtr = false; } }
AW_BOOST.gloves = {
  atk(f, ang) { f.st.awPc = (f.st.awPc || 0) + 1; if (f.st.awPc % 3 === 0) emit(f, ang, { skill: 1, dmg: 20, range: 4 * T, r: 14, spd: 900, pierce: 99, shape: 'pwave' }); },      // every 3rd punch: a shockwave flies 4 tiles (TEMP: damage 20)
  run(f, i, def) {
    if (def.n === 1) {      // 어퍼컷: lift, then hit again (TEMP: second hit 17 damage 0.35 s later + 0.4 s stun)
      const e = nearest(f, 90, f.aim, 1.2); if (!e) return false; f.swing = .22; damage(e, 17, f); buff(e, 'stun', .6);
      later(.35, () => { if (e.dead) return; f.swing = .22; damage(e, 17, f); buff(e, 'stun', .4); fxAt(e, 'combo'); }, f); return true;
    }
    if (def.n === 3) { lunge(f, f.aim, 50, .1, {}); seq(f, 6, .07, k => { f.swing = .12; arc(f, f.aim, 80, 1, 6, k === 5 ? { kb: 600 } : undefined); }); return true; }      // 잽 연타 A: 6 jabs (.07 s apart: TEMP), the last one knocks back (TEMP 600)
    if (def.n === 4) {      // 클린치 B: hold, and at the end throw the enemy ahead; whoever is behind it gets hit as well (TEMP: 15 damage each, 3.5 tiles)
      const e = nearest(f, 90, f.aim, 1.4); if (!e) return false; buff(e, 'root', 1); buff(f, 'root', 1); damage(e, 8, f);
      later(1, () => { if (e.dead) return; const g = f.aim; damage(e, 8, f); knock(e, f.x - Math.cos(g) * 20, f.y - Math.sin(g) * 20, 900);
        const e2 = foes(f).find(x => { if (x === e || x.dead) return false; let da = angTo(e, x) - g; da = Math.atan2(Math.sin(da), Math.cos(da)); return dist(e, x) < 3.5 * T && Math.abs(da) < .7; });
        if (e2) later(.25, () => { withSrc('각성: 클린치 던지기', () => { if (!e.dead) damage(e, 15, f); if (!e2.dead) { damage(e2, 15, f); buff(e2, 'stun', .5); knock(e2, e.x, e.y, 500); } }); fxAt(e2, 'combo'); }, f); }, f); return true;
    }
    if (def.n === 5) {      // 훅 돌진 B: flame afterimages stay along the dash (TEMP: 4 flames, radius 40, 2 s, 3 damage per half second)
      const x0 = f.x, y0 = f.y; def.f(f, f.aim, i);
      later(.3, () => { for (let k = 0; k <= 3; k++) awFire(f, x0 + (f.x - x0) * k / 3, y0 + (f.y - y0) * k / 3, 40, 2, 3); }, f); return true;
    }
  }
};
/* 닌자: DECIDED with the user 2026-11-24 (not the ultimate: the user wants the ultimate itself replaced, candidates are shown first). Given: condition (8 hits from hiding), basic = 3 shots in a row ("3반 연속" read as 3발 연속),
   그림자 이동 = A (a shadow stays and explodes after 1 s), 수리검 부채 = A (5 -> 9, wider), 부채꼴 표창 = B (a 360-degree ring of shuriken that returns like boomerangs), 연속 던지기 = A (3 -> 6, faster), 담장 넘기 = B (shadow smoke:
   allies inside hide). EVERY OTHER NUMBER IS A TEMP PLACEHOLDER. */
AW_BOOST.shuriken = {
  atk(f, ang) { f.queue.push({ t: .09, ang, o: null, src: SRC }, { t: .18, ang, o: null, src: SRC }); },      // 일반 공격: 3 shots in a row (.09 s apart: TEMP)
  run(f, i, def) {
    if (def.n === 1) {      // 그림자 이동 A: a shadow stays where it was and explodes after 1 s (TEMP: radius 100, damage 30)
      const x0 = f.x, y0 = f.y; def.f(f, f.aim, i); fx('blink', x0, y0 + BODY, { color: '#7a5cff', gy: y0 + 16 });
      zone({ x: x0, y: y0, r: 38, t: 1, col: '#5a3cc8', op: .35, by: f, fn: z => { addPart({ x: z.x + rnd(-22, 22), y: z.y + rnd(-50, 0), vx: 0, vy: rnd(-60, -120), life: .5, max: .5, color: '#b9a6ff', r: rnd(2, 4) }); },
        end: z => { withSrc('각성: 그림자 폭발', () => boom(f, z.x, z.y, 100, 30, { col: '#b9a6ff', kb: 300 })); } });
      return true;
    }
    if (def.n === 2) { emit(f, f.aim, { skill: 1, count: 9, fan: .9, dmg: 8 }); return true; }      // 수리검 부채 A: 9 shuriken, fan .9 rad (TEMP)
    if (def.n === 3) { emit(f, f.aim, { skill: 1, count: 8, fan: Math.PI * 2 * 7 / 8, dmg: 10, boom: 1, range: 4 * T }); return true; }      // 부채꼴 표창 B: 8 shuriken all around that come back (4 tiles out: TEMP)
    if (def.n === 4) { const a = f.aim; seq(f, 6, .07, () => emit(f, a, { skill: 1, dmg: 14 })); return true; }      // 연속 던지기 A: 6 shuriken, .07 s apart (TEMP)
  },
  sk(f, i, ang, def) {
    if (def.n !== 5) return;      // 담장 넘기 B: shadow smoke stays along the way (TEMP: radius 60, 2 s, every .25 s for 4 s); allies inside hide (not right after attacking)
    seq(f, 16, .25, () => zone({ x: f.x, y: f.y, r: 60, t: 2, col: '#4b3a7a', op: .3, by: f, fn: z => { for (const a of allies(f)) if (inZone(z, a) && time - (a.lastFire || -9) > 1) buff(a, 'stealth', .4); } }));
  }
};
/* 기사: DECIDED with the user 2026-11-24. Given: condition (천검 hits 2 enemies in total), basic = a full circle with a 360-degree swing, 강타 = A (bigger landing, the ground cracks and a shockwave runs ahead), 칼 회전 = B (4 sword waves fly out in all
   directions), 기사 수여 = A (3 s, +35 %), 처형 = a kill takes 5 s off the ultimate cooldown, 천검 = 3 swords fall. 돌진 베기: not chosen, unchanged. 천검 aiming is NOT decided: for now the simplest one (three swords in a fan in one direction).
   EVERY OTHER NUMBER IS A TEMP PLACEHOLDER. */
AW_BOOST.sword = {
  half: Math.PI,      // 일반 공격: not a cone but a circle
  atk(f) { f.spin = .25; },      // and the swing goes all the way around (the ring drawn by tail.js)
  run(f, i, def) {
    if (def.n === 2) {      // 강타 A: landing radius 70 -> 112, and a shockwave runs ahead along the ground (TEMP: 5 tiles, damage 20)
      lunge(f, f.aim, 4 * T, .34, { fly: 2, end: g => { boom(g, g.x, g.y, 112, 45, { stun: .5, col: '#dfe6f0', kb: 0 }); withSrc('각성: 땅 갈라짐', () => emit(g, g.aim, { skill: 1, dmg: 20, range: 5 * T, r: 14, spd: 700, pierce: 99, shape: 'pwave' })); } }); return true;
    }
    if (def.n === 4) { buff(f, 'haste', 3, 1.35); buff(f, 'dmg', 3, 1.35); f.scd[1 - i] -= 1; f.ucd -= 1; f.dcd -= 1; return true; }      // 기사 수여 A: 3 s, +35 % (TEMP values)
    if (def.n === 5) { f.st.awEx = time; const r = def.f(f, f.aim, i); f.st.awEx = null; return r === undefined ? true : r; }      // 처형: remember this moment so that kill() below knows the kill was made by it
  },
  sk(f, i, ang, def) {
    if (def.n !== 3) return;      // 칼 회전 B: 4 sword waves fly out in all directions, and 4 more between them half a second later (TEMP: 4 tiles, damage 7 each)
    withSrc('각성: 회전 검기', () => { for (let k = 0; k < 4; k++) emit(f, ang + k * Math.PI / 2, { skill: 1, dmg: 7, range: 4 * T, r: 14, spd: 800, pierce: 99, shape: 'xwave' });
      later(.6, () => { for (let k = 0; k < 4; k++) emit(f, ang + Math.PI / 4 + k * Math.PI / 2, { skill: 1, dmg: 7, range: 4 * T, r: 14, spd: 800, pierce: 99, shape: 'xwave' }); }, f); });
  },
  kill(f, e) { if (f.st.awEx === time) { f.ucd -= 5; say(f, '처형!', '#ffd34d'); } },      // 처형 kill: -5 s on the ultimate cooldown (user)
  ult(f) {      // 천검: 3 swords (TEMP aiming = a fan of three in one direction, +-.45 rad around the first one, same distance)
    const p = f.st.awP; if (!p) return; const d = Math.hypot(p.x - f.x, p.y - f.y), a = Math.atan2(p.y - f.y, p.x - f.x);
    for (const sg of [-.45, .45]) skyStrike(f, clamp(f.x + Math.cos(a + sg) * d, T * 1.4, WW - T * 1.4), clamp(f.y + Math.sin(a + sg) * d, T * 1.4, WH - T * 1.4));
  }
};
/* 티오니스: DECIDED with the user 2026-11-24. Given: condition (1500 damage while disguised), basic = 3 shots in a fan, 말솜씨 = A (4 s, +20 % speed), 마취 주사 = B (3 syringes in a fan, two on one enemy stun),
   무대 조명 = B (the light follows the aim point), 퇴장 = B (a smoke burst where it vanished: enemies inside are blinded), 분신 연극 = A (3 clones, 70 % attack: kits2.js). 채혈/변신: bigger syringe + cooldowns x1.25 as fast while disguised (user).
   While disguised as another hero none of these apply (that hero's skills have other meanings). EVERY OTHER NUMBER IS A TEMP PLACEHOLDER. */
AW_BOOST.tionis = {
  shot(f, o) { if (f.h !== f.h0) return o; if (!o.skill) { o.count = 3; o.fan = .35; } else if (o.shape === 'needle') o.r = 11; return o; },      // 채혈: the syringe is bigger (user; radius 7 -> 11 is TEMP)      // 일반 공격: 3 shots in a fan (.35 rad: TEMP)
  run(f, i, def) {
    if (f.h !== f.h0) return;
    if (def.n === 2) { buff(f, 'ally', 4); buff(f, 'haste', 4, 1.2); return true; }      // 말솜씨 A: 4 s, +20 % speed
    if (def.n === 3) {      // 마취 주사 B: 3 syringes (damage 8 each: TEMP), two on the same enemy stun it (.8 s: TEMP)
      const got = new Map(); emit(f, f.aim, { skill: 1, dmg: 8, spd: 720, range: 6 * T, r: 7, shape: 'syringe', slow: [.6, 2], count: 3, fan: .22, onHit: e => { const n = (got.get(e) || 0) + 1; got.set(e, n); if (n === 2) { buff(e, 'stun', .8); fxAt(e, 'combo'); } } }); return true;
    }
    if (def.n === 4) {      // 무대 조명 B: the light follows the aim point (TEMP: 280 px/s)
      const p = aimPt(f, 7 * T);
      zone({ by: f, x: p.x, y: p.y, r: 110, t: 3, col: '#ffe9a8', op: .3, fn: (z, dt) => { const q = aimPt(f, 7 * T), dx = q.x - z.x, dy = q.y - z.y, d = Math.hypot(dx, dy) || 1, st = Math.min(d, 280 * dt); z.x += dx / d * st; z.y += dy / d * st;
        for (const e of foes(f)) if (!e.minion && inZone(z, e)) { buff(e, 'expose', .2); buff(e, 'reveal', .2); unbuff(e, 'stealth'); } } });
      return true;
    }
    if (def.n === 5) {      // 퇴장 B: where it vanished a smoke bursts, enemies inside are blinded (TEMP: radius 130, 2.5 s)
      const x0 = f.x, y0 = f.y; def.f(f, f.aim, i);
      zone({ by: f, x: x0, y: y0, r: 130, t: 2.5, t0: 2.5, kind: 'smoke', col: '#9aa3b8', op: .55, fn: z => { for (const e of foes(f)) if (inZone(z, e)) buff(e, 'blind', .25); } }); burst(x0, y0, '#9aa3b8', 18, 320);
      return true;
    }
  }
};
/* 바이킹: DECIDED with the user 2026-11-24 (from the effect-first candidate table). Given: condition (8 basic attack hits), basic = A (red afterimage, reach x1.3), 분노 = A (red flames, 4 s, 25 % less damage, +15 % speed),
   방패 강타 = A (push twice as far, a wall adds a shock ring and a .8 s stun), 도끼 휘두르기 = A (radius 150, two burning rings in a row), 방패 올리기 = B (blocked damage piles up and the shield glows, then it bursts in front),
   내려찍기 = B (cracks run 5 tiles ahead and slow), 도끼 돌진 = B (the dash ends in a big slam with lightning, those hit stay stunned longer: kits2.js). EVERY OTHER NUMBER IS A TEMP PLACEHOLDER. */
function awBlocked(f, d) { if (f.h0 && f.h0.id === 'harald') f.st.awB = Math.min(60, (f.st.awB || 0) + d); }      // 방패 올리기: the damage the shield took (TEMP cap 60)
function awRing(f, x, y, r, col) { ring(x, y, r, col, .5); for (let k = 0; k < 28; k++) { const a = k / 28 * 6.2832; addPart({ x: x + Math.cos(a) * r, y: y + Math.sin(a) * r * .55, vx: Math.cos(a) * 40, vy: -60 - rnd(0, 60), life: .5, max: .5, color: k % 2 ? '#ffb020' : '#ff5a3a', r: rnd(3, 5.5) }); } }
/* 제임스: DECIDED with the user 2026-11-24. Condition 6 red-bullet hits; basic = bullet x1.25 + knockback; 속사 = every 3rd shot is red; 정확한 발사 A = splits into 3 homing bullets;
   양손 권총 = fire rate +15 %; 자동 조준 B = hit enemy is marked (+25 % damage taken); 마지막 한 발 A = explodes with a big shockwave; 강화탄 A = fire left on the path. NUMBERS NOT GIVEN BY THE USER ARE TEMP. */
AW_BOOST.pistol = {
  shot(f, o) {
    if (!o.skill) {
      o.awr = 1.25; const kb = e => knock(e, f.x, f.y, 420); const old = o.onHit; o.onHit = (e, b, d) => { kb(e); if (old) old(e, b, d); };      // 일반 공격: x1.25 size, knockback 420 (TEMP)
      if (time < (f.st.awRp || 0)) { f.st.awN3 = (f.st.awN3 || 0) + 1; if (f.st.awN3 % 3 === 0) { o.dmg = f.h.dmg * 1.25; o.r = 7; o.shape = 'redshot'; } }      // 속사: every 3rd shot is red
      if (B(f, 'auto')) { const o0 = o.onHit; o.onHit = (e, b, d) => { o0(e, b, d); if (e.st) e.st.awMk = time + 3; ring(e.x, e.y, 36, '#ff3d3d', .3); }; }      // 자동 조준 B: mark for 3 s (TEMP)
      if (f.st.big) o.awTrail = 1;      // 궁극기 A: fire trail
      return o;
    }
    if (o.homeT === .75) { o.count = 3; o.fan = .5; return o; }      // 정확한 발사 A: 3 homing bullets (fan .5 rad TEMP)
    if (o.r === 13 && o.shape === 'redshot') {      // 마지막 한 발 A: explodes on hit with a big shockwave (TEMP: radius 170, half of the bullet damage, knockback 900)
      const d = o.dmg; o.onHit = e => { withSrc('각성: 탄 충격파', () => { fx('bombexplode', e.x, e.y, { gy: e.y + 30 }); circ(f, e.x, e.y, 170, d * .5, { kb: 900 }); }); awRing(f, e.x, e.y, 170, '#ff3d3d'); }; return o;
    }
    return o;
  },
  run(f, i, def) {
    if (def.n === 1) { def.f(f, f.aim, i); f.st.awRp = time + 2.2; f.st.awN3 = 0; return true; }      // 속사
    if (def.n === 3) { buff(f, 'akimbo', 1.5, 1); return true; }      // 양손 권총 (A안 2026-11-25): no fire rate bonus; both bullets of the pair get the awakened x1.25 + knockback (shot() above sets them on the shared o)
  }
};
/* 군인: DECIDED with the user 2026-11-24. Condition 3000 damage dealt; basic = bullet and damage x1.25 + passes through players; 지뢰 = bigger trigger area; 수류탄 = 3 in a fan; 돌격 B = gold afterimage + pushes who it touches;
   지원 A = 3 missiles in a line; 방탄 방어막 = hit while shielded -> +7.5 % speed; 궁극기 B = missiles fall one after another in a circle round the aimed point. NUMBERS NOT GIVEN BY THE USER ARE TEMP. */
function awStorm(f, p) {      // 궁극기 B: a centre missile, then 12 more on a ring of radius 120 (TEMP) .12 s apart, each 570 like the normal ultimate
  for (let k = 0; k < 13; k++) later(k * .12, () => { const a = (k - 1) / 12 * 6.2832, d = k ? 120 : 0, x = p.x + Math.cos(a) * d, y = p.y + Math.sin(a) * d; fx('warn', x, y, { dur: .5 }); strike(f, x, y, 75, .5, () => boom(f, x, y, 75, 60)); }, f);
}
AW_BOOST.rifle = {
  shot(f, o) {
    if (!o.skill) { o.awr = 1.25; o.dmgMul = 1.25; o.pierce = 99; }      // 일반 공격: bullet size and damage x1.25, goes through players
    return o;
  },
  run(f, i, def) {
    if (def.n === 1) {      // 지뢰 설치: trigger area x2 (TEMP)
      for (const s of [-1, 1]) { const p = fwd(f, 44, f.aim + s * 1.2); const z = trap(f, p.x, p.y, 25, 2, 'mine', e => { damage(e, 20, f); buff(e, 'stun', .5); buff(e, 'slow', 3, .9); }, '#ff5d5d'); z.r = 52; }
      return true;
    }
    if (def.n === 2) {      // 수류탄: 3 grenades in a fan (+-.3 rad TEMP)
      for (const s of [-.3, 0, .3]) { const a = f.aim + s, d = Math.min(7 * T, Math.max(T, Math.hypot(f.tx - f.x, f.ty - f.y))), x = f.x + Math.cos(a) * d, y = f.y + Math.sin(a) * d; strike(f, x, y, 80, .5, () => boom(f, x, y, 80, 40)); }
      return true;
    }
    if (def.n === 3) {      // 돌격 B: gold afterimage and pushes whoever it touches (TEMP: knock 380, every .25 s)
      buff(f, 'dr', 2, .8); buff(f, 'haste', 2, 1.2);
      seq(f, 20, .1, () => { for (let k = 0; k < 4; k++) addPart({ x: f.x + rnd(-12, 12), y: f.y + rnd(-26, 6), vx: rnd(-30, 30), vy: rnd(-40, 10), life: .5, max: .5, color: k % 2 ? '#ffc21a' : '#fff1a8', r: rnd(4, 8) });
        for (const e of foes(f)) if (Math.hypot(e.x - f.x, e.y - f.y) < 55 && !(e.st && e.st.awPh > time)) { knock(e, f.x, f.y, 380); if (e.st) e.st.awPh = time + .25; } });
      return true;
    }
    if (def.n === 4) {      // 지원 A: 3 missiles in a line, 100 px apart, .25 s apart (TEMP)
      const p = aimPt(f, 9 * T), a = f.aim;
      for (let k = -1; k <= 1; k++) later((k + 1) * .25, () => { const x = p.x + Math.cos(a) * k * 100, y = p.y + Math.sin(a) * k * 100; fx('warn', x, y, { dur: .8 }); strike(f, x, y, px(110), .8, () => boom(f, x, y, px(110), 70)); }, f);
      return true;
    }
  }
};
/* 특수요원: DECIDED with the user 2026-11-24. Condition 40 bullet hits; basic A = 15 shots (not 10) with gold tracers; 연막탄 A = gold flashing smoke, area x2; 섬광탄 B = also stuns;
   전술 구르기 B = fires all round while rolling; 집중 사격 = +10 % speed for its duration; 파편 수류탄 A = shrapnel flies out in 8 directions; 궁극기 = 3 more walls (6) and +1.5 s (5.5 s). NUMBERS NOT GIVEN BY THE USER ARE TEMP. */
AW_BOOST.smg = {
  shot(f, o) { if (!o.skill) o.shape = 'tracer'; return o; },      // 일반 공격 A: gold tracers (the 15th shot count is in fire())
  run(f, i, def) {
    if (def.n === 1) {      // 연막탄 A: area x2 (radius 200, TEMP), gold flashes inside
      const p = aimPt(f, 7 * T); strike(f, p.x, p.y, 100, .4, () => { fx('smokeland', p.x, p.y); smoke(f, p.x, p.y, 200, 2.5); seq(f, 25, .1, () => { for (let k = 0; k < 3; k++) { const a = rnd(0, 6.283), d = rnd(0, 190); addPart({ x: p.x + Math.cos(a) * d, y: p.y + Math.sin(a) * d * .7, vx: rnd(-20, 20), vy: rnd(-50, -10), life: .45, max: .45, color: k ? '#ffc21a' : '#fff2b0', r: rnd(4, 9) }); } }); }, '#9aa3b8');
      return true;
    }
    if (def.n === 2) {      // 섬광탄 B: blind 1.2 s plus stun .6 s (TEMP)
      const p = aimPt(f, 7 * T); strike(f, p.x, p.y, 120, .5, () => { fx('flashbang', p.x, p.y); circ(f, p.x, p.y, 120, 0, { fn: e => { buff(e, 'blind', 1.2); buff(e, 'stun', .6); } }); }, '#ffffff');
      return true;
    }
    if (def.n === 3) {      // 전술 구르기 B: roll, firing 8 bullets all round three times (TEMP: 6 damage each, 5 tiles)
      f.inv = Math.max(f.inv, .5); lunge(f, f.aim, 2.2 * T, .3, {});
      for (let v = 0; v < 3; v++) later(v * .1, () => { for (let k = 0; k < 8; k++) emit(f, k * .7854 + v * .26, { skill: 1, dmg: 6, range: 5 * T, shape: 'tracer' }); }, f);
      return true;
    }
    if (def.n === 5) {      // 파편 수류탄 A: after the blast, shrapnel flies out in 8 directions (TEMP: 8 damage each, 4 tiles)
      const p = aimPt(f, 7 * T); strike(f, p.x, p.y, 90, .6, () => { boom(f, p.x, p.y, 90, 20, { kb: 200 }); for (let k = 0; k < 8; k++) { const a = k * .7854; emit(f, a, { skill: 1, dmg: 8, range: 4 * T, shape: 'tracer', ox: p.x - f.x - Math.cos(a) * 24, oy: p.y - (f.y + BODY) - Math.sin(a) * 24 }); } }, '#ffb347');
      return true;
    }
  },
  sk(f, i, ang, def) { if (def && def.n === 4) buff(f, 'haste', 2.5, 1.1); }      // 집중 사격: +10 % speed while it lasts
};
/* 폭발광: DECIDED with the user 2026-11-24. Condition 9 enemies hit by bombs; basic B = after the blast 3 small bombs hop out and blast again; 폭발 점프 A = shockwave + fire circle on landing; 폭격 A = 4 per side, wider;
   끈끈이 = bigger blast; 강력한 폭탄 = blast area x2 (it breaks bushes in that area, as it already did); 화염병 A = fire spreads to double the area; 집속탄 = 7 bombs that burst like fireworks. NUMBERS NOT GIVEN BY THE USER ARE TEMP. */
function awFirework(x, y) {
  const cols = ['#ff4d4d', '#ffc21a', '#4dd2ff', '#9dff6a', '#ff7bd9', '#ffffff'];
  ring(x, y, 70, '#ffc21a', .4);
  for (let k = 0; k < 30; k++) { const a = k / 30 * 6.2832, v = rnd(110, 230); addPart({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v * .8 - 30, life: .8, max: .8, color: cols[k % 6], r: rnd(3, 6) }); }
}
AW_BOOST.grenade = {
  shot(f, o) {
    if (!o.skill) { o.onBoom = (x, y) => { for (let k = 0; k < 3; k++) { const a = k * 2.0944 + rnd(0, 1), x2 = x + Math.cos(a) * 85, y2 = y + Math.sin(a) * 85; later(.3, () => { boom(f, x2, y2, 60, 20); awFirework(x2, y2); }, f); } }; }      // 일반 공격 B: 3 small bombs (radius 60, damage 20, TEMP)
    return o;
  },
  run(f, i, def) {
    if (def.n === 1) {      // 폭발 점프 A: always a shockwave on landing + a fire circle (TEMP: radius 140, knock 520, fire radius 100)
      const a = f.aim; boom(f, f.x, f.y, 100, 56);
      lunge(f, a, 4 * T, .45, { fly: 2, end: g => { circ(g, g.x, g.y, 140, 0, { kb: 520, stun: .4 }); awRing(g, g.x, g.y, 140, '#ff7a1a'); awFire(g, g.x, g.y, 100, 3, 6); } });
      return true;
    }
    if (def.n === 2) { for (const s of [0, Math.PI]) emit(f, f.aim + s, { count: 4, fan: .7, full: 1 }); return true; }      // 폭격 A: 4 each side, wider fan (TEMP .7 rad)
    if (def.n === 3) {      // 끈끈이: the blast radius 90 -> 150 (TEMP)
      emit(f, f.aim, { skill: 1, dmg: 15, spd: 620, range: 6 * T, r: 9, shape: 'potion', onHit: e => { seq(f, 3, .5, () => { if (!e.dead) ring(e.x, e.y, 46, '#ff5d5d', .25); }); later(1.5, () => { boom(f, e.x, e.y, 150, 70, { kb: 300 }); }, f); } });
      return true;
    }
    if (def.n === 5) {      // 화염병 A: the fire spreads from radius 90 to 180 over 1.5 s (TEMP)
      const p = aimPt(f, 7 * T); strike(f, p.x, p.y, 90, .4, () => { burst(p.x, p.y, '#ff7a2a', 14, 220); zone({ by: f, x: p.x, y: p.y, r: 90, t: 3, col: '#ff7a2a', op: .3, fn: (z, dt) => { z.r = Math.min(180, z.r + 60 * dt); z.acc += dt; if (z.acc >= .5) { z.acc -= .5; circ(f, z.x, z.y, z.r, 10, { quiet: 1 }); } } }); }, '#ff7a2a');
      return true;
    }
  }
};
/* 보안관 올가미 줄: the rope is drawn from the sheriff to the flying loop and then to the pulled enemy (normal skill, not only awakened; user 2026-11-24) */
function drawRopes() {
  const line = (x0, y0, x1, y1) => { ctx.save(); ctx.lineCap = 'round'; ctx.strokeStyle = '#6b4a22'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); ctx.strokeStyle = '#d9b070'; ctx.lineWidth = 2.5; ctx.setLineDash([6, 5]); ctx.stroke(); ctx.restore(); };
  for (const b of bullets) if (b.o && b.o.rope && b.owner && !b.owner.dead) line(b.owner.x, b.owner.y + BODY, b.x, b.y);
  for (const f of fighters) if (f.st && f.st.rope && f.st.rope.t > time && f.st.rope.e && !f.st.rope.e.dead) line(f.x, f.y + BODY, f.st.rope.e.x, f.st.rope.e.y + BODY);
}
function awBreakAt(x, y, rad) {      // 보안관 집속 발사 / 삼연발 (the tile it is in) and 중화기병 (rad px around it): breaks walls and bushes it passes (border walls stay)
  const c0 = Math.floor(x / T), r0 = Math.floor(y / T), k = rad && rad > 1 ? 1 : 0;
  for (let r = r0 - k; r <= r0 + k; r++) for (let c = c0 - k; c <= c0 + k; c++) {
    if (c <= 0 || r <= 0 || c >= COLS - 1 || r >= ROWS - 1) continue; if (k && Math.hypot((c + .5) * T - x, (r + .5) * T - y) > rad + T * .5) continue;
    const t = MAP[r][c]; if (t === '#') { MAP[r][c] = '.'; NET.mapVer++; burst((c + .5) * T, (r + .5) * T, TH.wt, 14, 260); } else if (t === 'g') { MAP[r][c] = '.'; NET.mapVer++; burst((c + .5) * T, (r + .5) * T, '#4f8a3a', 10, 200); }
  }
}
function awCounterShot(e, by) { emit(e, angTo(e, by), { skill: 1, count: 1, dmg: 12, range: 6 * T, spd: 800, r: 6, shape: 'icy' }); }      // TEMP: 12 damage, 6 tiles
/* 보안관: DECIDED with the user 2026-11-24. Condition damage dealt 3000; basic A = 7 pellets; 충격파 A = two blasts in a row; 올가미 = pulled enemy stunned .5 s; 집속 발사 and 삼연발 = break walls and bushes they pass;
   분노의 질주 = pushes whoever it touches + 100 damage (no flames, user); 무법자 A = hit while shielded fires a counter shot (cyan shield, not gold). NUMBERS NOT GIVEN BY THE USER ARE TEMP. */
AW_BOOST.shotgun = {
  shot(f, o) {
    if (o.ult) { o.wp = true; o.awBreak = 1; return o; }      // 삼연발: breaks walls and bushes
    if (o.fan != null && o.fan < .3) { o.wp = true; o.awBreak = 1; return o; }      // 집속 발사 (it is not flagged skill: it is told apart by its narrow fan)
    if (!o.skill) { o.count = 7; o.shape = 'icy'; return o; }      // 일반 공격 A: 7 pellets (icy blue tracers)
    return o;
  },
  run(f, i, def) {
    if (def.n === 1) {      // 충격파 A: a second blast .35 s later (TEMP: same size and strength)
      for (const k of [0, .35]) later(k, () => { ring(f.x, f.y, 120, '#8de8ff'); circ(f, f.x, f.y, 120, 18, { kb: 620 }); }, f);
      return true;
    }
    if (def.n === 4) {      // 분노의 질주: the speed-up as before; touching an enemy pushes it and deals 100 (once per .5 s, TEMP)
      def.f(f, f.aim, i);
      seq(f, 30, .1, () => { for (const e of foes(f)) if (Math.hypot(e.x - f.x, e.y - f.y) < 50 && !(e.st && e.st.awPh > time)) { knock(e, f.x, f.y, 450); damage(e, 100, f, { px: 1 }); if (e.st) e.st.awPh = time + .5; }
        addPart({ x: f.x - Math.cos(f.aim) * 10, y: f.y - 8, vx: rnd(-20, 20), vy: rnd(-20, 20), life: .35, max: .35, color: '#cfeeff', r: rnd(3, 6) }); });
      return true;
    }
    if (def.n === 5) { def.f(f, f.aim, i); f.st.awRev = time + 2; return true; }      // 무법자 A
  }
};
/* 중화기병: DECIDED with the user 2026-11-24 (no A/B). Condition 4 enemies hit by skill rockets; basic = rocket x1.25 and it breaks the walls and bushes around it while it flies; 3연발 = 4 rockets;
   연막/화염/전기 로켓 = 3 rockets in a fan; 유도탄 = leaves fire where it hits and also breaks walls and bushes on the way. NUMBERS NOT GIVEN BY THE USER ARE TEMP (fan .5 rad, break radius 70 px, fire r80 3 s). */
AW_BOOST.bazooka = {
  shot(f, o) {
    if (!o.skill) { o.awr = 1.25; o.awBreak = 70; if (f.st.homing) o.onEnd = b => fire3(f, b.x, b.y, 80, 3, 8); return o; }
    if (o.onEnd || o.stun) { o.count = 3; o.fan = .5; }      // 연막 / 화염 / 전기 로켓
    return o;
  },
  run(f, i, def) {
    if (def.n === 1) { seq(f, 4, .18, () => emit(f, f.aim, { skill: 1, dmg: 30, splash: 55, shape: 'rocket' })); return true; }      // 3연발 -> 4 rockets
  }
};
/* 정원사: DECIDED with the user 2026-11-24. Condition 6 hits while standing in a planted bush; basic A = 3 seeds in a fan, 3 sprouts; 덤불 심기 = 3x3; 가시 넝쿨 B = 3 fanned lines; 해바라기 = 3 sunflowers;
   씨앗 폭탄 B = star seeds in 8 directions; 꽃잎 바람 A = petal whirlwind pulls enemies in, then pushes and hurts those in range; 궁극기 A = radius 6 tiles, enemies inside the bush stay rooted. NUMBERS NOT GIVEN BY THE USER ARE TEMP. */
function awForestRoot(f, x, y, R) {      // the forest burst: for its 7 s, enemies standing in the new bush are rooted again and again (.3 s each .2 s)
  zone({ by: f, x, y, r: R, t: 7, col: '#4caf3a', op: 0, fn: (z, dt) => { z.acc += dt; if (z.acc < .2) return; z.acc -= .2; for (const e of foes(f)) if (!e.minion && Math.hypot(e.x - z.x, e.y - z.y) < z.r && plantAt(e.x, e.y)) buff(e, 'root', .3); } });
}
function awVine(f, a, S) {      // one thorn vine line (same numbers as the normal skill); S is shared by the 3 lines so nobody is hit twice at once
  for (let i = 0; i < 5; i++) {
    const d = .55 * T + i * .82 * T, x = f.x + Math.cos(a) * d, y = f.y + Math.sin(a) * d;
    if (solidAt(x, y) || x < T || y < T || x > WW - T || y > WH - T) break;
    zone({ by: f, x, y, r: 30, t: 4, col: '#4caf3a', op: 0, kind: 'vine', fn: (z, dt) => {
      for (const e of foes(f)) {
        if (e.minion || !inZone(z, e) || S.at.get(e) === time) continue;
        S.at.set(e, time);
        if (!S.hit.has(e)) { S.hit.add(e); buff(e, 'root', .5); fx('snare', e.x, e.y + BODY, { hit: true }); }
        buff(e, 'slow', .25, .7);
        const v = (S.acc.get(e) || 0) + dt; if (v >= .5) { damage(e, 7.5, f, { quiet: 1 }); S.acc.set(e, v - .5); } else S.acc.set(e, v);
      }
    } });
  }
  fxPlay('garden', 'vine', Math.round(f.x), Math.round(f.y), +a.toFixed(2));
}
function awSunflower(f, p, a) {      // same sunflower as the normal skill
  fxPlay('garden', 'grow', Math.round(p.x), Math.round(p.y), 1);
  minion({ by: f, kind: 'sunflower', x: p.x, y: p.y, hp: 90, t: 6, hit: true, cd: .5, ht: .5, aim: a,
    upd: (m, dt) => {
      m.ht -= dt; if (m.ht <= 0) { m.ht += .5; for (const o of fighters) if (!o.dead && o.team === m.team && Math.hypot(o.x - m.x, o.y - m.y) < 2.2 * T) heal(o, 1.5); }
      m.cd -= dt; if (m.cd > 0) return;
      const e = nearest(m, 5 * T, null, 0); if (!e) return;
      m.cd = .9; m.aim = angTo(m, e); m.sw = time;
      const sx = m.x + Math.cos(m.aim) * 14, sy = m.y + BODY - 20;
      bullets.push({ src: SRC, x: sx, y: sy, vx: Math.cos(m.aim) * 700, vy: Math.sin(m.aim) * 700, spd: 700, ang: m.aim, life: 5.3 * T, dmg: 10, team: m.team, owner: f, r: 5, shape: 'seed', pierce: 0, splash: 0, phase: 0, o: { skill: 1 }, hit: new Set(), born: time, x0: m.x, y0: m.y });
    },
    end: m => { if (!m.dead || m.gone) return; fxPlay('garden', 'pollen', Math.round(m.x), Math.round(m.y), 1.5 * T); circ(f, m.x, m.y, 1.5 * T, 0, { fn: e => buff(e, 'blind', 1) }); } });
}
AW_BOOST.gardener = {
  shot(f, o) { if (!o.skill) { o.count = 3; o.fan = .3; } return o; },      // 일반 공격 A: 3 seeds (fan .3 rad, TEMP); each leaves a sprout where it lands
  run(f, i, def) {
    if (def.n === 1) {      // 덤불 심기: 3x3 cells
      const p = aimPt(f, 5 * T), cells = cellsAround(p.x, p.y, 3), keys = cells.map(([c, r]) => c + ',' + r);
      const list = f.st.bush || (f.st.bush = []);
      for (let k = list.length - 1; k >= 0; k--) if (!list[k].some(q => GD.plants.has(q))) list.splice(k, 1);
      if (!gdPlant(cells, 10)) return false;      // (planted first, as in gardener.js)
      while (list.length >= 2) gdUnplant(list.shift().filter(k => !keys.includes(k)));
      list.push(keys); fxPlay('garden', 'grow', Math.round(p.x), Math.round(p.y), 3);
      return true;
    }
    if (def.n === 2) { const S = { hit: new Set(), acc: new Map(), at: new Map() }; for (const s of [-.35, 0, .35]) awVine(f, f.aim + s, S); return true; }      // 가시 넝쿨 B: 3 lines (+-.35 rad TEMP)
    if (def.n === 3) {      // 해바라기 포탑: 3 sunflowers side by side (1 tile apart, TEMP)
      let p = aimPt(f, 2.5 * T); if (blockedAt(p.x, p.y)) p = { x: f.x, y: f.y };
      for (const m of minions) if (m.kind === 'sunflower' && m.by === f) { m.t = 0; m.gone = 1; }
      for (const k of [-1, 0, 1]) { const q = { x: p.x - Math.sin(f.aim) * k * T, y: p.y + Math.cos(f.aim) * k * T }; awSunflower(f, blockedAt(q.x, q.y) ? p : q, f.aim); }
      return true;
    }
    if (def.n === 4) {      // 씨앗 폭탄 B: after the blast 8 star seeds fly out (TEMP: 8 damage each, 4 tiles)
      const p = aimPt(f, 7 * T); strike(f, p.x, p.y, 90, .5, () => { boom(f, p.x, p.y, 90, 30, { kb: 0, col: '#7bc96f', slow: [.7, 1.5] }); for (let k = 0; k < 8; k++) { const a = k * .7854; emit(f, a, { skill: 1, count: 1, dmg: 8, range: 4 * T, shape: 'star', ox: p.x - f.x - Math.cos(a) * 24, oy: p.y - (f.y + BODY) - Math.sin(a) * 24 }); } }, '#7bc96f');
      return true;
    }
    if (def.n === 5) {      // 꽃잎 바람 A: a whirlwind 2 tiles ahead pulls enemies in for .8 s, then pushes them out and hurts them (TEMP: radius 150, damage 20, knockback 700)
      f.swing = .22; const cx = f.x + Math.cos(f.aim) * 2 * T, cy = f.y + Math.sin(f.aim) * 2 * T, R = 150;
      zone({ by: f, x: cx, y: cy, r: R, t: .8, col: '#ff9ecb', op: 0, fn: (z, dt) => {
        for (const e of foes(f)) if (!e.minion && Math.hypot(e.x - z.x, e.y - z.y) < z.r + 10) knock(e, z.x, z.y, -900 * dt);
        for (let k = 0; k < 3; k++) { const a = time * 7 + k * 2.1, d = rnd(30, R); addPart({ x: z.x + Math.cos(a) * d, y: z.y + Math.sin(a) * d * .7, vx: -Math.sin(a) * 140, vy: Math.cos(a) * 100, life: .4, max: .4, color: k % 2 ? '#ff9ecb' : '#bff0a8', r: rnd(3, 5) }); }
      } });
      later(.8, () => { awRing(f, cx, cy, R, '#ff9ecb'); circ(f, cx, cy, R, 20, { kb: 700 }); }, f);
      return true;
    }
  }
};
/* 차원여행자: DECIDED with the user 2026-11-24. Condition 8 hits with a bounced bullet; basic B = splits in two at every bounce, up to 5 bounces; 포탈 파괴 B = a small black hole for 1 s; 차원 도약 A = star-shaped shockwave on arrival;
   반사 구체 A = 10 bounces, ice-crystal shards at every bounce; 차원 균열 B = a column of light with continuous damage; 차원 이탈 A = shadow clones attack while gone; 궁극기 = the portals turn gold and shoot dimension bullets at enemies near them.
   NUMBERS NOT GIVEN BY THE USER ARE TEMP. */
function awStarBurst(x, y, R, c1, c2) {
  const pts = []; for (let k = 0; k < 5; k++) { const a = -Math.PI / 2 + k * 4 * Math.PI / 5; pts.push([x + Math.cos(a) * R, y + Math.sin(a) * R * .8]); }
  for (let k = 0; k < 5; k++) { const [x0, y0] = pts[k], [x1, y1] = pts[(k + 1) % 5]; for (let s = 0; s < 9; s++) { const u = s / 9; addPart({ x: x0 + (x1 - x0) * u, y: y0 + (y1 - y0) * u, vx: (x0 + (x1 - x0) * u - x) * .5, vy: (y0 + (y1 - y0) * u - y) * .4, life: .55, max: .55, color: (k + s) % 2 ? c1 : c2, r: 3.5 }); } }
  ring(x, y, R, c1, .4);
}
function awIce(x, y) { for (let k = 0; k < 12; k++) { const a = k / 12 * 6.2832 + rnd(-.2, .2), v = rnd(90, 200); addPart({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: .6, max: .6, color: k % 2 ? '#e8fbff' : '#8de8ff', r: rnd(2.5, 5) }); } }
function awHole(f, x, y) {      // a small black hole for 1 s (TEMP: radius 110, pull 260 px/s, no damage)
  zone({ by: f, x, y, r: 110, t: 1, col: 'rgba(0,0,0,0)', op: 0, kind: 'rift', fn: (z, dt) => { for (const e of foes(f)) if (!e.minion && inZone(z, e)) { const dx = z.x - e.x, dy = z.y - e.y, d = Math.hypot(dx, dy) || 1; if (d > 12) moveFighter(e, dx / d * 260 * dt, dy / d * 260 * dt); } } });
}
function awPortalShoot(f, z, dt) {      // a portal fires a dimension bullet every .7 s at the nearest enemy within 5 tiles (TEMP: damage 10)
  z.sc = (z.sc || 0) - dt; if (z.sc > 0) return;
  const e = nearest({ x: z.x, y: z.y, team: f.team, b: {} }, 5 * T, null, 0, false); if (!e) return;
  z.sc = .7; const a = Math.atan2(e.y + BODY - z.y, e.x - z.x);
  emit(f, a, { skill: 1, count: 1, dmg: 10, range: 6 * T, spd: 700, r: 6, shape: 'portalbullet', bnc: 0, awp: 1, ox: z.x - f.x - Math.cos(a) * 24, oy: z.y - (f.y + BODY) - Math.sin(a) * 24 });
}
function awSplit(b) {      // basic B: a second bullet leaves at every bounce (the copy does not split again)
  const a = b.ang + .45, c = Object.assign({}, b, { hit: new Set(), ang: a, vx: Math.cos(a) * b.spd, vy: Math.sin(a) * b.spd, o: Object.assign({}, b.o, { awBounce: null }) });
  bullets.push(c); awIce(b.x, b.y);
}
AW_BOOST.portalgun = {
  shot(f, o) {
    if (o.awp) return o;
    if (!o.skill) { o.bnc = 5; o.awBounce = awSplit; return o; }      // 일반 공격 B: up to 5 bounces, splits at each
    if (o.shape === 'portalbullet') { o.bnc = 10; o.awBounce = b => awIce(b.x, b.y); }      // 반사 구체 A: 10 bounces, ice shards
    return o;
  },
  run(f, i, def) {
    if (def.n === 1) {      // 포탈 파괴 B: same blast, then a black hole where each portal was
      const ps = myPortals(f).filter(z => !z.dead); if (!ps.length || f.st.pblast) return false; f.st.pblast = 1;
      for (const z of ps) { fx('skillring', z.x, z.y, { color: '#9a9aa8', r: 60 }); burst(z.x, z.y, '#9a9aa8', 10, 120); }
      later(.5, () => { f.st.pblast = 0; for (const z of ps) { if (z.dead) continue; boom(f, z.x, z.y, 114, 65, { kb: 600, col: '#b45cff' }); z.dead = true; awHole(f, z.x, z.y); } }, f);
      return true;
    }
    if (def.n === 2) { const p = aimPt(f, 5 * T), q = landAt(p.x, p.y); blinkTo(f, q.x, q.y); awStarBurst(f.x, f.y, 130, '#d6c2ff', '#8de8ff'); circ(f, f.x, f.y, 130, 20, { kb: 500 }); return true; }      // 차원 도약 A: star shockwave on arrival (TEMP radius 130, damage 20)
    if (def.n === 4) {      // 차원 균열 B: the rift plus a column of light (TEMP: +6 damage every .25 s)
      const p = aimPt(f, 6 * T);
      zone({ by: f, x: p.x, y: p.y, r: 95, t: 2.5, col: 'rgba(0,0,0,0)', op: 0, kind: 'rift', fn: (z, dt) => {
        z.acc += dt; const tk = z.acc >= .5; if (tk) z.acc -= .5; z.l = (z.l || 0) + dt; const lt = z.l >= .25; if (lt) z.l -= .25;
        for (let k = 0; k < 2; k++) addPart({ x: z.x + rnd(-30, 30), y: z.y + rnd(-10, 10), vx: 0, vy: rnd(-260, -160), life: .5, max: .5, color: k ? '#ffffff' : '#bff4ff', r: rnd(2.5, 4.5) });
        for (const e of foes(f)) if (!e.minion && inZone(z, e)) { const dx = z.x - e.x, dy = z.y - e.y, d = Math.hypot(dx, dy) || 1; if (d > 12) moveFighter(e, dx / d * 150 * dt, dy / d * 150 * dt); if (tk) damage(e, 4, f); if (lt) damage(e, 6, f, { quiet: 1 }); } } });
      return true;
    }
    if (def.n === 5) {      // 차원 이탈 A: shadow clones shoot from both sides while she is gone (TEMP: 5 shots, 10 damage)
      def.f(f, f.aim, i);
      seq(f, 5, .3, k => { const e = nearest(f, 6 * T, null, 0); if (!e) return; const a = angTo(f, e), s = k % 2 ? 1 : -1, ox = -Math.sin(a) * 42 * s, oy = Math.cos(a) * 42 * s;
        for (let n = 0; n < 5; n++) addPart({ x: f.x + ox, y: f.y + oy, vx: rnd(-40, 40), vy: rnd(-60, 0), life: .4, max: .4, color: '#6a45b0', r: rnd(3, 6) });
        emit(f, a, { skill: 1, count: 1, dmg: 10, range: 6 * T, spd: 760, r: 5, shape: 'shadow', bnc: 0, awp: 1, ox, oy }); });
      return true;
    }
  }
};
/* 약초꾼: DECIDED with the user 2026-11-24. Condition 1500 health healed (allies + herself); basic = heal splash and puddle x2; 치유 안개 = x2 radius; 독 안개 B = foes inside also blinded and slowed more;
   응급 붕대 A = a second ally at the same time; 물약 소나기 A = 10 potions in a star; 해독 물약 A = a healing ripple for allies near her; 생명의 정원 A = radius 6 tiles and the flowers bloom as columns of light. NUMBERS NOT GIVEN BY THE USER ARE TEMP. */
function awStarVolley(f, p) {      // 10 potions on a star outline (5 outer + 5 inner points, outer radius 1.4 tiles, TEMP), .05 s apart
  const pts = []; for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, R = (k % 2 ? .55 : 1.4) * T; pts.push([p.x + Math.cos(a) * R, p.y + Math.sin(a) * R * .8]); }
  pts.forEach(([x, y], i) => later(i * .05, () => { if (f.dead) return; const a = Math.atan2(y - f.y, x - f.x), d = Math.max(T, Math.hypot(x - f.x, y - f.y)); hbPotion(f, a, d); }, f));
}
function awHealWave(f) {      // 해독 물약 A: a ripple of healing round her (TEMP: radius 200, 80 health each)
  ring(f.x, f.y, 200, '#6ee08a', .5); for (let k = 0; k < 24; k++) { const a = k / 24 * 6.2832; addPart({ x: f.x + Math.cos(a) * 30, y: f.y + Math.sin(a) * 20, vx: Math.cos(a) * 190, vy: Math.sin(a) * 130, life: .55, max: .55, color: k % 2 ? '#bff0a8' : '#6ee08a', r: 4 }); }
  for (const o of allies(f)) if (o !== f && Math.hypot(o.x - f.x, o.y - f.y) < 200) hbH(f, o, 8);
}
function awGardenBeams(f, x, y, R) {      // 생명의 정원 A: columns of light rise from the flower bed for its 5 s (visual)
  seq(f, 40, .125, () => { for (let k = 0; k < 3; k++) { const a = rnd(0, 6.2832), d = Math.sqrt(Math.random()) * R, bx = x + Math.cos(a) * d, by = y + Math.sin(a) * d * .75;
    for (let n = 0; n < 5; n++) addPart({ x: bx + rnd(-3, 3), y: by - n * 10, vx: 0, vy: rnd(-230, -170), life: .55, max: .55, color: n % 2 ? '#ffffff' : '#bff0a8', r: rnd(2.5, 4) }); } });
}
/* 방패병: DECIDED with the user 2026-11-25. Condition 6 skill uses; basic B = 3 thrusts in a row, the last one a wide sweep, damage +20 %; 방패 세우기 B = a crystal wall in front; 방패 돌진 B = drags the enemy along and slams it into a wall;
   도발 표식 A+B = radius 5 tiles, star marks, marked enemies are slowly pulled in; 진지 구축 B = 60 % less damage + shadow armour; 아군 엄호 B = takes the covered ally's hits and bursts with what it blocked; 궁극기 A = 6 s and two shockwaves.
   NUMBERS NOT GIVEN BY THE USER ARE TEMP. */
function awCrystal(f) {      // 방패 세우기 B: a 3-tile crystal wall 1.6 tiles ahead for 2 s (TEMP), made of the temporary-wall tiles
  const a = f.aim, p = fwd(f, 1.6 * T, a);
  for (let i = -1; i <= 1; i++) { const c = Math.floor((p.x - Math.sin(a) * i * T) / T), r = Math.floor((p.y + Math.cos(a) * i * T) / T); if (c < 1 || r < 1 || c >= COLS - 1 || r >= ROWS - 1 || blocked(c, r)) continue; if (fighters.some(e => !e.dead && Math.floor(e.x / T) === c && Math.floor(e.y / T) === r)) continue; tempWalls.set(c + r * COLS, time + 2); awGoldWalls.set(c + r * COLS, time + 2); awIce((c + .5) * T, (r + .5) * T); }
}
AW_BOOST.shieldman = {
  dmgm: 1.2,      // basic attack damage +20 % (user)
  atk(f, ang) {      // 일반 공격 B: two more thrusts .15 s apart, the third wider (TEMP: half-angle 1.1, reach x1.15)
    const h = f.h, hit = (rng, half) => { if (f.dead) return; f.swing = .22; addSwing(f, f.aim); arc(f, f.aim, h.range * rng, half, h.dmg * 1.2, { kb: h.kb, basic: 1 }); };
    later(.15, () => hit(1, h.half), f); later(.3, () => hit(1.15, 1.1), f);
  },
  run(f, i, def) {
    if (def.n === 1) { buff(f, 'block', 2); fxPlay('hbraise', fighters.indexOf(f)); awCrystal(f); return true; }
    if (def.n === 2) {      // 방패 돌진 B: whoever it hits is carried along for the rest of the charge and stunned again if slammed into a wall (TEMP: +1 s stun, 30 damage)
      const a = f.aim; lunge(f, a, 3 * T, .3, { onHit: e => { damage(e, 30, f); buff(e, 'stun', .5); fxPlay('hbbash', Math.round(e.x), Math.round(e.y + BODY));
        if (e.minion) return; seq(f, 8, .035, () => { if (e.dead) return; const nx = e.x + Math.cos(a) * 24, ny = e.y + Math.sin(a) * 24; if (blockedAt(nx, ny)) { if (!e.st.awSl2) { e.st.awSl2 = 1; later(.5, () => { e.st.awSl2 = 0; }, f); damage(e, 30, f); buff(e, 'stun', 1); awStarBurst(e.x, e.y, 60, '#cfeeff', '#8de8ff'); } return; } e.x = nx; e.y = ny; }); } });
      fxPlay('hbcharge', fighters.indexOf(f), +a.toFixed(2)); return true;
    }
    if (def.n === 3) {      // 도발 표식 A+B: radius 5 tiles, stars over the marked, and they are pulled slowly toward the shield bearer for 2 s (TEMP: 110 px/s, stops 1.5 tiles away)
      const hit = circ(f, f.x, f.y, 5 * T, 0, { fn: e => { if (!e.minion) buff(e, 'taunt', 2, f); } }), tg = hit.filter(e => !e.minion);
      fxPlay('hbtaunt', fighters.indexOf(f), tg.map(e => fighters.indexOf(e)).join(','));
      seq(f, 20, .1, () => { for (const e of tg) { if (e.dead) continue; const dx = f.x - e.x, dy = f.y - e.y, d = Math.hypot(dx, dy) || 1; if (d > 1.5 * T) moveFighter(e, dx / d * 11, dy / d * 11); for (let k = 0; k < 2; k++) addPart({ x: e.x + rnd(-12, 12), y: e.y - 70 + rnd(-8, 8), vx: rnd(-20, 20), vy: rnd(-40, -10), life: .4, max: .4, color: k ? '#ffffff' : '#9ecbff', r: rnd(2.5, 4.5) }); } });
      return true;
    }
    if (def.n === 5) {      // 아군 엄호 B: for 2 s the covered ally's hits land on the shield bearer instead; what he blocked bursts at the end (TEMP: radius 2.5 tiles, up to 1200)
      let t = null, bd = 5 * T; for (const o of allies(f)) { if (o === f) continue; const d = Math.hypot(o.x - f.x, o.y - f.y); if (d < bd) { bd = d; t = o; } }
      if (!t) { f.scd[i] = 0; return false; }
      const ang = Math.atan2(t.y - f.y, t.x - f.x), d = Math.max(0, bd - 40); lunge(f, ang, d, .25, { fly: 1 });
      for (const o of [f, t]) buff(o, 'dr', 2, .7); fxPlay('hbcover', fighters.indexOf(f), fighters.indexOf(t));
      t.st.awCv = { by: f, t: time + 2 }; f.st.awAbs = 0;
      later(2, () => { const a = Math.min(1200, f.st.awAbs || 0); f.st.awAbs = 0; if (f.dead || a < 1) return; awRing(f, f.x, f.y, 2.5 * T, '#9ecbff'); circ(f, f.x, f.y, 2.5 * T, a, { px: 1, kb: 450 }); }, f);
      return true;
    }
  }
};
AW_BOOST.harald = {
  rng: 1.3,      // 일반 공격 A: reach x1.3 (TEMP)
  atk(f, ang) { const R = f.h.range * 1.3; for (let k = -6; k <= 6; k++) { const a = ang + k * .12; addPart({ x: f.x + Math.cos(a) * R * .8, y: f.y + 6 + Math.sin(a) * R * .8, vx: Math.cos(a) * 60, vy: Math.sin(a) * 60, life: .35, max: .35, color: k % 2 ? '#ff5a3a' : '#ffb020', r: 6 - Math.abs(k) * .4 }); } },      // the red axe afterimage
  run(f, i, def) {
    if (def.n === 1) {      // 분노 A: 4 s, 25 % less damage, +15 % speed (TEMP), red flames rise from the body
      buff(f, 'dr', 4, .75); buff(f, 'haste', 4, 1.15);
      seq(f, 40, .1, () => { for (let k = 0; k < 2; k++) addPart({ x: f.x + rnd(-14, 14), y: f.y + rnd(-10, 8), vx: rnd(-20, 20), vy: rnd(-90, -150), life: .55, max: .55, color: Math.random() < .5 ? '#ff5a3a' : '#ffb020', r: rnd(3, 6) }); });
      return true;
    }
    if (def.n === 2) {      // 방패 강타 A: pushes twice as far; whoever is pushed into a wall gets a shock ring and a .8 s stun (TEMP)
      f.swing = .22; const hits = arc(f, f.aim, 100, .9, 10, { kb: 1040, stun: .3 }); if (hits.length) f.dcd *= .5;
      for (const e of hits) { const g = angTo(f, e); later(.3, () => { if (e.dead) return; if (solidAt(e.x + Math.cos(g) * 36, e.y + Math.sin(g) * 36)) { awRing(f, e.x, e.y, 70, '#ffd34d'); buff(e, 'stun', .8); } }, f); }
      return true;
    }
    if (def.n === 3) {      // 도끼 휘두르기 A: radius 150, and a second burning ring .35 s later (TEMP)
      f.spin = .8; circ(f, f.x, f.y, 150, 22, { kb: 360 }); awRing(f, f.x, f.y, 150, '#ff7a1a');
      later(.35, () => { if (f.dead) return; circ(f, f.x, f.y, 150, 22, { kb: 360 }); awRing(f, f.x, f.y, 150, '#ffb020'); }, f);
      return true;
    }
    if (def.n === 4) {      // 방패 올리기 B: the shield piles up what it blocks (tail.js makes it glow) and bursts in front when it ends (damage = what it took, cap TEMP)
      buff(f, 'block', 1.5); f.st.awB = 0;
      later(1.52, () => { if (f.dead) return; const d = f.st.awB || 0; f.st.awB = 0; if (d <= 0) return; withSrc('각성: 방패 폭발', () => { arc(f, f.aim, 230, .7, d, { kb: 600 }); for (let k = -7; k <= 7; k++) { const a = f.aim + k * .1; for (let j = 1; j <= 4; j++) addPart({ x: f.x + Math.cos(a) * j * 55, y: f.y + Math.sin(a) * j * 55, vx: Math.cos(a) * 120, vy: Math.sin(a) * 120, life: .4, max: .4, color: j % 2 ? '#ffffff' : '#ffd34d', r: 5 }); } ring(f.x, f.y, 120, '#ffd34d', .4); }); }, f);
      return true;
    }
    if (def.n === 5) {      // 내려찍기 B: the landing sends cracks 5 tiles ahead that slow whoever they hit (TEMP: damage 15, slow 40 % for 2 s)
      lunge(f, f.aim, 2 * T, .35, { fly: 1, end: g => { boom(g, g.x, g.y, 100, 17, { stun: .3, kb: 0, col: '#cfd3dc' }); withSrc('각성: 땅 균열', () => emit(g, g.aim, { skill: 1, dmg: 15, range: 5 * T, r: 14, spd: 700, pierce: 99, shape: 'pwave', slow: [.6, 2] })); } });
      return true;
    }
  },
  slam(g) {      // 도끼 돌진 B: at the end of the dash a big slam (TEMP: radius 200, damage 30, stun .8 s) with lightning
    withSrc('각성: 돌진 내려찍기', () => { boom(g, g.x, g.y, 200, 30, { col: '#ffd34d', kb: 600, stun: .8 });
      for (let k = 0; k < 9; k++) { let a = k / 9 * 6.2832 + rnd(-.2, .2), x = g.x, y = g.y + BODY * .5; for (let j = 0; j < 9; j++) { a += rnd(-.45, .45); x += Math.cos(a) * 24; y += Math.sin(a) * 24 * .8; addPart({ x, y, vx: 0, vy: 0, life: .4, max: .4, color: j % 2 ? '#ffffff' : '#ffd34d', r: 4.5 - j * .25 }); } }
      awRing(g, g.x, g.y, 200, '#ffd34d'); });
  }
};
const awOn = f => !!f && f.awT > 0;
const awRow = f => { if (!f || !f.h0 || TUT.on) return null; const c = AW_COND[f.h0.id]; return c && !c.hold && (AW_PREVIEW || !c.temp) ? c : null; };      // hold: true = the user has not decided this hero yet (네온), so it never awakens
const awBoost = f => (f && f.h0 && AW_BOOST[f.h0.id]) || null;
function awGain(by, kind, n) {
  const f = by && (by.minion ? by.by : by); if (!f || !f.h0 || f.dead || f.awT > 0 || state !== 'play') return;
  const c = awRow(f); if (!c || ((c.kind === 'chain' || c.kind === 'stl') ? kind !== 'hit' : c.kind === 'morph' ? kind !== 'dmg' : c.kind !== kind)) return;
  if (c.kind === 'morph' && f.h === f.h0) return;      // 티오니스: only while disguised as somebody else
  if (c.kind === 'stl' && !(time - (f.st.awSl == null ? -9 : f.st.awSl) < .7)) return;      // 닌자: a hit from hiding
  if (c.kind === 'chain') {      // a chain of hits: a gap longer than c.gap s breaks it; one swing that hits three enemies counts once; 사무라이 ultimate (atkLockT window) counts once
    if (time === f.awLt) return;
    if (f.h0.id === 'samurai' && time < (f.atkLockT || 0)) { if (f.st.awU === f.atkLockT) return; f.st.awU = f.atkLockT; }
    if (time - (f.awLt == null ? -9 : f.awLt) > c.gap) f.awG = 0;
    f.awLt = time; n = 1;
  }
  f.awG = (f.awG || 0) + n; if (f.awG >= awNeed(c)) awStart(f);
}
function awStart(f) {
  if (!f || f.dead || f.awT > 0) return;
  f.awT = AWAKE_SEC; f.awG = 0;
  const b = awBoost(f); if (b && b.start) b.start(f);
  say(f, '각성!', '#ffd34d'); fx('skillring', f.x, f.y, { color: '#ffd34d', r: 110 }); burst(f.x, f.y + BODY, '#ffd34d', 18, 300);
  if (f.isPlayer || visibleTo(f, VIEW)) sfx(520, .4, 'sawtooth', .07, 2.2);
}
function awEnd(f) { const b = awBoost(f); if (f.awT > 0 && b && b.end) b.end(f); f.awT = 0; f.awG = 0; }
function awStep(dt) {
  for (const f of fighters) {
    if (f.h0 && f.h0.id === 'shuriken' && !f.dead && B(f, 'stealth')) f.st.awSl = time;      // 닌자: the last moment it was hidden (the condition needs it)
    if (!(f.awT > 0)) continue;
    if (f.dead || state !== 'play') { awEnd(f); continue; }
    f.awT -= dt; if (f.awT <= 0) { awEnd(f); continue; }
    if (f.h0 && f.h0.id === 'tionis' && f.h !== f.h0) { const x = dt * .25; f.scd[0] -= x; f.scd[1] -= x; f.ucd -= x; f.dcd -= x; }      // 티오니스: cooldowns run 1.25x as fast while disguised (user)
  }
}
/* the body colour while awakened: the colour of the worn skin (if it has one) mixed in, then pushed toward gold. Different skin = different variant. */
const awMix = (a, b, k) => { const p = s => [1, 3, 5].map(i => parseInt(s.slice(i, i + 2), 16)), x = p(a), y = p(b); return '#' + x.map((v, i) => Math.round(v + (y[i] - v) * k).toString(16).padStart(2, '0')).join(''); };
function awCol(f, col) {      // like the mockup: the body is plain bright gold; a skin with a colour only leans a little toward it (the team colour is NOT mixed in: it turned the body olive)
  if (!(f.awT > 0) || typeof col !== 'string' || col[0] !== '#' || col.length !== 7) return col;
  const sk = f.cos && f.cos.skin && COSMETICS[f.cos.skin], tn = sk && /^#[0-9a-f]{6}$/i.test(sk.tint || '') ? sk.tint : null;
  const base = awMix('#ffc21a', '#fff0a0', .5 + .5 * Math.sin(time * 10) > .5 ? (.5 + .5 * Math.sin(time * 10) - .5) * .8 : 0);      // a slow shimmer toward light gold
  return tn ? awMix(base, tn, .32) : base;
}
/* behind the figure (the mockup): a soft warm glow, tall teardrop flames (orange with a light core) that rise and flicker around the body, and pale sparkles. Drawn every frame from `time`, so guests see the same. */
function awFlame(x, y, h, w) { ctx.beginPath(); ctx.moveTo(x, y - h); ctx.bezierCurveTo(x + w * 1.1, y - h * .45, x + w, y, x, y); ctx.bezierCurveTo(x - w, y, x - w * 1.1, y - h * .45, x, y - h); ctx.fill(); }
const AW_FL = [[-34, -18, 1.25], [-26, -52, 1.05], [30, -22, 1.15], [36, -56, 1.3], [-12, -76, 1], [15, -80, 1.05], [0, -6, .9], [-40, -36, 1.1], [42, -38, 1], [-46, -64, .9], [48, -14, .9]];
function awStar(x, y, r) { ctx.beginPath(); ctx.moveTo(x, y - r); ctx.lineTo(x + r * .28, y - r * .28); ctx.lineTo(x + r, y); ctx.lineTo(x + r * .28, y + r * .28); ctx.lineTo(x, y + r); ctx.lineTo(x - r * .28, y + r * .28); ctx.lineTo(x - r, y); ctx.lineTo(x - r * .28, y - r * .28); ctx.closePath(); ctx.fill(); }
/* the glow and the flames of 각성 as ready-made pictures: the same shapes and colours, drawn once and stamped (sharp at the current zoom) */
let awSprK = 0; const awSprC = new Map();
function awSprScale() { const m = ctx.getTransform(), s = Math.hypot(m.a, m.b) || 1; awSprK = Math.min(4, Math.max(.5, Math.ceil(s * 4) / 4)); return awSprK; }      // (pictures are kept per zoom step, not thrown away when another zoom draws)
function awGlowSprite() {
  const q = awSprScale(); let c = awSprC.get('g@' + q); if (c) return c;
  const n = Math.ceil(224 * q); c = document.createElement('canvas'); c.width = c.height = n; const g = c.getContext('2d'), r = n / 2, gr = g.createRadialGradient(r, r, 3 * q, r, r, r);
  gr.addColorStop(0, 'rgba(255,205,60,.6)'); gr.addColorStop(.5, 'rgba(255,160,30,.26)'); gr.addColorStop(1, 'rgba(255,120,20,0)'); g.fillStyle = gr; g.beginPath(); g.arc(r, r, r, 0, 6.3); g.fill();
  awSprC.set('g@' + q, c); return c;
}
function awFlameSprite(A) {      // h = 38, w = 10.5 is the size the picture is drawn at; see-through amount in 64 steps (the layers overlap, so it cannot simply be faded afterwards)
  const q = awSprScale(), lv = Math.max(1, Math.min(64, Math.round(A * 64))), key = 'f' + lv; const kk = key + '@' + q; let s = awSprC.get(kk); if (s) return s;
  const H0 = 38, W0 = 10.5, L = 1.4, T = 1.15, n = 2, cw = Math.ceil(W0 * L * 2 * q) + n * 2, ch = Math.ceil(H0 * T * q) + n * 2, c = document.createElement('canvas'); c.width = cw; c.height = ch;
  const g = c.getContext('2d'), sv = ctx; g.setTransform(q, 0, 0, q, cw / 2, ch - n); ctx = g; try { g.globalAlpha = lv / 64;
  const x = 0, y = 0, h = H0, w = W0; ctx.fillStyle = '#ff7a12'; awFlame(x, y, h * 1.12, w * 1.2); ctx.fillStyle = '#ffa820'; awFlame(x, y, h, w); ctx.fillStyle = '#ffe27a'; awFlame(x, y - 1, h * .6, w * .52); ctx.fillStyle = '#fffbe0'; awFlame(x, y - 2, h * .3, w * .26);
  } finally { ctx = sv; } s = { cv: c, L: cw / 2 / q / W0, T: (ch - n) / q / H0, W: cw / q / W0, H: ch / q / H0 }; if (awSprC.size > 400) awSprC.clear(); awSprC.set(kk, s); return s;
}
function awDraw(f) {
  if (!(f.awT > 0)) return;
  const k = Math.min(1, f.awT / .4) * Math.min(1, (AWAKE_SEC - f.awT) / .2 + .3), al = ctx.globalAlpha, pu = 1 + Math.sin(time * 9) * .07;
  ctx.save(); ctx.globalCompositeOperation = 'lighter';      // light adds up: it glows instead of just tinting
  const gs = awGlowSprite(); ctx.globalAlpha = al * k; ctx.drawImage(gs, -112 * pu, -34 - 112 * pu, 224 * pu, 224 * pu);      // the same glow, painted once into a picture (a new gradient every frame for every awakened fighter was the heaviest thing on screen)
  ctx.save(); ctx.translate(0, -34); ctx.rotate(time * .6); ctx.fillStyle = '#ffd34d';      // turning rays of light
  for (let i = 0; i < 9; i++) { ctx.globalAlpha = al * k * (.09 + .05 * Math.sin(time * 5 + i)); ctx.rotate(6.2832 / 9); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(120, -9); ctx.lineTo(120, 9); ctx.closePath(); ctx.fill(); }
  ctx.restore();
  for (let j = 0; j < 2; j++) { const u = (time * .9 + j * .5) % 1; ctx.globalAlpha = al * k * (1 - u) * .8; ctx.strokeStyle = j ? '#ffb020' : '#ffe27a'; ctx.lineWidth = 3 * (1 - u) + 1; ctx.beginPath(); ctx.ellipse(0, 1, 20 + u * 62, 8 + u * 25, 0, 0, 6.3); ctx.stroke(); }      // ground waves
  ctx.restore(); ctx.save();
  AW_FL.forEach(([bx, by, sz], i) => {
    const u = (time * .95 + i * .19) % 1, fl = 1 + Math.sin(time * 15 + i * 2) * .12, h = 38 * sz * (1 - u * .45) * fl, w = 10.5 * sz * (1 - u * .3), x = bx + Math.sin(time * 4 + i * 1.7) * 4, y = by - u * 26 + 20;
    const A = al * k * Math.pow(Math.sin(Math.PI * Math.min(1, u * 1.05 + .03)), .6); if (!(A > .003)) return;
    const fs = awFlameSprite(A); ctx.globalAlpha = 1; ctx.drawImage(fs.cv, x - w * fs.L, y - h * fs.T, w * fs.W, h * fs.H);      // the 4 flame layers at this see-through amount, painted once and stretched to this flame's size
  });
  for (let i = 0; i < 16; i++) { const u = (time * .6 + i * .0625) % 1, a = i * 2.4 + time * .9; ctx.globalAlpha = al * k * Math.sin(Math.PI * u); ctx.fillStyle = i % 3 ? '#ffeaa0' : '#ffffff'; const x = Math.cos(a) * (22 + (i % 4) * 9), y = -10 - u * 90 - (i % 5) * 5; if (i % 4 === 0) awStar(x, y, 3.6 + (i % 3)); else { ctx.beginPath(); ctx.arc(x, y, 1.3 + (i % 3) * .5, 0, 6.3); ctx.fill(); } }
  ctx.restore();
}
/* the gauge under the HUD (your own fighter) */
const AW_DUEL_K = .6;      // TEMP (user did not give a number): in 듀얼 배틀 / 랭크전 (one hero at a time) the conditions are 60 % of the normal number
const awNeed = c => isDuelMode(curMode) ? Math.max(1, Math.round(c.need * AW_DUEL_K)) : c.need;
function awPct(f) { if (NET.role === 'guest' && f.awP != null) return f.awP; const c = awRow(f); if (c && c.kind === 'chain' && time - (f.awLt == null ? -9 : f.awLt) > c.gap) return 0; return c ? Math.min(100, Math.round((f.awG || 0) / awNeed(c) * 100)) : 0; }
function awHud() {
  const el = document.getElementById('awBar'); if (!el) return;
  const p = player, show = !!p && !p.dead && !soloOutShown && (awOn(p) || awPct(p) > 0 || !!awRow(p) || (NET.role === 'guest' && p.awP != null));
  document.body.classList.toggle('awOn', !!p && !p.dead && awOn(p));      // 각성 B buttons (decided by the user 2026-11-24): dark buttons with a spinning gold ring
  const key = show ? (awOn(p) ? 'on' + Math.ceil(p.awT * 10) : 'g' + awPct(p)) : 'off';
  if (el._k === key) return; el._k = key; el.hidden = !show; if (!show) return;
  el.classList.toggle('on', awOn(p)); el.firstElementChild.style.width = (awOn(p) ? Math.max(0, p.awT / AWAKE_SEC * 100) : awPct(p)) + '%';
}

/* 네온: DECIDED with the user 2026-11-25. Condition = dash used 8 times. Basic = A (bigger sweep + blue lightning jumps to others), 대검 돌진 = A (3 beams, only ONE enemy is pulled: the one nearest the middle line),
   네온 돌진 = 1.75x length, 분노 = B (5 s), 찌르기 = A (a straight light beam through several enemies), 네온 가속 = A (1.5x speed + afterimages), ultimate = a 5x5 wall ring (3x3 inside empty) for 3 s around 네온
   when the ult caught someone. EVERY NUMBER NOT GIVEN BY THE USER IS A TEMP PLACEHOLDER (sweep reach 1.3x, lightning 10 damage / 2 jumps / 3 tiles, beam fan .3 rad, 찌르기 beam 5 tiles). */
function awZap(x0, y0, x1, y1) {      // a short blue lightning line made of particles
  const n = Math.max(3, Math.round(Math.hypot(x1 - x0, y1 - y0) / 14));
  for (let i = 0; i <= n; i++) { const k = i / n; addPart({ x: x0 + (x1 - x0) * k + rnd(-7, 7), y: y0 + (y1 - y0) * k + rnd(-7, 7), vx: 0, vy: 0, life: .22, max: .22, color: i % 2 ? '#e8fbff' : '#6cc8ff', r: rnd(2, 3.5) }); }
}
function awRingWall(f) {      // 궁극기: 5x5 ring of temporary walls around 네온 (the inner 3x3 stays open), gone after 3 s
  const c0 = Math.floor(f.x / T), r0 = Math.floor(f.y / T);
  for (let dc = -2; dc <= 2; dc++) for (let dr = -2; dr <= 2; dr++) {
    if (Math.abs(dc) < 2 && Math.abs(dr) < 2) continue;
    const c = c0 + dc, r = r0 + dr; if (c < 1 || r < 1 || c >= COLS - 1 || r >= ROWS - 1 || blocked(c, r)) continue;
    if (fighters.some(e => !e.dead && Math.floor(e.x / T) === c && Math.floor(e.y / T) === r)) continue;
    tempWalls.set(c + r * COLS, time + 3); awGoldWalls.set(c + r * COLS, time + 3); awIce((c + .5) * T, (r + .5) * T);
  }
}
AW_BOOST.shade = {
  rng: 1.3,      // 일반 공격 A: the sweep reaches further (TEMP)
  atk(f, ang) {      // 일반 공격 A: lightning jumps from the enemy that was hit to up to 2 more within 3 tiles (TEMP 10 damage)
    const e = nearest(f, 135 * 1.3, ang, 1.6, false); if (!e) return;
    let cur = e; const done = new Set([e]);
    withSrc('각성: 번개', () => { for (let k = 0; k < 2; k++) { let nx = null, bd = 3 * T; for (const g of foes(f)) { if (done.has(g) || g.minion) continue; const d = dist(cur, g); if (d < bd) { bd = d; nx = g; } } if (!nx) break; awZap(cur.x, cur.y + BODY, nx.x, nx.y + BODY); damage(nx, 14, f, { quiet: 1, el: 1 }); done.add(nx); cur = nx; } });
  },
  run(f, i, def) {
    const a = f.aim;
    if (def.n === 1) {      // 대검 돌진 A: 3 beams; of everyone hit only the one nearest the middle line is pulled in
      const hits = []; let pending = false;
      const col = CONCEPT_COLOR[conceptOfSkin(skinOf(f.cos, 'shade'))];
      emit(f, a, { skill: 1, dmg: 15, stun: .5, spd: 1040, range: 7 * T, r: 10, shape: 'arrow', count: 3, fan: .3, onHit: e => {
        if (!hits.includes(e)) { let da = angTo(f, e) - a; da = Math.atan2(Math.sin(da), Math.cos(da)); hits.push({ e, da: Math.abs(da) }); }
        if (pending) return; pending = true;
        later(.12, () => { if (f.dead || !hits.length) return; hits.sort((p, q) => p.da - q.da); const t = hits[0].e; if (t.dead) return;
          fx('shchain', f.x, f.y + BODY, { x2: Math.round(t.x), y2: Math.round(t.y + BODY), hit: true, col }); lunge(f, angTo(f, t), Math.max(10, dist(f, t) - 40), .18, { fly: 1 }); }, f);
      } });
      return true;
    }
    if (def.n === 2) {      // 네온 돌진: the dash is 1.75x as long (user)
      lunge(f, a, 4 * T * 1.75, .3, { onHit: e => { damage(e, 20, f); buff(e, 'stun', .3); return 'stop'; } }); return true;
    }
    if (def.n === 3) { buff(f, 'rage', 5); return true; }      // 분노 B: 3 s -> 5 s (user)
    if (def.n === 4) {      // 찌르기 A: the thrust becomes a straight beam of light 5 tiles long that goes through everybody (TEMP length)
      if (!nearest(f, 140, a, .8)) return false; f.swing = .22;
      const x1 = f.x + Math.cos(a) * 5 * T, y1 = f.y + Math.sin(a) * 5 * T; awZap(f.x, f.y + BODY, x1, y1 + BODY); awZap(f.x, f.y + BODY - 4, x1, y1 + BODY + 4);
      pathHit(f, f.x, f.y, x1, y1, 22, 25, { stun: .9 }); return true;
    }
    if (def.n === 5) {      // 네온 가속 A: speed 1.3 -> 1.5, afterimages along the way
      buff(f, 'haste', 2.5, 1.5); buff(f, 'dr', 2.5, .8);
      seq(f, 10, .25, () => { burst(f.x, f.y + BODY, '#3fe0c5', 8, 60); ring(f.x, f.y, 26, '#3fe0c5', .35); }); return true;
    }
  },
  ult(f, ang) {      // 궁극기: when the blink caught someone (they are stunned right in front of 네온) a 5x5 wall ring stands around 네온 for 3 s
    if (foes(f).some(e => !e.minion && !e.dead && B(e, 'stun') && dist(f, e) < 110)) awRingWall(f);
  }
};
