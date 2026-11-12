#!/bin/bash
# SeumArena 서버 자동 갱신 설치 (서버에서 한 번: bash sa-auto-install.sh)
#  - seumarena 저장소(공개) main 을 5분마다 확인해요
#  - 새 빌드가 전용 방장 기능(__sad)을 갖고 있을 때만 바꿔요 (옛날 빌드 차단)
#  - 진행 중인 경기가 있으면 기다렸다가 경기가 없을 때 바꿔요
#  - 바꾼 뒤 90초 안에 방이 안 열리면 이전 빌드로 되돌리고, 그 빌드는 다시 시도하지 않아요
set -e
D=/opt/sa-host
REPO_URL=https://github.com/frenchfries777mc/seumarena.git
[ -d "$D" ] || { echo "$D 가 없어요 (전용 방장을 먼저 설치하세요)"; exit 1; }
sudo chown "$USER" "$D"

echo "== 1/3 새 sa-host.js (경기 수를 status.json 에 적어요) =="
cat > "$D/sa-host.js.new" <<'SAEOF'
/* SeumArena 전용 방장 (dedicated host)
   서버에서 화면 없는 브라우저로 SeumArena를 ?dedicated=1 로 열고, 모드마다 빈 방을 미리 열어 둬요.
   사람이 아니라서 경기에는 나오지 않고, 경기 계산만 해요 (방장이 죽거나 나가서 경기가 끊기는 일이 없어요).
   설정 (/etc/sa-host.env):
     SA_GAME=/opt/sa-host/seumarena.html   게임 파일 (install.sh 가 받아 둬요)
     SA_WAITING=1      모드마다 기다리는 빈 방 수
     SA_MAX=12         한꺼번에 열어 둘 방 수 (진행 중 포함, 램 약 250MB/방)
     SA_RESTART_H=6    이만큼 지나고 진행 중인 경기가 없으면 스스로 다시 시작 (새 게임 파일을 읽어요) */
const { chromium } = require('playwright');
const fs = require('fs'), os = require('os');
const GAME = process.env.SA_GAME || '/opt/sa-host/seumarena.html';
const MAXR = Math.max(1, Math.min(+process.env.SA_MAX || 12, Math.floor(os.totalmem() / 1048576 / 250)));
const WAITING = Math.max(1, +process.env.SA_WAITING || 1), RESTART_H = +process.env.SA_RESTART_H || 6;
const ORIGIN = 'https://sa-host.local/', ROOMS = 8;
const T0 = Date.now(), log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);
const sleep = ms => new Promise(r => setTimeout(r, ms));
let browser = null, stopping = false, html = '', modes = [];
const live = [];                 // {mode, k, page, ctx, started, closed}
const blocked = new Map();
const STATUS = process.env.SA_STATUS || '/opt/sa-host/status.json';
function writeStatus() { try { fs.writeFileSync(STATUS + '.tmp', JSON.stringify({ t: Date.now(), pid: process.pid, rooms: live.length, playing: live.filter(h => h.started && !h.closed).length, opened: openedCount })); fs.renameSync(STATUS + '.tmp', STATUS); } catch (e) {} }
let openedCount = 0;       // 'mode:k' -> 이 시각까지 건너뛰어요 (사람이 그 방을 열어 쓰는 중)

