/* ===== 약초꾼 (herbal) and 방패병 (shieldman): new characters (mockups approved 2026-11-13; looks: 약초꾼 head 1 + gear 1, 방패병 head 1 + gear 1) =====
   약초꾼: healer. Thrown potion (arcs over walls, hurts foes, heals allies where it breaks), heal / poison mists, bandage, potion volley, antidote, life garden.
   방패병: protector tank. Spear thrust, raised shield (engine 'block'), shield charge, taunt mark (foes deal half damage to anyone but him), dig in, cover an ally, steel wall.
   Hooks elsewhere: tail.js drawStick (art) and bullet loop (potion shot), fx.js drawZoneArt (mists, garden), engine.js damage() (taunt halving) and ai0() (taunted bots go for him). */
WEAPONS.herbal = { id: 'herbal', name: '물약병', kind: 'gun', dmg: 18, cd: 1.0, bulletSpeed: 700, life: 1.1, shape: 'potion', desc: '던지면 깨지는 유리 물약병' };
WEAPONS.shieldman = { id: 'shieldman', name: '짧은 창', kind: 'melee', dmg: 30, cd: .6, range: 92, shape: 'spear', thrust: true, desc: '방패와 함께 드는 짧은 창' };
const HB = { g: '#6ee08a', gd: '#3f9a4f', p: '#a46be0', w: '#f5efe0', s: '#5d9cec', st: '#9aa4ad' };
const hbHurtAllies = (f, r) => allies(f).filter(o => Math.hypot(o.x - f.x, o.y - f.y) < r && o.hp < o.mhp);
const hbMostHurt = (f, r) => { let b = null, s = 1; for (const o of hbHurtAllies(f, r)) { const k = o.hp / o.mhp; if (k < s) { s = k; b = o; } } return b; };
function hbSplashHeal(f, x, y, r, n) { for (const o of allies(f)) if (Math.hypot(o.x - x, o.y + BODY - y) < r + 20) heal(o, n); }
function hbPotion(f, ang, dist, o) {       // one lobbed potion (skill): lands at dist, splashes, heals allies there
  emit(f, ang, Object.assign({ skill: 1, count: 1, fan: 0, spread: 0, range: dist, shape: 'potion', wp: 1, r: 6, spd: 620, splash: 58, dmg: 18, onEnd: b => { hbSplashHeal(f, b.x, b.y, 58, 4); fxPlay('hbsplash', Math.round(b.x), Math.round(b.y), 0); } }, o));
}

