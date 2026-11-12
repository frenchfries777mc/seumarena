/* ===== characters: passives, skill pools, ultimates (Stickseum kits, adapted to the top-down arena) ===== */
const HEROES = {}, ROSTER = [];
const px = n => n * U;
const fwd = (f, d, a) => ({ x: f.x + Math.cos(a === undefined ? f.aim : a) * d, y: f.y + Math.sin(a === undefined ? f.aim : a) * d });
function hero(id, k) {
  const w = WEAPONS[id];
  const h = { id, w, name: WEAPON_PERSONA_NAME[id] || w.name, wname: w.name, hp: MAX_HP, count: 1, burst: w.burst || 1, bdelay: w.burstDelay || 0, fan: 0, spread: w.spread || 0, dmg: w.dmg, cd: Math.max(.25, w.cd) };
  if (w.kind === 'melee') { h.type = 'melee'; h.range = w.range * .95 + 12; h.half = w.thrust ? .42 : .95; h.kb = 240 * (w.kbMult || 1); }
  else {
    h.type = 'shot'; h.bspd = (w.bulletSpeed || 800) * .8; h.range = clamp((w.bulletSpeed || 800) * (w.life || 1.2) * .5, 4.5 * T, 11 * T);
    if (w.kind === 'shotgun') { h.count = 5; h.fan = .5; h.range = 5.5 * T; }
    if (w.kind === 'cards') { h.count = 3; h.fan = .3; }
    if (w.kind === 'explosive') h.splash = w.splash * U;
  }
  const u = k.ult; k.ult = { name: u[0], d: u[1], r: u[2], f: u[3], ok: u[4] };
  k.skills = k.skills.map(s => Object.assign({ n: s[0], name: s[1], k: s[2], d: s[3], r: s[4], f: s[5] }, s[6]));
  HEROES[id] = Object.assign(h, k); h.hp *= STAT_X; ROSTER.push(id);
}
const smoke = (by, x, y, r, t) => zone({ by, x, y, r, t, col: '#9aa3b8', op: .55, fn: z => { for (const e of fighters) if (!e.dead && inZone(z, e)) { buff(e, 'slow', .2, .5); buff(e, 'blind', .25); } } });
const fire3 = (by, x, y, r, t, dps) => zone({ by, x, y, r, t, col: '#ff7a1a', kind: 'fire', fn: (z, dt) => { z.acc += dt; if (z.acc >= .5) { z.acc -= .5; circ(by, z.x, z.y, z.r, dps * .5, { quiet: 1, el: 1, burn: [3, 1] }); } } });
const trap = (by, x, y, t, max, key, fn, col, hidden) => { const mine = zones.filter(z => z.key === key && z.by === by); if (mine.length >= max) mine[0].dead = true;
  return zone({ by, x, y, r: 26, t, col: col || '#c9a463', key, hidden, op: .7, fn: z => { if (z.armed === undefined) z.armed = time + .4; if (time < z.armed) return; for (const e of foes(by)) if (!e.minion && inZone(z, e)) { z.dead = true; fn(e, z); fx('snare', z.x, z.y, { hit: true }); break; } } }); };
const allCd = (f, n, noUlt) => { f.scd[0] -= n; f.scd[1] -= n; f.dcd -= n; if (!noUlt) f.ucd -= n; };
const taken3 = f => f.recent.reduce((s, r) => s + r[1], 0);

hero('sword', { p: ['기사도', '상대에게 피해를 줄 때마다 5% 확률로 100 추가 피해'],
  onDeal(f, e, d, o) { if (!o.extra && Math.random() < .05) damage(e, 10, f, { extra: 1, raw: 1 }); },
  ult: ['천검', '가장 가까운 상대(없으면 조준한 곳) 머리 위에서 대형 검이 떨어져 범위 안의 적에게 800 피해', [0, 9 * T], f => { const p = nearest(f, 9 * T, null, 0, false) || aimPt(f, 6 * T); fx('swordfall', p.x, p.y, { dur: .6, gold: skinOf(f.cos, 'sword') === 'skin_sword_p' }); strike(f, p.x, p.y, 80, .6, s => { fx('swordhit', s.x, s.y, { gold: skinOf(f.cos, 'sword') === 'skin_sword_p' }); circ(f, s.x, s.y, 80, 80, { kb: 160 }); }, '#dfe6f0'); }],
  skills: [
    [1, '돌진 베기', 'move', '앞으로 돌진하며(돌진하는 동안 피해를 받지 않음) 칼을 빙글빙글 휘둘러, 처음 닿은 적에게 450 피해를 주고 그 자리에서 멈춤', [60, 5 * T], (f, a) => { f.spin = .5; lunge(f, a, 5 * T, .5, { inv: 1, onHit: e => { damage(e, 45, f); return 'stop'; } }); }],
    [2, '강타', 'move', '앞으로 도약해(벽도 뛰어넘음) 떨어지며 검을 찍음 · 맞은 상대 0.5초 기절 + 피해 450', [60, 3 * T], (f, a) => { lunge(f, a, 3 * T, .3, { fly: 2, end: g => boom(g, g.x, g.y, 70, 45, { stun: .5, col: '#dfe6f0', kb: 0 }) }); }],
    [3, '칼 회전', 'hit', '제자리에서 칼을 1.2초 동안 빙글빙글 돌림 · 0.2초마다 주변 적에게 70 피해 (도는 동안 움직일 수 없음)', [0, 110], f => { buff(f, 'root', 1.2); f.spin = 1.2; seq(f, 6, .2, () => circ(f, f.x, f.y, f.h.range * 1.1, 7)); }],
    [4, '기사 수여', 'buff', '1초 동안 이동속도·데미지 20% 증가 · 즉시 한 번 이 스킬을 뺀 모든 쿨타임(다른 스킬·궁극기·대쉬)이 1초씩 참', [0, 6 * T], (f, a, i) => { buff(f, 'haste', 1, 1.2); buff(f, 'dmg', 1, 1.2); f.scd[1 - i] -= 1; f.ucd -= 1; f.dcd -= 1; }],
    [5, '처형', 'hit', '앞쪽 가까운 상대(4칸 안)에게 순간이동해 내려벰 · 500 피해 + 0.4초 기절 · 상대 체력이 30% 이하면 피해 2배 (상대가 없으면 쓰이지 않음)', [0, 4 * T], (f, a) => {
      const e = nearest(f, 4 * T, a, .7); if (!e) return false;
      const low = !e.minion && e.hp <= e.mhp * .3;
      blinkTo(f, e.x - Math.cos(angTo(f, e)) * 34, e.y - Math.sin(angTo(f, e)) * 34); f.swing = .22; f.aim = angTo(f, e);
      damage(e, low ? 100 : 50, f); buff(e, 'stun', .4); if (low) say(f, '처형!', '#ffd34d');
    }]
  ] });

