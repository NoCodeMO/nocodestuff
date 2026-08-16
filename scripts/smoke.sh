#!/usr/bin/env bash
set -euo pipefail

PORT="${PORT:-4173}"
DOM_FILE="${TMPDIR:-/tmp}/afterlight-dom.html"
LANDSCAPE_DOM_FILE="${TMPDIR:-/tmp}/afterlight-landscape-dom.html"
ARCHITECT_DOM_FILE="${TMPDIR:-/tmp}/afterlight-architect-dom.html"
PRESTIGE_DOM_FILE="${TMPDIR:-/tmp}/afterlight-prestige-dom.html"
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

"$CHROME" --headless --no-sandbox --disable-gpu --virtual-time-budget=2500 --dump-dom "http://127.0.0.1:${PORT}/?forceCarePackage=1&forceDialogue=1" >"$DOM_FILE" 2>"$CHROME_LOG"
"$CHROME" --headless --no-sandbox --disable-gpu --window-size=900,500 --virtual-time-budget=3000 --dump-dom "http://127.0.0.1:${PORT}/scripts/landscape-probe.html" >"$LANDSCAPE_DOM_FILE" 2>>"$CHROME_LOG"
"$CHROME" --headless --no-sandbox --disable-gpu --window-size=900,700 --virtual-time-budget=3000 --dump-dom "http://127.0.0.1:${PORT}/scripts/architect-probe.html" >"$ARCHITECT_DOM_FILE" 2>>"$CHROME_LOG"
"$CHROME" --headless --no-sandbox --disable-gpu --window-size=1000,760 --virtual-time-budget=4000 --dump-dom "http://127.0.0.1:${PORT}/scripts/prestige-probe.html" >"$PRESTIGE_DOM_FILE" 2>>"$CHROME_LOG"

required=(
  '<title>Afterlight Bunker</title>'
  'id="spriteStage"'
  'data-survivor-asset="survivor-ranger.png"'
  'data-survivor-id="ranger-male"'
  'data-muzzle-anchor="77.5% 20.5%"'
  'assets/survivor-ranger.png'
  'assets/survivor-ranger-female.webp'
  'assets/survivor-architect.webp'
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
  'id="bunkerProgress"'
  'assets/room-generator.webp'
  'data-command-center-system="ready"'
  'data-survivor-roster-system="ready"'
  'data-survivor-dialogue-system="ready"'
  'data-prestige-system="ready"'
  'id="survivorDialogue"'
  'data-survivor-dialogue="ready"'
  'Road stays ours.'
  'data-offline-system="ready"'
  'data-codex-system="ready"'
  'data-care-package-system="ready"'
  'id="carePackageDrop"'
  'data-phase="landed"'
  'assets/care-package-crate.png'
  'id="enemyCodexHint"'
  'id="hordeSignal"'
  'data-tab="command"'
  'id="commandBadge"'
  'js/core/config.js?build=24'
  'js/core/economy.js?build=2'
  'js/core/numbers.js?build=1'
  'js/core/state.js?build=20'
  'js/systems/prestige.js?build=3'
  'js/systems/operations.js?build=2'
  'js/systems/survivor-dialogue.js?build=1'
  'js/core/game.js?build=22'
  'js/audio.js?build=13'
  'js/systems/care-package.js?build=2'
)

for marker in "${required[@]}"; do
  if ! grep -Fq "$marker" "$DOM_FILE"; then
    echo "Browser smoke test failed. Missing rendered marker: $marker"
    echo "---- Chrome log ----"
    cat "$CHROME_LOG" || true
    exit 1
  fi
done

if ! grep -Fq 'data-landscape-layout="passed"' "$LANDSCAPE_DOM_FILE"; then
  echo "Landscape browser smoke test failed."
  grep -F 'AFTERLIGHT_LANDSCAPE_' "$LANDSCAPE_DOM_FILE" || true
  echo "---- Chrome log ----"
  cat "$CHROME_LOG" || true
  exit 1
fi

if ! grep -Fq 'data-architect-probe="passed"' "$ARCHITECT_DOM_FILE"; then
  echo "Architect browser smoke test failed."
  grep -F 'AFTERLIGHT_ARCHITECT_' "$ARCHITECT_DOM_FILE" || true
  echo "---- Chrome log ----"
  cat "$CHROME_LOG" || true
  exit 1
fi

if ! grep -Fq 'data-prestige-probe="passed"' "$PRESTIGE_DOM_FILE"; then
  echo "Prestige browser smoke test failed."
  grep -F 'AFTERLIGHT_PRESTIGE_' "$PRESTIGE_DOM_FILE" || true
  echo "---- Chrome log ----"
  cat "$CHROME_LOG" || true
  exit 1
fi

echo "Afterlight browser smoke test passed: core game, landscape deck, Level 100 Architect and transactional Prestige I reset rendered correctly."
