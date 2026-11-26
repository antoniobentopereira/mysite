# 01: N opens a simple Norte Reveal (no 3D yet)

**What to build:** The first "N" of ANTONIO becomes a Portal letter on the live homepage. Without JavaScript it is a plain link to VC Map. With JavaScript, clicking it (or the visually hidden "Norte: a VC map" link) opens the simple Norte Reveal: brown background with a quick fade, the word NORTE, and the HTML card (title "Norte: a VC map", 1–2 line summary drafted from VC Map's content, small "or just open it →" link). `#norte` opens the Reveal directly; ✕, Esc and Back close it; corner texts fade out during the Reveal. This simple Reveal is the one that later serves reduced-motion visitors and devices without WebGL. Also lays the foundation: the Destination settings block (Portal letter, colour, Tokens, Hero, card content, Enter control, Destination link), the Reveal controller with its phase state machine, published Reveal state on the page, and the Playwright test setup (dev-only).

Spec: `.scratch/letter-portals/spec.md`. Phase states (from the prototype): `rest → intro → open → (leaving | closing) → rest`.

**Blocked by:** None (can start immediately)

**Status:** ready-for-human (built; waiting on the manual Chrome check)

- [x] Without JavaScript, N is a working link to VC Map (relative path, no leading slash).
- [x] The h1 is still announced as "Antonio Bento"; a visually hidden link "Norte: a VC map" exists and shows a focus ring on the N when focused.
- [x] Clicking N or activating the hidden link opens the simple Reveal and sets the URL hash to `#norte`.
- [x] Loading the homepage with `#norte` opens the Reveal directly; closing it keeps the visitor on the homepage.
- [x] ✕, Esc and Back each close the Reveal, clear the hash, and return focus to the Norte link.
- [x] Focus moves into the Reveal when it opens.
- [x] The page publishes the Reveal state (current Destination, phase, whether the fallback is used) for tests.
- [x] The Rest state looks and loads exactly as before (hover wiggle, colours, pop-in kept).
- [x] Card copy drafted and approved by Antonio.
- [x] Playwright added as a dev-only tool (free, explained to Antonio); automated checks for the criteria above pass in Chrome; no console errors.
- [x] STATUS.md updated: VC Map linked from the homepage via the N portal.
- [x] Manual Chrome checklist handed to Antonio.

## Open with Antonio (2026-11-26)

- Card copy approved (2026-11-26): "Norte means north. This map shows where it points: the startups it backs, and what they have in common." (kicker "Portal · N").
- Reduced motion: CLAUDE.md says "no animations", spec asks for a "quick fade". Kept the 0.22 s opacity fade (no movement). Antonio to decide whether to drop it for reduced-motion visitors.
- Manual Chrome check: run `node tests/serve.js`, open http://localhost:8417 (PowerShell blocks `npm`; use `npm.cmd` or allow scripts).
