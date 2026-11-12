const COSMETICS={};
const FLAME_RANGE=400, FLAME_HALF_ANGLE=0.32, FLAME_DIRECT_DPS=31;
const VAC_SKILL_COST=3, VAC_SKILL_R=330, VAC_SKILL_PULL=800, VAC_SKILL_STUN=1.0;
const VACUUM_RANGE=480, VACUUM_HALF_ANGLE=0.34, VACUUM_MAX_STACKS=8, VACUUM_PULL_FORCE=90;
const FLAME_MAX_HOLD=9, FLAME_OVERHEAT_COOLDOWN=2;
const FLAME_SHIELD_MAXHP=60, FLAME_SHIELD_DURATION=6;
const SPACE_ON=true;      // 0.9 space update: the three space characters are selectable
const SPACE_IDS=['cleon','pel','tionis'], INTERNAL_WEAPONS=['none','guard','syringe','dsfire','dspaper','shsword'];
const WEAPONS = {
  pistol:  {id:'pistol',  name:'권총',     emoji:'🔫', kind:'gun',      dmg:17, cd:0.85, bulletSpeed:950, shape:'bullet',
            desc:'데미지 17 · 연사속도 0.85초 · 준수한 위력과 안정적인 명중률의 표준형 권총'},
  smg:     {id:'smg',     name:'기관총',   emoji:'🔫', kind:'gun',      dmg:6, cd:2.2, bulletSpeed:900, shape:'bullet', spread:0.06, burst:10, burstDelay:0.04,
            desc:'데미지 6 · 클릭 한 번에 10발 연사 · 쿨타임 2.2초 · 탄이 약간씩 퍼지는 일제사격'},
  bow:     {id:'bow',     name:'활',       emoji:'🏹', kind:'gun',      dmg:35, cd:1.35, bulletSpeed:1100, shape:'arrow', arcs:true,
            desc:'데미지 30 · 재장전 1.35초 · 중력의 영향을 받아 포물선을 그리는 강력한 원거리 무기'},
  lightsaber:{id:'lightsaber', name:'광선검', emoji:'⚡', kind:'melee', dmg:26, cd:1.25, range:100, shape:'saber', kbMult:2.2, deflectSec:0.25,
            desc:'데미지 26 · 쿨타임 1.25초 · 사거리 100 · 광선검을 휘둘러 맞은 상대를 크게 날려보냄 · 휘두른 순간부터 0.25초 동안 날아오는 투사체를 쏜 사람에게 튕겨내고, 단거리 공격도 막아내고, 막아내면 쿨타임 없이 한 번 더 휘두를 수 있음 (공격받기 0.25초 전에 눌러야 함)'},
  horemheb:{id:'horemheb', name:'쇠스랑', emoji:'🔱', kind:'melee', dmg:34, cd:0.55, range:105, shape:'pitchfork',
            desc:'데미지 34 · 쿨타임 0.55초 · 사거리 105 · 쇠스랑을 휘둘러 근접 공격'},
  pizarro: {id:'pizarro', name:'창',       emoji:'🪖', kind:'melee',    dmg:25, cd:0.6, range:160, shape:'spear', thrust:true, kbMult:2.6,
            desc:'데미지 20 · 쿨타임 0.6초 · 사거리 160 · 앞으로 창을 찔러 상대를 멀리 밀어냄 · 궁극기를 쓸수록 강해짐(죽으면 초기화)'},
  puppeteer:{id:'puppeteer', name:'실 바늘', emoji:'🪆', kind:'gun', dmg:9, cd:0.6, bulletSpeed:1300, life:0.85, shape:'needle', hitR:14,      // range 1100 (was 1560 with the default 1.2 s life)
           
            desc:'데미지 9 · 쿨타임 0.6초 · 빠르게 날아가는 바늘 · 궁극기로 상대를 조종해 싸움'},
  kan:     {id:'kan',     name:'독침대롱', emoji:'🐸', kind:'gun',      dmg:5, cd:0.5, bulletSpeed:1500, shape:'blowgun', poison:1, hitR:10,
            desc:'데미지 5 · 쿨타임 0.5초 · 맞으면 독이 쌓임 (최대 4중첩, 중첩마다 초당 2 피해, 3초 지속, 맞을 때마다 시간 갱신) · 빠르게 날아가는 독침'},
  sword:   {id:'sword',   name:'칼',       emoji:'🗡️', kind:'melee',    dmg:32, cd:0.55, range:100, shape:'blade',
            desc:'데미지 32 · 쿨타임 0.55초 · 사거리 100 · 빠르고 날카로운 근접 베기'},
  bat:     {id:'bat',     name:'방망이',   emoji:'🏏', kind:'melee',    dmg:45, cd:0.4, range:105, shape:'club',
            desc:'데미지 45 · 쿨타임 0.4초 · 사거리 105 · 클릭한 채 마우스를 아래로 내렸다가 다시 올리면(스윙) 그때 맞은 상대에게 타격'},
  boomerang:{id:'boomerang',name:'부메랑', emoji:'🪃', kind:'boomerang',dmg:21, cd:0,  bulletSpeed:700, shape:'boomerang',
            desc:'데미지 20(돌아올 때도 20) · 쿨타임 없음 · 더 멀리 날아가는 부메랑 · 던진 부메랑이 돌아와 나에게 닿고 0.25초 뒤에 다시 던질 수 있음 · 사람은 관통하고, 발판·바닥·벽에 닿으면 즉시 귀환'},
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
  dagger:  {id:'dagger',  name:'단검',     emoji:'🔪', kind:'melee',    dmg:43, cd:0.4,  range:65, shape:'dagger', dashCd:0.5,
            desc:'데미지 43 · 쿨타임 0.4초 · 사거리 65 · 대쉬 쿨타임이 0.5초로 줄어드는 기동형 단검'},
  dracula: {id:'dracula', name:'드라큘라', emoji:'🧛', kind:'melee',    dmg:15, cd:0.4, range:65, shape:'claw', lifesteal:true, lifestealFlat:5,
            desc:'데미지 15 · 쿨타임 0.4초 · 사거리 65 · 빠른 발톱 공격, 적중할 때마다 체력 5 흡수'},
  gambler: {id:'gambler', name:'도박사',   emoji:'🎲', kind:'gun', dmg:20, cd:1.0, bulletSpeed:1100, shape:'chip', hitR:7,
            desc:'데미지 6~36(무작위) · 쿨타임 1.0초 · 장거리 · 칩을 곧게 던짐, 맞힐 때마다 칩 +1 (최대 6) · 칩이 많을수록 스킬·궁극기가 강해짐'},
  wizard:  {id:'wizard',  name:'마법사',   emoji:'🧙', kind:'gun',      dmg:14, cd:0.7,  bulletSpeed:750, shape:'fireball', pierce:true, pierceHits:1, platPierce:1, life:1.4,
            desc:'데미지 14(한 번 거치면 7) · 쿨타임 0.7초 · 사거리 김 · 발판을 한 번만 통과하고, 플레이어 한 명을 관통한 뒤 두 번째로 맞힌 상대에게서 멈추는 화염 마법'},
  magiccard:{id:'magiccard',name:'마술 카드',emoji:'🃏', kind:'cards',    dmg:10,  cd:0.75,  bulletSpeed:820, shape:'card', hitR:26, comboBonus:4, freeVolleys:2,
            desc:'트럼프 카드 3장이 넓게 퍼져 날아감 · 장당 데미지 10 · 쿨타임 0.75초 · 맞은 상대는 이동속도가 조금 느려짐 · 3장이 모두 맞으면 추가 4 데미지 + 0.5초 기절'},
  flamethrower:{id:'flamethrower',name:'화염방사기',emoji:'🔥', kind:'flame', dmg:0, cd:0, range:FLAME_RANGE, shape:'flamethrower',
            desc:'중거리 화염방사 · 쏜 시간이 합쳐서 9초가 되면 2초간 과열(끊었다 다시 쏴도 이어서 셈) · 닿으면 초당 '+FLAME_DIRECT_DPS+' 직접 피해 · 발판에 막힘'},
  portalgun:{id:'portalgun',name:'포탈건',emoji:'🌀', kind:'gun', dmg:15, cd:0.5, bulletSpeed:700, shape:'portalbullet', bounces:3,
            desc:'데미지 15 · 쿨타임 0.5초 · 바닥이나 발판에 닿으면 최대 3번까지 튕기는 탄환 · 튕길 때마다 데미지 30% 증가 (최대 30)'},
  vacuum:{id:'vacuum',name:'청소기',emoji:'🧹', kind:'vacuum', dmg:24, cd:0.9, range:VACUUM_RANGE, shape:'vacuum',
            desc:'사거리 '+VACUUM_RANGE+'(화염방사기보다 조금 김) · 데미지 24 · 쿨타임 0.9초 · 맞힐 때마다 스택 축적(최대 8) · 맞은 상대를 나에게 살짝 끌어당김'},
  pirate:{id:'pirate',name:'갈고리손',emoji:'🏴‍☠️', kind:'melee', dmg:30, cd:0.3, range:70, shape:'hook',
            desc:'데미지 30 · 쿨타임 0.3초 · 사거리 70 · 갈고리손으로 빠르게 베는 근접 공격'},
  tell:{id:'tell',name:'석궁',emoji:'🏹', kind:'charge', dmg:64, cd:0.4, bulletSpeed:1000, shape:'quarrel', hitR:12, life:3,
            desc:'꾹 눌러 게이지를 채우고(1.6초) 놓으면 발사 · 패시브: 게이지가 찰수록 피해 1~64, 속도가 빨라지고 점점 일직선에 가까워지며 꽉 차면 완전한 일직선 · 게이지가 차는 동안 이동속도 25% 감소'},
  harald:{id:'harald',name:'전투 도끼',emoji:'🪓', kind:'melee', dmg:73, cd:1.2, range:125, shape:'axe', kbMult:2.6,
            desc:'데미지 73 · 쿨타임 1.2초 · 사거리 125 · 도끼를 번쩍 들어 내려찍음 (느리지만 매우 아프고 크게 밀쳐냄) · 도끼가 손에 없을 땐 방패로 밀침 (피해 절반, 쿨타임 0.75배, 넉백은 같음)'},
  plague:{id:'plague',name:'랜턴 막대',emoji:'🏮', kind:'melee', dmg:15, cd:0.6, range:100, shape:'lanternstaff',
            desc:'데미지 15 · 쿨타임 0.6초 · 사거리 100 · 맞은 상대는 5초 동안 감염'},
  samurai:{id:'samurai',name:'카타나',emoji:'⚔️', kind:'melee', dmg:36, cd:0.65, range:95, shape:'katana',
            desc:'데미지 36 · 쿨타임 0.65초 · 사거리 95 · 한 번 베면 묵직하게 들어가는 카타나'},
  shade:{id:'shade',name:'네온 대검',emoji:'🗡️', kind:'melee', dmg:50, cd:0.95, range:135, shape:'neon', kbMult:1.6,
            desc:'데미지 50 · 쿨타임 0.95초 · 사거리 135 · 범위 안의 적 모두에게 피해 · 민트색으로 빛나는 네온 대검 · 패시브: 기본 공격을 2번 연속으로 하면 다음 공격은 강타 (추가 피해 +5, 0.4초 기절)'},
  kadas:{id:'kadas',name:'암흑총',emoji:'🔫', kind:'gun', dmg:23, cd:0.8, bulletSpeed:1000, life:0.6, shape:'kdgun', hitR:9,
            desc:'데미지 23 · 쿨타임 0.8초 · 중거리 · 암흑총을 발사 · 패시브: 공격할 때 0.5초 동안 이동속도 5% 증가'},
  shsword:{id:'shsword',name:'네온 대검(던짐)',emoji:'🗡️', kind:'gun', dmg:15, cd:1, bulletSpeed:1300, shape:'shsword', hitR:14, life:0.42, desc:''},
  dspaper:{id:'dspaper',name:'종이비행기',emoji:'✈️', kind:'gun', dmg:26, cd:1, bulletSpeed:640, shape:'dspaper', hitR:13, life:3, desc:''},
  dsfire:{id:'dsfire',name:'용의 화염구',emoji:'🔥', kind:'gun', dmg:26, cd:1, bulletSpeed:640, shape:'dsfireball', hitR:13, life:3, desc:''},
  dragonslayer:{id:'dragonslayer',name:'장검',emoji:'🗡️', kind:'melee', dmg:41, cd:0.6, range:150, shape:'greatsword',
            desc:'데미지 41 · 쿨타임 0.6초 · 사거리 150 · 팔을 크게 젖혔다 내리치는 묵직한 장검 휘두르기'},
  kurus:{id:'kurus',name:'어둠의 물약',emoji:'🧪', kind:'potion', dmg:12, cd:0.5, bulletSpeed:720, shape:'potion', arcs:true, hitR:9, life:3,
            desc:'데미지 12 · 쿨타임 0.5초 · 포물선을 그리며 날아가는 어둠의 물약 · 떨어진 자리(바닥·발판, 옆면에 맞으면 흘러내린 자리)에 캐릭터 5명 너비의 어둠이 생김 (닿은 어둠은 하나로 이어지고 어둠 탈출 전까지 사라지지 않음) · 내 어둠 위에서는 초당 체력 3 회복, 이동속도 30% 증가 · 상대는 내 어둠 위에서 이동속도 30% 감소, 주변이 잘 안 보임'},
  cleon:{id:'cleon',name:'황제의 홀',emoji:'👑', kind:'gun', dmg:14, cd:0.8, bulletSpeed:760, shape:'cleonorb', hitR:11, life:1.5,
            desc:'데미지 14 · 쿨타임 0.8초 · 홀에서 나가는 분홍 마법탄 (장거리) · 근위병이 살아 있는 동안 근위병 1명마다 데미지 10% 증가'},
  pel:{id:'pel',name:'조종 드론',emoji:'🛸', kind:'gun', dmg:12, cd:0.6, bulletSpeed:1000, shape:'dronebolt', hitR:8, life:1.3,
            desc:'데미지 12 · 쿨타임 0.6초 (드론이 2대를 넘으면 한 대당 15%씩 늘어남) · 곁을 도는 드론이 한 대당 한 발씩 쏨 (장거리) · 드론은 시작 2대'},
  tionis:{id:'tionis',name:'연극 가면',emoji:'🎭', kind:'gun', dmg:13, cd:0.6, bulletSpeed:850, shape:'mask', hitR:14, life:0.9,
            desc:'데미지 13 · 쿨타임 0.6초 · 웃는 얼굴과 우는 얼굴의 연극 가면이 회전하며 날아감 (중장거리)'},
  edward:{id:'edward',name:'총검 머스킷',emoji:'💂', kind:'melee', dmg:30, cd:0.65, range:115, shape:'spear', thrust:true, kbMult:1.3,
            desc:'데미지 30 · 쿨타임 0.65초 · 사거리 115 · 가까운 상대는 총검으로 찌르고, 거리가 벌어지면 같은 클릭이 머스킷 단발 사격(데미지 24)으로 바뀜'},
  medium:{id:'medium',name:'지팡이',emoji:'🎩', kind:'melee', dmg:20, cd:0.75, range:105, shape:'cane',
            desc:'데미지 20 · 쿨타임 0.75초 · 사거리 105 · 지팡이를 휘두름 · 영혼 상태에서는 영혼 덩어리(최대 한 번 관통, 데미지 20, 쿨타임 0.8초)를 쏨'},
  syringe:{id:'syringe',name:'주사기',emoji:'💉', kind:'none', dmg:20, cd:999999, bulletSpeed:900, shape:'syringe', hitR:10, life:0.6, desc:'티오니스의 채혈 주사기 (스킬 전용)'},
  guard:{id:'guard',name:'에너지 창',emoji:'🔱', kind:'melee', dmg:15, cd:0.75, range:130, shape:'spear', thrust:true, kbMult:1.2, desc:'근위병의 창 (소환 전용)'},
  none: {id:'none', name:'맨손', emoji:'', kind:'none', dmg:0, cd:999999, shape:'none', desc:'무기 없음'}
};
const WEAPON_PERSONA_NAME = {
  plague:'역병 의사', edward:'에드워드', medium:'영매사', cleon:'크레온 1세', pel:'펠', tionis:'티오니스', harald:'하랄드', tell:'빌헬름 텔',
  dragonslayer:'용살자', puppeteer:'인형술사', pizarro:'피사로', kan:'칸', horemheb:'호렘헵', lightsaber:'자다이', pistol:'제임스', smg:'특수요원', bow:'로빈 후드', sword:'기사', bat:'야구선수', boomerang:'사냥꾼',
  shuriken:'닌자', shotgun:'보안관', rifle:'군인', gloves:'복서', grenade:'폭발광',
  bazooka:'중화기병', dagger:'암살자', magiccard:'마술사', dracula:'드라큘라', gambler:'도박사', wizard:'마법사', flamethrower:'학살자', portalgun:'차원여행자', vacuum:'청소부', pirate:'해적', shade:'네온', kadas:'카다스', samurai:'사무라이', kurus:'쿠루스'
};
let PERSONA_FACE=1;
let DS_FLAME_NOW=false, BOW_P=null, TELL_P=null;
function hslHex(h,sat,l){ h=((h%360)+360)%360; sat/=100; l/=100; const k=n=>(n+h/30)%12, a=sat*Math.min(l,1-l), f=n=>{ const v=l-a*Math.max(-1,Math.min(k(n)-3,Math.min(9-k(n),1))); return Math.round(v*255).toString(16).padStart(2,'0'); }; return '#'+f(0)+f(8)+f(4); }
function nnPal(cp){      // 네온's colours: the mint of the base figure, or one of its skins
  switch(cp){
    case 'nnpink': return {a:'#ff5ac8', b:'#ffb0ea', d:'#2a0b22'};
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
  switch(wid){
    case 'edward': drawEdwardPersona(c,hx,hy,r,shy); break;
    case 'medium': drawMediumPersona(c,hx,hy,r,shy); break;
    case 'cleon': case 'guard': case 'pel': drawSpacePersona(c,wid,hx,hy,r,shy,tint); break;
    case 'tionis': drawSpacePersona(c,wid,hx,hy,r,shy,tint);
      if(concept==='janus'){ mythTunic(c,hx,shy,'#d9b648',false); mythLaurel(c,hx,hy,r); }      // 야누스 티오니스: only a white tunic and a laurel wreath are new
      break;
    case 'shade': { // 네온: a thin glowing visor (the colour follows the skin)
      const vc=tint||'#7dffd8'; c.save(); c.shadowColor=vc; c.shadowBlur=6; c.fillStyle='#0b1018'; c.strokeStyle=vc; c.lineWidth=1.2; c.beginPath(); c.roundRect(hx-r*0.95,hy-r*0.42,r*1.9,r*0.62,2); c.fill(); c.stroke(); c.restore();
      break; }
    case 'kadas': { // 카다스: half human, half demon: the right half of the face red, a horn, one yellow eye
      c.save(); c.beginPath(); c.rect(hx,hy-r-2,r+2,2*r+4); c.clip(); c.fillStyle='#c4182e'; c.beginPath(); c.arc(hx,hy,r,0,7); c.fill(); c.restore();
      c.fillStyle='#1d0a22'; c.strokeStyle='#07030c'; c.lineWidth=1; c.beginPath(); c.moveTo(hx+r*0.2,hy-r*0.8); c.lineTo(hx+r*1.15,hy-r*2.5); c.lineTo(hx+r*0.95,hy-r*0.5); c.closePath(); c.fill(); c.stroke();
      c.fillStyle='#ffdd33'; c.beginPath(); c.arc(hx+r*0.45,hy-r*0.15,1.9,0,7); c.fill(); c.fillStyle='#2a2a40'; c.beginPath(); c.arc(hx-r*0.35,hy-r*0.15,1.4,0,7); c.fill();
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
    case 'tell': // 빌헬름 텔: a green felt hat with a red feather, a green tunic with a brown belt
      c.fillStyle='#2f6b3a'; c.strokeStyle='#1c4524'; c.lineWidth=0.8; c.beginPath(); c.moveTo(hx-5.2,shy+0.6); c.lineTo(hx+5.2,shy+0.6); c.lineTo(hx+6.8,shy+16); c.lineTo(hx-6.8,shy+16); c.closePath(); c.fill(); c.stroke();
      c.fillStyle='#5a3a1c'; c.fillRect(hx-6,shy+9,12,2.4); c.fillStyle='#e0b43a'; c.fillRect(hx-1.2,shy+8.8,2.4,2.8);
      c.fillStyle='#e8d9a0'; for(let i=0;i<4;i++){ c.beginPath(); c.moveTo(hx-6.8+i*3.4,shy+16); c.lineTo(hx-5.1+i*3.4,shy+18.6); c.lineTo(hx-3.4+i*3.4,shy+16); c.fill(); }
      c.fillStyle='#2f6b3a'; c.strokeStyle='#1c4524'; c.lineWidth=0.9;
      c.beginPath(); c.ellipse(hx,hy-r*0.5,r*1.45,r*0.38,-0.05,0,7); c.fill(); c.stroke();
      c.beginPath(); c.moveTo(hx-r*0.85,hy-r*0.55); c.quadraticCurveTo(hx-r*0.8,hy-r*1.7,hx,hy-r*1.8); c.quadraticCurveTo(hx+r*0.85,hy-r*1.7,hx+r*0.9,hy-r*0.55); c.closePath(); c.fill(); c.stroke();
      c.fillStyle='#5a3a1c'; c.fillRect(hx-r*0.86,hy-r*0.85,r*1.76,r*0.3);
      c.lineCap='round'; c.strokeStyle='#e63946'; c.lineWidth=2.2; c.beginPath(); c.moveTo(hx+r*0.7,hy-r*0.8); c.quadraticCurveTo(hx+r*1.6,hy-r*1.7,hx+r*1.3,hy-r*2.6); c.stroke();
      c.strokeStyle='#ffffff'; c.lineWidth=0.7; c.stroke();
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
    case 'kan': {                 // 칸: a jade brow band with a crown of quetzal feathers (green, red tips), gold ear plugs and a stripe of face paint
      const jade=tint||'#2fb87a', gold='#f2c230';
      c.fillStyle=jade; c.fillRect(hx-r-1, hy-4.5, (r+1)*2, 3.2); c.strokeStyle='#0f6b45'; c.lineWidth=1; c.strokeRect(hx-r-1, hy-4.5, (r+1)*2, 3.2);
      c.lineCap='round';
      for(let k=-2;k<=2;k++){ const a=k*0.32, bx=hx+k*3.2, by=hy-4.5, L=r*1.9+(2-Math.abs(k))*2.2, ex=bx+Math.sin(a)*L, ey=by-Math.cos(a)*L;
        c.strokeStyle=(k%2?'#1faa6a':'#35d08a'); c.lineWidth=2.2; c.beginPath(); c.moveTo(bx,by); c.lineTo(ex,ey); c.stroke();
        c.strokeStyle='#e0334a'; c.beginPath(); c.moveTo(bx+Math.sin(a)*(L-3), by-Math.cos(a)*(L-3)); c.lineTo(ex,ey); c.stroke(); }
      c.fillStyle=gold; for(const sd of [-1,1]){ c.beginPath(); c.arc(hx+sd*(r+0.5), hy+2, 1.8, 0, 7); c.fill(); }
      c.fillStyle='#0f6b45'; c.fillRect(hx-r*0.5, hy+1.6, r, 1.4);
      break; }
    case 'pizarro': {             // 피사로: a steel morion helmet (high comb, curved brim)
      const steel=tint||'#aeb6c2';
      c.fillStyle=steel; c.beginPath(); c.arc(hx,hy-1,r+1.6,Math.PI,0); c.lineTo(hx+r+1.6,hy+1); c.lineTo(hx-r-1.6,hy+1); c.closePath(); c.fill();
      c.strokeStyle='#6f7886'; c.lineWidth=1.4; c.lineCap='round';
      c.beginPath(); c.moveTo(hx-r-4,hy+1.5); c.quadraticCurveTo(hx,hy+4,hx+r+4,hy+1.5); c.stroke();
      c.fillStyle='#d9dee6'; c.beginPath(); c.moveTo(hx-r*0.9,hy-r-0.5); c.quadraticCurveTo(hx,hy-r*2.5,hx+r*0.9,hy-r-0.5); c.closePath(); c.fill();
      c.fillStyle='#c9a463'; c.fillRect(hx-1,hy-r*1.6,2,r*0.9);
      break;
    }
    case 'horemheb': {            // 호렘헵: the striped royal headcloth (nemes) with the golden cobra, and a gold brow band
      if(concept==='poseidon'){      // 포세이돈 호렘헵: flowing white-blue sea-foam hair and a long beard, a gold crown with three trident points
        const foam='#e8f7ff', edge='#6fb4dc', gold='#f2c230';
        c.fillStyle=foam; c.strokeStyle=edge; c.lineWidth=0.8;
        c.beginPath(); c.moveTo(hx-r-2,shy+3); c.quadraticCurveTo(hx-r-5.5,hy+1,hx-r-1,hy-r*0.9); c.quadraticCurveTo(hx,hy-r*1.75,hx+r+1,hy-r*0.9); c.quadraticCurveTo(hx+r+5.5,hy+1,hx+r+2,shy+3);
        c.quadraticCurveTo(hx+r-0.5,shy-1,hx+r-1,hy+1); c.quadraticCurveTo(hx,hy-r*1.1,hx-r+1,hy+1); c.quadraticCurveTo(hx-r+0.5,shy-1,hx-r-2,shy+3); c.closePath(); c.fill(); c.stroke();
        c.strokeStyle='#8fd0ee'; c.lineWidth=0.9; for(const sg of [-1,1]) for(let k=0;k<3;k++){ const yy=hy-1+k*((shy-hy)/3.2); c.beginPath(); c.moveTo(hx+sg*(r+0.5),yy); c.quadraticCurveTo(hx+sg*(r+4),yy+1.5,hx+sg*(r+1.2),yy+3.2); c.stroke(); }
        mythBeard(c,hx,hy,r,'#f3fbff','#6fb4dc',1.25);
        c.strokeStyle='#bfe6f8'; c.lineWidth=0.7; for(let k=-1;k<=1;k++){ c.beginPath(); c.moveTo(hx+k*r*0.4,hy+r*0.75); c.quadraticCurveTo(hx+k*r*0.5,hy+r*1.5,hx+k*r*0.2,hy+r*(2.0)); c.stroke(); }
        c.fillStyle=gold; c.strokeStyle='#8a6a1c'; c.lineWidth=0.8; const cy=hy-r*0.95;                      // the crown: a band with three points
        c.beginPath(); c.moveTo(hx-r-0.5,cy+2.6); c.lineTo(hx-r-0.5,cy-1.2); c.lineTo(hx-r*0.62,cy-4.2); c.lineTo(hx-r*0.3,cy-1.2); c.lineTo(hx,cy-7.4); c.lineTo(hx+r*0.3,cy-1.2); c.lineTo(hx+r*0.62,cy-4.2); c.lineTo(hx+r+0.5,cy-1.2); c.lineTo(hx+r+0.5,cy+2.6); c.closePath(); c.fill(); c.stroke();
        c.fillStyle='#2fe0d0'; c.beginPath(); c.arc(hx,cy+0.2,1.3,0,7); c.fill();
        c.fillStyle='#ffffff'; c.beginPath(); c.arc(hx,cy-7.4,0.9,0,7); c.fill();
        c.strokeStyle='#e8fbff'; c.lineWidth=1.1; c.beginPath(); c.moveTo(hx-r+1.5,hy-2.2); c.lineTo(hx-2,hy-2.8); c.moveTo(hx+r-1.5,hy-2.2); c.lineTo(hx+2,hy-2.8); c.stroke();      // bushy white brows
        break;
      }
      const cloth=tint||'#2f5fd0', gold='#f2c230', top=hy-r*1.95;
      c.fillStyle=cloth;
      c.beginPath(); c.moveTo(hx-r-3,hy+4); c.quadraticCurveTo(hx-r-4,top,hx,top); c.quadraticCurveTo(hx+r+4,top,hx+r+3,hy+4); c.lineTo(hx+r-1,hy-1); c.quadraticCurveTo(hx,hy-r*1.15,hx-r+1,hy-1); c.closePath(); c.fill();        // the cap
      for(const s of [-1,1]){ c.beginPath(); c.moveTo(hx+s*(r+3),hy+2); c.lineTo(hx+s*(r+5),shy+4); c.lineTo(hx+s*(r-2),shy+4); c.lineTo(hx+s*(r-1),hy+2); c.closePath(); c.fill(); }   // the two flaps down to the shoulders
      c.strokeStyle=gold; c.lineWidth=1.2; c.lineCap='round';
      for(let k=0;k<3;k++){ const yy=top+r*(0.45+0.4*k); c.beginPath(); c.moveTo(hx-r*(0.95-0.1*k),yy+2); c.quadraticCurveTo(hx,yy-3,hx+r*(0.95-0.1*k),yy+2); c.stroke(); }      // the golden stripes across the cap
      for(const s of [-1,1]) for(let k=0;k<3;k++){ const yy=hy+5+k*((shy-hy-4)/3.4); c.beginPath(); c.moveTo(hx+s*(r-1.5),yy); c.lineTo(hx+s*(r+4.5),yy); c.stroke(); }      // ...and across the flaps
      c.lineWidth=2.2; c.beginPath(); c.moveTo(hx-r-2,hy-2.4); c.lineTo(hx+r+2,hy-2.4); c.stroke();                       // the gold band over the brow
      c.fillStyle=gold; c.beginPath(); c.moveTo(hx,hy-r*1.45-5); c.quadraticCurveTo(hx+3.4,hy-r*1.2,hx+1.6,hy-r*0.92); c.lineTo(hx-1.6,hy-r*0.92); c.quadraticCurveTo(hx-3.4,hy-r*1.2,hx,hy-r*1.45-5); c.closePath(); c.fill();     // the uraeus: the golden cobra on the forehead
      c.fillStyle='#c62828'; c.beginPath(); c.arc(hx,hy-r*1.25,0.9,0,7); c.fill();
      break; }
    case 'lightsaber': // 자다이: 로브 후드와 이마 띠
      c.fillStyle=tint||'#8a6a45';
      c.beginPath(); c.moveTo(hx-r-2,hy+4); c.quadraticCurveTo(hx-r-2,hy-r*2.0,hx,hy-r*2.0); c.quadraticCurveTo(hx+r+2,hy-r*2.0,hx+r+2,hy+4); c.lineTo(hx+r-1,hy-1); c.quadraticCurveTo(hx,hy-r*1.2,hx-r+1,hy-1); c.closePath(); c.fill();
      c.strokeStyle='#d8c8a4'; c.lineWidth=1.4; c.beginPath(); c.moveTo(hx-r-1,hy-2.6); c.lineTo(hx+r+1,hy-2.6); c.stroke();
      break;
    case 'bat':
      if(concept==='fry'){      // 종업원: a white server's cap with a red band, a white collar and a red bow tie
        c.fillStyle='#ffffff'; c.beginPath(); c.ellipse(hx,hy-r*0.95,r*1.05,r*0.55,0,Math.PI,0); c.fill(); c.fillRect(hx-r*1.05,hy-r*0.95,r*2.1,3.4);
        c.fillStyle='#d62839'; c.fillRect(hx-r*1.05,hy-r*0.95,r*2.1,1.6);
        c.fillStyle='#ffffff'; c.beginPath(); c.moveTo(hx-r*0.9,shy); c.lineTo(hx,shy+5); c.lineTo(hx+r*0.9,shy); c.lineTo(hx+r*0.9,shy+3); c.lineTo(hx,shy+8); c.lineTo(hx-r*0.9,shy+3); c.closePath(); c.fill();
        c.fillStyle='#d62839'; c.beginPath(); c.moveTo(hx,shy+3.4); c.lineTo(hx-5,shy+0.4); c.lineTo(hx-5,shy+6.4); c.closePath(); c.fill(); c.beginPath(); c.moveTo(hx,shy+3.4); c.lineTo(hx+5,shy+0.4); c.lineTo(hx+5,shy+6.4); c.closePath(); c.fill();
        c.fillStyle='#8a1220'; c.beginPath(); c.arc(hx,shy+3.4,1.5,0,7); c.fill();
      } else drawHat(c,'hat_cap',hx,hy,r,tint);
      break;
    case 'boomerang': // 사냥꾼: 부시햇
      if(concept==='odin'){      // 사냥꾼 오딘: a gold cap with wings on both sides, a golden halo, an eyepatch, a white beard
        mythBeard(c,hx,hy,r,'#fbfbfd','#c8ccd8',1.0);
        mythWings(c,hx,hy,r+1.4,'#fff1b8','#c9961b',3.2);
        c.fillStyle='#e8b923'; c.strokeStyle='#9a6a0c'; c.lineWidth=0.8; c.beginPath(); c.arc(hx,hy-1,r+1.4,Math.PI,0); c.fill(); c.stroke(); c.fillRect(hx-r-1.4,hy-1.8,(r+1.4)*2,2.6);
        c.strokeStyle='#ffe27a'; c.lineWidth=1.7; c.beginPath(); c.ellipse(hx,hy-r-6.6,r*0.95,2.5,0,0,7); c.stroke();
        c.strokeStyle='rgba(255,226,122,0.4)'; c.lineWidth=3.6; c.beginPath(); c.ellipse(hx,hy-r-6.6,r*0.95,2.5,0,0,7); c.stroke();
        c.fillStyle='#14141a'; c.beginPath(); c.ellipse(hx-3.2,hy+0.4,2.7,2.2,0,0,7); c.fill();
        c.strokeStyle='#14141a'; c.lineWidth=0.9; c.beginPath(); c.moveTo(hx-r,hy-1.2); c.lineTo(hx-3.2,hy+0.4); c.moveTo(hx-3.2,hy+0.4); c.lineTo(hx+r,hy-2.6); c.stroke();
        c.fillStyle='#1a1a1a'; c.beginPath(); c.arc(hx+3,hy+0.2,0.9,0,7); c.fill();
        break;
      }
      c.fillStyle=tint||'#b89358';
      c.beginPath(); c.ellipse(hx,hy-1,r+5,3,0,0,7); c.fill();
      c.beginPath(); c.arc(hx,hy-3,r-1,Math.PI,0); c.fill();
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
    case 'dagger': // 암살자: 사무라이 삿갓
      c.fillStyle=tint||'#c9a96a';
      c.beginPath(); c.moveTo(hx-r-6,hy-1); c.lineTo(hx,hy-r*2.1); c.lineTo(hx+r+6,hy-1); c.closePath(); c.fill();
      c.strokeStyle='#8a6a3f'; c.lineWidth=1; c.stroke();
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
    case 'dracula': // 드라큘라: 송곳니
      c.fillStyle='#ffffff';
      c.beginPath(); c.moveTo(hx-2.4,hy+r*0.5); c.lineTo(hx-1.1,hy+r*0.5+3.6); c.lineTo(hx-3.5,hy+r*0.5); c.closePath(); c.fill();
      c.beginPath(); c.moveTo(hx+2.4,hy+r*0.5); c.lineTo(hx+1.1,hy+r*0.5+3.6); c.lineTo(hx+3.5,hy+r*0.5); c.closePath(); c.fill();
      break;
    case 'puppeteer': {           // 인형술사: a two-pointed jester hat with bells, and a thread hanging from the brim
      const col=tint||'#ff7fb5';
      c.fillStyle=col; c.strokeStyle='#5a2a4a'; c.lineWidth=1;
      c.beginPath(); c.moveTo(hx-r-1,hy-3); c.lineTo(hx-r-5,hy-r*1.9); c.lineTo(hx-1,hy-r*0.9); c.lineTo(hx+r+5,hy-r*1.9); c.lineTo(hx+r+1,hy-3); c.closePath(); c.fill(); c.stroke();
      c.fillStyle='#ffd34d'; for(const sx of [-1,1]){ c.beginPath(); c.arc(hx+sx*(r+5),hy-r*1.9,1.8,0,7); c.fill(); }
      c.strokeStyle='#ffe3f0'; c.lineWidth=1; c.beginPath(); c.moveTo(hx+r*0.6,hy+r*0.6); c.lineTo(hx+r*0.6,hy+r*1.7); c.stroke();
      break; }
    case 'gambler': // 도박사: 초록 딜러 아이셰이드
      c.fillStyle=tint||'#1c7a4a';
      c.beginPath(); c.arc(hx,hy-2,r+1,3.4,6.05); c.fill();
      c.fillStyle='#0e4a2a'; c.fillRect(hx-r-1,hy-3,(r+1)*2,2.2);
      break;
    case 'kurus': { // 쿠루스: 깊게 눌러쓴 어둠의 두건, 그 안에서 빛나는 보라색 두 눈
      if(concept==='diaper'){      // 기저귀 쿠루스: no hood, a brown pile on his head, a nappy, stink lines over it all
        drawDiaper(c,hx,shy);
        c.fillStyle='#1c1328';      // the face is the usual 쿠루스 face: the dark hood and the two glowing purple eyes
        c.beginPath(); c.moveTo(hx-r-3,hy+r*0.9); c.quadraticCurveTo(hx-r-4,hy-r*1.5,hx,hy-r*1.9); c.quadraticCurveTo(hx+r+4,hy-r*1.5,hx+r+3,hy+r*0.9);
        c.quadraticCurveTo(hx,hy+r*0.2,hx-r-3,hy+r*0.9); c.fill();
        c.fillStyle='#0a0612'; c.beginPath(); c.ellipse(hx,hy+0.5,r*0.72,r*0.62,0,0,7); c.fill();
        c.fillStyle='#c48bff'; c.shadowColor='#b06bff'; c.shadowBlur=4;
        c.beginPath(); c.ellipse(hx-2.8,hy,1.5,1.1,0,0,7); c.fill(); c.beginPath(); c.ellipse(hx+2.8,hy,1.5,1.1,0,0,7); c.fill(); c.shadowBlur=0;
        c.fillStyle='#1c1328'; c.beginPath(); c.moveTo(hx-r+1,shy+1); c.lineTo(hx+r-1,shy+1); c.lineTo(hx+r+2,shy+9); c.lineTo(hx-r-2,shy+9); c.closePath(); c.fill();
        drawDiaper(c,hx,shy);
        drawPoopShape(c,hx,hy-r*1.75,1.05);
        const nw=performance.now()/260; c.strokeStyle='rgba(150,165,60,0.8)'; c.lineWidth=1.1; c.lineCap='round';
        for(const o of [-5,5]){ c.beginPath(); c.moveTo(hx+o,hy-r-6); c.quadraticCurveTo(hx+o+Math.sin(nw+o)*2.4,hy-r-10,hx+o,hy-r-13); c.stroke(); }
        break;
      }
      const dream=(concept==='dream'), dreamNow=performance.now();
      c.fillStyle=dream?dreamFill(c,hx,hy,r*2.4,dreamNow):(tint||'#1c1328');
      c.beginPath(); c.moveTo(hx-r-3,hy+r*0.9); c.quadraticCurveTo(hx-r-4,hy-r*1.5,hx,hy-r*1.9); c.quadraticCurveTo(hx+r+4,hy-r*1.5,hx+r+3,hy+r*0.9);
      c.quadraticCurveTo(hx,hy+r*0.2,hx-r-3,hy+r*0.9); c.fill();
      c.fillStyle=dream?'#4a3a7a':'#0a0612'; c.beginPath(); c.ellipse(hx,hy+0.5,r*0.72,r*0.62,0,0,7); c.fill();
      c.fillStyle=dream?'#fff3fb':'#c48bff'; c.shadowColor=dream?'#ff9ad9':'#b06bff'; c.shadowBlur=4;
      c.beginPath(); c.ellipse(hx-2.8,hy,1.5,1.1,0,0,7); c.fill(); c.beginPath(); c.ellipse(hx+2.8,hy,1.5,1.1,0,0,7); c.fill(); c.shadowBlur=0;
      c.fillStyle=dream?dreamFill(c,hx,shy+4,r*1.6,dreamNow):(tint||'#1c1328'); c.beginPath(); c.moveTo(hx-r+1,shy+1); c.lineTo(hx+r-1,shy+1); c.lineTo(hx+r+2,shy+9); c.lineTo(hx-r-2,shy+9); c.closePath(); c.fill();
      break; }
    case 'harald': { // 하랄드: 뿔 달린 바이킹 투구 + 갈색 수염
      c.fillStyle='#6b3f1f'; c.strokeStyle='#4a2a12'; c.lineWidth=1.2; c.beginPath(); c.moveTo(hx-r+0.5,hy+1.5); c.quadraticCurveTo(hx-r-1.5,hy+r+6,hx,hy+r+12); c.quadraticCurveTo(hx+r+1.5,hy+r+6,hx+r-0.5,hy+1.5); c.quadraticCurveTo(hx,hy+r*0.5,hx-r+0.5,hy+1.5); c.closePath(); c.fill(); c.stroke();
      c.strokeStyle='#8a5a30'; c.lineWidth=1; c.beginPath(); c.moveTo(hx-3,hy+r+1); c.lineTo(hx-2,hy+r+8); c.moveTo(hx+3,hy+r+1); c.lineTo(hx+2,hy+r+8); c.stroke();
      c.strokeStyle='#efe6cf'; c.lineWidth=3.2; c.lineCap='round';
      for(const s of [-1,1]){ c.beginPath(); c.moveTo(hx+s*(r+0.6),hy-3); c.quadraticCurveTo(hx+s*(r+8),hy-3,hx+s*(r+6.5),hy-r-7); c.stroke(); }
      c.fillStyle='#9aa3b0'; c.strokeStyle='#5d6672'; c.lineWidth=1.2; c.beginPath(); c.arc(hx,hy-1.5,r+1.4,Math.PI,0); c.closePath(); c.fill(); c.stroke();
      c.fillStyle='#5d6672'; c.fillRect(hx-r-1.6,hy-3,(r+1.6)*2,3.4);
      c.fillStyle='#c9ced6'; c.fillRect(hx-1,hy-2,2,7);
      c.fillStyle='#e0b24a'; c.beginPath(); c.arc(hx,hy-r*0.9,1.4,0,7); c.fill();
      break; }
    case 'dragonslayer': { // 용살자: 코린토스식 그리스 투구 (얼굴을 거의 다 덮는 청동 투구, T자 눈·코 구멍, 뺨 가리개, 위로 솟은 붉은 말총 깃)
      const R=r+2.2, top=hy-R;
      if(concept==='manga'){      // 만화가: a flat painter's beret, tilted, with a little stem on top
        c.fillStyle='#b3262e'; c.beginPath(); c.ellipse(hx+1.5,hy-r+0.8,r+3.4,r*0.55,-0.18,0,7); c.fill();
        c.fillStyle='#8f1c24'; c.beginPath(); c.ellipse(hx+1.5,hy-r+2.2,r+2.2,r*0.28,-0.18,0,7); c.fill();
        c.fillStyle='#8f1c24'; c.beginPath(); c.arc(hx+2.6,hy-r-2.6,1.6,0,7); c.fill();
        break;
      }
      c.fillStyle='#d62839'; c.strokeStyle='#7a1220'; c.lineWidth=1;
      c.beginPath(); c.moveTo(hx-R*0.85,top+3.5); c.bezierCurveTo(hx-R*0.9,top-12,hx+R*0.1,top-16,hx+R*1.0,top-6); c.bezierCurveTo(hx+R*0.7,top-3,hx+R*0.5,top+1,hx+R*0.85,top+3.5); c.closePath(); c.fill(); c.stroke();       // the tall horsehair crest
      c.strokeStyle='#ff8a95'; c.lineWidth=0.8; for(let k=0;k<5;k++){ const x0=hx-R*0.6+k*R*0.35; c.beginPath(); c.moveTo(x0,top+3); c.lineTo(x0+k*0.6-1,top-7-Math.sin(k*1.3)*3); c.stroke(); }
      c.fillStyle='#c9922e'; c.strokeStyle='#6b4a12'; c.lineWidth=1.2;
      // Corinthian helmet (open face): dome + nose guard + two cheek plates drawn as ONE bronze piece; only the outer outline is brown, no lines between the parts
      const parts=[()=>{ c.arc(hx,hy-0.5,R,Math.PI,Math.PI*2,false); c.lineTo(hx+R*0.98,hy+R*0.2); c.lineTo(hx+R*0.6,hy+R*0.1); c.lineTo(hx+R*0.5,hy-R*0.3); c.lineTo(hx-R*0.5,hy-R*0.3); c.lineTo(hx-R*0.6,hy+R*0.1); c.lineTo(hx-R*0.98,hy+R*0.2); c.closePath(); },
        ()=>{ c.moveTo(hx-R*0.98,hy+R*0.0); c.lineTo(hx-R*0.58,hy-R*0.12); c.lineTo(hx-R*0.6,hy+R*0.1); c.lineTo(hx-R*0.5,hy+R*0.9); c.lineTo(hx-R*0.8,hy+R*0.8); c.closePath(); },
        ()=>{ c.moveTo(hx+R*0.98,hy+R*0.0); c.lineTo(hx+R*0.8,hy+R*0.8); c.lineTo(hx+R*0.5,hy+R*0.9); c.lineTo(hx+R*0.6,hy+R*0.1); c.lineTo(hx+R*0.58,hy-R*0.12); c.closePath(); },
        ()=>{ c.moveTo(hx-R*0.12,hy-R*0.6); c.lineTo(hx+R*0.12,hy-R*0.6); c.lineTo(hx+R*0.1,hy+R*0.5); c.lineTo(hx-R*0.1,hy+R*0.5); c.closePath(); }];
      c.strokeStyle='#6b4a12'; c.lineWidth=2.6; c.lineJoin='round'; c.beginPath(); for(const p of parts) p(); c.stroke();      // the outline first (thick) ...
      c.fillStyle='#c9922e'; c.beginPath(); for(const p of parts) p(); c.fill();      // ... then the fill on top hides every inner line
      c.fillStyle='#e8c25a'; c.beginPath(); c.arc(hx-R*0.3,hy-R*0.62,R*0.36,Math.PI*1.08,Math.PI*1.68); c.lineTo(hx-R*0.3,hy-R*0.62); c.closePath(); c.fill();
      break;
    }
    case 'plague': // 역병 의사: black silk hat + a dark grey beaked mask
      c.fillStyle='#14141a'; c.beginPath(); c.ellipse(hx,hy-r*0.78,r*1.35,r*0.28,0,0,7); c.fill();
      c.fillRect(hx-r*0.78,hy-r*2.1,r*1.56,r*1.4); c.fillStyle='#2a2a33'; c.fillRect(hx-r*0.78,hy-r*1.05,r*1.56,r*0.3);
      c.fillStyle='#6a6a76'; c.beginPath(); c.ellipse(hx,hy-r*2.1,r*0.78,r*0.16,0,0,7); c.fill();
      { const f=PERSONA_FACE||1;      // the mask covers the whole head; the long beak points the way he looks
        c.fillStyle='#4a4d56'; c.strokeStyle='#2c2e35'; c.lineWidth=1.1; c.beginPath(); c.arc(hx,hy,r*1.04,0,7); c.moveTo(hx+f*r*0.2+r*0.26,hy-r*0.22); c.ellipse(hx+f*r*0.2,hy-r*0.22,r*0.26,r*0.3,0,0,7); c.fill('evenodd'); c.stroke();      // the eye hole is cut out (see-through)
        c.fillStyle='#3a3d45'; c.beginPath(); c.moveTo(hx+f*r*0.5,hy-r*0.75); c.quadraticCurveTo(hx+f*r*1.8,hy-r*0.4,hx+f*r*2.5,hy+r*1.0); c.quadraticCurveTo(hx+f*r*1.5,hy+r*1.0,hx+f*r*0.5,hy+r*0.85); c.closePath(); c.fill(); c.stroke();
        c.strokeStyle='#5e626d'; c.lineWidth=0.9; c.beginPath(); c.moveTo(hx+f*r*0.7,hy+r*0.05); c.quadraticCurveTo(hx+f*r*1.7,hy+r*0.2,hx+f*r*2.35,hy+r*0.95); c.stroke();
        c.strokeStyle='#33353d'; c.lineWidth=1; c.beginPath(); c.arc(hx-f*r*0.2,hy,r*0.62,Math.PI*0.35,Math.PI*0.9); c.stroke();      // a strap line on the mask
      }
      break;
    case 'samurai': // 사무라이: 상투 + 붉은 머리띠
      c.fillStyle='#1b1b22'; c.beginPath(); c.arc(hx,hy-r-3,3.4,0,7); c.fill(); c.fillRect(hx-1,hy-r-1,2,4);
      c.fillStyle=tint||'#c62828'; c.fillRect(hx-r-0.5,hy-r*0.55,(r+0.5)*2,3); c.beginPath(); c.moveTo(hx-r,hy-r*0.55); c.lineTo(hx-r-7,hy-r*0.1); c.lineTo(hx-r-2,hy-r*0.55); c.closePath(); c.fill();
      break;
    case 'pirate': // 해적: 삼각 모자 + 안대
      c.fillStyle=tint||'#2b2b33';
      c.beginPath(); c.moveTo(hx-r-7,hy-r*0.45); c.lineTo(hx,hy-r*2.0); c.lineTo(hx+r+7,hy-r*0.45); c.quadraticCurveTo(hx,hy-r*0.95,hx-r-7,hy-r*0.45); c.fill();
      c.fillStyle='#e8c24a'; c.fillRect(hx-r-3,hy-r*0.8,(r+3)*2,1.6);
      c.fillStyle='#f4f4f4'; c.beginPath(); c.arc(hx,hy-r*1.2,1.6,0,7); c.fill();
      c.fillStyle='#111'; c.beginPath(); c.arc(hx+3.3,hy-0.5,2.3,0,7); c.fill();
      c.strokeStyle='#111'; c.lineWidth=0.9; c.beginPath(); c.moveTo(hx-r,hy-3); c.lineTo(hx+r,hy+1.5); c.stroke();
      break;
    case 'vacuum': // 청소부: 반다나 + 보안경
      c.fillStyle=tint||'#3a6b52';
      c.beginPath(); c.arc(hx,hy+2,r+1,3.4,6.0); c.fill();
      c.fillStyle='#dfe9ea';
      c.beginPath(); c.arc(hx-3.3,hy-1,2.4,0,7); c.fill();
      c.beginPath(); c.arc(hx+3.3,hy-1,2.4,0,7); c.fill();
      c.strokeStyle='#223'; c.lineWidth=1;
      c.beginPath(); c.moveTo(hx-0.9,hy-1); c.lineTo(hx+0.9,hy-1); c.stroke();
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
    case 'flamethrower': // 학살자: 방독면
      c.fillStyle=tint||'#2a3a2a';
      c.beginPath(); c.arc(hx,hy+1,r+1,0,Math.PI); c.fill();
      c.fillStyle='#0f140f'; c.beginPath(); c.arc(hx-3.2,hy,2.4,0,7); c.fill(); c.beginPath(); c.arc(hx+3.2,hy,2.4,0,7); c.fill();
      c.fillStyle='#6a8a6a'; c.beginPath(); c.arc(hx-3.2,hy,1,0,7); c.fill(); c.beginPath(); c.arc(hx+3.2,hy,1,0,7); c.fill();
      c.fillStyle=tint||'#2a3a2a'; c.beginPath(); c.arc(hx,hy+r*0.55,2.2,0,7); c.fill();
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
function drawDraculaCape(c,backDir,sway,sy,tint){
  c.save(); c.fillStyle=tint||'#8b0000';
  c.beginPath(); c.moveTo(0,sy); c.lineTo(backDir*(20+sway),sy+38); c.lineTo(backDir*(7+sway*0.4),sy+44); c.lineTo(0,sy+24); c.closePath(); c.fill();
  c.strokeStyle='#15161c'; c.lineWidth=2; c.stroke();
  c.restore();
}
function drawMediumPersona(c,hx,hy,r,shy){      // 영매사: a silk hat with a violet band, a black tailcoat and a violet scarf
  c.save(); c.lineCap='round';
  c.strokeStyle='#1c1a26'; c.lineWidth=7; c.beginPath(); c.moveTo(hx,shy+1); c.lineTo(hx,shy+20); c.stroke();
  c.fillStyle='#1c1a26'; c.beginPath(); c.moveTo(hx-4,shy+20); c.lineTo(hx-10,shy+29); c.lineTo(hx-1,shy+24); c.closePath(); c.fill(); c.beginPath(); c.moveTo(hx+4,shy+20); c.lineTo(hx+10,shy+29); c.lineTo(hx+1,shy+24); c.closePath(); c.fill();
  c.strokeStyle='#8b5cf6'; c.lineWidth=2.4; c.beginPath(); c.moveTo(hx-4,shy+1); c.lineTo(hx+4,shy+1); c.stroke(); c.beginPath(); c.moveTo(hx+3,shy+1); c.lineTo(hx+7,shy+10); c.stroke();
  c.fillStyle='#14131a'; c.strokeStyle='#050507'; c.lineWidth=0.8;
  c.beginPath(); c.ellipse(hx,hy-7,12.5,2.6,0,0,7); c.fill(); c.stroke();
  c.beginPath(); c.moveTo(hx-8,hy-7); c.lineTo(hx-7.2,hy-23); c.lineTo(hx+7.2,hy-23); c.lineTo(hx+8,hy-7); c.closePath(); c.fill(); c.stroke();
  c.fillStyle='#8b5cf6'; c.fillRect(hx-7.9,hy-12,15.8,3); c.fillStyle='rgba(255,255,255,.12)'; c.fillRect(hx-5.5,hy-22,2,13);
  c.restore();
}
function drawEdwardPersona(c,hx,hy,r,shy){      // 에드워드: bearskin busby, red tunic with white cross belts, a white plume
  c.save(); c.lineCap='round';
  c.strokeStyle='#b3202a'; c.lineWidth=7; c.beginPath(); c.moveTo(hx,shy+1); c.lineTo(hx,shy+21); c.stroke();
  c.strokeStyle='#f4f1e8'; c.lineWidth=1.8; c.beginPath(); c.moveTo(hx-4,shy+1); c.lineTo(hx+4,shy+19); c.moveTo(hx+4,shy+1); c.lineTo(hx-4,shy+19); c.stroke();
  c.fillStyle='#d9b648'; for(let i=0;i<3;i++){ c.beginPath(); c.arc(hx,shy+4+i*5,0.9,0,7); c.fill(); }
  c.strokeStyle='#1d2a5a'; c.lineWidth=2.2; c.beginPath(); c.moveTo(hx-3,shy-1); c.lineTo(hx+3,shy-1); c.stroke();
  c.fillStyle='#17171b'; c.strokeStyle='#050507'; c.lineWidth=0.8;
  c.beginPath(); c.moveTo(hx-9.5,hy-3); c.quadraticCurveTo(hx-12,hy-14,hx-8,hy-22); c.quadraticCurveTo(hx,hy-27,hx+8,hy-22); c.quadraticCurveTo(hx+12,hy-14,hx+9.5,hy-3); c.quadraticCurveTo(hx,hy-8,hx-9.5,hy-3); c.closePath(); c.fill(); c.stroke();
  c.strokeStyle='#33333a'; c.lineWidth=0.7; for(let i=0;i<9;i++){ const x=hx-8+i*2; c.beginPath(); c.moveTo(x,hy-6); c.lineTo(x+(i%2?1:-1),hy-20-(i%3)); c.stroke(); }
  c.strokeStyle='#d9b648'; c.lineWidth=1; c.beginPath(); c.arc(hx,hy+1,r,0.2,Math.PI-0.2); c.stroke();
  c.fillStyle='#f6f4ee'; c.beginPath(); c.ellipse(hx+9.5,hy-14,1.8,6,0.18,0,7); c.fill();
  c.restore();
}
function drawSpacePersona(c, wid, hx, hy, r, shy, tint){       // the looks follow the 0.9 intro picture
  const face=(rr,col)=>{ c.fillStyle=col; c.beginPath(); c.arc(hx,hy,rr,0,7); c.fill(); };
  switch(wid){
    case 'cleon': {
      c.fillStyle='#5b2a86'; c.beginPath(); c.moveTo(hx-4,shy-0.5); c.lineTo(hx-16,shy+25); c.lineTo(hx+16,shy+25); c.lineTo(hx+4,shy-0.5); c.closePath(); c.fill();        // the cape spreads behind
      c.fillStyle='#7c3ad0'; c.fillRect(hx-4.6,shy-0.5,9.2,17.5);                                                                                                         // the tunic
      c.fillStyle='#ffd34d'; c.fillRect(hx-0.9,shy-0.5,1.8,17.5); c.fillRect(hx-4.6,shy+15.2,9.2,1.8);
      face(r-1.9,'#16121f');
      c.strokeStyle='#ff5ac8'; c.lineWidth=1.7; c.lineCap='round'; c.beginPath(); c.moveTo(hx-5.4,hy+0.2); c.lineTo(hx-1.8,hy+0.2); c.moveTo(hx+1.8,hy+0.2); c.lineTo(hx+5.4,hy+0.2); c.stroke();
      c.fillStyle='#ffd34d'; c.strokeStyle='#a87a00'; c.lineWidth=0.9; c.beginPath(); c.moveTo(hx-r+0.5,hy-r*0.6); c.lineTo(hx-r+0.5,hy-r*1.6); c.lineTo(hx-r*0.5,hy-r*1.1); c.lineTo(hx,hy-r*1.95); c.lineTo(hx+r*0.5,hy-r*1.1); c.lineTo(hx+r-0.5,hy-r*1.6); c.lineTo(hx+r-0.5,hy-r*0.6); c.closePath(); c.fill(); c.stroke();
      c.fillStyle='#ff4fb0'; c.beginPath(); c.arc(hx,hy-r*1.1,1.4,0,7); c.fill(); break; }
    case 'guard': {
      c.fillStyle='#aeb7d6'; c.strokeStyle='#1a0a30'; c.lineWidth=0.9; c.beginPath(); c.rect(hx-5.2,shy+0.5,10.4,16); c.fill(); c.stroke();                                // the armour
      c.fillStyle='#8a4be0'; c.fillRect(hx-5.2,shy+7,10.4,1.6);
      face(r-1.7,'#16121f');
      c.strokeStyle='#ff5ac8'; c.lineWidth=1.7; c.lineCap='round'; c.beginPath(); c.moveTo(hx-3.2,hy+1.6); c.lineTo(hx+3.2,hy+1.6); c.stroke();
      c.fillStyle='#aeb7d6'; c.strokeStyle='#1a0a30'; c.lineWidth=1; c.beginPath(); c.arc(hx,hy-0.5,r+1.2,Math.PI*0.97,Math.PI*2.03); c.lineTo(hx+r+0.4,hy+3.2); c.lineTo(hx+r-2,hy+3.2); c.lineTo(hx+r-2,hy-1.4); c.lineTo(hx-r+2,hy-1.4); c.lineTo(hx-r+2,hy+3.2); c.lineTo(hx-r-0.4,hy+3.2); c.closePath(); c.fill(); c.stroke();
      { const k=r/9; c.fillStyle='#8a4be0'; c.beginPath(); c.moveTo(hx-0.5*k,hy-r-1); c.quadraticCurveTo(hx+2.4*k,hy-r-9.3*k,hx+8*k,hy-r-4.5*k); c.quadraticCurveTo(hx+4*k,hy-r-4.3*k,hx+3*k,hy-r-1); c.closePath(); c.fill(); } break; }
    case 'pel': {
      c.fillStyle='#6b4423'; c.fillRect(hx-5.4,shy+1,10.8,16); c.fillStyle='#ff8a1f'; c.fillRect(hx-0.8,shy+1,1.6,16);                                                   // the vest
      c.fillStyle='#ffffff'; c.strokeStyle='#9aa6b8'; c.lineWidth=0.9; c.beginPath(); c.moveTo(hx-r*0.75,hy+r*0.35); c.lineTo(hx,hy+r*2.5); c.lineTo(hx+r*0.75,hy+r*0.35); c.closePath(); c.fill(); c.stroke();       // the long white beard
      c.fillStyle='#f5f7fa'; c.beginPath(); c.arc(hx,hy,r+0.9,0,7); c.fill(); c.stroke();                                                                                    // the helmet
      c.fillStyle='#14161c'; c.beginPath(); c.rect(hx-r+1.2,hy-3.6,2*r-2.4,6.4); c.fill();
      c.fillStyle='#ffc83a'; c.fillRect(hx-r+1.2,hy-3.6,2*r-2.4,1.7);
      c.strokeStyle='#ff8a1f'; c.lineWidth=2.1; c.lineCap='butt'; c.beginPath(); c.arc(hx,hy,r+0.9,Math.PI*1.12,Math.PI*1.88); c.stroke(); break; }
    case 'tionis': {
      c.fillStyle='#2f7de1'; c.fillRect(hx-5.4,shy+1.5,3.6,16); c.fillStyle='#ff8a1f'; c.fillRect(hx-1.8,shy+1.5,3.6,16); c.fillStyle='#2f7de1'; c.fillRect(hx+1.8,shy+1.5,3.6,16);      // the striped vest
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
const SPACE_HELD={cleon:1, pel:1, tionis:1, guard:1, edward:1, medium:1};
function drawSpaceHeld(c, wid, ax, ay, hx, hy){
  const ang=Math.atan2(ay,ax); c.save(); c.translate(hx,hy); c.rotate(ang); c.lineCap='round';
  if(wid==='cleon'){
    c.strokeStyle='#e8b932'; c.lineWidth=3.2; c.beginPath(); c.moveTo(-4,0); c.lineTo(32,0); c.stroke();
    c.strokeStyle='#ffd34d'; c.lineWidth=2; c.beginPath(); c.moveTo(28,-5); c.lineTo(34,0); c.lineTo(28,5); c.stroke();
    c.fillStyle='#ff4fb0'; c.strokeStyle='#ffd34d'; c.lineWidth=1.2; c.beginPath(); c.arc(37,0,5,0,7); c.fill(); c.stroke();
    c.globalCompositeOperation='lighter'; const g=c.createRadialGradient(37,0,0,37,0,12); g.addColorStop(0,'rgba(255,120,200,0.7)'); g.addColorStop(1,'rgba(255,120,200,0)'); c.fillStyle=g; c.beginPath(); c.arc(37,0,12,0,7); c.fill();
  } else if(wid==='pel'){
    c.fillStyle='#2b3140'; c.strokeStyle='#ff8a1f'; c.lineWidth=1.8; c.beginPath(); c.rect(2,-4.5,15,9); c.fill(); c.stroke();
    c.strokeStyle='#cfd8e3'; c.lineWidth=1.4; c.beginPath(); c.moveTo(14,-4.5); c.lineTo(20,-12); c.stroke();
    c.fillStyle='#ffc83a'; c.beginPath(); c.arc(7,0,1.8,0,7); c.fill(); c.fillStyle='#ff5a5a'; c.beginPath(); c.arc(12,0,1.4,0,7); c.fill();
  } else if(wid==='tionis'){
    c.rotate(-ang); const mx=Math.cos(ang)*14, my=Math.sin(ang)*14; c.translate(mx,my);
    c.fillStyle='#f4f4f4'; c.beginPath(); c.arc(0,0,6,Math.PI/2,Math.PI*1.5); c.fill(); c.fillStyle='#16161c'; c.beginPath(); c.arc(0,0,6,-Math.PI/2,Math.PI/2); c.fill();
  } else if(wid==='guard'){
    c.strokeStyle='#20232b'; c.lineWidth=3.4; c.beginPath(); c.moveTo(-8,0); c.lineTo(46,0); c.stroke();
    c.strokeStyle='#ff7ac8'; c.lineWidth=1.4; c.beginPath(); c.moveTo(-4,0); c.lineTo(44,0); c.stroke();
    c.globalCompositeOperation='lighter'; const fl=1+0.15*Math.sin(performance.now()/45);
    c.fillStyle='rgba(255,100,190,0.9)'; c.beginPath(); c.moveTo(44,-4*fl); c.lineTo(66*fl,0); c.lineTo(44,4*fl); c.closePath(); c.fill();
    const g=c.createRadialGradient(54,0,0,54,0,16); g.addColorStop(0,'rgba(255,200,240,0.7)'); g.addColorStop(1,'rgba(255,100,190,0)'); c.fillStyle=g; c.beginPath(); c.arc(54,0,16,0,7); c.fill();
  } else if(wid==='medium'){
    c.rotate(-0.55); c.strokeStyle='#3a2a1e'; c.lineWidth=2.6; c.beginPath(); c.moveTo(-6,0); c.lineTo(40,0); c.stroke();
    c.strokeStyle='#c9c9d6'; c.lineWidth=1; c.beginPath(); c.moveTo(0,-1); c.lineTo(36,-1); c.stroke();
    c.fillStyle='#d9d9e6'; c.strokeStyle='#8a8a99'; c.lineWidth=.8; c.beginPath(); c.arc(-7,0,3.4,0,7); c.fill(); c.stroke();
    c.fillStyle='#8b5cf6'; c.beginPath(); c.arc(-7.6,-.6,1,0,7); c.fill();
  } else if(wid==='edward'){
    c.rotate(-0.1); c.fillStyle='#6b3f1d'; c.strokeStyle='#2c1a0a'; c.lineWidth=0.8;
    c.beginPath(); c.moveTo(-15,-1.2); c.lineTo(-6,-2.4); c.lineTo(-6,2); c.lineTo(-17,3.4); c.closePath(); c.fill(); c.stroke();
    c.fillStyle='#4b4b58'; c.fillRect(-7,-1.6,32,2.4); c.fillStyle='#c9a45a'; c.fillRect(5,-1.9,1.6,3); c.fillRect(15,-1.9,1.6,3);
    c.fillStyle='#dfe3ea'; c.beginPath(); c.moveTo(25,-1.2); c.lineTo(45,-0.3); c.lineTo(25,0.6); c.closePath(); c.fill();
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
  c.strokeStyle = '#7a4a1f'; c.lineWidth = 3.8; c.beginPath(); c.moveTo(-9, 0); c.lineTo(41, 0); c.stroke();
  c.strokeStyle = '#4a2c10'; c.lineWidth = 1; c.beginPath(); c.moveTo(-9, -1.2); c.lineTo(41, -1.2); c.stroke();
  c.fillStyle = '#c9ced6'; c.strokeStyle = '#59616d'; c.lineWidth = 1.4;
  c.beginPath(); c.moveTo(30, 2); c.lineTo(32, 16); c.quadraticCurveTo(48, 12, 46, -7); c.quadraticCurveTo(41, -2, 37, -2.4); c.lineTo(30, -3); c.closePath(); c.fill(); c.stroke();
  c.strokeStyle = '#ffffff'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(33, 15); c.quadraticCurveTo(46, 11, 45, -5); c.stroke();
  c.restore();
}
function hdShield(c, x, y, rot, rx, ry, rim) {
  c.save(); c.translate(x, y); c.rotate(rot);
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
  if(SPACE_HELD[weaponId]){ drawSpaceHeld(c, weaponId, ax, ay, hx, hy); return; }
  if(concept==='breath' && weaponId==='flamethrower') return;      // 입냄새 학살자: nothing in the hands
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
    case 'dagger':
      c.strokeStyle='#e6eaf2'; c.lineWidth=3;
      c.beginPath(); c.moveTo(0,0); c.lineTo(14,0); c.stroke();
      break;
    case 'fist':
      if(concept==='gilga'){ c.fillStyle='#e9b92e'; c.strokeStyle='#8a6a22'; c.lineWidth=1; c.beginPath(); c.arc(10,0,7.4,0,7); c.fill(); c.stroke(); c.fillStyle='#7a3a12'; c.fillRect(3,-6,3,12); c.fillStyle='#fff3b0'; c.beginPath(); c.arc(12,-2,1.6,0,7); c.fill(); break; }      // gold gauntlet-gloves with a strap
      c.fillStyle='#cc3b3b'; c.beginPath(); c.arc(10,0,7,0,7); c.fill();
      break;
    case 'boomerang':
      if(concept==='odin'){ c.save(); c.translate(9,-3); drawRaven(c,22,Math.sin(performance.now()/180)*0.5); c.restore(); break; }      // 사냥꾼 오딘: a raven on the hand
      c.strokeStyle='#cfd3dc'; c.lineWidth=3;
      c.beginPath(); c.arc(10,0,10,0.5,2.6); c.stroke();
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
    case 'vacuum': // 청소부: 손잡이+통+노즐이 있는 진공청소기
      c.fillStyle='#4a4a52'; c.strokeStyle='#26262c'; c.lineWidth=1.5;
      c.beginPath(); c.ellipse(4,0,13,7,0,0,7); c.fill(); c.stroke();
      c.fillStyle='#6b6b76';
      c.beginPath(); c.rect(14,-3,14,6); c.fill();
      c.fillStyle='#2a2a30';
      c.beginPath(); c.arc(28,0,3.5,0,7); c.fill();
      break;
    case 'portalgun': // 차원여행자: 포탈건
      c.fillStyle='#2e2e38'; c.strokeStyle='#17171d'; c.lineWidth=1.5;
      c.beginPath(); c.rect(-6,-4,22,8); c.fill(); c.stroke();
      c.fillStyle='#a855f7'; c.globalCompositeOperation='lighter';
      c.beginPath(); c.arc(17,0,4,0,7); c.fill();
      c.fillStyle='#e9d5ff';
      c.beginPath(); c.arc(17,0,1.8,0,7); c.fill();
      break;
    case 'flamethrower': // 학살자: 산소통과 연결된 화염방사기
      c.strokeStyle='#4a5a4a'; c.lineWidth=2; c.lineCap='round';
      c.beginPath(); c.moveTo(-10,2); c.quadraticCurveTo(-16,10,-10,16); c.stroke(); // hose back toward the tank
      c.fillStyle='#3a4a3a'; c.strokeStyle='#1c231c'; c.lineWidth=1.5;
      c.beginPath(); c.rect(-8,-4,20,8); c.fill(); c.stroke();
      c.fillStyle='#232b23'; c.beginPath(); c.rect(12,-2.5,8,5); c.fill();
      { const flick=0.6+0.4*Math.sin(performance.now()/55);
        c.globalCompositeOperation='lighter';
        c.fillStyle='rgba(255,106,43,'+(0.85*flick)+')'; c.beginPath(); c.arc(23,0,3.2*flick,0,7); c.fill();
        c.fillStyle='rgba(255,211,77,'+(0.9*flick)+')'; c.beginPath(); c.arc(25,0,1.6*flick,0,7); c.fill();
      }
      break;
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
      const len = weaponId==='rifle' ? 26 : weaponId==='smg' ? 18 : 16;
      c.strokeStyle='#cfd3dc'; c.lineWidth = weaponId==='rifle'?4:3;
      c.beginPath(); c.moveTo(0,0); c.lineTo(len,0); c.stroke();
    }
  }
  c.restore();
}
function drawKadasBack(c, f, shy, hipy, t, cp){      // 카다스: bat wings on the back and a tail from the hip (f = side the back is on)
  const wing=Math.sin(t*3)*3, tw=Math.sin(t*4)*4, K=kdPal(cp);
  c.save(); c.lineCap='round'; c.lineJoin='round'; c.fillStyle=K.wing; c.strokeStyle=K.a; c.lineWidth=1.2; c.shadowColor=K.a; c.shadowBlur=6;
  c.beginPath(); c.moveTo(f*2,shy+4); c.lineTo(f*30,shy-34+wing); c.lineTo(f*22,shy-12); c.lineTo(f*40,shy-10+wing); c.lineTo(f*26,shy+8); c.lineTo(f*34,shy+22); c.lineTo(f*6,shy+14); c.closePath(); c.fill(); c.stroke(); c.shadowBlur=0;
  c.strokeStyle='#52081a'; c.lineWidth=3; c.beginPath(); c.moveTo(f*2,hipy); c.quadraticCurveTo(f*26,hipy+8+tw,f*32,hipy-6+tw); c.stroke(); c.fillStyle='#b3182f'; c.beginPath(); c.moveTo(f*32,hipy-6+tw); c.lineTo(f*40,hipy-14+tw); c.lineTo(f*28,hipy-12+tw); c.closePath(); c.fill();
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