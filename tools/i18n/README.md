# Languages (한국어, English, Français, Español, 日本語, 中文)

The texts in the sources stay Korean. `arena-src/i18n.js` turns them into the chosen language where they reach the screen
(page text, canvas text, alert/confirm/prompt). The table is `arena-src/i18n/dict.json`:

```json
"한국어 문구": ["English", "Français", "Español", "日本語", "中文"]
```

## Before every PR (\1)

1. `node tools/i18n/check.js` : lists every Korean text in the game and site sources that has no line yet, and fails until all have one.
2. Add the missing lines to `arena-src/i18n/dict.json` (all five languages), using the glossary below.
3. `node arena-src/build.js` (the table is built into the game), `node tools/i18n/build-site.js` (the site's `i18n.js`), then the usual rebuild of `index.html` and `seumarena.html`.
4. Look at the changed screens in at least English and one of 日本語/中文.

## How a line is matched

- Numbers in a text are `#` in the key: `'3초 동안 기절'` is the key `"#초 동안 기절"`.
- A text on screen is cut from left to right into the longest keys that fit. So a text glued together in code
  (`n + '판 · ' + k + '킬'`) is translated piece by piece. When the pieces read badly in another word order,
  add one more line for the whole joined text with `#` where the numbers are (`"#승 / #판"`).
- In a translation, `#` is the number at the same place as in the Korean; `{0}`, `{1}` … name a number by its place (from 0) when the order changes.
- A translation starting with `^` is glued to what comes before it (no space is added): `"초": "^s"` gives `5s`. `^` alone gives nothing.
- For English, French and Spanish a space is put between a number or word and a translation that starts with a letter.

## Text that must stay as typed

Names and messages people type (nicknames, chat, guild names, board posts, news) are not translated:
put `data-noi18n` on the element, or call `I18N.keep(text)` for text drawn on a canvas.

## Glossary

궁극기 Ultimate / Ultime / Definitiva / 必殺技 / 大招 · 스킬 Skill / Compétence / Habilidad / スキル / 技能 · 대쉬 Dash / Ruée / Embestida / ダッシュ / 冲刺 ·
피해 damage / dégâts / daño / ダメージ / 伤害 · 기절 stun / étourdissement / aturdimiento / スタン / 眩晕 · 속박 rooted / immobilisé / inmovilizado / 拘束 / 束缚 ·
둔화 slow / ralenti / lentitud / 鈍化 / 减速 · 칸 tiles / cases / casillas / マス / 格 · 덤불·풀숲 bush / buisson / arbusto / 茂み / 草丛 ·
체력 HP / PV / PS / 体力 / 生命 · 쿨타임 cooldown / recharge / recarga / クールタイム / 冷却 · 길드 Guild / Guilde / Gremio / ギルド / 公会 ·
상대·적 enemies / adversaires / rivales / 相手 / 对手 · 아군 allies / alliés / aliados / 味方 / 队友 · 킬 kills / éliminations / bajas / キル / 击杀 ·
판 matches / parties / partidas / 戦 / 场 · 일반 공격 basic attack / attaque de base / ataque básico / 通常攻撃 / 普通攻击.
Mode names stay English in French and Spanish (Team Out, One Left, Two Left, Ball Battle, Last Team).

`merge.js`, `_keys.json` and `tr/` are what the first table was made from (2026-11-23); they are not needed again.
