
hero('samurai', { p: ['검무', '두 손의 검으로 번갈아 4연타(220 ×3 + 넷째 타 X자 500) · 같은 적을 끊기지 않고 때리면 타마다 피해 3%씩, 최대 15% · 연타 중(1초 안에 공격했으면) 받는 피해 15% 감소'],
  /* 2026-11-15 rework (user): 쌍검 연타 사무라이. basic = alternating 4-hit combo, gaps 0.18s, 0.35s breath after the 4th (real seconds: ATK_CD_MUL is divided out) */
  cdf(f) { return (samIdx(f) === 3 ? .53 : .18) / ATK_CD_MUL; },
  dmgf(f) { return (samIdx(f) === 3 ? 50 : 22) * (1 + .03 * Math.min(5, samStreak(f))); },
  mo(f) { return samIdx(f) === 3 ? { kb: 140 } : null; },
  onSwing(f, hits, ang) { const i = samIdx(f); f.st.lh = f.st.lh === 1 ? 0 : 1; f.st.hand = i === 3 ? 2 : f.st.lh;      // hands always alternate swing to swing (also when the combo dropped and starts over)
    f.st.cb = i + 1; f.st.la = time; if (f.st.cb % 4 === 0) fxAt(f, 'skillring', { color: '#dfe9ff' }); },
  onDeal(f, e, d, o) { if (e.minion) return; if (f.st.tg === e && time - (f.st.lt || -9) < 1) f.st.sk = (f.st.sk || 0) + 1; else f.st.sk = 0; f.st.tg = e; f.st.lt = time; },
  onHurt(f, d, by) { if (!B(f, 'parry') && time - (f.st.la || -9) < 1) return d * .85; if (B(f, 'parry') && by && by !== f && !by.dead && dist(f, by) < 2.4 * T) { unbuff(f, 'parry'); say(f, '흘려 베기', '#dfe9ff'); f.aim = angTo(f, by); seq(f, 4, .08, i => { f.swing = .14; f.st.hand = i === 3 ? 2 : i % 2 ? 0 : 1; arc(f, angTo(f, by), f.h.range * 1.15, f.awT > 0 ? Math.PI : .9, i === 3 ? 50 : 22, i === 3 ? { kb: 200 } : {}); }); return 0; } },
  ult: ['쌍검 난무', '가장 가까운 적(4칸 안)에게 붙어 1.5초 동안 12번 베기 (11번 45 + 마지막 X자 405, 합 900, 마지막에 밀쳐냄) · 그동안 기본 공격은 나가지 않음 · 그동안 상대는 30% 느려지고, 멀어지면 순간이동으로 따라붙음 · 무적 아님, 기절하면 끊김', [0, 4 * T], f => {
    const e = nearest(f, 4 * T, null, 0, true); if (!e) return false;
    blinkTo(f, e.x - Math.cos(angTo(f, e)) * 46, e.y - Math.sin(angTo(f, e)) * 46); fxAt(f, 'samult');
    buff(e, 'slow', 1.6, .7); f.atkLockT = time + 1.5;
    seq(f, 12, .125, i => { if (e.dead || f.dead || B(f, 'stun')) return; if (dist(f, e) > 70 && dist(f, e) < 6 * T) { const g = angTo(e, f); blinkTo(f, e.x + Math.cos(g) * 46, e.y + Math.sin(g) * 46); } const a = angTo(f, e); f.aim = a; f.swing = .12; f.st.hand = i === 11 ? 2 : i % 2 ? 0 : 1; addSwing(f, a); arc(f, a, f.h.range * 1.2, 1, i === 11 ? 40.5 : 4.5, i === 11 ? { kb: 420 } : {}); if (i === 11) fx('samcut', e.x, e.y + BODY, { ang: 0, gy: e.y + 16 }); });
  }],
  skills: [
    [1, '십자 베기', 'move', '앞으로 2칸 파고들며 두 검으로 X자 베기 · 540 피해 + 1초 동안 30% 둔화', [60, 2 * T], (f, a) => { f.st.hand = 2; lunge(f, a, 2 * T, .15, { end: g => { g.swing = .2; addSwing(g, g.aim); arc(g, g.aim, g.h.range * 1.25, 1.1, 54, { slow: [.7, 1] }); fx('samcut', g.x + Math.cos(g.aim) * 50, g.y + BODY + Math.sin(g.aim) * 50, { ang: 0, gy: g.y + 16 }); } }); }],
    [2, '거합', 'move', '조준 방향으로 순식간에 베고 지나가며 경로 위의 적에게 300 피해 · 2명 이상 베면 쿨타임 절반', [60, px(430)], (f, a, i) => { const r = blink(f, a, px(430)); f.st.lh = f.st.lh === 1 ? 0 : 1; f.st.hand = f.st.lh; f.swing = .22; fxLine('iai', r.x0, r.y0 + BODY, f.x, f.y + BODY, { wid: 'samurai', cos: f.cos, gy: f.y + 16 }); const n = pathHit(f, r.x0, r.y0, f.x, f.y, 34, 30).length; if (n >= 2) later(0, () => { f.scd[i] *= .5; }); }],
    [3, '검 던지기', 'hit', '한 자루를 던져(적을 뚫고 감) 맞은 적마다 400 피해 · 0.35초 뒤 검이 날아간 곳으로 순간이동해 다시 쥠', [0, 5 * T], (f, a) => { emit(f, a, { skill: 1, dmg: 40, range: 5 * T, r: 10, spd: 1400, pierce: 99, shape: 'katana' }); later(.35, () => { if (!f.dead) blink(f, a, 5 * T); }, f); }],
    [4, '흘려 베기', 'buff', '0.4초 동안 자세 · 그 사이 가까이(2.4칸)에서 오는 공격 한 번을 흘리고 곧바로 4연타 반격 (220 ×3 + 500) · 멀리서 쏜 공격은 그냥 맞음', [0, 110], f => { buff(f, 'parry', .4); }]
  ] });
