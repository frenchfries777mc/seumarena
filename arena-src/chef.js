/* ===== 셰프 (chef): season "The key of Turkey" character (user 2026-11-25, look A = classic white jacket and tall toque; spec: ../chef-spec.md).
   Basic attack (passive): an enemy close in front -> the ladle is swung in a wide fan; otherwise it is thrown far.
   Awakening (user): fills after 9 thrown-ladle hits. While awakened: every basic attack leaves a soup puddle (thrown: where the ladle stopped,
   swung: a fan in front) that burns and slows enemies; 후라이팬 hits all round + oil puddles where it hit; 간 보기 heals more and heals allies near;
   서빙 throws 3 turkeys in a fan; 데코레이션 also raises allies' damage; the thrown 거대 뒤집개 comes back like a boomerang.
   Unlock: the season draw (low odds) while the season runs, crystals or gold after it (CHEF_PRICE).
   EVERY NUMBER MARKED TEMP IS A PLACEHOLDER the user has not decided. ===== */
WEAPONS.chef = { id: 'chef', name: '국자', kind: 'gun', dmg: 24, cd: .7, bulletSpeed: 820, life: 1.05, shape: 'ladle', desc: '던지기도 하고 휘두르기도 하는 국자' };
const CHEF = {
  near: 2.5 * T,      // TEMP: an enemy closer than this (and roughly in front) -> swing instead of throw
  swR: 2.3 * T, swHalf: 1.05, swDmg: 30,      // TEMP swing reach / half angle / damage (x STAT_X)
  soupT: 3, soupDps: 12, soupSlow: .7,      // TEMP soup puddle: seconds, damage per second (x STAT_X), speed factor
  oilT: 3, oilDps: 14,      // TEMP oil puddle (awakened 후라이팬)
  serveTake: .8, serveBack: 450, serveSlowT: 2,      // 서빙: 80 % of the enemy's current health; after 2 s heals back (taken - 450); slow 15 % for 2 s (TEMP)
  ultNear: 3 * T      // TEMP: the ultimate swings when an enemy is this close, otherwise it is thrown
};
const CHEF_PRICE = { cr: 1500, g: 15000 };      // TEMP: price after the season
const chefOwned = () => Array.isArray(COS.hu) && COS.hu.includes('chef');
const heroLocked = id => id === 'chef' && !chefOwned();
function chefGive() { if (!Array.isArray(COS.hu)) COS.hu = []; if (!COS.hu.includes('chef')) COS.hu.push('chef'); }

/* ---------- puddles (soup / oil): irregular, made of a few blobs that share one damage tick ---------- */
function chefPuddle(f, pts, kind) {
  const S = new Map(), dps = kind === 'oil' ? CHEF.oilDps : CHEF.soupDps, t = kind === 'oil' ? CHEF.oilT : CHEF.soupT;
  for (const p of pts) {
    if (p.x < T || p.y < T || p.x > WW - T || p.y > WH - T) continue;
    zone({ by: f, x: p.x, y: p.y, r: p.r, t, col: kind === 'oil' ? '#d9a21b' : '#e0662a', op: 0, kind, fn: (z, dt) => {
      for (const e of foes(f)) {
        if (!inZone(z, e)) continue;
        const k = S.get(e) || { at: -1, acc: 0 }; if (k.at === time) continue; k.at = time; k.acc += dt; S.set(e, k);
        if (!e.minion) buff(e, 'slow', .3, kind === 'oil' ? .8 : CHEF.soupSlow);
        if (k.acc >= .5) { k.acc -= .5; damage(e, dps * .5, f, { quiet: 1, src: kind === 'oil' ? '기름' : '수프' }); }
      }
    } });
  }
}
const chefSoupAt = (f, x, y) => chefPuddle(f, [{ x, y, r: 40 }, { x: x + 26, y: y + 12, r: 26 }, { x: x - 22, y: y + 16, r: 24 }], 'soup');
function chefSoupFan(f, ang) {
  const pts = [];
  for (let i = -2; i <= 2; i++) { const a = ang + i * .4, d = 1.35 * T; pts.push({ x: f.x + Math.cos(a) * d, y: f.y + Math.sin(a) * d, r: 30 }); }
  for (const s of [-.2, .2]) pts.push({ x: f.x + Math.cos(ang + s) * 2.2 * T, y: f.y + Math.sin(ang + s) * 2.2 * T, r: 26 });
  chefPuddle(f, pts.filter(p => !solidAt(p.x, p.y)), 'soup');
}

