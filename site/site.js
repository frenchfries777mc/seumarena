/* SeumArena site: shared header/footer, character data, countdown, news.
   The game's name lives only in SITE.name below (two parts: white + red), so renaming the game is a one-line change. */
const SITE = {
  name: ['Seum', 'Arena'],
  game: 'https://frenchfries777.com/seumarena/',
  launch: Date.UTC(2026, 10, 23, 10, 0, 0),          // 2026-11-23 19:00 KST
  news: '../news/news.json'
};
const $ = (s, r) => (r || document).querySelector(s);
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const NAME_HTML = esc(SITE.name[0]) + '<b>' + esc(SITE.name[1]) + '</b>';

const HEROES = [
  ['sword', '기사', '천검', ['돌진 베기', '강타', '칼 회전', '기사 수여', '처형']],
  ['wizard', '마법사', '마법진', ['충격파', '마력 압축', '마력 연사', '파동 쏘기', '마력 보호']],
  ['magiccard', '마술사', '탈출 마법', ['카드 일렬 발사', '비둘기 변신', '모자 던지기', '꽃 마술', '카드 날리기']],
  ['bow', '로빈 후드', '불화살', ['갈고리 화살', '화살비', '폭발 화살', '덫 화살']],
  ['shade', '네온', '네온 점멸', ['대검 돌진', '분노', '찌르기']],
  ['kadas', '카다스', '암흑 덩어리', ['연발', '악마의 날개', '블랙홀 친화', '암흑 구슬', '악마의 계약']],
  ['tionis', '티오니스', '분신 연극', ['말솜씨', '무대 조명']],
  ['harald', '하랄드', '도끼 돌진', ['분노', '방패 강타', '방패 올리기', '내려찍기']],
  ['pistol', '제임스', '강화탄', ['속사', '정확한 발사', '양손 권총', '자동 조준', '마지막 한 발']],
  ['rifle', '군인', '미사일 폭격', ['지뢰 설치', '수류탄 투척', '돌격', '지원', '방탄 방어막']],
  ['smg', '특수요원', '방벽', ['연막탄', '섬광탄', '전술 구르기']],
  ['shuriken', '닌자', '회심의 일격', ['그림자 이동', '수리검 부채', '부채꼴 표창', '연속 던지기', '담장 넘기']],
  ['grenade', '폭발광', '집속탄', ['폭발 점프', '폭격', '끈끈이 폭탄', '강력한 폭탄']],
  ['shotgun', '보안관', '삼연발', ['충격파', '올가미 줄', '집속 발사', '분노의 질주', '무법자']],
  ['portalgun', '차원여행자', '포탈 연결', ['포탈 파괴', '차원 도약', '반사 구체', '차원 균열', '차원 이탈']],
  ['gardener', '정원사', '숲 폭발', ['덤불 심기', '가시 넝쿨', '해바라기 포탑']]
].map(([id, name, ult, skills]) => ({ id, name, ult, skills, img: 'img/' + id + '.png' }));
/* heroes.js (made from the game by tools/gen-tips.js) has the current skills and guide; the list above is the fallback */
if (typeof HERO_DATA !== 'undefined') for (const h of HEROES) { const d = HERO_DATA.find(x => x.id === h.id); if (d) Object.assign(h, { ult: d.ult.name, skills: d.skills.map(s => s.name), data: d }); }

/* header + footer (one copy for every page) */
function siteChrome(page) {
  const nav = [['index.html', '소개', 'home'], ['index.html#chars', '캐릭터', 'chars'], ['tips.html', '팁', 'tips'], ['index.html#news', '소식', 'news'], ['community.html', '커뮤니티', 'community']];
  const h = document.createElement('header'); h.className = 'top';
  h.innerHTML = '<div class="wrap"><a class="brand" href="index.html">' + NAME_HTML + '</a><nav aria-label="사이트 메뉴">' +
    nav.map(n => '<a href="' + n[0] + '"' + (n[2] === page ? ' class="on" aria-current="page"' : '') + '>' + n[1] + '</a>').join('') +
    '</nav><span class="acct" id="acct"></span><a class="toGame" href="' + SITE.game + '">게임으로 돌아가기</a></div>';
  document.body.prepend(h);
  const f = document.createElement('footer'); f.className = 'foot';
  f.innerHTML = '<div class="wrap"><div><b style="color:#eef1f6;font-size:18px">' + NAME_HTML.replace('<b>', '<b style="color:#ff5266">') + '</b><br>Frenchfries777이 만든 Stickseum의 캐릭터들이 나오는 게임이에요.</div>' +
    '<nav aria-label="바깥 링크"><a href="' + SITE.game + '">게임</a><a href="https://frenchfries777.com/">Frenchfries777 허브</a><a href="https://frenchfries777.com/community/">허브 커뮤니티</a></nav>' +
    '<p class="cr">음악: "Just Nasty", "Pixelland" Kevin MacLeod (incompetech.com) · CC BY 4.0</p></div>';
  document.body.append(f);
  document.querySelectorAll('[data-name]').forEach(e => { e.innerHTML = NAME_HTML; });
  document.title = document.title.replace('SeumArena', SITE.name.join(''));
}

