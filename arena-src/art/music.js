/* ---------- background music: Kevin MacLeod, Creative Commons Attribution 4.0 ----------
   Lobby: "Pixelland". Match: "Just Nasty". The mp3 files (art/music/*.mp3, re-encoded small) are put into the page by build.js
   as base64 and only decoded when the first click/key press lets the browser play sound.
   It follows the game by itself (state 'menu' -> lobby song, 'play' -> match song, 'over' -> match song, quieter), obeys the
   "소리 켬/끔" button (muted) and has its own volume: window.SeumMusic.setVolume(0..1) / getVolume(), kept in localStorage 'seumArenaMusicVol'. */
const SeumMusic = (() => {
  const DATA = { lobby: '@@LOBBY@@', battle: '@@BATTLE@@' };
  const CREDIT = {
    lobby: { title: 'Pixelland' },
    battle: { title: 'Just Nasty' }
  };
  const LIC = 'Licensed under Creative Commons: By Attribution 4.0 License', LIC_URL = 'http://creativecommons.org/licenses/by/4.0/';
  const KEY = 'seumArenaMusicVol', GAIN = { lobby: .85, battle: .8 };   // (both songs were levelled to about the same loudness; this is the headroom under the sound effects)
  let vol = .5, ac = null, started = false, tracks = {}, want = null, lastWant = null, credEl = null, credHide = 0, matchCredAt = 0;
  try { const v = parseFloat(localStorage.getItem(KEY)); if (v >= 0 && v <= 1) vol = v; } catch (e) { }

  function b64Url(b64) {
    const bin = atob(b64), n = bin.length, u = new Uint8Array(n);
    for (let i = 0; i < n; i++) u[i] = bin.charCodeAt(i);
    return URL.createObjectURL(new Blob([u], { type: 'audio/mpeg' }));
  }
  function make(name) {
    if (!DATA[name]) return null;
    const a = new Audio(b64Url(DATA[name])); a.loop = true; a.preload = 'auto';
    const t = { name, a, g: null, on: false, off: 0 };
    try { const src = ac.createMediaElementSource(a); t.g = ac.createGain(); t.g.gain.value = 0; src.connect(t.g); t.g.connect(ac.destination); }
    catch (e) { t.g = null; a.volume = 0; }            // (no WebAudio: the element's own volume does the job)
    DATA[name] = null; return t;
  }
  function level(name) {
    let k = vol * (GAIN[name] || 1);
    if (typeof muted !== 'undefined' && muted) k = 0;
    if (document.hidden) k = 0;
    if (name === 'battle' && typeof state !== 'undefined' && state === 'over') k *= .45;
    return k;
  }
  function setLevel(t, k, fast) {
    if (t.g) t.g.gain.setTargetAtTime(k, ac.currentTime, fast ? .08 : .6);
    else t.a.volume = Math.max(0, Math.min(1, k));
  }
  let inited = false;
  function unlock() {
    for (const ev of ['pointerdown', 'keydown', 'touchend']) removeEventListener(ev, unlock, true);
    if (!inited) {
      inited = true;
      try { const C = window.AudioContext || window.webkitAudioContext; ac = new C(); } catch (e) { ac = null; }
      for (const n of ['lobby', 'battle']) { try { tracks[n] = make(n); } catch (e) { tracks[n] = null; } }
    }
    try { if (ac && ac.state !== 'running') ac.resume(); } catch (e) { }
    started = true; tick();
  }
  function play(t) {
    if (!t) return;
    t.on = true; clearTimeout(t.off);
    if (t.a.paused) { const p = t.a.play(); if (p && p.catch) p.catch(() => { t.on = false; arm(); }); }
  }
  function stop(t) {                                     // fade out, then really pause (saves the phone's battery)
    if (!t || !t.on) return;
    t.on = false; clearTimeout(t.off);
    t.off = setTimeout(() => { if (!t.on) try { t.a.pause(); } catch (e) { } }, 1800);
  }
  function arm() { started = false; for (const ev of ['pointerdown', 'keydown', 'touchend']) addEventListener(ev, unlock, true); }

  /* the credit line (the licence asks for it): the song's name, the artist and the licence */
  function ensureCred() {
    if (credEl) return credEl;
    const st = document.createElement('style');
    st.textContent = '#musicCredit{position:fixed;z-index:4;left:max(12px,env(safe-area-inset-left,0px));bottom:max(10px,env(safe-area-inset-bottom,0px));max-width:min(430px,60vw);'
      + 'font:11px/1.45 system-ui,-apple-system,"Segoe UI",sans-serif;color:rgba(255,255,255,.78);text-shadow:0 1px 3px rgba(0,0,0,.85);opacity:0;transition:opacity .6s;pointer-events:none}'
      + '#musicCredit.show{opacity:1}#musicCredit.match{left:50%;right:auto;transform:translateX(-50%);text-align:center;bottom:max(86px,env(safe-area-inset-bottom,0px))}'
      + '#musicCredit a{color:#9fd8ff;pointer-events:auto}#musicCredit.match a{pointer-events:none}'
      + '@media (max-width:600px){#musicCredit{left:50%;transform:translateX(-50%);max-width:calc(100vw - 24px);width:max-content;font-size:9.5px;line-height:1.35;text-align:center;bottom:max(4px,env(safe-area-inset-bottom,0px))}#musicCredit.match{bottom:max(150px,env(safe-area-inset-bottom,0px))}}'
      + '@media (max-height:500px) and (orientation:landscape){#musicCredit{left:auto;right:max(8px,env(safe-area-inset-right,0px));transform:none;text-align:right;max-width:52vw;font-size:8px;line-height:1.3;bottom:3px}#musicCredit.match{bottom:max(70px,env(safe-area-inset-bottom,0px));right:50%;transform:translateX(50%);text-align:center}}'
      + '@media (max-height:500px) and (min-width:701px) and (orientation:landscape){#musicCredit{right:auto;left:190px;text-align:left;max-width:290px;font-size:9px;bottom:4px}}';
    document.head.append(st);
    credEl = document.createElement('div'); credEl.id = 'musicCredit'; document.body.append(credEl); return credEl;
  }
  function credLine(title) {
    const d = document.createElement('div'); d.textContent = '"' + title + '" Kevin MacLeod (';
    const a = document.createElement('a'); a.href = 'https://incompetech.com'; a.target = '_blank'; a.rel = 'noopener noreferrer'; a.textContent = 'incompetech.com'; d.append(a, ')'); return d;
  }
  function licLines(el) {
    const d = document.createElement('div'); d.textContent = LIC; el.append(d);
    const u = document.createElement('div'), a = document.createElement('a'); a.href = LIC_URL; a.target = '_blank'; a.rel = 'noopener noreferrer'; a.textContent = LIC_URL; u.append(a); el.append(u);
  }
  function setCred(mode) {                               // 'lobby' (both songs, stays) | 'match' (the match song, a few seconds) | null
    const el = ensureCred();
    if (el.dataset.mode === String(mode)) return;
    el.dataset.mode = String(mode); el.textContent = '';
    el.classList.toggle('match', mode === 'match');
    if (mode === 'lobby') { el.append(credLine('Just Nasty'), credLine('Pixelland')); licLines(el); }
    else if (mode === 'match') { el.append(credLine('Just Nasty')); licLines(el); }
    el.classList.toggle('show', !!mode);
  }

  function tick() {
    const st = typeof state !== 'undefined' ? state : 'menu';
    const brand = document.getElementById('brandDisplay');
    const lobbyMain = st === 'menu' && (!brand || brand.classList.contains('show'));
    want = st === 'menu' ? 'lobby' : 'battle';
    if (started) {
      for (const n of ['lobby', 'battle']) {
        const t = tracks[n]; if (!t) continue;
        const k = want === n ? level(n) : 0;
        if (want === n && k > 0) play(t); else if (k === 0 && (want !== n || document.hidden)) stop(t);
        setLevel(t, k, document.hidden);
      }
    }
    // credit text
    if (lobbyMain) { setCred('lobby'); matchCredAt = 0; }
    else setCred(null);      // no credit text during a match (it stays on the lobby screen)
    lastWant = want;
  }
  arm();
  setInterval(tick, 200);
  document.addEventListener('visibilitychange', tick);
  return {
    getVolume: () => vol,
    setVolume(v) { v = +v; if (!(v >= 0)) v = 0; vol = Math.min(1, v); try { localStorage.setItem(KEY, String(vol)); } catch (e) { } tick(); },
    get playing() { return want; }, get started() { return started; }, get tracks() { return tracks; }
  };
})();
window.SeumMusic = SeumMusic;
