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
