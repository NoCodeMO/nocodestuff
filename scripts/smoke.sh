#!/usr/bin/env bash
set -euo pipefail

PORT="${PORT:-4173}"
DOM_FILE="${TMPDIR:-/tmp}/bunkr-dom.html"
LANDSCAPE_DOM_FILE="${TMPDIR:-/tmp}/bunkr-landscape-dom.html"
PORTRAIT_COMBAT_DOM_FILE="${TMPDIR:-/tmp}/bunkr-portrait-combat-dom.html"
STATIC_WORLD_DOM_FILE="${TMPDIR:-/tmp}/bunkr-static-world-dom.html"
ARCHITECT_DOM_FILE="${TMPDIR:-/tmp}/bunkr-architect-dom.html"
PRESTIGE_DOM_FILE="${TMPDIR:-/tmp}/bunkr-prestige-dom.html"
RESET_DOM_FILE="${TMPDIR:-/tmp}/bunkr-account-reset-dom.html"
DEATH_DOM_FILE="${TMPDIR:-/tmp}/bunkr-drifter-death-dom.html"
EXPEDITION_ART_DOM_FILE="${TMPDIR:-/tmp}/bunkr-expedition-art-dom.html"
COMPANION_IDLE_DOM_FILE="${TMPDIR:-/tmp}/bunkr-companion-idle-dom.html"
PET_COMMAND_DOM_FILE="${TMPDIR:-/tmp}/bunkr-pet-command-dom.html"
CASING_FEEDBACK_DOM_FILE="${TMPDIR:-/tmp}/bunkr-casing-feedback-dom.html"
RESEARCH_NETWORK_DOM_FILE="${TMPDIR:-/tmp}/bunkr-research-network-dom.html"
CHROME_LOG="${TMPDIR:-/tmp}/bunkr-chrome.log"

PYTHON="${PYTHON:-}"
if [[ -z "$PYTHON" ]]; then
  for candidate in python3 python python.exe; do
    if command -v "$candidate" >/dev/null 2>&1; then PYTHON="$candidate"; break; fi
  done
fi
if [[ -z "$PYTHON" ]]; then
  echo "No supported Python binary found."
  exit 1
fi

"$PYTHON" -m http.server "$PORT" --bind 127.0.0.1 >"${TMPDIR:-/tmp}/bunkr-server.log" 2>&1 &
SERVER_PID=$!
trap 'kill "$SERVER_PID" >/dev/null 2>&1 || true' EXIT
sleep 1

CHROME=""
for candidate in google-chrome google-chrome-stable chromium chromium-browser chrome chrome.exe msedge msedge.exe; do
  if command -v "$candidate" >/dev/null 2>&1; then CHROME="$candidate"; break; fi
done

if [[ -z "$CHROME" ]]; then
  echo "No supported headless Chrome/Chromium binary found."
  exit 1
fi

