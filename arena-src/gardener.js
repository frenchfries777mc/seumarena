/* ===== 정원사 (gardener): new character (mockup approved 2026-11-12) =====
   Kit: seed slingshot that leaves slowing sprouts, planted bushes (tile 'G'), thorn vines, a sunflower turret, forest burst ultimate.
   Planted bushes are real map tiles: the host turns floor tiles into 'G' for a while (bushAt() treats 'G' like 'g'), bumps NET.mapVer
   so guests get the new map rows, and puts the floor back when they wither. Everything drawn here is called from small hooks in
   tail.js (drawStick, drawTiles, drawMinion, render) and fx.js (drawZoneArt). Loaded after preview.js (build.js). */
WEAPONS.gardener = { id: 'gardener', name: '새총', kind: 'gun', dmg: 24, cd: .55, bulletSpeed: 900, life: .85, shape: 'seed',
  desc: '씨앗을 쏘는 Y자 나무 새총' };
const GD = { plants: new Map(), seen: new Map(), fx: [] };      // plants: "c,r" -> { orig, until, map } (host) · seen: when a 'G' tile first showed up here (grow animation)
const plantAt = (x, y) => tileAt(x, y) === 'G';

/* ---------- planted bushes (host) ---------- */
function gdPlant(cells, dur) {
  let n = 0;
  for (const [c, r] of cells) {
    if (arenaEdge(c, r) || c < 0 || r < 0 || c >= COLS || r >= ROWS) continue;
    const k = c + ',' + r, cur = MAP[r][c], e = GD.plants.get(k);
    if (cur === 'G' && e && e.map === MAP) { e.until = Math.max(e.until, time + dur); n++; continue; }
    if (cur !== '.') continue;      // walls, water, lava, vents, pads, ice and the map's own bushes stay as they are
    if (tempWalls.size && tempWalls.get(c + r * COLS) > time) continue;
    GD.plants.set(k, { orig: cur, until: time + dur, map: MAP, c, r }); MAP[r][c] = 'G'; n++;
  }
  if (n) NET.mapVer++;
  return n;
}
function gdUnplant(keys) { for (const k of keys) { const e = GD.plants.get(k); if (e) e.until = Math.min(e.until, time); } }
function gardenStep() {       // engine.js step(): wither planted bushes (time up, map changed, or outside the 원 레프트 safe zone)
  if (!GD.plants.size) return;
  let changed = false;
  for (const [k, e] of GD.plants) {
    const x = (e.c + .5) * T, y = (e.r + .5) * T, out = SZ.on && Math.hypot(x - SZ.x, y - SZ.y) > SZ.r;
    if (e.map !== MAP) { GD.plants.delete(k); continue; }
    if (e.until > time && !out) continue;
    if (MAP[e.r][e.c] === 'G') { MAP[e.r][e.c] = e.orig; changed = true; if (Math.random() < .5) fxPlay('garden', 'leaves', Math.round(x), Math.round(y), 3); }
    GD.plants.delete(k);
  }
  if (changed) NET.mapVer++;
}
const cellsAround = (x, y, n) => { const c0 = Math.round(x / T - n / 2), r0 = Math.round(y / T - n / 2), out = []; for (let r = r0; r < r0 + n; r++) for (let c = c0; c < c0 + n; c++) out.push([c, r]); return out; };
const cellsInCircle = (x, y, rad) => { const out = []; for (let r = Math.floor((y - rad) / T); r <= Math.floor((y + rad) / T); r++) for (let c = Math.floor((x - rad) / T); c <= Math.floor((x + rad) / T); c++) if (Math.hypot((c + .5) * T - x, (r + .5) * T - y) <= rad) out.push([c, r]); return out; };

