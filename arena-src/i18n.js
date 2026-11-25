/* Languages (user 2026-11-23): 한국어, English, Français, Español, 日本語, 中文.
   The game's own texts stay Korean in the sources. This file turns them into the chosen language where they reach the screen:
   - text put into the page (a MutationObserver over text nodes and a few attributes),
   - text drawn on a canvas (fillText / strokeText / measureText),
   - alert / confirm / prompt.
   The table (i18n/dict.json, built in by build.js) is keyed by the Korean piece as tools/i18n/extract.js reads it from the sources:
   numbers are '#', and a text on screen is cut into the longest known pieces, so a text glued together from pieces and numbers is covered too.
   Only the chosen language's column is read. With 한국어 nothing here runs per text (no cost).
   The first language is the browser's; a language outside the six gives English. The choice from 설정 is kept in localStorage 'seum_lang'.
   tools/i18n/check.js fails when a Korean text in the sources has no entry: run it before every PR and add the missing lines. */
(() => {
  const LANGS = ['ko', 'en', 'fr', 'es', 'ja', 'zh'], NAMES = { ko: '한국어', en: 'English', fr: 'Français', es: 'Español', ja: '日本語', zh: '中文' };
  const DICT = /*@@I18N@@*/{};
  const KEY = 'seum_lang', HAN = /[가-힣]/, NUM = /\d+(?:[.,]\d+)*/g;
  const saved = () => { try { const v = localStorage.getItem(KEY); return LANGS.includes(v) ? v : 'auto'; } catch (e) { return 'auto'; } };
  const device = () => { const l = (navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || 'en']); for (const x of l) { const p = String(x).toLowerCase().slice(0, 2); if (LANGS.includes(p)) return p; } return 'en'; };
  let choice = saved(), lang = choice === 'auto' ? device() : choice;
  let col = -1, first = null, cache = new Map(); const keep = new Set(), miss = new Set();      // keep: names people typed (nicknames, chat, guild names): never translated
  function load() {      // the chosen language's column, indexed by the first character (longest piece first)
    col = LANGS.indexOf(lang) - 1; first = new Map(); cache = new Map();
    if (col < 0) return;
    for (const k in DICT) { const v = DICT[k][col]; if (v == null || v === '') continue; const c = k[0]; let a = first.get(c); if (!a) first.set(c, a = []); a.push([k, v, (k.match(/#/g) || []).length]); }
    for (const a of first.values()) a.sort((x, y) => y[0].length - x[0].length);
  }
  const latin = () => lang === 'en' || lang === 'fr' || lang === 'es';
  const isHan = c => c >= '가' && c <= '힣', isWord = c => /[0-9A-Za-zÀ-ÿ#]/.test(c);
  function cut(n) {      // n: the text with numbers as '#'. Gives the translated text (numbers still as \u0001 marks, in their new order)
    let out = '', i = 0, ni = 0, matched = false; const L = n.length, sp = latin();
    while (i < L) {
      const c = n[i], a = first.get(c); let hit = null;
      if (a && (matched || i === 0 || !isHan(n[i - 1]))) for (const e of a) { const k = e[0]; if (!n.startsWith(k, i)) continue; if (k.length === 1 && isHan(k) && ((i > 0 && isHan(n[i - 1]) && !matched) || (i + 1 < L && isHan(n[i + 1])))) continue; hit = e; break; }
      if (!hit) { if (c === '#') out += '\u0001' + (ni++) + '\u0002'; else { if (sp && matched && isWord(c) && /[A-Za-zÀ-ÿ]$/.test(out)) out += ' '; out += c; } matched = false; i++; continue; }
      let v = hit[1], glue = false; if (v[0] === '^') { glue = true; v = v.slice(1); }
      const base = ni; let seq = 0; v = v.replace(/\{(\d)\}|#/g, (m, d) => { const k = seq++; return '\u0001' + (base + (d != null ? +d : k)) + '\u0002'; }); ni += hit[2];      // '#': the number at the same place as in the Korean, {k}: the k-th one
      if (sp && !glue && out && /[0-9A-Za-zÀ-ÿ\u0002]$/.test(out) && /^[A-Za-zÀ-ÿ\u0001]/.test(v)) out += ' ';
      out += v; i += hit[0].length; matched = true;
    }
    return out;
  }
  function tr(s) {
    if (col < 0 || typeof s !== 'string' || !HAN.test(s)) return s;
    let r = cache.get(s); if (r !== undefined) return r;
    if (keep.has(s)) r = s;
    else {
      const nums = []; let n = s.replace(NUM, m => { nums.push(m); return '#'; });
      const holds = []; for (const k of keep) if (k.length > 1 && n.includes(k)) { n = n.split(k).join('\u0003' + holds.length + '\u0004'); holds.push(k); }      // a kept name inside a longer text
      r = cut(n).replace(/\u0001(\d+)\u0002/g, (m, d) => nums[+d] != null ? nums[+d] : '').replace(/\u0003(\d+)\u0004/g, (m, d) => holds[+d]);
    }
    if (HAN.test(r) && !keep.has(s) && miss.size < 300) miss.add(s);      // for tools/i18n/screens.js: texts that still show Korean
    if (cache.size > 6000) cache.clear(); cache.set(s, r); return r;
  }
  /* ---- the page ---- */
  const orig = new WeakMap(), ATTRS = ['placeholder', 'title', 'aria-label'], aorig = new WeakMap();
  const skip = el => { for (let e = el; e && e.nodeType === 1; e = e.parentNode) { const t = e.tagName; if (t === 'SCRIPT' || t === 'STYLE' || t === 'TEXTAREA' || e.hasAttribute('data-noi18n') || e.isContentEditable) return true; } return false; };
  function text(node) {
    const v = node.nodeValue; if (!v) return;
    if (HAN.test(v)) { if (skip(node.parentNode)) return; const t = col >= 0 ? tr(v) : v; orig.set(node, { o: v, t }); if (t !== v) { node.nodeValue = t; need(node.parentNode); } }
    else { const r = orig.get(node); if (r && r.t !== v) orig.delete(node); }      // the game wrote something else into this node
  }
  function attrs(el) {
    for (const a of ATTRS) { const v = el.getAttribute(a); if (v && HAN.test(v) && !skip(el)) { let o = aorig.get(el); if (!o) aorig.set(el, o = {}); o[a] = v; if (col >= 0) { const t = tr(v); if (t !== v) el.setAttribute(a, t); } } }
  }
  function walk(root, back) {
    if (root.nodeType === 3) { back ? restore(root) : text(root); return; }
    if (root.nodeType !== 1 && root.nodeType !== 9) return;
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT); let n = root.nodeType === 1 ? root : w.nextNode();
    for (; n; n = w.nextNode()) { if (n.nodeType === 3) back ? restore(n) : text(n); else { if (back) { const o = aorig.get(n); if (o) for (const a in o) n.setAttribute(a, o[a]); } attrs(n); } }
  }
  function restore(node) { const r = orig.get(node); if (r && node.nodeValue === r.t && r.t !== r.o) node.nodeValue = r.o; }
  const mo = new MutationObserver(list => {
    for (const m of list) {
      if (m.type === 'characterData') text(m.target);
      else if (m.type === 'attributes') { const el = m.target, v = el.getAttribute(m.attributeName); if (v && HAN.test(v)) attrs(el); }
      else for (const n of m.addedNodes) walk(n);
    }
  });
  function start() { if (!document.body) return; walk(document.documentElement); mo.observe(document.documentElement, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS }); document.documentElement.lang = lang === 'zh' ? 'zh-Hans' : lang; }
  /* ---- fitting: a translation is often longer than the Korean it replaces. A one-line text (or a button's text) that no longer fits
     its box gets a smaller font, down to 60%. Only translated texts are looked at, so 한국어 is never touched. ---- */
  const fitSt = new WeakMap(), fitQ = new Set(), rg = document.createRange(); let fitT = 0;
  const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(list => { for (const e of list) fitQ.add(e.target); fitSoon(); }) : null;
  const fitSoon = () => { if (!fitT) fitT = requestAnimationFrame(() => { fitT = 0; const l = [...fitQ]; fitQ.clear(); for (const el of l) fit(el); }); };
  function need(el) {
    if (!ro || !el || el.nodeType !== 1) return;
    if (!fitSt.has(el)) { if (getComputedStyle(el).whiteSpace !== 'nowrap' && !el.closest('button')) return; fitSt.set(el, { fs: el.style.fontSize, sig: '' }); ro.observe(el); }      // the observer also tells when a hidden window is opened
    fitQ.add(el); fitSoon();
  }
  function over(el) {
    if (el.clientWidth && el.scrollWidth > el.clientWidth + 1) { const o = getComputedStyle(el).overflowX; if (o === 'hidden' || o === 'clip') return true; }
    if (el.clientHeight && el.scrollHeight > el.clientHeight + 1 && el.closest('.skillBtn')) return true;      // a button name cut at its last line (line clamp)
    rg.selectNodeContents(el); const r = rg.getBoundingClientRect(); if (!r.width) return false;
    for (let a = el, i = 0; a && a !== document.body && i < 5; a = a.parentElement, i++) {
      const c = getComputedStyle(a); if (a !== el && (c.overflowX === 'auto' || c.overflowX === 'scroll')) return false;
      const clips = c.overflowX !== 'visible';
      if (clips || c.backgroundColor !== 'rgba(0, 0, 0, 0)' || parseFloat(c.borderLeftWidth) > 0) { const b = a.getBoundingClientRect(); if (r.right > b.right + 1 || r.left < b.left - 1) return true; }
      if (clips || c.position === 'absolute' || c.position === 'fixed') return false;      // a box of its own: nothing further out to fit into
    }
    return r.right > innerWidth + 1 || r.left < -1;
  }
  function fit(el) {
    const st = fitSt.get(el); if (!st || !el.isConnected || !el.getClientRects().length) return;
    const sig = el.textContent + '|' + innerWidth + '|' + innerHeight + '|' + (el.parentElement ? el.parentElement.clientWidth : 0) + '|' + lang; if (st.sig === sig) return; st.sig = sig;
    if (el.hasAttribute('data-fit')) { el.style.fontSize = st.fs; el.removeAttribute('data-fit'); }
    if (col < 0 || !over(el)) return;
    const base = parseFloat(getComputedStyle(el).fontSize) || 14; let k = 1;
    const lo = el.closest('.skillBtn') && (lang === 'ja' || lang === 'zh') ? 0.5 : 0.62;      // a long katakana word on a round button may go a little smaller rather than split
    do { k -= 0.07; el.style.fontSize = (base * k).toFixed(2) + 'px'; } while (k > lo && over(el));
    el.setAttribute('data-fit', '');
  }
  const unfit = () => { for (const el of document.querySelectorAll('[data-fit]')) { const st = fitSt.get(el); el.style.fontSize = st ? st.fs : ''; el.removeAttribute('data-fit'); if (st) st.sig = ''; } };
  addEventListener('resize', () => { for (const el of document.querySelectorAll('[data-fit]')) fitQ.add(el); fitSoon(); });
  /* ---- canvases and dialogs ---- */
  for (const C of [window.CanvasRenderingContext2D, window.OffscreenCanvasRenderingContext2D]) {
    if (!C) continue; const P = C.prototype;
    for (const f of ['fillText', 'strokeText', 'measureText']) { const o = P[f]; P[f] = function (s) { if (col >= 0 && typeof s === 'string' && HAN.test(s)) arguments[0] = tr(s); return o.apply(this, arguments); }; }
  }
  for (const f of ['alert', 'confirm', 'prompt']) { const o = window[f]; if (typeof o === 'function') window[f] = function (s) { if (typeof s === 'string') arguments[0] = tr(s); return o.apply(this, arguments); }; }
  /* ---- choosing ---- */
  function set(v) {
    choice = v === 'auto' || LANGS.includes(v) ? v : 'auto'; try { if (choice === 'auto') localStorage.removeItem(KEY); else localStorage.setItem(KEY, choice); } catch (e) { }
    const was = lang; lang = choice === 'auto' ? device() : choice;
    if (was !== lang) { unfit(); walk(document.documentElement, true); load(); walk(document.documentElement); document.documentElement.lang = lang === 'zh' ? 'zh-Hans' : lang; try { dispatchEvent(new Event('resize')); } catch (e) { } }
    for (const f of subs) try { f(lang, choice); } catch (e) { }
  }
  const subs = [];
  window.I18N = { tr, set, keep: s => { if (typeof s === 'string' && s && HAN.test(s) && !keep.has(s) && !/^게스트\d+$/.test(s)) { if (keep.size >= 400) keep.delete(keep.values().next().value); keep.add(s); cache.clear(); } }, miss, get lang() { return lang; }, get choice() { return choice; }, LANGS, NAMES, on: f => subs.push(f) };
  load();
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
  /* ---- 설정 > 언어 (the game's settings card; the site has its own small list) ---- */
  const ui = () => {
    const row = document.getElementById('setLangRow'); if (!row) return;
    const btn = row.querySelector('button'), cur = btn.firstElementChild, list = document.getElementById('setLangList');
    const label = c => c === 'auto' ? '자동 (기기 언어)' : NAMES[c];
    const paint = () => { cur.textContent = label(choice); cur.toggleAttribute('data-noi18n', choice !== 'auto'); for (const b of list.children) b.classList.toggle('on', b.dataset.lang === choice); };
    for (const c of ['auto', 'en', 'ko', 'fr', 'es', 'ja', 'zh']) { const b = document.createElement('button'); b.type = 'button'; b.dataset.lang = c; if (c !== 'auto') b.setAttribute('data-noi18n', ''); b.textContent = label(c); b.addEventListener('click', () => { set(c); close(); }); list.append(b); }
    const close = () => { list.hidden = true; btn.setAttribute('aria-expanded', 'false'); };
    btn.addEventListener('click', e => { e.stopPropagation(); if (!list.hidden) return close(); list.hidden = false; btn.setAttribute('aria-expanded', 'true');
      const r = btn.getBoundingClientRect(), low = innerHeight < 500; list.classList.toggle('two', low);
      if (low) { list.style.cssText = 'left:50%;top:50%;transform:translate(-50%,-50%);width:min(360px,calc(100vw - 24px))'; }
      else { list.style.cssText = 'left:' + r.left + 'px;width:' + r.width + 'px;' + (innerHeight - r.bottom > 300 ? 'top:' + (r.bottom + 4) + 'px' : 'bottom:' + (innerHeight - r.top + 4) + 'px'); } });
    document.addEventListener('click', e => { if (!list.hidden && !list.contains(e.target)) close(); });
    subs.push(paint); paint();
  };
  if (document.getElementById('setLangRow')) ui(); else document.addEventListener('DOMContentLoaded', ui);
})();
