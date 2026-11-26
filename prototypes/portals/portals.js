// Letter portals prototype (P1b Zero-g / P1c Toy box).
// Reveal choreography:
//   1. colour burst, chosen letter becomes its hero object in place
//   2. chain reaction: other letters flip into Tokens one by one, in place
//   3. hold, then explode: Tokens shrink to size and blast outward (fall or float)
//   4. hero flies to centre and opens; card + Enter control appear
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const stage = $('#stage'), burst = $('#burst'), tokenLayer = $('#tokens'), heroLayer = $('#hero');
  const closeBtn = $('.close'), toastEl = $('.toast');
  const letters = [...document.querySelectorAll('.title .line span')];
  const portals = letters.filter((s) => s.dataset.dest);
  const VC_MAP_URL = '../../public/vc-map/index.html';
  const MATTER_URL = 'https://cdn.jsdelivr.net/npm/matter-js@0.20.0/build/matter.min.js';

  const DEST = {
    about: { index: 0, color: 'var(--lilac)', tokens: window.ABOUT_TOKENS, build: buildAbout },
    norte: { index: 1, color: 'var(--brown)', tokens: window.NORTE_TOKENS, build: buildNorte },
  };

  // ---------- Tuning values (edited live in the tuning panel) ----------
  const TUNE = [
    // key, label, min, max, step, default, description
    ['burst', 'Colour burst (ms)', 200, 2000, 50, 1200, 'How long the circle of colour takes to fill the screen.'],
    ['morphStart', 'Delay before chain (ms)', 0, 1500, 50, 800, 'Pause after the click before the first letter flips.'],
    ['stagger', 'Chain stagger (ms)', 30, 500, 10, 100, 'Gap between one letter flipping and the next.'],
    ['morphDur', 'Flip duration (ms)', 150, 1500, 10, 300, 'How long each letter takes to flip into its Token.'],
    ['hold', 'Hold before explosion (ms)', 0, 2500, 50, 650, 'Pause with all Tokens in place before they blast out.'],
    ['speed', 'Explosion speed', 2, 40, 1, 15, 'How hard the Tokens are thrown outward.'],
    ['spread', 'Explosion spread (deg)', 0, 180, 5, 60, 'Random wobble added to each Token\'s direction.'],
    ['shrink', 'Shrink to size (ms)', 50, 1500, 25, 400, 'How fast Tokens go from letter size to normal size.'],
    ['heroFly', 'Hero fly-in (ms)', 300, 2500, 50, 1200, 'How long the book / arrow takes to fly to its spot.'],
    ['heroDelay', 'Hero delay after explosion (ms)', 0, 1500, 50, 100, 'Wait after the explosion before the hero moves.'],
    ['gravity', 'Gravity (Toy box)', 0.1, 3, 0.1, 0.5, 'How strongly Tokens fall in Toy box.'],
    ['drag', 'Air drag x1000 (Zero-g)', 0, 40, 1, 4, 'How quickly floating Tokens slow down in Zero-g.'],
    ['solidInset', 'Hitbox tightness (px)', -20, 60, 2, 16, 'Shrinks the hero/card hitboxes (Zero-g). Higher = Tokens slide further behind.'],
    ['zap', 'Idle charge every ~ (s)', 1, 12, 0.5, 9, 'Average time between the little charges on A and N.'],
  ];
  const P = {};
  const saved = JSON.parse(localStorage.getItem('portal-tune') || '{}');
  TUNE.forEach(([k, , , , , d]) => (P[k] = typeof saved[k] === 'number' ? saved[k] : d));

  // rest | intro | open | closing | leaving
  let phase = 'rest', current = null, openedByClick = false, hero = null, tokens = [], S = 80;
  let exploded = false, origin = { x: 0, y: 0 }, blastCenter = { x: 0, y: 0 };
  let mode = localStorage.getItem('portal-mode');
  if (mode !== 'zerog' && mode !== 'toy') mode = 'toy';
  let timers = [], anims = [];

  // ---------- small helpers ----------
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const track = (a) => (anims.push(a), a);
  function later(fn, ms) {
    const t = { fn, id: setTimeout(() => { timers = timers.filter((x) => x !== t); fn(); }, ms) };
    timers.push(t);
  }
  function clearTimers() { timers.forEach((t) => clearTimeout(t.id)); timers = []; }
  let toastT;
  function toast(msg) {
    toastEl.textContent = msg; toastEl.classList.add('on');
    clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove('on'), 2800);
  }
  const spell = (word) => [...word].map((c, j) => `<span class="w" style="--j:${j}">${c}</span>`).join('');
  const center = (r) => ({ x: r.left + r.width / 2, y: r.top + r.height / 2 });

  // Drag-or-tap control (ribbon, lever). onAmount(0..1) while dragging; onFire when done.
  function dragControl(el, axis, onAmount, onFire) {
    let sx = 0, sy = 0, moved = 0, active = false;
    el.addEventListener('pointerdown', (e) => {
      e.stopPropagation(); active = true; moved = 0; sx = e.clientX; sy = e.clientY;
      el.setPointerCapture(e.pointerId); el.classList.add('dragging');
    });
    el.addEventListener('pointermove', (e) => {
      if (!active) return;
      const dx = e.clientX - sx, dy = e.clientY - sy;
      moved = Math.max(moved, Math.hypot(dx, dy));
      const amt = clamp(axis(dx, dy) / 90, 0, 1);
      onAmount(amt);
      if (amt >= 1) { active = false; el.classList.remove('dragging'); onFire(); }
    });
    el.addEventListener('pointerup', () => {
      if (!active) return;
      active = false; el.classList.remove('dragging');
      if (moved < 6) onFire(); else onAmount(0);
    });
    el.addEventListener('pointercancel', () => { active = false; el.classList.remove('dragging'); onAmount(0); });
    el.addEventListener('click', (e) => { if (e.detail === 0) onFire(); }); // keyboard
    ['mousedown', 'touchstart'].forEach((n) => el.addEventListener(n, (e) => e.stopPropagation()));
  }

  // ---------- Hero: About = 3D book ----------
  function buildAbout(r) {
    const W = innerWidth, H = innerHeight, wide = W > 760;
    let w, h, left, top;
    if (wide) { h = Math.min(H * 0.66, 560); w = Math.min(h * 0.75, W * 0.36); left = W / 2 + 8; top = H / 2 - h / 2; }
    else { w = Math.min(W * 0.84, 380); h = Math.min(H * 0.34, w); left = (W - w) / 2; top = H / 2 - 30; }
    const d = Math.max(14, h * 0.06);

    const el = document.createElement('div');
    el.className = 'book ' + (wide ? 'wide' : 'narrow');
    Object.assign(el.style, { left: left + 'px', top: top + 'px', width: w + 'px', height: h + 'px' });
    el.style.setProperty('--w', w + 'px'); el.style.setProperty('--h', h + 'px'); el.style.setProperty('--d', d + 'px');
    el.innerHTML = `
      <div class="fly">
        <div class="bf bf-back"></div><div class="bf bf-spine"></div>
        <div class="bf bf-edge-r"></div><div class="bf bf-edge-t"></div><div class="bf bf-edge-b"></div>
        <div class="bf bf-page">
          <div class="page-inner">
            <p class="kicker">Chapter one</p>
            <h3>Hi, I'm Antonio.</h3>
            <p>Computer science student from São Conrado, Rio. I build small things to learn how to build bigger ones.</p>
            <p>Off-screen: basketball, tennis, spearfishing, Flamengo, and Djavan or Hermeto on repeat.</p>
            <p class="draft">Draft text. Edit me.</p>
          </div>
          <button class="ribbon ui" type="button" aria-label="Enter About">PULL</button>
          <span class="ribbon-hint">pull the ribbon ↓</span>
        </div>
        <div class="cover">
          <div class="cover-front"><span>A</span></div>
          <div class="cover-back"><h2 class="word">${spell('ABOUT')}</h2><p class="sub">the short version</p></div>
        </div>
      </div>`;
    heroLayer.append(el);

    const fly = $('.fly', el), ribbon = $('.ribbon', el);
    const s = (r.height / h) * 0.95, c = center(r);
    const dx = c.x - (left + w / 2), dy = c.y - (top + h / 2);
    const startT = (deg) => `translate(${dx}px, ${dy}px) scale(${s}) rotateY(${deg}deg)`;
    const solids = wide ? [{ x: left - w, y: top, w: 2 * w, h }] : [{ x: left, y: top - h, w, h: 2 * h }];

    dragControl(ribbon, (dx, dy) => dy,
      (amt) => ribbon.style.setProperty('--pull', amt * 60 + 'px'),
      () => {
        if (phase !== 'open') return;
        ribbon.style.setProperty('--pull', '60px');
        fly.animate([{ transform: 'rotateZ(0deg)' }, { transform: 'rotateZ(-3deg)' }, { transform: 'rotateZ(0deg)' }], { duration: 400 });
        toast('About page does not exist yet. This is where it would open.');
        setTimeout(() => ribbon.style.setProperty('--pull', '0px'), 600);
      });

    return {
      solids,
      // Sits in the letter's spot (as a small red book) until `at`, then spins in.
      intro(at) {
        track(fly.animate([{ transform: startT(0) }, { transform: 'translate(0px, 0px) scale(1) rotateY(-360deg)' }],
          { duration: P.heroFly, delay: at, easing: 'cubic-bezier(.25,.9,.3,1.08)', fill: 'backwards' }));
        const end = at + P.heroFly;
        later(() => el.classList.add('open'), end - 150);
        later(() => el.classList.add('show'), end + 250);
        later(() => { el.classList.add('ribbon-on'); phase = 'open'; }, end + 650);
      },
      instant() { el.classList.add('open', 'show', 'ribbon-on'); },
      close() {
        el.classList.add('closing'); el.classList.remove('show', 'ribbon-on', 'open');
        setTimeout(() => fly.animate([{ transform: 'translate(0px, 0px) scale(1) rotateY(0deg)' }, { transform: startT(360) }],
          { duration: 600, easing: 'cubic-bezier(.6,0,.4,1)', fill: 'forwards' }), 500);
        return 1150;
      },
    };
  }

  // ---------- Hero: Norte = extruded N that grows into a rising arrow ----------
  function arrowSVG() {
    const STEM = 'M40 172V60L100 128L105.3 122', TAIL = 'M100 128L157.6 61.6', HEAD = 'M180 36L174.2 76.1L141 47.1Z';
    const group = (cls, t = '') => `<g class="${cls}" ${t}><path class="stem" d="${STEM}"/><path class="tail" d="${TAIL}" pathLength="1"/><path class="head" d="${HEAD}"/></g>`;
    let layers = '';
    for (let i = 10; i >= 1; i--) layers += group('ex', `transform="translate(${(-i * 1.1).toFixed(1)} ${(i * 1.1).toFixed(1)})"`);
    return `<svg class="arrow" viewBox="0 0 200 200" aria-hidden="true">${layers}${group('ol')}${group('tp')}</svg>`;
  }

  function buildNorte(r) {
    const W = innerWidth, H = innerHeight, wide = W > 760;
    let size, left, top;
    if (wide) { size = Math.min(H * 0.58, W * 0.4); left = W * 0.3 - size / 2; top = H / 2 - size / 2 - H * 0.06; }
    else { size = Math.min(H * 0.3, W * 0.66); left = (W - size) / 2; top = Math.max(64, H * 0.08); }

    const el = document.createElement('div');
    el.className = 'norte ' + (wide ? 'wide' : 'narrow');
    el.innerHTML = `
      <div class="arrow-box" style="left:${left}px;top:${top}px;width:${size}px;height:${size}px"><div class="fly">${arrowSVG()}</div></div>
      <h2 class="word" style="left:${left + size / 2}px;top:${top + size * 0.96}px;font-size:${size * 0.3}px">${spell('NORTE')}</h2>
      <section class="card ui" aria-label="Norte: a VC map">
        <p class="kicker">Portal · N</p>
        <h3>Norte: a VC map</h3>
        <p>Venture capital, drawn as a map you can explore: who invests in what, and where.</p>
        <p class="draft">Draft text. Edit me.</p>
        <div class="card-foot">
          <button class="lever" type="button" aria-label="Enter Norte: a VC map">
            <span class="lever-box"></span><span class="lever-stick"><span class="lever-ball"></span></span>
          </button>
          <div><div class="lever-label">Push to<br>launch ↗</div><a class="plain" href="${VC_MAP_URL}">or just open it →</a></div>
        </div>
      </section>`;
    heroLayer.append(el);

    const fly = $('.fly', el), lever = $('.lever', el), card = $('.card', el);
    ['mousedown', 'touchstart'].forEach((n) => card.addEventListener(n, (e) => e.stopPropagation()));
    const c = center(r), s = r.height / (size * 0.6);
    const dx = c.x - (left + size * 0.35), dy = c.y - (top + size * 0.575);
    const startT = `translate(${dx}px, ${dy}px) scale(${s}) rotate(0deg)`;
    // The arrow only fills the middle of its square box, so its hitbox gets extra padding removed
    const solids = [[$('.arrow-box', el), size * 0.12], [$('.word', el), 0], [card, 0]].map(([n, pad]) => {
      const b = n.getBoundingClientRect(); return { x: b.left, y: b.top, w: b.width, h: b.height, pad };
    });

    const launch = () => {
      if (phase !== 'open') return;
      phase = 'leaving';
      lever.style.setProperty('--tilt', '45deg');
      fly.animate([{ transform: 'translate(0px, 0px) scale(1) rotate(0deg)' }, { transform: `translate(${W * 0.9}px, ${-H}px) scale(1.6) rotate(0deg)` }],
        { duration: 700, delay: 150, easing: 'cubic-bezier(.6,0,.9,.4)', fill: 'forwards' });
      setTimeout(() => (location.href = VC_MAP_URL), 800);
    };
    dragControl(lever, (dx, dy) => dx - dy, (amt) => lever.style.setProperty('--tilt', amt * 45 + 'deg'), launch);

    return {
      solids,
      // Sits in the letter's spot (as an extruded N) until `at`, then flies in.
      intro(at) {
        track(fly.animate([
          { transform: startT },
          { offset: 0.6, transform: 'translate(0px, 0px) scale(1.08) rotate(-6deg)' },
          { transform: 'translate(0px, 0px) scale(1) rotate(0deg)' },
        ], { duration: P.heroFly, delay: at, easing: 'cubic-bezier(.25,.9,.3,1)', fill: 'backwards' }));
        const end = at + P.heroFly;
        later(() => el.classList.add('grown'), end - 150);
        later(() => el.classList.add('show'), end + 200);
        later(() => (phase = 'open'), end + 650);
      },
      instant() { el.classList.add('grown', 'show'); },
      close() {
        el.classList.remove('show', 'grown');
        setTimeout(() => fly.animate([{ transform: 'translate(0px, 0px) scale(1) rotate(0deg)' }, { transform: startT }],
          { duration: 600, easing: 'cubic-bezier(.6,0,.4,1)', fill: 'forwards' }), 450);
        return 1100;
      },
    };
  }

  // ---------- Tokens ----------
  function makeToken(span, sticker, fs) {
    const r = span.getBoundingClientRect(), c = center(r);
    const letterHTML = `<span class="ltr" style="font-size:${fs / Math.max(1, r.height * 0.8 / S)}px;color:${getComputedStyle(span).color}">${span.textContent}</span>`;
    const el = document.createElement('div');
    el.className = 'token';
    el.style.width = el.style.height = S + 'px';
    el.innerHTML = `<div class="tface">${letterHTML}</div>`;
    tokenLayer.append(el);
    // k = scale so the Token matches its letter's size while in place
    const k = Math.max(1, (r.height * 0.8) / S);
    const t = { el, face: el.firstChild, x: c.x, y: c.y, a: 0, k, k0: k, hx: c.x, hy: c.y, sticker, letterHTML, body: null, ready: false };
    place(t);
    return t;
  }
  const place = (t) => (t.el.style.transform = `translate(${t.x - S / 2}px, ${t.y - S / 2}px) rotate(${t.a}rad) scale(${t.k})`);

  function morph(t, delay) {
    const out = P.morphDur * 0.4, inn = P.morphDur * 0.6;
    const a1 = track(t.face.animate([{ transform: 'rotateY(0deg) scale(1)' }, { transform: 'rotateY(90deg) scale(0.85)' }],
      { duration: out, delay, easing: 'ease-in', fill: 'forwards' }));
    a1.onfinish = () => {
      if (phase === 'closing' || phase === 'rest') return;
      t.face.innerHTML = t.sticker.svg;
      t.el.title = t.sticker.name;
      a1.cancel();
      track(t.face.animate([
        { transform: 'rotateY(-90deg) scale(0.6)' },
        { offset: 0.7, transform: 'rotateY(0deg) scale(1.18)' },
        { transform: 'rotateY(0deg) scale(1)' },
      ], { duration: inn, easing: 'ease-out' }));
      t.ready = true;
    };
  }

  // ---------- Physics (Matter.js, loaded on demand) ----------
  let matterP = null, engine = null, world = null, mouseC = null, mouseOn = false;
  let walls = [], obstacles = [], raf = 0, last = 0, acc = 0, pending = [];

  function ensureMatter() {
    if (window.Matter) return Promise.resolve();
    if (!matterP) matterP = new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src = MATTER_URL; s.onload = res; s.onerror = () => { matterP = null; rej(); };
      document.head.append(s);
    });
    return matterP;
  }

  function startEngine() {
    if (phase === 'rest' || phase === 'closing') return;
    const { Engine, Mouse, MouseConstraint } = Matter;
    if (!engine) {
      engine = Engine.create(); world = engine.world;
      const mouse = Mouse.create(stage);
      ['mousewheel', 'DOMMouseScroll', 'wheel'].forEach((n) => mouse.element.removeEventListener(n, mouse.mousewheel));
      mouseC = MouseConstraint.create(engine, { mouse, constraint: { stiffness: 0.15, damping: 0.1, render: { visible: false } } });
    }
    buildWalls();
    applyMode(false);
    pending.splice(0).forEach(addBody);
    last = 0; acc = 0; cancelAnimationFrame(raf); raf = requestAnimationFrame(loop);
  }

  function buildWalls() {
    const { Bodies, Composite } = Matter, W = innerWidth, H = innerHeight, T = 400;
    walls.forEach((b) => Composite.remove(world, b));
    walls = [
      Bodies.rectangle(W / 2, H + T / 2, W + 2 * T, T, { isStatic: true }),
      Bodies.rectangle(W / 2, -T / 2, W + 2 * T, T, { isStatic: true }),
      Bodies.rectangle(-T / 2, H / 2, T, H + 2 * T, { isStatic: true }),
      Bodies.rectangle(W + T / 2, H / 2, T, H + 2 * T, { isStatic: true }),
    ];
    Composite.add(world, walls);
  }

  // Bodies are only created at the explosion
  function addBody(t) {
    if (!engine || !window.Matter) { pending.push(t); return; }
    if (phase === 'rest' || phase === 'closing' || t.body || !tokens.includes(t)) return;
    const { Bodies, Composite } = Matter;
    t.body = Bodies.rectangle(t.x, t.y, S * 0.86, S * 0.86, {
      chamfer: { radius: S * 0.3 }, restitution: 0.45, friction: 0.25, frictionAir: airDrag(),
    });
    Composite.add(world, t.body);
    blast(t);
  }
  const airDrag = () => (mode === 'zerog' ? P.drag / 1000 : 0.015);

  // Outward from the middle of the name (not the clicked letter, which sits at
  // the far left and would push everything right), with a random wobble.
  // In Toy box, a bit of extra lift so they arc before falling.
  function blast(t) {
    const { Body } = Matter;
    const ang = Math.atan2(t.y - blastCenter.y, t.x - blastCenter.x) + ((Math.random() - 0.5) * 2 * P.spread * Math.PI) / 180;
    const sp = P.speed * (0.7 + Math.random() * 0.6);
    Body.setVelocity(t.body, { x: Math.cos(ang) * sp, y: Math.sin(ang) * sp - (mode === 'toy' ? P.speed * 0.45 : 0) });
    Body.setAngularVelocity(t.body, (Math.random() - 0.5) * 0.35);
  }

  function step() {
    const { Engine, Body } = Matter;
    if (mode === 'zerog') {
      for (const t of tokens) {
        const b = t.body; if (!b) continue;
        const v = b.velocity, sp = Math.hypot(v.x, v.y);
        if (sp < 0.5) Body.applyForce(b, b.position, { x: (Math.random() - 0.5) * b.mass * 1.5e-4, y: (Math.random() - 0.5) * b.mass * 1.5e-4 });
        if (sp > 40) Body.setVelocity(b, { x: (v.x / sp) * 40, y: (v.y / sp) * 40 });
      }
    }
    Engine.update(engine, 1000 / 60);
  }

  function loop(now) {
    raf = requestAnimationFrame(loop);
    const dt = last ? Math.min(now - last, 100) : 16;
    last = now; acc += dt;
    while (acc >= 1000 / 60) { step(); acc -= 1000 / 60; }
    const shrinkRate = 1 - Math.exp(-dt / (P.shrink / 3));
    for (const t of tokens) {
      if (!t.body) continue;
      t.x = t.body.position.x; t.y = t.body.position.y; t.a = t.body.angle;
      if (t.k > 1.001) t.k += (1 - t.k) * shrinkRate; else t.k = 1;
      place(t);
    }
  }

  function stopEngine() {
    cancelAnimationFrame(raf); pending = [];
    if (!engine) return;
    const { Composite } = Matter;
    tokens.forEach((t) => t.body && Composite.remove(world, t.body));
    obstacles.forEach((b) => Composite.remove(world, b)); obstacles = [];
    if (mouseOn) { Composite.remove(world, mouseC); mouseOn = false; }
    mouseC.constraint.bodyB = null;
  }

  // ---------- Modes (P1b Zero-g / P1c Toy box) ----------
  function setMode(m) {
    mode = m; localStorage.setItem('portal-mode', m);
    document.querySelectorAll('.switcher button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.mode === m)));
    applyMode(true);
  }
  // userSwitch: nudge Tokens so the change is visible
  function applyMode(userSwitch) {
    if (!engine || phase === 'rest' || phase === 'closing') return;
    const { Composite } = Matter;
    engine.gravity.y = mode === 'zerog' ? 0 : P.gravity;
    if (!mouseOn) { Composite.add(world, mouseC); mouseOn = true; }
    setObstacles(heroArrived);
    tokens.forEach((t) => {
      if (!t.body) return;
      t.body.frictionAir = airDrag();
      if (userSwitch && mode === 'zerog') Matter.Body.setVelocity(t.body, { x: (Math.random() - 0.5) * 8, y: -4 - Math.random() * 6 });
    });
  }
  // In Zero-g, the hero and card are solid once the hero has arrived
  let heroArrived = false;
  function setObstacles(on) {
    if (!engine) return;
    const { Composite, Bodies } = Matter;
    obstacles.forEach((b) => Composite.remove(world, b)); obstacles = [];
    if (on && mode === 'zerog' && hero) {
      // Tokens sit behind the hero layer, so a tight (even slightly smaller) hitbox
      // lets them tuck a little behind the book / card edges.
      const inset = P.solidInset;
      obstacles = hero.solids.map((s) => {
        const w = Math.max(10, s.w - 2 * inset - 2 * (s.pad || 0)), h = Math.max(10, s.h - 2 * inset - 2 * (s.pad || 0));
        return Bodies.rectangle(s.x + s.w / 2, s.y + s.h / 2, w, h, { isStatic: true, chamfer: { radius: Math.min(12, w / 3, h / 3) } });
      });
      Composite.add(world, obstacles);
    }
  }

  // ---------- Open / skip / close ----------
  function openReveal(d) {
    const cfg = DEST[d];
    current = d; phase = 'intro'; exploded = false; heroArrived = false;
    const span = letters[cfg.index], r = span.getBoundingClientRect();
    const W = innerWidth, H = innerHeight, fs = parseFloat(getComputedStyle(span).fontSize);
    S = clamp(Math.min(W, H) * 0.14, 54, 112);
    origin = center(r);

    stage.hidden = false; stage.dataset.dest = d;
    stage.style.setProperty('--c', cfg.color);
    document.body.classList.add('revealing');
    hero = cfg.build(r);
    closeBtn.focus({ preventScroll: true });

    if (reduced.matches) {
      burst.style.clipPath = 'none';
      hero.instant(); phase = 'open';
      return;
    }

    const R = Math.hypot(W, H);
    track(burst.animate([{ clipPath: `circle(0px at ${origin.x}px ${origin.y}px)` }, { clipPath: `circle(${R}px at ${origin.x}px ${origin.y}px)` }],
      { duration: P.burst, easing: 'cubic-bezier(.6,0,.2,1)', fill: 'forwards' }));

    // Chain reaction: nearest letters to the clicked one flip first
    const others = letters.filter((_, i) => i !== cfg.index);
    tokens = others.map((sp, i) => makeToken(sp, cfg.tokens[i], fs));
    const tr = $('.title').getBoundingClientRect();
    blastCenter = { x: tr.left + tr.width / 2, y: tr.top + tr.height / 2 };
    const order = [...tokens].sort((a, b) => Math.hypot(a.x - origin.x, a.y - origin.y) - Math.hypot(b.x - origin.x, b.y - origin.y));
    order.forEach((t, i) => morph(t, P.morphStart + i * P.stagger));

    const explodeAt = P.morphStart + (order.length - 1) * P.stagger + P.morphDur + P.hold;
    later(explode, explodeAt);
    hero.intro(explodeAt + P.heroDelay);
    later(() => { heroArrived = true; setObstacles(true); }, explodeAt + P.heroDelay + P.heroFly);

    ensureMatter().then(startEngine).catch(() => toast('Physics library did not load (offline?).'));
  }

  function explode() {
    if (phase !== 'intro') return;
    exploded = true;
    tokens.forEach(addBody);
  }

  function skipIntro() {
    if (phase !== 'intro') return;
    stage.classList.add('instant');
    anims.forEach((a) => { try { a.finish(); } catch (e) { /* already done */ } });
    for (let n = 0; n < 5 && timers.length; n++) { const p = timers; clearTimers(); p.forEach((t) => t.fn()); }
    stage.offsetWidth; // apply the end state before turning transitions back on
    requestAnimationFrame(() => stage.classList.remove('instant'));
  }

  const normAngle = (a) => ((((a + Math.PI) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)) - Math.PI;

  function closeReveal() {
    if (phase === 'rest' || phase === 'closing') return;
    phase = 'closing';
    clearTimers(); stopEngine();
    anims.forEach((a) => a.cancel()); anims = [];
    const portalLink = $(`.sr-nav a[data-for="${current}"]`);

    if (reduced.matches) { cleanup(); portalLink.focus({ preventScroll: true }); return; }

    const heroDur = hero.close();
    tokens.forEach((t, i) => {
      const a = normAngle(t.a);
      t.el.animate([
        { transform: `translate(${t.x - S / 2}px, ${t.y - S / 2}px) rotate(${a}rad) scale(${t.k})` },
        { transform: `translate(${t.hx - S / 2}px, ${t.hy - S / 2}px) rotate(0rad) scale(${t.k0})` },
      ], { duration: 700, delay: i * 30, easing: 'cubic-bezier(.5,0,.2,1)', fill: 'forwards' });
      if (!t.ready) return;
      const f1 = t.face.animate([{ transform: 'rotateY(0deg)' }, { transform: 'rotateY(90deg)' }], { duration: 160, delay: 320 + i * 30, fill: 'forwards' });
      f1.onfinish = () => {
        t.face.innerHTML = t.letterHTML; f1.cancel();
        t.face.animate([{ transform: 'rotateY(-90deg)' }, { transform: 'rotateY(0deg)' }], { duration: 220 });
      };
    });
    const R = Math.hypot(innerWidth, innerHeight);
    burst.animate([{ clipPath: `circle(${R}px at ${origin.x}px ${origin.y}px)` }, { clipPath: `circle(0px at ${origin.x}px ${origin.y}px)` }],
      { duration: 650, delay: 350, easing: 'cubic-bezier(.6,0,.4,1)', fill: 'forwards' });
    setTimeout(() => { cleanup(); portalLink.focus({ preventScroll: true }); }, Math.max(heroDur, 1100));
  }

  function cleanup() {
    stage.hidden = true; tokenLayer.innerHTML = ''; heroLayer.innerHTML = '';
    burst.getAnimations().forEach((a) => a.cancel()); burst.style.clipPath = '';
    document.body.classList.remove('revealing');
    tokens = []; hero = null; current = null; phase = 'rest';
    // A hash may have changed while we were closing
    const d = location.hash.slice(1);
    if (DEST[d]) { openedByClick = true; openReveal(d); }
  }

  function requestClose() {
    if (phase === 'rest' || phase === 'closing') return;
    if (openedByClick) history.back();
    else { history.replaceState(null, '', location.pathname + location.search); closeReveal(); }
  }

  // Replay the current Reveal from the start (handy while tuning)
  function replay() {
    const d = current || 'about';
    if (phase !== 'rest') {
      phase = 'closing'; clearTimers(); stopEngine();
      anims.forEach((a) => a.cancel()); anims = [];
      stage.hidden = true; tokenLayer.innerHTML = ''; heroLayer.innerHTML = '';
      burst.getAnimations().forEach((a) => a.cancel());
      document.body.classList.remove('revealing');
      tokens = []; hero = null; phase = 'rest';
    }
    if (location.hash.slice(1) === d) openReveal(d);
    else { openedByClick = true; location.hash = d; }
  }

  // ---------- Idle "energy": sporadic zaps on the Portal letters ----------
  const ZAPS = ['zap-hop', 'zap-glow', 'zap-wobble'];
  function zap(span) {
    if (span.classList.contains('zapping')) return;
    const kind = ZAPS[Math.floor(Math.random() * ZAPS.length)];
    span.classList.add('zapping', kind);
    span.addEventListener('animationend', () => span.classList.remove('zapping', kind), { once: true });
  }
  function scheduleZap(first) {
    const base = P.zap * 1000;
    const wait = first ? 1200 : base * (0.5 + Math.random());
    setTimeout(() => {
      if (phase === 'rest' && !document.hidden && !reduced.matches) {
        const s = portals[Math.floor(Math.random() * portals.length)];
        zap(s);
        // Sometimes the charge jumps to the other letter
        if (Math.random() < 0.3) setTimeout(() => zap(portals.find((p) => p !== s)), 450);
      }
      scheduleZap(false);
    }, wait);
  }

  // ---------- Tuning panel ----------
  function buildPanel() {
    const panel = document.createElement('details');
    panel.className = 'tune';
    panel.innerHTML = `<summary>Tuning</summary><div class="tune-body"></div>
      <div class="tune-actions"><button type="button" data-act="replay">Replay</button><button type="button" data-act="copy">Copy values</button><button type="button" data-act="reset">Reset</button></div>`;
    const body = $('.tune-body', panel);
    TUNE.forEach(([k, label, min, max, stepv, , desc]) => {
      const row = document.createElement('label');
      row.innerHTML = `<span>${label}</span><output>${P[k]}</output><small>${desc}</small><input type="range" min="${min}" max="${max}" step="${stepv}" value="${P[k]}">`;
      const input = $('input', row), out = $('output', row);
      input.addEventListener('input', () => {
        P[k] = parseFloat(input.value); out.textContent = P[k];
        localStorage.setItem('portal-tune', JSON.stringify(P));
        if (['gravity', 'drag', 'solidInset'].includes(k) && engine) applyMode(false);
      });
      body.append(row);
    });
    panel.addEventListener('click', (e) => {
      const act = e.target.dataset && e.target.dataset.act;
      if (act === 'replay') replay();
      if (act === 'reset') { localStorage.removeItem('portal-tune'); location.reload(); }
      if (act === 'copy') navigator.clipboard.writeText(JSON.stringify(P, null, 2)).then(() => toast('Values copied. Paste them to Claude.'));
    });
    document.body.append(panel);
    // Press T to hide / show the whole panel (remembered)
    panel.hidden = localStorage.getItem('portal-tune-hidden') === '1';
    document.addEventListener('keydown', (e) => {
      if (e.key.toLowerCase() !== 't' || e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.target.matches && e.target.matches('input[type="text"], textarea')) return;
      panel.hidden = !panel.hidden;
      localStorage.setItem('portal-tune-hidden', panel.hidden ? '1' : '0');
    });
  }

  // ---------- Wiring ----------
  portals.forEach((span) => span.addEventListener('click', () => { if (phase === 'rest') location.hash = span.dataset.dest; }));
  document.querySelectorAll('.sr-nav a').forEach((a) => {
    const span = letters[DEST[a.dataset.for].index];
    a.addEventListener('focus', () => span.classList.add('focused'));
    a.addEventListener('blur', () => span.classList.remove('focused'));
  });
  window.addEventListener('hashchange', () => {
    const d = location.hash.slice(1);
    if (DEST[d]) { if (phase === 'rest') { openedByClick = true; openReveal(d); } }
    else closeReveal();
  });
  closeBtn.addEventListener('click', requestClose);
  ['mousedown', 'touchstart'].forEach((n) => closeBtn.addEventListener(n, (e) => e.stopPropagation()));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') requestClose(); });
  stage.addEventListener('pointerdown', skipIntro, true);
  document.querySelectorAll('.switcher button').forEach((b) => b.addEventListener('click', () => setMode(b.dataset.mode)));
  window.addEventListener('resize', () => { if (engine && phase !== 'rest' && phase !== 'closing') buildWalls(); });
  // Coming back with the browser Back button after launching into Norte:
  // the page may be restored mid-launch, so reset and reopen the Reveal.
  window.addEventListener('pageshow', (e) => {
    if (e.persisted && phase === 'leaving') { stopEngine(); phase = 'closing'; cleanup(); }
  });

  setMode(mode);
  buildPanel();
  scheduleZap(true);

  // Preload physics quietly, and open straight into a Reveal for #about / #norte links
  setTimeout(() => ensureMatter().catch(() => {}), 1200);
  const startHash = location.hash.slice(1);
  if (DEST[startHash]) document.fonts.ready.then(() => setTimeout(() => { if (phase === 'rest') { openedByClick = false; openReveal(startHash); } }, 900));
})();
