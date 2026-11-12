/* SeumArena community: the Frenchfries777 hub board (Supabase ff_posts / ff_comments / ff_likes) with game = 'seumarena'.
   Accounts, moderation, reports and blocking are the hub's, and the same posts also show in the hub community.
   The board's sub-category is the title prefix "[팁] ..." so no database change is needed. */
const BOARD_GAME = 'seumarena';
const CATS = [['all', '전체', '#eef1f6'], ['자유', '자유', '#8fc3ff'], ['팁', '팁', '#ffcc4d'], ['자랑', '자랑', '#3fe0c5'], ['버그', '버그 제보', '#ff8a98']];
const catOf = t => { const m = /^\[(자유|팁|자랑|버그)\]\s*/.exec(t || ''); return m ? m[1] : '자유'; };
const titleOf = t => String(t || '').replace(/^\[(자유|팁|자랑|버그)\]\s*/, '');
const catCol = c => (CATS.find(x => x[0] === c) || CATS[1])[2];
const catName = c => (CATS.find(x => x[0] === c) || CATS[1])[1];
const sbc = () => { try { return window.FFAuth && FFAuth.client && FFAuth.client(); } catch (e) { return null; } };
const whenReady = () => { const A = window.FFAuth; if (!A) return Promise.resolve(); try { return Promise.resolve(typeof A.ready === 'function' ? A.ready() : A.ready).catch(() => {}); } catch (e) { return Promise.resolve(); } };
const ago = iso => { const s = (Date.now() - Date.parse(iso)) / 1000; if (s < 60) return '방금'; if (s < 3600) return Math.floor(s / 60) + '분 전'; if (s < 86400) return Math.floor(s / 3600) + '시간 전'; if (s < 86400 * 7) return Math.floor(s / 86400) + '일 전'; return String(iso).slice(0, 10).replace(/-/g, '.'); };

async function namesOf(sb, ids) {
  const out = {}; ids = [...new Set(ids.filter(Boolean))]; if (!ids.length) return out;
  try { const r = await sb.from('profiles').select('id,username,display_name').in('id', ids); (r.data || []).forEach(p => { out[p.id] = (p.display_name && String(p.display_name).trim()) || p.username || '플레이어'; }); } catch (e) {}
  return out;
}
async function countsOf(sb, ids) {
  const c = {}, l = {}; if (!ids.length) return { c, l };
  try { const r = await sb.from('ff_comments').select('post_id').in('post_id', ids).limit(5000); (r.data || []).forEach(x => { c[x.post_id] = (c[x.post_id] || 0) + 1; }); } catch (e) {}
  try { const r = await sb.from('ff_likes').select('post_id').in('post_id', ids).limit(5000); (r.data || []).forEach(x => { l[x.post_id] = (l[x.post_id] || 0) + 1; }); } catch (e) {}
  return { c, l };
}
function rowHtml(p, names, cnt) {
  const c = catOf(p.title);
  return '<a class="row" href="community.html?p=' + encodeURIComponent(p.id) + '"><span class="t" style="color:' + catCol(c) + '">' + esc(catName(c)) + '</span>' +
    '<span class="m"><b>' + esc(titleOf(p.title)) + '</b><small>' + esc(names[p.user_id] || '플레이어') + ' · ' + esc(ago(p.created_at)) + '</small></span>' +
    '<span class="c">' + (cnt.l[p.id] ? '♥ ' + cnt.l[p.id] + ' ' : '') + (cnt.c[p.id] ? '댓글 ' + cnt.c[p.id] : '') + '</span></a>';
}

/* home page: the newest posts */
async function boardRecent(el, n) {
  await whenReady(); const sb = sbc();
  if (!sb) { el.innerHTML = '<div class="empty">게시판은 frenchfries777.com 에서 볼 수 있어요.</div>'; return; }
  const r = await sb.from('ff_posts').select('id,user_id,title,created_at').eq('game', BOARD_GAME).order('created_at', { ascending: false }).limit(n);
  if (r.error) { el.innerHTML = '<div class="empty">글을 불러오지 못했어요.</div>'; return; }
  const rows = r.data || []; if (!rows.length) { el.innerHTML = '<div class="empty">아직 글이 없어요. 첫 글을 써 주세요!</div>'; return; }
  const ids = rows.map(p => p.id), [names, cnt] = await Promise.all([namesOf(sb, rows.map(p => p.user_id)), countsOf(sb, ids)]);
  el.innerHTML = rows.map(p => rowHtml(p, names, cnt)).join('');
}

