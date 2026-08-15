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
- `js/core/config.js` - game content/config shared by systems: normal rooms, research definitions, expeditions, specialists and classified rooms.
- `js/core/state.js` - one authoritative persistent state object and save migration.
- `js/core/game.js` - economy, combat, normal rooms, HUD, tabs and drawer routing.

### Systems
- `js/systems/missions.js` - 50 mission chain and permanent bonuses.
- `js/systems/expeditions.js` - expedition timers, rewards and specialist discovery.
- `js/systems/special-rooms.js` - classified rooms unlocked by specialists.

### Presentation/platform
- `js/ui/visuals.js` - survivor/enemy visuals, hit feedback, resource pulses and room-art loading.
- `js/audio.js` - background music plus compressed WebAudio UI feedback and gunshots driven by `afterlight:shot`. Reward SFX remain separate follow-up work.
- `js/platform.js` - standalone/fullscreen install helpers.

### Validation
- `scripts/validate.js` - zero-dependency JS syntax, local reference and legacy-file checks.
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
5. visuals
6. game
7. missions
8. audio
9. platform

Do not casually reorder these. Missions loads after game because it owns the custom Missions tab click handler. Visuals loads before game so it receives initial combat events. Expeditions and special rooms load before game so their APIs are available to the first render/economy tick.

## State: one source of truth

The production save key remains `afterlight_v4` for backward compatibility, but the current schema is `schema: 5`.

`window.AfterlightState` owns the in-memory state and persistence. Systems must not independently read/write the main save through `localStorage`.

Main shape:

```text
resources: coins, total, food, water, power, scrap, science
progress: kills, bunker, rooms, research, stats
missions: { claimed, bonuses }
expeditions: { active, survivors, pending }
specialRooms: { [roomId]: level }
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
- `afterlight:enemy` - emitted when a new enemy spawns.
- `afterlight:state` - important state mutation; `detail.reason` describes the change.
- `afterlight:survivors` - specialist roster changed.

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

## Assets

Only active assets remain in `assets/`:
- `survivor-final.webp`
- `walker-final.webp`
- `generator-room.webp`
- `workshop-room.webp`
- `.b64` room-art fallbacks, including the current greenhouse art.

The `-final` names are historical binary asset names and are intentionally left alone because the GitHub text-file tooling cannot safely rename binary files in-place. Do not treat them as duplicate versions.

## Current intentional limitations

- Research definitions are displayed but purchasing/research progression is not wired yet.
- Offline earnings modal exists in HTML but offline calculation/collection is not wired yet.
- Combat gun SFX is synthesized through `afterlight:shot`, unlocked by a user gesture and protected by a short spam limit.
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

