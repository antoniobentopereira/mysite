# 03: Idle charge and hint line

**What to build:** At rest, the N (and only Portal letters) does a soft, cute idle charge at random moments, on average every ~9 s: a little squash-and-hop, a slow glow of colour, or a gentle jelly sway (as in the prototype). Below the bottom-left corner text, a smaller line reads "Hint: some letters are doors, try the wiggly ones". After the visitor opens their first portal, the hint pops away with a small animation and stays hidden on later visits (remembered in the browser).

Spec: `.scratch/letter-portals/spec.md`.

**Blocked by:** 01

**Status:** ready-for-human (built; waiting for Antonio's checks below)

- [x] Only Portal letters get idle charges; non-portal letters are unchanged.
- [x] Charges are sporadic (average ~9 s) and pause while a Reveal is open or the tab is hidden.
- [x] Reduced motion: no idle charges, and the hint disappears without animation.
- [x] Hint line is visible on first visit, smaller than the corner text, and fits on small screens.
- [x] After the first portal opens, the hint pops away and stays hidden after reload.
- [x] Automated checks: hint visible on first visit; hidden after opening a portal and after reload.
- [x] Manual Chrome checklist handed to Antonio (charge cuteness, hint pop).

Notes: the moves are CSS animations on the N's link (`style.css`), and `public/portals/idle.js` picks when (first after 1.2 s, then every 4.5 to 13.5 s, 9 s on average) and which. The hint (`public/portals/hint.js`) is remembered as soon as a portal opens; it pops away when you come back to the homepage, so you actually see it go. A tiny script in `index.html` hides it on later visits before the page shows.

## Antonio's checks

Tick each one when done. Run `node tests/serve.js` and open http://localhost:8417/ in Chrome.

- [ ] Watch the N for about 30 s: now and then it does a little hop, a glow of blue, or a jelly sway. It feels cute, not busy.
- [ ] Hovering the N still gives the usual yellow wiggle, also right after a charge.
- [ ] The hint line sits under the bottom-left text, smaller and greyer, on a wide and a narrow window.
- [ ] Open the N, then close it (✕ or Esc): when the homepage comes back, the hint grows a little and pops away.
- [ ] Reload: the hint stays gone. (To see it again: DevTools > Application > Local storage > delete `portal-hint-done`.)
