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
- `js/core/config.js` - shared game content/config: rooms, research, expeditions, specialists, classified rooms, Dealer offers, all survivor skins/dialogue, the five-level Prestige curve, official Command Center transmissions and the complete enemy/rarity table.
- `js/core/economy.js` - authoritative overflow-safe resource math, smooth scalable normal-room price curve, sequential bulk quotes and guarded purchase validation.
- `js/core/numbers.js` - one authoritative large-number formatter from K/M through B, T, Qa, Qi, Dc and beyond.
- `js/core/state.js` - one authoritative persistent state object and save migration.
- `js/core/game.js` - economy, combat, normal rooms, room intelligence/progression, HUD, tabs and drawer routing.

### Systems
- `js/systems/missions.js` - 200-mission campaign: the original 50-save-compatible chain plus 15 operations chapters with 150 late-game objectives.
- `js/systems/expeditions.js` - Food/Water-funded expedition timers, sustainable-economy rewards, scarce Uranium rolls and specialist discovery.
- `js/systems/special-rooms.js` - classified rooms unlocked by specialists.
- `js/systems/research.js` - timed, dual Scrap/Science-funded research, completion badge and claiming.
- `js/systems/merchant.js` - Uranium wallet, Dealer stock, temporary boost timers, purchase rules and runtime multipliers.
- `js/systems/command-center.js` - How to Play, persistent survivor roster, advanced Stats, official messages/rewards, settings and local Commander login/logout.
- `js/systems/offline.js` - persisted, claimable offline production using sustainable no-reserve rates, Dealer exclusion and a 12-hour safety cap.
- `js/systems/codex.js` - responsive Infected Codex, persistent first-sighting discovery, locked specimens and exact configured combat intelligence.
- `js/systems/care-package.js` - persisted 90–150 second supply-drop scheduler, fall/landing lifecycle, five-second claims, economy-scaled loot and rare free Dealer activations.
- `js/systems/survivor-dialogue.js` - survivor-specific idle, kill, streak, horde and Brute barks with contextual selection, typewriter timing and a single spam-safe scene bubble.
- `js/systems/prestige.js` - five-cycle reset transaction, permanent multipliers, Prestige Cores, five Prestige Rooms, Cycle Contracts, Automation/Archive configuration and survivor reveal presentation.
- `js/systems/operations.js` - strategic normal-room supply allocation, five-minute reserves, Workforce capacity, priorities, pausing, efficiency states and exact recovery guidance.

### Presentation/platform
- `js/ui/visuals.js` - configured survivor switching, enemy visuals, per-skin sprite-relative rifle flash, recoil/hit/death feedback, dedicated sprite-sheet corpse sequences, floating kill rewards and resource pulses. Normal room art is declared once in shared config and rendered directly by the room UI.
- `js/audio.js` - background music plus compressed WebAudio UI, combat, reward, research-completion and gesture-safe survivor voice feedback.
- `js/platform.js` - standalone/fullscreen install helpers.

