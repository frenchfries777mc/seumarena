/* ===== map art (2026-11-13, the "C+E" look the developer picked from 5 mockups) =====
   Every map is painted ONCE, from its own MAPS[].th colours, into three canvases (floor / walls / bushes) at the exact
   screen scale; each frame only copies the visible part (walls and bushes only where a row has some) and draws the moving
   bits live: water ripples, speed / heal pads and lava vents. Light, calm floor and ice (mockup E) with brick walls, long
   sun shadows, stone-rimmed water and leafy bushes (mockup C). tail.js drawTiles() asks MS_draw first. */
const msH = (a, b, s) => { let h = (Math.imul(a | 0, 374761393) + Math.imul(b | 0, 668265263) + Math.imul((s | 0) + 1, 1442695041)) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
const msRGB = hex => { if (hex.length === 4) hex = '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3]; const n = parseInt(hex.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; };
const msMix = (a, b, t) => { const A = msRGB(a), B = msRGB(b); return '#' + A.map((v, i) => Math.max(0, Math.min(255, Math.round(v + (B[i] - v) * t))).toString(16).padStart(2, '0')).join(''); };
const msA = (hex, a) => { const [r, g, b] = msRGB(hex); return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')'; };
/* the outline of a group of tiles as one path: outside corners rounded, inside corners filled with a small curve.
   grow > 0 makes the shape bigger than its tiles, grow < 0 smaller; oy moves it up/down (raised wall tops) */
function msTile(g, same, cc, r, R, grow, oy) {
  const s = (dx, dy) => same(cc + dx, r + dy), x = cc * T, y = r * T + (oy || 0);
  const L = x - (s(-1, 0) ? .6 : grow), Rt = x + T + (s(1, 0) ? .6 : grow), Tp = y - (s(0, -1) ? .6 : grow), Bt = y + T + (s(0, 1) ? .6 : grow);
  const cvx = (dx, dy) => !s(dx, 0) && !s(0, dy), inner = (dx, dy) => s(dx, 0) && s(0, dy) && !s(dx, dy), notch = (dx, dy) => grow < 0 && inner(dx, dy);
  const P = (dx, dy) => [x + (dx > 0 ? T : 0) + dx * grow, y + (dy > 0 ? T : 0) + dy * grow], rr = Math.max(0, Math.min(R, (Rt - L) / 2, (Bt - Tp) / 2));
  g.moveTo((L + Rt) / 2, Tp);
  if (cvx(1, -1)) g.arcTo(Rt, Tp, Rt, Bt, rr); else if (notch(1, -1)) { const [px, py] = P(1, -1); g.lineTo(px, Tp); g.lineTo(px, py); g.lineTo(Rt, py); } else g.lineTo(Rt, Tp);
  if (cvx(1, 1)) g.arcTo(Rt, Bt, L, Bt, rr); else if (notch(1, 1)) { const [px, py] = P(1, 1); g.lineTo(Rt, py); g.lineTo(px, py); g.lineTo(px, Bt); } else g.lineTo(Rt, Bt);
  if (cvx(-1, 1)) g.arcTo(L, Bt, L, Tp, rr); else if (notch(-1, 1)) { const [px, py] = P(-1, 1); g.lineTo(px, Bt); g.lineTo(px, py); g.lineTo(L, py); } else g.lineTo(L, Bt);
  if (cvx(-1, -1)) g.arcTo(L, Tp, Rt, Tp, rr); else if (notch(-1, -1)) { const [px, py] = P(-1, -1); g.lineTo(L, py); g.lineTo(px, py); g.lineTo(px, Tp); } else g.lineTo(L, Tp);
  g.closePath();
  const Rf = Math.min(R, 26);
  for (const [dx, dy] of [[1, -1], [1, 1], [-1, 1], [-1, -1]]) {
    if (!inner(dx, dy) || Rf < 1) continue;
    const [px, py] = P(dx, dy), qx = px + dx * Rf, qy = py + dy * Rf, aA = Math.atan2(-dy, 0), aB = Math.atan2(0, -dx);
    const d = ((aB - aA + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
    g.moveTo(px, py);
    if (dx * dy > 0) { g.lineTo(px + dx * Rf, py); g.arc(qx, qy, Rf, aA, aB, d < 0); }
    else { g.lineTo(px, py + dy * Rf); g.arc(qx, qy, Rf, aB, aA, d > 0); }
    g.closePath();
  }
}
function msShape(g, I, same, R, grow, oy) { for (let r = 0; r < I.rows; r++) for (let cc = 0; cc < I.cols; cc++) if (same(cc, r)) msTile(g, same, cc, r, R, grow || 0, oy || 0); }
function msEach(I, fn) { for (let r = 0; r < I.rows; r++) for (let cc = 0; cc < I.cols; cc++) fn(I.at(cc, r), cc * T, r * T, cc, r); }
/* soft shadows and glows are worked out on a canvas at a third of the size (they are blurry anyway) and stretched back: far cheaper to paint */
const MS_Q = .34;
function msCanvas(g, I, q) { const cv = document.createElement('canvas'); cv.width = Math.ceil(g.canvas.width * q); cv.height = Math.ceil(g.canvas.height * q); const s = cv.getContext('2d'), k = I.k * q; s.setTransform(k, 0, 0, k, I.P * k, I.P * k); return [cv, s]; }
/* a scratch canvas is let go at once (width 0): iPhone/iPad count canvas memory until it is really freed, and over the limit the screen goes black */
function msFree(...a) { for (const c of a) if (c) c.width = c.height = 0; }
function maFree(e) { if (e) msFree(e.f, e.w, e.b); }
function msPut(g, cv, alpha, op) { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = alpha; if (op) g.globalCompositeOperation = op; g.imageSmoothingEnabled = true; g.drawImage(cv, 0, 0, g.canvas.width, g.canvas.height); g.restore(); }
/* soft shadow / glow of a shape (one union, so overlaps never double up). invert: everything outside the shape (for inner shadows, used under a clip) */
function msSoft(g, I, blur, alpha, col, draw, op, invert) {
  const q = MS_Q, [m, s] = msCanvas(g, I, q); s.fillStyle = '#000';
  if (invert) { s.save(); s.setTransform(1, 0, 0, 1, 0, 0); s.fillRect(0, 0, m.width, m.height); s.restore(); s.globalCompositeOperation = 'destination-out'; }
  s.beginPath(); draw(s); s.fill();
  const o = document.createElement('canvas'); o.width = m.width; o.height = m.height; const oc = o.getContext('2d');
  if (blur > 0) { const off = m.width + 60; oc.shadowColor = col; oc.shadowBlur = blur * I.k * q; oc.shadowOffsetX = off; oc.drawImage(m, -off, 0); }
  else { oc.drawImage(m, 0, 0); oc.globalCompositeOperation = 'source-in'; oc.fillStyle = col; oc.fillRect(0, 0, o.width, o.height); }
  msPut(g, o, alpha, op); msFree(m, o);
}
function msEl(s, x, y, rx, ry) { s.moveTo(x + rx, y); s.ellipse(x, y, rx, ry, 0, 0, 6.3); }


/* ---- B3 브롤 선명 + K7 솜털 덤불 (picked 2026-11-13): checker tiles with stone joints, tall blocks, soft drop shadows, stacked fluffy bushes ---- */
function msHsl(hex) {
  const [r, g, b] = msRGB(hex).map(v => v / 255), mx = Math.max(r, g, b), mn = Math.min(r, g, b); let h = 0, s = 0; const l = (mx + mn) / 2;
  if (mx !== mn) { const d = mx - mn; s = l > .5 ? d / (2 - mx - mn) : d / (mx + mn); h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60; }
  return [h, s, l];
}
const isWa = I => (c, r) => I.at(c, r) === 'w', isIc = I => (c, r) => I.at(c, r) === 'i', isBu = I => (c, r) => I.at(c, r) === 'g';
const msLava = th => { const [h, s] = msHsl(th.wa); return h < 45 && s > .5; };
const msFronts = (I, fn) => msEach(I, (t, x, y, cc, r) => { if (t === '#' && !I.isW(cc, r + 1)) fn(x, y, cc, r); });
const msTops = (I, fn) => msEach(I, (t, x, y, cc, r) => { if (t === '#') fn(x, y, cc, r); });
const msBushes = (I, fn) => msEach(I, (t, x, y, cc, r) => { if (t === 'g') fn(x, y, cc, r); });
const msOpen = (I, cc, r) => { for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (I.at(cc + dx, r + dy) !== '.') return false; return true; };
function msBg(g, I, col) { g.fillStyle = col; g.fillRect(-I.P, -I.P, I.cols * T + 2 * I.P, I.rows * T + 2 * I.P); }
/* sun from the upper left: a shadow to the lower right of each wall (and bush) */
/* fill a shape with parallel lines (pencil hatching) */
function msLeaf(g, x, y, len, wid, ang) { const c = Math.cos(ang), s = Math.sin(ang), px = -s * wid, py = c * wid; g.moveTo(x, y); g.quadraticCurveTo(x + c * len * .5 + px, y + s * len * .5 + py, x + c * len, y + s * len); g.quadraticCurveTo(x + c * len * .5 - px, y + s * len * .5 - py, x, y); }
const msWave = (c, x, y, col, k, a, lw) => { const o = Math.sin(k) * 5; c.strokeStyle = col; c.globalAlpha = a; c.lineWidth = lw || 3; c.lineCap = 'round'; c.beginPath(); c.moveTo(x + 12 + o, y + 26); c.quadraticCurveTo(x + 20 + o, y + 21, x + 28 + o, y + 26); c.moveTo(x + 34 - o, y + 46); c.quadraticCurveTo(x + 42 - o, y + 41, x + 50 - o, y + 46); c.stroke(); c.globalAlpha = 1; };

function msRing(g, I, col, alpha, outer, inner) { const [cv, s] = msCanvas(g, I, 1); s.fillStyle = col; s.beginPath(); outer(s); s.fill(); s.globalCompositeOperation = 'destination-out'; s.beginPath(); inner(s); s.fill(); msPut(g, cv, alpha); msFree(cv); }
function msHex(h, s, l) { const f = n => { const k = (n + h / 30) % 12, a = s * Math.min(l, 1 - l); return Math.round(255 * (l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)))).toString(16).padStart(2, '0'); }; return '#' + f(0) + f(8) + f(4); }
const msSat = (c, k) => { const [h, s, l] = msHsl(c); return msHex(h, Math.min(1, s * k + (s > .05 ? .08 : 0)), l); };
function msBrawl(o) { return { id: 'brawl' + o.n, H: o.H,
  floor(g, I) {
    const th = I.th, lava = msLava(th), wa = isWa(I), ic = isIc(I), sat = c => o.sat ? msSat(c, 1.5) : c;
    const f1 = sat(th.f1), f2 = msMix(sat(th.f2), '#fff', .05), dk = msMix(f1, '#000', .22);
    msBg(g, I, dk);
    msEach(I, (t, x, y, cc, r) => {
      if (t === 'w') return;
      const col = t === 'i' ? ((cc + r) % 2 ? '#e4f5ff' : '#d3ecfb') : (cc + r) % 2 ? f1 : f2;
      g.fillStyle = col; g.fillRect(x, y, T + .6, T + .6);
      g.fillStyle = 'rgba(255,255,255,.10)'; g.fillRect(x, y, T, 3); g.fillStyle = 'rgba(0,0,0,.08)'; g.fillRect(x, y + T - 3, T, 3);
      if (o.cobble && t === '.') { g.strokeStyle = 'rgba(0,0,0,.08)'; g.lineWidth = 2; g.beginPath(); g.moveTo(x + 32, y); g.lineTo(x + 32, y + 32); g.moveTo(x, y + 32); g.lineTo(x + T, y + 32); g.moveTo(x + 16, y + 32); g.lineTo(x + 16, y + T); g.stroke(); }
      if (t === 'i') { g.strokeStyle = 'rgba(255,255,255,.95)'; g.lineWidth = 4; g.lineCap = 'round'; const q = msH(cc, r, 300) * 14; g.beginPath(); g.moveTo(x + 12 + q, y + 32); g.lineTo(x + 28 + q, y + 16); g.stroke(); }
      if (t !== '.') return; const h = msH(cc, r, 301);
      if (h < .1) { g.strokeStyle = msMix(th.b2, f1, .25); g.lineWidth = 3.5; g.lineCap = 'round'; const px = x + 18 + msH(cc, r, 302) * 28, py = y + 40 + msH(cc, r, 303) * 12; g.beginPath(); g.moveTo(px - 7, py); g.lineTo(px - 10, py - 10); g.moveTo(px, py); g.lineTo(px, py - 14); g.moveTo(px + 7, py); g.lineTo(px + 10, py - 10); g.stroke(); }
      else if (h < .16) { g.strokeStyle = 'rgba(0,0,0,.14)'; g.lineWidth = 2; g.beginPath(); const px = x + 14 + msH(cc, r, 304) * 24; g.moveTo(px, y + 14); g.lineTo(px + 10, y + 26); g.lineTo(px + 6, y + 38); g.stroke(); }
      else if (h < .2 && msOpen(I, cc, r)) { const px = x + 32, py = y + 36; g.fillStyle = 'rgba(0,0,0,.2)'; g.beginPath(); msEl(g, px + 3, py + 4, 11, 6); g.fill(); g.fillStyle = msMix(f1, '#fff', .3); g.beginPath(); msEl(g, px, py, 10, 7); g.fill(); g.fillStyle = msMix(f1, '#fff', .55); g.beginPath(); msEl(g, px - 3, py - 3, 4, 2.5); g.fill(); }
    });
    /* water: bright, a pale shallow band at the edge, foam line, darker centre */
    g.beginPath(); msShape(g, I, wa, 14, 0); g.fillStyle = lava ? th.wa : msMix(th.wa, '#00a0ff', .25); g.fill();
    g.save(); g.beginPath(); msShape(g, I, wa, 14, 0); g.clip();
    msSoft(g, I, 0, .55, lava ? '#ffc04a' : '#9fe3ff', s => msShape(s, I, wa, 14, 0), null, true);
    g.beginPath(); msShape(g, I, wa, 12, -9); g.fillStyle = lava ? th.wa : msMix(th.wa, '#00a0ff', .25); g.fill();
    msSoft(g, I, 16, .45, lava ? '#6a0e00' : '#00305a', s => msShape(s, I, wa, 12, -24));
    msSoft(g, I, 0, .35, '#000', s => msShape(s, I, wa, 14, 0, 10), null, true);      // the bank's shadow on the water
    g.restore();
    msRing(g, I, lava ? '#ffe08a' : '#ffffff', .85, s => msShape(s, I, wa, 13, -6.5), s => msShape(s, I, wa, 11, -9.5));
    /* hard drop shadows down-right */
    msSoft(g, I, o.blur, .3, '#0a0a20', s => msEach(I, (t, x, y) => { if (t === '#') s.rect(x + 14, y + 4, T, T + 8); else if (t === 'g') msEl(s, x + 40, y + T - 2, 32, 14); }));
  },
  walls(g, I) {
    const th = I.th, H = this.H, isW = I.isW, ol = msMix(th.ws, '#000', .55), wood = msMix(th.wt, '#b0753a', .55), crate = (cc, r) => o.crates && msH(Math.floor(cc / 1), r, 310) < .35;
    if (o.outline) { g.beginPath(); msShape(g, I, isW, 8, 2.5, -H); msShape(g, I, isW, 8, 2.5, 0); g.fillStyle = ol; g.fill(); }
    msFronts(I, (x, y, cc, r) => {
      const c0 = crate(cc, r) ? msMix(wood, '#000', .3) : th.ws, gr = g.createLinearGradient(0, y + T - H, 0, y + T); gr.addColorStop(0, msMix(c0, '#fff', .05)); gr.addColorStop(1, msMix(c0, '#000', .35));
      g.fillStyle = gr; g.fillRect(x, y + T - H, T + .6, H);
      g.fillStyle = 'rgba(0,0,0,.18)'; if (crate(cc, r)) { g.fillRect(x + 4, y + T - H, 3, H); g.fillRect(x + T - 7, y + T - H, 3, H); } else for (let i = 1; i < 4; i++) g.fillRect(x + i * 16 - 1, y + T - H + 3, 2, H - 6);
    });
    msTops(I, (x, y, cc, r) => {
      const yy = y - H, cr = crate(cc, r);
      g.fillStyle = cr ? wood : th.wt; g.fillRect(x, yy, T + .6, T + .6);
      if (cr) {      // wooden crate: frame and a cross brace
        g.strokeStyle = msMix(wood, '#000', .3); g.lineWidth = 5; g.strokeRect(x + 5, yy + 5, T - 10, T - 10); g.lineWidth = 4; g.beginPath(); g.moveTo(x + 8, yy + 8); g.lineTo(x + T - 8, yy + T - 8); g.stroke();
        g.strokeStyle = msMix(wood, '#fff', .2); g.lineWidth = 2; g.beginPath(); g.moveTo(x + 5, yy + 4); g.lineTo(x + T - 5, yy + 4); g.stroke();
      } else {
        g.fillStyle = msMix(th.wt, '#fff', .12); g.beginPath(); g.roundRect(x + 6, yy + 6, T - 12, T - 12, 6); g.fill();
        g.fillStyle = msMix(th.wt, '#000', .1); g.beginPath(); g.roundRect(x + 6, yy + T - 12, T - 12, 6, [0, 0, 6, 6]); g.fill();
        if (msH(cc, r, 311) < .3) { g.strokeStyle = 'rgba(0,0,0,.16)'; g.lineWidth = 2; g.beginPath(); const px = x + 16 + msH(cc, r, 312) * 26; g.moveTo(px, yy + 12); g.lineTo(px + 8, yy + 24); g.lineTo(px + 4, yy + 34); g.stroke(); }
      }
      if (!isW(cc, r - 1)) { g.fillStyle = 'rgba(255,255,255,.45)'; g.fillRect(x, yy, T + .6, 4); }
      if (!isW(cc - 1, r)) { g.fillStyle = 'rgba(255,255,255,.2)'; g.fillRect(x, yy, 3, T); }
      if (!isW(cc, r + 1)) { g.fillStyle = 'rgba(0,0,0,.2)'; g.fillRect(x, yy + T - 4, T + .6, 4); }
    });
  },
  bush(g, I) {
    const th = I.th, isB = isBu(I), ol = msMix(th.b1, '#000', .55), b2 = o.sat ? msSat(th.b2, 1.3) : th.b2, lobes = [];
    msBushes(I, (x, y, cc, r) => { for (let j = 0; j < 3; j++) for (let i = 0; i < 3; i++) lobes.push([x + 10 + i * 22 + (msH(cc * 3 + i, r * 3 + j, 320) - .5) * 6, y + 2 + j * 20 - 10 + (msH(cc * 3 + i, r * 3 + j, 321) - .5) * 6, 15 + msH(cc * 3 + i, r * 3 + j, 322) * 4]); });
    if (o.outline) { g.fillStyle = ol; g.beginPath(); msShape(g, I, isB, 24, 5, -6); g.fill(); }
    g.beginPath(); msShape(g, I, isB, 24, 2, -6); g.fillStyle = msMix(th.b1, '#000', .25); g.fill();
    g.fillStyle = th.b1; g.beginPath(); for (const [x, y, rr] of lobes) msEl(g, x, y, rr, rr * .9); g.fill();
    g.fillStyle = b2; g.beginPath(); for (const [x, y, rr] of lobes) msEl(g, x - 2, y - 4, rr * .72, rr * .62); g.fill();
    g.fillStyle = msMix(b2, '#fff', .35); g.beginPath(); for (const [x, y, rr] of lobes) { msLeaf(g, x - 8, y - 6, 9, 2.5, -.6); } g.fill();
  },
  live(c, t, x, y, cc, r, now) { msWave(c, x, y, msLava(TH) ? '#ffe08a' : '#ffffff', now * 1.6 + cc * 1.3 + r * .7, .6, 3.2); } }; }
function msBushBase(g, I, R, grow, oy) { g.beginPath(); msShape(g, I, isBu(I), R, grow, oy); g.fillStyle = msMix(I.th.b1, '#000', .3); g.fill(); }
const MS_BUSH = {
  fluffy(g, I) {      // stacked soft tiers, light on top: a big cartoon cloud of leaves
    const th = I.th, b2 = msSat(th.b2, 1.3), isB = isBu(I);
    msBushBase(g, I, 28, 3, 0);
    const tiers = [[0, th.b1, 2], [-9, msMix(th.b1, b2, .5), -3], [-18, b2, -9]];
    for (const [oy, col, gr] of tiers) {
      g.fillStyle = col; g.beginPath(); msShape(g, I, isB, 26, gr, oy);
      msBushes(I, (x, y, cc, r) => { for (let i = 0; i < 4; i++) { const px = x + 8 + i * 16, py = y + oy - gr + (I.at(cc, r - 1) === 'g' ? 0 : 0); if (I.at(cc, r - 1) !== 'g') msEl(g, px, py + 2, 11, 9); } });
      g.fill();
    }
    g.fillStyle = msA(msMix(b2, '#fff', .45), .7); g.beginPath(); msBushes(I, (x, y, cc, r) => { for (let i = 0; i < 3; i++) msEl(g, x + 14 + msH(cc * 3 + i, r, 530) * 36, y - 6 + msH(cc * 3 + i, r, 531) * 36, 6, 3.5); }); g.fill();
  }
};
const MAP_ART = msBrawl({ n: 3, H: 30, outline: false, blur: 3, sat: true, cobble: true });
MAP_ART.bush = MS_BUSH.fluffy;


/* ---------- painting once, copying every frame ---------- */
const MA = { main: [], temp: null };      // main: the painting(s) of the map in play (PC: lobby zoom + match zoom; phone: one); temp: the last small map picture
function maPaint(k, map, th) {
  const rows = map.length, cols = map[0].length, P = cols <= 17 ? 320 : 64, w = cols * T + 2 * P, h = rows * T + 2 * P;      // small maps are narrower than a wide screen: paint the scenery around them (map look 2)
  const kk = Math.min(k, Math.sqrt((mobileMode() ? 5e6 : 12e6) / (w * h)), 4096 / w, 4096 / h);      // big maps: fewer pixels (a little softer), and never wider than graphics chips can hold
  const at = (cc, r) => (cc < 0 || r < 0 || cc >= cols || r >= rows) ? '#' : map[r][cc];
  const I = { th, cols, rows, P, k: kk, at, isW: (cc, r) => at(cc, r) === '#', hasWater: map.some(r => r.includes('w')) };
  const mk = () => { const cv = document.createElement('canvas'); cv.width = Math.ceil(w * kk); cv.height = Math.ceil(h * kk); const g = cv.getContext('2d'); g.setTransform(kk, 0, 0, kk, P * kk, P * kk); return [cv, g]; };
  const [fc, fg] = mk(), [wc, wg] = mk(), [bc, bg] = mk();
  MAP_ART.floor(fg, I); MAP_ART.walls(wg, I); MAP_ART.bush(bg, I);
  /* per row, the stretches that have walls / bushes in that row or the rows next to it */
  const spans = ch => { const out = []; for (let r = -1; r <= rows; r++) { const xs = []; for (let cc = -1; cc <= cols; cc++) { let on = false; for (let d = -1; d <= 1; d++) if (at(cc, r + d) === ch && (ch === '#' || (r + d >= 0 && r + d < rows && cc >= 0 && cc < cols))) on = true; if (on) { const x0 = cc * T - 44, x1 = cc * T + T + 44; if (xs.length && xs[xs.length - 1][1] >= x0) xs[xs.length - 1][1] = x1; else xs.push([x0, x1]); } } out[r + 1] = xs; } return out; };
  return { map, th, kq: k, k: kk, P, f: fc, w: wc, b: bc, ws: spans('#'), bs: spans('g'), snap: map.map(r => typeof r === 'string' ? r : r.join('')), ver: NET.mapVer, rows };
}
/* a wall knocked down during the match (bombs): cut it out of the wall picture and leave rubble on the floor; no repaint */
function maRubble(e, cc, r) {
  const k = e.k, P = e.P, x = cc * T, y = r * T, H = MAP_ART.H, th = e.th, at = (c, rr) => (e.snap[rr] || '')[c] || '#';
  const wg = e.w.getContext('2d'); wg.save(); wg.setTransform(k, 0, 0, k, P * k, P * k); wg.clearRect(x, y - H - 1, T, T + H + 1);
  if (at(cc, r - 1) === '#') {      // the wall behind now shows its front
    const g2 = wg.createLinearGradient(0, y - H, 0, y); g2.addColorStop(0, msMix(th.ws, '#000', .2)); g2.addColorStop(1, msMix(th.ws, '#000', .45)); wg.fillStyle = g2; wg.fillRect(x, y - H, T, H);
    wg.fillStyle = 'rgba(0,0,0,.25)'; for (let i = 1; i < 3; i++) wg.fillRect(x, y - H + i * H / 3, T, 1.5);
  }
  wg.restore();
  /* the floor under it (and under its old shadow, right and below): copies of plain floor two tiles away, so the faint grid still lines up */
  const g = e.f.getContext('2d'), px = v => Math.round((v + P) * k), S = Math.round(T * k), clean = (c2, r2) => at(c2, r2) === '.' && at(c2, r2 - 1) !== '#' && at(c2 - 1, r2) !== '#' && at(c2 - 1, r2 - 1) !== '#';
  let off = null;
  for (let d = 2; d < 9 && !off; d += 2) for (const [dx, dy] of [[d, 0], [-d, 0], [0, d], [0, -d], [d, d], [-d, d], [d, -d], [-d, -d]]) if (clean(cc + dx, r + dy) && clean(cc + dx + 1, r + dy) && clean(cc + dx, r + dy + 1)) { off = [dx, dy]; break; }
  if (off) {
    const tmp = document.createElement('canvas'); tmp.width = tmp.height = S; const tg = tmp.getContext('2d');      // (through a small canvas: a canvas copying onto itself is not reliable everywhere)
    const others = (c2, r2) => [[-1, 0], [0, -1], [-1, -1]].some(([dx, dy]) => (c2 + dx !== cc || r2 + dy !== r) && at(c2 + dx, r2 + dy) === '#');
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
    for (const [dx, dy] of [[0, 0], [1, 0], [0, 1], [1, 1]]) {
      const c2 = cc + dx, r2 = r + dy; if ((dx || dy) && (at(c2, r2) !== '.' || others(c2, r2))) continue;
      tg.clearRect(0, 0, S, S); tg.drawImage(e.f, px((c2 + off[0]) * T), px((r2 + off[1]) * T), S, S, 0, 0, S, S); g.drawImage(tmp, px(c2 * T), px(r2 * T));
    }
    g.restore();
  }
  g.save(); g.setTransform(k, 0, 0, k, P * k, P * k);
  for (let i = 0; i < 7; i++) {
    const sx = x + 8 + msH(cc, r, i) * 48, sy = y + 8 + msH(cc, r, i + 9) * 46, rw = 5 + msH(cc, r, i + 20) * 7, rh = rw * .7, a = msH(cc, r, i + 30) * 3;
    g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(sx + 1.5, sy + 2.5, rw, rh, a, 0, 6.3); g.fill();
    g.fillStyle = i % 2 ? msMix(th.ws, '#fff', .1) : th.wt; g.beginPath(); g.ellipse(sx, sy, rw, rh, a, 0, 6.3); g.fill();
  }
  g.restore();
}
function maCopy(c, e, cv, x0, y0, x1, y1, m, exact) {
  const k = e.k, P = e.P;
  const sx = Math.max(0, Math.floor((x0 + P) * k)), sy = Math.max(0, Math.floor((y0 + P) * k)), ex = Math.min(cv.width, Math.ceil((x1 + P) * k)), ey = Math.min(cv.height, Math.ceil((y1 + P) * k));
  if (ex <= sx || ey <= sy) return;
  if (exact) c.drawImage(cv, sx, sy, ex - sx, ey - sy, Math.round(m.e + sx - P * k), Math.round(m.f + sy - P * k), ex - sx, ey - sy);
  else c.drawImage(cv, sx, sy, ex - sx, ey - sy, sx / k - P, sy / k - P, (ex - sx) / k, (ey - sy) / k);
}
function maBlit(c, e, cv, c0, c1, r0, r1, spans) {
  const m = c.getTransform(), exact = Math.abs(m.a - e.k) < .002 && Math.abs(m.d - e.k) < .002 && !m.b && !m.c;      // same scale: a plain pixel copy
  if (exact) { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); }
  const cols = e.snap[0].length, X0 = c0 <= 0 && !spans ? -e.P : c0 * T - 44, X1 = c1 >= cols - 1 && !spans ? cols * T + e.P : (c1 + 1) * T + 44;      // the floor at the map's edge: also the scenery outside it
  if (!spans) maCopy(c, e, cv, X0, r0 <= 0 ? -e.P : r0 * T - 64, X1, r1 >= e.rows - 1 ? e.rows * T + e.P : (r1 + 1) * T + 44, m, exact);
  else for (let r = Math.max(-1, r0 - 1); r <= Math.min(spans.length - 2, r1 + 1); r++) for (const [a, b] of spans[r + 1]) { const x0 = Math.max(a, X0), x1 = Math.min(b, X1); if (x1 > x0) maCopy(c, e, cv, x0, r * T, x1, r * T + T, m, exact); }
  if (exact) c.restore();
}
function maFind(c) {
  const m = c.getTransform(), k = Math.round(Math.hypot(m.a, m.b) * 1000) / 1000;
  if (c !== ctx) {      // a small map picture (lobby, map picker): painted, used for its three passes, then let go
    if (MA.temp && MA.temp.map === MAP && MA.temp.th === TH && MA.temp.kq === k) return MA.temp;
    maFree(MA.temp); return MA.temp = maPaint(k, MAP, TH);
  }
  MA.main = MA.main.filter(e => (e.th === TH && e.rows === MAP.length) || (e !== MA.temp && maFree(e)));      // same map (a guest gets a new MAP array whenever walls change, so match by the map's colours)
  let e = MA.main.find(e => Math.abs(e.kq - k) < .002) || MA.main.find(e => e.kq / k > .97 && e.kq / k < 1.03);      // (kq: the size asked for; k: the size painted, smaller on very big maps)      // a tiny zoom change reuses the painting; otherwise it is painted again at the new size (a stretched copy costs more every frame)
  if (e && (e.map !== MAP || e.ver !== NET.mapVer)) {      // the map changed under the painting
    let back = false; for (let r = 0; r < e.rows && !back; r++) for (let cc = 0; cc < e.snap[r].length; cc++) if (MAP[r][cc] === '#' && e.snap[r][cc] !== '#') { back = true; break; }
    if (back) { MA.main.splice(MA.main.indexOf(e), 1); maFree(e); e = null; }      // a new match on the same map: walls are back, paint again
    else {      // walls knocked down: rubble, no repaint
      for (let r = 0; r < e.rows; r++) for (let cc = 0; cc < e.snap[r].length; cc++) if (e.snap[r][cc] === '#' && MAP[r][cc] !== '#') maRubble(e, cc, r);
      let cut = false; for (let r = 0; r < e.rows && !cut; r++) for (let cc = 0; cc < e.snap[r].length; cc++) if (e.snap[r][cc] === 'g' && MAP[r][cc] !== 'g' && MAP[r][cc] !== 'G') { cut = true; break; }
      if (cut) try {      // bushes blown away: paint only the bush layer again (before, they stayed in the picture)
        const rows = MAP.length, cols = MAP[0].length, at = (cc, r) => (cc < 0 || r < 0 || cc >= cols || r >= rows) ? '#' : MAP[r][cc];
        const bg = e.b.getContext('2d'); bg.save(); bg.setTransform(1, 0, 0, 1, 0, 0); bg.clearRect(0, 0, e.b.width, e.b.height); bg.restore();
        bg.setTransform(e.k, 0, 0, e.k, e.P * e.k, e.P * e.k); MAP_ART.bush(bg, { th: e.th, cols, rows, P: e.P, k: e.k, at, isW: (cc, r) => at(cc, r) === '#', hasWater: MAP.some(r => r.includes('w')) });
      } catch (er) { quietErr(er); }
      e.map = MAP; e.snap = MAP.map(r => typeof r === 'string' ? r : r.join('')); e.ver = NET.mapVer;
    }
  }
  if (!e && MA.pre && MA.pre.th === TH && MA.pre.rows === MAP.length && MA.pre.kq / k > .97 && MA.pre.kq / k < 1.03 && MA.pre.snap.every((r, i) => r === (typeof MAP[i] === 'string' ? MAP[i] : MAP[i].join('')))) {      // painted ahead in the lobby: no pause when the match starts
    while (MA.main.length >= (mobileMode() ? 1 : 2)) maFree(MA.main.shift()); e = MA.pre; MA.pre = null; e.map = MAP; e.ver = NET.mapVer; MA.main.push(e);
  }
  if (!e) { while (MA.main.length >= (mobileMode() ? 1 : 2)) maFree(MA.main.shift()); e = maPaint(k, MAP, TH); MA.main.push(e); }      // phones keep one painting (memory); PCs two (lobby + match)
  return e;
}
/* the match's map picture is painted ahead while the lobby sits idle (painting it when the match started froze the start: ~160 ms on a slowed phone, measured 2026-11-26).
   A random map is picked ahead for that (maNextMap gives it to setup). Same painting code, same size as in the match, so the picture is exactly the same. */
let MA_NEXT = -1, maPreKey = '';
function maNextMap(list) { if (list.includes(MA_NEXT)) { const i = MA_NEXT; MA_NEXT = -1; return i; } return pick(list); }
function maPrepaint() {
  try {
    if (state !== 'menu' || (typeof DED !== 'undefined' && DED) || typeof lobby === 'undefined' || lobby.hidden) return;
    const list = modeOf(modeChoice).maps; if (!list || !list.length) return;
    let id = mapChoice; if (id < 0 || !list.includes(id)) { if (!list.includes(MA_NEXT)) MA_NEXT = pick(list); id = MA_NEXT; }
    const m = MAPS[id]; if (!m) return;
    const s = Math.min(W, H) / (10.5 * T) * ((H > W * 1.15 && W <= 600) || (W > H && H <= 520 && touchUi()) ? 1.2 : 1), k = Math.round(DPR * s * 1000) / 1000;      // (the same zoom render() uses in a match)
    const key = id + '|' + k; if (key === maPreKey && MA.pre) return;
    if (MA.main.some(e => e.th === m.th && e.rows === m.grid.length && e.kq / k > .97 && e.kq / k < 1.03 && e.snap.join() === m.grid.join())) return;      // (already there)
    maFree(MA.pre); MA.pre = maPaint(k, m.grid, m.th); maPreKey = key;
  } catch (e) { quietErr(e); }
}
setInterval(() => { if (state === 'menu') (window.requestIdleCallback || (f => setTimeout(f, 0)))(maPrepaint, { timeout: 3000 }); }, 2500);
function maTempWall(c, cc, r) {        // a wall a skill raises for a moment (특수요원 방벽 등)
  const x = cc * T, y = r * T, H = MAP_ART.H;
  const gd = awGoldWalls.size && awGoldWalls.get(cc + r * COLS) === tempWalls.get(cc + r * COLS);
  c.fillStyle = gd ? '#b9761a' : '#2b6f8a'; c.beginPath(); c.roundRect(x + 2, y + T - H - 8, T - 4, H + 8, 6); c.fill();
  c.fillStyle = gd ? '#ffd34d' : '#56b4e9'; c.beginPath(); c.roundRect(x + 2, y - H, T - 4, T - 4, 6); c.fill();
}
function MS_draw(c, c0, c1, r0, r1, pass) {
  const e = maFind(c);
  if (pass === 0) {
    maBlit(c, e, e.f, c0, c1, r0, r1);
    const now = performance.now() / 1000, still = c !== ctx;
    for (let r = r0; r <= r1; r++) for (let cc = c0; cc <= c1; cc++) {
      const t = MAP[r][cc], x = cc * T, y = r * T;
      if (t === 'w') { if (!still) MAP_ART.live(c, t, x, y, cc, r, now); }
      else if (t === 'p' || t === 'h' || t === 'v') drawSpecialTile(c, t, x, y, cc, r);
    }
  } else if (pass === 1) {
    maBlit(c, e, e.w, c0, c1, r0, r1, e.ws);
    if (tempWalls.size) for (let r = r0; r <= r1; r++) for (let cc = c0; cc <= c1; cc++) if (tile(cc, r) === '#' && MAP[r][cc] !== '#') {      // walls a skill raises for a moment
      if (MAP[r][cc] !== 'g' && MAP[r][cc] !== 'G') maTempWall(c, cc, r);
    }
  } else {
    maBlit(c, e, e.b, c0, c1, r0, r1, e.bs);
    for (let r = r0; r <= r1; r++) for (let cc = c0; cc <= c1; cc++) if (MAP[r][cc] === 'G' && typeof drawPlantTile === 'function') drawPlantTile(c, cc, r, cc * T, r * T);      // (정원사's bushes: gardener.js)
    if (tempWalls.size) for (let r = r0; r <= r1; r++) for (let cc = c0; cc <= c1; cc++) if ((MAP[r][cc] === 'g' || MAP[r][cc] === 'G') && tile(cc, r) === '#') maTempWall(c, cc, r);      // a raised wall inside a bush: drawn over the bush, or the bush hides it
  }
  return true;
}


/* ===== map look 2 (2026-11-20, mockup approved): each map gets its own floor material instead of the checker, the same material
   carries on outside the arena with themed scenery (trees, cacti, pines, lava rivers, buildings, ruins), the outer border walls are
   not drawn (they still block), and some inner walls carry a prop. All of it is painted once in maPaint, nothing per frame. ===== */
const MD_M = { msH, msMix, msA, msEl, msEach, msLeaf, msShape, msSoft, msRing, isWa, isIc, msLava, msSat, msOpen, T, MAP_ART };
const MD_G=(function(){const M=MD_M,T=M.T,H=M.msH,mix=M.msMix,A=M.msA,el=M.msEl;
function base(bio,th){ return {grass:mix(th.f1,'#4a8a3a',.55),swamp:mix(th.f1,'#6a8a4a',.5),sand:mix(th.f1,'#e0c080',.4),snow:mix(th.f1,'#eef5fb',.5),lava:mix(th.f1,'#2a2224',.4),city:mix(th.f1,'#2c3038',.5),roof:mix(th.f1,'#2a2850',.4),stone:th.f1}[bio]; }
/* one continuous ground over a world rect; same function inside the arena and outside, so the two are one material */
function ground(g,bio,th,x0,y0,w,h){ const b=base(bio,th),lt=mix(b,'#fff',.12),dk=mix(b,'#000',.14);
  g.fillStyle=b; g.fillRect(x0,y0,w,h);
  const S=Math.floor;
  // big soft colour patches (two batched paths: light, dark)
  const pl=new Path2D(),pd=new Path2D();
  for(let y=S(y0/160)*160-160;y<y0+h+160;y+=160)for(let x=S(x0/160)*160-160;x<x0+w+160;x+=160){const px=x+H(x,y,800)*160,py=y+H(x,y,801)*160,r=70+H(x,y,802)*70,q=H(x,y,803)<.5?pl:pd;q.moveTo(px+r*1.4,py);q.ellipse(px,py,r*1.4,r,0,0,6.3);}
  g.fillStyle=A(lt,.5);g.fill(pl);g.fillStyle=A(dk,.5);g.fill(pd);
  if(bio==='stone'||bio==='lava'){ // flagstones: offset rows of slabs with dark seams (seams = one fill under, faces batched by shade)
    const sz=bio==='lava'?96:72, faces=[new Path2D(),new Path2D(),new Path2D(),new Path2D()], cracks=new Path2D(); g.fillStyle=bio==='lava'?mix(b,'#000',.35):mix(b,'#000',.25); g.fillRect(x0,y0,w,h);
    for(let r=S(y0/sz)-1;r*sz<y0+h+sz;r++){const off=(r%2)*sz/2; for(let c=S((x0-off)/sz)-1;c*sz+off<x0+w+sz;c++){const x=c*sz+off,y=r*sz,hh=H(c,r,810);
      faces[Math.min(3,S(hh*4))].roundRect(x+3,y+3,sz-6,sz-6,bio==='lava'?14:8);
      if(bio==='lava'&&hh<.12){cracks.moveTo(x+10,y+sz*.4);cracks.lineTo(x+sz*.45,y+sz*.55);cracks.lineTo(x+sz-12,y+sz*.35);} }}
    faces.forEach((f,i)=>{const hh=(i+.5)/4;g.fillStyle=mix(b,hh<.5?'#fff':'#000',hh*.12);g.fill(f);});
    if(bio==='lava'){g.strokeStyle=A('#ff7a2a',.55);g.lineWidth=2.5;g.stroke(cracks);}
  } else if(bio==='city'){ // asphalt: big slabs, specks
    g.fillStyle=A('#000',.18); for(let r=S(y0/128)-1;r*128<y0+h+128;r++)for(let c=S(x0/128)-1;c*128<x0+w+128;c++){g.fillRect(c*128,r*128,128,2);g.fillRect(c*128,r*128,2,128);}
    const n=w*h/900; g.fillStyle=A('#fff',.12); for(let i=0;i<n;i+=2)g.fillRect(x0+H(i,1,820)*w,y0+H(i,2,820)*h,2,2); g.fillStyle=A('#000',.12); for(let i=1;i<n;i+=2)g.fillRect(x0+H(i,1,820)*w,y0+H(i,2,820)*h,2,2);
  } else if(bio==='roof'){ // rooftop deck: wide planks
    const seam=new Path2D(),pl2=new Path2D(),pd2=new Path2D();
    for(let r=S(y0/40)-1;r*40<y0+h+40;r++){const off=H(r,0,830)*200;seam.rect(x0,r*40,w,2);for(let c=S((x0-off)/200)-1;c*200+off<x0+w;c++){seam.rect(c*200+off,r*40,2,40);(H(c,r,831)<.5?pl2:pd2).rect(c*200+off+2,r*40+2,198,38);}}
    g.fillStyle=A('#fff',.05);g.fill(pl2);g.fillStyle=A('#000',.05);g.fill(pd2);g.fillStyle=A('#000',.16);g.fill(seam);
  } else { // natural ground: strokes and specks, batched by colour
    const n=w*h/(bio==='grass'||bio==='swamp'?500:900), a=new Path2D(), c2=new Path2D(), sp=[];
    for(let i=0;i<n;i++){const x=x0+H(i,1,840)*w,y=y0+H(i,2,840)*h,q=H(i,3,840);
      if(bio==='grass'||bio==='swamp'){const p=q<.5?a:c2;p.moveTo(x,y);p.lineTo(x-2+q*4,y-7);}
      else if(bio==='sand'){ if(q<.3){a.moveTo(x-18,y);a.quadraticCurveTo(x,y-6,x+18,y);} else sp.push(x,y); }
      else if(bio==='snow'){ if(q<.15){c2.moveTo(x+22,y);c2.ellipse(x,y,22,8,0,0,6.3);} else sp.push(x,y); } }
    g.lineCap='round'; g.lineWidth=2;
    if(bio==='grass'||bio==='swamp'){g.strokeStyle=A(mix(b,'#fff',.25),.7);g.stroke(a);g.strokeStyle=A(mix(b,'#000',.25),.7);g.stroke(c2);}
    else if(bio==='sand'){g.strokeStyle=A('#fff',.25);g.stroke(a);g.fillStyle=A(mix(b,'#000',.3),.5);for(let i=0;i<sp.length;i+=2)g.fillRect(sp[i],sp[i+1],2,2);}
    else if(bio==='snow'){g.fillStyle=A('#8fb0d0',.18);g.fill(c2);g.fillStyle=A('#fff',.9);for(let i=0;i<sp.length;i+=2)g.fillRect(sp[i],sp[i+1],2,2);}
    if(bio==='grass'){ const d=new Path2D(); for(let i=0;i<w*h/60000;i++){const x=x0+H(i,5,850)*w,y=y0+H(i,6,850)*h,rx=40+H(i,7,850)*40;d.moveTo(x+rx,y);d.ellipse(x,y,rx,22,0,0,6.3);} g.fillStyle=A('#8a6a3a',.28);g.fill(d); }
  }
}
return {ground,base};})();

const MD_X=(function(){const M=MD_M,T=M.T,H=M.msH,mix=M.msMix,A=M.msA,el=M.msEl;
const mdCirc=(g,x,y,r,c)=>{g.fillStyle=c;g.beginPath();g.arc(x,y,r,0,7);g.fill();};
function tree(g,x,y,s,th,snow){ mdCirc(g,x+8*s,y+10*s,30*s,'rgba(10,20,10,.28)'); const d=mix(th.b1,'#000',.25);
  [[0,0,30,d],[-10,-6,20,th.b1],[10,-4,20,th.b1],[0,-12,20,th.b1],[-4,-14,13,th.b2],[8,-10,9,th.b2]].forEach(([a,b,r,c])=>mdCirc(g,x+a*s,y+b*s,r*s,c));
  if(snow){g.fillStyle='rgba(255,255,255,.9)';g.beginPath();el(g,x-4*s,y-18*s,12*s,6*s);el(g,x+10*s,y-12*s,7*s,4*s);g.fill();} }
function pine(g,x,y,s){ g.fillStyle='rgba(20,40,70,.18)';g.beginPath();el(g,x+10*s,y+12*s,22*s,10*s);g.fill();
  [[0,'#2f6f5c'],[-12,'#46957d'],[-24,'#5aa98f']].forEach(([o,c],i)=>{const w=(26-i*6)*s;g.fillStyle=c;g.beginPath();g.moveTo(x-w,y+(o+10)*s);g.lineTo(x+w,y+(o+10)*s);g.lineTo(x,y+(o-14)*s);g.closePath();g.fill();
   g.fillStyle='#fff';g.beginPath();g.moveTo(x-w*.45,y+(o-2)*s);g.lineTo(x+w*.45,y+(o-2)*s);g.lineTo(x,y+(o-14)*s);g.closePath();g.fill();}); }
function cactus(g,x,y,s){ g.fillStyle='rgba(80,50,10,.22)';g.beginPath();el(g,x+8*s,y+4*s,16*s,6*s);g.fill(); g.fillStyle='#4f9a5a';
  g.beginPath();g.roundRect(x-6*s,y-40*s,12*s,44*s,6*s);g.roundRect(x-18*s,y-28*s,8*s,18*s,4*s);g.roundRect(x+10*s,y-34*s,8*s,16*s,4*s);g.rect(x-14*s,y-14*s,10*s,6*s);g.rect(x+4*s,y-22*s,10*s,6*s);g.fill();
  g.fillStyle='#6cba73';g.fillRect(x-3*s,y-36*s,3*s,36*s); mdCirc(g,x,y-40*s,3.5*s,'#ff7aa8'); }
function rock(g,x,y,s,c){ g.fillStyle='rgba(0,0,0,.22)';g.beginPath();el(g,x+6*s,y+6*s,22*s,10*s);g.fill(); g.fillStyle=mix(c,'#000',.2);g.beginPath();el(g,x,y,22*s,15*s);g.fill(); g.fillStyle=c;g.beginPath();el(g,x-3*s,y-4*s,17*s,10*s);g.fill(); g.fillStyle=mix(c,'#fff',.25);g.beginPath();el(g,x-8*s,y-8*s,6*s,3*s);g.fill(); }
function building(g,x,y,w,h,c,neon,k){ g.fillStyle='rgba(0,0,0,.35)';g.fillRect(x+10,y+10,w,h); g.fillStyle=c;g.fillRect(x,y,w,h); g.fillStyle=mix(c,'#fff',.12);g.fillRect(x,y,w,6);
  g.fillStyle=mix(c,'#000',.25);g.fillRect(x+w*.15,y+h*.25,w*.25,h*.2);g.fillRect(x+w*.55,y+h*.55,w*.3,h*.25); mdCirc(g,x+w*.7,y+h*.3,Math.min(w,h)*.1,mix(c,'#000',.3));
  if(neon){g.fillStyle=neon;g.fillRect(x+6,y+h-14,w-12,6);g.fillStyle=A(neon,.25);g.fillRect(x,y+h-20,w,18);} }
function column(g,x,y,s,c,broken){ g.fillStyle='rgba(0,0,0,.25)';g.beginPath();el(g,x+10*s,y+6*s,18*s,8*s);g.fill(); g.fillStyle=mix(c,'#000',.2);g.fillRect(x-14*s,y-6*s,28*s,10*s);
  const hh=(broken?26:52)*s;g.fillStyle=c;g.fillRect(x-10*s,y-6*s-hh,20*s,hh);g.fillStyle=mix(c,'#000',.15);for(let i=0;i<3;i++)g.fillRect(x-7*s+i*6*s,y-6*s-hh,2*s,hh);
  g.fillStyle=mix(c,'#fff',.15);g.fillRect(x-14*s,y-12*s-hh,28*s,8*s); }
function lavaRiver(g,x0,y0,w,h,seed){ for(let i=0;i<3;i++){const y=y0+h*(.2+.3*i)+H(i,seed,700)*40; g.strokeStyle='#7a1e08';g.lineWidth=34;g.lineCap='round';g.beginPath();g.moveTo(x0,y);for(let x=x0;x<=x0+w;x+=120)g.lineTo(x,y+Math.sin(x*.01+i)*40);g.stroke();
  g.strokeStyle='#e2551a';g.lineWidth=22;g.stroke();g.strokeStyle='#ffb347';g.lineWidth=7;g.stroke();} }
/* outside scenery: fills everything outside the map rectangle */
function outside(g,I,bio,X0,Y0,W,Hh){ const th=I.th,MW=I.cols*T,MH=I.rows*T;
  g.save(); g.beginPath(); const cw=(x,y,w,h)=>{g.moveTo(x,y);g.lineTo(x+w,y);g.lineTo(x+w,y+h);g.lineTo(x,y+h);g.closePath();};
  cw(X0,Y0,W,Hh); g.moveTo(0,0); g.lineTo(0,MH); g.lineTo(MW,MH); g.lineTo(MW,0); g.closePath(); for(const q of (I.ring||[])) cw(...q); g.clip('nonzero');
  const gr={grass:'#2c5a2e',swamp:'#2f7a8a',sand:'#e2c27e',snow:'#e9f2f8',lava:'#2a1d1d',city:'#1c1f2a',roof:'#15132e',stone:'#4f6b3a'}[bio];
  const gr2=MD_G.base(bio,th); MD_G.ground(g,bio,th,X0,Y0,W,Hh); g.fillStyle=A('#000',.1); g.fillRect(X0,Y0,W,Hh);
  const out=(x,y,m)=>x<-m||y<-m||x>MW+m||y>MH+m;
  if(bio==='lava') lavaRiver(g,X0,Y0,W,Hh,1);
  if(bio==='sand'){ g.strokeStyle='rgba(255,255,255,.25)';g.lineWidth=4;for(let i=0;i<30;i++){const x=X0+H(i,1,710)*W,y=Y0+H(i,2,710)*Hh;g.beginPath();g.moveTo(x-40,y);g.quadraticCurveTo(x,y-14,x+40,y);g.stroke();} }
  if(bio==='swamp'){ for(let i=0;i<40;i++){const x=X0+H(i,1,720)*W,y=Y0+H(i,2,720)*Hh;g.fillStyle='#4aa058';g.beginPath();g.arc(x,y,12,.4,6.0);g.lineTo(x,y);g.fill();} }
  const step=bio==='city'||bio==='roof'?150:80, items=[];
  for(let y=Y0-step;y<Y0+Hh+step;y+=step)for(let x=X0-step;x<X0+W+step;x+=step){const jx=x+(H(x,y,730)-.5)*step*.6,jy=y+(H(x,y,731)-.5)*step*.6; if(out(jx,jy,60+H(x,y,733)*60)) items.push([jx,jy,H(x,y,732)]);}
  for(const [x,y,w,h] of (I.ring||[])) if(H(x,y,763)<.3) items.push([x+w/2+(H(x,y,760)-.5)*24,y+h-T/2+(H(x,y,761)-.5)*24,H(x,y,762)*.7]);
  items.sort((a,b)=>a[1]-b[1]);
  for(const [x,y,h] of items){ const s=.9+h*.5;
    if(bio==='grass') tree(g,x,y,s*1.2,th);
    else if(bio==='swamp') h<.5?tree(g,x,y,s,th):rock(g,x,y,s*.8,'#8a8f7a');
    else if(bio==='sand') h<.35?cactus(g,x,y,s):h<.7?rock(g,x,y,s,'#c99a5a'):tree(g,x,y,s*.7,{b1:'#5f8234',b2:'#7fa646'});
    else if(bio==='snow') h<.75?pine(g,x,y,s*1.1):rock(g,x,y,s,'#9fb3c6');
    else if(bio==='lava') h<.5?rock(g,x,y,s*1.2,'#4a3a3a'):0;
    else if(bio==='stone') h<.4?column(g,x,y,s,'#c9b27a',h<.2):h<.75?tree(g,x,y,s,th):rock(g,x,y,s,'#9a9080');
    else { const neon=['#ff3fa8','#3fe0ff','#ffd84a','#8a5cff'][Math.floor(h*4)]; building(g,x-60,y-50,110+h*30,90+h*20,bio==='roof'?'#3a3470':'#3a4058',neon); } }
  g.restore();
  /* soft feather of the background colour over the outermost strip of the playable floor */
  if(false){ const [l,t,r,b]=I.inner, F=56, col=gr2; const strip=(x,y,w,h,x1,y1,x2,y2)=>{const G=g.createLinearGradient(x1,y1,x2,y2);G.addColorStop(0,A(col,.75));G.addColorStop(1,A(col,0));g.fillStyle=G;g.fillRect(x,y,w,h);};
    strip(l,t,r-l,F,0,t,0,t+F); strip(l,b-F,r-l,F,0,b,0,b-F); strip(l,t,F,b-t,l,0,l+F,0); strip(r-F,t,F,b-t,r,0,r-F,0); }
}
/* big props on wall tops (walls already block, so these change nothing in play) */
function wallProps(g,I,bio,Hh){ const th=I.th;
  M.msEach(I,(t,x,y,cc,r)=>{ if(t!=='#')return; const border=cc===0||r===0||cc===I.cols-1||r===I.rows-1, h=H(cc,r,750), cx=x+T/2, cy=y-Hh+T/2;
    if(border){ return;
      if(bio==='grass'||bio==='swamp') tree(g,cx,cy+6,.9,th);
      else if(bio==='snow') pine(g,cx,cy+8,.9);
      else if(bio==='sand') h<.3?cactus(g,cx,cy+14,.8):rock(g,cx,cy+6,.8,'#c99a5a');
      else if(bio==='stone') column(g,cx,cy+16,.8,'#e0cc94',h<.25);
      else if(bio==='lava') { mdCirc(g,cx,cy,12,'#ff7a2a');mdCirc(g,cx,cy,6,'#ffd27a'); }
      else { g.fillStyle=['#ff3fa8','#3fe0ff','#ffd84a'][Math.floor(h*5)%3];g.fillRect(x+8,cy-4,T-16,8);g.fillStyle=A('#fff',.6);g.fillRect(x+10,cy-3,T-20,2); }
      return; }
    if(h>.3)return; const k=Math.floor(H(cc,r,751)*3);
    if(bio==='grass'||bio==='swamp'||bio==='stone') k===0?tree(g,cx,cy,.7,th):k===1?rock(g,cx,cy,.6,'#9a9080'):(()=>{g.fillStyle='#b8673f';g.beginPath();g.roundRect(cx-12,cy-10,24,22,5);g.fill();mdCirc(g,cx,cy-12,13,th.b2);mdCirc(g,cx-5,cy-16,6,'#ff8fb3');})();
    else if(bio==='snow') k===0?(()=>{mdCirc(g,cx,cy+4,14,'#fff');mdCirc(g,cx,cy-12,10,'#fff');mdCirc(g,cx-3,cy-14,1.6,'#222');mdCirc(g,cx+3,cy-14,1.6,'#222');g.fillStyle='#ff8a2a';g.fillRect(cx-1,cy-11,8,3);})():pine(g,cx,cy+6,.6);
    else if(bio==='sand') k===0?cactus(g,cx,cy+12,.6):(()=>{g.fillStyle='#8a5a2a';g.beginPath();g.roundRect(cx-13,cy-16,26,30,6);g.fill();g.fillStyle='#6a4220';g.fillRect(cx-13,cy-8,26,4);g.fillRect(cx-13,cy+4,26,4);})();
    else if(bio==='lava') { g.fillStyle='#3a3d44';g.beginPath();g.roundRect(cx-13,cy-16,26,30,6);g.fill();g.fillStyle='#ffae42';g.fillRect(cx-13,cy-2,26,5);mdCirc(g,cx,cy-20,5,A('#ffae42',.6)); }
    else { g.fillStyle='#2a2c32';g.fillRect(cx-3,cy-24,6,30);mdCirc(g,cx,cy-26,8,'#ffe066');mdCirc(g,cx,cy-26,16,A('#ffe066',.25)); }
  });
}
/* big floor decal in the middle (paint only, no collision) */
function decal(g,I,bio){ const cx=I.cols*T/2,cy=I.rows*T/2,c={grass:'#ffffff',swamp:'#ffffff',sand:'#8a5a2a',snow:'#5c9bd6',lava:'#ff7a2a',city:'#ffd84a',roof:'#2fc797',stone:'#e0cc94'}[bio];
  g.save();g.globalAlpha=.2;g.strokeStyle=c;g.lineWidth=12;g.beginPath();g.arc(cx,cy,150,0,7);g.stroke();g.lineWidth=6;g.beginPath();g.arc(cx,cy,110,0,7);g.stroke();
  g.fillStyle=c;g.beginPath();for(let i=0;i<5;i++){const a=-Math.PI/2+i*1.2566,b=a+.628;g.lineTo(cx+Math.cos(a)*70,cy+Math.sin(a)*70);g.lineTo(cx+Math.cos(b)*30,cy+Math.sin(b)*30);}g.closePath();g.fill();g.restore(); }
return {outside,wallProps,decal};})();

const MD_D=(function(){const M=MD_M,T=M.T,H=M.msH,mix=M.msMix,A=M.msA,el=M.msEl;
const BIOME={roof:'roof',field:'roof',ruins:'sand',big_island:'sand',flag_desert:'sand',big_swamp:'swamp',tournament:'sand',lake:'snow',glacier:'snow',big_snow:'snow',flag_snow:'snow',forge:'lava',big_crater:'lava',flag_lava:'lava',forest:'grass',flag_forest:'grass',flag_castle:'grass',pitch:'grass',hot_jungle:'grass',neon:'city',flag_city:'city',hot_highway:'city',hot_twoside:'city',big_temple:'stone',cross_plaza:'stone',canal:'stone',flag_canal:'stone'};
const SAT=1.1;
function tweak(th,bio){ if(bio==='lava'||bio==='city'||bio==='stone') return th; const s=M.msSat; return Object.assign({},th,{f1:s(th.f1,SAT),f2:s(th.f2,SAT),b1:th.b1,b2:th.b2}); }
const wallNear=(I,cc,r)=>I.at(cc,r-1)==='#';
function floorD(g,I,bio){ const th=I.th,f1=th.f1,lt=mix(f1,'#fff',.22),dk=mix(f1,'#000',.22),W=I.cols*T,Hh=I.rows*T;
  /* colour: large soft patches of light and shade, so the floor isn't one flat colour */
  g.save(); g.beginPath(); M.msEach(I,(t,x,y)=>{ if(t==='.') g.rect(x,y,T+.6,T+.6); }); g.clip();
  for(let i=0;i<(MD_G?0:Math.ceil(I.cols*I.rows/18));i++){const x=H(i,1,900)*W,y=H(i,2,900)*Hh,rr=T*(1.5+H(i,3,900)*2.5),li=H(i,4,900)<.5;
    const gr=g.createRadialGradient(x,y,0,x,y,rr);gr.addColorStop(0,li?'rgba(255,240,200,.12)':(parseInt(f1.slice(1,3),16)+parseInt(f1.slice(3,5),16)+parseInt(f1.slice(5,7),16)>420?'rgba(90,140,200,.07)':'rgba(10,10,40,.12)'));gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(x-rr,y-rr,rr*2,rr*2);} g.restore();
  M.msEach(I,(t,x,y,cc,r)=>{ if(t!=='.')return; const h=H(cc,r,910),px=x+10+H(cc,r,911)*44,py=y+10+H(cc,r,912)*44,ang=H(cc,r,913)*6.28;
    /* along the foot of a wall: a few pebbles / tufts (grounds the wall) */
    if(wallNear(I,cc,r)&&H(cc,r,914)<.55){ for(let k=0;k<3;k++){const qx=x+6+H(cc*3+k,r,915)*52,qy=y+4+H(cc*3+k,r,916)*8;
      if(bio==='grass'||bio==='swamp'||bio==='stone'){g.fillStyle=mix(th.b2,f1,.35);g.beginPath();M.msLeaf(g,qx,qy+8,11,3,-1.9+H(k,cc,917));M.msLeaf(g,qx+4,qy+8,9,2.6,-1.2);g.fill();}
      else if(bio==='snow'){g.fillStyle='rgba(255,255,255,.75)';g.beginPath();el(g,qx,qy+2,9,4);g.fill();}
      else {g.fillStyle=mix(f1,'#000',.28);g.beginPath();el(g,qx,qy+4,5,3.4);g.fill();g.fillStyle=lt;g.beginPath();el(g,qx-1.2,qy+2.8,2.2,1.4);g.fill();}}}
    if(h>.34)return; g.save(); g.translate(px,py); g.scale(1.6,1.6); g.translate(-px,-py);
    if(bio==='grass'||bio==='swamp'){
      if(h<.12){ const cols=['#fff6e0','#ffd84a','#ff8fb3','#bfa8ff'],col=cols[Math.floor(H(cc,r,918)*4)]; for(let k=0;k<(h<.05?3:1);k++){const qx=px+k*9,qy=py+(k%2)*6; g.fillStyle=col; for(let p=0;p<5;p++){g.beginPath();el(g,qx+Math.cos(p*1.256)*2.6,qy+Math.sin(p*1.256)*2.6,2,2);g.fill();} g.fillStyle='#ffcf3a';g.beginPath();el(g,qx,qy,1.4,1.4);g.fill();} }
      else if(h<.22){ g.fillStyle=A(bio==='swamp'?'#3a5a2a':'#c98a3a',.5); g.beginPath(); M.msLeaf(g,px,py,10,3.5,ang); g.fill(); }
      else { g.fillStyle=A(mix(th.b2,'#fff',.1),.45); g.beginPath(); for(let p=0;p<3;p++) el(g,px+Math.cos(p*2.1)*3,py+Math.sin(p*2.1)*3,3,3); g.fill(); }
    } else if(bio==='sand'){
      if(h<.15){ g.strokeStyle=A('#fff',.22); g.lineWidth=2; g.lineCap='round'; g.beginPath(); g.moveTo(px-12,py); g.quadraticCurveTo(px-4,py-4,px+4,py); g.quadraticCurveTo(px+10,py+3,px+16,py); g.stroke(); }
      else if(h<.26){ g.fillStyle=dk; g.beginPath(); el(g,px,py,3.5,2.5); el(g,px+6,py+3,2.2,1.6); g.fill(); g.fillStyle=lt; g.beginPath(); el(g,px-1,py-1,1.5,1); g.fill(); }
      else { g.fillStyle=A('#7a9a3a',.55); g.beginPath(); M.msLeaf(g,px,py,6,1.8,-1.6); M.msLeaf(g,px,py,6,1.8,-2.4); M.msLeaf(g,px,py,6,1.8,-.8); g.fill(); }
    } else if(bio==='snow'){
      if(h<.14){ g.fillStyle=A(mix(f1,'#3a5a7a',.5),.25); for(let k=0;k<3;k++){const c=Math.cos(ang),s=Math.sin(ang),d=k*11,o=(k%2?4:-4);g.beginPath();el(g,px+c*d-s*o,py+s*d+c*o,3.2,2.2);g.fill();} }
      else if(h<.24){ g.fillStyle='rgba(255,255,255,.8)'; g.beginPath(); el(g,px,py,10,5); el(g,px+7,py-2,6,4); g.fill(); }
      else { g.fillStyle='rgba(255,255,255,.95)'; for(let k=0;k<3;k++){g.beginPath();el(g,px+H(k,cc,920)*20,py+H(k,r,921)*14,1.3,1.3);g.fill();} }
    } else if(bio==='lava'){
      if(h<.13){ g.strokeStyle=A('#ff7a2a',.35); g.lineWidth=1.6; g.lineCap='round'; g.beginPath(); g.moveTo(px-8,py-6); g.lineTo(px,py); g.lineTo(px+4,py+9); g.moveTo(px,py); g.lineTo(px+9,py-2); g.stroke(); }
      else if(h<.25){ g.fillStyle=mix(f1,'#000',.3); g.beginPath(); el(g,px,py,4,3); el(g,px+7,py+2,2.5,2); g.fill(); g.fillStyle=mix(f1,'#fff',.12); g.beginPath(); el(g,px-1,py-1,2,1.3); g.fill(); }
      else { g.fillStyle=A('#ffae42',.6); g.beginPath(); el(g,px,py,1.4,1.4); el(g,px+9,py+5,1,1); g.fill(); }
    } else if(bio==='city'||bio==='roof'){
      if(h<.07){ g.fillStyle=mix(f1,'#000',.25); g.beginPath(); g.roundRect(px-9,py-9,18,18,3); g.fill(); g.fillStyle=mix(f1,'#fff',.1); for(let k=0;k<4;k++) g.fillRect(px-6,py-6+k*4,12,1.6); }
      else if(h<.2){ g.fillStyle=A(bio==='roof'?'#7ad0ff':'#c06bff',.12); g.beginPath(); el(g,px,py,14,6); g.fill(); g.fillStyle=A('#fff',.18); g.beginPath(); el(g,px-4,py-1,4,1.3); g.fill(); }
      else { g.fillStyle=A(bio==='roof'?'#2fc797':'#ffd84a',.4); g.beginPath(); M.msLeaf(g,px,py,8,3,ang); g.fill(); }
    } else if(bio==='stone'){
      if(h<.08){ g.fillStyle=A(mix(th.b2,f1,.3),.55); g.beginPath(); el(g,px,py,5,3); el(g,px+5,py+2,3.5,2.4); el(g,px-4,py+3,2.6,2); g.fill(); }
      else if(h<.24){ g.fillStyle=dk; g.beginPath(); el(g,px,py,3,2.2); el(g,px+5,py+3,2,1.5); el(g,px-4,py+3,1.5,1.2); g.fill(); }
      else { g.strokeStyle=A('#000',.16); g.lineWidth=1.6; g.beginPath(); g.moveTo(px,py); g.lineTo(px+6,py+5); g.lineTo(px+4,py+12); g.moveTo(px+6,py+5); g.lineTo(px+12,py+4); g.stroke(); }
    }
    g.restore();
  });
}
function wallsD(g,I,bio,Hh){ const th=I.th;
  M.msEach(I,(t,x,y,cc,r)=>{ if(t!=='#'||cc<=0||r<=0||cc>=I.cols-1||r>=I.rows-1)return; const yy=y-Hh, up=I.at(cc,r-1)==='#';
    if(bio==='snow'&&!up){ g.fillStyle='#ffffff'; g.beginPath(); g.roundRect(x-1,yy-2,T+2,10,[5,5,6,6]); for(let k=0;k<3;k++) el(g,x+10+k*22+H(cc,k,930)*6,yy+8,7+H(cc,k,931)*3,4.5); g.fill(); }
    else if((bio==='grass'||bio==='stone'||bio==='swamp')&&H(cc,r,932)<.35){ g.fillStyle=A(mix(th.b1,th.wt,.25),.8); g.beginPath(); const qx=x+8+H(cc,r,933)*30; el(g,qx,yy+4,10,5); el(g,qx+10,yy+3,7,4); g.fill(); g.fillStyle=A(th.b2,.6); g.beginPath(); el(g,qx-2,yy+2,4,2.4); g.fill(); }
  });
}
function bushD(g,I,bio){ if(bio==='lava'||bio==='snow')return; const cols={grass:'#fff2b0',swamp:'#ffffff',sand:'#ffb0c8',city:'#ffe066',roof:'#ffd0f0',stone:'#fff2b0'};
  M.msEach(I,(t,x,y,cc,r)=>{ if(t!=='g'||H(cc,r,940)>.45)return; const qx=x+12+H(cc,r,941)*40,qy=y-6+H(cc,r,942)*30; g.fillStyle=cols[bio]; g.beginPath(); for(let p=0;p<5;p++) el(g,qx+Math.cos(p*1.256)*3.6,qy+Math.sin(p*1.256)*3.6,2.8,2.8); g.fill(); g.fillStyle='#ff9f2a'; g.beginPath(); el(g,qx,qy,1.8,1.8); g.fill(); });
}
function newFloor(g,I,bio){ const th=I.th, lava=M.msLava(th), wa=M.isWa(I);
  MD_G.ground(g,bio,th,-I.P,-I.P,I.cols*T+2*I.P,I.rows*T+2*I.P);
  M.msEach(I,(t,x,y,cc,r)=>{ if(t==='i'){ g.fillStyle=(cc+r)%2?'#e4f5ff':'#d3ecfb'; g.fillRect(x,y,T+.6,T+.6); g.strokeStyle='rgba(255,255,255,.95)'; g.lineWidth=4; g.lineCap='round'; const q=H(cc,r,300)*14; g.beginPath(); g.moveTo(x+12+q,y+32); g.lineTo(x+28+q,y+16); g.stroke(); } });
  floorD(g,I,bio);
  if(I.hasWater){      /* (no water on the map: skip the five full-size soft passes, the slowest part of painting) */
  g.beginPath(); M.msShape(g,I,wa,14,0); g.fillStyle=lava?th.wa:mix(th.wa,'#00a0ff',.25); g.fill();
  g.save(); g.beginPath(); M.msShape(g,I,wa,14,0); g.clip();
  M.msSoft(g,I,0,.55,lava?'#ffc04a':'#9fe3ff',s=>M.msShape(s,I,wa,14,0),null,true);
  g.beginPath(); M.msShape(g,I,wa,12,-9); g.fillStyle=lava?th.wa:mix(th.wa,'#00a0ff',.25); g.fill();
  M.msSoft(g,I,16,.45,lava?'#6a0e00':'#00305a',s=>M.msShape(s,I,wa,12,-24));
  M.msSoft(g,I,0,.35,'#000',s=>M.msShape(s,I,wa,14,0,10),null,true);
  g.restore();
  M.msRing(g,I,lava?'#ffe08a':'#ffffff',.85,s=>M.msShape(s,I,wa,13,-6.5),s=>M.msShape(s,I,wa,11,-9.5)); }
  M.msSoft(g,I,3,.3,'#0a0a20',s=>M.msEach(I,(t,x,y,cc,r)=>{ if(t==='#'&&!(cc===0||r===0||cc===I.cols-1||r===I.rows-1)) s.rect(x+14,y+4,T,T+8); else if(t==='g') el(s,x+40,y+T-2,32,14); }));
}
return {BIOME,tweak,newFloor,wallsD,bushD};})();

(function () {
  const base = { floor: MAP_ART.floor, walls: MAP_ART.walls, bush: MAP_ART.bush };
  const bioOf = th => { const m = MAPS.find(m => m.th === th); return MD_D.BIOME[m && m.id] || 'stone'; };
  const edge = (I, cc, r) => cc === 0 || r === 0 || cc === I.cols - 1 || r === I.rows - 1;
  const ring = I => { const out = []; msEach(I, (t, x, y, cc, r) => { if (t === '#' && edge(I, cc, r)) out.push([x - 1, y - MAP_ART.H - 1, T + 2, T + MAP_ART.H + 2]); }); return out; };
  MAP_ART.floor = function (g, I) { const bio = bioOf(I.th), I2 = Object.assign({}, I, { th: MD_D.tweak(I.th, bio) });
    MD_D.newFloor(g, I2, bio); MD_X.decal(g, I2, bio); MD_X.outside(g, Object.assign({}, I2, { ring: ring(I) }), bio, -I.P, -I.P, I.cols * T + 2 * I.P, I.rows * T + 2 * I.P); };
  MAP_ART.walls = function (g, I) { const bio = bioOf(I.th), H = this.H;
    base.walls.call(this, g, I);
    g.save(); g.globalCompositeOperation = 'destination-out'; g.fillStyle = '#000';      // the border walls are scenery now: cut them out (a wall joined to the border keeps its own top)
    msEach(I, (t, x, y, cc, r) => { if (t !== '#' || !edge(I, cc, r)) return; const inB = (c2, r2) => I.isW(c2, r2) && !edge(I, c2, r2);
      let y0 = y - H, y1 = y + T; if (inB(cc, r + 1)) y1 = y + T - H; if (inB(cc, r - 1)) y0 = y; g.fillRect(x - 1.5, y0 - 1, T + 3, y1 - y0 + 1); });
    g.restore();
    MD_D.wallsD(g, I, bio, H); MD_X.wallProps(g, I, bio, H); };
  MAP_ART.bush = function (g, I) { const bio = bioOf(I.th), I2 = Object.assign({}, I, { th: MD_D.tweak(I.th, bio) }); base.bush.call(this, g, I2); MD_D.bushD(g, I2, bio); };
})();
