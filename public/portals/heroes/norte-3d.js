// The Norte Hero: a solid 3D N built in code (no model file). It is one thick
// line, N stem -> valley -> tail rising up-right, ending in an arrowhead, pushed
// out into depth (extruded) with softly rounded edges. It looks like a built,
// mounted object: glossy yellow car paint with a clear coat, made of plates
// (thin seams where they meet) held by a few small painted rivets.
//
// createHero(THREE, { color }) returns
//   object       a Three.js group to add to the scene. Its units are a square box
//                around the grown Hero, BOX.size wide (x right, y up, the middle
//                of the box at 0, 0): scale it by size / BOX.size to make the box
//                `size` px wide.
//   setGrow(g)   0 = a clean N (stem and diagonal, no tail),
//                1 = the tail has grown into the rising arrow, head on its tip
//   dispose()
// It has no hitbox: it spins once landed, and Tokens float behind it freely (and
// can still be grabbed there).
// The paint's highlights come from the scene's environment (scene.js builds a
// small studio for it); without one it still looks right, only less glossy.

// In drawing units (y down, like the screen; flipped to y up when building)
const STEM = [[40, 172], [40, 60], [100, 128]]; // the N: stem bottom, stem top, valley
const TAIL_ANGLE = Math.atan2(-66.4, 57.6); // the tail rises up-right at this angle
const TAIL_LEN = 250; // the grown tail, valley to arrowhead base: long, like Norte's (~2.2 stems)
const WIDTH = 24; // the line's width
const CUT = 2; // a corner sharper than this (its point reaches past CUT half-widths) is cut flat
const DEPTH = 20; // how far it is pushed back
const BEVEL = 2; // the rounded edge around the front and back faces (its depth)
const BEVEL_OUT = BEVEL * 0.75; // ... and how far it reaches out past the outline
const HEAD_LEN = 34, HEAD_HALF = 22; // arrowhead: length along the tail, half its base
const SEAM = 0.7; // width of the thin groove where two plates meet
const RIVET = 1.5, RIVET_RISE = 0.45; // rivet radius, and its height as a share of that
const RIVET_EDGE = 4.5; // how far a rivet sits in from the stroke's edge
const RIVET_STEP = 3.5; // and how far beside its seam, on the next plate
// Its own pose: turned a little round its upright axis so its right side shows,
// like the "N becomes a rising arrow" picture (radians). How far it leans back is
// a tuning value (heroTilt, in choreography.js).
export const TILT = { y: -0.42 };

const clamp01 = (v) => Math.max(0, Math.min(1, v));
const lerp = (a, b, t) => a + (b - a) * t;
const easeOutBack = (t) => 1 + 2.2 * (t - 1) ** 3 + 1.2 * (t - 1) ** 2;
const unit = (a, b) => { const l = Math.hypot(b[0] - a[0], b[1] - a[1]); return [(b[0] - a[0]) / l, (b[1] - a[1]) / l]; };
const along = (p, d, s) => [p[0] + d[0] * s, p[1] + d[1] * s];

const [VX, VY] = STEM[2];
const TAIL_DIR = [Math.cos(TAIL_ANGLE), Math.sin(TAIL_ANGLE)];
const TAIL_END = along(STEM[2], TAIL_DIR, TAIL_LEN); // where the grown tail ends (the arrowhead's base)
const TAIL_ACROSS = [-TAIL_DIR[1], TAIL_DIR[0]]; // the tail's left side

// At line point p, the direction across the line (pointing to its left side) and
// how far the line's edge is along it: half a width on a straight piece, more on a
// sharp (mitred) corner
function across(prev, p, next) {
  const normal = (a, b) => { const [x, y] = unit(a, b); return [-y, x]; };
  const n0 = prev && normal(prev, p), n1 = next && normal(p, next);
  let [nx, ny] = n0 && n1 ? [n0[0] + n1[0], n0[1] + n1[1]] : n0 || n1;
  const l = Math.hypot(nx, ny); nx /= l; ny /= l;
  const n = n1 || n0;
  return { dir: [nx, ny], reach: WIDTH / 2 / (nx * n[0] + ny * n[1]) };
}

// The outline of a thick line through `pts` (drawing units), with mitred corners;
// a very sharp corner (the N's top left) is cut flat across the stroke coming in,
// like a real N's top, instead of ending in a long spike.
// With `head` ({ len, half }) the last end grows an arrowhead, as one outline:
// no second solid overlapping the line, so no hairline where they meet.
function strip(pts, head) {
  const left = [], right = [];
  const half = WIDTH / 2;
  pts.forEach((p, i) => {
    const { dir: [nx, ny], reach: k } = across(pts[i - 1], p, pts[i + 1]);
    const l = [p[0] + nx * k, p[1] + ny * k], r = [p[0] - nx * k, p[1] - ny * k];
    if (k <= CUT * half) { left.push(l); right.push(r); return; }
    // Cut: the outer side gets two corners on a line square to the incoming
    // stroke, half a width past p. Each is where an outer edge meets that line.
    const d0 = unit(pts[i - 1], p), d1 = unit(p, pts[i + 1]);
    const dot = (a, b) => a[0] * b[0] + a[1] * b[1];
    const s = dot([l[0] - p[0], l[1] - p[1]], d0) > 0 ? 1 : -1; // which side is outer
    const meet = (d) => {
      const q = along(p, [-d[1] * s, d[0] * s], half); // a point on that outer edge
      const t = (half - dot([q[0] - p[0], q[1] - p[1]], d0)) / dot(d, d0);
      return along(q, d, t);
    };
    const cut = [meet(d0), meet(d1)];
    if (s > 0) { left.push(...cut); right.push(r); } else { left.push(l); right.push(...cut); }
  });
  const tip = [];
  if (head) {
    const p = pts[pts.length - 1], d = unit(pts[pts.length - 2], p), n = [-d[1], d[0]];
    tip.push(along(p, n, head.half), along(p, d, head.len), along(p, n, -head.half));
  }
  return [...left, ...tip, ...right.reverse()];
}

