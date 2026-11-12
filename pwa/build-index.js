// Makes index.html (the GitHub Pages / app version) from the built seumarena.html.
// Usage: cd arena-src && node build.js && cd .. && node pwa/build-index.js
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const game = fs.readFileSync(path.join(root, 'seumarena.html'), 'utf8');
const head = [
  '<!doctype html>',
  '<html lang="ko"><head>',
  '<meta charset="utf-8">',
  '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">',
  '<meta name="theme-color" content="#0c0e13">',
  '<meta name="mobile-web-app-capable" content="yes">',
  '<meta name="apple-mobile-web-app-capable" content="yes">',
  '<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">',
  '<meta name="apple-mobile-web-app-title" content="SeumArena">',
  '<link rel="manifest" href="manifest.webmanifest">',
  '<link rel="icon" type="image/png" sizes="32x32" href="icons/favicon-32.png">',
  '<link rel="icon" type="image/png" sizes="192x192" href="icons/icon-192.png">',
  '<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">',
  '<style>html,body{margin:0}</style>',
].join('\n');
const sw = "<script>if('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));</script>";
fs.writeFileSync(path.join(root, 'index.html'), head + '\n' + game + '\n' + sw + '\n</body></html>\n');
console.log('index.html', fs.statSync(path.join(root, 'index.html')).size);