hero('pistol', { p: ['붉은 탄환', '6번째 발사마다 탄환이 붉게 변하고 피해와 크기가 1.25배'],
  pre(f, o) { if (f.st.big) { f.st.big = 0; return Object.assign(o, { dmg: 66, r: 12, pierce: 9, spd: f.h.bspd * 1.5, range: 11 * T, shape: 'kdgun' }); }
    f.st.n = (f.st.n || 0) + 1; if (f.st.n % 6 === 0) { o.dmg = f.h.dmg * 1.25; o.r = 7; o.shape = 'chip'; } if (B(f, 'auto')) { o.homing = true; o.turn = 2.5; } return o; },
  tick(f) { if (B(f, 'auto')) { const e = nearest(f, f.h.range, null, 0); if (e) f.aim = angTo(f, e); } },
  ult: ['강화탄', '다음 발사 때 데미지 990의 크고 빠른 탄환 1발 (플레이어는 관통, 벽에서는 멈춤)', [0, 9 * T], f => { f.st.big = 1; f.fireCd = 0; }],
  skills: [
    [1, '속사', 'buff', '2.2초 동안 연사 속도 2배', [0, 8 * T], f => buff(f, 'rapid', 2.2, .5)],
    [2, '정확한 발사', 'hit', '유도 총알 발사 · 0.75초 동안 상대를 따라가고 그 뒤로는 마지막 방향으로 일직선', [100, 9 * T], (f, a) => emit(f, a, { skill: 1, dmg: 17, homing: true, homeT: .75, turn: 7, range: 10 * T, r: 6 })],
    [3, '양손 권총', 'buff', '1초 동안 양손에 권총 · 기본공격 쿨타임 50% 감소', [0, 8 * T], f => buff(f, 'rapid', 1, .5)],
    [4, '자동 조준', 'buff', '1.5초 동안 권총이 가장 가까운 상대를 자동 조준(커서 무시) · 발사한 탄은 약간 유도됨', [0, 8 * T], f => buff(f, 'auto', 1.5)],
    [5, '마지막 한 발', 'hit', '지난 3초 동안 자신이 받은 피해와 같은 피해의 대형 탄 1발 (받은 피해가 없으면 발동 안 됨)', [0, 9 * T], (f, a) => { const d = taken3(f); if (d < 1) return false; emit(f, a, { skill: 1, dmg: d, r: 13, range: 11 * T, shape: 'chip' }); }, { ok: f => taken3(f) > 30 }]
  ] });

hero('bow', { p: ['원거리 사격', '화살이 멀리 날아갈수록 피해가 커짐 (가까울수록 작고 멀수록 큼, 최소 150 ~ 최대 540)'],
  pre(f, o) { o.dmgAt = (b, e) => clamp(10 + 26 * Math.hypot(e.x - b.x0, e.y - b.y0) / (f.h.range * .85), 10, 36); return o; },
  ult: ['불화살', '불화살 3발 동시 발사, 맞으면 지속 피해', [100, 9 * T], (f, a) => emit(f, a, { skill: 1, count: 3, fan: .3, dmg: 30, burn: [4, 3], el: 1, shape: 'arrow' })],
  skills: [
    [1, '갈고리 화살', 'move', '조준한 방향으로 갈고리 화살을 쏨 · 벽에 맞으면 줄이 이어져 그 자리까지 빠르게 끌려감 · 상대에게 맞으면 그 상대에게 끌려간 뒤 300 피해와 함께 밀치고 0.8초 기절시킴 · 빗나가도 쿨타임은 똑같이 돌아감', [100, 8 * T], (f, a) => emit(f, a, { skill: 1, dmg: 0, range: 8 * T,
      onHit: e => { const ang = angTo(f, e); lunge(f, ang, Math.max(20, dist(f, e) - 30), .22, { fly: 1, end: g => { if (!e.dead) { damage(e, 20, g); knock(e, g.x, g.y, 420); buff(e, 'stun', .8); } } }); },
      onEnd: b => { if (b.wall && !b.target) lunge(f, Math.atan2(b.y - f.y - BODY, b.x - f.x), Math.max(20, Math.hypot(b.x - f.x, b.y - f.y - BODY) - 30), .25, { fly: 1 }); } })],
    [2, '화살비', 'hit', '조준한 곳에 화살 8발이 쏟아짐 (발당 피해 120)', [100, 8 * T], f => { const p = aimPt(f, 8 * T); fx('arrowwarn', p.x, p.y); seq(f, 8, .1, () => { const x = p.x + rnd(-70, 70), y = p.y + rnd(-70, 70); strike(f, x, y, 40, .25, () => { circ(f, x, y, 40, 8); burst(x, y, '#c9a463', 4, 120); }, '#c9a463'); }); }],
    [3, '폭발 화살', 'hit', '맞은 자리에서 폭발하는 화살을 쏨 · 폭발 범위 안 상대에게 225 피해 + 넉백', [100, 9 * T], (f, a) => emit(f, a, { skill: 1, dmg: 15, splash: 70, kb: 380 })],
    [4, '덫 화살', 'hit', '화살이 멈춘 자리에 덫이 깔림 · 덫을 밟은 상대를 3초 동안 속박 (덫은 15초 유지, 최대 3개)', [100, 8 * T], (f, a) => emit(f, a, { skill: 1, dmg: 0, range: Math.min(8 * T, Math.max(2 * T, Math.hypot(f.tx - f.x, f.ty - f.y))), onEnd: b => trap(f, clamp(b.x - Math.cos(b.ang) * 20, T * 1.3, WW - T * 1.3), clamp(b.y - Math.sin(b.ang) * 20 - BODY, T * 1.3, WH - T * 1.3), 15, 3, 'bowtrap', e => buff(e, 'root', 3)) })]
  ] });

hero('bat', { p: ['4번 타자', '상대를 4번 연속 맞히면 다음 공격이 매우 큰 넉백과 피해 1.25배'],
  mo(f) { const o = {}; if (f.st.hr) { o.kb = f.h.kb * 7.5; } if ((f.st.combo || 0) >= 4) { o.kb = (o.kb || f.h.kb) * 3; o.big = 1; } return o; },
  dmgf(f) { return (f.st.combo || 0) >= 4 ? 45 * 1.25 : 45; },
  onSwing(f, hits) { if (hits.length) { if (f.st.hr) f.st.hr = 0; f.st.combo = (f.st.combo || 0) >= 4 ? 0 : (f.st.combo || 0) + 1; } else f.st.combo = 0; },
  ult: ['홈런', '다음 공격이 맞으면 넉백 7.5배 · 3.5초 동안 이동속도 100% 증가', [0, 4 * T], f => { f.st.hr = 1; buff(f, 'haste', 3.5, 2); }],
  skills: [
    [1, '반사 스윙', 'buff', '0.7초 동안 주변 투사체를 되받아침', [100, 7 * T], f => { buff(f, 'reflect', .7); f.spin = .7; }],
    [2, '삼진아웃', 'hit', '야구공 3개를 일직선으로 던짐 (공 하나당 120 피해) · 맞은 상대는 공 하나당 0.25초 기절', [100, 8 * T], (f, a) => seq(f, 3, .15, () => emit(f, a, { skill: 1, dmg: 12, stun: .25, shape: 'mask', spd: 760, range: 8 * T, r: 6 }))],
    [3, '도루', 'move', '앞으로 슬라이딩 (대쉬의 2배 거리) · 지나친 적에게 100 피해', [60, 6 * T], (f, a) => lunge(f, a, DASH_D * 2, .3, { dmg: 10 })]
  ] });

