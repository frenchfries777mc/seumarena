function drawProjectileBase(b){
  drawTrail(b);
  const w = WEAPONS[b.wid];
  let shape = w ? w.shape : (b.wid==='rifle_missile' ? 'rocket' : (b.wid==='pirate_ball' ? 'cannonball' : 'bullet'));
  if(shape==='pitchfork' && !b.dmgless && b.swingAngle===undefined) shape='pitchforkThrow';          // the same weapon: the swing is a harmless picture (dmgless), the thing that flies is the thrown pitchfork
  const ang = (b.swingAngle!==undefined) ? b.swingAngle : Math.atan2(b.vy||0, b.vx||0);
  // a melee swing is drawn as long as the weapon really reaches: the arcs were drawn for the original ranges (sword 85, bat 82, dagger 40, gloves 45)
  const rs = (w && w.range && MELEE_DRAW_RANGE[shape]) ? w.range/MELEE_DRAW_RANGE[shape] : 1;
  ctx.save();
  ctx.translate(b.x, b.y);
  ctx.rotate(ang);
  if(rs!==1) ctx.scale(rs, rs);
  if(b.scale) ctx.scale(b.scale, b.scale);
  if(b.wid==='flashbang'){ ctx.fillStyle='#e8ecf2'; ctx.strokeStyle='#8b93a3'; ctx.lineWidth=1.4; ctx.beginPath(); ctx.roundRect(-8,-5,16,10,3); ctx.fill(); ctx.stroke(); ctx.fillStyle='#ffd34d'; ctx.fillRect(-2,-7,4,3); }
  if(b.wid==='barrel'){ ctx.fillStyle='#8a5a2a'; ctx.strokeStyle='#3b2410'; ctx.lineWidth=1.6; ctx.beginPath(); ctx.ellipse(0,0,12,10,0,0,7); ctx.fill(); ctx.stroke(); ctx.strokeStyle='#d9b27a'; ctx.beginPath(); ctx.moveTo(-5,-9); ctx.lineTo(-5,9); ctx.moveTo(5,-9); ctx.lineTo(5,9); ctx.stroke(); ctx.fillStyle='#ff5a1f'; ctx.fillRect(-1.5,-15,3,6); }
  if(b.wid==='lasso'){ const ow=players[b.owner]; if(ow && ow.x!==undefined){ const dx=ow.x-b.x, dy=(ow.y-40)-b.y, ca=Math.cos(ang), sa=Math.sin(ang); ctx.strokeStyle='#a8793c'; ctx.lineWidth=2.4; ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(dx*ca+dy*sa, -dx*sa+dy*ca); ctx.stroke(); } ctx.strokeStyle='#d9b27a'; ctx.lineWidth=3; ctx.beginPath(); ctx.ellipse(4,0,12,9,0,0,7); ctx.stroke(); }
  if(b.wid==='kurus_dark'){ const g=ctx.createLinearGradient(-60,0,16,0); g.addColorStop(0,'rgba(20,8,36,0)'); g.addColorStop(1,'rgba(48,18,84,0.95)'); ctx.fillStyle=g; ctx.beginPath(); ctx.ellipse(-22,0,44,11,0,0,7); ctx.fill(); ctx.fillStyle='#120820'; ctx.shadowColor='#7b3fd1'; ctx.shadowBlur=14; ctx.beginPath(); ctx.arc(0,0,11,0,7); ctx.fill(); ctx.shadowBlur=0; }
  if(b.wid==='baseball'){ ctx.fillStyle='#f4f4f4'; ctx.beginPath(); ctx.arc(0,0,8,0,7); ctx.fill(); ctx.strokeStyle='#d33'; ctx.lineWidth=1.2; ctx.beginPath(); ctx.arc(-6,0,6,-1,1); ctx.stroke(); ctx.beginPath(); ctx.arc(6,0,6,Math.PI-1,Math.PI+1); ctx.stroke(); ctx.restore(); return; }
  if(b.wid==='pizarro_spear'){ ctx.strokeStyle='#8a5a2a'; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(-24,0); ctx.lineTo(14,0); ctx.stroke(); ctx.fillStyle='#e8ecf2'; ctx.beginPath(); ctx.moveTo(26,0); ctx.lineTo(13,-5); ctx.lineTo(13,5); ctx.closePath(); ctx.fill(); ctx.restore(); return; }
  if(b.lob){      // thrown smoke grenade / molotov: a spinning can or bottle
    ctx.rotate(performance.now()*0.012-ang);
    if(b.lob==='smoke'){ ctx.fillStyle='#8a929e'; ctx.fillRect(-6,-8,12,16); ctx.fillStyle='#d9dee6'; ctx.fillRect(-6,-3,12,5); ctx.fillStyle='#4a505a'; ctx.fillRect(-3,-11,6,4); }
    else { ctx.fillStyle='#7a4a1c'; ctx.beginPath(); ctx.roundRect(-5,-6,10,14,3); ctx.fill(); ctx.fillRect(-2,-11,4,6); const fl=3+Math.random()*3; ctx.fillStyle='#ffb02e'; ctx.beginPath(); ctx.arc(0,-13,fl,0,7); ctx.fill(); }
    ctx.restore(); return;
  }
  ctx.fillStyle=b.color; ctx.strokeStyle=b.color;
  switch(shape){
    case 'kdgun': {
      const K=kdPal(b.sk?conceptOfSkin(b.sk):''); ctx.shadowColor=K.a; ctx.shadowBlur=12; ctx.fillStyle=K.wing; ctx.strokeStyle=K.b; ctx.lineWidth=1.6;
      ctx.beginPath(); ctx.ellipse(0,0,12,3.8,0,0,7); ctx.fill(); ctx.stroke(); ctx.strokeStyle='#ffffff'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(-4,0); ctx.lineTo(8,0); ctx.stroke(); ctx.shadowBlur=0;
      break; }
    case 'shsword': {
      const P=nnPal(b.sk?conceptOfSkin(b.sk):''); const ow=players[b.owner];
      if(ow && ow.x!==undefined){ const dx=ow.x-b.x, dy=(ow.y-40)-b.y; ctx.save(); ctx.rotate(-ang); ctx.strokeStyle=hexA(P.a,0.85); ctx.lineWidth=2.2; ctx.setLineDash([5,3]); ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(dx,dy); ctx.stroke(); ctx.setLineDash([]); ctx.restore(); }
      ctx.shadowColor=P.a; ctx.shadowBlur=14; ctx.fillStyle=P.d; ctx.strokeStyle=P.a; ctx.lineWidth=1.8;
      ctx.beginPath(); ctx.moveTo(-6,-4); ctx.lineTo(26,-5); ctx.lineTo(42,0); ctx.lineTo(26,5); ctx.lineTo(-6,4); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(-2,0); ctx.lineTo(34,0); ctx.stroke(); ctx.lineWidth=2.4; ctx.beginPath(); ctx.moveTo(-6,-8); ctx.lineTo(-6,8); ctx.stroke(); ctx.shadowBlur=0;
      break; }
    case 'quarrel':
      ctx.lineCap='round'; ctx.strokeStyle='#8a5a2a'; ctx.lineWidth=2.6; ctx.beginPath(); ctx.moveTo(-12,0); ctx.lineTo(7,0); ctx.stroke();
      ctx.fillStyle='#d9dde5'; ctx.beginPath(); ctx.moveTo(14,0); ctx.lineTo(6,-3.2); ctx.lineTo(6,3.2); ctx.closePath(); ctx.fill();
      ctx.fillStyle='#e63946'; ctx.beginPath(); ctx.moveTo(-12,0); ctx.lineTo(-16,-3); ctx.lineTo(-9,0); ctx.lineTo(-16,3); ctx.closePath(); ctx.fill();
      break;
    case 'blowgun':
      if(b.wid==='kan') ctx.scale(1.9,1.9);      // 칸's darts are bigger (the hit circle too)
      ctx.strokeStyle='#3a2a14'; ctx.lineWidth=1.6; ctx.beginPath(); ctx.moveTo(-9,0); ctx.lineTo(6,0); ctx.stroke();
      ctx.fillStyle='#1faa6a'; ctx.beginPath(); ctx.moveTo(10,0); ctx.lineTo(5,-2.4); ctx.lineTo(5,2.4); ctx.closePath(); ctx.fill();
      ctx.strokeStyle='#e0334a'; ctx.lineWidth=1.4; ctx.beginPath(); ctx.moveTo(-9,0); ctx.lineTo(-12,-2.5); ctx.moveTo(-9,0); ctx.lineTo(-12,2.5); ctx.stroke();
      break;
    case 'needle':
      ctx.scale(b.ult?3.2:2.1, b.ult?3.2:2.1);
      ctx.strokeStyle='#e8eef8'; ctx.lineWidth=1.8; ctx.beginPath(); ctx.moveTo(-9,0); ctx.lineTo(9,0); ctx.stroke();
      ctx.strokeStyle='#ff9ecb'; ctx.lineWidth=1.2; ctx.beginPath(); ctx.moveTo(-9,0); ctx.quadraticCurveTo(-14,-3,-18,0); ctx.stroke();
      break;
    case 'soulorb': {
      ctx.globalCompositeOperation='lighter'; const g=ctx.createRadialGradient(0,0,0,0,0,13); g.addColorStop(0,'rgba(235,250,255,0.95)'); g.addColorStop(0.4,'rgba(150,200,255,0.75)'); g.addColorStop(1,'rgba(140,110,255,0)'); ctx.fillStyle=g; ctx.beginPath(); ctx.arc(0,0,13,0,7); ctx.fill();
      ctx.fillStyle='rgba(255,255,255,0.9)'; ctx.beginPath(); ctx.arc(0,0,3.4,0,7); ctx.fill(); break; }
    case 'cleonorb': {
      ctx.globalCompositeOperation='lighter'; const g=ctx.createRadialGradient(0,0,0,0,0,13); g.addColorStop(0,'rgba(255,255,255,0.95)'); g.addColorStop(0.35,'rgba(255,95,184,0.8)'); g.addColorStop(1,'rgba(255,95,184,0)'); ctx.fillStyle=g; ctx.beginPath(); ctx.arc(0,0,13,0,7); ctx.fill();
      ctx.fillStyle='#ffd34d'; ctx.beginPath(); ctx.arc(-9,0,2.2,0,7); ctx.fill(); break; }
    case 'dronebolt':
      ctx.lineCap='round'; ctx.strokeStyle='rgba(87,199,255,0.8)'; ctx.lineWidth=4; ctx.beginPath(); ctx.moveTo(-9,0); ctx.lineTo(8,0); ctx.stroke(); ctx.strokeStyle='#ffffff'; ctx.lineWidth=1.8; ctx.beginPath(); ctx.moveTo(-7,0); ctx.lineTo(8,0); ctx.stroke(); break;
    case 'syringe':
      ctx.lineCap='round'; ctx.strokeStyle='#cfd8e3'; ctx.lineWidth=1.4; ctx.beginPath(); ctx.moveTo(6,0); ctx.lineTo(15,0); ctx.stroke();
      ctx.fillStyle='rgba(235,245,255,0.95)'; ctx.strokeStyle='#8c9bb0'; ctx.lineWidth=1; ctx.beginPath(); ctx.rect(-8,-3,14,6); ctx.fill(); ctx.stroke();
      ctx.fillStyle='#d60f2c'; ctx.fillRect(-6,-2,9,4); ctx.strokeStyle='#8c9bb0'; ctx.beginPath(); ctx.moveTo(-8,-5); ctx.lineTo(-8,5); ctx.moveTo(-12,0); ctx.lineTo(-8,0); ctx.stroke(); break;
    case 'mask': {
      ctx.rotate(-ang+performance.now()*0.022);
      ctx.fillStyle='#f4f4f4'; ctx.beginPath(); ctx.arc(0,0,9,Math.PI/2,Math.PI*1.5); ctx.fill(); ctx.fillStyle='#16161c'; ctx.beginPath(); ctx.arc(0,0,9,-Math.PI/2,Math.PI/2); ctx.fill();
      ctx.strokeStyle='#16161c'; ctx.lineWidth=1.2; ctx.beginPath(); ctx.arc(-4,1.5,3.2,0.2,Math.PI-0.2); ctx.stroke(); ctx.strokeStyle='#f4f4f4'; ctx.beginPath(); ctx.arc(4,5.5,3.2,Math.PI+0.2,Math.PI*2-0.2); ctx.stroke(); break; }
    case 'arrow':
      ctx.strokeStyle='#8a6a3f'; ctx.lineWidth=2;
      ctx.beginPath(); ctx.moveTo(-10,0); ctx.lineTo(6,0); ctx.stroke();
      ctx.fillStyle='#cfd3dc';
      ctx.beginPath(); ctx.moveTo(10,0); ctx.lineTo(3,-3); ctx.lineTo(3,3); ctx.closePath(); ctx.fill();
      ctx.strokeStyle=b.color; ctx.lineWidth=1.5;
      ctx.beginPath(); ctx.moveTo(-10,0); ctx.lineTo(-6,-3); ctx.moveTo(-10,0); ctx.lineTo(-6,3); ctx.stroke();
      break;
    case 'star':
      ctx.rotate(performance.now()*0.02);
      ctx.fillStyle=b.color;
      for(let i=0;i<4;i++){ ctx.save(); ctx.rotate(i*Math.PI/2); ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(6,-2); ctx.lineTo(7,0); ctx.lineTo(6,2); ctx.closePath(); ctx.fill(); ctx.restore(); }
      break;
    case 'boomerang':
      ctx.rotate(performance.now()*0.018);
      ctx.strokeStyle=b.color; ctx.lineWidth=3;
      ctx.beginPath(); ctx.arc(0,0,7,0.3,2.8); ctx.stroke();
      break;
    case 'potion': {                                                      // 쿠루스's potion: a tumbling dark flask with a glowing drop inside
      ctx.rotate(performance.now()*0.014 + (b.sx||0)*0.01);
      ctx.fillStyle='#2a1640'; ctx.strokeStyle='#a374ff'; ctx.lineWidth=1.5;
      ctx.beginPath(); ctx.arc(0,2,6.5,0,7); ctx.fill(); ctx.stroke();
      ctx.fillStyle='#3b2a4f'; ctx.fillRect(-2,-8,4,5); ctx.fillStyle='#a07a52'; ctx.fillRect(-2.5,-10,5,2.4);
      ctx.fillStyle='rgba(196,139,255,0.85)'; ctx.beginPath(); ctx.arc(-1.5,1,2,0,7); ctx.fill();
      break; }
    case 'bomb':
      ctx.fillStyle=b.color; ctx.beginPath(); ctx.arc(0,0,6,0,7); ctx.fill();
      ctx.strokeStyle='#ffb703'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(0,-6); ctx.lineTo(4,-10); ctx.stroke();
      break;
    case 'rocket':
      ctx.fillStyle=b.color; ctx.fillRect(-10,-3,16,6);
      ctx.beginPath(); ctx.moveTo(6,-3); ctx.lineTo(13,0); ctx.lineTo(6,3); ctx.closePath(); ctx.fill();
      ctx.fillStyle='#ff8a3d'; ctx.beginPath(); ctx.moveTo(-10,-3); ctx.lineTo(-17,0); ctx.lineTo(-10,3); ctx.closePath(); ctx.fill();
      break;
    case 'card':
      ctx.rotate(performance.now()*0.012);
      ctx.fillStyle='#fdfdfd'; ctx.strokeStyle=b.color; ctx.lineWidth=2;
      ctx.beginPath(); ctx.rect(-6,-9,12,18); ctx.fill(); ctx.stroke();
      ctx.fillStyle='#d62839'; drawCardHeart(ctx,0,0,2.3);
      break;
    case 'pellet':
      glowDot(ctx,3,b.color,b.color,5);
      break;
    case 'fireball':
      ctx.save(); ctx.globalCompositeOperation='lighter';
      const fg=ctx.createRadialGradient(0,0,0,0,0,11); fg.addColorStop(0,'rgba(255,220,140,0.95)'); fg.addColorStop(0.5,'rgba(255,100,30,0.8)'); fg.addColorStop(1,'rgba(255,40,10,0)');
      ctx.fillStyle=fg; ctx.beginPath(); ctx.arc(0,0,11,0,7); ctx.fill();
      ctx.restore();
      ctx.fillStyle='#ffe08a'; ctx.beginPath(); ctx.arc(0,0,3.5,0,7); ctx.fill();
      break;
    case 'greatsword': break;          // 용살자: the light is drawn along the real arm swing in drawStickman
    case 'dspaper': {                  // 만화가 용살자: a small paper plane thrown at the enemy
      drawPaperShape(ctx, 30, performance.now());
      addP({x:b.x-Math.cos(ang)*8+RND(-2,2),y:b.y-Math.sin(ang)*8+RND(-2,2),vx:RND(-10,10),vy:RND(-10,20),life:RND(.25,.5),size:RND(1.4,2.4),color:'#f4f1e8',add:false,grav:40,drag:1.5});
      break;
    }
    case 'dsfireball': {              // the dragon's fireball: a white-hot core with ragged flame lobes and a long comet tail of fire
      const tt=performance.now()/1000;
      ctx.save(); ctx.globalCompositeOperation='lighter';
      for(let k=0;k<3;k++){ const L=92-k*20, W=17-k*4; const g=ctx.createLinearGradient(0,0,-L,0); g.addColorStop(0,k===2?'rgba(255,250,210,0.95)':(k===1?'rgba(255,170,60,0.8)':'rgba(255,90,20,0.6)')); g.addColorStop(1,'rgba(255,40,10,0)'); ctx.fillStyle=g; ctx.beginPath(); ctx.moveTo(0,-W); for(let i=1;i<=8;i++){ const x=-L*i/8; ctx.lineTo(x,-W*(1-i/8)-Math.sin(tt*26+i*1.7+k)*3.2*(i/8)); } for(let i=8;i>=1;i--){ const x=-L*i/8; ctx.lineTo(x,W*(1-i/8)+Math.sin(tt*24+i*1.3+k*2)*3.2*(i/8)); } ctx.lineTo(0,W); ctx.closePath(); ctx.fill(); }
      for(let k=0;k<3;k++){ const R=24-k*7; const g=ctx.createRadialGradient(0,0,0,0,0,R); g.addColorStop(0,k===2?'rgba(255,255,235,1)':'rgba(255,200,90,'+(0.8-k*0.1)+')'); g.addColorStop(0.55,'rgba(255,110,30,'+(0.55-k*0.1)+')'); g.addColorStop(1,'rgba(255,40,10,0)'); ctx.fillStyle=g; ctx.beginPath(); ctx.arc(0,0,R,0,7); ctx.fill(); }
      ctx.restore();
      const ba=ang+Math.PI; addP({x:b.x+Math.cos(ba)*RND(8,40),y:b.y+Math.sin(ba)*RND(8,40)+RND(-8,8),vx:RND(-40,40),vy:RND(-60,-10),life:RND(.3,.6),size:RND(2.2,5),color:Math.random()<.5?'#ff7a2a':'#ffd34d',grav:-80,drag:2});
      break;
    }
    case 'axe': {                                                         // 하랄드's blow: a heavy overhead arc that ends in a dust burst
      const prog=b.life0 ? clamp(1-(b.life/b.life0),0,1) : 1;
      const a0=-1.9, a1=a0+2.9*prog, r=38; ctx.lineCap='round';
      ctx.save(); ctx.globalCompositeOperation='lighter';
      for(let k=0;k<3;k++){ ctx.strokeStyle=hexA('#ffcf8a',0.28-0.07*k); ctx.lineWidth=22-k*7; ctx.beginPath(); ctx.arc(0,0,r,Math.max(a0,a1-1.6),a1); ctx.stroke(); }
      ctx.restore();
      ctx.strokeStyle=hexA('#ffb347',0.7); ctx.lineWidth=5; ctx.beginPath(); ctx.arc(0,0,r,a0,a1); ctx.stroke();
      ctx.strokeStyle='#ffffff'; ctx.lineWidth=3; ctx.beginPath(); ctx.arc(0,0,r,Math.max(a0,a1-0.9),a1); ctx.stroke();
      if(prog>0 && prog<1){ const wa=ang+a1; addP({x:b.x+Math.cos(wa)*r,y:b.y+Math.sin(wa)*r,vx:RND(-120,120),vy:RND(-120,40),life:RND(.2,.4),size:RND(2,3.6),color:'#ffd9a0',drag:3}); }
      break;
    }
    case 'neon': {
      const P=nnPal(b.sk?conceptOfSkin(b.sk):''); const prog=b.life0 ? clamp(1-(b.life/b.life0),0,1) : 1;
      const a0=-1.9, a1=a0+3.6*prog, r=40; ctx.lineCap='round';
      ctx.save(); ctx.globalCompositeOperation='lighter';
      for(let k=0;k<3;k++){ ctx.strokeStyle=hexA(P.a,0.3-0.08*k); ctx.lineWidth=24-k*7; ctx.beginPath(); ctx.arc(0,0,r,Math.max(a0,a1-1.7),a1); ctx.stroke(); }
      ctx.restore();
      ctx.strokeStyle=hexA(P.b,0.85); ctx.lineWidth=4.5; ctx.beginPath(); ctx.arc(0,0,r,a0,a1); ctx.stroke();
      ctx.strokeStyle='#ffffff'; ctx.lineWidth=2.4; ctx.beginPath(); ctx.arc(0,0,r,Math.max(a0,a1-0.9),a1); ctx.stroke();
      break;
    }
    case 'katana':
    case 'lanternstaff':
    case 'blade': {
      const prog=b.life0 ? clamp(1-(b.life/b.life0),0,1) : 1;
      const a0=-1.7, a1=a0+3.4*prog, r=30; ctx.lineCap='round';
      ctx.save(); ctx.globalCompositeOperation='lighter';
      for(let k=0;k<3;k++){ ctx.strokeStyle=hexA('#cfe3ff',0.24-0.06*k); ctx.lineWidth=16-k*5; ctx.beginPath(); ctx.arc(0,0,r,Math.max(a0,a1-1.3),a1); ctx.stroke(); }
      ctx.restore();
      ctx.strokeStyle=hexA(b.color,0.55); ctx.lineWidth=4; ctx.beginPath(); ctx.arc(0,0,r,a0,a1); ctx.stroke();
      ctx.strokeStyle='#ffffff'; ctx.lineWidth=3; ctx.beginPath(); ctx.arc(0,0,r,Math.max(a0,a1-0.8),a1); ctx.stroke();
      if(prog>0 && prog<1){ const wa=ang+a1; addP({x:b.x+Math.cos(wa)*r*rs,y:b.y+Math.sin(wa)*r*rs,vx:RND(-70,70),vy:RND(-70,70),life:RND(.18,.32),size:RND(1.5,2.8),color:'#ffffff',drag:3}); }
      break;
    }
    case 'spear': {                                                       // the thrust is drawn as a rush of wind (no spear flies): tapered streaks race out to the full reach and fade
      const prog=b.life0 ? clamp(1-(b.life/b.life0),0,1) : 1, reach=(b.reach||(w&&w.range)||160), gold=!!b.ult, wc=gold?'#ffd866':'#eaf6ff', ext=Math.min(1,prog/0.5), fade=1-prog;
      ctx.lineCap='round'; ctx.save(); ctx.globalCompositeOperation='lighter';
      const streaks=[[0,26,0.55],[-9,20,0.4],[9,20,0.4],[-16,12,0.25],[16,12,0.25]];
      for(const [off,len,al] of streaks){
        const head=20+(reach-20)*ext, tail=Math.max(8, head-len*3.2*(0.6+0.4*ext)), wob=Math.sin(prog*9+off)*2.2;
        const g=ctx.createLinearGradient(tail,0,head,0); g.addColorStop(0,'rgba(255,255,255,0)'); g.addColorStop(1,hexA(wc,al*fade+0.05));
        ctx.strokeStyle=g; ctx.lineWidth=Math.max(1.4,6-Math.abs(off)*0.18); ctx.beginPath(); ctx.moveTo(tail,off*0.55); ctx.quadraticCurveTo((tail+head)/2,off+wob,head,off*0.35); ctx.stroke();
      }
      ctx.strokeStyle=hexA(gold?'#fff0b0':'#ffffff',0.55*fade); ctx.lineWidth=gold?3:2; ctx.beginPath(); ctx.arc(20+(reach-20)*ext,0,6+10*ext,-1.1,1.1); ctx.stroke();      // the little shock arc at the tip
      ctx.restore();
      if(prog>0 && prog<1) addP({x:b.x+Math.cos(ang)*(20+(reach-20)*ext)*rs,y:b.y+Math.sin(ang)*(20+(reach-20)*ext)*rs,vx:RND(-90,90),vy:RND(-90,90),life:RND(.15,.3),size:RND(1.4,2.6),color:'#eaf6ff',drag:3});
      break;
    }
    case 'pitchfork': {                                                   // the swing of the pitchfork: a sand-coloured arc in the owner's colour with three little tines at its head
      const prog=b.life0 ? clamp(1-(b.life/b.life0),0,1) : 1;
      const a0=-1.6, a1=a0+3.2*prog, r=30; ctx.lineCap='round';
      ctx.save(); ctx.globalCompositeOperation='lighter';
      for(let k=0;k<3;k++){ ctx.strokeStyle=hexA(conceptOfSkin(b.sk)==='poseidon'?'#8fe6ff':'#ffd98a',0.26-0.07*k); ctx.lineWidth=22-k*7; ctx.beginPath(); ctx.arc(0,0,r,Math.max(a0,a1-1.4),a1); ctx.stroke(); }
      ctx.restore();
      ctx.strokeStyle=hexA(b.color,0.8); ctx.lineWidth=4; ctx.beginPath(); ctx.arc(0,0,r,a0,a1); ctx.stroke();
      ctx.strokeStyle=conceptOfSkin(b.sk)==='poseidon'?'#e6fbff':'#f3e3b0'; ctx.lineWidth=2; for(let k=-1;k<=1;k++){ const aa=a1+k*0.13; ctx.beginPath(); ctx.moveTo(Math.cos(aa)*(r-5),Math.sin(aa)*(r-5)); ctx.lineTo(Math.cos(aa)*(r+9),Math.sin(aa)*(r+9)); ctx.stroke(); }
      break;
    }
    case 'pitchforkThrow': {                                              // the thrown pitchfork: turning round and round as it flies
      ctx.rotate(-ang + performance.now()*0.021 + (b.sx||0)*0.013);
      ctx.lineCap='round'; ctx.strokeStyle='#8a5a2b'; ctx.lineWidth=3.4; ctx.beginPath(); ctx.moveTo(-17,0); ctx.lineTo(11,0); ctx.stroke();
      ctx.strokeStyle='#e4e7ee'; ctx.lineWidth=2.6; ctx.beginPath(); ctx.moveTo(11,-6.5); ctx.lineTo(11,6.5); ctx.moveTo(11,-6.5); ctx.lineTo(23,-6.5); ctx.moveTo(11,0); ctx.lineTo(25,0); ctx.moveTo(11,6.5); ctx.lineTo(23,6.5); ctx.stroke();
      ctx.fillStyle='#f2c230'; ctx.fillRect(-5,-2.2,3,4.4);
      break;
    }
    case 'saber': {                                                       // a lightsaber swing: a long bright arc in the owner's colour with a white core, and sparks
      const prog=b.life0 ? clamp(1-(b.life/b.life0),0,1) : 1;
      const a0=-1.9, a1=a0+3.8*prog, r=32; ctx.lineCap='round';
      ctx.save(); ctx.globalCompositeOperation='lighter';
      for(let k=0;k<4;k++){ ctx.strokeStyle=hexA(b.color,0.30-0.065*k); ctx.lineWidth=26-k*6; ctx.beginPath(); ctx.arc(0,0,r,Math.max(a0,a1-1.6),a1); ctx.stroke(); }
      ctx.restore();
      ctx.strokeStyle=hexA(b.color,0.85); ctx.lineWidth=6; ctx.beginPath(); ctx.arc(0,0,r,a0,a1); ctx.stroke();
      ctx.strokeStyle='#ffffff'; ctx.lineWidth=3; ctx.beginPath(); ctx.arc(0,0,r,Math.max(a0,a1-1.0),a1); ctx.stroke();
      if(prog>0 && prog<1){ const wa=ang+a1; for(let i=0;i<2;i++) addP({x:b.x+Math.cos(wa)*r*rs,y:b.y+Math.sin(wa)*r*rs,vx:RND(-110,110),vy:RND(-110,110),life:RND(.2,.38),size:RND(1.6,3),color:i?b.color:'#ffffff',drag:3}); }
      break;
    }
    case 'club': {
      const prog=b.life0 ? clamp(1-(b.life/b.life0),0,1) : 1;
      const a0=-1.0, a1=a0+2.0*prog, r=34; ctx.lineCap='round';
      ctx.save(); ctx.globalCompositeOperation='lighter';
      for(let k=0;k<3;k++){ ctx.strokeStyle=hexA('#ffcf7a',0.26-0.07*k); ctx.lineWidth=22-k*7; ctx.beginPath(); ctx.arc(0,0,r,Math.max(a0,a1-1.1),a1); ctx.stroke(); }
      ctx.restore();
      ctx.strokeStyle=hexA(b.color,0.6); ctx.lineWidth=8; ctx.beginPath(); ctx.arc(0,0,r,a0,a1); ctx.stroke();
      ctx.strokeStyle='#fff3d6'; ctx.lineWidth=4; ctx.beginPath(); ctx.arc(0,0,r,Math.max(a0,a1-0.7),a1); ctx.stroke();
      if(prog>0 && prog<1){ const wa=ang+a1; for(let i=0;i<2;i++) addP({x:b.x+Math.cos(wa)*r*rs,y:b.y+Math.sin(wa)*r*rs,vx:RND(-90,90),vy:RND(-90,90),life:RND(.2,.35),size:RND(1.8,3.2),color:i?'#ffcf7a':'#ffffff',drag:3}); }
      break;
    }
    case 'hook':
    case 'dagger': {
      const prog=b.life0 ? clamp(1-(b.life/b.life0),0,1) : 1; ctx.lineCap='round';
      ctx.save(); ctx.globalCompositeOperation='lighter';
      ctx.strokeStyle=hexA('#cfe3ff',0.35); ctx.lineWidth=12; ctx.beginPath(); ctx.moveTo(-6,0); ctx.lineTo(-6+30*prog,0); ctx.stroke();
      ctx.restore();
      ctx.strokeStyle=hexA(b.color,0.8); ctx.lineWidth=4; ctx.beginPath(); ctx.moveTo(-6,0); ctx.lineTo(-6+26*prog,0); ctx.stroke();
      ctx.strokeStyle='#ffffff'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(-6+10*prog,0); ctx.lineTo(-6+26*prog,0); ctx.stroke();
      if(prog>0 && prog<1) addP({x:b.x+Math.cos(ang)*(20*prog*rs),y:b.y+Math.sin(ang)*(20*prog*rs),vx:RND(-60,60),vy:RND(-60,60),life:RND(.15,.28),size:RND(1.4,2.4),color:'#ffffff',drag:3});
      break;
    }
    case 'fist': {
      const prog=b.life0 ? clamp(1-(b.life/b.life0),0,1) : 1;
      ctx.save(); ctx.globalCompositeOperation='lighter';
      ctx.strokeStyle=hexA('#ffffff',0.7*(1-prog)); ctx.lineWidth=4*(1-prog)+1; ctx.beginPath(); ctx.arc(6+10*prog,0,8+22*prog,0,7); ctx.stroke();
      const g=ctx.createRadialGradient(6+10*prog,0,0,6+10*prog,0,18); g.addColorStop(0,hexA('#ffe08a',0.6)); g.addColorStop(1,hexA('#ffe08a',0));
      ctx.fillStyle=g; ctx.beginPath(); ctx.arc(6+10*prog,0,18,0,7); ctx.fill();
      ctx.restore();
      ctx.fillStyle=b.color; ctx.beginPath(); ctx.arc(6+10*prog,0,7,0,7); ctx.fill();
      break;
    }
    case 'chip': {
      ctx.rotate(performance.now()/60); ctx.scale(b.ult?1.7:1.15,b.ult?1.7:1.15);
      ctx.fillStyle='#d62839'; ctx.strokeStyle='#fff'; ctx.lineWidth=1.6; ctx.beginPath(); ctx.arc(0,0,8,0,7); ctx.fill(); ctx.stroke();
      ctx.lineWidth=2; ctx.setLineDash([3,3.2]); ctx.beginPath(); ctx.arc(0,0,5,0,7); ctx.stroke(); ctx.setLineDash([]);
      break;
    }
    case 'cannonball':
      ctx.fillStyle='#23232b'; ctx.strokeStyle='#8a8a98'; ctx.lineWidth=1.5; ctx.beginPath(); ctx.arc(0,0,8,0,7); ctx.fill(); ctx.stroke();
      ctx.fillStyle='rgba(255,255,255,0.35)'; ctx.beginPath(); ctx.arc(-2.5,-2.5,2.4,0,7); ctx.fill();
      break;
    case 'portalbullet':
      ctx.rotate(performance.now()/90);
      ctx.strokeStyle='#a855f7'; ctx.lineWidth=2; ctx.globalCompositeOperation='lighter';
      ctx.beginPath(); ctx.arc(0,0,5,0.3,5.2); ctx.stroke();
      ctx.fillStyle='#e9d5ff'; ctx.beginPath(); ctx.arc(0,0,2.2,0,7); ctx.fill();
      break;
    default:
      if(b.wid==='pistol' && b.big){      // 제임스 6th shot: a big red bullet with a hot white core
        const r=BULLET_R*2.1; ctx.beginPath(); ctx.arc(0,0,r,0,7); ctx.shadowColor='#ff2d2d'; ctx.shadowBlur=22; ctx.fill(); ctx.shadowBlur=0;
        ctx.fillStyle='#ffb3a8'; ctx.beginPath(); ctx.arc(0,0,r*0.55,0,7); ctx.fill(); ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(-r*0.1,0,r*0.25,0,7); ctx.fill();
        ctx.strokeStyle='#fff'; ctx.lineWidth=1.6; ctx.beginPath(); ctx.arc(0,0,r+1,0,7); ctx.stroke(); break;
      }
      glowDot(ctx,BULLET_R,ctx.fillStyle,b.color,8);
  }
  ctx.restore();
}
/* a round bullet with a soft glow (shadowBlur): drawn once per colour, size and zoom into a small canvas and stamped from there
   (a blurred shadow on every bullet every frame was slow on phones). Same picture: the blur is in screen pixels either way */
