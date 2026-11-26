# Handoff: About Reveal (grill later)

Status: waiting (grill after the Norte portal ships)

Starting point for a future `/mattpocock-skills:grill-with-docs` session on the **About Reveal** (the "A" Portal letter). Keep this file updated during the Norte work whenever a decision there affects About.

Read first: `GLOSSARY.md`, `docs/adr/`, `.scratch/letter-portals/` (Norte spec + tickets), and the prototype in `prototypes/portals/`.

## Already decided

- **The About Reveal *is* the About** for now. The full About page stays "under construction" and is out of scope until Antonio says otherwise. Do not create tickets for it.
- **Enter control**: the ribbon bookmark. Pulling it (or tapping / keyboard) opens Antonio's LinkedIn in a new tab: https://www.linkedin.com/in/antonio-bento-pereira/
- **Hero**: the A becomes a book that spins in and opens (prototype: CSS 3D). In production it must be a real 3D object in the shared Three.js scene (ADR 0002), built in code if possible.
- **Extra book pages** (idea, to grill): one page with photos, one with cool facts, in addition to the "Hi, I'm Antonio" page.
- **Tokens (11)**, in letter order N T O N I O B E N T O:
  basketball, tennis ball, speargun + fish, beer, Djavan (1978) vinyl with the original cover art, Flamengo crest, laptop showing `</>`, green portal swirl (Rick and Morty nod), Hermeto Pascoal bobblehead, hang glider (São Conrado), bento box.
  Antonio has permission for all branded art.
- **3D Tokens**: some About Tokens will be 3D (Hermeto bobblehead is the obvious one; likely a model file). LPs stay 2D. Which others is open.
- **Colours**: About uses the site palette at full strength (prototype burst: lilac, book: red).
- Everything shared with Norte applies: Reveal choreography (burst, chain flip in place, hold, explosion, Hero fly-in), Gravity mode (Zero-g default, Toy box hidden), toon vs. realistic look (chosen: soft realistic), reduced-motion / no-WebGL fallback, Back-button and resize behaviour, manual checklists (Chrome only for now).

## Open questions to grill

- How visitors move between book pages (turn by click / swipe / arrows?) and how many pages.
- Photos: which, how many, size budget, who supplies them.
- Cool facts: who writes them, how many.
- Which About Tokens are 3D, and which need model files vs. code.
- How the Djavan cover and Flamengo crest are sourced (official files) and styled next to drawn Tokens.
- Card / page text (prototype has a draft).
- Book layout on phones (prototype opens upward like a notepad).

## Change log

- 2026-11-26: created from the Norte grilling session.
