const PZ_CROSS_HALF=[54,60,66,72], DARK_ARM_SEC=1, DARK_EMERGE_R=110, DS_ULT_SEC=10, FIRE_R=75, WIZ_CIRCLE_R=198, PORTAL_BLAST_R=114, RAID_SLAM_WARN=1.4, RAID_SLAM_R=120, SKY_SWORD_HALF=80, CLEON_BEAM_N=5, CLEON_BEAM_GAP=46;
function spawnFx0(e){
  const x=e.x, y=e.y, col=e.color||'#ffd34d';
  const FQ=fxQuality>=2?1:(fxQuality===1?0.55:0.2), RN=fxQuality>=2?3:(fxQuality===1?2:1), BL=fxQuality>=2?12:(fxQuality===1?8:4);   // the big ultimate effects scale down with the graphics setting
  const bu=(bx,by,n,o)=>burst(bx,by,Math.max(2,Math.round(n*FQ)),o);
  switch(e.type){
    case 'sfx': playSfx(e.name, x, y); break;
    case 'aurora': {                                                   // 그랜드 마스터 skin: every skill / ultimate leaves a burst of aurora colours
      const nowS=performance.now()/1000, A=[0,1,2,3,4].map(i=>auroraHex(nowS*0.9,i)), big=!!e.big;
      bu(x,y,big?80:44,{a0:0,a1:6.28,s0:120,s1:big?760:520,l0:.5,l1:1.1,z0:2,z1:4.4,colors:A.concat(['#ffffff']),grav:-60,drag:1.5,shape:'streak'});
      for(let r=0;r<(big?3:2);r++) addP({x:x,y:y,life:.55+r*.15,color:A[r*2%5],shape:'ring',r0:8,r1:(big?150:90)+r*30,lw:6-r});
      for(let k=0;k<(big?7:4);k++){ const cx=(k/(big?6:3)-0.5)*(big?190:110); addP({x:x+cx,y:y+34,life:RND(1.0,1.5),size:RND(10,17),r1:RND(big?210:140,big?300:200),color:A[k%5],shape:'curtain',rot:RND(0,6.28)}); }      // the aurora curtain: tall ribbons of light that rise and sway
      addP({x:x,y:y-60,life:.9,color:A[1],shape:'flash',size:big?260:150,add:true});
      break; }
    case 'smellburst': {
      const big=!!e.big;
      burst(x,y,big?30:16,{a0:0,a1:6.28,s0:40,s1:big?260:170,l0:.7,l1:1.4,z0:7,z1:big?18:13,colors:['#7d9a1e','#a8b82a','#5f7d2a','#c9c24a'],grav:-40,drag:1.3,shape:'smoke',add:false});
      for(let r=0;r<2;r++) addP({x:x,y:y,life:.6+r*.2,color:'#a8b82a',shape:'ring',r0:8,r1:(big?130:80)+r*30,lw:5-r});
      break; }
    case 'spark': {
      const back=(e.ang||0)+Math.PI;
      burst(x,y,11,{a0:back-1.0,a1:back+1.0,s0:120,s1:400,l0:.22,l1:.5,z0:1.6,z1:3.2,colors:[col,'#ffe08a','#ffffff'],grav:650,drag:1.5,shape:'streak'});
      burst(x,y,5,{a0:back-1.3,a1:back+1.3,s0:20,s1:70,l0:.5,l1:.9,z0:4,z1:8,colors:['#9aa0ad'],grav:-30,drag:2,shape:'smoke',add:false});
      addP({x:x,y:y,life:.16,color:'#ffffff',shape:'ring',r0:3,r1:20,lw:2});
      break; }
    case 'hit': {
      hitReact(e);
      const f=e.ang||0;
      burst(x,y,13,{a0:f-0.9,a1:f+0.9,s0:140,s1:480,l0:.25,l1:.55,z0:1.8,z1:3.6,colors:[col,'#ffffff',col],grav:500,drag:1.6,shape:'streak'});
      burst(x,y,7,{a0:0,a1:6.28,s0:40,s1:170,l0:.3,l1:.5,z0:2.5,z1:5,colors:[col,'#ffffff'],drag:2.2});
      addP({x:x,y:y,life:.22,color:'#ffffff',shape:'ring',r0:4,r1:32,lw:3});
      addP({x:x,y:y,life:.12,color:'#ffffff',shape:'flash',size:36});
      if(e.v>0) dmgText(x,y,e.v,col,e.el);
      break; }
    case 'dmg': dmgText(x,y,e.v||0,col,e.el); break;
    case 'shchain': { const NC=e.col||'#7dffd8', NC2=e.col?'#ffffff':'#c9fff0';                                                      // 셰이드: the chain between the hand and the sword (a hit: it sticks; a miss: it is hauled back)
      const x2=e.x2, y2=e.y2, n=Math.max(3,Math.floor(Math.hypot(x2-x,y2-y)/16));
      addP({x:x,y:y,x2:x2,y2:y2,life:.28,color:NC,shape:'slash',size:5});
      for(let i=0;i<=n;i++){ const f=i/n; addP({x:x+(x2-x)*f,y:y+(y2-y)*f,vx:0,vy:0,life:.3,size:3.2,color:NC2}); }
      if(e.hit){ const dir=(x2>=x)?1:-1; addP({x:x2-dir*34,y:y2,x2:x2+dir*6,y2:y2,life:.45,color:NC,shape:'slash',size:12}); addP({x:x2-dir*30,y:y2,x2:x2+dir*4,y2:y2,life:.35,color:'#ffffff',shape:'slash',size:4}); addP({x:x2,y:y2,life:.25,color:NC,shape:'ring',r0:6,r1:44,lw:3}); }
      break; }
    case 'shblink': { const NC=e.col||'#7dffd8', NC2=e.col?'#ffffff':'#c9fff0';                                                      // 셰이드's ultimate: one long mint streak with a few afterimages
      const x2=e.x2, y2=e.y2, dir=(x2>=x)?1:-1, n=5;
      addP({x:x-dir*20,y:y,x2:x2+dir*30,y2:y2,life:.5,color:NC,shape:'slash',size:34});
      addP({x:x-dir*10,y:y,x2:x2+dir*20,y2:y2,life:.4,color:'#ffffff',shape:'slash',size:12});
      for(let i=0;i<=n;i++){ const f=i/n; addP({x:x+(x2-x)*f,y:y+(y2-y)*f,life:.3+0.25*f,color:[NC,'#38c8ff'][i%2],shape:'ghost',dir:dir}); }
      addP({x:x2,y:y2,life:.3,color:NC,shape:'ring',r0:6,r1:80,lw:4});
      shakeFrom(x2,y2,5*FQ,700); break; }
    case 'shsmash': { const NC=e.col||'#7dffd8', NC2=e.col?'#ffffff':'#c9fff0';                                                      // 셰이드's passive: the blade comes down, the ground cracks
      addP({x:x,y:y,life:.3,color:NC,shape:'ring',r0:8,r1:78,lw:5});
      for(let k=0;k<8;k++){ const a=Math.PI+k*Math.PI/7; addP({x:x,y:y,x2:x+Math.cos(a)*RND(40,80),y2:y-Math.sin(a)*RND(6,22),life:.5,color:NC,shape:'slash',size:4}); }
      shakeFrom(x,y,7*FQ,500); break; }
    case 'iai': {                                                          // samurai skill: a single clean cut along the dash, a few afterimages, some petals (kept modest on purpose)
      const x2=e.x2, y2=e.y2, dir=(x2>=x)?1:-1, n=3;
      addP({x:x-dir*30,y:y,x2:x2+dir*50,y2:y2,life:.45,color:'#ff3d6e',shape:'slash',size:30});
      addP({x:x-dir*20,y:y,x2:x2+dir*40,y2:y2,life:.38,color:'#ffd23f',shape:'slash',size:20});
      addP({x:x-dir*10,y:y,x2:x2+dir*30,y2:y2,life:.3,color:'#ffffff',shape:'slash',size:9});
      for(let i=0;i<=n;i++){ const f=i/n; addP({x:x+(x2-x)*f,y:y+(y2-y)*f,life:.3+0.2*f,color:['#35e0ff','#b45cff'][i%2],shape:'ghost',dir:dir}); }
      bu((x+x2)/2,(y+y2)/2,14,{a0:0,a1:6.28,s0:60,s1:240,l0:.6,l1:1.1,z0:2.5,z1:4.5,colors:['#ff6fb5','#ffd23f','#35e0ff'],grav:100,drag:1.2});
      addP({x:x2,y:y2,life:.3,color:'#ffd23f',shape:'ring',r0:6,r1:60,lw:4});
      shakeFrom(x2,y2,4*FQ,800); break; }
    case 'samcut': {                                                       // one cut of the ultimate: a screen-long diagonal slash, a crossing pair, a kanji, a white flash
      const a0=(e.ang||0)+RND(-0.3,0.3), L=520;
      addP({x:x-Math.cos(a0)*L,y:y-Math.sin(a0)*L,x2:x+Math.cos(a0)*L,y2:y+Math.sin(a0)*L,life:.55,color:'#ff3d6e',shape:'slash',size:66});
      addP({x:x-Math.cos(a0)*L*0.8,y:y-Math.sin(a0)*L*0.8,x2:x+Math.cos(a0)*L*0.8,y2:y+Math.sin(a0)*L*0.8,life:.7,color:'#ffd23f',shape:'slash',size:40});
      addP({x:x-Math.cos(a0)*L*0.9,y:y-Math.sin(a0)*L*0.9,x2:x+Math.cos(a0)*L*0.9,y2:y+Math.sin(a0)*L*0.9,life:.5,color:'#ffffff',shape:'slash',size:20});
      for(let k=0;k<(FQ>0.3?2:1);k++){ const a=a0+(k?1.25:-0.3), l=RND(130,170), c=Math.cos(a)*l, d=Math.sin(a)*l;
        addP({x:x-c,y:y-d,x2:x+c,y2:y+d,life:.5+k*0.1,color:k?'#b45cff':'#35e0ff',shape:'slash',size:38}); }
      addP({x:x,y:y,life:.2,color:'#ffd9a0',shape:'flash',size:260});
      for(let r=0;r<3;r++) addP({x:x,y:y,life:.3+r*0.1,color:['#ffd23f','#ff3d6e','#35e0ff'][r],shape:'ring',r0:6,r1:70+r*45,lw:6-r});
      bu(x,y,34,{a0:0,a1:6.28,s0:150,s1:700,l0:.3,l1:.8,z0:2.5,z1:5,colors:['#ffd23f','#ff3d6e','#35e0ff','#b45cff','#ffffff'],grav:240,drag:1.5,shape:'streak'});
      bu(x,y,26,{a0:0,a1:6.28,s0:50,s1:260,l0:.9,l1:1.6,z0:3,z1:6.5,colors:['#ff6fb5','#ffd23f','#5dff9a','#b45cff'],grav:90,drag:1});
      addP({x:x+RND(-30,30),y:y-60,vy:-30,drag:1.4,life:.9,color:'#ff3d6e',shape:'ktext',text:'斬',size:86,rot0:RND(-0.25,0.25)});
      if(FQ>0.3) samFlash(0.45*FQ,'255,210,160'); shakeFrom(x,y,18*FQ,1100); break; }
    case 'samult': {                                                       // the start of the ultimate: the screen dims under a pale moon, a ring of eight blades
      if(FQ>0.3){ samScreen.dimFrom=performance.now(); samScreen.dimUntil=samScreen.dimFrom+2200; }
      for(let r=0;r<RN;r++) addP({x:x,y:y,life:.55+r*0.2,color:['#b45cff','#35e0ff','#ffd23f'][r],shape:'ring',r0:10,r1:300+r*90,lw:9-r*2});
      addP({x:x,y:y,life:.45,color:'#d9b8ff',shape:'flash',size:360});
      for(let i=0;i<(FQ>0.3?8:4);i++){ const a=i*Math.PI/(FQ>0.3?4:2)+0.2; addP({x:x+Math.cos(a)*40,y:y+Math.sin(a)*40,x2:x+Math.cos(a)*380,y2:y+Math.sin(a)*380,life:.55,color:[['#ffd23f','#ff3d6e','#35e0ff','#b45cff','#ff8a2b','#5dff9a']][i%6],shape:'slash',size:34}); }
      bu(x,y,60,{a0:0,a1:6.28,s0:80,s1:500,l0:1,l1:2,z0:3,z1:6,colors:['#ffd23f','#ff3d6e','#35e0ff','#b45cff','#ff8a2b','#5dff9a'],grav:70,drag:1});
      addP({x:x,y:y-110,vy:-14,drag:1,life:1.2,color:'#35e0ff',shape:'ktext',text:'心眼',size:84});
      if(FQ>0.3) samFlash(0.45*FQ,'200,170,255'); shakeFrom(x,y,12*FQ,1000); break; }
    case 'samfin': {                                                       // the blade goes back into its sheath: one last big flash and a storm of petals
      for(let r=0;r<(FQ>0.3?4:2);r++) addP({x:x,y:y-30,life:.4+r*0.12,color:['#ffd23f','#ff3d6e','#35e0ff','#b45cff'][r],shape:'ring',r0:8,r1:120+r*60,lw:8-r});
      addP({x:x,y:y-30,life:.4,color:'#ffe28a',shape:'flash',size:340});
      bu(x,y-30,90,{a0:0,a1:6.28,s0:100,s1:640,l0:.9,l1:2,z0:3,z1:7,colors:['#ffd23f','#ff3d6e','#35e0ff','#b45cff','#ff8a2b','#5dff9a'],grav:120,drag:1.2});
      addP({x:x,y:y-100,vy:-22,drag:1.4,life:1.1,color:'#ffd23f',shape:'ktext',text:'納刀',size:70});
      if(FQ>0.3) samFlash(0.55*FQ,'255,230,170'); shakeFrom(x,y,16*FQ,1100); break; }
    case 'dronefire': droneKick[e.k+'_'+e.v]={t:performance.now(), a:e.ang||0}; addP({x:x,y:y,life:.12,color:'#bfefff',shape:'flash',size:26}); break;
    case 'cfleet': fleetShows.push({x:e.x, y:e.y, gap:e.r||CLEON_BEAM_GAP, t0:performance.now()}); addP({x:x,y:y+400,life:.6,color:'#7a3cff',shape:'flash',size:520}); break;
    case 'cwarn': { const R=e.r||64, L=e.v||1.5; addP({x:x,y:y,life:L,color:'#ff5fb8',shape:'ring',r0:R*1.7,r1:R*0.6,lw:4}); addP({x:x,y:y,life:L,color:'#ffd34d',shape:'ring',r0:R,r1:R,lw:2}); break; }
    case 'cbeam': { const y2=e.y2||y+900, gy=e.v||y2-40;
      addP({x:x,y:y,x2:x,y2:y2,life:.5,color:'#ff5fb8',shape:'slash',size:58}); addP({x:x,y:y,x2:x,y2:y2,life:.42,color:'#ffe9a8',shape:'slash',size:28}); addP({x:x,y:y,x2:x,y2:y2,life:.3,color:'#ffffff',shape:'slash',size:11});
      addP({x:x,y:gy,life:.4,color:'#ffffff',shape:'flash',size:200}); addP({x:x,y:gy,life:.5,color:'#ff7ac8',shape:'ring',r0:10,r1:150,lw:7});
      bu(x,gy,24,{a0:-3.1,a1:-0.05,s0:120,s1:560,l0:.4,l1:.9,z0:2,z1:5,colors:['#ff7ac8','#ffd34d','#ffffff'],grav:300,drag:1.3,shape:'streak'}); shakeFrom(x,gy,5*FQ,900); break; }
    case 'ultfx': {                                                        // every character's ultimate: a themed burst on top of the ability itself
      const T=ULT_THEMES[e.w]||ULT_THEMES._, c=T.c;
      for(let r=0;r<(fxQuality>=2?2:1);r++) addP({x:x,y:y,life:.45+r*0.15,color:c[r%3],shape:'ring',r0:10,r1:170+r*70,lw:7-r*2});
      if(FQ>0.3) addP({x:x,y:y,life:.4,color:c[0],shape:'flash',size:250});
      addP({x:x,y:y,life:.3,color:'#ffffff',shape:'flash',size:150});
      const BL2=fxQuality>=2?8:(fxQuality===1?6:4);
      for(let i=0;i<BL2;i++){ const a=i*Math.PI/BL2*2+0.1; addP({x:x+Math.cos(a)*30,y:y+Math.sin(a)*30,x2:x+Math.cos(a)*(150+(i%2)*50),y2:y+Math.sin(a)*(150+(i%2)*50),life:.45,color:c[i%3],shape:'slash',size:16}); }
      bu(x,y,26,{a0:0,a1:6.28,s0:150,s1:650,l0:.4,l1:.9,z0:2.5,z1:5,colors:c.concat(['#ffffff']),grav:T.k==='fire'?-60:200,drag:1.4,shape:'streak'});
      bu(x,y,22,{a0:0,a1:6.28,s0:40,s1:260,l0:.9,l1:1.8,z0:3,z1:7,colors:c,grav:T.k==='fire'?-90:60,drag:1});
      { const EM=ULT_EMOJI[e.w]; if(EM&&FQ>0.3) for(let i=0;i<Math.round(9*FQ);i++){ const a=RND(0,6.28), sp=RND(120,330); addP({x:x,y:y-20,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp*.7-80,grav:260,drag:.8,life:RND(.9,1.5),size:RND(16,26),shape:'text',text:EM[i%EM.length],add:false,outline:'rgba(0,0,0,.35)'}); } }
      if(T.k==='bolt'){ for(let i=0;i<Math.round(6*FQ);i++){ const a=RND(0,6.28), L=RND(150,320); addP({x:x,y:y,x2:x+Math.cos(a)*L,y2:y+Math.sin(a)*L,life:.35,color:c[i%3],shape:'bolt',size:4,amp:26,seedOff:i*7}); } }
      if(T.k==='card'){ for(let i=0;i<Math.round(18*FQ);i++) addP({x:x+RND(-120,120),y:y-RND(40,160),vx:RND(-90,90),vy:RND(-60,160),grav:260,life:RND(.9,1.5),size:RND(7,11),color:c[i%3],shape:'card',rot:RND(0,6.28),vr:RND(-8,8),add:false}); }
      if(T.k==='fire'){ bu(x,y+10,26,{a0:-2.6,a1:-0.5,s0:120,s1:520,l0:.6,l1:1.3,z0:4,z1:9,colors:c,grav:-140,drag:1.2,shape:'fire'}); }
      if(T.k==='wave'){ for(let r=0;r<(FQ>0.3?2:1);r++) addP({x:x,y:y+20,life:.55+r*.15,color:c[r],shape:'ring',r0:20,r1:340+r*100,lw:5}); }
      if(FQ>0.3) samFlash(0.16*FQ,T.f); shakeFrom(x,y,6*FQ,1000); break; }
    case 'ult': {
      addP({x:x,y:y,life:.55,color:'#ffd34d',shape:'ring',r0:10,r1:150,lw:8});
      addP({x:x,y:y,life:.4,color:'#ffffff',shape:'ring',r0:6,r1:95,lw:4});
      addP({x:x,y:y,life:.2,color:'#ffe08a',shape:'flash',size:100});
      burst(x,y,24,{a0:0,a1:6.28,s0:80,s1:380,l0:.5,l1:.95,z0:2,z1:4.5,colors:['#ffd34d','#ffffff','#ff9d2e'],drag:1.8});
      if(e.name) addP({x:x,y:y-34,vx:0,vy:-45,drag:0.9,life:1.5,size:20,color:'#ffe08a',outline:'#7a5a00',shape:'text',add:false,text:e.name});
      shakeFrom(x,y,5,500);
      break; }
    case 'passive': {       // a passive fired: its name floats up over the head with a small ring in its colour
      const pc=e.color||'#ffd34d';
      addP({x:x,y:y+50,life:.4,color:pc,shape:'ring',r0:8,r1:46,lw:4});
      addP({x:x,y:y+50,life:.18,color:'#ffffff',shape:'flash',size:56});
      if(e.name) addP({x:x,y:y,vx:0,vy:-34,drag:0.9,life:1.3,size:17,color:pc,outline:'#1b1b26',shape:'text',add:false,text:e.name});
      break; }
    case 'tsummon': {       // 해적 포탑: the cannon is rolled out of the planks with a cloud of dust and a flash
      addP({x:x,y:y,life:.5,color:'#ffd9a0',shape:'ring',r0:10,r1:130,lw:6});
      addP({x:x,y:y-30,life:.25,color:'#ffe9bf',shape:'flash',size:120});
      burst(x,y-6,22,{a0:Math.PI,a1:2*Math.PI,s0:60,s1:240,l0:.5,l1:1.0,z0:3,z1:6,colors:['#c9a45a','#e8d3a0','#9b7a3c'],drag:1.8,grav:120});
      burst(x,y-20,14,{a0:0,a1:6.28,s0:100,s1:320,l0:.3,l1:.7,z0:2,z1:4,colors:['#ffb347','#ffffff','#ff7a2a'],drag:2.2});
      addP({x:x,y:y-60,vx:0,vy:-34,drag:0.9,life:1.3,size:17,color:'#ffd9a0',outline:'#3a2410',shape:'text',add:false,text:'대포 포탑!'});
      shakeFrom(x,y,4,350);
      break; }
    case 'tfire': {         // 해적 포탑: muzzle flash, a puff of black smoke and sparks flying out of the barrel
      const a=e.ang||0;
      addP({x:x,y:y,life:.14,color:'#fff3c4',shape:'flash',size:110});
      addP({x:x,y:y,life:.3,color:'#ffb347',shape:'ring',r0:6,r1:56,lw:5});
      burst(x,y,10,{a0:a-0.35,a1:a+0.35,s0:200,s1:560,l0:.2,l1:.5,z0:2,z1:4,colors:['#ffd34d','#ff8a2a','#ffffff'],drag:2.4});
      burst(x,y,8,{a0:a-0.5,a1:a+0.5,s0:40,s1:160,l0:.6,l1:1.1,z0:5,z1:11,colors:['#4a4a52','#6b6b75','#2d2d33'],drag:2.6,shape:'smoke'});
      shakeFrom(x,y,2,160);
      break; }
    case 'warn': addP({x:x,y:y,life:e.dur||1,color:'#ff4d4d',shape:'warn'}); break;
    case 'batform':
      addP({x:x,y:y,life:.4,color:'#8b0000',shape:'ring',r0:6,r1:90,lw:6});
      addP({x:x,y:y,life:.18,color:'#15161c',shape:'flash',size:80});
      burst(x,y,20,{a0:0,a1:6.28,s0:80,s1:340,l0:.4,l1:.8,z0:3,z1:6,colors:['#15161c','#2a2b31','#8b0000'],grav:-40,drag:1.2,shape:'smoke',add:false});
      break;
    case 'bombpass':
      addP({x:x,y:y,life:.25,color:'#ffd34d',shape:'ring',r0:4,r1:28,lw:3});
      burst(x,y,8,{a0:0,a1:6.28,s0:60,s1:140,l0:.2,l1:.35,z0:2,z1:3,colors:['#ffd34d','#fff'],grav:0,drag:2});
      break;
    case 'sv_lightning': {                                          // a bolt hits the ground
      const k=e.sub?0.6:1;
      playSfx('beam', x, y); svFlash(0.5*k, '235,240,255');
      addP({x:x,y:y-6,life:.3,color:'#ffffff',shape:'flash',size:230*k});
      addP({x:x,y:y-4,life:.55,color:'#fff27a',shape:'ring',r0:8,r1:(e.r||80)*1.5,lw:9});
      addP({x:x,y:y-4,life:.8,color:'#8fa8ff',shape:'ring',r0:6,r1:(e.r||80)*2.1,lw:4});
      burst(x,y-8,34,{a0:-3.1,a1:-0.05,s0:180,s1:760,l0:.35,l1:.85,z0:2,z1:4.4,colors:['#ffffff','#fff27a','#9db4ff'],grav:520,drag:1.1,shape:'streak'});
      burst(x,y-6,10,{a0:-2.8,a1:-0.3,s0:60,s1:220,l0:.8,l1:1.4,z0:10,z1:22,colors:['#4a4f66','#2c2f40'],grav:-40,drag:1.4,shape:'smoke',add:false});
      burst(x,y-2,14,{a0:-3.0,a1:-0.1,s0:100,s1:420,l0:.5,l1:1.0,z0:3,z1:6,colors:['#3a3a44','#6b6b74'],grav:900,drag:.5,shape:'square',add:false});
      shakeFrom(x,y,12*k,1500); break; }
    case 'sv_meteor': {                                             // the meteorite lands
      const k=e.sub?0.6:1;
      playSfx('explosion', x, y); svFlash(0.62*k, '255,200,120');
      addP({x:x,y:y-10,life:.35,color:'#fff2c8',shape:'flash',size:420*k});
      addP({x:x,y:y-4,life:.7,color:'#ffb347',shape:'ring',r0:12,r1:(e.r||105)*2.6,lw:16});
      addP({x:x,y:y-4,life:1.0,color:'#ff6b2c',shape:'ring',r0:8,r1:(e.r||105)*3.3,lw:7});
      addP({x:x,y:y-4,life:1.3,color:'#ffffff',shape:'ring',r0:4,r1:(e.r||105)*4.2,lw:3});
      burst(x,y-10,46,{a0:-3.14,a1:0,s0:80,s1:520,l0:.5,l1:1.1,z0:12,z1:30,colors:['#ff5a1f','#ff9b2e','#ffd34d','#ff3d00'],drag:2.6,shape:'fire'});
      burst(x,y-10,80,{a0:-3.14,a1:0,s0:260,s1:1000,l0:.6,l1:1.4,z0:2,z1:5,colors:['#ffe08a','#ffb347','#ffffff'],grav:620,drag:.8,shape:'streak'});
      burst(x,y-6,34,{a0:-3.0,a1:-0.1,s0:200,s1:820,l0:.9,l1:1.8,z0:4,z1:10,colors:['#3b3025','#5a4a3a','#7a6a58'],grav:1100,drag:.35,shape:'square',add:false});
      burst(x,y-14,18,{a0:-2.5,a1:-0.6,s0:30,s1:190,l0:1.4,l1:2.4,z0:26,z1:56,colors:['#4a4440','#38332f'],grav:-60,drag:1.2,shape:'smoke',add:false});
      shakeFrom(x,y,30*k,2200); break; }
    case 'sv_bomb': {
      const k=e.sub?0.6:1;
      playSfx('explosion', x, y); svFlash(0.4*k, '255,150,110');
      addP({x:x,y:y-8,life:.3,color:'#fff4d6',shape:'flash',size:300*k});
      addP({x:x,y:y-4,life:.6,color:'#ff6a2b',shape:'ring',r0:10,r1:(e.r||100)*2.2,lw:13});
      addP({x:x,y:y-4,life:.9,color:'#ffd34d',shape:'ring',r0:6,r1:(e.r||100)*1.5,lw:5});
      burst(x,y-8,30,{a0:-3.14,a1:0,s0:80,s1:420,l0:.4,l1:.9,z0:10,z1:24,colors:['#ff4d1f','#ffb347','#ffe08a'],drag:2.8,shape:'fire'});
      burst(x,y-8,46,{a0:-3.14,a1:0,s0:240,s1:860,l0:.5,l1:1.1,z0:2,z1:4.4,colors:['#ffe08a','#ffffff'],grav:560,drag:.9,shape:'streak'});
      burst(x,y-6,20,{a0:-3.0,a1:-0.1,s0:160,s1:620,l0:.8,l1:1.5,z0:3,z1:8,colors:['#2b2b30','#4a4a52'],grav:1000,drag:.4,shape:'square',add:false});
      burst(x,y-12,12,{a0:-2.6,a1:-0.5,s0:30,s1:150,l0:1.2,l1:2,z0:22,z1:44,colors:['#15151a','#2a2a30'],grav:-70,drag:1.3,shape:'smoke',add:false});
      shakeFrom(x,y,22*k,1900); break; }
    case 'sv_volcano': {
      const k=e.sub?0.6:1;
      playSfx('explosion', x, y); svFlash(0.3*k, '255,120,40');
      addP({x:x,y:y-4,life:.55,color:'#ff7a2b',shape:'ring',r0:8,r1:(e.r||88)*2.1,lw:10});
      addP({x:x,y:y-6,life:.3,color:'#ffe9a8',shape:'flash',size:260*k});
      burst(x,y-10,46,{a0:-2.3,a1:-0.84,s0:360,s1:1150,l0:.9,l1:1.9,z0:5,z1:12,colors:['#ffd34d','#ff8a2b','#ff4d1f'],grav:720,drag:.3,shape:'fire'});       // lava thrown up and out
      burst(x,y-10,30,{a0:-2.7,a1:-0.45,s0:260,s1:760,l0:1.1,l1:2.0,z0:2.5,z1:4.5,colors:['#ffe08a','#ffffff'],grav:620,drag:.25,shape:'streak'});
      burst(x,y-6,22,{a0:-3.0,a1:-0.1,s0:100,s1:420,l0:1,l1:1.8,z0:14,z1:36,colors:['#3a2a24','#241a16'],grav:-90,drag:1,shape:'smoke',add:false});
      shakeFrom(x,y,20*k,2000); break; }
    case 'sv_zombie':                                               // a zombie claws its way out of the ground
      playSfx('explosion', x, y);
      addP({x:x,y:y-2,life:.7,color:'#6bff7a',shape:'ring',r0:6,r1:70,lw:6});
      burst(x,y-4,24,{a0:-3.0,a1:-0.15,s0:60,s1:300,l0:.6,l1:1.2,z0:3,z1:7,colors:['#6bff7a','#2fae45','#1f6b2e'],grav:620,drag:.7,shape:'dot'});
      burst(x,y-6,10,{a0:-2.8,a1:-0.3,s0:30,s1:130,l0:1,l1:1.7,z0:14,z1:30,colors:['rgba(90,220,100,0.45)'],grav:-40,drag:1.3,shape:'smoke',add:false});
      shakeFrom(x,y,6,900); break;
    case 'sandstorm': {                                              // a wall of sand blown forward: fast grains, big soft dust clouds and swirling streaks, and a shake
      const dir=(e.dir>=0)?1:-1, len=e.len||460, hh=e.h||240;
      if(e.sea){      // 포세이돈: a great tidal wave rolls over the whole field - curling crests one behind the other, foam, spray and a splash
        const cols=['#bff4ff','#ffffff','#7fe3ff','#2fb5e8'];
        addP({x:x,y:y,life:.4,color:'#e6fbff',shape:'flash',size:200});
        for(let i=0;i<6;i++) addP({x:x+dir*i*50,y:y+40,life:.7+i*0.03,color:'#bff4ff',shape:'ring',r0:6,r1:90+i*8,lw:5});
        for(let i=0;i<80;i++) addP({x:x+dir*RND(14,len*0.7),y:y+RND(-hh/2,hh/2.2),vx:dir*RND(700,1900),vy:RND(-260,60),life:RND(.5,1.2),size:RND(1.6,3.8),color:cols[i%4],drag:0.7,grav:420,shape:'dot',add:i%3===0});
        for(let i=0;i<14;i++) addP({x:x+dir*RND(10,len*0.85),y:y+RND(-hh/2,hh/3),vx:dir*RND(450,1100),vy:RND(-80,40),life:RND(.6,1.2),size:RND(20,38),color:i%2?'#e8fbff':'#8fdcf4',shape:'smoke',add:false,drag:1.1});
        for(let i=0;i<24;i++) addP({x:x+dir*RND(10,len*0.7),y:y+RND(-hh/2,hh/3),vx:dir*RND(1100,2100),vy:RND(-50,50),life:RND(.3,.7),size:RND(1.6,2.8),color:'#ffffff',drag:0.5,shape:'streak'});
        for(const w of [[2,0.5,'#126bb0'],[1,0.7,'#1e86d0'],[0,0.95,'#2fa8e8']]) TIDES.push({x:x,y:y+40,dir:dir,len:len,h:hh*w[1],color:w[2],k:w[0],born:performance.now(),dur:1500});
        shakeFrom(x,y,9,1200); break;
      }
      const sand=['#e8c27a','#d9a85b','#f3dba0','#b98a4a','#fff0c8'];
      for(let i=0;i<160;i++) addP({x:x+dir*RND(14,len*0.7),y:y+RND(-hh/2,hh/2),vx:dir*RND(700,1700),vy:RND(-90,90),life:RND(.5,1.1),size:RND(1.6,3.6),color:sand[i%5],drag:0.8,shape:'dot',add:false});
      for(let i=0;i<26;i++) addP({x:x+dir*RND(10,len*0.85),y:y+RND(-hh/2,hh/2),vx:dir*RND(450,1000),vy:RND(-60,60),life:RND(.6,1.1),size:RND(18,34),color:'#d9b46a',shape:'smoke',add:false,drag:1.2});
      for(let i=0;i<40;i++) addP({x:x+dir*RND(10,len*0.7),y:y+RND(-hh/2,hh/2),vx:dir*RND(1000,2000),vy:RND(-50,50),life:RND(.3,.7),size:RND(1.6,2.8),color:'#fff0c8',drag:0.5,shape:'streak'});
      shakeFrom(x,y,7,1100); break; }
    case 'forcelightning': {                                         // from the hand to the head of the target, then crackling at both ends
      const tx=e.tx, ty=e.ty, dur=e.dur||0.55, c2=e.color||'#9fb4ff';
      playSfx('beam', x, y);
      for(let k=0;k<3;k++) addP({x:x,y:y,x2:tx,y2:ty,life:dur*(1-0.12*k),color:k===0?c2:'#c9d4ff',shape:'bolt',size:k===0?3.4:2.2,amp:k===0?20:30,seedOff:k*977,vx:0,vy:0,grav:0,drag:0,add:true});
      addP({x:x,y:y,life:.3,color:'#e9edff',shape:'flash',size:60});
      addP({x:tx,y:ty,life:.4,color:'#bcd0ff',shape:'flash',size:120});
      addP({x:tx,y:ty,life:.45,color:c2,shape:'ring',r0:6,r1:70,lw:5});
      burst(tx,ty,18,{a0:0,a1:6.28,s0:80,s1:420,l0:.25,l1:.6,z0:2,z1:3.6,colors:['#ffffff','#9fb4ff','#c9d4ff'],drag:2,shape:'streak'});
      burst(x,y,8,{a0:0,a1:6.28,s0:40,s1:200,l0:.2,l1:.45,z0:2,z1:3.4,colors:['#ffffff','#9fb4ff'],drag:2.4,shape:'dot'});
      shakeFrom(tx,ty,7,1200); break; }
    case 'bombexplode':
      playSfx('explosion', x, y);
      addP({x:x,y:y,life:.45,color:'#ff6a2b',shape:'ring',r0:8,r1:80,lw:8});
      addP({x:x,y:y,life:.3,color:'#fff4d6',shape:'flash',size:70});
      burst(x,y,36,{a0:0,a1:6.28,s0:140,s1:420,l0:.4,l1:.8,z0:3,z1:7,colors:['#ff4d1f','#ffb347','#ffe08a','#555'],grav:80,drag:1.3});
      break;
    case 'dustblast':
      { const ang=e.ang||0, ca=Math.cos(ang), sa=Math.sin(ang);
        burst(x,y,22,{a0:ang-0.5,a1:ang+0.5,s0:220,s1:520,l0:.35,l1:.7,z0:3,z1:6,colors:['#cbb98a','#e8dcb5','#a89468'],grav:60,drag:1.2});
        addP({x:x,y:y,life:.3,color:'#cbb98a',shape:'ring',r0:4,r1:40,lw:4});
      }
      break;
    case 'portalopen':
      addP({x:x,y:y,life:.4,color:'#a855f7',shape:'ring',r0:6,r1:50,lw:5});
      burst(x,y,16,{a0:0,a1:6.28,s0:40,s1:180,l0:.3,l1:.6,z0:2,z1:5,colors:['#a855f7','#e9d5ff'],grav:-10,drag:1.6});
      break;
    case 'smokeland':
      burst(x,y,40,{a0:0,a1:6.28,s0:60,s1:260,l0:.6,l1:1.2,z0:20,z1:44,colors:['#c4cad4','#9aa2ae','#7d8591'],grav:-30,drag:1.6,shape:'smoke',add:false});
      break;
    case 'firedash': {
      const x2=e.x2, y2=e.y2, dir=(x2>=x)?1:-1;
      addP({x:x-dir*20,y:y,x2:x2+dir*40,y2:y2,life:.4,color:'#ff6a1a',shape:'slash',size:34});
      addP({x:x-dir*10,y:y,x2:x2+dir*30,y2:y2,life:.3,color:'#ffd23f',shape:'slash',size:16});
      for(let i=0;i<=6;i++){ const f=i/6; burst(x+(x2-x)*f,y+(y2-y)*f,6,{a0:-3.3,a1:0.2,s0:60,s1:300,l0:.4,l1:.9,z0:6,z1:16,colors:['#ff5a1f','#ff9b2e','#ffd34d'],grav:260,drag:1.3,shape:'fire'}); }
      break; }
    case 'fireland':
      addP({x:x,y:y+20,life:.5,color:'#ff9b2e',shape:'ring',r0:10,r1:FIRE_R,lw:8});
      burst(x,y,30,{a0:-3.3,a1:0.2,s0:80,s1:420,l0:.4,l1:.9,z0:6,z1:16,colors:['#ff5a1f','#ff9b2e','#ffd34d'],grav:260,drag:1.3,shape:'fire'});
      break;
    case 'gust': {
      const r=e.r||GUST_R;
      addP({x:x,y:y,life:.5,color:'#9be8ff',shape:'ring',r0:20,r1:r,lw:7});
      addP({x:x,y:y,life:.7,color:'#d6f6ff',shape:'ring',r0:10,r1:r*0.7,lw:4});
      for(let i=0;i<14;i++){ const a=i*0.9, rr=r*(0.35+(i%5)*0.12); burst(x+Math.cos(a)*rr,y+Math.sin(a)*rr*0.5,2,{a0:a+1.4,a1:a+1.9,s0:260,s1:520,l0:.25,l1:.5,z0:2,z1:4,colors:['#d6f6ff','#9be8ff'],drag:2,shape:'streak'}); }
      break; }
    case 'portalsmoke':
      burst(x,y,26,{a0:-3.0,a1:-0.1,s0:40,s1:160,l0:.5,l1:.9,z0:14,z1:30,colors:['#6d3fbf','#a78bfa','#3b2470'],grav:-60,drag:1.4,shape:'smoke',add:false});
      break;
    case 'portalblast':
      playSfx('explosion', x, y);
      addP({x:x,y:y,life:.24,color:'#f3e8ff',shape:'flash',size:150});
      addP({x:x,y:y,life:.55,color:'#c084fc',shape:'ring',r0:10,r1:PORTAL_BLAST_R+20,lw:10});
      burst(x,y,30,{a0:0,a1:6.28,s0:80,s1:520,l0:.4,l1:.9,z0:3,z1:7,colors:['#a855f7','#e9d5ff','#6d28d9'],grav:200,drag:1.6});
      break;
    case 'portalwarp':
      playSfx('portalwarp', x, y); // only ever pushed at the moment someone actually steps through a portal (exit point)
      addP({x:x,y:y,life:.3,color:'#e9d5ff',shape:'flash',size:46});
      burst(x,y,14,{a0:0,a1:6.28,s0:60,s1:220,l0:.25,l1:.5,z0:2,z1:4,colors:['#a855f7','#e9d5ff'],grav:0,drag:1.8});
      break;
    case 'shieldup':
      addP({x:x,y:y,life:.3,color:'#ffd34d',shape:'ring',r0:6,r1:60,lw:5});
      burst(x,y,14,{a0:0,a1:6.28,s0:60,s1:220,l0:.3,l1:.6,z0:2,z1:4,colors:['#ff6a2b','#ffd34d'],grav:-20,drag:1.6});
      break;
    case 'flamepuff': {
      const ang=e.ang||0, ca=Math.cos(ang), sa=Math.sin(ang);
      if(e.br){      // 입냄새: a wide cone of dingy green-yellow fog puffs, wavy stink lines and a few 💨 / 🤢 - not light, but a smell you can see
        const len=(e.len!==undefined?e.len:FLAME_RANGE);
        for(let i=0;i<16;i++){
          const dist=Math.random()*len, spread=(Math.random()-0.5)*2*FLAME_HALF_ANGLE*0.75*dist, px=x+ca*dist-sa*spread, py=y+sa*dist+ca*spread, fall=1-0.5*(dist/FLAME_RANGE);
          addP({x:px,y:py,vx:ca*RND(15,40)+RND(-12,12),vy:sa*RND(15,40)+RND(-30,-8),life:RND(.55,1.0),size:RND(9,17)*fall,color:['#7a8a2a','#8f9b34','#a39a3a','#6c7430','#b0a548'][Math.floor(Math.random()*5)],shape:'smoke',drag:1.4,add:false});
        }
        for(let i=0;i<4;i++){ const dist=Math.random()*len, spread=(Math.random()-0.5)*2*FLAME_HALF_ANGLE*0.6*dist; addP({x:x+ca*dist-sa*spread,y:y+sa*dist+ca*spread,vx:RND(-8,8),vy:RND(-40,-18),life:RND(.6,1.0),size:2.6,r1:RND(22,38),rot:RND(0,6.28),color:['#b9c23a','#8fa02a','#c8b840'][i%3],shape:'stinkwave',add:false}); }
        if(Math.random()<0.18) addP({x:x+ca*RND(30,len*0.8),y:y+sa*RND(30,len*0.8)-6,vx:ca*60,vy:-30,life:.9,size:18,color:'#ffffff',shape:'text',add:false,text:Math.random()<0.5?'💨':'🤢'});
        break;
      }
      const n=26+Math.floor(Math.random()*10);
      for(let i=0;i<n;i++){
        const dist=Math.random()*(e.len!==undefined?e.len:FLAME_RANGE); // scattered anywhere from the muzzle out to max range, so the stream visually reaches as far as it can actually hit
        const centerBias=(Math.random()+Math.random()+Math.random())/3-0.5; // averaged random clusters much closer to 0 than a flat spread would
        const jitter=centerBias*2*FLAME_HALF_ANGLE*0.42*dist; // (wider cone than it was: 0.22) even tighter, denser core along the aim line
        const px=x+ca*dist-sa*jitter, py=y+sa*dist+ca*jitter;
        const sizeFalloff=1-0.55*(dist/FLAME_RANGE); // stays clearly visible even at max range instead of fading to a speck
        addP({x:px,y:py,vx:ca*RND(20,50)+RND(-15,15),vy:sa*RND(20,50)+RND(-25,-5),life:RND(.3,.55),size:RND(5,9)*sizeFalloff,color:['#ff5a1f','#ffb347','#ffe08a'][Math.floor(Math.random()*3)],shape:'fire',drag:1.8,add:true});
      }
      break;
    }
    case 'smokeveil':
      burst(x,y,22,{a0:0,a1:6.28,s0:30,s1:140,l0:.6,l1:1.1,z0:6,z1:13,colors:['#0c0c10','#1c1d22','#2a2b31'],grav:-30,drag:1.1,shape:'smoke',add:false});
      addP({x:x,y:y,life:.3,color:'#15161c',shape:'flash',size:70});
      break;
    case 'cards': {
      showCardBanner(e.name, e.cards, e.total, e.tags);
      addP({x:x,y:y,life:.4,color:'#ffd34d',shape:'ring',r0:6,r1:90,lw:5});
      break; }
    case 'dice':
      showDiceBanner(e.name||'?', e.face, e.doubled);
      break;
    case 'dice6':
      addP({x:x,y:y,life:.4,color:'#ffd34d',shape:'ring',r0:6,r1:70,lw:5});
      burst(x,y,16,{a0:0,a1:6.28,s0:80,s1:280,l0:.4,l1:.7,z0:2,z1:4,colors:['#ffd34d','#ffffff'],drag:1.8});
      break;
    case 'magiccircle':
      addP({x:x,y:y,life:.6,color:'#c85aff',shape:'ring',r0:10,r1:WIZ_CIRCLE_R,lw:6});
      addP({x:x,y:y,life:.3,color:'#ffd34d',shape:'flash',size:120});
      burst(x,y,24,{a0:0,a1:6.28,s0:100,s1:380,l0:.5,l1:.9,z0:2,z1:4,colors:['#c85aff','#ffd34d','#ffffff'],drag:1.5});
      shakeFrom(x,y,6,600);
      break;
    case 'slow':
      burst(x,y,10,{a0:1.2,a1:1.9,s0:20,s1:60,l0:.6,l1:1.0,z0:3,z1:5,colors:['#7c9eff','#3b4a7a'],grav:60,drag:1.2,shape:'dot',add:false});
      break;
    case 'darksplash': {                                                   // a potion bursts: dark droplets and a puff of purple smoke
      burst(x,y,14,{a0:-3.0,a1:-0.15,s0:80,s1:260,l0:.35,l1:.7,z0:2,z1:4,colors:['#1a0f26','#3b1d5c','#7b3fd1'],grav:900,drag:.6,shape:'dot',add:false});
      burst(x,y,6,{a0:-2.6,a1:-0.5,s0:15,s1:60,l0:.6,l1:1.0,z0:8,z1:14,colors:['#2a1640','#4a2a6e'],grav:-40,drag:1.6,shape:'smoke',add:false});
      addP({x:x,y:y,life:.25,color:'#a374ff',shape:'ring',r0:4,r1:26,lw:2});
      break; }
    case 'darkdrip': {                                                     // it hit the side or the underside: the darkness runs down to the surface below
      const n=Math.max(3,Math.min(10,Math.round(Math.abs((e.y2||y)-y)/30)));
      for(let i=0;i<n;i++) addP({x:x+RND(-3,3),y:y+((e.y2||y)-y)*i/n,vx:0,vy:RND(160,260),grav:600,life:RND(.2,.4),size:RND(2,3.2),color:i%2?'#2a1640':'#5b2a8c',add:false});
      break; }
    case 'darkarm': addP({x:x,y:y,life:DARK_ARM_SEC,color:'#a374ff',shape:'ring',r0:30,r1:12,lw:2}); break;
    case 'darksink': {                                                     // 어둠 이동: sinks into the puddle, dark drops jump up
      burst(x,y-2,18,{a0:-2.9,a1:-0.25,s0:120,s1:330,l0:.4,l1:.8,z0:2,z1:4.5,colors:['#120a1c','#3b1d5c','#7b3fd1'],grav:900,drag:.5,shape:'dot',add:false});
      burst(x,y-6,8,{a0:-2.4,a1:-0.7,s0:20,s1:80,l0:.6,l1:1.0,z0:10,z1:18,colors:['#1a0f26','#3b1d5c'],grav:-30,drag:1.5,shape:'smoke',add:false});
      addP({x:x,y:y-30,life:.45,color:'#7b3fd1',shape:'ring',r0:34,r1:4,lw:5});
      addP({x:x,y:y,life:.5,color:'#c48bff',shape:'ring',r0:8,r1:60,lw:3});
      break; }
    case 'darkrise': {                                                     // 어둠 탈출: bursts back out, a ring of darkness stuns whoever is near
      burst(x,y-4,26,{a0:-3.0,a1:-0.15,s0:160,s1:460,l0:.4,l1:.9,z0:2,z1:5,colors:['#120a1c','#3b1d5c','#7b3fd1','#c48bff'],grav:900,drag:.5,shape:'dot',add:false});
      burst(x,y-20,12,{a0:0,a1:6.28,s0:40,s1:140,l0:.6,l1:1.1,z0:12,z1:22,colors:['#1a0f26','#2a1640','#4a2a6e'],grav:-20,drag:1.4,shape:'smoke',add:false});
      addP({x:x,y:y-30,life:.4,color:'#c48bff',shape:'ring',r0:10,r1:DARK_EMERGE_R,lw:6});
      addP({x:x,y:y-30,life:.55,color:'#7b3fd1',shape:'ring',r0:6,r1:DARK_EMERGE_R*1.2,lw:3});
      shakeFrom(x,y,6,600);
      break; }
    case 'darkslash': {                                                    // the dark sword: a purple-black crescent
      const d=e.dir||1;
      addP({x:x-d*34,y:y-26,x2:x+d*34,y2:y+18,life:.32,color:'#2a1640',shape:'slash',size:30});
      addP({x:x-d*30,y:y-22,x2:x+d*30,y2:y+14,life:.26,color:'#a374ff',shape:'slash',size:14});
      burst(x,y,8,{a0:d>0?-0.8:2.3,a1:d>0?0.8:3.9,s0:80,s1:220,l0:.3,l1:.5,z0:6,z1:11,colors:['#1a0f26','#3b1d5c'],drag:2,shape:'smoke',add:false});
      break; }
    case 'darkhit': {
      addP({x:x,y:y,life:.18,color:'#c48bff',shape:'flash',size:90});
      addP({x:x,y:y,life:.4,color:'#7b3fd1',shape:'ring',r0:8,r1:80,lw:6});
      burst(x,y,16,{a0:0,a1:6.28,s0:120,s1:420,l0:.35,l1:.7,z0:2,z1:4,colors:['#c48bff','#7b3fd1','#ffffff'],drag:1.4,shape:'streak'});
      shakeFrom(x,y,8,700);
      break; }
    case 'stun':
      addP({x:x,y:y+16,life:.35,color:'#ffe066',shape:'ring',r0:6,r1:44,lw:4});
      burst(x,y+10,12,{a0:0,a1:6.28,s0:50,s1:150,l0:.3,l1:.6,z0:2,z1:4,colors:['#ffe066','#ffffff'],grav:0,drag:2.2,shape:'dot',add:true});
      break;
    case 'crossfall':
      addP({x:x,y:y,life:e.dur||0.7,color:'#fff0b0',shape:'bigcross',add:false,sc:(e.hw||90)/90});
      addP({x:x,y:y,life:e.dur||0.7,color:'#ffd34d',shape:'warn',hw:e.hw});
      break;
    case 'crosshit':
      addP({x:x,y:y,life:.28,color:'#ffffff',shape:'flash',size:150});
      addP({x:x,y:y,life:.5,color:'#ffe08a',shape:'ring',r0:8,r1:(e.hw||PZ_CROSS_HALF[0])*2,lw:8});
      burst(x,y,22,{a0:-3.3,a1:0.15,s0:120,s1:520,l0:.4,l1:.9,z0:2,z1:4,colors:['#ffffff','#ffd34d','#fff0b0'],grav:700,drag:1.2,shape:'streak'});
      shakeFrom(x,y,10,600);
      break;
    case 'swordfall':
      addP({x:x,y:y,life:e.dur||0.7,color:e.gold?'#fff0b0':'#dfe9ff',shape:e.thor?'bighammer':'bigsword',add:false,gold:!!e.gold,thor:!!e.thor});
      addP({x:x,y:y,life:e.dur||0.7,color:e.gold?'#ffd34d':'#7c9eff',shape:'warn'});
      break;
    case 'applebreak': {      // 빌헬름 텔: the apple is hit and bursts - two halves fly apart, chunks of red skin and white flesh, juice and a leaf
      playSfx('explosion', x, y);
      addP({x:x,y:y,life:.25,color:'#ffffff',shape:'flash',size:90});
      for(const sg of [-1,1]) addP({x:x,y:y,vx:sg*RND(110,200),vy:RND(-260,-150),grav:900,drag:0.4,life:.9,size:15,rot:sg*0.4,vr:sg*RND(7,12),shape:'applehalf',add:false,color:'#d62828'});
      burst(x,y,16,{a0:0,a1:6.28,s0:120,s1:430,l0:.45,l1:.9,z0:3,z1:7,colors:['#d62828','#ff5a4a','#8a1a1a'],grav:800,drag:0.8,shape:'square',add:false});
      burst(x,y,12,{a0:0,a1:6.28,s0:100,s1:380,l0:.4,l1:.8,z0:2.5,z1:5,colors:['#fff1c9','#ffe9a8'],grav:800,drag:0.8,shape:'square',add:false});
      burst(x,y,26,{a0:0,a1:6.28,s0:60,s1:520,l0:.35,l1:.9,z0:1.6,z1:3.4,colors:['#ff5a4a','#ffb0a0','#ffe14a'],grav:700,drag:1,shape:'dot'});
      burst(x,y,14,{a0:0,a1:6.28,s0:200,s1:560,l0:.2,l1:.4,z0:2,z1:3,colors:['#ffffff','#ffd0c8'],drag:2.2,shape:'streak'});
      for(let i=0;i<3;i++) addP({x:x,y:y-8,vx:RND(-120,120),vy:RND(-220,-80),grav:380,drag:1,life:RND(.7,1.1),size:RND(4,6),rot:RND(0,6),vr:RND(-9,9),shape:'square',add:false,color:'#4aa83a'});
      addP({x:x,y:y,life:.4,color:'#ff5a4a',shape:'ring',r0:6,r1:70,lw:6});
      shakeFrom(x,y,5,700); break; }
    case 'swordhit':
      addP({x:x,y:y,life:.28,color:'#ffffff',shape:'flash',size:160});
      addP({x:x,y:y,life:.55,color:e.gold?'#ffd34d':'#9fc2ff',shape:'ring',r0:8,r1:SKY_SWORD_HALF*2,lw:9});
      if(e.gold) burst(x,y,40,{a0:-3.3,a1:0.15,s0:100,s1:700,l0:.6,l1:1.3,z0:2,z1:5,colors:['#ffd34d','#fff3b0','#ffffff'],grav:500,drag:1.1});
      burst(x,y,26,{a0:-3.3,a1:0.15,s0:120,s1:620,l0:.4,l1:.9,z0:2,z1:4,colors:e.gold?['#ffd34d','#fff3b0','#ffffff']:['#ffffff','#9fc2ff','#dfe9ff'],grav:700,drag:1.2,shape:'streak'});
      burst(x,y,12,{a0:-3.1,a1:-0.04,s0:60,s1:260,l0:.7,l1:1.2,z0:8,z1:18,colors:['#8a8f99','#6b6f78'],grav:-30,drag:1.4,shape:'smoke',add:false});
      shakeFrom(x,y,14,800);
      break;
    case 'skill': {
      addP({x:x,y:y-26,vx:0,vy:-46,drag:1.1,life:0.95,size:13,color:'#ffffff',outline:col,shape:'text',add:false,text:e.name||''});
      addP({x:x,y:y+12,life:.35,color:col,shape:'ring',r0:6,r1:40,lw:3});
      break; }
    case 'dsdragon': { DS_DRAGONS[e.pid]={start:performance.now(), dur:(e.dur||DS_ULT_SEC)*1000, manga:!!e.manga}; break; }
    case 'dsbreath': { playSfx('flame', x, y); if(DS_DRAGONS[e.pid]) DS_DRAGONS[e.pid].breath=performance.now(); burst(x,y,14,{a0:e.ang-0.5,a1:e.ang+0.5,s0:90,s1:330,l0:.25,l1:.5,z0:3,z1:6,colors:['#ffd34d','#ff7a2a','#ff3b1a'],drag:2}); addP({x:x,y:y,life:.35,color:'#ffb347',shape:'ring',r0:6,r1:34,lw:3}); break; }
    case 'dsswing': { const d=DS_STATE[e.pid]||(DS_STATE[e.pid]={}); d.swAt=performance.now(); break; }
    case 'dsflame': { const d=DS_STATE[e.pid]||(DS_STATE[e.pid]={}); d.flameEnd=performance.now()+(e.dur||2)*1000; break; }
    case 'converge': {                                              // a wind-up: rings and sparks pulled in to the spot (the lead-in of a cast)
      const R=e.r||110, c2=e.color2||'#ffffff';
      addP({x:x,y:y,life:.32,color:col,shape:'ring',r0:R,r1:R*.18,lw:5});
      addP({x:x,y:y,life:.24,color:c2,shape:'ring',r0:R*.7,r1:R*.1,lw:3});
      for(let i=0;i<Math.max(4,Math.round(10*FQ));i++){ const a=i*6.283/10+RND(-.2,.2), d=R*RND(.8,1.1), s=d/.3; addP({x:x+Math.cos(a)*d,y:y+Math.sin(a)*d*.55,vx:-Math.cos(a)*s,vy:-Math.sin(a)*s*.55,life:.3,size:RND(2,3.4),color:i%2?col:c2}); }
      addP({x:x,y:y,life:.3,color:col,shape:'flash',size:R*.55}); break; }
    case 'fan': {                                                   // a spray of streaks along a direction (the original's 8-spark fans, with a muzzle flash)
      const a=e.ang||0, sp=e.spread||.45, n=e.n||10, L=e.len||420;
      bu(x,y,n,{a0:a-sp,a1:a+sp,s0:L*.5,s1:L*1.4,l0:.18,l1:.4,z0:2,z1:4.2,colors:[col,'#ffffff',e.color2||col],drag:3,shape:'streak'});
      addP({x:x+Math.cos(a)*14,y:y+Math.sin(a)*14,life:.16,color:'#fff3b0',shape:'flash',size:64}); break; }
    case 'column': {                                                // a column of light sparks going up
      const Hh=e.h||90;
      bu(x,y,16,{a0:-1.9,a1:-1.24,s0:Hh*1.2,s1:Hh*3.2,l0:.4,l1:.85,z0:2,z1:4.2,colors:[col,'#ffffff'],drag:2.2,shape:'streak'});
      addP({x:x,y:y-Hh*.4,life:.4,color:col,shape:'flash',size:Hh}); addP({x:x,y:y,life:.5,color:col,shape:'ring',r0:6,r1:Hh*.55,lw:4}); break; }
    case 'afterimage': {                                            // ghost cuts left behind along a dash
      const x2=e.x2, y2=e.y2, n=4;
      for(let i=0;i<n;i++){ const t0=i/n, t1=(i+.6)/n; addP({x:x+(x2-x)*t0,y:y+(y2-y)*t0,x2:x+(x2-x)*t1,y2:y+(y2-y)*t1,life:.2+i*.07,color:i%2?'#ffffff':col,shape:'slash',size:16-i*2}); }
      bu(x,y,8,{a0:0,a1:6.28,s0:40,s1:180,l0:.2,l1:.4,z0:2,z1:3.4,colors:[col,'#ffffff'],drag:3}); break; }
    case 'glyph': {                                                 // a rune circle on the ground that opens and drifts up
      const R=e.r||80;
      for(let r=0;r<2;r++) addP({x:x,y:y,life:.7+r*.2,color:r?'#ffffff':col,shape:'ring',r0:R*.3,r1:R*(r?1:.8),lw:3+r});
      for(let i=0;i<8;i++){ const a=i*6.283/8; addP({x:x+Math.cos(a)*R*.8,y:y+Math.sin(a)*R*.8*.55,vx:0,vy:-60,drag:1.2,life:.9,size:3.4,color:col}); } break; }
    case 'skillring': {
      addP({x:x,y:y,life:.4,color:col,shape:'ring',r0:10,r1:(e.r||120),lw:5});
      break; }
    case 'coinflip': {      // 도박사 skill: the result must be readable at a glance (heads = green/gold and a big 앞면, tails = red and a big 뒷면 with a strike on the target)
      const hd=!!e.heads, cc=hd?'#7dffa3':'#ff5a6a';
      addP({x:x,y:y,life:.6,color:cc,shape:'ring',r0:12,r1:70,lw:6});
      addP({x:x,y:y,life:.9,color:'#ffe27a',shape:'ring',r0:6,r1:44,lw:3});
      addP({x:x,y:y-28,vx:0,vy:-50,drag:1.2,life:1.3,size:34,color:cc,outline:hd?'#1c7a3a':'#7a1c26',shape:'text',add:false,text:hd?'🪙 앞면!':'🪙 뒷면!'});
      burst(x,y,16,{a0:-3.14,a1:0,s0:80,s1:260,l0:.5,l1:.9,z0:2,z1:4,colors:hd?['#7dffa3','#ffe27a','#ffffff']:['#ff5a6a','#ffe27a','#ffffff'],grav:200,drag:1.2});
      if(!hd && e.tx!==undefined){ const ang=Math.atan2(e.ty-y,e.tx-x); burst(e.tx,e.ty,18,{a0:ang-0.7,a1:ang+0.7,s0:120,s1:380,l0:.3,l1:.6,z0:2,z1:4,colors:['#ff5a6a','#ffffff'],drag:1.5}); addP({x:e.tx,y:e.ty,life:.45,color:'#ff5a6a',shape:'ring',r0:8,r1:60,lw:5}); }
      break; }
    case 'vaccone': {
      const a0=e.ang||0, R=e.range||VACUUM_RANGE, nx=x+Math.cos(a0)*26, ny=y+Math.sin(a0)*26;
      for(let i=0;i<26;i++){ const r=R*(0.25+0.75*Math.random()), aa=a0+(Math.random()-0.5)*2*VACUUM_HALF_ANGLE, px=x+Math.cos(aa)*r, py=y+Math.sin(aa)*r, life=0.28+Math.random()*0.12, sp=Math.hypot(nx-px,ny-py)/life;
        addP({x:px,y:py,vx:(nx-px)/Math.hypot(nx-px,ny-py)*sp,vy:(ny-py)/Math.hypot(nx-px,ny-py)*sp,life:life,size:3+Math.random()*3,color:i%3?'#8fd3ff':'#ffffff',shape:'streak'}); }
      for(let k=0;k<3;k++) addP({x:x+Math.cos(a0)*(40+k*R*0.28),y:y+Math.sin(a0)*(40+k*R*0.28),life:.3,color:'#8fd3ff',shape:'ring',r0:46-k*10,r1:8,lw:3});
      break; }
    case 'vacvortex': {
      const R=e.r||VAC_SKILL_R;
      addP({x:x,y:y,life:.5,color:'#8fd3ff',shape:'ring',r0:R,r1:20,lw:8}); addP({x:x,y:y,life:.4,color:'#ffffff',shape:'ring',r0:R*0.7,r1:10,lw:4}); addP({x:x,y:y,life:.7,color:'#1a1030',shape:'ring',r0:30,r1:60,lw:12});
      for(let i=0;i<30;i++){ const aa=Math.random()*6.283, r=R*(0.4+0.6*Math.random()), px=x+Math.cos(aa)*r, py=y+Math.sin(aa)*r, life=0.35+Math.random()*0.2;
        addP({x:px,y:py,vx:-Math.cos(aa)*r/life,vy:-Math.sin(aa)*r/life,life:life,size:3+Math.random()*3,color:i%2?'#8fd3ff':'#d9c4ff',shape:'streak'}); }
      break; }
    case 'flashbang': {
      playSfx('explosion', x, y);
      addP({x:x,y:y,life:.5,color:'#ffffff',shape:'flash',size:420}); addP({x:x,y:y,life:.6,color:'#ffffff',shape:'ring',r0:10,r1:380,lw:10}); addP({x:x,y:y,life:.9,color:'#fff6c8',shape:'ring',r0:5,r1:260,lw:4});
      burst(x,y,26,{a0:0,a1:6.28,s0:200,s1:700,l0:.3,l1:.7,z0:2,z1:4,colors:['#ffffff','#fff6c8'],drag:2,shape:'streak'}); shakeFrom(x,y,8,500); break; }
    case 'sandpuff': {
      burst(x,y,26,{a0:0,a1:6.28,s0:40,s1:260,l0:.4,l1:.9,z0:4,z1:9,colors:['#d8b36a','#c9a05a','#f0d9a0'],grav:-30,drag:2.2,shape:'smoke',add:false}); addP({x:x,y:y,life:.5,color:'#d8b36a',shape:'ring',r0:8,r1:90,lw:5}); break; }
    case 'arrowwarn': {
      for(let i=0;i<3;i++) addP({x:x,y:y,life:.5+i*.15,color:'#7dffb0',shape:'ring',r0:130,r1:30,lw:3}); break; }
    case 'snare': {
      burst(x,y-4,e.hit?22:10,{a0:-3.0,a1:-0.1,s0:60,s1:e.hit?340:160,l0:.3,l1:.7,z0:2,z1:4,colors:['#a8793c','#d9b27a','#6e4b22'],grav:600,drag:1,shape:'streak'}); addP({x:x,y:y-4,life:.4,color:'#d9b27a',shape:'ring',r0:6,r1:e.hit?70:44,lw:4}); break; }
    case 'firepillar': {
      burst(x,y-6,10,{a0:-2.0,a1:-1.1,s0:150,s1:420,l0:.4,l1:.9,z0:6,z1:13,colors:['#ff5a1f','#ff9b2e','#ffd34d'],grav:-200,drag:1.4,shape:'fire'}); addP({x:x,y:y-2,life:.3,color:'#ffb347',shape:'ring',r0:10,r1:(e.r||58)*1.4,lw:5}); break; }
    case 'lockon': {
      addP({x:x,y:y,life:.25,color:'#ff5a5a',shape:'ring',r0:46,r1:14,lw:3}); addP({x:x,y:y,life:.18,color:'#ffffff',shape:'flash',size:30}); break; }
    case 'heal': {
      burst(x,y+10,14,{a0:-2.3,a1:-0.85,s0:50,s1:200,l0:.6,l1:1.0,z0:2,z1:4,colors:['#5fff8a','#ffffff'],grav:-60,drag:1.4});
      addP({x:x,y:y-6,vx:0,vy:-70,drag:1.2,life:1.0,size:16,color:'#7dffa3',outline:'#1c7a3a',shape:'text',add:false,text:'+'+(e.v||0)});
      break; }
    case 'explosion': {
      playSfx('explosion', x, y); // grenade / bazooka / missile splash and the bat home run
      addP({x:x,y:y,life:.24,color:'#fff6c8',shape:'flash',size:105});
      addP({x:x,y:y,life:.55,color:'#ffb347',shape:'ring',r0:10,r1:150,lw:8});
      addP({x:x,y:y,life:.85,color:'#ff6b2c',shape:'ring',r0:5,r1:195,lw:4});
      burst(x,y,20,{a0:0,a1:6.28,s0:30,s1:225,l0:.4,l1:.8,z0:6,z1:14,colors:['#ff5a1f','#ff9b2e','#ffd34d','#ff3d00'],drag:3.2,shape:'fire'});
      burst(x,y,36,{a0:0,a1:6.28,s0:150,s1:585,l0:.45,l1:1.0,z0:2,z1:4.2,colors:['#ffe08a','#ffb347','#ffffff'],grav:520,drag:1.1,shape:'streak'});
      burst(x,y,10,{a0:0,a1:6.28,s0:90,s1:405,l0:.8,l1:1.3,z0:3,z1:6,colors:['#3b3025','#5a4a3a'],grav:900,drag:.3,shape:'square',add:false});
      burst(x,y-6,14,{a0:-2.4,a1:-0.7,s0:22,s1:112,l0:1.0,l1:1.5,z0:9,z1:18,colors:['#6b6b70','#4a4a50'],grav:-40,drag:1.4,shape:'smoke',add:false});
      shakeFrom(x,y,16,800);
      break; }
    case 'combo': {
      addP({x:x,y:y,life:.5,color:'#c17bff',shape:'ring',r0:8,r1:120,lw:8});
      addP({x:x,y:y,life:.2,color:'#ffffff',shape:'flash',size:100});
      burst(x,y,20,{a0:0,a1:6.28,s0:160,s1:520,l0:.6,l1:1.0,z0:5,z1:9,colors:['#ffffff','#d62839','#1d1f27'],grav:420,drag:1.2,shape:'card',add:false});
      burst(x,y,18,{a0:0,a1:6.28,s0:200,s1:620,l0:.35,l1:.7,z0:2,z1:3.4,colors:['#ffffff','#c17bff','#ff8fd9'],drag:1.6,shape:'streak'});
      shakeFrom(x,y,7,600);
      break; }
    case 'blink': {
      addP({x:x,y:y,life:.4,color:col,shape:'ring',r0:36,r1:4,lw:5});
      addP({x:x,y:y,life:.3,color:'#ffffff',shape:'ring',r0:6,r1:48,lw:3});
      addP({x:x,y:y,life:.18,color:col,shape:'flash',size:60});
      burst(x,y,14,{a0:-3.3,a1:0.15,s0:40,s1:220,l0:.4,l1:.8,z0:2,z1:4,colors:[col,'#ffffff'],grav:-120,drag:1.6});
      break; }
    case 'slamwarn': { const R=e.v||RAID_SLAM_R; addP({x:x,y:y,life:RAID_SLAM_WARN,color:'#ff4d4d',shape:'ring',r0:10,r1:R,lw:7}); addP({x:x,y:y,life:RAID_SLAM_WARN,color:'#ff9b3d',shape:'ring',r0:R,r1:R,lw:3}); break; }
    case 'kfx': { try{ spawnKillEffect(e, x, y, addP, burst, shakeFrom); }catch(err){} break; }
    case 'death': {
      addP({x:x,y:y,life:.4,color:'#ffffff',shape:'ring',r0:6,r1:90,lw:6});
      addP({x:x,y:y,life:.16,color:col,shape:'flash',size:90});
      burst(x,y,22,{a0:0,a1:6.28,s0:80,s1:460,l0:.5,l1:1.0,z0:3,z1:7,colors:[col,'#ffffff',col],grav:500,drag:1.3});
      burst(x,y,14,{a0:0,a1:6.28,s0:180,s1:560,l0:.35,l1:.7,z0:2,z1:3.4,colors:[col,'#ffffff'],grav:300,drag:1.4,shape:'streak'});
      shakeFrom(x,y,4,500);
      break; }
    case 'dash': {
      const back=(e.dir>0)?Math.PI:0;
      burst(x,y,e.lite?3:7,{a0:back-0.28,a1:back+0.28,s0:160,s1:520,l0:.2,l1:.4,z0:2,z1:3.6,colors:[col,'#ffffff'],drag:3,shape:'streak'});
      if(!e.lite) burst(x,y+28,3,{a0:back-0.6,a1:back+0.6,s0:30,s1:120,l0:.35,l1:.6,z0:4,z1:8,colors:['#c9c2b0'],drag:2,shape:'smoke',add:false});
      break; }
    case 'respawn': {
      addP({x:x,y:y,life:.55,color:col,shape:'pillar'});
      addP({x:x,y:y+22,life:.4,color:'#ffffff',shape:'ring',r0:4,r1:44,lw:3});
      burst(x,y+10,16,{a0:-2.0,a1:-1.14,s0:60,s1:260,l0:.5,l1:.9,z0:2,z1:4,colors:[col,'#ffffff'],grav:-40,drag:1.2});
      break; }
  }
}
const ULT_THEMES={
  kadas:{c:['#9a4cff','#c9a0ff','#52081a'],k:'wave',f:'200,160,255'},
  shade:{c:['#7dffd8','#ffffff','#38c8ff'],k:'wave',f:'200,255,240'},
  cleon:{c:['#ff5fb8','#ffd34d','#7a3cff'],k:'wave',f:'255,200,235'},
  pel:{c:['#bfefff','#ffffff','#57c7ff'],k:'bolt',f:'200,240,255'},
  tionis:{c:['#ff9d2e','#3fa0ff','#ffffff'],k:'wave',f:'255,225,190'},
  pizarro:{c:['#ffd34d','#ffffff','#c9a463'],k:'wave',f:'255,230,170'},
  puppeteer:{c:['#ff9ecb','#ffffff','#b388ff'],k:'wave',f:'255,210,235'},
  kan:{c:['#35d08a','#f2c230','#e0334a'],k:'wave',f:'190,255,210'},   // colours (3) + an extra flavour per character for the ultimate burst; f = the tint of the screen flash
  _:{c:['#ffd23f','#ff6fb5','#35e0ff'],k:'',f:'255,235,180'},
  pistol:{c:['#ffd23f','#ff8a2b','#fff1a8'],k:'',f:'255,225,150'}, rifle:{c:['#8dff5a','#ffd23f','#ff8a2b'],k:'fire',f:'220,255,170'},
  smg:{c:['#35e0ff','#7fa6ff','#ffffff'],k:'',f:'190,240,255'}, magiccard:{c:['#b45cff','#ff6fd8','#ffd23f'],k:'card',f:'235,190,255'},
  shuriken:{c:['#35ffd0','#9fe8ff','#ffffff'],k:'',f:'190,255,240'}, bat:{c:['#ff8a2b','#ff3d3d','#ffd23f'],k:'wave',f:'255,200,150'},
  dagger:{c:['#b45cff','#ff3d9a','#5a2bff'],k:'',f:'220,170,255'}, dracula:{c:['#ff2b4d','#8a1030','#ff9bb0'],k:'wave',f:'255,150,170'},
  gambler:{c:['#35e86a','#ffd23f','#ff3d4d'],k:'card',f:'200,255,200'}, wizard:{c:['#9a5cff','#35a8ff','#ff6fd8'],k:'wave',f:'205,185,255'},
  sword:{c:['#ffd23f','#ffffff','#ff9a3d'],k:'wave',f:'255,240,190'}, horemheb:{c:['#ffc24d','#e08a2b','#fff0b0'],k:'wave',f:'255,230,170'},
  lightsaber:{c:['#35a8ff','#9fe8ff','#b45cff'],k:'bolt',f:'180,220,255'}, bazooka:{c:['#ff3d3d','#ff8a2b','#ffd23f'],k:'fire',f:'255,180,130'},
  bow:{c:['#ff8a2b','#ffd23f','#ff3d3d'],k:'',f:'255,210,150'}, boomerang:{c:['#b6ff3d','#ffd23f','#35e0a0'],k:'',f:'225,255,170'},
  shotgun:{c:['#ff8a2b','#ff3d3d','#ffe08a'],k:'fire',f:'255,200,150'}, gloves:{c:['#ff3d3d','#ffd23f','#ffffff'],k:'wave',f:'255,190,170'},
  grenade:{c:['#7dff4a','#ff8a2b','#ffd23f'],k:'fire',f:'210,255,170'}, flamethrower:{c:['#ff6a1f','#ffd23f','#ff2b2b'],k:'fire',f:'255,190,120'},
  portalgun:{c:['#b45cff','#35e0ff','#ff9a3d'],k:'wave',f:'215,190,255'}, pirate:{c:['#ffd23f','#35c8ff','#ff5a3d'],k:'fire',f:'255,235,170'},
  vacuum:{c:['#35e0ff','#9fe8ff','#b6ff3d'],k:'wave',f:'190,245,255'},
  kurus:{c:['#7b3fd1','#c48bff','#2a1640'],k:'wave',f:'150,110,200'},
  samurai:{c:['#ff3d6e','#ffffff','#dfe9ff'],k:'bolt',f:'255,200,215'}, harald:{c:['#ff5a3a','#c9d4e0','#ffd34d'],k:'fire',f:'255,200,170'},
  edward:{c:['#d3303a','#f4f1e8','#ffd34d'],k:'wave',f:'255,215,200'}, medium:{c:['#8b5cf6','#c9b3ff','#7dffd8'],k:'wave',f:'215,195,255'},
  plague:{c:['#9be06a','#d8ff8a','#4a5a2a'],k:'wave',f:'215,255,175'}, dragonslayer:{c:['#ff8a3d','#ffd34d','#ff3b2b'],k:'fire',f:'255,205,150'},
  tell:{c:['#9ae26a','#ffe14a','#ffffff'],k:'',f:'225,255,190'}
};
/* a few small pictures that fly out of each ultimate (so no two bursts look alike) */
const ULT_EMOJI={ sword:['⚔️','✨'], pistol:['⭐','💥'], bow:['🏹','🍃'], bat:['⚾','💥'], shuriken:['⭐','💨'], shotgun:['💥','🔥'], rifle:['🎯','💥'], smg:['💥','⚡'], gloves:['🥊','💢'], grenade:['💣','💥'],
  bazooka:['🚀','🔥'], dagger:['🗡️','☠️'], dracula:['🦇','🩸'], wizard:['✨','🔮'], magiccard:['🃏','✨'], gambler:['🎲','🪙'], boomerang:['🪃','🍃'], flamethrower:['🔥','💨'], vacuum:['🌀','💨'],
  pirate:['⚓','🪙'], samurai:['🌸','⚔️'], harald:['🪓','🔥'], horemheb:['☀️','🏺'], pizarro:['🪙','⚜️'], edward:['⚜️','🎖️'], medium:['👻','🔮'], plague:['☣️','🦠'], dragonslayer:['🐉','🔥'],
  shade:['👻','✨'], kadas:['🦇','💜'], kan:['🐸','☠️'], puppeteer:['🎀','✨'], tell:['🍎','🏹'], kurus:['🌑','💜'], cleon:['👑','💖'], pel:['⚡','🔧'], tionis:['🎭','⭐'] };
