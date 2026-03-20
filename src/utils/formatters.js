export const fmtRupees = (n) => `₹${n.toLocaleString('en-IN')}`;

export const soldPixels = (ads) =>
  ads.reduce((sum, a) => sum + a.bw * a.bh, 0);
