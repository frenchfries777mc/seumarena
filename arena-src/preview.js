/* ---------- previews ----------
   Holding a skill key (F, E), the ultimate (R / Space) or the dash (Q / Shift) draws a mint, see-through picture of what it will
   do; letting go fires it where the cursor is then. Esc (or a right click) cancels. The normal attack has its own white picture,
   different for every weapon (its reach, its angle, how many shots, where an explosion lands). */
const PV = { sk: [0, 0], ult: 0, dash: 0, codes: {}, touch: null, manual: null };
const pvAny = () => !!(PV.sk[0] || PV.sk[1] || PV.ult || PV.dash);
let LOCAL_INP = null;
const MINT = '63,224,197';
const PI = Math.PI;

/* one picture per skill / ultimate: t = shape, sizes in pixels (T = 64 per tile) */
const R = (t, o) => Object.assign({ t }, o);
const PVS = {
  'sword:1': R('dash', { len: 448, w: 50 }), 'sword:2': R('dashEnd', { len: 256, r: 70, over: 1 }), 'sword:3': R('self', { r: 118 }), 'sword:5': R('dash', { len: 256, w: 40 }), 'sword:u': R('ground', { max: 6 * T, r: 80 }),
  'pistol:2': R('line', { len: 576, w: 26 }), 'pistol:5': R('line', { len: 704, w: 28 }), 'pistol:u': R('line', { len: 704, w: 50 }),
  'bow:1': R('line', { len: 512, w: 26 }), 'bow:2': R('ground', { max: 512, r: 110 }), 'bow:3': R('lob', { len: 576, r: 70 }), 'bow:4': R('lineTo', { max: 512, r: 26 }), 'bow:5': R('line', { len: 576, w: 26, dots: 3 }), 'bow:u': R('fan', { len: 576, half: .15, n: 3 }),
  'bat:1': R('self', { r: 90 }), 'bat:2': R('line', { len: 512, w: 26 }), 'bat:3': R('dash', { len: 410, w: 44 }),
  'shuriken:1': R('dash', { len: 192, w: 30 }), 'shuriken:2': R('fan', { len: 384, half: .25, n: 5 }), 'shuriken:3': R('fan', { len: 320, half: .55, n: 5 }), 'shuriken:4': R('line', { len: 512, w: 26 }), 'shuriken:u': R('line', { len: 576, w: 26 }),
  'shotgun:1': R('self', { r: 120 }), 'shotgun:2': R('line', { len: 384, w: 36 }), 'shotgun:3': R('fan', { len: 422, half: .14, n: 5 }), 'shotgun:u': R('fan', { len: 352, half: .25, n: 5 }),
  'rifle:u': R('ground', { max: 12 * T, r: 130 }), 'rifle:1': R('pts', { pts: [[44, 1.2], [44, -1.2]], r: 26 }), 'rifle:2': R('ground', { max: 448, r: 80 }), 'rifle:4': R('ground', { max: 576, r: 66 }), 'rifle:5': R('self', { r: 110 }),
  'smg:1': R('ground', { max: 448, r: 100 }), 'smg:2': R('ground', { max: 448, r: 120 }), 'smg:3': R('dash', { len: 141, w: 44 }), 'smg:5': R('ground', { max: 448, r: 90 }), 'smg:u': R('wall', { d: 102, w: 192, th: 64 }),
  'gloves:1': R('arc', { len: 90, half: 1.2 }), 'gloves:3': R('arc', { len: 80, half: 1 }), 'gloves:4': R('arc', { len: 90, half: 1.4 }), 'gloves:5': R('dash', { len: 192, w: 44 }), 'gloves:u': R('self', { r: 110 }),
  'portalgun:1': R('ring'), 'portalgun:2': R('ground', { max: 320, r: 40 }), 'portalgun:3': R('bounce', { len: 1024, n: 6, w: 24 }), 'portalgun:4': R('ground', { max: 384, r: 95 }), 'portalgun:5': R('ring'), 'portalgun:u': R('ground', { max: 576, r: 34 }),
  'grenade:1': R('dashEnd', { len: 192, r: 90, over: 1 }), 'grenade:5': R('ground', { max: 448, r: 90 }), 'grenade:2': R('fan2', { len: 320, half: .175, n: 2, over: 1 }), 'grenade:3': R('line', { len: 384, w: 26 }), 'grenade:4': R('ground', { max: 448, r: 100 }), 'grenade:u': R('fan', { over: 1, len: 384, half: .5, n: 5 }),
  'bazooka:1': R('line', { len: 512, w: 28 }), 'bazooka:2': R('lob', { len: 512, r: 40 }), 'bazooka:3': R('lob', { len: 512, r: 80 }), 'bazooka:4': R('lob', { len: 512, r: 80 }), 'bazooka:u': R('line', { len: 640, w: 28 }),
  'dagger:1': R('self', { r: 384, faint: 1 }), 'dagger:2': R('dash', { len: 717, w: 60 }), 'dagger:4': R('dash', { len: 205, w: 44, back: 1 }),
  'dracula:2': R('dash', { len: 256, w: 60 }),
  'wizard:1': R('self', { r: 130 }), 'wizard:2': R('line', { len: 512, w: 44, over: 1 }), 'wizard:3': R('line', { len: 512, w: 26, over: 1 }), 'wizard:4': R('line', { len: 512, w: 64, over: 1 }), 'wizard:5': R('self', { r: 54 }), 'wizard:u': R('self', { r: 198 }),
  'magiccard:1': R('line', { len: 448, w: 26 }), 'magiccard:3': R('dash', { len: 352, w: 30 }), 'magiccard:5': R('fan', { len: 492, half: .15, n: 3 }), 'magiccard:u': R('self', { r: 512, faint: 1 }),
  'gambler:2': R('line', { len: 576, w: 30 }), 'gambler:3': R('pts', { pts: [[60, 0]], r: 22 }),
  'boomerang:1': R('self', { r: 160 }), 'boomerang:u': R('fan', { len: 416, half: .5, n: 5 }),
  'flamethrower:1': R('dash', { len: 269, w: 44 }), 'flamethrower:2': R('ground', { max: 384, r: 70 }), 'flamethrower:u': R('arc', { len: 64, half: 1.1 }),
  'vacuum:1': R('self', { r: 198 }), 'vacuum:2': R('self', { r: 130 }), 'vacuum:u': R('arc', { len: 145, half: .6 }),
  'pirate:1': R('dash', { len: 384, w: 44 }), 'pirate:2': R('ground', { max: 448, r: 85 }),
  'samurai:1': R('dash', { len: 258, w: 34 }), 'samurai:3': R('arc', { len: 163, half: 1.2 }), 'samurai:u': R('self', { r: 416, faint: 1 }),
  'harald:2': R('arc', { len: 100, half: .9 }), 'harald:3': R('self', { r: 120 }), 'harald:4': R('arc', { len: 64, half: 1.25 }), 'harald:5': R('dashEnd', { len: 128, r: 100 }), 'harald:u': R('dash', { len: 448, w: 50 }),
  'horemheb:1': R('line', { len: 512, w: 40 }), 'horemheb:3': R('self', { r: 120 }), 'horemheb:5': R('fan', { len: 384, half: .35, n: 5 }), 'horemheb:u': R('line', { len: 576, w: 140 }),
  'pizarro:2': R('line', { len: 448, w: 34 }), 'pizarro:3': R('line', { len: 704, w: 14 }), 'pizarro:4': R('self', { r: 220 }), 'pizarro:5': R('ground', { max: 448, r: 80 }),
  'edward:3': R('line', { len: 576, w: 18 }),
  'medium:3': R('self', { r: 130 }),
  'plague:3': R('ground', { max: 384, r: 90 }), 'plague:4': R('ground', { max: 384, r: 90 }),
  'dragonslayer:2': R('arc', { len: 64, half: 1.3 }), 'dragonslayer:3': R('arc', { len: 80, half: 1.2 }), 'dragonslayer:4': R('line', { len: 448, w: 30 }),
  'shade:1': R('line', { len: 448, w: 40 }), 'shade:2': R('dash', { len: 256, w: 44 }), 'shade:4': R('arc', { len: 140, half: .8 }), 'shade:u': R('line', { len: 372, w: 124 }),
  'kadas:1': R('line', { len: 320, w: 26 }), 'kadas:2': R('dash', { len: 192, w: 40 }), 'kadas:4': R('line', { len: 512, w: 30 }), 'kadas:5': R('self', { r: 70 }), 'kadas:u': R('ground', { max: 448, r: 80 }),
  'kan:1': R('ground', { max: 480, r: 30 }), 'kan:2': R('arc', { len: 90, half: .6 }), 'kan:3': R('line', { len: 576, w: 26 }), 'kan:5': R('dashEnd', { len: 192, r: 80 }),
  'puppeteer:1': R('line', { len: 512, w: 26 }), 'puppeteer:2': R('self', { r: 390, faint: 1 }), 'puppeteer:4': R('line', { len: 512, w: 26 }), 'puppeteer:u': R('line', { len: 512, w: 26 }),
  'tell:1': R('line', { len: 640, w: 26 }), 'tell:2': R('dash', { len: 410, w: 44 }),
  'kurus:1': R('self', { r: 124 }), 'kurus:2': R('line', { len: 704, w: 44 }), 'kurus:3': R('pts', { pts: [[141, 0], [141, PI / 2], [141, PI], [141, -PI / 2]], r: 44 }),
  'cleon:2': R('ground', { max: 512, r: 60 }), 'cleon:5': R('arc', { len: 64, half: 1.1 }), 'cleon:u': R('ground', { max: 576, r: 150 }),
  'pel:3': R('arc', { len: 64, half: 1.1 }),
  'tionis:1': R('line', { len: 384, w: 32 }), 'tionis:4': R('ground', { max: 448, r: 110 }), 'tionis:3': R('line', { len: 384, w: 32 }), 'tionis:5': R('dash', { len: 192, w: 40 }), 'gardener:4': R('ground', { max: 448, r: 90 }), 'gardener:5': R('arc', { len: 180, half: .6 })
};
function pvSpec(f, kind, slot) {       // kind: 's' skill (slot 0/1), 'u' ultimate, 'd' dash
  if (kind === 'd') return R('dash', { len: DASH_D, w: 40 });
  const h = f.h, def = kind === 'u' ? h.ult : f.sk[slot];
  if (!def) return null;
  const key = h.id + ':' + (kind === 'u' ? 'u' : def.n), s = PVS[key];
  if (s) return s;
  const r = def.r || [0, 300], k = kind === 'u' ? 'hit' : def.k;
  if (k === 'move') return R('dash', { len: Math.min(r[1], 8 * T), w: 44 });
  if (k === 'buff') return R('ring', {});
  if (r[0] === 0 && r[1] <= 200) return R('self', { r: Math.max(60, r[1]) });
  if (r[0] === 0 && r[1] > 560) return R('ring', {});
  return R('line', { len: Math.min(r[1], 9 * T), w: 26 });
}

