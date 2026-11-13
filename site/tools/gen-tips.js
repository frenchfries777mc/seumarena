/* Writes site/heroes.js (every playable character: hp, basic attack, passive, ultimate, all skills, guide text) from the game itself.
   Run after any character change:  node site/tools/gen-tips.js   (needs Node + Playwright; builds arena-src into a temp file and reads it)
   The guide text is in tools/tips-text.js. Characters missing there get only the game data; unknown combo skill names are reported. */
const fs = require('fs'), path = require('path'), os = require('os'), { execFileSync } = require('child_process');
const ROOT = path.join(__dirname, '..', '..'), SRC = process.env.ARENA_SRC || path.join(ROOT, 'arena-src');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'satips-'));
execFileSync('node', [path.join(SRC, 'build.js')], { env: Object.assign({}, process.env, { OUT: path.join(tmp, 'g.html') }), stdio: 'ignore' });
const page = path.join(tmp, 'g.html');
const TEXT = require('./tips-text.js'), G = fs.readFileSync(page, 'utf8');
const NUM = re => { const m = G.match(re); return m ? +m[1] : null; }, SXV = NUM(/const STAT_X = (\d+)/) || 1, TV = NUM(/const T = (\d+)/) || 64;
(async () => {
  const { chromium } = require('playwright');
  const b = await chromium.launch(); const p = await b.newPage();
  await p.goto('file://' + page); await p.waitForFunction(() => window.__arena && window.__arena.ROSTER.length, null, { timeout: 30000 });
  const data = await p.evaluate(([SX, TL]) => {
    const A = window.__arena;
    const nm = s => typeof s.name === 'function' ? s.name({ st: {}, buffs: {} }) : s.name;
    return A.ROSTER.map(id => { const h = A.HEROES[id];
      return { id, name: h.name, hp: Math.round(h.hp), melee: h.type === 'melee', range: Math.round((h.range || 0) / TL * 10) / 10,
        dmg: Math.round(h.dmg * SX * (h.xm || 1) * (h.count || 1) * (h.burst || 1)), cd: Math.round(h.cd * 100) / 100,
        passive: h.p ? { name: h.p[0], d: h.p[1] } : null, ult: { name: h.ult.name, d: h.ult.d },
        skills: h.skills.map(s => ({ name: nm(s), d: s.d })) }; });
  }, [SXV, TV]);
  await b.close();
  const warn = [];
  for (const h of data) {
    const t = TEXT[h.id]; if (!t) { warn.push(h.id + ': 공략 글 없음'); continue; }
    h.role = t.role; h.play = t.play; h.vs = t.vs;
    if (t.combo && t.combo.every(n => h.skills.some(s => s.name === n))) { h.combo = t.combo; h.why = t.why; }
    else if (t.combo) warn.push(h.id + ': 추천 조합 스킬 이름이 게임에 없음 (' + t.combo.join(', ') + ')');
  }
  const out = '/* made by tools/gen-tips.js from the game (' + new Date().toISOString().slice(0, 10) + '). Do not edit by hand: change the game or tools/tips-text.js and run it again. */\n'
    + 'const HERO_DATA = ' + JSON.stringify(data, null, 1) + ';\n';
  fs.writeFileSync(path.join(__dirname, '..', 'heroes.js'), out);
  fs.rmSync(tmp, { recursive: true, force: true });
  console.log('heroes.js:', data.length, 'characters'); for (const w of warn) console.log('  !', w);
})().catch(e => { console.error(e); process.exit(1); });
