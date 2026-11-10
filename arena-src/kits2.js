hero('pirate', { p: ['포술의 달인', '대포 비행으로 맞히면 스킬 쿨타임 3초 감소'],
  ult: ['대포 포탑', '10초 동안 내 위치에 대포 포탑을 소환 · 가장 가까운 상대에게 대포알을 발사 (대포알 데미지 20)', [0, 8 * T], f => (fx('tsummon', f.x, f.y + 16), minion)({ by: f, kind: 'turret', x: f.x, y: f.y, t: 10, cd: 0, upd: (m, dt) => { m.cd -= dt; if (m.cd > 0) return; const e = nearest(m, px(950), null, 0); if (!e) return; m.cd = .8; m.aim = angTo(m, e); fx('tfire', m.x + Math.cos(m.aim) * 30, m.y + BODY + Math.sin(m.aim) * 30, { ang: +m.aim.toFixed(2), gy: m.y + 20 }); bullets.push({ x: m.x, y: m.y + BODY, vx: Math.cos(m.aim) * 650, vy: Math.sin(m.aim) * 650, spd: 650, ang: m.aim, life: px(950), dmg: 20, team: m.team, owner: f, r: 7, shape: 'bomb', pierce: 0, splash: 0, phase: 0, o: { skill: 1 }, hit: new Set(), born: time, x0: m.x, y0: m.y }); } })],
  skills: [
    [1, '대포 비행', 'move', '대포를 타고 조준 방향으로 날아감 (물과 용암 위를 지나감) · 부딪힌 상대에게 36 피해', [100, 7 * T], (f, a, i) => lunge(f, a, 6 * T, .4, { fly: 1, dmg: 36, col: '#3a3f4a', onHit: () => { f.st.hitFly = 1; }, end: g => { if (g.st.hitFly) { g.st.hitFly = 0; g.scd[i] -= 3; } } })],
    [2, '술통 폭탄', 'hit', '술통을 던져 닿으면 폭발 (피해 40, 큰 넉백)', [100, 7 * T], f => { const p = aimPt(f, 7 * T); strike(f, p.x, p.y, 85, .5, () => boom(f, p.x, p.y, 85, 40, { kb: 700 }), '#8b5a2b'); }],
    [3, '럼주', 'buff', '1.5초 동안 받는 피해 15% 감소 + 체력 10 회복', [0, 4 * T], f => { buff(f, 'dr', 1.5, .85); heal(f, 10); }]
  ] });

hero('samurai', { p: ['명상', '가만히 2초만 서 있어도 치유가 시작됨 (다른 캐릭터는 3초)'], rest: 2,
  cdf(f) { return .65 * (B(f, 'dual') ? 1.3 : 1); }, dmgf(f) { return 36 * (B(f, 'dual') ? 1.5 : 1); },
  onHurt(f, d, by) { if (B(f, 'counter')) { unbuff(f, 'counter'); unbuff(f, 'root'); f.swing = .22; say(f, '반격'); if (by && !by.dead && dist(f, by) < 170) damage(by, 60, f); return 0; } },
  ult: ['심안 연참', '사정거리 안의 가까운 적 최대 5명을 차례로 순간이동하며 베어 25 피해씩 주고, 끝나면 원래 자리로 돌아옴 · 발동하는 동안 무적', [0, 6 * T], f => { const es = foes(f).filter(e => dist(f, e) < 6.5 * T).sort((a, b) => dist(f, a) - dist(f, b)).slice(0, 5); if (!es.length) return false; const x0 = f.x, y0 = f.y; f.inv = Math.max(f.inv, es.length * .15 + .2); buff(f, 'root', es.length * .15 + .1); fxAt(f, 'samult');
    es.forEach((e, i) => later(i * .15, () => { if (e.dead) return; blinkTo(f, e.x - 30, e.y); f.swing = .2; f.aim = 0; fx('samcut', e.x, e.y + BODY, { ang: +rnd(-.6, .6).toFixed(2), gy: e.y + 16 }); damage(e, 25, f); }, f)); later(es.length * .15 + .1, () => { blinkTo(f, x0, y0); fxAt(f, 'samfin'); }, f); }],
  skills: [
    [1, '거합', 'move', '조준 방향으로 순식간에 베고 지나가며 경로 위의 적에게 30 피해 · 2명 이상 베면 쿨타임 절반', [60, px(430)], (f, a, i) => { const r = blink(f, a, px(430)); f.swing = .22; fxLine('iai', r.x0, r.y0 + BODY, f.x, f.y + BODY, { wid: 'samurai', cos: f.cos, gy: f.y + 16 }); const n = pathHit(f, r.x0, r.y0, f.x, f.y, 34, 30).length; if (n >= 2) later(0, () => { f.scd[i] *= .5; }); }],
    [2, '반격 자세', 'buff', '1초 동안 자세를 잡고 맞으면 공격을 막은 뒤 즉시 반격 베기 (피해 60)', [0, 5 * T], f => { buff(f, 'counter', 1); buff(f, 'root', 1); }],
    [3, '발도 자세', 'hit', '1초 동안 자세를 잡고 멈춘 뒤, 전방을 크게 베어 40 피해', [0, 130], f => { buff(f, 'root', 1); later(1, () => { f.swing = .22; f.spin = .2; fxLine('iai', f.x, f.y + BODY, f.x + Math.cos(f.aim) * f.h.range * 1.6, f.y + BODY + Math.sin(f.aim) * f.h.range * 1.6, { wid: 'samurai', cos: f.cos }); arc(f, f.aim, f.h.range * 1.6, 1.2, 40); }, f); }],
    [4, '이도류', 'buff', '다음 1.5초 동안 반대쪽 손에도 칼을 들고 동시에 공격 · 일반 공격 쿨타임이 30% 늘어나지만 피해가 50% 증가', [0, 120], f => buff(f, 'dual', 1.5)]
  ] });

hero('harald', { p: ['강인한 맷집', '체력이 1000 (다른 캐릭터는 600)'], hp: 1000,
  ult: ['도끼 돌진', '도끼를 조준 방향으로 던져 박고, 방패를 들고 박힌 도끼 쪽으로 돌진 (돌진 중 받는 피해 50% 감소) · 돌진하다 부딪힌 상대는 아주 크게 밀려나고 1초 기절 + 35 피해', [60, 7 * T], (f, a) => { buff(f, 'dr', .8, .5); fxAt(f, 'dash', { dir: 1, rot: +a.toFixed(2), color: '#cfd8e3' }); lunge(f, a, 7 * T, .55, { dmg: 35, stun: 1, onHit: e => knock(e, f.x, f.y, 1100) }); }],
  skills: [
    [1, '분노', 'buff', '2초 동안 받는 피해 10% 감소', [0, 5 * T], f => buff(f, 'dr', 2, .9)],
    [2, '방패 강타', 'hit', '방패로 앞의 상대를 밀며 0.5초 기절 (10 피해) · 맞히면 대쉬 쿨타임이 바로 참', [0, 100], (f, a) => { f.swing = .22; if (arc(f, a, 100, .9, 10, { kb: 520, stun: .5 }).length) f.dcd = 0; }],
    [4, '방패 올리기', 'buff', '2초 동안 정면에서 날아오는 투사체를 막음', [150, 9 * T], f => buff(f, 'block', 2)],
    [5, '내려찍기', 'hit', '높이 뛰어올랐다가 내려찍어 주변 적에게 20 피해 + 0.5초 기절', [0, 3 * T], (f, a) => lunge(f, a, 2 * T, .35, { fly: 1, end: g => boom(g, g.x, g.y, 100, 20, { stun: .5, kb: 0, col: '#cfd3dc' }) })]
  ] });