### Validation
- `scripts/validate.js` - zero-dependency JS syntax, local reference and legacy-file checks.
- `scripts/combat-balance.js` - deterministic enemy rarity, live/death asset, horde, glow, death timing and income-scaled bounty checks.
- `scripts/merchant-balance.js` - Dealer inventory, boost stacking, Uranium sources, timers and economy guardrails.
- `scripts/room-balance.js` - all eight room artworks, milestone progression, bulk-upgrade costs and room-intelligence UI guardrails.
- `scripts/late-game-economy-check.js` - reproduces the reported 5.63e152/LV 1979 save, verifies the post-quadrillion curve and proves repeated MAX purchases cannot create unlimited money.
- `scripts/mission-balance.js` - exact mission count, unique chapter objectives, permanent multiplier caps, economy-scaled caches and Uranium budget.
- `scripts/command-center-check.js` - Command Center tabs, schema migration, message rewards, account/settings persistence and large-number notation.
- `scripts/offline-balance.js` - offline threshold/cap, efficiency, permanent-rate sourcing, pending-save safety and Uranium exclusion.
- `scripts/codex-check.js` - discovery migration, spawn registration, all six entries, exact multipliers and responsive locked/unlocked archive checks.
- `scripts/care-package-check.js` - transparent production assets, timing, economy scaling, scarce Uranium/Dealer odds, state migration, event/audio wiring and responsive UI guardrails.
- `scripts/landscape-layout-check.js` and `scripts/landscape-probe.html` - static guardrails plus a real 844×390 computed-layout probe for the phone landscape command deck.
- `scripts/survivor-roster-check.js` - starter/Architect/Prestige roster integrity, transparent assets, save migration, selection events and shared recoil/muzzle guardrails.
- `scripts/survivor-dialogue-check.js` - all eight survivor voices, contextual pools/odds, typewriter events, responsive bubble CSS, reduced-motion behavior and gesture-safe retro voice bleeps.
- `scripts/economy-rebalance-check.js` - deterministic fresh-cycle simulator, Prestige pacing envelope, Mastery curve, mission caps, Dealer exclusivity and destructive-reset guardrails.
- `scripts/account-reset-check.js` and `scripts/account-reset-probe.html` - executable storage isolation plus a real delete/pagehide/reload regression probe that prevents deleted progress from being resurrected by autosave.
- `scripts/death-animation-probe.html` - real-browser Common-horde kill probe that verifies three synchronized death frames, corpse persistence, fast respawn and cleanup.
- `scripts/operations-balance-check.js` - Power/Water/Food/Scrap/Science/Workforce allocation, reserve drain, priority order, pause/resume and underperformance UI guardrails.
- `scripts/cross-system-balance-check.js` - executable dual-cost Research, ration-funded Expedition, Dealer-free reward, sustainable offline and attention-reward math.
- `scripts/prestige-balance-check.js` - all five targets, survivors, active/permanent perk math, capped Core curve, reset boundaries, room costs and cross-system multiplier wiring.
- `scripts/prestige-probe.html` - real-browser schema-15 migration plus transactional Prestige I–V reset, preservation, recovery backup, unlock, art, muzzle-anchor and multiplier probe.
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
5. prestige
6. room operations
7. expeditions
8. special rooms
9. research
10. merchant
11. command center
12. visuals
13. survivor dialogue
14. game
15. Infected Codex
16. offline earnings
17. missions
18. care package
19. audio
20. platform

Do not casually reorder these. Prestige loads before every economy consumer so research, expeditions and the first game tick share its multipliers. Room operations loads before game because `AfterlightGame.rates()` is the authoritative net-production calculation. Missions loads after game because it owns the custom Missions tab click handler. Visuals loads before game so it receives initial combat events. Expeditions and special rooms load before game so their APIs are available to the first render/economy tick.

## State: one source of truth

The production save key remains `afterlight_v4` for backward compatibility, but the current schema is `schema: 19`.

`window.AfterlightState` owns the in-memory state and persistence. Systems must not independently read/write the main save through `localStorage`.

Main shape:

```text
resources: coins, total, food, water, power, scrap, science, uranium
progress: kills, bunker, rooms, research, stats (including discovered infected, rarity kills, criticals, best streak, hordes, Brute Cores and Uranium earned/spent)
researchRuntime: { active, ready }
missions: { claimed, bonuses, balanceVersion }
operations: { priorities: { [roomId]: essential|normal|low }, paused: { [roomId]: boolean } }
expeditions: { active, survivors, pending }
specialRooms: { [roomId]: level }
prestige: { level, cores, totalResets, bestBunker, lastAt, lastReward, rooms, automation, archive, run }
survivorSkins: { selected, unlocked }
merchant: { active, purchases, spent, freeActivations, legacyMissionGrantDone }
carePackage: { nextAt, active, opened, missed }
offline: { pending, totalClaims, totalSeconds }
command: { read, claimed, lastTab, account: { loggedIn, name, createdAt } }
settings: { music, uiSfx, reducedEffects }
```