let samHand = 1;      // which hand the 사무라이 being drawn swings: 1 right (odd hits) · 0 left (even hits) · 2 both (4th, X) — set in tail.js drawFighter0
function samIdx(f) { return time - (f.st.la || -9) > .8 ? 0 : (f.st.cb || 0) % 4; }      // which hit of the 4-hit combo comes next (combo drops after 0.8s)
function samStreak(f) { return time - (f.st.lt || -9) < 1 ? (f.st.sk || 0) : 0; }

hero('harald', { p: ['강인한 맷집', '방패와 도끼로 앞에서 버티는 근접 전사 · 방어 스킬이 많음'], hp: 540,
  ult: ['도끼 돌진', '도끼를 조준 방향으로 던져 박고, 방패를 들고 박힌 도끼 쪽으로 돌진 (돌진 중 받는 피해 50% 감소) · 돌진하다 부딪힌 상대는 크게 밀려나고 0.6초 기절 + 266 피해', [60, 6 * T], (f, a) => { buff(f, 'dr', .8, .5); fxAt(f, 'dash', { dir: 1, rot: +a.toFixed(2), color: '#cfd8e3' }); lunge(f, a, 6 * T, .5, { dmg: 28, stun: .6, onHit: e => { knock(e, f.x, f.y, 800); if (f.awT > 0) buff(e, 'stun', 1.2); }, end: g => { if (g.awT > 0) { const ab = awBoost(g); if (ab && ab.slam) ab.slam(g); } } }); }],
  skills: [
    [1, '분노', 'buff', '2초 동안 받는 피해 12% 감소', [0, 5 * T], f => buff(f, 'dr', 2, .9)],
    [2, '방패 강타', 'hit', '방패로 앞의 상대를 밀며 0.3초 기절 (95 피해) · 맞히면 대쉬 쿨타임이 절반으로 줄어듦', [0, 100], (f, a) => { f.swing = .22; if (arc(f, a, 100, .9, 10, { kb: 520, stun: .3 }).length) f.dcd *= .5; }],
    [3, '도끼 휘두르기', 'hit', '도끼를 크게 한 바퀴 휘둘러 주변 상대에게 209 피해 + 밀쳐냄', [0, 105], f => { f.spin = .4; circ(f, f.x, f.y, 105, 22, { kb: 360 }); }],
    [4, '방패 올리기', 'buff', '1.5초 동안 정면에서 날아오는 투사체를 막음', [150, 9 * T], f => buff(f, 'block', 1.5)],
    [5, '내려찍기', 'hit', '높이 뛰어올랐다가 내려찍어 주변 적에게 162 피해 + 0.3초 기절', [0, 3 * T], (f, a) => lunge(f, a, 2 * T, .35, { fly: 1, end: g => boom(g, g.x, g.y, 100, 17, { stun: .3, kb: 0, col: '#cfd3dc' }) })]
  ] });