hero('horemheb', { p: ['사막의 장군', '모래바람에 맞은 상대를 3초 안에 공격하면 피해 1.5배'],
  onDeal(f, e, d, o) { if (B(e, 'sandmark') && o.basic && !o.extra) damage(e, d * .5, f, { extra: 1, raw: 1 }); },
  ult: ['모래바람', '앞쪽 멀리까지 거센 모래바람을 일으켜 범위 안의 상대에게 36 피해를 주고 아주 강하게 밀치며 1.5초 동안 기절시키고, 3.5초 동안 이동속도를 크게(70%) 줄임', [0, 8 * T], (f, a) => { const p = fwd(f, 9 * T, a); fx('sandstorm', f.x, f.y + BODY, { dir: 1, len: Math.round(9 * T), h: 150, rot: +a.toFixed(2), gy: f.y + 16 });
    pathHit(f, f.x, f.y, p.x, p.y, 60, 36, { stun: 1.5, fn: e => { if (!los(f.x, f.y, e.x, e.y)) return; knock(e, f.x, f.y, 1000); buff(e, 'slow', 3.5, .3); buff(e, 'sandmark', 3); } }); }],
  skills: [
    [1, '쇠스랑 투척', 'hit', '쇠스랑을 빙글빙글 돌려 던져 맞은 상대에게 32 피해', [100, 8 * T], (f, a) => emit(f, a, { skill: 1, dmg: 32, spd: 720, range: 8 * T, r: 9, shape: 'star' })],
    [2, '모래 은신', 'move', '1.5초 동안 모래로 변해 투사체를 통과시키고 이동 속도 30% 증가', [100, 9 * T], f => { buff(f, 'sand', 1.5); buff(f, 'haste', 1.5, 1.3); }],
    [3, '모래 소용돌이', 'hit', '제자리에서 1.5초 동안 모래 소용돌이를 일으킴 · 닿는 적은 계속 밀려남', [0, 120], f => zone({ by: f, x: f.x, y: f.y, r: 120, t: 1.5, col: '#d8b46a', fn: z => { z.x = f.x; z.y = f.y; for (const e of foes(f)) if (inZone(z, e)) knock(e, z.x, z.y, 90); } })],
    [5, '스카라베 떼', 'hit', '스카라베 5마리를 부채꼴로 날림 · 한 마리당 6 피해', [0, 6 * T], (f, a) => emit(f, a, { skill: 1, count: 5, fan: .7, dmg: 6, spd: 620, range: 6 * T, shape: 'pellet', homing: true, turn: 2 })]
  ] });

const PZ_D = [20, 29, 38, 47], PZ_C = [.6, .5, .4, .3], PZ_DC = [3, 1.5, .7, .4];
hero('pizarro', { p: ['정복자', '궁극기를 쓸수록 강해짐(죽으면 초기화) · 4단계가 되면 치유 효과 2배, 이동속도 1.25배'],
  dmgf: f => PZ_D[f.st.pz || 0], cdf: f => PZ_C[f.st.pz || 0], dashCd: f => PZ_DC[f.st.pz || 0], cdMul: f => 1 - .12 * (f.st.pz || 0), spd: f => (f.st.pz || 0) >= 3 ? 1.25 : 1, healMul: f => (f.st.pz || 0) >= 3 ? 2 : 1,
  mo(f) { return { fn: e => { if (B(e, 'cross')) damage(e, 5, f, { raw: 1, extra: 1 }); } }; },
  ult: ['정복자의 기세', '체력 30 회복(최종 단계에서 쓰면 50) + 공격력 20→29→38→47, 공격 쿨타임 0.6→0.5→0.4→0.3초, 대쉬 쿨타임 3→1.5→0.7→0.4초로 단계가 오르고 스킬·궁극기 쿨타임도 단계마다 12% 단축됨 (최대 3번 중첩 = 4단계, 4단계엔 이동속도 125%, 죽으면 초기화)', [0, 9 * T], f => { const s = f.st.pz || 0; if (s >= 3) heal(f, 25); else { f.st.pz = s + 1; heal(f, 30); } }],
  skills: [
    [1, '정복자의 질주', 'buff', '체력 20 즉시 회복 + 3.5초 동안 이동 속도 50% 증가', [0, 8 * T], f => { heal(f, 20); buff(f, 'haste', 3.5, 1.5); }],
    [2, '투창', 'move', '창을 던짐 · 벽에 닿거나 상대에 맞으면 그 자리로 이동하고 체력 15 회복', [100, 7 * T], (f, a) => emit(f, a, { skill: 1, dmg: PZ_D[f.st.pz || 0], range: 7 * T, spd: 800, shape: 'arrow', r: 7, onEnd: b => { blinkTo(f, b.x - Math.cos(b.ang) * 34, b.y - BODY - Math.sin(b.ang) * 34); heal(f, 15); } })],
    [3, '머스켓', 'hit', '머스켓을 쏨 · 총알은 작지만 끝까지 날아가고 피해는 피사로 일반공격 피해와 같음', [100, 11 * T], (f, a) => emit(f, a, { skill: 1, dmg: PZ_D[f.st.pz || 0], range: 25 * T, spd: 900, r: 3, shape: 'bullet' })],
    [4, '정복', 'buff', '범위 안 아군 이동속도 20% 증가, 적군 20% 감소 (1초)', [0, 4 * T], f => { ring(f.x, f.y, 220, '#ffd34d'); for (const a of allies(f)) if (dist(a, f) < 220) buff(a, 'haste', 1, 1.2); circ(f, f.x, f.y, 220, 0, { slow: [.8, 1] }); }],
    [5, '하늘의 십자가', 'hit', '조준한 곳에 하늘에서 십자가가 떨어져 범위 피해(25) + 기절 1초 · 맞은 상대는 3초간 표식(다음 창 공격 +5) · 맞히면 체력 15 회복', [100, 7 * T], f => { const p = aimPt(f, 7 * T); fx('crossfall', p.x, p.y, { dur: .6, hw: 80 }); strike(f, p.x, p.y, 80, .6, () => { fx('crosshit', p.x, p.y, { hw: 80 }); if (circ(f, p.x, p.y, 80, 25, { stun: 1, kb: 0, col: '#ffd34d', fn: e => buff(e, 'cross', 3) }).length) heal(f, 15); }, '#ffd34d'); }]
  ] });