/* the normal attack, by weapon */
function basicSpec(f) {
  const h = f.h, w = h.w || {};
  if (h.type === 'melee') return w.thrust ? R('rect', { len: h.range, w: 38 }) : R('arc', { len: h.range, half: h.half, ticks: 1 });
  if (h.type === 'flame') return R('arc', { len: h.range, half: h.half, flame: 1 });
  if (h.type === 'cone') return R('arc', { len: h.range, half: h.half, suck: 1 });
  if (h.id === 'tell') return R('line', { len: h.range * (.4 + .6 * (f.st.g || 0)), w: 26 });
  if (h.id === 'pel') return R('multi', { len: h.range, n: Math.max(1, f.st.dr || 1), w: 22 });
  if (w.bounces) return R('bounce', { len: h.range, n: w.bounces, w: 14 });      // 차원 여행자: the path with its wall bounces
  if (h.boom) return R('boom', { len: h.range, w: 26 });
  if (h.splash) return R('lob', { len: h.range * (w.shape === 'bomb' || h.wallPass ? bombFrac(f) : 1), r: h.splash, over: h.w && (h.w.shape === 'bomb' || h.wallPass) ? 1 : 0 });      // over: thrown bombs fly over walls
  if (h.count > 1) return R('fan', { len: h.range, half: h.fan / 2, n: h.count });
  if (h.burst > 1) return R('line', { len: h.range, w: 26, dots: h.burst });
  return R('line', { len: h.range, w: 26, over: h.wallPass ? 1 : 0 });
}

