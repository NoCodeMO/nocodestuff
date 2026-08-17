# BUNKR asset conventions

This directory contains production artwork unless a file is explicitly listed as a source or compatibility asset below.

## Runtime conventions

- `combat-*` files are the layered road scene and combat feedback assets.
- `enemy-*` files are living or death sprite sheets.
- `expedition-*.webp` files are destination dossiers; matching `expedition-map-*.webp` files are their atlas miniatures.
- `room-*.webp` files are the authoritative normal-room artworks.
- `survivor-*.webp` and `survivor-ranger.png` are selectable survivor sprites.
- `pets/pet-*-idle-v2.webp` files are the authoritative three-frame companion sheets. Do not restore the superseded non-V2 sheets.

## Source masters

- `branding/bunkr-icon-master.png`
- `branding/bunkr-last-shelter-logo.jpg`

These are retained for future exports and are not loaded by the game.

## Temporary compatibility assets

- `survivor-final.webp`
- `walker-final.webp`

These are intentionally retained for one compatibility window so older cached pages do not request missing files. New runtime code must not reference them.

`node scripts/asset-audit-check.js` verifies runtime references, derived expedition miniatures, intentional source masters and compatibility exceptions.
