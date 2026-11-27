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
  const { Engine, Bodies, Body, Composite, Mouse, MouseConstraint, Query, Vertices } = Matter;
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

  // A Token caught inside a hitbox (it was there when the hitboxes appeared, or
  // was dragged deep in) jumps to the nearest spot on screen where it touches
  // none, keeping its speed. Matter alone pushes it out slowly or wedges it.
  const DIRS = Array.from({ length: 16 }, (_, i) => [Math.cos((i * Math.PI) / 8), Math.sin((i * Math.PI) / 8)]);
  function moveOut(b) {
    const from = { ...b.position }, r = (b.bounds.max.x - b.bounds.min.x) / 2;
    for (let d = 4; d <= Math.max(W, H); d += 4) {
      for (const [dx, dy] of DIRS) {
        const x = from.x + dx * d, y = from.y + dy * d;
        if (x < r || x > W - r || y < r || y > H - r) continue;
        Body.setPosition(b, { x, y });
        if (!Query.collides(b, solids).length) return;
      }
    }
    Body.setPosition(b, from); // no free spot (tiny screen): leave it to the physics
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
     * Make these shapes solid (screen px; null: none). Zero-g only. Each shape is
     *   { x, y, w, h, radius }  a box (top left, size, rounded corners), or
     *   { cx, cy, r }           a circle, or
     *   { points: [{x, y}] }    the outline around these points (made convex).
     * A Token already caught inside one is moved to the nearest free spot.
     */
    setSolids(shapes) {
      Composite.remove(engine.world, solids);
      solids = [];
      if (!shapes || mode !== 'zerog') return;
      solids = shapes.map((s) => {
        const opts = { isStatic: true };
        if (s.points) {
          const v = Vertices.clockwiseSort(Vertices.hull(s.points.map((p) => ({ ...p }))));
          return Body.create({ ...opts, position: Vertices.centre(v), vertices: v });
        }
        if (s.r) return Bodies.circle(s.cx, s.cy, s.r, opts);
        const w = Math.max(4, s.w), h = Math.max(4, s.h), radius = Math.min(s.radius || 0, w / 2 - 1, h / 2 - 1);
        return Bodies.rectangle(s.x + w / 2, s.y + h / 2, w, h, radius > 0 ? { ...opts, chamfer: { radius } } : opts);
      });
      Composite.add(engine.world, solids);
      bodies.forEach((b) => { if (Query.collides(b, solids).length) moveOut(b); });
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
      // Deep inside a hitbox (its middle is in one): out it goes
      if (solids.length) bodies.forEach((b) => { if (Query.point(solids, b.position).length) moveOut(b); });
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
