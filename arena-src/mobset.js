/* ---------- settings: 배터리 절약, touch button size and place (kept in seumArenaSet: bat, bsz, bpos) ---------- */
const BPOS_IDS = ['dashBtn', 'sk1Btn', 'sk2Btn', 'ultBtn'];
function mobSetApply() {
  const on = document.body.classList.contains('touchUi');
  for (const id of BPOS_IDS) {
    const b = $(id), p = (SET.bpos || {})[id];
    b.style.scale = on && SET.bsz !== 100 ? String(SET.bsz / 100) : '';
    b.style.translate = on && p ? Math.round(p[0]) + 'px ' + Math.round(p[1]) + 'px' : '';
  }
}
function mobSetFill() {
  $('setBat').checked = !!SET.bat;
  $('setBsz').value = SET.bsz; $('setBszV').textContent = SET.bsz + '%';
  const touch = touchMode || navigator.maxTouchPoints > 0 || matchMedia('(pointer:coarse)').matches;
  for (const r of document.querySelectorAll('#settings .mobOnly')) r.hidden = !touch;
}
function batApply() { if (mobileMode()) { RSCALE = SET.bat ? RS_STEPS[RS_STEPS.length - 1] : RS_STEPS[0]; resize(); } }
$('setBat').addEventListener('change', e => { SET.bat = e.target.checked; saveSet(); batApply(); });
$('setBsz').addEventListener('input', e => { SET.bsz = +e.target.value; $('setBszV').textContent = SET.bsz + '%'; saveSet(); mobSetApply(); });
new MutationObserver(mobSetApply).observe(document.body, { attributes: true, attributeFilter: ['class'] });
mobSetApply(); if (SET.bat) batApply();
/* 옮기기: the buttons show with a dashed edge and are dragged where the thumb wants them; nothing fires while placing */
let bposWas = null, bposDrag = null;
function bposEdit(on) {
  if (on) {
    setOpen(false); bposWas = BPOS_IDS.map(id => $(id).hidden); for (const id of BPOS_IDS) $(id).hidden = false;
    document.body.classList.add('bposEdit'); $('bposBar').hidden = false;
  } else {
    if (bposWas) BPOS_IDS.forEach((id, i) => $(id).hidden = bposWas[i]); bposWas = null; bposDrag = null;
    document.body.classList.remove('bposEdit'); $('bposBar').hidden = true; saveSet(); setOpen(true);
  }
}
$('setBpos').addEventListener('click', () => bposEdit(true));
$('bposDone').addEventListener('click', () => bposEdit(false));
$('bposReset').addEventListener('click', () => { SET.bpos = {}; mobSetApply(); saveSet(); });
for (const t of ['pointerdown', 'pointermove', 'pointerup', 'pointercancel', 'touchstart', 'touchmove', 'mousedown', 'click']) addEventListener(t, e => {
  if (!document.body.classList.contains('bposEdit') || $('bposBar').contains(e.target)) return;
  e.stopImmediatePropagation(); if (e.cancelable && t !== 'click') e.preventDefault();
  if (t === 'pointerdown') {
    const b = e.target.closest && e.target.closest('.skillBtn'); if (!b || !BPOS_IDS.includes(b.id)) return;
    const p = (SET.bpos[b.id] || [0, 0]); bposDrag = { id: b.id, pid: e.pointerId, x: e.clientX - p[0], y: e.clientY - p[1] };
  } else if (t === 'pointermove' && bposDrag && e.pointerId === bposDrag.pid) {
    SET.bpos[bposDrag.id] = [e.clientX - bposDrag.x, e.clientY - bposDrag.y]; mobSetApply();
  } else if ((t === 'pointerup' || t === 'pointercancel') && bposDrag && e.pointerId === bposDrag.pid) {
    const b = $(bposDrag.id).getBoundingClientRect(), p = SET.bpos[bposDrag.id];      // kept on the screen
    if (b.left < 0) p[0] -= b.left; if (b.top < 0) p[1] -= b.top; if (b.right > innerWidth) p[0] -= b.right - innerWidth; if (b.bottom > innerHeight) p[1] -= b.bottom - innerHeight;
    mobSetApply(); bposDrag = null;
  }
}, { capture: true, passive: false });
