import { fmtRupees } from '../../utils/formatters';
import { colors } from '../../styles/theme';
import Button from '../Button';
import Stat from '../Stat';

export default function AdDetailPanel({ ad, onClose }) {
  if (!ad) return null;

  const pixels = ad.bw * ad.bh;

  return (
    <div
      onPointerDown={(e) => e.stopPropagation()}
      style={{
        position: 'absolute',
        top: 10,
        right: 10,
        background: colors.bgOverlay,
        backdropFilter: 'blur(16px)',
        border: `1px solid ${colors.borderLight}`,
        borderRadius: 12,
        padding: 16,
        width: 'min(270px,calc(100vw - 20px))',
        zIndex: 200,
        boxShadow: '0 10px 40px rgba(0,0,0,.5)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'start',
          marginBottom: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 6,
              background: ad.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 13,
              fontWeight: 800,
              color: '#fff',
            }}
          >
            {ad.label[0]}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{ad.label}</div>
            <div style={{ fontSize: 10, color: colors.textMuted }}>{ad.owner}</div>
          </div>
        </div>
        <Button onClick={onClose}>✕</Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 10 }}>
        <Stat label="Position" value={`(${ad.bx},${ad.by})`} />
        <Stat label="Size" value={`${ad.bw}×${ad.bh}px`} />
        <Stat label="Pixels" value={pixels.toLocaleString()} />
        <Stat label="Value" value={fmtRupees(pixels)} />
      </div>

      {ad.url && ad.url !== '#' && (
        <a
          href={ad.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'block',
            textAlign: 'center',
            padding: 8,
            background: colors.accent,
            color: colors.bg,
            borderRadius: 8,
            fontWeight: 700,
            fontSize: 12,
            textDecoration: 'none',
          }}
        >
          Visit Website →
        </a>
      )}
    </div>
  );
}
