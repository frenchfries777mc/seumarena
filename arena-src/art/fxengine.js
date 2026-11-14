let particles=[], lastFxMs=performance.now(), FX_GY=null, FX_NEW=null, FX_WID=null, FX_COS=null, FX_ANG=0;
function addP(o){
  if(o.gy===undefined && o.grav>0 && FX_GY!==null) o.gy=FX_GY;
  if(particles.length>700) particles.splice(0,150);
  const __q=Object.assign({x:0,y:0,vx:0,vy:0,grav:0,drag:0,size:3,shape:'dot',add:true,rot:0,vr:0,color:'#fff'}, o, {max:o.life});
  if(__q.shape==='ghost' && FX_WID){ __q.wid=FX_WID; __q.cos=FX_COS; __q.ang=FX_ANG; }
  particles.push(__q); if(FX_NEW) FX_NEW.push(__q);
}
function burst(x,y,n,o){
  for(let i=0;i<n;i++){
    const a=RND(o.a0,o.a1), s=RND(o.s0,o.s1);
    addP({x:x,y:y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:RND(o.l0,o.l1),size:RND(o.z0,o.z1),color:o.colors[i%o.colors.length],
          grav:o.grav||0,drag:o.drag||0,shape:o.shape||'dot',add:o.add!==false,rot:RND(0,6.28),vr:RND(-9,9)});
  }
}
function svRand(seed){ let a=(Math.floor(seed*7919)+0x9E3779B9)>>>0; return ()=>{ a=(a+0x6D2B79F5)>>>0; let t=Math.imul(a^(a>>>15),1|a); t=(t+Math.imul(t^(t>>>7),61|t))^t; return ((t^(t>>>14))>>>0)/4294967296; }; }
/* a dash afterimage is a still figure: drawn once (per character, colour, direction and zoom) into a small canvas and stamped from there
   (the whole figure drawn again for every afterimage every frame froze phones for a moment on each dash) */
