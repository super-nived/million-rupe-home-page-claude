import { memo } from 'react';

const AdRect = memo(function AdRect({ ad, scale, isHovered, isSelected }) {
  const { bx, by, bw, bh } = ad;
  const highlighted = isHovered || isSelected;
  const hasImage = !!ad.image;
  const showLabel = !hasImage && scale > 0.5 && bw * scale > 24;
  const fontSize = Math.min(
    Math.max(bw / (ad.label.length * 0.72), 3.5),
    Math.min(bw, bh) * 0.32
  );

  return (
    <g>
      <rect
        x={bx}
        y={by}
        width={bw}
        height={bh}
        fill={hasImage ? '#000' : ad.color}
        stroke={highlighted ? '#fff' : 'rgba(0,0,0,.35)'}
        strokeWidth={(highlighted ? 2 : 0.4) / scale}
        rx={0.8}
        opacity={isHovered ? 1 : 0.9}
        style={{ transition: 'opacity .12s' }}
      />
      {hasImage && (
        <image
          href={ad.image}
          x={bx}
          y={by}
          width={bw}
          height={bh}
          preserveAspectRatio="xMidYMid slice"
          style={{ pointerEvents: 'none' }}
        />
      )}
      {showLabel && (
        <text
          x={bx + bw / 2}
          y={by + bh / 2}
          textAnchor="middle"
          dominantBaseline="central"
          fill="#fff"
          fontSize={fontSize}
          fontWeight={700}
          style={{ pointerEvents: 'none', textShadow: '0 1px 2px rgba(0,0,0,.7)' }}
        >
          {ad.label}
        </text>
      )}
      {hasImage && highlighted && (
        <text
          x={bx + bw / 2}
          y={by + bh - 2 / scale}
          textAnchor="middle"
          dominantBaseline="auto"
          fill="#fff"
          fontSize={Math.max(3, Math.min(bw * 0.18, 8))}
          fontWeight={700}
          style={{ pointerEvents: 'none', textShadow: '0 1px 3px rgba(0,0,0,.9)' }}
        >
          {ad.label}
        </text>
      )}
    </g>
  );
});

export default AdRect;
