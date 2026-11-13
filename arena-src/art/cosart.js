const COSMETICS={
  hat_cap:{cat:'_internal',name:'야구 모자',price:0,color:'#3a86ff'},
  hat_tophat:{cat:'_internal',name:'중절모',price:0,color:'#1d1f27'},
  skin_pistol:{cat:'skin',char:'pistol',name:'미드나잇 블루 타이',price:800,tint:'#1a3a6b'},
  skin_smg:{cat:'skin',char:'smg',name:'앰버 고글',price:800,tint:'#ffb347'},
  skin_bow:{cat:'skin',char:'bow',name:'황혼의 후드',price:800,tint:'#7a3b8f'},
  skin_sword:{cat:'skin',char:'sword',name:'흑기사 투구',price:1000,tint:'#2a2d35'},
  skin_bat:{cat:'skin',char:'bat',name:'올스타 캡',price:600,tint:'#ffd34d'},
  skin_boomerang:{cat:'skin',char:'boomerang',name:'사막의 부시햇',price:600,tint:'#c9954f'},
  skin_shuriken:{cat:'skin',char:'shuriken',name:'진홍 두건',price:900,tint:'#b3122b'},
  skin_shotgun:{cat:'skin',char:'shotgun',name:'은빛 스텟슨',price:700,tint:'#c7ccd6'},
  skin_rifle:{cat:'skin',char:'rifle',name:'사막 위장모',price:900,tint:'#a0895a'},
  skin_gloves:{cat:'skin',char:'gloves',name:'챔피언 골드',price:900,tint:'#ffd34d'},
  skin_grenade:{cat:'skin',char:'grenade',name:'매그마 고글',price:700,tint:'#ff5a1f'},
  skin_bazooka:{cat:'skin',char:'bazooka',name:'스텔스 마스크',price:900,tint:'#1c1d22'},
  skin_dagger:{cat:'skin',char:'dagger',name:'심연의 삿갓',price:1000,tint:'#3a1f4d'},
  skin_magiccard:{cat:'skin',char:'magiccard',name:'미드나잇 실크햇',price:1000,tint:'#0e2a4a'},
  skin_dracula:{cat:'skin',char:'dracula',name:'로열 퍼플 망토',price:1200,tint:'#4a1568'},
  skin_gambler:{cat:'skin',char:'gambler',name:'하이롤러 바이저',price:900,tint:'#7a1620'},
  skin_wizard:{cat:'skin',char:'wizard',name:'에메랄드 로브',price:1200,tint:'#1c6b4a'},
  skin_lightsaber:{cat:'skin',char:'lightsaber',name:'사막 수련 로브',price:300,tint:'#c9b48a'},        // (these five characters had no basic skin; they are also the skins a random box can give: 400 G or less)
  skin_puppeteer:{cat:'skin',char:'puppeteer',name:'청록 광대 모자',price:400,tint:'#33c7bd'},        // (was pink #ff7fb5 = the same as the bare hat)
  skin_puppeteer_c:{cat:'skin',char:'puppeteer',name:'자줏빛 광대 모자',price:300,tint:'#8a4fd6'},
  skin_pizarro:{cat:'skin',char:'pizarro',name:'황금빛 모리온 투구',price:400,tint:'#d4a437'},
  skin_pizarro_c:{cat:'skin',char:'pizarro',name:'흑강철 모리온 투구',price:300,tint:'#3a3f4a'},
  skin_horemheb:{cat:'skin',char:'horemheb',name:'노을빛 왕의 두건',price:400,tint:'#e07a3a'},
  skin_flamethrower:{cat:'skin',char:'flamethrower',name:'그을린 마스크',price:300,tint:'#6b3a1f'},
  skin_samurai:{cat:'skin',char:'samurai',name:'쪽빛 무사 머리띠',price:400,tint:'#1f4e9c'},
  skin_samurai_c:{cat:'skin',char:'samurai',name:'먹빛 낭인 머리띠',price:400,tint:'#2b2b33'},
  skin_pirate:{cat:'skin',char:'pirate',name:'선장의 붉은 삼각모',price:400,tint:'#8e1b1b'},
  skin_pirate_c:{cat:'skin',char:'pirate',name:'푸른 항해사 모자',price:400,tint:'#1d3d6b'},
  skin_portalgun:{cat:'skin',char:'portalgun',name:'보랏빛 차원 고글',price:400,tint:'#9b6bff'},
  skin_vacuum:{cat:'skin',char:'vacuum',name:'코발트 방진 마스크',price:300,tint:'#2f7fd0'},
  skin_kurus:{cat:'skin',char:'kurus',name:'핏빛 늪의 두건',price:400,tint:'#6b1530'},
  skin_kurus_v:{cat:'skin',char:'kurus',name:'독초 늪의 두건',price:1000,tint:'#2e7d32'},
  // the cheap skins (300-400 G) of the characters that already had a dearer one: together with the five above they are what a random box can give
  skin_pistol_c:{cat:'skin',char:'pistol',name:'회색 정장 타이',price:300,tint:'#8a8f9c'},
  skin_smg_c:{cat:'skin',char:'smg',name:'카키 고글',price:300,tint:'#6b7a3a'},
  skin_bow_c:{cat:'skin',char:'bow',name:'숲속 초록 후드',price:300,tint:'#3f7a3a'},
  skin_sword_c:{cat:'skin',char:'sword',name:'은빛 견습 투구',price:400,tint:'#aab3c4'},
  skin_bat_c:{cat:'skin',char:'bat',name:'홈팀 레드 캡',price:300,tint:'#c0392b'},
  skin_boomerang_c:{cat:'skin',char:'boomerang',name:'초원 부시햇',price:300,tint:'#7da34a'},
  skin_shuriken_c:{cat:'skin',char:'shuriken',name:'밤색 두건',price:400,tint:'#3b3a52'},
  skin_shotgun_c:{cat:'skin',char:'shotgun',name:'갈색 카우보이 모자',price:300,tint:'#8a5a2b'},
  skin_rifle_c:{cat:'skin',char:'rifle',name:'정글 위장모',price:400,tint:'#3f6b3a'},
  skin_gloves_c:{cat:'skin',char:'gloves',name:'파랑 연습 글러브',price:300,tint:'#2f6fd0'},
  skin_grenade_c:{cat:'skin',char:'grenade',name:'회색 방진 고글',price:300,tint:'#7a7f8a'},
  skin_bazooka_c:{cat:'skin',char:'bazooka',name:'올리브 마스크',price:400,tint:'#5a6b3a'},
  skin_dagger_c:{cat:'skin',char:'dagger',name:'회청 삿갓',price:400,tint:'#4a5a6b'},
  skin_magiccard_c:{cat:'skin',char:'magiccard',name:'보라 연습 실크햇',price:300,tint:'#7a4ab0'},
  skin_dracula_c:{cat:'skin',char:'dracula',name:'붉은 안감 망토',price:400,tint:'#8a1b2b'},
  skin_gambler_c:{cat:'skin',char:'gambler',name:'초록 카지노 바이저',price:300,tint:'#1f7a4a'},
  skin_wizard_c:{cat:'skin',char:'wizard',name:'하늘빛 견습 로브',price:400,tint:'#4a8fd0'},
  skin_kurus_c:{cat:'skin',char:'kurus',name:'잿빛 안개 두건',price:300,tint:'#6b6f7a'},
  name_cyan:{cat:'name',name:'하늘색 이름표',price:500,color:'#4dd9ff'},
  name_pink:{cat:'name',name:'분홍 이름표',price:500,color:'#ff8fd9'},
  name_gold:{cat:'name',name:'금색 이름표',price:1000,color:'#ffd34d'},
  name_rainbow:{cat:'name',name:'무지개 이름표',price:6000,color:null}
};
/* ===== v119: kill effects, mastery titles, missions (daily / weekly) and the season pass ===== */
const KFX={
  kfx_confetti:{icon:'🎉',name:'축하 폭죽',price:400},
  kfx_hearts:{icon:'💖',name:'하트 팡팡',price:400},
  kfx_skull:{icon:'💀',name:'해골 연기',price:500},
  kfx_lightning:{icon:'⚡',name:'번개 일격',price:600},
  kfx_flame:{icon:'🔥',name:'불꽃 폭발',price:600},
  kfx_coins:{icon:'🪙',name:'금화 비',price:800},
  kfx_stars:{icon:'⭐',name:'별빛 폭발',price:0,season:true},
  kfx_ice:{icon:'❄️',name:'얼음 파편',price:0,season:true},
  kfx_split:{icon:'🦴',name:'몸 분리',price:700},
  kfx_blackhole:{icon:'🌀',name:'블랙홀',price:0,season:true},
  kfx_phoenix:{icon:'🪶',name:'불사조 승천',price:0,season:true},
  kfx_petals:{icon:'🌸',name:'벚꽃 흩날림',price:500},
  kfx_bats:{icon:'🦇',name:'박쥐 떼',price:600},
  kfx_poison:{icon:'☠️',name:'독 구름',price:600},
  kfx_slash:{icon:'⚔️',name:'십자 베기',price:700},
  kfx_pixel:{icon:'👾',name:'픽셀 분해',price:800},
  kfx_ghost:{icon:'👻',name:'유령 승천',price:900},
  kfx_tornado:{icon:'🌪️',name:'회오리',price:1000},
  kfx_firework:{icon:'🎆',name:'불꽃놀이',price:1200}
};
for(const id in KFX){ const k=KFX[id]; COSMETICS[id]={cat:'kfx', name:k.name, price:k.price, icon:k.icon, seasonOnly:!!k.season}; }
/* ===== 승리 포즈 =====
   What the winner's figure does on the end screen. 만세 is free (and what everybody without a pose does); the others are sold in the shop ("🏆 승리 포즈").
   The equipped pose travels with the other cosmetics (cos.pose), so everybody sees the winner's own pose. */
