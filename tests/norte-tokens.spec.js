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

// Lei 145/1948, art. 2 (one module = 1/13 of the flag's height): 13 bands of 1 module,
// black and white; a red canton 7.5 x 5 modules; a white circle 4 modules wide with a
// blue map of Brazil; four yellow stars in the canton's corners, 1 module from its edges.
test('the São Paulo flag is accurate: 13 stripes, red canton with a white circle, the map and 4 stars', async ({ page }) => {
  await page.setContent(await readFile(file('sao-paulo-flag'), 'utf8'));
  const flag = await page.evaluate(() => {
    const all = (part) => [...document.querySelectorAll(`[data-part="${part}"]`)];
    const box = (el) => { const b = el.getBBox(); return { x: b.x, y: b.y, w: b.width, h: b.height }; };
    const rgb = (el) => getComputedStyle(el).fill.match(/\d+/g).map(Number);
    const first = all('stripe')[0].getBBox(), last = all('stripe').at(-1).getBBox();
    const height = last.y + last.height - first.y, m = height / 13; // one module
    return {
      ratio: first.width / height,
      stripes: all('stripe').map((s) => ({ ...box(s), h: s.getBBox().height / m, fill: rgb(s) })),
      canton: { w: box(all('canton')[0]).w / m, h: box(all('canton')[0]).h / m, fill: rgb(all('canton')[0]) },
      circle: { d: box(all('circle')[0]).w / m, fill: rgb(all('circle')[0]) },
      map: rgb(all('map')[0]),
      stars: all('star').map(rgb),
    };
  });
  expect(flag.ratio).toBeCloseTo(1.5, 2);
  // 7 black and 6 white, alternating, starting and ending with black
  expect(flag.stripes).toHaveLength(13);
  flag.stripes.forEach((s, i) => {
    expect(s.h).toBeCloseTo(1, 2);
    expect(s.fill).toEqual(i % 2 ? [255, 255, 255] : [0, 0, 0]);
  });
  expect(flag.canton.w).toBeCloseTo(7.5, 2);
  expect(flag.canton.h).toBeCloseTo(5, 2);
  const [r, g, b] = flag.canton.fill;
  expect(r).toBeGreaterThan(180); expect(g + b).toBeLessThan(120); // red
  expect(flag.circle.d).toBeCloseTo(4, 2);
  expect(flag.circle.fill).toEqual([255, 255, 255]);
  expect(flag.map[2]).toBeGreaterThan(flag.map[0] + 40); // blue
  expect(flag.stars).toHaveLength(4);
  flag.stars.forEach(([r, g, b]) => { expect(r).toBeGreaterThan(200); expect(g).toBeGreaterThan(150); expect(b).toBeLessThan(80); }); // yellow
});
