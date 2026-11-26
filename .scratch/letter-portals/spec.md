# Spec: Norte letter portal (phase 1 of letter portals)

Status: ready-for-agent

Context: `GLOSSARY.md`, ADR 0001 (JS + vendored physics on the homepage), ADR 0002 (the Reveal is one Three.js scene with an HTML card on top). Visual reference: Norte images in `docs/reference/norte/`. Feel reference: the P1 prototype (Zero-g / Toy box) in the prototypes folder. Follow-up phase: the About Reveal, see `.scratch/about-reveal/handoff.md`.

## Problem Statement

Antonio's homepage is a calm typographic page (ANTONIO / BENTO) with no way into his projects. VC Map ("Norte: a VC map") is built and deployed but nothing links to it, so nobody finds it. He wants the letters of his name to become doors into his work: quiet and minimal at rest, then bold, tactile, colourful and memorable when you interact, in a way that says "curious, creative, actually builds things".

## Solution

The first "N" of ANTONIO becomes a **Portal letter** to the **Destination** Norte (VC Map). At rest it looks like the other letters but now and then gives a soft, cute idle charge, and a small hint line under the bottom-left text tells visitors some letters are doors. Clicking N starts the **Reveal**: a brown Norte colour burst spreads from the letter, the N becomes a real 3D **Hero** in place, the other letters flip one by one into **Tokens** (flat sticker cards and a few real 3D objects tied to Norte), pause, then explode outward and float in **Zero-g**, grabbable and flingable. The Hero flies to its spot and its last stroke grows into a rising arrow, NORTE spells out, and an HTML card appears with a short summary and the **Enter control**: an arcade lever you push to launch into VC Map. Close (✕, Esc, Back) returns everything to ANTONIO BENTO. Visitors who prefer reduced motion, or whose device lacks WebGL, get a simple non-3D Reveal. "A" stays a normal letter until the About phase.

## User Stories

### Rest state
1. As a visitor, I want the homepage at rest to look as calm and minimal as it does today, so that the site keeps its refined first impression.
2. As a visitor, I want the N to occasionally do a soft, cute idle charge (a little hop, a glow of colour, or a gentle sway), so that I sense it is alive and clickable without it being aggressive.
3. As a visitor, I want the idle charges to be sporadic (on average every ~9 s) rather than constant, so that the page doesn't feel busy.
4. As a visitor, I want a small hint line below the bottom-left text reading "Hint: some letters are doors, try the wiggly ones", so that I know there's something to discover.
5. As a returning visitor, I want the hint line to pop away after I open my first portal and stay hidden on later visits, so that it doesn't clutter the page once I know.
6. As a visitor, I want the existing hover wiggle and colours on the title letters to keep working, so that the homepage personality is preserved.
7. As a visitor, I want the homepage to load as fast as it does today, so that the portals never slow down the first impression.
8. As a reduced-motion visitor, I want no idle charge and no hint pop animation, so that the page respects my settings.

### Opening the Reveal
9. As a visitor, I want to click or tap the N to open the Norte Reveal, so that I can explore Norte.
10. As a keyboard user, I want to Tab to a "Norte: a VC map" link and press Enter to open the Reveal, so that I can use the portal without a mouse.
11. As a keyboard user, I want the N to show a visible focus ring when its link is focused, so that I know where I am.
12. As a screen reader user, I want the title still announced as "Antonio Bento" and the portal announced as "Norte: a VC map", so that the page makes sense to me.
13. As a visitor, I want the page address to change to `#norte` when the Reveal opens, so that Back closes it and I can share a link straight to it.
14. As a visitor opening a `#norte` link, I want the page to open straight into the Norte Reveal, so that shared links work.
15. As a visitor, I want a brown colour burst to spread out from the N until it fills the screen, so that the moment feels bold and colourful.
16. As a visitor, I want the clicked N to turn into a real 3D N right where it stood, so that I see it's the same letter becoming something else.
17. As a visitor, I want the other letters to flip into Tokens one at a time, starting from the ones nearest the N, like a chain reaction, so that I can clearly see each Token came from a letter.
18. As a visitor, I want each Token to keep roughly its letter's size while it sits in place, so that the transformation reads as a swap, not a jump.
19. As a visitor, I want a short pause with all Tokens in place before anything moves, so that I can take in the transformation.
20. As a visitor, I want the Tokens to then shrink to their normal size and blast outward in all directions (not all to one side), so that the explosion feels energetic and fun.
21. As a visitor, I want the 3D N to fly to its spot after the explosion and its last stroke to grow into a rising arrow, so that the Hero represents Norte.
22. As a visitor, I want the word NORTE to spell out letter by letter next to the Hero, so that I know where this portal leads.
23. As a visitor, I want the card and the lever to appear after the Hero settles, so that the choreography ends in a clear next step.
24. As an impatient visitor, I want a click or tap during the animation to skip straight to the end state, so that I'm never forced to wait.
25. As a visitor, I want the whole intro to take a few seconds (tuned values: burst 1.2 s, chain starts after 0.8 s, 0.1 s stagger, 0.3 s flips, 0.65 s hold, 1.2 s Hero fly-in), so that it's readable but not slow.