const musket = (f, a, d, o) => emit(f, a, Object.assign({ skill: 1, dmg: d, spd: 900, range: 10 * T, r: 4, shape: 'bullet' }, o));
hero('edward', { p: ['총검술', '가까운 상대는 총검으로 찌르고, 거리가 벌어지면 같은 공격이 머스킷 단발 사격(데미지 24)으로 바뀜'],
  cdf: f => .65 * (B(f, 'parade') ? .5 : 1), spd: f => (B(f, 'march') ? .6 : 1) * (B(f, 'parade') ? .7 : 1), rangef: f => 9 * T,
  atk(f, a) { if (B(f, 'parade') || !nearest(f, f.h.range + 24, a, 1.2)) { musket(f, a, 24); return 1; } },
  mo: f => B(f, 'march') ? { kb: 240 * 1.3 * 2 } : null,
  ult: ['왕실 사열', '8초 동안 이동속도 30% 감소, 받는 피해 50% 감소 · 일반 공격은 근접이어도 머스킷 연사(쿨타임 절반)로 바뀜', [0, 9 * T], f => { buff(f, 'parade', 8); buff(f, 'dr', 8, .5); }],
  skills: [
    [1, '근위 교대', 'move', '가장 가까운 아군과 위치를 맞바꾸고 둘 다 1.5초 동안 받는 피해 40% 감소 (아군이 없으면 쓰이지 않음)', [0, 6 * T], f => { const a = allies(f).filter(o => o !== f && dist(o, f) < px(700)).sort((p, q) => dist(f, p) - dist(f, q))[0]; if (!a) return false; const x = f.x, y = f.y; blinkTo(f, a.x, a.y); blinkTo(a, x, y); buff(f, 'dr', 1.5, .6); buff(a, 'dr', 1.5, .6); }, { ok: f => f.hp < f.mhp * .5 }],
    [2, '열병 행진', 'buff', '5초 동안 이동속도 40% 감소, 받는 피해 40% 감소, 일반 공격(찌르기)의 넉백 2배', [0, 4 * T], f => { buff(f, 'march', 5); buff(f, 'dr', 5, .6); }],
    [3, '정렬 사격', 'hit', '조준 방향으로 머스킷을 한 발 쏨 (피해 26) · 맞은 상대는 0.8초 동안 움직이지 못함', [100, 9 * T], (f, a) => musket(f, a, 26, { root: .8 })],
    [4, '경례', 'buff', '1초 동안 모든 피해를 받지 않지만 움직이지 못함', [0, 6 * T], f => { buff(f, 'inv', 1); buff(f, 'root', 1); }, { ok: f => f.hp < f.mhp * .5 }]
  ] });

function mediumBack(f) { const m = f.st.body; if (!m) return; f.st.body = null; m.dead = true; f.ghost = false; f.form = null; blinkTo(f, m.x, m.y); }
hero('medium', { p: ['영매', '궁극기는 쿨타임이 없음 · 영혼 상태에서는 영혼 덩어리(최대 한 번 관통, 데미지 20, 쿨타임 0.8초)를 쏨'],
  cdf: f => f.st.body ? .8 : .75, rangef: f => f.st.body ? 7 * T : HEROES.medium.range,
  atk(f, a) { if (f.st.body) { emit(f, a, { skill: 0, dmg: 20, pierce: 1, spd: 640, range: 7 * T, r: 8, shape: 'cleonorb' }); return 1; } },
  tick(f) { if (f.st.body && !f.human && time - f.st.spT > 7) mediumBack(f); },
  onDeath(f) { if (f.st.body) { f.x = f.st.body.x; f.y = f.st.body.y; f.st.body.dead = true; f.st.body = null; } },
  ult: ['영매', '처음 쓰면 내 영혼이 나와 유령으로 조종해 공격함 (영혼의 공격은 관통하고 영혼은 맞지 않음), 그동안 본체는 가만히 서 있고 피해를 50% 더 받음 · 영혼이 나와 있을 때 쓰면 본체 돌아오기: 영혼이 사라지고 본체로 돌아옴', [0, 7 * T], f => {
    if (f.st.body) { mediumBack(f); return 'hold'; }
    f.st.spT = time; f.ghost = true; f.form = 'spirit';
    f.st.body = minion({ by: f, kind: 'body', x: f.x, y: f.y, t: 1e9, hit: true, bound: true, onDmg: (m, d, by, o) => { const r = damage(f, d * 1.5 * (B(m, 'dr') ? .5 : 1), by, Object.assign({}, o, { raw: 1 })); return r; } }); return 'hold'; }, f => !f.st.body],
  skills: [
    [1, '본체 소환', 'move', '영혼 상태일 때 내 본체를 영혼의 위치로 불러옴 (영혼 상태가 끝남 · 영혼이 나와 있지 않으면 쓰이지 않음)', [0, 9 * T], f => { const m = f.st.body; if (!m) return false; m.x = f.x; m.y = f.y; mediumBack(f); }, { ok: f => !!f.st.body && f.hp < f.mhp * .5 }],
    [2, '보호 본능', 'buff', '영혼 상태일 때 1초 동안 내 본체가 받는 피해 50% 감소 (영혼이 나와 있지 않으면 쓰이지 않음)', [0, 9 * T], f => { if (!f.st.body) return false; f.st.protect = time + 1; }, { ok: f => !!f.st.body }],
    [3, '자폭', 'hit', '영혼 상태일 때 본체를 폭발시킴 · 본체 체력이 1만 남지만 주변 적에게 60 피해와 매우 큰 넉백 · 1초 동안 무적 (영혼이 나와 있지 않으면 쓰이지 않음)', [0, 9 * T], f => { const m = f.st.body; if (!m) return false; boom(f, m.x, m.y, 130, 60, { kb: 1000 }); f.hp = 1; f.inv = Math.max(f.inv, 1); }, { ok: f => !!f.st.body && foes(f).some(e => dist(e, f.st.body) < 130) }]
  ] });
HEROES.medium.onHurt = (f, d) => (f.st.protect > time ? d * .5 : d);

hero('plague', { p: ['역병', '공격에 맞은 상대는 5초 동안 감염 · 감염된 상대의 팀원과 닿으면 팀원도 감염 · 감염되면 0.5초마다 1 피해, 이동속도 10% 감소'],
  mo: f => ({ infect: 1 }),
  ult: ['까마귀 떼', '까마귀 3마리를 불러 4초 동안 빠르게 불규칙적으로 날아다니게 함 (벽과 캐릭터를 통과) · 까마귀에 닿은 상대는 5초 동안 감염', [0, 8 * T], f => { for (let i = 0; i < 3; i++) minion({ by: f, kind: 'crow', x: f.x, y: f.y + BODY, t: 4, a: rnd(0, 6.28), upd: (m, dt) => { const e = nearest(m, 6 * T, null, 0, false); let da = (e ? angTo(m, e) : m.a) - m.a + rnd(-1.2, 1.2); m.a += clamp(Math.atan2(Math.sin(da), Math.cos(da)), -3.4 * dt, 3.4 * dt) + rnd(-2, 2) * dt; m.x = clamp(m.x + Math.cos(m.a) * px(640) * dt, T, WW - T); m.y = clamp(m.y + Math.sin(m.a) * px(640) * dt, T, WH - T); for (const o of foes(m)) if (!o.minion && dist(o, m) < 34) buff(o, 'infect', 5, f); } }); }],
  skills: [
    [1, '의료 사고', 'hit', '지금 감염된 상대 모두에게 즉시 15 피해 (감염된 상대가 없으면 쓰이지 않음)', [0, 12 * T], f => { const es = foes(f).filter(e => !e.minion && B(e, 'infect')); if (!es.length) return false; for (const e of es) { damage(e, 15, f); ring(e.x, e.y + BODY, 30, '#8dff7c'); } }, { ok: f => foes(f).some(e => !e.minion && B(e, 'infect')) }],
    [2, '자기 치유', 'buff', '지금 감염된 상대들의 체력을 5씩 빼앗고, 빼앗은 양의 2배만큼 체력을 회복 · 감염된 상대가 없으면 쓰이지 않음', [0, 12 * T], f => { const es = foes(f).filter(e => !e.minion && B(e, 'infect')); if (!es.length) return false; let n = 0; for (const e of es) n += damage(e, 5, f, { raw: 1 }); heal(f, n * 2); }, { ok: f => f.hp < f.mhp * .8 && foes(f).some(e => !e.minion && B(e, 'infect')) }],
    [3, '독 안개', 'hit', '조준한 바닥에 2.5초 동안 독 안개를 깔음 · 안개에 닿은 상대는 감염', [100, 6 * T], f => { const p = aimPt(f, 6 * T); zone({ by: f, x: p.x, y: p.y, r: 90, t: 2.5, col: '#8dff7c', fn: z => { for (const e of foes(f)) if (!e.minion && inZone(z, e)) buff(e, 'infect', 5, f); } }); }],
    [4, '썩은 약병', 'hit', '약병을 던져 터지면 주변 상대 이동속도 25% 감소(2초) · 이미 감염된 상대는 추가 5 피해', [100, 6 * T], f => { const p = aimPt(f, 6 * T); strike(f, p.x, p.y, 90, .45, () => { ring(p.x, p.y, 90, '#8dff7c'); circ(f, p.x, p.y, 90, 0, { slow: [.75, 2], fn: e => { if (!e.minion && B(e, 'infect')) damage(e, 5, f); } }); }, '#8dff7c'); }],
    [5, '페스트 가면', 'buff', '2초 동안 받는 피해 20% 감소', [0, 5 * T], f => buff(f, 'dr', 2, .8)]
  ] });

