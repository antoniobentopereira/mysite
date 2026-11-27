// The Norte portal, checked as a visitor sees the homepage.
import { test, expect } from '@playwright/test';

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
  test('clicking N opens the simple Reveal and sets #norte', async ({ page }) => {
    await page.goto('./');
    await expect(revealState(page)).toHaveAttribute('data-reveal-phase', 'rest');
    await portalN(page).click();
    await expect(page).toHaveURL(/#norte$/);
    await expect(revealState(page)).toHaveAttribute('data-reveal-destination', 'norte');
    await expect(revealState(page)).toHaveAttribute('data-reveal-phase', 'open');
    await expect(revealState(page)).toHaveAttribute('data-reveal-fallback', 'true');
    const dialog = page.getByRole('dialog', { name: 'Norte: a VC map' });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText('NORTE', { exact: true })).toBeVisible();
    await expect(dialog.getByRole('heading', { name: 'Norte: a VC map' })).toBeVisible();
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
    await lever(page).click();
    await expect(revealState(page)).toHaveAttribute('data-reveal-phase', 'open');
    await page.waitForTimeout(600); // longer than a launch would take
    await expect(page).toHaveURL(/#norte$/);
  });

  test('a tap on the lever launches into VC Map', async ({ page }) => {
    await openNorte(page);
    await lever(page).click();
    await expect(page).toHaveURL(/\/vc-map\/$/);
  });

  // Drag the ball by (dx, dy), in small steps like a real hand
  const drag = async (page, dx, dy) => {
    const box = await lever(page).boundingBox();
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
    await page.clock.runFor(1_000); // the intro
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
    await portalN(page).click();
    await expect(revealState(page)).toHaveAttribute('data-reveal-phase', 'open');
    await page.keyboard.press('Escape');
    await expect(revealState(page)).toHaveAttribute('data-reveal-phase', 'rest');
    await expect(hint(page)).toBeHidden();
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
      await page.keyboard.press('Escape');
      await expect(revealState(page)).toHaveAttribute('data-reveal-phase', 'rest');
      await expect(page.locator('.hint')).toHaveCSS('animation-name', 'none');
      await expect(hint(page)).toBeHidden();
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
