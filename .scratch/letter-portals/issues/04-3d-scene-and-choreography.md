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

**Status:** ready-for-agent

- [ ] Libraries are vendored copies (no CDN), loaded lazily; the Rest state downloads nothing new.
- [ ] Letter cards line up exactly with the HTML title at the moment of the click.
- [ ] Chain flip goes nearest-first, one at a time, in place, at letter size.
- [ ] Explosion scatters in all directions (not to one side), then Tokens float and drift gently in Zero-g within the screen.
- [ ] Skip during intro reaches the open state immediately.
- [ ] Closing (✕ / Esc / Back) reassembles the title and returns to `rest`.
- [ ] Reduced-motion visitors still get the simple Reveal from ticket 01.
- [ ] Toy box can be switched on in code (not visible to visitors).
- [ ] Automated checks: phase goes `intro → open`; skip; close returns to `rest`; reduced motion → fallback with no WebGL canvas; no console errors.
- [ ] Manual Chrome checklist handed to Antonio (choreography feel matches the prototype).
- [ ] If anything here changes a decision the About Reveal relies on, update `.scratch/about-reveal/handoff.md`.