let samScreen={dimFrom:0, dimUntil:0, flashAt:0, flashA:0, flashCol:'255,255,255'};
function samFlash(a,col){ if(otherSettings.screenShake===false) a*=0.5; samScreen.flashAt=performance.now(); samScreen.flashA=a; samScreen.flashCol=col||'255,255,255'; }
function drawSamScreen(){
  const now=performance.now(), W=cv.width, H=cv.height;
  if(now<samScreen.dimUntil){ const tt=(now-samScreen.dimFrom)/(samScreen.dimUntil-samScreen.dimFrom), k=Math.min(1,tt*8,(1-tt)*6);
    ctx.save(); ctx.setTransform(1,0,0,1,0,0); ctx.fillStyle='rgba(28,8,48,'+(0.58*k)+')'; ctx.fillRect(0,0,W,H);
    const g=ctx.createRadialGradient(W*0.5,H*0.2,0,W*0.5,H*0.2,Math.min(W,H)*0.28); g.addColorStop(0,'rgba(255,240,200,'+(0.95*k)+')'); g.addColorStop(0.3,'rgba(255,120,90,'+(0.6*k)+')'); g.addColorStop(0.65,'rgba(190,60,160,'+(0.3*k)+')'); g.addColorStop(1,'rgba(190,60,160,0)');
    ctx.fillStyle=g; ctx.fillRect(0,0,W,H); ctx.restore(); }
  const fa=samScreen.flashA*Math.max(0,1-(now-samScreen.flashAt)/260);
  if(fa>0.01){ ctx.save(); ctx.setTransform(1,0,0,1,0,0); ctx.fillStyle='rgba('+samScreen.flashCol+','+fa+')'; ctx.fillRect(0,0,W,H); ctx.restore(); }
}
function showCardBanner(name, cards, total, tags){      // 도박사 궁극기: three cards spin face-down, then turn over one by one from the left
  const container=document.getElementById('diceBannerContainer');
  if(!container) return;
  const el=document.createElement('div'); el.className='diceBanner pkBanner';
  el.innerHTML='<div class="dbName"></div><div class="pkRow"></div><div class="dbEffect"></div>';
  el.querySelector('.dbName').textContent=name+'님의 카드';
  const row=el.querySelector('.pkRow'), eff=el.querySelector('.dbEffect'), els=[];
  for(const c of cards){ const d=document.createElement('div'); d.className='pkCard back'; row.appendChild(d); els.push(d); }
  container.appendChild(el);
  requestAnimationFrame(()=>el.classList.add('show'));
  cards.forEach((c,i)=>setTimeout(()=>{
    const d=els[i]; d.className='pkCard flip'+(c.red?' red':'');
    d.innerHTML=(c.joker?'🃏':c.r)+'<small>'+c.s+'</small>'+(c.joker?'<div class="jk">조커</div>':'');
    if(i===cards.length-1) eff.textContent='다음 공격 '+total+(tags&&tags.length?' · '+tags.join(' · '):'');
  }, 900+i*450));
  setTimeout(()=>{ el.classList.remove('show'); setTimeout(()=>el.remove(), 250); }, 900+cards.length*450+1800);
}
function drawFleet(){
  const now=performance.now();
  fleetShows=fleetShows.filter(f=>now-f.t0<2900);
  for(const f of fleetShows){
    const age=(now-f.t0)/1000, al=age<0.4?age/0.4:(age>2.5?(2.9-age)/0.4:1), n=CLEON_BEAM_N;
    for(let i=0;i<n;i++){
      const sx=f.x+(i-(n-1)/2)*f.gap, sy=f.y-40*(1-Math.min(1,age/0.5));
      ctx.save(); ctx.translate(sx,sy); ctx.globalAlpha=Math.max(0,al);
      ctx.fillStyle='#1b1630'; ctx.strokeStyle='#8b6bd6'; ctx.lineWidth=2;
      ctx.beginPath(); ctx.moveTo(-72,-12); ctx.lineTo(72,-12); ctx.lineTo(44,12); ctx.lineTo(12,30); ctx.lineTo(-12,30); ctx.lineTo(-44,12); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.strokeStyle='#ffd34d'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(-62,-5); ctx.lineTo(62,-5); ctx.stroke();
      ctx.fillStyle='#ff7ac8'; for(let k=-3;k<=3;k++){ ctx.beginPath(); ctx.arc(k*16,5,1.8,0,7); ctx.fill(); }
      ctx.globalCompositeOperation='lighter';
      const ch=Math.max(0,Math.min(1,(age-0.3)/1.2)), r=6+22*ch, g=ctx.createRadialGradient(0,30,0,0,30,r); g.addColorStop(0,'rgba(255,230,250,0.95)'); g.addColorStop(0.4,'rgba(255,95,184,0.7)'); g.addColorStop(1,'rgba(255,95,184,0)');
      ctx.fillStyle=g; ctx.beginPath(); ctx.arc(0,30,r,0,7); ctx.fill();
      for(const ex of [-60,60]){ const e=ctx.createRadialGradient(ex,-12,0,ex,-12,14); e.addColorStop(0,'rgba(255,180,230,0.8)'); e.addColorStop(1,'rgba(255,180,230,0)'); ctx.fillStyle=e; ctx.beginPath(); ctx.arc(ex,-12,14,0,7); ctx.fill(); }
      ctx.restore();
    }
  }
}