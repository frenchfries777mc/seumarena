/* Writes the site's i18n.js (site-src/ in the project folder, site/ in the repository): the same engine as the game (arena-src/i18n.js)
   with only the dictionary lines the site pages can show. Run after dict.json or the site texts change:  node tools/i18n/build-site.js */
const fs = require('fs'), path = require('path'), { extract, ROOT } = require('./extract.js');
const S = fs.existsSync(path.join(ROOT, 'site-src')) ? path.join(ROOT, 'site-src') : path.join(ROOT, 'site');
const d = JSON.parse(fs.readFileSync(path.join(ROOT, 'arena-src/i18n/dict.json'), 'utf8')), site = [...extract().site], out = {};
for (const k in d) if (site.includes(k) || site.some(s => (k.length > 1 && s.includes(k)) || k.includes(s))) out[k] = d[k];
const eng = fs.readFileSync(path.join(ROOT, 'arena-src/i18n.js'), 'utf8').replace('/*@@I18N@@*/{}', () => JSON.stringify(out).replace(/</g, '\\u003c'));
fs.writeFileSync(path.join(S, 'i18n.js'), '/* made by tools/i18n/build-site.js from arena-src/i18n.js and arena-src/i18n/dict.json: do not edit here */\n' + eng);
console.log('site i18n.js', Object.keys(out).length, 'lines', Math.round(fs.statSync(path.join(S, 'i18n.js')).size / 1024) + ' KB');
