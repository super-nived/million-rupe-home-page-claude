import { useSelector } from 'react-redux';
import { useGoldenConfig } from '../../features/golden/useGolden';

export default function GoldenPixelGlow({ scale }) {
  const { treasureMode, proximity } = useSelector((s) => s.golden);
  const { data: config } = useGoldenConfig();

  if (!treasureMode || !config?.active || proximity < 0.6) return null;

  const size = config.size || 1;
  const x = config.x * scale;
  const y = config.y * scale;
  const w = size * scale;
  const h = size * scale;
  const glowRadius = Math.max(4, (proximity - 0.6) * 40 * scale);
  const alpha = (proximity - 0.6) * 2.5; // 0 at 0.6, 1 at 1.0

  return (
    <g>
      {/* Outer glow */}
      <rect
        x={x - glowRadius}
        y={y - glowRadius}
        width={w + glowRadius * 2}
        height={h + glowRadius * 2}
        fill="none"
        stroke={`rgba(255,215,0,${alpha * 0.4})`}
        strokeWidth={glowRadius / 2}
        rx={glowRadius / 2}
        style={{ filter: `blur(${glowRadius}px)` }}
      />
      {/* Inner pixel */}
      {proximity > 0.85 && (
        <rect
          x={x}
          y={y}
          width={w}
          height={h}
          fill={`rgba(255,215,0,${alpha * 0.6})`}
          stroke="#ffd700"
          strokeWidth={0.5}
        >
          <animate
            attributeName="opacity"
            values={`${alpha * 0.3};${alpha * 0.8};${alpha * 0.3}`}
            dur="0.8s"
            repeatCount="indefinite"
          />
        </rect>
      )}
    </g>
  );
}
