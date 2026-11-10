/* ---------- Stickseum's effects (spawnFx0, its particle shapes, screen flashes), played top-down ----------
   The art draws side-on: x across, y down, gravity pulls down. Top-down the screen's vertical axis doubles as height:
   what falls lands on the ground line of the spot it came from (FX_GY), and an effect that only ever pointed left or right
   (a dash cut, a sand wall, an afterimage line) is built pointing right and then turned to the real direction (rot). */
const droneKick = {}, DS_DRAGONS = {}, DS_STATE = {}, TIDES = [], otherSettings = {};
let fleetShows = [], swings = [], hitStopUntil = 0;
function playSfx(n, x, y) {
  if (x !== undefined && player && Math.hypot(player.x - x, player.y - y) > 900) return;
  const m = { explosion: [90, .35, 'sawtooth', .06, .4], beam: [900, .25, 'sawtooth', .04, .3], portalwarp: [600, .2, 'sine', .04, 2], flame: [200, .2, 'sawtooth', .03, .6] }[n];
  if (m) sfx(...m);
}
function dmgText() {}            // (the damage numbers are drawn by the match itself)
function showDiceBanner() {}
function svFlash(a, col) { samFlash(a, col); }
function hitReact(e) {           // the one who was hit leans away for a moment; a big hit on me stops the picture for a blink
  const v = +e.v || 0; if (!(v > 0)) return;
  let best = null, bd = 70;
  for (const f of fighters) { if (!f || f.dead) continue; const d = Math.hypot(f.x - e.x, f.y + BODY - e.y); if (d < bd) { bd = d; best = f; } }
  if (best) best.stg = { at: performance.now(), dir: Math.cos(e.ang || 0) >= 0 ? 1 : -1, s: Math.min(1, .35 + v / 120) };
  if (best && best === player && v >= 50 && !NET.role) hitStopUntil = performance.now() + (v >= 100 ? 90 : 55);
}
function staggerAngle(f) {
  const st = f.stg; if (!st) return 0;
  const age = performance.now() - st.at; if (age > 240 || age < 0) { f.stg = null; return 0; }
  return st.dir * .26 * st.s * Math.sin(Math.PI * age / 240);
}
function rotQ(q, ox, oy, c, s) {
  const rp = (px, py) => [ox + (px - ox) * c - (py - oy) * s, oy + (px - ox) * s + (py - oy) * c];
  [q.x, q.y] = rp(q.x, q.y); if (q.x2 !== undefined) [q.x2, q.y2] = rp(q.x2, q.y2);
  const vx = q.vx * c - q.vy * s, vy = q.vx * s + q.vy * c; q.vx = vx; q.vy = vy;
  if (q.gy !== undefined) q.gy = Math.max(q.gy, q.y + 30);
}
/* play one of the original effects: every screen does this itself, the host only sends the name and the numbers */
FXF.sp = (type, x, y, ex) => {
  ex = ex || {};
  if (!fxInView(x, y) && type !== 'cfleet') return;
  if (type === 'cards') { if (state !== 'play') return; const c = document.getElementById('diceBannerContainer'); if (c) c.textContent = ''; }
  FX_GY = ex.gy != null ? ex.gy : y + 30; FX_NEW = ex.rot ? [] : null; FX_WID = ex.wid || null; FX_COS = ex.cos || null; FX_ANG = ex.rot || 0;
  try { spawnFx0(Object.assign({ type, x, y }, ex)); } catch (e) {}
  if (ex.rot && FX_NEW) { const c = Math.cos(ex.rot), s = Math.sin(ex.rot); for (const q of FX_NEW) rotQ(q, x, y, c, s); }
  FX_GY = null; FX_NEW = null; FX_WID = null; FX_COS = null;
};
function fx(type, x, y, ex) { fxPlay('sp', type, Math.round(x), Math.round(y), ex || {}); }
const fxAt = (f, type, ex) => fx(type, f.x, f.y + BODY, Object.assign({ gy: f.y + 16 }, ex));
/* a line effect from a to b, built pointing right and turned */
function fxLine(type, x0, y0, x1, y1, ex) { const d = Math.hypot(x1 - x0, y1 - y0) || 1, a = Math.atan2(y1 - y0, x1 - x0); fx(type, x0, y0, Object.assign({ x2: Math.round(x0 + d), y2: Math.round(y0), rot: +a.toFixed(3), dir: 1 }, ex)); }
const themeCol = id => (ULT_THEMES[id] || ULT_THEMES._).c[0];

