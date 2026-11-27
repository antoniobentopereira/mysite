// The 3D Reveal: one full-screen Three.js (WebGL) canvas under the HTML card
// (ADR 0002). It draws the colour burst, the letters turned into flat cards,
// the Tokens and the Hero, and plays the intro and the closing reassembly.
//
// Coordinates: everything is placed in screen pixels (x right, y down). The camera
// is set up so the z = 0 plane maps 1:1 to the screen, which is what lets the
// letter cards line up exactly with the HTML title at the moment of the click.
import { timeline, CLOSE_MS } from './choreography.js';
import { createWorld } from './physics.js';

const FOV = 30; // degrees; small, so flips and tilts get a gentle perspective
const HERO_MORPH_MS = 600; // the clicked letter becoming the Hero
const HERO_GROW_MS = 650; // the Hero's tail growing into the rising arrow
const DEG = Math.PI / 180;
const clamp01 = (v) => Math.max(0, Math.min(1, v));
const lerp = (a, b, t) => a + (b - a) * t;
const easeOut = (t) => 1 - (1 - t) ** 3;
const easeInOut = (t) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2);
const normAngle = (a) => ((((a + Math.PI) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)) - Math.PI;
const centre = (r) => ({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
// A letter's place and size without its transform (pop-in, hover wiggle, idle charge)
function letterBox(span) {
  span.getAnimations({ subtree: true }).forEach((a) => { try { a.finish(); } catch { /* endless: leave it */ } });
  const c = centre(span.getBoundingClientRect());
  return { ...c, width: span.offsetWidth, height: span.offsetHeight };
}

// One flip, from the front face to the back face, `u` ms in, lasting `dur` ms:
// turn away (40%), swap faces, turn back with a little overshoot (60%).
function flipPose(u, dur) {
  const out = dur * 0.4;
  if (u <= 0) return { ry: 0, s: 1, back: false };
  if (u < out) { const p = u / out; return { ry: 90 * DEG * p * p, s: 1 - 0.15 * p, back: false }; }
  const p = clamp01((u - out) / (dur - out));
  if (p < 0.7) { const q = p / 0.7; return { ry: -90 * DEG * (1 - easeOut(q)), s: 0.6 + 0.58 * q, back: true }; }
  return { ry: 0, s: 1.18 - 0.18 * ((p - 0.7) / 0.3), back: true };
}

/**
 * Build the scene and start the intro.
 *   libs: { THREE, Matter }
 *   letters: the title's letter spans, in order; heroIndex: the Portal letter
 *   tokens: [{ name, src }] for the other letters, in title order
 *   drawHero(ctx, { from, morph, grow }): draws the flat Hero in a 200 x 200 box
 *     (see heroes/norte-flat.js); the 3D Hero replaces it in ticket 07
 *   heroSlot: element whose box is where the Hero lands
 *   atEnd: skip the intro (direct #norte links, Back from the Destination)
 *   onFirstFrame: called once the scene covers the title (time to hide it)
 * Returns { canvas, finish(), close() -> Promise, destroy() }.
 */
export function createScene(libs, { color, letters, heroIndex, tokens: tokenList, drawHero, heroSlot, P, mode, atEnd, onFirstFrame }) {
  const { THREE, Matter } = libs;
  const W = innerWidth, H = innerHeight;
  const S = Math.max(54, Math.min(112, Math.min(W, H) * 0.14)); // Token size, px
  const tl = timeline(P, tokenList.length);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(W, H);
  renderer.setClearColor(0x000000, 0);
  const canvas = renderer.domElement;
  canvas.className = 'reveal-canvas';
  canvas.setAttribute('aria-hidden', 'true');

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(FOV, W / H, 1, 10000);
  camera.position.z = H / 2 / Math.tan((FOV / 2) * DEG);

  const textures = [];
  const keep = (tex) => { tex.colorSpace = THREE.SRGBColorSpace; textures.push(tex); return tex; };
  const quad = new THREE.PlaneGeometry(1, 1);
  const material = (map) => new THREE.MeshBasicMaterial({ map, transparent: true, depthTest: false, depthWrite: false });
  function card(order) {
    const mesh = new THREE.Mesh(quad, material(null));
    mesh.rotation.order = 'ZYX'; // spin in the screen plane, flip around the card's own upright axis
    mesh.renderOrder = order;
    scene.add(mesh);
    return mesh;
  }
  // Put a card at screen point (x, y), size w x h, spun by rz (clockwise) and flipped by ry
  function place(mesh, x, y, w, h, rz = 0, ry = 0) {
    mesh.position.set(x - W / 2, H / 2 - y, 0);
    mesh.scale.set(Math.max(w, 0.01), Math.max(h, 0.01), 1);
    mesh.rotation.set(0, ry, -rz);
  }

  // ---------- Textures ----------
  // A letter drawn in the homepage font and colour, the same size as the HTML letter.
  function letterTexture(span) {
    const r = letterBox(span), cs = getComputedStyle(span);
    const fs = parseFloat(cs.fontSize), pad = Math.ceil(fs * 0.25); // room for overhanging glyphs
    const w = r.width + 2 * pad, h = r.height + 2 * pad, dpr = renderer.getPixelRatio();
    const c = document.createElement('canvas');
    c.width = Math.ceil(w * dpr); c.height = Math.ceil(h * dpr);
    const ctx = c.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${fs}px ${cs.fontFamily}`;
    ctx.fillStyle = cs.color;
    ctx.textBaseline = 'alphabetic';
    const m = ctx.measureText(span.textContent);
    // The letter's box is one line high; its text is centred in it the way CSS does
    const baseline = pad + (r.height + m.fontBoundingBoxAscent - m.fontBoundingBoxDescent) / 2;
    ctx.fillText(span.textContent, pad, baseline);
    // Where the ink is, inside this canvas (css px)
    const ink = { left: pad - m.actualBoundingBoxLeft, right: pad + m.actualBoundingBoxRight, top: baseline - m.actualBoundingBoxAscent, bottom: baseline + m.actualBoundingBoxDescent };
    return { tex: keep(new THREE.CanvasTexture(c)), canvas: c, ink, color: cs.color, w, h, x: r.x, y: r.y };
  }
  // An SVG file drawn into a texture; until it has loaded the card shows nothing
  function imageTexture(src, px) {
    const c = document.createElement('canvas');
    c.width = c.height = px;
    const tex = keep(new THREE.CanvasTexture(c));
    const img = new Image();
    img.onload = () => { c.getContext('2d').drawImage(img, 0, 0, px, px); tex.needsUpdate = true; };
    img.src = src;
    return tex;
  }

  // ---------- Burst ----------
  const burst = new THREE.Mesh(new THREE.CircleGeometry(1, 96), new THREE.MeshBasicMaterial({ color: new THREE.Color(color), depthTest: false, depthWrite: false }));
  burst.renderOrder = 0;
  scene.add(burst);
  const heroSpan = letters[heroIndex];
  const origin = letterBox(heroSpan);
  const R = Math.hypot(W, H) * 1.05;
  const setBurst = (r) => { burst.position.set(origin.x - W / 2, H / 2 - origin.y, 0); burst.scale.set(Math.max(r, 0.01), Math.max(r, 0.01), 1); };

  // ---------- Tokens: one per other letter ----------
  const others = letters.filter((_, i) => i !== heroIndex);
  const tokens = others.map((span, i) => {
    const letter = letterTexture(span);
    const k0 = (span.offsetHeight * 0.8) / S; // in place, a Token is about letter size
    return {
      mesh: card(1), letter, sticker: imageTexture(tokenList[i].src, 256), k0,
      home: { x: letter.x, y: letter.y }, rank: 0, body: null, k: k0,
      pose: { x: letter.x, y: letter.y, rz: 0, ry: 0, s: 1, back: false },
    };
  });
  // Chain order: nearest to the Portal letter first
  [...tokens].sort((a, b) => Math.hypot(a.home.x - origin.x, a.home.y - origin.y) - Math.hypot(b.home.x - origin.x, b.home.y - origin.y))
    .forEach((t, rank) => { t.rank = rank; });
  const titleRect = heroSpan.closest('.title').getBoundingClientRect();
  const blastFrom = centre(titleRect); // the middle of the whole name, so they scatter every way

  function drawToken(t) {
    const p = t.pose;
    t.mesh.material.map = p.back ? t.sticker : t.letter.tex;
    if (p.back) place(t.mesh, p.x, p.y, S * t.k * p.s, S * t.k * p.s, p.rz, p.ry);
    else place(t.mesh, p.x, p.y, t.letter.w * p.s, t.letter.h * p.s, p.rz, p.ry);
  }

  // ---------- Hero (temporary flat art; the 3D Hero comes in ticket 07) ----------
  // A square canvas, redrawn while the clicked letter morphs into the Hero and while
  // its tail grows. In the letter's spot it is scaled so the Hero's N matches the letter.
  const heroLetter = letterTexture(heroSpan);
  const size0 = heroSpan.offsetHeight / 0.6;
  const heroStart = { x: heroLetter.x + 0.15 * size0, y: heroLetter.y - 0.075 * size0, size: size0, rz: 0 };
  const slot = heroSlot.getBoundingClientRect();
  const heroEnd = { ...centre(slot), size: Math.min(slot.width, slot.height), rz: 0 };
  const hero = { pose: { ...heroStart }, morph: 0, grow: 0 };

  const HERO_PX = 1024;
  const heroCanvas = document.createElement('canvas');
  heroCanvas.width = heroCanvas.height = HERO_PX;
  const heroCtx = heroCanvas.getContext('2d');
  const heroTex = keep(new THREE.CanvasTexture(heroCanvas));
  const heroMesh = card(2);
  heroMesh.material.map = heroTex;
  // The letter, in the Hero's 200-unit box at the start pose
  const unit = size0 / 200;
  const letterLeft = (heroLetter.x - heroLetter.w / 2 - (heroStart.x - size0 / 2)) / unit;
  const letterTop = (heroLetter.y - heroLetter.h / 2 - (heroStart.y - size0 / 2)) / unit;
  const ink = heroLetter.ink;
  const gl = letterLeft + ink.left / unit, gr = letterLeft + ink.right / unit;
  const gt = letterTop + ink.top / unit, gb = letterTop + ink.bottom / unit;
  const sw = (gr - gl) * 0.23; // an N's stroke is about a quarter of its width
  // The letter as one N-shaped line: up the left stem, down the diagonal, up the right stem
  const from = {
    points: [[gl + sw / 2, gb], [gl + sw / 2, gt], [gr - sw / 2, gb], [gr - sw / 2, gt]],
    width: sw, color: heroLetter.color,
  };
  let drawn = '';
  function paintHero() {
    const key = `${hero.morph.toFixed(3)} ${hero.grow.toFixed(3)}`;
    if (key === drawn) return; // nothing changed: keep the texture
    drawn = key;
    heroCtx.setTransform(1, 0, 0, 1, 0, 0);
    heroCtx.clearRect(0, 0, HERO_PX, HERO_PX);
    heroCtx.scale(HERO_PX / 200, HERO_PX / 200);
    // The real letter fades out as its N-shaped line takes over
    const swap = clamp01(hero.morph / 0.25);
    if (swap < 1) {
      heroCtx.globalAlpha = 1 - swap;
      heroCtx.drawImage(heroLetter.canvas, letterLeft, letterTop, heroLetter.w / unit, heroLetter.h / unit);
    }
    heroCtx.globalAlpha = swap;
    if (swap > 0) drawHero(heroCtx, { from, morph: hero.morph, grow: hero.grow });
    heroCtx.globalAlpha = 1;
    heroTex.needsUpdate = true;
  }
  function showHero() {
    paintHero();
    const p = hero.pose;
    place(heroMesh, p.x, p.y, p.size, p.size, p.rz);
  }

  // ---------- Physics ----------
  const world = createWorld(Matter, P, { mode });
  let exploded = false;
  function explode() {
    exploded = true;
    for (const t of tokens) {
      t.pose = { ...t.pose, ry: 0, s: 1, back: true };
      t.body = world.blast(t.home.x, t.home.y, S, blastFrom);
    }
  }

  // ---------- Intro ----------
  function introFrame(t, dt) {
    setBurst(R * easeInOut(clamp01(t / P.burst)));
    // The clicked letter morphs into the Hero in place, right away
    hero.morph = easeInOut(clamp01((t - 100) / HERO_MORPH_MS));
    // Then flies to its spot, with a little overshoot and tilt
    const u = clamp01((t - tl.heroAt) / P.heroFly);
    const p = easeOut(clamp01(u / 0.6));
    const big = u < 0.6 ? lerp(1, 1.08, p) : lerp(1.08, 1, (u - 0.6) / 0.4);
    const tilt = u < 0.6 ? lerp(0, -6, p) : lerp(-6, 0, (u - 0.6) / 0.4);
    Object.assign(hero.pose, {
      x: lerp(heroStart.x, heroEnd.x, p), y: lerp(heroStart.y, heroEnd.y, p),
      size: lerp(heroStart.size, heroEnd.size * big, p), rz: tilt * DEG,
    });
    // On landing, its tail grows up into the rising arrow
    hero.grow = easeInOut(clamp01((t - (tl.arriveAt - 150)) / HERO_GROW_MS));

    if (!exploded && t >= tl.explodeAt) explode();
    const shrink = 1 - Math.exp(-dt / (P.shrink / 3));
    for (const tk of tokens) {
      if (tk.body) {
        tk.k = Math.abs(tk.k - 1) > 0.001 ? tk.k + (1 - tk.k) * shrink : 1; // to Token size (on phones letters can be smaller)
        Object.assign(tk.pose, { x: tk.body.position.x, y: tk.body.position.y, rz: tk.body.angle });
      } else {
        tk.pose = { ...tk.pose, ...flipPose(t - (P.morphStart + tk.rank * P.stagger), P.morphDur) };
      }
    }
  }

  // ---------- Closing: everything goes home and flips back into letters ----------
  let closeFrom = null;
  function closeFrame(t) {
    setBurst(R * (1 - easeInOut(clamp01((t - 350) / 650))));
    tokens.forEach((tk, i) => {
      const from = closeFrom.tokens[i];
      const m = easeInOut(clamp01((t - i * 30) / 700));
      tk.k = lerp(from.k, tk.k0, m);
      const pose = { x: lerp(from.x, tk.home.x, m), y: lerp(from.y, tk.home.y, m), rz: lerp(from.rz, 0, m), s: 1 };
      if (from.back) { // flip back into the letter on the way
        const u = t - (320 + i * 30);
        if (u < 160) Object.assign(pose, { ry: 90 * DEG * clamp01(u / 160), back: true });
        else Object.assign(pose, { ry: -90 * DEG * (1 - easeOut(clamp01((u - 160) / 220))), back: false });
      } else Object.assign(pose, { ry: lerp(from.ry, 0, m), back: false });
      tk.pose = pose;
    });
    // The Hero: the tail shrinks back, it flies home, then morphs back into the N
    const h = closeFrom.hero, m = easeInOut(clamp01((t - 300) / 600));
    hero.grow = h.grow * (1 - easeInOut(clamp01(t / 300)));
    hero.pose = { x: lerp(h.x, heroStart.x, m), y: lerp(h.y, heroStart.y, m), size: lerp(h.size, heroStart.size, m), rz: lerp(h.rz, 0, m) };
    hero.morph = h.morph * (1 - easeInOut(clamp01((t - 880) / 250)));
  }

  // ---------- Frame loop ----------
  let t0 = performance.now() - (atEnd ? tl.openAt : 0);
  let last = 0, raf = 0, first = true, closing = null, closeStart = 0;
  function frame(now) {
    raf = requestAnimationFrame(frame);
    const dt = last ? now - last : 16;
    last = now;
    if (closing) {
      const t = now - closeStart;
      closeFrame(t);
      if (t >= CLOSE_MS) { closing.resolve(); closing = null; cancelAnimationFrame(raf); }
    } else {
      introFrame(now - t0, dt);
      world.update(dt);
    }
    tokens.forEach(drawToken);
    showHero();
    renderer.render(scene, camera);
    if (first) { first = false; onFirstFrame?.(); }
  }
  raf = requestAnimationFrame(frame);

  return {
    canvas,
    /** Skip to the end of the intro (the Tokens still blast out from their letters). */
    finish() {
      t0 = Math.min(t0, performance.now() - tl.openAt);
    },
    /** Play the reassembly. Resolves when the title is whole again. */
    close() {
      if (closing) return closing.promise;
      closeFrom = {
        tokens: tokens.map((tk) => ({ ...tk.pose, rz: normAngle(tk.pose.rz), k: tk.k })),
        hero: { ...hero.pose, morph: hero.morph, grow: hero.grow },
      };
      world.destroy();
      tokens.forEach((tk) => { tk.body = null; });
      let resolve;
      const promise = new Promise((r) => { resolve = r; });
      closing = { promise, resolve };
      closeStart = performance.now();
      return promise;
    },
    destroy() {
      cancelAnimationFrame(raf);
      world.destroy();
      textures.forEach((t) => t.dispose());
      scene.traverse((o) => { o.geometry?.dispose(); o.material?.dispose(); });
      renderer.dispose();
      canvas.remove();
    },
  };
}
