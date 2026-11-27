// Makes the vendored library copies in public/portals/vendor/ (ADR 0001, 0002).
// Run with: npm run vendor   (dev-only; visitors only ever get the output files)
//
// - three.js: a trimmed, minified copy with only the parts the Reveal uses
//   (the full Three.js is ~2 MB). Add a name to THREE_PARTS when the scene needs more.
// - matter.js: Matter.js's own minified file, copied as is.
import { build } from 'esbuild';
import { copyFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const OUT = resolve(ROOT, 'public', 'portals', 'vendor');
const THREE_PARTS = [
  'WebGLRenderer', 'Scene', 'PerspectiveCamera', 'Group', 'Mesh',
  'PlaneGeometry', 'CircleGeometry', 'MeshBasicMaterial', 'CanvasTexture', 'SRGBColorSpace', 'Color',
];

await mkdir(OUT, { recursive: true });
await build({
  stdin: { contents: `export { ${THREE_PARTS.join(', ')} } from 'three';`, resolveDir: ROOT },
  bundle: true,
  minify: true,
  format: 'esm',
  target: 'es2020',
  legalComments: 'eof', // keeps Three.js's MIT licence line in the file
  outfile: resolve(OUT, 'three.min.js'),
});
await copyFile(resolve(ROOT, 'node_modules/matter-js/build/matter.min.js'), resolve(OUT, 'matter.min.js'));
console.log('Vendored three.min.js and matter.min.js into public/portals/vendor/');