hero('shuriken', { p: ['치고 빠지기', '대쉬 후 1초 안에 표창을 맞히면 대쉬 쿨타임 0.3초 감소'],
  onShot(f, e, b) { if (time - (f.lastDash || -9) < 1) f.dcd -= .3; if (f.st.crit) { f.st.crit = 0; damage(e, b.dmg, f, { raw: 1 }); blink(f, f.aim + Math.PI, 90); } },
  ult: ['회심의 일격', '다음 표창이 적중하면 데미지 2배 + 뒤로 짧게 순간이동', [0, 9 * T], f => { f.st.crit = 1; }],
  skills: [
    [1, '그림자 이동', 'move', '조준 방향으로 짧게 순간이동하고 1초 은신', [0, 6 * T], (f, a) => { blink(f, a, 3 * T); buff(f, 'stealth', 1); }],
    [2, '수리검 부채', 'hit', '조준 방향으로 수리검 5발을 부채꼴로 발사 (발당 피해 120)', [0, 6 * T], (f, a) => emit(f, a, { skill: 1, count: 5, fan: .5, dmg: 8 })],
    [3, '부채꼴 표창', 'hit', '표창 다섯 발을 넓은 부채꼴로 던짐 (발당 피해 150)', [0, 5 * T], (f, a) => emit(f, a, { skill: 1, count: 5, fan: 1.1, dmg: 10 })],
    [4, '연속 던지기', 'hit', '표창 세 발을 같은 방향 일직선으로 연속해서 던짐 (발당 일반 공격 피해)', [0, 8 * T], (f, a) => seq(f, 3, .1, () => emit(f, a, { skill: 1, dmg: 14 }))],
    [5, '담장 넘기', 'buff', '4초 동안 이동속도 7.5% 증가, 물과 용암 위를 넘어 다닐 수 있음', [0, 7 * T], f => { buff(f, 'haste', 4, 1.075); buff(f, 'fly', 4); }]
  ] });

hero('shotgun', { p: ['명사수의 위협', '알갱이를 모두 맞히면 상대 이동속도 20% 감소 (3초)'],
  onShot(f, e, b) { const k = 'v' + b.born; if (f.st.vk !== k) { f.st.vk = k; f.st.vn = 0; } if (++f.st.vn >= 5) buff(e, 'slow', 3, .8); },
  ult: ['삼연발', '산탄을 0.2초 간격으로 3연속 발사', [0, 5 * T], (f, a) => seq(f, 3, .2, () => emit(f, f.aim))],
  skills: [
    [1, '충격파', 'hit', '주변 적에게 180 피해 + 강하게 밀쳐냄', [0, 110], f => { ring(f.x, f.y, 120, '#ffe27a'); circ(f, f.x, f.y, 120, 18, { kb: 620 }); }],
    [2, '올가미 줄', 'hit', '올가미를 던져 맞은 적을 내 앞으로 끌어당기고 0.4초 기절', [100, 6 * T], (f, a) => emit(f, a, { skill: 1, dmg: 0, range: 6 * T, spd: 700, r: 9, shape: 'boomerang', onHit: e => { const p = fwd(f, 46, angTo(f, e)); if (!e.minion) blinkTo(e, p.x, p.y); buff(e, 'stun', .4); } })],
    [3, '집속 발사', 'hit', '산탄이 45% 좁게 모이고 사거리 20% 늘어난 샷건을 즉시 발사', [0, 6 * T], (f, a) => emit(f, a, { fan: .5 * .55, range: 5.5 * T * 1.2 })],
    [4, '분노의 질주', 'buff', '지난 3초 동안 받은 피해만큼 이동속도 증가(받은 피해 10당 이속 +1%, 최대 40%) · 3초 지속', [0, 7 * T], f => buff(f, 'haste', 3, 1 + Math.min(.4, taken3(f) / 100)), { ok: f => taken3(f) > 15 }],
    [5, '무법자', 'buff', '2초 동안 받는 피해 20% 감소', [0, 6 * T], f => buff(f, 'dr', 2, .8)]
  ] });

hero('rifle', { p: ['지뢰밭', '지뢰를 밟은 상대는 3초 동안 이동속도 10% 감소'],
  pre(f, o) { o.pad = 10; return o; },      // basic shots: hit radius 25 -> 35 (the user found the rifle too fussy to land)
  ult: ['미사일 폭격', '상대 근처 랜덤 3곳에 미사일이 떨어짐 (발당 750 피해, 벽 통과, 나는 피해 없음)', [0, 12 * T], f => { const es = foes(f); seq(f, 3, .3, i => { const e = es.length ? es[i % es.length] : fwd(f, 4 * T); const x = e.x + rnd(-60, 60), y = e.y + rnd(-60, 60); fx('warn', x, y, { dur: .8 }); strike(f, x, y, 75, .8, () => boom(f, x, y, 75, 60)); }); }],
  skills: [
    [1, '지뢰 설치', 'hit', '바닥에 지뢰 2개를 설치 (최대 2개, 25초) · 밟은 적은 250 피해와 0.5초 기절 · 지뢰는 상대에게도 보임 (1스킬 칸에서는 쿨타임 2배)', [0, 6 * T], f => { for (const s of [-1, 1]) { const p = fwd(f, 44, f.aim + s * 1.2); trap(f, p.x, p.y, 25, 2, 'mine', e => { damage(e, 20, f); buff(e, 'stun', .5); buff(e, 'slow', 3, .9); }, '#ff5d5d'); } }, { cd1: 10 }],
    [2, '수류탄 투척', 'hit', '수류탄을 던져 떨어진 곳에서 폭발 (500 피해)', [100, 7 * T], f => { const p = aimPt(f, 7 * T); strike(f, p.x, p.y, 80, .5, () => boom(f, p.x, p.y, 80, 40)); }],
    [3, '돌격', 'buff', '2초 동안 받는 데미지 20% 감소, 이동속도 20% 증가', [0, 7 * T], f => { buff(f, 'dr', 2, .8); buff(f, 'haste', 2, 1.2); }],
    [4, '지원', 'hit', '조준한 곳에 하늘에서 미사일 한 발이 떨어짐 (피해 875, 벽 통과, 나는 피해 없음)', [100, 9 * T], f => { const p = aimPt(f, 9 * T); fx('warn', p.x, p.y, { dur: .8 }); strike(f, p.x, p.y, px(110), .8, () => boom(f, p.x, p.y, px(110), 70)); }],
    [5, '방탄 방어막', 'buff', '몸 주변에 초록색 원이 생겨 최대 500 피해를 막아줌 (최대 2.5초) · 다 막으면 폭발해 주변 적에게 500 피해와 넉백 (나는 피해 없음)', [0, 6 * T], f => { f.shield = 50 * STAT_X; f.onShieldBreak = g => boom(g, g.x, g.y, 110, 40, { kb: 500, col: '#7ef0a8' }); later(2.5, () => { f.shield = 0; f.onShieldBreak = null; }, f); }]
  ] });

hero('smg', { p: ['일제사격', '연발을 8발 이상 맞히면 주위 상대를 밀치고 3초 동안 이동속도 1.75배'],
  onShot(f, e) { if (time - (f.st.vt || 0) > 1.2) { f.st.vt = time; f.st.vn = 0; } if (++f.st.vn === 8) { circ(f, f.x, f.y, 110, 0, { kb: 420 }); buff(f, 'haste', 3, 1.75); } },
  ult: ['방벽', '조준 방향 앞에 4초간 플레이어와 탄환을 막는 벽을 세움', [0, 6 * T], (f, a) => { const p = fwd(f, 1.6 * T, a); for (let i = -1; i <= 1; i++) { const c = Math.floor((p.x - Math.sin(a) * i * T) / T), r = Math.floor((p.y + Math.cos(a) * i * T) / T); if (c < 1 || r < 1 || c >= COLS - 1 || r >= ROWS - 1 || blocked(c, r)) continue; if (fighters.some(e => !e.dead && Math.floor(e.x / T) === c && Math.floor(e.y / T) === r)) continue; tempWalls.set(c + r * COLS, time + 4); } }],
  skills: [
    [1, '연막탄', 'hit', '조준한 곳으로 연막탄을 던짐 · 떨어진 자리에 2.5초 동안 짙은 연기 · 안에 있는 사람은 이동 속도가 절반으로 느려지고 시야가 가려짐', [100, 7 * T], f => { const p = aimPt(f, 7 * T); strike(f, p.x, p.y, 100, .4, () => (fx('smokeland', p.x, p.y), smoke(f, p.x, p.y, 100, 2.5)), '#9aa3b8'); }],
    [2, '섬광탄', 'hit', '던진 곳에서 0.5초 뒤 터져 범위 안 적을 1.2초 동안 실명', [100, 7 * T], f => { const p = aimPt(f, 7 * T); strike(f, p.x, p.y, 120, .5, () => { fx('flashbang', p.x, p.y); circ(f, p.x, p.y, 120, 0, { fn: e => buff(e, 'blind', 1.2) }); }, '#ffffff'); }],
    [3, '전술 구르기', 'move', '0.5초 동안 무적 상태로 짧게 구름', [0, 6 * T], (f, a) => { const m = (f.mv[0] || f.mv[1]) ? Math.atan2(f.mv[1], f.mv[0]) : a; f.inv = Math.max(f.inv, .5); lunge(f, m, 2.2 * T, .3, {}); }]
  ] });