const WIN_POSES={
  pose_cheer:{name:'만세', price:0, free:true, icon:'🙌'},
  pose_flex:{name:'근육 자랑', price:350, icon:'💪'},
  pose_bow:{name:'정중한 인사', price:350, icon:'🙇'},
  pose_dance:{name:'승리의 춤', price:450, icon:'🕺'},
  pose_point:{name:'하늘 찌르기', price:500, icon:'☝️'},
  pose_dab:{name:'대브', price:550, icon:'💫'},
  pose_sit:{name:'여유롭게 앉기', price:650, icon:'😎'},
  pose_flip:{name:'백덤블링', price:800, icon:'🤸'},
  pose_cossack:{name:'코사크 댄스', price:900, icon:'💃'},
  pose_taunt:{name:'약 올리기', price:1500, icon:'😝'},
  pose_levitate:{name:'공중 부양', price:0, icon:'🧘', season:true},
  pose_trophy:{name:'챔피언 트로피', price:0, icon:'🏆', season:true}
};
for(const id in WIN_POSES){ const q=WIN_POSES[id]; COSMETICS[id]={cat:'pose', name:q.name, price:q.price, icon:q.icon, free:!!q.free, seasonOnly:!!q.season}; }
// draws the figure with its feet at (0,0), y going up negative; stroke/fill colours are set by the caller. t = seconds.
function drawWinPose(c, poseId, t, wid, tint){
  const HEADR=9, ln=(pts)=>{ c.beginPath(); c.moveTo(pts[0][0],pts[0][1]); for(let i=1;i<pts.length;i++) c.lineTo(pts[i][0],pts[i][1]); c.stroke(); };
  const head=(x,y)=>{ c.beginPath(); c.arc(x,y,HEADR,0,7); c.fill(); };
  const persona=(x,y,shy)=>{ if(wid && WEAPON_PERSONA_NAME[wid]){ const sb0=c.shadowBlur; c.shadowBlur=0; try{ drawWeaponPersona(c,wid,x,y,HEADR,shy,tint); }catch(e){} c.shadowBlur=sb0; } };
  const id=WIN_POSES[poseId] ? poseId : 'pose_cheer';
  if(id==='pose_cheer' && wid==='shade'){      // 셰이드: the winner holds the neon greatsword up, glowing
    const bob=Math.abs(Math.sin(t*5))*4, sw=Math.sin(t*3)*0.14; c.translate(0,-bob);
    c.save(); const gg=c.createRadialGradient(10,-84,2,10,-84,70); gg.addColorStop(0,'rgba(125,255,216,0.45)'); gg.addColorStop(1,'rgba(125,255,216,0)'); c.fillStyle=gg; c.beginPath(); c.arc(10,-84,70,0,7); c.fill(); c.restore();
    ln([[-8,0],[0,-22],[8,0]]); ln([[0,-22],[0,-42]]); ln([[0,-40],[-14,-34],[-8,-25]]); ln([[0,-40],[11,-52],[14,-66]]);
    head(0,-52); persona(0,-52,-42);
    drawHeldWeapon(c, 'shade', Math.sin(sw), -Math.cos(sw), 14, -66, 0, null);
  } else if(id==='pose_cheer'){
    const bob=Math.abs(Math.sin(t*5))*8, k=Math.sin(t*5)*5; c.translate(0,-bob);
    ln([[-8,0],[0,-22],[8,0]]); ln([[0,-22],[0,-42]]); ln([[-16,-58-k],[0,-38],[16,-58+k]]); head(0,-52); persona(0,-52,-42);
  } else if(id==='pose_flex'){
    const p=Math.sin(t*4)*3;
    ln([[-9,0],[0,-22],[9,0]]); ln([[0,-22],[0,-42]]);
    ln([[0,-40],[-15,-40],[-14,-56-p]]); ln([[0,-40],[15,-40],[14,-56-p]]);
    c.beginPath(); c.arc(-11,-45-p*0.4,2.8+p*0.25,0,7); c.arc(11,-45-p*0.4,2.8+p*0.25,0,7); c.fill();
    head(0,-52); persona(0,-52,-42);
  } else if(id==='pose_bow'){
    const ph=(t*0.55)%1, a=(ph<0.25)?ph/0.25:(ph<0.6?1:Math.max(0,1-(ph-0.6)/0.25)), ang=a*1.0;
    ln([[-6,0],[0,-22],[6,0]]);
    c.save(); c.translate(0,-22); c.rotate(-ang); c.translate(0,22);
    ln([[0,-22],[0,-42]]); ln([[0,-38],[-6,-30],[5,-27]]); ln([[0,-38],[7,-30],[10,-22]]); head(0,-52); persona(0,-52,-42);
    c.restore();
  } else if(id==='pose_dance'){
    const s=Math.sin(t*6), hx=s*6, up=Math.sin(t*6)>0;
    ln([[-8+hx*0.3,0],[hx,-22],[8+hx*0.3,0-(up?4:0)]]); ln([[hx,-22],[hx*0.5,-42]]);
    const sx=hx*0.5; ln([[sx-16,up?-58:-30],[sx,-38],[sx+16,up?-30:-58]]);
    head(sx,-52); persona(sx,-52,-42);
  } else if(id==='pose_point'){
    const ph=(t*0.8)%1, jump=ph<0.3?Math.sin(ph/0.3*Math.PI)*12:0; c.translate(0,-jump);
    ln([[-8,0],[0,-22],[8,jump?-4:0]]); ln([[0,-22],[0,-42]]);
    ln([[0,-40],[14,-56],[22,-72]]); ln([[0,-40],[-10,-32],[-4,-24]]);
    head(0,-52); persona(0,-52,-42);
    c.save(); c.globalAlpha=0.6+0.4*Math.sin(t*8); c.beginPath(); c.arc(26,-77,2.5,0,7); c.fill(); c.restore();
  } else if(id==='pose_dab'){
    const dir=(Math.floor(t*0.9)%2===0)?1:-1;
    ln([[-8,0],[0,-22],[8,0]]); ln([[0,-22],[0,-42]]);
    ln([[0,-40],[dir*16,-52],[dir*30,-62]]); ln([[0,-40],[-dir*14,-50],[-dir*2,-48]]);
    head(-dir*5,-50); persona(-dir*5,-50,-42);
  } else if(id==='pose_sit'){
    const nod=Math.sin(t*2.4)*1.5;
    ln([[0,-6],[12,-10],[24,-2]]); ln([[0,-6],[10,-14],[22,-8]]);                 // legs out in front
    ln([[0,-6],[-6,-26]]); ln([[-6,-24],[-14,-12],[-16,-2]]); ln([[-6,-24],[2,-18],[8,-12]]);
    head(-8,-36+nod); persona(-8,-36+nod,-26);
  } else if(id==='pose_flip'){
    const cyc=1.6, ph=(t%cyc)/cyc;
    if(ph<0.55){ const q=ph/0.55, h=Math.sin(q*Math.PI)*24; c.translate(0,-30-h); c.rotate(-q*Math.PI*2); c.translate(0,30);
      ln([[-6,-6],[0,-22],[6,-6]]); ln([[0,-22],[0,-42]]); ln([[-12,-30],[0,-38],[12,-30]]); head(0,-52); persona(0,-52,-42); }
    else { const k=Math.sin(t*6)*3; ln([[-8,0],[0,-22],[8,0]]); ln([[0,-22],[0,-42]]); ln([[-18,-56-k],[0,-38],[18,-56+k]]); head(0,-52); persona(0,-52,-42); }
  } else if(id==='pose_cossack'){      // 코사크 댄스 (hopak): a deep squat, arms folded on the chest, the legs kicking out to the front in turns
    const sn=Math.sin(t*7), d=(sn>0)?1:-1, k=Math.abs(sn), hop=k*3; c.translate(0,-hop);
    const lo=-13;                                                                    // the hips stay low the whole time
    ln([[0,lo],[-d*8,lo+6],[-d*5,0]]);                                              // the leg that holds the weight
    ln([[0,lo],[d*9,lo+1],[d*10+d*18*k,lo+2-k*2]]);                                  // the kicking leg flies out straight in front
    ln([[0,lo],[1,-34]]);                                                            // the back stays straight
    ln([[-10,-29],[0,-32],[10,-29]]); ln([[10,-29],[1,-27],[-9,-31]]);              // arms folded across the chest
    head(1,-45); persona(1,-45,-36);
    c.save(); c.shadowBlur=0; c.globalAlpha=0.35*k; for(let i=0;i<3;i++){ ln([[d*(14+i*6)+d*10,lo+8-i*3],[d*(18+i*6)+d*10,lo+8-i*3]]); } c.restore();
  } else if(id==='pose_levitate'){      // 공중 부양: cross-legged, floating, with orbs circling the body
    const fl=Math.sin(t*1.8)*4+10;
    c.save(); c.shadowBlur=0; c.globalAlpha=Math.max(0.1,0.34-fl*0.012); c.beginPath(); c.ellipse(0,2,20-fl*0.4,4,0,0,7); c.fill(); c.restore();
    c.translate(0,-fl);
    ln([[-14,-8],[0,-13],[14,-8]]); ln([[-12,-14],[2,-9],[13,-15]]);
    ln([[0,-13],[0,-40]]); ln([[0,-36],[-15,-28],[-9,-17]]); ln([[0,-36],[15,-28],[9,-17]]);
    head(0,-50); persona(0,-50,-40);
    c.save(); c.shadowBlur=0; c.globalCompositeOperation='lighter'; c.lineWidth=2; c.globalAlpha=0.6+0.3*Math.sin(t*3); c.beginPath(); c.ellipse(0,-66,11,3,0,0,7); c.stroke(); c.restore();
    c.save(); c.shadowBlur=10; for(let i=0;i<4;i++){ const a=t*1.7+i*1.571, depth=Math.sin(a); c.globalAlpha=0.55+0.4*depth; c.beginPath(); c.arc(Math.cos(a)*30,-28+depth*8,2.4+depth*0.8,0,7); c.fill(); } c.restore();
  } else if(id==='pose_trophy'){        // 챔피언 트로피: a golden cup held high, sparkling
    const bob=Math.abs(Math.sin(t*3))*2; c.scale(0.9,0.9); c.translate(0,-bob);
    ln([[-8,0],[0,-22],[8,0]]); ln([[0,-22],[0,-42]]);
    ln([[0,-40],[-14,-56],[-6,-72]]); ln([[0,-40],[14,-56],[6,-72]]);
    head(0,-52); persona(0,-52,-42);
    c.save(); c.shadowColor='#ffd34d'; c.shadowBlur=14; c.fillStyle='#ffd34d'; c.strokeStyle='#fff3b0'; c.lineWidth=1.5; c.lineJoin='round';
    c.translate(0,-10); c.beginPath(); c.moveTo(-10,-86); c.lineTo(10,-86); c.quadraticCurveTo(9,-74,3,-70); c.lineTo(3,-67); c.lineTo(7,-67); c.lineTo(7,-63); c.lineTo(-7,-63); c.lineTo(-7,-67); c.lineTo(-3,-67); c.lineTo(-3,-70); c.quadraticCurveTo(-9,-74,-10,-86); c.closePath(); c.fill(); c.stroke();
    c.lineWidth=2; c.beginPath(); c.arc(-11,-80,5,Math.PI*0.5,Math.PI*1.5); c.stroke(); c.beginPath(); c.arc(11,-80,5,-Math.PI*0.5,Math.PI*0.5); c.stroke();
    c.shadowBlur=0; c.fillStyle='#fff'; for(let i=0;i<6;i++){ const a=t*2+i*1.047, r=20+7*Math.sin(t*3+i), sx=Math.cos(a)*r, sy=-76+Math.sin(a)*r*0.7, sz=2+1.5*Math.abs(Math.sin(t*5+i*2)); c.fillRect(sx-sz,sy-0.7,2*sz,1.4); c.fillRect(sx-0.7,sy-sz,1.4,2*sz); }
    c.restore();
  } else if(id==='pose_taunt'){
    // 약 올리기, a 4.5s loop of three taunts: 메롱 with both hands on the nose and the tongue out -> back turned, shaking and slapping his behind -> rolling on the floor laughing
    const cyc=4.5, ph=t%cyc, sb=c.shadowBlur;
    const pop=(e,x,y,sz,a)=>{ c.save(); c.shadowBlur=0; c.globalAlpha=Math.max(0,Math.min(1,a)); c.font=sz+'px sans-serif'; c.textAlign='center'; c.textBaseline='middle'; c.fillText(e,x,y); c.restore(); };
    const fingers=(x,y,dir,w)=>{ const lw=c.lineWidth; c.lineWidth=lw*0.45; for(let i=0;i<4;i++){ const a=-1.2+i*0.6+Math.sin(t*22+i*1.3)*0.3*w; ln([[x,y],[x+dir*Math.cos(a)*8,y+Math.sin(a)*8]]); } c.lineWidth=lw; };
    if(ph<1.6){                                                                      // 1) 메롱: hop on one leg, hands fanned off the nose, tongue wagging
      const q=ph/1.6, hop=Math.abs(Math.sin(t*9))*5, sway=Math.sin(t*9)*2; c.translate(sway,-hop);
      const kick=Math.sin(t*9)*6;
      ln([[-7,0],[0,-22],[10+kick,-8]]); ln([[0,-22],[2,-42]]);
      head(2,-52); persona(2,-52,-42);
      ln([[2,-40],[14,-42],[13,-51]]); ln([[2,-40],[22,-36],[24,-50]]);           // thumb on the nose, the other hand's thumb on the first hand's little finger
      fingers(13,-51,1,1); fingers(24,-50,1,1.4);
      c.save(); c.shadowBlur=0; c.fillStyle='#ff6b9a'; const tl=4+Math.abs(Math.sin(t*14))*4; c.strokeStyle='#7a1838'; c.lineWidth=1; c.beginPath(); c.ellipse(5,-44+tl*0.4,3,tl*0.6,0.35,0,7); c.fill(); c.stroke(); c.restore();
      pop('😝', -20, -66-q*10, 13, Math.min(1,q*4));
      pop('♪', 30+Math.sin(t*5)*3, -70-((t*30)%20), 10, 1-((t*1.5)%1));
    } else if(ph<3.1){                                                               // 2) back turned, bent over, behind shaking, slapping it
      const q=(ph-1.6)/1.5, w=Math.sin(t*16)*5, slap=Math.max(0,Math.sin(t*8));
      c.save(); c.translate(w*0.6,0);
      ln([[-8,0],[w*0.3,-22],[8,0]]);
      ln([[w*0.3,-22],[-14,-36]]); head(-20,-46); persona(-20,-46,-36);
      c.beginPath(); c.arc(w*0.3+6,-25,6.5,Math.PI*1.1,Math.PI*2.4); c.stroke(); c.beginPath(); c.arc(w*0.3+6,-17,6.5,Math.PI*1.6,Math.PI*2.9); c.stroke();
      ln([[-14,-36],[-6,-26],[w*0.3+6+slap*5,-24-slap*6]]); ln([[-14,-36],[-20,-26],[-18,-14]]);
      if(slap>0.85){ c.save(); c.shadowBlur=0; c.globalAlpha=0.8; for(let i=0;i<3;i++){ const a=-0.6+i*0.6; ln([[w*0.3+16+Math.cos(a)*3,-22+Math.sin(a)*8],[w*0.3+22+Math.cos(a)*6,-22+Math.sin(a)*12]]); } c.restore(); }
      c.restore();
      pop('🍑', 22, -34+Math.sin(t*16)*2, 11, Math.min(1,q*5));
      pop('😜', -30, -62-Math.sin(t*3)*3, 12, Math.min(1,q*5));
    } else {                                                                         // 3) on the floor, legs kicking, fist pounding the ground, laughing
      const q=(ph-3.1)/1.4, shake=Math.sin(t*30)*1.5, k=Math.sin(t*12)*7, pound=Math.max(0,Math.sin(t*10));
      ln([[0,-6],[8,-16+k],[14,-26+k]]); ln([[0,-6],[10,-12-k],[18,-18-k]]);
      ln([[0,-6],[-20,-7+shake]]); head(-29,-9+shake); persona(-29,-9+shake,-5);
      ln([[-14,-7+shake],[-8,-14],[-2,-10]]);                                        // holding his belly
      ln([[-16,-7+shake],[-23,-16+pound*6],[-19,-2-(1-pound)*12]]);
      if(pound>0.95){ c.save(); c.shadowBlur=0; c.globalAlpha=0.7; ln([[-26,0],[-30,-4]]); ln([[-14,0],[-10,-4]]); c.restore(); }
      for(let i=0;i<3;i++){ const r=((q*1.4+i*0.33)%1); pop('🤣', -26+i*16, -24-r*42, 10+i*2, 1-r); }
    }
    c.shadowBlur=sb;
  }
}
function drawLosePose(c, t, wid, tint){
  const HEADR=9, ln=(pts)=>{ c.beginPath(); c.moveTo(pts[0][0],pts[0][1]); for(let i=1;i<pts.length;i++) c.lineTo(pts[i][0],pts[i][1]); c.stroke(); };
  const sw=Math.sin(t*1.6)*2.5, sg=Math.max(0,Math.sin(t*0.9))*2;            // a slow sway and now and then a sigh
  ln([[-7,0],[2,-20],[9,0]]);                                                        // legs
  ln([[2,-20],[12+sw*0.3,-37+sg*0.4]]);                                              // the back leans forward
  ln([[11+sw*0.3,-35],[8+sw,-20],[10+sw*1.4,-8]]); ln([[11+sw*0.3,-35],[15-sw,-21],[14-sw*1.2,-9]]);   // arms hang down
  const hx=16+sw*0.3, hy=-42+sg;
  c.beginPath(); c.arc(hx,hy,HEADR,0,7); c.fill();
  if(wid && WEAPON_PERSONA_NAME[wid]){ const sb0=c.shadowBlur; c.shadowBlur=0; try{ drawWeaponPersona(c,wid,hx,hy,HEADR,hy+10,tint); }catch(e){} c.shadowBlur=sb0; }
  const dr=(t*1.2)%1; c.save(); c.globalAlpha=0.7*(1-dr); c.fillStyle='#8fd3ff'; c.beginPath(); c.arc(hx+8,hy+4+dr*16,2,0,7); c.fill(); c.restore();    // a tear
}
function spawnKillEffect(e, x, y, addP, burst, shakeFrom){
  const k=e.k, R=Math.random;
  addP({x:x,y:y,life:.22,color:'#ffffff',shape:'flash',size:200}); addP({x:x,y:y,life:.7,color:'#ffffff',shape:'ring',r0:8,r1:260,lw:7}); shakeFrom(x,y,6,350);   // (every kill effect starts with a flash and a wide ring so it is seen)
  const floaters=(txt,n,col,out)=>{ for(let i=0;i<n;i++) addP({x:x+(R()-.5)*60, y:y, vx:(R()-.5)*90, vy:-70-R()*120, drag:.7, life:1.1+R()*.5, size:18+R()*12, color:col, outline:out, shape:'text', add:false, text:txt}); };
  if(k==='kfx_confetti'){ burst(x,y,44,{a0:0,a1:6.28,s0:120,s1:640,l0:.9,l1:1.6,z0:4,z1:8,colors:['#ff5f5f','#ffd34d','#5fff8a','#4dd9ff','#c17bff','#ff8fd9'],grav:700,drag:1.1,shape:'square',add:false}); addP({x:x,y:y,life:.4,color:'#ffffff',shape:'ring',r0:6,r1:140,lw:5}); }
  else if(k==='kfx_hearts'){ floaters('❤',10,'#ff7bb8','#7a1d4a'); addP({x:x,y:y,life:.45,color:'#ff9bd0',shape:'ring',r0:6,r1:120,lw:5}); burst(x,y,16,{a0:0,a1:6.28,s0:80,s1:360,l0:.5,l1:.9,z0:2,z1:4,colors:['#ff7bb8','#ffffff'],grav:-80,drag:1.5}); }
  else if(k==='kfx_skull'){ floaters('💀',4,'#ffffff','#222222'); burst(x,y,14,{a0:-2.6,a1:-0.5,s0:30,s1:170,l0:1.0,l1:1.7,z0:12,z1:26,colors:['#6b6b70','#3c3c44'],grav:-50,drag:1.3,shape:'smoke',add:false}); addP({x:x,y:y,life:.4,color:'#8a8f99',shape:'ring',r0:6,r1:100,lw:5}); }
  else if(k==='kfx_lightning'){ addP({x:x,y:y,life:.25,color:'#ffffff',shape:'flash',size:240}); addP({x:x,y:y,life:.5,color:'#9fc2ff',shape:'ring',r0:8,r1:200,lw:8}); burst(x,y,34,{a0:0,a1:6.28,s0:300,s1:980,l0:.3,l1:.7,z0:2,z1:4,colors:['#ffffff','#9fc2ff','#ffe56b'],drag:1.8,shape:'streak'}); shakeFrom(x,y,10,600); }
  else if(k==='kfx_flame'){ addP({x:x,y:y,life:.3,color:'#fff0b8',shape:'flash',size:170}); burst(x,y,24,{a0:0,a1:6.28,s0:50,s1:330,l0:.5,l1:1.0,z0:8,z1:18,colors:['#ff5a1f','#ff9b2e','#ffd34d'],grav:-120,drag:2.4,shape:'fire'}); addP({x:x,y:y,life:.6,color:'#ff6b2c',shape:'ring',r0:6,r1:150,lw:6}); }
  else if(k==='kfx_coins'){ floaters('🪙',12,'#ffd34d','#7a5a00'); burst(x,y,22,{a0:-3.3,a1:0.15,s0:200,s1:620,l0:.8,l1:1.4,z0:3,z1:5,colors:['#ffd34d','#fff3b0'],grav:900,drag:.6}); }
  else if(k==='kfx_stars'){ floaters('⭐',10,'#ffe066','#8a6d00'); burst(x,y,26,{a0:0,a1:6.28,s0:150,s1:520,l0:.5,l1:1.0,z0:2,z1:4,colors:['#ffe066','#ffffff','#ffb347'],grav:200,drag:1.3,shape:'streak'}); addP({x:x,y:y,life:.45,color:'#ffe066',shape:'ring',r0:6,r1:150,lw:6}); }
  else if(k==='kfx_split'){ const vc=e.vc||'#ffffff'; const part=(dx,dy,vx,vy,len,head)=>addP({x:x+dx,y:y+dy,vx:vx+(R()-.5)*60,vy:vy,grav:1500,drag:.5,life:1.5+R()*.4,size:len,color:vc,shape:'limb',head:!!head,add:false,rot:R()*6.28,vr:(R()-.5)*16});
    part(0,-24,(R()-.5)*160,-520,11,true); part(0,-4,(R()-.5)*120,-300,26); part(-8,-8,-330,-420,20); part(8,-8,330,-420,20); part(-5,14,-180,-260,22); part(5,14,180,-260,22);
    burst(x,y,16,{a0:0,a1:6.28,s0:120,s1:420,l0:.4,l1:.8,z0:2,z1:4,colors:['#d62839','#ff5f5f',vc],grav:900,drag:1,add:false}); }
  else if(k==='kfx_petals'){ floaters('🌸',9,'#ffb3d1','#7a1d4a'); addP({x:x,y:y,life:.5,color:'#ffc4dd',shape:'ring',r0:8,r1:150,lw:5});
    for(let i=0;i<34;i++){ const a=R()*6.28, sp=60+R()*260; addP({x:x,y:y,vx:Math.cos(a)*sp+90,vy:Math.sin(a)*sp*.7-60,grav:160,drag:1.6,life:1.1+R()*.9,size:4+R()*4,color:['#ffb3d1','#ffd9e8','#ff8fb8','#ffffff'][i%4],shape:'square',add:false,rot:R()*6,vr:(R()-.5)*10}); } }
  else if(k==='kfx_bats'){ floaters('🦇',9,'#b388ff','#1a0b2e'); addP({x:x,y:y,life:.5,color:'#1a0b2e',shape:'flash',size:150,add:false}); addP({x:x,y:y,life:.55,color:'#b388ff',shape:'ring',r0:8,r1:170,lw:5});
    for(let i=0;i<10;i++){ const a=-3.14*R(), sp=260+R()*320; addP({x:x,y:y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,drag:1.2,life:.8+R()*.5,size:16+R()*8,color:'#b388ff',outline:'#1a0b2e',shape:'text',add:false,text:'🦇'}); }
    burst(x,y,18,{a0:0,a1:6.28,s0:80,s1:300,l0:.6,l1:1.1,z0:8,z1:16,colors:['#2a1146','#4a2a7a'],grav:-40,drag:1.5,shape:'smoke',add:false}); }
  else if(k==='kfx_poison'){ floaters('☠️',3,'#c6ff3d','#1c2a05'); addP({x:x,y:y,life:.6,color:'#8dff7c',shape:'ring',r0:8,r1:190,lw:6});
    burst(x,y,26,{a0:0,a1:6.28,s0:40,s1:230,l0:1.0,l1:1.9,z0:12,z1:26,colors:['#5fbf3a','#8dff7c','#3d7a22'],grav:-30,drag:1.5,shape:'smoke',add:false});
    burst(x,y,22,{a0:-2.9,a1:-0.24,s0:120,s1:420,l0:.6,l1:1.2,z0:3,z1:6,colors:['#c6ff3d','#8dff7c'],grav:520,drag:.8}); }
  else if(k==='kfx_slash'){ addP({x:x,y:y,life:.3,color:'#ffffff',shape:'flash',size:230});
    for(const [dx,dy] of [[1,1],[1,-1]]) addP({x:x-dx*150,y:y-dy*110,x2:x+dx*150,y2:y+dy*110,life:.32,color:'#ffffff',shape:'slash',size:9});
    setTimeout(()=>{ for(const [dx,dy] of [[1,1],[1,-1]]) addP({x:x-dx*170,y:y-dy*125,x2:x+dx*170,y2:y+dy*125,life:.4,color:'#ff5d5d',shape:'slash',size:5}); burst(x,y,34,{a0:0,a1:6.28,s0:300,s1:900,l0:.3,l1:.6,z0:2,z1:4,colors:['#ffffff','#ff5d5d','#ffd34d'],drag:2,shape:'streak'}); shakeFrom(x,y,10,500); },110); }
  else if(k==='kfx_pixel'){ const vc=e.vc||'#4dd9ff'; addP({x:x,y:y,life:.5,color:'#4dd9ff',shape:'ring',r0:8,r1:160,lw:5});
    for(let i=0;i<46;i++){ const gx=((i%6)-2.5)*9, gy=-Math.floor(i/6)*9; addP({x:x+gx,y:y+gy+20,vx:gx*(6+R()*8),vy:-140-R()*260+gy*2,grav:620,drag:.7,life:.9+R()*.7,size:7,color:[vc,'#4dd9ff','#c17bff','#5fff8a','#ffffff'][i%5],shape:'square',add:false,rot:0,vr:0}); } }
  else if(k==='kfx_ghost'){ addP({x:x,y:y,life:.4,color:'#e8f4ff',shape:'flash',size:190}); addP({x:x,y:y,life:1.2,color:'#cfe6ff',shape:'pillar'});
    addP({x:x,y:y-10,vx:0,vy:-120,drag:.5,life:1.7,size:46,color:'#ffffff',outline:'#3a4a66',shape:'text',add:false,text:'👻'});
    for(let i=0;i<4;i++) addP({x:x+(R()-.5)*90,y:y+(R()-.5)*30,vx:(R()-.5)*70,vy:-80-R()*90,drag:.6,life:1.2+R()*.5,size:16+R()*8,color:'#ffffff',outline:'#3a4a66',shape:'text',add:false,text:'👻'});
    burst(x,y,22,{a0:-2.6,a1:-0.54,s0:40,s1:200,l0:.9,l1:1.6,z0:8,z1:18,colors:['#cfe6ff','#ffffff','#9fc2ff'],grav:-90,drag:1.4,shape:'smoke'}); }
  else if(k==='kfx_tornado'){ addP({x:x,y:y,life:.6,color:'#dfe9f5',shape:'ring',r0:8,r1:200,lw:6});
    for(let j=0;j<5;j++) setTimeout(()=>{ for(let i=0;i<12;i++){ const a=i/12*6.28+j*.7, rr=18+j*13, sp=260+j*50; addP({x:x+Math.cos(a)*rr,y:y-j*22+Math.sin(a)*rr*.35,vx:-Math.sin(a)*sp,vy:Math.cos(a)*sp*.35-90,drag:2.2,life:.45+R()*.25,size:2.5+R()*2,color:i%3?'#dfe9f5':'#9fb4cc',shape:'streak'}); }
      addP({x:x,y:y-j*22,life:.4,color:'#dfe9f5',shape:'ring',r0:6,r1:30+j*16,lw:3}); },j*70);
    burst(x,y,14,{a0:-2.8,a1:-0.34,s0:60,s1:220,l0:.7,l1:1.2,z0:8,z1:16,colors:['#b9c4d4','#8794a8'],grav:-60,drag:1.5,shape:'smoke',add:false}); shakeFrom(x,y,8,450); }
  else if(k==='kfx_firework'){ const cols=[['#ff5f5f','#ffd34d'],['#4dd9ff','#ffffff'],['#c17bff','#ff8fd9'],['#5fff8a','#ffd34d']];
    addP({x:x,y:y,vx:0,vy:-520,drag:1.6,life:.32,size:4,color:'#fff3b0',shape:'streak'});
    [[0,-130,320],[-90,-70,480],[95,-85,620],[10,-170,800]].forEach(([dx,dy,ms],i)=>setTimeout(()=>{ const c=cols[i%cols.length];
      addP({x:x+dx,y:y+dy,life:.25,color:'#ffffff',shape:'flash',size:150}); addP({x:x+dx,y:y+dy,life:.6,color:c[0],shape:'ring',r0:6,r1:150,lw:5});
      burst(x+dx,y+dy,36,{a0:0,a1:6.28,s0:160,s1:520,l0:.7,l1:1.3,z0:2,z1:4,colors:[c[0],c[1],'#ffffff'],grav:260,drag:1.7,shape:'streak'}); if(i===3) shakeFrom(x,y,8,500); },ms)); }
  else if(k==='kfx_blackhole'){        // 블랙홀: a ring and streaks are sucked into a dark core, then it bursts
    addP({x:x,y:y,life:.9,color:'#12041f',shape:'flash',size:130,add:false});
    for(let i=0;i<34;i++){ const a=R()*6.28, d=140+R()*130, sp=d/0.5; addP({x:x+Math.cos(a)*d,y:y+Math.sin(a)*d,vx:-Math.cos(a)*sp,vy:-Math.sin(a)*sp,life:.5,size:2.5+R()*3,color:['#b388ff','#7a5cff','#ff8fd9','#ffffff'][i%4],shape:'streak'}); }
    addP({x:x,y:y,life:.5,color:'#7a5cff',shape:'ring',r0:250,r1:8,lw:6}); addP({x:x,y:y,life:.5,color:'#ff8fd9',shape:'ring',r0:170,r1:6,lw:4});
    setTimeout(()=>{ addP({x:x,y:y,life:.35,color:'#ffffff',shape:'flash',size:300}); addP({x:x,y:y,life:.7,color:'#d9c4ff',shape:'ring',r0:10,r1:360,lw:10}); addP({x:x,y:y,life:.55,color:'#7a5cff',shape:'ring',r0:6,r1:230,lw:7});
      burst(x,y,44,{a0:0,a1:6.28,s0:240,s1:900,l0:.45,l1:.9,z0:2,z1:4.5,colors:['#ffffff','#b388ff','#7a5cff','#ff8fd9'],drag:1.9,shape:'streak'}); shakeFrom(x,y,14,700); },480); }
  else if(k==='kfx_phoenix'){          // 불사조 승천: a pillar of fire, two wings of embers, rising feathers
    addP({x:x,y:y,life:.4,color:'#fff0b8',shape:'flash',size:270}); addP({x:x,y:y,life:1.1,color:'#ff8a2b',shape:'pillar'});
    burst(x,y,46,{a0:-2.5,a1:-0.64,s0:120,s1:560,l0:.7,l1:1.5,z0:6,z1:15,colors:['#ff3b1f','#ff9b2e','#ffd34d','#fff0b8'],grav:-260,drag:1.6,shape:'fire'});
    for(const side of [-1,1]) for(let j=0;j<9;j++){ const ang=0.15+j*0.17, sp=420+j*36; addP({x:x,y:y-10,vx:side*Math.cos(ang)*sp,vy:-Math.sin(ang)*sp*0.9,life:.55+j*0.02,size:3.4,color:j%2?'#ffd34d':'#ff9b2e',shape:'streak',drag:1.2}); }
    addP({x:x,y:y,life:.6,color:'#ffd34d',shape:'ring',r0:8,r1:240,lw:8}); floaters('🪶',8,'#ffd34d','#7a3b00'); shakeFrom(x,y,9,500);
    setTimeout(()=>{ addP({x:x,y:y-60,life:.45,color:'#ff9b2e',shape:'ring',r0:6,r1:200,lw:6}); burst(x,y-40,26,{a0:-2.8,a1:-0.34,s0:200,s1:620,l0:.6,l1:1.2,z0:4,z1:10,colors:['#ffd34d','#fff0b8','#ff6b2c'],grav:-180,drag:1.5,shape:'fire'}); },300); }
  else if(k==='kfx_ice'){ addP({x:x,y:y,life:.3,color:'#e8f8ff',shape:'flash',size:170}); burst(x,y,30,{a0:0,a1:6.28,s0:160,s1:620,l0:.6,l1:1.1,z0:3,z1:6,colors:['#9fe8ff','#ffffff','#5fd0ff'],grav:500,drag:1.2,shape:'streak'}); addP({x:x,y:y,life:.5,color:'#9fe8ff',shape:'ring',r0:6,r1:170,lw:7}); floaters('❄️',5,'#bfefff','#2a6f8a'); }
}
const NEW_SKIN_PRICE=2000, TIER_SKIN_TIERS=['다이아','그랜드 마스터 I'];
const NEW_SKINS=[
  ['pistol','네온 스파이 타이','#00e5ff','glow'],
  ['smg','홀로그램 고글','#b388ff','glow'],
  ['bow','벚꽃 요정 후드','#ff9ecb','sparkle'],
  ['sword','서리 왕의 투구','#aee6ff','frost'],
  ['bat','레트로 네온 캡','#ff2bd6','glow'],      // (replaced by the 감자튀김 선수 concept skin right after the loop)
  ['boomerang','정글 탐험가 모자','#4caf50','sparkle'],
  ['shuriken','벚꽃 닌자 두건','#ff8fb8','sparkle'],
  ['shotgun','사이버 카우보이 햇','#00ffa3','glow'],
  ['rifle','도시 야간 위장모','#6c7a89','glow'],
  ['gloves','오로라 헤드기어','#8affc1','glow'],
  ['grenade','레이저 고글','#ff3d71','glow'],
  ['bazooka','팬텀 스텔스 마스크','#5c6bc0','glow'],
  ['dagger','불꽃 삿갓','#ff7043','flame'],
  ['magiccard','크리스마스 실크햇','#e53935','sparkle'],
  ['dracula','블러드 문 망토','#b71c1c','glow'],
  ['gambler','카지노 로열 바이저','#ffca28','sparkle'],
  ['puppeteer','무대 위 꼭두각시 모자','#ff9ecb','sparkle'],
  ['wizard','은하수 마법사 모자','#5c7cff','sparkle'],
  ['flamethrower','화염 전사 방독면','#ff6d00','flame'],
  ['portalgun','네온 포털 고글','#00e676','glow'],
  ['vacuum','터보 청소부 반다나','#26c6da','glow'],
  ['pirate','유령선 선장 모자','#7ef0e8','glow'],
  ['samurai','달빛 무사 투구띠','#bfe3ff','glow'],
  ['lightsaber','은하 수도승 후드','#e0c9a6','glow'],
  ['horemheb','청금석 왕의 두건','#1f8fd6','glow'],
  ['kurus','심연의 별빛 두건','#3d2b8f','glow'],
  ['pizarro','황금 약탈자의 투구','#ffd34d','sparkle']
];
const TIER_SKINS=[
  ['pistol',['크리스탈 타이','#7bf3ff','sparkle'],['오로라 빛의 타이','#5cffb8','sparkle']],
  ['smg',['네온 사이버 고글','#39ff14','glow'],['오로라 빛줄기 헤드셋','#5cf0ff','sparkle']],
  ['bow',['서리 숲의 후드','#8fe3ff','frost'],['오로라 숲의 후드','#9a8cff','sparkle']],
  ['sword',['수정 기사 투구','#7bf3ff','sparkle'],['극광 기사 투구','#ff8cf0','sparkle']],
  ['bat',['다이아 올스타 캡','#7bf3ff','sparkle'],['북극광 홈런 캡','#5cffb8','sparkle']],
  ['boomerang',['오로라 부시햇','#7bffd0','glow'],['극광 부시햇','#5cf0ff','sparkle']],
  ['shuriken',['월광 두건','#c9d6ff','glow'],['오로라 그림자 두건','#9a8cff','sparkle']],
  ['shotgun',['크롬 스텟슨','#dfe9ff','sparkle'],['극광 보안관 스텟슨','#ff8cf0','sparkle']],
  ['rifle',['북극 위장모','#bfe9ff','frost'],['극지 오로라 방탄모','#5cffb8','sparkle']],
  ['gloves',['다이아 챔프 헤드기어','#7bf3ff','sparkle'],['극광 챔피언 헤드기어','#5cf0ff','sparkle']],
  ['grenade',['다이아몬드 고글','#7bf3ff','glow'],['오로라 별빛 고글','#9a8cff','sparkle']],
  ['bazooka',['메탈릭 방독면','#9fb4c8','glow'],['극광 방독면','#ff8cf0','sparkle']],
  ['dagger',['월야 삿갓','#9a85ff','void'],['오로라 달빛 삿갓','#5cffb8','sparkle']],
  ['magiccard',['다이아 실크햇','#7bf3ff','sparkle'],['오로라 마술사 실크햇','#5cf0ff','sparkle']],
  ['dracula',['진홍 달의 망토','#c1103a','glow'],['극광 백작의 망토','#9a8cff','sparkle']],
  ['gambler',['에메랄드 바이저','#2bff9a','glow'],['오로라 잭팟 바이저','#ff8cf0','sparkle']],
  ['puppeteer',['붉은 실의 광대 모자','#ff5c8a','glow'],['오로라 광대 모자','#5cffb8','sparkle']],
  ['wizard',['별빛 마법사 모자','#7bf3ff','sparkle'],['오로라 대마법사 모자','#5cf0ff','sparkle']],
  ['vacuum',['크리스탈 반다나','#7bf3ff','sparkle'],['극광 청소왕 반다나','#9a8cff','sparkle']],
  ['portalgun',['차원 균열 고글','#39ff14','electric'],['오로라 차원 고글','#ff8cf0','sparkle']],
  ['pirate',['해골 선장 모자','#e8e8e8','sparkle'],['오로라 해적왕 모자','#5cffb8','sparkle']],
  ['samurai',['벚꽃 무사 투구띠','#ff9ad5','sparkle'],['극광 쇼군 투구띠','#5cf0ff','sparkle']],
  ['flamethrower',['용암 방독면','#ff7a2b','flame'],['오로라 극지 방독면','#9a8cff','sparkle']],
  ['lightsaber',['청광 수호자 후드','#7bf3ff','sparkle'],['오로라 수호자 후드','#ff8cf0','sparkle']],
  ['horemheb',['태양신 라의 두건','#ffc93c','sparkle'],['오로라 신성 두건','#5cffb8','sparkle']],
  ['kurus',['자수정 늪의 두건','#b47bff','void'],['오로라 밤하늘 두건','#5cf0ff','sparkle']],
  ['pizarro',['황금도시 정복자의 투구','#ffc93c','sparkle'],['오로라 황제 투구','#9a8cff','sparkle']]
];
for(const [ch,nm,tint,fx] of NEW_SKINS) COSMETICS['skin_'+ch+'_new']={cat:'skin', char:ch, name:nm, price:NEW_SKIN_PRICE, tint, fx, isNew:true};
COSMETICS.skin_pistol_s1={cat:'skin', char:'pistol', name:'오로라 총잡이', price:0, tint:'#7bf3ff', fx:'halo', lux:1, seasonOnly:true};      // (season pass only)
COSMETICS.skin_sword_s1={cat:'skin', char:'sword', name:'황금 시즌 기사', price:0, tint:'#ffd34d', fx:'crown', lux:2, seasonOnly:true};
// ---- 1.0 season pass: the six limited myth skins (never sold; the pass unlocks them one after the other)
COSMETICS.skin_tionis_janus ={cat:'skin', char:'tionis',    name:'야누스 티오니스', price:0, tint:'#f2f2f4', fx:'halo',    lux:3, seasonOnly:true, concept:'janus'};
COSMETICS.skin_grenade_envy ={cat:'skin', char:'grenade',   name:'질투의 폭발광',   price:0, tint:'#ffd34d', fx:'sparkle', lux:3, seasonOnly:true, concept:'envy'};
COSMETICS.skin_pistol_zeus  ={cat:'skin', char:'pistol',    name:'신 중의 신 제임스', price:0, tint:'#cfe9ff', fx:'halo',  lux:3, seasonOnly:true, concept:'zeus'};
COSMETICS.skin_gloves_gilga ={cat:'skin', char:'gloves',    name:'길가메시 복서',   price:0, tint:'#ffc93c', fx:'crown',   lux:3, seasonOnly:true, concept:'gilga'};
COSMETICS.skin_sword_thor   ={cat:'skin', char:'sword',     name:'토르 기사',       price:0, tint:'#cfd8e8', fx:'frost',   lux:3, seasonOnly:true, concept:'thor'};
COSMETICS.skin_horemheb_poseidon={cat:'skin', char:'horemheb', name:'포세이돈 호렘헵', price:0, tint:'#2fa8e8', fx:'halo', lux:3, seasonOnly:true, concept:'poseidon'};      // 시즌 패스 마지막 단계(60)
COSMETICS.skin_boomerang_odin={cat:'skin', char:'boomerang', name:'사냥꾼 오딘',     price:0, tint:'#ffd34d', fx:'halo',    lux:3, seasonOnly:true, concept:'odin'};
for(const [ch,a,b] of TIER_SKINS) [a,b].forEach((s,i)=>{ COSMETICS['skin_'+ch+'_t'+(i+1)]={cat:'skin', char:ch, name:s[0], price:0, tint:s[1], fx:s[2], tier:TIER_SKIN_TIERS[i], lux:(i===1?4:1)}; });
const PREMIUM_SKIN_PRICE=4000;      // one 4000 G skin per character: the last cards of the skin tab
const PREMIUM_SKINS=[
  ['puppeteer','심야 인형극장의 모자','#7a3cff','void'], ['pizarro','태양의 정복자 투구','#ffb02e','flame'], ['kan','비취 뱀신의 깃털관','#2bffb0','halo'],
  ['horemheb','황금 매의 두건','#ffd34d','crown'], ['lightsaber','쌍성 수호자 후드','#9a85ff','electric'], ['pistol','다이아 요원 타이','#bff6ff','sparkle'],
  ['smg','블랙아웃 작전 고글','#ff3b5c','electric'], ['bow','달빛 궁수의 후드','#d9e4ff','frost'], ['sword','성검 기사단 투구','#fff1a8','halo'],
  ['bat','월드시리즈 캡','#ff7a2b','crown'], ['boomerang','사막 폭풍 부시햇','#e0b060','flame'], ['shuriken','천둥 닌자 두건','#62e6ff','electric'],
  ['shotgun','무법자의 검은 스텟슨','#2a2a33','void'], ['rifle','특전사 야간 방탄모','#3fe07a','glow'], ['gloves','세계 챔피언 헤드기어','#ffd34d','crown'],
  ['grenade','불꽃놀이 고글','#ff5fd2','sparkle'], ['bazooka','강철 거신 방독면','#9fb4c8','electric'], ['dagger','그림자 연꽃 삿갓','#c17bff','void'],
  ['magiccard','무대 거장의 실크햇','#ffd34d','sparkle'], ['dracula','핏빛 백작의 망토','#ff2b4a','void'], ['gambler','다이아 잭팟 바이저','#7bf3ff','crown'],
  ['wizard','성운 대현자의 모자','#5c7cff','halo'], ['flamethrower','태양 용광로 방독면','#ffe14d','flame'], ['portalgun','다중우주 고글','#39ffd6','void'],
  ['vacuum','블랙홀 청소부 반다나','#1a1030','void'], ['pirate','심해 해적왕 모자','#2bc3ff','glow'], ['samurai','천하 통일 투구띠','#ff3b3b','crown'],
  ['kurus','칠흑 여왕의 두건','#b47bff','halo']
];
for(const [ch,nm,tint,fx] of PREMIUM_SKINS) COSMETICS['skin_'+ch+'_p']={cat:'skin', char:ch, name:nm, price:PREMIUM_SKIN_PRICE, tint, fx, lux:3, premium:true};
/* concept skins: not just another colour, a whole idea (concept = how the character's attacks and gear are drawn, see drawConceptProjectile / drawWeaponPersona) */
Object.assign(COSMETICS.skin_wizard_p, {name:'청룡의 마법사', tint:'#2bb8ff', fx:'halo', concept:'dragon'});
Object.assign(COSMETICS.skin_sword_p, {name:'황금의 기사', concept:'gold'});
Object.assign(COSMETICS.skin_kurus_p, {name:'꿈의 쿠루스', tint:'#9fe8ff', fx:'sparkle', concept:'dream'});
Object.assign(COSMETICS.skin_magiccard_p, {name:'우노 마술사', tint:'#e8252b', fx:'sparkle', concept:'uno'});
Object.assign(COSMETICS.skin_bat_new, {name:'감자튀김 선수', tint:'#ffd34d', fx:'sparkle', concept:'fry'});
Object.assign(COSMETICS.skin_bow_new, {name:'큐피트', tint:'#ff6fae', fx:'sparkle', concept:'cupid'});
COSMETICS.skin_shade_pink   ={cat:'skin', char:'shade',  name:'핑크 네온',        price:200,  tint:'#ff5ac8', concept:'nnpink',   isNew:true};      // 200 sC: the sword and chain glow pink
COSMETICS.skin_shade_plasma ={cat:'skin', char:'shade',  name:'플라즈마 네온',    price:1200, tint:'#b28cff', fx:'electric', concept:'nnplasma', isNew:true};      // 1200 sC: violet plasma with sparks round the head
COSMETICS.skin_shade_rain_p ={cat:'skin', char:'shade',  name:'하이퍼 레인보우 네온', price:3600, tint:'#ff6af0', fx:'halo', lux:3, premium:true, concept:'nnrain', isNew:true};      // 3600 sC: a sword whose colour runs through the whole rainbow, a halo and a light show
COSMETICS.skin_kadas_red    ={cat:'skin', char:'kadas',  name:'핏빛 악마',        price:200,  tint:'#ff2a4a', concept:'kdred',    isNew:true};      // 200 sC: crimson gun, wings and darkness
COSMETICS.skin_kadas_hell   ={cat:'skin', char:'kadas',  name:'지옥불 카다스',    price:1200, tint:'#ff8a2a', fx:'flame', concept:'kdhell',  isNew:true};      // 1200 sC: hellfire orange with flames round the head
COSMETICS.skin_kadas_void_p ={cat:'skin', char:'kadas',  name:'심연의 군주',      price:3600, tint:'#7a6cff', fx:'void', lux:3, premium:true, concept:'kdvoid', isNew:true};      // 3600 sC: a drifting deep-space violet, a void aura and a light show
COSMETICS.skin_kurus_diaper={cat:'skin', char:'kurus', name:'기저귀 쿠루스', price:3600, tint:'#7a4a1e', concept:'diaper'};      // owner 11-05: a baby in a diaper with a brown pile on his head; the flask is a thrown poo, the dark puddle is a murky brown one, and a smell rises from it
COSMETICS.skin_harald_baby={cat:'skin', char:'harald', name:'아기 카트 하랄드', price:3600, tint:'#ff8a7a', concept:'babycart', premium:true};      // 3600 sC: a small baby Harald in a shopping cart (cart in front, toy axe); only the look changes, the hitbox is the normal Harald's
COSMETICS.skin_dragonslayer_manga={cat:'skin', char:'dragonslayer', name:'만화가 용살자', price:2800, tint:'#ffffff', concept:'manga', premium:true};      // 2800 sC: a pen for the sword, a beret, dress shoes, ink instead of flame sparks, a paper plane instead of the dragon (look only)
COSMETICS.skin_flamethrower_br={cat:'skin', char:'flamethrower', name:'입냄새 학살자', price:4000, tint:'#9fb52a', fx:'sparkle', concept:'breath', premium:true};      // 4000 sC: no weapon, a stink cloud round the body, the attack is breath from the mouth, shield / skills in the same sickly green
Object.assign(COSMETICS.skin_pistol_new, {name:'바나나 제임스', price:1500, tint:'#ffe14d', fx:'sparkle', concept:'banana'});
/* 별빛 사과 skins (owner 11-02, an apology gift for one account): never sold, only given as a gift (gifts row). Drawn from a few cached little pictures, so it costs far less than the 그랜드 마스터 show. */
const STAR_TINT='#ff9ad5';
COSMETICS.skin_pistol_apology={cat:'skin', char:'pistol', name:'(한정판) 별빛 사과 제임스', price:0, tint:STAR_TINT, fx:'sparkle', lux:3, exclusive:true, concept:'starlight'};
/* filling the skin list of the characters that had few (2026-11-13): every playable character now has at least six */
for(const [id,ch,nm,price,tint,fx,x] of [
  ['skin_gardener','gardener','해바라기 밀짚모자',800,'#f2b81f'], ['skin_gardener_c','gardener','새싹 밀짚모자',300,'#7cc96a'],
  ['skin_gardener_new','gardener','벚꽃 정원 모자',2000,'#ff9ecb','sparkle',{isNew:true}], ['skin_gardener_p','gardener','황금 장미 정원사 모자',4000,'#ff4d6d','crown',{lux:3,premium:true}],
  ['skin_harald','harald','강철 늑대 투구',1000,'#4f5964'], ['skin_harald_c','harald','청동 바이킹 투구',300,'#b0793a'],
  ['skin_harald_new','harald','서리 거인 투구',2000,'#aee6ff','frost',{isNew:true}],
  ['skin_tionis','tionis','진홍 광대 조끼',1000,'#d0303a'], ['skin_tionis_c','tionis','풀빛 광대 조끼',300,'#3f9a3a'],
  ['skin_tionis_new','tionis','별밤 광대 조끼',2000,'#5c6bff','sparkle',{isNew:true}],
  ['skin_shade_c','shade','레몬 네온',300,'#ffe14d'], ['skin_kadas_c','kadas','잿빛 악마',300,'#8a8f9c'],
  ['skin_portalgun_m','portalgun','진홍 차원 고글',900,'#d0303a']
]) COSMETICS[id]=Object.assign({cat:'skin', char:ch, name:nm, price, tint}, fx?{fx}:{}, x||{});
for(const [ch,a,b] of [['gardener',['서리꽃 밀짚모자','#9fe8ff','frost'],['오로라 정원사 모자','#5cffb8','sparkle']],
  ['harald',['수정 전사 투구','#7bf3ff','sparkle'],['오로라 발할라 투구','#9a8cff','sparkle']],
  ['tionis',['수정 광대 조끼','#7bf3ff','sparkle'],['오로라 광대 조끼','#ff8cf0','sparkle']],
  ['shade',['수정 네온','#7bf3ff','sparkle'],['오로라 네온','#5cffb8','sparkle']],
  ['kadas',['자수정 악마','#b47bff','void'],['오로라 악마','#5cf0ff','sparkle']]])
  [a,b].forEach((s,i)=>{ COSMETICS['skin_'+ch+'_t'+(i+1)]={cat:'skin', char:ch, name:s[0], price:0, tint:s[1], fx:s[2], tier:TIER_SKIN_TIERS[i], lux:(i===1?4:1)}; });
