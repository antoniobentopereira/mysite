// The Norte portal, checked as a visitor sees the homepage.
import { test, expect } from '@playwright/test';
import { readFile, writeFile } from 'node:fs/promises';

const revealState = (page) => page.locator('html'); // where the Reveal publishes its state
const norteLink = (page) => page.getByRole('link', { name: 'Norte: a VC map' });
const portalN = (page) => page.locator('.title a[href="vc-map/"]');

// Fail any test that logs a console error
let errors;
test.beforeEach(({ page }) => {
  errors = [];
  page.on('console', (m) => {
    // Chrome asks for /favicon.ico by itself even though the page has an inline icon
    if (m.type() === 'error' && !m.location().url.endsWith('/favicon.ico')) errors.push(`${m.text()} (${m.location().url})`);
  });
  page.on('pageerror', (e) => errors.push(e.message));
});
test.afterEach(() => expect(errors).toEqual([]));

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('N is a plain link to VC Map', async ({ page }) => {
    await page.goto('./');
    await expect(portalN(page)).toHaveText('N');
    await portalN(page).click();
    await expect(page).toHaveURL(/\/vc-map\/$/);
  });

  test('a hidden link "Norte: a VC map" also leads to VC Map', async ({ page }) => {
    await page.goto('./');
    await expect(norteLink(page)).toHaveAttribute('href', 'vc-map/');
  });
});

test.describe('opening the Norte Reveal', () => {
  test('clicking N plays the 3D Reveal (intro, then open) and sets #norte', async ({ page }) => {
    await page.goto('./');
    await expect(revealState(page)).toHaveAttribute('data-reveal-phase', 'rest');
    await portalN(page).click();
    await expect(page).toHaveURL(/#norte$/);
    await expect(revealState(page)).toHaveAttribute('data-reveal-destination', 'norte');
    await expect(revealState(page)).toHaveAttribute('data-reveal-phase', 'intro');
    await expect(revealState(page)).toHaveAttribute('data-reveal-fallback', 'false');
    await expect(page.locator('canvas')).toHaveCount(1);
    await expect(revealState(page)).toHaveAttribute('data-reveal-phase', 'open', { timeout: 10_000 });
    const dialog = page.getByRole('dialog', { name: 'Norte: a VC map' });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText('NORTE', { exact: true })).toBeVisible();
    await expect(dialog.getByRole('heading', { name: 'Norte: a VC map' })).toBeVisible();
  });

  test('the 3D and physics libraries are our own copies, fetched only after the page has loaded', async ({ page }) => {
    const seen = [];
    let loadedYet = false;
    page.on('load', () => { loadedYet = true; });
    page.on('request', (r) => seen.push({ url: r.url(), loaded: loadedYet }));
    await page.goto('./');
    await portalN(page).click();
    await expect(page.locator('canvas')).toHaveCount(1);
    const scripts = seen.filter((r) => /\.m?js(\?|$)/.test(r.url));
    expect(scripts.every((r) => r.url.startsWith(new URL('./', page.url()).origin))).toBe(true); // no CDN
    const libs = seen.filter((r) => r.url.includes('/portals/vendor/'));
    expect(libs.map((r) => r.url.split('/').pop()).sort()).toEqual(['matter.min.js', 'three.min.js']);
    expect(libs.every((r) => r.loaded)).toBe(true); // the Rest state's first load downloads nothing new
  });

  test('closing the 3D Reveal reassembles ANTONIO BENTO and removes the canvas', async ({ page }) => {
    await page.goto('./');
    await portalN(page).click();
    await expect(revealState(page)).toHaveAttribute('data-reveal-phase', 'open', { timeout: 10_000 });
    await page.keyboard.press('Escape');
    await expect(revealState(page)).toHaveAttribute('data-reveal-phase', 'closing');
    await expect(page.locator('canvas')).toHaveCount(1); // the reassembly plays in the scene
    await expect(revealState(page)).toHaveAttribute('data-reveal-phase', 'rest');
    await expect(page.locator('canvas')).toHaveCount(0);
    await expect(page.locator('.title')).toBeVisible();
  });

  test('the hidden link opens it from the keyboard, and focus moves into the Reveal', async ({ page }) => {
    await page.goto('./');
    await page.keyboard.press('Tab');
    await expect(norteLink(page)).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/#norte$/);
    await expect(revealState(page)).toHaveAttribute('data-reveal-phase', 'open');
    await expect(page.getByRole('button', { name: 'Close' })).toBeFocused();
  });

  test('focusing the hidden link draws a focus ring on the N', async ({ page }) => {
    await page.goto('./');
    const n = page.locator('.title .portal[data-dest="norte"]');
    await expect(n).toHaveCSS('outline-style', 'none');
    await page.keyboard.press('Tab');
    await expect(n).toHaveCSS('outline-style', 'solid');
  });

  test('a click during the intro skips to open', async ({ page }) => {
    await page.goto('./');
    await portalN(page).click();
    await expect(revealState(page)).toHaveAttribute('data-reveal-phase', 'intro');
    await page.mouse.click(10, 300);
    await expect(revealState(page)).toHaveAttribute('data-reveal-phase', 'open', { timeout: 50 });
    await expect(page.getByRole('heading', { name: 'Norte: a VC map' })).toBeVisible();
  });

  test('loading #norte opens the Reveal directly, and closing stays on the homepage', async ({ page }) => {
    await page.goto('./#norte');
    await expect(revealState(page)).toHaveAttribute('data-reveal-phase', 'open');
    await page.getByRole('button', { name: 'Close' }).click();
    await expect(revealState(page)).toHaveAttribute('data-reveal-phase', 'rest');
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator('h1')).toBeVisible();
  });
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('uses the simple Reveal, with no 3D canvas', async ({ page }) => {
    await page.goto('./');
    await portalN(page).click();
    await expect(revealState(page)).toHaveAttribute('data-reveal-phase', 'open');
    await expect(revealState(page)).toHaveAttribute('data-reveal-fallback', 'true');
    await expect(page.locator('canvas')).toHaveCount(0);
  });

  test('never downloads the 3D or physics libraries', async ({ page }) => {
    const libs = [];
    page.on('request', (r) => { if (r.url().includes('/portals/vendor/')) libs.push(r.url()); });
    await page.goto('./');
    await page.waitForTimeout(2500); // past the idle preload
    await portalN(page).click();
    await expect(revealState(page)).toHaveAttribute('data-reveal-phase', 'open');
    expect(libs).toEqual([]);
  });
});

