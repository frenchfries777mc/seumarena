/* ---------- background music: Kevin MacLeod, Creative Commons Attribution 4.0 ----------
   Lobby: "Pixelland". Match: "Just Nasty". The mp3 files (art/music/*.mp3, re-encoded small) are put into the page by build.js
   as base64 only when EMBED_MUSIC=1 (standalone file); the normal build leaves the file paths here instead (arena-src/art/music/*.mp3,
   next to index.html) and the songs are downloaded in the background a moment after the page is up, lobby first, so a slow connection
   shows the game first and the music joins when it has arrived. Played when the first click/key press lets the browser play sound.
   It follows the game by itself (state 'menu' -> lobby song, 'play' -> match song, 'over' -> match song, quieter), obeys the
   "소리 켬/끔" button (muted) and has its own volume: window.SeumMusic.setVolume(0..1) / getVolume(), kept in localStorage 'seumArenaMusicVol'. */
const SeumMusic = (() => {
  const DATA = { lobby: '@@LOBBY@@', battle: '@@BATTLE@@', result: '@@RESULT@@', win: '@@WIN@@' };
  const LIC = 'Licensed under Creative Commons: By Attribution 4.0 License', LIC_URL = 'http://creativecommons.org/licenses/by/4.0/';
  const KEY = 'seumArenaMusicVol', GAIN = { lobby: .85, battle: .8, result: 1.42, win: 1.42 };   /* win: "Pixel Peeker Polka - faster", the result screen after a win */   /* result: "Cruising for Goblins" (not a win), only while the match result screen is up */   // (both songs were levelled to about the same loudness; this is the headroom under the sound effects)
  let vol = .5, ac = null, started = false, tracks = {}, want = null, lastWant = null, credEl = null, credHide = 0, matchCredAt = 0;
  try { const v = parseFloat(localStorage.getItem(KEY)); if (v >= 0 && v <= 1) vol = v; } catch (e) { }

  function b64Url(b64) {
    const bin = atob(b64), n = bin.length, u = new Uint8Array(n);
    for (let i = 0; i < n; i++) u[i] = bin.charCodeAt(i);
    return URL.createObjectURL(new Blob([u], { type: 'audio/mpeg' }));
  }
  /* songs given as a file path: fetched whole (so the app's offline cache keeps them), one at a time, a little after the page is up */
  const blobs = {}, waiting = {};
  const isPath = d => typeof d === 'string' && /\.mp3$/.test(d);
  const IOS = /iP(hone|ad|od)/.test(navigator.userAgent) || (/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1);      // iPhone/iPad: an <audio> sent through WebAudio can show as playing with no sound, so the songs play straight from the <audio> (iOS ignores .volume: muted / 0 only)
  const FILE = location.protocol === 'file:';      // page opened straight from the disk: fetch() is blocked there, so the <audio> loads the path itself (no WebAudio: it would play silence for a file:// song)
  function fetchSong(name, tries) {
    if (FILE) { blobs[name] = DATA[name]; if (waiting[name]) { waiting[name] = 0; if (inited) { tracks[name] = make(name); tick(); arm(); } } return Promise.resolve(); }
    return fetch(DATA[name]).then(r => { if (!r.ok) throw 0; return r.blob(); })
      .then(b => { blobs[name] = URL.createObjectURL(b); if (waiting[name]) { waiting[name] = 0; if (inited) { tracks[name] = make(name); tick(); arm(); } } })
      .catch(() => new Promise(r => setTimeout(r, 8000 * (tries + 1))).then(() => tries < 4 && fetchSong(name, tries + 1)));
  }
  let fetching = null;
  function fetchAll() { if (!fetching) fetching = (async () => { for (const n of NAMES) if (isPath(DATA[n]) && !blobs[n]) await fetchSong(n, 0); })().finally(() => { if (NAMES.some(n => isPath(DATA[n]) && !blobs[n])) fetching = null; }); return fetching; }      // (a song still missing after the tries: the next request starts over instead of never again)
  if (isPath(DATA.lobby)) {
    const go = () => setTimeout(fetchAll, 1500);
    if (document.readyState === 'complete') go(); else addEventListener('load', go, { once: true });
  }
  const NAMES = ['lobby', 'battle', 'result', 'win'];
  function make(name) {
    if (!DATA[name]) return null;
    let url;
    if (isPath(DATA[name])) { if (!blobs[name]) { waiting[name] = 1; fetchAll(); return null; } url = blobs[name]; }
    else url = b64Url(DATA[name]);
    const a = new Audio(url); a.loop = true; a.preload = 'auto';
    const t = { name, a, g: null, on: false, off: 0 };
    /* a pause the game did not ask for (the phone's own media controls, a call, the lock screen): leave it paused until the player comes back to the game or touches it (user 2026-11-21) */
    a.addEventListener('pause', () => { if (t.self) { t.self = 0; return; } if (t.on) t.held = true; });
    a.addEventListener('play', () => { t.self = 0; });
    try { if ((FILE && isPath(DATA[name])) || IOS) throw 0; const src = ac.createMediaElementSource(a); t.g = ac.createGain(); t.g.gain.value = 0; src.connect(t.g); t.g.connect(ac.destination); }
    catch (e) { t.g = null; a.volume = 0; }            // (no WebAudio: the element's own volume does the job)
    DATA[name] = null; return t;
  }
  function level(name) {
    let k = vol * (GAIN[name] || 1);
    if (typeof muted !== 'undefined' && muted) k = 0;
    if (name === 'battle' && typeof state !== 'undefined' && state === 'over') k *= .45;      // (only until the result song has arrived)
    return k;
  }
  function setLevel(t, k, fast) {
    if (t.g) t.g.gain.setTargetAtTime(k, ac.currentTime, fast ? .08 : .6);
    else { t.a.volume = Math.max(0, Math.min(1, k)); t.a.muted = k <= 0; }
  }
  /* Phones only let sound start inside a real tap: pointerup / touchend / click / keydown (pointerdown of a finger does NOT count,
     which is why the music never started on phones before). So every tap tries again until the wanted song is really playing,
     and on the first tap each song is started once at volume 0 and paused ("primed"), so later switches lobby <-> match work without a tap. */
  const GESTURES = ['pointerup', 'touchend', 'click', 'keydown', 'mousedown'];
  let inited = false, armed = false;
  let away = false;                                      // phone: the game is hidden (another app, the home screen, another tab)
  const phone = () => IOS || (typeof mobileMode === 'function' && mobileMode());
  function pz(t) { try { if (!t.a.paused) { t.self = 1; t.a.pause(); } } catch (e) { } }
  function prime(t) {
    if (!t || t.primed || t.on || IOS) return;      // iPhone/iPad: starting the other songs (even muted) can stop the one that plays; there a song that could not start waits for the next tap instead
    t.primed = 1;
    try { const p = t.a.play(); if (p && p.then) p.then(() => { if (!t.on) pz(t); }, () => { t.primed = 0; }); else if (!t.on) pz(t); } catch (e) { t.primed = 0; }
  }
  function unlock() {
    if (!inited) {
      inited = true;
      try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) { }   // iPhone: music also plays with the ring/silent switch on silent
      try { const C = window.AudioContext || window.webkitAudioContext; ac = new C(); } catch (e) { ac = null; }
      for (const n of NAMES) { try { tracks[n] = make(n); } catch (e) { tracks[n] = null; } }
    }
    try { if (ac && ac.state !== 'running') ac.resume(); } catch (e) { }
    started = true; tick();
    for (const n in tracks) if (tracks[n] && n !== want) prime(tracks[n]);
    if (ok()) disarm();
  }
  function ok() {                                         // done with taps once the sound system runs and every song exists, is primed or playing
    if (ac && ac.state !== 'running') return false;
    for (const n of NAMES) { const t = tracks[n]; if (DATA[n] || waiting[n] || (t && !IOS && !t.primed && !(t.on && !t.a.paused))) return false; }
    return true;
  }
  function play(t) {
    if (!t) return;
    t.on = true; clearTimeout(t.off);
    if (away || t.held) return;
    if (t.a.paused) { const p = t.a.play(); if (p && p.then) p.then(() => { t.primed = 1; }, e => { lastErr = t.name + ': ' + (e && e.name || e); t.on = false; started = false; arm(); }); else t.primed = 1; }
  }
  function stop(t) {                                     // fade out, then really pause (saves the phone's battery)
    if (!t || !t.on) return;
    t.on = false; clearTimeout(t.off);
    t.off = setTimeout(() => { if (!t.on) pz(t); }, 1800);
  }
  function arm() { if (armed) return; armed = true; for (const ev of GESTURES) addEventListener(ev, unlock, true); }
  function disarm() { if (!armed) return; armed = false; for (const ev of GESTURES) removeEventListener(ev, unlock, true); }

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
  const CRED_SONGS = ['Pixelland', 'Just Nasty', 'Pixel Peeker Polka - faster', 'Cruising for Goblins'];
  /* fonts and the online library (itch release, user 2026-11-21 "빠진건 넣고"): loaded from their own hosts, named here */
  const CRED_MORE = ['Fonts: Rajdhani (Indian Type Foundry), IBM Plex Sans KR (IBM), Black Han Sans (Zess Type) · SIL Open Font License 1.1', 'PeerJS · MIT License'];
  function fillCredits(el) { el.textContent = ''; el.append(...CRED_SONGS.map(credLine)); licLines(el); for (const t of CRED_MORE) { const d = document.createElement('div'); d.textContent = t; el.append(d); } }
  function setCred(mode) {                               // 'lobby' (both songs, stays) | 'match' (the match song, a few seconds) | null
    const el = ensureCred();
    if (el.dataset.mode === String(mode)) return;
    el.dataset.mode = String(mode); el.textContent = '';
    el.classList.toggle('match', mode === 'match');
    if (mode === 'lobby') { el.append(...CRED_SONGS.map(credLine)); licLines(el); }
    else if (mode === 'match') { el.append(credLine('Just Nasty')); licLines(el); }
    el.classList.toggle('show', !!mode);
  }

  function tick() {
    const st = typeof state !== 'undefined' ? state : 'menu';
    const brand = document.getElementById('brandDisplay');
    const lobbyMain = st === 'menu' && (!brand || brand.classList.contains('show'));
    const ov = document.getElementById('overScreen'), lb = document.getElementById('lobby');
    const result = !!(ov && ov.classList.contains('active') && (!lb || !lb.hidden) && st !== 'menu');      // the result screen is showing (also a knocked-out player's own result while the match goes on; not while watching)
    const rtEl = document.getElementById('resultText'), won = !!(rtEl && rtEl.dataset.won === '1');      // a win by the game's own rule (1st, or 원 레프트/리워드 헌터 2-3등)
    want = st === 'menu' ? 'lobby' : result && won && tracks.win ? 'win' : result && tracks.result ? 'result' : 'battle';
    if ((want === 'result' || want === 'win') && lastWant !== want && tracks[want]) { try { tracks[want].a.currentTime = 0; } catch (e) { } }      // from the start every time
    if (started) {
      for (const n of NAMES) {
        const t = tracks[n]; if (!t) continue;
        const k = want === n ? level(n) : 0;
        if (want === n && k > 0) play(t); else if (k === 0) stop(t);
        setLevel(t, k, false);
      }
    }
    // credit text
    setCred(null); matchCredAt = 0;      // credits live in 설정 > 크레딧 now (user 2026-11-16), none on the lobby
    lastWant = want;
  }
  let lastErr = ''; const volLog = [];
  /* sound check for a real phone: open the page with ?sounddebug and a small box shows what the music is doing (nothing shows without it) */
  if (/[?&]sounddebug/.test(location.search)) addEventListener('load', () => { const d = document.createElement('pre'); d.style.cssText = 'position:fixed;z-index:99999;left:4px;top:4px;margin:0;padding:6px;font:11px/1.3 monospace;color:#fff;background:rgba(0,0,0,.8);pointer-events:none;white-space:pre';
    document.body.append(d); setInterval(() => { const L = ['ios ' + IOS + '  file ' + FILE + '  started ' + started + '  armed ' + armed + '  want ' + want, 'music ac ' + (ac ? ac.state : '-') + '  fx ac ' + (typeof window.__fxac === 'function' ? window.__fxac() : '-'), 'vol ' + vol + '  muted ' + (typeof muted !== 'undefined' && muted)];
      for (const n of NAMES) { const t = tracks[n]; L.push(n + ': ' + (t ? (t.a.paused ? 'paused' : 'PLAYING') + ' t=' + t.a.currentTime.toFixed(1) + ' ready=' + t.a.readyState + ' net=' + t.a.networkState + ' err=' + (t.a.error ? t.a.error.code : '-') + ' muted=' + t.a.muted + ' on=' + t.on : (blobs[n] ? 'loaded, not made' : waiting[n] ? 'waiting' : DATA[n] ? 'not loaded' : 'none'))); }
      L.push('last play error: ' + (lastErr || '-'));
      let raw = '?', mv = '?', sv = '?'; try { raw = localStorage.getItem('seumArenaSet'); mv = localStorage.getItem(KEY); } catch (e) { raw = mv = 'storage blocked'; }
      try { sv = SET.vol + ' (' + typeof SET.vol + ')'; } catch (e) { sv = 'no SET'; }
      L.push('SET.vol ' + sv + '  saved music ' + mv, 'saved set ' + String(raw).slice(0, 90), 'setVolume calls ' + volLog.length + ': ' + volLog.slice(-6).join(' '));
      d.textContent = L.join('\n'); }, 300); });
  arm();
  setInterval(tick, 200);
  /* PC, background tab: keep playing (user request 2026-11-15); if the browser suspended the sound anyway, start it again.
     Phone (user 2026-11-21): the song stops while the game is hidden and goes on from the same spot on coming back. */
  const free = () => { for (const n in tracks) if (tracks[n]) tracks[n].held = false; };
  const wake = () => { if (document.hidden && phone()) return; away = false; free();
    try { if (ac && ac.state !== 'running' && ac.state !== 'closed') ac.resume().catch(() => {}); } catch (e) { }
    for (const n in tracks) { const t = tracks[n]; if (t && t.on && t.a.paused) try { const p = t.a.play(); if (p && p.catch) p.catch(() => {}); } catch (e) { } } };
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && phone()) { away = true; for (const n in tracks) if (tracks[n]) pz(tracks[n]); return; }
    wake(); if (!document.hidden && inited && ac && ac.state !== 'running') arm(); tick(); });
  addEventListener('pagehide', () => { if (phone()) { away = true; for (const n in tracks) if (tracks[n]) pz(tracks[n]); } });
  addEventListener('pointerdown', free, true);
  addEventListener('pageshow', wake); addEventListener('focus', wake);
  return {
    fillCredits,
    getVolume: () => vol,
    setVolume(v) { volLog.push(String(v)); v = +v; if (!(v >= 0)) v = 0; vol = Math.min(1, v); try { localStorage.setItem(KEY, String(vol)); } catch (e) { } tick(); },
    get playing() { return want; }, get started() { return started; }, get tracks() { return tracks; }
  };
})();
window.SeumMusic = SeumMusic;
