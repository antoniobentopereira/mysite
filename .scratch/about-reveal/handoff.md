# Handoff: About Reveal (grill later)

Status: waiting (grill after the Norte portal ships)

Starting point for a future `/mattpocock-skills:grill-with-docs` session on the **About Reveal** (the "A" Portal letter). Keep this file updated during the Norte work whenever a decision there affects About.

Read first: `GLOSSARY.md`, `docs/adr/`, `.scratch/letter-portals/` (Norte spec + tickets), and the prototype in `prototypes/portals/`.

## Already decided

- **The About Reveal *is* the About** for now. The full About page stays "under construction" and is out of scope until Antonio says otherwise. Do not create tickets for it.
- **Enter control**: the ribbon bookmark. Pulling it (or tapping / keyboard) opens Antonio's LinkedIn in a new tab: https://www.linkedin.com/in/antonio-bento-pereira/
- **Hero**: the A becomes a book that spins in and opens (prototype: CSS 3D). In production it must be a real 3D object in the shared Three.js scene (ADR 0002), built in code if possible.
- **Extra book pages** (idea, to grill): one page with photos, one with cool facts, in addition to the "Hi, I'm Antonio" page.
- **Tokens (11)**, in letter order N T O N I O B E N T O:
  basketball, tennis ball, speargun + fish, beer, Djavan (1978) vinyl with the original cover art, Flamengo crest, laptop showing `</>`, green portal swirl (Rick and Morty nod), Hermeto Pascoal bobblehead, hang glider (São Conrado), bento box.
  Antonio has permission for all branded art.
- **3D Tokens**: some About Tokens will be 3D (Hermeto bobblehead is the obvious one; likely a model file). LPs stay 2D. Which others is open.
- **Colours**: About uses the site palette at full strength (prototype burst: lilac, book: red).
- Everything shared with Norte applies: Reveal choreography (burst, chain flip in place, hold, explosion, Hero fly-in), Gravity mode (Zero-g default, Toy box hidden), toon vs. realistic look (chosen: soft realistic), reduced-motion / no-WebGL fallback, Back-button and resize behaviour, manual checklists (Chrome only for now).

## Open questions to grill

- How visitors move between book pages (turn by click / swipe / arrows?) and how many pages.
- Photos: which, how many, size budget, who supplies them.
- Cool facts: who writes them, how many.
- Which About Tokens are 3D, and which need model files vs. code.
- How the Djavan cover and Flamengo crest are sourced (official files) and styled next to drawn Tokens.
- Card / page text (prototype has a draft).
- Book layout on phones (prototype opens upward like a notepad).

## Built in Norte ticket 01 (reuse for About)

- Each Destination is one settings block in `public/portals/destinations.js` (letter index, colours, Tokens, Hero, card, Enter control, URL). About = a new block.
- Portal letter markup: the letter's span gets `class="portal" data-dest="<name>"` and wraps an `<a href="..." tabindex="-1">`; a matching hidden link goes in `.sr-nav` (focus ring on the letter is CSS via `:has()` in `style.css`, one rule per Destination).
- About's no-JS link: needs deciding (LinkedIn? `#about` does nothing without JS).
- Reveal controller (`public/portals/reveal.js`) publishes `data-reveal-phase / -destination / -fallback` on `<html>`.

## Built in Norte ticket 02 (reuse for About)

- Drag-or-tap Enter control: `public/portals/lever.js` (`wireLever(button, onFire)` handles drag threshold, tap, spring-back, Enter/Space). The About ribbon can reuse the same pattern (pull = drag down instead of forward).
- The Reveal builds the Enter control from `enter.kind` in the Destination block; firing calls the controller's launch (phase `leaving`, then go to the Destination URL). About opens LinkedIn in a new tab, so its launch will need a "new tab" variant that stays `open`.
- Back from the Destination: a fresh load of `#…` opens instantly; a page restored from the back/forward cache resumes from `leaving` to `open` and resets the control.

## Built in Norte ticket 03 (reuse for About)

- Idle charge: `public/portals/idle.js` charges any `.title .portal` letter, so the A gets it for free once it is a Portal letter. Its charge colour is `--charge` on the letter (Norte: blue); About needs its own rule in `style.css`.
- Hint line: one shared hint for all portals; opening any portal (About too) dismisses it for good.

## Built in Norte ticket 04 (reuse for About)

- One scene for any Destination: `public/portals/scene.js` reads the Destination block (`color`, `letterIndex`, `tokens[].src`, `hero`). About = new block + its own art; no scene changes needed for flat Tokens.
- The Hero is pluggable code (ticket 07): the Destination block's `hero.src` points to a module (Norte: `public/portals/heroes/norte-3d.js`) exporting `createHero(THREE, { color })` → `{ object, setGrow(g), dispose() }`, plus `letterBounds()` (to fit it over the clicked letter), `BOX` (its square box: size and middle, in its own units), `TILT` (its own turn round the upright axis; the lean back is the `heroTilt` tuning value) and `ARROW_DIR` (launch direction). Built in that box; the scene sizes, flies, flips and lights it (key light top left + warm fill in the burst colour + a code-built photo studio as `scene.environment`, which glossy materials such as the Hero's clear-coat car paint reflect; the About book and 3D Tokens get it for free). Once landed (after the intro + `spinDelay`) the scene spins it round its upright axis at `spinSpeed` (both in the tuning panel); it has no hitbox (Antonio's decision: Tokens drift behind it and stay grabbable). Decide for About whether the book spins too. The About book can follow the same contract; "grow" would be the book opening, and the launch (Enter control fired → Hero leaves the screen, then navigate) may need a book-specific move instead of `ARROW_DIR`.
- Choreography timings are shared (`public/portals/choreography.js`); the HTML stage has a `.reveal-hero` slot the scene flies the Hero to (wide: left; narrow: top).
- Libraries are fetched by `public/portals/libs.js` after idle; Three.js is trimmed: anything new the About scene uses (e.g. lights, extra geometries) must be added to `THREE_PARTS` in `scripts/vendor.js` and re-vendored.

## Built in Norte ticket 06 (reuse for About)

- The tuning panel (`public/portals/tuning.js`, local only) tunes the shared `TIMINGS`, so About gets it for free. Its Replay replays whichever Reveal is open (at rest it opens the first portal link, Norte). If About needs its own values, add sliders to `SLIDERS` there.

## Change log

- 2026-11-26: created from the Norte grilling session.
- 2026-11-26: Norte ticket 01 built; added the reusable pattern above.
- 2026-11-26: Norte ticket 02 built (lever Enter control); notes above.
- 2026-11-26: Norte ticket 03 built (idle charge, hint line); notes above.
- 2026-11-27: Norte ticket 04 built (3D scene and choreography); notes above.
- 2026-11-27: Norte ticket 06 built (local-only tuning panel); notes above.
- 2026-11-27: Norte ticket 07 built (3D N Hero, pluggable Hero module, launch); notes above.
- 2026-11-27: Norte Hero realism pass (clear-coat paint, studio reflections in the shared scene, seams, rivets).
- 2026-11-27: Norte Hero spins once landed (tunable delay and speed); Hero hitbox removed.
- 2026-11-27: Norte Hero: flat top-left corner, long arrow, Hero module exports BOX, lean back is a tuning value (heroTilt).