test.describe('when the 3D Reveal cannot run', () => {
  const expectSimpleReveal = async (page) => {
    await page.goto('./');
    await portalN(page).click();
    await expect(revealState(page)).toHaveAttribute('data-reveal-phase', 'open');
    await expect(revealState(page)).toHaveAttribute('data-reveal-fallback', 'true');
    await expect(page.locator('canvas')).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'Norte: a VC map' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Enter Norte: a VC map' })).toBeVisible();
  };

  test('no WebGL: the simple Reveal is used', async ({ page }) => {
    // A device without WebGL: canvases can't give a WebGL context
    await page.addInitScript(() => {
      const get = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (kind, ...rest) {
        return /webgl/i.test(kind) ? null : get.call(this, kind, ...rest);
      };
    });
    await expectSimpleReveal(page);
  });

  for (const [lib, file] of [['3D', 'three.min.js'], ['physics', 'matter.min.js']]) {
    test(`the ${lib} library fails to download: the simple Reveal is used`, async ({ page }) => {
      await page.route(`**/portals/vendor/${file}`, (r) => r.abort());
      await expectSimpleReveal(page);
      errors = errors.filter((e) => !e.includes(file)); // the failed download itself is expected
    });
  }
});

test('grabbing and flinging around the Reveal never steals a click from the lever or ✕', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('./');
  await portalN(page).click();
  await expect(revealState(page)).toHaveAttribute('data-reveal-phase', 'open');
  // Fling all over the screen, where the Tokens float (and across the card)
  for (const [x, y, dx, dy] of [[100, 100, 300, 200], [600, 700, -400, -300], [1100, 150, -900, 500], [200, 600, 1000, -100]]) {
    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.move(x + dx, y + dy, { steps: 8 });
    await page.mouse.up();
  }
  await expect(page).toHaveURL(/#norte$/); // none of that launched or closed it
  await expect(revealState(page)).toHaveAttribute('data-reveal-phase', 'open');
  await page.getByRole('button', { name: 'Close' }).click();
  await expect(revealState(page)).toHaveAttribute('data-reveal-phase', 'rest');
});