/* the puddle a basic-attack potion leaves: 0.75 s, every 0.25 s allies in it heal 20 and foes take 50 (x10 in game) */
function hbPuddle(f, x, y) {
  zone({ by: f, x, y: y - BODY, r: 52, t: .75, col: HB.g, op: 0, kind: 'hbpuddle', seed: Math.floor(Math.random() * 1e4), fn: (z, dt) => {
    z.acc += dt; if (z.acc < .25) return; z.acc -= .25;
    for (const o of allies(f)) if (inZone(z, o)) heal(o, 2);
    circ(f, z.x, z.y, z.r, 5, { quiet: 1 });
  } });
}
/* ---------- 약초꾼 ---------- */
hero('herbal', { p: ['약초 향기', '물약이 깨진 자리 근처 아군(나 포함)은 체력 40 회복 · 상대에게 피해를 주면 그 피해의 8%만큼 내 체력 회복'],
  onDeal(f, e, d, o) { if (!e.minion && !o.hbx) { const n = d / STAT_X * .08; if (n > 0) heal(f, n); } },
  pre(f, o) { o.onEnd = b => { hbSplashHeal(f, b.x, b.y, 60, 4); hbPuddle(f, b.x, b.y); fxPlay('hbsplash', Math.round(b.x), Math.round(b.y), 0); }; return o; },
  ult: ['생명의 정원', '내 주변 반지름 4칸에 5초 동안 꽃밭이 피어남 · 안의 아군은 초당 체력 240 회복, 상대는 30% 둔화', [0, 6 * T], f => {
    const x = f.x, y = f.y;
    zone({ by: f, x, y, r: 4 * T, t: 5, col: HB.g, op: 0, kind: 'hbgarden', fn: (z, dt) => {
      z.acc += dt; if (z.acc < .5) return; z.acc -= .5;
      for (const o of allies(f)) if (inZone(z, o)) heal(o, 12);
      for (const e of foes(f)) if (!e.minion && inZone(z, e)) buff(e, 'slow', .6, .7);
    } });
    fxPlay('hbgarden', Math.round(x), Math.round(y));
  }, (f, e, d) => hbHurtAllies(f, 4 * T).length >= 2 || f.hp < f.mhp * .5],
  skills: [
    [1, '치유 안개', 'buff', '조준한 곳(최대 5칸)에 반지름 2칸 치유 안개를 4초 동안 깔음 · 안의 아군(나 포함)은 초당 체력 120 회복', [0, 99 * T], (f, a) => {
      const t = f.ai && hbMostHurt(f, 5 * T), p = t ? { x: t.x, y: t.y } : aimPt(f, 5 * T);
      zone({ by: f, x: p.x, y: p.y, r: 2 * T, t: 4, col: HB.g, op: 0, kind: 'hbmist', fn: (z, dt) => { z.acc += dt; if (z.acc < .5) return; z.acc -= .5; for (const o of allies(f)) if (inZone(z, o)) heal(o, 6); } });
      fxPlay('hbmist', Math.round(p.x), Math.round(p.y), 0);
    }, { ok: f => f.hp < f.mhp * .75 || hbHurtAllies(f, 5 * T).length > 1 }],
    [2, '독 안개', 'hit', '조준한 곳(최대 5칸)에 반지름 2칸 독 안개를 4초 동안 깔음 · 안의 상대는 초당 140 피해와 20% 둔화', [0, 6 * T], f => {
      const p = aimPt(f, 5 * T);
      zone({ by: f, x: p.x, y: p.y, r: 2 * T, t: 4, col: HB.p, op: 0, kind: 'hbpoison', fn: (z, dt) => { z.acc += dt; if (z.acc < .5) return; z.acc -= .5; circ(f, z.x, z.y, z.r, 10, { quiet: 1, slow: [.8, .6] }); } });
      fxPlay('hbmist', Math.round(p.x), Math.round(p.y), 1);
    }],
    [3, '응급 붕대', 'buff', '조준 방향 6칸 안의 아군 중 가장 많이 다친 아군에게 붕대를 던져 체력 900 회복 · 아군이 없으면 내 체력 600 회복', [0, 99 * T], (f, a) => {
      let t = null, s = 2;
      for (const o of allies(f)) { if (o === f) continue; const d = Math.hypot(o.x - f.x, o.y - f.y); if (d > 6 * T) continue; let da = Math.atan2(o.y - f.y, o.x - f.x) - a; da = Math.atan2(Math.sin(da), Math.cos(da)); if (!f.ai && Math.abs(da) > .6) continue; const k = o.hp / o.mhp; if (k < s) { s = k; t = o; } }
      if (t && t.hp >= t.mhp) t = null;
      if (t) heal(t, 90); else heal(f, 60);
      const g = t || f; fxPlay('hbbandage', fighters.indexOf(f), fighters.indexOf(g));
    }, { ok: f => f.hp < f.mhp * .6 || !!hbMostHurt(f, 6 * T) && hbMostHurt(f, 6 * T).hp < hbMostHurt(f, 6 * T).mhp * .6 }],
    [4, '물약 소나기', 'hit', '조준한 곳 근처로 물약 5병을 한꺼번에 던짐 · 병마다 떨어지는 자리가 조금씩 흩어짐 · 한 병당 상대 130 피해, 깨진 자리 아군 40 회복', [0, 7 * T], (f, a) => {
      const p = aimPt(f, 6 * T), d0 = Math.max(1.5 * T, Math.hypot(p.x - f.x, p.y - f.y));
      const off = [[0, 0], [-.22, -.12], [.22, -.08], [-.1, .16], [.12, .2]];
      off.forEach(([da, dd], i) => later(i * .06, () => { if (!f.dead) hbPotion(f, a + da, d0 * (1 + dd)); }, f));
      fxPlay('hbvolley', fighters.indexOf(f), +a.toFixed(2));
    }],
    [5, '해독 물약', 'buff', '물약을 마셔 체력 700 회복 + 1.5초 동안 이동속도 30% 증가', [0, 99 * T], f => { heal(f, 70); buff(f, 'haste', 1.5, 1.3); fxPlay('hbdrink', fighters.indexOf(f)); }, { ok: f => f.hp < f.mhp * .55 }]
  ] });
HEROES.herbal.name = '약초꾼';
HEROES.herbal.hp = 500 * STAT_X;
HEROES.herbal.range = 6 * T; HEROES.herbal.wallPass = true; HEROES.herbal.splash = 60;
HEROES.herbal.xm = .7;

