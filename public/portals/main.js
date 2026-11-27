// Homepage wiring for the letter portals: clicks, the #hash, Esc and Back.
// All Reveal work is done by the Reveal controller.
import { destinationFor } from './destinations.js';
import * as reveal from './reveal.js';
import { isNewTabClick } from './links.js';
import * as hint from './hint.js';
import * as idle from './idle.js';
import { preloadWhenIdle } from './libs.js';
import { isLocal } from './local.js';

// Was the Reveal opened from this page (so Back can close it)?
// False when the visitor arrived straight on a #norte link.
let openedHere = false;

const hashDestination = () => {
  let name;
  try { name = decodeURIComponent(location.hash.slice(1)); } catch { return null; } // broken #%xx
  return destinationFor(name) ? name : null;
};
const portalLink = (name) => document.querySelector(`.sr-nav a[data-dest="${name}"]`);

function openFromHash({ instant }) {
  const name = hashDestination();
  if (name && reveal.open(name, { instant, onRequestClose: requestClose })) hint.portalOpened();
}

function closeReveal() {
  const name = reveal.getDestination();
  reveal.close().then(() => {
    // The hash may have changed again while we were closing
    if (hashDestination()) { openedHere = true; openFromHash({ instant: false }); return; }
    portalLink(name)?.focus({ preventScroll: true });
    hint.popAway();
  });
}

// ✕ and Esc: Back if we added a history entry, otherwise just clear the hash
function requestClose() {
  const phase = reveal.getPhase();
  if (phase !== 'intro' && phase !== 'open') return;
  if (openedHere) history.back();
  else {
    history.replaceState(null, '', location.pathname + location.search);
    closeReveal();
  }
}

// Clicking a Portal letter or its hidden link opens the Reveal instead of leaving.
// Ctrl/Cmd/Shift-clicks stay normal links (open VC Map in a new tab or window).
function onPortalClick(e) {
  const name = e.currentTarget.closest('[data-dest]').dataset.dest;
  if (!destinationFor(name) || isNewTabClick(e)) return;
  e.preventDefault();
  if (reveal.getPhase() !== 'rest') return;
  openedHere = true;
  location.hash = name; // the hashchange below opens it
}
document.querySelectorAll('.title .portal a, .sr-nav a[data-dest]').forEach((a) => a.addEventListener('click', onPortalClick));

window.addEventListener('hashchange', () => {
  if (hashDestination()) {
    if (reveal.getPhase() === 'rest') { openedHere = true; openFromHash({ instant: false }); }
  } else if (reveal.getPhase() !== 'rest') closeReveal();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') requestClose();
});

// Coming back from the Destination with Back: the page may be restored as it was
window.addEventListener('pageshow', (e) => {
  if (e.persisted) reveal.resume();
});

// On Antonio's computer only: the tuning panel. Waited for (everything above is
// already wired), so his saved values are in place before a #norte link opens
// the Reveal. Never on the official site.
if (isLocal(location)) {
  try { (await import('./tuning.js')).start(); } catch (e) { console.warn('Tuning panel failed to load', e); }
}

// A #norte link opens straight into the Reveal
openFromHash({ instant: true });
idle.start();
// The 3D Reveal's libraries arrive quietly once the page is idle (never for reduced motion)
if (!matchMedia('(prefers-reduced-motion: reduce)').matches) preloadWhenIdle();