/* melee swings: the original weapon arcs (drawProjectileBase with a swing angle), drawn where the arm swings */
function addSwing(f, ang) {
  const life = Math.min(.28, Math.max(.12, f.h.cd || .3));
  const s = { x: f.x + Math.cos(ang) * 26, y: f.y + BODY + Math.sin(ang) * 26, wid: f.h.id, swingAngle: ang, life, life0: life, color: TC(f.team), vx: 0, vy: 0, dmgless: true };
  swings.push(s); evt(['w', Math.round(s.x), Math.round(s.y), s.wid, +ang.toFixed(2), +life.toFixed(2), f.team]);
}
const SHAPE_WID = {}; for (const id in WEAPONS) { const sh = WEAPONS[id].shape; if (sh && !SHAPE_WID[sh] && WEAPONS[id].kind !== 'melee') SHAPE_WID[sh] = id; }
SHAPE_WID.bullet = 'pistol'; SHAPE_WID.fireball = 'wizard'; SHAPE_WID.bomb = 'grenade'; SHAPE_WID.rocket = 'bazooka'; SHAPE_WID.arrow = 'bow';
function drawShot(b) {          // a projectile in the original art, turned along its flight
  const wid = b.wid || SHAPE_WID[b.shape];
  if (!wid) return false;
  const vx = b.vx != null ? b.vx : Math.cos(b.ang) * 100, vy = b.vy != null ? b.vy : Math.sin(b.ang) * 100;
  ctx.save();
  try { drawProjectileBase({ x: b.x, y: b.y, vx: vx || Math.cos(b.ang), vy: vy || Math.sin(b.ang), wid, life: 1, life0: 1, color: TC(b.team), ult: b.r > 8, scale: b.r > 8 ? b.r / 6 : 1, owner: 'x' }); } catch (e) { ctx.restore(); return false; }
  ctx.restore();
  return true;
}
function drawSwings(dt) {
  drawBuffAuras();
  for (let i = swings.length - 1; i >= 0; i--) {
    const s = swings[i]; s.life -= dt; if (s.life <= 0) { swings.splice(i, 1); continue; }
    ctx.save(); try { drawProjectileBase(s); } catch (e) {} ctx.restore();
  }
}