/* ---------- 방패병 ---------- */
hero('shieldman', { p: ['든든한 방패', '이동속도 5% 느림 · 정면에서 받는 근접 피해 15% 감소'],
  spd: () => .95,
  onHurt(e, dmg, by, o) {
    if (B(e, 'hbdig') && Math.hypot(e.vx, e.vy) < 30) dmg *= .6;
    if (by && !by.minion && by.h && by.h.type === 'melee') { let da = Math.atan2(by.y - e.y, by.x - e.x) - e.aim; da = Math.atan2(Math.sin(da), Math.cos(da)); if (Math.abs(da) < 1.2) dmg *= .85; }
    return dmg;
  },
  ult: ['강철 벽', '조준 방향 앞에 5칸 너비 강철 벽을 4초 동안 세움 · 사람과 탄환을 모두 막음', [0, 7 * T], (f, a) => {
    const p = fwd(f, 1.6 * T, a), cells = [];
    for (let i = -2; i <= 2; i++) { const c = Math.floor((p.x - Math.sin(a) * i * T) / T), r = Math.floor((p.y + Math.cos(a) * i * T) / T); if (c < 1 || r < 1 || c >= COLS - 1 || r >= ROWS - 1 || blocked(c, r)) continue; if (fighters.some(e => !e.dead && Math.floor(e.x / T) === c && Math.floor(e.y / T) === r)) continue; tempWalls.set(c + r * COLS, time + 4); cells.push(c, r); }
    fxPlay('hbwall', cells.join(','));
  }],
  skills: [
    [1, '방패 세우기', 'buff', '2초 동안 방패를 들어 바라보는 쪽에서 날아오는 탄환을 모두 막음', [0, 7 * T], f => { buff(f, 'block', 2); fxPlay('hbraise', fighters.indexOf(f)); }],
    [2, '방패 돌진', 'move', '방패를 앞세워 3칸 돌진 · 부딪힌 상대에게 420 피해 + 밀치고 0.5초 기절', [0, 3.5 * T], (f, a) => {
      lunge(f, a, 3 * T, .3, { onHit: e => { damage(e, 30, f); buff(e, 'stun', .5); knock(e, f.x, f.y, 420); fxPlay('hbbash', Math.round(e.x), Math.round(e.y + BODY)); } });
      fxPlay('hbcharge', fighters.indexOf(f), +a.toFixed(2));
    }],
    [3, '도발 표식', 'hit', '주변 3칸 안의 상대에게 2초 동안 도발 표식을 붙임 · 표식이 붙은 상대는 방패병이 아닌 다른 아군에게 주는 피해가 절반', [0, 3 * T], f => {
      const hit = circ(f, f.x, f.y, 3 * T, 0, { fn: e => { if (!e.minion) buff(e, 'taunt', 2, f); } });
      fxPlay('hbtaunt', fighters.indexOf(f), hit.filter(e => !e.minion).map(e => fighters.indexOf(e)).join(','));
    }],
    [4, '진지 구축', 'buff', '3초 동안 멈춰 있으면 받는 피해 40% 감소', [0, 4 * T], f => { buff(f, 'hbdig', 3); fxPlay('hbdig', fighters.indexOf(f)); }, { ok: f => f.hp < f.mhp * .8 }],
    [5, '아군 엄호', 'move', '5칸 안의 가장 가까운 아군 옆으로 뛰어들어 둘 다 2초 동안 받는 피해 30% 감소 (아군이 없으면 쓰이지 않음)', [0, 99 * T], (f, a, i) => {
      let t = null, bd = 5 * T; for (const o of allies(f)) { if (o === f) continue; const d = Math.hypot(o.x - f.x, o.y - f.y); if (d < bd) { bd = d; t = o; } }
      if (!t) { f.scd[i] = 0; return false; }
      const ang = Math.atan2(t.y - f.y, t.x - f.x), d = Math.max(0, bd - 40);
      lunge(f, ang, d, .25, { fly: 1 });
      for (const o of [f, t]) buff(o, 'dr', 2, .7);
      fxPlay('hbcover', fighters.indexOf(f), fighters.indexOf(t));
    }, { ok: f => !!hbMostHurt(f, 5 * T) }]
  ] });
HEROES.shieldman.name = '방패병';
HEROES.shieldman.hp = 850 * STAT_X;
HEROES.shieldman.xm = 1.4;
for (const id of ['herbal', 'shieldman']) if (!ACTIVE_HEROES.includes(id)) ACTIVE_HEROES.push(id);
ULT_THEMES.herbal = { c: [HB.g, '#fff4d6', HB.gd], k: 'wave', f: '200,255,210' };
ULT_THEMES.shieldman = { c: [HB.s, '#ffffff', '#c9a227'], k: 'wave', f: '210,225,255' };
Object.assign(PVS, {
  'herbal:1': R('ground', { max: 5 * T, r: 2 * T }), 'herbal:2': R('ground', { max: 5 * T, r: 2 * T }), 'herbal:3': R('line', { len: 6 * T, w: 40 }),
  'herbal:4': R('ground', { max: 6 * T, r: 1.6 * T }), 'herbal:5': R('self', { r: 50 }), 'herbal:u': R('self', { r: 4 * T }),
  'shieldman:1': R('self', { r: 70 }), 'shieldman:2': R('dash', { len: 3 * T, w: 44 }), 'shieldman:3': R('self', { r: 3 * T }),
  'shieldman:4': R('self', { r: 60 }), 'shieldman:5': R('self', { r: 5 * T }), 'shieldman:u': R('line', { len: 2 * T, w: 5 * T })
});
/* skins: six each (cosmetics: the tint colours the hood / plume / shield face) */
for (const [id, ch, nm, price, tint, fx, x] of [
  ['skin_herbal_c', 'herbal', '새벽이슬 두건', 300, '#7fc8f0'], ['skin_herbal', 'herbal', '라벤더 두건', 800, '#a77be0'],
  ['skin_herbal_r', 'herbal', '장미 약방 두건', 1200, '#e0584a'], ['skin_herbal_new', 'herbal', '벚꽃 약초꾼', 2000, '#ff9ecb', 'sparkle', { isNew: true }],
  ['skin_herbal_g', 'herbal', '황금 연금술사', 3000, '#f2c14e', 'sparkle'], ['skin_herbal_p', 'herbal', '숲의 현자', 4000, '#5cffb8', 'crown', { lux: 3, premium: true }],
  ['skin_shieldman_c', 'shieldman', '청동 방패병', 300, '#b0793a'], ['skin_shieldman', 'shieldman', '왕실 근위대', 800, '#3c6fc0'],
  ['skin_shieldman_k', 'shieldman', '검은 철갑', 1200, '#4a4f58'], ['skin_shieldman_new', 'shieldman', '서리 성벽', 2000, '#aee6ff', 'frost', { isNew: true }],
  ['skin_shieldman_g', 'shieldman', '황금 사자 방패', 3000, '#f2c14e', 'sparkle'], ['skin_shieldman_p', 'shieldman', '천공의 수호자', 4000, '#ffffff', 'crown', { lux: 3, premium: true }]
]) COSMETICS[id] = Object.assign({ cat: 'skin', char: ch, name: nm, price, tint }, fx ? { fx } : {}, x || {});

