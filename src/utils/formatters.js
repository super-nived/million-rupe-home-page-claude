export const fmtRupees = (n) => `₹${n.toLocaleString('en-IN')}`;

export const soldPixels = (ads) =>
  ads.reduce((sum, a) => sum + a.bw * a.bh, 0);

export function formatTimeAgo(timestamp) {
  if (!timestamp) return '';
  const now = Date.now();
  const ms = typeof timestamp === 'number' ? timestamp : timestamp.toMillis?.() || timestamp.seconds * 1000;
  const diff = Math.max(0, now - ms);
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return 'just now';
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const d = Math.floor(hr / 24);
  return `${d}d ago`;
}

export function formatTicketId(docId) {
  return '#' + docId.slice(-8).toUpperCase();
}
