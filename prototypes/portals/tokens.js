// Stand-in Token stickers (prototype only). Each is a small inline SVG,
// 100x100, flat colours, thick dark outline. Final art: see STATUS.md.

const K = '#1d1a10';
const svg = (inner) =>
  `<svg viewBox="0 0 100 100" aria-hidden="true"><g stroke="${K}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">${inner}</g></svg>`;
const txt = (x, y, size, fill, s, extra = '') =>
  `<text x="${x}" y="${y}" font-size="${size}" fill="${fill}" stroke="none" text-anchor="middle" font-family="Bricolage Grotesque, system-ui" font-weight="800" ${extra}>${s}</text>`;

// Spiky star outline (for the Norte mascot stand-in)
function starPath(cx, cy, R, r, n) {
  let d = '';
  for (let i = 0; i < n * 2; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / n;
    const rad = i % 2 ? r : R * (0.82 + 0.18 * ((i * 7) % 3) / 2);
    d += (i ? 'L' : 'M') + (cx + rad * Math.cos(a)).toFixed(1) + ' ' + (cy + rad * Math.sin(a)).toFixed(1);
  }
  return d + 'Z';
}

// São Paulo flag: 13 stripes + red canton with a white circle
function spFlag() {
  const h = 60 / 13;
  let s = `<rect x="8" y="20" width="84" height="60" fill="#fff" stroke="none"/>`;
  for (let i = 0; i < 13; i += 2) s += `<rect x="8" y="${(20 + i * h).toFixed(2)}" width="84" height="${h.toFixed(2)}" fill="#111" stroke="none"/>`;
  s += `<rect x="8" y="20" width="36" height="${(h * 7).toFixed(2)}" fill="#d6232c" stroke="none"/>`;
  s += `<circle cx="26" cy="36" r="10" fill="#fff" stroke="none"/><path d="M22 34l4-4 5 3-2 6-6 1z" fill="#0f6f9e" stroke="none"/>`;
  s += `<rect x="8" y="20" width="84" height="60" fill="none"/>`;
  return s;
}

