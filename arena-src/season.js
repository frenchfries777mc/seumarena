/* ===== season "The key of Turkey" (user 2026-11-25): the lobby button, the season screen (#tkScreen), the season draw and the turkey skins.
   칠면조 다리 (COS.tl) come from 칠면조 잡기 (turkey.js: one per turkey the player caught). They buy draw tickets (COS.tt) and the two limited skins
   (art/cosart.js, turkey:1). The new season character 셰프 (chef.js) and its locked skills come out of the draw at low odds (TK_NEW, TEMP odds).
   Every number here is a placeholder the user may change. ===== */
const TK_TIX = [[1, 5], [5, 20]];      // [tickets, legs]
const TK_SKINS = [['skin_sword_turkey', 30], ['skin_pistol_turkey', 30], ['skin_bow_turkey', 30], ['skin_shuriken_turkey', 30], ['skin_shotgun_turkey', 30], ['skin_rifle_turkey', 30], ['skin_smg_turkey', 30], ['skin_gloves_turkey', 30], ['skin_grenade_turkey', 30], ['skin_bazooka_turkey', 30], ['skin_wizard_turkey', 30], ['skin_magiccard_turkey', 30], ['skin_samurai_turkey', 30], ['skin_harald_turkey', 30], ['skin_shade_turkey', 30], ['skin_tionis_turkey', 30], ['skin_portalgun_turkey', 30]];      // [skin, legs]
const TK_DRAW = [[47, 'g', 200, 600, '#f2c14e', '골드'], [31, 'cr', 40, 100, '#3fe0c8', '크리스탈'], [18, 'rx', 150, 300, '#6fb8ff', '캐릭터 XP'], [4, 'tl', 5, 5, '#b8662e', '칠면조 다리']];      // [weight, kind, least, most, colour, name]
const TK_NEW = { hero: .03, skill: .04 };      // TEMP odds per draw: 셰프 himself (not owned yet) / one of his locked skills (owned)
const tkOn = () => Date.now() < TK_SEASON_END;
function tkDrawOne() {
  if (typeof chefOwned === 'function') {
    if (!chefOwned() && Math.random() < TK_NEW.hero) { chefGive(); return { kind: 'hero', hero: 'chef' }; }
    const shut = chefOwned() && HEROES.chef ? HEROES.chef.skills.filter(s => !skOpen('chef', s.n)) : [];
    if (shut.length && Math.random() < TK_NEW.skill) { const s = pick(shut); COS.su.push('chef:' + s.n); return { kind: 'su', hero: 'chef', sk: s.n }; }
  }
  let r = Math.random() * TK_DRAW.reduce((a, l) => a + l[0], 0), l = TK_DRAW[0]; for (const x of TK_DRAW) { if ((r -= x[0]) < 0) { l = x; break; } }
  return giveReward(l[1], l[2] === l[3] ? l[2] : Math.round((l[2] + Math.random() * (l[3] - l[2])) / 10) * 10);
}
function tkUi() {
  const leg = COS.tl | 0, tix = COS.tt | 0, $ = id => document.getElementById(id);
  const b = $('seasonBtn'); if (b) { b.hidden = !tkOn(); const n = b.querySelector('.tkN'); if (n) n.textContent = leg.toLocaleString('en-US'); const d = $('seasonDot'); if (d) d.hidden = !(tix > 0 || TK_TIX.some(t => leg >= t[1]) || TK_SKINS.some(([id, p]) => !skinOwned(id) && leg >= p)); }
  if (!$('tkScreen') || !$('tkScreen').classList.contains('active')) return;
  $('tkLegN').textContent = leg.toLocaleString('en-US'); $('tkTixN').textContent = tix;
  { const ms = TK_SEASON_END - Date.now(), d = Math.max(0, Math.ceil(ms / 86400000)); $('tkLeft').textContent = '시즌 이벤트 · 남은 기간 ' + d + '일'; }
  $('tkDraw').disabled = tix < 1;
  [['tkBuy1', 0], ['tkBuy5', 1]].forEach(([id, i]) => { const e = $(id); e.querySelector('.p').textContent = TK_TIX[i][1]; e.disabled = leg < TK_TIX[i][1]; });
  const sk = $('tkSkins'); sk.textContent = '';
  for (const [id, p] of TK_SKINS) {
    const it = COSMETICS[id]; if (!it) continue; const own = skinOwned(id), card = document.createElement('div'); card.className = 'tkSk';
    const cv = document.createElement('canvas'); cv.width = cv.height = 160; try { const g = cv.getContext('2d'); g.translate(72, 148); g.scale(1.6, 1.6); drawStick(g, it.char, '#3fe0c5', .3, 0, 0, 0, { skin: id }); } catch (e) {}      // the whole turkey outfit (drawItemPreview's glow hid it)
    const nm = document.createElement('div'); nm.className = 'nm'; nm.textContent = HEROES[it.char].name + ' · ' + it.name; const sm = document.createElement('small'); sm.textContent = '시즌 한정'; nm.append(sm);
    const bt = document.createElement('button'); bt.type = 'button'; bt.className = 'tkBtn'; bt.id = 'tkSkin-' + id;
    if (own) { bt.textContent = '보유 중'; bt.disabled = true; } else { bt.innerHTML = '<i class="ic-leg"></i><b></b>'; bt.querySelector('b').textContent = p; bt.disabled = leg < p; bt.addEventListener('click', () => tkBuySkin(id, p)); }
    card.append(cv, nm, bt); sk.append(card);
  }
}
function tkBuyTix(i) { const [n, p] = TK_TIX[i]; if ((COS.tl | 0) < p) return; COS.tl -= p; COS.tt = (COS.tt | 0) + n; try { sfx(880, .15, 'triangle', .06); } catch (e) {} saveCos(); goldUi(); tkUi(); tkSay('뽑기권 ' + n + '장을 샀어요'); }
function tkBuySkin(id, p) { if (skinOwned(id) || (COS.tl | 0) < p) return; COS.tl -= p; COS.own.push(id); saveCos(); goldUi(); tkUi(); rewardFx({ kind: 'skin', skin: id, hero: COSMETICS[id].char }); }
function tkDraw() { if ((COS.tt | 0) < 1) return; COS.tt--; const got = tkDrawOne(); saveCos(); goldUi(); tkUi(); rewardFx(got); }
function tkSay(t) { const g = document.getElementById('tkGot'); if (g) g.textContent = t; }
function tkOpen() {
  showScreen('tkScreen'); tkSay('');
  const ball = document.getElementById('tkBall'); if (ball && !ball.firstChild) ball.append(turkeyIcon(80));
  const od = document.getElementById('tkOdds'); od.textContent = ''; const tot = TK_DRAW.reduce((a, l) => a + l[0], 0);
  for (const l of TK_DRAW) { const nm = document.createElement('span'), bar = document.createElement('span'), fill = document.createElement('i'), pc = document.createElement('b'), v = l[0] / tot * 100; nm.textContent = l[5] + ' ' + (l[2] === l[3] ? l[2] : l[2] + '~' + l[3]); bar.className = 'bar'; fill.style.width = v + '%'; fill.style.background = l[4]; bar.append(fill); pc.textContent = (Math.round(v * 10) / 10) + '%'; od.append(nm, bar, pc); }
  document.getElementById('tkNew').textContent = '새 시즌 캐릭터와 스킬은 곧 공개돼요. 시즌 뽑기에서 낮은 확률로 나오고, 시즌이 끝나면 크리스탈이나 코인으로 살 수 있어요.';
  document.getElementById('tkHow').innerHTML = '칠면조 다리는 <b>칠면조 잡기</b>에서 내가 잡은 칠면조 1마리마다 <b>1개</b> 받아요.';
  tkUi();
}
(function tkInit() {
  const tr = document.getElementById('topRight'); if (!tr || document.getElementById('seasonBtn')) return;
  const b = document.createElement('button'); b.id = 'seasonBtn'; b.type = 'button'; b.setAttribute('aria-label', 'The key of Turkey 시즌');
  b.append(turkeyIcon(40)); const t = document.createElement('span'); t.className = 'sT'; t.innerHTML = '<small>The key of Turkey</small><b><i class="ic-leg"></i><span class="tkN">0</span></b>'; b.append(t);
  const d = document.createElement('i'); d.id = 'seasonDot'; d.hidden = true; b.append(d);
  const g = document.getElementById('guild'); if (g && g.parentNode === tr) g.after(b); else tr.prepend(b);      // the guild button stays at the right end (user 2026-11-25)
  b.addEventListener('click', tkOpen);
  document.getElementById('tkBackBtn').addEventListener('click', () => showScreen('menuScreen'));
  document.getElementById('tkDraw').addEventListener('click', tkDraw);
  document.getElementById('tkBuy1').addEventListener('click', () => tkBuyTix(0));
  document.getElementById('tkBuy5').addEventListener('click', () => tkBuyTix(1));
  tkUi();
})();