/* ---------- 서빙: the flying turkey ---------- */
function chefServe(f, ang, dist) {
  emit(f, ang, { skill: 1, count: 1, dmg: 0, range: Math.max(1.5 * T, dist), spd: 560, shape: 'tklob', r: 12, wp: 1, pad: -999, onEnd: b => {
    fxPlay('chef', 'serve', Math.round(b.x), Math.round(b.y), 0);
    for (const e of foes(f)) {
      if (Math.hypot(e.x - b.x, e.y - b.y) > 70) continue;
      if (e.minion) { damage(e, 40, f); continue; }
      const take = e.hp * CHEF.serveTake, done = damage(e, take, f, { px: 1, raw: 1, src: '3스킬: 서빙' });      // the real number shows (not "80 %")
      buff(e, 'slow', CHEF.serveSlowT, .85);
      const back = done - CHEF.serveBack;
      if (back > 0) later(2, () => { if (!e.dead) heal(e, back / STAT_X); }, f);      // heal() shows the real number healed
    }
  } });
}

/* ---------- 거대 뒤집개 (thrown) ---------- */
function chefSpatula(f, ang, back) {
  emit(f, ang, { skill: 1, count: 1, dmg: 90, range: 9 * T, spd: 760, shape: 'spatula', r: 22, pierce: 99, wb: 1, onEnd: b => {
    if (!back) return;      // 각성: comes back like a boomerang, from where it stopped
    const d = Math.hypot(f.x - b.x, f.y - b.y); if (f.dead || d < 40) return;
    emit(f, Math.atan2(f.y - b.y, f.x - b.x), { skill: 1, count: 1, dmg: 90, range: d, spd: 820, shape: 'spatula', r: 22, pierce: 99, wb: 1, ox: b.x - f.x - Math.cos(ang) * 24, oy: b.y - (f.y + BODY) - Math.sin(ang) * 24 });
  } });
}

