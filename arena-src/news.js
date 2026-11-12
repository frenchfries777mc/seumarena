/* ---------- news: notices the developer writes, read by every player ----------
   The list lives in the Supabase table seumarena_news: everyone may read it, only the lead developer (ff_devs role 'owner')
   may write it, with news/admin.html. The copy in news/news.json at build time is baked in below, and the last list read
   is kept in localStorage, so news still shows offline (and in the claude.ai preview, where Supabase cannot be reached).
   An item: { id, kind: 공지|업데이트|이벤트|점검, date: 'YYYY-MM-DD', title, body, image?, link?: {label, url},
   popup? (false = no pop-up on launch), pin? (kept on top), start?/end? (ISO time: shown only between them),
   poll?: {o: [2-6 options], close?: ISO time} (the title is the question; signed-in players vote once, see newsPoll*) }.
   Players see a newspaper tile in the lobby's top right with a red dot while something is unread; unread news that
   asks for it opens once by itself when the lobby is first shown. */
const NEWS_BUILT = /*@@NEWS@@*/null;
const NEWS_SB = 'https://kebsbuvuutilitwlvxzv.supabase.co', NEWS_ADMIN = 'https://frenchfries777.com/seumarena/news/admin.html';
const NEWS_URL = NEWS_SB + '/rest/v1/seumarena_news?select=*&order=pin.desc,date.desc,created_at.desc';
const NEWS_KIND = { '공지': '#4d9dff', '업데이트': '#3fe0c5', '이벤트': '#ffd34d', '점검': '#ff5d5d' };
const NEWS_SEEN_KEY = 'seumArenaNewsSeen', NEWS_CACHE_KEY = 'seumArenaNewsCache';
let newsData = null, newsAsked = false, newsPopped = false, newsT0 = Date.now();
function newsLoad(k, d) { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } }
function newsSave(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
function newsOk(d) { return d && Array.isArray(d.news) ? d : null; }
/* of the baked-in list and the last one read, the newer one (by its "updated" stamp) shows until the fresh one arrives */
{
  const b = newsOk(NEWS_BUILT), c = newsOk(newsLoad(NEWS_CACHE_KEY, null));
  newsData = b && c ? (String(c.updated || '') >= String(b.updated || '') ? c : b) : (c || b);
}
function newsLive() {
  const now = Date.now(), t = s => { const v = Date.parse(s); return isNaN(v) ? null : v; };
  return (newsData ? newsData.news : []).filter(n => n && n.id && n.title && !(n.start && t(n.start) > now) && !(n.end && t(n.end) <= now))
    .sort((a, b) => (!!b.pin - !!a.pin) || String(b.date || '').localeCompare(String(a.date || '')));
}
function newsSeen() { const s = newsLoad(NEWS_SEEN_KEY, []); return Array.isArray(s) ? s : []; }
function newsUnread() { const s = newsSeen(); return newsLive().filter(n => !s.includes(n.id)); }
function newsMarkSeen() { const s = newsSeen(); for (const n of newsLive()) if (!s.includes(n.id)) s.push(n.id); newsSave(NEWS_SEEN_KEY, s.slice(-300)); }
function newsEsc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]); }
function newsUrl(u, img) { u = String(u || '').trim(); return /^https:\/\//i.test(u) || (img && /^data:image\//i.test(u)) ? u : ''; }
function newsDate(d) { const m = /^(\d{4})-(\d\d)-(\d\d)/.exec(d || ''); return m ? m[1] + '.' + m[2] + '.' + m[3] : ''; }
function newsItemHtml(n, unread) {
  const c = NEWS_KIND[n.kind] || 'var(--gold)', img = newsUrl(n.image, true), lk = n.link && newsUrl(n.link.url);
  return '<article class="nwItem" style="--c:' + c + '">' + (img ? '<img src="' + newsEsc(img) + '" alt="" loading="lazy" decoding="async">' : '') +
    '<div class="nwBody"><div class="nwMeta">' + (n.kind ? '<span class="nwTag">' + newsEsc(n.kind) + '</span>' : '') + (n.pin ? '<svg class="nwPin" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 3h6l-1 6 4 4H6l4-4z M12 13v8" fill="currentColor" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>' : '') +
    '<span>' + newsDate(n.date) + '</span>' + (unread ? '<i class="nwNew" aria-label="새 소식"></i>' : '') + '</div>' +
    '<h3>' + newsEsc(n.title) + '</h3>' + (n.body ? '<p>' + newsEsc(n.body) + '</p>' : '') +
    (n.poll && Array.isArray(n.poll.o) ? '<div class="nwPoll" data-id="' + newsEsc(n.id) + '">' + n.poll.o.map((o, i) => '<button type="button" class="nwOpt" data-i="' + i + '"><i></i><span>' + newsEsc(o) + '</span><b></b></button>').join('') + '<small class="nwVotes"></small></div>' : '') +
    (lk ? '<a class="btn-primary nwLink" href="' + newsEsc(lk) + '" target="_blank" rel="noopener">' + newsEsc(n.link.label || '열기') + '</a>' : '') + '</div></article>';
}
const NEWS_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 5.5h13v13a2 2 0 0 0 2 2h-13a2 2 0 0 1-2-2z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M16.5 9h4v9.5a2 2 0 0 1-4 0" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M6.5 9h7v4h-7z" fill="currentColor"/><path d="M6.5 15.5h7M6.5 18h5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
const NEWS_CSS = `
#topRight #newsBtn{position:relative;box-sizing:border-box;display:flex;align-items:center;justify-content:center;width:56px;height:56px;margin:0;padding:0;cursor:pointer;border-radius:14px;border:2px solid #e0a53c;color:#ffdc8c;background:linear-gradient(180deg,#46310f,#271a06);box-shadow:0 4px 0 #160e03,0 0 12px rgba(255,180,60,.18);transition:transform .08s ease}
#topRight #newsBtn:active{transform:translateY(2px)}
#topRight #newsBtn svg{width:30px;height:30px;display:block;filter:drop-shadow(0 0 4px rgba(255,190,80,.35))}
#newsBtn[hidden]{display:none!important}
#newsDot{position:absolute;top:-6px;right:-6px;width:15px;height:15px;border-radius:50%;background:var(--red);border:2px solid #14161c}
#newsDot[hidden]{display:none}
@media (max-width:520px){ #topRight #newsBtn{width:48px;height:48px;border-radius:12px} #topRight #newsBtn svg{width:25px;height:25px} }
@media (max-height:560px){ #topRight #newsBtn{width:46px;height:44px;border-radius:12px;box-shadow:0 3px 0 #160e03} #topRight #newsBtn svg{width:24px;height:24px} }
#newsWin{position:fixed;inset:0;z-index:31;display:flex;align-items:center;justify-content:center;background:rgba(6,8,12,.7);-webkit-backdrop-filter:blur(3px);backdrop-filter:blur(3px);
  padding:calc(env(safe-area-inset-top,0px) + 14px) max(16px, env(safe-area-inset-right, 0px)) calc(env(safe-area-inset-bottom,0px) + 14px) max(16px, env(safe-area-inset-left, 0px));box-sizing:border-box}
#newsWin[hidden]{display:none}
.nwCard{width:min(680px,100%);max-height:100%;display:flex;flex-direction:column;background:var(--panel);border:1px solid var(--line);border-top:3px solid #e0a53c;border-radius:14px;box-shadow:0 20px 60px rgba(0,0,0,.55);overflow:hidden;animation:nwIn .2s ease-out}
@keyframes nwIn{from{opacity:0;transform:translateY(14px) scale(.98)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion: reduce){.nwCard{animation:none}}
.nwHead{display:flex;align-items:center;gap:10px;padding:10px 12px 10px 18px;border-bottom:1px solid var(--line);background:linear-gradient(180deg,#221c10,var(--panel))}
.nwHead svg{width:28px;height:28px;flex:none;color:#ffcf6a}
.nwHead h2{flex:1;margin:0;font:400 25px 'Black Han Sans','IBM Plex Sans KR',sans-serif;letter-spacing:.05em;color:#ffe3a0;text-shadow:0 2px 0 rgba(0,0,0,.45);transform:skewX(-8deg)}
.nwX{flex:none;width:42px;height:42px;border-radius:10px;border:1px solid var(--line);background:var(--panel-2);color:var(--text);font-size:24px;line-height:1;cursor:pointer;display:grid;place-items:center}
.nwX:hover,.nwEd:hover{background:var(--line)}
.nwEd{flex:none;width:42px;height:42px;border-radius:10px;border:1px solid #6b5a1e;background:var(--panel-2);color:#ffcf6a;display:grid;place-items:center}
.nwEd[hidden]{display:none}
.nwEd svg{width:22px;height:22px}
.nwList{overflow-y:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;padding:14px;display:flex;flex-direction:column;gap:12px}
.nwItem{flex:none;background:var(--panel-2);border:1px solid var(--line);border-left:4px solid var(--c);border-radius:12px;overflow:hidden}
.nwItem img{display:block;width:100%;height:auto;max-height:260px;object-fit:cover;background:#0b0d12}
.nwBody{padding:12px 16px 14px}
.nwMeta{display:flex;align-items:center;gap:8px;font:600 13px 'IBM Plex Sans KR',sans-serif;color:var(--text-dim);font-variant-numeric:tabular-nums}
.nwTag{color:#0c0e13;background:var(--c);border-radius:999px;padding:1px 10px;font-weight:800;font-size:12.5px;line-height:1.6}
.nwPin{width:15px;height:15px;color:var(--c)}
.nwNew{width:10px;height:10px;border-radius:50%;background:var(--red);margin-left:auto;box-shadow:0 0 0 3px rgba(255,93,93,.18)}
.nwItem h3{margin:7px 0 4px;font:700 19px/1.4 'IBM Plex Sans KR',sans-serif;color:var(--text);word-break:keep-all;overflow-wrap:anywhere}
.nwItem p{margin:0;font:400 15px/1.65 'IBM Plex Sans KR',sans-serif;color:#cdd2dc;white-space:pre-line;word-break:keep-all;overflow-wrap:anywhere}
.nwPoll{display:flex;flex-direction:column;gap:7px;margin-top:12px}
.nwOpt{position:relative;overflow:hidden;display:flex;align-items:center;gap:10px;min-height:44px;padding:8px 14px;border-radius:10px;border:1.5px solid var(--line);background:#11141b;color:var(--text);font:600 15px/1.35 'IBM Plex Sans KR',sans-serif;text-align:left;cursor:pointer;transition:border-color .12s,transform .08s}
.nwOpt:hover{border-color:var(--c)} .nwOpt:active{transform:scale(.99)}
.nwOpt i{position:absolute;left:0;top:0;bottom:0;width:0;background:var(--c);opacity:.2;transition:width .6s cubic-bezier(.2,.8,.2,1)}
.nwOpt span{position:relative;flex:1;min-width:0;overflow-wrap:anywhere}
.nwOpt b{position:relative;display:none;font-variant-numeric:tabular-nums;font-weight:800;color:var(--text-dim)}
.nwPoll.show .nwOpt{cursor:default} .nwPoll.show .nwOpt:hover{border-color:var(--line)} .nwPoll.show .nwOpt:active{transform:none} .nwPoll.show .nwOpt b{display:block}
.nwPoll.show .nwOpt.mine{border-color:var(--c)} .nwPoll.show .nwOpt.mine i{opacity:.34} .nwPoll.show .nwOpt.mine b{color:var(--text)}
.nwOpt.mine span::after{content:'';display:inline-block;width:11px;height:6px;margin-left:8px;border-left:2.5px solid var(--c);border-bottom:2.5px solid var(--c);transform:rotate(-45deg) translateY(-3px)}
.nwPoll.busy{opacity:.6;pointer-events:none}
.nwVotes{align-self:flex-end;font:600 12.5px 'IBM Plex Sans KR',sans-serif;color:var(--text-dim);font-variant-numeric:tabular-nums}
.nwVotes:empty{display:none}
.nwLink{display:inline-block;margin-top:12px;padding:9px 28px;font-size:16px;text-decoration:none}
@media (max-height:560px){ .nwHead{padding:6px 10px 6px 14px} .nwHead h2{font-size:21px} .nwX{width:38px;height:38px} .nwList{padding:10px;gap:10px} .nwItem img{max-height:150px} .nwBody{padding:10px 14px 12px} .nwItem h3{font-size:17px} .nwItem p{font-size:14px} }
`;
const newsBtn = document.createElement('button'), newsWin = document.createElement('div');
if (!DED) {
  const st = document.createElement('style'); st.textContent = NEWS_CSS; document.head.appendChild(st);
  newsBtn.id = 'newsBtn'; newsBtn.type = 'button'; newsBtn.setAttribute('aria-label', '뉴스'); newsBtn.innerHTML = NEWS_ICON + '<i id="newsDot" hidden></i>';
  const tr = document.getElementById('topRight'), q = document.getElementById('quest');
  if (tr) { if (q && q.parentNode === tr) q.after(newsBtn); else tr.appendChild(newsBtn); }
  newsWin.id = 'newsWin'; newsWin.hidden = true;
  newsWin.innerHTML = '<div class="nwCard" role="dialog" aria-modal="true" aria-labelledby="nwTitle"><div class="nwHead">' + NEWS_ICON + '<h2 id="nwTitle">뉴스</h2><a class="nwEd" href="' + NEWS_ADMIN + '" target="_blank" rel="noopener" aria-label="뉴스 쓰기" hidden><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16z M14 6l4 4" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg></a><button class="nwX" type="button" aria-label="닫기">&times;</button></div><div class="nwList"></div></div>';
  document.body.appendChild(newsWin);
  newsBtn.addEventListener('click', () => newsOpen(true));
  newsWin.querySelector('.nwX').addEventListener('click', () => newsOpen(false));
  newsWin.addEventListener('pointerdown', e => { e.stopPropagation(); if (e.target === newsWin) newsOpen(false); });
  addEventListener('keydown', e => { if (newsWin.hidden) return; if (e.code === 'Escape') newsOpen(false); e.stopPropagation(); }, true);   // the game does not see keys while the window is open
  newsWin.addEventListener('error', e => { if (e.target.tagName === 'IMG') e.target.remove(); }, true);   // a picture that cannot load (offline) is left out
  newsPaint();
  newsFetch();
  setInterval(newsTick, 400);
}
function newsPaint() { const live = newsLive(); newsBtn.hidden = !live.length; const d = document.getElementById('newsDot'); if (d) d.hidden = !newsUnread().length; }
function newsOpen(on) {
  if (on) {
    const s = newsSeen(); newsWin.querySelector('.nwList').innerHTML = newsLive().map(n => newsItemHtml(n, !s.includes(n.id))).join('');
    newsWin.hidden = false; newsWin.querySelector('.nwList').scrollTop = 0; newsOwnerCheck(); newsPollLoad();
  } else if (!newsWin.hidden) { newsWin.hidden = true; newsMarkSeen(); newsPaint(); }
}
/* a table row -> the item shape used here (and in news/news.json) */
function newsFromRows(rows) {
  if (!Array.isArray(rows)) return null;
  const news = rows.map(r => {
    const n = { id: r.id, kind: r.kind, date: r.date, title: r.title };
    if (r.body) n.body = r.body; if (r.image) n.image = r.image; if (r.link_url) n.link = { label: r.link_label || '', url: r.link_url };
    if (r.popup === false) n.popup = false; if (r.pin) n.pin = true; if (r.start_at) n.start = r.start_at; if (r.end_at) n.end = r.end_at;
    if (Array.isArray(r.poll_options)) { n.poll = { o: r.poll_options.map(String) }; if (r.poll_close_at) n.poll.close = r.poll_close_at; }
    return n;
  });
  return { v: 1, updated: rows.reduce((m, r) => String(r.updated_at || '') > m ? String(r.updated_at) : m, ''), news };
}
function newsFetch() {
  if (newsAsked) return; newsAsked = true;
  let ctl = null; try { ctl = new AbortController(); setTimeout(() => ctl.abort(), 8000); } catch (e) {}
  fetch(NEWS_URL, { cache: 'no-store', headers: { apikey: ACH_KEY }, signal: ctl ? ctl.signal : undefined })
    .then(r => r.ok ? r.json() : null).then(rows => { const d = newsFromRows(rows); if (!d) return; newsData = d; newsSave(NEWS_CACHE_KEY, d); newsPaint(); })
    .catch(() => {}).then(() => { newsAsked = 'done'; });
}
/* the lead developer (signed in) gets a pencil in the window's head that opens the writing page */
let newsOwner = null;
function newsOwnerCheck() {
  const ed = newsWin.querySelector('.nwEd'), A = window.FFAuth, u = A && A.user && A.user(), sb = A && A.client && A.client();
  if (!u || !sb) { ed.hidden = true; return; }
  if (newsOwner && newsOwner.uid === u.id) { ed.hidden = !newsOwner.ok; return; }
  newsOwner = { uid: u.id, ok: false };
  try { sb.from('ff_devs').select('role').eq('user_id', u.id).maybeSingle().then(r => { const ok = !!(r && r.data && r.data.role === 'owner'); if (newsOwner && newsOwner.uid === u.id) newsOwner.ok = ok; ed.hidden = !ok; }, () => {}); } catch (e) {}
}
/* polls: counts come from seumarena_poll_counts (public), a vote goes through seumarena_poll_vote (signed in, once).
   The options stay plain buttons until the player has voted or the poll is closed; then they turn into result bars. */
function newsSbCall(fn, args) {
  const A = window.FFAuth, sb = A && A.client && A.client();
  if (sb && sb.rpc) return sb.rpc(fn, args).then(r => { if (r.error) throw r.error; return r.data; });
  return fetch(NEWS_SB + '/rest/v1/rpc/' + fn, { method: 'POST', headers: { 'Content-Type': 'application/json', apikey: ACH_KEY }, body: JSON.stringify(args) }).then(r => { if (!r.ok) throw new Error(r.status); return r.json(); });
}
function newsPollPaint(el, rows) {
  const n = newsLive().find(x => x.id === el.dataset.id); if (!n || !n.poll) return;
  const cnt = n.poll.o.map(() => 0); let mine = -1;
  for (const r of rows || []) if (r.news_id === n.id && r.choice >= 0 && r.choice < cnt.length) { cnt[r.choice] = +r.n || 0; if (r.mine) mine = r.choice; }
  const tot = cnt.reduce((a, b) => a + b, 0), closed = !!(n.poll.close && Date.parse(n.poll.close) <= Date.now()), show = mine >= 0 || closed;
  el.classList.toggle('show', show); el.classList.remove('busy');
  el.querySelectorAll('.nwOpt').forEach((b, i) => {
    const pc = tot ? Math.round(cnt[i] / tot * 100) : 0;
    b.classList.toggle('mine', i === mine); b.querySelector('b').textContent = pc + '%';
    b.querySelector('i').style.width = show ? pc + '%' : '0';
  });
  el.querySelector('.nwVotes').textContent = show ? tot + '표' : '';
}
function newsPollLoad() {
  const els = [...newsWin.querySelectorAll('.nwPoll')]; if (!els.length) return;
  newsSbCall('seumarena_poll_counts', { p_ids: els.map(e => e.dataset.id) }).then(rows => els.forEach(e => newsPollPaint(e, rows)), () => {});
}
if (!DED) newsWin.addEventListener('click', e => {
  const b = e.target.closest && e.target.closest('.nwOpt'), el = b && b.closest('.nwPoll'); if (!el || el.classList.contains('show')) return;
  const A = window.FFAuth, u = A && A.user && A.user();
  if (!u) { try { if (A && A.openLogin) A.openLogin(); } catch (err) {} return; }
  el.classList.add('busy');
  newsSbCall('seumarena_poll_vote', { p_news: el.dataset.id, p_choice: +b.dataset.i }).then(() => newsPollLoad(), () => el.classList.remove('busy'));
});
/* the one pop-up: once the intro is gone and the plain lobby menu is up (nothing else open), after the fresh list came or 4 s passed */
function newsTick() {
  if (newsPopped || DED) return;
  if (newsAsked !== 'done' && Date.now() - newsT0 < 4000) return;
  const lob = document.getElementById('lobby'), menu = document.getElementById('menuScreen'), set = document.getElementById('settings');
  if (document.hidden || document.getElementById('introCv') || !lob || lob.hidden || !menu || !menu.classList.contains('active') || (set && !set.hidden)) return;
  newsPopped = true;
  if (newsUnread().some(n => n.popup !== false)) newsOpen(true);
}
