# 07: 3D N Hero → rising arrow

**What to build:** The temporary flat Hero is replaced by the real Norte Hero: a solid 3D N built in code (the N outline extruded), with soft realistic lighting. It appears in place of the clicked N, flies to its spot after the explosion, and its last stroke grows into the rising arrow with an arrowhead pointing up-right (path from the prototype: N stem → valley → tail ending in a head). NORTE spells out beside it. When the lever fires, the arrow shoots off-screen before VC Map opens.

Spec: `.scratch/letter-portals/spec.md`. Visual reference: Norte's "N becomes a rising arrow" image and the prototype's extruded arrow.

**Blocked by:** 02, 04

**Status:** ready-for-agent

- [ ] The Hero is a real 3D object built in code (no model file), matching the N's size and position at the click.
- [ ] After fly-in, the tail grows into the arrow and the arrowhead appears.
- [ ] Desktop: Hero on one side, card on the other. Narrow screens: Hero above, card at the bottom.
- [ ] Lever fires → arrow launches off-screen → VC Map opens.
- [ ] Closing returns the Hero to the N's spot as part of the reassembly.
- [ ] Automated checks still pass; no console errors.
- [ ] Manual Chrome checklist handed to Antonio (Hero look, lighting, arrow growth, launch).
