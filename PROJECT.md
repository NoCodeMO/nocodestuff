# AFTERLIGHT BUNKER - DEVELOPER CONTEXT

This file is the fastest entry point for any future development session. Read this first, then inspect only the module relevant to the requested change.

## Live project

- Repo: `NoCodeMO/nocodestuff`
- Production: `https://nocodemo.github.io/nocodestuff/`
- Platform: static HTML/CSS/JavaScript on GitHub Pages
- No framework, bundler or runtime dependencies.
- `npm run test:all` is the full pre-deploy test command.

## Architecture

### Entry and styling
- `index.html` - DOM shell and explicit script load order.
- `app.css` - the only production stylesheet. It is sectioned by system.
- `manifest.webmanifest` - PWA/home-screen metadata.

### Core
- `js/core/config.js` - shared game content/config: rooms, research, expeditions, specialists, classified rooms, Dealer offers and the complete enemy/rarity table.
- `js/core/state.js` - one authoritative persistent state object and save migration.
- `js/core/game.js` - economy, combat, normal rooms, HUD, tabs and drawer routing.

### Systems
- `js/systems/missions.js` - 50 mission chain and permanent bonuses.
- `js/systems/expeditions.js` - expedition timers, rewards and specialist discovery.
- `js/systems/special-rooms.js` - classified rooms unlocked by specialists.
- `js/systems/research.js` - timed, scrap-funded research, completion badge and claiming.
- `js/systems/merchant.js` - Uranium wallet, Dealer stock, temporary boost timers, purchase rules and runtime multipliers.

### Presentation/platform
- `js/ui/visuals.js` - survivor/enemy visuals, hit/death feedback, floating kill rewards, resource pulses and room-art loading.
- `js/audio.js` - background music plus compressed WebAudio UI, combat, reward and research-completion feedback.
- `js/platform.js` - standalone/fullscreen install helpers.

### Validation
- `scripts/validate.js` - zero-dependency JS syntax, local reference and legacy-file checks.
- `scripts/combat-balance.js` - deterministic enemy rarity, asset, horde, glow and income-scaled bounty checks.
- `scripts/merchant-balance.js` - Dealer inventory, boost stacking, Uranium sources, timers and economy guardrails.
- `scripts/smoke.sh` - launches the actual game in headless Chrome and verifies core dynamic UI rendered.
- `npm test` - static validation only.
- `npm run test:browser` - browser startup smoke test only.
- `npm run test:all` - both test layers.
- `.github/workflows/pages.yml` - runs static and browser tests before GitHub Pages deployment. A failed test blocks deployment.

## Script load order

The order in `index.html` is intentional:

1. config
2. state
3. expeditions
4. special rooms
5. research
6. merchant
7. visuals
8. game
9. missions
10. audio
11. platform

Do not casually reorder these. Missions loads after game because it owns the custom Missions tab click handler. Visuals loads before game so it receives initial combat events. Expeditions and special rooms load before game so their APIs are available to the first render/economy tick.

## State: one source of truth

The production save key remains `afterlight_v4` for backward compatibility, but the current schema is `schema: 8`.

`window.AfterlightState` owns the in-memory state and persistence. Systems must not independently read/write the main save through `localStorage`.

Main shape:

```text
resources: coins, total, food, water, power, scrap, science, uranium
progress: kills, bunker, rooms, research, stats (including rarity kills, hordes, Brute Cores and Uranium earned/spent)
researchRuntime: { active, ready }
missions: { claimed, bonuses }
expeditions: { active, survivors, pending }
specialRooms: { [roomId]: level }
merchant: { active, purchases, spent, legacyMissionGrantDone }
settings: { music }
```

`state.js` automatically imports legacy data from:
- `afterlight_missions_v1`
- `afterlight_expedition_runtime_v1`
- `afterlight_special_rooms_v1`
- `afterlight_music`

Do not create another persistent gameplay store unless there is a strong reason. Extend the unified state instead.

## Public runtime APIs

- `window.AfterlightConfig`
- `window.AfterlightState`
- `window.AfterlightGame`
- `window.AfterlightMissions`
- `window.AfterlightExpeditions`
- `window.AfterlightSpecialRooms`
- `window.AfterlightResearch`
- `window.AfterlightMerchant`
- `window.AfterlightVisuals`
- `window.AfterlightAudio`
- `window.AfterlightPlatform`

Compatibility globals used by inline UI:
- `buyRoom(id)`
- `buySpecialRoom(id)`
- `startAfterlightExpedition(id)`
- `AfterlightBonuses()`
- `AfterlightSurvivors()`

## Events

Use events instead of adding duplicate click listeners across systems:

- `afterlight:shot` - emitted by core combat; visuals/SFX can react.
- `afterlight:enemy-killed` - emitted once after coins/scrap and any Brute Core are granted; includes the exact reward and enemy metadata and owns the cash SFX trigger.
- `afterlight:enemy` - emitted when a new enemy or horde spawns; includes its rarity, art, in-game glow, HP, rewards and visual count.
- `afterlight:state` - important state mutation; `detail.reason` describes the change.
- `afterlight:survivors` - specialist roster changed.
- `afterlight:mission-claimed` - emitted after a successful claim; owns the mission reward fanfare.
- `afterlight:expedition-complete` - emitted exactly when the completion reveal is created; owns the expedition fanfare.
- `afterlight:merchant-purchase` - emitted after Uranium is spent and the boost is active; owns the Dealer celebration and fanfare.
- `afterlight:merchant-expired` - emitted when one or more persisted wall-clock boosts expire.

