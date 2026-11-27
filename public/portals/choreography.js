// Choreography: the Reveal's tuning values (Antonio's, from the prototype)
// and when each step of the intro happens. Times are in ms from the click;
// the other values say their unit.
//
//   0           colour burst starts, the clicked letter turns into the Hero
//   chain       other letters flip into Tokens, nearest first, one at a time
//   explodeAt   after a short hold, the Tokens blast out and float
//   heroAt      the Hero flies to its spot
//   arriveAt    the Hero has landed: it grows, the word spells out
//   cardAt      the card and Enter control appear
//   openAt      the intro is over (phase "open")

export const TIMINGS = {
  burst: 1200, // colour burst fills the screen
  morphStart: 800, // pause before the first letter flips
  stagger: 100, // gap between one letter flipping and the next
  morphDur: 300, // one letter's flip
  hold: 650, // all Tokens in place before the explosion
  speed: 15, // explosion speed (px per physics step)
  spread: 60, // random wobble added to each Token's direction (degrees)
  shrink: 400, // Tokens go from letter size to Token size
  heroFly: 1200, // Hero fly-in
  heroDelay: 100, // wait after the explosion before the Hero moves
  gravity: 0.5, // Toy box only: how strongly Tokens fall
  drag: 4, // Zero-g air drag (x1000)
  solidInset: 16, // hitbox tightness (ticket 05)
  zap: 9, // idle charge every ~ s, on average
};

/** How long closing takes: Tokens fly home and flip back into letters, the burst shrinks. */
export const CLOSE_MS = 1150;

/** When each step happens, for `count` Tokens. */
export function timeline(P, count) {
  const explodeAt = P.morphStart + Math.max(0, count - 1) * P.stagger + P.morphDur + P.hold;
  const heroAt = explodeAt + P.heroDelay;
  const arriveAt = heroAt + P.heroFly;
  return { explodeAt, heroAt, arriveAt, cardAt: arriveAt + 200, openAt: arriveAt + 650 };
}