### Tokens and Zero-g
26. As a visitor, I want 11 Norte Tokens (folded map, compass, star mascot, rising arrow, coin stack, rocket, São Paulo flag, term sheet, lightbulb, handshake, bar chart), so that the scene is full of Norte-related objects.
27. As a visitor, I want the star mascot, coin stack, compass and rocket to be real 3D objects with soft realistic lighting, so that they feel tactile and contrast playfully with the flat stickers.
28. As a visitor, I want the other 7 Tokens to be clean, flat, drawn stickers in a consistent Norte style, so that the set looks crafted and cohesive.
29. As a visitor, I want the Tokens to float slowly in zero gravity after the explosion, bouncing softly off the screen edges and each other, so that the scene stays alive.
30. As a visitor, I want the 3D Tokens to slowly tumble in depth while they float, so that I can see they're real objects.
31. As a visitor, I want to grab a Token with mouse or finger and fling it, so that the Reveal is a toy I can play with.
32. As a visitor, I want a grabbed 3D Token to turn to face me, so that holding it feels satisfying.
33. As a visitor, I want floating Tokens to bounce off the Hero, the NORTE word and the card with tight hitboxes (slightly tucking behind their edges), so that they never cover the card or lever but still feel close.
34. As a visitor, I want Tokens never to drift on top of the card or the Enter control, so that I can always read and use them.
35. As a visitor, I want Tokens that slow down to keep drifting gently instead of freezing, so that the zero-g feeling persists.

### Card and Enter control
36. As a visitor, I want the card to show "Norte: a VC map", a 1–2 line summary of what VC Map is, and the lever, so that I know what I'm entering.
37. As a visitor, I want to push the arcade lever (drag it forward, or just tap it) to launch, so that entering feels playful.
38. As a visitor, I want the arrow to shoot off-screen when the lever fires and then land me on VC Map, so that the transition feels like launching.
39. As a keyboard user, I want the lever to be a real button I can trigger with Enter or Space, so that I can enter without dragging.
40. As a visitor who prefers plain links, I want a small "or just open it →" link on the card, so that I have a no-fuss way in.
41. As a mobile visitor, I want the card at the bottom of the screen and the Hero above it, so that everything fits a small screen.
42. As a desktop visitor, I want the Hero on one side and the card on the other, so that the layout uses the space well.

### Closing and navigation
43. As a visitor, I want a ✕ button, the Esc key and the browser Back button to close the Reveal, so that I can always get out.
44. As a visitor, I want closing to send the Tokens back to their spots, flipping back into letters, while the Hero returns and the burst shrinks, so that the homepage reassembles into ANTONIO BENTO.
45. As a keyboard user, I want focus to return to the Norte link after closing, so that I don't lose my place.
46. As a visitor coming back from VC Map with Back, I want to land in the Norte Reveal already open (no replayed intro), so that going back feels instant.
47. As a visitor who opened `#norte` directly, I want closing to leave me on the homepage without the browser leaving the site, so that ✕ doesn't act like Back.
48. As a visitor, I want the corner texts to fade out during a Reveal and come back after, so that the stage is clear.

### Robustness
49. As a mobile visitor, I want the open Reveal to re-arrange itself if I rotate my phone or resize the window, so that nothing ends up off-screen.
50. As a visitor, I want the physics to pause when the tab is in the background, so that my device doesn't waste battery.
51. As a visitor without JavaScript, I want the N to be a plain link to VC Map, so that the portal still works.
52. As a reduced-motion visitor, I want clicking N to show a simple version (brown background, the word NORTE, the card and the lever) with a quick fade, so that I can enter without motion.
53. As a visitor whose device can't do WebGL, I want the same simple version, so that the portal never breaks.
54. As a visitor whose connection fails while the 3D or physics code loads, I want the simple version too, so that I'm never stuck on an empty screen.
55. As a visitor, I want the first Reveal to download at most ~300 KB compressed, so that it opens quickly even on mobile data.
56. As a visitor, I want the 3D and physics code to load quietly after the homepage is idle (or at the first click at the latest), so that the Rest state stays light.
57. As a visitor, I want the Reveal to run smoothly on a mid-range phone, so that it feels high-craft rather than janky.

