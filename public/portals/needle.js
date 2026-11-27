// A compass needle with a little weight: a spring pulls it toward its target and
// the fluid in the case slows it, so it swings past, wobbles back and settles,
// and trails behind a moving target instead of sticking to it.
//
// Angles are in radians, measured on the screen (x right, y down), and the needle
// keeps its own angle unwrapped (it can count past a full turn).
//   createNeedle({ angle }) -> { angle, step(dt, target, caseAngle) -> angle }
//   step: dt ms; target: where it is pulled (null: no pull); caseAngle: how the
//   compass case is turned right now (when the case spins, the fluid drags the
//   needle along a little, but it keeps pointing at its target)

const PULL = 30; // spring stiffness (1/s²): how hard it is pulled toward the target
const FLUID = 2.2; // damping (1/s): how quickly its swings die down (low = wobblier)
const SUBSTEP = 1000 / 120; // ms; small steps keep the swing steady at any frame rate

const wrap = (a) => Math.atan2(Math.sin(a), Math.cos(a)); // -π..π: the short way round

export function createNeedle({ angle = 0 } = {}) {
  let speed = 0; // rad/s
  let lastCase = null;
  return {
    get angle() { return angle; },
    step(dt, target, caseAngle = 0) {
      dt = Math.min(dt, 100); // a long pause doesn't fling it
      const caseSpeed = lastCase === null || dt <= 0 ? 0 : wrap(caseAngle - lastCase) / (dt / 1000);
      lastCase = caseAngle;
      for (let left = dt; left > 0; left -= SUBSTEP) {
        const h = Math.min(SUBSTEP, left) / 1000;
        const pull = target === null ? 0 : PULL * wrap(target - angle);
        speed += (pull - FLUID * (speed - caseSpeed)) * h;
        angle += speed * h;
      }
      return angle;
    },
  };
}