UI button sounds are handled centrally in `audio.js`; do not add per-button audio listeners. Combat inside `#scene` is excluded from the button handler and its gunshot is driven by `afterlight:shot`.

Example: future gun audio should listen to `afterlight:shot`, not attach another listener to the shoot button.

## Economy rules

Mission bonuses are consumed by the core economy. Current supported bonus keys:
- `coinMult`
- `zombieMult`
- `prodMult`
- `powerMult`
- `scrapMult`
- `foodMult`
- `waterMult`
- `scienceMult`
- `damageMult`
- `costMult`
- `offlineMult` is stored but offline earnings are not implemented yet.

Special-room production is returned by `AfterlightSpecialRooms.rates()` and integrated into the core economy. Do not add another production interval that writes resources independently.

Enemy encounters use one weighted table with an exact 100% total: Common 55%, Uncommon 25%, Rare 12%, Epic 5%, Legendary 2% and Brute 1%. A non-Brute encounter independently has a 12% horde chance. A horde renders three infected, but its HP, rewards and kill credit are a single x5 package.

The base zombie bounty is the greatest of a progression floor and 0.08% of actual hourly coin production. For example, a bunker producing 1,000,000 coins/hour gets an 800-coin Common base bounty before rarity, horde, research and mission multipliers. This keeps kills useful in both early and late game without letting combat replace the bunker economy. Brutes are outside the rarity glow system and always award one exclusive Brute Core.

Uranium Crystals are a deliberately scarce non-passive currency. Every claimed mission awards a tier-scaled amount, expeditions use visible zone-specific crystal chances and every Brute awards exactly one. Existing saves receive a one-time crystal grant for missions already claimed. Uranium is only spent at the Dealer and is never generated by room production or offline income.

Dealer boosts activate immediately and use persisted wall-clock deadlines. The 5x and 10x coin contracts share one channel and cannot stack with each other; different channels can stack. The intended maximum coin combination is the 10x coin contract with the expensive 3x everything contract, for a temporary 30x total. That everything contract also triples all other resource production, manual damage and infected bounties. Repurchasing the same active contract extends its remaining time rather than wasting it.

## Assets

Only active assets remain in `assets/`:
- `survivor-final.webp`
- `enemy-common-drifter.webp`, `enemy-uncommon-cinderback.webp`, `enemy-rare-blue-shield.webp`, `enemy-epic-bloater.webp`, `enemy-legendary-gilded-warden.webp`, `enemy-brute-breaker.webp` - transparent, left-facing enemy art with no baked rarity glow; glow is rendered by CSS at runtime
- `combat-sky.webp`, `combat-clouds.webp`, `combat-city.webp`, `combat-bunker-clean.webp`, `combat-ground.webp` - aligned responsive combat parallax layers; the bunker layer uses clean alpha without a light matte fringe and normal blending so its concrete stays fully opaque
- `generator-room.webp`
- `workshop-room.webp`
- `.b64` room-art fallbacks, including the current greenhouse art.

The survivor `-final` name is a historical binary asset name and is intentionally left alone. `walker-final.webp` is retained only as an unused legacy asset so existing cached sessions cannot request a missing file; new combat never references it.

## Current intentional limitations

- One research project can run at a time. It spends scrap up front, completes against a persisted wall-clock deadline and must be installed from the red Research notification.
- Offline earnings modal exists in HTML but offline calculation/collection is not wired yet.
- Combat gun SFX is synthesized through `afterlight:shot`, unlocked by a user gesture and protected by a short spam limit.
- Enemy movement is currently a fast offscreen-right entrance plus hit/death feedback. Full character-specific sprite-sheet animation is intentionally deferred.
- Dealer boosts continue counting down while the game is closed. There is intentionally no inventory: every purchase activates immediately.
- Background music uses the external CC0 Bio-Hazard OGG URL from OpenGameArt.
- Generator and Workshop use direct WebP room art. Greenhouse uses a base64 WebP fallback loader. Other normal rooms currently use stylized backgrounds.
- No service worker is active during development. This is intentional because an earlier worker caused stale production builds.

## Rules for future changes

1. Never create numbered replacements such as `game5.js`, `phase6.css`, `final2.js`, etc.
2. Edit the owning module. If a system becomes too large, split it by responsibility, not by version.
3. Put shared game content in `config.js`, not duplicated in multiple systems.
4. Put persistent gameplay data in `AfterlightState`.
5. Prefer runtime events/APIs over duplicate DOM listeners and polling.
6. Delete replaced code after the replacement is verified.
7. Keep `index.html` readable and keep production CSS in `app.css` unless CSS becomes large enough to justify clear feature files.
8. Preserve old save compatibility or add an explicit migration in `state.js`.
9. Run `npm run test:all` after structural or cross-system changes. At minimum run `npm test` after small code changes.
10. Do not reintroduce a service worker during rapid development without an explicit cache/version strategy.

## Fast workflow for a future session

1. Read this file.
2. Read `index.html` only if load order/layout entry points matter.
3. Read the one owning JS module and the relevant section of `app.css`.
4. Implement the feature using existing config/state/APIs/events.
5. Verify the relevant tests. Use `npm run test:all` for structural or major changes.
6. Confirm the GitHub Pages workflow and deployment succeeded before saying a change is live.

This structure is deliberately optimized for rapid AI-assisted iteration and large changes without needing to rediscover the project each session.
