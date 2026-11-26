# 03: Idle charge and hint line

**What to build:** At rest, the N (and only Portal letters) does a soft, cute idle charge at random moments, on average every ~9 s: a little squash-and-hop, a slow glow of colour, or a gentle jelly sway (as in the prototype). Below the bottom-left corner text, a smaller line reads "Hint: some letters are doors, try the wiggly ones". After the visitor opens their first portal, the hint pops away with a small animation and stays hidden on later visits (remembered in the browser).

Spec: `.scratch/letter-portals/spec.md`.

**Blocked by:** 01

**Status:** ready-for-agent

- [ ] Only Portal letters get idle charges; non-portal letters are unchanged.
- [ ] Charges are sporadic (average ~9 s) and pause while a Reveal is open or the tab is hidden.
- [ ] Reduced motion: no idle charges, and the hint disappears without animation.
- [ ] Hint line is visible on first visit, smaller than the corner text, and fits on small screens.
- [ ] After the first portal opens, the hint pops away and stays hidden after reload.
- [ ] Automated checks: hint visible on first visit; hidden after opening a portal and after reload.
- [ ] Manual Chrome checklist handed to Antonio (charge cuteness, hint pop).
