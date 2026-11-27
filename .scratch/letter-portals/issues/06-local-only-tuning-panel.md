# 06: Local-only tuning panel

**What to build:** When Antonio runs the site locally, a floating tuning panel lets him tweak the Reveal live, as in the prototype: one slider per tuning value (with a one-line description each), Replay, Copy values, Reset, and the T key to hide / show it. Values persist in the browser. On the official site the panel never appears and the baked-in defaults are used.

Spec: `.scratch/letter-portals/spec.md`.

**Blocked by:** 04

**Status:** ready-for-human

- [x] Panel appears on localhost, 127.0.0.1, private LAN addresses and file URLs only.
- [x] Every tuning value from the spec has a slider with a description; changes apply on Replay (and live where it makes sense, e.g. drag, gravity, hitboxes).
- [x] Replay, Copy values (JSON to clipboard) and Reset work; T toggles visibility and is remembered.
- [x] Automated checks: panel present on localhost; absent under a non-local hostname.
- [x] Manual Chrome checklist handed to Antonio.

Notes:
- Local check: `public/portals/local.js` (localhost, 127.x, ::1, 10.x, 172.16-31.x, 192.168.x, `*.local` names, file URLs). Everywhere else the panel's files are never downloaded.
- Panel: `public/portals/tuning.js` + `tuning.css`, bottom left, folded until you click "Tuning". Values are saved in this browser only (`portal-tune`), T's choice too (`portal-tune-hidden`).
- Live: air drag, hitbox tightness (the card's), idle charge (from the next one), gravity (Toy box only, hidden). Everything else shows on Replay.
- Replay: with a Reveal open, it plays again from the start; at rest, it opens Norte.
- To bake new defaults in: Copy values, paste them to Claude, and they go into `TIMINGS` in `public/portals/choreography.js`.
- Copy uses the clipboard on localhost; on a LAN address (phone) the browser blocks it, so a box shows the values to copy by hand.
- File URLs: allowed by the check, but Chrome blocks the site's scripts on file:// anyway, so use `node tests/serve.js`.

## Antonio's checks

Tick each one when done. Run `node tests/serve.js` and open http://localhost:8417/ in Chrome.

- [ ] The "Tuning" panel sits bottom left. Click it: 14 sliders, each with a one-line description, plus Replay, Copy values and Reset.
- [ ] Press T: the panel disappears. Reload: still hidden. Press T again: it's back.
- [ ] Click Replay at rest: the Norte Reveal plays. Click Replay again while it's open: it plays again from the start.
- [ ] Make "Flip duration" much longer, then Replay: the letters flip slowly. Reload: the slider kept its value.
- [ ] With the Reveal open, drag "Air drag" to 40: floating stickers slow down quickly. Drag it to 0: they glide for ages.
- [ ] With the Reveal open, move "Hitbox tightness": stickers tuck further behind the card (high) or bounce off before reaching it (low).
- [ ] Click Copy values, paste into a text editor: a list of all 14 values.
- [ ] Click Reset: the page reloads and the sliders are back to the defaults.
- [ ] Open the live site (antoniobento.me) after this is deployed: no panel, and T does nothing.
