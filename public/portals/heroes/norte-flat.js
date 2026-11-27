// The temporary flat Norte Hero, drawn in code (the 3D N replaces it in ticket 07).
// It is one thick line: N stem -> valley -> tail rising up-right, ending in an
// arrowhead, with a dark outline and a stepped "extruded" edge.
//
// The default export draws into a 200 x 200 box: draw(ctx, { from, morph, grow })
//   from:  the clicked letter as an N-shaped line { points: [4 points], width, color }
//   morph: 0 = that letter, 1 = the Hero's N (the letter's last stroke folded away)
//   grow:  0 = no tail, 1 = the tail has grown into the rising arrow (like a line graph)

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
const mix = (p, q, t) => [lerp(p[0], q[0], t), lerp(p[1], q[1], t)];
const clamp01 = (v) => Math.max(0, Math.min(1, v));
const easeOutBack = (t) => 1 + 2.2 * (t - 1) ** 3 + 1.2 * (t - 1) ** 2;

function mixColor(a, b, t) {
  // '#rrggbb' or a computed 'rgb(r, g, b)'
  const hex = (c) => (c.startsWith('#') ? [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16)) : c.match(/[\d.]+/g).slice(0, 3).map(Number));
  const [p, q] = [hex(a), hex(b)];
  return `rgb(${p.map((v, i) => Math.round(lerp(v, q[i], t))).join(',')})`;
}

export default function drawNorteHero(ctx, { from, morph, grow }) {
  const m = clamp01(morph);
  const alpha = ctx.globalAlpha; // the caller may be fading the whole Hero
  // The line: the letter's 4 points slide onto the Hero's N, whose 4th point waits in
  // the valley; then the tail grows from the valley to its end
  const target = [...STEM, STEM[2]];
  const pts = from.points.map((p, i) => mix(p, target[i], m));
  const tailT = clamp01(grow / 0.75); // the line grows first, the head pops on its tip
  const dir = [TAIL_END[0] - STEM[2][0], TAIL_END[1] - STEM[2][1]];
  const len = Math.hypot(...dir), ux = dir[0] / len, uy = dir[1] / len;
  const headS = grow > 0 ? easeOutBack(clamp01(grow)) * clamp01(grow / 0.25) : 0;
  if (grow > 0) {
    const end = mix(STEM[2], TAIL_END, tailT);
    pts[3] = [end[0] + ux * TUCK * headS, end[1] + uy * TUCK * headS];
  }
  const tip = pts[3];
  const head = headS > 0 && (() => {
    const base = [tip[0] - ux * TUCK * headS, tip[1] - uy * TUCK * headS];
    const L = HEAD_LEN * headS, B = HEAD_HALF * headS;
    return [[base[0] + ux * L, base[1] + uy * L], [base[0] + uy * B, base[1] - ux * B], [base[0] - uy * B, base[1] + ux * B]];
  })();

  const width = lerp(from.width, WIDTH, m);
  const path = new Path2D();
  pts.forEach(([x, y], i) => (i ? path.lineTo(x, y) : path.moveTo(x, y)));
  const headPath = head && new Path2D(`M${head.map((p) => p.join(' ')).join('L')}Z`);

  ctx.save();
  ctx.lineCap = 'butt';
  // The letter has flat corners; the Hero has sharp ones
  ctx.lineJoin = m < 0.5 ? 'bevel' : 'miter';
  ctx.miterLimit = 10;
  // The whole shape, `extra` units fatter than the face, shifted down-left by `d`
  const layer = (color, extra, d) => {
    ctx.save();
    ctx.translate(-d, d);
    ctx.strokeStyle = color; ctx.fillStyle = color;
    ctx.lineWidth = width + extra;
    ctx.stroke(path);
    if (headPath) { ctx.lineJoin = 'round'; ctx.lineWidth = extra; ctx.fill(headPath); ctx.stroke(headPath); }
    ctx.restore();
  };
  // Extruded edge and outline appear as the letter becomes the Hero. The edge is
  // one solid block: a dark silhouette with the shade inside it, so no loose
  // shaded bits stick out (e.g. beside the arrowhead)
  ctx.globalAlpha = alpha * m;
  for (let d = DEPTH; d >= 0; d -= STEP) layer(INK, 2 * OUTLINE, d);
  for (let d = DEPTH - RIM; d >= STEP; d -= STEP) layer(SHADE, 2 * OUTLINE - 2 * RIM, d);
  layer(INK, 2 * OUTLINE, 0);
  // The face: the letter's colour turning yellow
  ctx.globalAlpha = alpha;
  ctx.lineJoin = m < 0.5 ? 'bevel' : 'miter';
  const face = mixColor(from.color, YELLOW, m);
  ctx.strokeStyle = face; ctx.fillStyle = face;
  ctx.lineWidth = width;
  ctx.stroke(path);
  if (headPath) ctx.fill(headPath);
  ctx.restore();
}
