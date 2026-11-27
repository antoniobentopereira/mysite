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
- Realism pass (Antonio's request): glossy yellow car paint with a clear coat. Its sharp highlights reflect a small photo studio built in code (`buildStudio` in scene.js: dark room, softboxes well off to the sides, warm floor glow; no image file) set as the scene's environment, so later 3D Tokens get the same reflections. Plates: thin dark seams (over the front, the rounded edges and the side walls) at the stem's middle, the two corners and the tail's middle; 12 small, low, painted rivets beside the seams and at the stem's foot. Seams and rivets on the tail appear as it grows.
- Hairline between the arrowhead and the shaft: fixed. Head and shaft are now one outline (one solid), not two overlapping ones, and the camera's depth range hugs the scene so nearly touching surfaces no longer flicker.
- Three.js copy: 5 more parts (clear-coat material, studio reflection, boxes, spheres). The first Reveal is 209 KB compressed.
- Spin (Antonio's request, like Norte's own site): once the intro is over, plus the spin delay, the Hero spins round its upright axis, easing in. Lights stay put, so its shading and highlights change as it turns. Seams and rivets are on its back too. Lever fired: it turns back to face front during the pull-back, then launches along its arrow. Closing: it unwinds to face front on the way home. Back from VC Map: it faces front, then spins again after the delay.
- Tuning: "Hero spin delay (ms)" (default 600, on Replay) and "Hero spin speed (deg/s)" (default 50, live; 0 = still).
- No Hero hitbox any more (Antonio's decision): Tokens drift behind it and can be grabbed there. Word, lever and card stay solid.
- Shape update: the N's top-left corner is cut flat (it was a long spike that the rounded edge and a seam stuck out of: the "lip"). That corner's seam moved a little down the diagonal. The tail is much longer (about 2.2 times the stem, like Norte's arrow) with two seams; the Hero's box is a square around the whole grown figure with 8% room, so it fills its spot without spilling onto NORTE.
- Tuning: "Hero tilt back (deg)" (default −8, live; it was a fixed −16).

## Antonio's checks

Tick each one when done. Run `node tests/serve.js` and open http://localhost:8417/ in Chrome.

- [x] Click the N: it turns into a yellow 3D N right where the letter was, about the same height.
- [x] It flies to the left (wide window) and its last stroke grows up-right into an arrow; the arrowhead pops on the tip.
- [x] The look: solid, with soft light from the top left and visible depth on its right side and underside (like the "N becomes a rising arrow" picture).
- [x] Narrow the window to phone width (or rotate a phone): the Hero sits on top, NORTE under it, the card at the bottom.
- [x] Fling stickers at the Hero: they bounce off its shape (not a big square around it).
- [x] Push the lever: the arrow pulls back a little, then shoots off-screen up-right, then VC Map opens.
- [x] Press Back in the browser: the Reveal is open again with the Hero in its spot.
- [x] Press Esc: the arrow shrinks back into the N, flies home and flips back into the letter, and ANTONIO BENTO is whole again.
- [x] Open `#norte` directly (http://localhost:8417/#norte): the Hero is already in place and stickers bounce off it normally.

Realism pass:

- [ ] The Hero looks like glossy yellow car paint: bright yellow, with sharp light lines along its rounded edges and a sheen that moves across it while it flies in.
- [ ] Thin seams show where its plates meet (middle of the stem, both corners of the N, middle of the tail) and wrap over its sides.
- [ ] A few small, low, yellow rivets sit beside the seams and at the stem's foot; the tail's seam and rivets appear as the tail grows.
- [ ] No hairline between the arrowhead and the shaft: they read as one piece.
- [ ] Narrow window: still bright yellow (not dull or washed out).

Spin:

- [ ] Shortly after the card appears, the Hero starts spinning (gently, not with a jump) and keeps going; its light and highlights change as it turns, and its back shows seams and rivets too.
- [ ] Tuning panel: "Hero spin speed" changes the speed right away (0 stops it); "Hero spin delay" changes when it starts (press Replay to see it).
- [ ] Stickers drift behind the spinning Hero, and you can still grab one there.
- [ ] Push the lever while it is turned away: it turns to face you, then shoots off up-right.
- [ ] Press Esc while it is turned away: it turns to face you on its way home into the N.

Shape and tilt:

- [ ] The N's top-left corner is a clean, flat corner: no lip or ledge sticking out, from any side while it spins.
- [ ] The arrow is long, like Norte's, and the whole Hero stays clear of the NORTE word (wide and narrow).
- [ ] Tuning panel: "Hero tilt back" changes how far it leans back right away; Save keeps your value.
