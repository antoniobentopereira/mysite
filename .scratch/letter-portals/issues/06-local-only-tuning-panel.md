# 06: Local-only tuning panel

**What to build:** When Antonio runs the site locally, a floating tuning panel lets him tweak the Reveal live, as in the prototype: one slider per tuning value (with a one-line description each), Replay, Copy values, Reset, and the T key to hide / show it. Values persist in the browser. On the official site the panel never appears and the baked-in defaults are used.

Spec: `.scratch/letter-portals/spec.md`.

**Blocked by:** 04

**Status:** ready-for-agent

- [ ] Panel appears on localhost, 127.0.0.1, private LAN addresses and file URLs only.
- [ ] Every tuning value from the spec has a slider with a description; changes apply on Replay (and live where it makes sense, e.g. drag, gravity, hitboxes).
- [ ] Replay, Copy values (JSON to clipboard) and Reset work; T toggles visibility and is remembered.
- [ ] Automated checks: panel present on localhost; absent under a non-local hostname.
- [ ] Manual Chrome checklist handed to Antonio.
