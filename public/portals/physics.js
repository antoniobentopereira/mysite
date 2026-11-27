// Physics for the Reveal (Matter.js, 2D: position + spin, in screen pixels).
// Bodies are only created at the explosion.
//
// Gravity modes:
//   'zerog'  Zero-g (default): Tokens float, drift gently and bounce off the edges.
//   'toy'    Toy box (hidden from visitors): Tokens fall and pile up at the bottom.
// Switch with createWorld(Matter, P, { mode: 'toy' }), see GRAVITY_MODE in reveal.js.
//
// Grabbing and the Hero / card hitboxes come in ticket 05.

const STEP = 1000 / 60; // fixed physics step (ms); speeds are in px per step
const MAX_SPEED = 40;
const WALL = 400; // wall thickness, so fast Tokens can't tunnel out

export function createWorld(Matter, P, { mode = 'zerog' } = {}) {
  const { Engine, Bodies, Body, Composite } = Matter;
  const engine = Engine.create();
  engine.gravity.y = mode === 'toy' ? P.gravity : 0;
  const airDrag = mode === 'zerog' ? P.drag / 1000 : 0.015;
  const bodies = [];
  let acc = 0;

  // Walls just outside the screen edges
  const W = innerWidth, H = innerHeight, T = WALL;
  Composite.add(engine.world, [
    Bodies.rectangle(W / 2, H + T / 2, W + 2 * T, T, { isStatic: true }),
    Bodies.rectangle(W / 2, -T / 2, W + 2 * T, T, { isStatic: true }),
    Bodies.rectangle(-T / 2, H / 2, T, H + 2 * T, { isStatic: true }),
    Bodies.rectangle(W + T / 2, H / 2, T, H + 2 * T, { isStatic: true }),
  ]);

  return {
    /**
     * Add a Token body at (x, y), size `size`, and blast it away from `from`
     * (the centre of the whole title) with a random spread.
     */
    blast(x, y, size, from) {
      const b = Bodies.rectangle(x, y, size * 0.86, size * 0.86, {
        chamfer: { radius: size * 0.3 }, restitution: 0.45, friction: 0.25, frictionAir: airDrag,
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

    /** Advance by dt ms (in fixed steps). */
    update(dt) {
      acc += Math.min(dt, 100); // a long pause (hidden tab) doesn't fast-forward
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
    },

    destroy() {
      Composite.clear(engine.world, false);
      Engine.clear(engine);
      bodies.length = 0;
    },
  };
}
