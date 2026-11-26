# 02: Lever Enter control

**What to build:** The Norte card gets its Enter control: an arcade lever (box, stick, ball, "Push to launch ↗"). Visitors drag it forward, or simply tap it, to launch into VC Map; keyboard users trigger it with Enter or Space. The plain "or just open it →" link stays. Coming back from VC Map with Back lands in the Norte Reveal already open, with no replayed intro (including when the browser restores the page from its back/forward cache mid-launch).

Spec: `.scratch/letter-portals/spec.md`. Feel reference: the prototype's lever.

**Blocked by:** 01

**Status:** ready-for-agent

- [ ] Dragging the lever forward past its threshold fires it; releasing early springs it back.
- [ ] A tap / click fires it; Enter and Space fire it when focused; it has an accessible name ("Enter Norte: a VC map").
- [ ] Firing navigates to VC Map.
- [ ] Back from VC Map shows the Norte Reveal in its open state, without the intro.
- [ ] Automated checks: keyboard activation navigates to VC Map; Back returns to an open Reveal.
- [ ] Manual Chrome checklist handed to Antonio (lever feel).
