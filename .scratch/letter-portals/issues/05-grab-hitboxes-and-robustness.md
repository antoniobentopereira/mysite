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
- Hitboxes (added when the Hero lands, Zero-g only, as in the prototype) follow the visible shapes: the arrow's real outline (`outline()` in `heroes/norte-flat.js`), one box per NORTE letter, the lever's box, stick, round ball and label, and the card's rounded box shrunk by `solidInset` (16 px, the only one Tokens tuck behind). A Token caught inside a hitbox jumps to the nearest free spot.
- Of the lever, only the red ball takes presses; around it, Tokens can be grabbed. No text in the Reveal is selectable.
- Resize: the scene, walls, hitboxes and letter homes follow the new screen; a Token whose middle goes off-screen is put back inside. Tokens keep their size.
- Hidden tab: drawing and physics stop. The intro keeps real time, so it stays in step with the card appearing.
- No WebGL 2 or a failed library download → the simple Reveal. First Reveal measured at about 185 KB compressed.

## Antonio's checks

Tick each one when done. Run `node tests/serve.js` and open http://localhost:8417/ in Chrome.

- [x] Grab a sticker with the mouse and fling it: it follows your hand a little softly, then flies off and bounces. Feels good?
- [x] The hand cursor shows over a sticker, and a closed hand while holding one.
- [x] Flung stickers bounce off the arrow's real shape (also its bottom stem and the head), each NORTE letter, the lever's red ball, stick and box, and the card. They tuck slightly behind the card's edges only. No invisible walls around the arrow.
- [ ] Right after the explosion, when the hitboxes switch on, no sticker stays stuck behind the card or the lever.
- [ ] Grab a sticker floating right next to the lever: it grabs. Only the red ball moves the lever, even with a sticker beside it.
- [ ] Drag around the Reveal and double-click the card: no text gets selected.
- [x] ✕, the lever and the card still work right after flinging stickers around.
- [x] With the Reveal open, resize the window from wide to narrow and back: the arrow, NORTE and card move to their new places and no sticker is lost. Close: ANTONIO BENTO is whole, in the right place.
- [x] DevTools > toggle device toolbar (phone): drag a sticker with the "finger", and tap ✕ to close.
- [x] Switch to another tab for a few seconds and come back: the stickers carry on where they were (they didn't jump).