hero('chef', { p: ['맛보기 감각', '앞쪽 가까이(2.5칸 안)에 상대가 있으면 국자를 넓게 휘두르고, 없으면 국자를 멀리 던짐 · 체력은 조금 많고 이동속도는 조금 느림'],
  spd: () => .93,      // TEMP: a little slower
  atk(f, ang) {
    const aw = f.awT > 0;
    const near = foes(f).some(e => { const d = Math.hypot(e.x - f.x, e.y - f.y); if (d > CHEF.near) return false; let da = Math.atan2(e.y - f.y, e.x - f.x) - ang; da = Math.atan2(Math.sin(da), Math.cos(da)); return Math.abs(da) < 1.1 && los(f.x, f.y, e.x, e.y); });
    if (near) {
      f.swing = .22; fxPlay('chef', 'swing', Math.round(f.x), Math.round(f.y), +ang.toFixed(2));
      arc(f, ang, CHEF.swR, CHEF.swHalf, CHEF.swDmg, { kb: 220, basic: 1 });
      if (aw) chefSoupFan(f, ang);
      return true;
    }
    emit(f, ang, { onHit: e => { if (!e.minion) awGain(f, 'ladle', 1); }, onEnd: b => { if (aw) chefSoupAt(f, b.x, b.y - BODY); } });
    return true;
  },
  ult: ['거대 뒤집개', '상대가 가까이(3칸 안) 있으면 거대한 뒤집개를 휘둘러 1200 피해 + 크게 밀쳐 내고 1초 기절 · 멀면 거대한 뒤집개를 던짐: 1080 피해, 상대를 모두 관통하고 벽을 부수며 날아감', [0, 9 * T], f => {
    const a = f.aim, e = nearest(f, CHEF.ultNear, null, 0, false);
    if (e) { const ang = angTo(f, e); f.aim = ang; f.swing = .3; fxPlay('chef', 'flip', Math.round(f.x), Math.round(f.y), +ang.toFixed(2)); arc(f, ang, 3.2 * T, 1.25, 100, { kb: 900, stun: 1 }); return; }
    fxPlay('chef', 'throw', Math.round(f.x), Math.round(f.y), +a.toFixed(2));
    chefSpatula(f, a, f.awT > 0);
  }],
  skills: [
    [1, '후라이팬', 'hit', '후라이팬을 들고 앞쪽 넓은 부채꼴로 휘두름 · 480 피해 + 0.75초 기절 + 크게 밀쳐 냄', [0, 2.2 * T], (f, a) => {
      const aw = f.awT > 0; f.swing = .26;
      fxPlay('chef', 'pan', Math.round(f.x), Math.round(f.y), +a.toFixed(2), aw ? 1 : 0);
      const hit = aw ? circ(f, f.x, f.y, 2.2 * T, 40, { stun: .75, kb: 700 }) : arc(f, a, 2.2 * T, 1.3, 40, { stun: .75, kb: 700 });
      if (aw) for (const e of hit) chefPuddle(f, [{ x: e.x, y: e.y, r: 34 }, { x: e.x + 20, y: e.y + 14, r: 22 }], 'oil');      // oil splashes where it hit
    }],
    [2, '간 보기', 'buff', '국자로 맛을 보고 체력 300 회복 · 3초 동안 공격속도와 이동속도 15% 증가', [0, 2 * T], f => {
      const aw = f.awT > 0;
      heal(f, aw ? 45 : 30); buff(f, 'haste', 3, 1.15); buff(f, 'rapid', 3, .85);
      if (aw) for (const o of allies(f)) if (o !== f && Math.hypot(o.x - f.x, o.y - f.y) < 3 * T) heal(o, 30);      // TEMP 450 self / 300 allies within 3 tiles
      fxPlay('chef', 'taste', Math.round(f.x), Math.round(f.y), aw ? 3 * T : 0);
    }],
    [3, '서빙', 'hit', '칠면조를 포물선으로 던짐(벽을 넘어감, 최대 6칸) · 떨어진 곳의 상대는 지금 체력의 80%를 잃고 2초 동안 15% 느려짐 · 2초 뒤 (잃은 체력 - 450)만큼 다시 회복', [0, 6 * T], f => {
      const p = aimPt(f, 6 * T), d = Math.hypot(p.x - f.x, p.y - f.y), a = Math.atan2(p.y - f.y, p.x - f.x);
      if (f.awT > 0) for (const s of [-.3, 0, .3]) chefServe(f, a + s, d); else chefServe(f, a, d);
    }],
    [4, '데코레이션', 'buff', '주변(3칸) 아군과 나의 체력 240 회복 · 3초 동안 이동속도 15% 증가', [0, 3 * T], f => {
      const aw = f.awT > 0;
      for (const o of allies(f)) if (Math.hypot(o.x - f.x, o.y - f.y) < 3 * T) { heal(o, 24); buff(o, 'haste', 3, 1.15); if (aw) buff(o, 'dmg', 3, 1.2); }      // TEMP; 각성: damage +20 %
      fxPlay('chef', 'deco', Math.round(f.x), Math.round(f.y), 3 * T);
    }]
  ] });
