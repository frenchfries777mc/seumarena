const COSMETICS={};
const FLAME_RANGE=400, FLAME_HALF_ANGLE=0.32, FLAME_DIRECT_DPS=31;
const VAC_SKILL_R=330;
const VACUUM_RANGE=480, VACUUM_HALF_ANGLE=0.34;
const WEAPONS = {
  pistol:  {id:'pistol',  name:'권총',     emoji:'🔫', kind:'gun',      dmg:17, cd:0.85, bulletSpeed:950, shape:'bullet',
            desc:'데미지 17 · 연사속도 0.85초 · 준수한 위력과 안정적인 명중률의 표준형 권총'},
  smg:     {id:'smg',     name:'기관총',   emoji:'🔫', kind:'gun',      dmg:6, cd:2.2, bulletSpeed:900, shape:'bullet', spread:0.06, burst:10, burstDelay:0.04,
            desc:'데미지 6 · 클릭 한 번에 10발 연사 · 쿨타임 2.2초 · 탄이 약간씩 퍼지는 일제사격'},
  bow:     {id:'bow',     name:'활',       emoji:'🏹', kind:'gun',      dmg:35, cd:1.35, bulletSpeed:1100, shape:'arrow', arcs:true,
            desc:'데미지 30 · 재장전 1.35초 · 중력의 영향을 받아 포물선을 그리는 강력한 원거리 무기'},
  sword:   {id:'sword',   name:'칼',       emoji:'🗡️', kind:'melee',    dmg:32, cd:0.55, range:100, shape:'blade',
            desc:'데미지 32 · 쿨타임 0.55초 · 사거리 100 · 빠르고 날카로운 근접 베기'},
  shuriken:{id:'shuriken',name:'표창',     emoji:'⭐', kind:'gun',      dmg:14, cd:0.48, bulletSpeed:1050, shape:'star',
            desc:'데미지 14 · 쿨타임 0.48초 · 가볍고 빠르게 연속으로 던지는 투척 무기'},
  shotgun: {id:'shotgun', name:'샷건',     emoji:'💥', kind:'shotgun',  dmg:15, pellets:5, cd:1.2, bulletSpeed:850, shape:'pellet',
            dmgFalloff:{min:9, maxDist:700},
            desc:'근거리 펠릿당 최대 13(5발 다 맞으면 65), 멀어질수록 최소 9까지 감소 · 쿨타임 1.2초 · 넓게 퍼지는 산탄'},
  rifle:   {id:'rifle',   name:'돌격소총', emoji:'🔫', kind:'gun',      dmg:9,  cd:1.2,  bulletSpeed:1000, shape:'bullet', burst:3, burstDelay:0.07,
            desc:'데미지 9(3연발) · 쿨타임 1.2초 · 클릭 한 번에 총알 3발을 빠르게 연사하는 소총'},
  gloves:  {id:'gloves',  name:'권투글러브',emoji:'🥊', kind:'melee',   dmg:17, cd:0.25, range:70, shape:'fist',
            desc:'데미지 17 · 쿨타임 0.25초 · 사거리 70 · 빠르게 연타하는 잽'},
  grenade: {id:'grenade', name:'수류탄',   emoji:'💣', kind:'explosive',dmg:56, cd:2.0,  bulletSpeed:600, splash:145, shape:'bomb', arcs:true,
            desc:'데미지 56 · 폭발반경 145 · 쿨타임 2.0초 · 중력에 의해 포물선으로 떨어지며 범위 안 전원에게 피해(자신 포함)'},
  bazooka: {id:'bazooka', name:'바주카포', emoji:'🚀', kind:'explosive',dmg:60, cd:2.8,  bulletSpeed:750, splash:150, shape:'rocket', arcs:true,
            desc:'데미지 68 · 폭발반경 150 · 쿨타임 2.8초 · 중력의 영향을 받는 포물선 궤도, 최고 위력이지만 느린 재장전'},
  wizard:  {id:'wizard',  name:'마법사',   emoji:'🧙', kind:'gun',      dmg:14, cd:0.7,  bulletSpeed:750, shape:'fireball', pierce:true, pierceHits:1, platPierce:1, life:1.4,
            desc:'데미지 14(한 번 거치면 7) · 쿨타임 0.7초 · 사거리 김 · 발판을 한 번만 통과하고, 플레이어 한 명을 관통한 뒤 두 번째로 맞힌 상대에게서 멈추는 화염 마법'},
  magiccard:{id:'magiccard',name:'마술 카드',emoji:'🃏', kind:'cards',    dmg:10,  cd:0.75,  bulletSpeed:820, shape:'card', hitR:26, comboBonus:4, freeVolleys:2,
            desc:'트럼프 카드 3장이 넓게 퍼져 날아감 · 장당 데미지 10 · 쿨타임 0.75초 · 맞은 상대는 이동속도가 조금 느려짐 · 3장이 모두 맞으면 추가 4 데미지 + 0.5초 기절'},
  portalgun:{id:'portalgun',name:'포탈건',emoji:'🌀', kind:'gun', dmg:15, cd:0.5, bulletSpeed:700, shape:'portalbullet', bounces:3,
            desc:'데미지 15 · 쿨타임 0.5초 · 바닥이나 발판에 닿으면 최대 3번까지 튕기는 탄환 · 튕길 때마다 데미지 30% 증가 (최대 30)'},
  harald:{id:'harald',name:'전투 도끼',emoji:'🪓', kind:'melee', dmg:73, cd:1.2, range:125, shape:'axe', kbMult:2.6,
            desc:'데미지 73 · 쿨타임 1.2초 · 사거리 125 · 도끼를 번쩍 들어 내려찍음 (느리지만 매우 아프고 크게 밀쳐냄) · 도끼가 손에 없을 땐 방패로 밀침 (피해 절반, 쿨타임 0.75배, 넉백은 같음)'},
  samurai:{id:'samurai',name:'카타나',emoji:'⚔️', kind:'melee', dmg:36, cd:0.65, range:95, shape:'katana',
            desc:'데미지 36 · 쿨타임 0.65초 · 사거리 95 · 한 번 베면 묵직하게 들어가는 카타나'},
  shade:{id:'shade',name:'네온 대검',emoji:'🗡️', kind:'melee', dmg:50, cd:0.95, range:135, shape:'neon', kbMult:1.6,
            desc:'데미지 50 · 쿨타임 0.95초 · 사거리 135 · 범위 안의 적 모두에게 피해 · 민트색으로 빛나는 네온 대검 · 패시브: 기본 공격을 2번 연속으로 하면 다음 공격은 강타 (추가 피해 +5, 0.4초 기절)'},
  shsword:{id:'shsword',name:'네온 대검(던짐)',emoji:'🗡️', kind:'gun', dmg:15, cd:1, bulletSpeed:1300, shape:'shsword', hitR:14, life:0.42, desc:''},
  tionis:{id:'tionis',name:'연극 가면',emoji:'🎭', kind:'gun', dmg:13, cd:0.6, bulletSpeed:850, shape:'mask', hitR:14, life:0.9,
            desc:'데미지 13 · 쿨타임 0.6초 · 웃는 얼굴과 우는 얼굴의 연극 가면이 회전하며 날아감 (중장거리)'},
  sk_needle:{id:'sk_needle',name:'바늘',emoji:'', kind:'none', dmg:0, cd:999999, shape:'needle', desc:'스킬 전용 투사체'},
  sk_lasso:{id:'sk_lasso',name:'올가미',emoji:'', kind:'none', dmg:0, cd:999999, shape:'boomerang', desc:'스킬 전용 투사체'},
  sk_potion:{id:'sk_potion',name:'물약',emoji:'', kind:'none', dmg:0, cd:999999, shape:'potion', desc:'스킬 전용 투사체'},
  sk_orb:{id:'sk_orb',name:'구슬',emoji:'', kind:'none', dmg:0, cd:999999, shape:'cleonorb', desc:'스킬 전용 투사체'},
  syringe:{id:'syringe',name:'주사기',emoji:'💉', kind:'none', dmg:20, cd:999999, bulletSpeed:900, shape:'syringe', hitR:10, life:0.6, desc:'티오니스의 채혈 주사기 (스킬 전용)'},
  guard:{id:'guard',name:'에너지 창',emoji:'🔱', kind:'melee', dmg:15, cd:0.75, range:130, shape:'spear', thrust:true, kbMult:1.2, desc:'근위병의 창 (소환 전용)'},
  none: {id:'none', name:'맨손', emoji:'', kind:'none', dmg:0, cd:999999, shape:'none', desc:'무기 없음'}
};
const WEAPON_PERSONA_NAME = {
  tionis:'티오니스', harald:'바이킹', 
  pistol:'제임스', smg:'특수요원', bow:'궁수', sword:'기사', 
  shuriken:'닌자', shotgun:'보안관', rifle:'군인', gloves:'복서', grenade:'폭발광',
  bazooka:'중화기병', magiccard:'마술사', wizard:'마법사', portalgun:'차원여행자', shade:'네온', samurai:'사무라이'};
