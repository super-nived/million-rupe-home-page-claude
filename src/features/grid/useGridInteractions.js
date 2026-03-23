import { useCallback, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setZoom, setPan, startDrag, stopDrag } from './gridSlice';
import { setHovered, setSelected } from '../ads/adsSlice';
import { setSelectionStart, setSelectionEnd } from '../purchase/purchaseSlice';
import { setProximity, openClaim } from '../golden/goldenSlice';
import { BLOCK, GRID, ZOOM_STEP_WHEEL, CANVAS_PX, MIN_ZOOM, MAX_ZOOM } from '../../constants/grid';
import { adAtBlock } from '../../utils/gridHelpers';
import { playTap, startHeartbeat, stopHeartbeat } from '../../utils/sounds';

export function useGridInteractions(svgRef, containerRef, ads, goldenConfig) {
  const dispatch = useDispatch();
  const stateRef = useRef({ zoom: 1, pan: { x: 0, y: 0 } });
  const modeRef = useRef('view');
  const adsRef = useRef(ads);
  const draggingRef = useRef(false);
  const dragOriginRef = useRef({ x: 0, y: 0 });
  const movedRef = useRef(false);
  const isDraggingSelection = useRef(false);
  const touchRef = useRef({});
  const rafRef = useRef(null);
  const canvasWrapRef = useRef(null);
  const treasureRef = useRef(false);
  const goldenRef = useRef(null);
  const lastProximityRef = useRef(0);

  // Keep refs in sync with Redux (read-only during interactions)
  const { zoom, pan } = useSelector((s) => s.grid);
  const mode = useSelector((s) => s.purchase.mode);
  const treasureMode = useSelector((s) => s.golden.treasureMode);

  useEffect(() => { stateRef.current.zoom = zoom; }, [zoom]);
  useEffect(() => { stateRef.current.pan = { ...pan }; }, [pan]);
  useEffect(() => { modeRef.current = mode; }, [mode]);
  useEffect(() => { adsRef.current = ads; }, [ads]);
  useEffect(() => { treasureRef.current = treasureMode; }, [treasureMode]);
  useEffect(() => { goldenRef.current = goldenConfig; }, [goldenConfig]);

  // Stop heartbeat when treasure mode is disabled
  useEffect(() => {
    if (!treasureMode) {
      stopHeartbeat();
      lastProximityRef.current = 0;
    }
  }, [treasureMode]);

  // Cache the canvas wrapper element (the div with willChange: transform)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    // The canvas wrapper is the first absolute child
    const wrapper = container.querySelector('[data-canvas-wrap]');
    canvasWrapRef.current = wrapper;
  });

  const applyTransform = () => {
    const el = canvasWrapRef.current;
    if (!el) return;
    const { x, y } = stateRef.current.pan;
    el.style.transform = `translate(-50%,-50%) translate(${x}px,${y}px)`;
  };

  const isOnGrid = (e) => {
    const svg = svgRef.current;
    return svg && (svg === e.target || svg.contains(e.target));
  };

  const toBlock = (clientX, clientY, clamp = false) => {
    const r = svgRef.current?.getBoundingClientRect();
    if (!r) return null;
    const scaleX = CANVAS_PX / r.width;
    const scaleY = CANVAS_PX / r.height;
    const x = (clientX - r.left) * scaleX;
    const y = (clientY - r.top) * scaleY;
    let bx = Math.floor(x / BLOCK);
    let by = Math.floor(y / BLOCK);
    if (clamp) {
      bx = Math.max(0, Math.min(bx, GRID - 1));
      by = Math.max(0, Math.min(by, GRID - 1));
    } else if (bx < 0 || bx >= GRID || by < 0 || by >= GRID) {
      return null;
    }
    return { bx, by };
  };

  // --- Wheel zoom (direct DOM, RAF batched) ---
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e) => {
      e.preventDefault();
      const factor = e.deltaY > 0 ? 1 - ZOOM_STEP_WHEEL : 1 + ZOOM_STEP_WHEEL;
      const newZoom = Math.min(Math.max(stateRef.current.zoom * factor, MIN_ZOOM), MAX_ZOOM);
      stateRef.current.zoom = newZoom;
      dispatch(setZoom(newZoom));
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [containerRef, dispatch]);

  // --- Pointer events (pan = direct DOM, no Redux during drag) ---
  const onPointerDown = useCallback((e) => {
    movedRef.current = false;
    isDraggingSelection.current = false;

    if (!isOnGrid(e)) return;

    if (modeRef.current === 'buy') {
      const b = toBlock(e.clientX, e.clientY);
      if (b) {
        e.currentTarget.setPointerCapture(e.pointerId);
        isDraggingSelection.current = true;
        dispatch(setSelectionStart(b));
      }
    } else {
      e.currentTarget.setPointerCapture(e.pointerId);
      draggingRef.current = true;
      dragOriginRef.current = {
        x: e.clientX - stateRef.current.pan.x,
        y: e.clientY - stateRef.current.pan.y,
      };
      dispatch(startDrag({ x: dragOriginRef.current.x, y: dragOriginRef.current.y }));
    }
  }, [dispatch]);

  const onPointerMove = useCallback((e) => {
    if (modeRef.current === 'buy' && isDraggingSelection.current) {
      const b = toBlock(e.clientX, e.clientY, true);
      if (b) dispatch(setSelectionEnd(b));
      movedRef.current = true;
      return;
    }

    if (draggingRef.current) {
      movedRef.current = true;
      const nx = e.clientX - dragOriginRef.current.x;
      const ny = e.clientY - dragOriginRef.current.y;
      stateRef.current.pan = { x: nx, y: ny };

      // Direct DOM update — no React re-render
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(applyTransform);
    } else if (modeRef.current === 'view') {
      const b = toBlock(e.clientX, e.clientY);
      // Proximity check in treasure mode
      if (treasureRef.current && goldenRef.current?.active && b) {
        const gc = goldenRef.current;
        const gSize = gc.size || 1;
        const dx = Math.abs(b.bx - (gc.x + gSize / 2));
        const dy = Math.abs(b.by - (gc.y + gSize / 2));
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = 80;
        const prox = Math.max(0, Math.min(1, 1 - dist / maxDist));
        if (Math.abs(prox - lastProximityRef.current) > 0.02) {
          lastProximityRef.current = prox;
          dispatch(setProximity(prox));
          if (prox > 0.1) startHeartbeat(prox);
          else stopHeartbeat();
        }
      }
      if (!treasureRef.current) {
        dispatch(setHovered(b ? adAtBlock(adsRef.current, b.bx, b.by) : null));
      }
    }
  }, [dispatch]);

  const onPointerUp = useCallback((e) => {
    if (draggingRef.current) {
      draggingRef.current = false;
      // Sync final position to Redux (single dispatch)
      dispatch(setPan({ ...stateRef.current.pan }));
      dispatch(stopDrag());
    }

    isDraggingSelection.current = false;

    if (!movedRef.current && modeRef.current === 'view') {
      const b = toBlock(e.clientX, e.clientY);
      // Treasure mode: check if golden pixel was tapped
      if (treasureRef.current && goldenRef.current?.active && b) {
        const gc = goldenRef.current;
        const gSize = gc.size || 1;
        if (b.bx >= gc.x && b.bx < gc.x + gSize && b.by >= gc.y && b.by < gc.y + gSize) {
          stopHeartbeat();
          dispatch(openClaim());
          return;
        }
        // In treasure mode, don't open ad panels
        playTap();
        return;
      }
      const ad = b ? adAtBlock(adsRef.current, b.bx, b.by) : null;
      if (ad) playTap();
      dispatch(setSelected(ad));
    }
  }, [dispatch]);

  const onPointerLeave = useCallback(() => {
    if (draggingRef.current) {
      draggingRef.current = false;
      dispatch(setPan({ ...stateRef.current.pan }));
      dispatch(stopDrag());
    }
    dispatch(setHovered(null));
  }, [dispatch]);

  // --- Touch events (same direct DOM approach) ---
  const onTouchStart = useCallback((e) => {
    if (!isOnGrid(e)) return;
    isDraggingSelection.current = false;

    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      touchRef.current.dist = Math.sqrt(dx * dx + dy * dy);
      touchRef.current.baseZoom = stateRef.current.zoom;
    } else if (e.touches.length === 1) {
      touchRef.current.last = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      movedRef.current = false;
      if (modeRef.current === 'buy') {
        const b = toBlock(e.touches[0].clientX, e.touches[0].clientY);
        if (b) {
          isDraggingSelection.current = true;
          dispatch(setSelectionStart(b));
        }
      }
    }
  }, [dispatch]);

  const onTouchMove = useCallback((e) => {
    e.preventDefault();
    movedRef.current = true;

    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (touchRef.current.dist && touchRef.current.baseZoom) {
        const newZoom = Math.min(Math.max(
          touchRef.current.baseZoom * (d / touchRef.current.dist),
          MIN_ZOOM
        ), MAX_ZOOM);
        stateRef.current.zoom = newZoom;
        dispatch(setZoom(newZoom));
      }
      touchRef.current.dist = d;
    } else if (e.touches.length === 1 && touchRef.current.last) {
      if (modeRef.current === 'buy' && isDraggingSelection.current) {
        const b = toBlock(e.touches[0].clientX, e.touches[0].clientY, true);
        if (b) dispatch(setSelectionEnd(b));
      } else {
        const dx = e.touches[0].clientX - touchRef.current.last.x;
        const dy = e.touches[0].clientY - touchRef.current.last.y;
        stateRef.current.pan = {
          x: stateRef.current.pan.x + dx,
          y: stateRef.current.pan.y + dy,
        };
        touchRef.current.last = { x: e.touches[0].clientX, y: e.touches[0].clientY };

        // Direct DOM update
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(applyTransform);
      }
    }
  }, [dispatch]);

  const onTouchEnd = useCallback((e) => {
    // Sync pan to Redux
    dispatch(setPan({ ...stateRef.current.pan }));
    touchRef.current = {};

    if (!movedRef.current && e.changedTouches.length === 1 && modeRef.current === 'view') {
      const b = toBlock(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
      // Treasure mode: check golden pixel
      if (treasureRef.current && goldenRef.current?.active && b) {
        const gc = goldenRef.current;
        const gSize = gc.size || 1;
        if (b.bx >= gc.x && b.bx < gc.x + gSize && b.by >= gc.y && b.by < gc.y + gSize) {
          stopHeartbeat();
          dispatch(openClaim());
          return;
        }
        playTap();
        return;
      }
      const ad = b ? adAtBlock(adsRef.current, b.bx, b.by) : null;
      if (ad) playTap();
      dispatch(setSelected(ad));
    }
  }, [dispatch]);

  return {
    pointerHandlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerLeave,
    },
    touchHandlers: {
      onTouchStart,
      onTouchMove,
      onTouchEnd,
    },
  };
}
