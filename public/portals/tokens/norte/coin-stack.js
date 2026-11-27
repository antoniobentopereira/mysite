// Norte Token: a little stack of gold coins, built in code (no model file).
// Follows the 3D Token contract described in compass.js.

const COIN_R = 0.27, COIN_H = 0.075, COINS = 5;

export function createToken(THREE) {
  const object = new THREE.Group();
  const geometries = [], materials = [];
  const keep = (g) => { geometries.push(g); return g; };

  const gold = new THREE.MeshPhysicalMaterial({ color: '#f2c200', metalness: 0.55, roughness: 0.3, clearcoat: 0.5, clearcoatRoughness: 0.15 });
  const rim = new THREE.MeshStandardMaterial({ color: '#d9a400', metalness: 0.7, roughness: 0.35 });
  materials.push(gold, rim);
  const coin = keep(new THREE.CylinderGeometry(COIN_R, COIN_R, COIN_H, 48));
  const ring = keep(new THREE.TorusGeometry(COIN_R - 0.045, 0.014, 8, 48));

  // Seen a little from above, so the top coin's face shows
  const stack = new THREE.Group();
  stack.rotation.x = 0.5;
  object.add(stack);
  // A slightly messy stack: each coin a touch off centre
  const nudge = [[0, 0], [0.025, -0.01], [-0.02, 0.015], [0.01, 0.02], [-0.015, -0.01]];
  for (let i = 0; i < COINS; i++) {
    const m = new THREE.Mesh(coin, gold);
    m.position.set(nudge[i][0], (i - (COINS - 1) / 2) * COIN_H, nudge[i][1]);
    stack.add(m);
  }
  // The top coin's face: a raised rim and a star, Norte's sign
  const top = (COINS - 1) / 2 * COIN_H + COIN_H / 2;
  const [tx, tz] = nudge[COINS - 1];
  const r = new THREE.Mesh(ring, rim);
  r.rotation.x = Math.PI / 2;
  r.position.set(tx, top, tz);
  stack.add(r);
  const star = new THREE.Shape();
  for (let i = 0; i < 10; i++) {
    const a = Math.PI / 2 + (i * Math.PI) / 5, q = i % 2 ? 0.055 : 0.13;
    i ? star.lineTo(Math.cos(a) * q, Math.sin(a) * q) : star.moveTo(Math.cos(a) * q, Math.sin(a) * q);
  }
  const s = new THREE.Mesh(keep(new THREE.ExtrudeGeometry(star, { depth: 0.014, bevelEnabled: false })), rim);
  s.rotation.x = -Math.PI / 2; // lying on the coin, pointing away from the visitor
  s.position.set(tx, top, tz);
  stack.add(s);

  return {
    object,
    dispose() {
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
    },
  };
}