hero('dragonslayer', { p: ['강인한 정신력', '화염, 독, 전기 피해를 30% 덜 받음'], resist: 1,
  mo: f => B(f, 'flame') ? { fn: e => damage(e, 5, f, { el: 1, raw: 1, extra: 1 }) } : null,
  onHurt(f, d, by, o) { if (B(f, 'swordblock') && by && !o.quiet) { let da = angTo(f, by) - f.aim; da = Math.atan2(Math.sin(da), Math.cos(da)); if (Math.abs(da) < 1.3) { ring(f.x, f.y + BODY, 34, '#ffd34d', .2); return 0; } } },
  ult: ['드래곤 소환', '드래곤을 10초 동안 소환 · 드래곤이 맵 위를 날아다니며 1초마다 가장 가까운 적에게 화염구를 쏨 (벽 관통, 화염구마다 14 피해, 범위 폭발) · 드래곤이 있는 동안 1스킬이 \'지원 발사\'로 바뀜: 조준한 곳에 화염구를 연속 4번 발사 (쿨타임 1.5초)', [0, 12 * T], f => { f.st.dragon = minion({ by: f, kind: 'dragon', x: f.x, y: f.y - 120, t: 10, cd: 1, bound: true, a: 0, upd: (m, dt) => { m.a += dt; m.x = clamp(WW / 2 + Math.cos(m.a * .7) * WW * .36, T, WW - T); m.y = clamp(WH / 2 + Math.sin(m.a * 1.1) * WH * .3, T, WH - T); m.cd -= dt; if (m.cd <= 0) { m.cd = 1; const e = nearest(m, 20 * T, null, 0, false); if (e) { const x = e.x, y = e.y; m.breath = time; fx('dsbreath', m.x, m.y, { ang: +angTo(m, e).toFixed(2) }); strike(f, x, y, px(70) + 14, .45, () => boom(f, x, y, px(70) + 14, 14, { el: 1, kb: 0 }), '#ff7a1a'); } } }, end: () => { f.st.dragon = null; } }); }],
  skills: [
    [1, f => f.st.dragon ? '지원 발사' : '화염검', 'buff', '2초 동안 검에 불꽃이 일고, 이 동안 공격이 맞은 상대에게 불 피해 5를 추가로 줌', [0, 160], (f, a, i) => { if (f.st.dragon) { const p = aimPt(f, 9 * T); seq(f, 4, .25, () => { const x = p.x + rnd(-30, 30), y = p.y + rnd(-30, 30); strike(f, x, y, 56, .35, () => boom(f, x, y, 56, 14, { el: 1, kb: 0 }), '#ff7a1a'); }); later(0, () => { f.scd[i] = 1.5; }); return; } buff(f, 'flame', 2); }],
    [2, '검 막기', 'buff', '1초 동안 공격을 못 하는 대신 검을 세워 바라보는 쪽의 공격을 모두 막음', [0, 6 * T], f => { buff(f, 'swordblock', 1); buff(f, 'block', 1); buff(f, 'mute', 1); }],
    [3, '박치기', 'hit', '앞의 가까운 적을 머리로 박음 (피해 18, 0.8초 기절, 적이 없으면 사용 안 됨)', [0, 80], (f, a) => { const e = nearest(f, 80, a, 1.2); if (!e) return false; lunge(f, angTo(f, e), 20, .08, {}); damage(e, 18, f); buff(e, 'stun', .8); }],
    [4, '화염 발사', 'hit', '칼을 상대 쪽으로 곧게 겨눈 뒤 (0.35초) 그 방향으로 화염을 연속 발사 (5발, 발당 피해 8)', [100, 7 * T], (f, a) => { buff(f, 'root', .35); later(.35, () => seq(f, 5, .1, () => emit(f, a, { skill: 1, dmg: 8, el: 1, spd: 620, range: 7 * T, r: 7, shape: 'fireball' })), f); }],
    [5, '용의 기운', 'buff', '2초 동안 이동속도 10%, 공격 데미지 10% 증가, 받는 데미지 10% 감소', [0, 5 * T], f => { buff(f, 'haste', 2, 1.1); buff(f, 'dmg', 2, 1.1); buff(f, 'dr', 2, .9); }]
  ] });

hero('shade', { p: ['네온 강타', '공격은 범위 안의 적 모두에게 피해 · 기본 공격을 2번 연속으로 하면 다음 공격은 강타: 추가 피해 +5, 상대 0.4초 기절'],
  cdf: f => .95 * (B(f, 'rage') ? .67 : 1),
  mo(f) { f.st.n = (f.st.n || 0) + 1; return f.st.n % 3 === 0 ? { stun: .4, fn: e => damage(e, 5, f, { raw: 1, extra: 1 }) } : null; },
  ult: ['네온 점멸', '조준 방향으로 길게 점멸하며, 점멸 경로에 있던 모든 상대를 내 앞으로 끌어오고 1.2초 동안 기절시킴', [100, px(620)], (f, a) => { const r = blink(f, a, px(620)); fxLine('shblink', r.x0, r.y0 + BODY, f.x, f.y + BODY, { wid: 'shade', cos: f.cos, gy: f.y + 16 }); const p = fwd(f, 50, a); pathHit(f, r.x0, r.y0, f.x, f.y, 44, 0, { stun: 1.2, fn: e => { if (!e.minion) blinkTo(e, p.x + rnd(-14, 14), p.y + rnd(-14, 14)); } }); }],
  skills: [
    [1, '대검 돌진', 'hit', '네온 대검을 조준 방향으로 던짐 (중장거리) · 맞히면 상대에게 꽂히고 사슬로 빠르게 돌진해 대검을 다시 잡음 · 상대 15 피해 + 0.5초 기절', [100, 7 * T], (f, a) => emit(f, a, { skill: 1, dmg: 15, stun: .5, spd: 1040, range: 7 * T, r: 10, shape: 'arrow', onHit: e => { fx('shchain', f.x, f.y + BODY, { x2: Math.round(e.x), y2: Math.round(e.y + BODY), hit: true }); lunge(f, angTo(f, e), Math.max(10, dist(f, e) - 40), .18, { fly: 1 }); } })],
    [3, '분노', 'buff', '3초 동안 일반 공격 쿨타임 33% 감소', [0, 150], f => buff(f, 'rage', 3)],
    [4, '찌르기', 'hit', '앞의 가까운 상대를 찔러 25 피해 + 0.9초 기절 (맞힐 상대가 없으면 쓰이지 않음)', [0, 130], (f, a) => { const e = nearest(f, 140, a, .8); if (!e) return false; f.swing = .22; damage(e, 25, f); buff(e, 'stun', .9); }]
  ] });

