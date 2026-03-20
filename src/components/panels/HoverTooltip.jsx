import { fmtRupees } from '../../utils/formatters';

export default function HoverTooltip({ ad }) {
  if (!ad) return null;

  const pixels = ad.bw * ad.bh;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 14,
        left: '50%',
        transform: 'translateX(-50%)',
        background: '#16162299',
        backdropFilter: 'blur(14px)',
        border: '1px solid #2a2a3a',
        borderRadius: 10,
        padding: '9px 16px',
        fontSize: 13,
        zIndex: 200,
        display: 'flex',
        gap: 14,
        alignItems: 'center',
        boxShadow: '0 8px 30px rgba(0,0,0,.45)',
      }}
    >
      <div
        style={{
          width: 12,
          height: 12,
          borderRadius: 3,
          background: ad.color,
          flexShrink: 0,
        }}
      />
      <div>
        <div style={{ fontWeight: 600, lineHeight: 1.2 }}>{ad.label}</div>
        <div style={{ color: '#8888a0', fontSize: 11 }}>
          {ad.bw}×{ad.bh}px · {ad.owner}
        </div>
      </div>
      <div style={{ fontSize: 12, color: '#f59e0b', fontWeight: 700, whiteSpace: 'nowrap' }}>
        {fmtRupees(pixels)}
      </div>
    </div>
  );
}
