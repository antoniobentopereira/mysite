# 07: 3D N Hero → rising arrow

**What to build:** The temporary flat Hero is replaced by the real Norte Hero: a solid 3D N built in code (the N outline extruded), with soft realistic lighting. It appears in place of the clicked N, flies to its spot after the explosion, and its last stroke grows into the rising arrow with an arrowhead pointing up-right (path from the prototype: N stem → valley → tail ending in a head). NORTE spells out beside it. When the lever fires, the arrow shoots off-screen before VC Map opens.

Spec: `.scratch/letter-portals/spec.md`. Visual reference: Norte's "N becomes a rising arrow" image and the prototype's extruded arrow.

**Blocked by:** 02, 04

**Status:** ready-for-human

- [x] The Hero is a real 3D object built in code (no model file), matching the N's size and position at the click.
- [x] After fly-in, the tail grows into the arrow and the arrowhead appears.
- [x] Desktop: Hero on one side, card on the other. Narrow screens: Hero above, card at the bottom.
- [x] Lever fires → arrow launches off-screen → VC Map opens.
- [x] Closing returns the Hero to the N's spot as part of the reassembly.
- [x] Automated checks still pass; no console errors.
- [x] Manual Chrome checklist handed to Antonio (Hero look, lighting, arrow growth, launch).

Notes:
- Hero: `public/portals/heroes/norte-3d.js` (replaces the flat `norte-flat.js`). The N is the prototype's line (stem → valley → tail → head) pushed into depth with rounded edges, in the accent yellow. Its tail is rebuilt while it grows; the head pops on the tip.
- Look: turned a little (`TILT`) so its right side and underside show, like the reference picture; half that turn in the letter's spot, the full turn once landed. Light: a key light from the top left plus a warm fill in the burst colour.
- In the letter's spot it covers the letter's ink (same height and left edge). It is narrower than the letter, since this N has no second stem (the tail becomes it).
- Hitbox: the real 3D pieces projected onto the screen.
- Launch: the lever fires → a little pull back, then the Hero shoots off-screen along its arrow (650 ms) → VC Map. Back from VC Map puts it in its spot again. Closing mid-launch brings it home from where it is.
- Three.js copy: 7 more parts (solid shapes, lit material, lights), about +35 KB on disk (~+10 KB compressed). The first Reveal stays under the 300 KB budget.
- Fixed on the way: the "3D Reveal" test now also checks it is still 3D at the end (a scene that fails to build silently switches to the simple Reveal).

## Antonio's checks

Tick each one when done. Run `node tests/serve.js` and open http://localhost:8417/ in Chrome.

- [ ] Click the N: it turns into a yellow 3D N right where the letter was, about the same height.
- [ ] It flies to the left (wide window) and its last stroke grows up-right into an arrow; the arrowhead pops on the tip.
- [ ] The look: solid, with soft light from the top left and visible depth on its right side and underside (like the "N becomes a rising arrow" picture).
- [ ] Narrow the window to phone width (or rotate a phone): the Hero sits on top, NORTE under it, the card at the bottom.
- [ ] Fling stickers at the Hero: they bounce off its shape (not a big square around it).
- [ ] Push the lever: the arrow pulls back a little, then shoots off-screen up-right, then VC Map opens.
- [ ] Press Back in the browser: the Reveal is open again with the Hero in its spot.
- [ ] Press Esc: the arrow shrinks back into the N, flies home and flips back into the letter, and ANTONIO BENTO is whole again.
- [ ] Open `#norte` directly (http://localhost:8417/#norte): the Hero is already in place and stickers bounce off it normally.
