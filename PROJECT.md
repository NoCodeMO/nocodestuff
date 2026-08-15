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
- `js/core/config.js` - shared game content/config: rooms, research, expeditions, specialists, classified rooms, Dealer offers, survivor skins, official Command Center transmissions and the complete enemy/rarity table.
- `js/core/economy.js` - authoritative overflow-safe resource math, two-stage normal-room price curve, sequential bulk quotes and guarded purchase validation.
- `js/core/numbers.js` - one authoritative large-number formatter from K/M through B, T, Qa, Qi, Dc and beyond.
- `js/core/state.js` - one authoritative persistent state object and save migration.
- `js/core/game.js` - economy, combat, normal rooms, room intelligence/progression, HUD, tabs and drawer routing.

### Systems
- `js/systems/missions.js` - 200-mission campaign: the original 50-save-compatible chain plus 15 operations chapters with 150 late-game objectives.
- `js/systems/expeditions.js` - expedition timers, rewards and specialist discovery.
- `js/systems/special-rooms.js` - classified rooms unlocked by specialists.
- `js/systems/research.js` - timed, scrap-funded research, completion badge and claiming.
- `js/systems/merchant.js` - Uranium wallet, Dealer stock, temporary boost timers, purchase rules and runtime multipliers.
- `js/systems/command-center.js` - How to Play, persistent survivor roster, advanced Stats, official messages/rewards, settings and local Commander login/logout.
- `js/systems/offline.js` - persisted, claimable offline production with permanent-rate math, Dealer exclusion and a 12-hour safety cap.
- `js/systems/codex.js` - responsive Infected Codex, persistent first-sighting discovery, locked specimens and exact configured combat intelligence.
- `js/systems/care-package.js` - persisted 90–150 second supply-drop scheduler, fall/landing lifecycle, five-second claims, economy-scaled loot and rare free Dealer activations.

### Presentation/platform
- `js/ui/visuals.js` - configured survivor switching, enemy visuals, per-skin sprite-relative rifle flash, recoil/hit/death feedback, floating kill rewards and resource pulses. Normal room art is declared once in shared config and rendered directly by the room UI.
- `js/audio.js` - background music plus compressed WebAudio UI, combat, reward and research-completion feedback.
- `js/platform.js` - standalone/fullscreen install helpers.

### Validation
- `scripts/validate.js` - zero-dependency JS syntax, local reference and legacy-file checks.
- `scripts/combat-balance.js` - deterministic enemy rarity, asset, horde, glow and income-scaled bounty checks.
- `scripts/merchant-balance.js` - Dealer inventory, boost stacking, Uranium sources, timers and economy guardrails.
- `scripts/room-balance.js` - all eight room artworks, milestone progression, bulk-upgrade costs and room-intelligence UI guardrails.
- `scripts/late-game-economy-check.js` - reproduces the reported 5.63e152/LV 1979 save, verifies the post-quadrillion curve and proves repeated MAX purchases cannot create unlimited money.
- `scripts/mission-balance.js` - exact mission count, unique chapter objectives, permanent multiplier caps, economy-scaled caches and Uranium budget.
- `scripts/command-center-check.js` - Command Center tabs, schema migration, message rewards, account/settings persistence and large-number notation.
- `scripts/offline-balance.js` - offline threshold/cap, efficiency, permanent-rate sourcing, pending-save safety and Uranium exclusion.
- `scripts/codex-check.js` - discovery migration, spawn registration, all six entries, exact multipliers and responsive locked/unlocked archive checks.
- `scripts/care-package-check.js` - transparent production assets, timing, economy scaling, scarce Uranium/Dealer odds, state migration, event/audio wiring and responsive UI guardrails.
- `scripts/landscape-layout-check.js` and `scripts/landscape-probe.html` - static guardrails plus a real 844×390 computed-layout probe for the phone landscape command deck.
- `scripts/survivor-roster-check.js` - starter/classified roster integrity, transparent assets, save migration, selection events and shared recoil/muzzle guardrails.
- `scripts/architect-probe.html` - real-browser Level 100 save migration, permanent unlock, exact x1.5 production multiplier, roster selection and rifle-anchor probe.
- `scripts/smoke.sh` - launches the actual game in headless Chrome and verifies core dynamic UI rendered.
- `npm test` - static validation only.
- `npm run test:browser` - browser startup smoke test only.
- `npm run test:all` - both test layers.
- `.github/workflows/pages.yml` - runs static and browser tests before GitHub Pages deployment. A failed test blocks deployment.