function rayLen(x, y, a, max, blk) {      // how far a ray from (x, y) goes before a wall
  const ax = Math.cos(a), ay = Math.sin(a);
  let d = 24;
  for (; d < max; d += 8) if ((blk || solidAt)(x + ax * d, y + ay * d)) break;
  return Math.min(d, max);
}
function capsule(x, y, a, d0, d1, w) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(a);
  ctx.beginPath(); ctx.roundRect(d0, -w / 2, Math.max(2, d1 - d0), w, Math.min(w / 2, 14)); ctx.fill(); ctx.stroke(); ctx.restore();
}
function sector(x, y, a, len, half) { ctx.beginPath(); ctx.moveTo(x, y); ctx.arc(x, y, len, a - half, a + half); ctx.closePath(); ctx.fill(); ctx.stroke(); }
function circle(x, y, r) { ctx.beginPath(); ctx.arc(x, y, r, 0, 6.3); ctx.fill(); ctx.stroke(); }
function arrowHead(x, y, a, s) { ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.beginPath(); ctx.moveTo(s, 0); ctx.lineTo(-s * .6, -s * .8); ctx.lineTo(-s * .6, s * .8); ctx.closePath(); ctx.fillStyle = ctx.strokeStyle; ctx.fill(); ctx.restore(); }

