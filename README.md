# Bunkr: Last Shelter

Post-apocalyptic idle clicker and bunker builder, deployed as a static GitHub Pages app.

**Live:** https://nocodemo.github.io/nocodestuff/

## Start here

For development, read **`PROJECT.md` first**. It contains the current architecture, state schema, public APIs, event flow, known limitations and the fastest workflow for future changes.

## Production structure

```text
index.html
app.css                 # generated compact production build
styles/app.css          # authoritative readable CSS source
manifest.webmanifest
PROJECT.md
.gitattributes
.gitignore

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
scripts/
  run-tests.js
  asset-audit-check.js
  format-css.js
  validate.js
  smoke.sh
```

There are no numbered game versions or phase stylesheets in production. Git history is the version history.

## Validation

No npm dependencies are required.

```bash
npm test              # JS syntax + file/reference checks
npm test -- economy   # run only matching checks while developing
npm run format:css    # format styles/app.css and rebuild app.css
npm run test:browser  # boots the real game in headless Chrome
npm run test:all      # both
```

The static runner also rejects missing or unexplained assets and unformatted CSS. The browser smoke test verifies that the core game and dynamic systems actually initialize. GitHub Pages only deploys after both validation layers pass.

## Deployment

Pushes to `main` deploy through `.github/workflows/pages.yml`. The workflow validates and boots the project before GitHub Pages deployment.

## Persistence

The game uses one authoritative runtime state through `window.BunkrState`. The canonical storage key is `bunkr_last_shelter_v1`; existing `afterlight_v4` saves migrate automatically without deleting the rollback copy. Current data is normalized to schema 20.