const ghostSpr=new Map(); let ghostK=0;
function ghostSprite(q){
  try{
    const m=ctx.getTransform(), k=Math.round(Math.hypot(m.a,m.b)*20)/20; if(!(k>0.05 && k<8) || m.b || m.c) return null;
    if(k!==ghostK || ghostSpr.size>16){ ghostSpr.clear(); ghostK=k; }
    const cs=q.cos||null, key=(q.wid||'sword')+'|'+q.color+'|'+(q.ang||0).toFixed(2)+'|'+(cs?(cs.skin||'')+'/'+(cs.col||''):'');
    let s=ghostSpr.get(key);
    if(!s){ const n=Math.ceil(280*k), cv2=document.createElement('canvas'); cv2.width=cv2.height=n; const g=cv2.getContext('2d');
      g.setTransform(k,0,0,k,n/2,n*0.74); g.scale(1.15,1.15); g.lineCap='round'; drawStick(g,q.wid||'sword',q.color,q.ang||0,0,0,0,q.cos); s={cv:cv2,k:n/280}; ghostSpr.set(key,s); }
    return s;
  }catch(e){ return null; }
}
function drawParticles(){
  const now=performance.now(); let dt=Math.min(0.05,(now-lastFxMs)/1000); lastFxMs=now; if(!(dt>0)) dt=0.016; if(typeof FX_TS==='number') dt*=FX_TS;
  for(let i=particles.length-1;i>=0;i--){
    const q=particles[i]; q.life-=dt;
    if(q.life<=0){ particles[i]=particles[particles.length-1]; particles.pop(); continue; }
    if(q.drag){ const k=Math.exp(-q.drag*dt); q.vx*=k; q.vy*=k; }
    q.vy+=q.grav*dt; q.x+=q.vx*dt; q.y+=q.vy*dt; q.rot+=q.vr*dt;
    if(q.grav>0 && q.gy!==undefined && q.y>q.gy){ q.y=q.gy; if(q.vy>60){ q.vy*=-0.28; q.vx*=0.55; q.vr*=0.5; } else { q.vy=0; q.vx*=0.8; q.grav=0; q.landed=1; } }
  }
  ctx.save(); ctx.lineCap='round';
  for(let pass=0;pass<2;pass++){
    ctx.globalCompositeOperation = pass===0 ? 'source-over' : 'lighter';
    for(const q of particles){
      if((pass===1)!==q.add) continue;
      if(!fxInView(q.x,q.y) && !(q.x2!==undefined && fxInView(q.x2,q.y2))) continue;       // off the screen: still ages and moves (above), is not drawn
      const t=1-q.life/q.max, a=1-t;
      switch(q.shape){
        case 'bolt': {                                                    // force lightning: x,y -> x2,y2, a new jagged path ~25 times a second
          const seed=Math.floor(performance.now()/40)+(q.seedOff||0), R=svRand(seed), dx=q.x2-q.x, dy=q.y2-q.y, len=Math.max(1,Math.hypot(dx,dy)), nx=-dy/len, ny=dx/len, n=Math.max(5,Math.ceil(len/28)), pts=[[q.x,q.y]];
          for(let i=1;i<n;i++){ const f=i/n, off=(R()-0.5)*2*(q.amp||22)*Math.sin(f*Math.PI); pts.push([q.x+dx*f+nx*off, q.y+dy*f+ny*off]); }
          pts.push([q.x2,q.y2]);
          const stroke=(w,col,al)=>{ ctx.globalAlpha=al; ctx.strokeStyle=col; ctx.lineWidth=w; ctx.beginPath(); pts.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1])); ctx.stroke(); };
          ctx.lineJoin='round'; stroke(q.size*3.4, hexA(q.color,0.35), a); stroke(q.size*1.6, q.color, a); stroke(q.size*0.6, '#ffffff', a);
          if(R()<0.5){ const k=1+Math.floor(R()*(n-2)), s=R()<0.5?-1:1; ctx.globalAlpha=a*0.8; ctx.strokeStyle=q.color; ctx.lineWidth=q.size*0.7; ctx.beginPath(); ctx.moveTo(pts[k][0],pts[k][1]); ctx.lineTo(pts[k][0]+nx*s*30+dx/len*14, pts[k][1]+ny*s*30+dy/len*14); ctx.stroke(); }
          break; }
        case 'ghost': { const s=ghostSprite(q); ctx.globalAlpha=a*0.55;
          if(s){ const w=s.cv.width/s.k; ctx.drawImage(s.cv,q.x-w/2,q.y+30-w*0.74,w,w); }
          else { ctx.save(); ctx.translate(q.x,q.y+30); ctx.scale(1.15,1.15); drawStick(ctx,q.wid||'sword',q.color,q.ang||0,0,0,0,q.cos); ctx.restore(); }
          break; }
        case 'ktext': { ctx.globalAlpha=Math.min(1,a*2); const sc=1+0.35*(1-Math.min(1,t*5)); ctx.save(); ctx.translate(q.x,q.y); ctx.scale(sc,sc); ctx.rotate(q.rot0||0);
          ctx.font='900 '+Math.round(q.size)+'px "Malgun Gothic","Noto Sans CJK KR","Noto Serif CJK JP","Yu Mincho",serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
          ctx.lineWidth=7; ctx.strokeStyle='rgba(10,10,30,0.85)'; ctx.strokeText(q.text,0,0); ctx.fillStyle=q.color; ctx.fillText(q.text,0,0); ctx.restore(); break; }
        case 'slash': { const dx=q.x2-q.x, dy=q.y2-q.y, len=Math.max(1,Math.hypot(dx,dy)), nx=-dy/len, ny=dx/len, w=q.size*(1-t)*(1-0.0*t), mx=(q.x+q.x2)/2, my=(q.y+q.y2)/2;   // a tapered blade-shaped streak: fat in the middle, sharp at both ends
          ctx.globalAlpha=a; ctx.fillStyle=q.color; ctx.beginPath(); ctx.moveTo(q.x,q.y); ctx.quadraticCurveTo(mx+nx*w,my+ny*w,q.x2,q.y2); ctx.quadraticCurveTo(mx-nx*w,my-ny*w,q.x,q.y); ctx.fill();
          ctx.globalAlpha=a*0.6; ctx.fillStyle='#ffffff'; ctx.beginPath(); ctx.moveTo(q.x,q.y); ctx.quadraticCurveTo(mx+nx*w*0.4,my+ny*w*0.4,q.x2,q.y2); ctx.quadraticCurveTo(mx-nx*w*0.4,my-ny*w*0.4,q.x,q.y); ctx.fill(); break; }
        case 'limb': ctx.save(); ctx.translate(q.x,q.y); ctx.rotate(q.rot); ctx.globalAlpha=Math.min(1,a*2); ctx.strokeStyle=q.color; ctx.fillStyle=q.color; ctx.lineCap='round'; ctx.lineWidth=5;
          if(q.head){ ctx.beginPath(); ctx.arc(0,0,q.size,0,7); ctx.fill(); } else { ctx.beginPath(); ctx.moveTo(0,-q.size/2); ctx.lineTo(0,q.size/2); ctx.stroke(); } ctx.restore(); break;
        case 'applehalf': { ctx.save(); ctx.translate(q.x,q.y); ctx.rotate(q.rot); ctx.globalAlpha=Math.min(1,a*2.2); const r=q.size;
          ctx.fillStyle='#d62828'; ctx.strokeStyle='#8a1a1a'; ctx.lineWidth=1.6; ctx.beginPath(); ctx.arc(0,0,r,0,Math.PI); ctx.closePath(); ctx.fill(); ctx.stroke();
          ctx.fillStyle='#fff1c9'; ctx.beginPath(); ctx.ellipse(0,0,r*0.93,r*0.22,0,0,7); ctx.fill();
          ctx.fillStyle='#5a3a1c'; ctx.beginPath(); ctx.arc(0,r*0.08,1.4,0,7); ctx.fill(); ctx.restore(); break; }
        case 'dot': ctx.globalAlpha=a; ctx.fillStyle=q.color; ctx.beginPath(); ctx.arc(q.x,q.y,q.size*(1-0.5*t),0,7); ctx.fill(); break;
        case 'fire': ctx.globalAlpha=Math.min(1,a*1.3); ctx.fillStyle=q.color; ctx.beginPath(); ctx.arc(q.x,q.y,q.size*(1-0.75*t),0,7); ctx.fill(); break;
        case 'streak': ctx.globalAlpha=a; ctx.strokeStyle=q.color; ctx.lineWidth=q.size*(1-0.4*t); ctx.beginPath(); ctx.moveTo(q.x,q.y); ctx.lineTo(q.x-q.vx*0.045,q.y-q.vy*0.045); ctx.stroke(); break;
        case 'ring': { const r=q.r0+(q.r1-q.r0)*(1-Math.pow(1-t,2)); ctx.globalAlpha=a; ctx.strokeStyle=q.color; ctx.lineWidth=Math.max(0.5,q.lw*(1-t)); ctx.beginPath(); ctx.arc(q.x,q.y,Math.max(0.5,r),0,7); ctx.stroke(); break; }
        case 'curtain': { const h=q.r1*(0.35+0.65*Math.min(1,t*2.5)), w=q.size, g=ctx.createLinearGradient(0,q.y,0,q.y-h); g.addColorStop(0,hexA(q.color,0.55*a)); g.addColorStop(0.5,hexA(q.color,0.3*a)); g.addColorStop(1,hexA(q.color,0)); ctx.globalAlpha=1; ctx.fillStyle=g; ctx.beginPath(); ctx.moveTo(q.x-w,q.y); for(let i=0;i<=10;i++){ const f=i/10; ctx.lineTo(q.x-w+Math.sin(performance.now()/260+i*0.6+q.rot)*(4+f*10), q.y-h*f); } for(let i=10;i>=0;i--){ const f=i/10; ctx.lineTo(q.x+w+Math.sin(performance.now()/260+i*0.6+q.rot+0.8)*(4+f*10), q.y-h*f); } ctx.closePath(); ctx.fill(); break; }
        case 'flash': { const r=q.size*(0.5+0.7*t); const g=ctx.createRadialGradient(q.x,q.y,0,q.x,q.y,r); g.addColorStop(0,hexA(q.color,a)); g.addColorStop(1,hexA(q.color,0)); ctx.globalAlpha=1; ctx.fillStyle=g; ctx.beginPath(); ctx.arc(q.x,q.y,r,0,7); ctx.fill(); break; }
        case 'stinkwave': { ctx.globalAlpha=0.85*a; ctx.strokeStyle=q.color; ctx.lineWidth=q.size; ctx.lineCap='round'; const hh=q.r1||26, ph=q.rot+performance.now()/180; ctx.beginPath(); for(let i=0;i<=8;i++){ const f=i/8, x=q.x+Math.sin(ph+f*7)*(3+4*f), y=q.y-f*hh; i?ctx.lineTo(x,y):ctx.moveTo(x,y); } ctx.stroke(); break; }
        case 'smoke': ctx.globalAlpha=0.5*a; ctx.fillStyle=q.color; ctx.beginPath(); ctx.arc(q.x,q.y,q.size*(1+1.3*t),0,7); ctx.fill(); break;
        case 'square': case 'card': ctx.save(); ctx.translate(q.x,q.y); ctx.rotate(q.rot); ctx.globalAlpha=Math.min(1,a*1.6); ctx.fillStyle=q.color;
          if(q.shape==='card'){ ctx.fillRect(-q.size*0.6,-q.size,q.size*1.2,q.size*2); } else ctx.fillRect(-q.size/2,-q.size/2,q.size,q.size); ctx.restore(); break;
        case 'text': ctx.globalAlpha=Math.min(1,a*2.2); ctx.font='800 '+Math.round(q.size)+'px Rajdhani'; ctx.textAlign='center';
          if(typeof stampText==='function' && stampText(ctx,q.text,ctx.font,q.color,'rgba(0,0,0,0.75)',4,q.x,q.y)) break;
          ctx.lineWidth=4; ctx.strokeStyle='rgba(0,0,0,0.75)'; ctx.strokeText(q.text,q.x,q.y); ctx.fillStyle=q.color; ctx.fillText(q.text,q.x,q.y); break;
        case 'warn': { const blink=0.35+0.5*Math.abs(Math.sin(t*16)); ctx.globalAlpha=blink; ctx.strokeStyle=q.color; ctx.lineWidth=3;
          ctx.beginPath(); ctx.arc(q.x,q.y,34,0,7); ctx.stroke(); ctx.beginPath(); ctx.arc(q.x,q.y,16,0,7); ctx.stroke(); if(q.hw){ ctx.beginPath(); ctx.ellipse(q.x,q.y,q.hw,14,0,0,7); ctx.stroke(); }
          ctx.setLineDash([8,10]); ctx.beginPath(); ctx.moveTo(q.x,q.y-460); ctx.lineTo(q.x,q.y); ctx.stroke(); ctx.setLineDash([]); break; }
        case 'bigcross': { const ease=Math.pow(t,1.6), topY=q.y-620*(1-ease); ctx.save(); ctx.translate(q.x,topY); if(q.sc) ctx.scale(q.sc,q.sc); ctx.globalAlpha=Math.min(1,0.3+t*1.4);
          ctx.fillStyle='#e9d9a3'; ctx.strokeStyle='#8a6a2b'; ctx.lineWidth=3; ctx.fillRect(-9,-150,18,150); ctx.strokeRect(-9,-150,18,150); ctx.fillRect(-42,-112,84,18); ctx.strokeRect(-42,-112,84,18);
          ctx.globalCompositeOperation='lighter'; ctx.fillStyle='rgba(255,224,138,0.28)'; ctx.beginPath(); ctx.arc(0,-100,90,0,7); ctx.fill(); ctx.restore(); break; }
        case 'bighammer': { const ease=Math.pow(t,1.6); const tipY=q.y-620*(1-ease); ctx.save(); ctx.translate(q.x,tipY); ctx.globalAlpha=Math.min(1,0.25+t*1.4);
          const gl=ctx.createRadialGradient(0,-170,10,0,-170,230); gl.addColorStop(0,'rgba(255,230,107,0.55)'); gl.addColorStop(1,'rgba(150,200,255,0)');
          ctx.globalCompositeOperation='lighter'; ctx.fillStyle=gl; ctx.beginPath(); ctx.arc(0,-170,230,0,7); ctx.fill(); ctx.globalCompositeOperation='source-over';
          ctx.rotate(-Math.PI/2); ctx.translate(-8,0); ctx.scale(-1,1); ctx.scale(6.2,6.2); ctx.translate(-30,0); drawMjolnir(ctx,1); ctx.restore();
          ctx.save(); ctx.globalAlpha=Math.min(1,0.2+t*1.2); ctx.strokeStyle='#ffe66b'; ctx.lineWidth=3; ctx.beginPath(); let zx=q.x, zy=tipY-340; ctx.moveTo(zx,zy); for(let i=0;i<7;i++){ zx+=(i%2?-1:1)*(14+((i*37)%11)); zy+=40; ctx.lineTo(zx,zy); } ctx.stroke(); ctx.restore(); break; }
        case 'bigsword': { const ease=Math.pow(t,1.6); const tipY=q.y-620*(1-ease); ctx.save(); ctx.translate(q.x,tipY); ctx.globalAlpha=Math.min(1,0.25+t*1.4);
          const gl=ctx.createRadialGradient(0,-160,10,0,-160,190); gl.addColorStop(0,q.gold?'rgba(255,211,77,0.55)':'rgba(159,194,255,0.45)'); gl.addColorStop(1,q.gold?'rgba(255,211,77,0)':'rgba(159,194,255,0)');
          ctx.globalCompositeOperation='lighter'; ctx.fillStyle=gl; ctx.beginPath(); ctx.arc(0,-160,190,0,7); ctx.fill(); ctx.globalCompositeOperation='source-over';
          ctx.fillStyle=q.gold?'#ffd34d':'#e9f0ff'; ctx.strokeStyle=q.gold?'#b8860b':'#7c9eff'; ctx.lineWidth=3;
          ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(-24,-46); ctx.lineTo(-24,-300); ctx.lineTo(24,-300); ctx.lineTo(24,-46); ctx.closePath(); ctx.fill(); ctx.stroke();
          ctx.fillStyle=q.gold?'#fff3b0':'#ffffff'; ctx.fillRect(-4,-290,8,240);
          ctx.fillStyle=q.gold?'#b8860b':'#c9a227'; ctx.fillRect(-52,-320,104,20); ctx.fillRect(-9,-392,18,74);
          ctx.beginPath(); ctx.arc(0,-398,13,0,7); ctx.fill(); ctx.restore(); break; }
        case 'pillar': { const w=32*(1-t*0.6); const g=ctx.createLinearGradient(q.x,q.y-140,q.x,q.y+30); g.addColorStop(0,hexA(q.color,0)); g.addColorStop(0.7,hexA(q.color,0.7)); g.addColorStop(1,hexA(q.color,0)); ctx.globalAlpha=a; ctx.fillStyle=g; ctx.fillRect(q.x-w/2,q.y-140,w,170); break; }
      }
    }
  }
  ctx.restore();
  
}