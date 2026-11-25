/* Stickseum's per-skin attack art, as it is in the original: concept projectiles (drawConceptProjectile), every skin's own trail on shots and swings (drawBulletSkinFx), the big show of lux skins (luxFx) */
/* phones (and 효과 줄이기): the same pictures, fewer extra particles, no glow gradients and no lux show, so a crowd of skins never slows the frame */
function skLite(){ return (typeof lowFx==='function' && lowFx()) || (typeof liteMode==='function' && liteMode()); }
function skP(o){ if(skLite() && (o.shape==='text' || Math.random()<0.6)) return; addP(o); }
const CONCEPT_COLOR={nnpink:'#ff5ac8', nnplasma:'#b28cff', nnrain:'#ff6af0', kdred:'#ff2a4a', kdhell:'#ff8a2a', kdvoid:'#7a6cff', gold:'#ffd34d', fry:'#ffd34d', cupid:'#ff6fae', banana:'#ffe14d', starlight:'#ff8fd0', zeus:'#d8efff', envy:'#ffd34d', odin:'#ffd34d', poseidon:'#4fc3ff', thor:'#bfe0ff', gilga:'#ffd34d', janus:'#f2f2f4'};
const UNO_COLS=['#e8252b','#f5c400','#2a9d4a','#1f5fd1'];
const LUX_THEME={flame:['#ff7a1a','#ffe27a'], frost:['#9fe8ff','#ffffff'], electric:['#7fd0ff','#ffffff'], void:['#b388ff','#2a1450'], halo:['#ffe27a','#ffffff'], crown:['#ffd34d','#fff6c8'], sparkle:['#ffffff','#ffd9f2']};
const skinFxCache={};
function drawConceptProjectile(b,cp){
  const swing=b.swingAngle!==undefined, shot=!swing && !b.dmgless && b.vx!==undefined;
  if(cp==='dragon' && shot && b.wid==='wizard'){ drawDragonShot(b); return true; }
  if(cp==='uno' && shot && b.wid==='magiccard'){ drawTrail(b); drawUnoCard(b); return true; }
  if(cp==='cupid' && shot && b.wid==='bow'){ drawCupidArrow(b); return true; }
  if(cp==='banana' && shot && b.wid==='pistol'){ drawBananaShot(b); return true; }
  if(cp==='zeus' && shot && b.wid==='pistol'){      // the bolt itself is thrown
    drawTrail(b); const sc=(b.big||b.ult)?1.7:1, a=Math.atan2(b.vy||0,b.vx||0);
    if(Math.random()<0.8) skP({x:b.x+RND(-5,5),y:b.y+RND(-5,5),vx:RND(-60,60),vy:RND(-60,60),life:RND(.15,.35),size:RND(1.6,3.2)*sc,color:Math.random()<.5?'#ffe66b':'#bfe6ff',glow:1,grav:0,drag:2});
    ctx.save(); ctx.translate(b.x,b.y); ctx.rotate(a); ctx.scale(sc,sc); ctx.translate(-14,0); drawZeusBoltShape(ctx,30,performance.now()); ctx.restore(); return true;
  }
  if(cp==='envy' && shot && b.wid==='grenade'){      // a golden apple is thrown
    drawTrail(b); const t=performance.now();
    if(Math.random()<0.6) skP({x:b.x+RND(-4,4),y:b.y+RND(-4,4),vx:RND(-30,30),vy:RND(-30,40),life:RND(.3,.6),size:RND(1.8,3.4),color:Math.random()<.5?'#ffe27a':'#fff6c8',glow:1,grav:30,drag:1.5});
    ctx.save(); ctx.translate(b.x,b.y); drawGoldApple(ctx,9,t*0.012); ctx.restore(); return true;
  }
  if(cp==='starlight' && shot){ if(b.wid==='wizard') drawWizardStarShot(b); else drawStarShot(b); return true; }
  if(swing && cp==='gold'){ for(let i=0;i<3;i++){ const a=b.swingAngle+RND(-0.9,0.9), r=RND(30,80); skP({x:b.x-Math.cos(b.swingAngle)*30+Math.cos(a)*r,y:b.y-Math.sin(b.swingAngle)*30+Math.sin(a)*r,vx:RND(-60,60),vy:RND(-120,-20),life:RND(.4,.8),size:RND(1.8,3.6),color:i%2?'#ffd34d':'#fff3b0',grav:80,drag:1.2}); } }
  if(swing && cp==='fry'){ for(let i=0;i<3;i++){ const a=b.swingAngle+RND(-0.8,0.8), r=RND(30,80); skP({x:b.x-Math.cos(b.swingAngle)*30+Math.cos(a)*r,y:b.y-Math.sin(b.swingAngle)*30+Math.sin(a)*r,vx:Math.cos(a)*RND(60,200),vy:Math.sin(a)*RND(60,200)-60,life:RND(.4,.8),size:RND(3,5),color:i%2?'#ffd34d':'#ffe98a',shape:'square',rot:RND(0,6),vr:RND(-9,9),grav:500,drag:0.6}); } }
  return false;
}
function drawBulletSkinFx(b){
  if(!b.sk || b.lob) return;
  const fx=skinFxOf(b.sk), col=fx.col, now=performance.now()*0.001;
  const swing=b.swingAngle!==undefined, sp=Math.hypot(b.vx||0,b.vy||0);
  if(!swing && (b.dmgless || sp<50)) return;
  ctx.save(); ctx.globalCompositeOperation='lighter'; ctx.lineCap='round';
  if(swing){
    const a=b.swingAngle, ax=Math.cos(a), ay=Math.sin(a), cx=b.x-ax*30, cy=b.y-ay*30;
    const k=b.life0?clamp(b.life/b.life0,0,1):1, R=64;
    ctx.strokeStyle=hexA(col,0.75*k); ctx.lineWidth=3+3*k; ctx.beginPath(); ctx.arc(cx,cy,R,a-0.85,a+0.85); ctx.stroke();
    if(fx.style==='ring'){ ctx.lineWidth=1.5; ctx.strokeStyle=hexA(col,0.5*k); ctx.beginPath(); ctx.arc(cx,cy,R+8,a-0.7,a+0.7); ctx.stroke(); }
    for(let i=0;i<6;i++){ const q=a-0.85+i*0.34+(1-k)*0.5, rr=R+(fx.style==='ember'?-i*2:Math.sin(i*2+now*9)*5);
      const x=cx+Math.cos(q)*rr, y=cy+Math.sin(q)*rr-(fx.style==='ember'?(1-k)*14:0);
      ctx.fillStyle=hexA(col,0.8*k); ctx.beginPath(); if(fx.style==='star'){ ctx.save(); ctx.translate(x,y); ctx.rotate(q+now*6); ctx.fillRect(-4,-1,8,2); ctx.fillRect(-1,-4,2,8); ctx.restore(); } else ctx.arc(x,y,fx.style==='spark'?2:2.6,0,7); ctx.fill(); }
  } else {
    const ux=b.vx/sp, uy=b.vy/sp, L=clamp(sp*0.06,14,56), sc=b.ult?1.5:1;
    if(skLite()){ ctx.fillStyle=hexA(col,0.3); ctx.beginPath(); ctx.arc(b.x,b.y,8*sc,0,7); ctx.fill(); }
    else { const rg=ctx.createRadialGradient(b.x,b.y,0,b.x,b.y,13*sc); rg.addColorStop(0,hexA(col,0.55)); rg.addColorStop(1,hexA(col,0));
    ctx.fillStyle=rg; ctx.beginPath(); ctx.arc(b.x,b.y,13*sc,0,7); ctx.fill(); }
    if(fx.style==='ring'){ for(let i=0;i<2;i++){ const q=now*14+i*Math.PI; ctx.fillStyle=hexA(col,0.9); ctx.beginPath(); ctx.arc(b.x+Math.cos(q)*8*sc,b.y+Math.sin(q)*8*sc,2.2,0,7); ctx.fill(); } }
    else if(fx.style==='star'){ ctx.save(); ctx.translate(b.x,b.y); ctx.rotate(now*10); ctx.fillStyle=hexA(col,0.9); ctx.fillRect(-7*sc,-1.2,14*sc,2.4); ctx.fillRect(-1.2,-7*sc,2.4,14*sc); ctx.restore(); }
    else if(fx.style==='ribbon'){ ctx.strokeStyle=hexA(col,0.7); ctx.lineWidth=2.5; ctx.beginPath(); for(let i=0;i<=8;i++){ const d=i/8*L*1.4, w=Math.sin(i*1.3-now*25)*4*(i/8); const x=b.x-ux*d-uy*w, y=b.y-uy*d+ux*w; i?ctx.lineTo(x,y):ctx.moveTo(x,y); } ctx.stroke(); }
    else { for(let i=1;i<=4;i++){ const d=i*L/4, j=Math.sin(now*40+i*5)*3; const x=b.x-ux*d-uy*j, y=b.y-uy*d+ux*j-(fx.style==='ember'?i*1.5:0); ctx.fillStyle=hexA(col,0.85-i*0.15); ctx.beginPath(); ctx.arc(x,y,(fx.style==='ember'?3.2:2)-i*0.3,0,7); ctx.fill(); } }
  }
  if(fx.lux>=3 && swing && !skLite()) luxFx(b, fx, swing, now, sp);      // (the big show belongs to a melee swing; a flying projectile only gets its own trail)
  ctx.restore();
}
function skinFxOf(sid){
  let r=skinFxCache[sid]; if(r) return r;
  const c=COSMETICS[sid]||{}, t=c.tint||'#ffffff', n=parseInt(t.slice(1),16)||0;
  const mix=(v)=>Math.round(v+(255-v)*0.5);      // dark tints (흑기사 etc.) would vanish on a lighter glow, so lift them
  const col='#'+[mix((n>>16)&255),mix((n>>8)&255),mix(n&255)].map(v=>v.toString(16).padStart(2,'0')).join('');
  let h=0; for(let i=0;i<sid.length;i++) h=(h*31+sid.charCodeAt(i))|0;
  const styles=['spark','ring','ember','star','ribbon'];
  r=skinFxCache[sid]={col, tint:t, lux:c.lux||0, theme:c.fx||'', style:c.fx==='halo'?'ring':(c.fx==='crown'?'star':styles[Math.abs(h)%styles.length])};
  return r;
}
function luxFx(b, fx, swing, now, sp){
  const gm=fx.lux>=4, th=LUX_THEME[gm?'halo':fx.theme]||[fx.tint,'#ffffff'], hue=(i)=>auroraHex(now*0.9,i);
  const c1=gm?hue(0):th[0], c2=th[1], sc=gm?2:1.5, n=gm?8:5;
  const cross=(x,y,r,col,a)=>{ ctx.strokeStyle=col; ctx.globalAlpha=a; ctx.lineWidth=1.6; ctx.beginPath(); ctx.moveTo(x-r,y); ctx.lineTo(x+r,y); ctx.moveTo(x,y-r); ctx.lineTo(x,y+r); ctx.stroke(); ctx.globalAlpha=1; };
  const theme=(x,y,i,r,a)=>{ const col=gm?hue(i):(i%2?c2:c1);
    switch(gm?'aurora':fx.theme){
      case 'aurora': if(i%2) cross(x,y,r*1.7,col,a); else { ctx.fillStyle=col; ctx.globalAlpha=a; ctx.beginPath(); ctx.arc(x,y,r*1.15,0,7); ctx.fill(); ctx.globalAlpha=1; } break;
      case 'flame': ctx.fillStyle=col; ctx.globalAlpha=a; ctx.beginPath(); ctx.arc(x,y-i*1.4,r*1.2,0,7); ctx.fill(); ctx.globalAlpha=1; break;
      case 'frost': case 'sparkle': case 'crown': cross(x,y,r*1.7,col,a); break;
      case 'void': ctx.fillStyle=gm?col:th[1]; ctx.globalAlpha=a; ctx.beginPath(); ctx.arc(x,y,r*1.3,0,7); ctx.fill(); ctx.strokeStyle=col; ctx.lineWidth=1.2; ctx.stroke(); ctx.globalAlpha=1; break;
      case 'halo': ctx.strokeStyle=col; ctx.globalAlpha=a; ctx.lineWidth=1.4; ctx.beginPath(); ctx.ellipse(x,y,r*1.9,r*0.8,0,0,7); ctx.stroke(); ctx.globalAlpha=1; break;
      default: ctx.fillStyle=col; ctx.globalAlpha=a; ctx.beginPath(); ctx.arc(x,y,r,0,7); ctx.fill(); ctx.globalAlpha=1; } };
  if(swing){
    const a=b.swingAngle, ax=Math.cos(a), ay=Math.sin(a), cx=b.x-ax*30, cy=b.y-ay*30, k=b.life0?clamp(b.life/b.life0,0,1):1;
    if(gm){ for(let r=0;r<3;r++){ ctx.strokeStyle=hexA(hue(r*2+1),0.5*k); ctx.lineWidth=3-r*0.7; ctx.beginPath(); for(let s2=0;s2<=24;s2++){ const q2=a-1.25+s2*(2.5/24), rr=74+r*7+Math.sin(now*9+s2*0.5+r*2)*6; const x=cx+Math.cos(q2)*rr, y=cy+Math.sin(q2)*rr; if(s2) ctx.lineTo(x,y); else ctx.moveTo(x,y); } ctx.stroke(); } }       // 오로라 휘두르기: 바깥에 물결치는 색 띠
    for(let j=0;j<(gm?4:2);j++){ ctx.strokeStyle=gm?hue(j*2):(j?c2:c1); ctx.globalAlpha=(0.7-j*0.12)*k; ctx.lineWidth=7-j*1.4; ctx.beginPath(); ctx.arc(cx,cy,56+j*9,a-1.15,a+1.15); ctx.stroke(); }
    ctx.globalAlpha=1;
    for(let i=0;i<n*2;i++){ const q=a-1.15+i*(2.3/(n*2-1))+(1-k)*0.4, rr=62+Math.sin(i*2.3+now*12)*10+(1-k)*14; theme(cx+Math.cos(q)*rr, cy+Math.sin(q)*rr, i, 2.6, 0.9*k); }
  } else {
    const ux=b.vx/sp, uy=b.vy/sp, R=13*sc*(b.ult?1.4:1);
    const rg=ctx.createRadialGradient(b.x,b.y,0,b.x,b.y,R*1.6); rg.addColorStop(0,hexA('#ffffff',0.55)); rg.addColorStop(0.35,hexA(gm?auroraHex(now*0.9,1):th[0],0.5)); rg.addColorStop(1,hexA(gm?auroraHex(now*0.9,4):th[0],0)); ctx.fillStyle=rg; ctx.beginPath(); ctx.arc(b.x,b.y,R*1.6,0,7); ctx.fill();
    for(let i=0;i<n;i++){ const d=8+i*(40/n)*(gm?1.3:1), j=Math.sin(now*30+i*2.1)*(4+i*0.7); theme(b.x-ux*d-uy*j, b.y-uy*d+ux*j, i, 3.2-i*0.2, 0.85-i*0.07); }
    for(let i=0;i<(gm?5:3);i++){ const q=now*9+i*6.283/(gm?5:3), rr=R*0.95; cross(b.x+Math.cos(q)*rr, b.y+Math.sin(q)*rr, 3.2, gm?hue(i):c2, 0.95); }
    if(gm){ for(let r=0;r<3;r++){ ctx.strokeStyle=hexA(auroraHex(now*0.9,r*2+1),0.6); ctx.lineWidth=3.2-r*0.8; ctx.beginPath(); for(let s2=0;s2<=14;s2++){ const d=s2*5, w=Math.sin(now*14-s2*0.7+r*2)*(3+s2*0.5), x=b.x-ux*d-uy*w, y=b.y-uy*d+ux*w; if(s2) ctx.lineTo(x,y); else ctx.moveTo(x,y); } ctx.stroke(); } }       // 오로라 리본: 탄환 뒤로 물결치며 색이 흐르는 띠
    if(gm){ ctx.strokeStyle=hue(3); ctx.globalAlpha=0.5; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(b.x,b.y,R*1.2+Math.sin(now*14)*2,0,7); ctx.stroke(); ctx.globalAlpha=1; }
  }
}
function drawStarShot(b){      // the bullet: a spinning star in a pink glow, with a short tail of little stars
  const now=performance.now()*0.001, sp=Math.hypot(b.vx||0,b.vy||0)||1, ux=b.vx/sp, uy=b.vy/sp, sc=b.ult?1.6:(b.big?1.35:1);
  ctx.save(); ctx.globalCompositeOperation='lighter';
  { const age=Math.hypot(b.x-(b.spawnX===undefined?b.x:b.spawnX), b.y-(b.spawnY===undefined?b.y:b.spawnY)); if(age<70){ const k=age/70, im=starImg(1); for(let r=0;r<6;r++){ const a=r*Math.PI/3+now*3, d=10+k*46, sz=(16-k*10)*sc; ctx.globalAlpha=(1-k)*0.9; ctx.drawImage(im.cv,(b.spawnX===undefined?b.x:b.spawnX)+Math.cos(a)*d-sz/2,(b.spawnY===undefined?b.y:b.spawnY)+Math.sin(a)*d-sz/2,sz,sz); } ctx.globalAlpha=1; } }
  for(let i=4;i>=1;i--){ const d=i*9*sc, im=starImg((i+Math.floor(now*6))%3), sz=(11-i*1.6)*sc, w=Math.sin(now*30+i*2)*2; ctx.globalAlpha=0.7-i*0.14; ctx.drawImage(im.cv,b.x-ux*d-uy*w-sz/2,b.y-uy*d+ux*w-sz/2,sz,sz); }
  ctx.globalAlpha=1; const g=starImg(0), gs=52*sc; ctx.globalAlpha=0.6; ctx.drawImage(g.cv,b.x-gs/2,b.y-gs/2,gs,gs); ctx.globalAlpha=1;
  ctx.save(); ctx.translate(b.x,b.y); ctx.rotate(now*9); const im=starImg(1), sz=28*sc; ctx.drawImage(im.cv,-sz/2,-sz/2,sz,sz); ctx.restore();
  ctx.restore();
}
function drawDragonShot(b){      // the wizard's bullet: a 여의주 (dragon's pearl) with a blue dragon riding behind it
  const now=performance.now(), ang=Math.atan2(b.vy||0,b.vx||0), sc=(b.ult?1.3:1)*1.2;
  if(skLite()){      // phones: the same dragon from 16 ready-made frames of its swim (drawn once), so a volley of them stays cheap
    const k=((((now*0.013+(b.sx||0)*0.01)%6.2832)+6.2832)%6.2832)/6.2832*16|0, cv=dragonShotFrame(k);
    ctx.save(); ctx.translate(b.x,b.y); ctx.rotate(ang); if(Math.cos(ang)<0) ctx.scale(1,-1); ctx.scale(sc/2,sc/2); ctx.drawImage(cv,-300,-70); ctx.restore(); return;
  }
  ctx.save(); ctx.translate(b.x,b.y); ctx.rotate(ang); if(Math.cos(ang)<0) ctx.scale(1,-1); ctx.scale(sc,sc);
  drawDragon(ctx,120,now,(b.sx||0)*0.01);
  if(!skLite()){ ctx.globalCompositeOperation='lighter'; const gl=ctx.createRadialGradient(34,0,0,34,0,30); gl.addColorStop(0,'rgba(190,240,255,0.75)'); gl.addColorStop(1,'rgba(60,170,255,0)'); ctx.fillStyle=gl; ctx.beginPath(); ctx.arc(34,0,30,0,7); ctx.fill(); ctx.globalCompositeOperation='source-over'; }
  const pg=ctx.createRadialGradient(32,-3,1,34,0,11); pg.addColorStop(0,'#ffffff'); pg.addColorStop(0.45,'#9fe6ff'); pg.addColorStop(1,'#2a7fe0'); ctx.fillStyle=pg; ctx.beginPath(); ctx.arc(34,0,10.5,0,7); ctx.fill();
  ctx.strokeStyle='rgba(255,255,255,0.85)'; ctx.lineWidth=1.3; ctx.beginPath(); ctx.arc(34,0,6.5,now*0.01,now*0.01+2.6); ctx.stroke();
  ctx.restore();
}
function drawWizardStarShot(b){
  const now=performance.now(), sc=(b.ult?1.5:1)*0.62, ang=Math.atan2(b.vy||0,b.vx||0), sp=starSpriteW();
  const SC=['#ff9ed8','#ffe27a','#7fd8ff','#ffffff'];
  for(let i=0;i<2;i++) skP({x:b.x+RND(-4,4),y:b.y+RND(-4,4),vx:RND(-35,35)-(b.vx||0)*0.04,vy:RND(-40,15)-(b.vy||0)*0.04,life:RND(.35,.7),size:RND(1.8,3.4),color:SC[(Math.random()*4)|0],drag:1.6});
  if(Math.random()<0.45) skP({x:b.x+RND(-3,3),y:b.y+RND(-3,3),vx:RND(-30,30),vy:RND(-50,-5),life:RND(.5,.9),size:RND(9,15),color:SC[(Math.random()*3)|0],shape:'text',add:true,text:Math.random()<.5?'✦':'★',drag:1.4});
  if(Math.random()<0.25) skP({x:b.x,y:b.y,vx:RND(-20,20),vy:RND(10,60),life:RND(.5,.8),size:RND(2,3.4),color:'#ffe27a',grav:260,drag:0.6});
  ctx.save(); ctx.translate(b.x,b.y);
  ctx.save(); ctx.rotate(ang); ctx.globalCompositeOperation='lighter'; const tl=46*sc/0.62*(b.ult?1.3:1), tg=ctx.createLinearGradient(0,0,-tl,0);
  tg.addColorStop(0,'rgba(255,190,230,0.75)'); tg.addColorStop(0.5,'rgba(255,230,150,0.35)'); tg.addColorStop(1,'rgba(120,210,255,0)');
  ctx.fillStyle=tg; ctx.beginPath(); ctx.moveTo(0,-8*sc/0.62); ctx.lineTo(-tl,0); ctx.lineTo(0,8*sc/0.62); ctx.closePath(); ctx.fill(); ctx.restore();
  ctx.save(); ctx.globalCompositeOperation='lighter'; for(let k=0;k<3;k++){ const a=now*0.012+k*2.094, d=17*sc/0.62; ctx.globalAlpha=0.9; ctx.save(); ctx.translate(Math.cos(a)*d,Math.sin(a)*d); ctx.rotate(-a*2); ctx.scale(0.2*sc/0.62,0.2*sc/0.62); ctx.drawImage(sp,-48,-48); ctx.restore(); } ctx.restore();
  ctx.rotate(now*0.008+(b.sx||0)*0.01); ctx.scale(sc*1.25,sc*1.25); ctx.drawImage(sp,-48,-48);
  ctx.restore();
}
function drawCupidArrow(b){
  drawTrail(b);
  const sc=b.ult?1.5:1, now=performance.now();
  if(Math.random()<0.6){ const sz=RND(12,20); skP({x:b.x+RND(-5,5),y:b.y+RND(-5,5),vx:RND(-40,40),vy:RND(-90,-20),life:RND(.5,.95),size:sz,color:Math.random()<.5?'#ff6fae':'#ffb3d6',outline:'#c2185b',shape:'text',add:false,text:Math.random()<.2?'💗':'♥',drag:1.1}); }
  ctx.save(); ctx.translate(b.x,b.y); ctx.rotate(Math.atan2(b.vy||0,b.vx||0)); ctx.scale(sc,sc);
  ctx.strokeStyle='#e9a3c0'; ctx.lineWidth=2; ctx.lineCap='round'; ctx.beginPath(); ctx.moveTo(-12,0); ctx.lineTo(6,0); ctx.stroke();
  ctx.fillStyle='#ff4f9a'; ctx.save(); ctx.translate(9,0); ctx.rotate(Math.PI/2*-1+Math.PI); ctx.restore();
  ctx.save(); ctx.translate(9,0); ctx.rotate(-Math.PI/2); drawCardHeart(ctx,0,0,4.6); ctx.restore();
  ctx.fillStyle='#ffd0e4'; for(const sd of [-1,1]){ ctx.beginPath(); ctx.moveTo(-12,0); ctx.lineTo(-17,sd*4); ctx.lineTo(-9,sd*0.6); ctx.closePath(); ctx.fill(); }
  ctx.restore();
}
function drawBananaShot(b){
  drawTrail(b);
  const sc=b.ult?2.2:1.15, t=performance.now();
  if(Math.random()<0.7) skP({x:b.x+RND(-4,4),y:b.y+RND(-4,4),vx:RND(-50,50)-(b.vx||0)*0.05,vy:RND(-30,60),life:RND(.4,.8),size:RND(2.5,5.5)*(b.ult?1.6:1),color:Math.random()<.5?'#fff3b0':'#ffe27a',shape:Math.random()<.4?'ring':'dot',grav:300,drag:0.8});
  ctx.save(); ctx.translate(b.x,b.y); ctx.rotate(Math.atan2(b.vy||0,b.vx||0)+t*0.012*0); ctx.scale(sc,sc);
  ctx.lineCap='round'; ctx.lineJoin='round';
  ctx.strokeStyle='#e0b800'; ctx.lineWidth=8; ctx.beginPath(); ctx.moveTo(-9,3); ctx.quadraticCurveTo(0,-7,10,2); ctx.stroke();
  ctx.strokeStyle='#ffe14d'; ctx.lineWidth=6; ctx.beginPath(); ctx.moveTo(-9,3); ctx.quadraticCurveTo(0,-7,10,2); ctx.stroke();
  ctx.strokeStyle='#fff6b8'; ctx.lineWidth=1.6; ctx.beginPath(); ctx.moveTo(-6,0); ctx.quadraticCurveTo(0,-7,6,-1); ctx.stroke();
  ctx.fillStyle='#5a3b12'; ctx.beginPath(); ctx.arc(11,2.4,2,0,7); ctx.fill(); ctx.beginPath(); ctx.arc(-10,3.4,1.6,0,7); ctx.fill();
  ctx.restore();
}
function drawUnoCard(b){
  const h=Math.abs(Math.round((b.sx||b.spawnX||0)*3+(b.sy||b.spawnY||0)*5+Math.atan2(b.vy||0,b.vx||0)*997)), col=UNO_COLS[h%4], num=(h>>2)%10;
  ctx.save(); ctx.translate(b.x,b.y); ctx.rotate(performance.now()*0.012+h);
  ctx.fillStyle='#ffffff'; ctx.beginPath(); ctx.roundRect(-9,-13,18,26,3); ctx.fill();
  ctx.fillStyle=col; ctx.beginPath(); ctx.roundRect(-7.5,-11.5,15,23,2.5); ctx.fill();
  ctx.fillStyle='#ffffff'; ctx.save(); ctx.rotate(-0.6); ctx.beginPath(); ctx.ellipse(0,0,4.6,8.5,0,0,7); ctx.fill(); ctx.restore();
  ctx.fillStyle=col; ctx.font='900 11px Rajdhani'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(String(num),0,0.5);
  ctx.font='800 5px Rajdhani'; ctx.fillStyle='#ffffff'; ctx.fillText(String(num),-4.6,-8); ctx.fillText(String(num),4.6,8);
  ctx.restore();
}
const DRAGON_FRAMES=[];
function dragonShotFrame(k){
  let cv=DRAGON_FRAMES[k]; if(cv) return cv;
  cv=DRAGON_FRAMES[k]=document.createElement('canvas'); cv.width=440; cv.height=140; const c=cv.getContext('2d');
  c.translate(300,70); c.scale(2,2); drawDragon(c,120,k/16*6.2832/0.013,0);
  const pg=c.createRadialGradient(32,-3,1,34,0,11); pg.addColorStop(0,'#ffffff'); pg.addColorStop(0.45,'#9fe6ff'); pg.addColorStop(1,'#2a7fe0'); c.fillStyle=pg; c.beginPath(); c.arc(34,0,10.5,0,7); c.fill();
  return cv;
}
function drawDragon(c,len,now,ph){
  const N=30, T=now*0.013, pts=[];
  for(let i=0;i<=N;i++){ const f=i/N, amp=3+11*f; pts.push({x:-12-f*len, y:Math.sin(T-i*0.42+ph)*amp, r:11*Math.pow(1-f,0.75)+1.8, f}); }
  for(let i=0;i<=N;i++){ const a=pts[Math.max(0,i-1)], b=pts[Math.min(N,i+1)], dx=b.x-a.x, dy=b.y-a.y, l=Math.hypot(dx,dy)||1; pts[i].nx=-dy/l; pts[i].ny=dx/l; }
  c.save(); c.lineCap='round'; c.lineJoin='round';
  // soft aura
  c.globalCompositeOperation='lighter'; for(let k=0;k<3;k++){ const p=pts[(3+k*8)|0]; const g=c.createRadialGradient(p.x,p.y,2,p.x,p.y,30); g.addColorStop(0,'rgba(80,200,255,0.30)'); g.addColorStop(1,'rgba(80,200,255,0)'); c.fillStyle=g; c.beginPath(); c.arc(p.x,p.y,30,0,7); c.fill(); } c.globalCompositeOperation='source-over';
  // legs (two pairs, tucked), drawn behind the body
  for(const idx of [6,15]){ const p=pts[idx], sw=Math.sin(T*0.9+idx)*3; c.strokeStyle='#1b78d8'; c.lineWidth=3.2;
    for(const side of [-1,1]){ const bx=p.x+p.nx*p.r*0.4*side, by=p.y+p.ny*p.r*0.4*side; c.beginPath(); c.moveTo(bx,by); c.quadraticCurveTo(bx-5,by+side*(p.r+5),bx-9+sw,by+side*(p.r+9)); c.stroke();
      c.strokeStyle='#ffd34d'; c.lineWidth=1.4; const ex=bx-9+sw, ey=by+side*(p.r+9); c.beginPath(); c.moveTo(ex,ey); c.lineTo(ex-3,ey+side*2.6); c.moveTo(ex,ey); c.lineTo(ex-1,ey+side*3.6); c.moveTo(ex,ey); c.lineTo(ex+2,ey+side*3); c.stroke(); c.strokeStyle='#1b78d8'; c.lineWidth=3.2; } }
  // mane / dorsal spikes (gold and white flames that stream backwards)
  for(let i=1;i<N;i++){ const p=pts[i], h=(5.5+5*(1-p.f))*(0.8+0.2*Math.sin(T*1.3+i)); const tx=p.x+p.nx*(-p.r), ty=p.y+p.ny*(-p.r); c.fillStyle=i%3?'#ffd34d':'#fff3b0'; c.beginPath(); c.moveTo(tx+2,ty); c.quadraticCurveTo(tx-h*0.3,ty-h*0.5*Math.sign(-p.ny||-1)+(-p.ny*h*0.2),tx-4.5-h*0.4,ty+(-p.ny)*h); c.lineTo(tx-4.5,ty); c.closePath(); c.fill(); }
  // body: one tapered polygon with a head-to-tail gradient
  const g=c.createLinearGradient(pts[0].x,0,pts[N].x,0); g.addColorStop(0,'#52e8ff'); g.addColorStop(0.45,'#1e8bea'); g.addColorStop(1,'#183fb8');
  c.fillStyle=g; c.beginPath(); for(let i=0;i<=N;i++){ const p=pts[i]; const x=p.x+p.nx*p.r, y=p.y+p.ny*p.r; if(i) c.lineTo(x,y); else c.moveTo(x,y); }
  for(let i=N;i>=0;i--){ const p=pts[i]; c.lineTo(p.x-p.nx*p.r, p.y-p.ny*p.r); } c.closePath(); c.fill();
  c.strokeStyle='rgba(8,40,120,0.55)'; c.lineWidth=1.2; c.stroke();
  // belly plates (pale) along the lower edge
  c.strokeStyle='rgba(235,250,255,0.9)'; c.lineWidth=2.4; c.beginPath(); for(let i=0;i<=N;i++){ const p=pts[i]; const x=p.x+p.nx*p.r*0.62, y=p.y+p.ny*p.r*0.62; if(i) c.lineTo(x,y); else c.moveTo(x,y); } c.stroke();
  c.strokeStyle='rgba(180,225,255,0.55)'; c.lineWidth=1; for(let i=2;i<N;i+=2){ const p=pts[i]; c.beginPath(); c.moveTo(p.x+p.nx*p.r*0.25,p.y+p.ny*p.r*0.25); c.lineTo(p.x+p.nx*p.r*0.95,p.y+p.ny*p.r*0.95); c.stroke(); }
  // scales: little arcs over the back
  c.strokeStyle='rgba(10,55,150,0.55)'; c.lineWidth=1; for(let i=1;i<N;i++){ const p=pts[i]; for(let k=-1;k<=0;k++){ const ox=p.nx*p.r*0.35*k*1.1, oy=p.ny*p.r*0.35*k*1.1; c.beginPath(); c.arc(p.x+ox+1.5,p.y+oy,Math.max(1.2,p.r*0.32),Math.PI*0.55,Math.PI*1.45); c.stroke(); } }
  // tail tuft
  const tp=pts[N]; c.fillStyle='#ffd34d'; c.beginPath(); c.moveTo(tp.x,tp.y); c.quadraticCurveTo(tp.x-8,tp.y-7+Math.sin(T)*3,tp.x-15,tp.y-2+Math.sin(T+1)*4); c.quadraticCurveTo(tp.x-8,tp.y+1,tp.x-14,tp.y+7+Math.sin(T+2)*3); c.quadraticCurveTo(tp.x-6,tp.y+3,tp.x,tp.y); c.fill();
  // head: long snout, jaw with teeth, nostril, brow, glowing eye
  const hg=c.createLinearGradient(-14,-10,16,8); hg.addColorStop(0,'#2fc0ff'); hg.addColorStop(1,'#7ff0ff');
  c.fillStyle=hg; c.beginPath(); c.moveTo(-16,-9); c.quadraticCurveTo(0,-14,13,-6); c.quadraticCurveTo(21,-4,22,-1); c.lineTo(21,2); c.quadraticCurveTo(12,3,7,4); c.quadraticCurveTo(-4,11,-16,9); c.closePath(); c.fill(); c.strokeStyle='rgba(8,40,120,0.6)'; c.lineWidth=1.2; c.stroke();
  c.fillStyle='#e9fbff'; c.beginPath(); c.moveTo(20,1.5); for(let k=0;k<4;k++){ c.lineTo(17-k*3.4,1.6); c.lineTo(15.4-k*3.4,5); c.lineTo(14-k*3.4,1.8); } c.lineTo(6,2); c.closePath(); c.fill();
  c.fillStyle='#0a3d8a'; c.beginPath(); c.arc(19.5,-3.2,1.1,0,7); c.fill();
  c.fillStyle='#ffe27a'; c.beginPath(); c.arc(6,-5.5,3.3,0,7); c.fill(); c.fillStyle='#d4144b'; c.beginPath(); c.ellipse(6.4,-5.5,1.2,2.5,0,0,7); c.fill(); c.fillStyle='#fff'; c.fillRect(5.6,-7,0.9,1.5);
  c.strokeStyle='#0a3d8a'; c.lineWidth=1.8; c.beginPath(); c.moveTo(1,-9.5); c.lineTo(11,-7.5); c.stroke();
  // antler horns (gold, branching) and the beard
  c.strokeStyle='#ffd34d'; c.lineWidth=2.6; c.beginPath(); c.moveTo(-5,-9); c.quadraticCurveTo(-12,-17,-20,-18); c.moveTo(-10,-14); c.lineTo(-12,-22); c.moveTo(-14,-16); c.lineTo(-19,-23); c.stroke();
  c.strokeStyle='#fff3b0'; c.lineWidth=1; c.beginPath(); c.moveTo(-5,-9); c.quadraticCurveTo(-12,-17,-20,-18); c.stroke();
  c.strokeStyle='#e9fbff'; c.lineWidth=1.6; c.beginPath(); c.moveTo(14,2); c.quadraticCurveTo(12,12+Math.sin(T)*2,6,16); c.moveTo(11,3); c.quadraticCurveTo(8,10,1,13); c.stroke();
  // long flowing whiskers
  const w=Math.sin(T*0.9); c.strokeStyle='#ffe27a'; c.lineWidth=1.6; c.beginPath(); c.moveTo(21,-2); c.bezierCurveTo(32,-8+w*3,40,-3+w*5,50,-9+w*6); c.moveTo(21,0); c.bezierCurveTo(32,6+w*3,38,6+w*5,48,12+w*6); c.stroke();
  // hair behind the horns
  for(let k=0;k<5;k++){ const hy=-8+k*3.6, hl=10+4*Math.sin(T*1.4+k); c.fillStyle=k%2?'#9ff3ff':'#ffffff'; c.beginPath(); c.moveTo(-14,hy); c.quadraticCurveTo(-14-hl*0.6,hy-3,-14-hl,hy+Math.sin(T+k)*3); c.quadraticCurveTo(-14-hl*0.5,hy+2,-14,hy+3); c.closePath(); c.fill(); }
  c.restore();
}