/* ================= art (drawStick coordinates: feet at 0, head centre HEADCY, radius R) ================= */
function hbFlower(c, x, y, a, b) { c.fillStyle = b; for (let k = 0; k < 5; k++) { const t = k * 1.256; c.beginPath(); c.arc(x + Math.cos(t) * 2.6, y + Math.sin(t) * 2.6, 2, 0, 7); c.fill(); } c.fillStyle = a; c.beginPath(); c.arc(x, y, 1.6, 0, 7); c.fill(); }
function hbFlask(c, x, y, r, liq) {
  c.fillStyle = 'rgba(220,240,255,.6)'; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill();
  c.fillStyle = liq; c.beginPath(); c.arc(x, y, r - 1.2, .15, Math.PI - .15); c.fill();
  c.fillStyle = '#d9ecf5'; c.fillRect(x - r * .35, y - r - r * .8, r * .7, r * .9);
  c.fillStyle = '#8a5a2b'; c.fillRect(x - r * .4, y - r - r * 1.15, r * .8, r * .45);
  c.fillStyle = 'rgba(255,255,255,.75)'; c.beginPath(); c.arc(x - r * .4, y - r * .35, r * .22, 0, 7); c.fill();
}
function hbHood(c, hx, HY, R, f, tint) {      // 두건 + 들꽃 (head 1)
  c.fillStyle = tint || '#4f8a3c'; c.beginPath(); c.arc(hx, HY - 1, R + 3, Math.PI * .85, Math.PI * 2.15); c.lineTo(hx - f * (R + 6), HY + 9); c.closePath(); c.fill();
  c.fillStyle = 'rgba(0,0,0,.18)'; c.beginPath(); c.moveTo(hx - f * (R + 1), HY - 4); c.quadraticCurveTo(hx - f * (R + 9), HY + 2, hx - f * (R + 7), HY + 12); c.lineTo(hx - f * (R + 2), HY + 6); c.fill();
  hbFlower(c, hx + f * 4, HY - R - 2, '#ffd34d', '#fff4d6');
}
function hbHelm(c, hx, HY, R, f, tint, t) {      // 깃털 투구 (head 1)
  c.fillStyle = HB.st; c.beginPath(); c.arc(hx, HY - 1, R + 1.5, Math.PI, 0); c.fill(); c.fillRect(hx - R - 1.5, HY - 1, 2 * R + 3, 3);
  c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.arc(hx + f * 3, HY - 5, 2.4, 0, 7); c.fill();
  const w = Math.sin((t || 0) * 5) * 1.5;
  c.fillStyle = tint || '#d33b3b'; c.beginPath(); c.moveTo(hx - f * 1, HY - R - 1); c.quadraticCurveTo(hx - f * 10, HY - R - 10 + w, hx - f * 16, HY - R + 3 + w); c.quadraticCurveTo(hx - f * 8, HY - R - 3, hx - f * 1, HY - R + 1); c.fill();
}
function drawHerbal(c, o) {
  const { face: f, hx, hy, HEADCY, HEADR, HIP, tint, swing } = o;
  c.lineCap = 'round'; c.strokeStyle = '#7a4e26'; c.lineWidth = 2.4; c.beginPath(); c.moveTo(-6, HIP - 3); c.lineTo(6, HIP - 3); c.stroke();
  for (const [dx, col] of [[-f * 3, '#e0584a'], [f * 1, '#5ccf6a'], [f * 5, '#58a8e8']]) { c.fillStyle = col; c.fillRect(dx - 1.3, HIP - 2, 2.6, 4); }
  if (!(swing > .05)) hbFlask(c, hx + f * 2, hy - 2, 5, tint ? mixHex(HB.g, tint, .35) : HB.g);
  hbHood(c, 0, HEADCY, HEADR, f, tint);
}
function drawShieldman(c, o) {
  const { face: f, hx, hy, ax, ay, HEADCY, HEADR, tint, t, raise } = o, a = Math.atan2(ay, ax);
  c.save(); c.translate(hx, hy); c.rotate(a);
  c.strokeStyle = '#8a5a2b'; c.lineWidth = 2.6; c.lineCap = 'round'; c.beginPath(); c.moveTo(-12, 0); c.lineTo(22, 0); c.stroke();
  c.fillStyle = '#d6dde3'; c.beginPath(); c.moveTo(31, 0); c.lineTo(21, -3.6); c.lineTo(21, 3.6); c.closePath(); c.fill();
  c.restore();
  const sx = f * 9, sy = -30 - (raise ? 6 : 0), m = tint || '#3c6fc0';
  c.save(); c.translate(sx, sy);
  c.fillStyle = '#7a5530'; c.beginPath(); c.ellipse(0, 0, 6.2, 13.5, 0, 0, 7); c.fill();
  c.fillStyle = m; c.beginPath(); c.ellipse(0, 0, 4.8, 12, 0, 0, 7); c.fill();
  c.fillStyle = 'rgba(255,255,255,.25)'; c.beginPath(); c.ellipse(-f * 1.4, -4, 1.6, 5, 0, 0, 7); c.fill();
  c.fillStyle = '#d8dde2'; c.beginPath(); c.arc(f * .6, 0, 2.3, 0, 7); c.fill();
  c.restore();
  hbHelm(c, 0, HEADCY, HEADR, f, tint, t);
}
/* the thrown potion (tail.js bullet loop): a spinning flask that rises and falls along its flight */
function drawPotionShot(b) {
  if (b.L0 == null) b.L0 = Math.max(b.life || 1, 1);
  const p = clamp(1 - (b.life || 0) / b.L0, 0, 1), hgt = Math.sin(p * Math.PI) * Math.min(70, b.L0 * .18);
  ctx.save(); ctx.fillStyle = 'rgba(0,0,0,.2)'; ctx.beginPath(); ctx.ellipse(b.x, b.y + 10, 7, 3, 0, 0, 7); ctx.fill();
  ctx.translate(b.x, b.y - hgt); ctx.rotate(time * 9 + (b.id || 0));
  hbFlask(ctx, 0, 0, 6, b.o && b.o.skill ? '#9ef0b0' : HB.g); ctx.restore();
  return true;
}
/* mists and the garden (fx.js drawZoneArt) */
function drawHerbZone(z) {
  if (z.kind === 'hbpuddle') return drawHbPuddle(z);
  if (z.kind !== 'hbmist' && z.kind !== 'hbpoison' && z.kind !== 'hbgarden') return false;
  const c = ctx, max = z.kind === 'hbgarden' ? 5 : 4, age = max - z.t, fade = Math.min(1, age / .35) * Math.min(1, z.t / .5), R = z.r;
  c.save();
  if (z.kind === 'hbgarden') {
    c.globalAlpha = .2 * fade; c.fillStyle = '#8fdc7a'; c.beginPath(); c.ellipse(z.x, z.y + 14, R, R * .62, 0, 0, 7); c.fill();
    c.globalAlpha = .8 * fade; c.strokeStyle = '#4f8a3c'; c.lineWidth = 4; c.beginPath();
    for (let a = 0; a <= 6.3; a += .06) { const rr = 1 + Math.sin(a * 14 + time) * .025; c.lineTo(z.x + Math.cos(a) * R * rr, z.y + 14 + Math.sin(a) * R * .62 * rr); } c.stroke();
    const n = fxLow() ? 10 : 22;
    for (let i = 0; i < n; i++) { const a = i * 2.399, d = R * .9 * Math.sqrt((i + .5) / n), g = Math.min(1, Math.max(0, age * 2.5 - i * .05)); if (g <= 0) continue;
      c.save(); c.translate(z.x + Math.cos(a) * d, z.y + 14 + Math.sin(a) * d * .62); c.scale(g, g); hbFlower(c, 0, Math.sin(time * 2 + i) * 1.5, '#ffd34d', i % 3 ? '#fff4d6' : '#ffc2d6'); c.restore(); }
  } else {
    const poison = z.kind === 'hbpoison', n = fxLow() ? 7 : 14;
    for (let i = 0; i < n; i++) { const a = i * 2.399 + time * .3 * (i % 2 ? 1 : -1), d = R * .8 * Math.sqrt((i + .5) / n);
      c.globalAlpha = (poison ? .2 : .14) * fade; c.fillStyle = poison ? '#9a5ad0' : '#8ce09a';
      c.beginPath(); c.arc(z.x + Math.cos(a) * d, z.y + 14 + Math.sin(a) * d * .62, R * .36, 0, 7); c.fill(); }
    c.globalAlpha = fade * .85;
    for (let i = 0; i < (fxLow() ? 4 : 9); i++) { const ph = (time * .5 + i * .37) % 1, a = i * 1.7, d = R * .7 * ((i * .618) % 1), x = z.x + Math.cos(a) * d, y = z.y + 14 + Math.sin(a) * d * .62 - ph * 40;
      if (poison) { c.strokeStyle = '#7a3cb0'; c.lineWidth = 1.5; c.beginPath(); c.arc(x, y, 2 + ph * 4, 0, 7); c.stroke(); }
      else { c.save(); c.translate(x, y); c.rotate(a + ph * 3); c.fillStyle = HB.gd; c.beginPath(); c.moveTo(-5, 0); c.quadraticCurveTo(0, -3.5, 5, 0); c.quadraticCurveTo(0, 3.5, -5, 0); c.fill(); c.restore(); } }
  }
  c.restore();
  return true;
}
/* the potion puddle: a splashed, lobed liquid stain (not a circle) with a glossy rim, glass shards, popping bubbles; it soaks in and shrinks */
function drawHbPuddle(z) {
  const c = ctx, k = clamp(z.t / .75, 0, 1), age = .75 - z.t, grow = Math.min(1, age / .08), R = z.r * grow * (.55 + .45 * k), x = z.x, y = z.y + 14;
  let sd = z.seed || 1; const rr = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
  const lobes = [], N = 11; for (let i = 0; i < N; i++) lobes.push(.72 + rr() * .45);
  const pt = a => { const i = (a / 6.2832) * N, i0 = Math.floor(i) % N, fr = i - Math.floor(i), m = lobes[i0] * (1 - fr) + lobes[(i0 + 1) % N] * fr; return [x + Math.cos(a) * R * m, y + Math.sin(a) * R * m * .55]; };
  const blob = () => { c.beginPath(); for (let j = 0; j <= 40; j++) { const p = pt(j / 40 * 6.2832); j ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]); } c.closePath(); };
  c.save();
  c.globalAlpha = .55 * k + .15; c.fillStyle = '#2f8a46'; blob(); c.fill();
  c.globalAlpha = .7 * k + .1; c.save(); c.translate(x, y - 2); c.scale(.82, .8); c.translate(-x, -y); c.fillStyle = HB.g; blob(); c.fill(); c.restore();
  c.globalAlpha = .55 * k; c.fillStyle = '#e8fff0'; c.beginPath(); c.ellipse(x - R * .3, y - R * .14, R * .22, R * .06, -.2, 0, 7); c.fill();
  for (let i = 0; i < 4; i++) { const a = rr() * 6.28, d = R * (1.05 + rr() * .35); c.globalAlpha = .8 * k; c.fillStyle = HB.g; c.beginPath(); c.ellipse(x + Math.cos(a) * d, y + Math.sin(a) * d * .55, 3 + rr() * 3, 2 + rr() * 1.5, 0, 0, 7); c.fill(); }
  for (let i = 0; i < 4; i++) { const a = rr() * 6.28, d = R * rr() * .8, sx = x + Math.cos(a) * d, sy = y + Math.sin(a) * d * .55, ro = rr() * 3; c.globalAlpha = .9 * k; c.fillStyle = '#e6f7ff'; c.beginPath(); c.moveTo(sx + Math.cos(ro) * 4, sy + Math.sin(ro) * 2); c.lineTo(sx + Math.cos(ro + 2.2) * 3, sy + Math.sin(ro + 2.2) * 2.5); c.lineTo(sx + Math.cos(ro + 4) * 2, sy + Math.sin(ro + 4) * 1.5); c.closePath(); c.fill(); }
  for (let i = 0; i < 3; i++) { const ph = (age * 2.2 + i * .33) % 1, a = rr() * 6.28, d = R * rr() * .6; c.globalAlpha = (1 - ph) * k; c.strokeStyle = '#d6ffe0'; c.lineWidth = 1.2; c.beginPath(); c.arc(x + Math.cos(a) * d, y + Math.sin(a) * d * .55 - ph * 4, 1.5 + ph * 3.5, 0, 7); c.stroke(); }
  c.restore();
  return true;
}
/* taunt mark over a marked fighter (tail.js drawFighter hook, world coords) */
function drawTauntMark(f) {
  if (!f.b || !f.b.taunt || !(f.b.taunt.t > 0)) return;
  const x = f.x, y = f.y - 92 + Math.sin(time * 6) * 2;
  ctx.save(); ctx.fillStyle = '#d23c3c'; ctx.beginPath(); ctx.moveTo(x, y + 12); ctx.lineTo(x + 9, y - 4); ctx.lineTo(x - 9, y - 4); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('!', x, y + 5); ctx.restore();
}