hero('shade', { p: ['네온 강타', '공격은 범위 안의 적 모두에게 피해 · 기본 공격을 2번 연속으로 하면 다음 공격은 강타: 추가 피해 +43, 상대 0.4초 기절'],
  cdf: f => .95 * (B(f, 'rage') ? .67 : 1),
  mo(f) { f.st.n = (f.st.n || 0) + 1; return f.st.n % 3 === 0 ? { stun: .4, fn: e => damage(e, 5, f, { raw: 1, extra: 1 }) } : null; },
  ult: ['네온 점멸', '조준 방향으로 길게 점멸하며, 점멸 경로에 있던 모든 상대를 내 앞으로 끌어오고 1.2초 동안 기절시킴', [100, px(620)], (f, a) => { const r = blink(f, a, px(620)); fxLine('shblink', r.x0, r.y0 + BODY, f.x, f.y + BODY, { wid: 'shade', cos: f.cos, gy: f.y + 16, col: CONCEPT_COLOR[conceptOfSkin(skinOf(f.cos, 'shade'))] }); const p = fwd(f, 50, a); pathHit(f, r.x0, r.y0, f.x, f.y, 44, 0, { stun: 1.2, fn: e => { if (!e.minion) blinkTo(e, p.x + rnd(-14, 14), p.y + rnd(-14, 14)); } }); }],
  skills: [
    [1, '대검 돌진', 'hit', '네온 대검을 조준 방향으로 던짐 (중장거리) · 맞히면 상대에게 꽂히고 사슬로 빠르게 돌진해 대검을 다시 잡음 · 상대 128 피해 + 0.5초 기절', [100, 7 * T], (f, a) => emit(f, a, { skill: 1, dmg: 15, stun: .5, spd: 1040, range: 7 * T, r: 10, shape: 'arrow', onHit: e => { fx('shchain', f.x, f.y + BODY, { x2: Math.round(e.x), y2: Math.round(e.y + BODY), hit: true, col: CONCEPT_COLOR[conceptOfSkin(skinOf(f.cos, 'shade'))] }); lunge(f, angTo(f, e), Math.max(10, dist(f, e) - 40), .18, { fly: 1 }); } })],
    [2, '네온 돌진', 'move', '조준 방향으로 빠르게 돌진 · 처음 닿은 상대에게 170 피해 + 0.3초 기절하고 그 자리에서 멈춤', [60, 4 * T], (f, a) => lunge(f, a, 4 * T, .3, { onHit: e => { damage(e, 20, f); buff(e, 'stun', .3); return 'stop'; } })],
    [3, '분노', 'buff', '3초 동안 일반 공격 쿨타임 33% 감소', [0, 150], f => buff(f, 'rage', 3)],
    [4, '찌르기', 'hit', '앞의 가까운 상대를 찔러 213 피해 + 0.9초 기절 (맞힐 상대가 없으면 쓰이지 않음)', [0, 130], (f, a) => { const e = nearest(f, 140, a, .8); if (!e) return false; f.swing = .22; damage(e, 25, f); buff(e, 'stun', .9); }],
    [5, '네온 가속', 'buff', '2.5초 동안 이동속도 1.3배 + 받는 피해 20% 감소', [0, 5 * T], f => { buff(f, 'haste', 2.5, 1.3); buff(f, 'dr', 2.5, .8); }]
  ] });


