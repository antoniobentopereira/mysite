# 09: 3D Tokens: coin stack and compass

**What to build:** The first two 3D Tokens, built in code with soft realistic lighting: a coin stack and a yellow compass. Also adds the behaviour every 3D Token shares: during the chain flip they appear in place of their letter like the others; while floating they slowly tumble in depth so their sides show; when grabbed they ease round to face the visitor.

Spec: `.scratch/letter-portals/spec.md`.

**Blocked by:** 05

**Status:** ready-for-agent

- [ ] Coin stack and compass are real 3D objects built in code (no model files).
- [ ] They flip in from their letters during the chain like flat Tokens.
- [ ] Floating 3D Tokens tumble slowly; grabbed ones turn to face the visitor; physics (position, spin, collisions) stays the same as flat Tokens.
- [ ] Automated checks still pass (budget included); no console errors.
- [ ] Manual Chrome checklist handed to Antonio (look, tumble, grab).