HEROES.chef.name = '셰프';
HEROES.chef.hp = 660 * STAT_X;      // TEMP: a little more than the usual 600
if (!ACTIVE_HEROES.includes('chef')) ACTIVE_HEROES.push('chef');
if (!ROSTER.includes('chef')) ROSTER.push('chef');
Object.assign(PVS, {
  'chef:1': R('arc', { len: 2.2 * T, half: 1.3 }),
  'chef:2': R('self', { r: 50 }),
  'chef:3': R('ground', { max: 6 * T, r: 70 }),
  'chef:4': R('self', { r: 3 * T }),
  'chef:u': R('line', { len: 9 * T, w: 44 })
});

/* ================= art ================= */
function chefLadle(c, a, s, gold) {      // handle along +x, the bowl at the end
  c.save(); c.rotate(a); c.scale(s, s); c.lineCap = 'round';
  c.strokeStyle = gold ? '#e8c15a' : '#b9c1cb'; c.lineWidth = 2.6; c.beginPath(); c.moveTo(-4, 0); c.lineTo(18, 0); c.stroke();
  c.fillStyle = gold ? '#c99a2a' : '#8f98a3'; c.beginPath(); c.arc(22, 1, 5.5, 0, Math.PI * 1.05); c.fill();
  c.fillStyle = gold ? '#ffe28a' : '#d5dbe2'; c.fillRect(16, -.6, 12, 1.8);
  c.fillStyle = '#e0662a'; c.beginPath(); c.ellipse(22, 2.5, 3.6, 1.6, 0, 0, 7); c.fill();      // a little soup in the bowl
  c.restore();
}
function chefSpatulaArt(c, a, s) {
  c.save(); c.rotate(a); c.scale(s, s);
  c.fillStyle = '#6a4426'; c.fillRect(-6, -2, 18, 4); c.fillStyle = '#b9c1cb'; c.fillRect(12, -1.4, 8, 2.8);
  c.fillStyle = '#d8dee6'; c.beginPath(); c.roundRect(20, -8, 20, 16, 3); c.fill();
  c.fillStyle = '#9aa3ad'; for (let i = 0; i < 3; i++) c.fillRect(24 + i * 5, -5, 2, 10);
  c.restore();
}
function chefTurkey(c, s, t, flap) {
  c.save(); c.scale(s, s); const w = flap ? Math.sin(t * 30) * .9 : 0;
  for (const sg of [-1, 1]) { c.save(); c.translate(sg * 8, -4); c.rotate(sg * (-.6 + w)); c.fillStyle = '#e8892e'; c.beginPath(); c.ellipse(sg * 8, 0, 10, 4.5, 0, 0, 7); c.fill(); c.fillStyle = '#f2c14e'; c.beginPath(); c.ellipse(sg * 13, 0, 4, 3, 0, 0, 7); c.fill(); c.restore(); }
  c.fillStyle = '#b8661c'; c.beginPath(); c.ellipse(0, 0, 13, 10, 0, 0, 7); c.fill();
  c.fillStyle = '#d98a2a'; c.beginPath(); c.ellipse(-2, -3, 8, 5, -.2, 0, 7); c.fill();
  c.fillStyle = '#f3ead8'; for (const sg of [-1, 1]) { c.fillRect(sg * 10 - 1.5, 6, 3, 6); c.beginPath(); c.arc(sg * 10, 13, 2.2, 0, 7); c.fill(); }
  c.restore();
}
/* the character (drawStick coordinates: feet at 0, head centre HEADCY): white double-breasted jacket, red neckerchief, tall pleated toque, moustache */
function drawChef(c, o) {
  const { face, ax, ay, hx, hy, swing, HEADCY, HEADR: R0, SH, HIP } = o, k = R0 / 8;
  c.save();
  c.fillStyle = '#f4f4f2'; c.beginPath(); c.moveTo(-8 * k, SH - 1); c.lineTo(8 * k, SH - 1); c.lineTo(7 * k, HIP + 2); c.lineTo(-7 * k, HIP + 2); c.closePath(); c.fill();
  c.fillStyle = '#c9ccd4'; const gap = (HIP - SH) / 3.4; for (let i = 0; i < 3; i++) { const y = SH + 3 + i * gap; c.beginPath(); c.arc(-3 * k, y, 1.1, 0, 7); c.arc(3 * k, y, 1.1, 0, 7); c.fill(); }
  c.fillStyle = '#e23b3b'; c.beginPath(); c.moveTo(-6 * k, SH - 3); c.lineTo(6 * k, SH - 3); c.lineTo(2 * k, SH + 2); c.lineTo(0, SH + 5); c.lineTo(-2 * k, SH + 2); c.closePath(); c.fill();
  const top = HEADCY - R0;      // toque: band, then the puffed top
  c.fillStyle = '#f4f4f2'; c.fillRect(-9 * k, top - 3 * k, 18 * k, 4 * k); c.fillRect(-7 * k, top - 14 * k, 14 * k, 12 * k);
  c.beginPath(); c.arc(-5 * k, top - 15 * k, 6 * k, 0, 7); c.arc(5 * k, top - 15 * k, 6 * k, 0, 7); c.arc(0, top - 19 * k, 6.5 * k, 0, 7); c.fill();
  c.fillStyle = '#dfe1e6'; for (const x of [-3.5, 0, 3.5]) c.fillRect(x * k - .5, top - 12 * k, 1, 9 * k);
  c.fillStyle = '#2a1a10'; c.beginPath(); c.ellipse(face * 4 * k, HEADCY + 2.5 * k, 4.5 * k, 1.6 * k, face * .15, 0, 7); c.fill();
  c.restore();
  const a = Math.atan2(ay, ax) + (swing > 0 ? Math.sin(Math.min(1, swing / .22) * Math.PI) * .9 * face : 0);
  c.save(); c.translate(hx, hy); chefLadle(c, a, 1, false); c.restore();
}
/* projectiles */
function drawChefShot(b) {
  const t = performance.now() / 1000;
  if (b.shape === 'ladle') { ctx.save(); ctx.translate(b.x, b.y); chefLadle(ctx, t * 16, 1.25, b.gold); ctx.restore(); return true; }
  if (b.shape === 'spatula') { ctx.save(); ctx.translate(b.x, b.y); chefSpatulaArt(ctx, t * 12, 2.4); ctx.restore(); return true; }
  if (b.shape === 'tklob') {
    const A = bombArc(b), s = 1 - .45 * A.h / Math.max(1, A.H);
    ctx.save(); ctx.globalAlpha = .28; ctx.fillStyle = '#000'; ctx.beginPath(); ctx.ellipse(b.x, b.y + 30, 16 * s, 6 * s, 0, 0, 7); ctx.fill(); ctx.restore();
    ctx.save(); ctx.translate(b.x, b.y - A.h); chefTurkey(ctx, 1.2, t, true); ctx.restore();
    if (!lowFx() && Math.random() < .3) CHF.p.push({ x: b.x + rnd(-8, 8), y: b.y - A.h, vx: rnd(-30, 30), vy: rnd(10, 40), life: .6, max: .6, k: 'feather' });
    return true;
  }
  return false;
}
/* puddles: a wobbly edge, a darker rim, chunks, bubbles that pop, steam (soup) or glints (oil) */
function drawChefZone(z) {
  const t = performance.now() / 1000, al = Math.min(1, z.t * 2.5), oil = z.kind === 'oil', seed = (z.x * 7 + z.y * 13) % 100;
  ctx.save(); ctx.globalAlpha = al;
  const path = (sc) => { ctx.beginPath(); for (let i = 0; i <= 14; i++) { const a = i / 14 * 6.283, rr = z.r * sc * (.86 + .14 * Math.sin(a * 3 + seed) + .05 * Math.sin(a * 5 + t * 2 + seed)); const x = z.x + Math.cos(a) * rr, y = z.y + Math.sin(a) * rr * .72; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.closePath(); };
  path(1.08); ctx.fillStyle = oil ? 'rgba(120,80,10,.55)' : 'rgba(110,30,10,.55)'; ctx.fill();
  path(1); ctx.fillStyle = oil ? '#d9a21b' : '#d9542a'; ctx.fill();
  path(.7); ctx.fillStyle = oil ? '#f0c64a' : '#ec7a3c'; ctx.fill();
  if (!oil) for (let i = 0; i < 5; i++) {      // chunks: carrot cubes and herbs drifting
    const a = seed + i * 1.9 + t * .3, d = z.r * (.25 + .4 * ((i * 37) % 10) / 10), x = z.x + Math.cos(a) * d, y = z.y + Math.sin(a) * d * .7;
    ctx.fillStyle = i % 2 ? '#ff9a2a' : '#5fae3a'; if (i % 2) ctx.fillRect(x - 2.5, y - 2.5, 5, 5); else { ctx.beginPath(); ctx.ellipse(x, y, 3.5, 1.8, a, 0, 7); ctx.fill(); }
  }
  for (let i = 0; i < 4; i++) {      // bubbles grow and pop
    const ph = (t * (oil ? 1.6 : 1.1) + i * .27 + seed * .01) % 1, a = seed * 3 + i * 1.6, d = z.r * .5 * ((i * 53) % 10) / 10;
    const x = z.x + Math.cos(a) * d, y = z.y + Math.sin(a) * d * .7;
    ctx.strokeStyle = oil ? 'rgba(255,240,180,.9)' : 'rgba(255,210,170,.9)'; ctx.lineWidth = 1.4;
    if (ph < .85) { ctx.beginPath(); ctx.arc(x, y, 1.5 + ph * 4, 0, 7); ctx.stroke(); } else { for (let q = 0; q < 4; q++) { const qa = q * 1.57 + .4; ctx.beginPath(); ctx.moveTo(x + Math.cos(qa) * 4, y + Math.sin(qa) * 4); ctx.lineTo(x + Math.cos(qa) * 7, y + Math.sin(qa) * 7); ctx.stroke(); } }
  }
  if (oil) { ctx.fillStyle = 'rgba(255,255,255,.8)'; for (let i = 0; i < 3; i++) { const g = (Math.sin(t * 3 + i * 2 + seed) + 1) / 2; ctx.globalAlpha = al * g; ctx.beginPath(); ctx.ellipse(z.x - z.r * .3 + i * z.r * .3, z.y - z.r * .2 + (i % 2) * 6, 3, 1.2, 0, 0, 7); ctx.fill(); } }
  else if (!lowFx()) { ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 3; ctx.lineCap = 'round'; for (let i = 0; i < 2; i++) { const ph = (t * .5 + i * .5 + seed * .01) % 1, x = z.x + (i ? 8 : -10); ctx.globalAlpha = al * (1 - ph) * .8; ctx.beginPath(); ctx.moveTo(x, z.y - 4 - ph * 30); ctx.quadraticCurveTo(x + 6 * Math.sin(t * 3 + i), z.y - 14 - ph * 30, x, z.y - 24 - ph * 30); ctx.stroke(); } }
  ctx.restore(); return true;
}
/* named effects (every screen plays them) */
const CHF = { fx: [], p: [] };
FXF.chef = (type, x, y, v, w) => { CHF.fx.push({ type, x, y, v: +v || 0, w: +w || 0, at: performance.now() / 1000 }); if (CHF.fx.length > 40) CHF.fx.shift();
  const n = lowFx() ? 4 : 10;
  if (type === 'serve') for (let i = 0; i < n; i++) CHF.p.push({ x, y, vx: rnd(-160, 160), vy: rnd(-200, -40), g: 420, life: .8, max: .8, k: i % 3 ? 'drop' : 'feather' });
  if (type === 'deco') for (let i = 0; i < n * 2; i++) { const a = rnd(0, 6.283), d = rnd(10, v); CHF.p.push({ x: x + Math.cos(a) * d, y: y + Math.sin(a) * d * .7 - 30, vx: 0, vy: rnd(-40, -10), life: 1, max: 1, k: 'spr', c: ['#ff7ad9', '#7fe0ff', '#ffe07a', '#9fff8a'][i % 4] }); }
  if (type === 'taste') for (let i = 0; i < n; i++) CHF.p.push({ x: x + rnd(-14, 14), y: y - 40, vx: rnd(-10, 10), vy: rnd(-60, -30), life: 1, max: 1, k: 'heart' });
};
const CHF_DUR = { swing: .22, pan: .3, flip: .4, throw: .3, serve: .5, taste: .9, deco: .8 };
function drawChefTop() {       // tail.js render(): above the fighters
  const now = performance.now() / 1000, dt = Math.min(.05, now - (CHF.last || now)); CHF.last = now;
  for (let i = CHF.fx.length - 1; i >= 0; i--) {
    const e = CHF.fx[i], k = (now - e.at) / (CHF_DUR[e.type] || .4); if (k >= 1) { CHF.fx.splice(i, 1); continue; }
    ctx.save(); ctx.translate(e.x, e.y + BODY); ctx.globalAlpha = 1 - k;
    if (e.type === 'swing' || e.type === 'pan' || e.type === 'flip') {      // a sweep: soup arc / steel arc with sparks / a huge spatula sweep
      const R = e.type === 'swing' ? CHEF.swR : e.type === 'pan' ? 2.2 * T : 3.2 * T, half = e.type === 'pan' && e.w ? Math.PI : e.type === 'swing' ? CHEF.swHalf : e.type === 'pan' ? 1.3 : 1.25;
      const a0 = e.v - half, a1 = e.v - half + (2 * half) * Math.min(1, k * 2.2);
      ctx.fillStyle = e.type === 'swing' ? 'rgba(236,122,60,.35)' : e.type === 'pan' ? 'rgba(200,210,225,.35)' : 'rgba(230,236,245,.4)';
      ctx.beginPath(); ctx.arc(0, 0, R, a0, a1); ctx.arc(0, 0, R * .55, a1, a0, true); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = e.type === 'swing' ? '#ffb27a' : '#ffffff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, R * .95, a0, a1); ctx.stroke();
      const tip = a1;
      ctx.save(); ctx.translate(Math.cos(tip) * R * .8, Math.sin(tip) * R * .8);
      if (e.type === 'pan') { ctx.rotate(tip); ctx.fillStyle = '#2b2d33'; ctx.beginPath(); ctx.arc(0, 0, 15, 0, 7); ctx.fill(); ctx.fillStyle = '#3d4048'; ctx.beginPath(); ctx.arc(0, 0, 11, 0, 7); ctx.fill(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(-1, -2, 5, 4, 0, 0, 7); ctx.fill(); ctx.fillStyle = '#ffc21a'; ctx.beginPath(); ctx.arc(-1, -2, 2.2, 0, 7); ctx.fill(); }
      else if (e.type === 'flip') chefSpatulaArt(ctx, tip + 1.57, 2.6);
      ctx.restore();
    } else if (e.type === 'throw') { ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(0, 0, 30 + k * 40, e.v - .6, e.v + .6); ctx.stroke(); }
    else if (e.type === 'serve') { ctx.translate(0, -BODY); ctx.fillStyle = '#8a4a1a'; ctx.beginPath(); for (let q = 0; q < 10; q++) { const a = q * .628, r = (q % 2 ? 26 : 44) * (.6 + .4 * k); ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r * .6); } ctx.closePath(); ctx.fill(); }
    else if (e.type === 'deco' || e.type === 'taste') { if (e.v) { ctx.strokeStyle = e.type === 'deco' ? '#ff9ad9' : '#9fff8a'; ctx.lineWidth = 4; ctx.setLineDash([10, 8]); ctx.beginPath(); ctx.ellipse(0, -BODY, e.v * (.6 + .4 * k), e.v * .7 * (.6 + .4 * k), 0, 0, 7); ctx.stroke(); } }
    ctx.restore();
  }
  for (let i = CHF.p.length - 1; i >= 0; i--) {
    const p = CHF.p[i]; p.life -= dt; if (p.life <= 0) { CHF.p.splice(i, 1); continue; }
    p.vy += (p.g || 0) * dt; p.x += p.vx * dt; p.y += p.vy * dt;
    ctx.save(); ctx.globalAlpha = Math.min(1, p.life / p.max * 1.5); ctx.translate(p.x, p.y);
    if (p.k === 'feather') { ctx.rotate(p.life * 6); ctx.fillStyle = '#c9772e'; ctx.beginPath(); ctx.ellipse(0, 0, 6, 2.2, 0, 0, 7); ctx.fill(); }
    else if (p.k === 'drop') { ctx.fillStyle = '#a0521c'; ctx.beginPath(); ctx.arc(0, 0, 3, 0, 7); ctx.fill(); }
    else if (p.k === 'spr') { ctx.rotate(p.life * 8); ctx.fillStyle = p.c; ctx.fillRect(-3.5, -1.2, 7, 2.4); }
    else if (p.k === 'heart') { ctx.fillStyle = '#ff6b8a'; ctx.beginPath(); ctx.arc(-2.5, 0, 3, 0, 7); ctx.arc(2.5, 0, 3, 0, 7); ctx.moveTo(-5.5, 1); ctx.lineTo(0, 7); ctx.lineTo(5.5, 1); ctx.fill(); }
    ctx.restore();
  }
}

/* ---------- locked until owned: the character screen (tail.js openDetail calls this) ---------- */
function chefLockUi(id) {
  const btn = document.getElementById('weaponLockBtn'), d = document.getElementById('weaponDetail'); if (!btn || !d) return;
  btn.disabled = true;
  const box = document.createElement('div'); box.className = 'hLockBox';
  if (typeof tkOn === 'function' && tkOn()) { btn.textContent = '🔒 시즌 뽑기에서 얻기'; box.textContent = '시즌 The key of Turkey 뽑기에서 낮은 확률로 나와요. 시즌이 끝나면 크리스탈이나 골드로 살 수 있어요.'; d.prepend(box); return; }
  btn.textContent = '🔒 잠김'; box.textContent = '크리스탈이나 골드로 얻을 수 있어요.';
  for (const [k, cls, have] of [['cr', 'ic-cr', () => COS.cr | 0], ['g', 'coin', () => COS.gold | 0]]) {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'skBuy hBuy'; b.id = 'chefBuy-' + k; const p = CHEF_PRICE[k];
    b.innerHTML = '<span>얻기</span><i class="' + cls + '"></i><b></b>'; b.querySelector('b').textContent = p.toLocaleString('en-US');
    if (have() < p) b.classList.add('poor');
    b.addEventListener('click', () => {
      if (have() < p) { b.classList.remove('nope'); void b.offsetWidth; b.classList.add('nope'); return; }
      if (!b.classList.contains('ask')) { b.classList.add('ask'); b.firstChild.textContent = '얻을까요?'; return; }
      if (k === 'cr') COS.cr -= p; else COS.gold -= p;
      chefGive(); saveCos(); goldUi(); try { sfx(1320, .16, 'triangle', .07); } catch (e) { quietErr(e); }
      const card = document.getElementById('char-' + id); if (card) { card.classList.remove('heroLock'); const l = card.querySelector('.hLock'); if (l) l.remove(); }
      openDetail(id);
    });
    box.append(b);
  }
  d.prepend(box);
}
