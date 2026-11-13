/* ===== map art (2026-11-13, the "C+E" look the developer picked from 5 mockups) =====
   Every map is painted ONCE, from its own MAPS[].th colours, into three canvases (floor / walls / bushes) at the exact
   screen scale; each frame only copies the visible part (walls and bushes only where a row has some) and draws the moving
   bits live: water ripples, speed / heal pads and lava vents. Light, calm floor and ice (mockup E) with brick walls, long
   sun shadows, stone-rimmed water and leafy bushes (mockup C). tail.js drawTiles() asks MS_draw first. */
const msH = (a, b, s) => { let h = (Math.imul(a | 0, 374761393) + Math.imul(b | 0, 668265263) + Math.imul((s | 0) + 1, 1442695041)) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
const msRGB = hex => { if (hex.length === 4) hex = '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3]; const n = parseInt(hex.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; };
const msMix = (a, b, t) => { const A = msRGB(a), B = msRGB(b); return '#' + A.map((v, i) => Math.max(0, Math.min(255, Math.round(v + (B[i] - v) * t))).toString(16).padStart(2, '0')).join(''); };
const msA = (hex, a) => { const [r, g, b] = msRGB(hex); return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')'; };
const msLum = hex => { const [r, g, b] = msRGB(hex); return (r * .299 + g * .587 + b * .114) / 255; };
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
function msPut(g, cv, alpha, op) { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = alpha; if (op) g.globalCompositeOperation = op; g.imageSmoothingEnabled = true; g.drawImage(cv, 0, 0, g.canvas.width, g.canvas.height); g.restore(); }
/* soft shadow / glow of a shape (one union, so overlaps never double up). invert: everything outside the shape (for inner shadows, used under a clip) */
function msSoft(g, I, blur, alpha, col, draw, op, invert) {
  const q = MS_Q, [m, s] = msCanvas(g, I, q); s.fillStyle = '#000';
  if (invert) { s.save(); s.setTransform(1, 0, 0, 1, 0, 0); s.fillRect(0, 0, m.width, m.height); s.restore(); s.globalCompositeOperation = 'destination-out'; }
  s.beginPath(); draw(s); s.fill();
  const o = document.createElement('canvas'); o.width = m.width; o.height = m.height; const oc = o.getContext('2d');
  if (blur > 0) { const off = m.width + 60; oc.shadowColor = col; oc.shadowBlur = blur * I.k * q; oc.shadowOffsetX = off; oc.drawImage(m, -off, 0); }
  else { oc.drawImage(m, 0, 0); oc.globalCompositeOperation = 'source-in'; oc.fillStyle = col; oc.fillRect(0, 0, o.width, o.height); }
  msPut(g, o, alpha, op);
}
function msEl(s, x, y, rx, ry) { s.moveTo(x + rx, y); s.ellipse(x, y, rx, ry, 0, 0, 6.3); }
function msDots(g, x, y, n, sd, cols, rmin, rmax) {
  for (let i = 0; i < n; i++) { g.fillStyle = cols[i % cols.length]; const rr = rmin + msH(sd, i, 7) * (rmax - rmin); g.fillRect(x + msH(sd, i, 3) * T, y + msH(sd, i, 5) * T, rr, rr); }
}


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
function msSun(g, I, len, blur, alpha, col, bush) {
  msSoft(g, I, blur, alpha, col, s => msEach(I, (t, x, y) => {
    if (t === '#') { s.moveTo(x, y + T - 2); s.lineTo(x + T, y + T - 2); s.lineTo(x + T + len, y + T + len * .7); s.lineTo(x + T + len, y + len * .7); s.lineTo(x + T, y - 6); s.lineTo(x, y - 6); s.closePath(); }
    else if (t === 'g' && bush) msEl(s, x + 34 + len * .4, y + T - 2, 32, 13);
  }));
}
/* fill a shape with parallel lines (pencil hatching) */
function msFlower(g, x, y, r, col, mid) { g.fillStyle = col; g.beginPath(); for (let p = 0; p < 5; p++) msEl(g, x + Math.cos(p * 1.257) * r, y + Math.sin(p * 1.257) * r, r * .8, r * .8); g.fill(); g.fillStyle = mid; g.beginPath(); msEl(g, x, y, r * .6, r * .6); g.fill(); }
function msLeaf(g, x, y, len, wid, ang) { const c = Math.cos(ang), s = Math.sin(ang), px = -s * wid, py = c * wid; g.moveTo(x, y); g.quadraticCurveTo(x + c * len * .5 + px, y + s * len * .5 + py, x + c * len, y + s * len); g.quadraticCurveTo(x + c * len * .5 - px, y + s * len * .5 - py, x, y); }
function msSprite(w, h, fn) { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; const s = cv.getContext('2d'); fn(s); return cv; }
const msPx = (s, x, y, col, w, h) => { s.fillStyle = col; s.fillRect(x, y, w || 1, h || 1); };
const msWave = (c, x, y, col, k, a, lw) => { const o = Math.sin(k) * 5; c.strokeStyle = col; c.globalAlpha = a; c.lineWidth = lw || 3; c.lineCap = 'round'; c.beginPath(); c.moveTo(x + 12 + o, y + 26); c.quadraticCurveTo(x + 20 + o, y + 21, x + 28 + o, y + 26); c.moveTo(x + 34 - o, y + 46); c.quadraticCurveTo(x + 42 - o, y + 41, x + 50 - o, y + 46); c.stroke(); c.globalAlpha = 1; };

function msRing(g, I, col, alpha, outer, inner) { const [cv, s] = msCanvas(g, I, 1); s.fillStyle = col; s.beginPath(); outer(s); s.fill(); s.globalCompositeOperation = 'destination-out'; s.beginPath(); inner(s); s.fill(); msPut(g, cv, alpha); }
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
  const P = 64, rows = map.length, cols = map[0].length, w = cols * T + 2 * P, h = rows * T + 2 * P;
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
  const X0 = c0 * T - 44, X1 = (c1 + 1) * T + 44;
  if (!spans) maCopy(c, e, cv, X0, r0 * T - 64, X1, (r1 + 1) * T + 44, m, exact);
  else for (let r = Math.max(-1, r0 - 1); r <= Math.min(spans.length - 2, r1 + 1); r++) for (const [a, b] of spans[r + 1]) { const x0 = Math.max(a, X0), x1 = Math.min(b, X1); if (x1 > x0) maCopy(c, e, cv, x0, r * T, x1, r * T + T, m, exact); }
  if (exact) c.restore();
}
function maFind(c) {
  const m = c.getTransform(), k = Math.round(Math.hypot(m.a, m.b) * 1000) / 1000;
  if (c !== ctx) {      // a small map picture (lobby, map picker): painted, used for its three passes, then let go
    if (MA.temp && MA.temp.map === MAP && MA.temp.th === TH && MA.temp.kq === k) return MA.temp;
    return MA.temp = maPaint(k, MAP, TH);
  }
  MA.main = MA.main.filter(e => e.th === TH && e.rows === MAP.length);      // same map (a guest gets a new MAP array whenever walls change, so match by the map's colours)
  let e = MA.main.find(e => Math.abs(e.kq - k) < .002) || MA.main.find(e => e.kq / k > .97 && e.kq / k < 1.03);      // (kq: the size asked for; k: the size painted, smaller on very big maps)      // a tiny zoom change reuses the painting; otherwise it is painted again at the new size (a stretched copy costs more every frame)
  if (e && (e.map !== MAP || e.ver !== NET.mapVer)) {      // the map changed under the painting
    let back = false; for (let r = 0; r < e.rows && !back; r++) for (let cc = 0; cc < e.snap[r].length; cc++) if (MAP[r][cc] === '#' && e.snap[r][cc] !== '#') { back = true; break; }
    if (back) { MA.main.splice(MA.main.indexOf(e), 1); e = null; }      // a new match on the same map: walls are back, paint again
    else {      // walls knocked down: rubble, no repaint
      for (let r = 0; r < e.rows; r++) for (let cc = 0; cc < e.snap[r].length; cc++) if (e.snap[r][cc] === '#' && MAP[r][cc] !== '#') maRubble(e, cc, r);
      e.map = MAP; e.snap = MAP.map(r => typeof r === 'string' ? r : r.join('')); e.ver = NET.mapVer;
    }
  }
  if (!e) { while (MA.main.length >= (mobileMode() ? 1 : 2)) MA.main.shift(); e = maPaint(k, MAP, TH); MA.main.push(e); }      // phones keep one painting (memory); PCs two (lobby + match)
  return e;
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
      const x = cc * T, y = r * T, H = MAP_ART.H;
      c.fillStyle = '#2b6f8a'; c.beginPath(); c.roundRect(x + 2, y + T - H - 8, T - 4, H + 8, 6); c.fill();
      c.fillStyle = '#56b4e9'; c.beginPath(); c.roundRect(x + 2, y - H, T - 4, T - 4, 6); c.fill();
    }
  } else {
    maBlit(c, e, e.b, c0, c1, r0, r1, e.bs);
    for (let r = r0; r <= r1; r++) for (let cc = c0; cc <= c1; cc++) if (MAP[r][cc] === 'G' && typeof drawPlantTile === 'function') drawPlantTile(c, cc, r, cc * T, r * T);      // (정원사's bushes: gardener.js)
  }
  return true;
}
