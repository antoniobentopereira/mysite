// Norte Token: a yellow compass, built in code (no model file). Its red needle
// points at the lever's red ball, swinging and wobbling like a real one (needle.js).
//
// The 3D Token contract (every 3D Token module follows it):
//   createToken(THREE) returns
//     object          a Three.js group, built in a box 1 unit wide around 0, 0, 0,
//                     its front facing the visitor (+z); the scene sizes, places,
//                     flips, tumbles and lights it
//     update(dt, aim) optional, every frame it is shown: dt ms; aim.target is the
//                     screen angle (radians, y down) from the Token to the lever's
//                     ball (null: none), aim.turn how far it is spun on screen
//     dispose()
import { createNeedle } from '../../needle.js';

const R = 0.37; // case radius
const DEPTH = 0.13; // case thickness
const UP = -Math.PI / 2; // on screen, "up" is this angle (y down)

export function createToken(THREE) {
  const object = new THREE.Group();
  const geometries = [], materials = [];
  const keep = (g) => { geometries.push(g); return g; };
  const mat = (m) => { materials.push(m); return m; };
  const add = (parent, geometry, material, [x, y, z] = [0, 0, 0]) => {
    const m = new THREE.Mesh(keep(geometry), material);
    m.position.set(x, y, z);
    parent.add(m);
    return m;
  };

  // Yellow case in glossy paint, like the Hero; a darker brass bezel and ring
  const paint = mat(new THREE.MeshPhysicalMaterial({ color: '#f2c200', roughness: 0.35, clearcoat: 1, clearcoatRoughness: 0.08 }));
  const brass = mat(new THREE.MeshStandardMaterial({ color: '#c08a10', metalness: 0.7, roughness: 0.3 }));
  const face = mat(new THREE.MeshStandardMaterial({ color: '#fff6d8', roughness: 0.7 }));
  const ink = mat(new THREE.MeshStandardMaterial({ color: '#1d1a10', roughness: 0.6 }));
  const red = mat(new THREE.MeshPhysicalMaterial({ color: '#d6232c', roughness: 0.3, clearcoat: 0.6 }));
  const pale = mat(new THREE.MeshStandardMaterial({ color: '#e8e2cf', roughness: 0.5 }));

  const body = add(object, new THREE.CylinderGeometry(R, R, DEPTH, 64), paint);
  body.rotation.x = Math.PI / 2; // its round face to the front
  add(object, new THREE.TorusGeometry(R - 0.02, 0.035, 12, 64), brass, [0, 0, DEPTH / 2]);
  add(object, new THREE.CircleGeometry(R - 0.05, 64), face, [0, 0, DEPTH / 2 + 0.002]);
  add(object, new THREE.TorusGeometry(0.06, 0.022, 10, 24), brass, [0, R + 0.06, 0]); // the ring on top

  // Ticks: 4 long (N, E, S, W) and 4 short
  for (let i = 0; i < 8; i++) {
    const long = i % 2 === 0, a = (i * Math.PI) / 4;
    const tick = add(object, new THREE.BoxGeometry(0.018, long ? 0.07 : 0.04, 0.006), ink);
    const r = R - 0.1 + (long ? 0 : 0.015);
    tick.position.set(Math.sin(a) * r, Math.cos(a) * r, DEPTH / 2 + 0.005);
    tick.rotation.z = -a;
  }

  // The needle: red half points where it is aiming, pale half behind; a brass pin
  const needleGroup = new THREE.Group();
  needleGroup.position.z = DEPTH / 2 + 0.02;
  const half = (len) => {
    const s = new THREE.Shape();
    s.moveTo(0, len); s.lineTo(0.045, 0); s.lineTo(-0.045, 0); s.closePath();
    return new THREE.ExtrudeGeometry(s, { depth: 0.012, bevelEnabled: false });
  };
  add(needleGroup, half(0.25), red);
  add(needleGroup, half(0.2), pale).rotation.z = Math.PI;
  add(needleGroup, new THREE.SphereGeometry(0.028, 16, 10), brass, [0, 0, 0.014]);
  object.add(needleGroup);

  const needle = createNeedle({ angle: UP }); // starts pointing up its case
  const ex = new THREE.Vector3(), ey = new THREE.Vector3();
  return {
    object,
    update(dt, { target = null, turn = 0 } = {}) {
      const angle = needle.step(dt, target, turn);
      // Turn the needle so that, as seen on screen, it points at `angle`, however
      // the compass is turned and tumbled: the face's own x and y axes as they
      // look on screen (y up) say which turn on the face gives that direction.
      object.updateWorldMatrix(true, false);
      ex.set(1, 0, 0).transformDirection(object.matrixWorld);
      ey.set(0, 1, 0).transformDirection(object.matrixWorld);
      const det = ex.x * ey.y - ey.x * ex.y;
      if (Math.abs(det) < 0.05) return; // face seen edge-on: no telling, keep it as it is
      const dx = Math.cos(angle), dy = -Math.sin(angle); // on screen, y up
      const fx = (ey.y * dx - ey.x * dy) / det, fy = (ex.x * dy - ex.y * dx) / det; // on the face
      needleGroup.rotation.z = Math.atan2(fy, fx) + UP; // the red half points along +y
    },
    dispose() {
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
    },
  };
}
