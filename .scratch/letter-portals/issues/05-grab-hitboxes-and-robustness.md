# 05: Grab, hitboxes and robustness

**What to build:** Visitors can grab Tokens with mouse or finger and fling them. Once the Hero arrives, the Hero, the NORTE word and the card are solid with tight hitboxes (shrunk by the hitbox-tightness value, so Tokens tuck slightly behind edges but never cover the card or Enter control). The open Reveal re-arranges itself on resize / rotation. Physics pauses while the tab is hidden. If WebGL is unavailable or a library fails to load, the visitor gets the simple Reveal from ticket 01 instead of an empty screen. The first-Reveal download stays within budget.

Spec: `.scratch/letter-portals/spec.md`.

**Blocked by:** 04

**Status:** ready-for-human

- [x] Tokens can be grabbed and flung; the card, lever and ✕ stay clickable (grabs don't steal their clicks).
- [x] Tokens bounce off the Hero, word and card with tight hitboxes and never end up on top of the card or Enter control.
- [x] Resizing the window during an open Reveal re-lays out Hero, word, card, walls and hitboxes; no Token is lost off-screen.
- [x] Physics pauses when the tab is hidden and resumes on return.
- [x] No WebGL or failed library load → simple Reveal.
- [x] Automated checks: first-Reveal network transfer ≤ ~300 KB compressed; WebGL disabled → fallback in use; no console errors.
- [x] Manual Chrome checklist handed to Antonio (grab feel, hitbox feel).

Notes:
- Grab: Matter's mouse constraint on the Reveal's stage (`physics.js`); only Tokens can be grabbed. ✕, the card and the lever keep their own presses and taps (`reveal.js`).
- Hitboxes: added when the Hero lands, for the Hero slot, NORTE, the lever, its label and the card, each shrunk by `solidInset` (16 px; the Hero slot a bit more, since the arrow only fills its middle). Zero-g only, as in the prototype.
- Resize: the scene, walls, hitboxes and letter homes follow the new screen; a Token whose middle goes off-screen is put back inside. Tokens keep their size.
- Hidden tab: drawing and physics stop. The intro keeps real time, so it stays in step with the card appearing.
- No WebGL 2 or a failed library download → the simple Reveal. First Reveal measured at about 185 KB compressed.

## Antonio's checks

Tick each one when done. Run `node tests/serve.js` and open http://localhost:8417/ in Chrome.

- [x] Grab a sticker with the mouse and fling it: it follows your hand a little softly, then flies off and bounces. Feels good?
- [x] The hand cursor shows over a sticker, and a closed hand while holding one.
- [x] Flung stickers bounce off the arrow, NORTE, the lever and the card. They tuck slightly behind the edges but never sit over the card text or the lever. Too tight or too loose?
- [x] ✕, the lever and the card still work right after flinging stickers around.
- [x] With the Reveal open, resize the window from wide to narrow and back: the arrow, NORTE and card move to their new places and no sticker is lost. Close: ANTONIO BENTO is whole, in the right place.
- [x] DevTools > toggle device toolbar (phone): drag a sticker with the "finger", and tap ✕ to close.
- [x] Switch to another tab for a few seconds and come back: the stickers carry on where they were (they didn't jump).
