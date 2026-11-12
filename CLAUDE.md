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
- Plain HTML, CSS and JavaScript. One folder per experiment.
- No framework, build tool, database, login or backend unless I approve it.
- Hosting: Cloudflare (free). Domain: antoniobento.me (Cloudflare).
- Cost target: as close to zero as possible. Never add paid services.
- Never put API keys or secrets in code. This repo is public.
- Ask before adding any dependency or tool.

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
  - No heavy assets (no big images, videos or libraries).
  - Respect prefers-reduced-motion: no animations in that case.
  - All interaction on this homepage stays CSS-only for now.

## How to work with me
- I am a beginner. Explain things in plain language, no unnecessary jargon.
- Work in small steps. Explain what you will change before changing it.
- Be opinionated: recommend the simplest option and say why.
- Keep answers short. My Claude plan has limited usage.