hero('gloves', { p: ['맷집', '피격마다 받는 피해가 1%씩 줄고, 10%가 되면 초기화되며 2.5초 동안 이동속도 1.5배와 공격 피해 1.25배'],
  onHurt(f, d, by, o) { if (B(f, 'guard')) { if (time - f.st.gt < .25 && !f.st.perf) { f.st.perf = 1; buff(f, 'haste', 2, 1.2); say(f, '완벽한 가드'); return 0; } d *= .5; }
    if (o.quiet) return d; f.st.tough = (f.st.tough || 0) + 1; const r = d * (1 - f.st.tough / 100); if (f.st.tough >= 10) { f.st.tough = 0; buff(f, 'haste', 2.5, 1.5); buff(f, 'dmg', 2.5, 1.25); } return r; },
  ult: ['연타 러시', '3초간 공격 속도 2배 · 이동속도 1.4배', [0, 4 * T], f => { buff(f, 'rapid', 3, .5); buff(f, 'haste', 3, 1.4); }],
  skills: [
    [1, '어퍼컷', 'hit', '가까운 적에게 170 피해를 주고 공중으로 띄움 (0.6초 기절)', [0, 90], (f, a) => { const e = nearest(f, 90, a, 1.2); if (!e) return false; f.swing = .22; damage(e, 17, f); buff(e, 'stun', .6); }],
    [2, '가드', 'buff', '1초 동안 가드를 올려 받는 피해 50% 감소 · 올린 직후 0.25초 안에 맞으면 100% 막고 이동속도 20% 증가', [0, 5 * T], f => { buff(f, 'guard', 1); f.st.gt = time; f.st.perf = 0; }],
    [3, '잽 연타', 'hit', '앞으로 살짝 파고들며 3연타 (각 60 피해)', [0, 130], (f, a) => { lunge(f, a, 50, .1, {}); seq(f, 3, .1, () => { f.swing = .12; arc(f, f.aim, 80, 1, 6); }); }],
    [4, '클린치', 'hit', '가까운 적을 붙잡아 1초 동안 서로 고정 · 붙잡는 순간 80 피해, 1초 뒤 80 피해', [0, 90], (f, a) => { const e = nearest(f, 90, a, 1.4); if (!e) return false; buff(e, 'root', 1); buff(f, 'root', 1); damage(e, 8, f); later(1, () => { if (!e.dead) damage(e, 8, f); }, f); }]
  ] });

hero('grenade', { p: ['폭발광', '폭발 점프로 피해를 주면 착지 때 근처 상대를 밀치고 0.4초 기절'],
  ult: ['집속탄', '소형 수류탄 5개를 부채꼴로 투척', [100, 6 * T], (f, a) => emit(f, a, { skill: 1, count: 5, fan: 1, dmg: 30, splash: 60, shape: 'bomb' })],
  skills: [
    [1, '폭발 점프', 'move', '폭발로 조준 방향으로 높이 뛰어올라(벽도 뛰어넘음) 주변에 475 피해', [0, 110], (f, a) => { const hit = boom(f, f.x, f.y, 100, 56).length; lunge(f, a, 3 * T, .35, { fly: 2, end: g => { if (hit) circ(g, g.x, g.y, 90, 0, { kb: 420, stun: .4 }); } }); }],
    [2, '폭격', 'hit', '내 앞과 뒤로 폭탄을 2개씩 바로 발사', [0, 5 * T], (f, a) => { for (const s of [0, Math.PI]) emit(f, a + s, { count: 2, fan: .35, full: 1 }); }],
    [3, '끈끈이 폭탄', 'hit', '조준 방향으로 끈끈한 폭탄을 쏨 · 맞은 상대에게 달라붙어(130 피해) 1.5초 뒤 그 상대 자리에서 크게 터짐 (주변 595 피해, 넉백) · 붙은 동안 상대 위에 빨간 고리가 깜빡임', [0, 6 * T], (f, a) => emit(f, a, { skill: 1, dmg: 15, spd: 620, range: 6 * T, r: 9, shape: 'potion', onHit: e => { seq(f, 3, .5, () => { if (!e.dead) ring(e.x, e.y, 46, '#ff5d5d', .25); }); later(1.5, () => { const x = e.dead ? e.x : e.x, y = e.y; boom(f, x, y, 90, 70, { kb: 300 }); }); } })],
    [4, '강력한 폭탄', 'hit', '조준한 곳으로 큰 폭탄을 던짐 (일반 공격처럼 날아가 떨어진 곳에서 터짐, 475 피해) · 터지면 근처 벽과 덤불이 경기가 끝날 때까지 사라짐 (테두리 벽은 그대로)', [100, 7 * T], (f, a) => { const p = aimPt(f, 7 * T); emit(f, Math.atan2(p.y - f.y, p.x - f.x), { skill: 1, shape: 'bomb', wp: true, r: 9, dmg: 56, splash: 100, range: Math.max(T, Math.hypot(p.x - f.x, p.y - f.y)), onBoom: (x, y) => { let bz = 0; for (let r = Math.floor((y - 100) / T); r <= Math.floor((y + 100) / T); r++) for (let c = Math.floor((x - 100) / T); c <= Math.floor((x + 100) / T); c++) { if (c <= 0 || r <= 0 || c >= COLS - 1 || r >= ROWS - 1 || Math.hypot((c + .5) * T - x, (r + .5) * T - y) > 100) continue; const t = MAP[r][c]; if (t === 'G' && typeof GD !== 'undefined') { const e = GD.plants.get(c + ',' + r); if (e) e.until = time; } else if (t === 'g') { MAP[r][c] = '.'; bz = 1; burst((c + .5) * T, (r + .5) * T, '#4f8a3a', 10, 200); } } if (bz) NET.mapVer++;      // the blast burns away bushes too (the map's own for the rest of the match, planted ones wither)
      const c0 = Math.floor(x / T), r0 = Math.floor(y / T); for (let r = r0 - 1; r <= r0 + 1; r++) for (let c = c0 - 1; c <= c0 + 1; c++) if (c > 0 && r > 0 && c < COLS - 1 && r < ROWS - 1 && MAP[r][c] === '#' && Math.hypot((c + .5) * T - x, (r + .5) * T - y) < 1.3 * T) { MAP[r][c] = '.'; NET.mapVer++; burst((c + .5) * T, (r + .5) * T, TH.wt, 14, 260); } } }); }]
  ] });

