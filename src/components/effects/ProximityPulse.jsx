import { useSelector } from 'react-redux';

export default function ProximityPulse() {
  const { treasureMode, proximity } = useSelector((s) => s.golden);

  if (!treasureMode || proximity <= 0) return null;

  const intensity = proximity; // 0-1
  const glowSize = 40 + intensity * 160; // px
  const alpha = 0.05 + intensity * 0.35;
  const borderAlpha = intensity * 0.6;
  const pulseSpeed = Math.max(0.3, 1.5 - intensity * 1.2); // faster when close

  return (
    <>
      {/* Screen edge golden glow */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 60,
          boxShadow: `inset 0 0 ${glowSize}px rgba(255,215,0,${alpha})`,
          transition: 'box-shadow .3s ease',
        }}
      />
      {/* Pulsing border */}
      {intensity > 0.3 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 60,
            border: `2px solid rgba(255,215,0,${borderAlpha})`,
            borderRadius: 0,
            animation: `proximityPulse ${pulseSpeed}s ease-in-out infinite`,
          }}
        />
      )}
      {/* Center indicator when very close */}
      {intensity > 0.7 && (
        <div
          style={{
            position: 'absolute',
            top: 8,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 61,
            padding: '4px 12px',
            borderRadius: 20,
            background: 'rgba(255,215,0,0.15)',
            border: '1px solid rgba(255,215,0,0.3)',
            fontSize: 10,
            fontWeight: 700,
            color: '#ffd700',
            animation: `proximityPulse ${pulseSpeed}s ease-in-out infinite`,
            pointerEvents: 'none',
          }}
        >
          {intensity > 0.9 ? '🔥 VERY HOT!' : '✨ Getting warmer...'}
        </div>
      )}
    </>
  );
}
