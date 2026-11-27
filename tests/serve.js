// Tiny static file server for local testing: serves public/ like Cloudflare does.
// Usage: node tests/serve.js [port]
//
// It also takes the tuning panel's Save (local only, never on the official site):
// POST /__save-tuning with the values as JSON writes them into TIMINGS in
// public/portals/choreography.js, the defaults the live site uses once deployed.
import { createServer } from 'node:http';
import { readFile, stat, writeFile } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..', 'public');
const DEFAULTS = join(ROOT, 'portals', 'choreography.js');
const PORT = Number(process.argv[2] || process.env.PORT || 8417);
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.webp': 'image/webp', '.jpg': 'image/jpeg', '.woff2': 'font/woff2',
};

const send = (res, status, body, type = 'text/plain') => {
  res.writeHead(status, { 'content-type': type, 'cache-control': 'no-store' });
  res.end(body);
};

// Write the panel's values into the TIMINGS block. Only from the page itself
// (another website can't send it: wrong origin, and JSON needs a CORS check this
// server never passes), only keys TIMINGS already has, only plain numbers.
async function saveTuning(req, res) {
  if (req.headers.origin !== `http://${req.headers.host}`) return send(res, 403, 'Not from this page');
  if (!req.headers['content-type']?.startsWith('application/json')) return send(res, 415, 'JSON only');
  let raw = '';
  for await (const chunk of req) { raw += chunk; if (raw.length > 10_000) return send(res, 413, 'Too big'); }
  let values;
  try { values = JSON.parse(raw); } catch { return send(res, 400, 'Broken JSON'); }

  const source = await readFile(DEFAULTS, 'utf8');
  const block = source.match(/export const TIMINGS = \{[\s\S]*?\n\};/);
  if (!block) return send(res, 500, 'TIMINGS not found in choreography.js');
  const saved = [];
  const updated = block[0].replace(/^(\s+)(\w+): (-?[\d.]+),/gm, (line, indent, key) => {
    const v = values?.[key];
    if (typeof v !== 'number' || !Number.isFinite(v)) return line;
    saved.push(key);
    return `${indent}${key}: ${v},`;
  });
  await writeFile(DEFAULTS, source.replace(block[0], updated));
  console.log(`Saved tuning: ${saved.join(', ')}`);
  send(res, 200, JSON.stringify({ saved }), 'application/json');
}

createServer(async (req, res) => {
  try {
    const { pathname } = new URL(req.url, 'http://x');
    if (pathname === '/__save-tuning') return req.method === 'POST' ? await saveTuning(req, res) : send(res, 405, 'POST only');
    let path = normalize(join(ROOT, decodeURIComponent(pathname)));
    if (!path.startsWith(ROOT)) throw new Error('outside root');
    if ((await stat(path)).isDirectory()) path = join(path, 'index.html');
    const body = await readFile(path);
    // no-store: a saved choreography.js shows on the next reload
    send(res, 200, body, TYPES[extname(path)] || 'application/octet-stream');
  } catch {
    if (!res.headersSent) send(res, 404, 'Not found');
  }
}).listen(PORT, () => console.log(`Serving public/ at http://localhost:${PORT}`));