## Script load order

The order in `index.html` is intentional:

1. config
2. economy
3. numbers
4. state
5. expeditions
6. special rooms
7. research
8. merchant
9. command center
10. visuals
11. game
12. Infected Codex
13. offline earnings
14. missions
15. care package
16. audio
17. platform

Do not casually reorder these. Missions loads after game because it owns the custom Missions tab click handler. Visuals loads before game so it receives initial combat events. Expeditions and special rooms load before game so their APIs are available to the first render/economy tick.

## State: one source of truth

The production save key remains `afterlight_v4` for backward compatibility, but the current schema is `schema: 15`.

`window.AfterlightState` owns the in-memory state and persistence. Systems must not independently read/write the main save through `localStorage`.

Main shape:

```text
resources: coins, total, food, water, power, scrap, science, uranium
progress: kills, bunker, rooms, research, stats (including discovered infected, rarity kills, criticals, best streak, hordes, Brute Cores and Uranium earned/spent)
researchRuntime: { active, ready }
missions: { claimed, bonuses }
expeditions: { active, survivors, pending }
specialRooms: { [roomId]: level }
survivorSkins: { selected, unlocked }
merchant: { active, purchases, spent, freeActivations, legacyMissionGrantDone }
carePackage: { nextAt, active, opened, missed }
offline: { pending, totalClaims, totalSeconds }
command: { read, claimed, lastTab, account: { loggedIn, name, createdAt } }
settings: { music, uiSfx, reducedEffects }
```

`state.js` automatically imports legacy data from:
- `afterlight_missions_v1`
- `afterlight_expedition_runtime_v1`
- `afterlight_special_rooms_v1`
- `afterlight_music`

Do not create another persistent gameplay store unless there is a strong reason. Extend the unified state instead.

## Public runtime APIs

- `window.AfterlightConfig`
- `window.AfterlightEconomy`
- `window.AfterlightNumbers`
- `window.AfterlightState`
- `window.AfterlightGame`
- `window.AfterlightMissions`
- `window.AfterlightExpeditions`
- `window.AfterlightSpecialRooms`
- `window.AfterlightResearch`
- `window.AfterlightMerchant`
- `window.AfterlightCommandCenter`
- `window.AfterlightCodex`
- `window.AfterlightCarePackage`
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
- `afterlight:merchant-free-activated` - emitted when a care-package jackpot activates a no-cost five-minute Dealer contract without spending Uranium.
- `afterlight:care-package-spawned` - emitted once when an economy-scaled drop begins descending.
- `afterlight:care-package-landed` - emitted once on road impact and owns the dedicated landing thud.
- `afterlight:care-package-opened` - emitted after its persisted reward is claimed and owns the long-form cache fanfare/reveal.
- `afterlight:care-package-missed` - emitted when the five-second claim window expires without a penalty.
- `afterlight:room-upgraded` - emitted after a successful normal-room upgrade; includes its exact level range, total cost and any newly reached milestone.
- `afterlight:dev-reward-claimed` - emitted once after a Command Center supply reward is safely added to the unified save; owns its fanfare.
- `afterlight:account` - local Commander login state changed.
- `afterlight:settings-changed` - visual accessibility settings changed and presentation systems should refresh.
- `afterlight:survivor-selected` - persisted survivor selection changed; visuals swap art and its configured muzzle anchor without replacing combat logic.

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
- `offlineMult` increases the 35% offline efficiency, with a hard 90% safety cap.

Special-room production is returned by `AfterlightSpecialRooms.rates()` and integrated into the core economy. Do not add another production interval that writes resources independently.

Enemy encounters use one weighted table with an exact 100% total: Common 55%, Uncommon 25%, Rare 12%, Epic 5%, Legendary 2% and Brute 1%. Every non-Brute encounter has a 12% base horde chance, with a persisted pity counter guaranteeing a horde by the eighth eligible encounter. Brutes can never become hordes and neither advance nor reset that counter. A horde contains exactly three infected and grants exactly x3 HP, coins, scrap and kill credit compared with that same single infected.

