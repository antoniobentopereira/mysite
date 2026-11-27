// The temporary flat Norte Hero, drawn in code (the 3D N replaces it in ticket 07).
// It is one thick line: N stem -> valley -> tail rising up-right, ending in an
// arrowhead, with a dark outline and an "extruded" edge.
//
// The default export draws into a 200 x 200 box: draw(ctx, { grow })
//   grow: 0 = a clean N (stem and diagonal, no tail),
//         1 = the tail has grown into the rising arrow (like a line graph)

const YELLOW = '#f2c200', SHADE = '#a87400', INK = '#1d1a10';
// In box units: face width, outline, depth of the extruded edge, its dark rim, and
// the step between the copies that build the edge (small, so its sides look smooth)
const WIDTH = 24, OUTLINE = 4, DEPTH = 11, RIM = 1.5, STEP = 0.5;

// The Hero's line, and where the tail ends when fully grown (the arrowhead's base)
const STEM = [[40, 172], [40, 60], [100, 128]];
const TAIL_END = [157.6, 61.6];
const HEAD_LEN = 34, HEAD_HALF = 22; // arrowhead: length along the tail, half its base
const TUCK = 8; // the line runs this far into the head, so no seam shows between them

const lerp = (a, b, t) => a + (b - a) * t;
const clamp01 = (v) => Math.max(0, Math.min(1, v));
const easeOutBack = (t) => 1 + 2.2 * (t - 1) ** 3 + 1.2 * (t - 1) ** 2;

export default function drawNorteHero(ctx, { grow }) {
  const pts = [...STEM];
  let headPath = null;
  // Only once the tail exists does the line get a 4th point (a zero-length last
  // piece would draw a stray corner at the valley)
  if (grow > 0) {
    const [vx, vy] = STEM[2];
    const dx = TAIL_END[0] - vx, dy = TAIL_END[1] - vy, len = Math.hypot(dx, dy);
    const ux = dx / len, uy = dy / len;
    const t = clamp01(grow / 0.75); // the line grows first, the head pops on its tip
    const headS = easeOutBack(clamp01(grow)) * clamp01(grow / 0.25);
    const base = [lerp(vx, TAIL_END[0], t), lerp(vy, TAIL_END[1], t)];
    pts.push([base[0] + ux * TUCK * headS, base[1] + uy * TUCK * headS]);
    const L = HEAD_LEN * headS, B = HEAD_HALF * headS;
    const head = [[base[0] + ux * L, base[1] + uy * L], [base[0] + uy * B, base[1] - ux * B], [base[0] - uy * B, base[1] + ux * B]];
    headPath = new Path2D(`M${head.map((p) => p.join(' ')).join('L')}Z`);
  }
  const path = new Path2D();
  pts.forEach(([x, y], i) => (i ? path.lineTo(x, y) : path.moveTo(x, y)));

  // The whole shape, `extra` units fatter than the face, shifted down-left by `d`
  const layer = (color, extra, d) => {
    ctx.save();
    ctx.translate(-d, d);
    ctx.strokeStyle = color; ctx.fillStyle = color;
    ctx.lineWidth = WIDTH + extra;
    ctx.stroke(path);
    if (headPath) {
      ctx.fill(headPath);
      if (extra > 0) { ctx.lineJoin = 'round'; ctx.lineWidth = extra; ctx.stroke(headPath); }
    }
    ctx.restore();
  };
  ctx.save();
  ctx.lineCap = 'butt';
  ctx.lineJoin = 'miter';
  ctx.miterLimit = 10;
  // The extruded edge is one solid block: a dark silhouette with the shade inside it
  for (let d = DEPTH; d >= 0; d -= STEP) layer(INK, 2 * OUTLINE, d);
  for (let d = DEPTH - RIM; d >= STEP; d -= STEP) layer(SHADE, 2 * OUTLINE - 2 * RIM, d);
  layer(INK, 2 * OUTLINE, 0); // outline
  layer(YELLOW, 0, 0); // face
  ctx.restore();
}
