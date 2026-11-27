// The compass Token's needle: a spring-damped pointer (see public/portals/needle.js).
import { test, expect } from '@playwright/test';
import { createNeedle } from '../public/portals/needle.js';

const DT = 1000 / 60;
const run = (needle, ms, target, caseAngle = 0) => {
  const seen = [];
  for (let t = 0; t < ms; t += DT) seen.push(needle.step(DT, typeof target === 'function' ? target(t) : target, caseAngle));
  return seen;
};

test('pointing away, it swings past the target, wobbles back, then settles on it', () => {
  const needle = createNeedle({ angle: Math.PI / 2 });
  const seen = run(needle, 6000, 0);
  expect(Math.min(...seen)).toBeLessThan(-0.1); // overshot to the other side
  expect(Math.abs(seen.at(-1))).toBeLessThan(0.01); // settled
});

test('it takes the short way round', () => {
  const deg = Math.PI / 180;
  const needle = createNeedle({ angle: 170 * deg });
  const seen = run(needle, 300, -170 * deg);
  // Heading through 180°, never back through 0°
  expect(seen.every((a) => Math.abs(a) > 90 * deg)).toBe(true);
});

test('it trails a moving target instead of staying locked onto it', () => {
  const needle = createNeedle({ angle: 0 });
  const speed = 1.5 / 1000; // radians per ms
  run(needle, 3000, (t) => t * speed);
  const lag = 3000 * speed - needle.angle;
  expect(lag).toBeGreaterThan(0.02); // behind
  expect(lag).toBeLessThan(0.6); // but following
});

test('spinning the case does not spin the needle with it', () => {
  const needle = createNeedle({ angle: 0 });
  let caseAngle = 0;
  for (let t = 0; t < 3000; t += DT) { caseAngle += 0.004 * DT; needle.step(DT, 0, caseAngle); }
  expect(Math.abs(needle.angle)).toBeLessThan(0.5); // the needle still points at the target
});

test('the compass needle points at its target on screen, however the compass is tumbled', async () => {
  const THREE = await import('three');
  const { createToken } = await import('../public/portals/tokens/norte/compass.js');
  const poses = [[0, 0, 0], [Math.PI, Math.PI, 0], [0.7, -0.5, 0.3], [-0.9, 2.4, -1.2]];
  for (const [x, y, z] of poses) {
    const compass = createToken(THREE);
    compass.object.rotation.set(x, y, z);
    const target = 0.6; // screen angle, y down: right and a bit down
    for (let i = 0; i < 600; i++) compass.update(1000 / 60, { target, turn: 0 }); // let it settle
    // Where its red tip (+y on the needle) points, as seen on screen (y down)
    const needle = compass.object.children.at(-1);
    needle.updateWorldMatrix(true, false);
    const tip = new THREE.Vector3(0, 1, 0).transformDirection(needle.matrixWorld);
    expect(Math.atan2(-tip.y, tip.x)).toBeCloseTo(target, 2);
    compass.dispose();
  }
});
