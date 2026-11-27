// The hint line under the bottom-left text ("some letters are doors").
// Once a portal has been opened it is remembered in the browser (localStorage),
// and the hint pops away the next time the homepage is back at rest.
// On later visits a tiny script in index.html hides it before the page shows.
const KEY = 'portal-hint-done'; // keep in sync with the script in index.html
const root = document.documentElement;
const reduced = matchMedia('(prefers-reduced-motion: reduce)');

let opened = false; // a portal was opened on this page

/** A portal was opened: remember it for this and later visits. */
export function portalOpened() {
  opened = true;
  try { localStorage.setItem(KEY, '1'); } catch { /* storage blocked: it comes back next visit */ }
}

/** Back at rest: if a portal was opened, pop the hint away (no animation for reduced motion). */
export function popAway() {
  const hint = document.querySelector('.hint');
  if (!hint || root.classList.contains('hint-done') || !opened) return;
  const done = () => root.classList.add('hint-done');
  if (reduced.matches) return done();
  hint.classList.add('is-popping');
  hint.addEventListener('animationend', done, { once: true });
  hint.addEventListener('animationcancel', done, { once: true }); // cut short: hide it anyway
}
