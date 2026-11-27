# 04: 3D scene and choreography with stand-in Tokens

**What to build:** The full Norte Reveal choreography in one Three.js scene (ADR 0002), with an HTML card on top. Clicking N: the brown colour burst spreads from the N; the N turns into the (temporary, flat) Hero in place; the other letters, now flat cards identical to the HTML letters, flip one at a time into Tokens in place, nearest first, keeping letter size; pause; the Tokens shrink and explode outward from the centre of the title with random spread, then float in Zero-g; the Hero flies to its spot; NORTE spells out and the card appears. Clicking during the intro skips to the end. Closing sends Tokens back, flipping into letters, while the burst shrinks, reassembling ANTONIO BENTO. Uses the prototype's stand-in sticker art. Toy box works in code but is hidden. Three.js and Matter.js are vendored copies (ADR 0001), loaded after the page is idle and at the latest on first open.

Default timings (Antonio's tuning, from the prototype):

```json
{ "burst": 1200, "morphStart": 800, "stagger": 100, "morphDur": 300, "hold": 650,
  "speed": 15, "spread": 60, "shrink": 400, "heroFly": 1200, "heroDelay": 100,
  "gravity": 0.5, "drag": 4, "solidInset": 16, "zap": 9 }
```

Spec: `.scratch/letter-portals/spec.md`.

**Blocked by:** 01

**Status:** ready-for-human (built; waiting for Antonio's checks below)

- [x] Libraries are vendored copies (no CDN), loaded lazily; the Rest state downloads nothing new.
- [x] Letter cards line up exactly with the HTML title at the moment of the click.
- [x] Chain flip goes nearest-first, one at a time, in place, at letter size.
- [x] Explosion scatters in all directions (not to one side), then Tokens float and drift gently in Zero-g within the screen.
- [x] Skip during intro reaches the open state immediately.
- [x] Closing (✕ / Esc / Back) reassembles the title and returns to `rest`.
- [x] Reduced-motion visitors still get the simple Reveal from ticket 01.
- [x] Toy box can be switched on in code (not visible to visitors).
- [x] Automated checks: phase goes `intro → open`; skip; close returns to `rest`; reduced motion → fallback with no WebGL canvas; no console errors.
- [x] Manual Chrome checklist handed to Antonio (choreography feel matches the prototype).
- [x] If anything here changes a decision the About Reveal relies on, update `.scratch/about-reveal/handoff.md`.

Notes:
- Libraries: `npm run vendor` (`scripts/vendor.js`) makes `public/portals/vendor/three.min.js` (Three.js trimmed to the parts the scene uses, 133 KB compressed) and copies `matter.min.js` (26 KB). Never edit them by hand: add a name to `THREE_PARTS` and re-run. Fetched once the homepage is idle (`libs.js`), never for reduced motion.
- The scene (`scene.js`) draws the burst, letter cards (the real letters drawn in the homepage font, same spot and size), Tokens and the temporary flat Hero (`heroes/*.svg`). Timings live in `choreography.js`; physics in `physics.js`.
- Toy box: set `GRAVITY_MODE = 'toy'` in `reveal.js`.
- Stand-in stickers: one SVG per Token in `tokens/norte/`, copied from the prototype.
- Not in this ticket (ticket 05): grabbing Tokens, Hero/word/card hitboxes (Tokens can float behind the card for now), re-layout on resize.

## Antonio's checks

Tick each one when done. Run `node tests/serve.js` and open http://localhost:8417/ in Chrome (wide window first, then a narrow one).

- [ ] Click the N: the brown burst spreads from the N and the N turns into the flat arrow right where it stood.
- [ ] The other letters flip into stickers one at a time, nearest to the N first, staying about letter size.
- [ ] Short pause, then the stickers shrink and blast out in every direction (not all to one side), then float and drift gently, never leaving the screen.
- [ ] The arrow flies to its spot, NORTE spells out, then the card and lever appear. The whole thing feels like the prototype.
- [ ] Click anywhere during the intro: it jumps straight to the end.
- [ ] ✕, Esc and Back each send the stickers home, flipping back into letters while the brown shrinks, and ANTONIO BENTO is whole again.
- [ ] At the moment of the click, the letters don't jump (the cards sit exactly on the real letters).
- [ ] DevTools > Rendering > "prefers-reduced-motion: reduce": clicking N gives the simple brown Reveal, no flying stickers.
