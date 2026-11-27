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
 *   drawHero(ctx, { grow }): draws the flat Hero in a 200 x 200 box
 *     (see heroes/norte-flat.js); the 3D Hero replaces it in ticket 07
 *   heroOutline(): the grown Hero's shape in that box, for its hitbox (optional)
 *   stage: the Reveal's HTML layer (over the canvas): Tokens are grabbed on it,
 *     and its Hero slot, word, card and lever become solid once the Hero lands
 *   atEnd: skip the intro (direct #norte links, Back from the Destination)
 *   onFirstFrame: called once the scene covers the title (time to hide it)
 * Returns { canvas, finish(), close() -> Promise, destroy() }, or null without WebGL.
 *
 * Resizing the window (or rotating a phone) re-lays everything out to the new
 * screen. While the tab is hidden the scene and its physics are paused.
 */
export function createScene(libs, { color, letters, heroIndex, tokens: tokenList, drawHero, heroOutline, stage, P, mode, atEnd, onFirstFrame }) {
  const { THREE, Matter } = libs;
  const heroSlot = stage.querySelector('.reveal-hero');
  let W = innerWidth, H = innerHeight;
  const S = Math.max(54, Math.min(112, Math.min(W, H) * 0.14)); // Token size, px
  const tl = timeline(P, tokenList.length);

  // No WebGL 2 (old device, turned off): no scene, the simple Reveal is used.
  // Asked first, so Three.js doesn't log an error trying.
  const probe = document.createElement('canvas').getContext('webgl2');
  if (!probe) return null;
  probe.getExtension('WEBGL_lose_context')?.loseContext(); // browsers allow only a few at once
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

  let textures = [];
  const keep = (tex) => { tex.colorSpace = THREE.SRGBColorSpace; textures.push(tex); return tex; };
  const drop = (tex) => { tex.dispose(); textures = textures.filter((t) => t !== tex); };
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
  let origin = letterBox(heroSpan);
  // Big enough to cover the screen's farthest corner from the burst's origin
  const burstRadius = () => Math.hypot(Math.max(origin.x, W - origin.x), Math.max(origin.y, H - origin.y)) * 1.05;
  let R = burstRadius();
  const setBurst = (r) => { burst.position.set(origin.x - W / 2, H / 2 - origin.y, 0); burst.scale.set(Math.max(r, 0.01), Math.max(r, 0.01), 1); };

  // ---------- Tokens: one per other letter ----------
  const others = letters.filter((_, i) => i !== heroIndex);
  const tokens = others.map((span, i) => {
    const letter = letterTexture(span);
    const k0 = (span.offsetHeight * 0.8) / S; // in place, a Token is about letter size
    return {
      span, mesh: card(1), letter, sticker: imageTexture(tokenList[i].src, 256), k0,
      home: { x: letter.x, y: letter.y }, rank: 0, body: null, k: k0,
      pose: { x: letter.x, y: letter.y, rz: 0, ry: 0, s: 1, back: false },
    };
  });
  // Chain order: nearest to the Portal letter first
  [...tokens].sort((a, b) => Math.hypot(a.home.x - origin.x, a.home.y - origin.y) - Math.hypot(b.home.x - origin.x, b.home.y - origin.y))
    .forEach((t, rank) => { t.rank = rank; });
  const blastCentre = () => centre(heroSpan.closest('.title').getBoundingClientRect());
  let blastFrom = blastCentre(); // the middle of the whole name, so they scatter every way

  function drawToken(t) {
    const p = t.pose;
    t.mesh.material.map = p.back ? t.sticker : t.letter.tex;
    if (p.back) place(t.mesh, p.x, p.y, S * t.k * p.s, S * t.k * p.s, p.rz, p.ry);
    else place(t.mesh, p.x, p.y, t.letter.w * p.s, t.letter.h * p.s, p.rz, p.ry);
  }

  // ---------- Hero (temporary flat art; the 3D Hero comes in ticket 07) ----------
  // The clicked letter flips (like the other letters) into a clean N drawn on a
  // square canvas, which is redrawn while its tail grows. In the letter's spot it is
  // scaled so the Hero's N matches the letter.
  let heroLetter = letterTexture(heroSpan);
  const heroStartFor = (l) => { const size = heroSpan.offsetHeight / 0.6; return { x: l.x + 0.15 * size, y: l.y - 0.075 * size, size, rz: 0 }; };
  const heroEndNow = () => { const slot = heroSlot.getBoundingClientRect(); return { ...centre(slot), size: Math.min(slot.width, slot.height), rz: 0 }; };
  let heroStart = heroStartFor(heroLetter), heroEnd = heroEndNow();
  const hero = { pose: { ...heroStart, ry: 0, s: 1, back: false }, grow: 0 };

  const HERO_PX = 1024;
  const heroCanvas = document.createElement('canvas');
  heroCanvas.width = heroCanvas.height = HERO_PX;
  const heroCtx = heroCanvas.getContext('2d');
  const heroTex = keep(new THREE.CanvasTexture(heroCanvas));
  const heroMesh = card(2), heroLetterMesh = card(2);
  heroMesh.material.map = heroTex;
  heroLetterMesh.material.map = heroLetter.tex;
  let drawn = -1;
  function paintHero() {
    if (hero.grow === drawn) return; // nothing changed: keep the texture
    drawn = hero.grow;
    heroCtx.setTransform(1, 0, 0, 1, 0, 0);
    heroCtx.clearRect(0, 0, HERO_PX, HERO_PX);
    heroCtx.scale(HERO_PX / 200, HERO_PX / 200);
    drawHero(heroCtx, { grow: hero.grow });
    heroTex.needsUpdate = true;
  }
  function showHero() {
    const p = hero.pose;
    heroMesh.visible = p.back;
    heroLetterMesh.visible = !p.back;
    if (p.back) { paintHero(); place(heroMesh, p.x, p.y, p.size * p.s, p.size * p.s, p.rz, p.ry); }
    else place(heroLetterMesh, heroLetter.x, heroLetter.y, heroLetter.w * p.s, heroLetter.h * p.s, 0, p.ry);
  }

  // ---------- Physics ----------
  const world = createWorld(Matter, P, { mode, element: stage });
  let exploded = false, solid = false;
  // Where an element of the stage sits, without its transform (the card still
  // slides in when it becomes solid). The stage is fixed at the top left.
  function layoutBox(el) {
    let x = 0, y = 0;
    for (let n = el; n && n !== stage; n = n.offsetParent) { x += n.offsetLeft; y += n.offsetTop; }
    return { x, y, w: el.offsetWidth, h: el.offsetHeight };
  }
  // Once the Hero has landed, it, the word, the lever and the card are solid,
  // each with a hitbox shaped like what you see:
  //   Hero   its real outline (strokes, head, extruded edge), from the Hero's code
  //   word   one box per letter
  //   lever  its box, stick and round ball (as it stands upright), and its label
  //   card   its rounded box, shrunk by the hitbox tightness (P.solidInset): the
  //          only one Tokens tuck a little behind
  const radiusOf = (el) => parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0;
  function makeSolid() {
    solid = true;
    const shapes = [];
    const k = heroEnd.size / 200, hx = heroEnd.x - heroEnd.size / 2, hy = heroEnd.y - heroEnd.size / 2;
    if (heroOutline) for (const piece of heroOutline()) shapes.push({ points: piece.map(([u, v]) => ({ x: hx + u * k, y: hy + v * k })) });
    else shapes.push(layoutBox(heroSlot));
    stage.querySelectorAll('.reveal-word .w').forEach((el) => shapes.push(layoutBox(el)));
    const part = (sel) => stage.querySelector(sel);
    const inset = P.solidInset;
    if (part('.lever')) {
      // The box reaches down into the card's hitbox, so no Token wedges between them
      const box = part('.lever-box');
      const b = layoutBox(box);
      shapes.push({ ...b, h: b.h + Math.max(0, inset), radius: radiusOf(box) }, layoutBox(part('.lever-stick')), layoutBox(part('.lever-label')));
      const ball = layoutBox(part('.lever-ball'));
      shapes.push({ cx: ball.x + ball.w / 2, cy: ball.y + ball.h / 2, r: ball.w / 2 });
    }
    const card = part('.reveal-card'), c = layoutBox(card);
    shapes.push({ x: c.x + inset, y: c.y + inset, w: c.w - 2 * inset, h: c.h - 2 * inset, radius: radiusOf(card) - inset });
    world.setSolids(shapes);
  }
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
    // The clicked letter flips into the Hero in place, right away
    Object.assign(hero.pose, flipPose(t, P.morphDur));
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
    if (!solid && t >= tl.arriveAt) makeSolid();
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
    // The Hero: the tail shrinks back, it flies home, then flips back into the N
    const h = closeFrom.hero, m = easeInOut(clamp01((t - 300) / 600));
    hero.grow = h.grow * (1 - easeInOut(clamp01(t / 300)));
    hero.pose = { x: lerp(h.x, heroStart.x, m), y: lerp(h.y, heroStart.y, m), size: lerp(h.size, heroStart.size, m), rz: lerp(h.rz, 0, m), s: 1 };
    if (h.back) {
      const u = t - 900;
      if (u < 100) Object.assign(hero.pose, { ry: 90 * DEG * clamp01(u / 100), back: true });
      else Object.assign(hero.pose, { ry: -90 * DEG * (1 - clamp01((u - 100) / 120)), back: false });
    } else Object.assign(hero.pose, { ry: lerp(h.ry, 0, m), back: false });
  }

  // ---------- Resize / rotation: re-lay everything out to the new screen ----------
  // (Tokens keep their size; the walls move and any Token left off-screen comes back.)
  function relayout() {
    W = innerWidth; H = innerHeight;
    renderer.setSize(W, H);
    camera.aspect = W / H;
    camera.position.z = H / 2 / Math.tan((FOV / 2) * DEG);
    camera.updateProjectionMatrix();
    world.resize(W, H);
    // The (hidden) HTML title has re-laid out too: the letters' homes move with it
    origin = letterBox(heroSpan);
    R = burstRadius();
    blastFrom = blastCentre();
    for (const tk of tokens) {
      drop(tk.letter.tex);
      tk.letter = letterTexture(tk.span);
      tk.k0 = (tk.span.offsetHeight * 0.8) / S;
      tk.home = { x: tk.letter.x, y: tk.letter.y };
      if (!tk.body && !closing) { tk.pose.x = tk.home.x; tk.pose.y = tk.home.y; if (!exploded) tk.k = tk.k0; }
    }
    drop(heroLetter.tex);
    heroLetter = letterTexture(heroSpan);
    heroLetterMesh.material.map = heroLetter.tex;
    heroStart = heroStartFor(heroLetter);
    heroEnd = heroEndNow();
    if (solid && !closing) makeSolid();
  }
  let resized = false;
  const onResize = () => { resized = true; };
  addEventListener('resize', onResize);

  // ---------- Frame loop ----------
  let t0 = performance.now() - (atEnd ? tl.openAt : 0);
  let last = 0, raf = 0, first = true, closing = null, closeStart = 0, done = false;
  // A hidden tab: stop drawing and stepping the physics; carry on when it comes back
  const onVisibility = () => {
    cancelAnimationFrame(raf);
    if (!document.hidden && !done) { last = 0; raf = requestAnimationFrame(frame); }
  };
  document.addEventListener('visibilitychange', onVisibility);
  function frame(now) {
    raf = requestAnimationFrame(frame);
    if (resized) { resized = false; relayout(); }
    const dt = last ? now - last : 16;
    last = now;
    if (closing) {
      const t = now - closeStart;
      closeFrame(t);
      if (t >= CLOSE_MS) { closing.resolve(); closing = null; done = true; cancelAnimationFrame(raf); }
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
        hero: { ...hero.pose, grow: hero.grow },
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
      done = true;
      cancelAnimationFrame(raf);
      removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibility);
      world.destroy();
      textures.forEach((t) => t.dispose());
      scene.traverse((o) => { o.geometry?.dispose(); o.material?.dispose(); });
      renderer.dispose();
      canvas.remove();
    },
  };
}