test('dragging across the Reveal never selects text', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('./');
  await portalN(page).click();
  await expect(revealState(page)).toHaveAttribute('data-reveal-phase', 'open');
  const card = await page.locator('.reveal-card').boundingBox();
  await page.mouse.move(card.x - 200, card.y - 100);
  await page.mouse.down();
  await page.mouse.move(card.x + card.width - 10, card.y + card.height - 10, { steps: 10 });
  await page.mouse.up();
  await page.mouse.dblclick(card.x + 60, card.y + card.height / 2); // a double-click selects a word, normally
  expect(await page.evaluate(() => getSelection().toString())).toBe('');
});

test.describe('on a touch screen', () => {
  test.use({ hasTouch: true, viewport: { width: 390, height: 844 } });
  test('tapping ✕ closes the Reveal (grabbing Tokens does not swallow the tap)', async ({ page }) => {
    await page.goto('./');
    await portalN(page).tap();
    await expect(revealState(page)).toHaveAttribute('data-reveal-phase', 'intro');
    await page.mouse.click(10, 300); // skip the intro
    await expect(revealState(page)).toHaveAttribute('data-reveal-phase', 'open');
    await page.getByRole('button', { name: 'Close' }).tap();
    await expect(revealState(page)).toHaveAttribute('data-reveal-phase', 'rest');
  });
});

test('rotating or resizing an open Reveal re-lays it out to the new screen', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('./');
  await portalN(page).click();
  await expect(revealState(page)).toHaveAttribute('data-reveal-phase', 'open');
  await page.setViewportSize({ width: 390, height: 844 }); // a phone, upright
  const canvas = page.locator('canvas');
  await expect(canvas).toHaveAttribute('width', '390'); // the scene now draws at the new size
  await expect(canvas).toHaveAttribute('height', '844');
  await expect(revealState(page)).toHaveAttribute('data-reveal-phase', 'open');
  for (const el of [page.locator('.reveal-card'), page.getByRole('button', { name: 'Enter Norte: a VC map' })]) {
    const box = await el.boundingBox();
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(390);
    expect(box.y + box.height).toBeLessThanOrEqual(844);
  }
  // Closing after a resize still reassembles the title
  await page.keyboard.press('Escape');
  await expect(revealState(page)).toHaveAttribute('data-reveal-phase', 'rest');
});

test('the first Reveal downloads at most ~300 KB compressed', async ({ page, baseURL }) => {
  const { gzipSync } = await import('node:zlib');
  const bodies = []; // everything from our site: the homepage, then the Reveal
  page.on('response', (r) => {
    if (r.url().startsWith(baseURL)) bodies.push(r.body().catch(() => Buffer.alloc(0)));
  });
  await page.goto('./');
  await portalN(page).click();
  await expect(revealState(page)).toHaveAttribute('data-reveal-phase', 'open');
  await expect(page.locator('canvas')).toHaveCount(1);
  // Our test server doesn't compress; Cloudflare does (gzip or better)
  const total = (await Promise.all(bodies)).reduce((sum, b) => sum + gzipSync(b).length, 0);
  console.log(`first Reveal: ${(total / 1024).toFixed(0)} KB compressed`);
  expect(total).toBeLessThanOrEqual(300 * 1024);
});

test.describe('closing the Norte Reveal', () => {
  const ways = {
    '✕': (page) => page.getByRole('button', { name: 'Close' }).click(),
    'Esc': (page) => page.keyboard.press('Escape'),
    'Back': (page) => page.goBack(),
  };
  for (const [way, doClose] of Object.entries(ways)) {
    test(`${way} closes it, clears the hash and returns focus to the Norte link`, async ({ page }) => {
      await page.goto('./');
      await portalN(page).click();
      await expect(revealState(page)).toHaveAttribute('data-reveal-phase', 'open');
      await doClose(page);
      await expect(revealState(page)).toHaveAttribute('data-reveal-phase', 'rest');
      await expect(page).toHaveURL(/\/$/);
      await expect(page.getByRole('dialog')).toHaveCount(0);
      await expect(norteLink(page)).toBeFocused();
    });
  }

  test('corner texts fade out during the Reveal and come back after', async ({ page }) => {
    await page.goto('./');
    const corner = page.locator('.corner.top-left');
    await expect(corner).toHaveCSS('opacity', '1');
    await portalN(page).click();
    await expect(corner).toHaveCSS('opacity', '0');
    await page.keyboard.press('Escape');
    await expect(corner).toHaveCSS('opacity', '1');
  });
});

