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
// Two versions of the Reveal share the same HTML stage (close button, word, card,
// Enter control):
//   3D:     a Three.js scene under the stage plays the full choreography (scene.js).
//   simple: brown background, word, card, quick fade. Used for reduced motion, or
//           when the 3D one can't run (libraries didn't load, no WebGL).
import { destinationFor } from './destinations.js';
import { buildLever, wireLever } from './lever.js';
import { TIMINGS, timeline, CLOSE_MS } from './choreography.js';
import { loadLibs } from './libs.js';

const FADE_MS = 220; // keep in sync with the transition in reveal.css
const LAUNCH_MS = 300; // the lever's push is seen before the page goes to the Destination
const CLOSE_MAX_MS = CLOSE_MS + 450; // never wait longer than this for the scene's reassembly
const SLOW_LOAD_MS = 800; // libraries not here by then (first visit, slow network): simple Reveal
// Gravity mode: 'zerog' (Tokens float) or 'toy' (Toy box: they fall and pile up).
// Toy box works but is hidden from visitors; switch it here to try it.
const GRAVITY_MODE = 'zerog';

const root = document.documentElement;
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
let phase = 'rest';
let current = null; // name of the open Destination
let stage = null; // the Reveal's HTML element
let scene = null; // the 3D scene, once it is running
let fallback = false; // using the simple Reveal
let timers = [];
let closing = null; // promise while closing
let lever = null; // the open Reveal's Enter control

publish();

export const getPhase = () => phase;
export const getDestination = () => current;

function publish() {
  root.dataset.revealPhase = phase;
  root.dataset.revealDestination = current || '';
  root.dataset.revealFallback = String(current ? fallback : false);
  root.classList.toggle('revealing', phase !== 'rest');
}

const later = (fn, ms) => timers.push(setTimeout(fn, ms));
const clearTimers = () => { timers.forEach(clearTimeout); timers = []; };

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
  fallback = reduced.matches;
  stage = buildStage(name, dest, onRequestClose);
  stage.classList.toggle('is-3d', !fallback);
  document.body.append(stage);
  document.querySelector('main')?.setAttribute('inert', '');
  stage.querySelector('.reveal-close').focus({ preventScroll: true });
  publish();

  if (instant) finishIntro();
  else {
    stage.offsetWidth; // start from the hidden state so the fade plays
    stage.classList.add('is-shown');
    if (fallback) later(finishIntro, FADE_MS);
  }
  if (!fallback) {
    // Callbacks from this open must not touch a later one (close and reopen while loading)
    const mine = stage;
    const ifStill = (fn) => (...args) => { if (stage === mine) fn(...args); };
    setTimeout(ifStill(() => { if (!scene) useFallback(); }), SLOW_LOAD_MS);
    // The scene draws the letters in the homepage font, so it waits for it too
    loadLibs().then(async (libs) => {
      await document.fonts.ready;
      const { default: drawHero } = await import(dest.hero.src); // the Hero's own code
      return { ...libs, drawHero };
    })
      .then(ifStill((libs) => startScene(libs, dest)), ifStill(useFallback));
  }
  return true;
}

// The libraries are here: build the scene, and time the HTML to its choreography
function startScene(libs, dest) {
  if (!stage || fallback || scene || (phase !== 'intro' && phase !== 'open' && phase !== 'leaving')) return;
  const letters = [...document.querySelectorAll('.title .line > span')];
  try {
    scene = createSceneFor(libs, dest, letters);
  } catch {
    scene = null; // no WebGL, say
  }
  if (!scene) { useFallback(); return; }
  stage.before(scene.canvas);
  if (phase !== 'intro') return;
  const tl = timeline(TIMINGS, dest.tokens.length);
  later(() => stage.classList.add('is-word'), tl.arriveAt);
  later(() => stage.classList.add('is-open'), tl.cardAt);
  later(finishIntro, tl.openAt);
}

function createSceneFor(libs, dest, letters) {
  // scene.js comes with the libraries, so the Rest state never downloads it
  return libs.createScene(libs, {
    color: dest.color,
    letters,
    heroIndex: dest.letterIndex,
    tokens: dest.tokens,
    drawHero: libs.drawHero,
    heroSlot: stage.querySelector('.reveal-hero'),
    P: TIMINGS,
    mode: GRAVITY_MODE,
    atEnd: phase !== 'intro',
    onFirstFrame: () => {
      root.classList.add('reveal-live'); // the scene now draws the title: hide the HTML one
      stage?.classList.remove('has-backdrop');
    },
  });
}

// The 3D Reveal can't run: switch to the simple one
function useFallback() {
  if (!stage || fallback || phase === 'closing') return;
  fallback = true;
  scene?.destroy();
  scene = null;
  root.classList.remove('reveal-live');
  stage.classList.remove('is-3d', 'has-backdrop');
  publish();
  if (phase === 'intro') { clearTimers(); later(finishIntro, FADE_MS); }
}

/** Jump to the end of the intro. */
export function skip() {
  if (phase !== 'intro') return;
  scene?.finish();
  finishIntro();
}

function finishIntro() {
  clearTimers();
  stage.classList.add('is-shown', 'is-word', 'is-open');
  // Open before the scene is drawing (still loading): give the stage its colour meanwhile
  if (!fallback && !scene) stage.classList.add('has-backdrop');
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
  later(() => location.assign(url), LAUNCH_MS);
}

/** The page came back from the Destination (browser Back): show the Reveal again, no intro. */
export function resume() {
  if (phase !== 'leaving') return;
  clearTimers(); // restored mid-launch: don't leave again
  lever?.reset();
  phase = 'open';
  publish();
}

/** Close the Reveal. Resolves once the homepage is back at rest. */
export function close() {
  if (phase === 'rest') return Promise.resolve();
  if (closing) return closing;
  clearTimers();
  phase = 'closing';
  publish();
  stage.classList.remove('is-word', 'is-open');
  if (!scene) stage.classList.remove('is-3d', 'is-shown'); // no scene to reassemble: the stage fades out
  // The scene plays the reassembly; a hidden tab pauses it, so don't wait forever
  const done = scene
    ? Promise.race([scene.close(), new Promise((r) => setTimeout(r, CLOSE_MAX_MS))])
    : new Promise((r) => setTimeout(r, FADE_MS));
  closing = done.then(() => {
    scene?.destroy();
    scene = null;
    root.classList.remove('reveal-live');
    stage.remove();
    stage = null;
    lever = null;
    current = null;
    closing = null;
    fallback = false;
    document.querySelector('main')?.removeAttribute('inert');
    phase = 'rest';
    publish();
  });
  return closing;
}

// ---------- The HTML stage ----------
function buildStage(name, dest, onRequestClose) {
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
    <div class="reveal-hero" aria-hidden="true"></div>
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
  // The word spells out letter by letter (in the 3D Reveal)
  const word = el.querySelector('.reveal-word');
  [...dest.word].forEach((c, j) => {
    const s = document.createElement('span');
    s.className = 'w';
    s.style.setProperty('--j', j);
    s.textContent = c;
    word.append(s);
  });
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
