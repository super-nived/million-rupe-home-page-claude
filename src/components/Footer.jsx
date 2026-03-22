import { CANVAS_PX } from '../constants/grid';
import { soldPixels, fmtRupees } from '../utils/formatters';
import { colors } from '../styles/theme';
import ActivityTicker from './footer/ActivityTicker';

export default function Footer({ ads }) {
  const sold = soldPixels(ads);
  const total = CANVAS_PX * CANVAS_PX;

  return (
    <footer
      style={{
        background: colors.bgPanel,
        borderTop: `1px solid ${colors.border}`,
        flexShrink: 0,
      }}
    >
      {/* Row 1: Stats */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 14,
          padding: '5px 12px',
          fontSize: 10,
          color: colors.textDimmest,
          flexWrap: 'wrap',
        }}
      >
        <span>{ads.length} ads</span>
        <span>·</span>
        <span style={{ color: colors.success }}>{sold.toLocaleString()} sold</span>
        <span>·</span>
        <span>{(total - sold).toLocaleString()} available</span>
        <span>·</span>
        <span style={{ color: colors.accent }}>{fmtRupees(sold)} raised</span>
        <span>·</span>
        <span>Scroll zoom · Drag pan · Pinch on mobile</span>
      </div>

      {/* Row 2: Activity ticker */}
      <div
        style={{
          borderTop: `1px solid ${colors.border}`,
          padding: '3px 12px',
        }}
      >
        <ActivityTicker />
      </div>
    </footer>
  );
}
