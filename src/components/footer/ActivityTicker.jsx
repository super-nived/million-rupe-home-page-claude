import { useRecentPurchases } from '../../features/lottery/useLottery';
import { formatTimeAgo } from '../../utils/formatters';
import { colors } from '../../styles/theme';

export default function ActivityTicker() {
  const purchases = useRecentPurchases(8);

  if (!purchases.length) return null;

  // Duplicate for seamless loop
  const items = [...purchases, ...purchases];

  return (
    <div
      style={{
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        maskImage: 'linear-gradient(90deg, transparent 0%, black 8%, black 92%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(90deg, transparent 0%, black 8%, black 92%, transparent 100%)',
      }}
    >
      <div
        style={{
          display: 'inline-flex',
          gap: 24,
          animation: `tickerScroll ${items.length * 3}s linear infinite`,
        }}
      >
        {items.map((p, i) => (
          <span key={`${p.id}-${i}`} style={{ fontSize: 10, color: colors.textDimmer }}>
            <span style={{ color: colors.accent }}>{p.owner || 'Someone'}</span>
            {' bought '}
            <span style={{ color: colors.text, fontWeight: 600 }}>{p.pixels}px</span>
            {p.createdAt && (
              <span style={{ color: colors.textDimmest }}> · {formatTimeAgo(p.createdAt)}</span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}
