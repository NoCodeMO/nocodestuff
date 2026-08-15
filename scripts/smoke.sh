#!/usr/bin/env bash
set -euo pipefail

PORT="${PORT:-4173}"
DOM_FILE="${TMPDIR:-/tmp}/afterlight-dom.html"
CHROME_LOG="${TMPDIR:-/tmp}/afterlight-chrome.log"

python3 -m http.server "$PORT" --bind 127.0.0.1 >"${TMPDIR:-/tmp}/afterlight-server.log" 2>&1 &
SERVER_PID=$!
trap 'kill "$SERVER_PID" >/dev/null 2>&1 || true' EXIT
sleep 1

CHROME=""
for candidate in google-chrome google-chrome-stable chromium chromium-browser; do
  if command -v "$candidate" >/dev/null 2>&1; then CHROME="$candidate"; break; fi
done

if [[ -z "$CHROME" ]]; then
  echo "No supported headless Chrome/Chromium binary found."
  exit 1
fi

"$CHROME" --headless --no-sandbox --disable-gpu --virtual-time-budget=2500 --dump-dom "http://127.0.0.1:${PORT}/" >"$DOM_FILE" 2>"$CHROME_LOG"

required=(
  '<title>Afterlight Bunker</title>'
  'id="spriteStage"'
  'data-survivor-asset="survivor-ranger.png"'
  'data-muzzle-anchor="77.5% 20.5%"'
  'assets/survivor-ranger.png'
  'data-parallax-layers="5"'
  'data-enemy-rarity='
  'class="enemyUnit'
  'data-enemy-count='
  'assets/combat-clouds.webp'
  'assets/combat-bunker-clean.webp'
  'POWER GENERATOR'
  'id="missionBox"'
  'data-mission-count="200"'
  '200 AFTERLIGHT DIRECTIVES'
  'specialMainCard'
  'id="musicToggle"'
  'data-ui-audio="ready"'
  'data-resource="coins"'
  'data-research-system="ready"'
  'id="researchBadge"'
  'id="uranium"'
  'data-tab="merchant"'
  'data-merchant-system="ready"'
  'data-room-details-system="ready"'
  'data-room-id="generator"'
  'assets/room-generator.webp'
  'data-command-center-system="ready"'
  'data-offline-system="ready"'
  'data-tab="command"'
  'id="commandBadge"'
  'js/core/numbers.js?build=1'
)

for marker in "${required[@]}"; do
  if ! grep -Fq "$marker" "$DOM_FILE"; then
    echo "Browser smoke test failed. Missing rendered marker: $marker"
    echo "---- Chrome log ----"
    cat "$CHROME_LOG" || true
    exit 1
  fi
done

echo "Afterlight browser smoke test passed: core game, layered combat world, missions, specialist rooms and user-gesture UI audio rendered."

