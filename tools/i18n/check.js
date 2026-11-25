/* Fails (exit 1) when a Korean text in the game or site sources has no line in arena-src/i18n/dict.json, or a line is broken.
   Run before every PR:  node tools/i18n/check.js
   It prints the missing keys as ready-to-fill lines. See README.md for how to write a line. */
const fs = require('fs'), path = require('path'), { extract, ROOT } = require('./extract.js');
const DICT = path.join(ROOT, 'arena-src/i18n/dict.json'), d = JSON.parse(fs.readFileSync(DICT, 'utf8')), r = extract();
const all = new Set([...r.game, ...r.site]); let bad = 0;
const miss = [...all].filter(k => !(k in d));
for (const k in d) { const v = d[k]; if (!Array.isArray(v) || v.length !== 5 || v.some(x => typeof x !== 'string' || !x)) { console.log('BROKEN (needs 5 texts: en, fr, es, ja, zh):', k); bad++; continue; }
  const n = (k.match(/#/g) || []).length; v.forEach((t, i) => { const used = new Set(); let pos = 0; t.replace(/\{(\d)\}|#/g, (m, x) => { used.add(x != null ? +x : pos); pos++; }); const s = [...used].sort((a, b) => a - b); if (s.length !== n || s.some((x, j) => x !== j)) { console.log('NUMBERS do not match the Korean (' + ['en', 'fr', 'es', 'ja', 'zh'][i] + '):', k); bad++; } }); }
if (miss.length) { console.log('\nMISSING ' + miss.length + ' (add these to arena-src/i18n/dict.json with the five texts filled in):'); for (const k of miss) console.log(JSON.stringify(k) + ': ["", "", "", "", ""],'); }
const unused = Object.keys(d).filter(k => !all.has(k)).length;
console.log('\nsource texts ' + all.size + ' · dictionary lines ' + Object.keys(d).length + ' (' + unused + ' not found as a whole source text: joined texts added by hand, or leftovers)');
if (miss.length || bad) { console.log('FAILED'); process.exit(1); } console.log('ok');