"$CHROME" --headless --no-sandbox --disable-gpu --virtual-time-budget=2500 --dump-dom "http://127.0.0.1:${PORT}/?forceCarePackage=1&forceDialogue=1" >"$DOM_FILE" 2>"$CHROME_LOG"
"$CHROME" --headless --no-sandbox --disable-gpu --window-size=900,500 --virtual-time-budget=3000 --dump-dom "http://127.0.0.1:${PORT}/scripts/landscape-probe.html" >"$LANDSCAPE_DOM_FILE" 2>>"$CHROME_LOG"
"$CHROME" --headless --no-sandbox --disable-gpu --window-size=900,900 --virtual-time-budget=4500 --dump-dom "http://127.0.0.1:${PORT}/scripts/portrait-combat-probe.html" >"$PORTRAIT_COMBAT_DOM_FILE" 2>>"$CHROME_LOG"
"$CHROME" --headless --no-sandbox --disable-gpu --window-size=1000,760 --virtual-time-budget=3000 --dump-dom "http://127.0.0.1:${PORT}/scripts/static-world-probe.html" >"$STATIC_WORLD_DOM_FILE" 2>>"$CHROME_LOG"
"$CHROME" --headless --no-sandbox --disable-gpu --window-size=900,700 --virtual-time-budget=3000 --dump-dom "http://127.0.0.1:${PORT}/scripts/architect-probe.html" >"$ARCHITECT_DOM_FILE" 2>>"$CHROME_LOG"
"$CHROME" --headless --no-sandbox --disable-gpu --window-size=1000,760 --virtual-time-budget=4000 --dump-dom "http://127.0.0.1:${PORT}/scripts/prestige-probe.html" >"$PRESTIGE_DOM_FILE" 2>>"$CHROME_LOG"
"$CHROME" --headless --no-sandbox --disable-gpu --window-size=1000,760 --virtual-time-budget=8000 --dump-dom "http://127.0.0.1:${PORT}/scripts/account-reset-probe.html" >"$RESET_DOM_FILE" 2>>"$CHROME_LOG"
"$CHROME" --headless --no-sandbox --disable-gpu --window-size=1000,760 --virtual-time-budget=4000 --dump-dom "http://127.0.0.1:${PORT}/scripts/death-animation-probe.html" >"$DEATH_DOM_FILE" 2>>"$CHROME_LOG"
"$CHROME" --headless --no-sandbox --disable-gpu --window-size=1200,900 --virtual-time-budget=12000 --dump-dom "http://127.0.0.1:${PORT}/scripts/expedition-art-probe.html" >"$EXPEDITION_ART_DOM_FILE" 2>>"$CHROME_LOG"
"$CHROME" --headless --no-sandbox --disable-gpu --window-size=1200,900 --virtual-time-budget=12000 --dump-dom "http://127.0.0.1:${PORT}/scripts/companion-idle-probe.html" >"$COMPANION_IDLE_DOM_FILE" 2>>"$CHROME_LOG"
"$CHROME" --headless --no-sandbox --disable-gpu --window-size=390,844 --virtual-time-budget=6000 --dump-dom "http://127.0.0.1:${PORT}/scripts/pet-command-probe.html" >"$PET_COMMAND_DOM_FILE" 2>>"$CHROME_LOG"
"$CHROME" --headless --no-sandbox --disable-gpu --window-size=390,844 --virtual-time-budget=5000 --dump-dom "http://127.0.0.1:${PORT}/scripts/casing-feedback-probe.html" >"$CASING_FEEDBACK_DOM_FILE" 2>>"$CHROME_LOG"
"$CHROME" --headless --no-sandbox --disable-gpu --window-size=390,844 --virtual-time-budget=5000 --dump-dom "http://127.0.0.1:${PORT}/scripts/research-network-probe.html" >"$RESEARCH_NETWORK_DOM_FILE" 2>>"$CHROME_LOG"

