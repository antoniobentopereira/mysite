# Project: Bento's Playground (antoniobento.me)

## Vision
A personal playground in the spirit of neal.fun: a simple grid homepage
linking to small, independent experiments (games, calculators, data toys,
AI experiments, little tools). Warm, playful, a bit funny. Not a developer
portfolio. Visitors should think: "curious, creative, actually builds things."

## Rules for every experiment
- One idea per page, understood in 30 seconds, no sign-up.
- Each gets a short note: why I built it, what I learned, "built with AI".
- Keep the whole site simple and cohesive. Never let one experiment
  complicate the homepage.

## Technical rules
- Use the right tool for each experiment. Plain HTML, CSS and JavaScript is
  the default for simple ones. Frameworks, build tools, libraries (npm or
  bundled), WebGL and so on are all fine when the experiment needs them.
  Pick the simplest option that works and say why.
- Hosting: Cloudflare (free). Domain: antoniobento.me (Cloudflare).
- Cost: free first. Use free tiers only (e.g. Cloudflare Workers, Pages,
  KV, D1). Never add a paid service or anything that can bill me
  automatically without asking me first. Complex does not mean expensive.
- Never put API keys or secrets in code. This repo is public. Use
  Cloudflare environment secrets for anything private.
- Keep the repo and the site reasonably light. Avoid huge files, and tell
  me before adding anything that makes the repo grow a lot.
- Tell me in plain words when you add a dependency or tool: what it is,
  why, and that it is free. No need to wait for permission if it is free.

## Projects
Every experiment follows this contract:
- Lives in public/<project-name>/ with its own index.html at the root.
- Relative paths only, never a leading slash, so it works under a subpath.
- Works as static files when deployed: no server needed unless it is a
  free Cloudflare Worker.
- Source can live in this repo or in its own repo. If its output is
  generated (a build), only the generated output goes in public/<name>/.
  Never edit generated output by hand. Fix the source, then rebuild or
  re-sync.
- Prefer the homepage font and palette (see Design) but an experiment may
  have its own look when the idea calls for it.
- Its note (why I built it, what I learned, "built with AI") can live
  inside the experiment itself. Do not duplicate it elsewhere.
- Overall state of the site is tracked in STATUS.md.

## Design
- Font: Bricolage Grotesque (Google Fonts), system-ui as fallback.
- Palette (CSS variables on :root in public/style.css):
  - --bg #eaece5, --ink #3b3b14, --muted #7b7d72
  - --red #d6232c, --yellow #f2b705, --lilac #b79ae6, --purple #8e2a9c,
    --blue #0f6f9e, --orange #f08a1c, --green #14803c
- Homepage layout: one full-screen page with a huge centered title
  (ANTONIO / BENTO) and four small texts, one in each corner.
- Rules:
  - Mobile first: it must work on small screens before big ones.
  - The name stays real text in an h1 (aria-label "Antonio Bento").
  - Every letter of the title is its own span.
  - Keep the homepage light: no big images or videos.
  - Respect prefers-reduced-motion: no animations in that case.
  - Prefer CSS for homepage interaction. Add JavaScript only when CSS
    can't do it well.

## How to work with me
- I am a beginner. Explain things in plain language, no unnecessary jargon.
- Work in small steps. Explain what you will change before changing it.
- Be opinionated: recommend the simplest option and say why.
- Keep answers short. My Claude plan has limited usage.

## Agent skills

### Issue tracker

Issues are markdown files under `.scratch/<feature>/`. See `docs/agents/issue-tracker.md`.

### Domain docs

Single-context: one `GLOSSARY.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.