hero('bazooka', { p: ['화력 집중', '스킬 로켓 3발이 모두 맞으면 그 자리에 3초 동안 화염 (닿으면 초당 30 피해)'],
  pre(f, o) { if (f.st.homing) { f.st.homing = 0; o.homing = true; o.turn = 6; o.range = 12 * T; } return o; },
  ult: ['유도탄', '다음 공격이 적을 추적하는 유도탄', [0, 10 * T], f => { f.st.homing = 1; f.fireCd = Math.min(f.fireCd, .2); }],
  skills: [
    [1, '3연발', 'hit', '조준 방향으로 로켓을 연속 3발 발사 (발당 피해 300)', [100, 8 * T], (f, a) => { let n = 0; seq(f, 3, .18, () => emit(f, f.aim, { skill: 1, dmg: 30, splash: 55, shape: 'rocket', onSplash: e => { if (++n === 3) fire3(f, e.x, e.y, 70, 3, 3); } })); }],
    [2, '연막 로켓', 'hit', '로켓을 쏴 맞은 자리에 연기 폭발 · 연기 안의 적은 시야가 가려지고 느려짐', [100, 8 * T], (f, a) => emit(f, a, { skill: 1, dmg: 10, shape: 'rocket', splash: 40, onEnd: b => smoke(f, b.x, b.y, 110, 2.5) })],
    [3, '화염 로켓', 'hit', '로켓을 쏴 화염 피해(400) · 터진 자리에 3초 동안 화염 지대가 생김', [100, 8 * T], (f, a) => emit(f, a, { skill: 1, dmg: 40, el: 1, shape: 'rocket', splash: 80, onEnd: b => fire3(f, b.x, b.y, 80, 3, 8) })],
    [4, '전기 로켓', 'hit', '로켓을 쏴 전기 피해(350) · 폭발에 맞은 적은 0.95초 동안 기절', [100, 8 * T], (f, a) => emit(f, a, { skill: 1, dmg: 35, el: 1, shape: 'rocket', splash: 80, stun: .95, col: '#7df0ff' })]
  ] });

hero('dagger', { p: ['날렵함', '대쉬 쿨타임이 0.5초 (기본 1.5초)'], dashCd: () => .5,
  mo(f) { return f.st.venom ? { fn: e => { const s = f.st.venom; f.st.venom = 0; if (e.dots) { addDot(e, { t: 3, dps: 4, by: f, tick: .5 }); e.dots[e.dots.length - 1].src = s; } } } : null; },
  ult: ['은신', '4.5초간 가까이 온 적에게만 보임 (공격하면 풀림)', [0, 7 * T], f => { buff(f, 'stealth', 4.5); fxAt(f, 'smokeveil'); }],
  skills: [
    [1, '암습', 'move', '가까운 적의 뒤로 순간이동, 다음 공격 즉시 가능', [80, 6 * T], f => { const e = nearest(f, 6 * T, null, 0, false); if (!e) return false; const a = e.minion ? angTo(f, e) : e.aim; blinkTo(f, e.x - Math.cos(a) * 40, e.y - Math.sin(a) * 40); f.aim = angTo(f, e); f.fireCd = 0; }],
    [2, '도약', 'move', '뛰어오른 뒤 적 쪽으로 대쉬의 3.5배 거리를 점멸하며 지나간 상대에게 피해 360', [100, 9 * T], (f, a) => { buff(f, 'root', .25); f.inv = Math.max(f.inv, .3); later(.25, () => { const r = blink(f, f.aim, DASH_D * 3.5, 1); pathHit(f, r.x0, r.y0, f.x, f.y, 30, 36); }, f); }],
    [3, '독 바른 단검', 'buff', '다음 일반 공격이 맞으면 3초 동안 독 (초당 40 피해) · 빗나가면 다음 공격으로 이어짐', [0, 4 * T], f => { f.st.venom = SRC || 1; }],
    [4, '연막 탈출', 'move', '바라보는 반대쪽(뒤)으로 대쉬하고 1초 동안 투명', [0, 3 * T], (f, a) => { lunge(f, a + Math.PI, DASH_D, .16, {}); buff(f, 'stealth', 1); }, { ok: f => f.hp < f.mhp * .6 }]
  ] });

hero('dracula', { p: ['흡혈귀', '공격이 적중할 때마다 체력 50 흡수 · 처치하면 체력 250 회복'],
  onDeal(f, e, d, o) { if (o.basic) heal(f, 5 + (B(f, 'fresh') ? 2 : 0)); },
  onKill(f) { heal(f, 25); },
  spd(f) { return f.form === 'bat' ? 1.7 : 1; },
  ult: ['박쥐 변신', '8초간 박쥐로 변해 날아다니며(물과 용암 위를 지나감) 이동속도·데미지 증가, 종료 시 그동안 입힌 피해만큼 체력 회복(팀원은 50%)', [0, 6 * T], f => { f.form = 'bat'; fxAt(f, 'batform'); const d0 = f.dealt; buff(f, 'fly', 8); buff(f, 'dmg', 8, 1.6); f.b.fly.end = g => { g.form = null; unstick(g); fxAt(g, 'batform'); const d = g.dealt - d0; heal(g, d / STAT_X); for (const a of allies(g)) if (a !== g) heal(a, d / STAT_X * .5); }; }],
  skills: [
    [1, '피의 안식', 'buff', '1초 동안 움직일 수 없는 대신 0.1초마다 체력 50 회복 (총 500)', [3 * T, 12 * T], f => { buff(f, 'root', 1); seq(f, 10, .1, () => heal(f, 5)); }, { ok: f => f.hp < f.mhp * .7 }],
    [2, '박쥐 떼', 'move', '박쥐 떼로 흩어져 조준 방향으로 날아감 · 지나간 적에게 피해 250 + 체력 150 회복', [60, 5 * T], (f, a) => { const r = blink(f, a, 4 * T, 1); if (pathHit(f, r.x0, r.y0, f.x, f.y, 30, 25).length) heal(f, 15); }],
    [3, '신선한 피', 'buff', '1초 동안 일반 공격으로 회복하는 체력 +20', [0, 100], f => buff(f, 'fresh', 1)]
  ] });