/* draws one picture for the fighter f, aimed at (tx, ty) / angle a. col is the base colour 'r,g,b' */
function drawSpec(f, s, a, tx, ty, col, ready, move) {
  if (!s || s.t === 'none') return;
  const x = f.x, y = f.y + BODY, al = ready ? 1 : .45;
  ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.fillStyle = 'rgba(' + col + ',' + (.2 * al) + ')'; ctx.strokeStyle = 'rgba(' + col + ',' + (.75 * al) + ')'; ctx.lineWidth = 2;
  if (!ready) ctx.setLineDash([6, 6]);
  const ang = s.back ? a + PI : a;
  switch (s.t) {
    case 'ring': ctx.beginPath(); ctx.arc(f.x, f.y + 16, 46, 0, 6.3); ctx.fill(); ctx.stroke(); break;
    case 'self': if (s.faint) ctx.fillStyle = 'rgba(' + col + ',' + (.07 * al) + ')'; circle(f.x, f.y + 4, s.r); break;
    case 'line': case 'rect': {
      const d = s.t === 'rect' || s.over ? s.len : rayLen(x, y, a, s.len);
      capsule(x, y, a, 20, d, s.w);
      if (s.dots) { ctx.fillStyle = ctx.strokeStyle; for (let i = 1; i <= s.dots; i++) { ctx.beginPath(); ctx.arc(x + Math.cos(a) * (20 + (d - 20) * i / (s.dots + 1)), y + Math.sin(a) * (20 + (d - 20) * i / (s.dots + 1)), 3, 0, 6.3); ctx.fill(); } }
      if (s.t === 'rect') arrowHead(x + Math.cos(a) * d, y + Math.sin(a) * d, a, 9);
      break;
    }
    case 'multi': { const n = s.n, d = rayLen(x, y, a, s.len); for (let i = 0; i < n; i++) { const off = (i - (n - 1) / 2) * 16, nx = -Math.sin(a) * off, ny = Math.cos(a) * off; ctx.save(); ctx.translate(nx, ny); capsule(x, y, a, 20, d, 8); ctx.restore(); } break; }
    case 'boom': { const d = rayLen(x, y, a, s.len), c = Math.cos(a), sn = Math.sin(a); ctx.save(); ctx.translate(x + c * (20 + d) / 2, y + sn * (20 + d) / 2); ctx.rotate(a); ctx.beginPath(); ctx.ellipse(0, 0, (d - 20) / 2, s.w * .7, 0, 0, 6.3); ctx.fill(); ctx.stroke(); ctx.restore(); break; }
    case 'arc': {
      sector(x, y, a, s.len, s.half);
      if (s.ticks) { ctx.beginPath(); ctx.arc(x, y, s.len, a - s.half, a + s.half); ctx.lineWidth = 4; ctx.stroke(); }
      if (s.flame) { ctx.setLineDash([4, 6]); ctx.beginPath(); ctx.arc(x, y, s.len * .55, a - s.half, a + s.half); ctx.stroke(); }
      if (s.suck) { for (const k of [.45, .75]) { const rr = s.len * k; ctx.beginPath(); ctx.arc(x, y, rr, a - s.half * .8, a + s.half * .8); ctx.stroke(); arrowHead(x + Math.cos(a) * rr, y + Math.sin(a) * rr, a + PI, 7); } }
      break;
    }
    case 'fan': case 'fan2': {
      for (const o of (s.t === 'fan2' ? [0, PI] : [0])) {
        const aa = a + o, d = s.over ? s.len : Math.min(s.len, rayLen(x, y, aa, s.len) + 40);
        sector(x, y, aa, d, s.half);
        ctx.beginPath(); for (let i = 0; i < s.n; i++) { const t = s.n === 1 ? 0 : (i / (s.n - 1) - .5) * 2 * s.half; ctx.moveTo(x + Math.cos(aa + t) * 24, y + Math.sin(aa + t) * 24); ctx.lineTo(x + Math.cos(aa + t) * d, y + Math.sin(aa + t) * d); } ctx.stroke();
      }
      break;
    }
    case 'bounce': {      // a ray that mirrors off walls like the shot does (same rule as updateBullets)
      let px = x, py = y, vx = Math.cos(a), vy = Math.sin(a), left = s.len, n = s.n; const st = 8;
      ctx.beginPath(); ctx.moveTo(px + vx * 20, py + vy * 20); ctx.lineWidth = s.w; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      const sw = ctx.strokeStyle; ctx.strokeStyle = ctx.fillStyle; const marks = [];
      for (let d = 20; d < left; d += st) {
        const nx = px + vx * st, ny = py + vy * st;
        if (solidAt(nx, ny)) { if (n <= 0) break; const hx = solidAt(nx, py), hy = solidAt(px, ny); if (hx || !hy) vx = -vx; if (hy || !hx) vy = -vy; n--; marks.push([px, py]); ctx.lineTo(px, py); continue; }
        px = nx; py = ny;
      }
      ctx.lineTo(px, py); ctx.stroke(); ctx.strokeStyle = sw; ctx.lineWidth = 2;
      for (const m of marks) { ctx.beginPath(); ctx.arc(m[0], m[1], 7, 0, 6.3); ctx.stroke(); }
      break;
    }
    case 'lob': { const d = s.over ? s.len : rayLen(x, y, a, s.len); capsule(x, y, a, 20, d, 10); circle(x + Math.cos(a) * d, y + Math.sin(a) * d, s.r); break; }
    case 'lineTo': { const dd = Math.min(s.max, Math.hypot(tx - f.x, ty - y)), d = rayLen(x, y, a, Math.max(40, dd)); capsule(x, y, a, 20, d, 12); circle(x + Math.cos(a) * d, y + Math.sin(a) * d, s.r); break; }
    case 'ground': {
      let dx = tx - f.x, dy = ty - (f.y + BODY); const d = Math.hypot(dx, dy) || 1, m = Math.min(d, s.max);
      const gx = clamp(f.x + dx / d * m, T * 1.2, WW - T * 1.2), gy = clamp(y + dy / d * m, T * 1.2, WH - T * 1.2);
      ctx.save(); ctx.setLineDash([4, 8]); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(gx, gy); ctx.stroke(); ctx.restore();
      ctx.beginPath(); ctx.arc(f.x, f.y + 4, s.max, 0, 6.3); ctx.save(); ctx.globalAlpha = .35; ctx.setLineDash([2, 10]); ctx.stroke(); ctx.restore(); ctx.beginPath();
      circle(gx, gy, s.r); break;
    }
    case 'dash': case 'dashEnd': {
      const mvAng = move ? Math.atan2(move[1], move[0]) : a, aa = s.back ? mvAng + PI : mvAng;
      let d = Math.min(s.len, rayLen(f.x, f.y + 4, aa, s.len, blockedAt));
      if (s.over) {      // a leap over walls: where it really lands (same rule as moveFighter with fly 2 + leapLand)
        const ax = Math.cos(aa), ay = Math.sin(aa), edge = (x, y) => arenaEdge(Math.floor(x / T), Math.floor(y / T)), free = (x, y) => ![[-16, -16], [16, -16], [-16, 16], [16, 16], [0, 0]].some(([ox, oy]) => blockedAt(x + ox, y + oy));
        d = 0; while (d < s.len && !edge(f.x + ax * (d + 22), f.y + ay * (d + 22))) d += 4;
        if (!free(f.x + ax * d, f.y + ay * d)) for (let k = T / 4; k <= 3 * T; k += T / 4) if (free(f.x + ax * (d + k), f.y + ay * (d + k))) { d += k; break; }
        ctx.save(); ctx.setLineDash([6, 8]); ctx.beginPath(); ctx.moveTo(f.x, f.y + 4); ctx.lineTo(f.x + ax * d, f.y + 4 + ay * d); ctx.stroke(); ctx.restore();
        circle(f.x + ax * d, f.y + 4 + ay * d, s.r); ctx.beginPath(); ctx.arc(f.x + ax * d, f.y + 4 + ay * d, 6, 0, 6.3); ctx.fill(); break;
      }
      capsule(f.x, f.y + 4, aa, 0, d, s.w);
      arrowHead(f.x + Math.cos(aa) * d, f.y + 4 + Math.sin(aa) * d, aa, 11);
      if (s.t === 'dashEnd') circle(f.x + Math.cos(aa) * d, f.y + 4 + Math.sin(aa) * d, s.r);
      break;
    }
    case 'pts': for (const [d, o] of s.pts) circle(x + Math.cos(a + o) * d, y + Math.sin(a + o) * d, s.r); break;
    case 'wall': { const cx = x + Math.cos(a) * s.d, cy = y + Math.sin(a) * s.d; ctx.save(); ctx.translate(cx, cy); ctx.rotate(a); ctx.beginPath(); ctx.roundRect(-s.th / 2, -s.w / 2, s.th, s.w, 6); ctx.fill(); ctx.stroke(); ctx.restore(); break; }
  }
  ctx.restore();
}