const poison = (e, f) => { if (e.minion) return; e.st.pn = Math.min(4, (e.st.pn || 0) + 1); e.st.pt = time + 3; e.st.pby = f; };
function poisonTick(f, dt) { if (f.st.pn) { if (time > f.st.pt) { f.st.pn = 0; return; } if (f.st.pn >= 4) buff(f, 'slow', .2, .8); f.st.pa = (f.st.pa || 0) + dt; if (f.st.pa >= .5) { f.st.pa -= .5; damage(f, f.st.pn, f.st.pby, { quiet: 1, el: 1, raw: 1 }); } } }

function charm(f, e, sec, bonus) {
  buff(e, 'charm', sec, f); buff(f, 'root', sec); buff(f, 'dr', sec, .5); f.st.ctrl = e;
  e.b.charm.end = v => { f.st.ctrl = null; unbuff(f, 'root'); unbuff(f, 'dr'); ring(v.x, v.y, px(220), '#ff7bd9'); damage(v, 60 + bonus, f); for (const o of fighters) if (o !== v && !o.dead && o.team === v.team && dist(o, v) < px(220)) damage(o, 30, f); };
}





function morph(f, e, sec) { if (f.h !== f.h0 || e.minion) return; f.h = e.h0; f.sk = e.sk0; f.st.morph = e; if (f.h.spawn) f.h.spawn(f); buff(f, 'morph', sec); f.b.morph.end = g => { g.h = g.h0; g.sk = g.sk0; g.st.morph = null; g.form = null; g.ghost = false; g.boomOut = false; if (g.st.body) { g.st.body.dead = true; g.st.body = null; } }; }
hero('tionis', { p: ['피의 연극', '채혈 주사기가 맞으면 체력 100 회복'],
  onHurt(f, d) { if (f.st.clone) { later(1, () => { if (f.st.clone) { f.st.clone.dead = true; (f.st.cl2 || []).forEach(c => { c.dead = true; }); f.st.cl2 = null; f.st.clone = null; unbuff(f, 'stealth'); } }); } },
  ult: ['분신 연극', '4초 동안 분신이 나타나 공격하고 (내 공격력의 절반) 분신은 공격을 받지 않음 · 그동안 나는 투명해지고, 피해를 받으면 1초 뒤에 풀림', [0, 8 * T], f => { buff(f, 'stealth', 4); const awk = f.awT > 0, NC = awk ? 3 : 1, PW = awk ? 1.4 : 1; f.st.cl2 = []; for (let q = 0; q < NC; q++) { const m = minion({ by: f, kind: 'clone', x: f.x + (q ? (q === 1 ? -48 : 48) : 0), y: f.y, t: 4, cd: .3 + q * .1, aim: f.aim, bound: true, upd: (m, dt) => { m.cd -= dt; const e = nearest(m, HEROES.tionis.range, null, 0); if (!e) return; m.aim = angTo(m, e); if (m.cd <= 0) { m.cd = .6; bullets.push({ src: SRC, x: m.x + Math.cos(m.aim) * 24, y: m.y + BODY + Math.sin(m.aim) * 24, vx: Math.cos(m.aim) * 680, vy: Math.sin(m.aim) * 680, spd: 680, ang: m.aim, life: HEROES.tionis.range, dmg: 6.5 * PW, team: m.team, owner: f, r: 6, shape: 'mask', pierce: 0, splash: 0, phase: 0, o: { skill: 1 }, hit: new Set(), born: time, x0: m.x, y0: m.y }); } }, end: () => { if (q === 0) f.st.clone = null; } }); if (q === 0) f.st.clone = m; else f.st.cl2.push(m); } }, f => !f.st.morph],
  skills: [
    [1, f => f.st.blood ? '변신' : '채혈', 'hit', '주사기를 던져(중거리) 맞힌 상대에게 400 피해 · 맞히면 스킬이 변신으로 바뀌어 바로 쓸 수 있음 · 변신은 맞힌 상대로 5초 동안 변장 (외형·공격·스킬·궁극기가 상대의 것)', [100, 6 * T], (f, a, i) => {
      if (f.st.blood) { const e = f.st.blood; f.st.blood = null; morph(f, e, 5); return; }
      emit(f, a, { skill: 1, dmg: 20, spd: 720, range: 6 * T, r: 7, shape: 'needle', onHit: e => { heal(f, 10); if (!e.minion) { f.st.blood = e; later(0, () => { f.scd[i] = 0; }); } } }); }],
    [2, '말솜씨', 'buff', '2.5초 동안 적에게 내 체력바가 아군 색으로 보여, 공격하기 전까지 적이 나를 노리지 않음', [0, 7 * T], f => buff(f, 'ally', 2.5)],
    [3, '마취 주사', 'hit', '주사기를 던져 맞힌 상대에게 300 피해 + 2초 동안 이동속도 40% 감소', [100, 6 * T], (f, a) => emit(f, a, { skill: 1, dmg: 15, spd: 720, range: 6 * T, r: 7, shape: 'syringe', slow: [.6, 2] })],
    [4, '무대 조명', 'hit', '조준한 바닥에 3초 동안 조명 원을 만듦 · 안에 있는 적은 투명이 풀리고 받는 피해 13% 증가', [100, 7 * T], f => { const p = aimPt(f, 7 * T); zone({ by: f, x: p.x, y: p.y, r: 110, t: 3, col: '#ffe9a8', op: .3, fn: z => { for (const e of foes(f)) if (!e.minion && inZone(z, e)) { buff(e, 'expose', .2); buff(e, 'reveal', .2); unbuff(e, 'stealth'); } } }); }],
    [5, '퇴장', 'move', '조준 방향으로 3칸 순간이동하고 1초 동안 투명해짐', [0, 6 * T], (f, a) => { const r = blink(f, a, 3 * T); fx('blink', r.x0, r.y0 + BODY, { color: '#ff6b9a', gy: r.y0 + 16 }); if (typeof FXF !== 'undefined' && FXF.exitpuff) fxPlay('exitpuff', Math.round(r.x0), Math.round(r.y0 + BODY), Math.round(f.x), Math.round(f.y + BODY)); buff(f, 'stealth', 1); }]
  ] });

