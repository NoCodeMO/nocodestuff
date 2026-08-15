# Afterlight Bunker

Production build for the Afterlight idle bunker game.

## Active structure

### Core
- `index.html` — app shell and asset loading order
- `game4.js` — core economy, combat, rooms, tabs and base rendering
- `style.css` — base layout

### Systems
- `missions.js` / `missions.css` — progression missions and permanent rewards
- `expedition-runtime.js` / `expeditions.css` — expedition timers, loot and survivor discovery
- `special-rooms.js` / `special-rooms.css` — classified specialist rooms
- `music.js` / `music.css` — background music controls
- `shot-audio.js` — combat SFX experiment
- `appmode.js` / `appmode.css` — standalone/PWA presentation helpers

### Visual layers
- `sprite8.js` / `sprite7.css` — survivor/enemy scene sprites and effects
- `room-art.js` / `room-art.css` — bunker room artwork loading
- `polish5.js` / `polish5.css` — UI polish
- `phase2.css`, `phase3.css`, `phase4.css` — legacy styling layers still loaded by production

### Assets kept intentionally
- `assets/survivor-final.webp`
- `assets/walker-final.webp`
- `assets/generator-room.webp`
- `assets/workshop-room.webp`
- `assets/generator-room.b64` and `assets/workshop-room.b64` — fallback room art
- `assets/greenhouse-room.b64` — current greenhouse room art

## Rules for future changes

1. Do not create `game5.js`, `game6.js`, etc. Update the existing feature file instead.
2. New gameplay systems should get one clearly named JS file and, only if needed, one matching CSS file.
3. Experimental assets should not be committed to `assets/` unless they are actually used by the current build.
4. Before deleting a file, verify it is not referenced by `index.html`, CSS `url(...)`, or an active JS module.
5. Prefer descriptive names such as `expedition-runtime.js` over numbered phase names.
6. When an old implementation is replaced, delete it instead of leaving duplicate versions in the repository.
7. Keep localStorage keys backwards compatible unless a migration is added.

## Next cleanup target

The remaining `phase2.css`, `phase3.css`, `phase4.css`, and `polish5.css` can eventually be merged into a smaller stylesheet structure after a visual regression pass. They are intentionally retained for now because the live game still loads them.