`AfterlightState.resetAll('RESET')` is the only full-account deletion path. It first locks and stops autosave, unregisters page-hide/visibility saves, removes every `afterlight*` key from local and session storage, then uses a cache-busted replacement navigation to create a clean schema-19 save. This order is critical: deleting storage before guarding `pagehide` lets the departing page write the old account back. The reset intentionally leaves unrelated same-origin data and the browser cache untouched; cache files do not contain game progress. The Command Center protects it with an exact `RESET` phrase plus a touch-stable three-second pointer-captured hold; never add an unguarded reset shortcut. New accounts and migrated pre-schema-19 saves receive 25 Food and 25 Water so the first short Expedition can be learned without a resource soft-lock.

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
- `window.AfterlightPrestige`
- `window.AfterlightOperations`
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
- `window.AfterlightSurvivorDialogue`
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
- `afterlight:research-complete` - a persisted Research timer finished and the red claim notification became active.
- `afterlight:mission-claimed` - emitted after a successful claim; owns the mission reward fanfare.
- `afterlight:expedition-started` - emitted after Food/Water rations are atomically deducted and the sustainable reward rates are captured.
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
- `afterlight:survivor-dialogue-start` - a contextual/idle line begins; includes the survivor profile and dialogue context.
- `afterlight:survivor-dialogue-letter` - one audible typewriter character appears; audio owns the short, profile-specific retro bleep.
- `afterlight:survivor-dialogue-complete` - the complete line is visible and its hold timer has started.
- `afterlight:prestige-complete` - emitted only after a verified reset transaction; owns the survivor reveal, visuals swap and long Prestige fanfare.
- `afterlight:prestige-room` - a permanent Prestige Room was upgraded with Cores.
- `afterlight:prestige-contract` - all five current-cycle contracts were completed and their one bonus Core was claimed.

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

Every built normal room participates in the operations network. The Generator is self-starting; the Purifier, Greenhouse and Living Quarters retain a small emergency recovery floor so a bad allocation cannot permanently soft-lock a run. Other rooms need configured combinations of Power, Water, Food, Scrap, Science and virtual Workforce. Living Quarters plus one starting survivor provide Workforce; Power/Water/Food/Scrap/Science use current production plus at most one five-minute stock reserve. When demand exceeds supply, Essential rooms receive resources before Normal and Low rooms. A paused room produces nothing and releases its load. Efficiency below 90% creates a visible room-card alert, while the room screen shows exact required/supplied rates, the bottleneck and a direct upgrade or priority recommendation. `AfterlightGame.rates({useReserves:false,cache:false})` is the required sustainable-rate path for long-lived rewards: it ignores temporary stockpiles and does not overwrite the live UI snapshot.

Enemy encounters use one weighted table with an exact 100% total: Common 55%, Uncommon 25%, Rare 12%, Epic 5%, Legendary 2% and Brute 1%. Every non-Brute encounter has a 12% base horde chance, with a persisted pity counter guaranteeing a horde by the eighth eligible encounter. Brutes can never become hordes and neither advance nor reset that counter. A horde contains exactly three infected and grants exactly x3 HP, coins, scrap and kill credit compared with that same single infected.

The Drifter is the first completed character-specific death rollout. Its true-alpha horizontal sheet contains Impact, Collapse and Corpse frames on one shared ground baseline. Core combat includes the configured death asset in `afterlight:enemy-killed`; visuals snapshot the responsive encounter bounds, render the sequence in a separate corpse unit and hide only the defeated live unit. The final frame uses a wider source window because the horizontal corpse extends into the previous equal third; keep its vertical position at 52% so the complete corpse remains on the shared ground baseline. Do not restore a naive 300%/100% crop or the top/back of the skull will be clipped. The next encounter starts after the 390ms fall while the corpse remains for 1.5 seconds, so respawn never erases the corpse. Hordes create three synchronized frame players. At most three corpse units may coexist to keep rapid clicking safe. Future infected death sheets must reuse `deathAsset` and this renderer instead of introducing enemy-specific timers or kill listeners.

The first actual spawn of each configured enemy is persisted through `stats.discovered`; old saves automatically unlock entries backed by existing rarity kills. Clicking the enemy status card opens the Infected Codex. Locked entries remain silhouettes while discovered entries show the shared configured sprite, base chance, lifetime kills, HP multiplier, Coin multiplier, Scrap multiplier and encounter notes.

