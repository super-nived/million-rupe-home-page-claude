import { useDispatch, useSelector } from 'react-redux';
import { setZoom, resetView } from '../features/grid/gridSlice';
import { toggleMode } from '../features/purchase/purchaseSlice';
import { clearSelection as clearAdSelection } from '../features/ads/adsSlice';
import { ZOOM_STEP_BUTTON } from '../constants/grid';
import { colors, btnStyle } from '../styles/theme';
import Button from './Button';

export default function Header() {
  const dispatch = useDispatch();
  const zoom = useSelector((s) => s.grid.zoom);
  const mode = useSelector((s) => s.purchase.mode);

  const handleToggleMode = () => {
    dispatch(toggleMode());
    dispatch(clearAdSelection());
  };

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '7px 12px',
        background: colors.bgPanel,
        borderBottom: `1px solid ${colors.border}`,
        flexShrink: 0,
        zIndex: 100,
        flexWrap: 'wrap',
        gap: 6,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 20, fontWeight: 800, color: colors.accent }}>₹</span>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.3px', lineHeight: 1.1 }}>
            10 Lakh Homepage
          </div>
          <div style={{ fontSize: 10, color: colors.textDim, letterSpacing: '0.3px' }}>
            1,000,000 PIXELS · ₹1 EACH
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        <Button onClick={() => dispatch(resetView())}>⟲</Button>
        <Button onClick={() => dispatch(setZoom(zoom * ZOOM_STEP_BUTTON))}>+</Button>
        <Button onClick={() => dispatch(setZoom(zoom / ZOOM_STEP_BUTTON))}>−</Button>
        <span style={{ fontSize: 10, color: colors.textDim, minWidth: 32, textAlign: 'center' }}>
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={handleToggleMode}
          style={{
            ...btnStyle,
            background: mode === 'buy' ? colors.accent : 'transparent',
            color: mode === 'buy' ? colors.bg : colors.accent,
            border: `1px solid ${mode === 'buy' ? colors.accent : '#f59e0b55'}`,
            fontWeight: 700,
          }}
        >
          {mode === 'buy' ? '✕ Cancel' : 'Buy Pixels'}
        </button>
      </div>
    </header>
  );
}