async function newTab() {
  const ctx = await browser.newContext({ viewport: { width: 320, height: 240 } });
  if (process.env.SA_TEST) await require(process.env.SA_TEST)(ctx);          // (tests only: points the page at a local PeerServer)
  await ctx.route(ORIGIN + '**', r => r.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: html }));
  const page = await ctx.newPage();
  page.on('pageerror', e => log('page error', String(e && e.message || e).slice(0, 160)));
  await page.goto(ORIGIN + 'game.html?dedicated=1', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForFunction(() => window.__sad && typeof window.Peer === 'function', null, { timeout: 60000 });
  return { ctx, page };
}
function freeSlot(mode) {
  for (let k = 0; k < ROOMS; k++) { const key = mode + ':' + k; if (!live.some(h => h.mode === mode && h.k === k) && !(blocked.get(key) > Date.now())) return k; }
  return -1;
}
async function openRoom(mode) {
  const k = freeSlot(mode); if (k < 0) return false;
  const h = { mode, k, started: false, closed: false }; live.push(h);
  const close = async why => { if (h.closed) return; h.closed = true; const i = live.indexOf(h); if (i >= 0) live.splice(i, 1); log('방 닫음', mode, k, why || ''); try { await h.ctx.close(); } catch (e) {} };
  h.close = close;
  try {
    Object.assign(h, await newTab());
    h.page.on('crash', () => close('탭 충돌'));
    await h.page.evaluate(([m, n]) => window.__sad.open(m, n), [mode, k]);
    const t0 = Date.now(); let st = null;
    while (Date.now() - t0 < 20000) { await sleep(500); st = await h.page.evaluate(() => window.__sad.status()); if (st.live || st.err) break; }
    if (!st || !st.live) { if (st && st.err === 'taken') blocked.set(mode + ':' + k, Date.now() + 60000);      // a person holds that room id: try the next one for a minute
      await close('열기 실패 ' + (st && st.err)); return false; }
    log('방 열림', mode, k); openedCount++; writeStatus(); watch(h); return true;
  } catch (e) { log('방 열기 오류', String(e && e.message || e).slice(0, 200)); await close('오류'); return false; }
}
async function watch(h) {
  let t0 = 0, emptySince = 0, endedAt = 0;
  while (!stopping && !h.closed) {
    await sleep(1000);
    let st; try { st = await h.page.evaluate(() => window.__sad.status()); } catch (e) { return h.close('상태 읽기 실패'); }
    if (st.err) return h.close('오류 ' + st.err);
    if (st.started && !t0) { t0 = Date.now(); h.started = true; log('경기 시작', h.mode, h.k, '사람', st.humans); }
    if (st.ended) { if (!endedAt) { endedAt = Date.now(); log('경기 끝', h.mode, h.k); } if (Date.now() - endedAt > 3000) return h.close('경기 끝남'); }
    if (!st.started && !st.live) return h.close('방이 닫혔어요');
    if (st.started && !st.ended) { if (st.humans) emptySince = 0; else if (!emptySince) emptySince = Date.now(); else if (Date.now() - emptySince > 10000) return h.close('사람이 다 나감'); }
    if (t0 && Date.now() - t0 > 20 * 60 * 1000) return h.close('너무 오래 진행됨');
  }
}
async function main() {
  html = fs.readFileSync(GAME, 'utf8');
  browser = await chromium.launch({ args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--disable-background-timer-throttling', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows', '--autoplay-policy=no-user-gesture-required'].concat((process.env.SA_CHROME_ARGS || '').split(' ').filter(Boolean)) });
  browser.on('disconnected', () => { if (!stopping) { log('브라우저가 꺼졌어요, 다시 시작해요'); process.exit(1); } });
  { const t = await newTab(); modes = await t.page.evaluate(() => window.__sad.modes()); await t.ctx.close(); }
  log('전용 방장 시작', GAME, '모드', modes.join(','), '최대', MAXR, '방');
  let fails = 0; setInterval(writeStatus, 5000); writeStatus();
  while (!stopping) {
    let opened = false;
    for (const m of modes) {
      if (live.length >= MAXR) break;
      if (live.filter(h => h.mode === m && !h.started).length >= WAITING) continue;
      if (await openRoom(m)) { opened = true; fails = 0; } else fails++;
    }
    if (RESTART_H > 0 && Date.now() - T0 > RESTART_H * 3600e3 && live.every(h => !h.started)) { log('다시 시작해요 (새 게임 파일 읽기)'); break; }
    await sleep(opened ? 300 : Math.min(30000, 1500 + 1000 * fails));
  }
  stopping = true; try { await browser.close(); } catch (e) {}
  process.exit(0);
}
process.on('SIGTERM', () => { stopping = true; process.exit(0); });
process.on('SIGINT', () => { stopping = true; process.exit(0); });
main().catch(e => { console.error(e); process.exit(1); });
SAEOF
mv "$D/sa-host.js.new" "$D/sa-host.js"

echo "== 2/3 갱신 스크립트 =="
cat > "$D/auto-update.sh" <<IN
#!/bin/bash
D=$D; REPO=\$D/repo; CUR=\$D/seumarena.html; LOG="logger -t sa-update"
exec 9>\$D/.update.lock; flock -n 9 || exit 0
if [ -d \$REPO/.git ]; then git -C \$REPO fetch -q --depth 1 origin main && git -C \$REPO reset -q --hard origin/main || { \$LOG "fetch failed"; exit 0; }
else git clone -q --depth 1 $REPO_URL \$REPO || { \$LOG "clone failed"; exit 0; }; fi
NEW=\$REPO/seumarena.html
[ -f \$NEW ] || exit 0
cmp -s \$NEW \$CUR && exit 0
H=\$(sha256sum \$NEW | cut -c1-16)
grep -qx "\$H" \$D/.bad 2>/dev/null && exit 0
# 1) 검증: 크기, 전용 방장 기능, 방 이름
[ "\$(stat -c%s \$NEW)" -gt 1000000 ] && grep -q '__sad' \$NEW && grep -q 'seumarena-v3-' \$NEW || { \$LOG "rejected \$H (전용 방장 기능 없음)"; echo \$H >> \$D/.bad; exit 0; }
# 2) 경기 중이면 다음 차례에
if [ -f \$D/status.json ] && [ \$(( \$(date +%s) - \$(stat -c%Y \$D/status.json) )) -lt 30 ]; then
  P=\$(grep -o '"playing":[0-9]*' \$D/status.json | cut -d: -f2); [ "\${P:-0}" -gt 0 ] && { \$LOG "waiting: \$P match(es) running"; exit 0; }
fi
# 3) 바꾸고 재시작
cp \$CUR \$D/seumarena.prev.html
cp \$NEW \$CUR.tmp && mv \$CUR.tmp \$CUR
rm -f \$D/status.json; sudo systemctl restart sa-host
# 4) 90초 안에 방이 안 열리면 되돌리기
for i in \$(seq 18); do sleep 5; grep -q '"opened":[1-9]' \$D/status.json 2>/dev/null && { \$LOG "installed \$H"; exit 0; }; done
\$LOG "rollback: \$H opened no room"; echo \$H >> \$D/.bad
cp \$D/seumarena.prev.html \$CUR.tmp && mv \$CUR.tmp \$CUR; sudo systemctl restart sa-host
IN
chmod +x "$D/auto-update.sh"

echo "== 3/3 5분마다 실행 =="
sudo tee /etc/systemd/system/sa-update.service >/dev/null <<IN
[Unit]
Description=SeumArena build auto-update
[Service]
Type=oneshot
User=$USER
ExecStart=$D/auto-update.sh
IN
sudo tee /etc/systemd/system/sa-update.timer >/dev/null <<IN
[Unit]
Description=Check SeumArena build every 5 minutes
[Timer]
OnBootSec=2min
OnUnitActiveSec=5min
[Install]
WantedBy=timers.target
IN
sudo systemctl daemon-reload
sudo systemctl restart sa-host
sudo systemctl enable --now sa-update.timer
echo
echo "설치 끝. 5분 안에 첫 확인을 해요."
echo "확인: journalctl -t sa-update -n 20"
