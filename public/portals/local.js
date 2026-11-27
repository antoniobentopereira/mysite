// Is the site running on Antonio's own computer (or his home network), rather
// than the official site? Then dev-only extras, like the tuning panel, appear.
// Local means: a file URL, localhost, 127.x, ::1, or a private LAN address
// (10.x, 172.16-31.x, 192.168.x, or a computer's name on the home network,
// like my-pc.local).
export function isLocal({ protocol, hostname }) {
  if (protocol === 'file:') return true;
  const h = hostname.replace(/^\[|\]$/g, ''); // [::1] -> ::1
  if (h === 'localhost' || h.endsWith('.localhost') || h.endsWith('.local') || h === '::1' || h === '0.0.0.0') return true;
  const ip = h.match(/^(\d+)\.(\d+)\.\d+\.\d+$/);
  if (!ip) return false;
  const a = Number(ip[1]), b = Number(ip[2]);
  return a === 127 || a === 10 || (a === 192 && b === 168) || (a === 172 && b >= 16 && b <= 31);
}