/* ===== the character's own color in a match: plain colors are free, the shiny ones are bought (cat 'bcol', equipped as saveData.equipped.bcol, sent as cos.col) ===== */
[['red','빨강','#ff4d4d'],['mint','민트','#3fe0c5'],['yellow','노랑','#f5c94c'],['blue','파랑','#7c9eff'],['pink','분홍','#ff8fd9'],['lime','연두','#8dff7c'],
 ['orange','주황','#ff9d4d'],['purple','보라','#b98cff'],['sky','하늘','#4dd9ff'],['rose','장미','#ff6b9d'],['emerald','에메랄드','#6bffb3'],['white','하양','#eef1f6']]
  .forEach(([k,nm,col])=>{ COSMETICS['bcol_'+k]={cat:'bcol', name:nm, price:0, free:true, color:col}; });
COSMETICS.bcol_silver={cat:'bcol', name:'반짝이는 은색', price:2000, color:'#d4dae3', shine:'silver'};
COSMETICS.bcol_gold={cat:'bcol', name:'반짝이는 금색', price:2500, color:'#ffcf3a', shine:'gold'};
COSMETICS.bcol_rainbow={cat:'bcol', name:'무지개', price:4000, color:'#ff7ad9', shine:'rainbow'};
for(const [ch,nm,tint,fx] of [['sword','유령 기사 투구','#b86bff','glow'], ['pistol','영혼 수집가 중절모','#c9a0ff','void'], ['wizard','영혼 마법사 후드','#9a5cff','sparkle'],
  ['dracula','영혼 군주의 망토','#7a2cff','void'], ['bow','영혼 사냥 두건','#d6b3ff','frost'], ['kurus','영혼 늪의 두건','#e0c4ff','halo']])
  COSMETICS['skin_'+ch+'_soul']={cat:'skin', char:ch, name:nm, price:0, tint, fx};      // bought with souls (the purple currency), not gold