/* what is drawn each frame for the player this screen drives */
function drawPreviews(f) {
  if (!f || f.dead || f.form === 'gone' || f.form === 'sub') return;
  const inp = LOCAL_INP, a = (touchMode && !(PV.touch && PV.touch.moved) && pvAny()) ? autoAim(f) : f.aim, tx = f.tx != null ? f.tx : f.x + Math.cos(a) * 200, ty = f.ty != null ? f.ty : f.y + Math.sin(a) * 200;
  const cancel = PV.touch && PV.touch.cancel;
  let any = false;
  const mv = inp && Math.hypot(inp.mx, inp.my) > .15 ? [inp.mx, inp.my] : null;
  if (PV.dash) { drawSpec(f, pvSpec(f, 'd'), a, tx, ty, cancel ? '255,93,93' : MINT, f.dcd <= 0, mv || [Math.cos(a), Math.sin(a)]); any = true; }
  for (let i = 0; i < 2; i++) if (PV.sk[i] && f.sk[i]) { drawSpec(f, pvSpec(f, 's', i), a, tx, ty, cancel ? '255,93,93' : MINT, f.scd[i] <= 0, null); any = true; }
  if (PV.ult) { drawSpec(f, pvSpec(f, 'u'), a, tx, ty, cancel ? '255,93,93' : MINT, f.ucd <= 0, null); any = true; }
  return any;
}
function drawBasicGuide(f) {
  if (f.dead || f.form) return;
  if (touchMode) { if (!stickA || Math.hypot(stickA.dx, stickA.dy) <= .3) return; }      // phone: only while dragging
  else if (!mouse.down) return;      // PC: only while the button is held (release fires)
  drawSpec(f, basicSpec(f), f.aim, 0, 0, '255,255,255', true, null);
}

