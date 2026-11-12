/* ---------- launch intro (mockup #14 "한 줄", approved 2026-11-12) ----------
   Plays once when the page opens: black screen, one white line, a stick figure rises out of it and runs, the letters stand up
   behind him, one red stroke colours the second half. 5 s, then it fades into the lobby. A tap / click / key skips it.
   The title is read from the lobby brand (<h1>Seum<span>Arena</span>), so renaming the game there renames the intro too.
   Sound only plays where the browser already allows it (no tap yet = silent; the lobby music still starts on the first tap). */
{
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const h1 = document.querySelector('#brandDisplay h1'), sp = h1 && h1.querySelector('span');
  const TT = sp ? [h1.textContent.slice(0, h1.textContent.length - sp.textContent.length), sp.textContent] : ['Seum', 'Arena'];
  if (!reduce && !window.__noIntro) {
    const DUR = 5, FADE = .45, ACC = '#ff4d4d', TF = 'Rajdhani, "Black Han Sans", "IBM Plex Sans KR", sans-serif';
    const cvI = document.createElement('canvas'), c = cvI.getContext('2d');
    cvI.id = 'introCv'; cvI.setAttribute('aria-label', TT.join(''));
    cvI.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;z-index:99999;background:#060608;touch-action:none;cursor:pointer;opacity:1;transition:opacity ' + FADE + 's';
    document.body.appendChild(cvI);
    const cl = v => v < 0 ? 0 : v > 1 ? 1 : v, seg = (t, a, b) => cl((t - a) / (b - a)), lerp = (a, b, q) => a + (b - a) * q;
    const eOut = q => 1 - Math.pow(1 - q, 3), eInOut = q => q < .5 ? 4 * q * q * q : 1 - Math.pow(-2 * q + 2, 3) / 2;
    const eBack = q => { const a = 1.9, b = a + 1; return 1 + b * Math.pow(q - 1, 3) + a * Math.pow(q - 1, 2); };
    /* sound */
    let ac = null; try { const AC = window.AudioContext || window.webkitAudioContext; ac = new AC(); } catch (e) { }
    const tone = (f, d, o) => {
      if (!ac || ac.state !== 'running') return; o = o || {};
      try {
        const t = ac.currentTime + (o.at || 0), os = ac.createOscillator(), g = ac.createGain(), v = (o.vol || .1) * (typeof SET === 'object' ? SET.vol / 100 : 1);
        if (v <= 0) return;
        os.type = o.type || 'sine'; os.frequency.setValueAtTime(f, t); if (o.slide) os.frequency.exponentialRampToValueAtTime(f * o.slide, t + d);
        g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(v, t + (o.att || .005)); g.gain.exponentialRampToValueAtTime(.0001, t + d);
        os.connect(g); g.connect(ac.destination); os.start(t); os.stop(t + d + .05);
      } catch (e) { }
    };
    const noiseHi = (d, vol) => { if (!ac || ac.state !== 'running') return; try { const n = Math.floor(ac.sampleRate * d), b = ac.createBuffer(1, n, ac.sampleRate), x = b.getChannelData(0); for (let i = 0; i < n; i++) x[i] = (Math.random() * 2 - 1) * (1 - i / n); const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(); f.type = 'highpass'; f.frequency.value = 4000; g.gain.value = vol * (typeof SET === 'object' ? SET.vol / 100 : 1); s.buffer = b; s.connect(f); f.connect(g); g.connect(ac.destination); s.start(); } catch (e) { } };
    const RISE = .7, RUN0 = 1.1, RUN1 = 2.5, SLASH = 2.75;
    const cues = [[.05, () => tone(440, .7, { vol: .05, att: .3 })], [RISE, () => tone(660, .25, { type: 'triangle', vol: .08, slide: 1.5 })]];
    for (let i = 0; i < 12; i++) cues.push([RUN0 + i * .115, () => { tone(180, .03, { vol: .12 }); tone(523 * Math.pow(2, i / 12), .12, { type: 'triangle', vol: .04 }); }]);
    cues.push([SLASH, () => { tone(2600, .5, { slide: 1.4, vol: .07 }); noiseHi(.35, .18); }]);
    cues.push([SLASH + .25, () => [220, 330, 440, 554].forEach(f => tone(f, 2.2, { vol: .055, att: .05 }))]);
    /* a bare stick figure */
    const man = (x, y, s, ph, run) => {
      c.save(); c.translate(x, y); c.scale(s, s); c.strokeStyle = c.fillStyle = '#fff'; c.lineWidth = 4.5; c.lineCap = 'round'; c.lineJoin = 'round';
      const sw = Math.sin(ph) * run, kx = Math.cos(ph) * run; c.rotate(run * .22);
      c.beginPath(); c.moveTo(0, -22); c.lineTo(sw * 13, -10 - Math.max(0, kx) * 4); c.lineTo(sw * 15 - 3 * run, -Math.max(0, -kx) * 7 * run); c.stroke();
      c.beginPath(); c.moveTo(0, -22); c.lineTo(-sw * 13, -10 - Math.max(0, -kx) * 4); c.lineTo(-sw * 15 - 3 * run, -Math.max(0, kx) * 7 * run); c.stroke();
      c.beginPath(); c.moveTo(0, -22); c.lineTo(0, -42); c.stroke();
      c.beginPath(); c.moveTo(0, -38); c.lineTo(-sw * 12 + 3, -28); c.lineTo(-sw * 16 + 9 * run, -24 - 4 * run); c.stroke();
      c.beginPath(); c.moveTo(0, -38); c.lineTo(sw * 12 + 3, -28); c.lineTo(sw * 16 + 9 * run, -24 - 4 * run); c.stroke();
      c.beginPath(); c.arc(0, -52, 9, 0, 7); c.fill(); c.restore();
    };
    const twinkle = (x, y, r, a) => { c.save(); c.globalAlpha = a; c.fillStyle = '#fff'; c.beginPath(); c.moveTo(x, y - r); c.quadraticCurveTo(x, y, x + r, y); c.quadraticCurveTo(x, y, x, y + r); c.quadraticCurveTo(x, y, x - r, y); c.quadraticCurveTo(x, y, x, y - r); c.fill(); c.restore(); };
    let t0 = 0, ci = 0, done = false, raf = 0;
    const frame = now => {
      if (done) return; raf = requestAnimationFrame(frame);
      if (!t0) t0 = now; const t = (now - t0) / 1000;
      while (ci < cues.length && cues[ci][0] <= t) cues[ci++][1]();
      const dpr = Math.min(2, devicePixelRatio || 1), W = innerWidth, H = innerHeight;
      if (cvI.width !== Math.round(W * dpr) || cvI.height !== Math.round(H * dpr)) { cvI.width = Math.round(W * dpr); cvI.height = Math.round(H * dpr); }
      c.setTransform(dpr, 0, 0, dpr, 0, 0); c.fillStyle = '#060608'; c.fillRect(0, 0, W, H);
      const port = H > W * 1.05, k = port ? Math.min(W / 780, H / 620) : Math.min(W / 1000, H / 620), cx = W / 2, cy = H / 2;
      c.font = '700 100px ' + TF; const a100 = c.measureText(TT[0]).width, w100 = a100 + c.measureText(TT[1]).width;
      const px = Math.min(190 * k, W * (port ? .8 : .7) / (w100 / 100)), mw = w100 * px / 100, ma = a100 * px / 100, ly = cy + px * .36, ty = ly - px * .37;
      const xs = cx - mw / 2 - 50 * k, xe = Math.min(W - 30 * k, cx + mw / 2 + 55 * k);
      const rq = seg(t, RUN0, RUN1), rx = lerp(xs, xe, rq < .5 ? 2 * rq * rq : 1 - Math.pow(-2 * rq + 2, 2) / 2);
      const tip = t < RISE ? lerp(0, xs, eInOut(seg(t, 0, RISE))) : t < SLASH ? Math.max(xs, rx) : lerp(xe, W, eOut(seg(t, SLASH, SLASH + .5)));
      c.strokeStyle = '#fff'; c.lineWidth = 3 * k; c.lineCap = 'round'; c.shadowColor = '#fff'; c.shadowBlur = 8 * k;
      c.beginPath(); c.moveTo(0, ly); c.lineTo(tip, ly); c.stroke(); c.shadowBlur = 0;
      /* letters */
      const red = eOut(seg(t, SLASH, SLASH + .28));
      c.save(); c.beginPath(); c.rect(0, 0, W, ly - 1.5 * k); c.clip(); c.font = '700 ' + px + 'px ' + TF; c.textAlign = 'left'; c.textBaseline = 'middle';
      let lx = cx - mw / 2;
      for (let p = 0; p < 2; p++) for (const ch of TT[p]) {
        const w = c.measureText(ch).width, q = eBack(cl((rx - lx - w * .3) / (70 * k)));
        if (q > 0 && t >= RUN0) {
          const y = ty + (1 - q) * px * .95; c.fillStyle = '#fff'; c.fillText(ch, lx, y);
          if (p && red > 0) { c.save(); c.beginPath(); c.rect(lerp(cx + mw / 2, cx - mw / 2 + ma, red) - 2, 0, W, H); c.clip(); c.fillStyle = ACC; c.shadowColor = ACC; c.shadowBlur = 24 * k * (1 - seg(t, SLASH + .3, SLASH + 1.2) * .6); c.fillText(ch, lx, y); c.restore(); }
        }
        lx += w;
      }
      c.restore();
      if (t > SLASH && t < SLASH + .6) { const a = 1 - seg(t, SLASH + .15, SLASH + .6), xa = cx + mw / 2 + 30 * k, xb = lerp(xa, cx - mw / 2 + ma - 20 * k, red); c.save(); c.globalAlpha = a; c.strokeStyle = '#ff8a8a'; c.shadowColor = ACC; c.shadowBlur = 20 * k; c.lineWidth = 6 * k; c.beginPath(); c.moveTo(xa, ty - px * .45); c.lineTo(xb, ty + px * .3); c.stroke(); c.restore(); }
      /* the runner */
      if (t > RISE) {
        const ms = (port ? 1.5 : 1.9) * k, up = eBack(seg(t, RISE, RISE + .3)), running = t > RUN0 && t < RUN1, jq = seg(t, RUN1, SLASH + .1), mid = jq > 0 && jq < 1;
        const jump = Math.sin(jq * Math.PI) * 60 * k, x = t < RUN0 ? xs : rx;
        c.save(); c.shadowColor = '#fff'; c.shadowBlur = 10 * k; c.translate(x, ly - jump); c.scale(1, up); if (mid) c.rotate(jq * 6.283);
        man(0, mid ? 26 * ms : 0, ms, running ? t * 17 : 0, running ? 1 : mid ? .6 : 0); c.restore();
      }
      if (t > 3.4) { const tw = ((t - 3.4) * .8) % 1; twinkle(cx - mw / 2 + ma * .06 + mw * tw, ty - px * .42, 12 * k * Math.sin(tw * Math.PI), Math.sin(tw * Math.PI)); }
      if (t >= DUR) end();
    };
    const end = () => {
      if (done) return; done = true; cancelAnimationFrame(raf); cvI.style.opacity = '0'; cvI.style.pointerEvents = 'none';
      for (const ev of ['keydown']) removeEventListener(ev, skipKey, true);
      setTimeout(() => { cvI.remove(); try { if (ac) ac.close(); } catch (e) { } }, FADE * 1000 + 50);
    };
    const skip = e => { e.preventDefault(); e.stopPropagation(); end(); };
    const skipKey = e => { if (!done) { e.preventDefault(); e.stopPropagation(); end(); } };
    cvI.addEventListener('pointerdown', skip); cvI.addEventListener('touchstart', e => e.preventDefault(), { passive: false });
    addEventListener('keydown', skipKey, true);
    let go = false; const start = () => { if (!go) { go = true; raf = requestAnimationFrame(frame); } };
    try { document.fonts.load('700 100px Rajdhani').then(start, start); } catch (e) { start(); }
    setTimeout(start, 900);
  }
}