required=(
  '<title>Bunkr: Last Shelter</title>'
  'aria-label="Bunkr: Last Shelter"'
  '<span>LAST SHELTER</span>'
  'assets/branding/bunkr-icon-192.png'
  'id="spriteStage"'
  'data-survivor-asset="survivor-ranger.png"'
  'data-survivor-id="ranger-male"'
  'data-muzzle-anchor="77.5% 20.5%"'
  'assets/survivor-ranger.png'
  'assets/survivor-ranger-female.webp'
  'assets/survivor-architect.webp'
  'data-parallax-layers="5"'
  'data-world-motion="clouds-only"'
  'data-enemy-rarity='
  'class="enemyUnit'
  'data-enemy-count='
  'assets/combat-clouds.webp'
  'assets/combat-bunker-clean.webp'
  'assets/enemy-common-drifter-death.png'
  'assets/enemy-uncommon-cinderback-hit.png'
  'assets/enemy-rare-blue-shield-hit.png'
  'assets/enemy-epic-bloater-hit.png'
  'assets/enemy-legendary-gilded-warden-hit.png'
  'assets/enemy-brute-breaker-hit.png'
  'assets/enemy-uncommon-cinderback-death.png'
  'assets/enemy-rare-blue-shield-death.png'
  'assets/enemy-epic-bloater-death.png'
  'assets/enemy-legendary-gilded-warden-death.png'
  'assets/enemy-brute-breaker-death.png'
  'POWER GENERATOR'
  'id="missionBox"'
  'data-mission-count="200"'
  '200 BUNKR DIRECTIVES'
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
  'js/core/brand.js?build=1'
  'js/core/config.js?build=38'
  'js/core/economy.js?build=3'
  'js/core/numbers.js?build=2'
  'js/core/state.js?build=27'
  'js/systems/prestige.js?build=4'
  'js/systems/operations.js?build=3'
  'js/systems/command-center.js?build=9'
  'js/systems/survivor-dialogue.js?build=2'
  'js/core/game.js?build=28'
  'js/audio.js?build=19'
  'js/systems/care-package.js?build=3'
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
  grep -F 'BUNKR_LANDSCAPE_' "$LANDSCAPE_DOM_FILE" || true
  echo "---- Chrome log ----"
  cat "$CHROME_LOG" || true
  exit 1
fi

if ! grep -Fq 'data-architect-probe="passed"' "$ARCHITECT_DOM_FILE"; then
  echo "Architect browser smoke test failed."
  grep -F 'BUNKR_ARCHITECT_' "$ARCHITECT_DOM_FILE" || true
  echo "---- Chrome log ----"
  cat "$CHROME_LOG" || true
  exit 1
fi

if ! grep -Fq 'data-portrait-combat="passed"' "$PORTRAIT_COMBAT_DOM_FILE"; then
  echo "Portrait combat browser smoke test failed."
  grep -F 'BUNKR_PORTRAIT_COMBAT_' "$PORTRAIT_COMBAT_DOM_FILE" || true
  echo "---- Chrome log ----"
  cat "$CHROME_LOG" || true
  exit 1
fi

if ! grep -Fq 'data-static-world="passed"' "$STATIC_WORLD_DOM_FILE"; then
  echo "Static combat world browser smoke test failed."
  grep -F 'BUNKR_STATIC_WORLD_' "$STATIC_WORLD_DOM_FILE" || true
  echo "---- Chrome log ----"
  cat "$CHROME_LOG" || true
  exit 1
fi

if ! grep -Fq 'data-prestige-probe="passed"' "$PRESTIGE_DOM_FILE"; then
  echo "Prestige browser smoke test failed."
  grep -F 'BUNKR_PRESTIGE_' "$PRESTIGE_DOM_FILE" || true
  echo "---- Chrome log ----"
  cat "$CHROME_LOG" || true
  exit 1
fi

if ! grep -Fq 'data-account-reset-probe="passed"' "$RESET_DOM_FILE"; then
  echo "Account reset browser smoke test failed."
  grep -F 'BUNKR_ACCOUNT_RESET_' "$RESET_DOM_FILE" || true
  echo "---- Chrome log ----"
  cat "$CHROME_LOG" || true
  exit 1
fi

if ! grep -Fq 'data-death-animation-probe="passed"' "$DEATH_DOM_FILE"; then
  echo "Drifter death animation browser smoke test failed."
  grep -F 'BUNKR_DRIFTER_DEATH_' "$DEATH_DOM_FILE" || true
  echo "---- Chrome log ----"
  cat "$CHROME_LOG" || true
  exit 1
fi

if ! grep -Fq 'data-expedition-art-probe="passed"' "$EXPEDITION_ART_DOM_FILE"; then
  echo "Expedition location art browser smoke test failed."
  grep -F 'BUNKR_EXPEDITION_ART_' "$EXPEDITION_ART_DOM_FILE" || true
  echo "---- Chrome log ----"
  cat "$CHROME_LOG" || true
  exit 1
fi

if ! grep -Fq 'data-companion-idle-probe="passed"' "$COMPANION_IDLE_DOM_FILE"; then
  echo "Companion idle animation browser smoke test failed."
  grep -F 'BUNKR_COMPANION_IDLE_' "$COMPANION_IDLE_DOM_FILE" || true
  echo "---- Chrome log ----"
  cat "$CHROME_LOG" || true
  exit 1
fi

if ! grep -Fq 'data-pet-command-probe="passed"' "$PET_COMMAND_DOM_FILE"; then
  echo "Pet Command browser smoke test failed."
  grep -F 'BUNKR_PET_COMMAND_' "$PET_COMMAND_DOM_FILE" || true
  echo "---- Chrome log ----"
  cat "$CHROME_LOG" || true
  exit 1
fi

if ! grep -Fq 'data-casing-feedback-probe="passed"' "$CASING_FEEDBACK_DOM_FILE"; then
  echo "Spent-casing feedback browser smoke test failed."
  grep -F 'BUNKR_CASING_FEEDBACK_' "$CASING_FEEDBACK_DOM_FILE" || true
  echo "---- Chrome log ----"
  cat "$CHROME_LOG" || true
  exit 1
fi

if ! grep -Fq 'data-research-network-probe="passed"' "$RESEARCH_NETWORK_DOM_FILE"; then
  echo "Research Network browser smoke test failed."
  grep -F 'BUNKR_RESEARCH_NETWORK_' "$RESEARCH_NETWORK_DOM_FILE" || true
  echo "---- Chrome log ----"
  cat "$CHROME_LOG" || true
  exit 1
fi

echo "Bunkr browser smoke test passed: core game, responsive Research Network lifecycle, preloaded infected hit assets, survivor-relative spent casings, free Ranger and Pet Command roster, 20 three-frame companions, static combat world, responsive expedition art, safe portrait combat, death sequences, landscape deck, survivor unlocks, Prestige resets and full account factory reset rendered correctly."