window.ABOUT_TOKENS = [
  { name: 'basketball', svg: svg(`<circle cx="50" cy="50" r="42" fill="#f08a1c"/><path d="M8 50h84M50 8v84M22 20c14 16 14 44 0 60M78 20c-14 16-14 44 0 60" fill="none"/>`) },
  { name: 'tennis ball', svg: svg(`<circle cx="50" cy="50" r="40" fill="#d9e84a"/><path d="M16 28c18 10 18 34 0 44M84 28c-18 10-18 34 0 44" fill="none" stroke="#fff" stroke-width="6"/><circle cx="50" cy="50" r="40" fill="none"/>`) },
  { name: 'speargun + fish', svg: svg(`<path d="M20 52c12-18 40-18 54 0c-14 18-42 18-54 0z" fill="#0f6f9e"/><path d="M74 52l16-13v26z" fill="#0f6f9e"/><circle cx="34" cy="48" r="3" fill="${K}"/><path d="M4 26L92 78" fill="none" stroke-width="5"/><path d="M96 81l-12-1 5-8z" fill="#7b7d72"/>`) },
  { name: 'beer', svg: svg(`<path d="M64 44h10a8 8 0 0 1 8 8v12a8 8 0 0 1-8 8H64" fill="none" stroke-width="6"/><rect x="22" y="30" width="44" height="60" rx="6" fill="#f2b705"/><path d="M18 36c-2-12 12-16 18-10c4-9 20-9 24 0c9-5 18 3 12 12c-4 6-50 6-54-2z" fill="#fff"/><path d="M34 52v28M48 52v28" fill="none" stroke="#fff" stroke-width="4"/>`) },
  { name: 'Djavan (1978)', svg: svg(`<circle cx="64" cy="50" r="32" fill="#222"/><circle cx="64" cy="50" r="10" fill="#d6232c"/><rect x="8" y="16" width="64" height="66" fill="#e9d9b8"/><circle cx="40" cy="42" r="14" fill="#7a4b2a"/>${txt(40, 70, 11, K, 'DJAVAN')}${txt(40, 79, 7, K, '1978')}`) },
  { name: 'Flamengo', svg: svg(`<defs><clipPath id="flaClip"><path d="M18 12h64v36c0 24-16 36-32 42C34 84 18 72 18 48z"/></clipPath></defs><path d="M18 12h64v36c0 24-16 36-32 42C34 84 18 72 18 48z" fill="#d6232c"/><g clip-path="url(#flaClip)" stroke="none" fill="#111"><rect x="0" y="40" width="100" height="10"/><rect x="0" y="60" width="100" height="10"/><rect x="0" y="80" width="100" height="10"/></g>${txt(50, 32, 16, '#fff', 'CRF')}<path d="M18 12h64v36c0 24-16 36-32 42C34 84 18 72 18 48z" fill="none"/>`) },
  { name: 'laptop', svg: svg(`<rect x="16" y="18" width="68" height="46" rx="5" fill="#3b3b14"/>${txt(50, 48, 20, '#5df08a', '&lt;/&gt;', 'font-family="ui-monospace, monospace"')}<path d="M6 70h88l-7 12H13z" fill="#c9ccc0"/>`) },
  { name: 'portal swirl', svg: svg(`<circle cx="50" cy="50" r="42" fill="#7ee04a"/><path d="M50 50m-5 0a5 5 0 1 1 10 0a11 11 0 1 1-22 0a17 17 0 1 1 34 0a23 23 0 1 1-46 0a29 29 0 1 1 58 0" fill="none" stroke="#2a8f1a" stroke-width="5"/><circle cx="50" cy="50" r="42" fill="none"/>`) },
  { name: 'Hermeto bobblehead', svg: svg(`<rect x="36" y="70" width="28" height="24" rx="7" fill="#f08a1c"/><path d="M50 72l-6-3 12-3-12-3 6-3" fill="none" stroke-width="3"/><circle cx="50" cy="38" r="28" fill="#e8b48a"/><path d="M22 36c-4-26 60-32 56 0c-6-8-14-12-28-12s-22 4-28 12z" fill="#fff"/><path d="M26 44c0 30 48 30 48 0c-8 10-40 10-48 0z" fill="#fff"/><circle cx="40" cy="38" r="2.5" fill="${K}"/><circle cx="60" cy="38" r="2.5" fill="${K}"/>`) },
  { name: 'hang glider', svg: svg(`<path d="M4 46L50 18l46 28-46-8z" fill="#d6232c"/><path d="M50 18v20M27 32l23 6 23-6" fill="none" stroke-width="3"/><path d="M38 62h24L50 38z" fill="none" stroke-width="3"/><circle cx="50" cy="68" r="5" fill="#f2b705"/><path d="M50 73v14M44 80h12" fill="none"/>`) },
  { name: 'bento box', svg: svg(`<rect x="8" y="20" width="84" height="62" rx="8" fill="#d6232c"/><rect x="15" y="27" width="70" height="48" fill="#fff4e0"/><path d="M50 27v48M50 51h35" fill="none"/><circle cx="26" cy="44" r="6" fill="#fff"/><circle cx="38" cy="58" r="6" fill="#fff"/><circle cx="27" cy="62" r="5" fill="#fff"/><rect x="56" y="32" width="24" height="13" rx="4" fill="#f08a1c"/><circle cx="62" cy="63" r="6" fill="#14803c"/><circle cx="74" cy="63" r="6" fill="#14803c"/>`) },
];