The first actual spawn of each configured enemy is persisted through `stats.discovered`; old saves automatically unlock entries backed by existing rarity kills. Clicking the enemy status card opens the Infected Codex. Locked entries remain silhouettes while discovered entries show the shared configured sprite, base chance, lifetime kills, HP multiplier, Coin multiplier, Scrap multiplier and encounter notes.

The base zombie bounty is the greatest of a progression floor and 0.08% of actual hourly coin production. For example, a bunker producing 1,000,000 coins/hour gets an 800-coin Common base bounty before rarity, horde, research and mission multipliers. This keeps kills useful in both early and late game without letting combat replace the bunker economy. Brutes are outside the rarity glow system and always award one exclusive Brute Core.

Uranium Crystals are a deliberately scarce non-passive currency. Every claimed mission awards a tier-scaled amount, expeditions use visible zone-specific crystal chances and every Brute awards exactly one. Existing saves receive a one-time crystal grant for missions already claimed. Uranium is only spent at the Dealer and is never generated by room production or offline income.

The mission campaign contains exactly 200 missions. The original 50 IDs are immutable for save compatibility. The 150 operations missions are grouped into 15 chapters and cover infected kills, Brutes, hordes, rarity hunts, shots, bunker/room progression and research. Their Coin and Scrap caches scale from the player's permanent hourly economy with a progression floor, explicitly divide out temporary Dealer boosts, and their small permanent bonuses are capped by balance tests. Mission Uranium ranges from one to six per claim so the full chain cannot flood the Dealer economy.

Dealer boosts activate immediately and use persisted wall-clock deadlines. The 5x and 10x coin contracts share one channel and cannot stack with each other; different channels can stack. The intended maximum coin combination is the 10x coin contract with the expensive 3x everything contract, for a temporary 30x total. That everything contract also triples all other resource production, manual damage and infected bounties. Repurchasing the same active contract extends its remaining time rather than wasting it.

Care packages arrive on a persisted randomized 90–150 second schedule while the game is visible. Their five-second claim window starts only after the 1.35-second parachute landing. Every claimed cache gives Coins, Scrap and one survival resource scaled from permanent production with early-game floors; temporary Dealer multipliers are divided out before reward calculation. Uranium is capped to a 10% one-crystal roll and a random free five-minute Dealer contract is a rare 4% jackpot (about 1.2 expected jackpots per perfect-attention hour). Free contracts use the shared Dealer channel rules, activate immediately and never spend Uranium. Missed drops simply schedule the next encounter.

Normal-room production keeps the original 1.18 per-level growth. Room costs keep the original 1.62 growth through the early game, then transition continuously near one quadrillion to 1.18 late-game growth so prices remain meaningful and finite for established saves instead of freezing at the old 9.01Qa JavaScript limit. Levels 5, 10, 25 and 50 add derived permanent room multipliers of x1.25, x1.5, x2 and x3. These bonuses are calculated from room level, so old saves receive them automatically without migration. Bulk x10 costs are the exact sum of sequential upgrades; MAX buys only the levels the current coin balance can fully fund. Every quote is validated again inside the state transaction, invalid/overflowed prices are rejected and all resources use a finite 1e300 ceiling. The explicit room-level ceiling is 3500 so the Number-based economy can never silently enter `Infinity`.

Every four combined normal-room levels grant one Bunker Level. The Base screen exposes this exact 0–4 progression in a live accessible bar, driven by the same shared `bunkerLevelEvery` economy constant used by save normalization and core recalculation.

Phone landscape mode (560px+ wide and at most 600px high) uses a dedicated command-deck layout instead of the desktop stack: a compact resource HUD, a notch-safe vertical navigation rail, combat on the left and a persistent two-column room deck on the right. The first four room cards must fit without scrolling at the 844×390 reference viewport. Drawers, missions and room intelligence also receive landscape-specific full-area compositions.

All production, price and reward UI uses `AfterlightNumbers`. Suffixes progress through K, M, B, T, Qa, Qi, Sx, Sp, Oc, No and Dc before continuing into higher tiers and scientific notation. Do not reintroduce local `fmt` implementations in individual systems.