Prestige has five deliberate reset targets: Bunker Levels 100, 200, 325, 525 and 850. The first two are explicit and later targets follow the shared rounded ×1.62 curve so future levels can extend it without hand-written jumps. Each reset grants exactly one permanent survivor, ×1.65 all production and ×1.25 manual damage per Prestige level, plus +5% all production for each unlocked Prestige survivor. The larger production legacy deliberately compensates the much longer late-cycle room curve without making the first cycle faster. A reset at the exact target gives one Prestige Core; additional Cores require another 10% of that cycle's target per Core (rounded to 25 and capped at three). The transaction writes one recovery snapshot to `afterlight_prestige_backup_v1`, then resets current-cycle resources, normal/specialist rooms, run kills and unarchived research. It preserves Uranium, lifetime totals, missions/bonuses, specialists/active expeditions, Dealer boosts, discoveries, unlocked survivors, Prestige Cores and Prestige Rooms. Active research and pending offline income are intentionally cleared to prevent cross-cycle duplication.

Prestige Rooms are permanent and capped at Level 3 with exact Core costs of 1, 2 and 3: Legacy Vault retains 8% Scrap per level on the next reset; Automation Bay provides one four-second normal-room auto-upgrade target per level; Command Relay adds 10% expedition speed and loot per level; War Room adds 8% damage and infected loot per level; Archive Core preserves one selected completed research project per level. Five scaled Cycle Contracts become active after Prestige I and award one claim-once bonus Core each cycle.

The base zombie bounty is the greatest of a progression floor and 0.08% of actual hourly coin production. For example, a bunker producing 1,000,000 coins/hour gets an 800-coin Common base bounty before rarity, horde, research and mission multipliers. This keeps kills useful in both early and late game without letting combat replace the bunker economy. Brutes are outside the rarity glow system and always award one exclusive Brute Core.

Uranium Crystals are a deliberately scarce non-passive currency. Every claimed mission awards one to three crystals based on its unlock tier, expeditions use visible zone-specific chances from 5% to 60% and every Brute awards exactly one. The full 200-mission chain supplies roughly 260 crystals rather than an unlimited recurring faucet. Existing saves receive a one-time crystal grant for missions already claimed. Uranium is only spent at the Dealer and is never generated by room production or offline income.

The mission campaign contains exactly 200 missions. The original 50 IDs are immutable for save compatibility. The 150 operations missions are grouped into 15 chapters and cover infected kills, Brutes, hordes, rarity hunts, shots, bunker/room progression and research. Their Coin and Scrap caches scale from the player's sustainable permanent hourly economy with a progression floor; both five-minute reserves and temporary Dealer boosts are excluded. Permanent bonuses are rebuilt once under `balanceVersion: 1` for existing saves and remain within shared hard caps (including ×2.5 production/resources, ×1.75 Coins and a 0.75 room-cost floor), preventing the old mission chain from compounding into runaway progress.

Dealer boosts activate immediately and use persisted wall-clock deadlines. The ×5 Coins, ×10 Coins and ×3 Everything contracts share the single `overdrive` channel, so buying one replaces the others and the temporary all-production ceiling is ×10 rather than the previous ×30 stack. The rebalance costs are 25/60/75 Uranium for those three contracts, with the remaining specialist contracts priced from 30–50. Repurchasing the same active contract extends its remaining time rather than wasting it.

Care packages arrive on a persisted randomized 90–150 second schedule while the game is visible. Their five-second claim window starts only after the 1.35-second parachute landing. Every claimed cache gives Coins, Scrap and one survival resource scaled from sustainable permanent production with early-game floors; five-minute reserves and temporary Dealer multipliers are excluded. Uranium is a 4% one-crystal roll (about 1.2 per perfect-attention hour) and a random free five-minute Dealer contract is a 1.2% jackpot (about 0.36 per perfect-attention hour). Free contracts use the shared Dealer channel rules, activate immediately and never spend Uranium. Missed drops simply schedule the next encounter.

