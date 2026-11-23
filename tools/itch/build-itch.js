// SeumArena itch.io edition. Usage: node tools/itch/build-itch.js [out dir]   (after: cd arena-src && node build.js)
// Makes <out>/index.html (the game without the app/service-worker parts), the four songs at the same relative path, LICENSE,
// and adds only to this copy: a first-run "로그인 / 게스트로 하기" choice (user 2026-11-21). Nothing in the normal game changes.
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..', '..'), out = path.resolve(process.argv[2] || path.join(root, 'release', 'itch'));
const game = fs.readFileSync(path.join(root, 'seumarena.html'), 'utf8');
const head = ['<!doctype html>', '<html lang="ko"><head>', '<meta charset="utf-8">', '<title>SeumArena</title>',
  '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">', '<meta name="theme-color" content="#0c0e13">',
  '<style>html,body{margin:0}</style>'].join('\n');
const gate = fs.readFileSync(path.join(__dirname, 'gate.html'), 'utf8');
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(path.join(out, 'arena-src', 'art', 'music'), { recursive: true });
fs.writeFileSync(path.join(out, 'index.html'), head + '\n' + game + '\n' + gate + '\n</body></html>\n');
for (const n of ['lobby', 'battle', 'result', 'win']) fs.copyFileSync(path.join(root, 'arena-src', 'art', 'music', n + '.mp3'), path.join(out, 'arena-src', 'art', 'music', n + '.mp3'));
fs.copyFileSync(path.join(root, 'LICENSE'), path.join(out, 'LICENSE'));
console.log('itch build ->', out, fs.statSync(path.join(out, 'index.html')).size);