/* ================= effects (FXF: played on every screen through fxPlay) ================= */
const hbSnd = o => { try { snd(o); } catch (e) {} };
FXF.hbsplash = (x, y) => {      // potion breaks: glass shards, a green puff, a couple of leaves float up
  if (!fxInView(x, y)) return;
  addP({ x, y, life: .25, color: '#c8ffd4', shape: 'flash', size: 70 });
  for (let i = 0; i < (fxLow() ? 4 : 9); i++) { const a = RND(0, 6.28), s = RND(160, 320); addP({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s * .6 - 60, grav: 600, gy: y + RND(-10, 20), drag: 1.5, life: RND(.3, .5), size: RND(2, 3), color: i % 3 ? '#e6f7ff' : HB.g, shape: 'square' }); }
  if (!fxLow()) for (let i = 0; i < 2; i++) addP({ x: x + RND(-16, 16), y, vy: -40, life: .8, color: HB.gd, shape: 'ktext', text: '♥', size: 12 });
  hbSnd({ n: .05, nt: 'highpass', nf: 3200, nd: .07, b: .04, bf: 900, be: 500, bd: .08, bt: 'sine' });
};
FXF.hbmist = (x, y, poison) => {      // a mist settles: soft puffs spread outward (green leaves or purple bubbles)
  if (!fxInView(x, y)) return;
  for (let i = 0; i < (fxLow() ? 6 : 14); i++) { const a = RND(0, 6.28), s = RND(60, 180); addP({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s * .6, drag: 2.5, life: RND(.5, .9), size: RND(10, 18), color: poison ? 'rgba(160,90,210,.5)' : 'rgba(150,230,160,.5)', shape: 'smoke', add: false }); }
  hbSnd(poison ? { n: .08, nt: 'lowpass', nf: 500, nd: .4, b: .05, bf: 110, be: 70, bd: .4, bt: 'sawtooth' } : { n: .06, nt: 'bandpass', nf: 1400, nd: .4, b: .04, bf: 520, be: 780, bd: .35, bt: 'sine' });
};
FXF.hbbandage = (fi, gi) => {      // a white bandage ribbon flies to the ally and wraps round them, a red cross pops
  const f = fighters[fi], g = fighters[gi]; if (!f || !g) return;
  if (g !== f) for (let i = 0; i < 8; i++) later2(i * .025, () => { const k = i / 7; addP({ x: f.x + (g.x - f.x) * k, y: f.y + BODY + (g.y - f.y) * k - Math.sin(k * Math.PI) * 30, life: .3, color: HB.w, shape: 'square', size: 5 }); });
  later2(g === f ? 0 : .2, () => { if (!fxInView(g.x, g.y)) return; for (let k = 0; k < 3; k++) addP({ x: g.x, y: g.y - 20 - k * 9, life: .5 + k * .1, color: HB.w, shape: 'ring', r0: 22, r1: 12, lw: 4 });
    addP({ x: g.x, y: g.y - 80, vy: -30, life: .7, color: '#e0584a', shape: 'ktext', text: '✚', size: 22 });
    hbSnd({ n: .03, nt: 'highpass', nf: 2400, nd: .12, b: .06, bf: 660, be: 990, bd: .2, bt: 'triangle' }); });
};
FXF.hbvolley = (fi, ang) => {      // potion volley: a quick swing flash and five clinks
  const f = fighters[fi]; if (!f || !fxInView(f.x, f.y)) return;
  addP({ x: f.x + Math.cos(ang) * 30, y: f.y + BODY + Math.sin(ang) * 30, life: .2, color: '#c8ffd4', shape: 'flash', size: 60 });
  for (let i = 0; i < 5; i++) later2(i * .06, () => hbSnd({ b: .04, bf: 700 + i * 90, be: 500, bd: .07, bt: 'triangle' }));
};
FXF.hbdrink = fi => {      // drinks the antidote: bubbles rise, green speed streaks
  const f = fighters[fi]; if (!f || !fxInView(f.x, f.y)) return;
  for (let i = 0; i < (fxLow() ? 5 : 12); i++) addP({ x: f.x + RND(-12, 12), y: f.y - 30, vx: RND(-20, 20), vy: RND(-120, -60), life: RND(.4, .7), size: RND(2, 4), color: i % 2 ? '#bff5c8' : HB.g, shape: 'dot' });
  addP({ x: f.x, y: f.y - 20, life: .4, color: HB.g, shape: 'ring', r0: 10, r1: 50, lw: 3 });
  hbSnd({ n: .02, nt: 'lowpass', nf: 900, nd: .25, b: .08, bf: 300, be: 600, bd: .25, bt: 'sine' });
};
FXF.hbgarden = (x, y) => {      // the garden bursts open: a ring of petals rushes outward, a soft bell
  if (!fxInView(x, y)) return;
  addP({ x, y: y + 14, life: .5, color: '#d8ffd0', shape: 'flash', size: 200 });
  for (let i = 0; i < (fxLow() ? 12 : 30); i++) { const a = i / 30 * 6.28, s = RND(300, 420); addP({ x, y: y + 14, vx: Math.cos(a) * s, vy: Math.sin(a) * s * .62, drag: 3, life: RND(.6, .9), size: RND(3, 5), color: i % 3 ? '#fff4d6' : '#ffc2d6', shape: 'square' }); }
  hbSnd({ b: .1, bf: 660, be: 880, bd: .6, bt: 'sine' }); try { sfx(990, .4, 'sine', .04, 1.2); } catch (e) {}
};
FXF.hbraise = fi => {      // shield raised: a blue half-ring on the facing side with an arrow, a clank
  const f = fighters[fi]; if (!f || !fxInView(f.x, f.y)) return; const a = f.aim, y = f.y + BODY;
  for (let i = -3; i <= 3; i++) { const b = a + i * .3; addP({ x: f.x + Math.cos(b) * 52, y: y + Math.sin(b) * 52, x2: f.x + Math.cos(b + .3) * 52, y2: y + Math.sin(b + .3) * 52, life: .45, color: HB.s, shape: 'slash', size: 6 }); }
  addP({ x: f.x + Math.cos(a) * 62, y: y + Math.sin(a) * 62, life: .45, color: '#ffffff', shape: 'ktext', text: '▶', size: 16, rot0: a });
  hbSnd({ n: .04, nt: 'bandpass', nf: 3000, nd: .08, b: .1, bf: 420, be: 260, bd: .25, bt: 'square' });
};
FXF.hbcharge = (fi, ang) => {      // shield charge: dust puffs behind, wind lines
  const f = fighters[fi]; if (!f || !fxInView(f.x, f.y)) return;
  for (let i = 0; i < (fxLow() ? 4 : 8); i++) addP({ x: f.x + RND(-10, 10), y: f.y + 10, vx: -Math.cos(ang) * RND(60, 160), vy: -Math.sin(ang) * RND(60, 160) - 20, drag: 3, life: .5, size: RND(8, 14), color: 'rgba(170,150,120,.6)', shape: 'smoke', add: false });
  hbSnd({ n: .1, nt: 'lowpass', nf: 700, nd: .25, b: .06, bf: 160, be: 90, bd: .25, bt: 'triangle' });
};
FXF.hbbash = (x, y) => {      // charge hits: a metal ring, stars
  if (!fxInView(x, y)) return;
  addP({ x, y, life: .2, color: '#ffffff', shape: 'flash', size: 80 });
  addP({ x, y, life: .3, color: '#c7ccd1', shape: 'ring', r0: 8, r1: 56, lw: 6 });
  for (let k = 0; k < 3; k++) addP({ x: x + (k - 1) * 14, y: y - 50, vy: -20, life: .6, color: '#f2c14e', shape: 'ktext', text: '★', size: 14 });
  hbSnd({ n: .08, nt: 'highpass', nf: 2000, nd: .12, b: .12, bf: 240, be: 120, bd: .2, bt: 'square' });
};
FXF.hbtaunt = (fi, list) => {      // taunt: a red shout ring, a dashed line to every marked foe
  const f = fighters[fi]; if (!f) return;
  if (fxInView(f.x, f.y)) { addP({ x: f.x, y: f.y + BODY, life: .4, color: '#d23c3c', shape: 'ring', r0: 20, r1: 3 * T, lw: 4 }); addP({ x: f.x, y: f.y - 90, vy: -20, life: .7, color: '#d23c3c', shape: 'ktext', text: '덤벼!', size: 20 }); }
  for (const s of String(list || '').split(',')) { const e = fighters[+s]; if (!e || s === '') continue; for (let i = 1; i < 6; i++) { const k = i / 6; addP({ x: f.x + (e.x - f.x) * k, y: f.y - 30 + (e.y - f.y) * k, life: .45, color: '#ff6a6a', shape: 'dot', size: 3 }); } }
  hbSnd({ n: .05, nt: 'bandpass', nf: 900, nd: .2, b: .1, bf: 200, be: 150, bd: .3, bt: 'sawtooth' });
};
FXF.hbdig = fi => {      // dig in: stakes hammer into the ground round the feet
  const f = fighters[fi]; if (!f || !fxInView(f.x, f.y)) return;
  for (let i = 0; i < 8; i++) { const a = i / 8 * 6.28, x = f.x + Math.cos(a) * 42, y = f.y + 12 + Math.sin(a) * 16; addP({ x, y: y - 14, x2: x, y2: y, life: 3, color: '#8a5a2b', shape: 'slash', size: 4 }); }
  addP({ x: f.x, y: f.y + 12, life: .4, color: '#c9a463', shape: 'ring', r0: 10, r1: 46, lw: 3 });
  hbSnd({ n: .06, nt: 'lowpass', nf: 400, nd: .15, b: .08, bf: 140, be: 80, bd: .15, bt: 'square' });
};
FXF.hbcover = (fi, gi) => {      // cover: a blue arc to the ally, small shields over both
  const f = fighters[fi], g = fighters[gi]; if (!f || !g) return;
  for (let i = 1; i < 8; i++) { const k = i / 8; addP({ x: f.x + (g.x - f.x) * k, y: f.y - 20 + (g.y - f.y) * k - Math.sin(k * Math.PI) * 40, life: .4, color: HB.s, shape: 'dot', size: 3 }); }
  later2(.25, () => { for (const o of [fighters[fi], fighters[gi]]) if (o && fxInView(o.x, o.y)) { addP({ x: o.x, y: o.y - 20, life: .45, color: HB.s, shape: 'ring', r0: 34, r1: 22, lw: 4 }); addP({ x: o.x, y: o.y - 88, vy: -15, life: .8, color: HB.s, shape: 'ktext', text: '⛨', size: 18 }); } });
  hbSnd({ b: .06, bf: 500, be: 700, bd: .2, bt: 'triangle' });
};
FXF.hbwall = cells => {      // steel wall: each plate slams down with sparks
  const v = String(cells || '').split(',').map(Number);
  for (let i = 0; i + 1 < v.length; i += 2) { const x = (v[i] + .5) * T, y = (v[i + 1] + .5) * T; later2(i * .02, () => { if (!fxInView(x, y)) return; addP({ x, y, life: .25, color: '#ffffff', shape: 'flash', size: 70 });
    for (let k = 0; k < (fxLow() ? 3 : 7); k++) { const a = RND(0, 6.28), s = RND(160, 320); addP({ x, y: y + 20, vx: Math.cos(a) * s, vy: Math.sin(a) * s * .5 - 80, grav: 600, gy: y + 30, life: .4, size: 2.4, color: '#ffd27a', shape: 'square' }); } }); }
  hbSnd({ n: .12, nt: 'lowpass', nf: 1200, nd: .3, b: .15, bf: 120, be: 60, bd: .35, bt: 'square' });
  if (typeof shakeFrom === 'function' && v.length) shakeFrom((v[0] + .5) * T, (v[1] + .5) * T, 6, 400);
};
Object.assign(SKILL_FX, {
  'herbal:1': () => {}, 'herbal:2': () => {}, 'herbal:3': () => {}, 'herbal:4': () => {}, 'herbal:5': () => {},
  'shieldman:1': () => {}, 'shieldman:2': f => fxPlay('trail', fighters.indexOf(f), .3, HB.s, 'dash'), 'shieldman:3': () => {}, 'shieldman:4': () => {}, 'shieldman:5': () => {}
});
