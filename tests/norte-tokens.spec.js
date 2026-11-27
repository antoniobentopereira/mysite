// The flat Norte Tokens: final sticker art, one SVG file each.
import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { DESTINATIONS } from '../public/portals/destinations.js';

// The flat Tokens are the ones the Destination block marks as stickers
const FLAT = DESTINATIONS.norte.tokens.filter((t) => t.kind === 'sticker').map((t) => t.src.match(/([^/]+)\.svg$/)[1]);
const file = (name) => new URL(`../public/portals/tokens/norte/${name}.svg`, import.meta.url);

test('Norte has 7 flat sticker Tokens', () => expect(FLAT).toHaveLength(7));

for (const name of FLAT) {
  test(`the ${name} sticker is final art, light, and in the shared sticker frame`, async () => {
    const svg = await readFile(file(name), 'utf8');
    expect(svg).not.toMatch(/stand-in/i);
    expect(Buffer.byteLength(svg)).toBeLessThan(30 * 1024);
    expect(svg).toMatch(/<svg[^>]*viewBox="0 0 100 100"/);
    expect(svg).toMatch(/class="sticker-edge"/); // the white die-cut border every sticker has
  });
}

test('opening the Reveal loads the 3D Tokens\' own code (compass, coin stack)', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error' && !m.location().url.endsWith('/favicon.ico')) errors.push(m.text()); });
  const loaded = [];
  page.on('response', (r) => { if (/tokens\/norte\/[\w-]+\.js$/.test(r.url()) && r.ok()) loaded.push(r.url().split('/').pop()); });
  await page.goto('./');
  await page.locator('.title a[href="vc-map/"]').click();
  await expect(page.locator('html')).toHaveAttribute('data-reveal-phase', 'open');
  await expect(page.locator('canvas')).toHaveCount(1); // the 3D Reveal, not the simple one
  expect(loaded.sort()).toEqual(['coin-stack.js', 'compass.js']);
  expect(errors).toEqual([]);
});
