/* Pulls every Korean piece of text out of the game and site sources (string literals, template pieces, HTML text and attributes),
   the way the running translator (arena-src/i18n.js) looks them up: numbers become '#', tags and ${...} split a text into pieces.
   Used by check.js (is everything translated?) and when new texts are added. */
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..', '..');
const HAN = /[가-힣]/;
const norm = s => s.replace(/\d+(?:[.,]\d+)*/g, '#').replace(/\s+/g, ' ').trim();
function pieces(s, out) {      // one literal -> the pieces between tags, entities, line breaks
  for (const m of s.matchAll(/(?:placeholder|title|aria-label|alt)=\\?["']([^"'<>\\]*)/g)) { const k = norm(m[1]); if (HAN.test(k)) out.add(k); }      // attribute texts inside a tag written in a string
  for (const p of s.split(/<[^>]*>|&[a-z]+;|\\n|\n|\$\{[^}]*\}/)) { const k = norm(p.replace(/\\(['"`\\])/g, '$1')); if (HAN.test(k)) out.add(k); }
}
function fromJs(src, out) {      // a small lexer: comments are skipped, strings and template pieces are read
  let i = 0; const n = src.length; let prev = '';
  const str = q => { let s = ''; i++; while (i < n && src[i] !== q) { if (src[i] === '\\') { s += src[i] + (src[i + 1] || ''); i += 2; continue; } if (src[i] === '\n' && q !== '`') break; s += src[i++]; } i++; return s; };
  const tpl = () => { let s = ''; i++; while (i < n && src[i] !== '`') { if (src[i] === '\\') { s += src[i] + (src[i + 1] || ''); i += 2; continue; }
      if (src[i] === '$' && src[i + 1] === '{') { let d = 1, j = i + 2, inner = ''; while (j < n && d > 0) { if (src[j] === '{') d++; else if (src[j] === '}') d--; if (d > 0) inner += src[j]; j++; } fromJs(inner, out); s += '\n'; i = j; continue; }
      s += src[i++]; } i++; return s; };
  while (i < n) { const c = src[i], d = src[i + 1];
    if (c === '/' && d === '/') { while (i < n && src[i] !== '\n') i++; continue; }
    if (c === '/' && d === '*') { i = src.indexOf('*/', i + 2); i = i < 0 ? n : i + 2; continue; }
    if (c === "'" || c === '"') { pieces(str(c), out); prev = 'x'; continue; }
    if (c === '`') { pieces(tpl(), out); prev = 'x'; continue; }
    if (c === '/' && /[(,=:[!&|?{};\n]/.test(prev || '(')) { i++; let cls = false; while (i < n && (src[i] !== '/' || cls) && src[i] !== '\n') { if (src[i] === '\\') i++; else if (src[i] === '[') cls = true; else if (src[i] === ']') cls = false; i++; } i++; prev = 'x'; continue; }      // a regular expression
    if (!/\s/.test(c)) prev = c; i++; }
}
function fromHtml(src, out) {
  src = src.replace(/<!--[\s\S]*?-->/g, '').replace(/<style[\s\S]*?<\/style>/g, '');
  src = src.replace(/<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/g, (m, js) => { fromJs(js, out); return ''; });
  for (const m of src.matchAll(/(?:placeholder|title|aria-label|alt|value|content)="([^"]*)"/g)) pieces(m[1], out);
  pieces(src.replace(/<[^>]*>/g, '\n'), out);
}
const FILES = () => { const A = path.join(ROOT, 'arena-src'), S = fs.existsSync(path.join(ROOT, 'site-src')) ? path.join(ROOT, 'site-src') : path.join(ROOT, 'site');
  const js = d => fs.readdirSync(d).filter(f => /\.js$/.test(f) && !/^(bundle|build|test-|i18n)/.test(f)).map(f => path.join(d, f));
  return { game: [path.join(A, 'head.html'), ...js(A), ...js(path.join(A, 'art'))], site: [...fs.readdirSync(S).filter(f => /\.(html|js)$/.test(f) && f !== 'i18n.js').map(f => path.join(S, f))] }; };
function extract() { const F = FILES(), res = { game: new Set(), site: new Set() };
  for (const k of ['game', 'site']) for (const f of F[k]) { const s = fs.readFileSync(f, 'utf8'); (/\.html$/.test(f) ? fromHtml : fromJs)(s, res[k]); }
  return res; }
module.exports = { extract, norm, HAN, ROOT };
if (require.main === module) { const r = extract(); const all = new Set([...r.game, ...r.site]); const L = [...all];
  console.log('game', r.game.size, 'site', r.site.size, 'all', all.size, 'chars', L.reduce((a, b) => a + b.length, 0));
  if (process.argv[2]) fs.writeFileSync(process.argv[2], JSON.stringify(L, null, 0)); }
