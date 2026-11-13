/* ---------- character unlock (soul shards) and gear ----------
   Unlock: six characters are open from the start. Beating a locked character in a match gives one of its shards; enough shards open it.
   Missing shards can be filled with gold (SHARD_GOLD each). Boxes can hold shards too ('sh' in social.js BOX_LOOT).
   Gear: bought once with gold, worn by any character; slot 1 opens with the character, slot 2 at mastery step 1 (브론즈 II).
   Saved in COS: unl (opened ids), sh {id: shards}, gown (gear owned), geq {hero: [gear ids]} (cloud.js CL_RULE knows them) */
const UNLOCK_START = ['sword', 'bow', 'pistol', 'wizard', 'shotgun', 'grenade'];
const UNLOCK_NEED = { magiccard: 8, kadas: 8, rifle: 8, smg: 8, shuriken: 8, shade: 12, tionis: 12, harald: 12, portalgun: 12, gardener: 16 };
const SHARD_GOLD = 100;
const shardNeed = id => UNLOCK_NEED[id] || 8;
const shardsOf = id => Math.max(0, ((COS.sh || {})[id] | 0));
const unlocked = id => !!HEROES[id] && (UNLOCK_START.includes(id) || (COS.unl || []).includes(id));
const lockedIds = () => ROSTER.filter(id => !unlocked(id));
const unlockCost = id => Math.max(0, shardNeed(id) - shardsOf(id)) * SHARD_GOLD;
function unlockOpen(id) { if (unlocked(id)) return false; if (!Array.isArray(COS.unl)) COS.unl = []; COS.unl.push(id); return true; }
/* n shards for character id; opens it when they are enough. Returns true when this opened it */
function addShard(id, n) {
  if (!HEROES[id] || unlocked(id) || !(n > 0)) return false;
  if (!COS.sh || typeof COS.sh !== 'object') COS.sh = {};
  COS.sh[id] = shardsOf(id) + n;
  return shardsOf(id) >= shardNeed(id) ? unlockOpen(id) : false;
}
function unlockBuy(id) {
  const c = unlockCost(id); if (unlocked(id) || COS.gold < c) return false;
  COS.gold -= c; unlockOpen(id); saveCos(); goldUi(); try { sfx(880, .2, 'triangle', .07); } catch (e) {} return true;
}
/* a kill seen by this browser (host, offline, or a guest through the killinfo event): the local player beat a locked character */
function shardOnKill(vi, ki) {
  if (typeof DED !== 'undefined' && DED) return;
  const v = fighters[vi], k = fighters[ki];
  if (!v || !k || !player || k !== player || v === k || v.minion) return;
  const id = (v.h0 || v.h || {}).id; if (!id || unlocked(id)) return;
  const opened = addShard(id, 1); saveCos();
  try { addText({ x: v.x, y: v.y - 92, txt: opened ? '◆ ' + HEROES[id].name + '!' : '◆+1', life: 1.1, color: '#c9a2ff' }); } catch (e) {}
}
{ const k0 = FXF.killinfo; FXF.killinfo = (vi, ki, src) => { if (k0) k0(vi, ki, src); try { shardOnKill(vi, ki); } catch (e) {} }; }

/* gear: [id, name, effect, price] — engine.js reads them through hasGear() */
const GEARS = [
  ['dash', '질풍 신발', '대쉬 쿨타임 -15%', 600],
  ['sk2', '두 번째 숨', '2스킬 쿨타임 -12%', 700],
  ['ult', '사냥꾼 표식', '처치하면 궁극기 4초 더 감소', 900],
  ['band', '비상 붕대', '체력 30% 아래로 처음 떨어지면 2초간 받는 피해 -30%', 800],
  ['pad', '패드 마니아', '치유·속도 패드 효과 +60%', 600],
  ['lava', '용암 장화', '용암 분출·안전 구역 밖 피해 -40%', 600],
  ['flag', '깃발 멜빵', '깃발을 들어도 느려지지 않음', 600],
  ['back', '역전의 칼날', '팀 점수가 뒤질 때 주는 피해 +8%', 900]
];
const GEAR_IDS = GEARS.map(g => g[0]);
const gearDef = id => GEARS.find(g => g[0] === id);
const hasGear = (f, g) => !!(f && f.gear && f.gear.indexOf(g) >= 0);
const cleanGear = a => Array.isArray(a) ? a.filter((g, i) => GEAR_IDS.includes(g) && a.indexOf(g) === i).slice(0, 2) : [];
const gearOwned = g => (COS.gown || []).includes(g);
const gearSlots = id => masteryOf(id).i >= 1 ? 2 : 1;
function myGear(id) { return cleanGear(((COS.geq || {})[id] || []).filter(gearOwned)).slice(0, gearSlots(id)); }
function gearBehind(f) { if (!score || score[f.team] == null) return false; let mx = -1; score.forEach((s, t) => { if (t !== f.team) mx = Math.max(mx, s); }); return score[f.team] < mx; }
function gearToggle(hero, g) {
  if (!gearOwned(g)) return false;
  if (!COS.geq || typeof COS.geq !== 'object') COS.geq = {};
  let l = myGear(hero); const n = gearSlots(hero);
  if (l.includes(g)) l = l.filter(x => x !== g); else { l.push(g); if (l.length > n) l.shift(); }
  COS.geq[hero] = l; saveCos(); return true;
}
function gearBuy(g) {
  const d = gearDef(g); if (!d || gearOwned(g) || COS.gold < d[3]) return false;
  if (!Array.isArray(COS.gown)) COS.gown = [];
  COS.gown.push(g); COS.gold -= d[3]; saveCos(); goldUi(); try { sfx(880, .18, 'triangle', .06); } catch (e) {} return true;
}

