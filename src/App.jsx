import { useRef, useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { CANVAS_PX } from './constants/grid';
import { colors, fonts } from './styles/theme';
import { useAdsQuery } from './features/ads/useAds';
import { useGridInteractions } from './features/grid/useGridInteractions';
import { usePurchase } from './features/purchase/usePurchase';
import { useContainerSize } from './hooks/useContainerSize';
import { useToast } from './hooks/useToast';
import { clearSelection } from './features/ads/adsSlice';
import Header from './components/Header';
import Footer from './components/Footer';
import Toast from './components/Toast';
import GridCanvas from './components/canvas/GridCanvas';
import HoverTooltip from './components/panels/HoverTooltip';
import AdDetailPanel from './components/panels/AdDetailPanel';
import PurchasePanel from './components/panels/PurchasePanel';
import PurchaseBadge from './components/PurchaseBadge';
import Confetti from './components/effects/Confetti';
import TicketCardModal from './components/modals/TicketCardModal';
import AboutModal from './components/modals/AboutModal';

export default function App() {
  const dispatch = useDispatch();
  const containerRef = useRef(null);
  const svgRef = useRef(null);

  const { zoom, pan, dragging } = useSelector((s) => s.grid);
  const { hoveredAd, selectedAd } = useSelector((s) => s.ads);
  const mode = useSelector((s) => s.purchase.mode);

  const { data: ads = [], isLoading, isError, error } = useAdsQuery();
  const { toast, notify } = useToast();
  const containerSize = useContainerSize(containerRef);

  const { pointerHandlers, touchHandlers } = useGridInteractions(svgRef, containerRef, ads);
  const { selection, purchase, clearArea, setFormField, form, setImage, isPurchasing, purchaseStage } = usePurchase(ads, notify);

  const baseScale = Math.min(containerSize.w / CANVAS_PX, containerSize.h / CANVAS_PX);
  const scale = baseScale * zoom;
  const canvasW = CANVAS_PX * scale;
  const canvasH = CANVAS_PX * scale;

  const cursor = useMemo(() => {
    if (mode === 'buy') return 'crosshair';
    if (dragging) return 'grabbing';
    return 'grab';
  }, [mode, dragging]);

  return (
    <div
      style={{
        width: '100%',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: colors.bg,
        fontFamily: fonts.base,
        color: colors.text,
        overflow: 'hidden',
        position: 'relative',
        userSelect: 'none',
      }}
    >
      <Header />

      <div
        ref={containerRef}
        style={{
          flex: 1,
          position: 'relative',
          overflow: 'hidden',
          cursor,
          background: colors.bg,
          touchAction: 'none',
        }}
        {...pointerHandlers}
        {...touchHandlers}
      >
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: `translate(-50%,-50%) translate(${pan.x}px,${pan.y}px)`,
            willChange: 'transform',
          }}
        >
          <GridCanvas
            ref={svgRef}
            ads={ads}
            scale={scale}
            canvasW={canvasW}
            canvasH={canvasH}
            hoveredAd={hoveredAd}
            selectedAd={selectedAd}
            mode={mode}
            selection={selection}
          />
        </div>

        {isLoading && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.5)', zIndex: 50,
          }}>
            <div style={{ color: '#fff', textAlign: 'center' }}>
              <div style={{
                width: 32, height: 32, margin: '0 auto 12px',
                border: '3px solid rgba(255,255,255,0.15)',
                borderTopColor: colors.accent,
                borderRadius: '50%',
                animation: 'toastSpin .7s linear infinite',
              }} />
              <div style={{ fontSize: 14, fontWeight: 600 }}>Loading ads...</div>
              <div style={{ fontSize: 11, opacity: 0.5, marginTop: 4 }}>Connecting to Firebase</div>
            </div>
          </div>
        )}

        {isError && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.5)', zIndex: 50,
          }}>
            <div style={{
              background: '#1a1a2e', border: '1px solid #e74c3c', borderRadius: 8,
              padding: 24, maxWidth: 400, textAlign: 'center',
            }}>
              <div style={{ color: '#e74c3c', fontSize: 18, marginBottom: 8 }}>Failed to load ads</div>
              <div style={{ color: '#aaa', fontSize: 13, marginBottom: 12 }}>
                {error?.message || 'Unknown error'}
              </div>
              <div style={{ color: '#888', fontSize: 12 }}>
                Check that Firestore rules are deployed and the index for "createdAt" exists.
              </div>
            </div>
          </div>
        )}

        {hoveredAd && mode === 'view' && <HoverTooltip ad={hoveredAd} />}

        {selectedAd && mode === 'view' && (
          <AdDetailPanel
            ad={selectedAd}
            onClose={() => dispatch(clearSelection())}
          />
        )}

        {mode === 'buy' && (
          <PurchasePanel
            selection={selection}
            form={form}
            onFormChange={setFormField}
            onClear={clearArea}
            onPurchase={purchase}
            onImageUpload={setImage}
            isPurchasing={isPurchasing}
            purchaseStage={purchaseStage}
          />
        )}

        {mode === 'buy' && <PurchaseBadge />}
      </div>

      <Footer ads={ads} />

      <Toast toast={toast} />
      <Confetti />
      <TicketCardModal />
      <AboutModal />

      <style>{`
        @keyframes slideDown{from{opacity:0;transform:translateX(-50%) translateY(-8px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes ticketSlideUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
        @keyframes tickerScroll{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
        *{box-sizing:border-box;margin:0}
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:#2a2a3a;border-radius:2px}
      `}</style>
    </div>
  );
}