Normal rooms use a smooth 1.142 price curve whose scale ramps from ×1 to ×125 across the opening levels, while output grows at 1.07 per level. The higher scale is what moves Prestige I from a short session into roughly a full passive day. Every block of 100 room levels is one Mastery Rank: local levels 5, 10, 25, 50, 75 and 100 award x1.25, x1.5, x2, x3, x4 and x5 room multipliers, then the sequence repeats without an output drop at the next rank. This makes all 100 levels meaningful and lets established saves continue through the explicit Level 5000 ceiling. Bulk x10 costs are the exact sum of sequential upgrades; MAX buys at most 500 levels and only those the current Coin balance can fully fund. Every quote is validated again inside the state transaction, invalid/overflowed prices are rejected and all resources use a finite 1e300 ceiling.

The deterministic passive simulator is a pacing guardrail, not a promise about every play style. It runs the same room operating-cost network with empty reserves. With no combat, mission caches, care packages, offline claims or temporary Dealer boosts, its current fresh-cycle baselines are approximately 25.2h to Prestige I, 76.3h to Prestige II, 72.1h to Prestige III, 92.4h to Prestige IV and 138.4h to Prestige V. Active play and well-managed reserves shorten those cycles, while careless room allocation lengthens them. Future economy changes must keep the opening cycle near one passive day, the middle cycles near one to four days and the high fifth cycle below one week unless deliberately redesigned.

Every four combined normal-room levels grant one Bunker Level. The Base screen exposes this exact 0–4 progression in a live accessible bar, driven by the same shared `bunkerLevelEvery` economy constant used by save normalization and core recalculation.

Phone landscape mode (560px+ wide and at most 600px high) uses a dedicated command-deck layout instead of the desktop stack: a compact resource HUD, a notch-safe vertical navigation rail, combat on the left and a persistent two-column room deck on the right. The first four room cards must fit without scrolling at the 844×390 reference viewport. Drawers, missions and room intelligence also receive landscape-specific full-area compositions.

All production, price and reward UI uses `AfterlightNumbers`. Suffixes progress through K, M, B, T, Qa, Qi, Sx, Sp, Oc, No and Dc before continuing into higher tiers and scientific notation. Do not reintroduce local `fmt` implementations in individual systems.

Official Command Center messages are release-configured in `COMMAND_MESSAGES`. A message reward is always claim-once through `command.claimed`; its coin component can scale from current hourly production while fixed Uranium remains scarce. The current Commander login is explicitly local-device only and never claims to be cloud authentication.

The Command survivor roster is configured once in `SURVIVOR_SKINS`. Both Ranger starters are permanently unlocked for new and old saves and are cosmetic/economically equal. Gideon Rook, The Architect, is permanently added to an old or new save at Bunker Level 100. While selected, he grants +0.5% all passive production per Bunker Level: exactly +50% at unlock, capped at +100% from Level 200 onward. The five Prestige survivors stay visually classified until unlocked: Mara Voss (Rare, +40% Scrap), Knox Ward (Rare, -12% room cost), Malik Graves (Epic, -25% expedition time and +30% loot), Cole Ash (Epic, +50% damage and infected loot) and Dr. Elara Sable (Legendary, -25% research cost/time and +50% critical damage). Every selectable survivor shares the same shot event, recoil and short muzzle animation while using per-skin normalized muzzle metadata. `SURVIVOR_DIALOGUE` gives all eight characters a distinct voice and short pools for idle, normal kill, streak, horde and Brute contexts; new lines belong in that config instead of the presentation or audio modules.

Research projects spend both Scrap and Science up front in one state transaction. Both prices scale exponentially with project level, while the persisted wall-clock timer and red claim notification retain the existing one-project-at-a-time loop. This makes the Research Lab's Science output a progression input rather than another passive score.

Expeditions spend their displayed Food and Water ration cost when deployed. The cost is the greater of a per-zone floor and a configured number of seconds of sustainable Food/Water production, so it stays relevant without becoming impossible for a new save. Coin and Scrap previews/rewards similarly capture sustainable permanent production at deployment, use zone-specific reward-time bands plus early floors, and ignore Dealer boosts. Longer zones improve specialist discovery access and Uranium efficiency instead of becoming an unchecked currency faucet.