/* ---------- lobby UI: locked cards, unlock button, gear box in the character detail ---------- */
function markLocks() {
  const grid = document.getElementById('weaponGrid'); if (!grid) return;
  for (const el of grid.children) {
    const id = el.dataset.wid, lk = !unlocked(id); el.classList.toggle('lock', lk);
    if (lk) { const b = el.querySelector('.wm b'), bar = el.querySelector('.wmBar i'); if (b) b.textContent = '◆ ' + shardsOf(id) + ' / ' + shardNeed(id); if (bar) bar.style.width = Math.round(shardsOf(id) / shardNeed(id) * 100) + '%'; }
  }
}
let gearPick = null;      // the gear tapped once (a second tap buys it)
function renderGear(id) {
  const d = document.getElementById('weaponDetail'); if (!d) return;
  let box = document.getElementById('gearBox'); if (box) box.remove();
  box = document.createElement('div'); box.id = 'gearBox';
  const btn = document.getElementById('weaponLockBtn');
  if (!unlocked(id)) {
    const row = document.createElement('div'), b = document.createElement('b'), bar = document.createElement('span'), fl = document.createElement('i');
    row.className = 'shRow'; b.textContent = '◆ ' + shardsOf(id) + ' / ' + shardNeed(id); bar.className = 'mBar'; fl.style.width = Math.round(shardsOf(id) / shardNeed(id) * 100) + '%'; bar.append(fl); row.append(b, bar); box.append(row);
    d.prepend(box);
    if (btn) { const c = unlockCost(id); btn.textContent = '해금 ' + c.toLocaleString('en-US'); btn.classList.add('unlockBtn'); btn.disabled = COS.gold < c; }
    return;
  }
  if (btn) btn.classList.remove('unlockBtn');
  const n = gearSlots(id), eq = myGear(id), slots = document.createElement('div'); slots.className = 'gSlots';
  for (let i = 0; i < 2; i++) { const s = document.createElement('span'); s.className = 'gSlot' + (i >= n ? ' shut' : '') + (eq[i] ? ' on' : ''); s.textContent = i >= n ? '🔒 ' + MASTERY[1].name : eq[i] ? gearDef(eq[i])[1] : '+'; slots.append(s); }
  box.append(slots);
  const list = document.createElement('div'); list.className = 'gList';
  for (const [g, nm, fx, pr] of GEARS) {
    const b = document.createElement('button'), own = gearOwned(g), t = document.createElement('b'), p = document.createElement('small');
    b.type = 'button'; b.id = 'gear-' + g; b.className = 'gItem' + (eq.includes(g) ? ' on' : '') + (own ? '' : ' buy');
    t.textContent = nm; p.textContent = fx; b.append(t, p);
    if (!own) { const c = document.createElement('i'), co = document.createElement('span'); co.className = 'coin'; c.className = 'gPrice' + (COS.gold < pr ? ' poor' : ''); c.append(co, gearPick === g ? '구매 ' + pr : String(pr)); b.append(c); }
    b.addEventListener('click', () => {
      if (own) { gearPick = null; gearToggle(id, g); }
      else if (gearPick !== g) gearPick = g;
      else { gearPick = null; if (gearBuy(g)) gearToggle(id, g); }
      renderGear(id);
    });
    list.append(b);
  }
  box.append(list); d.append(box);
}
