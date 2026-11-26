// Destinations: one settings block per Portal letter.
// Adding a portal = adding a block here (plus its letter markup in index.html).

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
    // Art files and models arrive in later tickets (08 to 11).
    tokens: [
      { name: 'folded map', kind: 'sticker' },
      { name: 'compass', kind: 'model' },
      { name: 'star mascot', kind: 'model' },
      { name: 'rising arrow', kind: 'sticker' },
      { name: 'coin stack', kind: 'model' },
      { name: 'rocket', kind: 'model' },
      { name: 'São Paulo flag', kind: 'sticker' },
      { name: 'term sheet', kind: 'sticker' },
      { name: 'lightbulb', kind: 'sticker' },
      { name: 'handshake', kind: 'sticker' },
      { name: 'bar chart', kind: 'sticker' },
    ],
    // Hero: the 3D N that grows into a rising arrow (ticket 07). None yet.
    hero: null,
    // Card shown over the Reveal
    card: {
      kicker: 'Portal · N',
      title: 'Norte: a VC map',
      summary: 'Norte means north. This map shows where it points: the startups it backs, and what they have in common.',
    },
    // Enter control: the arcade lever (ticket 02). Until then, only the plain link.
    enter: { kind: 'lever', label: 'Enter Norte: a VC map' },
    // Destination link: relative, no leading slash
    url: 'vc-map/',
  },
};

export const destinationFor = (name) => (Object.hasOwn(DESTINATIONS, name) ? DESTINATIONS[name] : null);