/* ---------- sprouts (basic attack) ---------- */
function gdSprout(f, x, y) {
  if (blockedAt(x, y) || x < T || y < T || x > WW - T || y > WH - T) return;
  const mine = zones.filter(z => z.kind === 'sprout' && z.by === f);
  if (mine.length >= 6) mine[0].dead = true;
  if (mine.some(z => !z.dead && Math.hypot(z.x - x, z.y - y) < 30)) return;      // sprouts do not pile up on one spot
  zone({ by: f, x, y, r: 22, t: 3, col: '#7be05a', op: 0, kind: 'sprout', fn: z => { for (const e of foes(f)) if (!e.minion && inZone(z, e)) buff(e, 'slow', .2, .9); } });
}

/* ---------- the kit ---------- */
hero('gardener', { p: ['초록 손', '내가 심은 덤불(덤불 심기, 숲 폭발) 안에서는 이동속도 15% 증가, 공격해도 0.4초만 모습이 드러남 (원래 풀숲은 0.8초) · 씨앗이 떨어진 자리에 새싹이 3초 동안 남아 밟은 상대가 10% 느려짐'],
  spd: f => plantAt(f.x, f.y) ? 1.15 : 1,
  reveal: f => plantAt(f.x, f.y) ? .4 : .8,
  pre(f, o) { o.onEnd = b => gdSprout(f, b.x, b.y - BODY); return o; },
  ult: ['숲 폭발', '내 주변 반지름 4칸이 7초 동안 덤불로 바뀜 · 펼쳐지는 순간 그 안의 상대는 넝쿨에 1초 속박되고 600 피해 · 덤불 안의 상대는 아주 가까이 가야만 보임', [0, 3.5 * T], f => {
    const x = f.x, y = f.y; gdPlant(cellsInCircle(x, y, 4 * T), 7);
    fxPlay('garden', 'forest', Math.round(x), Math.round(y), 4 * T);
    circ(f, x, y, 4 * T, 60, { root: 1, kb: 0 });
  }],
  skills: [
    [1, '덤불 심기', 'buff', '조준한 곳(최대 5칸)에 2×2칸 덤불이 6초 동안 자라남 · 일반 풀숲처럼 숨을 수 있음 · 덤불은 2개까지 (3번째를 심으면 가장 오래된 덤불이 시듦) · 벽, 물, 용암 위에는 자라지 않음', [0, 6 * T], (f, a) => {
      const p = aimPt(f, 5 * T), cells = cellsAround(p.x, p.y, 2), keys = cells.map(([c, r]) => c + ',' + r);
      const list = f.st.bush || (f.st.bush = []);
      for (let i = list.length - 1; i >= 0; i--) if (!list[i].some(k => GD.plants.has(k))) list.splice(i, 1);
      while (list.length >= 2) gdUnplant(list.shift());
      if (!gdPlant(cells, 6)) return false;
      list.push(keys);
      fxPlay('garden', 'grow', Math.round(p.x), Math.round(p.y), 2);
    }, { ok: (f, e, d) => d < 7 * T }],
    [2, '가시 넝쿨', 'hit', '조준 방향으로 4칸 길이의 가시 넝쿨을 깔아 4초 동안 남김 · 밟은 상대는 초당 150 피해와 30% 둔화 · 처음 닿으면 0.5초 속박 (벽에서 멈춤, 1스킬 칸에서는 쿨타임 9초)', [0, 4.5 * T], (f, a) => {
      const S = { hit: new Set(), acc: new Map(), at: new Map() }, n = 5, gap = .82 * T;
      for (let i = 0; i < n; i++) {
        const d = .55 * T + i * gap, x = f.x + Math.cos(a) * d, y = f.y + Math.sin(a) * d;
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
    }, { cd1: 9 }],
    [3, '해바라기 포탑', 'buff', '조준한 곳(최대 2.5칸)에 체력 900짜리 해바라기를 심음 · 6초 동안 5칸 안의 가장 가까운 상대에게 씨앗을 쏨 (발당 100) · 근처(2칸) 아군은 초당 체력 30 회복 · 부서지면 꽃가루가 터져 주변 상대가 1초 동안 앞이 흐려짐 (1스킬 칸에서도 쿨타임 10초)', [0, 7 * T], (f, a) => {
      let p = aimPt(f, 2.5 * T); if (blockedAt(p.x, p.y)) p = { x: f.x, y: f.y };
      for (const m of minions) if (m.kind === 'sunflower' && m.by === f) { m.t = 0; m.gone = 1; }
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
    }, { cd1: 10 }]
  ] });
HEROES.gardener.name = '정원사';
HEROES.gardener.hp = 540 * STAT_X;
HEROES.gardener.xm = 1;
if (!ACTIVE_HEROES.includes('gardener')) ACTIVE_HEROES.push('gardener');
Object.assign(PVS, {
  'gardener:1': R('ground', { max: 5 * T, r: 64 }),
  'gardener:2': R('line', { len: 4.3 * T, w: 30 }),
  'gardener:3': R('ground', { max: 2.5 * T, r: 2.2 * T }),
  'gardener:u': R('self', { r: 4 * T })
});

/* ================= art ================= */
const GD_OUT = '#2a1a0c';
function gdLeaf(c, x, y, len, rot, fill, edge) {
  c.save(); c.translate(x, y); c.rotate(rot);
  c.fillStyle = fill; c.strokeStyle = edge || '#2c6e22'; c.lineWidth = Math.max(.8, len * .12);
  c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(len * .5, -len * .42, len, 0); c.quadraticCurveTo(len * .5, len * .42, 0, 0); c.closePath(); c.fill(); c.stroke();
  c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = Math.max(.5, len * .06); c.beginPath(); c.moveTo(len * .1, 0); c.lineTo(len * .8, 0); c.stroke();
  c.restore();
}
/* the character: straw hat with a sprout, Y slingshot, seed pouch (drawStick coordinates: feet at 0, head centre HEADCY) */
function drawGardener(c, o) {
  const { face, ax, ay, hx, hy, swing, t, HEADCY, HEADR: R0, HIP } = o;
  const ln = (pts, col, lw) => { c.strokeStyle = col; c.lineWidth = lw; c.beginPath(); c.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]); c.stroke(); };
  c.lineCap = 'round'; c.lineJoin = 'round';
  ln([-5, HIP - 3, 5, HIP - 3], '#6b4320', 2.4);
  c.save(); c.translate(-face * 5.5, HIP + 2); c.scale(.78, .78);
  c.fillStyle = '#a7703a'; c.strokeStyle = GD_OUT; c.lineWidth = 1.4;
  c.beginPath(); c.moveTo(-4.5, -4); c.bezierCurveTo(-7.5, 3, -4, 7.5, 0, 7.5); c.bezierCurveTo(4, 7.5, 7.5, 3, 4.5, -4); c.closePath(); c.fill(); c.stroke();
  c.fillStyle = '#d6a560'; c.beginPath(); c.roundRect(-5.2, -6.2, 10.4, 3, 1.4); c.fill(); c.stroke();
  c.fillStyle = '#ffe08a'; for (const [sx, sy] of [[-1.8, -6.6], [.6, -7.2], [2.6, -6.4]]) { c.beginPath(); c.ellipse(sx, sy, 1.3, 1, .4, 0, 7); c.fill(); }
  c.fillStyle = '#6fd64a'; c.beginPath(); c.arc(-1.5, 2.5, 1.1, 0, 7); c.arc(1.8, .5, 1, 0, 7); c.fill();
  c.restore();
  const a = Math.atan2(ay, ax), pull = swing > 0 ? Math.max(0, Math.sin(Math.min(1, swing) * Math.PI)) : 0;
  c.save(); c.translate(hx, hy); c.rotate(a);
  for (const pass of [0, 1]) {
    c.strokeStyle = pass ? '#b8793c' : GD_OUT; c.lineWidth = pass ? 2.6 : 4.8;
    for (const [x0, y0, x1, y1, x2, y2] of [[-4, 0, 5, 0, 5, 0], [5, 0, 9, -6, 15, -6.5], [5, 0, 9, 6, 15, 6.5]]) { c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.lineTo(x2, y2); c.stroke(); }
  }
  c.fillStyle = '#6b4320'; c.fillRect(-1.5, -1.6, 4, 3.2);
  const bx = 14 - pull * 16;
  c.strokeStyle = '#e0584a'; c.lineWidth = 1.3; c.beginPath(); c.moveTo(15, -6.5); c.lineTo(bx, 0); c.lineTo(15, 6.5); c.stroke();
  c.fillStyle = '#7a4a22'; c.beginPath(); c.ellipse(bx, 0, 2.2, 2.8, 0, 0, 7); c.fill();
  if (pull > .15) { c.fillStyle = '#e9c46a'; c.beginPath(); c.ellipse(bx + 1, 0, 2, 1.5, 0, 0, 7); c.fill(); }
  c.restore();
  const by = HEADCY - R0 * .45;
  c.fillStyle = 'rgba(0,0,0,.22)'; c.beginPath(); c.ellipse(0, by + 2.6, R0 * 1.05, 2.4, 0, 0, 7); c.fill();
  c.fillStyle = '#f3d27a'; c.strokeStyle = '#7d5a1c'; c.lineWidth = 1.5;
  c.beginPath(); c.ellipse(0, by, R0 * 2.05, R0 * .62, 0, 0, 7); c.fill(); c.stroke();
  c.strokeStyle = 'rgba(160,112,40,.55)'; c.lineWidth = .8;
  for (const k of [.55, .8]) { c.beginPath(); c.ellipse(0, by, R0 * 2.05 * k + 2, R0 * .62 * k + .6, 0, Math.PI * .05, Math.PI * .95); c.stroke(); }
  c.fillStyle = '#f7dc8c'; c.strokeStyle = '#7d5a1c'; c.lineWidth = 1.5;
  c.beginPath(); c.moveTo(-R0 * .98, by - .5); c.bezierCurveTo(-R0, by - R0 * 1.25, R0, by - R0 * 1.25, R0 * .98, by - .5);
  c.quadraticCurveTo(0, by + 2, -R0 * .98, by - .5); c.closePath(); c.fill(); c.stroke();
  c.strokeStyle = '#3f9a3a'; c.lineWidth = 2.6; c.beginPath(); c.moveTo(-R0 * .98, by - 2); c.quadraticCurveTo(0, by + .3, R0 * .98, by - 2); c.stroke();
  c.fillStyle = '#ffd34d'; c.beginPath(); c.arc(face * R0 * .55, by - 1.2, 1.5, 0, 7); c.fill();
  c.save(); c.translate(0, by - R0 * .9); c.rotate(Math.sin(t * 2.4) * .2);
  c.strokeStyle = '#2f7a24'; c.lineWidth = 2.2; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(1, -4, 0, -8); c.stroke();
  c.strokeStyle = '#5cc13d'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(1, -4, 0, -8); c.stroke();
  gdLeaf(c, 0, -7.5, 7.5, -2.6, '#7be05a'); gdLeaf(c, 0, -8, 7.5, -.55, '#6fd64a');
  c.restore();
}
/* a flying seed (basic attack and the sunflower) */
function drawSeedShot(b) {
  ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(b.ang || 0);
  ctx.globalAlpha = .35; ctx.strokeStyle = '#9be36f'; ctx.lineWidth = 3; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-22, 0); ctx.lineTo(-6, 0); ctx.stroke(); ctx.globalAlpha = 1;
  ctx.fillStyle = '#e9c46a'; ctx.strokeStyle = '#6b4320'; ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.ellipse(0, 0, 6.5, 4.4, 0, 0, 7); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = '#b5862f'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-3.5, 0); ctx.lineTo(3.5, 0); ctx.stroke();
  gdLeaf(ctx, -4, -2, 6, -2.6, '#7be05a');
  ctx.restore(); return true;
}
/* a planted bush tile: lighter than the map's own bushes, with flowers, grows in when it appears */
function drawPlantTile(c, cc, r, x, y) {
  const k = cc + ',' + r, now = performance.now();
  let s = GD.seen.get(k); if (s === undefined || now - s.last > 400) { s = { at: s && now - s.last <= 400 ? s.at : now, last: now }; GD.seen.set(k, s); } else s.last = now;
  if (GD.seen.size > 600) for (const [kk, v] of GD.seen) if (now - v.last > 2000) GD.seen.delete(kk);
  const g = Math.min(1, .25 + (now - s.at) / 350 * .75), sd = (cc * 7 + r * 13) % 5;
  c.save(); c.translate(x + T / 2, y + T / 2 - 3); c.scale(g, g); c.translate(-(x + T / 2), -(y + T / 2 - 3));
  c.fillStyle = '#2f9a4e'; c.beginPath(); c.roundRect(x - 3, y - 9, T + 6, T + 6, 18); c.fill();
  c.fillStyle = '#4cc46a'; c.beginPath(); c.arc(x + 18 + sd * 2, y + 12, 15, 0, 6.3); c.arc(x + 46 - sd, y + 26 + sd, 13, 0, 6.3); c.arc(x + 22, y + 42 - sd, 12, 0, 6.3); c.fill();
  for (let i = 0; i < 3; i++) {
    const fx0 = x + 10 + ((cc * 31 + r * 17 + i * 23) % 44), fy = y + 4 + ((cc * 13 + r * 29 + i * 37) % 44);
    c.fillStyle = i % 2 ? '#fff3b0' : '#ffd34d'; for (let p = 0; p < 5; p++) { c.beginPath(); c.arc(fx0 + Math.cos(p * 1.26) * 3, fy + Math.sin(p * 1.26) * 3, 2.3, 0, 7); c.fill(); }
    c.fillStyle = '#c9781e'; c.beginPath(); c.arc(fx0, fy, 1.8, 0, 7); c.fill();
  }
  gdLeaf(c, x + 6, y - 6, 12, -2.2, '#7be05a'); gdLeaf(c, x + T - 4, y + 2, 11, -.6, '#6fd64a');
  c.restore();
}
function gdVinePath(c, pts, grow) {
  const seg = []; let L = 0;
  for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]) || 1; seg.push(d); L += d; }
  const at = s => { for (let i = 0; i < seg.length; i++) { if (s <= seg[i] || i === seg.length - 1) { const k = Math.min(1, s / seg[i]); return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * k, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * k, Math.atan2(pts[i + 1][1] - pts[i][1], pts[i + 1][0] - pts[i][0])]; } s -= seg[i]; } };
  const end = L * grow; if (end < 2) return;
  c.save(); c.lineCap = 'round'; c.lineJoin = 'round';
  c.strokeStyle = 'rgba(60,35,12,.3)'; c.lineWidth = 22; c.beginPath(); for (let s = 0; s <= end; s += 6) { const [x, y] = at(s); s ? c.lineTo(x, y + 3) : c.moveTo(x, y + 3); } c.stroke();
  for (const [ph, col, lw] of [[0, '#1f5a1a', 7], [2.1, '#2f7a24', 6], [0, '#4caf3a', 3.2], [2.1, '#5cc13d', 2.6]]) {
    c.strokeStyle = col; c.lineWidth = lw; c.beginPath();
    for (let s = 0; s <= end; s += 3) { const [x, y, a] = at(s), o = Math.sin((s + pts[0][0]) / 13 + ph) * 5; const px = x - Math.sin(a) * o, py = y + Math.cos(a) * o; s ? c.lineTo(px, py) : c.moveTo(px, py); }
    c.stroke();
  }
  let i = 0;
  for (let s = 8; s <= end; s += 13, i++) {
    const [x, y, a] = at(s), side = i % 2 ? 1 : -1, o = Math.sin((s + pts[0][0]) / 13 + (i % 2 ? 2.1 : 0)) * 5;
    const px = x - Math.sin(a) * o, py = y + Math.cos(a) * o, na = a + side * (Math.PI / 2 - .5);
    c.fillStyle = '#f2ead0'; c.strokeStyle = '#3d2a12'; c.lineWidth = 1;
    c.beginPath(); c.moveTo(px + Math.cos(na + 1.4) * 3, py + Math.sin(na + 1.4) * 3); c.lineTo(px + Math.cos(na) * 9, py + Math.sin(na) * 9); c.lineTo(px + Math.cos(na - 1.4) * 3, py + Math.sin(na - 1.4) * 3); c.closePath(); c.fill(); c.stroke();
    if (i % 3 === 1) gdLeaf(c, px, py, 9, na + .9 * side, '#6fd64a');
  }
  c.restore();
}
function gdSproutArt(c, x, y, s) {
  c.save(); c.translate(x, y); c.scale(s, s);
  c.fillStyle = 'rgba(70,40,15,.45)'; c.beginPath(); c.ellipse(0, 2, 11, 4.5, 0, 0, 7); c.fill();
  c.strokeStyle = '#2f7a24'; c.lineWidth = 2.4; c.lineCap = 'round'; c.beginPath(); c.moveTo(0, 2); c.quadraticCurveTo(1.5, -4, 0, -9); c.stroke();
  gdLeaf(c, 0, -8, 9, -2.7, '#7be05a'); gdLeaf(c, 0, -9, 9, -.45, '#6fd64a');
  c.restore();
}
/* fx.js drawZoneArt asks this first: sprouts and thorn-vine pieces */
function drawGardenZone(z) {
  if (z.kind === 'sprout') {
    const age = 3 - z.t, s = Math.min(1, age / .18) * Math.min(1, z.t / .35);
    if (s > 0) gdSproutArt(ctx, z.x, z.y + 14, s);
    return true;
  }
  if (z.kind !== 'vine') return false;
  const grow = Math.min(1, (4 - z.t) / .3), fade = Math.min(1, z.t / .4);
  const nb = zones.filter(o => o !== z && o.kind === 'vine' && o.team === z.team && Math.hypot(o.x - z.x, o.y - z.y) < 70);
  ctx.save(); ctx.globalAlpha = fade;
  const y0 = z.y + 12;
  if (!nb.length) gdVinePath(ctx, [[z.x - 26, y0], [z.x + 26, y0]], grow);
  for (const o of nb) gdVinePath(ctx, [[z.x, y0], [(z.x + o.x) / 2, (y0 + o.y + 12) / 2]], grow);
  if (nb.length === 1) { const o = nb[0]; gdVinePath(ctx, [[z.x, y0], [z.x - (o.x - z.x) * .45, y0 - (o.y - z.y) * .45]], grow); }
  ctx.restore();
  return true;
}
/* the sunflower turret (tail.js drawMinion, already translated to the minion) */
function drawSunflower(m) {
  const now = time, aim = m.aim || 0, face = Math.cos(aim) >= 0 ? 1 : -1, kick = m.sw != null && now - m.sw < .15 ? 1 - (now - m.sw) / .15 : 0;
  ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.beginPath(); ctx.ellipse(0, 17, 16, 6, 0, 0, 7); ctx.fill();
  ctx.fillStyle = '#6b4320'; ctx.beginPath(); ctx.ellipse(0, 16, 12, 4.5, 0, 0, 7); ctx.fill();
  ctx.strokeStyle = '#1f5a1a'; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, 16); ctx.quadraticCurveTo(3, -4, 0, -22); ctx.stroke();
  ctx.strokeStyle = '#4caf3a'; ctx.lineWidth = 3.4; ctx.beginPath(); ctx.moveTo(0, 16); ctx.quadraticCurveTo(3, -4, 0, -22); ctx.stroke();
  gdLeaf(ctx, 1, 2, 15, -.3, '#6fd64a'); gdLeaf(ctx, 1, -6, 13, -2.8, '#5cc13d');
  ctx.save(); ctx.translate(Math.cos(aim) * kick * 3, -30 + Math.sin(aim) * kick * 2); ctx.rotate(Math.sin(aim) * .25 + Math.sin(now * 2) * .04);
  for (let ring = 0; ring < 2; ring++) for (let p = 0; p < 12; p++) {
    ctx.save(); ctx.rotate(p / 12 * 6.283 + ring * .26);
    ctx.fillStyle = ring ? '#ffd34d' : '#f2a91e'; ctx.strokeStyle = '#a8650f'; ctx.lineWidth = 1.1;
    ctx.beginPath(); ctx.ellipse(13.5, 0, 7.5, 3.9, 0, 0, 7); ctx.fill(); ctx.stroke(); ctx.restore();
  }
  ctx.fillStyle = '#5a3412'; ctx.strokeStyle = '#2a1a0c'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(0, 0, 9, 0, 7); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#8a5a26'; for (let i = 0; i < 12; i++) { const a = i * 2.4, d = Math.sqrt(i / 12) * 7; ctx.beginPath(); ctx.arc(Math.cos(a) * d, Math.sin(a) * d, 1.1, 0, 7); ctx.fill(); }
  ctx.fillStyle = '#2a1a0c'; ctx.beginPath(); ctx.arc(face * 3.5, 2.5, 2.2 + kick, 0, 7); ctx.fill();
  ctx.restore();
}
/* the heal circle under the sunflower, for its own side (drawn on the floor by the zones pass would need a zone; drawn here instead) */
function gdAura(m) {
  if (m.team !== VIEW) return;
  ctx.save(); ctx.fillStyle = 'rgba(126,240,168,.08)'; ctx.strokeStyle = 'rgba(126,240,168,.45)'; ctx.lineWidth = 2; ctx.setLineDash([8, 8]);
  ctx.beginPath(); ctx.arc(m.x, m.y + 16, 2.2 * T, 0, 7); ctx.fill(); ctx.stroke(); ctx.restore();
}