### Antonio (site owner) and future work
58. As Antonio, I want the tuning panel (sliders for all choreography timings, explosion speed and spread, drag, hitbox tightness, idle charge frequency; Replay / Copy values / Reset; T to toggle) available when I run the site locally, so that I can keep tweaking the feel.
59. As Antonio, I want the tuning panel never to appear on the official site, so that visitors don't see dev tools.
60. As Antonio, I want my tuned values baked in as the defaults, so that the live site uses the feel I chose.
61. As Antonio, I want Toy box (Tokens fall and pile up) kept working in the code but hidden, so that I can add a gravity toggle later.
62. As Antonio, I want each Destination described by one small settings block (Portal letter, colour, Tokens, Hero, card text, Enter control, Destination link), so that adding About and future portals is easy.
63. As Antonio, I want each Token to be its own file (SVG for stickers, code for 3D objects), so that I can swap art without touching the Reveal code.
64. As Antonio, I want the physics and 3D libraries kept as copies in the repo, so that the site never depends on another server.
65. As Antonio, I want an automated check that runs the homepage in Chrome and confirms the key behaviours, so that I notice if something breaks.
66. As Antonio, I want STATUS.md updated to show the Norte portal live and VC Map linked from the homepage, so that the site's state is clear.

## Implementation Decisions

