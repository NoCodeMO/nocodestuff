# Afterlight Bunker

Post-apocalyptic idle clicker and bunker builder, deployed as a static GitHub Pages app.

**Live:** https://nocodemo.github.io/nocodestuff/

## Start here

For development, read **`PROJECT.md` first**. It contains the current architecture, state schema, public APIs, event flow, known limitations and the fastest workflow for future changes.

## Production structure

```text
index.html
app.css
manifest.webmanifest

js/
  core/
    config.js
    state.js
    game.js
  systems/
    missions.js
    expeditions.js
    special-rooms.js
  ui/
    visuals.js
  audio.js
  platform.js

assets/
scripts/validate.js
```

There are no numbered game versions or phase stylesheets in production. Git history is the version history.

## Validation

No dependencies are required.

```bash
npm test
```

The validator checks JavaScript syntax, local HTML/CSS references and prevents old numbered runtime files from creeping back into the repo.

## Deployment

Pushes to `main` deploy through `.github/workflows/pages.yml`. The workflow validates the project before GitHub Pages deployment.

## Persistence

The game uses one authoritative runtime state through `window.AfterlightState`. The storage key remains `afterlight_v4` so existing players keep their save; current data is migrated to schema 5 automatically.