/* ---------- effects: leaves, pollen, the forest burst (every screen plays them itself) ---------- */
FXF.garden = (type, x, y, v) => {
  const now = performance.now(), L = GD.fx, n = typeof lowFx === 'function' && lowFx() ? .4 : 1;
  const leaves = (cx, cy, cnt, rad, sp) => { for (let i = 0; i < cnt * n; i++) { const a = Math.random() * 6.283, d = Math.random() * rad, s = (sp || 60) * (.4 + Math.random()); L.push({ k: 'leaf', x: cx + Math.cos(a) * d, y: cy + Math.sin(a) * d * .7, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 40, rot: Math.random() * 6.3, vr: (Math.random() - .5) * 8, len: 6 + Math.random() * 6, col: Math.random() < .5 ? '#7be05a' : '#4cc46a', at: now, life: 700 + Math.random() * 500 }); } };
  const pollen = (cx, cy, cnt, rad) => { for (let i = 0; i < cnt * n; i++) { const a = Math.random() * 6.283, d = Math.random() * rad; L.push({ k: 'pol', x: cx + Math.cos(a) * d, y: cy + Math.sin(a) * d * .8, vx: Math.cos(a) * 30, vy: -20 - Math.random() * 30, r: 1.5 + Math.random() * 2.5, col: Math.random() < .5 ? '#ffe45c' : '#fff3a8', at: now, life: 700 + Math.random() * 700 }); } };
  if (type === 'leaves') leaves(x, y, v || 4, 24, 40);
  else if (type === 'grow') { leaves(x, y, 10 * (v || 1), 40 * (v || 1), 70); pollen(x, y, 6, 40); }
  else if (type === 'vine') leaves(x + Math.cos(v) * 2 * T, y + Math.sin(v) * 2 * T, 12, 1.6 * T, 50);
  else if (type === 'pollen') { pollen(x, y - 20, 40, v || 96); L.push({ k: 'cloud', x, y: y - 10, r: v || 96, at: now, life: 900 }); }
  else if (type === 'forest') { L.push({ k: 'forest', x, y, r: v || 4 * T, at: now, life: 1300, sd: Math.random() * 6 }); leaves(x, y, 40, v || 4 * T, 80); pollen(x, y, 30, v || 4 * T); }
  if (L.length > 500) L.splice(0, L.length - 500);
  if (type !== 'leaves' && typeof sfx === 'function' && fxInView(x, y)) sfx(type === 'pollen' ? 520 : 300, .18, 'triangle', .04, 1.6);
};
function drawGardenTop() {       // tail.js render(): above the fighters
  const now = performance.now(), L = GD.fx;
  for (const m of minions) if (m.kind === 'sunflower') gdAura(m);
  /* fighters held by thorns: a coil of vine round the feet */
  for (const f of fighters) {
    if (f.dead || !B(f, 'root') || !visibleTo(f, VIEW)) continue;
    if (!(plantAt(f.x, f.y) || zones.some(z => z.kind === 'vine' && Math.hypot(z.x - f.x, z.y - f.y) < z.r + 12))) continue;
    ctx.save(); ctx.translate(f.x, f.y + 6); ctx.lineCap = 'round';
    for (const [col, lw] of [['#1f5a1a', 5], ['#5cc13d', 2.4]]) { ctx.strokeStyle = col; ctx.lineWidth = lw; for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.ellipse(0, 10 - k * 8, 14 - k * 2, 5, 0, .15, 6.1); ctx.stroke(); } }
    ctx.fillStyle = '#f2ead0'; ctx.strokeStyle = '#3d2a12'; ctx.lineWidth = 1;
    for (let k = 0; k < 6; k++) { const a = k * 1.05, px = Math.cos(a) * 15, py = 10 - (k % 3) * 8 + Math.sin(a) * 4; ctx.beginPath(); ctx.moveTo(px - 2.5, py); ctx.lineTo(px + (px >= 0 ? 6 : -6), py - 3); ctx.lineTo(px + 2.5, py); ctx.closePath(); ctx.fill(); ctx.stroke(); }
    ctx.restore();
  }
  for (let i = L.length - 1; i >= 0; i--) {
    const p = L[i], age = now - p.at; if (age > p.life) { L.splice(i, 1); continue; }
    const k = age / p.life, s = age / 1000;
    if (p.k === 'leaf') { ctx.globalAlpha = 1 - k * k; gdLeaf(ctx, p.x + p.vx * s, p.y + p.vy * s + 30 * s * s, p.len, p.rot + p.vr * s, p.col); }
    else if (p.k === 'pol') { ctx.globalAlpha = .9 * (1 - k); ctx.fillStyle = p.col; ctx.beginPath(); ctx.arc(p.x + p.vx * s, p.y + p.vy * s, p.r, 0, 7); ctx.fill(); }
    else if (p.k === 'cloud') { ctx.globalAlpha = .45 * (1 - k); ctx.fillStyle = '#ffe45c'; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * (.5 + .5 * Math.min(1, k * 3)), 0, 7); ctx.fill(); }
    else if (p.k === 'forest') {
      const g = Math.min(1, age / 380), fade = 1 - Math.max(0, (age - 700) / 600);
      ctx.globalAlpha = fade; ctx.strokeStyle = 'rgba(140,240,110,.9)'; ctx.lineWidth = 7; ctx.beginPath(); ctx.arc(p.x, p.y + 16, p.r * g, 0, 7); ctx.stroke();
      for (let j = 0; j < 8; j++) {
        const a = j / 8 * 6.283 + p.sd, pts = [];
        for (let q = 0; q <= 5; q++) { const d = 26 + q / 5 * (p.r - 40); pts.push([p.x + Math.cos(a + Math.sin(q * 1.7 + j) * .07) * d, p.y + 16 + Math.sin(a + Math.sin(q * 1.7 + j) * .07) * d]); }
        gdVinePath(ctx, pts, g);
      }
    }
  }
  ctx.globalAlpha = 1;
}
