// The arcade lever: the Norte Enter control (feel ported from the prototype).
// Drag the ball forward (up / right) past the threshold, or just tap it, to fire.
// Releasing a drag early springs it back. It is a real <button>, so Enter and
// Space fire it too.

const THROW_PX = 90; // drag distance for a full push
const TAP_PX = 6; // moving less than this counts as a tap
const MAX_TILT = 45; // degrees

export function buildLever(label) {
  const el = document.createElement('div');
  el.className = 'lever-wrap';
  el.innerHTML = `
    <button class="lever" type="button">
      <span class="lever-box"></span><span class="lever-stick"><span class="lever-ball"></span></span>
    </button>
    <span class="lever-label" aria-hidden="true">Push to<br>launch ↗</span>`;
  el.querySelector('.lever').setAttribute('aria-label', label);
  return el;
}

/** Wire a lever button. onFire is called once per push; reset() puts it back upright. */
export function wireLever(lever, onFire) {
  let startX = 0, startY = 0, moved = 0, active = false;
  const tilt = (amount) => lever.style.setProperty('--tilt', `${amount * MAX_TILT}deg`);
  const stop = () => { active = false; lever.classList.remove('dragging'); };
  const reset = () => { stop(); tilt(0); }; // back upright, springily
  const fire = () => { stop(); tilt(1); onFire(); };
  tilt(0);

  lever.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    active = true; moved = 0; startX = e.clientX; startY = e.clientY;
    lever.setPointerCapture(e.pointerId);
    lever.classList.add('dragging');
  });
  lever.addEventListener('pointermove', (e) => {
    if (!active) return;
    const dx = e.clientX - startX, dy = e.clientY - startY;
    moved = Math.max(moved, Math.hypot(dx, dy));
    const amount = Math.min(Math.max((dx - dy) / THROW_PX, 0), 1); // forward = right or up
    tilt(amount);
    if (amount >= 1) fire();
  });
  lever.addEventListener('pointerup', () => {
    if (!active) return;
    if (moved < TAP_PX) fire();
    else reset(); // let go early: spring back
  });
  lever.addEventListener('pointercancel', reset);
  // Keyboard (Enter / Space) gives a click with detail 0; pointer clicks are handled above
  lever.addEventListener('click', (e) => { if (e.detail === 0) fire(); });

  return { reset };
}