/* 게임으로 돌아가기: when this tab was opened from the game, close it and go back to the game tab instead of loading a second game */
document.addEventListener('click', e => {
  const a = e.target.closest && e.target.closest('a[href="' + SITE.game + '"]');
  if (!a || e.ctrlKey || e.metaKey || e.shiftKey) return;
  let op = null; try { op = window.opener; } catch (er) {}
  if (!op || op.closed) return;
  e.preventDefault();
  try { op.focus(); } catch (er) {}
  window.close();
  setTimeout(() => { location.href = SITE.game; }, 300);
});

/* login state in the header (FFAuth from frenchfries777.com; missing = guest, the site still works) */
function siteAuth(onChange) {
  const box = $('#acct'); if (!box) return;
  const paint = () => {
    const A = window.FFAuth, u = A && A.user && A.user();
    box.innerHTML = '';
    if (!A) return;
    if (u) { const n = document.createElement('span'); n.textContent = (A.nickname && A.nickname()) || '로그인됨'; box.append(n); }
    else { const b = document.createElement('button'); b.type = 'button'; b.textContent = '로그인'; b.onclick = () => A.openLogin && A.openLogin(); box.append(b); }
    if (onChange) onChange(u);
  };
  const A = window.FFAuth;
  if (!A) { if (onChange) onChange(null); return; }
  try { Promise.resolve(typeof A.ready === 'function' ? A.ready() : A.ready).then(paint, paint); } catch (e) { paint(); }
  try { A.onNick && A.onNick(paint); } catch (e) {}
  try { const c = A.client && A.client(); c && c.auth && c.auth.onAuthStateChange(() => setTimeout(paint, 0)); } catch (e) {}
}

function countdown(el) {
  if (!el) return;
  const pad = n => String(n).padStart(2, '0');
  const tick = () => {
    const s = Math.max(0, Math.floor((SITE.launch - Date.now()) / 1000));
    if (!s) { el.closest('.cd').querySelector('p').textContent = '지금 플레이할 수 있어요'; }
    const v = [Math.floor(s / 86400), pad(Math.floor(s % 86400 / 3600)), pad(Math.floor(s % 3600 / 60)), pad(s % 60)];
    el.querySelectorAll('b').forEach((b, i) => { b.textContent = v[i]; });
  };
  tick(); setInterval(tick, 1000);
}

/* character dex: a big card + a grid of 16 buttons. linkTips adds a "공략 보기" link. */
function heroDex(root, opts) {
  opts = opts || {};
  const big = root.querySelector('.big'), grid = root.querySelector('.grid16');
  grid.innerHTML = HEROES.map(h => '<button type="button" class="hb" data-id="' + h.id + '" aria-pressed="false"><img src="' + h.img + '" alt="" loading="lazy" width="474" height="360"><span>' + esc(h.name) + '</span></button>').join('');
  const pick = id => {
    const h = HEROES.find(x => x.id === id) || HEROES[0];
    grid.querySelectorAll('.hb').forEach(b => { const on = b.dataset.id === h.id; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
    big.innerHTML = '<img src="' + h.img + '" alt="' + esc(h.name) + '" width="474" height="360"><h3>' + esc(h.name) + '</h3><p class="ult">궁극기 · ' + esc(h.ult) + '</p>' +
      '<div class="tags">' + h.skills.map(s => '<span>' + esc(s) + '</span>').join('') + '</div>' + (opts.extra ? opts.extra(h) : '');
    if (opts.onPick) opts.onPick(h);
  };
  grid.addEventListener('click', e => { const b = e.target.closest('.hb'); if (b) pick(b.dataset.id); });
  pick(opts.first || 'sword');
}

/* news: the same news/news.json the game lobby reads */
const NEWS_KIND = { '공지': '#9fc6ff', '업데이트': '#3fe0c5', '이벤트': '#ffd34d', '점검': '#ff8a8a' };
async function loadNews() {
  try {
    const r = await fetch(SITE.news, { cache: 'no-cache' }); const d = await r.json();
    const list = (Array.isArray(d) ? d : d.news || []), now = Date.now();
    return list.filter(n => (!n.start || Date.parse(n.start) <= now) && (!n.end || Date.parse(n.end) > now))
      .sort((a, b) => (b.pin ? 1 : 0) - (a.pin ? 1 : 0) || String(b.date).localeCompare(String(a.date)));
  } catch (e) { return null; }
}
function newsHtml(n, full) {
  return '<article class="card news"><div class="k"><span style="background:' + (NEWS_KIND[n.kind] || '#c3c9d5') + '">' + esc(n.kind || '공지') + '</span><time>' + esc(String(n.date || '').replace(/-/g, '.')) + '</time></div>' +
    '<h3>' + esc(n.title) + '</h3>' + (full && n.body ? '<p>' + esc(n.body) + '</p>' : '') +
    (full && n.link && /^https:\/\//.test(n.link.url || '') ? '<a href="' + esc(n.link.url) + '" target="_blank" rel="noopener">' + esc(n.link.label || '자세히') + '</a>' : '') + '</article>';
}
