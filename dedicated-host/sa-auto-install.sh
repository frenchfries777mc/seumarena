#!/bin/bash
# SeumArena 서버 자동 갱신 설치 (서버에서 한 번: bash sa-auto-install.sh)
#  - seumarena 저장소(공개) main 을 5분마다 확인해요
#  - 게임 파일(seumarena.html)과 전용 방장(dedicated-host/sa-host.js) 둘 다 받아요 (2026-11-26부터 sa-host.js 도 자동)
#  - 새 빌드가 전용 방장 기능(__sad)을 갖고 있을 때만 바꿔요 (옛날 빌드 차단)
#  - 진행 중인 경기가 있으면 기다렸다가 경기가 없을 때 바꿔요
#  - 바꾼 뒤 90초 안에 방이 안 열리면 이전 것으로 되돌리고, 그 묶음은 다시 시도하지 않아요
set -e
D=/opt/sa-host
REPO_URL=https://github.com/frenchfries777mc/seumarena.git
[ -d "$D" ] || { echo "$D 가 없어요 (전용 방장을 먼저 설치하세요)"; exit 1; }
sudo chown "$USER" "$D"

echo "== 1/3 갱신 스크립트 =="
cat > "$D/auto-update.sh" <<IN
#!/bin/bash
D=$D; REPO=\$D/repo; LOG="logger -t sa-update"
exec 9>\$D/.update.lock; flock -n 9 || exit 0
if [ -d \$REPO/.git ]; then git -C \$REPO fetch -q --depth 1 origin main && git -C \$REPO reset -q --hard origin/main || { \$LOG "fetch failed"; exit 0; }
else git clone -q --depth 1 $REPO_URL \$REPO || { \$LOG "clone failed"; exit 0; }; fi
NH=\$REPO/seumarena.html; NJ=\$REPO/dedicated-host/sa-host.js
[ -f \$NH ] && [ -f \$NJ ] || exit 0
cmp -s \$NH \$D/seumarena.html && cmp -s \$NJ \$D/sa-host.js && exit 0
H=\$(cat \$NH \$NJ | sha256sum | cut -c1-16)
grep -qx "\$H" \$D/.bad 2>/dev/null && exit 0
# 1) 검증: 크기, 전용 방장 기능, 방 이름, sa-host.js 문법
[ "\$(stat -c%s \$NH)" -gt 1000000 ] && grep -q '__sad' \$NH && grep -q 'seumarena-v3-' \$NH || { \$LOG "rejected \$H (전용 방장 기능 없음)"; echo \$H >> \$D/.bad; exit 0; }
node --check \$NJ 2>/dev/null || { \$LOG "rejected \$H (sa-host.js 문법 오류)"; echo \$H >> \$D/.bad; exit 0; }
# 2) 경기 중이면 다음 차례에
if [ -f \$D/status.json ] && [ \$(( \$(date +%s) - \$(stat -c%Y \$D/status.json) )) -lt 30 ]; then
  P=\$(grep -o '"playing":[0-9]*' \$D/status.json | cut -d: -f2); [ "\${P:-0}" -gt 0 ] && { \$LOG "waiting: \$P match(es) running"; exit 0; }
fi
# 3) 바꾸고 재시작
cp \$D/seumarena.html \$D/seumarena.prev.html; cp \$D/sa-host.js \$D/sa-host.prev.js 2>/dev/null || true
cp \$NH \$D/seumarena.html.tmp && mv \$D/seumarena.html.tmp \$D/seumarena.html
cp \$NJ \$D/sa-host.js.tmp && mv \$D/sa-host.js.tmp \$D/sa-host.js
rm -f \$D/status.json; sudo systemctl restart sa-host
# 4) 90초 안에 방이 안 열리면 되돌리기
for i in \$(seq 18); do sleep 5; grep -q '"opened":[1-9]' \$D/status.json 2>/dev/null && { \$LOG "installed \$H"; exit 0; }; done
\$LOG "rollback: \$H opened no room"; echo \$H >> \$D/.bad
cp \$D/seumarena.prev.html \$D/seumarena.html.tmp && mv \$D/seumarena.html.tmp \$D/seumarena.html
[ -f \$D/sa-host.prev.js ] && cp \$D/sa-host.prev.js \$D/sa-host.js.tmp && mv \$D/sa-host.js.tmp \$D/sa-host.js
sudo systemctl restart sa-host
IN
chmod +x "$D/auto-update.sh"

echo "== 2/3 5분마다 실행 =="
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
sudo systemctl enable --now sa-update.timer

echo "== 3/3 지금 한 번 받기 =="
"$D/auto-update.sh" || true
echo
echo "설치 끝. 기록: journalctl -t sa-update -n 20"