function bodyShineColor(id, now, seed){                                                                                         // the color of a shiny body right now
  const it=COSMETICS[id]; if(!it || !it.shine) return it ? it.color : null;
  const k=0.5+0.5*Math.sin(now/260+(seed||0));
  if(it.shine==='silver') return mixHex('#9aa4b2', '#ffffff', k);
  if(it.shine==='gold') return mixHex('#c98a10', '#fff3b0', k);
  return 'hsl('+(((now/7)+(seed||0)*40)%360).toFixed(0)+',100%,64%)';
}
function drawShineGlints(c, now, seed){                                                                                         // little white stars that flash along the body
  for(let i=0;i<3;i++){
    const ph=((now/650)+(seed||0)*0.13+i*0.37)%1, a=Math.sin(ph*Math.PI); if(a<0.2) continue;
    const x=(i===1?6:-5), y=-12-i*15, r=2+a*3;
    c.save(); c.globalAlpha=a; c.shadowBlur=0; c.fillStyle='#ffffff'; c.beginPath();
    c.moveTo(x,y-r); c.lineTo(x+r*0.3,y-r*0.3); c.lineTo(x+r,y); c.lineTo(x+r*0.3,y+r*0.3); c.lineTo(x,y+r); c.lineTo(x-r*0.3,y+r*0.3); c.lineTo(x-r,y); c.lineTo(x-r*0.3,y-r*0.3);
    c.closePath(); c.fill(); c.restore();
  }
}
function skinMotion(sid, t){
  const it=COSMETICS[sid]||{}, th=(it.lux>=4)?'aurora':(it.fx||'');
  if(it.concept==='starlight') return {dx:Math.sin(t*1.6)*2.4, dy:-6-Math.abs(Math.sin(t*2.2))*5, rot:Math.sin(t*1.6)*0.09};      // 별빛 사과: floats and sways like dancing
  switch(th){
    case 'flame': return {dx:Math.sin(t*23)*0.7, dy:-Math.abs(Math.sin(t*3.2))*3.5, rot:Math.sin(t*7)*0.035};
    case 'frost': return {dx:0, dy:Math.sin(t*1.5)*1.6, rot:Math.sin(t*0.8)*0.012};
    case 'electric': { const k=Math.floor(t*5), r1=Math.sin(k*91.7)*0.5+0.5, r2=Math.sin(k*47.3)*0.5+0.5; return {dx:(r1-0.5)*0.9, dy:-(r2>0.85?1:0), rot:(r2-0.5)*0.015}; }      // (a small, slow twitch: it used to shake like a fit)
    case 'void': return {dx:Math.sin(t*0.9)*2, dy:-7-Math.sin(t*1.8)*4, rot:Math.sin(t*1.1)*0.05};
    case 'halo': case 'crown': return {dx:0, dy:-Math.abs(Math.sin(t*1.2))*6, rot:Math.sin(t*1.2)*0.03};
    case 'aurora': return {dx:Math.sin(t*0.7)*2, dy:-5+Math.sin(t*1.4)*4, rot:Math.sin(t*0.9)*0.05};
    default: return {dx:Math.sin(t*2)*1.6, dy:Math.sin(t*4)*0.8, rot:Math.sin(t*2)*0.07};
  }
}
function drawSkinFx(c, fx, tint, hx, hy, r, now){      // a little effect around the head for the newer / tier skins
  if(!fx) return;
  const t=(now||0)/1000, col=tint||'#ffffff';
  c.save(); c.lineCap='round'; c.lineJoin='round';
  const glow=(rad,a)=>{ c.globalCompositeOperation='lighter'; const g=c.createRadialGradient(hx,hy,1,hx,hy,rad); g.addColorStop(0,hexA(col,a)); g.addColorStop(1,hexA(col,0)); c.fillStyle=g; c.beginPath(); c.arc(hx,hy,rad,0,7); c.fill(); c.globalCompositeOperation='source-over'; };
  const star=(x,y,s)=>{ c.beginPath(); c.moveTo(x-s,y); c.lineTo(x+s,y); c.moveTo(x,y-s); c.lineTo(x,y+s); c.moveTo(x-s*0.6,y-s*0.6); c.lineTo(x+s*0.6,y+s*0.6); c.moveTo(x-s*0.6,y+s*0.6); c.lineTo(x+s*0.6,y-s*0.6); c.stroke(); };
  switch(fx){
    case 'glow': glow(r*3.1, 0.42+0.1*Math.sin(t*3)); break;
    case 'sparkle': glow(r*2.4, 0.22); c.strokeStyle=hexA(col,0.95); c.lineWidth=1.3; for(let i=0;i<3;i++){ const a=t*1.8+i*2.094; star(hx+Math.cos(a)*r*2.1, hy+Math.sin(a)*r*1.5, 1.6+1.2*Math.abs(Math.sin(t*4+i))); } break;
    case 'flame': { glow(r*2.2, 0.25); for(let i=0;i<3;i++){ const fx0=hx+(i-1)*r*0.8, hgt=r*(1.3+0.7*Math.abs(Math.sin(t*9+i*2))), base=hy-r*0.9; const g=c.createLinearGradient(fx0,base,fx0,base-hgt); g.addColorStop(0,hexA('#ffe9a8',0.95)); g.addColorStop(0.5,hexA(col,0.85)); g.addColorStop(1,hexA(col,0)); c.fillStyle=g; c.beginPath(); c.moveTo(fx0-r*0.38,base); c.quadraticCurveTo(fx0-r*0.1,base-hgt*0.5,fx0+Math.sin(t*7+i)*1.4,base-hgt); c.quadraticCurveTo(fx0+r*0.1,base-hgt*0.5,fx0+r*0.38,base); c.closePath(); c.fill(); } break; }
    case 'frost': glow(r*2.6, 0.3); c.strokeStyle=hexA('#e6fbff',0.95); c.lineWidth=1.1; for(let i=0;i<2;i++){ const a=t*1.2+i*Math.PI, x=hx+Math.cos(a)*r*2.2, y=hy+Math.sin(a)*r*1.4; for(let k=0;k<3;k++){ const b=k*Math.PI/3+t; c.beginPath(); c.moveTo(x-Math.cos(b)*2.6,y-Math.sin(b)*2.6); c.lineTo(x+Math.cos(b)*2.6,y+Math.sin(b)*2.6); c.stroke(); } } break;
    case 'halo': { c.globalCompositeOperation='lighter'; c.strokeStyle=hexA(col,0.9); c.lineWidth=2.4; c.beginPath(); c.ellipse(hx,hy-r*2.1,r*1.35,r*0.4,0,0,7); c.stroke(); c.strokeStyle=hexA(col,0.3); c.lineWidth=5.5; c.beginPath(); c.ellipse(hx,hy-r*2.1,r*1.35,r*0.4,0,0,7); c.stroke(); break; }
    case 'crown': { const by=hy-r*1.15, w=r*1.2; c.fillStyle=col; c.strokeStyle='#fff6c8'; c.lineWidth=0.9; c.beginPath(); c.moveTo(hx-w,by); c.lineTo(hx-w,by-r*0.9); c.lineTo(hx-w*0.5,by-r*0.35); c.lineTo(hx,by-r*1.15); c.lineTo(hx+w*0.5,by-r*0.35); c.lineTo(hx+w,by-r*0.9); c.lineTo(hx+w,by); c.closePath(); c.fill(); c.stroke(); c.fillStyle='#ff4d6d'; c.beginPath(); c.arc(hx,by-r*0.45,r*0.2,0,7); c.fill(); glow(r*2.2, 0.16); break; }
    case 'void': { glow(r*2.8, 0.34); c.fillStyle='rgba(14,6,26,0.85)'; c.strokeStyle=hexA(col,0.9); c.lineWidth=1.1; for(let i=0;i<2;i++){ const a=-t*2.2+i*Math.PI, x=hx+Math.cos(a)*r*2, y=hy+Math.sin(a)*r*1.35; c.beginPath(); c.arc(x,y,2.5,0,7); c.fill(); c.stroke(); } break; }
    case 'electric': { glow(r*2.2, 0.2); c.strokeStyle=hexA(col,0.95); c.lineWidth=1.3; const s=Math.floor(t*14); for(let i=0;i<3;i++){ const a=((s*37+i*113)%360)*Math.PI/180; let x=hx+Math.cos(a)*r*1.3, y=hy+Math.sin(a)*r*1.3; c.beginPath(); c.moveTo(x,y); for(let k=0;k<3;k++){ x+=Math.cos(a)*3.4+((s*7+k*i)%5-2)*1.3; y+=Math.sin(a)*3.4+((s*3+k)%5-2)*1.3; c.lineTo(x,y); } c.stroke(); } break; }
  }
  c.restore();
}
function drawSkinLux(c, lux, tint, now, seed, layer){
  if(!lux) return;
  if(tint===STAR_TINT){ drawStarlightShow(c, (now||0)/1000+(seed||0)*0.37, layer); return; }      // 별빛 사과
  if(lux>=4){ drawAuroraShow(c, (now||0)/1000+(seed||0)*0.37, layer, fxQuality); return; }
  const seedNum=Math.floor((seed||0)*37)%1000, t=(now||0)/1000+(seed||0)*0.37, col=(lux>=4)?auroraHex(((now||0)/1000+(seed||0)*0.37)*0.6,0):(tint||'#ffffff'), col2=(lux>=4)?auroraHex(((now||0)/1000+(seed||0)*0.37)*0.6,3):((lux>=2)?shiftHex(tint||'#ffffff',45):(tint||'#ffffff')), big=lux>=2, q=fxQuality;
  const scol=(lux>=4)?auroraHex(Math.floor(((now||0)/1000+(seed||0)*0.37)*2)/2*0.6,0):col, scol2=(lux>=4)?auroraHex(Math.floor(((now||0)/1000+(seed||0)*0.37)*2)/2*0.6,3):col2;      // (the little cached pictures only change twice a second)
  const fr=(v)=>v-Math.floor(v);
  c.save(); c.lineCap='round'; c.lineJoin='round'; c.globalCompositeOperation='lighter';
  const cross=(x,y,s)=>{ c.fillRect(x-s,y-0.6,2*s,1.2); c.fillRect(x-0.6,y-s*1.5,1.2,3*s); };        // a little twinkle: two thin bars (cheaper than a stroked path)
  const diamond=(x,y,s,fill,rot)=>{ const cs=Math.cos(rot||0), sn=Math.sin(rot||0), px=[0,s,0,-s], py=[-s*1.4,0,s*1.4,0]; c.fillStyle=fill; c.beginPath(); for(let i=0;i<4;i++){ const X=x+px[i]*cs-py[i]*sn, Y=y+px[i]*sn+py[i]*cs; if(i) c.lineTo(X,Y); else c.moveTo(X,Y); } c.closePath(); c.fill(); };
  if(layer==='back'){
    // the aura around the whole body (an upright oval that breathes): a copy of the little picture
    if(lux>=4 && q>=1){ for(let k=0;k<5;k++){ const bx=(k-2)*13, hgt=118+16*Math.sin(t*1.3+k), g=c.createLinearGradient(0,-hgt-10,0,0); g.addColorStop(0,hexA(auroraHex(t,k),0)); g.addColorStop(0.5,hexA(auroraHex(t,k+1),0.5)); g.addColorStop(1,hexA(auroraHex(t,k+2),0.12)); c.fillStyle=g; c.beginPath(); c.moveTo(bx-8,0); for(let s2=0;s2<=10;s2++) c.lineTo(bx-8+Math.sin(t*2.1+s2*0.6+k*1.5)*(3+s2*0.9), -s2*hgt/10); for(let s2=10;s2>=0;s2--) c.lineTo(bx+8+Math.sin(t*2.1+s2*0.6+k*1.5+0.8)*(3+s2*0.9), -s2*hgt/10); c.closePath(); c.fill(); } }       // 오로라 커튼: 몸 뒤에서 물결치는 빛의 띠 다섯 개
    { const pulse=1+0.08*Math.sin(t*3), sp=luxSprite('aura',scol,scol2,big);
      if(sp){ c.save(); c.translate(0,-30); c.scale(pulse,pulse); c.drawImage(sp.cv,-sp.W/2,-sp.H/2); c.restore(); }
      else { const rad=(big?64:52)*pulse; c.save(); c.translate(0,-30); c.scale(0.8,1.25); const g=c.createRadialGradient(0,0,2,0,0,rad); g.addColorStop(0,hexA(col,big?0.5:0.4)); g.addColorStop(0.55,hexA(col2,big?0.22:0.16)); g.addColorStop(1,hexA(col,0)); c.fillStyle=g; c.beginPath(); c.arc(0,0,rad,0,7); c.fill(); c.restore(); } }
    // the sunburst behind (legendary only): the same
    if(big && q>=2){ const sp=luxSprite('rays',scol,scol2,big);
      if(sp){ c.save(); c.translate(0,-32); c.rotate(t*0.4); c.drawImage(sp.cv,-sp.W/2,-sp.H/2); c.restore(); }
      else { c.save(); c.translate(0,-32); const cA=hexA(col,0.17), cB=hexA(col2,0.17); for(let k=0;k<8;k++){ const a=t*0.4+k*Math.PI/4, w=0.12+0.03*Math.sin(t*2+k), R=70+8*Math.sin(t*2.4+k*1.7); c.fillStyle=(k%2)?cA:cB; c.beginPath(); c.moveTo(0,0); c.lineTo(Math.cos(a-w)*R,Math.sin(a-w)*R); c.lineTo(Math.cos(a+w)*R,Math.sin(a+w)*R); c.closePath(); c.fill(); } c.restore(); } }
    // the rings on the ground
    c.save(); c.translate(0,1); c.lineWidth=big?2:1.6; c.strokeStyle=hexA(col,0.9); c.setLineDash([7,5]); c.lineDashOffset=-t*34; c.beginPath(); c.ellipse(0,0,big?32:26,big?8:7,0,0,7); c.stroke(); c.setLineDash([]);
    if(big && q>=1){ for(let k=0;k<2;k++){ const ph=fr(t*0.7+k*0.5); c.strokeStyle=hexA(col2,(1-ph)*0.75); c.lineWidth=2.2*(1-ph)+0.6; c.beginPath(); c.ellipse(0,0,14+38*ph,3.5+9*ph,0,0,7); c.stroke(); } }
    c.restore();
    // the 4000 sC tier (lux 3): a counter-rotating second sunburst, a pulsing ground glow and waves that spread over the floor
    if(lux>=3 && q>=1){
      c.save(); c.translate(0,-32); c.rotate(-t*0.65); const cA3=hexA(col2,lux>=4?0.22:0.12), cB3=hexA('#ffffff',lux>=4?0.14:0.07);
      for(let k=0;k<(lux>=4?12:8);k++){ const a=k*Math.PI*2/(lux>=4?12:8), w=0.07+0.02*Math.sin(t*3+k), R=(lux>=4?100:80)+8*Math.sin(t*2.1+k*1.3); c.fillStyle=(k%2)?cA3:cB3; c.beginPath(); c.moveTo(0,0); c.arc(0,0,R,a-w,a+w); c.closePath(); c.fill(); }
      c.restore();
      const gl=0.5+0.5*Math.sin(t*2.6); c.save(); c.translate(0,2); c.scale(1,0.26); const gg=c.createRadialGradient(0,0,2,0,0,58); gg.addColorStop(0,hexA(col,lux>=4?0.55+0.25*gl:0.32+0.14*gl)); gg.addColorStop(1,hexA(col2,0)); c.fillStyle=gg; c.beginPath(); c.arc(0,0,58,0,7); c.fill(); c.restore();
      { const nw=(lux>=4?3:2); for(let k=0;k<nw;k++){ const ph=fr(t*0.55+k/nw); c.strokeStyle=hexA(k%2?col:'#ffffff',(1-ph)*(lux>=4?0.6:0.4)); c.lineWidth=(lux>=4?3:2.2)*(1-ph)+0.8; c.beginPath(); c.ellipse(0,1,20+(lux>=4?70:56)*ph,5+(lux>=4?17:13)*ph,0,0,7); c.stroke(); } }
      if(lux>=4){      // 그랜드 마스터 only (back): a pillar of light, a huge slow sunburst and a heavy shock ring that rolls over the floor
        const pw=11+4*Math.sin(t*3.2), pg=c.createLinearGradient(0,-170,0,0); pg.addColorStop(0,hexA(col,0)); pg.addColorStop(0.55,hexA(col2,0.2)); pg.addColorStop(1,hexA('#ffffff',0.38));
        c.fillStyle=pg; c.fillRect(-pw,-170,pw*2,170); c.fillStyle=hexA('#ffffff',0.22); c.fillRect(-pw*0.35,-170,pw*0.7,170);
        c.save(); c.translate(0,-34); c.rotate(t*0.22); for(let k=0;k<16;k++){ const a=k*Math.PI/8, w=0.045; c.fillStyle=hexA((k%2)?col:col2,0.16); c.beginPath(); c.moveTo(0,0); c.arc(0,0,150+14*Math.sin(t*1.7+k),a-w,a+w); c.closePath(); c.fill(); } c.restore();
        const ph=fr(t*0.45); c.strokeStyle=hexA('#ffffff',(1-ph)*0.8); c.lineWidth=5*(1-ph)+1; c.beginPath(); c.ellipse(0,1,24+120*ph,6+30*ph,0,0,7); c.stroke();
        c.strokeStyle=hexA(col2,(1-ph)*0.5); c.lineWidth=2; c.beginPath(); c.ellipse(0,1,12+90*ph,3+22*ph,0,0,7); c.stroke();
      }
    }
    // the gems that are behind the body
    if(big && q>=2){ for(let k=0;k<3;k++){ const a=t*1.7+k*Math.PI*2/3; if(Math.sin(a)>0) continue; diamond(Math.cos(a)*27, -30+Math.sin(a)*9, 2.4, hexA(k%2?col:col2,0.55), a); } }
  } else {
    // sparks rising from the ground along the body, twinkling
    const n=q>=2?(big?16:10):(q===1?(big?8:5):0);
    for(let i=0;i<n;i++){ const ph=fr(t*(0.55+0.4*fr(i*0.618))+i*0.37), x=Math.sin(i*12.9898+t*0.8)*(10+14*ph), y=-2-ph*(big?88:74), a=(1-ph)*(0.55+0.45*Math.abs(Math.sin(t*6+i))), s=(big?1.9:1.5)*(1-ph*0.6)+0.4;
      c.fillStyle=hexA((i%3===0)?'#ffffff':((i%3===1)?col:col2), a); if(i%2) cross(x,y,s*1.4); else c.fillRect(x-s,y-s,2*s,2*s); }
    // the stars that circle the head
    if(q>=1){ const m=big?5:4; for(let k=0;k<m;k++){ const a=-t*1.6+k*(Math.PI*2/m); c.fillStyle=hexA(k%2?col2:'#ffffff',0.85); cross(Math.cos(a)*20, -52+Math.sin(a)*13, 2.2+1.6*Math.abs(Math.sin(t*4+k))); } }
    // a double halo (legendary only)
    if(big && q>=2){ for(let k=0;k<2;k++){ c.strokeStyle=hexA(k?col2:col,0.8-k*0.25); c.lineWidth=2.2-k*0.7; c.beginPath(); c.ellipse(0,-72-k*5,15+k*5,4.2+k*1.4,0,0,7); c.stroke(); } }
    // lux 3 in front: a comet with a long tail circling the body, little flames at the head, and sparks that burst outward
    if(lux>=3 && q>=1){
      { const nc=(lux>=4?3:1); for(let k=0;k<nc;k++){ for(let j=0;j<14;j++){ const a=t*(lux>=4?2.8:2.4)+k*Math.PI*2/nc-j*0.09, fade=1-j/14; if(Math.sin(a)<=0) continue; c.fillStyle=hexA(j===0?'#ffffff':(k%2?col:col2),fade*(lux>=4?0.95:0.7)); const rr=(3.2*fade+0.6); c.beginPath(); c.arc(Math.cos(a)*(lux>=4?38:34), -30+Math.sin(a)*14, rr, 0, 7); c.fill(); } } }
      { const nb=(lux>=4?9:3); for(let k=0;k<nb;k++){ const ph=fr(t*1.3+k/nb), a=k*2.399+t*0.5, d=10+(lux>=4?62:46)*ph; c.fillStyle=hexA((k%2)?'#ffffff':col2,(1-ph)*(lux>=4?0.95:0.7)); cross(Math.cos(a)*d, -34+Math.sin(a)*d*0.8, 2.6*(1-ph)+0.8); } }
      if(q>=2 && lux<4){ for(let k=0;k<3;k++){ const fl=0.6+0.4*Math.sin(t*9+k*2); c.fillStyle=hexA(k===1?'#ffffff':col,(lux>=4?0.7:0.45)*fl); c.beginPath(); c.moveTo(-8+k*8,-80); c.quadraticCurveTo(-11+k*8,-90-8*fl,-8+k*8+3,-98-10*fl); c.quadraticCurveTo(-6+k*8,-88,-8+k*8,-80); c.fill(); } }
      if(lux>=4){      // 그랜드 마스터 only (front): 오로라 빛줄기 (불꽃과 번개는 없앴어요) and a white flash ring that pulses out
        for(let k=0;k<4;k++){ const sw=Math.sin(t*1.6+k*1.7), bx=-20+k*13+sw*4, hgt=26+10*Math.sin(t*2.3+k); const g=c.createLinearGradient(0,-70,0,-70-hgt); g.addColorStop(0,hexA(auroraHex(t,k),0.55)); g.addColorStop(1,hexA(auroraHex(t,k+2),0)); c.fillStyle=g; c.beginPath(); c.moveTo(bx-4,-70); c.quadraticCurveTo(bx-3+sw*3,-70-hgt*0.6,bx+sw*5,-70-hgt); c.quadraticCurveTo(bx+3+sw*3,-70-hgt*0.6,bx+4,-70); c.closePath(); c.fill(); }
        const fp=fr(t*0.55+0.2); c.strokeStyle=hexA('#ffffff',(1-fp)*0.55); c.lineWidth=3.5*(1-fp)+0.6; c.beginPath(); c.ellipse(0,-34,14+70*fp,20+95*fp,0,0,7); c.stroke();
      }
    }
    // the gems in front of the body
    if(big && q>=2){ for(let k=0;k<3;k++){ const a=t*1.7+k*Math.PI*2/3; if(Math.sin(a)<=0) continue; const sc=0.9+0.4*Math.sin(a), gx=Math.cos(a)*27, gy=-30+Math.sin(a)*9; diamond(gx, gy, 2.6*sc, hexA(k%2?col:col2,0.95), a); c.fillStyle=hexA('#ffffff',0.8); c.fillRect(gx-0.8,gy-0.8,1.6,1.6); } }
  }
  c.restore();
}
function drawItemPreview(cv,id,nowMs){
  const it=COSMETICS[id], big=!!(it.cat==='skin' && it.lux); cv.width=big?112:80; cv.height=big?112:80;      // a tier skin gets a larger picture: the show reaches far beyond the figure
  const c=cv.getContext('2d'); c.lineCap='round'; c.lineJoin='round';
  if(big) c.translate(16,16);                                                                                 // (the figure is still drawn in the old 80 x 80 frame)
  const nowT=(nowMs===undefined)?700:nowMs;
  c.strokeStyle='#cfd3dc'; c.fillStyle='#cfd3dc'; c.lineWidth=4;
  if(it.cat==='skin'){
    const mo=skinIsSpecial(id)?skinMotion(id,nowT/1000):null; c.save(); if(mo){ c.translate(40+mo.dx,79+mo.dy); c.rotate(mo.rot); c.translate(-40,-79); }
    if(it.lux){ c.save(); c.translate(40,79); c.scale(0.55,0.55); drawSkinLux(c,it.lux,it.tint,nowT,id.length,'back'); c.restore(); c.strokeStyle='#cfd3dc'; c.fillStyle='#cfd3dc'; c.lineWidth=4; }   // (the show behind the little figure)
    c.beginPath(); c.arc(40,50,10,0,7); c.fill();
    c.beginPath(); c.moveTo(40,60); c.lineTo(40,78); c.stroke();
    if(it.char==='dracula') drawDraculaCape(c,-1,2,38,it.tint);
    drawWeaponPersona(c,it.char,40,50,10,60,it.tint,it.concept);
    if(it.char==='shade' || it.char==='kadas'){ c.save(); c.lineWidth=3; c.beginPath(); c.moveTo(40,62); c.lineTo(50,70); c.stroke(); c.translate(50,70); c.scale(0.5,0.5); drawHeldWeapon(c,it.char,0.5,-0.866,0,0,0,it.concept); c.restore(); }
    if(it.fx) drawSkinFx(c,(it.lux>=4?'sparkle':it.fx),(it.lux>=4?auroraHex(nowT/1000*0.9,1):it.tint),40,50,it.lux?13:10,nowT);
    if(it.lux){ c.save(); c.translate(40,79); c.scale(0.55,0.55); drawSkinLux(c,it.lux,it.tint,nowT,id.length,'front'); c.restore(); }   // (and in front of it)
    c.restore();
  } else if(it.cat==='bcol'){
    const col=bodyShineColor(id, nowT, 0);
    c.strokeStyle=col; c.fillStyle=col; c.lineWidth=5; if(it.shine){ c.shadowColor=col; c.shadowBlur=10; }
    c.beginPath(); c.arc(40,24,9,0,7); c.fill();
    c.beginPath(); c.moveTo(40,33); c.lineTo(40,53); c.moveTo(40,53); c.lineTo(31,72); c.moveTo(40,53); c.lineTo(49,72); c.moveTo(40,38); c.lineTo(28,48); c.moveTo(40,38); c.lineTo(53,44); c.stroke();
    if(it.shine){ c.shadowBlur=0; c.save(); c.translate(40,75); drawShineGlints(c, nowT, 0); c.restore(); }
  } else if(it.cat==='pose'){
    c.save(); c.translate(40,74); c.lineWidth=4; drawWinPose(c, id, nowT/1000, null); c.restore();
  } else if(it.cat==='kfx'){
    c.font='40px serif'; c.textAlign='center'; c.textBaseline='middle'; c.fillText(it.icon||'💥',40,42);
  } else {
    c.font='700 18px Rajdhani'; c.textAlign='center'; c.textBaseline='middle';
    if(id==='name_rainbow'){ const g=c.createLinearGradient(6,0,74,0); ['#ff5f5f','#ffd34d','#5fff8a','#4dd9ff','#c17bff'].forEach((col,i)=>g.addColorStop(i/4,col)); c.fillStyle=g; }
    else c.fillStyle=it.color;
    c.fillText('닉네임',40,40);
  }
}
function conceptOfSkin(sid){ const c=sid&&COSMETICS[sid]; return (c&&c.concept)||''; }
const EMOTES=['👍','😂','😡','😭','🔥','👋','❓','💀'], EMOTE_SEC=2.6, EMOTE_CD=1.2;
const EMOTE_WHEEL_N=8;
const SHOP_EMOTES=[
  ['😎','선글라스',300], ['🤡','광대',300], ['🥶','꽁꽁',300], ['🫡','경례',300],
  ['🤯','머리 폭발',500], ['😈','악마 미소',500], ['🐔','겁쟁이 치킨',500], ['💯','백점',500],
  ['🎉','축하 폭죽',800], ['👑','왕관',800], ['🏆','트로피',800], ['💸','돈 뿌리기',800],
  ['😜','메롱',500]
];
EMOTES.forEach((em,i)=>{ COSMETICS['emo_'+i]={cat:'emo', name:'기본 이모트 '+(i+1), price:0, free:true, em, emIdx:i}; });
/* more emotes for the shop (the UI thread adds them to EMOTES at the end, after its own; never in the middle: emotes travel as numbers) */
const MORE_EMOTES=[
  ['👏','박수',300], ['🤝','악수',300], ['🙏','부탁해요',300], ['🤔','흠',300], ['😴','쿨쿨',300],
  ['😱','깜짝',500], ['🥺','제발',500], ['😤','흥',500], ['🤫','쉿',500], ['👀','지켜본다',500],
  ['🏳','항복',800], ['🍀','행운',800], ['💔','하트 브레이크',800]
];
/* the season-pass emotes: animated bubbles (never sold; the pass gives them) - appended at the END as always, and put into the pass at tiers 23 and 43 */
function skinIsSpecial(sid){ const it=sid && COSMETICS[sid]; return !!(it && it.cat==='skin' && ((it.price||0)>=2000 || (it.lux||0)>=3)); }
function shiftHex(hex, deg){            // the same colour turned round the colour wheel (for the second colour of a legendary skin)
  const m=/^#?([0-9a-f]{6})$/i.exec(hex||''); if(!m) return hex||'#ffffff';
  const n=parseInt(m[1],16); let r=(n>>16&255)/255, g=(n>>8&255)/255, b=(n&255)/255;
  const mx=Math.max(r,g,b), mn=Math.min(r,g,b), l=(mx+mn)/2, d=mx-mn; let hh=0, s=0;
  if(d>0){ s=d/(1-Math.abs(2*l-1)); if(mx===r) hh=((g-b)/d)%6; else if(mx===g) hh=(b-r)/d+2; else hh=(r-g)/d+4; hh*=60; if(hh<0) hh+=360; }
  hh=(hh+deg+360)%360; const cc=(1-Math.abs(2*l-1))*s, x=cc*(1-Math.abs((hh/60)%2-1)), mm=l-cc/2; let rr=0,gg=0,bb=0;
  if(hh<60){rr=cc;gg=x;} else if(hh<120){rr=x;gg=cc;} else if(hh<180){gg=cc;bb=x;} else if(hh<240){gg=x;bb=cc;} else if(hh<300){rr=x;bb=cc;} else {rr=cc;bb=x;}
  const to=(v)=>Math.round((v+mm)*255).toString(16).padStart(2,'0'); return '#'+to(rr)+to(gg)+to(bb);
}
function drawAuroraShow(c, t, layer, q){
  const lite=(q<1 || auroraDrawn>=2);          // many 오로라 skins on screen (or low graphics): only the ground ring and a few sparks
  if(layer==='back') auroraDrawn++;
  const A=(i,a)=>hexA(auroraHex(t*0.9,i),a), fr=v=>v-Math.floor(v);
  c.save(); c.lineCap='round'; c.lineJoin='round'; c.globalCompositeOperation='lighter';
  const cross=(x,y,s2)=>{ c.fillRect(x-s2,y-0.6,2*s2,1.2); c.fillRect(x-0.6,y-s2*1.5,1.2,3*s2); };
  if(lite){
    if(layer==='back'){ c.setLineDash([9,6]); c.lineDashOffset=-t*40; c.strokeStyle=A(1,0.95); c.lineWidth=2.4; c.beginPath(); c.ellipse(0,1,36,9,0,0,7); c.stroke(); c.setLineDash([]); }
    else { for(let i=0;i<2;i++){ const ph=fr(t*0.9+i*0.173), a=i*2.399+t*0.4, d=8+60*ph; c.fillStyle=A(i,(1-ph)*0.9); cross(Math.cos(a)*d, -30+Math.sin(a)*d*0.9-ph*30, 2.4*(1-ph)+0.8); } }
  } else if(layer==='back'){
    { const g=c.createRadialGradient(0,-40,4,0,-40,130); g.addColorStop(0,A(0,0.5)); g.addColorStop(0.45,A(2,0.25)); g.addColorStop(1,A(4,0)); c.fillStyle=g; c.save(); c.translate(0,-40); c.scale(0.9,1.3); c.translate(0,40); c.beginPath(); c.arc(0,-40,130,0,7); c.fill(); c.restore(); }
    const nr=q>=1?3:2;
    for(let k=0;k<nr;k++){                                       // the curtains: tall wavy bands that change colour from the foot to the top
      const bx=(k-(nr-1)/2)*26+Math.sin(t*0.9+k)*6, hgt=190+34*Math.sin(t*1.1+k*1.4), wd=15+5*Math.sin(t*1.7+k*2.1), g=c.createLinearGradient(0,-hgt,0,6);
      g.addColorStop(0,A(k,0)); g.addColorStop(0.35,A(k+1,0.22)); g.addColorStop(0.7,A(k+3,0.3)); g.addColorStop(1,A(k+5,0.08));
      c.fillStyle=g; c.beginPath(); c.moveTo(bx-wd,4);
      for(let s2=0;s2<=14;s2++){ const y=4-s2*hgt/14, f=s2/14; c.lineTo(bx-wd+Math.sin(t*2.3+s2*0.55+k*1.7)*(4+f*15), y); }
      for(let s2=14;s2>=0;s2--){ const y=4-s2*hgt/14, f=s2/14; c.lineTo(bx+wd+Math.sin(t*2.3+s2*0.55+k*1.7+0.9)*(4+f*15), y); }
      c.closePath(); c.fill();
    }
    if(q>=1){ for(let i=0;i<4;i++){ const ph=fr(t*(0.18+0.22*fr(i*0.618))+i*0.37), x=Math.sin(i*12.9898)*95, y=-6-ph*190; c.fillStyle=A(i,(1-ph)*(0.5+0.5*Math.abs(Math.sin(t*5+i)))); cross(x,y,1.4+1.6*(1-ph)); } }       // star dust drifting up
    for(let k=0;k<1;k++){ const ph=fr(t*0.5+k/3); c.strokeStyle=A(k*2,(1-ph)*0.8); c.lineWidth=4*(1-ph)+1; c.beginPath(); c.ellipse(0,1,18+110*ph,5+28*ph,0,0,7); c.stroke(); }          // ripples over the ground
    c.setLineDash([9,6]); c.lineDashOffset=-t*40; c.strokeStyle=A(1,0.95); c.lineWidth=2.4; c.beginPath(); c.ellipse(0,1,36,9,0,0,7); c.stroke(); c.setLineDash([]);
  } else {
    if(false){ for(let k=0;k<3;k++){                              // three strands of light that spiral round the body
      c.strokeStyle=A(k*2,0.6); c.lineWidth=2; c.beginPath();
      for(let s2=0;s2<=36;s2++){ const f=s2/36, a=t*2.6+k*2.094+f*9, y=-2-f*88, r=15+8*Math.sin(f*6+t*1.5); const x=Math.cos(a)*r; if(Math.sin(a)<-0.2){ continue; } if(s2===0||Math.sin(a-0.25)<-0.2) c.moveTo(x,y); else c.lineTo(x,y); }
      c.stroke(); } }
    for(let k=0;k<2;k++){                                        // orbs with a long glowing tail
      for(let j=0;j<6;j++){ const a=t*(2.1+0.25*k)+k*1.047-j*0.15, f=1-j/6, rx=44+8*Math.sin(t+k), ry=11+3*k;
        if(Math.sin(a)<=0) continue; c.fillStyle=(j===0)?hexA('#ffffff',0.95):A(k+j*0.3,f*0.85); const rr=(j===0?4:3.4*f+0.6); c.beginPath(); c.arc(Math.cos(a)*rx, -14-k*11+Math.sin(a)*ry, rr, 0, 7); c.fill(); } }
    for(let i=0;i<(q>=1?3:2);i++){ const ph=fr(t*0.9+i*0.173), a=i*2.399+t*0.4, d=8+60*ph; c.fillStyle=A(i,(1-ph)*0.9); cross(Math.cos(a)*d, -30+Math.sin(a)*d*0.9-ph*30, 2.4*(1-ph)+0.8); }
    for(let k=0;k<1;k++){ c.strokeStyle=A(k*2+1,0.85-k*0.2); c.lineWidth=2.4-k*0.6; c.beginPath(); c.ellipse(0,-72-k*5,16+k*6,4.6+k*1.5,0,0,7); c.stroke(); }
    const fp=fr(t*0.55+0.2); c.strokeStyle=hexA('#ffffff',(1-fp)*0.5); c.lineWidth=3.5*(1-fp)+0.6; c.beginPath(); c.ellipse(0,-34,14+80*fp,20+105*fp,0,0,7); c.stroke();
  }
  c.restore();
}
function drawStarlightShow(c, t, layer){
  const fr=v=>v-Math.floor(v), q=(typeof fxQuality==='number')?fxQuality:2;
  c.save(); c.globalCompositeOperation='lighter';
  if(layer==='back'){
    { const pl=starPillar(), pw=1+0.08*Math.sin(t*3); c.save(); c.scale(pw,1); c.drawImage(pl.cv,-pl.W/2,-pl.H+2); c.restore(); }
    const au=starAura(), pulse=1+0.07*Math.sin(t*2.4); c.save(); c.translate(0,-34); c.scale(pulse,pulse); c.drawImage(au.cv,-au.W/2,-au.H/2); c.scale(1.5,1.5); c.globalAlpha=0.25; c.drawImage(au.cv,-au.W/2,-au.H/2); c.restore();
    if(q>=1){ const ry=starRays(); c.save(); c.translate(0,-36); c.rotate(t*0.28); c.globalAlpha=0.7; c.drawImage(ry.cv,-ry.W/2,-ry.H/2); c.restore();
      const r2=starRays2(); c.save(); c.translate(0,-36); c.rotate(-t*0.42); c.globalAlpha=0.6; c.drawImage(r2.cv,-r2.W/2,-r2.H/2); c.restore(); c.globalAlpha=1; }
    const gr=starGround(), gp=1+0.08*Math.sin(t*3); c.save(); c.translate(0,2); c.scale(gp,1); c.drawImage(gr.cv,-gr.W/2,-gr.H/2); c.restore();
    { const sl=starSeal(); c.save(); c.translate(0,1); c.scale(0.62,0.17); c.rotate(t*0.7); c.globalAlpha=0.95; c.drawImage(sl.cv,-sl.W/2,-sl.H/2); c.restore(); c.globalAlpha=1; }
    c.save(); c.translate(0,2); for(let k=0;k<2;k++){ const ph=fr(t*0.6+k*0.5); c.strokeStyle=(k?'rgba(143,227,255,':'rgba(255,170,220,')+((1-ph)*0.75).toFixed(2)+')'; c.lineWidth=3*(1-ph)+0.6; c.beginPath(); c.ellipse(0,0,16+78*ph,4+19*ph,0,0,7); c.stroke(); } c.restore();
    for(let k=0;k<4;k++){ const a=t*1.4+k*Math.PI/2; if(Math.sin(a)>0) continue; const im=starImg(k%3); c.globalAlpha=0.6; c.drawImage(im.cv,Math.cos(a)*30-9,-32+Math.sin(a)*10-9,18,18); } c.globalAlpha=1;
  } else {
    const n=q>=1?8:4;
    for(let k=0;k<n;k++){ const a=-t*1.5+k*Math.PI*2/n, sn=Math.sin(a); if(sn<=0 && k%2) continue; const sc=0.75+0.4*sn, sz=(12+6*Math.abs(Math.sin(t*3+k)))*sc, im=starImg(k%3); c.globalAlpha=0.55+0.4*Math.max(0,sn); c.drawImage(im.cv,Math.cos(a)*29-sz/2,-34+sn*11-sz/2,sz,sz); }
    c.globalAlpha=1;
    if(q>=1){ for(let k=0;k<2;k++){ for(let j=0;j<12;j++){ const a=t*2.6+k*Math.PI-j*0.1, sn=Math.sin(a); if(sn<=0) continue; const fade=1-j/12, sz=(j===0?15:9)*fade+3, im=starImg(k?2:1); c.globalAlpha=fade*0.9; c.drawImage(im.cv,Math.cos(a)*46-sz/2,-34+sn*22-sz/2,sz,sz); } } c.globalAlpha=1; }
    const m=q>=1?10:4;
    for(let i=0;i<m;i++){ const ph=fr(t*(0.5+0.3*fr(i*0.618))+i*0.37), x=Math.sin(i*12.99+t*0.7)*(8+18*ph), y=-2-ph*96, a=(1-ph)*0.9, im=(i%3===2)?starHeart():starImg(i%3), sz=(i%3===2?11:10)*(1-ph*0.5)+3; c.globalAlpha=a; c.drawImage(im.cv,x-sz/2,y-sz/2,sz,sz); }
    c.globalAlpha=1;
    if(q>=1){ for(let i=0;i<6;i++){ const ph=fr(t*0.8+i/6), x=60-ph*120+Math.sin(i*7)*8, y=-120+ph*130, a=Math.sin(ph*Math.PI), sz=9+4*Math.sin(i*3), im=starImg(i%3); c.globalAlpha=a*0.85; c.drawImage(im.cv,x-sz/2,y-sz/2,sz,sz); c.globalAlpha=a*0.4; c.drawImage(im.cv,x+9-sz*0.3,y-7-sz*0.3,sz*0.6,sz*0.6); } c.globalAlpha=1; }
    c.save(); c.translate(0,-76); c.rotate(Math.sin(t*1.2)*0.06); c.lineWidth=2.4; c.strokeStyle='rgba(255,226,140,0.95)'; c.beginPath(); c.ellipse(0,0,15,4.2,0,0,7); c.stroke(); c.lineWidth=1; c.strokeStyle='rgba(255,255,255,0.8)'; c.beginPath(); c.ellipse(0,0,15,4.2,0,0,7); c.stroke();
    for(let k=0;k<5;k++){ const a=t*2+k*Math.PI*2/5, sz=6+1.5*Math.sin(t*5+k), im=starImg(k%3); c.drawImage(im.cv,Math.cos(a)*15-sz/2,Math.sin(a)*4.2-sz/2,sz,sz); }
    { const im=starImg(1), sz=14+2.5*Math.sin(t*4); c.drawImage(im.cv,-sz/2,-4.2-8-sz/2,sz,sz); } c.restore();
  }
  c.restore();
}
function mixHex(a,b,t){ const pa=/^#([0-9a-f]{6})$/i.exec(a||''), pb=/^#([0-9a-f]{6})$/i.exec(b||''); if(!pa||!pb) return a; const A=parseInt(pa[1],16), B=parseInt(pb[1],16); let o=0; for(let k=16;k>=0;k-=8){ const x=(A>>k)&255, y=(B>>k)&255; o=(o<<8)|Math.round(x+(y-x)*t); } return '#'+('000000'+o.toString(16)).slice(-6); }
function luxSprite(kind, col, col2, big){
  const key=kind+'|'+col+'|'+col2+'|'+(big?2:1), hit=luxSpriteCache.get(key); if(hit!==undefined) return hit;
  let sp=null;
  try{
    const cv=luxMakeCanvas(), rad=(big?64:52)*1.1; let W, H;
    if(kind==='aura'){ W=Math.ceil(2*rad*0.8)+2; H=Math.ceil(2*rad*1.25)+2; } else { W=H=160; }
    cv.width=W; cv.height=H; const g=cv.getContext('2d'); if(!g) throw new Error('no 2d');
    g.translate(W/2,H/2);
    if(kind==='aura'){ g.scale(0.8,1.25); const gr=g.createRadialGradient(0,0,2,0,0,rad); gr.addColorStop(0,hexA(col,big?0.5:0.4)); gr.addColorStop(0.55,hexA(col2,big?0.22:0.16)); gr.addColorStop(1,hexA(col,0)); g.fillStyle=gr; g.beginPath(); g.arc(0,0,rad,0,7); g.fill(); }
    else { g.globalCompositeOperation='lighter'; for(let k=0;k<8;k++){ const a=k*Math.PI/4, w=0.12, R=72; g.fillStyle=hexA((k%2)?col:col2,0.17); g.beginPath(); g.moveTo(0,0); g.lineTo(Math.cos(a-w)*R,Math.sin(a-w)*R); g.lineTo(Math.cos(a+w)*R,Math.sin(a+w)*R); g.closePath(); g.fill(); } }
    sp={cv,W,H};
  }catch(e){ sp=null; }
  if(luxSpriteCache.size>200) luxSpriteCache.clear();
  luxSpriteCache.set(key,sp); return sp;
}
let auroraDrawn=0;
function starPillar(){ return starSprite('pillar',60,230,(c)=>{ const g=c.createLinearGradient(0,-110,0,110); g.addColorStop(0,'rgba(255,230,250,0)'); g.addColorStop(0.55,'rgba(255,170,225,0.07)'); g.addColorStop(1,'rgba(255,200,235,0.2)'); c.fillStyle=g; c.fillRect(-22,-110,44,220); c.fillStyle='rgba(255,255,255,0.07)'; c.fillRect(-6,-110,12,220); }); }
function drawDiaper(c,hx,shy){      // 기저귀: a fat white nappy at the hips with two blue tapes and a little wave of yellow stains
  c.fillStyle='#f4f1e8'; c.strokeStyle='#bdb7a4'; c.lineWidth=1; c.beginPath(); c.moveTo(hx-7.4,shy+13.4); c.lineTo(hx+7.4,shy+13.4); c.quadraticCurveTo(hx+9.2,shy+20,hx+4.6,shy+25.4); c.lineTo(hx+0.8,shy+22.6); c.lineTo(hx-0.8,shy+22.6); c.lineTo(hx-4.6,shy+25.4); c.quadraticCurveTo(hx-9.2,shy+20,hx-7.4,shy+13.4); c.closePath(); c.fill(); c.stroke();
  c.fillStyle='#8ec7ff'; c.fillRect(hx-7.8,shy+14.4,3.6,2.2); c.fillRect(hx+4.2,shy+14.4,3.6,2.2);
  c.strokeStyle='#d8c27a'; c.lineWidth=0.9; c.beginPath(); c.moveTo(hx-4.5,shy+18.6); c.quadraticCurveTo(hx-2,shy+20,hx,shy+18.8); c.quadraticCurveTo(hx+2,shy+17.6,hx+4.5,shy+19); c.stroke();
}
function auroraHex(t, i){
  const k=0.5+0.5*(Math.sin(t*0.9+i*1.1)*0.62+Math.sin(t*0.37+i*1.9)*0.38), h=(140+k*185)%360/360, l=0.62+0.1*Math.sin(t*1.7+i*2.3), sa=0.92;
  const a=sa*Math.min(l,1-l), f=n=>{ const kk=(n+h*12)%12; return l-a*Math.max(-1,Math.min(kk-3,9-kk,1)); };
  return '#'+[f(0),f(8),f(4)].map(v=>Math.round(Math.max(0,Math.min(1,v))*255).toString(16).padStart(2,'0')).join('');
}
function drawPoopShape(c,x,y,sc){      // a brown swirl pile (three tiers and a curled tip), sitting on (x,y) with its base at the bottom
  c.save(); c.translate(x,y); c.scale(sc,sc); c.lineJoin='round';
  const tier=(w,h,yy,col)=>{ c.fillStyle=col; c.strokeStyle='#4a2a0e'; c.lineWidth=1; c.beginPath(); c.ellipse(0,yy,w,h,0,0,7); c.fill(); c.stroke(); };
  tier(7.6,3.3,-3.2,'#6b3f17'); tier(5.6,2.9,-6.6,'#7d4a1c'); tier(3.6,2.5,-9.6,'#8f5724');
  c.fillStyle='#8f5724'; c.strokeStyle='#4a2a0e'; c.lineWidth=1; c.beginPath(); c.moveTo(-2.4,-10.4); c.quadraticCurveTo(0.6,-16.5,2.6,-12.4); c.quadraticCurveTo(1.2,-11.4,2.4,-10.2); c.closePath(); c.fill(); c.stroke();
  c.strokeStyle='rgba(255,214,150,0.55)'; c.lineWidth=0.9; c.lineCap='round'; c.beginPath(); c.moveTo(-5,-3.8); c.quadraticCurveTo(-3,-5.2,-1.5,-4.6); c.moveTo(-3.2,-7.2); c.quadraticCurveTo(-1.8,-8.4,-0.6,-7.8); c.stroke();
  c.restore();
}
const luxSpriteCache=new Map();          // the aura and the sunburst of a skin are drawn ONCE into a little picture (per colour) and then copied each frame: no gradient is built per player and frame any more
function starSprite(key, W, H, fn){ let s=starSp[key]; if(s) return s; const cv=document.createElement('canvas'); cv.width=W; cv.height=H; const c=cv.getContext('2d'); c.translate(W/2,H/2); fn(c,W,H); return starSp[key]={cv,W,H}; }
function drawGoldApple(c,r,spin){      // a golden apple (a stem, a leaf, a shine)
  c.save(); c.rotate(spin||0);
  c.fillStyle='#e8b923'; c.strokeStyle='#9a6a0c'; c.lineWidth=Math.max(1,r*0.14);
  c.beginPath(); c.moveTo(0,-r*0.55); c.bezierCurveTo(r*0.2,-r*1.05,r*1.15,-r*0.8,r*1.0,r*0.2); c.bezierCurveTo(r*0.85,r*0.95,r*0.28,r*1.05,0,r*0.82); c.bezierCurveTo(-r*0.28,r*1.05,-r*0.85,r*0.95,-r*1.0,r*0.2); c.bezierCurveTo(-r*1.15,-r*0.8,-r*0.2,-r*1.05,0,-r*0.55); c.closePath(); c.fill(); c.stroke();
  c.fillStyle='#ffe27a'; c.beginPath(); c.ellipse(-r*0.4,-r*0.1,r*0.22,r*0.42,0.5,0,7); c.fill();
  c.strokeStyle='#6b4a1a'; c.lineWidth=Math.max(1,r*0.16); c.beginPath(); c.moveTo(0,-r*0.55); c.lineTo(r*0.1,-r*1.0); c.stroke();
  c.fillStyle='#4fa34a'; c.beginPath(); c.ellipse(r*0.45,-r*0.9,r*0.4,r*0.18,-0.5,0,7); c.fill();
  c.restore();
}
function dreamFill(c,cx,cy,rad,now){ const a=(now||0)/1800, dx=Math.cos(a)*rad, dy=Math.sin(a)*rad, g=c.createLinearGradient(cx-dx,cy-dy,cx+dx,cy+dy); DREAM_STOPS.forEach((col,i)=>g.addColorStop(i/(DREAM_STOPS.length-1),col)); return g; }
function mythBeard(c,hx,hy,r,col,edge,len){      // a long pointed beard
  c.fillStyle=col; c.strokeStyle=edge; c.lineWidth=0.7;
  c.beginPath(); c.moveTo(hx-r*0.92,hy+r*0.05); c.quadraticCurveTo(hx-r*1.1,hy+r*(0.9+len*0.55),hx,hy+r*(1.15+len)); c.quadraticCurveTo(hx+r*1.1,hy+r*(0.9+len*0.55),hx+r*0.92,hy+r*0.05); c.quadraticCurveTo(hx,hy+r*0.62,hx-r*0.92,hy+r*0.05); c.closePath(); c.fill(); c.stroke();
  c.beginPath(); c.moveTo(hx-r*0.55,hy+r*0.4); c.quadraticCurveTo(hx,hy+r*0.2,hx+r*0.55,hy+r*0.4); c.strokeStyle=edge; c.stroke();
}
function mythTunic(c,hx,shy,edge,sash){      // a white tunic with a gold hem (and a sash)
  c.fillStyle='#f7f7fa'; c.beginPath(); c.moveTo(hx-5.2,shy+0.6); c.lineTo(hx+5.2,shy+0.6); c.lineTo(hx+6.8,shy+19.5); c.lineTo(hx-6.8,shy+19.5); c.closePath(); c.fill();
  c.strokeStyle='#d6d9e4'; c.lineWidth=0.8; c.beginPath(); c.moveTo(hx-2.2,shy+3); c.lineTo(hx-3.4,shy+18.5); c.moveTo(hx+2.2,shy+3); c.lineTo(hx+3.4,shy+18.5); c.stroke();
  c.strokeStyle=edge||'#d9b648'; c.lineWidth=1.3; c.beginPath(); c.moveTo(hx-6.7,shy+18.4); c.lineTo(hx+6.7,shy+18.4); c.stroke();
  if(sash){ c.lineWidth=1.6; c.beginPath(); c.moveTo(hx-4.8,shy+1.2); c.lineTo(hx+5.2,shy+13.5); c.stroke(); }
}
const DREAM_STOPS=['#7ff3e8','#9fd4ff','#c9b6ff','#ff9ad9','#ffd9f2'];      // the colour of the 꿈 photo: turquoise, sky, lavender, pink, a pale blush
function drawTrident(c,s,glow){      // 포세이돈's trident pointing +x from the hand (the head is at x=28): a gold shaft with sea-teal wraps, a long centre prong with a barb and two curved side prongs
  c.save(); c.scale(s,s); c.lineCap='round'; c.lineJoin='round';
  if(glow){ const t=performance.now()/260; c.save(); c.globalCompositeOperation='lighter'; const g=c.createRadialGradient(34,0,4,34,0,44); g.addColorStop(0,'rgba(120,225,255,'+(0.5+0.12*Math.sin(t))+')'); g.addColorStop(1,'rgba(60,160,255,0)'); c.fillStyle=g; c.beginPath(); c.arc(34,0,44,0,7); c.fill(); c.restore(); }
  c.strokeStyle='#8a6a1c'; c.lineWidth=4.4; c.beginPath(); c.moveTo(-10,0); c.lineTo(29,0); c.stroke();
  c.strokeStyle='#f2c230'; c.lineWidth=2.8; c.beginPath(); c.moveTo(-10,0); c.lineTo(29,0); c.stroke();
  c.strokeStyle='#1fb5c9'; c.lineWidth=1.6; for(let x=-4;x<24;x+=7){ c.beginPath(); c.moveTo(x,-2.4); c.lineTo(x+3,2.4); c.stroke(); }
  c.fillStyle='#f2c230'; c.strokeStyle='#8a6a1c'; c.lineWidth=0.8; c.beginPath(); c.arc(27,0,3.2,0,7); c.fill(); c.stroke();
  c.strokeStyle='#e9fbff'; c.lineWidth=2.6;
  c.beginPath(); c.moveTo(28,0); c.lineTo(46,0); c.stroke();
  for(const sg of [-1,1]){ c.beginPath(); c.moveTo(27,sg*2); c.quadraticCurveTo(29,sg*9.5,38,sg*9.5); c.lineTo(44,sg*9.5); c.stroke(); }
  c.fillStyle='#e9fbff'; c.strokeStyle='#4fa8c8'; c.lineWidth=0.8;
  c.beginPath(); c.moveTo(52,0); c.lineTo(45,-3.6); c.lineTo(45,3.6); c.closePath(); c.fill(); c.stroke();
  for(const sg of [-1,1]){ c.beginPath(); c.moveTo(50,sg*9.5); c.lineTo(43,sg*6); c.lineTo(43,sg*12.8); c.closePath(); c.fill(); c.stroke(); }
  c.fillStyle='#fff'; c.beginPath(); c.arc(29,0,1.1,0,7); c.fill();
  c.restore();
}
function drawZeusBoltShape(c,len,t){      // a lightning bolt pointing +x, the tail at the origin
  const pts=[[0,0],[len*0.22,-len*0.12],[len*0.18,len*0.02],[len*0.5,-len*0.1],[len*0.44,len*0.06],[len,0]];
  c.save(); c.lineJoin='round'; c.lineCap='round';
  c.globalCompositeOperation='lighter'; c.strokeStyle='rgba(120,190,255,0.55)'; c.lineWidth=len*0.34; c.beginPath(); pts.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1])); c.stroke();
  c.globalCompositeOperation='source-over'; c.strokeStyle='#ffe66b'; c.lineWidth=len*0.16; c.beginPath(); pts.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1])); c.stroke();
  c.strokeStyle='#ffffff'; c.lineWidth=len*0.06; c.beginPath(); pts.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1])); c.stroke();
  c.restore();
}
function mythLaurel(c,hx,hy,r){      // 월계수 관
  for(let i=0;i<10;i++){ const a=Math.PI*(1.02+0.96*i/9), x=hx+Math.cos(a)*(r+0.5), y=hy+Math.sin(a)*(r+0.5), rot=a+Math.PI/2;
    for(const k of [-1,1]){ c.save(); c.translate(x,y); c.rotate(rot+k*0.6); c.fillStyle=(i+k)%2?'#4fa34a':'#6ec062'; c.strokeStyle='#2c6a2a'; c.lineWidth=0.5; c.beginPath(); c.ellipse(0,-1.2*k*0+ -1.4,1.3,2.9,0,0,7); c.fill(); c.stroke(); c.restore(); } }
  c.fillStyle='#e8b923'; for(const q of [0.2,0.5,0.8]){ const a=Math.PI*(1.1+0.8*q); c.beginPath(); c.arc(hx+Math.cos(a)*(r+1.3),hy+Math.sin(a)*(r+1.3),0.9,0,7); c.fill(); }
}
function mythWings(c,hx,hy,r,fill,edge,dy){      // a pair of feathered wings on both sides of a helmet / hat
  for(const s of [-1,1]) for(let i=0;i<3;i++){
    const bx=hx+s*(r+0.6), by=hy-dy+i*0.6, tx=hx+s*(r+13-i*1.4), ty=hy-dy-9+i*4.6;
    c.fillStyle=fill; c.strokeStyle=edge; c.lineWidth=0.8;
    c.beginPath(); c.moveTo(bx,by); c.quadraticCurveTo(hx+s*(r+7),ty-3.5,tx,ty); c.quadraticCurveTo(hx+s*(r+8),ty+3.4,bx,by+1.6); c.closePath(); c.fill(); c.stroke();
  }
}
function drawRaven(c,len,flap){      // a raven seen from the side, beak to +x (flap: -1..1)
  const L=len, w=Math.sin(flap)*L*0.34;
  c.save(); c.lineJoin='round'; c.lineCap='round';
  c.fillStyle='#17171f'; c.strokeStyle='#4a4a5c'; c.lineWidth=Math.max(0.6,L*0.03);
  c.beginPath(); c.moveTo(-L*0.52,-L*0.04); c.lineTo(-L*0.3,-L*0.12); c.lineTo(L*0.22,-L*0.12); c.lineTo(L*0.42,-L*0.04); c.lineTo(L*0.22,L*0.12); c.lineTo(-L*0.3,L*0.1); c.closePath(); c.fill(); c.stroke();      // tail and body
  c.beginPath(); c.moveTo(-L*0.15,-L*0.1); c.quadraticCurveTo(-L*0.02,-L*0.1-w-L*0.2,L*0.2,-L*0.1-w*0.6-L*0.04); c.quadraticCurveTo(L*0.02,-L*0.08,-L*0.15,-L*0.02); c.closePath(); c.fill(); c.stroke();      // the wing
  c.beginPath(); c.arc(L*0.3,-L*0.12,L*0.11,0,7); c.fill(); c.stroke();      // head
  c.fillStyle='#e8b923'; c.beginPath(); c.moveTo(L*0.4,-L*0.15); c.lineTo(L*0.58,-L*0.11); c.lineTo(L*0.4,-L*0.08); c.closePath(); c.fill();
  c.fillStyle='#ffffff'; c.beginPath(); c.arc(L*0.33,-L*0.14,L*0.025,0,7); c.fill();
  c.restore();
}
const STAR_COL=['#ff8fd0','#ffd66b','#8fe3ff'], starSp={};
function starAura(){ return starSprite('aura',170,210,(c,W,H)=>{ c.scale(0.82,1.1);
  const g=c.createRadialGradient(0,0,4,0,0,76); g.addColorStop(0,'rgba(255,214,235,0.55)'); g.addColorStop(0.5,'rgba(255,143,208,0.26)'); g.addColorStop(0.8,'rgba(143,227,255,0.12)'); g.addColorStop(1,'rgba(143,227,255,0)'); c.fillStyle=g; c.beginPath(); c.arc(0,0,76,0,7); c.fill(); }); }
