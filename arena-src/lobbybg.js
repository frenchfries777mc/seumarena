/* lobby background: the season's still illustration (The Key of Turkey), painted once instead of the live map */
function paintLobby(W,H){const cv=document.createElement('canvas');cv.width=W;cv.height=H;const c=cv.getContext('2d');const L={drawStick,COSMETICS,drawTurkeyArt};
let sd=7;const R=()=>{sd=(sd*16807)%2147483647;return sd/2147483647;};
const S=W/1920; c.scale(S,S); const w=1920,h=1080;
const el=(x,y,rx,ry,col,a)=>{c.fillStyle=col;c.beginPath();c.ellipse(x,y,rx,ry,a||0,0,7);c.fill();};
// sky: flat bands
['#1b1734','#231b3d','#2d2044','#3a2548','#4c2c4a','#6a3a48','#8a4c44'].forEach((col,i)=>{c.fillStyle=col;c.fillRect(0,i*95,w,h);});
// stars
for(let i=0;i<70;i++){const x=R()*w,y=R()*380;el(x,y,1.6+R()*1.6,1.6+R()*1.6,'rgba(255,240,215,'+(.4+R()*.5)+')');}
// moon with flat halo rings
const mx=560,my=250;[[250,'rgba(243,230,196,.06)'],[205,'rgba(243,230,196,.08)'],[170,'rgba(243,230,196,.1)']].forEach(([r,col])=>el(mx,my,r,r,col));
el(mx,my,138,138,'#f3e6c4');el(mx+38,my-30,26,24,'#e4d4ad');el(mx-44,my+40,18,16,'#e4d4ad');el(mx+10,my+60,12,11,'#e4d4ad');el(mx-60,my-50,14,13,'#ebdcb8');
// clouds across the moon
c.fillStyle='#3f2a4c';[[mx-230,my+95,90,22],[mx-140,my+80,70,26],[mx+170,my+130,110,24],[mx+260,my+118,60,20],[1350,180,120,26],[1440,166,80,24]].forEach(([x,y,rx,ry])=>el(x,y,rx,ry,'#3f2a4c'));
// far hills
c.fillStyle='#3e2742';c.beginPath();c.moveTo(0,620);for(let x=0;x<=w;x+=40)c.lineTo(x,600-Math.sin(x*.004)*60-Math.sin(x*.011)*25);c.lineTo(w,h);c.lineTo(0,h);c.fill();
// far tree line (round canopies)
for(let x=-20;x<w+40;x+=46){const y=610-Math.sin(x*.004)*60-Math.sin(x*.011)*25;el(x,y,34,30,['#5a2f3c','#6a3838','#523046'][Math.floor(R()*3)]);}
// mid hills (rust)
c.fillStyle='#6e3b30';c.beginPath();c.moveTo(0,720);for(let x=0;x<=w;x+=40)c.lineTo(x,700-Math.sin(x*.003+1)*50);c.lineTo(w,h);c.lineTo(0,h);c.fill();
// field rows (harvest stripes)
c.fillStyle='#8a5430';c.beginPath();c.moveTo(0,800);for(let x=0;x<=w;x+=40)c.lineTo(x,790-Math.sin(x*.0025+2)*30);c.lineTo(w,h);c.lineTo(0,h);c.fill();
c.fillStyle='rgba(60,30,20,.22)';for(let i=0;i<9;i++){c.beginPath();c.moveTo(0,820+i*32);c.quadraticCurveTo(w/2,800+i*30,w,812+i*34);c.lineTo(w,822+i*34);c.quadraticCurveTo(w/2,810+i*30,0,830+i*32);c.fill();}
// moonlight path on the field
c.fillStyle='rgba(243,230,196,.08)';c.beginPath();c.moveTo(mx-40,790);c.lineTo(mx+40,790);c.lineTo(mx+260,h);c.lineTo(mx-260,h);c.fill();
// autumn trees (big, both sides)
const lbTree=(x,y,s,cols)=>{c.fillStyle='#4a2a1e';c.fillRect(x-10*s,y-10*s,20*s,140*s);c.beginPath();c.moveTo(x,y+40*s);c.lineTo(x-50*s,y-20*s);c.lineTo(x-42*s,y-26*s);c.lineTo(x,y+20*s);c.fill();
 [[0,-60,110,96,0],[-80,-20,80,70,1],[78,-26,84,72,1],[0,-130,84,74,2],[-40,-90,60,52,2],[50,-96,58,50,0]].forEach(([dx,dy,rx,ry,k])=>el(x+dx*s,y+dy*s,rx*s,ry*s,cols[k]));};
lbTree(150,560,1.25,['#b8452a','#d0652a','#e8902e']);lbTree(1830,600,1.15,['#c9762a','#e8a33a','#a8402a']);lbTree(1560,650,.8,['#8a3a2a','#b8452a','#d0652a']);
// corn stalks (left foreground)
const corn=(x,y,s)=>{c.fillStyle='#8a7a3a';c.fillRect(x-3*s,y-170*s,6*s,170*s);c.fillStyle='#a89548';[[-1,-60],[1,-95],[-1,-125],[1,-40]].forEach(([d,yy])=>{c.beginPath();c.moveTo(x,y+yy*s);c.quadraticCurveTo(x+d*50*s,y+(yy-30)*s,x+d*80*s,y+(yy+10)*s);c.quadraticCurveTo(x+d*44*s,y+(yy-12)*s,x,y+(yy+8)*s);c.fill();});
 el(x+10*s,y-110*s,9*s,26*s,'#f2c14e',-.3);c.fillStyle='#a8b048';c.beginPath();c.moveTo(x+4*s,y-86*s);c.lineTo(x+22*s,y-120*s);c.lineTo(x+14*s,y-84*s);c.fill();};
[[60,1000,1.2],[130,1030,1.35],[220,1010,1.1],[300,1050,1.25]].forEach(a=>corn(...a));
// hay bales and pumpkins
const hay=(x,y,s)=>{c.fillStyle='#c9a24a';c.beginPath();c.roundRect(x-60*s,y-46*s,120*s,46*s,8*s);c.fill();c.fillStyle='#dbb85e';c.fillRect(x-60*s,y-46*s,120*s,10*s);c.fillStyle='#a8823a';c.fillRect(x-30*s,y-46*s,6*s,46*s);c.fillRect(x+24*s,y-46*s,6*s,46*s);};
const pumpkin=(x,y,s)=>{el(x,y+4*s,34*s,8*s,'rgba(0,0,0,.25)');[[-16,'#d9682a'],[16,'#d9682a'],[0,'#ee8030']].forEach(([dx,col])=>el(x+dx*s,y-18*s,20*s,22*s,col));c.fillStyle='#5a6a2a';c.fillRect(x-3*s,y-48*s,6*s,12*s);};
hay(470,930,1.1);hay(1470,880,.9);pumpkin(390,950,1.1);pumpkin(560,960,.8);pumpkin(1380,900,.9);pumpkin(1700,960,1.2);pumpkin(1760,980,.75);
// picnic table with pie, corn and turkey legs
const tx=760,ty=880;el(tx,ty+70,190,22,'rgba(0,0,0,.25)');c.fillStyle='#6a3a22';c.fillRect(tx-150,ty,14,70);c.fillRect(tx+136,ty,14,70);c.fillStyle='#9a5a2e';c.beginPath();c.roundRect(tx-180,ty-24,360,30,6);c.fill();c.fillStyle='#e8d6b0';c.fillRect(tx-170,ty-26,340,8);
// checked cloth (flat) -> plain cream runner
el(tx-70,ty-34,50,14,'#f2e6cc');el(tx-70,ty-40,42,12,'#c97a3a');el(tx-70,ty-44,40,10,'#e0a050');for(let i=0;i<6;i++){c.fillStyle='#8a4a24';c.fillRect(tx-100+i*12,ty-46,3,10);}
el(tx+10,ty-36,28,10,'#f2e6cc');el(tx+4,ty-44,10,22,'#f2c14e',1.3);el(tx+22,ty-42,9,20,'#e8b23e',1.2);
const leg=(x,y,a)=>{c.save();c.translate(x,y);c.rotate(a);el(0,0,18,13,'#b8602a');el(-4,-4,9,6,'#d98040');c.fillStyle='#f2e6cc';c.fillRect(14,-3,22,6);el(38,-5,5,5,'#f2e6cc');el(38,5,5,5,'#f2e6cc');c.restore();};
leg(tx+90,ty-40,-.4);leg(tx+120,ty-36,.3);
// characters in turkey skins around the table + the turkey
const fig=(id,x,y,s,a,sw)=>{c.save();c.translate(x,y);c.scale(s,s);try{L.drawStick(c,id,'#3fe0c5',a,0,sw||0,1.2,{skin:Object.keys(L.COSMETICS).find(k=>L.COSMETICS[k].char===id&&L.COSMETICS[k].concept==='tk')});}catch(e){}c.restore();};
fig('sword',tx-250,ty+60,2.3,.4);fig('bow',tx+260,ty+64,2.3,Math.PI-.5);fig('pistol',tx-20,ty+110,2.4,-.9,.5);
c.save();c.translate(1120,950);try{L.drawTurkeyArt(c,70,2,false);}catch(e){}c.restore();
// falling leaves
const leaf=(x,y,s,a,col)=>{c.save();c.translate(x,y);c.rotate(a);c.fillStyle=col;c.beginPath();c.moveTo(-14*s,0);c.quadraticCurveTo(0,-10*s,14*s,0);c.quadraticCurveTo(0,10*s,-14*s,0);c.fill();c.fillStyle='rgba(0,0,0,.18)';c.fillRect(-12*s,-.8*s,24*s,1.6*s);c.restore();};
const LC=['#e8902e','#d0652a','#b8452a','#f2c14e','#c9762a'];
for(let i=0;i<55;i++){const x=R()*w,y=60+R()*700;if(x>1180&&x<1920&&R()<.6)continue;leaf(x,y,1+R()*1.2,R()*6,LC[Math.floor(R()*5)]);}
for(let i=0;i<70;i++){const x=R()*w,y=930+R()*150;leaf(x,y,1.2+R()*.8,R()*6,LC[Math.floor(R()*5)]);}
return cv;};

let LOBBY_ART = null;
function drawLobbyArt(g) {        // true when the lobby picture was drawn (render() then skips the map)
  if (!LOBBY_ART) { try { LOBBY_ART = paintLobby(1920, 1080); } catch (e) { quietErr(e); LOBBY_ART = false; } }
  if (!LOBBY_ART) return false;
  if (!cv.classList.contains('artBg')) cv.classList.add('artBg');      // (the picture is shown sharp and bright, not blurred and darkened like the map was)
  const phone = W > H && H <= 520 && touchUi();
  let s = Math.max(W / 1920, H / 1080), x, y;
  if (phone) { s *= 1.2; x = (W - 1920 * s) / 2; y = H - 1080 * s; }      // phone sideways: bigger and lifted, so the bottom button row does not hide the table
  else { x = (W - 1920 * s) / 2; y = (H - 1080 * s) / 2; }
  g.imageSmoothingEnabled = true; g.drawImage(LOBBY_ART, x, y, 1920 * s, 1080 * s);
  return true;
}