/* ===== 차원 여행자 (portalgun): bouncing portal shots, portals, a pulling rift ===== */
const myPortals = f => zones.filter(z => z.kind === 'portal' && z.by === f);
function portalPair(f, ax, ay, bx, by, t) {
  for (const z of myPortals(f)) z.dead = true;
  const mk = (x, y) => zone({ by: f, x, y, r: 34, t, col: 'rgba(0,0,0,0)', op: 0, kind: 'portal', fn: (z, dt) => {
    if (f.awT > 0) awPortalShoot(f, z, dt);      // (awaken.js) awakened: the portals shoot dimension bullets at enemies near them
    const o = z.other; if (!o || o.dead || f.dead || time < (f.st.ptT || 0) || !inZone({ x: z.x, y: z.y, r: 14 }, f) || f.dash) return;
    f.st.ptT = time + .9; fx('blink', f.x, f.y + BODY, { color: '#b45cff', gy: f.y + 16 }); f.x = o.x; f.y = o.y; unstick(f); fx('blink', f.x, f.y + BODY, { color: '#35e0ff', gy: f.y + 16 }); sfx(720, .15, 'sine', .05, .5); circ(f, f.x, f.y, 72, 12, { kb: 380 }); } });      // stepping out: 12 damage and a light shove (Stickseum PORTAL_EXIT)
  const a = mk(ax, ay), b = mk(bx, by); a.other = b; b.other = a; return [a, b];
}
const landAt = (x, y) => blockedAt(x, y) ? freeNear(x, y) : { x, y };
hero('portalgun', { p: ['차원 반사', '포탈건 탄환은 벽에 닿으면 최대 3번까지 튕기고, 튕길 때마다 피해가 30% 증가 (최대 495) · 튕긴 탄환이 상대에게 맞으면 대쉬 쿨타임 0.7초 감소'],
  range: 9 * T,
  pre(f, o) { o.bmul = 1.3; o.bcap = 30; o.onHit = (e, b) => { if (b.nb > 0) f.dcd = Math.max(0, f.dcd - .7); }; return o; },
  ult: ['포탈 연결', '내 자리와 조준한 곳에 보라색 포탈 한 쌍을 8초 동안 엶 · 한쪽에 닿으면 반대쪽으로 순간이동 (나만 사용 가능, 나올 때 근처 적에게 198 피해와 약한 넉백, 새로 열면 기존 포탈은 사라짐)', [0, 9 * T], f => {
    const p = aimPt(f, 9 * T), q = landAt(p.x, p.y); f.st.ptT = time + .9; portalPair(f, f.x, f.y, q.x, q.y, 8); }],
  skills: [
    [1, '포탈 파괴', 'hit', '내 포탈 둘에서 연기가 나고 0.5초 뒤 두 포탈이 함께 폭발 (각각 주변 1073 피해와 큰 넉백) · 포탈이 있을 때만 사용', [0, 12 * T], f => {
      const ps = myPortals(f).filter(z => !z.dead); if (!ps.length || f.st.pblast) return false; f.st.pblast = 1;
      for (const z of ps) { fx('skillring', z.x, z.y, { color: '#9a9aa8', r: 60 }); burst(z.x, z.y, '#9a9aa8', 10, 120); }
      later(.5, () => { f.st.pblast = 0; for (const z of ps) { if (z.dead) continue; boom(f, z.x, z.y, 114, 65, { kb: 600, col: '#b45cff' }); z.dead = true; } });
    }, { ok: f => myPortals(f).some(z => !z.dead && foes(f).some(e => Math.hypot(e.x - z.x, e.y - z.y) < 120)) }],
    [2, '차원 도약', 'move', '조준한 곳으로 순간이동 (최대 5칸, 벽 너머도 가능)', [0, 5 * T], f => { const p = aimPt(f, 5 * T), q = landAt(p.x, p.y); blinkTo(f, q.x, q.y); }],
    [3, '반사 구체', 'hit', '벽에 최대 6번 튕기는 큰 구체를 발사 (413 피해, 튕길 때마다 20% 증가)', [100, 9 * T], (f, a) => emit(f, a, { skill: 1, dmg: 25, r: 12, spd: 420, range: 16 * T, bnc: 6, bmul: 1.2, bcap: 55, shape: 'portalbullet' })],
    [4, '차원 균열', 'hit', '조준한 곳에 2.5초 동안 균열을 열어 안의 상대를 가운데로 끌어당기고 0.5초마다 66 피해', [100, 6 * T], f => { const p = aimPt(f, 6 * T);
      zone({ by: f, x: p.x, y: p.y, r: 95, t: 2.5, col: 'rgba(0,0,0,0)', op: 0, kind: 'rift', fn: (z, dt) => { z.acc += dt; const tk = z.acc >= .5; if (tk) z.acc -= .5;
        for (const e of foes(f)) if (!e.minion && inZone(z, e)) { const dx = z.x - e.x, dy = z.y - e.y, d = Math.hypot(dx, dy) || 1; if (d > 12) moveFighter(e, dx / d * 150 * dt, dy / d * 150 * dt); if (tk) damage(e, 4, f); } } }); }],
    [5, '차원 이탈', 'buff', '1.5초 동안 다른 차원으로 사라져 모든 공격이 통과하고 이동속도 40% 증가 (그동안 공격 불가)', [0, 1e9], f => { f.form = 'sub'; f.ghost = true; buff(f, 'haste', 1.5, 1.4); fxAt(f, 'blink');
      later(1.5, () => { if (f.form === 'sub') { f.form = null; f.ghost = false; fx('blink', f.x, f.y + BODY, { color: '#35e0ff', gy: f.y + 16 }); } }, f); }, { ok: (f, t, d) => f.hp < f.mhp * .5 && d < 4 * T }]
  ] });