- **Scope**: Norte only, plus the shared foundation (Reveal controller, 3D scene, physics, Gravity mode, idle charge, hint line, local-only tuning panel, fallback). A stays a normal letter. The About Reveal is a later phase (handoff file exists and must be kept updated when shared decisions change).
- **Modules** (all inside a dedicated portals folder under the public site, plain JavaScript modules, no build step):
  - **Destination config**: one block per Destination: Portal letter index, colour, Token list (each: name, kind `sticker` | `model`, source), Hero builder, card content, Enter control, Destination URL (relative, no leading slash).
  - **Reveal controller**: owns the phase state machine and choreography timing; the only module the homepage talks to. Interface: open(destination, { instant }), close(), skip(); it reflects state on the page (see Testing).
  - **Scene (Three.js)**: one full-screen WebGL canvas for the whole Reveal: colour burst, letter cards, sticker Tokens, 3D Tokens, Hero. Camera set up so the z=0 plane maps 1:1 to screen pixels, so letter cards line up exactly with the HTML title. Soft realistic lighting (no toon outlines).
  - **Physics (Matter.js)**: 2D only (position + spin). Bodies created at the explosion. Zero-g default; Toy box supported via the same module, hidden from visitors. Static hitboxes for Hero, word and card added once the Hero arrives, shrunk by the hitbox-tightness value. Mouse/touch grab via Matter's mouse constraint on the stage. Paused when the tab is hidden.
  - **Tokens**: letter cards are flat planes textured with the letter rendered in the homepage font and colour; each flips (rotate around Y) into its Token in place, keeping letter size, then shrinks to Token size during the explosion. Sticker Tokens are thin card planes textured from SVG files. 3D Tokens (star mascot, coin stack, compass, rocket) are built in code from simple shapes; a glTF file is only used if clearly better. 3D Tokens add a slow independent tumble; when grabbed they ease to face the camera.
  - **Hero (Norte)**: the N outline extruded into a solid 3D N built in code; after fly-in its last stroke extends into the rising arrow with arrowhead (from the prototype's path: N stem → valley → tail ending in a head pointing up-right).
  - **Card + Enter control**: HTML over the canvas. Lever: drag forward or tap to fire; keyboard-operable button; "or just open it →" plain link. Firing launches the arrow off-screen, then navigates to VC Map.
  - **Idle charge**: CSS animations (hop, glow, wobble) triggered at random intervals by a small script; only on Portal letters; off for reduced motion.
  - **Hint line**: new small line under the bottom-left text; after the first portal opens, a pop-away animation removes it and a localStorage flag keeps it hidden.
  - **Tuning panel**: only created when the hostname is local (localhost, 127.0.0.1, a private LAN address, or a file URL). Same sliders as the prototype, plus descriptions; T toggles; values persist in localStorage only locally.
  - **Fallback**: reduced motion, no WebGL, or failed library load → simple Reveal (brown background, NORTE word, card, lever), quick fade, no Tokens, no physics.
- **Phase state machine** (from the prototype): `rest → intro → open → (leaving | closing) → rest`. Skip finishes intro instantly. Opening only from `rest`; a hash change during `closing` reopens after cleanup. Back from VC Map with a restored page in `leaving` resets to `open` instantly.
- **Choreography defaults** (from Antonio's tuning, prototype units):
  ```json
  { "burst": 1200, "morphStart": 800, "stagger": 100, "morphDur": 300, "hold": 650,
    "speed": 15, "spread": 60, "shrink": 400, "heroFly": 1200, "heroDelay": 100,
    "gravity": 0.5, "drag": 4, "solidInset": 16, "zap": 9 }
  ```
  Chain order: Tokens sorted by distance from the Portal letter. Explosion direction: away from the centre of the whole title plus a random spread (not away from the Portal letter, which pushed everything one way in the prototype).
- **Routing**: `#norte` opens the Reveal; opening via click pushes a history entry so Back closes; a direct `#norte` load closes via replaceState. Without JS, N is a real link to VC Map; JS intercepts it.
- **Accessibility**: h1 keeps aria-label "Antonio Bento" with letters hidden from assistive tech; a visually hidden nav holds the "Norte: a VC map" link, which highlights the N on focus; focus moves into the Reveal on open and back to the link on close.
- **Loading**: Three.js and Matter.js vendored (ADR 0001, 0002), loaded as modules after the page is idle and at the latest on first open. Budget: ≤ ~300 KB compressed for the first Reveal (libraries + Token art). Three.js imports trimmed to what is used if needed to meet the budget.
- **Dependencies added**: Three.js (vendored, runtime), Matter.js (vendored, runtime), Playwright (dev-only, for the automated check; not shipped). All free.
- **Card copy**: drafted from VC Map's content, approved by Antonio.

## Testing Decisions

- **One seam: the homepage as a visitor sees it**, driven in headless Chrome by Playwright. Tests only use what a visitor (or the browser) can observe: links, URL hash, focus, visible elements, and the Reveal's published state. No reaching into module internals.
- **Published state**: the Reveal controller reflects its state on the page (e.g. data attributes for the current Destination and phase, and whether the fallback is in use). This is the only test-facing addition.
- **Automated checks**:
  - N's link points to VC Map (no-JS fallback) and the hidden nav link is labelled "Norte: a VC map".
  - Clicking N → phase goes `intro` → `open`; URL hash is `#norte`.
  - Skip (click during intro) reaches `open` immediately.
  - Esc, ✕ and Back each return to `rest`, hash cleared, focus on the Norte link.
  - Loading `/#norte` opens the Reveal; closing it does not leave the site.
  - Reduced-motion emulation → fallback in use, no WebGL canvas.
  - Tuning panel absent when served under a non-local hostname; present on localhost.
  - Hint line visible on first visit; hidden after a portal was opened and after reload.
  - Lever (keyboard activation) navigates to VC Map.
  - First-Reveal network transfer stays under the ~300 KB budget.
  - No console errors during open / close.
- **Manual checklist per ticket** (Chrome only for now; Safari and phone tested later by Antonio): feel of the choreography, look of each Token and the Hero, lighting, grab-and-fling, hitbox feel, idle charge cuteness, hint pop.
- **Prior art**: none in the repo; the prototype is the behavioural reference.

## Out of Scope

- The About Reveal (A as a Portal letter, the 3D book, extra pages, ribbon → LinkedIn). Covered later from `.scratch/about-reveal/handoff.md`.
- The full About page (deferred until Antonio asks).
- A visible gravity toggle (Toy box stays hidden).
- Portals on any other letter.
- Final art and 3D for About Tokens (Djavan cover, Flamengo crest, Hermeto bobblehead, etc.).
- Safari and real-phone testing (Antonio tests later).
- Changes to VC Map itself.

## Further Notes

- VC Map is already deployed at `/vc-map/` but unlinked; this spec makes it discoverable.
- The prototype stays in the repo as the feel reference and is not deployed.
- Repo growth: the Three.js copy is roughly 700 KB on disk; Antonio has approved it.
- `docs/agents/triage-labels.md` is referenced by the issue tracker doc but does not exist yet; run `/setup-matt-pocock-skills` to create it if triage roles are needed.
