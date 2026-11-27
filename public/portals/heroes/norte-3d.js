// The Norte Hero: a solid 3D N built in code (no model file). It is one thick
// line, N stem -> valley -> tail rising up-right, ending in an arrowhead, pushed
// out into depth (extruded) with softly rounded edges.
//
// createHero(THREE, { color }) returns
//   object       a Three.js group to add to the scene. Its units are a 200 x 200
//                box (x right, y up, the middle of the box at 0, 0): scale it by
//                size / 200 to make the box `size` px wide.
//   setGrow(g)   0 = a clean N (stem and diagonal, no tail),
//                1 = the tail has grown into the rising arrow, head on its tip
//   pieces()     the fully grown Hero's shape, for its hitbox: a list of convex
//                pieces, each a list of corner points (THREE.Vector3, in the
//                group's units, front and back), one per stroke and one for the head
//   dispose()

// In box units (y down, like the screen; flipped to y up when building)
const STEM = [[40, 172], [40, 60], [100, 128]]; // the N: stem bottom, stem top, valley
const TAIL_END = [157.6, 61.6]; // where the grown tail ends (the arrowhead's base)
const WIDTH = 24; // the line's width
const DEPTH = 20; // how far it is pushed back
const BEVEL = 2; // the rounded edge around the front and back faces
const HEAD_LEN = 34, HEAD_HALF = 22; // arrowhead: length along the tail, half its base
const TUCK = 8; // the line runs this far into the head, so no seam shows between them
// Its own pose: turned a little so its right side and underside show, like the
// "N becomes a rising arrow" picture (radians)
export const TILT = { x: -0.28, y: -0.42 };

const clamp01 = (v) => Math.max(0, Math.min(1, v));
const lerp = (a, b, t) => a + (b - a) * t;
const easeOutBack = (t) => 1 + 2.2 * (t - 1) ** 3 + 1.2 * (t - 1) ** 2;
const toGroup = ([u, v]) => [u - 100, 100 - v]; // box (y down) -> group units (y up)

const [VX, VY] = STEM[2];
const TAIL_LEN = Math.hypot(TAIL_END[0] - VX, TAIL_END[1] - VY);
const TAIL_DIR = [(TAIL_END[0] - VX) / TAIL_LEN, (TAIL_END[1] - VY) / TAIL_LEN];

// The outline of a thick line through `pts` (box units), with sharp (mitred) corners
function strip(pts, half) {
  const normal = (a, b) => { const l = Math.hypot(b[0] - a[0], b[1] - a[1]); return [-(b[1] - a[1]) / l, (b[0] - a[0]) / l]; };
  const left = [], right = [];
  pts.forEach((p, i) => {
    const n0 = i > 0 ? normal(pts[i - 1], p) : null, n1 = i < pts.length - 1 ? normal(p, pts[i + 1]) : null;
    let [nx, ny] = n0 && n1 ? [n0[0] + n1[0], n0[1] + n1[1]] : n0 || n1;
    const l = Math.hypot(nx, ny); nx /= l; ny /= l;
    const k = half / (nx * (n1 || n0)[0] + ny * (n1 || n0)[1]); // miter length
    left.push([p[0] + nx * k, p[1] + ny * k]);
    right.push([p[0] - nx * k, p[1] - ny * k]);
  });
  return [...left, ...right.reverse()];
}

