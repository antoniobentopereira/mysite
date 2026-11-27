# Status

High-level state of antoniobento.me. Details of each project live in its own repo or folder, not here.

_Last updated: 2026-11-27_

## Homepage
- **v1:** typographic page (ANTONIO / BENTO, four corner texts).
- **Letter portals (in progress):**
  - First "N" in ANTONIO -> `vc-map/` ("Norte: a VC map"). **3D Reveal built** (ticket 04): burst, letters flip into stand-in stickers, explosion, Zero-g float, NORTE, card + lever; closing reassembles the title. Simple Reveal for reduced motion. Local-only tuning panel built (ticket 06: sliders, Replay, Save into the defaults, Reset, T to hide; never on the official site). **3D Hero built** (ticket 07): a solid 3D N built in code, its tail grows into the rising arrow, and it launches off-screen when the lever fires. **Final flat stickers** (ticket 08): 7 SVGs in one sticker style, drawn crisp at any size. Next: 3D Tokens (09 to 11).
  - "A" in ANTONIO -> About (later)
- Automated checks: Playwright (dev only), `npm test`.
- Libraries: Three.js (trimmed) and Matter.js copies in `public/portals/vendor/`, made by `npm run vendor`.

## Projects

| Project | Version | Where it lives | On the site | Linked from homepage |
|---|---|---|---|---|
| VC Map | v1 (built) | `vc-map` repo, synced into `public/vc-map/` | committed, reachable at `/vc-map/` | yes, via the N portal |

## Open items
- Plan and build the homepage letter portals.
  - Phase 1 = Norte (N) portal: spec + 11 tickets in `.scratch/letter-portals/`. About Reveal comes after (`.scratch/about-reveal/handoff.md`).
  - Prototype (P1: Pile / Zero-g / Toy box) lives in `prototypes/portals/`, not deployed.
  - **Before production: replace stand-in Token stickers with final art.** Checklist:
    - [ ] About: basketball, tennis ball, speargun + fish, beer, laptop `</>`, green portal swirl, hang glider, bento box (draw or generate, one consistent style)
    - [ ] About: Djavan (1978) cover, original art (official source)
    - [ ] About: Flamengo crest (official SVG)
    - [ ] About: Hermeto Pascoal bobblehead (later a real 3D model)
    - [x] Norte flat stickers (ticket 08): folded map, rising arrow, São Paulo flag, term sheet ("TERM SHEET"), lightbulb, unicorn, founders graph
    - [ ] Norte 3D Tokens (tickets 09 to 11): compass (yellow), coin stack, rocket, star mascot (Norte's own files)
    - [ ] All files light (aim < 200 KB each), same outline style
- About page (not started).