hero('wizard', { p: ['마법진의 파동', '마법진 안에서는 스킬 밀쳐내는 힘 2배'], pierce: 1,
  tick(f, dt) { const o = f.st.orb; if (o && o.n > 0) { o.t -= dt; if (o.t <= 0) { o.n = 0; return; } for (let i = 0; i < o.n; i++) { const a = time * 3 + i * 6.283 / 5, x = f.x + Math.cos(a) * 54, y = f.y + Math.sin(a) * 54; const e = foes(f).find(e => Math.hypot(e.x - x, e.y - y) < 30); if (e) { withSrc(o.src, () => damage(e, 14, f)); o.n--; break; } } } },
  ult: ['마법진', '자신의 위치에 거대한 마법진 소환(10초): 나와 아군은 공격력 30% 증가 + 초당 120 회복, 안에 들어온 적은 초당 115 피해', [0, 6 * T], f => (fx('magiccircle', f.x, f.y), zone)({ by: f, x: f.x, y: f.y, r: px(330), t: 10, col: '#b98cff', kind: 'circle', fn: (z, dt) => { z.acc += dt; const tk = z.acc >= .5; if (tk) z.acc -= .5; for (const a of allies(f)) if (inZone(z, a)) { buff(a, 'dmg', .2, 1.3); if (tk) heal(a, 6); } if (tk) circ(f, z.x, z.y, z.r, 4.5, { quiet: 1 }); } })],
  skills: [
    [1, '충격파', 'hit', '주변 상대를 아주 크게 밀쳐내는 충격파 (130 피해)', [0, 120], f => { const inC = zones.some(z => z.kind === 'circle' && z.by === f && inZone(z, f)); ring(f.x, f.y, 130, '#b98cff'); circ(f, f.x, f.y, 130, 10, { kb: inC ? 1800 : 900 }); }],
    [2, '마력 압축', 'hit', '기존 탄환보다 2배 큰 탄환을 발사 · 무한정 관통 · 관통과 상관없이 피해 260', [100, 8 * T], (f, a) => emit(f, a, { skill: 1, dmg: 20, r: 10, pierce: 99 })],
    [3, '마력 연사', 'hit', '조준 방향으로 마법 탄환을 세 발 연속으로 쏨 (발당 일반 공격 피해)', [100, 8 * T], f => seq(f, 3, .15, () => emit(f, f.aim, { skill: 1, dmg: 14, pierce: 1 }))],
    [4, '파동 쏘기', 'hit', '마법 탄환 2개가 엇갈린 파동 궤적을 그리며 날아감 (각 일반 공격 피해) · 두 발 다 같은 상대에게 맞으면 추가 피해 +195', [100, 8 * T], (f, a) => { const got = new Set(); for (const s of [-1, 1]) emit(f, a, { skill: 1, dmg: 14, wave: s, onHit: e => { if (got.has(e)) damage(e, 15, f); got.add(e); } }); }],
    [5, '마력 보호', 'buff', '자기 주위에 마력 탄환 5개가 8초 동안 빙글빙글 돎 · 상대에 닿으면 사라지며 일반 공격 피해', [0, 5 * T], f => { f.st.orb = { n: 5, t: 8, src: SRC }; }]
  ] });

hero('magiccard', { p: ['카드 마술', '기본 공격은 맞은 상대를 느리게 하고 3장이 모두 맞으면 +45 피해와 0.5초 기절 · 스킬 카드 5장이 모두 한 상대에게 맞으면 기절'],
  pre(f, o) { if (f.st.flower) { f.st.flower = 0; return Object.assign(o, { count: 1, fan: 0, dmg: 5, mute: 1, shape: 'cleonorb', r: 8 }); } const got = new Map(); o.slow = [.75, 1.2]; o.onHit = e => { const n = (got.get(e) || 0) + 1; got.set(e, n); if (n === 3) { damage(e, 4, f); buff(e, 'stun', .5); } }; return o; },
  tick(f) { if (f.st.flower && time > f.st.flower) f.st.flower = 0; },
  ult: ['탈출 마법', '가장 가까운 상대 위치로 순간이동해 1초 동안 쿨타임 없이 카드를 2번 연속 발사, 1초 뒤 원래 있던 자리로 되돌아옴', [100, 8 * T], f => { const e = nearest(f, 9 * T, null, 0, false); if (!e) return false; const x0 = f.x, y0 = f.y; blinkTo(f, e.x - Math.cos(angTo(f, e)) * 70, e.y - Math.sin(angTo(f, e)) * 70); seq(f, 2, .4, () => { if (!e.dead) f.aim = angTo(f, e); emit(f, f.aim); }); later(1, () => blinkTo(f, x0, y0), f); }],
  skills: [
    [1, '카드 일렬 발사', 'hit', '조준 방향으로 카드 5장을 일렬로 연달아 발사 (장당 90 피해)', [100, 7 * T], f => { const got = new Map(); seq(f, 5, .08, () => emit(f, f.aim, { skill: 1, count: 1, fan: 0, dmg: 8, onHit: e => { const n = (got.get(e) || 0) + 1; got.set(e, n); if (n === 5) { buff(e, 'stun', .8); fxAt(e, 'combo'); } } })); }],
    [2, '비둘기 변신', 'move', '1.5초 동안 모자 쓴 비둘기로 변해 물 위를 지나 상대에게 날아감 · 돌진 중 상대에게 닿으면 바로 변신이 풀리고 상대 0.9초 기절', [100, 8 * T], f => { f.form = 'dove'; buff(f, 'fly', 1.5); buff(f, 'haste', 1.5, 2.1); f.b.fly.end = g => { if (g.form === 'dove') g.form = null; unstick(g); }; f.st.dove = 1; }],
    [3, '모자 던지기', 'move', '모자를 던지고 사라짐 · 모자는 조준 방향으로 일직선으로 빠르게 날아가고(벽과 물 앞에서 멈춤), 모자가 멈추면 그 자리에 마술사가 다시 나타남 (이동기)', [0, 7 * T], (f, a) => {
      f.form = 'gone'; f.ghost = true; const x0 = f.x, y0 = f.y, p = { x: x0, y: y0 }, max = 5.5 * T, side = [0, 12, -12]; f.st.hat = p;
      let L = 0; for (let s = 8; s <= max; s += 8) { const cx = x0 + Math.cos(a) * (s + 20), cy = y0 + Math.sin(a) * (s + 20); if (side.some(o => blockedAt(cx - Math.sin(a) * o, cy + Math.cos(a) * o))) break; L = s; }      // the whole hat (not just its middle) has to fit
      const spd = max / .5, tt = L / spd;      // full range in 0.5 s (was 1 s): the magician is out of the fight for less time
      for (let s = 8; s <= L; s += 8) later(s / spd, () => { p.x = x0 + Math.cos(a) * s; p.y = y0 + Math.sin(a) * s; });
      later(Math.max(.25, tt + .1), () => { if (f.form !== 'gone') return; f.form = null; f.ghost = false; f.st.hat = null; blinkTo(f, x0 + Math.cos(a) * L, y0 + Math.sin(a) * L); });
    }],
    [4, '꽃 마술', 'buff', '손에서 꽃을 만들어 냄 · 다음 공격으로 꽃을 던져, 맞은 상대는 1초 동안 공격 불가 (10초 안에 던지지 않으면 사라짐)', [0, 7 * T], f => { f.st.flower = time + 10; }],
    [5, '카드 날리기', 'hit', '일반 공격(카드 3장 부채꼴)을 0.25초 간격으로 세 번 연속 발사', [0, 7 * T], f => seq(f, 3, .25, () => emit(f, f.aim))]
  ] });
HEROES.magiccard.tick = (o => function (f, dt) { o(f, dt); if (f.form === 'dove') { const e = nearest(f, 9 * T, null, 0, false); if (e) { f.kx = 0; const a = angTo(f, e); f.x += 0; moveFighter(f, Math.cos(a) * 240 * dt, Math.sin(a) * 240 * dt); if (dist(f, e) < 40) { buff(e, 'stun', .9); f.form = null; unbuff(f, 'fly'); unbuff(f, 'haste'); unstick(f); } } } })(HEROES.magiccard.tick);