Official Command Center messages are release-configured in `COMMAND_MESSAGES`. A message reward is always claim-once through `command.claimed`; its coin component can scale from current hourly production while fixed Uranium remains scarce. The current Commander login is explicitly local-device only and never claims to be cloud authentication.

The Command survivor roster is configured once in `SURVIVOR_SKINS`. Both Ranger starters are permanently unlocked for new and old saves and are cosmetic/economically equal. Gideon Rook, The Architect, is permanently added to an old or new save at Bunker Level 100. While selected, he grants +0.5% all passive production per Bunker Level: exactly +50% at unlock, capped at +100% from Level 200 onward. The bonus uses the shared production path, so normal rooms, special rooms, live statistics and offline earnings agree; manual damage and one-time rewards are intentionally excluded. Four future Prestige slots retain stable IDs and level requirements but deliberately contain no asset, identity or appearance data. Every selectable survivor shares the same shot event, recoil and short muzzle animation while using per-skin normalized muzzle metadata.

Offline production starts after one minute away and is capped at 12 hours per load. It uses the authoritative permanent room/special-room rates at 35% base efficiency, applies mission `offlineMult` up to a 90% hard cap, divides out temporary Dealer boosts and never generates Uranium. Calculated gains are persisted as a pending claim before the collection modal opens, so closing the game cannot lose them.

## Assets

Only active assets remain in `assets/`:
- `survivor-ranger.png`, `survivor-ranger-female.webp`, `survivor-architect.webp` - transparent selectable survivor art. The two Rangers are starter cosmetics; the optimized Architect is the revealed Bunker Level 100 reward. Their muzzle flash stays a separate short-lived game effect anchored from each skin's normalized config metadata, so recoil and responsive scaling cannot detach it from the rifle.
- `enemy-common-drifter.webp`, `enemy-uncommon-cinderback.webp`, `enemy-rare-blue-shield.webp`, `enemy-epic-bloater.webp`, `enemy-legendary-gilded-warden.webp`, `enemy-brute-breaker.webp` - transparent, left-facing enemy art with no baked rarity glow; glow is rendered by CSS at runtime
- `combat-sky.webp`, `combat-clouds.webp`, `combat-city.webp`, `combat-bunker-clean.webp`, `combat-ground.webp` - aligned responsive combat parallax layers; the bunker layer uses clean alpha without a light matte fringe and normal blending so its concrete stays fully opaque
- `room-generator.webp`, `room-workshop.webp`, `room-greenhouse.webp`, `room-purifier.webp`, `room-lab.webp`, `room-living.webp`, `room-storage.webp`, `room-turret.webp` - one crop-safe 1600×508 WebP set shared by room cards and the large room-intelligence screen
- `care-package-airborne.png`, `care-package-crate.png` - true-alpha matching care-package states; the parachute is used only during descent and the closed crate receives its glow, dust, timer and reward effects at runtime

`survivor-final.webp` and `walker-final.webp` are retained only as unused legacy assets so existing cached sessions cannot request missing files; new combat references neither one.

## Current intentional limitations

- One research project can run at a time. It spends scrap up front, completes against a persisted wall-clock deadline and must be installed from the red Research notification.
- Offline earnings are claimable and persisted; production beyond the 12-hour cap is intentionally discarded.
- Combat gun SFX is synthesized through `afterlight:shot`, unlocked by a user gesture and protected by a short spam limit.
- Enemy movement is currently a fast offscreen-right entrance plus hit/death feedback. Full character-specific sprite-sheet animation is intentionally deferred.
- Dealer boosts continue counting down while the game is closed. There is intentionally no inventory: every purchase activates immediately.
- Commander login is a local profile stored inside the unified save. Secure cloud accounts and cross-device save sync require a future backend and are not simulated.
- Care packages currently use one shared visual design and one fall/landing motion. Reward contents vary, but crate variants and opening sprite-sheet animation are intentionally deferred.
- Prestige reset, Prestige bonuses and future survivor reveals are not implemented yet. Locked roster slots intentionally expose only their required Prestige level and no character artwork.
- Background music uses the external CC0 Bio-Hazard OGG URL from OpenGameArt.
- Normal rooms have a dedicated detail screen with live current/next output, per-minute/per-hour rates, contribution share, milestone status, affordability timing and x1/x10/MAX buying. Classified specialist rooms intentionally remain on their separate system for now.
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