window.NORTE_TOKENS = [
  { name: 'folded map', svg: svg(`<path d="M8 26l28-8 28 8 28-8v58l-28 8-28-8-28 8z" fill="#f2c200"/><path d="M36 18v58M64 26v58" fill="none"/><path d="M36 18l28 8v58l-28-8z" fill="#e0a800"/><path d="M16 66c10-10 20 4 30-8s16-20 30-18" fill="none" stroke-dasharray="4 6" stroke-width="3"/><circle cx="76" cy="40" r="5" fill="#d6232c"/>`) },
  { name: 'compass', svg: svg(`<circle cx="50" cy="50" r="42" fill="#f2c200"/><circle cx="50" cy="50" r="31" fill="#fff"/><path d="M50 24l9 26H41z" fill="#d6232c"/><path d="M50 76l9-26H41z" fill="#fff"/>${txt(50, 18, 12, K, 'N')}<circle cx="50" cy="50" r="4" fill="${K}"/>`) },
  { name: 'star mascot', svg: svg(`<path d="${starPath(50, 52, 46, 22, 10)}" fill="#f2c200"/><circle cx="43" cy="48" r="2.5" fill="${K}"/><circle cx="57" cy="48" r="2.5" fill="${K}"/><ellipse cx="50" cy="59" rx="5" ry="4" fill="#ff7bb5"/>`) },
  { name: 'rising arrow', svg: svg(`<path d="M12 84l26-30 16 14 32-38" fill="none" stroke-width="16"/><path d="M12 84l26-30 16 14 32-38" fill="none" stroke="#f2c200" stroke-width="9" stroke-linecap="butt" stroke-linejoin="miter"/><path d="M94 18l-4 26-22-18z" fill="#f2c200"/>`) },
  { name: 'coin stack', svg: svg([78, 64, 50, 36].map((y) => `<path d="M24 ${y}v8a26 8 0 0 0 52 0v-8" fill="#e0a800"/><ellipse cx="50" cy="${y}" rx="26" ry="8" fill="#f2c200"/>`).join('') + txt(50, 40, 10, K, '$')) },
  { name: 'rocket', svg: svg(`<path d="M40 74l-6 18 16-8 16 8-6-18z" fill="#f08a1c"/><path d="M36 60l-14 14 4-24zM64 60l14 14-4-24z" fill="#d6232c"/><path d="M50 6c16 12 20 36 14 62H36C30 42 34 18 50 6z" fill="#fff"/><circle cx="50" cy="34" r="8" fill="#0f6f9e"/>`) },
  { name: 'São Paulo flag', svg: svg(spFlag()) },
  { name: 'term sheet', svg: svg(`<path d="M20 8h44l16 16v68H20z" fill="#fff"/><path d="M64 8v16h16" fill="#e8e2cf"/><path d="M30 34h30M30 44h40M30 54h40M30 64h24" fill="none" stroke-width="3"/><path d="M30 80c6-8 8 4 14-2s8 4 14-2" fill="none" stroke="#0f6f9e" stroke-width="3"/>`) },
  { name: 'lightbulb', svg: svg(`<path d="M50 8a28 28 0 0 1 16 51v9H34v-9A28 28 0 0 1 50 8z" fill="#f2c200"/><rect x="34" y="68" width="32" height="10" rx="3" fill="#c9ccc0"/><rect x="38" y="78" width="24" height="10" rx="4" fill="#9a9c92"/><path d="M42 50l4-10 4 8 4-8 4 10" fill="none" stroke-width="3"/>`) },
  { name: 'handshake', svg: svg(`<rect x="2" y="38" width="22" height="28" rx="3" fill="#0f6f9e"/><rect x="76" y="38" width="22" height="28" rx="3" fill="#f2c200"/><path d="M76 40H56c-9 0-13 7-13 12s4 12 13 12h20z" fill="#c98b5e"/><path d="M24 42h24c9 0 14 6 14 11s-5 11-14 11H24z" fill="#e8b48a"/><path d="M40 47h14M40 53h16M40 59h12" fill="none" stroke-width="3"/>`) },
  { name: 'bar chart', svg: svg(`<path d="M10 10v80h82" fill="none"/><rect x="20" y="58" width="16" height="30" fill="#f2c200"/><rect x="44" y="40" width="16" height="48" fill="#f2c200"/><rect x="68" y="20" width="16" height="68" fill="#f2c200"/>`) },
];