const CARD_V = c => c % 13 + 1, CARD_S = c => Math.floor(c / 13);
const cardName = c => c >= 52 ? '조커' : '♠♥♦♣'[CARD_S(c)] + ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'][c % 13];
const draw = (n, jokers) => { const d = []; for (let i = 0; i < 52 + (jokers ? 2 : 0); i++) d.push(i); d.sort(() => Math.random() - .5); return d.slice(0, n); };
function pokerRank(cs) {
  const v = cs.map(CARD_V).sort((a, b) => a - b), cnt = {}; for (const x of v) cnt[x] = (cnt[x] || 0) + 1;
  const c = Object.values(cnt).sort((a, b) => b - a), flush = cs.every(x => CARD_S(x) === CARD_S(cs[0]));
  const str = c[0] === 1 && (v[4] - v[0] === 4 || v.join() === '1,10,11,12,13');
  if (str && flush) return v.join() === '1,10,11,12,13' ? 9 : 8; if (c[0] === 4) return 7; if (c[0] === 3 && c[1] === 2) return 6; if (flush) return 5; if (str) return 4; if (c[0] === 3) return 3; if (c[0] === 2 && c[1] === 2) return 2; if (c[0] === 2) return 1; return 0;
}
const POKER = [['노 페어', 0, 0], ['원 페어', 3, .1], ['투 페어', 4, .2], ['트리플', 4, .3], ['스트레이트', 5, .4], ['플러시', 5, .4], ['풀 하우스', 5, .5], ['포 카드', 6, .8], ['스트레이트 플러시', 8, 1], ['로열 스트레이트 플러시', 10, 1.2]];
hero('gambler', { p: ['운명의 주사위', '일반 공격 피해가 40~360 중 무작위로 정해짐 · 맞힐 때마다 칩 +1 (최대 6)'],
  pre(f, o) { if (f.st.fix) { o.dmg = f.st.fix; f.st.fix = 0; o.r = 9; } else o.dmg = Math.round(rnd(4, 36)); return o; },
  onShot(f) { f.st.chip = Math.min(6, (f.st.chip || 0) + 1); },
  ult: ['삼중 도박', '트럼프 카드(52장+조커 2장)에서 3장을 뽑아 숫자의 합(A=1, J=11, Q=12, K=13)×10이 다음 일반 공격의 데미지가 됨 (가진 칩 1개당 +10, 칩 모두 사용) · 같은 무늬 +50 · 같은 숫자 +100 · 연속 세 숫자 +150 · A: 체력 300 회복 · K: 5초간 이동속도 +50% · J: 스킬·대쉬 쿨타임 초기화 · Q: 1초간 대쉬 쿨타임 0초 · 조커: 옆 카드와 똑같이', [0, 9 * T], f => {
    let cs = draw(3, true); const cs0 = cs.slice(), shown = cs.map(cardName).join(' '); cs = cs.map((c, i) => c >= 52 ? (cs.find(x => x < 52) === undefined ? 0 : (cs[i - 1] < 52 ? cs[i - 1] : cs[i + 1] < 52 ? cs[i + 1] : cs.find(x => x < 52))) : c);
    const v = cs.map(CARD_V), s = cs.map(CARD_S), sv = v.slice().sort((a, b) => a - b); let d = v[0] + v[1] + v[2] + (f.st.chip || 0); f.st.chip = 0;
    const suit = s[0] === s[1] && s[1] === s[2], same = v[0] === v[1] && v[1] === v[2], run = sv[1] === sv[0] + 1 && sv[2] === sv[1] + 1;
    if (suit && same) d += 20; else { if (suit) d += 5; if (same) d += 10; } if (run) d += 15;
    if (v.includes(1)) heal(f, 30); if (v.includes(13)) buff(f, 'haste', 5, 1.5); if (v.includes(11)) { f.scd = [0, 0]; f.dcd = 0; } if (v.includes(12)) { f.dcd = 0; buff(f, 'freedash', 1); }
    f.st.fix = d; cardFx(f, cs0, d * STAT_X, (suit && same ? ['무늬와 숫자 모두 같음 +' + 20 * STAT_X] : (suit ? ['같은 무늬 +' + 5 * STAT_X] : []).concat(same ? ['같은 숫자 +' + 10 * STAT_X] : [])).concat(run ? ['연속 세 숫자 +' + 15 * STAT_X] : [])); }],
  dashCd: f => B(f, 'freedash') ? 0.05 : 1.5,
  skills: [
    [1, '동전 던지기', 'buff', '앞면(확률 50% + 칩당 9%): 체력 250 회복 + 칩 1개당 30 추가 / 뒷면: 가까운 적에게 180 피해 + 칩 1개당 40 추가 (칩은 소모되지 않음)', [0, 6 * T], f => { const c = f.st.chip || 0; if (Math.random() < .5 + c * .09) { fxAt(f, 'coinflip', { heads: true }); heal(f, 25 + 3 * c); } else { fxAt(f, 'coinflip', { heads: false, tx: (nearest(f, 7 * T, null, 0, false) || f).x, ty: (nearest(f, 7 * T, null, 0, false) || f).y + BODY }); const e = nearest(f, 7 * T, null, 0, false); if (e) damage(e, 18 + 4 * c, f); } }],
    [2, '올인', 'hit', '칩을 전부 걸어 칩 1개당 피해 80의 큰 탄환을 발사 (칩이 없으면 사용 불가)', [100, 9 * T], (f, a) => { const c = f.st.chip || 0; if (!c) return false; f.st.chip = 0; emit(f, a, { skill: 1, dmg: 8 * c, r: 6 + c * 1.5 }); }, { ok: f => (f.st.chip || 0) >= 3 }],
    [3, '슬롯 머신', 'hit', '앞에 슬롯 머신 설치 (체력 1200, 공격을 받으면 체력이 깎이고 나도 때릴 수 있음) · 체력이 다 깎이면 슬롯이 돌아감: 777(1/8)이면 5초간 이동속도 +100%·피해 +50%와 모든 쿨타임 초기화, 같은 그림 둘(3/8)이면 체력 300 회복', [0, 6 * T], (f, a) => { const p = fwd(f, 60, a); minion({ by: f, kind: 'slot', x: p.x, y: p.y, hp: 120, t: 20, hit: true, bound: false, both: true, end: m => { if (m.hp > 0) return; const r = Math.random(); ring(m.x, m.y, 60, '#ffd34d'); if (f.dead) return; if (r < 1 / 8) { say(f, '7 7 7', '#ffd34d'); buff(f, 'haste', 5, 2); buff(f, 'dmg', 5, 1.5); f.scd = [0, 0]; f.ucd = 0; f.dcd = 0; } else if (r < .5) { say(f, '한 쌍', '#ffffff'); heal(f, 30); } else say(f, '꽝', '#8890a4'); } }); }],
    [4, '블랙잭', 'buff', '트럼프 카드 두 장을 공개 (A=1 또는 11, J·Q·K=10) · 합이 21이면 모든 쿨타임이 즉시 차고 다음 공격 데미지가 1000으로 고정, 아니면 아무 효과 없음', [0, 9 * T], (f, a, i) => { const cs = draw(2), v = cs.map(c => Math.min(10, CARD_V(c))); const bj = v.includes(1) && v.includes(10); cardFx(f, cs, v.reduce((a, b) => a + b, 0), [bj ? '블랙잭! 쿨타임 초기화 · 다음 공격 ' + 100 * STAT_X : '꽝']); if (bj) { later(0, () => { f.scd = [0, 0]; f.ucd = 0; f.dcd = 0; }); f.st.fix = 100; } }],
    [5, '포커', 'buff', '카드 5장을 공개해 족보에 따라 버프 (원 페어 3초 피해 +10% · 투 페어 4초 +20% · 트리플 4초 +30% · 스트레이트/플러시 5초 +40% · 풀 하우스 5초 +50%·이동속도 +30%·체력 300 회복 · 포 카드 6초 +80% · 스트레이트 플러시 8초 +100% · 로열 스트레이트 플러시 10초 +120%) · 아무것도 안 맞으면 효과 없음', [0, 9 * T], f => { const cs = draw(5), k = pokerRank(cs), P = POKER[k]; cardFx(f, cs, null, [P[0]]); if (!k) return; buff(f, 'dmg', P[1], 1 + P[2]); if (k === 6) { buff(f, 'haste', 5, 1.3); heal(f, 30); } }]
  ] });

