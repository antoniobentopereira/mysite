// Idle charge: now and then a Portal letter does a soft, cute move (a hop,
// a glow of colour or a jelly sway) so visitors sense it is alive.
// The moves are CSS animations in style.css; this only picks when and which,
// by setting data-charge on the letter for the length of the animation.
// Only at rest, only while the tab is visible, never with reduced motion.
import { getPhase } from './reveal.js';

const AVERAGE_MS = 9000; // average time between charges
const FIRST_MS = 1200; // the first one comes soon after the pop-in
const KINDS = ['hop', 'glow', 'wobble'];

const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const pick = (list) => list[Math.floor(Math.random() * list.length)];

function charge(letter) {
  if (letter.dataset.charge) return; // still busy with the last one
  letter.dataset.charge = pick(KINDS);
  // The animation runs on the letter's link, so it never clashes with the pop-in or hover
  const link = letter.querySelector('a');
  const end = () => {
    delete letter.dataset.charge;
    link.removeEventListener('animationend', end);
    link.removeEventListener('animationcancel', end);
  };
  link.addEventListener('animationend', end);
  link.addEventListener('animationcancel', end); // cut short: still free it for the next charge
}

function schedule(wait) {
  setTimeout(() => {
    const letters = [...document.querySelectorAll('.title .portal')];
    if (letters.length && getPhase() === 'rest' && !document.hidden && !reduced.matches) charge(pick(letters));
    schedule(AVERAGE_MS * (0.5 + Math.random())); // 4.5 to 13.5 s, 9 s on average
  }, wait);
}

export const start = () => schedule(FIRST_MS);
