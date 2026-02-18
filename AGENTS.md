# AGENTS.md

## Repository Summary

This repository contains a WordPress plugin named **Smooth Music Gallery**.  
It delivers:
- a Gutenberg block (`beedvision/smooth-music-gallery`) for music-enabled photo galleries,
- a separate admin **Shortcode Builder** view for users working outside Gutenberg.

Core capabilities:
- photo gallery with background music,
- selectable theme,
- selectable overlay effect,
- selectable background effect,
- runtime audio-reactive visuals.

Primary entrypoints:
- PHP plugin bootstrap and WordPress integration: `smooth-music-gallery.php`
- Block metadata: `src/block.json`
- Block editor registration: `src/block/index.js`
- Block editor UI: `src/block/edit.js`, `src/block/editor/edit-sidebar.js`
- Frontend bootstrap for rendered galleries: `src/block/view.js`
- Frontend gallery runtime: `src/smooth-music-gallery.js`
- Shortcode Builder app: `src/block/shortcode_builder.js`
- Source-of-truth lists for themes/backgrounds/overlays: `config.json`

## Architecture Notes

### 1. Rendering flow
- Block render callback (`smooth_music_gallery_block_render`) outputs:
  - `<div class="mg-gallery" data-props="..."></div>`
- JS frontend (`src/block/view.js`) initializes every `.mg-gallery` on `DOMContentLoaded`.
- Runtime (`src/smooth-music-gallery.js`) builds gallery DOM, initializes Swiper, controls, audio handling, and shared `window.mg[index]` state.

### 2. Effects system
- Overlay and background scripts are built as separate assets:
  - overlays: `src/overlays/*.js` -> `build/overlay/*.js`
  - backgrounds: `src/backgrounds/*.js` -> `build/background/*.js`
- PHP conditionally enqueues selected effect scripts per gallery attributes.
- Effects attach through hooks stored in `window.mg[index]` (`initOverlay`, `initBackground`).

### 3. Theme system
- Theme styles are separated in `src/themes/*.scss` with JS loaders in `src/themes/*.js`.
- Theme CSS is enqueued in frontend and editor contexts from `config.json`.

### 4. Shortcode Builder
- Admin page slug: `smooth_music_gallery--builder`.
- Builder UI reuses block preview + sidebar components.
- Generated shortcode serializes current attributes, including JSON-stringified option objects (`theme_options`, `overlay_options`, `background_options`).
- Builder state is cached in `localStorage` under `mg-shortcode-builder`.

## Build & Output Layout

NPM/Yarn scripts in `package.json` split output by concern:
- `build:app` -> block editor + view bootstrap
- `build:core` -> runtime gallery logic
- `build:backgrounds` / `build:overlays` / `build:themes`
- `build:shortcode_builder` -> admin builder bundle
- `build` runs all of the above

Main built directories:
- `build/`
- `build/core/`
- `build/background/`
- `build/overlay/`
- `build/theme/`
- `build/admin/`

## Conventions To Preserve In Future Changes

Use existing repository style without introducing new stylistic patterns.

Required behavior for future edits:
- keep current coding style and formatting conventions as-is,
- match local style in touched files (JS/React and PHP each follow their current project patterns),
- avoid unrelated refactors, style rewrites, or mass formatting changes,
- keep plugin UI text and labels in English unless explicitly requested otherwise.

## Practical Change Guidance

When adding or changing features:
- update `config.json` when adding a new theme/background/overlay option,
- add matching source files in `src/themes`, `src/backgrounds`, or `src/overlays`,
- ensure enqueue logic in `smooth-music-gallery.php` still resolves expected built paths,
- verify both entry surfaces:
  - Gutenberg block editor flow,
  - Shortcode Builder flow.