hero('kadas', { p: ['암흑 질주', '공격할 때마다 0.5초 동안 이동속도가 5% 증가함'],
  pre(f, o) { buff(f, 'haste', .5, Math.max(1.05, V(f, 'haste', 1))); return o; },
  ult: ['암흑 덩어리', '조준한 위치에 보라색으로 꿈틀거리는 암흑 덩어리를 만듦 · 안에 있는 적은 이동속도 25% 감소, 1초마다 8 피해 · 피해를 줄 때마다 덩어리가 커지고, 아무에게도 못 주면 천천히 작아져 사라짐', [0, 7 * T], f => { const p = aimPt(f, 7 * T); if (f.st.blob) f.st.blob.dead = true; f.st.blob = zone({ by: f, x: p.x, y: p.y, r: 80, t: 60, col: '#9a4cff', op: .5, fn: (z, dt) => { for (const e of foes(f)) if (inZone(z, e)) buff(e, 'slow', .2, .75); z.acc += dt; if (z.acc >= 1) { z.acc -= 1; if (circ(f, z.x, z.y, z.r, 8).length) z.r = Math.min(200, z.r + 12); else z.r -= 12; } if (z.r < 40) z.dead = true; }, end: z => { if (f.st.blob === z) f.st.blob = null; } }); }],
  skills: [
    [1, '연발', 'hit', '암흑총을 3발 연달아 발사 (한 발마다 데미지 23)', [0, 5 * T], f => seq(f, 3, .12, () => emit(f, f.aim, { skill: 1, dmg: 23 }))],
    [3, '블랙홀 친화', 'hit', '내 암흑 덩어리의 크기가 10% 커지고, 그 안에 있는 상대에게 10 피해 (내 암흑 덩어리가 없으면 쓰이지 않음)', [0, 12 * T], f => { const z = f.st.blob; if (!z) return false; z.r = Math.min(220, z.r * 1.1); circ(f, z.x, z.y, z.r, 10); ring(z.x, z.y, z.r, '#9a4cff'); }, { ok: f => !!f.st.blob }]
  ] });

const poison = (e, f) => { if (e.minion) return; e.st.pn = Math.min(4, (e.st.pn || 0) + 1); e.st.pt = time + 3; e.st.pby = f; };
hero('kan', { p: ['맹독', '독침에 맞으면 독이 쌓임 (최대 4중첩, 중첩마다 초당 2 피해, 3초 지속) · 독이 4번 쌓인 상대는 이동속도 20% 감소'],
  cdf: f => .5 * (B(f, 'wings') ? .6 : 1),
  pre(f, o) { o.onHit = e => poison(e, f); if (B(f, 'wings')) { o.count = 3; o.fan = .22; } return o; },
  ult: ['케찰코아틀의 날개', '5초 동안 날개를 펴고 날아올라 (물과 용암 위를 지나감) 독침을 한 번에 3발씩, 더 빠르게 발사', [0, 9 * T], f => { buff(f, 'wings', 5); buff(f, 'fly', 5); }],
  skills: [
    [1, '독두꺼비 함정', 'hit', '조준한 곳으로 독 두꺼비를 던짐 · 바닥에 닿으면 그 바닥이 독 바닥이 됨 (15초, 최대 2개, 적에게는 안 보임) · 적이 밟으면 3초 동안 0.5초마다 5 피해', [100, 7 * T], f => { const p = aimPt(f, px(800)); strike(f, p.x, p.y, 30, .45, () => trap(f, p.x, p.y, 15, 2, 'toad', e => e.dots.push({ t: 3, dps: 10, by: f, tick: .5 }), '#8dff7c', true), '#8dff7c'); }],
    [2, '심장 공양', 'hit', '입으로 부는 관으로 근접 찌르기 (10 피해) · 넉백 + 체력 25 회복 (맞혔을 때만)', [0, 90], (f, a) => { f.swing = .22; if (arc(f, a, 90, .6, 10, { kb: 420 }).length) heal(f, 25); }],
    [3, '독침 3점사', 'hit', '조준 방향으로 독침 3발을 연속 발사', [100, 9 * T], f => seq(f, 3, .1, () => emit(f, f.aim, { count: 1 }))],
    [5, '깃털 뱀 도약', 'move', '앞으로 도약하고 착지한 곳에 2초 동안 독 웅덩이를 만듦 (닿으면 독)', [0, 5 * T], (f, a) => lunge(f, a, 3 * T, .3, { fly: 1, end: g => zone({ by: g, x: g.x, y: g.y, r: 80, t: 2, col: '#8dff7c', fn: (z, dt) => { z.acc += dt; if (z.acc >= .5) { z.acc -= .5; for (const e of foes(g)) if (inZone(z, e)) poison(e, g); } } }) })]
  ] });
function poisonTick(f, dt) { if (f.st.pn) { if (time > f.st.pt) { f.st.pn = 0; return; } if (f.st.pn >= 4) buff(f, 'slow', .2, .8); f.st.pa = (f.st.pa || 0) + dt; if (f.st.pa >= .5) { f.st.pa -= .5; damage(f, f.st.pn, f.st.pby, { quiet: 1, el: 1, raw: 1 }); } } }

