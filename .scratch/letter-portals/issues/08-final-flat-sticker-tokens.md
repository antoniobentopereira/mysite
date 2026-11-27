# 08: Final flat sticker Tokens

**What to build:** Replace the stand-in art for the 7 flat Norte Tokens with newly drawn, clean SVG stickers in one consistent Norte style: folded map, rising arrow, São Paulo flag, term sheet, lightbulb, handshake, bar chart (Antonio's review: handshake became a unicorn, bar chart became a founders graph). Each Token is its own file, so art can be swapped without touching the Reveal code.

Spec: `.scratch/letter-portals/spec.md`. Checklist in STATUS.md ("replace stand-in Token stickers").

**Blocked by:** 04

**Status:** done

- [x] 7 SVG files, one per Token, consistent style, each under ~30 KB.
- [x] They render crisply as sticker cards in the Reveal at Token size and at letter size.
- [x] The São Paulo flag looks right (stripes, red canton with the white circle and map). Antonio's review: no need to follow the flag law exactly.
- [x] STATUS.md asset checklist updated for these 7.
- [x] Automated checks still pass (budget included).
- [x] Manual Chrome checklist handed to Antonio (art review).

## Antonio's checks (Chrome, `npm run serve`, then open http://localhost:8417/)

- [x] Click the N: during the flip, the 7 new stickers appear at letter size and look sharp, not blurry.
- [x] Once open, each sticker floats sharp at Token size: folded map, rising arrow, São Paulo flag, term sheet, lightbulb, unicorn, founders graph.
- [x] They look like one set (same white edge, shadow and outline) and fit the 3D Hero and the remaining stand-ins.
- [x] Round 2: the unicorn and the founders graph read well at small size; "TERM SHEET" is legible; the bulb's white edge at the base is thin enough.
- [x] On a phone-size window (DevTools, ~390 px wide) the stickers are still sharp.