/* what each skill adds on top of its own work, when it is used (the original's per-skill effects) */
const SKILL_FX = {
  'sword:3': f => fxAt(f, 'skillring', { color: '#dfe6f0', r: 110 }),
  'sword:4': f => fxAt(f, 'blink', { color: '#ffd34d' }),
  'bat:1': f => fxAt(f, 'skillring', { color: '#ffffff', r: 80 }),
  'shotgun:1': f => fxAt(f, 'gust', { r: 120 }),
  'shotgun:5': f => fxAt(f, 'skillring', { color: '#c9a36a' }),
  'rifle:3': f => fxAt(f, 'skillring', { color: '#7be86a' }),
  'rifle:5': f => fxAt(f, 'shieldup'),
  'smg:3': f => fxAt(f, 'dash', { dir: 1, rot: +f.aim.toFixed(2) }),
  'gloves:2': f => fxAt(f, 'shieldup'),
  'dagger:3': f => fxAt(f, 'skillring', { color: '#8fe04a' }),
  'dagger:4': f => fxAt(f, 'smokeveil'),
  'dracula:1': f => fxAt(f, 'skillring', { color: '#b01030' }),
  'dracula:3': f => fxAt(f, 'skillring', { color: '#d01030' }),
  'wizard:1': f => fxAt(f, 'gust', { r: 130 }),
  'wizard:5': f => fxAt(f, 'skillring', { color: '#9d7bff' }),
  'magiccard:4': f => fxAt(f, 'skillring', { color: '#ff9ad0' }),
  'boomerang:1': f => fxAt(f, 'gust', { r: 160 }),
  'boomerang:3': f => fxAt(f, 'skillring', { color: '#ffd34d' }),
  'flamethrower:3': f => fxAt(f, 'skillring', { color: '#ff7a2b' }),
  'vacuum:1': f => fxAt(f, 'vacvortex', { r: px(330) }),
  'vacuum:2': f => fxAt(f, 'smokeland'),
  'vacuum:3': f => fxAt(f, 'skillring', { color: '#8fd3ff' }),
  'pirate:3': f => fxAt(f, 'skillring', { color: '#d98c2b' }),
  'samurai:2': f => fxAt(f, 'skillring', { color: '#ffd34d' }),
  'samurai:4': f => fxAt(f, 'skillring', { color: '#dfe9ff' }),
  'harald:1': f => fxAt(f, 'skillring', { color: '#ff5a3a' }),
  'harald:4': f => fxAt(f, 'shieldup'),
  'horemheb:2': f => fxAt(f, 'sandpuff'),
  'horemheb:3': f => fxAt(f, 'sandpuff'),
  'pizarro:1': f => fxAt(f, 'skillring', { color: '#ffd34d' }),
  'pizarro:4': f => fxAt(f, 'skillring', { color: '#ffd34d', r: 220 }),
  'edward:2': f => fxAt(f, 'skillring', { color: '#b3202a' }),
  'edward:4': f => fxAt(f, 'skillring', { color: '#f4f1e8' }),
  'plague:5': f => fxAt(f, 'skillring', { color: '#9be06a' }),
  'dragonslayer:1': f => fxAt(f, 'skillring', { color: '#ff8a3d' }),
  'dragonslayer:2': f => fxAt(f, 'shieldup'),
  'dragonslayer:5': f => fxAt(f, 'skillring', { color: '#ff8a3d' }),
  'shade:3': f => fxAt(f, 'skillring', { color: '#7dffd8' }),
  'kan:5': f => fxAt(f, 'skillring', { color: '#7ddc7a' }),
  'kurus:1': f => fxAt(f, 'darksplash'),
  'kurus:3': f => fxAt(f, 'darksplash'),
  'cleon:1': f => fxAt(f, 'skillring', { color: '#ff7ac8' }),
  'cleon:5': f => fxAt(f, 'shieldup'),
  'pel:1': f => fxAt(f, 'skillring', { color: '#7fd8ff' }),
  'pel:3': f => fxAt(f, 'shieldup'),
  'pel:5': f => fxAt(f, 'skillring', { color: '#7dff9a' }),
  'tionis:2': f => fxAt(f, 'skillring', { color: '#4ddb7a' }),
  'tell:3': f => fxAt(f, 'skillring', { color: '#ffe14a' }),
  'tell:5': f => fxAt(f, 'skillring', { color: '#9ae26a' }),
  'pistol:1': f => fxAt(f, 'skillring', { color: '#ffd34d' }),
  'pistol:3': f => fxAt(f, 'skillring', { color: '#ffd34d' }),
  'pistol:4': f => fxAt(f, 'skillring', { color: '#7bf3ff' }),
  'medium:2': f => fxAt(f, 'skillring', { color: '#8b5cf6' }),
  /* skills that used to show only the plain ring */
  'sword:2': f => fxAt(f, 'dash', { dir: 1, rot: +f.aim.toFixed(2), color: '#ffd34d' }),
  'sword:5': f => fx('spark', f.x + Math.cos(f.aim) * 46, f.y + BODY + Math.sin(f.aim) * 46, { ang: +f.aim.toFixed(2), color: '#ffffff' }),
  'pistol:2': f => fx('spark', f.x + Math.cos(f.aim) * 40, f.y + BODY + Math.sin(f.aim) * 40, { ang: +f.aim.toFixed(2), color: '#ffd34d' }),
  'edward:3': f => fx('spark', f.x + Math.cos(f.aim) * 40, f.y + BODY + Math.sin(f.aim) * 40, { ang: +f.aim.toFixed(2), color: '#ffd34d' }),
  'edward:4': f => fxAt(f, 'shieldup'),
  'harald:2': f => fx('dustblast', f.x + Math.cos(f.aim) * 30, f.y + BODY + Math.sin(f.aim) * 30, { ang: +f.aim.toFixed(2) }),
  'tell:1': f => { const e = nearest(f, 9 * T, null, 0); if (e) fx('lockon', e.x, e.y + BODY); fxAt(f, 'skillring', { color: '#9ae26a', r: 80 }); },
  'tell:3': f => fxAt(f, 'arrowwarn'),
  'tell:4': f => { const e = nearest(f, 9 * T, null, 0); if (e) fx('lockon', e.x, e.y - 60); fxAt(f, 'skillring', { color: '#ff6a6a', r: 80 }); },
  'tell:5': f => fxAt(f, 'arrowwarn'),
  'kan:2': f => fxAt(f, 'smellburst'),
  'plague:5': f => { fxAt(f, 'smellburst'); fxAt(f, 'skillring', { color: '#9be06a' }); },
  'puppeteer:2': f => fxAt(f, 'magiccircle'),
  'dragonslayer:1': f => { fx('flamepuff', f.x + Math.cos(f.aim) * 20, f.y + BODY + Math.sin(f.aim) * 20, { ang: +f.aim.toFixed(2) }); fxAt(f, 'skillring', { color: '#ff8a3d' }); },
  'magiccard:2': f => fxAt(f, 'blink', { color: '#ffffff' }),
  'magiccard:3': f => fxAt(f, 'blink', { color: '#ff9ad0' })
};
function skillFx(f, def) {
  fx('skill', f.x, f.y - 66, { name: typeof def.name === 'function' ? def.name(f) : def.name, color: TC(f.team) });
  const g = SKILL_FX[f.h.id + ':' + def.n]; if (g) g(f);
  else fxAt(f, 'skillring', { color: themeCol(f.h.id), r: 90 });
  syncAuras(def.k === 'buff' ? f : null, themeCol(f.h.id));
}
function ultFx(f) {
  fxAt(f, 'ult', { name: f.h.ult.name });
  fxAt(f, 'ultfx', { w: f.h.id });
  syncAuras(f, themeCol(f.h.id));
}