test.describe('the lever (Enter control)', () => {
  const lever = (page) => page.getByRole('button', { name: 'Enter Norte: a VC map' });
  const ball = (page) => page.locator('.lever-ball'); // the red ball: the only part you press
  const openNorte = async (page) => {
    await page.goto('./');
    await portalN(page).click();
    await expect(revealState(page)).toHaveAttribute('data-reveal-phase', 'open');
  };

  for (const key of ['Enter', 'Space']) {
    test(`${key} on the focused lever launches into VC Map`, async ({ page }) => {
      await openNorte(page);
      await lever(page).focus();
      await page.keyboard.press(key);
      await expect(page).toHaveURL(/\/vc-map\/$/);
    });
  }

  // Launch with the lever, then Back: the Reveal is open again, with no intro
  // and the lever upright. `restored` says whether Chrome brought the page back
  // from its back/forward cache (frozen mid-launch) or loaded it fresh.
  const launchAndComeBack = async (page, restored) => {
    // Record every phase the homepage publishes. A page restored from the
    // cache starts a fresh record, like a freshly loaded one.
    await page.addInitScript(() => {
      window.phasesSeen = [];
      const note = () => window.phasesSeen.push(document.documentElement.dataset.revealPhase);
      new MutationObserver(note).observe(document, { subtree: true, attributeFilter: ['data-reveal-phase'] });
      addEventListener('pageshow', (e) => { window.restored = e.persisted; if (e.persisted) window.phasesSeen = []; });
    });
    await openNorte(page);
    await lever(page).focus();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/vc-map\/$/);
    await page.goBack({ waitUntil: 'commit' }); // a page restored from the cache fires no load event
    await expect(page).toHaveURL(/#norte$/);
    await expect(revealState(page)).toHaveAttribute('data-reveal-phase', 'open');
    expect(await page.evaluate(() => window.restored)).toBe(restored);
    expect(await page.evaluate(() => window.phasesSeen)).not.toContain('intro');
    await expect(lever(page)).toBeVisible();
    await expect(lever(page)).toHaveCSS('--tilt', '0deg');
  };

  test('Back from VC Map shows the Reveal already open, without the intro', async ({ page }) => {
    await launchAndComeBack(page, false);
  });

  test('with the back/forward cache on, Back restores the Reveal open, not stuck mid-launch', async ({ playwright, baseURL }) => {
    // Playwright turns Chrome's back/forward cache off; real visitors have it on
    const browser = await playwright.chromium.launch({ channel: 'chrome', ignoreDefaultArgs: ['--disable-back-forward-cache'] });
    try {
      const page = await browser.newPage({ baseURL });
      page.on('console', (m) => {
        if (m.type() === 'error' && !m.location().url.endsWith('/favicon.ico')) errors.push(`${m.text()} (${m.location().url})`);
      });
      page.on('pageerror', (e) => errors.push(e.message));
      await launchAndComeBack(page, true);
    } finally {
      await browser.close();
    }
  });

  test('a tap on the lever during the intro only skips the intro', async ({ page }) => {
    await page.goto('./');
    await portalN(page).click();
    await expect(revealState(page)).toHaveAttribute('data-reveal-phase', 'intro');
    await ball(page).click();
    await expect(revealState(page)).toHaveAttribute('data-reveal-phase', 'open');
    await page.waitForTimeout(600); // longer than a launch would take
    await expect(page).toHaveURL(/#norte$/);
  });

  test('a tap on the lever launches into VC Map', async ({ page }) => {
    await openNorte(page);
    await ball(page).click();
    await expect(page).toHaveURL(/\/vc-map\/$/);
  });

  // Drag the ball by (dx, dy), in small steps like a real hand
  const drag = async (page, dx, dy) => {
    const box = await ball(page).boundingBox();
    const x = box.x + box.width / 2, y = box.y + box.height / 2;
    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.move(x + dx, y + dy, { steps: 10 });
    await page.mouse.up();
  };

  for (const [way, dy] of [['up and right', -100], ['down and right', 100]]) {
    test(`dragging the lever ${way} past its threshold launches into VC Map`, async ({ page }) => {
      await openNorte(page);
      await drag(page, 100, dy);
      await expect(page).toHaveURL(/\/vc-map\/$/);
    });
  }

  test('letting go of the lever early springs it back and stays on the Reveal', async ({ page }) => {
    await openNorte(page);
    await drag(page, 20, 20);
    await expect(lever(page)).toHaveCSS('--tilt', '0deg');
    await page.waitForTimeout(600); // longer than a launch would take
    await expect(page).toHaveURL(/#norte$/);
    await expect(revealState(page)).toHaveAttribute('data-reveal-phase', 'open');
  });

  for (const [size, viewport] of [['wide', { width: 1280, height: 800 }], ['narrow', { width: 390, height: 844 }]]) {
    test(`on a ${size} screen the lever sits on top of the card, like on a table`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await openNorte(page);
      const l = await lever(page).boundingBox();
      const card = await page.locator('.reveal-card').boundingBox();
      expect(Math.abs(l.y + l.height - card.y)).toBeLessThanOrEqual(4); // its base rests on the card's top edge
      expect(l.x).toBeGreaterThanOrEqual(card.x); // and stands within the card's width
      expect(l.x + l.width).toBeLessThanOrEqual(card.x + card.width);
      expect(l.width).toBeGreaterThanOrEqual(180); // a main object, not a small button
      for (const box of [l, card]) expect(box.y + box.height).toBeLessThanOrEqual(viewport.height); // all on screen
    });
  }

  test('pressing next to the red ball (where Tokens float) does not move the lever', async ({ page }) => {
    await openNorte(page);
    const box = await lever(page).boundingBox();
    const x = box.x + 6, y = box.y + 6; // the lever's empty top-left corner
    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.move(x + 150, y, { steps: 10 });
    await page.mouse.up();
    await expect(lever(page)).toHaveCSS('--tilt', '0deg');
    await page.waitForTimeout(600); // longer than a launch would take
    await expect(page).toHaveURL(/#norte$/);
  });

  test('the lever is the only way in: no plain link on the card', async ({ page }) => {
    await openNorte(page);
    await expect(page.getByRole('dialog').getByRole('link')).toHaveCount(0);
  });
});

test('the Rest state keeps its pop-in and hover wiggle', async ({ page }) => {
  await page.goto('./');
  const n = page.locator('.title .portal[data-dest="norte"]');
  await expect(n).toHaveCSS('animation-name', 'pop-in');
  await expect(n).toHaveCSS('color', 'rgb(59, 59, 20)'); // --ink
  await n.hover();
  await expect(n).toHaveCSS('color', 'rgb(242, 183, 5)'); // --yellow, its usual hover colour
  await expect(n).not.toHaveCSS('transform', 'none'); // wiggle
});

test.describe('idle charge', () => {
  // Fake clock: 30 s pass instantly. Every letter that gets a charge is recorded.
  async function watchCharges(page, { hidden = false } = {}) {
    await page.clock.install();
    await page.addInitScript((hidden) => {
      if (hidden) Object.defineProperty(document, 'hidden', { get: () => true });
      window.charged = [];
      new MutationObserver((list) => list.forEach((m) => {
        if (m.target.dataset.charge) window.charged.push(m.target.textContent);
      })).observe(document, { subtree: true, attributeFilter: ['data-charge'] });
    }, hidden);
    await page.goto('./');
  }
  const charged = (page) => page.evaluate(() => window.charged);

  test('only the N (a Portal letter) gets idle charges, now and then', async ({ page }) => {
    await watchCharges(page);
    await page.clock.runFor(30_000);
    const letters = await charged(page);
    expect(letters.length).toBeGreaterThan(0);
    expect(new Set(letters)).toEqual(new Set(['N']));
    await expect(page.locator('.title .line > span:not(.portal)[data-charge]')).toHaveCount(0);
  });

  test('no charges while a Reveal is open', async ({ page }) => {
    await watchCharges(page);
    await portalN(page).click();
    await page.mouse.click(10, 300); // skip the intro
    await expect(revealState(page)).toHaveAttribute('data-reveal-phase', 'open');
    await page.evaluate(() => { window.charged = []; });
    await page.clock.runFor(30_000);
    expect(await charged(page)).toEqual([]);
  });

  test('no charges while the tab is hidden', async ({ page }) => {
    await watchCharges(page, { hidden: true });
    await page.clock.runFor(30_000);
    expect(await charged(page)).toEqual([]);
  });

  test.describe('with reduced motion', () => {
    test.use({ reducedMotion: 'reduce' });
    test('no charges at all', async ({ page }) => {
      await watchCharges(page);
      await page.clock.runFor(30_000);
      expect(await charged(page)).toEqual([]);
    });
  });
});

test.describe('the hint line', () => {
  const hint = (page) => page.getByText('Hint: some letters are doors, try the wiggly ones');

  test('is visible on a first visit, smaller than the corner text', async ({ page }) => {
    await page.goto('./');
    await expect(hint(page)).toBeVisible();
    const size = (sel) => page.locator(sel).first().evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
    expect(await size('.hint')).toBeLessThan(await size('.bottom-left p'));
  });

  test('fits on a small phone screen', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto('./');
    const box = await hint(page).boundingBox();
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(320);
    expect(box.y + box.height).toBeLessThanOrEqual(568);
  });

  test('pops away after the first portal opens, and stays hidden after reload', async ({ page }) => {
    await page.goto('./');
    const titleBox = () => page.locator('.title').boundingBox();
    const before = await titleBox();
    await portalN(page).click();
    await expect(revealState(page)).toHaveAttribute('data-reveal-phase', 'open');
    await page.keyboard.press('Escape');
    await expect(revealState(page)).toHaveAttribute('data-reveal-phase', 'rest');
    await expect(hint(page)).toBeHidden();
    expect(await titleBox()).toEqual(before); // nothing moves when the hint goes
    await page.reload();
    await expect(page.locator('.title')).toBeVisible();
    await expect(hint(page)).toBeHidden();
  });

  test('is hidden on a later visit even if the Reveal was never closed', async ({ page }) => {
    await page.goto('./#norte');
    await expect(revealState(page)).toHaveAttribute('data-reveal-phase', 'open');
    await page.goto('./');
    await expect(hint(page)).toBeHidden();
  });

  test.describe('with reduced motion', () => {
    test.use({ reducedMotion: 'reduce' });
    test('disappears without an animation', async ({ page }) => {
      await page.goto('./');
      await portalN(page).click();
      await expect(revealState(page)).toHaveAttribute('data-reveal-destination', 'norte'); // opened (Esc before that does nothing)
      await page.keyboard.press('Escape');
      await expect(revealState(page)).toHaveAttribute('data-reveal-phase', 'rest');
      await expect(page.locator('.hint')).toHaveCSS('animation-name', 'none');
      await expect(hint(page)).toBeHidden();
    });
  });
});

test.describe('the tuning panel (Antonio only)', () => {
  const panel = (page) => page.getByRole('group', { name: 'Tuning' });

  test('is there when the site runs locally', async ({ page }) => {
    await page.goto('./');
    await expect(panel(page)).toBeVisible();
  });

  test('T hides and shows it, and the choice is remembered', async ({ page }) => {
    await page.goto('./');
    await expect(panel(page)).toBeVisible();
    await page.keyboard.press('t');
    await expect(panel(page)).toBeHidden();
    await page.reload();
    await expect(revealState(page)).toHaveAttribute('data-reveal-phase', 'rest');
    await expect(page.locator('details.tune')).toHaveCount(1);
    await expect(panel(page)).toBeHidden();
    await page.keyboard.press('t');
    await expect(panel(page)).toBeVisible();
  });

  test('a changed value is kept after a reload, and Reset brings back the default', async ({ page }) => {
    await page.goto('./');
    await panel(page).getByText('Tuning', { exact: true }).click(); // unfold it
    const flip = panel(page).getByRole('slider', { name: 'Flip duration (ms)' });
    await expect(flip).toHaveValue('300');
    await flip.fill('600');
    await page.reload();
    await panel(page).getByText('Tuning', { exact: true }).click();
    await expect(flip).toHaveValue('600');
    await panel(page).getByRole('button', { name: 'Reset' }).click();
    await page.waitForLoadState();
    await panel(page).getByText('Tuning', { exact: true }).click();
    await expect(flip).toHaveValue('300');
  });

  test('Save writes the values into the site\'s defaults, and Reset goes back to them', async ({ page }) => {
    const defaults = new URL('../public/portals/choreography.js', import.meta.url);
    const original = await readFile(defaults, 'utf8');
    try {
      await page.goto('./');
      await panel(page).getByText('Tuning', { exact: true }).click();
      const flip = panel(page).getByRole('slider', { name: 'Flip duration (ms)' });
      await flip.fill('620');
      await panel(page).getByRole('button', { name: 'Save' }).click();
      await expect(panel(page).getByRole('button', { name: 'Saved ✓' })).toBeVisible();
      await expect.poll(() => readFile(defaults, 'utf8')).toContain('morphDur: 620,');
      // An unsaved change, then Reset: back to the saved 620
      await flip.fill('900');
      await panel(page).getByRole('button', { name: 'Reset' }).click();
      await page.waitForLoadState();
      await panel(page).getByText('Tuning', { exact: true }).click();
      await expect(flip).toHaveValue('620');
    } finally {
      await writeFile(defaults, original);
    }
  });

  test('Save only accepts the page\'s own requests', async ({ request, baseURL }) => {
    const res = await request.post(`${baseURL}__save-tuning`, { data: { morphDur: 1 }, headers: { origin: 'https://evil.example' } });
    expect(res.status()).toBe(403);
  });

  test('Replay plays the Norte Reveal from the start', async ({ page }) => {
    await page.goto('./');
    await panel(page).getByText('Tuning', { exact: true }).click();
    await panel(page).getByRole('button', { name: 'Replay' }).click();
    await expect(revealState(page)).toHaveAttribute('data-reveal-phase', 'intro');
    await expect(revealState(page)).toHaveAttribute('data-reveal-phase', 'open');
    await panel(page).getByRole('button', { name: 'Replay' }).click();
    await expect(revealState(page)).toHaveAttribute('data-reveal-phase', 'intro');
    await expect(page.locator('canvas')).toHaveCount(1);
    await expect(revealState(page)).toHaveAttribute('data-reveal-phase', 'open');
    await page.keyboard.press('Escape'); // still closes as normal
    await expect(revealState(page)).toHaveAttribute('data-reveal-phase', 'rest');
    await expect(page).not.toHaveURL(/#norte/);
  });

  test.describe('on the official site', () => {
    test('never appears', async ({ page, baseURL }) => {
      // Chrome sends this made-up hostname to the test server (playwright.config.js)
      await page.goto(baseURL.replace('localhost', 'antoniobento.test'));
      await expect(revealState(page)).toHaveAttribute('data-reveal-phase', 'rest'); // the page's scripts ran
      await page.keyboard.press('t');
      await expect(panel(page)).toHaveCount(0);
      await expect(page.locator('link[href*="tuning"]')).toHaveCount(0);
    });
  });
});

test('Ctrl-click on N opens VC Map in a new tab and leaves the homepage at rest', async ({ page, context }) => {
  await page.goto('./');
  const newTab = context.waitForEvent('page');
  await portalN(page).click({ modifiers: ['ControlOrMeta'] });
  await expect(await newTab).toHaveURL(/\/vc-map\/$/);
  await expect(revealState(page)).toHaveAttribute('data-reveal-phase', 'rest');
});

test('a broken #hash does not stop the portal from working', async ({ page }) => {
  await page.goto('./#%E0');
  await portalN(page).click();
  await expect(revealState(page)).toHaveAttribute('data-reveal-phase', 'open');
});

test('the title is still announced as "Antonio Bento"', async ({ page }) => {
  await page.goto('./');
  await expect(page.locator('h1')).toHaveAccessibleName('Antonio Bento');
  await expect(page.locator('h1')).toHaveText(/ANTONIO\s*BENTO/i);
});
