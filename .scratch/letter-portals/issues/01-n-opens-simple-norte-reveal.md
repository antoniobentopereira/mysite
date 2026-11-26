# 01: N opens a simple Norte Reveal (no 3D yet)

**What to build:** The first "N" of ANTONIO becomes a Portal letter on the live homepage. Without JavaScript it is a plain link to VC Map. With JavaScript, clicking it (or the visually hidden "Norte: a VC map" link) opens the simple Norte Reveal: brown background with a quick fade, the word NORTE, and the HTML card (title "Norte: a VC map", 1–2 line summary drafted from VC Map's content, small "or just open it →" link). `#norte` opens the Reveal directly; ✕, Esc and Back close it; corner texts fade out during the Reveal. This simple Reveal is the one that later serves reduced-motion visitors and devices without WebGL. Also lays the foundation: the Destination settings block (Portal letter, colour, Tokens, Hero, card content, Enter control, Destination link), the Reveal controller with its phase state machine, published Reveal state on the page, and the Playwright test setup (dev-only).

Spec: `.scratch/letter-portals/spec.md`. Phase states (from the prototype): `rest → intro → open → (leaving | closing) → rest`.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] Without JavaScript, N is a working link to VC Map (relative path, no leading slash).
- [ ] The h1 is still announced as "Antonio Bento"; a visually hidden link "Norte: a VC map" exists and shows a focus ring on the N when focused.
- [ ] Clicking N or activating the hidden link opens the simple Reveal and sets the URL hash to `#norte`.
- [ ] Loading the homepage with `#norte` opens the Reveal directly; closing it keeps the visitor on the homepage.
- [ ] ✕, Esc and Back each close the Reveal, clear the hash, and return focus to the Norte link.
- [ ] Focus moves into the Reveal when it opens.
- [ ] The page publishes the Reveal state (current Destination, phase, whether the fallback is used) for tests.
- [ ] The Rest state looks and loads exactly as before (hover wiggle, colours, pop-in kept).
- [ ] Card copy drafted and shown to Antonio for approval.
- [ ] Playwright added as a dev-only tool (free, explained to Antonio); automated checks for the criteria above pass in Chrome; no console errors.
- [ ] STATUS.md updated: VC Map linked from the homepage via the N portal.
- [ ] Manual Chrome checklist handed to Antonio.
