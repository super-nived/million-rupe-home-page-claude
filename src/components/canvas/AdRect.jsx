import { memo } from 'react';

const AdRect = memo(function AdRect({ ad, scale, isHovered, isSelected }) {
  const { bx, by, bw, bh } = ad;
  const clipId = `clip-${ad.id}`;
  const highlighted = isHovered || isSelected;
  const hasImage = !!ad.imageUrl;

  return (
    <g>
      <defs>
        <clipPath id={clipId}>
          <rect x={bx} y={by} width={bw} height={bh} rx={0.8} />
        </clipPath>
      </defs>
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
          href={ad.imageUrl}
          x={bx}
          y={by}
          width={bw}
          height={bh}
          preserveAspectRatio="xMidYMid slice"
          clipPath={`url(#${clipId})`}
          style={{ pointerEvents: 'none' }}
        />
      )}
    </g>
  );
});

export default AdRect;
