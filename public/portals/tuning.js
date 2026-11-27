// Tuning panel: Antonio's sliders for the Reveal's feel. Only loaded when the
// site runs locally (see local.js); visitors never download it.
//
// Changing a slider edits the shared TIMINGS (choreography.js) and saves it in
// this browser. Most values show on Replay; drag, gravity, hitbox tightness and
// the idle charge change live. "Copy values" puts them on the clipboard as JSON,
// to bake them in as the new defaults in choreography.js.
import { TIMINGS } from './choreography.js';
import * as reveal from './reveal.js';

const SAVED = 'portal-tune'; // the values (JSON)
const HIDDEN = 'portal-tune-hidden'; // '1' when T hid the panel

const SLIDERS = [
  // key, label, min, max, step, description
  ['burst', 'Colour burst (ms)', 200, 2000, 50, 'How long the circle of colour takes to fill the screen.'],
  ['morphStart', 'Delay before chain (ms)', 0, 1500, 50, 'Pause after the click before the first letter flips.'],
  ['stagger', 'Chain stagger (ms)', 30, 500, 10, 'Gap between one letter flipping and the next.'],
  ['morphDur', 'Flip duration (ms)', 150, 1500, 10, 'How long each letter takes to flip into its Token.'],
  ['hold', 'Hold before explosion (ms)', 0, 2500, 50, 'Pause with all Tokens in place before they blast out.'],
  ['speed', 'Explosion speed', 2, 40, 1, 'How hard the Tokens are thrown outward.'],
  ['spread', 'Explosion spread (deg)', 0, 180, 5, "Random wobble added to each Token's direction."],
  ['shrink', 'Shrink to size (ms)', 50, 1500, 25, 'How fast Tokens go from letter size to Token size.'],
  ['heroFly', 'Hero fly-in (ms)', 300, 2500, 50, 'How long the Hero (the N) takes to fly to its spot.'],
  ['heroDelay', 'Hero delay after explosion (ms)', 0, 1500, 50, 'Wait after the explosion before the Hero moves.'],
  ['drag', 'Air drag x1000 (Zero-g)', 0, 40, 1, 'Live. How quickly floating Tokens slow down.'],
  ['solidInset', 'Hitbox tightness (px)', -20, 60, 2, "Live. Shrinks the card's hitbox: higher = Tokens tuck further behind it."],
  ['zap', 'Idle charge every ~ (s)', 1, 12, 0.5, 'Live (from the next one). Average time between charges on N.'],
  ['gravity', 'Gravity (Toy box)', 0.1, 3, 0.1, 'Live. How strongly Tokens fall. Toy box only, which is hidden for now.'],
];

const read = (key) => { try { return localStorage.getItem(key); } catch { return null; } };
const write = (key, value) => { try { if (value === null) localStorage.removeItem(key); else localStorage.setItem(key, value); } catch {} };

// Saved values replace the defaults straight away, before any Reveal plays
try {
  const saved = JSON.parse(read(SAVED) || '{}');
  for (const k of Object.keys(TIMINGS)) if (typeof saved[k] === 'number') TIMINGS[k] = saved[k];
} catch {} // broken JSON: keep the defaults

/** Build the panel. */
export function start() {
  const css = document.createElement('link');
  css.rel = 'stylesheet';
  css.href = new URL('tuning.css', import.meta.url).href;
  document.head.append(css);

  const panel = document.createElement('details');
  panel.className = 'tune';
  panel.setAttribute('aria-label', 'Tuning');
  panel.innerHTML = `<summary>Tuning</summary><div class="tune-body"></div>
    <div class="tune-actions"><button type="button" data-act="replay">Replay</button><button type="button" data-act="copy">Copy values</button><button type="button" data-act="reset">Reset</button></div>`;
  const body = panel.querySelector('.tune-body');
  for (const [k, label, min, max, step, desc] of SLIDERS) {
    const row = document.createElement('label');
    row.innerHTML = `<span></span><output></output><small></small><input type="range" min="${min}" max="${max}" step="${step}">`;
    row.querySelector('span').textContent = label;
    row.querySelector('small').textContent = desc;
    const input = row.querySelector('input'), out = row.querySelector('output');
    input.setAttribute('aria-label', label);
    input.value = out.textContent = TIMINGS[k];
    input.addEventListener('input', () => {
      TIMINGS[k] = Number(input.value);
      out.textContent = TIMINGS[k];
      write(SAVED, JSON.stringify(TIMINGS));
      if (k === 'solidInset') reveal.retune(); // drag, gravity and zap are read live anyway
    });
    body.append(row);
  }

  panel.addEventListener('click', (e) => {
    const button = e.target.closest('[data-act]');
    if (!button) return;
    const act = button.dataset.act;
    if (act === 'replay') replay();
    if (act === 'copy') copy(button);
    if (act === 'reset') { write(SAVED, null); location.reload(); }
  });
  document.body.append(panel);

  // T hides / shows the whole panel, and the choice is remembered
  panel.hidden = read(HIDDEN) === '1';
  document.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() !== 't' || e.ctrlKey || e.metaKey || e.altKey || e.repeat) return;
    if (e.target.closest?.('input:not([type="range"]), textarea, [contenteditable]')) return;
    if (!panel.hidden && panel.contains(document.activeElement)) document.activeElement.blur();
    panel.hidden = !panel.hidden;
    write(HIDDEN, panel.hidden ? '1' : '0');
  });
}

// Play the open Reveal again from the start; at rest, open Norte (as a visitor would)
function replay() {
  if (reveal.replay()) return;
  if (reveal.getPhase() === 'rest') document.querySelector('.sr-nav a[data-dest]')?.click();
}

// The clipboard only works on localhost / file URLs (not on a LAN address over
// http): there, show the values to copy by hand instead.
function copy(button) {
  const json = JSON.stringify(TIMINGS, null, 2);
  const done = () => {
    button.textContent = 'Copied ✓';
    setTimeout(() => { button.textContent = 'Copy values'; }, 1500);
  };
  const byHand = () => prompt('Copy these values:', json);
  if (navigator.clipboard) navigator.clipboard.writeText(json).then(done, byHand);
  else byHand();
}
