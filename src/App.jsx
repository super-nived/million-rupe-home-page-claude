import { useRef, useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { CANVAS_PX } from './constants/grid';
import { colors, fonts } from './styles/theme';
import { useAdsQuery } from './features/ads/useAds';
import { useGridInteractions } from './features/grid/useGridInteractions';
import { usePurchase } from './features/purchase/usePurchase';
import { useContainerSize } from './hooks/useContainerSize';
import { useToast } from './hooks/useToast';
import { useGoldenConfig } from './features/golden/useGolden';
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
import ProximityPulse from './components/effects/ProximityPulse';
import TicketCardModal from './components/modals/TicketCardModal';
import AboutModal from './components/modals/AboutModal';
import GoldenPixelModal from './components/modals/GoldenPixelModal';
import WinnerCardModal from './components/modals/WinnerCardModal';
import Admin from './components/Admin';

function useRoute() {
  const [hash, setHash] = useState(window.location.hash);
  useEffect(() => {
    const handler = () => setHash(window.location.hash);
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }, []);
  return hash;
}

export default function App() {
  const route = useRoute();

  // Admin route
  if (route === '#admin' || route === '#/admin') {
    return <Admin />;
  }

  return <MainApp />;
}

function MainApp() {
  const dispatch = useDispatch();
  const containerRef = useRef(null);
  const svgRef = useRef(null);

  const { zoom, pan } = useSelector((s) => s.grid);
  const { hoveredAd, selectedAd } = useSelector((s) => s.ads);
  const mode = useSelector((s) => s.purchase.mode);
  const treasureMode = useSelector((s) => s.golden.treasureMode);

  const { data: ads = [], isLoading, isError, error } = useAdsQuery();
  const { data: goldenConfig } = useGoldenConfig();
  const { toast, notify } = useToast();
  const containerSize = useContainerSize(containerRef);

  const { pointerHandlers, touchHandlers } = useGridInteractions(svgRef, containerRef, ads, goldenConfig);
  const { selection, purchase, clearArea, setFormField, form, setImage, isPurchasing, purchaseStage } = usePurchase(ads, notify);

  const baseScale = Math.min(containerSize.w / CANVAS_PX, containerSize.h / CANVAS_PX);
  const scale = baseScale * zoom;
  const canvasW = CANVAS_PX * scale;
  const canvasH = CANVAS_PX * scale;

  const cursor = mode === 'buy' ? 'crosshair' : treasureMode ? 'crosshair' : 'grab';

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
          data-canvas-wrap
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

        {hoveredAd && mode === 'view' && !treasureMode && <HoverTooltip ad={hoveredAd} />}

        {/* Proximity pulse overlay in treasure mode */}
        <ProximityPulse />

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

      {selectedAd && mode === 'view' && !treasureMode && (
        <AdDetailPanel
          ad={selectedAd}
          onClose={() => dispatch(clearSelection())}
        />
      )}

      <Toast toast={toast} />
      <Confetti />
      <TicketCardModal />
      <AboutModal />
      <GoldenPixelModal />
      <WinnerCardModal />

      <style>{`
        @keyframes slideDown{from{opacity:0;transform:translateX(-50%) translateY(-8px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes crateAppear{from{transform:scale(0) rotate(-20deg);opacity:0}to{transform:scale(1) rotate(0);opacity:1}}
        @keyframes crateShake{0%,100%{transform:translate(0,0) rotate(0)}10%{transform:translate(-4px,-2px) rotate(-2deg)}20%{transform:translate(4px,2px) rotate(2deg)}30%{transform:translate(-5px,-3px) rotate(-3deg)}40%{transform:translate(5px,1px) rotate(2deg)}50%{transform:translate(-6px,-4px) rotate(-3deg)}60%{transform:translate(6px,3px) rotate(3deg)}70%{transform:translate(-7px,-2px) rotate(-4deg)}80%{transform:translate(7px,4px) rotate(4deg)}90%{transform:translate(-4px,-1px) rotate(-2deg)}}
        @keyframes crateBurst{0%{transform:scale(1);opacity:1}100%{transform:scale(2.5);opacity:0}}
        @keyframes cardReveal{from{transform:scale(0.3);opacity:0}to{transform:scale(1);opacity:1}}
        @keyframes raysPulse{from{transform:scale(0.5);opacity:1}to{transform:scale(2);opacity:0}}
        @keyframes ticketSlideUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
        @keyframes tickerScroll{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
        @keyframes goldenShake{0%,100%{transform:translate(0,0) rotate(0)}10%{transform:translate(-5px,-3px) rotate(-3deg)}20%{transform:translate(5px,3px) rotate(3deg)}30%{transform:translate(-6px,-4px) rotate(-4deg)}40%{transform:translate(6px,2px) rotate(3deg)}50%{transform:translate(-7px,-5px) rotate(-4deg)}60%{transform:translate(7px,4px) rotate(4deg)}70%{transform:translate(-8px,-3px) rotate(-5deg)}80%{transform:translate(8px,5px) rotate(5deg)}90%{transform:translate(-5px,-2px) rotate(-3deg)}}
        @keyframes goldenPulse{0%,100%{opacity:0.6;box-shadow:0 0 4px #ffd70033}50%{opacity:1;box-shadow:0 0 12px #ffd70066}}
        @keyframes proximityPulse{0%,100%{opacity:0.5}50%{opacity:1}}
        *{box-sizing:border-box;margin:0}
        [data-canvas-wrap]{transform-origin:center center}
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:#2a2a3a;border-radius:2px}
      `}</style>
    </div>
  );
}