function charm(f, e, sec, bonus) {
  buff(e, 'charm', sec, f); buff(f, 'root', sec); buff(f, 'dr', sec, .5); f.st.ctrl = e;
  e.b.charm.end = v => { f.st.ctrl = null; unbuff(f, 'root'); unbuff(f, 'dr'); ring(v.x, v.y, px(220), '#ff7bd9'); damage(v, 60 + bonus, f); for (const o of fighters) if (o !== v && !o.dead && o.team === v.team && dist(o, v) < px(220)) damage(o, 30, f); };
}
hero('puppeteer', { p: ['실타래', '실이 이어진 상대를 조종하면 자폭 피해 +10'],
  tick(f) { const e = f.st.thread; if (e && (e.dead || time > f.st.threadT)) { f.st.thread = null; if (f.st.tslot != null) f.scd[f.st.tslot] = skillCd(f, f.st.tslot); } else if (e) buff(e, 'slow', .2, .75); },
  ult: ['꼭두각시 조종', '조준한 방향으로 실을 날려 맞힌 상대를 5초간 조종 (맞히지 못하면 조종 못 함) · 조종하는 동안 상대는 내 편이 되어 자기 팀을 공격하고 (내가 직접 고른 캐릭터면 내 이동·조준·공격 입력대로 움직임) 스킬과 궁극기를 쓸 수 없음 · 조종하는 동안 내 몸은 움직이지 못하고 받는 데미지 50% 감소 · 조종이 끝나면 조종당한 상대가 자폭해 본인은 60, 주변 그의 팀원에게는 30 피해', [100, 8 * T], (f, a) => emit(f, a, { skill: 1, dmg: 0, spd: 1040, range: 8 * T, r: 9, shape: 'needle', onHit: e => { if (!e.minion) charm(f, e, 5, f.st.thread === e ? 10 : 0); } })],
  skills: [
    [1, f => f.st.thread ? '바늘 빼기' : '바느질', 'hit', '실이 달린 바늘을 조준한 방향으로 발사 · 맞은 상대와 실이 이어지고 이동속도 25% 감소 · 맞히면 쿨타임 없이 바로 바늘 빼기를 쓸 수 있음 · 바늘 빼기: 실을 당겨 상대에게 30 피해를 주고 실이 끊김, 쿨타임은 바늘 빼기를 쓴 뒤부터 (못 맞히면 바로 쿨타임)', [100, 8 * T], (f, a, i) => {
      if (f.st.thread) { const e = f.st.thread; f.st.thread = null; if (!e.dead) damage(e, 30, f); return; }
      emit(f, a, { skill: 1, dmg: 0, spd: 1040, range: 8 * T, r: 8, shape: 'needle', onHit: e => { if (e.minion) return; f.st.thread = e; f.st.threadT = time + 8; f.st.tslot = i; f.scd[i] = 0; } }); }],
    [2, '꼭두각시', 'hit', '가장 가까운 상대에게 실을 연결해 3초 동안 내 이동 입력대로 움직이게 함 (움직임만)', [0, px(650)], f => { const e = nearest(f, px(650), null, 0, false); if (!e || e.minion) return false; buff(e, 'puppet', 3, f); }],
    [4, '손 꿰기', 'hit', '바늘을 발사 · 맞으면 1.5초 동안 그 상대의 두 손이 실에 묶여 공격 불가', [100, 8 * T], (f, a) => emit(f, a, { skill: 1, dmg: 9, mute: 1.5, spd: 1040, range: 8 * T, shape: 'needle' })],
    [5, '줄 인형', 'hit', '인형이 3초 동안 가까운 적에게 돌진해 폭발 (12 피해 + 밀침)', [0, 7 * T], f => minion({ by: f, kind: 'doll', x: f.x, y: f.y, t: 3, upd: (m, dt) => { const e = nearest(m, 9 * T, null, 0, false); if (!e) return; const a = angTo(m, e); moveFighter(m, Math.cos(a) * 300 * dt, Math.sin(a) * 300 * dt); if (dist(m, e) < 36) m.t = 0; }, end: m => boom(f, m.x, m.y, 70, 12, { kb: 460 }) })]
  ] });

hero('tell', { p: ['당겨진 시위', '꾹 눌러 게이지를 채우고(1.6초) 놓으면 발사 · 게이지가 찰수록 피해 1~64, 더 빠르고 멀리 날아감 · 게이지가 차는 동안 이동속도 25% 감소'], tapHold: .7,
  spd: f => f.st.g > 0 ? .75 : 1,
  aiHold(f, a) { return (f.st.g || 0) < a.thr || f.st.second; },
  fireHeld(f, dt) { if (f.fireCd > 0) return; if (f.st.second) { f.st.second = 0; f.fireCd = .4; f.lastFire = time; emit(f, f.aim, { dmg: 35, pierce: 9, spd: f.h.bspd * 1.2, range: 11 * T }); return; }
    const rate = (B(f, 'rush') ? 2.5 : 1) * (B(f, 'apple') ? 1.75 : 1) / (f.st.triple ? 1.5 : 1); f.st.g = B(f, 'full') ? 1 : Math.min(1, (f.st.g || 0) + dt / 1.6 * rate); },
  fireUp(f) { const g = f.st.g || 0; if (g <= 0 || f.fireCd > 0) return; f.st.g = 0; f.fireCd = .4; f.lastFire = time; f.ai.thr = rnd(.5, 1);
    const o = { dmg: 1 + 63 * g, spd: f.h.bspd * (.55 + .45 * g), range: f.h.range * (.4 + .6 * g), onHit: e => { if (f.st.mark === e) { buff(f, 'apple', 5); fx('applebreak', e.x, e.y - 74, { gy: e.y + 16 }); } } };
    if (f.st.pierce) { f.st.pierce = 0; o.pierce = 9; o.fall = .8; } if (f.st.triple) { f.st.triple = 0; o.count = 3; o.fan = .24; o.dmg *= 1.08; } emit(f, f.aim, o); },
  tick(f) { if (f.st.mark && f.st.mark.dead) f.st.mark = null; if (f.st.second && time > f.st.second) f.st.second = 0; },
  ult: ['떨어지는 사과', '게이지가 바로 가득 차고 1.5초 동안 계속 가득 찬 상태로 유지됨', [100, 10 * T], f => { f.st.g = 1; buff(f, 'full', 1.5); }],
  skills: [
    [1, '두 번째 화살', 'hit', '다음 한 발은 게이지 없이 바로 발사 · 피해 35, 적을 관통하며 일직선으로 날아감 (8초 안에 쓰지 않으면 사라짐)', [100, 10 * T], f => { f.st.second = time + 8; f.fireCd = 0; }],
    [2, '강행돌파', 'move', '대쉬의 2배 거리로 도약 · 다음 2초 동안 일반 공격 게이지가 2.5배 빨리 참', [0, 4 * T], (f, a) => { const m = (f.mv[0] || f.mv[1]) ? Math.atan2(f.mv[1], f.mv[0]) : a + Math.PI; lunge(f, m, DASH_D * 2, .25, { fly: 1 }); buff(f, 'rush', 2); }],
    [3, '관통 화살', 'buff', '다음 공격의 화살이 관통 · 한 번 관통할 때마다 피해가 20%씩 줄어듦', [100, 10 * T], f => { f.st.pierce = 1; }],
    [4, '사과 명중', 'hit', '랜덤한 적 머리 위에 사과 표식 (그 적이 죽을 때까지 유지) · 화살로 표식이 있는 적을 맞히면 5초 동안 게이지가 1.75배 빨리 참', [0, 12 * T], f => { const es = foes(f).filter(e => !e.minion); if (!es.length) return false; f.st.mark = pick(es); }],
    [5, '3중 석궁', 'buff', '다음 공격은 게이지가 가득 차는 데 1.5배 걸리는 대신 화살 3발이 한 번에 나가고 피해 8% 증가', [100, 10 * T], f => { f.st.triple = 1; }]
  ] });

const myPools = f => zones.filter(z => z.kind === 'dark' && z.by === f);
function darkPool(f, x, y, r) { const ps = myPools(f); if (ps.length >= 10) ps[0].dead = true;
  return zone({ by: f, x: clamp(x, T, WW - T), y: clamp(y, T, WH - T), r, t: 1e9, col: '#3a1668', op: .6, kind: 'dark', fn: (z, dt) => { z.acc += dt; const tk = z.acc >= .5; if (tk) z.acc -= .5; if (!f.dead && inZone(z, f)) { buff(f, 'haste', .15, Math.max(1.3, V(f, 'haste', 1))); if (tk && f.st.dk !== time) { f.st.dk = time; heal(f, 1.5); } } for (const e of foes(f)) if (!e.minion && inZone(z, e)) buff(e, 'slow', .15, .7); } }); }
