# 09: 3D Tokens: coin stack and compass

**What to build:** The first two 3D Tokens, built in code with soft realistic lighting: a coin stack and a yellow compass. Also adds the behaviour every 3D Token shares: during the chain flip they appear in place of their letter like the others; while floating they slowly tumble in depth so their sides show; when grabbed they ease round to face the visitor.

Spec: `.scratch/letter-portals/spec.md`.

**Blocked by:** 05

**Added by Antonio (2026-11-27):** the compass is interactive: its red needle points at the lever's red ball with spring-damped physics, so it swings and wobbles past the target before settling, and trails a moving target instead of locking onto it.

**Status:** ready-for-human

- [x] Coin stack and compass are real 3D objects built in code (no model files).
- [x] They flip in from their letters during the chain like flat Tokens.
- [x] Floating 3D Tokens tumble slowly; grabbed ones turn to face the visitor; physics (position, spin, collisions) stays the same as flat Tokens.
- [x] Automated checks still pass (budget included); no console errors.
- [x] Manual Chrome checklist handed to Antonio (look, tumble, grab).
- [x] Compass needle tracks the lever's ball with a spring-damped swing (tested in `tests/needle.spec.js`).

## Antonio's checks (Chrome, `npm run serve`, then open http://localhost:8417/)

- [ ] Click the N: the coin stack and the compass flip in from their letters like the stickers.
- [ ] Look: both feel like real, softly lit objects (gold coins with a star on top; yellow compass, cream face, red needle).
- [ ] Floating, they tumble slowly in depth so their sides show.
- [ ] Grab one: it turns round to face you; let go and it tumbles on. Flinging and bouncing feel the same as the stickers.
- [ ] Compass: the red needle swings toward the lever's red ball, overshoots and wobbles before settling.
- [ ] Compass: push the lever or fling the compass around: the needle lags and swings after the ball instead of snapping onto it.
- [ ] Close (✕ / Esc): both flip back into their letters.