export function createHero(THREE, { color }) {
  const material = new THREE.MeshStandardMaterial({
    color: new THREE.Color(color), roughness: 0.42, metalness: 0.08,
    // In the scene's see-through pass, so it draws on top of the flat cards
    transparent: true, opacity: 1, depthWrite: true, depthTest: true,
  });
  const extrude = (outline) => {
    const shape = new THREE.Shape(outline.map((p) => new THREE.Vector2(...toGroup(p))));
    const g = new THREE.ExtrudeGeometry(shape, {
      depth: DEPTH - 2 * BEVEL, bevelEnabled: true, bevelThickness: BEVEL, bevelSize: BEVEL * 0.75, bevelSegments: 2, curveSegments: 1,
    });
    g.translate(0, 0, -(DEPTH - 2 * BEVEL) / 2); // centred on z = 0, so it turns around its middle
    return g;
  };

  const group = new THREE.Group();
  const line = new THREE.Mesh(extrude(strip(STEM, WIDTH / 2)), material);
  // The head is built once, base at the origin pointing along +x; it is placed,
  // turned and scaled to pop on the tail's tip
  const head = new THREE.Mesh(extrude([[HEAD_LEN, 100], [0, 100 - HEAD_HALF], [0, 100 + HEAD_HALF]].map(([u, v]) => [u + 100, v])), material);
  head.rotation.z = Math.atan2(-TAIL_DIR[1], TAIL_DIR[0]);
  line.renderOrder = head.renderOrder = 2;
  group.add(line, head);

  let grown = null;
  function setGrow(grow) {
    grow = clamp01(grow);
    if (grow === grown) return;
    grown = grow;
    const t = clamp01(grow / 0.75); // the line grows first, the head pops on its tip
    const headS = easeOutBack(grow) * clamp01(grow / 0.25);
    const pts = [...STEM];
    // Only once the tail exists does the line get a 4th point (a zero-length
    // last piece has no direction)
    if (grow > 0) {
      const base = [lerp(VX, TAIL_END[0], t), lerp(VY, TAIL_END[1], t)];
      pts.push([base[0] + TAIL_DIR[0] * TUCK * headS, base[1] + TAIL_DIR[1] * TUCK * headS]);
      head.position.set(...toGroup(base), 0);
    }
    line.geometry.dispose();
    line.geometry = extrude(strip(pts, WIDTH / 2));
    head.visible = headS > 0.01;
    head.scale.setScalar(Math.max(headS, 0.01));
  }
  setGrow(0);

  function pieces() {
    const half = WIDTH / 2 + BEVEL, z = DEPTH / 2;
    const both = (pts) => pts.flatMap(([u, v]) => { const [x, y] = toGroup([u, v]); return [new THREE.Vector3(x, y, z), new THREE.Vector3(x, y, -z)]; });
    const pts = [...STEM, TAIL_END], out = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const [ax, ay] = pts[i], [bx, by] = pts[i + 1];
      const l = Math.hypot(bx - ax, by - ay), ux = (bx - ax) / l, uy = (by - ay) / l;
      // Corners between strokes stick out a little: reach half a width past them
      const a0 = i > 0 ? half : 0, b0 = i < pts.length - 2 ? half : 0;
      const A = [ax - ux * a0, ay - uy * a0], B = [bx + ux * b0, by + uy * b0];
      const nx = -uy * half, ny = ux * half;
      out.push(both([[A[0] + nx, A[1] + ny], [B[0] + nx, B[1] + ny], [B[0] - nx, B[1] - ny], [A[0] - nx, A[1] - ny]]));
    }
    const [hx, hy] = TAIL_END, [ux, uy] = TAIL_DIR, L = HEAD_LEN + BEVEL, Bh = HEAD_HALF + BEVEL;
    out.push(both([[hx + ux * L, hy + uy * L], [hx + uy * Bh, hy - ux * Bh], [hx - uy * Bh, hy + ux * Bh]]));
    return out;
  }

  return {
    object: group,
    setGrow,
    pieces,
    dispose() { line.geometry.dispose(); head.geometry.dispose(); material.dispose(); },
  };
}

/**
 * Where the clean N (before its tail grows) sits in the 200 x 200 box (y down):
 * { left, top, right, bottom }, so it can be fitted over the clicked letter.
 */
export function letterBounds() {
  const pts = strip(STEM, WIDTH / 2), xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  return { left: Math.min(...xs), top: Math.min(...ys), right: Math.max(...xs), bottom: Math.max(...ys) };
}

/** Which way the grown arrow points, on screen (x right, y down; a unit vector). */
export const ARROW_DIR = { x: TAIL_DIR[0], y: TAIL_DIR[1] };
