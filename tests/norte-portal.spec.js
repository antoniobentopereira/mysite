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
    await expect(dialog.getByRole('link', { name: /or just open it/ })).toHaveAttribute('href', 'vc-map/');
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

test('the Rest state keeps its pop-in and hover wiggle', async ({ page }) => {
  await page.goto('./');
  const n = page.locator('.title .portal[data-dest="norte"]');
  await expect(n).toHaveCSS('animation-name', 'pop-in');
  await expect(n).toHaveCSS('color', 'rgb(59, 59, 20)'); // --ink
  await n.hover();
  await expect(n).toHaveCSS('color', 'rgb(242, 183, 5)'); // --yellow, its usual hover colour
  await expect(n).not.toHaveCSS('transform', 'none'); // wiggle
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