/* ===== playable roster (2026-11-10): only these characters are selectable / bot-assigned / random-picked.
   The other kits stay defined (moved to HEROES_OFF) so re-enabling a character = adding its id here. ===
   기사 sword · 마법사 wizard · 마술사 magiccard · 로빈 후드 bow · 네온 shade · 티오니스 tionis · 하랄드 harald
   제임스 pistol · 군인 rifle · 특수요원 smg · 닌자 shuriken · 폭발광 grenade · 보안관 shotgun
   차원 여행자 portalgun · 복서 gloves (2026-11-13) */
const ACTIVE_HEROES = ['sword', 'wizard', 'magiccard', 'bow', 'shade', 'tionis', 'harald', 'pistol', 'rifle', 'smg', 'shuriken', 'grenade', 'shotgun', 'portalgun', 'gloves', 'samurai', 'bazooka'];
const HEROES_OFF = {};
/* per-hero damage multiplier (applied in damage() to everything the hero deals: basic attack, skills, ultimate, DoTs).
   Balance table from the 14-hero bot sim, 2026-11-10; skill description numbers in kits1/kits2 already include these. */
const DMG_MUL = { bazooka: .7, harald: .95, shade: .85, sword: 1.2, grenade: .6, shotgun: .8, magiccard: 1.2, wizard: 1.25, rifle: .95, tionis: 2, bow: 1.25, pistol: 1.4, smg: 1.1, shuriken: 1.6, portalgun: 1.65, gloves: 1.25 };      // 2026-11-13 duel + team bot sim retune (gardener: gardener.js)
for (const id in DMG_MUL) HEROES[id].xm = DMG_MUL[id];
HEROES.wizard.range = 9.5 * T;      // user 2026-11-23: 마법사 damage down (1.5 -> 1.25), reach up (8.2 -> 9.5 tiles); both numbers are placeholders
HEROES.grenade.dmg = 51;      // 2026-11-15 user: 폭발광 basic attack 56 -> 51 (placeholder)
/* per-hero max hp in the original (small) units, ×STAT_X applied here. Tuned 2026-11-10 with bots that kite (14-hero sim: all win rates 46–55%). */
const HP_TABLE = { bazooka: 700, sword: 580, shade: 490, harald: 500, grenade: 540, shotgun: 600, rifle: 600, magiccard: 610, wizard: 640, bow: 690, pistol: 720, smg: 760, shuriken: 780, tionis: 830, portalgun: 770, gloves: 950, samurai: 720 };
for (const id in HP_TABLE) HEROES[id].hp = HP_TABLE[id] * STAT_X;
for (const id of Object.keys(HEROES)) if (!ACTIVE_HEROES.includes(id)) { HEROES_OFF[id] = HEROES[id]; delete HEROES[id]; }
ROSTER.splice(0, ROSTER.length, ...ACTIVE_HEROES.filter(id => HEROES[id]));