function starRays(){ return starSprite('rays',230,230,(c)=>{ for(let k=0;k<10;k++){ const a=k*Math.PI/5, w=0.075; const g=c.createRadialGradient(0,0,6,0,0,112); g.addColorStop(0,'rgba(255,230,160,0.24)'); g.addColorStop(1,'rgba(255,143,208,0)'); c.fillStyle=g; c.beginPath(); c.moveTo(0,0); c.arc(0,0,112,a-w,a+w); c.closePath(); c.fill(); } }); }
function starGround(){ return starSprite('ground',150,44,(c)=>{ c.scale(1,0.3); const g=c.createRadialGradient(0,0,2,0,0,70); g.addColorStop(0,'rgba(255,214,107,0.7)'); g.addColorStop(0.6,'rgba(255,143,208,0.3)'); g.addColorStop(1,'rgba(255,143,208,0)'); c.fillStyle=g; c.beginPath(); c.arc(0,0,70,0,7); c.fill(); }); }
function starHeart(){ return starSprite('heart',40,40,(c)=>{ c.scale(1.15,1.15); const g=c.createLinearGradient(0,-10,0,12); g.addColorStop(0,'#ffd9ee'); g.addColorStop(1,'#ff6fb5'); c.fillStyle=g; c.beginPath(); c.moveTo(0,10); c.bezierCurveTo(-14,-1,-9,-12,0,-5); c.bezierCurveTo(9,-12,14,-1,0,10); c.fill(); c.lineWidth=1.6; c.strokeStyle='#fff'; c.stroke(); }); }
function starSeal(){ return starSprite('seal',160,160,(c)=>{ c.lineJoin='round'; const g=c.createLinearGradient(-70,-70,70,70); g.addColorStop(0,'#fff2a8'); g.addColorStop(0.5,'#ff9ad5'); g.addColorStop(1,'#8fe3ff'); c.strokeStyle=g; c.lineWidth=3; c.beginPath(); c.arc(0,0,70,0,7); c.stroke(); c.lineWidth=1.6; c.beginPath(); c.arc(0,0,60,0,7); c.stroke(); c.lineWidth=2.6; c.beginPath(); for(let k=0;k<5;k++){ const a=-Math.PI/2+k*Math.PI*4/5; k?c.lineTo(Math.cos(a)*62,Math.sin(a)*62):c.moveTo(Math.cos(a)*62,Math.sin(a)*62); } c.closePath(); c.stroke(); for(let k=0;k<5;k++){ const a=-Math.PI/2+k*Math.PI*2/5; c.fillStyle='#fff6c8'; c.beginPath(); c.arc(Math.cos(a)*70,Math.sin(a)*70,4,0,7); c.fill(); } }); }
function starPillar(){ return starSprite('pillar',60,230,(c)=>{ const g=c.createLinearGradient(0,-110,0,110); g.addColorStop(0,'rgba(255,230,250,0)'); g.addColorStop(0.55,'rgba(255,170,225,0.07)'); g.addColorStop(1,'rgba(255,200,235,0.2)'); c.fillStyle=g; c.fillRect(-22,-110,44,220); c.fillStyle='rgba(255,255,255,0.07)'; c.fillRect(-6,-110,12,220); }); }
function starRays2(){ return starSprite('rays2',300,300,(c)=>{ for(let k=0;k<14;k++){ const a=k*Math.PI/7, w=0.045; const g=c.createRadialGradient(0,0,6,0,0,145); g.addColorStop(0,(k%2?'rgba(143,227,255,0.22)':'rgba(255,214,107,0.22)')); g.addColorStop(1,'rgba(255,143,208,0)'); c.fillStyle=g; c.beginPath(); c.moveTo(0,0); c.arc(0,0,145,a-w,a+w); c.closePath(); c.fill(); } }); }
function drawStarlightShow(c, t, layer){
  const fr=v=>v-Math.floor(v), q=(typeof fxQuality==='number')?fxQuality:2;
  c.save(); c.globalCompositeOperation='lighter';
  if(layer==='back'){
    { const pl=starPillar(), pw=1+0.08*Math.sin(t*3); c.save(); c.scale(pw,1); c.drawImage(pl.cv,-pl.W/2,-pl.H+2); c.restore(); }
    const au=starAura(), pulse=1+0.07*Math.sin(t*2.4); c.save(); c.translate(0,-34); c.scale(pulse,pulse); c.drawImage(au.cv,-au.W/2,-au.H/2); c.scale(1.5,1.5); c.globalAlpha=0.25; c.drawImage(au.cv,-au.W/2,-au.H/2); c.restore();
    if(q>=1){ const ry=starRays(); c.save(); c.translate(0,-36); c.rotate(t*0.28); c.globalAlpha=0.7; c.drawImage(ry.cv,-ry.W/2,-ry.H/2); c.restore();
      const r2=starRays2(); c.save(); c.translate(0,-36); c.rotate(-t*0.42); c.globalAlpha=0.6; c.drawImage(r2.cv,-r2.W/2,-r2.H/2); c.restore(); c.globalAlpha=1; }
    const gr=starGround(), gp=1+0.08*Math.sin(t*3); c.save(); c.translate(0,2); c.scale(gp,1); c.drawImage(gr.cv,-gr.W/2,-gr.H/2); c.restore();
    { const sl=starSeal(); c.save(); c.translate(0,1); c.scale(0.62,0.17); c.rotate(t*0.7); c.globalAlpha=0.95; c.drawImage(sl.cv,-sl.W/2,-sl.H/2); c.restore(); c.globalAlpha=1; }
    c.save(); c.translate(0,2); for(let k=0;k<2;k++){ const ph=fr(t*0.6+k*0.5); c.strokeStyle=(k?'rgba(143,227,255,':'rgba(255,170,220,')+((1-ph)*0.75).toFixed(2)+')'; c.lineWidth=3*(1-ph)+0.6; c.beginPath(); c.ellipse(0,0,16+78*ph,4+19*ph,0,0,7); c.stroke(); } c.restore();
    for(let k=0;k<4;k++){ const a=t*1.4+k*Math.PI/2; if(Math.sin(a)>0) continue; const im=starImg(k%3); c.globalAlpha=0.6; c.drawImage(im.cv,Math.cos(a)*30-9,-32+Math.sin(a)*10-9,18,18); } c.globalAlpha=1;
  } else {
    const n=q>=1?8:4;
    for(let k=0;k<n;k++){ const a=-t*1.5+k*Math.PI*2/n, sn=Math.sin(a); if(sn<=0 && k%2) continue; const sc=0.75+0.4*sn, sz=(12+6*Math.abs(Math.sin(t*3+k)))*sc, im=starImg(k%3); c.globalAlpha=0.55+0.4*Math.max(0,sn); c.drawImage(im.cv,Math.cos(a)*29-sz/2,-34+sn*11-sz/2,sz,sz); }
    c.globalAlpha=1;
    if(q>=1){ for(let k=0;k<2;k++){ for(let j=0;j<12;j++){ const a=t*2.6+k*Math.PI-j*0.1, sn=Math.sin(a); if(sn<=0) continue; const fade=1-j/12, sz=(j===0?15:9)*fade+3, im=starImg(k?2:1); c.globalAlpha=fade*0.9; c.drawImage(im.cv,Math.cos(a)*46-sz/2,-34+sn*22-sz/2,sz,sz); } } c.globalAlpha=1; }
    const m=q>=1?10:4;
    for(let i=0;i<m;i++){ const ph=fr(t*(0.5+0.3*fr(i*0.618))+i*0.37), x=Math.sin(i*12.99+t*0.7)*(8+18*ph), y=-2-ph*96, a=(1-ph)*0.9, im=(i%3===2)?starHeart():starImg(i%3), sz=(i%3===2?11:10)*(1-ph*0.5)+3; c.globalAlpha=a; c.drawImage(im.cv,x-sz/2,y-sz/2,sz,sz); }
    c.globalAlpha=1;
    if(q>=1){ for(let i=0;i<6;i++){ const ph=fr(t*0.8+i/6), x=60-ph*120+Math.sin(i*7)*8, y=-120+ph*130, a=Math.sin(ph*Math.PI), sz=9+4*Math.sin(i*3), im=starImg(i%3); c.globalAlpha=a*0.85; c.drawImage(im.cv,x-sz/2,y-sz/2,sz,sz); c.globalAlpha=a*0.4; c.drawImage(im.cv,x+9-sz*0.3,y-7-sz*0.3,sz*0.6,sz*0.6); } c.globalAlpha=1; }
    c.save(); c.translate(0,-76); c.rotate(Math.sin(t*1.2)*0.06); c.lineWidth=2.4; c.strokeStyle='rgba(255,226,140,0.95)'; c.beginPath(); c.ellipse(0,0,15,4.2,0,0,7); c.stroke(); c.lineWidth=1; c.strokeStyle='rgba(255,255,255,0.8)'; c.beginPath(); c.ellipse(0,0,15,4.2,0,0,7); c.stroke();
    for(let k=0;k<5;k++){ const a=t*2+k*Math.PI*2/5, sz=6+1.5*Math.sin(t*5+k), im=starImg(k%3); c.drawImage(im.cv,Math.cos(a)*15-sz/2,Math.sin(a)*4.2-sz/2,sz,sz); }
    { const im=starImg(1), sz=14+2.5*Math.sin(t*4); c.drawImage(im.cv,-sz/2,-4.2-8-sz/2,sz,sz); } c.restore();
  }
  c.restore();
}
function starImg(ci){ return starSprite('star'+ci,48,48,(c)=>{
  const g=c.createRadialGradient(0,0,1,0,0,22); g.addColorStop(0,'rgba(255,255,255,0.9)'); g.addColorStop(0.35,STAR_COL[ci]+'99'); g.addColorStop(1,STAR_COL[ci]+'00'); c.fillStyle=g; c.beginPath(); c.arc(0,0,22,0,7); c.fill();
  starPath(c,15,4.2,4); c.fillStyle='#ffffff'; c.fill(); starPath(c,15,4.2,4); c.lineWidth=2.4; c.strokeStyle=STAR_COL[ci]; c.stroke(); }); }