/* ---------- buffs you can see: while a power-up lasts, the one who has it shows it ----------
   (before, a buff was a ring at the moment of casting and then nothing). The host looks at the buffs a skill just gave (to the caster or
   to anyone else) and sends 'aura' with the name and the seconds; every screen then draws the same thing, so nothing has to travel with the snapshots. */
const AURA = {
  haste: ['wind', '#7be8ff'], rush: ['wind', '#ffd34d'], freedash: ['wind', '#bfefff'],
  dmg: ['power', '#ff5a4a'], rage: ['power', '#ff7a2b'], over: ['power', '#ff3b3b'], flame: ['power', '#ff8a2b'], gas: ['power', '#9be06a'], rapid: ['power', '#ffe14a'], full: ['power', '#ffd34d'],
  dr: ['guard', '#8fb8ff'], march: ['guard', '#d8c07a'], parade: ['guard', '#ffd34d'],
  auto: ['aim', '#7dffd8'], focus: ['aim', '#ffd34d'], dual: ['orbit', '#ffe14a'], fresh: ['plus', '#7dffa3'], apple: ['plus', '#ff6a6a']
};
function syncAuras(caster, col) {
  for (const f of fighters) {
    if (!f || f.dead || f.minion) continue;
    const have = f.fxAura || (f.fxAura = {}), now = performance.now();
    let any = false;
    for (const k in AURA) { const o = f.b && f.b[k]; if (o && o.t > .25 && (have[k] || 0) < now + 120) { fxPlay('aura', fighters.indexOf(f), k, +o.t.toFixed(2)); any = true; } }
    if (f === caster && !any && !(have.gen > now)) fxPlay('aura', fighters.indexOf(f), 'gen', 1.3, col);          // (a skill that only changes how the next shots fly: a short glow so the cast still shows)
  }
}
FXF.aura = (fi, k, dur, col) => { const f = fighters[fi]; if (!f) return; (f.fxAura || (f.fxAura = {}))[k] = performance.now() + dur * 1000; if (col) f.fxAuraCol = col; };
function drawBuffAuras() {
  const now = performance.now(), T = now / 1000, menu = state === 'menu';
  for (const f of fighters) {
    const a = f && f.fxAura; if (!a || f.minion) continue;
    if (f.dead) { f.fxAura = null; continue; }
    if (!menu && (!visibleTo(f, VIEW) || bushAt(f.x, f.y))) continue;
    const kinds = {}; let n = 0;
    for (const k in a) { if (a[k] <= now) { delete a[k]; continue; } const d = AURA[k]; if (d && !kinds[d[0]] && n < 3) { kinds[d[0]] = { c: d[1], left: (a[k] - now) / 1000 }; n++; } }
    const gen = a.gen > now ? (a.gen - now) / 1000 : 0;
    if (!n && !gen) continue;
    ctx.save(); ctx.translate(f.x, f.y);
    const sp = Math.hypot(f.vx || 0, f.vy || 0), seed = (f.slot || 0) * 1.7;
    if (kinds.wind) {
      const c = kinds.wind.c; ctx.strokeStyle = c; ctx.lineCap = 'round';
      if (sp > 25) {
        const dx = -f.vx / sp, dy = -f.vy / sp;
        for (let i = 0; i < 4; i++) { const ph = (T * 3.2 + i * .27 + seed) % 1, y0 = -6 - i * 12, x0 = dx * (10 + ph * 18), L = 20 + (i % 2) * 12; ctx.globalAlpha = .65 * (1 - ph); ctx.lineWidth = 3 - i * .4; ctx.beginPath(); ctx.moveTo(x0, y0 + dy * (10 + ph * 18)); ctx.lineTo(x0 + dx * L, y0 + dy * (10 + ph * 18 + L)); ctx.stroke(); }
      } else { for (let i = 0; i < 2; i++) { ctx.globalAlpha = .5; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.ellipse(0, -4, 26, 10, 0, T * 5 + i * Math.PI, T * 5 + i * Math.PI + 1.3); ctx.stroke(); } }
    }
    if (kinds.power) {
      const c = kinds.power.c; ctx.fillStyle = c; ctx.strokeStyle = c; ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = .35 + .15 * Math.sin(T * 9); ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(0, 1, 24 + Math.sin(T * 9) * 2, 10, 0, 0, 6.3); ctx.stroke();
      for (let i = 0; i < 7; i++) { const ph = (T * .95 + i / 7 + seed) % 1; ctx.globalAlpha = (1 - ph) * .9; ctx.beginPath(); ctx.arc(Math.sin(i * 2.3 + T * 2.2) * 15, -6 - ph * 60, 2.8 * (1 - ph * .5) + .6, 0, 6.3); ctx.fill(); }
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = .85; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; const ph = (T * 1.4 + seed) % 1; ctx.globalAlpha = (1 - ph) * .9;
      ctx.beginPath(); ctx.moveTo(-7, -78 - ph * 10 + 5); ctx.lineTo(0, -78 - ph * 10 - 2); ctx.lineTo(7, -78 - ph * 10 + 5); ctx.stroke();            // (a small arrow rising over the head: "stronger")
    }
    if (kinds.guard) {
      const c = kinds.guard.c, pulse = kinds.guard.left < 1 ? (Math.sin(T * 22) > 0 ? .35 : 1) : 1;          // (blinks in the last second)
      ctx.strokeStyle = c; ctx.fillStyle = c; ctx.globalAlpha = .1 * pulse; ctx.beginPath(); ctx.arc(0, -30, 33, 0, 6.3); ctx.fill();
      ctx.globalAlpha = .75 * pulse; ctx.lineWidth = 3; ctx.setLineDash([7, 9]); ctx.lineDashOffset = -T * 40; ctx.beginPath(); ctx.arc(0, -30, 33, 0, 6.3); ctx.stroke(); ctx.setLineDash([]);
    }
    if (kinds.aim) {
      const c = kinds.aim.c; ctx.strokeStyle = c; ctx.lineWidth = 2; ctx.globalAlpha = .85; ctx.save(); ctx.translate(0, -62); ctx.rotate(T * 2.4);
      ctx.beginPath(); ctx.arc(0, 0, 15, 0, 6.3); ctx.stroke(); for (let i = 0; i < 4; i++) { ctx.rotate(Math.PI / 2); ctx.beginPath(); ctx.moveTo(11, 0); ctx.lineTo(21, 0); ctx.stroke(); } ctx.restore();
    }
    if (kinds.orbit) {
      const c = kinds.orbit.c; ctx.fillStyle = c; ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 2; i++) { const an = T * 4.2 + i * Math.PI; ctx.globalAlpha = .9; ctx.beginPath(); ctx.arc(Math.cos(an) * 27, -30 + Math.sin(an) * 12, 4.2, 0, 6.3); ctx.fill(); ctx.globalAlpha = .25; ctx.beginPath(); ctx.arc(Math.cos(an) * 27, -30 + Math.sin(an) * 12, 8, 0, 6.3); ctx.fill(); }
      ctx.globalCompositeOperation = 'source-over';
    }
    if (kinds.plus) {
      const c = kinds.plus.c; ctx.strokeStyle = c; ctx.lineWidth = 3; ctx.lineCap = 'round';
      for (let i = 0; i < 3; i++) { const ph = (T * .8 + i / 3 + seed) % 1, x = Math.sin(i * 2.9 + 1) * 15, y = -10 - ph * 52; ctx.globalAlpha = (1 - ph) * .95; ctx.beginPath(); ctx.moveTo(x - 4, y); ctx.lineTo(x + 4, y); ctx.moveTo(x, y - 4); ctx.lineTo(x, y + 4); ctx.stroke(); }
    }
    if (gen) {
      const c = f.fxAuraCol || '#ffd34d', k = Math.min(1, gen / 1.3); ctx.strokeStyle = c; ctx.fillStyle = c; ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = .55 * k; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(0, -30, 25 + (1 - k) * 8, 34 + (1 - k) * 8, 0, 0, 6.3); ctx.stroke();
      for (let i = 0; i < 5; i++) { const ph = (T * 1.1 + i / 5 + seed) % 1; ctx.globalAlpha = (1 - ph) * .85 * k; ctx.beginPath(); ctx.arc(Math.sin(i * 3.1 + T) * 17, -4 - ph * 60, 2.3, 0, 6.3); ctx.fill(); }
      ctx.globalCompositeOperation = 'source-over';
    }
    ctx.restore();
  }
  ctx.globalAlpha = 1;
}
/* 도박사: the cards turn over in a banner (the original's), for whoever plays them in sight */
function cardFx(f, cs, total, tags) {
  if (state !== 'play' || (!f.human && player && Math.hypot(player.x - f.x, player.y - f.y) > 6 * T)) return;
  const R = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  const cards = cs.map(c => c >= 52 ? { joker: 1, r: '', s: '', red: 0 } : { r: R[c % 13], s: '♠♥♦♣'[Math.floor(c / 13)], red: (Math.floor(c / 13) === 1 || Math.floor(c / 13) === 2) ? 1 : 0 });
  fx('cards', f.x, f.y + BODY, { name: f.nick || f.h0.name, cards, total, tags: tags || [] });
}
/* the dragon and the crows in the original art */
function drawDragonMinion(m) {
  const face = Math.cos(m.a * .7 + Math.PI / 2) >= 0 ? -1 : 1;
  ctx.save(); ctx.translate(m.x, m.y - 40); ctx.scale(1.25, 1.25);
  ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.beginPath(); ctx.ellipse(0, 120, 70, 16, 0, 0, 6.3); ctx.fill();
  try { drawFireDragon(ctx, performance.now(), face, 3, m.breath && time - m.breath < .42 ? 1 - (time - m.breath) / .42 : 0); } catch (e) {}
  ctx.restore();
}
function drawCrowMinion(m) {
  const now = performance.now(), ang = m.a || 0, f = Math.cos(ang) >= 0 ? 1 : -1, fl = Math.sin(now / 55 + (m.x | 0)) * .9;
  ctx.save(); ctx.translate(m.x, m.y - 30); ctx.scale(f, 1); ctx.rotate(Math.atan2(Math.sin(ang), Math.abs(Math.cos(ang))) * .5);
  ctx.globalAlpha = .28; ctx.fillStyle = '#8fd36a'; ctx.beginPath(); ctx.arc(0, 0, 24, 0, 7); ctx.fill(); ctx.globalAlpha = 1;
  ctx.fillStyle = '#14141b'; ctx.strokeStyle = '#9aa0b8'; ctx.lineWidth = 1.4;
  ctx.beginPath(); ctx.moveTo(-4, -2); ctx.quadraticCurveTo(-8, -14 + fl * 8, -22, -22 + fl * 20); ctx.quadraticCurveTo(-18, -6 + fl * 6, -30, -2 + fl * 14); ctx.quadraticCurveTo(-16, 2, -2, 5); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(0, 0, 17, 8.5, 0, 0, 7); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-14, 0); ctx.lineTo(-29, -4); ctx.lineTo(-26, 5); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.arc(15, -3, 7, 0, 7); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#3a3a48'; ctx.beginPath(); ctx.moveTo(20, -6); ctx.lineTo(31, -2); ctx.lineTo(20, 1); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#ff5a5a'; ctx.beginPath(); ctx.arc(17, -4.5, 1.7, 0, 7); ctx.fill();
  ctx.restore();
}