Offline production starts after one minute away and is capped at 12 hours per load. It uses the authoritative sustainable room/special-room rates with stock reserves disabled at 35% base efficiency, applies mission `offlineMult` up to a 90% hard cap, divides out temporary Dealer boosts and never generates Uranium. Its modal reports how many rooms were supply-limited during the calculation. Calculated gains are persisted as a pending claim before the collection modal opens, so closing the game cannot lose them.

## Assets

Only active assets remain in `assets/`:
- `survivor-ranger.png`, `survivor-ranger-female.webp`, `survivor-architect.webp`, `survivor-prestige-mara.webp`, `survivor-prestige-knox.webp`, `survivor-prestige-malik.webp`, `survivor-prestige-cole.webp`, `survivor-prestige-elara.webp` - transparent selectable survivor art. The two Rangers are starter cosmetics; the Architect is the Bunker Level 100 reward; the remaining five unlock sequentially through Prestige. Their muzzle flash stays a separate short-lived game effect anchored from each skin's responsive unit coordinates, so recoil and scaling cannot detach it from the weapon. Rare/Epic/Legendary glow is rendered at runtime rather than baked into the sprite.
- `enemy-common-drifter.webp`, `enemy-uncommon-cinderback.webp`, `enemy-rare-blue-shield.webp`, `enemy-epic-bloater.webp`, `enemy-legendary-gilded-warden.webp`, `enemy-brute-breaker.webp` - transparent, left-facing enemy art with no baked rarity glow; glow is rendered by CSS at runtime
- `enemy-common-drifter-death.png` - true-alpha three-frame Impact/Collapse/Corpse sheet for the Common Drifter; the game crops its cells at runtime so it loads once for single encounters and hordes
- `enemy-uncommon-cinderback-death.png` - normalized true-alpha three-frame death sheet for the Uncommon Cinderback; each 700x760 cell shares one baseline and needs no custom overlap crop
- `combat-sky.webp`, `combat-clouds.webp`, `combat-city.webp`, `combat-bunker-clean.webp`, `combat-ground.webp` - aligned responsive combat parallax layers; the bunker layer uses clean alpha without a light matte fringe and normal blending so its concrete stays fully opaque
- `room-generator.webp`, `room-workshop.webp`, `room-greenhouse.webp`, `room-purifier.webp`, `room-lab.webp`, `room-living.webp`, `room-storage.webp`, `room-turret.webp` - one crop-safe 1600×508 WebP set shared by room cards and the large room-intelligence screen
- `care-package-airborne.png`, `care-package-crate.png` - true-alpha matching care-package states; the parachute is used only during descent and the closed crate receives its glow, dust, timer and reward effects at runtime

`survivor-final.webp` and `walker-final.webp` are retained only as unused legacy assets so existing cached sessions cannot request missing files; new combat references neither one.

## Current intentional limitations

- One research project can run at a time. It spends Scrap and Science up front, completes against a persisted wall-clock deadline and must be installed from the red Research notification.
- Offline earnings are claimable and persisted; production beyond the 12-hour cap is intentionally discarded.
- Combat gun SFX is synthesized through `afterlight:shot`, unlocked by a user gesture and protected by a short spam limit.
- Survivor dialogue uses original synthesized retro bleeps, follows the UI SFX setting and cannot unlock WebAudio without a user gesture. It is intentionally short-form ambient flavor rather than a branching conversation system.
- The Common Drifter now has a complete three-frame death/corpse sequence. Uncommon, Rare, Epic, Legendary and Brute characters still use the short fallback death until their approved sheets are produced; walk/idle sprite animation remains deferred.
- Dealer boosts continue counting down while the game is closed. There is intentionally no inventory: every purchase activates immediately.
- Commander login is a local profile stored inside the unified save. Secure cloud accounts and cross-device save sync require a future backend and are not simulated.
- Care packages currently use one shared visual design and one fall/landing motion. Reward contents vary, but crate variants and opening sprite-sheet animation are intentionally deferred.
- Prestige currently stops at the completed fifth cycle. Repeatable post-Prestige-V reclamation resets and Prestige 6–10 are intentionally deferred; they must extend the same bounded Core/reset model rather than bypass it.
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