let PERSONA_FACE=1;
let DS_FLAME_NOW=false, BOW_P=null, TELL_P=null;
function hslHex(h,sat,l){ h=((h%360)+360)%360; sat/=100; l/=100; const k=n=>(n+h/30)%12, a=sat*Math.min(l,1-l), f=n=>{ const v=l-a*Math.max(-1,Math.min(k(n)-3,Math.min(9-k(n),1))); return Math.round(v*255).toString(16).padStart(2,'0'); }; return '#'+f(0)+f(8)+f(4); }
function nnPal(cp){      // 네온's colours: the mint of the base figure, or one of its skins
  switch(cp){
    case 'nnpink': return {a:'#ff5ac8', b:'#ffb0ea', d:'#2a0b22'};
    case 'tk': return TK_AW ? {a:'#ffd34d', b:'#fff3b0', d:'#2a1a04'} : {a:'#ff8a2a', b:'#ffd08a', d:'#2a1206'};
    case 'nnplasma': return {a:'#b28cff', b:'#e0d2ff', d:'#160b2a'};
    case 'nnrain': { const h=(performance.now()/14)%360; return {a:hslHex(h,100,66), b:hslHex(h+40,100,84), d:'#10121c'}; }
    default: return {a:'#7dffd8', b:'#9dffe6', d:'#0b1c1a'};
  }
}
function kdPal(cp){      // 카다스's colours: purple, or one of its skins
  switch(cp){
    case 'kdred': return {a:'#ff2a4a', b:'#ffa0ac', wing:'#3a0812', mid:'#6a1020'};
    case 'kdhell': return {a:'#ff8a2a', b:'#ffd79a', wing:'#3a1606', mid:'#7a2e08'};
    case 'kdvoid': { const h=250+Math.sin(performance.now()/900)*30; return {a:hslHex(h,95,66), b:hslHex(h,90,88), wing:'#0a0a2a', mid:'#1a1a5a'}; }
    default: return {a:'#9a4cff', b:'#c9a0ff', wing:'#24083a', mid:'#3a1668'};
  }
}
function drawWeaponPersona(c,wid,hx,hy,r,shy,tint,concept){
  c.save();
  if(concept==='tk' && typeof tkPersona==='function' && tkPersona(c,wid,hx,hy,r,shy)){ c.restore(); return; }      // 칠면조 스킨 (art/tkart.js)
  switch(wid){
    case 'guard': drawSpacePersona(c,wid,hx,hy,r,shy,tint); break;
    case 'tionis': drawSpacePersona(c,wid,hx,hy,r,shy,tint);
      if(concept==='janus'){ mythTunic(c,hx,shy,'#d9b648',false); mythLaurel(c,hx,hy,r); }      // 야누스 티오니스: only a white tunic and a laurel wreath are new
      break;
    case 'herbal': if(typeof hbHood==='function') hbHood(c,hx,hy,r,1,tint); break;
    case 'shieldman': if(typeof hbHelm==='function') hbHelm(c,hx,hy,r,1,tint,performance.now()/1000); break;
    case 'gardener': if(typeof gdHat==='function') gdHat(c,hx,hy,r,1,performance.now()/1000,tint); break;
    case 'shade': { // 네온: a thin glowing visor (the colour follows the skin)
      const vc=tint||'#7dffd8'; c.save(); c.shadowColor=vc; c.shadowBlur=6; c.fillStyle='#0b1018'; c.strokeStyle=vc; c.lineWidth=1.2; c.beginPath(); c.roundRect(hx-r*0.95,hy-r*0.42,r*1.9,r*0.62,2); c.fill(); c.stroke(); c.restore();
      break; }
    case 'pistol': // 제임스: 선글라스 + 넥타이
      if(concept==='zeus'){      // 신 중의 신 제임스: white tunic, long white beard, white hair, bushy white brows
        mythTunic(c,hx,shy,'#d9b648',true);
        c.fillStyle='#fbfbfd'; c.strokeStyle='#c8ccd8'; c.lineWidth=0.6; c.beginPath(); c.arc(hx,hy-0.8,r+1.3,Math.PI*0.9,Math.PI*2.1); c.lineTo(hx+r*0.7,hy-r*0.35); c.quadraticCurveTo(hx,hy-r*0.95,hx-r*0.7,hy-r*0.35); c.closePath(); c.fill(); c.stroke();
        mythBeard(c,hx,hy,r,'#fbfbfd','#c8ccd8',1.35);
        c.strokeStyle='#fbfbfd'; c.lineWidth=1.6; c.lineCap='round'; c.beginPath(); c.moveTo(hx-5,hy-2.2); c.lineTo(hx-1.4,hy-2.8); c.moveTo(hx+1.4,hy-2.8); c.lineTo(hx+5,hy-2.2); c.stroke();
        c.fillStyle='#1a1a1a'; c.beginPath(); c.arc(hx-3,hy-0.2,0.9,0,7); c.arc(hx+3,hy-0.2,0.9,0,7); c.fill();
        break;
      }
      c.fillStyle='#1a1a1a';
      c.beginPath(); c.ellipse(hx-3.3,hy-1,3.2,2.1,0,0,7); c.fill();
      c.beginPath(); c.ellipse(hx+3.3,hy-1,3.2,2.1,0,0,7); c.fill();
      c.lineWidth=1.2; c.beginPath(); c.moveTo(hx-0.8,hy-1); c.lineTo(hx+0.8,hy-1); c.stroke();
      c.fillStyle=tint||'#7a1620';
      c.beginPath(); c.moveTo(hx-2,shy+2); c.lineTo(hx+2,shy+2); c.lineTo(hx+3,shy+16); c.lineTo(hx,shy+20); c.lineTo(hx-3,shy+16); c.closePath(); c.fill();
      break;
    case 'smg': // 특수요원: 전술 고글 + 헤드셋
      c.fillStyle='#20242c'; c.fillRect(hx-r-1,hy-4,(r+1)*2,4);
      c.fillStyle=tint||'#5fd0ff'; c.beginPath(); c.ellipse(hx-3,hy-2,2.6,2,0,0,7); c.fill(); c.beginPath(); c.ellipse(hx+3,hy-2,2.6,2,0,0,7); c.fill();
      c.strokeStyle='#20242c'; c.lineWidth=2; c.beginPath(); c.arc(hx,hy,r+2,1.1,2.4); c.stroke();
      c.fillStyle='#20242c'; c.beginPath(); c.arc(hx+r+1,hy+2,1.8,0,7); c.fill();
      break;
    case 'bow': // 궁수: 초록 후드
      c.fillStyle=(concept==='cupid')?'#ffd0e4':(tint||'#2f6b3a');
      c.beginPath(); c.moveTo(hx-r-1,hy+1); c.quadraticCurveTo(hx,hy-r*2.4,hx+r+1,hy+1); c.quadraticCurveTo(hx,hy-r*0.3,hx-r-1,hy+1); c.fill();
      if(concept==='cupid'){      // 큐피트: heart-shaped eyes
        c.fillStyle='#ffffff'; c.beginPath(); c.arc(hx,hy+1,r*0.92,0,7); c.fill();
        c.fillStyle='#ff2e7e'; drawCardHeart(c,hx-3.4,hy+1.6,2.5); drawCardHeart(c,hx+3.4,hy+1.6,2.5);
      }
      break;
    case 'sword': // 기사: 중세 투구
      if(concept==='thor'){      // 토르 기사: a silver helmet with a wing on each side, a light-brown beard
        mythBeard(c,hx,hy,r,'#b88a5a','#7a5430',0.95);
        mythWings(c,hx,hy,r+2,'#f1f4fa','#8a93a6',2.6);
        c.fillStyle='#cfd6e4'; c.strokeStyle='#7d8799'; c.lineWidth=0.9; c.beginPath(); c.arc(hx,hy-1,r+2,Math.PI,0); c.fill(); c.stroke(); c.fillRect(hx-r-2,hy-1,(r+2)*2,4); c.strokeRect(hx-r-2,hy-1,(r+2)*2,4);
        c.fillStyle='#20242c'; c.fillRect(hx-r-1,hy-1.5,(r+2)*2-2,1.6);
        c.strokeStyle='#ffe66b'; c.lineWidth=0.9; c.beginPath(); c.moveTo(hx+0.5,hy-r-1.6); c.lineTo(hx-1.2,hy-r*0.5); c.lineTo(hx+1,hy-r*0.5); c.lineTo(hx-0.6,hy-1.5); c.stroke();
        break;
      }
      c.fillStyle=tint||'#c7ccd6';
      c.beginPath(); c.arc(hx,hy-1,r+2,Math.PI,0); c.fill(); c.fillRect(hx-r-2,hy-1,(r+2)*2,4);
      c.fillStyle='#20242c'; c.fillRect(hx-r-1,hy-1.5,(r+2)*2-2,1.6);
      break;
    case 'shuriken': // 닌자: 두건
      c.fillStyle=tint||'#15161c';
      c.beginPath(); c.arc(hx,hy,r+1.5,0,7); c.fill();
      c.fillStyle='#e8eaf0'; c.fillRect(hx-r-1,hy-2,(r+1)*2+2,2.4);
      break;
    case 'shotgun': // 보안관: 카우보이 모자
      c.fillStyle=tint||'#6b4423';
      c.beginPath(); c.ellipse(hx,hy-r*0.62,r+6,2.6,0,0,7); c.fill();      // (the brim sits well above the middle of the head, so the top of the head no longer sticks out over the hat)
      c.beginPath(); c.moveTo(hx-r*0.78,hy-r*0.62); c.quadraticCurveTo(hx,hy-r*2.9,hx+r*0.78,hy-r*0.62); c.closePath(); c.fill();
      break;
    case 'rifle': // 군인: 방탄모
      c.fillStyle=tint||'#4b5a3a';
      c.beginPath(); c.arc(hx,hy-1,r+2,Math.PI,0); c.fill(); c.fillRect(hx-r-2,hy-1,(r+2)*2,2.5);
      break;
    case 'gloves': // 복서: 헤드기어
      if(concept==='gilga'){      // 길가메시 복서 (the Assyrian hero-and-lion relief): big curled hair and beard, a gold band, a gold-belted kilt, a lion cub in his arm
        c.fillStyle='#17141b'; for(let i=0;i<11;i++){ const a=Math.PI*(0.82+1.36*i/10); c.beginPath(); c.arc(hx+Math.cos(a)*(r+1.2),hy+Math.sin(a)*(r+1.2),2.6,0,7); c.fill(); }
        c.fillStyle='#17141b'; for(let row=0;row<3;row++) for(let k=-2+row*0.5;k<=2-row*0.5+0.01;k++){ c.beginPath(); c.arc(hx+k*3,hy+r*0.62+row*3.1,1.9,0,7); c.fill(); }
        c.fillStyle='#e9b92e'; c.strokeStyle='#8a6a22'; c.lineWidth=0.7; c.fillRect(hx-r-0.4,hy-4.4,(r+0.4)*2,2.2); c.strokeRect(hx-r-0.4,hy-4.4,(r+0.4)*2,2.2);
        c.fillStyle='#d63a3a'; c.beginPath(); c.arc(hx,hy-3.3,1.1,0,7); c.fill();
        c.fillStyle='#c8a368'; c.strokeStyle='#6b4a1a'; c.lineWidth=0.7; c.beginPath(); c.moveTo(hx-5.2,shy+12.5); c.lineTo(hx+5.2,shy+12.5); c.lineTo(hx+8,shy+27); c.lineTo(hx-8,shy+27); c.closePath(); c.fill(); c.stroke();
        c.strokeStyle='#e9b92e'; c.lineWidth=1.1; for(let k=-7;k<=7;k+=2.8){ c.beginPath(); c.moveTo(hx+k,shy+27); c.lineTo(hx+k*0.98,shy+29.4); c.stroke(); }
        c.fillStyle='#e9b92e'; c.fillRect(hx-5.6,shy+11,11.2,2.8); c.strokeRect(hx-5.6,shy+11,11.2,2.8);
        { const bx=hx-9.5, by=shy+9;      // the lion cub held against his side
          c.fillStyle='#d9a441'; c.strokeStyle='#8a5a1a'; c.lineWidth=0.7; c.beginPath(); c.ellipse(bx,by+1.6,6.4,3.6,-0.25,0,7); c.fill(); c.stroke();
          c.fillStyle='#a8651f'; c.beginPath(); c.arc(bx-6,by-0.6,4,0,7); c.fill(); c.fillStyle='#e8b86a'; c.beginPath(); c.arc(bx-6,by-0.2,2.5,0,7); c.fill();
          c.fillStyle='#17141b'; c.beginPath(); c.arc(bx-6.9,by-0.9,0.5,0,7); c.arc(bx-5.1,by-0.9,0.5,0,7); c.fill();
          c.strokeStyle='#8a5a1a'; c.lineWidth=0.9; c.beginPath(); c.moveTo(bx+6,by+1); c.quadraticCurveTo(bx+9,by-2,bx+8,by-5); c.stroke(); }
        break;
      }
      c.fillStyle=tint||'#c23a3a'; c.beginPath(); c.arc(hx,hy,r+2,0,7); c.fill();
      c.fillStyle='#1a1a1a'; c.beginPath(); c.arc(hx,hy+r+1,1.6,0,7); c.fill();
      break;
    case 'grenade': // 폭발광: 이마 위 방폭고글
      c.strokeStyle='#2a2a2a'; c.lineWidth=2; c.beginPath(); c.arc(hx,hy-r*1.15,r*0.75,0,7); c.stroke();
      c.fillStyle=tint||'#8ee6ff'; c.beginPath(); c.arc(hx,hy-r*1.15,r*0.55,0,7); c.fill();
      break;
    case 'bazooka': // 중화기병: 방독면
      c.fillStyle=tint||'#38403a'; c.beginPath(); c.arc(hx,hy+1,r-0.5,0,Math.PI); c.fill();
      c.fillStyle='#c9d6c0'; c.beginPath(); c.arc(hx-3,hy,2,0,7); c.fill(); c.beginPath(); c.arc(hx+3,hy,2,0,7); c.fill();
      c.fillStyle='#38403a'; c.beginPath(); c.arc(hx+r,hy+2,2,0,7); c.fill();
      break;
    case 'magiccard':
      if(concept==='uno'){      // 우노 마술사: a black top hat with a yellow card band and a fan of four Uno cards poking out (not the red christmas silk hat)
        drawHat(c,'hat_tophat',hx,hy,r,'#17181f');
        const fan=[['#e8252b',-0.62],['#ffd21f',-0.2],['#2ba84a',0.2],['#2b6fe8',0.62]];
        for(const [col,an] of fan){ c.save(); c.translate(hx,hy-r*2.35); c.rotate(an); c.fillStyle='#fff'; c.fillRect(-3.4,-9.4,6.8,10.4); c.fillStyle=col; c.fillRect(-2.6,-8.6,5.2,8.8); c.restore(); }
        c.fillStyle='#ffd21f'; c.fillRect(hx-r*0.9,hy-r*1.28,r*1.8,2.6);
        c.fillStyle='#e8252b'; c.fillRect(hx-1.6,hy-r*1.28,3.2,2.6);
        break; }
      drawHat(c,'hat_tophat',hx,hy,r,tint); break;
    case 'harald': { // 하랄드: 뿔 달린 바이킹 투구 + 갈색 수염
      c.fillStyle='#6b3f1f'; c.strokeStyle='#4a2a12'; c.lineWidth=1.2; c.beginPath(); c.moveTo(hx-r+0.5,hy+1.5); c.quadraticCurveTo(hx-r-1.5,hy+r+6,hx,hy+r+12); c.quadraticCurveTo(hx+r+1.5,hy+r+6,hx+r-0.5,hy+1.5); c.quadraticCurveTo(hx,hy+r*0.5,hx-r+0.5,hy+1.5); c.closePath(); c.fill(); c.stroke();
      c.strokeStyle='#8a5a30'; c.lineWidth=1; c.beginPath(); c.moveTo(hx-3,hy+r+1); c.lineTo(hx-2,hy+r+8); c.moveTo(hx+3,hy+r+1); c.lineTo(hx+2,hy+r+8); c.stroke();
      c.strokeStyle='#efe6cf'; c.lineWidth=3.2; c.lineCap='round';
      for(const s of [-1,1]){ c.beginPath(); c.moveTo(hx+s*(r+0.6),hy-3); c.quadraticCurveTo(hx+s*(r+8),hy-3,hx+s*(r+6.5),hy-r-7); c.stroke(); }
      c.fillStyle=tint||'#9aa3b0'; c.strokeStyle=tint?mixHex(tint,'#000000',0.45):'#5d6672'; c.lineWidth=1.2; c.beginPath(); c.arc(hx,hy-1.5,r+1.4,Math.PI,0); c.closePath(); c.fill(); c.stroke();
      c.fillStyle=tint?mixHex(tint,'#000000',0.45):'#5d6672'; c.fillRect(hx-r-1.6,hy-3,(r+1.6)*2,3.4);
      c.fillStyle='#c9ced6'; c.fillRect(hx-1,hy-2,2,7);
      c.fillStyle='#e0b24a'; c.beginPath(); c.arc(hx,hy-r*0.9,1.4,0,7); c.fill();
      break; }
    case 'samurai': // 사무라이: 상투 + 붉은 머리띠
      c.fillStyle='#1b1b22'; c.beginPath(); c.arc(hx,hy-r-3,3.4,0,7); c.fill(); c.fillRect(hx-1,hy-r-1,2,4);
      c.fillStyle=tint||'#c62828'; c.fillRect(hx-r-0.5,hy-r*0.55,(r+0.5)*2,3); c.beginPath(); c.moveTo(hx-r,hy-r*0.55); c.lineTo(hx-r-7,hy-r*0.1); c.lineTo(hx-r-2,hy-r*0.55); c.closePath(); c.fill();
      break;
    case 'portalgun': // 차원여행자: 보라색 렌즈 고글
      c.fillStyle='#2a1a3a';
      c.beginPath(); c.arc(hx,hy-1,r+1.5,0,7); c.fill();
      c.fillStyle=tint||'#a855f7';
      c.beginPath(); c.arc(hx-3.3,hy-1,2.6,0,7); c.fill();
      c.beginPath(); c.arc(hx+3.3,hy-1,2.6,0,7); c.fill();
      c.fillStyle='#e9d5ff';
      c.beginPath(); c.arc(hx-3.3,hy-1,1,0,7); c.fill();
      c.beginPath(); c.arc(hx+3.3,hy-1,1,0,7); c.fill();
      break;
    case 'wizard': // 마법사: 빨간 마법사 모자, 아래쪽 금색 띠 + 꼬불꼬불한 뾰족 끝
      if(concept==='starlight'){      // 별빛 사과 마법사: a pink-to-sky hat with a gold band, a gold star on the tip and a few little stars
        const hg=c.createLinearGradient(hx-r,hy,hx+r,hy-r*4); hg.addColorStop(0,'#7fd8ff'); hg.addColorStop(0.55,'#ff9ed8'); hg.addColorStop(1,'#ffd9f0');
        c.fillStyle=hg; c.beginPath(); c.moveTo(hx-r-3,hy-1); c.quadraticCurveTo(hx-r*0.3,hy-r*2.6,hx+r*0.9,hy-r*3.4); c.quadraticCurveTo(hx+r*1.4,hy-r*3.5,hx+r*1.2,hy-r*3.9);
        c.quadraticCurveTo(hx+r*0.5,hy-r*3.2,hx+r*0.3,hy-r*1.9); c.quadraticCurveTo(hx+r*0.8,hy-r*1.2,hx+r+3,hy-1); c.closePath(); c.fill();
        c.fillStyle='#ffd34d'; c.fillRect(hx-r-3,hy-3.4,(r+3)*2,2.8);
        const st=(x,y,R,col)=>{ c.fillStyle=col; c.beginPath(); for(let k=0;k<10;k++){ const a=-Math.PI/2+k*Math.PI/5, rr=(k%2)?R*0.45:R; k?c.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr):c.moveTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr); } c.closePath(); c.fill(); };
        st(hx+r*1.25,hy-r*4.1,r*0.62,'#ffe27a'); st(hx-r*0.2,hy-r*1.45,r*0.28,'#ffffff'); st(hx+r*0.55,hy-r*2.4,r*0.22,'#fff6c0');
        break;
      }
      c.fillStyle=tint||'#c81e2c';
      c.beginPath();
      c.moveTo(hx-r-2, hy-1);
      c.quadraticCurveTo(hx-r*0.3, hy-r*2.6, hx+r*0.9, hy-r*3.4);
      c.quadraticCurveTo(hx+r*1.8, hy-r*3.9, hx+r*1.1, hy-r*4.6);
      c.quadraticCurveTo(hx+r*0.5, hy-r*4.0, hx+r*0.8, hy-r*3.0);
      c.quadraticCurveTo(hx+r*0.2, hy-r*1.8, hx+r+2, hy-1);
      c.closePath();
      c.fill();
      c.fillStyle='#ffd34d';
      c.fillRect(hx-r-2, hy-3.2, (r+2)*2, 2.4);
      break;
  }
  c.restore();
}
function drawHat(c,id,hx,hy,r,tintOverride){
  const it=COSMETICS[id]; if(!it) return;
  c.save(); c.fillStyle=tintOverride||it.color; c.strokeStyle=tintOverride||it.color; c.lineWidth=2;
  if(id==='hat_beanie'){
    c.beginPath(); c.arc(hx,hy-1,r+1.5,Math.PI,0); c.fill();
    c.fillStyle='#fff'; c.fillRect(hx-r-1.5,hy-4,(r+1.5)*2,3);
    c.beginPath(); c.arc(hx,hy-r-3,2.6,0,7); c.fill();
  } else if(id==='hat_cap'){
    c.beginPath(); c.arc(hx,hy-1,r+1,Math.PI,0); c.fill();
    c.fillRect(hx,hy-3,r+9,3);
  } else if(id==='hat_party'){
    c.beginPath(); c.moveTo(hx-r*0.75,hy-r*0.55); c.lineTo(hx,hy-r*2.7); c.lineTo(hx+r*0.75,hy-r*0.55); c.closePath(); c.fill();
    c.fillStyle='#ffe066'; c.beginPath(); c.arc(hx,hy-r*2.7,2.4,0,7); c.fill();
  } else if(id==='hat_tophat'){
    c.fillRect(hx-r*1.35,hy-r*0.85,r*2.7,3);
    c.fillRect(hx-r*0.8,hy-r*2.5,r*1.6,r*1.7);
    c.fillStyle='#d62839'; c.fillRect(hx-r*0.8,hy-r*1.3,r*1.6,3);
  } else if(id==='hat_halo'){
    c.beginPath(); c.ellipse(hx,hy-r-6,r*0.95,3,0,0,7); c.stroke();
  } else if(id==='hat_crown'){
    const y0=hy-r*0.6;
    c.beginPath(); c.moveTo(hx-r,y0); c.lineTo(hx-r,y0-r*1.3); c.lineTo(hx-r*0.5,y0-r*0.6); c.lineTo(hx,y0-r*1.5);
    c.lineTo(hx+r*0.5,y0-r*0.6); c.lineTo(hx+r,y0-r*1.3); c.lineTo(hx+r,y0); c.closePath(); c.fill();
    c.fillStyle='#d62839'; c.beginPath(); c.arc(hx,y0-r*0.5,1.8,0,7); c.fill();
  }
  c.restore();
}
function drawSpacePersona(c, wid, hx, hy, r, shy, tint){       // the looks follow the 0.9 intro picture
  const face=(rr,col)=>{ c.fillStyle=col; c.beginPath(); c.arc(hx,hy,rr,0,7); c.fill(); };
  switch(wid){
    case 'guard': {
      c.fillStyle='#aeb7d6'; c.strokeStyle='#1a0a30'; c.lineWidth=0.9; c.beginPath(); c.rect(hx-5.2,shy+0.5,10.4,16); c.fill(); c.stroke();                                // the armour
      c.fillStyle='#8a4be0'; c.fillRect(hx-5.2,shy+7,10.4,1.6);
      face(r-1.7,'#16121f');
      c.strokeStyle='#ff5ac8'; c.lineWidth=1.7; c.lineCap='round'; c.beginPath(); c.moveTo(hx-3.2,hy+1.6); c.lineTo(hx+3.2,hy+1.6); c.stroke();
      c.fillStyle='#aeb7d6'; c.strokeStyle='#1a0a30'; c.lineWidth=1; c.beginPath(); c.arc(hx,hy-0.5,r+1.2,Math.PI*0.97,Math.PI*2.03); c.lineTo(hx+r+0.4,hy+3.2); c.lineTo(hx+r-2,hy+3.2); c.lineTo(hx+r-2,hy-1.4); c.lineTo(hx-r+2,hy-1.4); c.lineTo(hx-r+2,hy+3.2); c.lineTo(hx-r-0.4,hy+3.2); c.closePath(); c.fill(); c.stroke();
      { const k=r/9; c.fillStyle='#8a4be0'; c.beginPath(); c.moveTo(hx-0.5*k,hy-r-1); c.quadraticCurveTo(hx+2.4*k,hy-r-9.3*k,hx+8*k,hy-r-4.5*k); c.quadraticCurveTo(hx+4*k,hy-r-4.3*k,hx+3*k,hy-r-1); c.closePath(); c.fill(); } break; }
    case 'tionis': {
      c.fillStyle=tint||'#2f7de1'; c.fillRect(hx-5.4,shy+1.5,3.6,16); c.fillStyle='#ff8a1f'; c.fillRect(hx-1.8,shy+1.5,3.6,16); c.fillStyle=tint||'#2f7de1'; c.fillRect(hx+1.8,shy+1.5,3.6,16);      // the striped vest
      c.fillStyle='#ffd34d'; for(const dy of [5,10,15]){ c.beginPath(); c.arc(hx,shy+dy,0.9,0,7); c.fill(); }
      c.fillStyle='#ffffff'; c.strokeStyle='#8b93a3'; c.lineWidth=0.8; c.beginPath(); c.moveTo(hx-7,shy-1); for(let i=-3;i<=3;i++) c.lineTo(hx+i*2.3, shy+((i&1)?3.2:0.2)); c.lineTo(hx+7,shy-1); c.closePath(); c.fill(); c.stroke();     // the ruff
      c.fillStyle='#f4f4f4'; c.beginPath(); c.arc(hx,hy,r-1.1,Math.PI/2,Math.PI*1.5); c.fill(); c.fillStyle='#16161c'; c.beginPath(); c.arc(hx,hy,r-1.1,-Math.PI/2,Math.PI/2); c.fill();
      c.strokeStyle='#16161c'; c.lineWidth=1; c.beginPath(); c.arc(hx-3.4,hy+1.7,2.4,0.2,Math.PI-0.2); c.stroke();
      c.strokeStyle='#f4f4f4'; c.beginPath(); c.arc(hx+3.4,hy+4.2,2.4,Math.PI+0.2,Math.PI*2-0.2); c.stroke();
      c.fillStyle='#16161c'; c.beginPath(); c.arc(hx-3.4,hy-1.6,0.9,0,7); c.fill(); c.fillStyle='#f4f4f4'; c.beginPath(); c.arc(hx+3.4,hy-1.6,0.9,0,7); c.fill();
      c.fillStyle='#2f7de1'; c.beginPath(); c.moveTo(hx-r*0.9,hy-r*0.45); c.quadraticCurveTo(hx-r*1.2,hy-r*1.7,hx-r*2.0,hy-r*2.0); c.quadraticCurveTo(hx-r*0.7,hy-r*1.5,hx,hy-r*0.95); c.closePath(); c.fill();     // the jester hat
      c.fillStyle='#ff8a1f'; c.beginPath(); c.moveTo(hx+r*0.9,hy-r*0.45); c.quadraticCurveTo(hx+r*1.2,hy-r*1.7,hx+r*2.0,hy-r*2.0); c.quadraticCurveTo(hx+r*0.7,hy-r*1.5,hx,hy-r*0.95); c.closePath(); c.fill();
      c.fillStyle='#ffd34d'; for(const q of [[-2.0,-2.0],[2.0,-2.0],[0,-1.0]]){ c.beginPath(); c.arc(hx+q[0]*r,hy+q[1]*r,1.9,0,7); c.fill(); } break; }
  }
}
const SPACE_HELD={tionis:1, guard:1};
function drawSpaceHeld(c, wid, ax, ay, hx, hy){
  const ang=Math.atan2(ay,ax); c.save(); c.translate(hx,hy); c.rotate(ang); c.lineCap='round';
  if(wid==='tionis'){
    c.rotate(-ang); const mx=Math.cos(ang)*14, my=Math.sin(ang)*14; c.translate(mx,my);
    c.fillStyle='#f4f4f4'; c.beginPath(); c.arc(0,0,6,Math.PI/2,Math.PI*1.5); c.fill(); c.fillStyle='#16161c'; c.beginPath(); c.arc(0,0,6,-Math.PI/2,Math.PI/2); c.fill();
  } else if(wid==='guard'){
    c.strokeStyle='#20232b'; c.lineWidth=3.4; c.beginPath(); c.moveTo(-8,0); c.lineTo(46,0); c.stroke();
    c.strokeStyle='#ff7ac8'; c.lineWidth=1.4; c.beginPath(); c.moveTo(-4,0); c.lineTo(44,0); c.stroke();
    c.globalCompositeOperation='lighter'; const fl=1+0.15*Math.sin(performance.now()/45);
    c.fillStyle='rgba(255,100,190,0.9)'; c.beginPath(); c.moveTo(44,-4*fl); c.lineTo(66*fl,0); c.lineTo(44,4*fl); c.closePath(); c.fill();
    const g=c.createRadialGradient(54,0,0,54,0,16); g.addColorStop(0,'rgba(255,200,240,0.7)'); g.addColorStop(1,'rgba(255,100,190,0)'); c.fillStyle=g; c.beginPath(); c.arc(54,0,16,0,7); c.fill();
  }
  c.restore();
}
/* ---------- 하랄드 (ported from Stickseum's drawHaraldBody): axe in one hand, round shield in the other; the axe is thrown for the ultimate, then the shield leads the charge ---------- */
let HD_F = null;                                       // the fighter being drawn (set by tail.js through haraldCtx just before drawStick; null for the lobby)
function haraldCtx(f) {
  if (f && f.h && f.h.id === 'harald') { const sw = f.swing || 0; if (sw > (f._hdSw || 0) + 1e-4) f._hdAt = performance.now(); f._hdSw = sw; HD_F = f; } else HD_F = null;
}
const hdLerp = (a, b, k) => a + (b - a) * k;
function hdArm(c, sx, sy, hx, hy) {                    // a two-bone arm, the elbow bends downwards
  const U = 14, L = 15, dx = hx - sx, dy = hy - sy; let d = Math.hypot(dx, dy) || 1; const reach = U + L - .6;
  if (d > reach) { hx = sx + dx / d * reach; hy = sy + dy / d * reach; d = reach; }
  const a = (U * U - L * L + d * d) / (2 * d), h = Math.sqrt(Math.max(0, U * U - a * a)), mx = sx + dx / d * a, my = sy + dy / d * a;
  const e1x = mx - dy / d * h, e1y = my + dx / d * h, e2x = mx + dy / d * h, e2y = my - dx / d * h, lo = e1y > e2y;
  const ex = lo ? e1x : e2x, ey = lo ? e1y : e2y;
  c.beginPath(); c.moveTo(sx, sy); c.lineTo(ex, ey); c.lineTo(hx, hy); c.stroke();
  return { x: hx, y: hy };
}
function hdAxe(c, x, y, th, f, k) {                    // handle from the hand outwards, the head at the end (the blade on the side it swings towards)
  c.save(); c.translate(x, y); c.rotate(th); c.scale(k, k * f); c.lineCap = 'round'; c.lineJoin = 'round';
  if (typeof TK_HD !== 'undefined' && TK_HD) { tkHdAxe(c); c.restore(); return; }
  c.strokeStyle = '#7a4a1f'; c.lineWidth = 3.8; c.beginPath(); c.moveTo(-9, 0); c.lineTo(41, 0); c.stroke();
  c.strokeStyle = '#4a2c10'; c.lineWidth = 1; c.beginPath(); c.moveTo(-9, -1.2); c.lineTo(41, -1.2); c.stroke();
  c.fillStyle = '#c9ced6'; c.strokeStyle = '#59616d'; c.lineWidth = 1.4;
  c.beginPath(); c.moveTo(30, 2); c.lineTo(32, 16); c.quadraticCurveTo(48, 12, 46, -7); c.quadraticCurveTo(41, -2, 37, -2.4); c.lineTo(30, -3); c.closePath(); c.fill(); c.stroke();
  c.strokeStyle = '#ffffff'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(33, 15); c.quadraticCurveTo(46, 11, 45, -5); c.stroke();
  c.restore();
}
function hdShield(c, x, y, rot, rx, ry, rim) {
  c.save(); c.translate(x, y); c.rotate(rot);
  if (typeof TK_HD !== 'undefined' && TK_HD) { tkHdShield(c, rx, ry); c.restore(); return; }
  c.fillStyle = '#8b5a2b'; c.strokeStyle = '#3a2616'; c.lineWidth = 2; c.beginPath(); c.ellipse(0, 0, rx, ry, 0, 0, 7); c.fill(); c.stroke();
  c.strokeStyle = '#3a2616'; c.lineWidth = 1; c.beginPath(); c.moveTo(-rx * .4, -ry * .85); c.lineTo(-rx * .4, ry * .85); c.moveTo(rx * .4, -ry * .85); c.lineTo(rx * .4, ry * .85); c.stroke();
  c.strokeStyle = rim || '#d8dde6'; c.lineWidth = 1.8; c.beginPath(); c.ellipse(0, 0, rx * .82, ry * .86, 0, 0, 7); c.stroke();
  c.fillStyle = '#cfd5de'; c.strokeStyle = '#3a2616'; c.lineWidth = 1.2; c.beginPath(); c.arc(0, 0, Math.max(2.4, rx * .36), 0, 7); c.fill(); c.stroke();
  c.restore();
}
function hdCharging(F) { return !!(F && F.dash && F.dash.stun === 1 && !F.dash.fly && F.h && F.h.id === 'harald'); }
function drawHaraldBody(c, ax, ay) {                   // both arms, the shield and the axe (drawStick's own straight arm is skipped for him)
  const F = HD_F; HD_F = null;
  const SH = -42, sx = 0, sy = SH + 6, col = c.strokeStyle, A = F ? (+F.aim || 0) : Math.atan2(ay, ax), f = Math.cos(A) >= 0 ? 1 : -1;
  const age = F && F._hdAt ? (performance.now() - F._hdAt) / 1000 : 9, charging = hdCharging(F), noAxe = charging;
  const W = .08, S = .1, Rc = .42, ANIM = W + S + Rc;                                // (the original's swing is slower; here the blow lands at once, so the wind-up is short)
  c.save(); c.lineCap = 'round'; c.lineJoin = 'round'; c.lineWidth = 5;
  // the shield arm
  let hx, hy, rx = 6.8, ry = 15, rot = .12 * f, sdx = f * .6, sdy = 0;
  if (charging) { const dir = F.dash.dx >= 0 ? 1 : -1, a = dir > 0 ? 0 : Math.PI; hx = sx + Math.cos(a) * 24; hy = sy + Math.sin(a) * 24 + 2; rx = 8.5; ry = 23; rot = a; sdx = Math.cos(a); sdy = Math.sin(a); }
  else { hx = sx + f * 10; hy = sy + 13; if (age > W && age < ANIM) hx -= f * 2; }
  c.strokeStyle = col; const sh = hdArm(c, sx, sy, hx, hy);
  hdShield(c, sh.x + sdx * 7, sh.y + sdy * 7, rot, rx, ry, col);
  // the axe arm
  c.strokeStyle = col; c.lineWidth = 5;
  if (!noAxe) {
    let phi = A + f * .2, R = 22, th = A - f * 1;
    if (age < W) { const k = 1 - Math.pow(1 - age / W, 3); phi = hdLerp(A + f * .2, A - f * 2.3, k); R = hdLerp(22, 17, k); th = hdLerp(A - f * 1, A - f * 2.45, k); }
    else if (age < W + S) { const k = (age - W) / S, e = k * k; phi = hdLerp(A - f * 2.3, A + f * .45, e); R = hdLerp(17, 28, e); th = hdLerp(A - f * 2.45, A + f * .7, e); }
    else if (age < ANIM) { const k = (age - W - S) / Rc, e = k * k * (3 - 2 * k); phi = hdLerp(A + f * .45, A + f * .2, e); R = hdLerp(28, 22, e); th = hdLerp(A + f * .7, A - f * 1, e); }
    const hnd = hdArm(c, sx, sy, sx + Math.cos(phi) * R, sy + Math.sin(phi) * R);
    hdAxe(c, hnd.x, hnd.y, th, f, 1);
  } else {                                                                              // the axe is stuck far away: an empty hand hangs loose
    const hnd = hdArm(c, sx, sy, sx - f * 8, sy + 22); c.fillStyle = col; c.beginPath(); c.arc(hnd.x, hnd.y, 2.4, 0, 7); c.fill();
  }
  c.restore();
}
function drawHaraldAxes(now) {                          // the thrown axe, then stuck where the charge ends (world space)
  for (const f of fighters) {
    if (!f || f.dead || !hdCharging(f)) continue;
    if (state !== 'menu' && (!visibleTo(f, VIEW) || bushAt(f.x, f.y))) continue;
    const d = f.dash, tot = d.v * .55, ex = f.x + d.dx * d.v * d.t, ey = f.y + d.dy * d.v * d.t, el = Math.max(0, .55 - d.t);
    const sx = ex - d.dx * tot, sy = ey - d.dy * tot, k = Math.min(1, el / .2), x = hdLerp(sx, ex, k), y = hdLerp(sy, ey, k) + BODY;
    ctx.save();
    if (k < 1) { hdAxe(ctx, x, y, now / 1000 * 16, 1, .9); if (!lowFx()) addP({ x, y, vx: RND(-30, 30), vy: RND(-30, 30), life: RND(.18, .34), size: RND(2, 3.4), color: '#ffd9a0', drag: 3 }); }
    else {
      const pulse = .5 + .5 * Math.sin(now / 220), sa = Math.atan2(d.dy, d.dx) + Math.PI / 2;      // (seen from above: the axe stands in the floor, its head turned towards him)
      ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = hexA('#ffb347', .25 + .25 * pulse); ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y, 26 + pulse * 5, 0, 7); ctx.stroke(); ctx.globalCompositeOperation = 'source-over';
      hdAxe(ctx, x + Math.cos(sa) * 30 * .9, y + Math.sin(sa) * 30 * .9, sa + Math.PI, 1, .9);
    }
    ctx.restore();
  }
}
function drawHeldWeapon(c, weaponId, ax, ay, hx, hy, swingProg, concept){
  if(concept==='tk' && typeof tkHeld==='function' && tkHeld(c, weaponId, ax, ay, hx, hy, swingProg)) return;      // 칠면조 스킨 (art/tkart.js)
  if(SPACE_HELD[weaponId]){ drawSpaceHeld(c, weaponId, ax, ay, hx, hy); return; }
  const w = WEAPONS[weaponId] || WEAPONS.pistol;
  if(w.shape==='axe'){ drawHaraldBody(c, ax, ay); return; }
  if(w.shape==='arrow'){
    // bow: always held upright (not rotated to follow aim), but mirrors left/right so it doesn't look backwards
    const facing = ax>=0 ? 1 : -1;
    c.save();
    c.translate(hx, hy);
    c.scale(facing, 1);
    c.strokeStyle=(concept==='cupid')?'#ff7ab8':'#c9a463'; c.lineWidth=3;
    c.beginPath(); c.arc(0,0,13,-1.15,1.15); c.stroke();
    // reloading: right after the shot the string is slack, then an arrow is nocked, and the other hand draws it back until the next shot is ready
    let pull=1, nock=1, rel=0;
    if(BOW_P){ const T=w.cd||1.35, age=hrAge(BOW_P); if(age>=0 && age<T){ if(age<0.14){ nock=0; pull=0; rel=1-age/0.14; } else if(age<0.3){ nock=(age-0.14)/0.16; pull=0; } else { const k=Math.min(1,(age-0.3)/(Math.max(0.3,T*0.8-0.3))); nock=1; pull=k*k*(3-2*k); } } }
    const tip=13*Math.cos(1.15), tipY=13*Math.sin(1.15);
    const ux=ax*facing, uy=ay, ul=Math.hypot(ux,uy)||1, dx=ux/ul, dy=uy/ul;      // the arrow points where the player aims (in the bow's mirrored frame)
    const nx=-dx*pull*15 - dx*2*rel, ny=-dy*pull*15 - dy*2*rel;
    c.strokeStyle='#e8e2d0'; c.lineWidth=1;
    c.beginPath(); c.moveTo(tip,-tipY); c.lineTo(pull>0||nock>0?nx:0,pull>0||nock>0?ny:0); c.lineTo(tip,tipY); c.stroke();      // the string, drawn back with the arrow
    if(nock>0){
      const sh=(0.35+0.65*nock), tx=dx*17*sh, ty=dy*17*sh;      // shaft slides onto the string
      c.strokeStyle='#8a5a2a'; c.lineWidth=2; c.lineCap='round'; c.beginPath(); c.moveTo(nx,ny); c.lineTo(tx,ty); c.stroke();
      c.fillStyle='#d9dde5'; c.strokeStyle='#59616d'; c.lineWidth=0.8; const px=-dy, py=dx;      // the arrowhead
      c.beginPath(); c.moveTo(tx+dx*7,ty+dy*7); c.lineTo(tx+px*3.2,ty+py*3.2); c.lineTo(tx-px*3.2,ty-py*3.2); c.closePath(); c.fill(); c.stroke();
      c.fillStyle=(concept==='cupid')?'#ff7ab8':'#7ad06a';      // fletching (three little feathers)
      for(let i=0;i<3;i++){ const fx=nx+dx*(2+i*3), fy=ny+dy*(2+i*3); c.beginPath(); c.moveTo(fx,fy); c.lineTo(fx+dx*3+px*3.4,fy+dy*3+py*3.4); c.lineTo(fx+dx*3,fy+dy*3); c.lineTo(fx+dx*3-px*3.4,fy+dy*3-py*3.4); c.closePath(); c.fill(); }
    }
    c.restore();
    return;
  }
  const ang = Math.atan2(ay, ax) + (w.shape==='club' ? ((swingProg||0)-0.5)*1.1 : 0);
  c.save();
  c.translate(hx, hy); c.rotate(ang);
  switch(w.shape){
    case 'kdgun': {      // 카다스: the dark gun (long, low, P90-like: a magazine along the top)
      const K=kdPal(concept); c.save(); c.lineJoin='round'; c.shadowColor=K.a; c.shadowBlur=8; c.fillStyle='#0a0612'; c.strokeStyle=K.a; c.lineWidth=1.2;
      c.beginPath(); c.moveTo(-8,-4); c.lineTo(26,-5); c.lineTo(31,-2.5); c.lineTo(31,1); c.lineTo(22,2.6); c.lineTo(10,3.4); c.lineTo(8,11); c.lineTo(2.5,11); c.lineTo(1.5,4); c.lineTo(-8,4); c.closePath(); c.fill(); c.stroke();
      c.fillStyle=K.mid; c.beginPath(); c.moveTo(1,-5); c.lineTo(2,-9.5); c.lineTo(21,-9.5); c.lineTo(24,-5); c.closePath(); c.fill(); c.stroke();
      c.fillStyle='#0a0612'; c.beginPath(); c.rect(31,-2.6,6,2.8); c.fill(); c.stroke();
      c.strokeStyle=K.b; c.lineWidth=1.5; c.beginPath(); c.moveTo(-5,-1.5); c.lineTo(18,-2.4); c.lineTo(29,-1.6); c.stroke();
      c.restore(); break; }
    case 'quarrel': {      // 빌헬름 텔: a crossbow, the string is drawn back with the gauge
      const pg=TELL_P?Math.min(1,TELL_P.tellG||0):0;
      c.lineCap='round';
      c.strokeStyle='#6b4423'; c.lineWidth=5; c.beginPath(); c.moveTo(-6,0); c.lineTo(26,0); c.stroke();
      c.strokeStyle='#4a2f16'; c.lineWidth=3.2; c.beginPath(); c.moveTo(19,-12); c.quadraticCurveTo(28,0,19,12); c.stroke();
      c.strokeStyle='#e8e2d0'; c.lineWidth=1; c.beginPath(); c.moveTo(19,-12); c.lineTo(19-pg*9,0); c.lineTo(19,12); c.stroke();
      c.strokeStyle='#8a5a2a'; c.lineWidth=2; c.beginPath(); c.moveTo(19-pg*9,0); c.lineTo(34,0); c.stroke();
      c.fillStyle='#d9dde5'; c.beginPath(); c.moveTo(41,0); c.lineTo(34,-2.8); c.lineTo(34,2.8); c.closePath(); c.fill();
      break; }
    case 'blowgun':
      c.strokeStyle='#7a4a1f'; c.lineWidth=3.2; c.lineCap='round'; c.beginPath(); c.moveTo(4,0); c.lineTo(30,0); c.stroke();
      c.strokeStyle='#2fb87a'; c.lineWidth=3.6; c.beginPath(); c.moveTo(24,0); c.lineTo(30,0); c.stroke();
      break;
    case 'club':
      if(concept==='fry'){      // 방망이 대신 감자튀김: a red carton and a fan of golden fries
        c.fillStyle='#d62839'; c.beginPath(); c.moveTo(-2,-5); c.lineTo(11,-8); c.lineTo(11,8); c.lineTo(-2,5); c.closePath(); c.fill();
        c.fillStyle='#ffe27a'; c.fillRect(2,-1.4,6,2.8);
        c.lineCap='round';
        for(let i=-3;i<=3;i++){ const a=i*0.1, y0=i*2.2; c.strokeStyle=(i%2)?'#ffd34d':'#f2b81c'; c.lineWidth=3.4; c.beginPath(); c.moveTo(10,y0); c.lineTo(10+(26-Math.abs(i))*Math.cos(a), y0+(26-Math.abs(i))*Math.sin(a)); c.stroke(); }
        break;
      }
      c.strokeStyle='#8b5a2b'; c.lineWidth=8; c.lineCap='round';
      c.beginPath(); c.moveTo(0,0); c.lineTo(22,0); c.stroke();
      break;
    case 'chip': {
      c.fillStyle='#d62839'; c.strokeStyle='#fff'; c.lineWidth=1.4; c.beginPath(); c.arc(14,0,6.5,0,7); c.fill(); c.stroke();
      c.setLineDash([2.5,2.8]); c.beginPath(); c.arc(14,0,4,0,7); c.stroke(); c.setLineDash([]);
      break;
    }
    case 'spear': {                                                       // a long wooden shaft with a steel head
      c.lineCap='round'; c.strokeStyle='#8a5a2b'; c.lineWidth=3; c.beginPath(); c.moveTo(-12,0); c.lineTo(30,0); c.stroke();
      c.fillStyle='#dfe4ec'; c.beginPath(); c.moveTo(30,-4); c.lineTo(43,0); c.lineTo(30,4); c.closePath(); c.fill();
      c.fillStyle='#c9a463'; c.fillRect(26,-2.6,3,5.2);
      break;
    }
    case 'pitchfork': {                                                   // a wooden shaft with a three-pronged iron head
      if(concept==='poseidon'){ drawTrident(c,1,true); break; }      // 포세이돈: the trident
      c.lineCap='round'; c.strokeStyle='#8a5a2b'; c.lineWidth=3.2; c.beginPath(); c.moveTo(-8,0); c.lineTo(28,0); c.stroke();
      c.strokeStyle='#d6dae3'; c.lineWidth=2.4; c.beginPath(); c.moveTo(28,-6.5); c.lineTo(28,6.5); c.stroke();                                 // the crossbar
      c.beginPath(); c.moveTo(28,-6.5); c.lineTo(40,-6.5); c.moveTo(28,0); c.lineTo(42,0); c.moveTo(28,6.5); c.lineTo(40,6.5); c.stroke();        // the three prongs
      c.fillStyle='#f2c230'; c.fillRect(10,-2.2,3,4.4);                                                                                          // a golden ring on the shaft (a pharaoh's tool)
      break;
    }
    case 'saber': {                                                       // a glowing blade from a small hilt
      c.strokeStyle='#6b7280'; c.lineWidth=4; c.lineCap='round'; c.beginPath(); c.moveTo(-3,0); c.lineTo(6,0); c.stroke();
      c.save(); c.globalCompositeOperation='lighter'; c.strokeStyle='rgba(120,200,255,0.35)'; c.lineWidth=11; c.beginPath(); c.moveTo(6,0); c.lineTo(36,0); c.stroke(); c.restore();
      c.strokeStyle='#8fdcff'; c.lineWidth=5; c.beginPath(); c.moveTo(6,0); c.lineTo(36,0); c.stroke();
      c.strokeStyle='#ffffff'; c.lineWidth=2; c.beginPath(); c.moveTo(7,0); c.lineTo(35,0); c.stroke();
      break;
    }
    case 'blade':
      if(concept==='thor'){ drawMjolnir(c,0.95); break; }      // 토르 기사: Mjolnir instead of the sword
      if(concept==='gold'){
        c.save(); c.shadowColor='#ffd34d'; c.shadowBlur=8; c.lineCap='round';
        c.strokeStyle='#ffd34d'; c.lineWidth=5; c.beginPath(); c.moveTo(0,0); c.lineTo(28,0); c.stroke();
        c.shadowBlur=0; c.strokeStyle='#fff3b0'; c.lineWidth=1.6; c.beginPath(); c.moveTo(4,-0.8); c.lineTo(27,-0.8); c.stroke();
        c.strokeStyle='#b8860b'; c.lineWidth=3.2; c.beginPath(); c.moveTo(4,-6); c.lineTo(4,6); c.stroke();
        c.restore(); break;
      }
      c.strokeStyle='#e6eaf2'; c.lineWidth=4;
      c.beginPath(); c.moveTo(0,0); c.lineTo(26,0); c.stroke();
      c.strokeStyle='#8a6a3f'; c.lineWidth=3;
      c.beginPath(); c.moveTo(4,-5); c.lineTo(4,5); c.stroke();
      break;
    case 'fist':
      if(concept==='gilga'){ c.fillStyle='#e9b92e'; c.strokeStyle='#8a6a22'; c.lineWidth=1; c.beginPath(); c.arc(10,0,7.4,0,7); c.fill(); c.stroke(); c.fillStyle='#7a3a12'; c.fillRect(3,-6,3,12); c.fillStyle='#fff3b0'; c.beginPath(); c.arc(12,-2,1.6,0,7); c.fill(); break; }      // gold gauntlet-gloves with a strap
      c.fillStyle='#cc3b3b'; c.beginPath(); c.arc(10,0,7,0,7); c.fill();
      break;
    case 'star':
      c.fillStyle='#cfd3dc';
      for(let i=0;i<4;i++){ c.save(); c.rotate(i*Math.PI/2); c.beginPath(); c.moveTo(10,0); c.lineTo(16,-3); c.lineTo(16,3); c.closePath(); c.fill(); c.restore(); }
      break;
    case 'bomb':
      if(concept==='envy'){ c.save(); c.translate(12,0); drawGoldApple(c,7.4,0); c.restore(); break; }      // 질투의 폭발광: a golden apple instead of the bomb
      c.fillStyle='#333'; c.beginPath(); c.arc(12,0,7,0,7); c.fill();
      c.strokeStyle='#ffb703'; c.lineWidth=2; c.beginPath(); c.moveTo(12,-7); c.lineTo(16,-11); c.stroke();
      break;
    case 'rocket':
      c.fillStyle='#5c3a18'; c.fillRect(0,-4,30,8);
      c.fillStyle='#ff8a3d'; c.beginPath(); c.moveTo(30,-4); c.lineTo(36,0); c.lineTo(30,4); c.closePath(); c.fill();
      break;
    case 'card':
      if(concept==='uno'){ c.fillStyle='#fff'; c.beginPath(); c.roundRect(1.5,-10.5,15,21,2.5); c.fill(); c.fillStyle='#e8252b'; c.beginPath(); c.roundRect(3,-9,12,18,2); c.fill(); c.fillStyle='#fff'; c.save(); c.translate(9,0); c.rotate(-0.6); c.beginPath(); c.ellipse(0,0,3.6,7,0,0,7); c.fill(); c.restore(); c.fillStyle='#e8252b'; c.font='900 9px Rajdhani'; c.textAlign='center'; c.textBaseline='middle'; c.fillText('7',9,0.5); break; }
      c.fillStyle='#fdfdfd'; c.strokeStyle='#333'; c.lineWidth=1.5;
      c.beginPath(); c.rect(2,-9,14,18); c.fill(); c.stroke();
      c.fillStyle='#d62839'; drawCardHeart(c,9,0,2.6);
      break;
    case 'pellet':
      c.strokeStyle='#cfd3dc'; c.lineWidth=6;
      c.beginPath(); c.moveTo(0,0); c.lineTo(20,0); c.stroke();
      break;
    case 'fireball': // 마법사: 빨간 보석이 달린 지팡이
      if(concept==='starlight'){      // 별빛 사과 마법사: a pink-gold twisted wand with a big pulsing star on the tip and little stars circling it
        const tt=performance.now()*0.001, pu=1+0.12*Math.sin(tt*5), sp=starSpriteW();
        c.lineCap='round'; const wg=c.createLinearGradient(-8,0,22,0); wg.addColorStop(0,'#ffd34d'); wg.addColorStop(0.5,'#ff9ed8'); wg.addColorStop(1,'#bfeaff');
        c.strokeStyle='#ffffff'; c.lineWidth=4.6; c.beginPath(); c.moveTo(-8,0); c.lineTo(21,0); c.stroke(); c.strokeStyle=wg; c.lineWidth=3; c.stroke();
        c.strokeStyle='rgba(255,255,255,0.8)'; c.lineWidth=1; c.beginPath(); for(let k=0;k<=8;k++){ const x=-6+k*3.4, y=Math.sin(k*1.6+tt*4)*1.6; k?c.lineTo(x,y):c.moveTo(x,y); } c.stroke();
        c.save(); c.globalCompositeOperation='lighter'; c.translate(27,0);
        const gg=c.createRadialGradient(0,0,1,0,0,22*pu); gg.addColorStop(0,'rgba(255,240,200,0.9)'); gg.addColorStop(0.4,'rgba(255,150,215,0.4)'); gg.addColorStop(1,'rgba(120,210,255,0)'); c.fillStyle=gg; c.beginPath(); c.arc(0,0,22*pu,0,7); c.fill();
        for(let k=0;k<3;k++){ const a=tt*4+k*2.094; c.save(); c.translate(Math.cos(a)*12,Math.sin(a)*12); c.rotate(a*2); c.scale(0.1,0.1); c.drawImage(sp,-48,-48); c.restore(); }
        c.rotate(tt*1.5); c.scale(0.32*pu,0.32*pu); c.drawImage(sp,-48,-48); c.restore();
        break;
      }
      c.strokeStyle='#6b4423'; c.lineWidth=3; c.lineCap='round';
      c.beginPath(); c.moveTo(-8,0); c.lineTo(20,0); c.stroke();
      c.fillStyle='#d62839'; c.beginPath(); c.arc(24,0,4.2,0,7); c.fill();
      c.strokeStyle='#ffd34d'; c.lineWidth=1; c.beginPath(); c.arc(24,0,4.2,0,7); c.stroke();
      break;
    case 'potion': // 쿠루스: 보랏빛 연기가 새어 나오는 어둠의 물약
      if(concept==='diaper'){ drawPoopShape(c,12,7,0.9); break; }
      if(concept==='dream'){ c.fillStyle=dreamFill(c,12,2,8,performance.now()); c.strokeStyle='#ffffff'; c.lineWidth=1.4; c.beginPath(); c.arc(12,2,6.5,0,7); c.fill(); c.stroke(); c.fillStyle='#f4e8ff'; c.fillRect(10,-8,4,5); c.fillStyle='#ffc6ea'; c.fillRect(9.5,-10,5,2.4); c.fillStyle='rgba(255,255,255,0.85)'; c.beginPath(); c.arc(10,1,1.8,0,7); c.fill(); break; }
      c.fillStyle='#2a1640'; c.strokeStyle='#8b5cf6'; c.lineWidth=1.2;
      c.beginPath(); c.arc(12,2,6.5,0,7); c.fill(); c.stroke();
      c.fillStyle='#3b2a4f'; c.fillRect(10,-8,4,5);
      c.fillStyle='#a07a52'; c.fillRect(9.5,-10,5,2.4);
      c.fillStyle='rgba(196,139,255,0.75)'; c.beginPath(); c.arc(10,1,1.8,0,7); c.fill();
      break;
    case 'greatsword': { // 용살자: 황금 손잡이의 긴 장검 (불꽃 스킬이면 칼날이 달아오름)
      const fl=!!DS_FLAME_NOW;
      if(concept==='manga'){      // 만화가: a long fountain pen (ink skill: a drop of ink hangs on the nib)
        c.lineCap='round'; c.strokeStyle='#1d2a5a'; c.lineWidth=5; c.beginPath(); c.moveTo(-6,0); c.lineTo(42,0); c.stroke();
        c.strokeStyle='#ffd34d'; c.lineWidth=5.4; c.beginPath(); c.moveTo(6,0); c.lineTo(8,0); c.moveTo(38,0); c.lineTo(40,0); c.stroke();
        c.strokeStyle='#c9ccd8'; c.lineWidth=1.6; c.beginPath(); c.moveTo(-3,-3); c.lineTo(18,-3); c.stroke();
        c.fillStyle='#e8c25a'; c.beginPath(); c.moveTo(42,-2.6); c.lineTo(54,0); c.lineTo(42,2.6); c.closePath(); c.fill();
        c.strokeStyle='#8a6a22'; c.lineWidth=0.8; c.beginPath(); c.moveTo(43,0); c.lineTo(52,0); c.stroke();
        if(fl){ c.fillStyle='#15152e'; c.beginPath(); c.ellipse(55,1.5,2.6,3.6,0,0,7); c.fill(); }
        break;
      }
      c.lineCap='round'; c.strokeStyle='#6b4423'; c.lineWidth=4; c.beginPath(); c.moveTo(-5,0); c.lineTo(5,0); c.stroke();
      c.strokeStyle='#ffd34d'; c.lineWidth=3.4; c.beginPath(); c.moveTo(6,-8); c.lineTo(6,8); c.stroke();
      c.fillStyle='#ffd34d'; c.beginPath(); c.arc(-6,0,2.6,0,7); c.fill();
      if(fl){ c.save(); c.globalCompositeOperation='lighter'; c.strokeStyle='rgba(255,120,30,0.55)'; c.lineWidth=9; c.beginPath(); c.moveTo(8,0); c.lineTo(52,0); c.stroke(); c.restore(); }
      c.strokeStyle=fl?'#ffe2b0':'#eef2f8'; c.lineWidth=4; c.beginPath(); c.moveTo(8,0); c.lineTo(50,0); c.stroke();
      c.strokeStyle=fl?'#ff9a3d':'#9fb0c8'; c.lineWidth=1.2; c.beginPath(); c.moveTo(10,0); c.lineTo(48,0); c.stroke();
      c.fillStyle=fl?'#fff4d0':'#eef2f8'; c.beginPath(); c.moveTo(50,-2.6); c.lineTo(58,0); c.lineTo(50,2.6); c.closePath(); c.fill();
      break;
    }
    case 'lanternstaff': { // 역병 의사: the staff always stands square to the arm; the lantern is on the upper side while he faces forward
      const pu=0.75+0.25*Math.sin(performance.now()/170), sd=-(PERSONA_FACE||1);      // local y: -1 = up for a right-facing figure
      c.lineCap='round'; c.strokeStyle='#241c16'; c.lineWidth=3.2; c.beginPath(); c.moveTo(0,-sd*24); c.lineTo(0,sd*34); c.stroke();
      c.strokeStyle='#4a3a2c'; c.lineWidth=1; c.beginPath(); c.moveTo(0,-sd*24); c.lineTo(0,sd*34); c.stroke();
      c.strokeStyle='#8a8f99'; c.lineWidth=2; c.beginPath(); c.moveTo(0,sd*34); c.lineTo(0,sd*44); c.stroke();
      c.save(); c.translate(0,sd*44);
      c.save(); c.globalCompositeOperation='lighter'; const g=c.createRadialGradient(0,0,1,0,0,24*pu); g.addColorStop(0,'rgba(255,224,130,0.85)'); g.addColorStop(1,'rgba(255,190,70,0)'); c.fillStyle=g; c.beginPath(); c.arc(0,0,24*pu,0,7); c.fill(); c.restore();
      c.fillStyle='#ffe29a'; c.strokeStyle='#6b5a3a'; c.lineWidth=1.4; c.beginPath(); c.roundRect(-6,-5,12,10,2); c.fill(); c.stroke();
      c.beginPath(); c.moveTo(-6,0); c.lineTo(6,0); c.moveTo(0,-5); c.lineTo(0,5); c.stroke();
      c.fillStyle='#3a3a44'; c.fillRect(-8.5,-6,3,12); c.fillRect(5,-6,2.4,12);
      c.restore();
      break; }
    case 'neon': // 셰이드: 민트색으로 빛나는 네온 대검, 손잡이 끝에 사슬이 달림
      const P=nnPal(concept); c.lineCap='round'; c.save(); c.shadowColor=P.a; c.shadowBlur=10;
      c.strokeStyle='#27323f'; c.lineWidth=4; c.beginPath(); c.moveTo(-7,0); c.lineTo(6,0); c.stroke();
      c.strokeStyle=P.a; c.lineWidth=2.6; c.beginPath(); c.moveTo(6,-7); c.lineTo(6,7); c.stroke();
      c.fillStyle=P.d; c.strokeStyle=P.a; c.lineWidth=1.6; c.beginPath(); c.moveTo(7,-4.6); c.lineTo(46,-5.4); c.lineTo(62,0); c.lineTo(46,5.4); c.lineTo(7,4.6); c.closePath(); c.fill(); c.stroke();
      c.lineWidth=1; c.beginPath(); c.moveTo(10,0); c.lineTo(54,0); c.stroke(); c.restore();
      c.strokeStyle='#8fa0b8'; c.lineWidth=2; c.setLineDash([2.5,2]); c.beginPath(); c.moveTo(-8,0); c.quadraticCurveTo(-15,12,-5,21); c.stroke(); c.setLineDash([]);
      break;
    case 'katana': // 사무라이: 칼집에서 뽑은 카타나
      c.lineCap='round'; c.strokeStyle='#5a3a1e'; c.lineWidth=3.5; c.beginPath(); c.moveTo(-2,0); c.lineTo(6,0); c.stroke();
      c.strokeStyle='#d4af37'; c.lineWidth=3; c.beginPath(); c.moveTo(6,-4); c.lineTo(6,4); c.stroke();
      c.strokeStyle='#eef2f8'; c.lineWidth=2.4; c.beginPath(); c.moveTo(7,0); c.quadraticCurveTo(22,-1,34,-5); c.stroke();
      break;
    case 'hook': // 해적: 갈고리손
      c.lineCap='round'; c.strokeStyle='#6b4423'; c.lineWidth=4.5; c.beginPath(); c.moveTo(0,0); c.lineTo(9,0); c.stroke();
      c.strokeStyle='#d5dae3'; c.lineWidth=2.8; c.beginPath(); c.moveTo(9,0); c.lineTo(19,0); c.arc(19,-6,6,Math.PI/2,-Math.PI*0.4,true); c.stroke();
      break;
    case 'portalgun': { // 차원여행자: 포탈건 (design B 'portal ring', chosen by the user 2026-11-24): flat body, a cyan stripe, and a purple-and-cyan ring floating at the muzzle
      const t=performance.now()/1000, pul=1+Math.sin(t*5)*.06;
      c.fillStyle='#3a3a4a'; c.beginPath(); c.roundRect(-8,-4,26,9,4); c.fill();
      c.fillStyle='#2a2a36'; c.fillRect(-4,4,7,10);
      c.fillStyle='#8de8ff'; c.fillRect(8,-4,3,9);
      c.save(); c.translate(27,0); c.scale(.55*pul,1.1*pul);
      c.strokeStyle='#8de8ff'; c.lineWidth=5; c.beginPath(); c.arc(0,0,10,0,7); c.stroke();
      c.strokeStyle='#c58bff'; c.lineWidth=3; c.beginPath(); c.arc(0,0,6,t*3,t*3+4.2); c.stroke();
      c.restore();
      break; }
    case 'claw':
      c.strokeStyle='#e8eaf0'; c.lineWidth=2.5; c.lineCap='round';
      c.beginPath(); c.moveTo(2,-6); c.lineTo(15,-3); c.stroke();
      c.beginPath(); c.moveTo(2,0); c.lineTo(16,0); c.stroke();
      c.beginPath(); c.moveTo(2,6); c.lineTo(15,3); c.stroke();
      break;
    case 'dice':
      c.save(); c.translate(10,0); c.rotate(0.5);
      c.fillStyle='#f2f2f2'; c.strokeStyle='#1c1d22'; c.lineWidth=1.5;
      c.beginPath(); c.rect(-7,-7,14,14); c.fill(); c.stroke();
      c.fillStyle='#d62839';
      c.beginPath(); c.arc(-3,-3,1.4,0,7); c.fill();
      c.beginPath(); c.arc(3,3,1.4,0,7); c.fill();
      c.beginPath(); c.arc(0,0,1.4,0,7); c.fill();
      c.restore();
      break;
    case 'fireball':
      c.strokeStyle='#5c4a3a'; c.lineWidth=3; c.lineCap='round';
      c.beginPath(); c.moveTo(0,0); c.lineTo(24,0); c.stroke();
      c.save(); c.globalCompositeOperation='lighter';
      const gg=c.createRadialGradient(26,0,0,26,0,7); gg.addColorStop(0,'rgba(255,150,60,0.9)'); gg.addColorStop(1,'rgba(255,60,20,0)');
      c.fillStyle=gg; c.beginPath(); c.arc(26,0,7,0,7); c.fill();
      c.restore();
      c.fillStyle='#ff4d2e'; c.beginPath(); c.arc(26,0,3.4,0,7); c.fill();
      break;
    default: {
      if(concept==='zeus' && weaponId==='pistol'){      // 신 중의 신 제임스: a lightning bolt instead of the pistol
        c.save(); c.translate(2,0); drawZeusBoltShape(c,30,performance.now()); c.restore(); break;
      }
      if(concept==='banana' && weaponId==='pistol'){      // 권총 대신 바나나
        c.lineCap='round'; c.strokeStyle='#e0b800'; c.lineWidth=7.5; c.beginPath(); c.moveTo(3,3); c.quadraticCurveTo(14,-8,26,2); c.stroke();
        c.strokeStyle='#ffe14d'; c.lineWidth=5.5; c.beginPath(); c.moveTo(3,3); c.quadraticCurveTo(14,-8,26,2); c.stroke();
        c.fillStyle='#5a3b12'; c.beginPath(); c.arc(27,2.4,2,0,7); c.fill(); c.beginPath(); c.arc(2,3.4,1.6,0,7); c.fill();
        break;
      }
      if(weaponId==='pistol'||weaponId==='rifle'||weaponId==='smg'||weaponId==='portalgun'){ drawGunShape(c, weaponId, ax<0); break; }
      const len = 16;
      c.strokeStyle='#cfd3dc'; c.lineWidth = 3;
      c.beginPath(); c.moveTo(0,0); c.lineTo(len,0); c.stroke();
    }
  }
  c.restore();
}
function drawGunShape(c, id, flip){      // 2026-11-15: 제임스 / 군인 / 특수요원 each get their own gun (the hand is at 0,0, the muzzle points along +x)
  c.save(); if(flip) c.scale(1,-1); const R=(x,y,w,h,col)=>{ c.fillStyle=col; c.fillRect(x,y,w,h); };
  if(id==='pistol'){      // 제임스: a slim black pistol with a long silencer
    R(-1,0,4.5,7,'#2a2b30'); R(-3,-3.4,13,4.4,'#3a3c43'); R(-3,-3.4,13,1.4,'#55585f'); R(10,-2.6,10,2.8,'#1c1d21'); R(18.6,-2.6,1.4,2.8,'#33353b');
  } else if(id==='rifle'){      // 군인: an olive assault rifle, wooden stock and a curved magazine
    R(-12,-2.2,9,4.6,'#9a6a3c'); R(-12,-2.2,9,1.4,'#b88452'); R(-3,-3.2,17,5.2,'#6f7f4c'); R(-3,-3.2,17,1.4,'#8a9a62'); R(0,2,3.2,5,'#4a5536');
    c.fillStyle='#4a5536'; c.beginPath(); c.moveTo(6,2); c.lineTo(10,2); c.quadraticCurveTo(10,7,13,10); c.lineTo(9.5,11); c.quadraticCurveTo(6.5,7,6,2); c.closePath(); c.fill();
    R(14,-2.4,6,3.6,'#9a6a3c'); R(20,-1.4,10,1.8,'#2c3024'); R(3,-5,6,1.8,'#2c3024');
  } else if(id==='portalgun'){      // 차원여행자: design B 'portal ring' (user 2026-11-24): flat body, cyan stripe, a purple-and-cyan ring floating at the muzzle
    const t=performance.now()/1000, pul=1+Math.sin(t*5)*.06;
    c.fillStyle='#3a3a4a'; c.beginPath(); c.roundRect(-8,-4,26,9,4); c.fill(); R(-4,4,7,10,'#2a2a36'); R(8,-4,3,9,'#8de8ff');
    c.save(); c.translate(27,0); c.scale(.55*pul,1.1*pul);
    c.strokeStyle='#8de8ff'; c.lineWidth=5; c.beginPath(); c.arc(0,0,10,0,7); c.stroke();
    c.strokeStyle='#c58bff'; c.lineWidth=3; c.beginPath(); c.arc(0,0,6,t*3,t*3+4.2); c.stroke(); c.restore();
  } else {      // 특수요원: a short black SMG with a red-dot sight, a front grip and a straight magazine
    R(-7,-1.8,5,3,'#1c1d21'); R(-2,-3.6,15,6,'#2a2c32'); R(-2,-3.6,15,1.5,'#454850'); R(0,2.4,3,4.5,'#1c1d21'); R(5,2.4,3,7.5,'#1c1d21');
    R(10,2.4,2.6,4,'#1c1d21'); R(13,-2.2,5,3.2,'#2a2c32'); R(17,-1.6,2.4,2,'#111214'); R(2,-7.2,6,3.6,'#1c1d21'); R(6.6,-6.4,1.6,2,'#ff3b3b');
  }
  c.restore();
}
function drawCardHeart(c, cx, cy, s){
  c.beginPath();
  c.moveTo(cx, cy+s*0.9);
  c.bezierCurveTo(cx-s*1.3, cy-s*0.3, cx-s*0.7, cy-s*1.5, cx, cy-s*0.5);
  c.bezierCurveTo(cx+s*0.7, cy-s*1.5, cx+s*1.3, cy-s*0.3, cx, cy+s*0.9);
  c.closePath();
  c.fill();
}