// The box: a square around the fully grown Hero, centred on it, so it spins
// round its own middle and fills its spot. A little room all round, so leaning
// and spinning (parts come nearer and look bigger) never spill past its spot.
const GROWN = strip([...STEM, TAIL_END], { len: HEAD_LEN, half: HEAD_HALF });
const xs = GROWN.map((p) => p[0]), ys = GROWN.map((p) => p[1]);
const [minX, maxX, minY, maxY] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
const ROOM = 1.08;
/** The Hero's box, in drawing units: its size and its middle ({ size, cx, cy }). */
export const BOX = {
  size: Math.max(maxX - minX, maxY - minY) * ROOM,
  cx: (minX + maxX) / 2, cy: (minY + maxY) / 2,
};
const toGroup = ([u, v]) => [u - BOX.cx, BOX.cy - v]; // drawing (y down) -> group units (y up)

export function createHero(THREE, { color }) {
  const paintColor = new THREE.Color(color);
  // Car paint: a bright yellow base under a hard, glassy clear coat
  const paint = new THREE.MeshPhysicalMaterial({
    color: paintColor, metalness: 0, roughness: 0.22,
    clearcoat: 1, clearcoatRoughness: 0.03, envMapIntensity: 1,
    // In the scene's see-through pass, so it draws on top of the flat cards
    transparent: true, opacity: 1, depthWrite: true, depthTest: true,
  });
  // Seams: a dark, dull groove between two painted plates
  const seamPaint = new THREE.MeshStandardMaterial({
    color: paintColor.clone().multiplyScalar(0.28), roughness: 0.75, metalness: 0,
    transparent: true, opacity: 1, depthWrite: true, depthTest: true,
  });
  const extrude = (outline) => {
    const shape = new THREE.Shape(outline.map((p) => new THREE.Vector2(...toGroup(p))));
    const g = new THREE.ExtrudeGeometry(shape, {
      depth: DEPTH - 2 * BEVEL, bevelEnabled: true, bevelThickness: BEVEL, bevelSize: BEVEL_OUT, bevelSegments: 3, curveSegments: 1,
    });
    g.translate(0, 0, -(DEPTH - 2 * BEVEL) / 2); // centred on z = 0, so it turns around its middle
    return g;
  };
  const mesh = (geometry, material) => { const m = new THREE.Mesh(geometry, material); m.renderOrder = 2; return m; };

  const group = new THREE.Group();
  const body = mesh(extrude(strip(STEM)), paint);
  group.add(body);

  // ---------- Seams and rivets ----------
  // Each is shown only once its part of the line exists (the tail grows).
  const box = new THREE.BoxGeometry(1, 1, 1), dome = new THREE.SphereGeometry(1, 20, 10);
  const parts = []; // { obj, show(state) }
  const add = (obj, show = () => true) => { group.add(obj); parts.push({ obj, show }); return obj; };

  // A seam across the line at p: a groove over the front and back faces, over
  // all four rounded edges and along both side walls (it spins: every side shows).
  function seam(p, { dir, reach }, show) {
    const g = new THREE.Group(), [x, y] = toGroup(p), front = DEPTH / 2;
    g.position.set(x, y, 0);
    g.rotation.z = Math.atan2(-dir[1], dir[0]); // its local x runs across the line
    const piece = (sx, sz, px, pz, ry = 0) => {
      const m = mesh(box, seamPaint);
      m.scale.set(sx, SEAM, sz);
      m.position.set(px, 0, pz);
      m.rotation.y = ry;
      g.add(m);
    };
    const wall = reach * (WIDTH / 2 + BEVEL_OUT + 0.1) / (WIDTH / 2);
    piece(2 * wall, DEPTH - 2 * BEVEL, 0, 0); // pokes out of both side walls
    // Over a face, and over its rounded edges from the face's edge to the wall
    const run = wall - reach, len = Math.hypot(run, BEVEL), lift = 0.3;
    const [ox, oz] = [BEVEL / len * lift, run / len * lift]; // lifted off the curve a little
    for (const f of [1, -1]) { // front, back
      piece(2 * reach, 0.3, 0, f * front);
      for (const s of [1, -1]) piece(len, 0.6, s * ((reach + wall) / 2 + ox), f * (front - BEVEL / 2 + oz), Math.atan2(s * f * BEVEL, run));
    }
    return add(g, show);
  }
  // A small, low, painted rivet at p, on the front face and the same on the back.
  // Returns the two, so they can be moved.
  function rivet(p, show) {
    return [1, -1].map((f) => {
      const m = mesh(dome, paint), [x, y] = toGroup(p);
      m.scale.set(RIVET, RIVET, RIVET * RIVET_RISE);
      m.position.set(x, y, f * DEPTH / 2);
      return add(m, show);
    });
  }
  // Two rivets beside a seam, near both edges of the line, on the plate `d` points to
  function rivets(p, { dir, reach }, d, show) {
    const inset = reach * (WIDTH / 2 - RIVET_EDGE) / (WIDTH / 2), q = along(p, d, RIVET_STEP);
    rivet(along(q, dir, inset), show);
    rivet(along(q, dir, -inset), show);
  }

  const tailShown = (s) => s.tail > 0;
  const tailPast = (share) => (s) => s.tail >= share * TAIL_LEN + RIVET_STEP + RIVET;
  // The stem: two plates, joined halfway up, and two rivets near its foot
  const stemMid = [STEM[0][0], (STEM[0][1] + STEM[1][1]) / 2], stemUp = unit(STEM[0], STEM[1]);
  seam(stemMid, across(STEM[0], stemMid, STEM[1]));
  rivets(stemMid, across(STEM[0], stemMid, STEM[1]), stemUp);
  rivets(along(STEM[0], stemUp, RIVET_EDGE), across(null, STEM[0], STEM[1]), [0, 0]);
  // The diagonal is a plate of its own: its seam sits just past the stem's top
  // corner, where the stroke is a clean width
  const diag = unit(STEM[1], STEM[2]), diagAt = along(STEM[1], diag, 40);
  const diagAcross = { dir: [-diag[1], diag[0]], reach: WIDTH / 2 };
  seam(diagAt, diagAcross);
  rivets(diagAt, diagAcross, diag);
  // The valley, once the tail starts: the tail is another plate
  const valley = across(STEM[1], STEM[2], TAIL_END);
  seam(STEM[2], valley, tailShown);
  rivets(STEM[2], { dir: valley.dir, reach: valley.reach * 0.8 }, TAIL_DIR, tailPast(0));
  // The long tail is three plates: seams a third and two thirds up, once grown past
  const straight = { dir: TAIL_ACROSS, reach: WIDTH / 2 };
  for (const share of [1 / 3, 2 / 3]) {
    const at = along(STEM[2], TAIL_DIR, TAIL_LEN * share);
    seam(at, straight, tailPast(share));
    rivets(at, straight, TAIL_DIR, tailPast(share));
  }
  // Two rivets just behind the head (they move with the tip while it grows). No
  // seam there: head and tail are one smooth piece.
  const headRivets = [];
  for (const side of [1, -1]) {
    const inset = WIDTH / 2 - RIVET_EDGE;
    headRivets.push([rivet(TAIL_END, (s) => s.head > 0.6), side * inset]);
  }

  let grown = null;
  function setGrow(grow) {
    grow = clamp01(grow);
    if (grow === grown) return;
    grown = grow;
    const t = clamp01(grow / 0.75); // the line grows first, the head pops on its tip
    const headS = easeOutBack(grow) * clamp01(grow / 0.25);
    const base = [lerp(VX, TAIL_END[0], t), lerp(VY, TAIL_END[1], t)];
    // Only once the tail is long enough does the line get a 4th point (a tiny
    // last piece has no clear direction)
    const tail = t * TAIL_LEN > 0.5 ? t * TAIL_LEN : 0;
    const head = tail && headS > 0.02 ? { len: HEAD_LEN * headS, half: HEAD_HALF * headS } : null;
    body.geometry.dispose();
    body.geometry = extrude(tail ? strip([...STEM, base], head) : strip(STEM));
    // The head's rivets ride on the tip
    const state = { tail, head: head ? headS : 0 };
    const behind = along(base, TAIL_DIR, -RIVET_STEP);
    for (const [pair, s] of headRivets) {
      const [x, y] = toGroup(along(behind, TAIL_ACROSS, s));
      for (const m of pair) m.position.set(x, y, m.position.z);
    }
    for (const p of parts) p.obj.visible = p.show(state);
  }
  setGrow(0);

  return {
    object: group,
    setGrow,
    dispose() { body.geometry.dispose(); box.dispose(); dome.dispose(); paint.dispose(); seamPaint.dispose(); },
  };
}

/**
 * Where the clean N (before its tail grows) sits, in drawing units (y down):
 * { left, top, right, bottom }, so it can be fitted over the clicked letter.
 */
export function letterBounds() {
  const pts = strip(STEM), xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  return { left: Math.min(...xs), top: Math.min(...ys), right: Math.max(...xs), bottom: Math.max(...ys) };
}

/** Which way the grown arrow points, on screen (x right, y down; a unit vector). */
export const ARROW_DIR = { x: TAIL_DIR[0], y: TAIL_DIR[1] };