/* ---- input: press = look, release = fire ---- */
const PV_KEYS = { KeyF: ['s', 0], KeyE: ['s', 1], KeyR: ['u'], Space: ['u'], KeyQ: ['d'], ShiftLeft: ['d'], ShiftRight: ['d'] };
function pvSet(t, v) { if (t[0] === 's') PV.sk[t[1]] = v; else PV[t[0] === 'u' ? 'ult' : 'dash'] = v; }
function pvFire(t) { if (t[0] === 's') wantSk[t[1]] = true; else if (t[0] === 'u') wantUlt = true; else wantDash = true; }
function pvRecount() { PV.sk = [0, 0]; PV.ult = 0; PV.dash = 0; for (const c in PV.codes) if (!PV.codes[c].done) pvSet(PV.codes[c].t, 1); if (PV.touch) pvSet(PV.touch.t, 1); }
function pvInstant(t) {       // 기사 '베기' is a timing press: it goes out the moment the key / button goes down (on release the bar would already have moved on)
  const f = typeof driven === 'function' ? driven() : player;
  if (state !== 'play' || t[0] !== 's' || !f || f.dead || !f.st || !f.st.neck || !f.sk || !f.sk[t[1]] || !f.sk[t[1]].neck) return false;
  const ph = ((time - f.st.neck) * 1.8) % 2; neckNp = ph < 1 ? ph : 2 - ph; wantSk[t[1]] = true; return true;
}
function pvKeyDown(code) {
  const t = PV_KEYS[code]; if (!t || PV.codes[code]) return false;
  if (pvInstant(t)) { PV.codes[code] = { t, cancel: true, done: true }; return true; }
  PV.codes[code] = { t, cancel: false }; pvRecount(); return true;
}
function pvKeyUp(code) {
  const c = PV.codes[code]; if (!c) return;
  delete PV.codes[code];
  if (!c.cancel && state === 'play') pvFire(c.t);
  pvRecount();
}
function pvCancelAll() { for (const c in PV.codes) PV.codes[c].cancel = true; if (PV.touch) PV.touch.cancel = true; }
function pvClear() { PV.codes = {}; PV.touch = null; PV.manual = null; pvRecount(); }
/* touch: a skill button held down looks, dragging aims (far away cancels), letting go fires */
function pvTouchStart(t, btn, e) {
  if (pvInstant(t)) return;
  PV.touch = { t, btn, id: e.pointerId, ox: e.clientX, oy: e.clientY, dx: 0, dy: 0, moved: false, cancel: false };
  try { btn.setPointerCapture(e.pointerId); } catch (er) {}
  pvRecount();
}
function pvTouchMove(e) {
  const p = PV.touch; if (!p || p.id !== e.pointerId) return;
  const dx = e.clientX - p.ox, dy = e.clientY - p.oy, m = Math.hypot(dx, dy);
  p.moved = m > 14; p.dx = dx; p.dy = dy; p.cancel = m > 190;
}
function pvTouchEnd(e) {
  const p = PV.touch; if (!p || p.id !== e.pointerId) return;
  PV.touch = null;
  if (e.type === 'pointerup' && !p.cancel && state === 'play') {
    if (p.moved) { const m = Math.hypot(p.dx, p.dy), a = Math.atan2(p.dy, p.dx), far = clamp(m / 120, .2, 1.4) * 8 * T; PV.manual = { aim: a, dist: far }; }
    pvFire(p.t);
  }
  pvRecount();
}
function pvOverride(f, inp) {       // called from readLocal: a drag on a touch button points the skill
  const p = PV.touch, mn = PV.manual;
  if (p && p.moved) { inp.aim = Math.atan2(p.dy, p.dx); const far = clamp(Math.hypot(p.dx, p.dy) / 120, .2, 1.4) * 8 * T; inp.tx = f.x + Math.cos(inp.aim) * far; inp.ty = f.y + BODY + Math.sin(inp.aim) * far; }
  if (mn) { inp.aim = mn.aim; inp.tx = f.x + Math.cos(mn.aim) * mn.dist; inp.ty = f.y + BODY + Math.sin(mn.aim) * mn.dist; inp.manual = true; PV.manual = null; }
}

/* events that guests replay (fxPlay → 'x'): who killed me and with what, sand wind */
FXF.killinfo = (vi, ki, src) => { const v = fighters[vi]; if (v) v.killer = { i: ki, src }; };
FXF.gale = (d, a) => { GALE.until = time + d; GALE.dur = d; GALE.ang = a; };