function starAura(){ return starSprite('aura',170,210,(c,W,H)=>{ c.scale(0.82,1.1);
  const g=c.createRadialGradient(0,0,4,0,0,76); g.addColorStop(0,'rgba(255,214,235,0.55)'); g.addColorStop(0.5,'rgba(255,143,208,0.26)'); g.addColorStop(0.8,'rgba(143,227,255,0.12)'); g.addColorStop(1,'rgba(143,227,255,0)'); c.fillStyle=g; c.beginPath(); c.arc(0,0,76,0,7); c.fill(); }); }
function starRays(){ return starSprite('rays',230,230,(c)=>{ for(let k=0;k<10;k++){ const a=k*Math.PI/5, w=0.075; const g=c.createRadialGradient(0,0,6,0,0,112); g.addColorStop(0,'rgba(255,230,160,0.24)'); g.addColorStop(1,'rgba(255,143,208,0)'); c.fillStyle=g; c.beginPath(); c.moveTo(0,0); c.arc(0,0,112,a-w,a+w); c.closePath(); c.fill(); } }); }
function starGround(){ return starSprite('ground',150,44,(c)=>{ c.scale(1,0.3); const g=c.createRadialGradient(0,0,2,0,0,70); g.addColorStop(0,'rgba(255,214,107,0.7)'); g.addColorStop(0.6,'rgba(255,143,208,0.3)'); g.addColorStop(1,'rgba(255,143,208,0)'); c.fillStyle=g; c.beginPath(); c.arc(0,0,70,0,7); c.fill(); }); }
function starHeart(){ return starSprite('heart',40,40,(c)=>{ c.scale(1.15,1.15); const g=c.createLinearGradient(0,-10,0,12); g.addColorStop(0,'#ffd9ee'); g.addColorStop(1,'#ff6fb5'); c.fillStyle=g; c.beginPath(); c.moveTo(0,10); c.bezierCurveTo(-14,-1,-9,-12,0,-5); c.bezierCurveTo(9,-12,14,-1,0,10); c.fill(); c.lineWidth=1.6; c.strokeStyle='#fff'; c.stroke(); }); }
function starSeal(){ return starSprite('seal',160,160,(c)=>{ c.lineJoin='round'; const g=c.createLinearGradient(-70,-70,70,70); g.addColorStop(0,'#fff2a8'); g.addColorStop(0.5,'#ff9ad5'); g.addColorStop(1,'#8fe3ff'); c.strokeStyle=g; c.lineWidth=3; c.beginPath(); c.arc(0,0,70,0,7); c.stroke(); c.lineWidth=1.6; c.beginPath(); c.arc(0,0,60,0,7); c.stroke(); c.lineWidth=2.6; c.beginPath(); for(let k=0;k<5;k++){ const a=-Math.PI/2+k*Math.PI*4/5; k?c.lineTo(Math.cos(a)*62,Math.sin(a)*62):c.moveTo(Math.cos(a)*62,Math.sin(a)*62); } c.closePath(); c.stroke(); for(let k=0;k<5;k++){ const a=-Math.PI/2+k*Math.PI*2/5; c.fillStyle='#fff6c8'; c.beginPath(); c.arc(Math.cos(a)*70,Math.sin(a)*70,4,0,7); c.fill(); } }); }
function starPillar(){ return starSprite('pillar',60,230,(c)=>{ const g=c.createLinearGradient(0,-110,0,110); g.addColorStop(0,'rgba(255,230,250,0)'); g.addColorStop(0.55,'rgba(255,170,225,0.07)'); g.addColorStop(1,'rgba(255,200,235,0.2)'); c.fillStyle=g; c.fillRect(-22,-110,44,220); c.fillStyle='rgba(255,255,255,0.07)'; c.fillRect(-6,-110,12,220); }); }
function starRays2(){ return starSprite('rays2',300,300,(c)=>{ for(let k=0;k<14;k++){ const a=k*Math.PI/7, w=0.045; const g=c.createRadialGradient(0,0,6,0,0,145); g.addColorStop(0,(k%2?'rgba(143,227,255,0.22)':'rgba(255,214,107,0.22)')); g.addColorStop(1,'rgba(255,143,208,0)'); c.fillStyle=g; c.beginPath(); c.moveTo(0,0); c.arc(0,0,145,a-w,a+w); c.closePath(); c.fill(); } }); }
function drawStarlightShow(c, t, layer){
  const fr=v=>v-Math.floor(v), q=(typeof fxQuality==='number')?fxQuality:2;
  c.save(); c.globalCompositeOperation='lighter';
  if(layer==='back'){
    { const pl=starPillar(), pw=1+0.08*Math.sin(t*3); c.save(); c.scale(pw,1); c.drawImage(pl.cv,-pl.W/2,-pl.H+2); c.restore(); }
    const au=starAura(), pulse=1+0.07*Math.sin(t*2.4); c.save(); c.translate(0,-34); c.scale(pulse,pulse); c.drawImage(au.cv,-au.W/2,-au.H/2); c.scale(1.5,1.5); c.globalAlpha=0.25; c.drawImage(au.cv,-au.W/2,-au.H/2); c.restore();
    if(q>=1){ const ry=starRays(); c.save(); c.translate(0,-36); c.rotate(t*0.28); c.globalAlpha=0.7; c.drawImage(ry.cv,-ry.W/2,-ry.H/2); c.restore();
      const r2=starRays2(); c.save(); c.translate(0,-36); c.rotate(-t*0.42); c.globalAlpha=0.6; c.drawImage(r2.cv,-r2.W/2,-r2.H/2); c.restore(); c.globalAlpha=1; }
    const gr=starGround(), gp=1+0.08*Math.sin(t*3); c.save(); c.translate(0,2); c.scale(gp,1); c.drawImage(gr.cv,-gr.W/2,-gr.H/2); c.restore();
    { const sl=starSeal(); c.save(); c.translate(0,1); c.scale(0.62,0.17); c.rotate(t*0.7); c.globalAlpha=0.95; c.drawImage(sl.cv,-sl.W/2,-sl.H/2); c.restore(); c.globalAlpha=1; }
    c.save(); c.translate(0,2); for(let k=0;k<2;k++){ const ph=fr(t*0.6+k*0.5); c.strokeStyle=(k?'rgba(143,227,255,':'rgba(255,170,220,')+((1-ph)*0.75).toFixed(2)+')'; c.lineWidth=3*(1-ph)+0.6; c.beginPath(); c.ellipse(0,0,16+78*ph,4+19*ph,0,0,7); c.stroke(); } c.restore();
    for(let k=0;k<4;k++){ const a=t*1.4+k*Math.PI/2; if(Math.sin(a)>0) continue; const im=starImg(k%3); c.globalAlpha=0.6; c.drawImage(im.cv,Math.cos(a)*30-9,-32+Math.sin(a)*10-9,18,18); } c.globalAlpha=1;
  } else {
    const n=q>=1?8:4;
    for(let k=0;k<n;k++){ const a=-t*1.5+k*Math.PI*2/n, sn=Math.sin(a); if(sn<=0 && k%2) continue; const sc=0.75+0.4*sn, sz=(12+6*Math.abs(Math.sin(t*3+k)))*sc, im=starImg(k%3); c.globalAlpha=0.55+0.4*Math.max(0,sn); c.drawImage(im.cv,Math.cos(a)*29-sz/2,-34+sn*11-sz/2,sz,sz); }
    c.globalAlpha=1;
    if(q>=1){ for(let k=0;k<2;k++){ for(let j=0;j<12;j++){ const a=t*2.6+k*Math.PI-j*0.1, sn=Math.sin(a); if(sn<=0) continue; const fade=1-j/12, sz=(j===0?15:9)*fade+3, im=starImg(k?2:1); c.globalAlpha=fade*0.9; c.drawImage(im.cv,Math.cos(a)*46-sz/2,-34+sn*22-sz/2,sz,sz); } } c.globalAlpha=1; }
    const m=q>=1?10:4;
    for(let i=0;i<m;i++){ const ph=fr(t*(0.5+0.3*fr(i*0.618))+i*0.37), x=Math.sin(i*12.99+t*0.7)*(8+18*ph), y=-2-ph*96, a=(1-ph)*0.9, im=(i%3===2)?starHeart():starImg(i%3), sz=(i%3===2?11:10)*(1-ph*0.5)+3; c.globalAlpha=a; c.drawImage(im.cv,x-sz/2,y-sz/2,sz,sz); }
    c.globalAlpha=1;
    if(q>=1){ for(let i=0;i<6;i++){ const ph=fr(t*0.8+i/6), x=60-ph*120+Math.sin(i*7)*8, y=-120+ph*130, a=Math.sin(ph*Math.PI), sz=9+4*Math.sin(i*3), im=starImg(i%3); c.globalAlpha=a*0.85; c.drawImage(im.cv,x-sz/2,y-sz/2,sz,sz); c.globalAlpha=a*0.4; c.drawImage(im.cv,x+9-sz*0.3,y-7-sz*0.3,sz*0.6,sz*0.6); } c.globalAlpha=1; }
    c.save(); c.translate(0,-76); c.rotate(Math.sin(t*1.2)*0.06); c.lineWidth=2.4; c.strokeStyle='rgba(255,226,140,0.95)'; c.beginPath(); c.ellipse(0,0,15,4.2,0,0,7); c.stroke(); c.lineWidth=1; c.strokeStyle='rgba(255,255,255,0.8)'; c.beginPath(); c.ellipse(0,0,15,4.2,0,0,7); c.stroke();
    for(let k=0;k<5;k++){ const a=t*2+k*Math.PI*2/5, sz=6+1.5*Math.sin(t*5+k), im=starImg(k%3); c.drawImage(im.cv,Math.cos(a)*15-sz/2,Math.sin(a)*4.2-sz/2,sz,sz); }
    { const im=starImg(1), sz=14+2.5*Math.sin(t*4); c.drawImage(im.cv,-sz/2,-4.2-8-sz/2,sz,sz); } c.restore();
  }
  c.restore();
}
function starPath(c, R, r, n){ c.beginPath(); for(let i=0;i<n*2;i++){ const a=-Math.PI/2+i*Math.PI/n, d=(i%2)?r:R; i?c.lineTo(Math.cos(a)*d,Math.sin(a)*d):c.moveTo(Math.cos(a)*d,Math.sin(a)*d); } c.closePath(); }
function starSpriteW(){
  if(_starSprite) return _starSprite;
  const cv=document.createElement('canvas'); cv.width=cv.height=96; const c=cv.getContext('2d'); c.translate(48,48);
  let g=c.createRadialGradient(0,0,2,0,0,46); g.addColorStop(0,'rgba(255,230,250,0.85)'); g.addColorStop(0.4,'rgba(255,150,215,0.35)'); g.addColorStop(1,'rgba(120,200,255,0)'); c.fillStyle=g; c.beginPath(); c.arc(0,0,46,0,7); c.fill();
  const star=(R,r)=>{ c.beginPath(); for(let k=0;k<10;k++){ const a=-Math.PI/2+k*Math.PI/5, rr=(k%2)?r:R; k?c.lineTo(Math.cos(a)*rr,Math.sin(a)*rr):c.moveTo(Math.cos(a)*rr,Math.sin(a)*rr); } c.closePath(); };
  g=c.createLinearGradient(-22,-22,22,22); g.addColorStop(0,'#fff2a8'); g.addColorStop(0.5,'#ff9ed8'); g.addColorStop(1,'#7fd8ff');
  c.lineJoin='round'; star(24,10); c.fillStyle=g; c.fill(); c.strokeStyle='#ffffff'; c.lineWidth=2.4; c.stroke();
  c.fillStyle='rgba(255,255,255,0.95)'; star(9,4); c.fill();
  return _starSprite=cv;
}
let _starSprite=null;