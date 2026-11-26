# Homepage letter portals use JavaScript and a vendored physics library

The homepage rules say "keep it light" and "prefer CSS, add JavaScript only when CSS can't". The letter portals deliberately break the second rule: the Reveal (letters flipping into Tokens, exploding, floating in zero gravity, grabbable) needs real physics, which CSS cannot do. We use Matter.js for the physics and keep a copy of it in the repo instead of loading it from a CDN, so the site never depends on another server. To keep the Rest state light, the physics code is only loaded when a visitor first opens a Reveal (or quietly after the page has loaded), and visitors who prefer reduced motion get no physics at all.

## Considered Options

- **Pure CSS / hand-written motion**: rejected; piling, throwing and collisions would mean writing a physics engine ourselves.
- **Matter.js from a CDN**: rejected; it would make the homepage depend on a third-party server.
