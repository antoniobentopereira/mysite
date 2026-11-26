# 05: Grab, hitboxes and robustness

**What to build:** Visitors can grab Tokens with mouse or finger and fling them. Once the Hero arrives, the Hero, the NORTE word and the card are solid with tight hitboxes (shrunk by the hitbox-tightness value, so Tokens tuck slightly behind edges but never cover the card or Enter control). The open Reveal re-arranges itself on resize / rotation. Physics pauses while the tab is hidden. If WebGL is unavailable or a library fails to load, the visitor gets the simple Reveal from ticket 01 instead of an empty screen. The first-Reveal download stays within budget.

Spec: `.scratch/letter-portals/spec.md`.

**Blocked by:** 04

**Status:** ready-for-agent

- [ ] Tokens can be grabbed and flung; the card, lever and ✕ stay clickable (grabs don't steal their clicks).
- [ ] Tokens bounce off the Hero, word and card with tight hitboxes and never end up on top of the card or Enter control.
- [ ] Resizing the window during an open Reveal re-lays out Hero, word, card, walls and hitboxes; no Token is lost off-screen.
- [ ] Physics pauses when the tab is hidden and resumes on return.
- [ ] No WebGL or failed library load → simple Reveal.
- [ ] Automated checks: first-Reveal network transfer ≤ ~300 KB compressed; WebGL disabled → fallback in use; no console errors.
- [ ] Manual Chrome checklist handed to Antonio (grab feel, hitbox feel).
