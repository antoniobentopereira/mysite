// Loads our own copies of Three.js and Matter.js (public/portals/vendor/, made by
// `npm run vendor`). Never from a CDN (ADR 0001, 0002).
// They are fetched quietly once the homepage is idle, or at the first open at the latest.
let loading = null;

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.onload = resolve;
    s.onerror = () => { s.remove(); reject(new Error(`Could not load ${src}`)); };
    document.head.append(s);
  });
}

/** Resolves to { THREE, Matter, createScene }. A failed load can be retried later. */
export function loadLibs() {
  if (!loading) {
    const base = new URL('./vendor/', import.meta.url);
    loading = Promise.all([
      import(new URL('three.min.js', base).href),
      // Matter.js is a classic script that sets window.Matter
      window.Matter ? null : loadScript(new URL('matter.min.js', base).href),
      import('./scene.js'), // the 3D Reveal itself, only needed with the libraries
    ]).then(([THREE, , { createScene }]) => ({ THREE, Matter: window.Matter, createScene }))
      .catch((err) => { loading = null; throw err; });
  }
  return loading;
}

/** Fetch the libraries once the page has loaded and the browser is idle. */
export function preloadWhenIdle() {
  const go = () => {
    const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 200));
    idle(() => loadLibs().catch(() => { /* tried again at the first open */ }), { timeout: 3000 });
  };
  if (document.readyState === 'complete') go();
  else addEventListener('load', go, { once: true });
}