hero('boomerang', { p: ['되돌아오는 칼날', '부메랑은 사람을 관통하고 벽에 닿으면 돌아옴 · 돌아오는 길에 맞히면 피해 1.5배'],
  cd: .25, atk(f, a) { f.boomOut = true; const s = f.st.sense; f.st.sense = 0; emit(f, a, { boom: 1, range: 6.5 * T * (s ? 1.5 : 1), spd: f.h.bspd * (s ? 1.3 : 1), dmg: 21 * (s ? 1.15 : 1), dmgAt: b => b.dmg * (b.phase ? 1.5 : 1) }); return 1; },
  ult: ['부메랑 난무', '부메랑 5개를 부채꼴로 던짐', [0, 6 * T], (f, a) => emit(f, a, { skill: 1, count: 5, fan: 1, pierce: 9, dmg: 21, range: 6.5 * T })],
  skills: [
    [1, '회수 돌풍', 'hit', '주변 적을 80 피해와 함께 내 쪽으로 끌어당기고, 던진 부메랑을 즉시 불러들임', [0, 150], f => { ring(f.x, f.y, 160, '#c98a4b'); circ(f, f.x, f.y, 160, 8, { kb: -520 }); bullets = bullets.filter(b => !(b.boom && b.owner === f)); f.boomOut = false; f.fireCd = 0; }],
    [2, '올가미 덫', 'hit', '바닥에 덫 설치 (20초, 최대 3개) · 밟은 적은 1.5초 동안 속박', [0, 7 * T], f => trap(f, f.x, f.y, 20, 3, 'snare', e => buff(e, 'root', 1.5))],
    [3, '사냥의 감', 'buff', '다음 일반 공격 부메랑의 사거리 +50%, 속도 +30%, 피해 +15%', [0, 9 * T], f => { f.st.sense = 1; }]
  ] });

hero('flamethrower', { p: ['불길 위의 춤', '내가 남긴 불길 위에서는 이동속도 1.3배와 초당 체력 30 회복'], type: 'flame', range: 250, half: .36, cd: 0, tapHold: .7,
  spd(f) { return zones.some(z => z.kind === 'fire' && z.by === f && inZone(z, f)) ? 1.3 : 1; },
  tick(f, dt) { if (f.st.over > 0) f.st.over -= dt; if (zones.some(z => z.kind === 'fire' && z.by === f && inZone(z, f))) { f.st.ha = (f.st.ha || 0) + dt; if (f.st.ha >= 1) { f.st.ha = 0; heal(f, 3); } } },
  fireHeld(f, dt) { if (f.st.over > 0) return; f.st.heat = (f.st.heat || 0) + dt; f.lastFire = time; unbuff(f, 'stealth');
    if (f.st.heat >= 9 * (B(f, 'gas') ? 1.1 : 1)) { f.st.heat = 0; f.st.over = 2; say(f, '과열', '#ff5d5d'); return; }
    arc(f, f.aim, f.h.range, f.h.half, 31 * dt, { quiet: 1, el: 1 });
    if ((f.st.fpT = (f.st.fpT || 0) - dt) <= 0) { f.st.fpT = .09; fx('flamepuff', f.x + Math.cos(f.aim) * 24, f.y + BODY + Math.sin(f.aim) * 24, { ang: +f.aim.toFixed(2), len: 230 }); } },
  ult: ['화염 방패', '내 앞에 최대 600 피해를 막는 방패를 설치 (6초 지속, 항상 바라보는 방향 앞에 위치, 그만큼 막으면 소멸) · 앞에서 날아오는 투사체를 막음', [0, 9 * T], f => { const s = { hp: 60 }; f.st.fsh = s; fxAt(f, 'shieldup'); later(6, () => { if (f.st.fsh === s) f.st.fsh = null; }); }],
  skills: [
    [1, '화염 돌진', 'move', '바라보는 방향으로 순식간에 돌진 · 지나가는 길의 적에게 200 피해와 화상 · 지나온 자리는 3초 동안 불길이 남아 적을 태움', [60, 5 * T], (f, a) => { let d = 0; const sx = f.x, sy = f.y; lunge(f, a, 4.2 * T, .22, { dmg: 20, burn: [4, 3], el: 1, col: '#ff7a1a', trail: g => { if (++d % 3 === 0) fire3(g, g.x, g.y, 34, 3, 8); }, end: g => fxLine('firedash', sx, sy + BODY, g.x, g.y + BODY) }); }],
    [2, '불기둥', 'hit', '조준한 바닥에 3초 동안 불기둥 (초당 피해 150 + 화상)', [100, 6 * T], f => { const p = aimPt(f, 6 * T); fire3(f, p.x, p.y, 70, 3, 15); seq(f, 3, 1, () => fx('firepillar', p.x, p.y, { r: 70 })); }],
    [3, '가스 폭발', 'buff', '2초 동안 주는 피해 +10%, 과열까지의 시간 +10%', [0, 250], f => { buff(f, 'dmg', 2, 1.1); buff(f, 'gas', 2); }]
  ] });

hero('vacuum', { p: ['먼지 주머니', '맞힐 때마다 스택 축적(최대 8), 맞은 상대를 살짝 끌어당김 · 스택 1개마다 이동속도 +5%'], type: 'cone', range: 290, half: .4,
  spd(f) { return 1 + .05 * (f.st.stack || 0); },
  atk(f, a) { f.swing = .22; const n = arc(f, a, 290, .4, 24, { kb: -260 }).length; if (n) { f.st.stack = Math.min(8, (f.st.stack || 0) + (f.st.master ? 3 : 1)); f.st.master = 0; }
    fx('vaccone', f.x, f.y + BODY, { ang: +a.toFixed(2), range: 290 }); return 1; },
  ult: ['먼지 폭풍', '청소기에서 먼지를 뱉어내 상대를 강하게 밀치고 쌓인 스택 수 × 100만큼 피해 (사거리는 일반공격의 절반, 사용하면 스택 초기화)', [0, 140], (f, a) => { arc(f, a, 145, .6, (f.st.stack || 0) * 10 + .01, { kb: 900 }); f.st.stack = 0; fx('dustblast', f.x + Math.cos(a) * 40, f.y + BODY + Math.sin(a) * 40, { ang: +a.toFixed(2) }); fx('gust', f.x + Math.cos(a) * 80, f.y + BODY + Math.sin(a) * 80, { r: 120 }); }, f => (f.st.stack || 0) >= 3],
  skills: [
    [1, '블랙홀 흡입', 'hit', '스택 3개를 소모해 주변 적을 강하게 빨아들이고 1초 기절 (스택이 2개 이하면 사용 불가)', [0, px(330)], f => { if ((f.st.stack || 0) < 3) return false; f.st.stack -= 3; ring(f.x, f.y, px(330), '#9a4cff'); circ(f, f.x, f.y, px(330), 0, { stun: 1, fn: e => { if (!e.minion) { const a = angTo(f, e); blinkTo(e, f.x + Math.cos(a) * 46, f.y + Math.sin(a) * 46); } } }); }, { ok: f => (f.st.stack || 0) >= 3 }],
    [2, '먼지구름', 'hit', '내 주변에 먼지구름을 3초 동안 만들어 안에 있는 사람의 시야를 가림', [0, 150], f => zone({ by: f, x: f.x, y: f.y, r: 130, t: 3, col: '#b9a98a', op: .5, fn: z => { for (const e of foes(f)) if (!e.minion && inZone(z, e)) buff(e, 'blind', .25); } })],
    [3, '흡입의 달인', 'buff', '다음 일반 공격이 맞으면 스택을 3개 쌓음 (맞출 때까지 유지)', [0, 290], f => { f.st.master = 1; }]
  ] });
