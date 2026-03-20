import { GRID } from '../constants/grid';

function rectsOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

export function isAreaFree(ads, bx, by, bw, bh) {
  if (bx < 0 || by < 0 || bx + bw > GRID || by + bh > GRID) return false;
  return !ads.some((a) => rectsOverlap(bx, by, bw, bh, a.bx, a.by, a.bw, a.bh));
}

export function adAtBlock(ads, bx, by) {
  return ads.find(
    (a) => bx >= a.bx && bx < a.bx + a.bw && by >= a.by && by < a.by + a.bh
  );
}

export function computeSelection(selA, selB, ads) {
  if (!selA || !selB) return null;
  const x1 = Math.min(selA.bx, selB.bx);
  const y1 = Math.min(selA.by, selB.by);
  const x2 = Math.max(selA.bx, selB.bx);
  const y2 = Math.max(selA.by, selB.by);
  const bw = x2 - x1 + 1;
  const bh = y2 - y1 + 1;
  return {
    bx: x1,
    by: y1,
    bw,
    bh,
    free: isAreaFree(ads, x1, y1, bw, bh),
    px: bw * bh,
  };
}
