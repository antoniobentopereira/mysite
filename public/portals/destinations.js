// Destinations: one settings block per Portal letter.
// Adding a portal = adding a block here (plus its letter markup in index.html).

// Art files live next to this module (relative paths, so the site works under a subpath)
const art = (path) => new URL(path, import.meta.url).href;

export const DESTINATIONS = {
  norte: {
    // Portal letter: position in the title (0 = first A of ANTONIO, 1 = first N)
    letterIndex: 1,
    // The word spelled out during the Reveal
    word: 'NORTE',
    // Burst / background colour, plus the accent colours used by the word and card
    color: '#4a2700',
    accent: '#f2c200',
    shade: '#a87400',
    // Tokens, in title-letter order (T O N I O B E N T O, then one spare).
    // kind: 'sticker' (flat SVG card) or 'model' (3D, built in code).
    // src: one file per Token (swap a file to change it): the sticker's SVG, or the
    // 3D Token's code (a module exporting createToken, see tokens/norte/compass.js).
    // A 'model' Token whose code isn't written yet points at a stand-in sticker.
    tokens: [
      { name: 'folded map', kind: 'sticker', src: art('tokens/norte/folded-map.svg') },
      { name: 'compass', kind: 'model', src: art('tokens/norte/compass.js') },
      { name: 'star mascot', kind: 'model', src: art('tokens/norte/star-mascot.svg') },
      { name: 'rising arrow', kind: 'sticker', src: art('tokens/norte/rising-arrow.svg') },
      { name: 'coin stack', kind: 'model', src: art('tokens/norte/coin-stack.js') },
      { name: 'rocket', kind: 'model', src: art('tokens/norte/rocket.svg') },
      { name: 'São Paulo flag', kind: 'sticker', src: art('tokens/norte/sao-paulo-flag.svg') },
      { name: 'term sheet', kind: 'sticker', src: art('tokens/norte/term-sheet.svg') },
      { name: 'lightbulb', kind: 'sticker', src: art('tokens/norte/lightbulb.svg') },
      { name: 'unicorn', kind: 'sticker', src: art('tokens/norte/unicorn.svg') },
      { name: 'founders graph', kind: 'sticker', src: art('tokens/norte/founders-graph.svg') },
    ],
    // Hero: a solid 3D N built in code whose last stroke grows into the rising
    // arrow (loaded with the 3D libraries). It is drawn in the accent colour.
    hero: { src: art('heroes/norte-3d.js') },
    // Card shown over the Reveal
    card: {
      kicker: 'Portal · N',
      title: 'Norte: a VC map',
      summary: 'Norte means north. This map shows where it points: the startups it backs, and what they have in common.',
    },
    // Enter control: the arcade lever (lever.js), the only way in.
    enter: { kind: 'lever', label: 'Enter Norte: a VC map' },
    // Destination link: relative, no leading slash
    url: 'vc-map/',
  },
};

export const destinationFor = (name) => (Object.hasOwn(DESTINATIONS, name) ? DESTINATIONS[name] : null);
