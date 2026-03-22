import { CANVAS_PX } from '../../constants/grid';
import { soldPixels, fmtRupees } from '../../utils/formatters';
import { colors } from '../../styles/theme';

const TOTAL = CANVAS_PX * CANVAS_PX;

export default function ProgressBadge({ ads }) {
  const sold = soldPixels(ads);
  const pct = Math.min(100, (sold / TOTAL) * 100);
  const remaining = TOTAL - sold;

  const urgencyColor =
    pct >= 90 ? '#ef4444' :
    pct >= 70 ? '#f59e0b' :
    colors.success;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '3px 0',
      }}
    >
      {/* Progress bar */}
      <div
        style={{
          width: 80,
          height: 6,
          background: colors.border,
          borderRadius: 3,
          overflow: 'hidden',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: '100%',
            background: urgencyColor,
            borderRadius: 3,
            transition: 'width .6s ease, background .4s ease',
          }}
        />
      </div>

      {/* Stats */}
      <div style={{ fontSize: 10, color: colors.textDim, whiteSpace: 'nowrap' }}>
        <span style={{ color: urgencyColor, fontWeight: 700 }}>
          {remaining.toLocaleString('en-IN')}
        </span>
        {' left'}
      </div>
    </div>
  );
}