function connected(f, z0) { const out = new Set([z0]), q = [z0], all = myPools(f); while (q.length) { const a = q.pop(); for (const b of all) if (!out.has(b) && Math.hypot(a.x - b.x, a.y - b.y) < a.r + b.r) { out.add(b); q.push(b); } } return [...out]; }
hero('kurus', { p: ['어둠의 주인', '물약이 떨어진 자리에 어둠이 생김 (어둠 탈출 전까지 사라지지 않음, 최대 10개) · 내 어둠 위에서는 초당 체력 3 회복, 이동속도 30% 증가 · 상대는 내 어둠 위에서 이동속도 30% 감소 · 어둠 탈출 후 3초 동안 이동속도 1.5배'],
  splash: 40, pre(f, o) { o.onEnd = b => { fx('darksplash', b.x, b.y, { gy: b.y - BODY + 16 }); darkPool(f, b.x, b.y - BODY, 62); }; return o; },
  spd: f => f.form === 'sub' ? 1.7 : 1,
  moveOk(f, x, y) { return f.form !== 'sub' || myPools(f).some(z => Math.hypot(z.x - x, z.y - y) < z.r); },
  tick(f) { if (f.st.arm && time < f.st.arm && f.form !== 'sub') { if (myPools(f).some(z => inZone(z, f))) { f.st.arm = 0; fxAt(f, 'darksink'); f.form = 'sub'; f.ghost = true; f.st.subT = time; } } if (f.form === 'sub' && !f.human && time - f.st.subT > 2.5) useUlt(f); },
  ult: ['어둠 이동', '내 어둠 위에서 쓰거나, 쓰고 1초 안에 내 어둠에 들어가면 어둠 속으로 가라앉음 · 어둠 속에서는 걷기보다 빠르게 움직이고 보이지 않고 모든 공격이 통과하지만 공격을 할 수 없고 어둠 안에서만 움직임 · 어둠 속에서 궁극기를 다시 쓰면 어둠 탈출: 솟아오르며 근처 상대에게 내가 들어 있는 어둠과 이어진 어둠의 넓이만큼 피해(최대 90) + 1초 기절, 그 어둠만 사라지고 쿨타임이 다시 돌기 시작함', [0, 9 * T], f => {
    if (f.form === 'sub') { const z0 = myPools(f).filter(z => inZone(z, f)).sort((a, b) => Math.hypot(a.x - f.x, a.y - f.y) - Math.hypot(b.x - f.x, b.y - f.y))[0]; f.form = null; f.ghost = false; f.ucd = 0; fxAt(f, 'darkrise');
      const n = z0 ? connected(f, z0).length : 1; boom(f, f.x, f.y, px(150) + 40, Math.min(90, 18 * n), { stun: 1, col: '#9a4cff' }); if (z0) z0.dead = true; buff(f, 'haste', 3, 1.5); return; }
    f.st.arm = time + 1; return 'hold'; }, f => f.form === 'sub' || myPools(f).some(z => inZone(z, f))],
  skills: [
    [1, '어둠 확산', 'hit', '내 발밑에 어둠을 일반 공격의 2배 폭으로 넓게 퍼뜨림', [0, 6 * T], f => { darkPool(f, f.x, f.y, 124); }],
    [2, '어둠 응축', 'hit', '내 근처의 어둠을 소진시켜 어둠을 발사 · 캐릭터와 벽을 관통해 맵 끝까지 날아가고 피해는 소진한 어둠의 수에 비례 (기본 5, 최대 30)', [100, 11 * T], (f, a) => { const ps = myPools(f).filter(z => Math.hypot(z.x - f.x, z.y - f.y) < 260); for (const z of ps) z.dead = true; emit(f, a, { skill: 1, dmg: Math.min(30, 5 + ps.length * 5), pierce: 99, wp: 1, range: 30 * T, spd: 800, r: 8 + ps.length * 2, shape: 'potion' }); }],
    [3, '어둠의 끓음', 'hit', '좁지만, 내 앞·뒤·양옆 네 곳에 어둠을 만듦', [0, 6 * T], (f, a) => { for (let i = 0; i < 4; i++) { const p = fwd(f, 2.2 * T, a + i * Math.PI / 2); if (!solidAt(p.x, p.y)) darkPool(f, p.x, p.y, 44); } }]
  ] });

function guard(f, x, y, mode) {
  return minion({ by: f, kind: 'guard', x, y, hp: 45, t: 9, hit: true, bound: true, cd: 0, mode, aim: f.aim, upd: (m, dt) => { m.cd -= dt; const e = nearest(m, mode ? 9 * T : px(350), null, 0, false); let gx, gy;
    if (e) { gx = e.x; gy = e.y; m.aim = angTo(m, e); if (dist(m, e) < 56 && m.cd <= 0) { m.cd = .75; m.sw = time; damage(e, 15, m); } } else { const s = m.side || 1; gx = f.x + Math.cos(f.aim + s * 1.6) * 50; gy = f.y + Math.sin(f.aim + s * 1.6) * 50; }
    const d = Math.hypot(gx - m.x, gy - m.y); if (d > 40) { const v = norm(gx - m.x, gy - m.y); moveFighter(m, v[0] * 230 * dt, v[1] * 230 * dt); m.bob = (m.bob || 0) + dt * 12; } } });
}
const guardsOf = f => minions.filter(m => m.kind === 'guard' && m.by === f && !m.dead).length;
hero('cleon', { p: ['황제의 위엄', '근위병이 살아 있는 동안 근위병 1명마다 데미지 10% 증가, 받는 피해 15% 감소'],
  dmgf: f => 14 * (1 + .1 * guardsOf(f)), onHurt: (f, d) => guardsOf(f) ? d * .85 : d,
  ult: ['제국 함대 포격', '조준한 곳 주변 넓은 범위에 분홍 표시가 생기고 1.5초 뒤 제국 함선 5척의 위성 포격 빔이 차례로 떨어져 빔마다 15 피해 (벽 통과, 나는 피해 없음)', [100, 9 * T], f => { const p = aimPt(f, 9 * T); fx('cwarn', p.x, p.y, { r: 150, v: 1.5 }); fx('cfleet', p.x, p.y - 260, { r: 46 }); strike(f, p.x, p.y, 150, 1.5, () => seq(null, 5, .18, () => { const x = p.x + rnd(-90, 90), y = p.y + rnd(-90, 90); fx('cbeam', x, y - 520, { y2: y, v: y }); circ(f, x, y, 80, 15); }), '#ff7bd9'); }],
  skills: [
    [1, '근위병 소환', 'buff', '창을 든 근위병 4명을 9초 동안 소환 (체력 45, 1스킬 칸에서는 쿨타임 10.5초) · 2명은 가장 가까운 상대에게 돌진해 15 피해, 2명은 내 좌우를 지키다 상대가 가까워지면 달려가 공격', [0, 8 * T], f => { for (let i = 0; i < 4; i++) { const g = guard(f, f.x + (i % 2 ? 30 : -30), f.y + (i < 2 ? -30 : 30), i < 2 ? 1 : 0); g.side = i % 2 ? 1 : -1; } }, { cd1: 10.5 }],
    [2, '함대 신호', 'hit', '조준한 곳에 소형 포격 3발 (발당 피해 22, 0.3초 간격)', [100, 8 * T], f => { const p = aimPt(f, 8 * T); seq(null, 3, .3, i => { const x = p.x + rnd(-30, 30), y = p.y + rnd(-30, 30); fx('cwarn', x, y, { r: 60, v: .5 }); strike(f, x, y, 60, .5, () => { fx('cbeam', x, y - 520, { y2: y, v: y }); circ(f, x, y, 60, 22); }, '#ff7bd9'); }); }],
    [5, '황금 방패', 'buff', '1.5초 동안 앞에서 날아오는 투사체를 막음', [150, 9 * T], f => buff(f, 'block', 1.5)]
  ] });