const glowSpr=new Map(); let glowK=0;
function glowDot(c,r,fill,glow,blur){
  const m=c.getTransform(), k=Math.round(Math.hypot(m.a,m.b)*20)/20;
  if(typeof fill!=='string' || !(k>0.05 && k<8)){ c.beginPath(); c.arc(0,0,r,0,7); c.fillStyle=fill; c.shadowColor=glow; c.shadowBlur=blur; c.fill(); c.shadowBlur=0; return; }
  if(k!==glowK){ glowSpr.clear(); glowK=k; }
  const key=r+'|'+fill+'|'+glow+'|'+blur; let s=glowSpr.get(key);
  if(!s){ const n=Math.ceil((r*k+blur*1.5+2)*2); s=document.createElement('canvas'); s.width=s.height=n; const g=s.getContext('2d');
    g.translate(n/2,n/2); g.scale(k,k); g.beginPath(); g.arc(0,0,r,0,7); g.fillStyle=fill; g.shadowColor=glow; g.shadowBlur=blur; g.fill();
    if(glowSpr.size>60) glowSpr.delete(glowSpr.keys().next().value); glowSpr.set(key,s); }
  const w=s.width/k; c.drawImage(s,-w/2,-w/2,w,w);
}
function drawTrail(b){
  if(b.swingAngle!==undefined || b.dmgless) return;
  const sp=Math.hypot(b.vx||0,b.vy||0); if(sp<50) return;
  const shape=(WEAPONS[b.wid]||{}).shape || (b.wid==='rifle_missile'?'rocket':undefined);
  let wd=b.wid==='pirate_ball'?5:{bullet:4,pellet:3,star:3,arrow:2.5,card:4,rocket:7,bomb:3,boomerang:4,fireball:6,pitchfork:3}[shape]; if(!wd) return;
  if(b.ult) wd*=1.6;
  const L=clamp(sp*0.07,16,70)*(shape==='rocket'?0.7:1);
  const ux=b.vx/sp, uy=b.vy/sp;
  const col=shape==='rocket'?'#ffae42':(shape==='card'?'#ffffff':(b.fire?'#ff8a3d':(b.ult&&b.wid==='pistol'?'#ffd34d':b.color)));
  ctx.save(); ctx.globalCompositeOperation='lighter'; ctx.lineCap='round';
  const g=ctx.createLinearGradient(b.x,b.y,b.x-ux*L,b.y-uy*L);
  g.addColorStop(0,hexA(col,0.85)); g.addColorStop(1,hexA(col,0));
  ctx.strokeStyle=g; ctx.lineWidth=wd; ctx.beginPath(); ctx.moveTo(b.x,b.y); ctx.lineTo(b.x-ux*L,b.y-uy*L); ctx.stroke();
  const rg=ctx.createRadialGradient(b.x,b.y,0,b.x,b.y,wd*3.4);
  rg.addColorStop(0,hexA(col,0.6)); rg.addColorStop(1,hexA(col,0));
  ctx.fillStyle=rg; ctx.beginPath(); ctx.arc(b.x,b.y,wd*3.4,0,7); ctx.fill();
  ctx.restore();
}
const MELEE_DRAW_RANGE={spear:160, blade:85, club:82, dagger:40, fist:45, saber:100, pitchfork:105, hook:55, katana:90, greatsword:90, neon:115};   // the reach the swing graphics were drawn for
function drawFireDragon(c,now,face,flap,breath,headOnly){       // a red western dragon seen from the side (head toward +x): flapping bat wings with finger bones, a long arched neck, a horned head with an open fire-lit jaw, a tapering spine-covered tail
  const T=now*0.0055+(flap||0), fl=Math.sin(T*2.4), bob=Math.sin(T*1.2)*3;
  c.save(); c.scale(face,1); c.translate(0,bob); c.lineJoin='round'; c.lineCap='round';
  const bez=(P,t)=>{ const u=1-t; return {x:u*u*u*P[0][0]+3*u*u*t*P[1][0]+3*u*t*t*P[2][0]+t*t*t*P[3][0], y:u*u*u*P[0][1]+3*u*u*t*P[1][1]+3*u*t*t*P[2][1]+t*t*t*P[3][1]}; };
  const wing=(far)=>{ c.save(); c.translate(-4,-22); const up=-1.15+fl*0.62+(far?0.25:0); c.rotate(up); if(far) c.globalAlpha*=0.82;
    const arm=[[0,0],[-14,-42],[-30,-92],[-54,-122]], tips=[[-54,-122],[-98,-100],[-118,-52],[-104,-6],[-70,10]];
    { const wg=c.createLinearGradient(0,0,-110,-70); wg.addColorStop(0,far?'#4a0914':'#7a1124'); wg.addColorStop(0.6,far?'#7a1428':'#b3243b'); wg.addColorStop(1,far?'#a02a3c':'#e0584a'); c.fillStyle=wg; } c.strokeStyle='#2c050c'; c.lineWidth=1.8;
    c.beginPath(); c.moveTo(0,0); c.bezierCurveTo(-14,-42,-30,-92,-54,-122);
    for(let i=1;i<tips.length;i++){ const q=tips[i], pq=tips[i-1], mx=(q[0]+pq[0])/2, my=(q[1]+pq[1])/2; c.quadraticCurveTo(mx+ (i%2?10:-4), my+(i%2?8:-10)*0+6, q[0], q[1]); }
    c.quadraticCurveTo(-36,18,0,8); c.closePath(); c.fill(); c.stroke();                                              // the membrane with scalloped edge
    c.strokeStyle=far?'#a8283c':'#e0485a'; c.lineWidth=2.4; c.beginPath(); c.moveTo(0,0); c.bezierCurveTo(-14,-42,-30,-92,-54,-122); c.stroke();     // the arm bone
    c.lineWidth=1.6; for(let i=1;i<tips.length;i++){ c.beginPath(); c.moveTo(-40,-100); c.lineTo(tips[i][0]*0.96,tips[i][1]*0.96); c.stroke(); }  // the finger bones
    c.fillStyle='#e8d6a8'; c.beginPath(); c.arc(-54,-122,2.6,0,7); c.fill(); c.restore(); };
  if(!headOnly) wing(true);
  // spine: tail tip -> body -> neck -> head, drawn as a tapering tube
  const tail=[[-170,26],[-120,52],[-70,-6],[-26,6]], neck=[[-14,0],[34,6],[40,-52],[78,-60]];
  const pts=[]; for(let i=0;i<=24;i++){ const q=bez(tail,i/24), f=i/24; pts.push({x:q.x,y:q.y+Math.sin(T*2.0-i*0.3)*(1-f)*5,r:2.5+f*f*15}); }
  pts.push({x:-8,y:2,r:25}); for(let i=1;i<=18;i++){ const q=bez(neck,i/18), f=i/18; pts.push({x:q.x,y:q.y,r:21-f*11}); }
  const tube=(col,dr,dy)=>{ c.fillStyle=col; for(const q of pts){ c.beginPath(); c.arc(q.x,q.y+dy,Math.max(1,q.r+dr),0,7); c.fill(); } };
  tube('#3a0610',2,0); tube('#c3213a',0,0);                                                                         // outline, then the red skin
  c.save(); c.globalAlpha=0.55; tube('#f0c06a',-9,9); c.restore();
  c.save(); c.globalAlpha=0.3; tube('#ff7a6a',-12,-7); c.restore(); c.save(); c.globalAlpha=0.35; tube('#3a0610',-6,8); c.restore();      // a lit ridge on the back and a darker underside: the body reads as round                                                  // the pale belly strip
  c.fillStyle='#7a0f20'; for(let i=3;i<pts.length-4;i+=2){ const q=pts[i], h=4+q.r*0.28; c.beginPath(); c.moveTo(q.x-3,q.y-q.r+1); c.lineTo(q.x+1,q.y-q.r-h); c.lineTo(q.x+4,q.y-q.r+2); c.closePath(); c.fill(); }   // the back spikes
  c.strokeStyle='rgba(60,4,12,0.45)'; c.lineWidth=1; for(let i=6;i<pts.length-6;i+=2){ const q=pts[i]; c.beginPath(); c.arc(q.x,q.y,q.r*0.7,-0.9,0.9); c.stroke(); }   // scale marks
  // the tail's spade tip
  const tp=pts[0]; c.fillStyle='#7a0f20'; c.strokeStyle='#2c050c'; c.lineWidth=1.4; c.beginPath(); c.moveTo(tp.x+2,tp.y); c.lineTo(tp.x-18,tp.y-9); c.lineTo(tp.x-14,tp.y+1); c.lineTo(tp.x-20,tp.y+12); c.closePath(); c.fill(); c.stroke();
  // legs: haunch + foot with claws, forelegs tucked
  const leg=(x,y,sw)=>{ c.strokeStyle='#2c050c'; c.lineWidth=11; c.beginPath(); c.moveTo(x,y); c.quadraticCurveTo(x-6,y+16,x-2+sw,y+30); c.stroke(); c.strokeStyle='#b41d34'; c.lineWidth=8; c.beginPath(); c.moveTo(x,y); c.quadraticCurveTo(x-6,y+16,x-2+sw,y+30); c.stroke(); c.strokeStyle='#f4e8c8'; c.lineWidth=2; for(let k=0;k<3;k++){ c.beginPath(); c.moveTo(x-2+sw,y+30); c.lineTo(x+6+k*4+sw,y+38+k); c.stroke(); } };
  if(!headOnly){ leg(-24,14,Math.sin(T*2.4)*3); leg(14,16,-Math.sin(T*2.4)*3); }
  // the head
  const h=pts[pts.length-1], hx=h.x, hy=h.y, jaw=0.34+0.1*Math.sin(T*3);
  c.save(); c.translate(hx,hy); c.rotate(0.12);
  c.fillStyle='#d12a44'; c.strokeStyle='#2c050c'; c.lineWidth=1.8;
  c.beginPath(); c.moveTo(-12,-12); c.quadraticCurveTo(10,-18,34,-9); c.lineTo(44,-4); c.lineTo(30,2); c.quadraticCurveTo(8,6,-12,8); c.closePath(); c.fill(); c.stroke();      // the skull and the upper jaw
  c.save(); c.translate(-6,6); c.rotate(jaw); c.fillStyle='#a81d36'; c.beginPath(); c.moveTo(0,0); c.quadraticCurveTo(22,6,44,12); c.lineTo(34,16); c.quadraticCurveTo(14,16,-2,10); c.closePath(); c.fill(); c.stroke();    // the lower jaw, open
  c.fillStyle='#fff6dc'; for(let k=0;k<4;k++){ c.beginPath(); c.moveTo(8+k*9,5+k*1.6); c.lineTo(11+k*9,-1+k*1.6); c.lineTo(14+k*9,6+k*1.6); c.fill(); } c.restore();
  c.fillStyle='#fff6dc'; for(let k=0;k<4;k++){ c.beginPath(); c.moveTo(14+k*7,4); c.lineTo(16+k*7,10); c.lineTo(19+k*7,4); c.fill(); }                                                // the upper teeth
  c.fillStyle='#e8d6a8'; c.strokeStyle='#2c050c'; c.lineWidth=1.4; for(const [ox,oy,len] of [[-6,-12,-30],[2,-14,-22]]){ c.beginPath(); c.moveTo(ox,oy); c.quadraticCurveTo(ox-8,oy-10,ox+len,oy-8); c.quadraticCurveTo(ox-6,oy-4,ox+8,oy+2); c.closePath(); c.fill(); c.stroke(); }   // the swept-back horns
  c.fillStyle='#ffe27a'; c.beginPath(); c.ellipse(12,-6,4.2,3,0.2,0,7); c.fill(); c.fillStyle='#1a0000'; c.fillRect(11,-8,1.8,4.6);                                          // the eye
  c.fillStyle='#2c050c'; c.beginPath(); c.arc(39,-6,1.6,0,7); c.fill();                                                                                                      // the nostril
  c.globalCompositeOperation='lighter'; const g=c.createRadialGradient(46,6,1,46,6,26); g.addColorStop(0,'rgba(255,240,170,0.95)'); g.addColorStop(0.45,'rgba(255,120,30,0.65)'); g.addColorStop(1,'rgba(255,40,10,0)'); c.fillStyle=g; c.beginPath(); c.arc(46,6,26,0,7); c.fill(); c.restore();      // fire at the mouth
  if(breath>0){ c.save(); c.globalCompositeOperation='lighter'; for(let k=0;k<9;k++){ const f=k/8, d=(1-breath)*0+f, x=hx+40+d*70*(1.4-breath*0.4), y=hy+4+d*22+Math.sin(T*9+k)*3, r=(4+d*16)*(0.5+breath); const g=c.createRadialGradient(x,y,0,x,y,r); g.addColorStop(0,'rgba(255,240,170,'+(0.9*breath)+')'); g.addColorStop(0.5,'rgba(255,110,30,'+(0.6*breath)+')'); g.addColorStop(1,'rgba(255,30,10,0)'); c.fillStyle=g; c.beginPath(); c.arc(x,y,r,0,7); c.fill(); } c.restore(); }
  if(!headOnly) wing(false);
  c.restore();
}
function drawMjolnir(c,s){      // Mjolnir pointing +x from the hand: a short handle and a heavy steel head with a lightning mark
  c.save(); c.scale(s,s); c.lineCap='round'; c.lineJoin='round';
  c.strokeStyle='#6b4423'; c.lineWidth=4; c.beginPath(); c.moveTo(-6,0); c.lineTo(26,0); c.stroke();
  c.strokeStyle='#3d2610'; c.lineWidth=1; c.beginPath(); c.moveTo(-5,1.4); c.lineTo(24,1.4); c.stroke();
  c.fillStyle='#aeb7c6'; c.strokeStyle='#4f586a'; c.lineWidth=1.4; c.beginPath(); c.rect(20,-8,18,16); c.fill(); c.stroke();
  c.fillStyle='#d9dfeb'; c.fillRect(21,-7,16,3); c.fillStyle='#7d8799'; c.fillRect(21,4,16,3);
  c.strokeStyle='#ffe66b'; c.lineWidth=1.3; c.beginPath(); c.moveTo(31,-5); c.lineTo(27,0); c.lineTo(31,0); c.lineTo(27,5); c.stroke();
  c.restore();
}
function drawStunStars(ctx, HEADCY){   // three little stars circling over the head (drawn in the player's own coordinates)
  const t=performance.now()/260;
  ctx.save(); ctx.fillStyle='#ffe066'; ctx.strokeStyle='#8a6d00'; ctx.lineWidth=1;
  for(let i=0;i<3;i++){
    const a=t+i*Math.PI*2/3, sx=Math.cos(a)*16, sy=HEADCY-18+Math.sin(a)*5, r=4.5;
    ctx.beginPath();
    for(let k=0;k<10;k++){ const rr=(k%2===0)?r:r*0.45, ang=-Math.PI/2+k*Math.PI/5; const px=sx+Math.cos(ang)*rr, py=sy+Math.sin(ang)*rr; if(k===0) ctx.moveTo(px,py); else ctx.lineTo(px,py); }
    ctx.closePath(); ctx.fill(); ctx.stroke();
  }
  ctx.restore();
}
function hexA(col,a){
  let m=hexACache.get(col); if(m===undefined){ m=new Map(); hexACache.set(col,m); }
  const ka=(typeof a==='number') ? Math.round(a*100) : a, hit=m.get(ka); if(hit!==undefined) return hit;
  const al=(typeof a==='number') ? ka/100 : a; let out;
  if(col && col[0]==='#'){ let hx=col.slice(1); if(hx.length===3) hx=hx.split('').map(x=>x+x).join(''); const n=parseInt(hx,16); out='rgba('+((n>>16)&255)+','+((n>>8)&255)+','+(n&255)+','+al+')'; }
  else out='rgba(255,255,255,'+al+')';
  if(m.size>400) m.clear();
  if(hexACache.size>600) hexACache.clear();
  m.set(ka,out); return out;
}
const hexACache=new Map();       // hexA is called thousands of times a frame with a handful of different colours: the answers are kept, per colour, with the alpha in steps of 0.01 (nobody can see 1%)
const BULLET_R = 5, BULLET_LIFE = 1.2, PORTAL_BOUNCE_DMG = 1.3, PORTAL_MAX_DMG = 30;
function drawPaperShape(c, len, now){      // a folded paper plane seen from the side, pointing right (+x), nose at (len/2,0)
  const h=len*0.2, n=len/2;
  c.fillStyle='#fbf8ee'; c.strokeStyle='#8e97b8'; c.lineWidth=Math.max(1,len*0.02); c.lineJoin='round';
  c.beginPath(); c.moveTo(n,0); c.lineTo(-n,-h*0.9); c.lineTo(-n*0.55,0); c.closePath(); c.fill(); c.stroke();      // the upper wing
  c.fillStyle='#dfe4f4'; c.beginPath(); c.moveTo(n,0); c.lineTo(-n*0.55,0); c.lineTo(-n,h*0.7); c.closePath(); c.fill(); c.stroke();      // the lower wing in shade
  c.strokeStyle='#b9c0dc'; c.beginPath(); c.moveTo(n*0.7,-h*0.05); c.lineTo(-n*0.7,-h*0.45); c.stroke();      // a fold line
}
function conceptOfSkin(sid){ const c=sid&&COSMETICS[sid]; return (c&&c.concept)||''; }