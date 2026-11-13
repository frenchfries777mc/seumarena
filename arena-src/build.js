const fs=require('fs');
const S=__dirname+'/';
const ren=s=>s.replace(/\bburst\(/g,'burstP(').replace(/function burstP\(x,y,n,o\)/,'function burstP(x,y,n,o)');
let art=[fs.readFileSync(S+'art/chars.js','utf8').replace('const COSMETICS={};',''), fs.readFileSync(S+'art/fxart.js','utf8'), ren(fs.readFileSync(S+'art/cosart.js','utf8')), ren(fs.readFileSync(S+'art/fxengine.js','utf8')), ren(fs.readFileSync(S+'art/sfxart.js','utf8')).replace("eff.textContent='다음 공격 '+total+(tags&&tags.length?' · '+tags.join(' · '):'');","eff.textContent=(total!=null?'다음 공격 '+total:'')+(tags&&tags.length?(total!=null?' · ':'')+tags.join(' · '):'');")].join('\n');
// music: by default the page points at arena-src/art/music/*.mp3 (downloaded after the page is up); EMBED_MUSIC=1 puts the songs inside the file (standalone copy)
const mus=n=>{if(!process.env.EMBED_MUSIC) return 'arena-src/art/music/'+n+'.mp3'; try{return fs.readFileSync(S+'art/music/'+n+'.mp3').toString('base64')}catch(e){return ''}};
art+='\n'+fs.readFileSync(S+'art/emoji.js','utf8');
art+='\n'+fs.readFileSync(S+'art/music.js','utf8').replace('@@LOBBY@@',()=>mus('lobby')).replace('@@BATTLE@@',()=>mus('battle'));
const menucss=fs.readFileSync(S+'art/menu.css','utf8');
let head=fs.readFileSync(S+'head.html','utf8').replace('/*@@CHARS@@*/',()=>art).replace('/*@@MENUCSS@@*/',()=>menucss);
// news: the list in ../news/news.json at build time is baked in (shown offline / where the live list cannot be read)
const news=(()=>{try{return JSON.stringify(JSON.parse(fs.readFileSync(S+'../news/news.json','utf8'))).replace(/</g,'\\u003c')}catch(e){return 'null'}})();
const src=head+'\n'+['engine.js','kits1.js','kits2.js','social.js','fx.js','preview.js','gardener.js','net.js','intro.js','news.js','sitebtn.js','cloud.js','tail.js'].map(f=>{const t=fs.readFileSync(S+f,'utf8');return f==='news.js'?t.replace('/*@@NEWS@@*/null',()=>news):t}).join('\n');
fs.writeFileSync(process.env.OUT||require('path').join(__dirname,'..','seumarena.html'),src);
fs.writeFileSync(require('path').join(__dirname,'t.html'),'<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>body{margin:0}[hidden]{display:none!important}</style></head><body>'+src+'</body></html>');
// checks: syntax, and the same top-level name defined twice
const js=src.slice(src.lastIndexOf('<script>')+8, src.lastIndexOf('</script>'));
fs.writeFileSync(require('path').join(__dirname,'bundle.js'), js);
const names={}; for(const m of js.matchAll(/^(?:function|const|let|var)\s+([A-Za-z_$][\w$]*)/gm)) (names[m[1]]=names[m[1]]||0, names[m[1]]++);
const dup=Object.keys(names).filter(k=>names[k]>1);
console.log('built',src.length,'dups:',dup.join(' ')||'none');
