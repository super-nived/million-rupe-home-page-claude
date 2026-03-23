import { useDispatch, useSelector } from 'react-redux';
import { setZoom, setPan, resetView } from '../features/grid/gridSlice';
import { toggleMode } from '../features/purchase/purchaseSlice';
import { clearSelection as clearAdSelection } from '../features/ads/adsSlice';
import { openAbout } from '../features/lottery/lotterySlice';
import { toggleTreasure } from '../features/golden/goldenSlice';
import { useGoldenConfig } from '../features/golden/useGolden';
import { ZOOM_STEP_BUTTON, CANVAS_PX } from '../constants/grid';
import { colors, btnStyle } from '../styles/theme';
import { useAdsQuery } from '../features/ads/useAds';
import { useSiteConfig } from '../features/lottery/useLottery';
import { soldPixels } from '../utils/formatters';
import Button from './Button';
import { playDice, playClick, playZoomIn, playZoomOut, playReset, playTreasureToggle } from '../utils/sounds';

const TOTAL = CANVAS_PX * CANVAS_PX;

export default function Header() {
  const dispatch = useDispatch();
  const zoom = useSelector((s) => s.grid.zoom);
  const mode = useSelector((s) => s.purchase.mode);
  const treasureMode = useSelector((s) => s.golden.treasureMode);
  const { data: ads = [] } = useAdsQuery();
  const { data: config } = useSiteConfig();
  const { data: goldenConfig } = useGoldenConfig();

  const sold = soldPixels(ads);
  const remaining = TOTAL - sold;
  const pct = Math.min(100, (sold / TOTAL) * 100);
  const urgencyColor = pct >= 90 ? '#ef4444' : pct >= 70 ? '#f59e0b' : colors.success;
  const highlight = config?.highlight || '100% to the community';

  const handleToggleMode = () => {
    playClick();
    dispatch(toggleMode());
    dispatch(clearAdSelection());
  };

  const handleTreasureToggle = () => {
    const newState = !treasureMode;
    playTreasureToggle(newState);
    dispatch(toggleTreasure());
  };

  const goldenActive = goldenConfig?.active && !goldenConfig?.winner;
  const hasWinner = goldenConfig?.winner;

  const handleDiscover = () => {
    if (!ads.length) return;
    playDice();
    const ad = ads[Math.floor(Math.random() * ads.length)];
    const cx = ad.bx + ad.bw / 2;
    const cy = ad.by + ad.bh / 2;
    dispatch(setZoom(8));
    const baseScale = Math.min(window.innerWidth, window.innerHeight) / CANVAS_PX;
    dispatch(setPan({
      x: -(cx - CANVAS_PX / 2) * 8 * baseScale,
      y: -(cy - CANVAS_PX / 2) * 8 * baseScale,
    }));
  };

  return (
    <header style={{ flexShrink: 0, zIndex: 100, background: colors.bgPanel }}>
      {/* Row 1: Banner — compact mission line + progress */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '3px 12px',
          borderBottom: `1px solid ${colors.border}`,
          gap: 8,
          minHeight: 22,
        }}
      >
        {/* Left: Mission tagline */}
        <span
          onClick={() => dispatch(openAbout())}
          style={{
            fontSize: 10,
            color: colors.textDimmer,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            minWidth: 0,
          }}
        >
          <span style={{ color: colors.accent, fontWeight: 700 }}>{highlight}</span>
          <span style={{ opacity: 0.6 }}> — learn more →</span>
        </span>

        {/* Right: Progress bar + remaining */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          <div
            style={{
              width: 60,
              height: 4,
              background: colors.border,
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${pct}%`,
                height: '100%',
                background: urgencyColor,
                borderRadius: 2,
                transition: 'width .6s ease, background .4s ease',
              }}
            />
          </div>
          <span style={{ fontSize: 9, color: urgencyColor, fontWeight: 700, whiteSpace: 'nowrap' }}>
            {remaining.toLocaleString('en-IN')} left
          </span>
        </div>
      </div>

      {/* Row 2: Main nav — brand + controls */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '5px 12px',
          borderBottom: `1px solid ${colors.border}`,
          gap: 6,
        }}
      >
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <span style={{ fontSize: 18, fontWeight: 800, color: colors.accent, lineHeight: 1 }}>₹</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '-0.3px', lineHeight: 1 }}>
              PixelLakh
            </div>
            <div style={{ fontSize: 9, color: colors.textDimmer, letterSpacing: '0.3px' }}>
              1M PIXELS · ₹1 EACH
            </div>
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {goldenActive && (
            <button
              onClick={handleTreasureToggle}
              style={{
                ...btnStyle,
                padding: '4px 10px',
                fontSize: 11,
                background: treasureMode ? 'linear-gradient(90deg, #ffd700, #f59e0b)' : 'transparent',
                color: treasureMode ? '#000' : '#ffd700',
                border: `1px solid ${treasureMode ? '#ffd700' : '#ffd70044'}`,
                fontWeight: 700,
                animation: treasureMode ? 'none' : 'goldenPulse 2s ease-in-out infinite',
              }}
            >
              {treasureMode ? '🔍 Hunting...' : '💎 Treasure'}
            </button>
          )}
          {hasWinner && (
            <span style={{
              fontSize: 10,
              color: '#ffd700',
              fontWeight: 600,
              padding: '3px 8px',
              background: '#ffd70010',
              borderRadius: 6,
              border: '1px solid #ffd70022',
            }}>
              🏆 @{goldenConfig.winner.instagram}
            </span>
          )}
          <Button onClick={handleDiscover} title="Discover a random ad">🎲</Button>
          <Button onClick={() => { playReset(); dispatch(resetView()); }}>⟲</Button>
          <Button onClick={() => { playZoomIn(); dispatch(setZoom(zoom * ZOOM_STEP_BUTTON)); }}>+</Button>
          <Button onClick={() => { playZoomOut(); dispatch(setZoom(zoom / ZOOM_STEP_BUTTON)); }}>−</Button>
          <span style={{ fontSize: 9, color: colors.textDimmer, minWidth: 28, textAlign: 'center' }}>
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={handleToggleMode}
            style={{
              ...btnStyle,
              padding: '4px 10px',
              fontSize: 11,
              background: mode === 'buy' ? colors.accent : 'transparent',
              color: mode === 'buy' ? colors.bg : colors.accent,
              border: `1px solid ${mode === 'buy' ? colors.accent : '#f59e0b55'}`,
              fontWeight: 700,
            }}
          >
            {mode === 'buy' ? '✕ Cancel' : 'Buy Pixels'}
          </button>
        </div>
      </div>
    </header>
  );
}
