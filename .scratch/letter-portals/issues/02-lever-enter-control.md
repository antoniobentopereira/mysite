# 02: Lever Enter control

**What to build:** The Norte card gets its Enter control: an arcade lever (box, stick, ball, "Push to launch ↗"). Visitors drag it to the right (up or down both count), or simply tap it, to launch into VC Map; keyboard users trigger it with Enter or Space. After Antonio's first look, the lever became a big object of its own outside the card, and the "or just open it →" link was dropped: the lever is the only way in. Coming back from VC Map with Back lands in the Norte Reveal already open, with no replayed intro (including when the browser restores the page from its back/forward cache mid-launch).

Spec: `.scratch/letter-portals/spec.md`. Feel reference: the prototype's lever.

**Blocked by:** 01

**Status:** ready-for-human (built; waiting for Antonio's checks below)

- [x] Dragging the lever to the right (up or down) past its threshold fires it; releasing early springs it back.
- [x] A tap / click fires it; Enter and Space fire it when focused; it has an accessible name ("Enter Norte: a VC map").
- [x] Firing navigates to VC Map.
- [x] Back from VC Map shows the Norte Reveal in its open state, without the intro.
- [x] Automated checks: keyboard activation navigates to VC Map; Back returns to an open Reveal (both a fresh load and a page restored from Chrome's back/forward cache).
- [x] Manual Chrome checklist handed to Antonio (lever feel).
- [x] Round 2 (Antonio's feedback): lever bigger and outside the card; plain link removed; a right-down drag opens it too.

Notes: the arrow shooting off-screen comes with the 3D Hero (tickets 04 and 07); for now the lever tips over and the page leaves after 0.3 s. A tap on the lever during the intro only skips the intro.

## Antonio's checks

Tick each one when done. Run `node tests/serve.js` and open http://localhost:8417/#norte.

- [x] The lever looks right on the card (box, stick, red ball, "Push to launch ↗"), on a wide and a narrow window.
- [x] Dragging the ball up / right tips the stick and, past the end, launches into VC Map.
- [x] Letting go halfway makes the stick spring back with a little bounce.
- [x] A simple click on the lever launches too.
- [x] Tab to the lever (a yellow ring shows), press Enter or Space: it launches.
- [x] From VC Map, Back lands on the brown Norte screen straight away, lever upright, no fade-in.

Round 2 (bigger lever outside the card):

- [ ] The lever feels like a main object: big, outside the card (under it on a wide window, between NORTE and the card on a narrow one).
- [ ] Dragging the ball right and down launches it; right and up still does too.
- [ ] Without the "or just open it →" link, the card still reads well.
