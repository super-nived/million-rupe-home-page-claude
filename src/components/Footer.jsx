import { CANVAS_PX } from '../constants/grid';
import { soldPixels } from '../utils/formatters';
import { colors } from '../styles/theme';

export default function Footer({ ads }) {
  const sold = soldPixels(ads);
  const total = CANVAS_PX * CANVAS_PX;

  return (
    <footer
      style={{
        display: 'flex',
        justifyContent: 'center',
        gap: 14,
        padding: '5px 12px',
        background: colors.bgPanel,
        borderTop: `1px solid ${colors.border}`,
        fontSize: 10,
        color: colors.textDimmest,
        flexShrink: 0,
        flexWrap: 'wrap',
      }}
    >
      <span>{ads.length} ads</span>
      <span>·</span>
      <span style={{ color: colors.success }}>{sold.toLocaleString()} sold</span>
      <span>·</span>
      <span>{(total - sold).toLocaleString()} available</span>
      <span>·</span>
      <span>Scroll zoom · Drag pan · Pinch on mobile</span>
    </footer>
  );
}
