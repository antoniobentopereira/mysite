# 08: Final flat sticker Tokens

**What to build:** Replace the stand-in art for the 7 flat Norte Tokens with newly drawn, clean SVG stickers in one consistent Norte style: folded map, rising arrow, São Paulo flag, term sheet, lightbulb, handshake, bar chart. Each Token is its own file, so art can be swapped without touching the Reveal code.

Spec: `.scratch/letter-portals/spec.md`. Checklist in STATUS.md ("replace stand-in Token stickers").

**Blocked by:** 04

**Status:** ready-for-human

- [x] 7 SVG files, one per Token, consistent style, each under ~30 KB.
- [x] They render crisply as sticker cards in the Reveal at Token size and at letter size.
- [x] The São Paulo flag is accurate (13 stripes, red canton with the white circle and map).
- [x] STATUS.md asset checklist updated for these 7.
- [x] Automated checks still pass (budget included).
- [x] Manual Chrome checklist handed to Antonio (art review).

## Antonio's checks (Chrome, `npm run serve`, then open http://localhost:8417/)

- [ ] Click the N: during the flip, the 7 new stickers appear at letter size and look sharp, not blurry.
- [ ] Once open, each sticker floats sharp at Token size: folded map, rising arrow, São Paulo flag, term sheet, lightbulb, handshake, bar chart.
- [ ] They look like one set (same white edge, shadow and outline) and fit the 3D Hero and the remaining stand-ins.
- [ ] São Paulo flag: 13 black/white stripes, red canton, white circle with the blue Brazil map, a yellow star in each canton corner.
- [ ] Handshake reads as a handshake at small size (the hardest one; say if you want it redrawn).
- [ ] On a phone-size window (DevTools, ~390 px wide) the stickers are still sharp.
