# The Reveal is one Three.js scene with an HTML card on top

Heroes and some Tokens are real 3D objects, so the whole Reveal (letters-turned-cards, flat sticker Tokens, 3D Tokens and the Hero) is drawn in a single Three.js (WebGL) scene, while the text card and the Enter control stay plain HTML layered above it so they remain readable, accessible and easy to edit. Three.js is kept as our own copy in the repo (like Matter.js, see ADR 0001) and only loaded when a Reveal first opens. 3D models are built in code from simple shapes wherever possible; a model file (glTF) is only used when it is significantly better or there is no other way. Devices without WebGL, and visitors who prefer reduced motion, get a simple non-3D Reveal (colour, Destination word, card, Enter control).

## Considered Options

- **Mixing HTML/SVG stickers with a separate 3D layer**: rejected; objects in two layers can't pass in front of / behind each other correctly.
- **OGL (tiny WebGL library)**: rejected; lighter, but far fewer helpers and examples, so more custom code to maintain.
- **CSS 3D only (as in the prototype)**: rejected; can't produce convincing solid models like the mascot or a bobblehead.