hero('pel', { p: ['드론 편대', '곁을 도는 드론이 한 대당 한 발씩 쏨 (시작 2대, 2대를 넘으면 한 대당 쿨타임 15% 증가) · 드론 6대가 모두 살아 있으면 드론 공격 속도 1.2배'],
  spawn(f) { f.st.dr = 2; },
  cdf: f => .6 * (1 + .15 * Math.max(0, f.st.dr - 2)) / (f.st.dr >= 6 ? 1.2 : 1),
  atk(f, a) { const n = f.st.dr; if (!n) return 1; const e = B(f, 'focus') ? nearest(f, 9 * T, null, 0) : null; for (let i = 0; i < n; i++) { const an = time * 2 + i * 6.283 / n; emit(f, e ? angTo(f, e) : a, { ox: Math.cos(an) * 34 - Math.cos(a) * 20, oy: Math.sin(an) * 22 - 26 - Math.sin(a) * 20, dmg: 12 * (B(f, 'over') ? 1.5 : 1), homing: e || undefined, turn: 6 }); } return 1; },
  ult: ['드론 자폭', '3초 동안 드론의 공격력이 50% 증가하고, 그 뒤 모든 드론이 2초 동안 가까운 상대를 추격해 맞거나 2초가 지나면 자폭 (드론 1대당 10 피해) · 자폭한 드론은 스킬로 다시 늘림', [0, 8 * T], f => { if (!f.st.dr) return false; buff(f, 'over', 3); later(3, () => { const n = f.st.dr; f.st.dr = 0; for (let i = 0; i < n; i++) minion({ by: f, kind: 'drone', x: f.x + rnd(-30, 30), y: f.y - 30 + rnd(-20, 20), t: 2, upd: (m, dt) => { const e = nearest(m, 9 * T, null, 0, false); if (!e) return; const a = angTo(m, e); m.x += Math.cos(a) * 380 * dt; m.y += Math.sin(a) * 380 * dt; if (dist(m, e) < 30) m.t = 0; }, end: m => boom(f, m.x, m.y, 60, 10, { col: '#7df0ff', kb: 60 }) }); }, f); }, f => f.st.dr >= 2],
  skills: [
    [1, '드론 증설', 'buff', '드론을 한 대 늘림 (최대 6대)', [0, 30 * T], f => { if (f.st.dr >= 6) return false; f.st.dr++; }, { ok: f => f.st.dr < 6 }],
    [2, '드론 집중', 'buff', '2초 동안 드론 전부가 가장 가까운 적 한 명만 집중 사격 (탄이 유도됨)', [0, 8 * T], f => { buff(f, 'focus', 2); const e = nearest(f, 9 * T, null, 0); if (e) fxAt(e, 'lockon'); }],
    [3, '드론 방패', 'buff', '3초 동안 드론이 내 앞에 모여 날아오는 투사체를 막음 (드론이 없으면 안 쓰임)', [150, 9 * T], f => { if (!f.st.dr) return false; buff(f, 'block', 3); }],
    [5, '수리 모드', 'buff', '드론 한 대를 소모해 체력 20 회복 (드론이 없거나 체력이 가득이면 안 쓰임)', [0, 30 * T], f => { if (!f.st.dr || f.hp >= f.mhp) return false; f.st.dr--; heal(f, 20); }, { ok: f => f.hp < f.mhp * .5 && f.st.dr > 0 }]
  ] });
HEROES.pel.aiIdle = f => { if (f.scd[0] <= 0 && f.sk[0] && f.sk[0].n === 1) useSkill(f, 0); else if (f.scd[1] <= 0 && f.sk[1] && f.sk[1].n === 1) useSkill(f, 1); };

function morph(f, e, sec) { if (f.h !== f.h0 || e.minion) return; f.h = e.h0; f.sk = e.sk0; f.st.morph = e; if (f.h.spawn) f.h.spawn(f); buff(f, 'morph', sec); f.b.morph.end = g => { g.h = g.h0; g.sk = g.sk0; g.st.morph = null; g.form = null; g.ghost = false; g.boomOut = false; if (g.st.body) { g.st.body.dead = true; g.st.body = null; } }; }
hero('tionis', { p: ['피의 연극', '채혈 주사기가 맞으면 체력 10 회복'],
  onHurt(f, d) { if (f.st.clone) { later(1, () => { if (f.st.clone) { f.st.clone.dead = true; f.st.clone = null; unbuff(f, 'stealth'); } }); } },
  ult: ['분신 연극', '4초 동안 분신이 나타나 공격하고 (내 공격력의 절반) 분신은 공격을 받지 않음 · 그동안 나는 투명해지고, 피해를 받으면 1초 뒤에 풀림', [0, 8 * T], f => { buff(f, 'stealth', 4); f.st.clone = minion({ by: f, kind: 'clone', x: f.x, y: f.y, t: 4, cd: .3, aim: f.aim, bound: true, upd: (m, dt) => { m.cd -= dt; const e = nearest(m, HEROES.tionis.range, null, 0); if (!e) return; m.aim = angTo(m, e); if (m.cd <= 0) { m.cd = .6; bullets.push({ x: m.x + Math.cos(m.aim) * 24, y: m.y + BODY + Math.sin(m.aim) * 24, vx: Math.cos(m.aim) * 680, vy: Math.sin(m.aim) * 680, spd: 680, ang: m.aim, life: HEROES.tionis.range, dmg: 6.5, team: m.team, owner: f, r: 6, shape: 'mask', pierce: 0, splash: 0, phase: 0, o: { skill: 1 }, hit: new Set(), born: time, x0: m.x, y0: m.y }); } }, end: () => { f.st.clone = null; } }); }, f => !f.st.morph],
  skills: [
    [1, f => f.st.blood ? '변신' : '채혈', 'hit', '주사기를 던져(중거리) 맞힌 상대에게 20 피해 · 맞히면 스킬이 변신으로 바뀌어 바로 쓸 수 있음 · 변신은 맞힌 상대로 5초 동안 변장 (외형·공격·스킬·궁극기가 상대의 것)', [100, 6 * T], (f, a, i) => {
      if (f.st.blood) { const e = f.st.blood; f.st.blood = null; morph(f, e, 5); return; }
      emit(f, a, { skill: 1, dmg: 20, spd: 720, range: 6 * T, r: 7, shape: 'needle', onHit: e => { heal(f, 10); if (!e.minion) { f.st.blood = e; later(0, () => { f.scd[i] = 0; }); } } }); }],
    [2, '말솜씨', 'buff', '2.5초 동안 적에게 내 체력바가 아군 색으로 보여, 공격하기 전까지 적이 나를 노리지 않음', [0, 7 * T], f => buff(f, 'ally', 2.5)],
    [4, '무대 조명', 'hit', '조준한 바닥에 3초 동안 조명 원을 만듦 · 안에 있는 적은 투명이 풀리고 받는 피해 10% 증가', [100, 7 * T], f => { const p = aimPt(f, 7 * T); zone({ by: f, x: p.x, y: p.y, r: 110, t: 3, col: '#ffe9a8', op: .3, fn: z => { for (const e of foes(f)) if (!e.minion && inZone(z, e)) { buff(e, 'expose', .2); buff(e, 'reveal', .2); unbuff(e, 'stealth'); } } }); }]
  ] });
