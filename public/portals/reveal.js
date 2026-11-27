// Reveal controller: the only module the homepage talks to.
//
// Phases: rest -> intro -> open -> (leaving | closing) -> rest
//   intro:   the Reveal is appearing (a click skips to open)
//   open:    fully shown, waiting for the visitor
//   leaving: the visitor chose to enter the Destination
//   closing: going back to the homepage
//
// The current state is published on <html> as data attributes, so tests (and CSS)
// can see it: data-reveal-phase, data-reveal-destination, data-reveal-fallback.
//
// For now every Reveal is the simple one (brown background, word, card, quick fade).
// It stays as the fallback for reduced motion and devices without WebGL once the
// 3D Reveal arrives (ticket 04).
import { destinationFor } from './destinations.js';
import { buildLever, wireLever } from './lever.js';

const FADE_MS = 220; // keep in sync with the transition in reveal.css
const LAUNCH_MS = 300; // the lever's push is seen before the page goes to the Destination

const root = document.documentElement;
let phase = 'rest';
let current = null; // name of the open Destination
let stage = null; // the Reveal's element
let timer = 0;
let closing = null; // promise while closing
let lever = null; // the open Reveal's Enter control

publish();

export const getPhase = () => phase;
export const getDestination = () => current;

function publish() {
  root.dataset.revealPhase = phase;
  root.dataset.revealDestination = current || '';
  root.dataset.revealFallback = String(current ? usesFallback() : false);
  root.classList.toggle('revealing', phase !== 'rest');
}

// The 3D Reveal does not exist yet, so the simple one is always used.
const usesFallback = () => true;

/**
 * Open a Destination's Reveal. Only works from rest.
 * options.instant: skip the intro (direct #norte links, coming back with Back).
 * options.onRequestClose: called when the visitor presses the close button.
 */
export function open(name, { instant = false, onRequestClose = () => {} } = {}) {
  const dest = destinationFor(name);
  if (!dest || phase !== 'rest') return false;
  current = name;
  phase = 'intro';
  stage = buildSimpleStage(name, dest, onRequestClose);
  document.body.append(stage);
  document.querySelector('main')?.setAttribute('inert', '');
  stage.querySelector('.reveal-close').focus({ preventScroll: true });
  publish();

  if (instant) finishIntro();
  else {
    stage.offsetWidth; // start from the hidden state so the fade plays
    stage.classList.add('is-shown');
    timer = setTimeout(finishIntro, FADE_MS);
  }
  return true;
}

/** Jump to the end of the intro. */
export function skip() {
  if (phase === 'intro') finishIntro();
}

function finishIntro() {
  clearTimeout(timer);
  stage.classList.add('is-shown', 'is-open');
  phase = 'open';
  publish();
}

/** The visitor is entering the Destination. */
function leave() {
  if (phase !== 'open') return;
  phase = 'leaving';
  publish();
}

/** Fire the Enter control: launch, then go to the Destination. */
function launch() {
  if (phase === 'leaving') return; // already launching (a second press, key repeat)
  if (phase !== 'open') { lever?.reset(); return; }
  const url = destinationFor(current).url;
  leave();
  timer = setTimeout(() => location.assign(url), LAUNCH_MS);
}

/** The page came back from the Destination (browser Back): show the Reveal again, no intro. */
export function resume() {
  if (phase !== 'leaving') return;
  clearTimeout(timer); // restored mid-launch: don't leave again
  lever?.reset();
  phase = 'open';
  publish();
}

/** Close the Reveal. Resolves once the homepage is back at rest. */
export function close() {
  if (phase === 'rest') return Promise.resolve();
  if (closing) return closing;
  clearTimeout(timer);
  phase = 'closing';
  publish();
  stage.classList.remove('is-shown', 'is-open');
  closing = new Promise((resolve) => {
    setTimeout(() => {
      stage.remove();
      stage = null;
      lever = null;
      current = null;
      closing = null;
      document.querySelector('main')?.removeAttribute('inert');
      phase = 'rest';
      publish();
      resolve();
    }, FADE_MS);
  });
  return closing;
}

// ---------- The simple Reveal ----------
function buildSimpleStage(name, dest, onRequestClose) {
  const el = document.createElement('div');
  el.className = 'reveal';
  el.dataset.dest = name;
  el.setAttribute('role', 'dialog');
  el.setAttribute('aria-modal', 'true');
  el.setAttribute('aria-label', dest.card.title);
  el.style.setProperty('--reveal-bg', dest.color);
  el.style.setProperty('--reveal-accent', dest.accent);
  el.style.setProperty('--reveal-shade', dest.shade);
  el.innerHTML = `
    <button class="reveal-close" type="button" aria-label="Close">✕</button>
    <p class="reveal-word" aria-hidden="true"></p>
    <section class="reveal-card">
      <p class="reveal-kicker"></p>
      <h2></h2>
      <p class="reveal-summary"></p>
    </section>`;
  // The Enter control is its own big object next to the card, not inside it
  if (dest.enter?.kind === 'lever') {
    const control = buildLever(dest.enter.label);
    el.append(control);
    lever = wireLever(control.querySelector('.lever'), launch);
  }
  el.querySelector('.reveal-word').textContent = dest.word;
  el.querySelector('.reveal-kicker').textContent = dest.card.kicker;
  el.querySelector('h2').textContent = dest.card.title;
  el.querySelector('.reveal-summary').textContent = dest.card.summary;

  el.querySelector('.reveal-close').addEventListener('click', onRequestClose);
  // A click or tap during the intro only skips to the end (it doesn't also
  // press the lever, say)
  el.addEventListener('pointerdown', (e) => {
    if (phase !== 'intro') return;
    skip();
    e.stopPropagation();
  }, true);
  return el;
}