/* community page */
function boardPage() {
  const st = { cat: 'all', q: '', limit: 20, me: null };
  const pills = $('#cats'), list = $('#list'), more = $('#more'), view = $('#view'), write = $('#write'), side = $('#writeBtn');
  pills.innerHTML = CATS.map(c => '<button type="button" class="pill' + (c[0] === 'all' ? ' on' : '') + '" data-c="' + c[0] + '">' + c[1] + '</button>').join('');
  pills.onclick = e => { const b = e.target.closest('.pill'); if (!b) return; st.cat = b.dataset.c; st.limit = 20; pills.querySelectorAll('.pill').forEach(x => x.classList.toggle('on', x === b)); list_(); };
  let qt; $('#q').oninput = e => { clearTimeout(qt); qt = setTimeout(() => { st.q = e.target.value.trim(); st.limit = 20; list_(); }, 350); };
  $('#search').onsubmit = e => { e.preventDefault(); st.q = $('#q').value.trim(); list_(); };
  more.onclick = () => { st.limit += 20; list_(); };

  async function list_() {
    const sb = sbc(); if (!sb) { list.innerHTML = '<div class="empty">게시판은 frenchfries777.com 에서 볼 수 있어요.</div>'; more.hidden = true; return; }
    let q = sb.from('ff_posts').select('id,user_id,title,created_at').eq('game', BOARD_GAME).order('created_at', { ascending: false }).range(0, st.limit);
    if (st.cat !== 'all') q = st.cat === '자유' ? q.not('title', 'like', '[팁]%').not('title', 'like', '[자랑]%').not('title', 'like', '[버그]%') : q.like('title', '[' + st.cat + ']%');
    const w = st.q.replace(/[,()%*\\"]/g, ' ').trim(); if (w) q = q.or('title.ilike.*' + w + '*,body.ilike.*' + w + '*');
    const r = await q;
    if (r.error) { list.innerHTML = '<div class="empty">글을 불러오지 못했어요.</div>'; more.hidden = true; return; }
    let rows = r.data || []; more.hidden = rows.length <= st.limit; rows = rows.slice(0, st.limit);
    if (!rows.length) { list.innerHTML = '<div class="empty">' + (w ? '찾는 글이 없어요.' : '아직 글이 없어요. 첫 글을 써 주세요!') + '</div>'; return; }
    const [names, cnt] = await Promise.all([namesOf(sb, rows.map(p => p.user_id)), countsOf(sb, rows.map(p => p.id))]);
    list.innerHTML = rows.map(p => rowHtml(p, names, cnt)).join('');
  }

  async function open_(id) {
    const sb = sbc(); if (!sb) return;
    view.hidden = false; view.innerHTML = '<div class="empty">불러오는 중이에요.</div>';
    const r = await sb.from('ff_posts').select('id,user_id,title,body,images,created_at,edited_at,game').eq('id', id).maybeSingle();
    const p = r.data; if (!p || p.game !== BOARD_GAME) { view.innerHTML = '<div class="empty">글을 찾지 못했어요.</div>'; return; }
    const [cr, lr] = await Promise.all([sb.from('ff_comments').select('id,user_id,body,created_at').eq('post_id', id).order('created_at', { ascending: true }).limit(300), sb.from('ff_likes').select('user_id').eq('post_id', id).limit(5000)]);
    const cm = cr.data || [], likes = lr.data || [], names = await namesOf(sb, [p.user_id, ...cm.map(c => c.user_id)]);
    const me = st.me, liked = !!(me && likes.some(l => l.user_id === me.id)), c = catOf(p.title);
    const pics = (p.images || []).filter(u => /^https:\/\//.test(u));
    view.innerHTML = '<article class="post"><span style="color:' + catCol(c) + ';font-weight:700;font-size:14px">' + esc(catName(c)) + '</span><h2>' + esc(titleOf(p.title)) + '</h2>' +
      '<div class="meta">' + esc(names[p.user_id] || '플레이어') + ' · ' + esc(ago(p.created_at)) + (p.edited_at ? ' · 수정됨' : '') + '</div>' +
      (p.body && p.body.trim() ? '<div class="body">' + esc(p.body) + '</div>' : '') +
      (pics.length ? '<div class="pics">' + pics.map(u => '<a href="' + esc(u) + '" target="_blank" rel="noopener"><img src="' + esc(u) + '" alt="첨부 사진" loading="lazy"></a>').join('') + '</div>' : '') +
      '<div class="acts"><button type="button" id="like" class="' + (liked ? 'on' : '') + '" aria-pressed="' + liked + '">♥ ' + likes.length + '</button>' +
      (me && me.id === p.user_id ? '<button type="button" id="del">글 삭제</button>' : '') + '<button type="button" id="back">목록으로</button></div>' +
      '<h3 style="margin:8px 0 0;font-size:17px">댓글 ' + cm.length + '</h3><div class="cmts">' +
      cm.map(x => '<div><small>' + esc(names[x.user_id] || '플레이어') + ' · ' + esc(ago(x.created_at)) + '</small><p>' + esc(x.body) + '</p></div>').join('') + '</div>' +
      '<form class="cmt" id="cmt"><label class="sr" for="cb">댓글</label><textarea id="cb" maxlength="1000" placeholder="' + (me ? '댓글을 남겨 주세요' : '로그인하면 댓글을 쓸 수 있어요') + '"></textarea><button type="submit" class="slant">등록</button></form><p class="msg" id="pm"></p></article>';
    view.classList.add('card');
    $('#back').onclick = () => { history.pushState(null, '', 'community.html'); view.hidden = true; list_(); };
    $('#like').onclick = async () => {
      if (!st.me) return login();
      const q = liked ? sb.from('ff_likes').delete().eq('post_id', id).eq('user_id', st.me.id) : sb.from('ff_likes').insert({ post_id: id });
      const x = await q; if (x.error) $('#pm').textContent = '좋아요를 하지 못했어요.'; else open_(id);
    };
    const del = $('#del'); if (del) del.onclick = async () => {
      if (!del.dataset.s) { del.dataset.s = 1; del.textContent = '정말 삭제할까요?'; return; }
      const x = await sb.from('ff_posts').delete().eq('id', id); if (x.error) $('#pm').textContent = '삭제하지 못했어요.'; else $('#back').onclick();
    };
    $('#cmt').onsubmit = async e => {
      e.preventDefault(); if (!st.me) return login();
      const v = $('#cb').value.trim(); if (!v) return;
      const x = await sb.from('ff_comments').insert({ post_id: id, body: v }); if (x.error) $('#pm').textContent = '댓글을 올리지 못했어요.'; else open_(id);
    };
    view.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function login() { try { FFAuth.openLogin(); } catch (e) { location.href = 'https://frenchfries777.com/log-in/'; } }

  side.onclick = () => { if (!st.me) return login(); write.hidden = !write.hidden; if (!write.hidden) $('#wt').focus(); };
  write.onsubmit = async e => {
    e.preventDefault(); const sb = sbc(); if (!sb || !st.me) return login();
    const t = $('#wt').value.trim(), b = $('#wb').value.trim(), c = $('#wc').value, m = $('#wm');
    if (!t) { $('#wt').focus(); return; } if (!b) { $('#wb').focus(); return; }
    const x = await sb.from('ff_posts').insert({ game: BOARD_GAME, title: ('[' + c + '] ' + t).slice(0, 80), body: b }).select('id').maybeSingle();
    if (x.error) { m.textContent = '글을 올리지 못했어요. 잠시 뒤 다시 해 주세요.'; return; }
    write.reset(); write.hidden = true; m.textContent = ''; list_();
    if (x.data && x.data.id) { history.pushState(null, '', '?p=' + x.data.id); open_(x.data.id); }
  };
  addEventListener('popstate', route);
  function route() { const id = new URLSearchParams(location.search).get('p'); if (id) open_(id); else { view.hidden = true; } }

  whenReady().then(() => {
    siteAuth(u => { const was = st.me && st.me.id; st.me = u || null; if ((u && u.id) !== was) route(); });
    list_(); route();
  });
}
