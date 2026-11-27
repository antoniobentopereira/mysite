// Physics for the Reveal (Matter.js, 2D: position + spin, in screen pixels).
// Bodies are only created at the explosion.
//
// Gravity modes:
//   'zerog'  Zero-g (default): Tokens float, drift gently and bounce off the edges.
//   'toy'    Toy box (hidden from visitors): Tokens fall and pile up at the bottom.
// Switch with createWorld(Matter, P, { mode: 'toy' }), see GRAVITY_MODE in reveal.js.
//
// Visitors grab and fling Tokens with mouse or finger on `element` (the Reveal's
// stage). Only Tokens can be grabbed, never the walls or the hitboxes.

const STEP = 1000 / 60; // fixed physics step (ms); speeds are in px per step
const MAX_SPEED = 40;
const WALL = 400; // wall thickness, so fast Tokens can't tunnel out
const TOKEN = 0x0002; // collision category of Tokens (walls and hitboxes keep the default, 1)
const MOUSE_EVENTS = ['mousemove', 'mousedown', 'mouseup', 'touchmove', 'touchstart', 'touchend', 'wheel', 'mousewheel', 'DOMMouseScroll'];

export function createWorld(Matter, P, { mode = 'zerog', element } = {}) {
  const { Engine, Bodies, Body, Composite, Mouse, MouseConstraint, Query } = Matter;
  const engine = Engine.create();
  engine.gravity.y = mode === 'toy' ? P.gravity : 0;
  const airDrag = mode === 'zerog' ? P.drag / 1000 : 0.015;
  const bodies = [];
  let walls = [], solids = [], W = innerWidth, H = innerHeight;
  let acc = 0;

  // Walls just outside the screen edges
  function buildWalls() {
    const T = WALL;
    Composite.remove(engine.world, walls);
    walls = [
      Bodies.rectangle(W / 2, H + T / 2, W + 2 * T, T, { isStatic: true }),
      Bodies.rectangle(W / 2, -T / 2, W + 2 * T, T, { isStatic: true }),
      Bodies.rectangle(-T / 2, H / 2, T, H + 2 * T, { isStatic: true }),
      Bodies.rectangle(W + T / 2, H / 2, T, H + 2 * T, { isStatic: true }),
    ];
    Composite.add(engine.world, walls);
  }
  buildWalls();

  // A Token whose middle ends up off-screen (window shrank, flung through a wall)
  // comes back just inside the nearest edge. Normal bounces never trigger this.
  function keepInside(b) {
    const { x, y } = b.position, r = (b.bounds.max.x - b.bounds.min.x) / 2;
    if (x >= 0 && x <= W && y >= 0 && y <= H) return;
    Body.setPosition(b, { x: Math.min(Math.max(x, r), Math.max(r, W - r)), y: Math.min(Math.max(y, r), Math.max(r, H - r)) });
  }

  // Grab and fling
  let mouse = null, grab = null;
  if (element) {
    mouse = Mouse.create(element);
    // Matter listens to the wheel to zoom; the Reveal doesn't zoom
    ['mousewheel', 'DOMMouseScroll', 'wheel'].forEach((n) => element.removeEventListener(n, mouse.mousewheel));
    grab = MouseConstraint.create(engine, {
      mouse, collisionFilter: { category: 0x0001, mask: TOKEN },
      constraint: { stiffness: 0.15, damping: 0.1, render: { visible: false } },
    });
    Composite.add(engine.world, grab);
  }
  // Matter only hears a release on the stage: one outside the window lets go too
  const releaseOutside = (e) => { if (!element.contains(e.target)) mouse.mouseup(e); };
  if (element) addEventListener('mouseup', releaseOutside);

  return {
    /**
     * Add a Token body at (x, y), size `size`, and blast it away from `from`
     * (the centre of the whole title) with a random spread.
     */
    blast(x, y, size, from) {
      const b = Bodies.rectangle(x, y, size * 0.86, size * 0.86, {
        chamfer: { radius: size * 0.3 }, restitution: 0.45, friction: 0.25, frictionAir: airDrag,
        collisionFilter: { category: TOKEN },
      });
      Composite.add(engine.world, b);
      bodies.push(b);
      // Away from the title's centre; a Token right at the centre gets a random direction
      const away = Math.hypot(x - from.x, y - from.y) > 1 ? Math.atan2(y - from.y, x - from.x) : Math.random() * 2 * Math.PI;
      const ang = away + ((Math.random() - 0.5) * 2 * P.spread * Math.PI) / 180;
      const sp = P.speed * (0.7 + Math.random() * 0.6);
      // In Toy box a bit of extra lift, so they arc before falling
      Body.setVelocity(b, { x: Math.cos(ang) * sp, y: Math.sin(ang) * sp - (mode === 'toy' ? P.speed * 0.45 : 0) });
      Body.setAngularVelocity(b, (Math.random() - 0.5) * 0.35);
      return b;
    },

    /** The screen changed size: move the walls, bring every Token back on screen. */
    resize(width, height) {
      W = width; H = height;
      buildWalls();
      bodies.forEach(keepInside);
    },

    /**
     * Make these boxes solid ({ x, y, w, h, pad } in screen px; null: none).
     * Zero-g only. Each is shrunk by P.solidInset (plus its own pad) on every
     * side: Tokens float under the HTML, so a tight hitbox lets them tuck a
     * little behind the edges without ever covering the middle.
     */
    setSolids(boxes) {
      Composite.remove(engine.world, solids);
      solids = [];
      if (!boxes || mode !== 'zerog') return;
      solids = boxes.map((s) => {
        const cut = P.solidInset + (s.pad || 0);
        const w = Math.max(10, s.w - 2 * cut), h = Math.max(10, s.h - 2 * cut);
        return Bodies.rectangle(s.x + s.w / 2, s.y + s.h / 2, w, h, { isStatic: true, chamfer: { radius: Math.min(12, w / 3, h / 3) } });
      });
      Composite.add(engine.world, solids);
    },

    /** Advance by dt ms (in fixed steps). */
    update(dt) {
      acc += Math.min(dt, 100); // a long pause doesn't fast-forward
      while (acc >= STEP) {
        if (mode === 'zerog') {
          for (const b of bodies) {
            const v = b.velocity, sp = Math.hypot(v.x, v.y);
            // Slow Tokens get a tiny random nudge, so they keep drifting instead of freezing
            if (sp < 0.5) Body.applyForce(b, b.position, { x: (Math.random() - 0.5) * b.mass * 1.5e-4, y: (Math.random() - 0.5) * b.mass * 1.5e-4 });
            if (sp > MAX_SPEED) Body.setVelocity(b, { x: (v.x / sp) * MAX_SPEED, y: (v.y / sp) * MAX_SPEED });
          }
        }
        Engine.update(engine, STEP);
        acc -= STEP;
      }
      bodies.forEach(keepInside);
      // A hand over a Token says it can be grabbed
      if (element) {
        const cursor = grab.body ? 'grabbing' : Query.point(bodies, mouse.position).length ? 'grab' : '';
        if (element.style.cursor !== cursor) element.style.cursor = cursor;
      }
    },

    destroy() {
      if (element) {
        MOUSE_EVENTS.forEach((n) => {
          element.removeEventListener(n, mouse.mousemove);
          element.removeEventListener(n, mouse.mousedown);
          element.removeEventListener(n, mouse.mouseup);
        });
        element.style.cursor = '';
        removeEventListener('mouseup', releaseOutside);
      }
      Composite.clear(engine.world, false);
      Engine.clear(engine);
      bodies.length = 0;
    },
  };
}
