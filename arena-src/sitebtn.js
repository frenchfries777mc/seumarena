/* ---------- site button: a globe tile left of the news tile; opens the intro / tips / community site in a new window ---------- */
(function () {
  const URL_SITE = 'https://frenchfries777.com/seumarena/site/';
  const st = document.createElement('style');
  st.textContent = '#topRight #siteBtn{position:relative;box-sizing:border-box;display:flex;align-items:center;justify-content:center;width:56px;height:56px;margin:0;padding:0;cursor:pointer;border-radius:14px;border:2px solid #4a9dff;color:#cfe4ff;background:linear-gradient(180deg,#123056,#0a1a33);box-shadow:0 4px 0 #050d1a,0 0 12px rgba(74,157,255,.2);transition:transform .08s ease;text-decoration:none;pointer-events:auto}' +
    '#topRight #siteBtn:active{transform:translateY(2px)}#topRight #siteBtn svg{width:28px;height:28px;display:block}' +
    '@media (max-width:520px){#topRight #siteBtn{width:48px;height:48px;border-radius:12px}#topRight #siteBtn svg{width:24px;height:24px}}';
  document.head.append(st);
  const a = document.createElement('a');
  a.id = 'siteBtn'; a.href = URL_SITE; a.target = '_blank'; a.rel = 'noopener'; a.setAttribute('aria-label', '공식 사이트');
  a.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z"/></svg>';
  const place = () => { const tr = document.getElementById('topRight'), nb = document.getElementById('newsBtn'); if (!tr) return; if (nb && nb.parentNode) { const rev = getComputedStyle(nb.parentNode).flexDirection.includes('reverse'); nb.parentNode.insertBefore(a, rev ? nb.nextSibling : nb); } else tr.append(a); };
  place(); setTimeout(place, 0);
})();
