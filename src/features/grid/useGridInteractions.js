import { useCallback, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setZoom, setPan, startDrag, stopDrag } from './gridSlice';
import { setHovered, setSelected } from '../ads/adsSlice';
import { setSelectionStart, setSelectionEnd } from '../purchase/purchaseSlice';
import { BLOCK, GRID, ZOOM_STEP_WHEEL, CANVAS_PX } from '../../constants/grid';
import { adAtBlock } from '../../utils/gridHelpers';

export function useGridInteractions(svgRef, containerRef, ads) {
  const dispatch = useDispatch();
  const { zoom, pan, dragging, dragStart } = useSelector((s) => s.grid);
  const { mode, selA } = useSelector((s) => s.purchase);

  const movedRef = useRef(false);
  const touchRef = useRef({});
  const isDraggingSelection = useRef(false);

  const isOnGrid = (e) => {
    const svg = svgRef.current;
    return svg && (svg === e.target || svg.contains(e.target));
  };

  const toBlock = useCallback(
    (clientX, clientY, clamp = false) => {
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
    },
    []
  );

  const onWheel = useCallback(
    (e) => {
      e.preventDefault();
      const factor = e.deltaY > 0 ? 1 - ZOOM_STEP_WHEEL : 1 + ZOOM_STEP_WHEEL;
      dispatch(setZoom(zoom * factor));
    },
    [dispatch, zoom]
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [containerRef, onWheel]);

  const onPointerDown = useCallback(
    (e) => {
      movedRef.current = false;
      isDraggingSelection.current = false;

      if (!isOnGrid(e)) return;

      if (mode === 'buy') {
        const b = toBlock(e.clientX, e.clientY);
        if (b) {
          e.currentTarget.setPointerCapture(e.pointerId);
          isDraggingSelection.current = true;
          dispatch(setSelectionStart(b));
        }
      } else {
        e.currentTarget.setPointerCapture(e.pointerId);
        dispatch(startDrag({ x: e.clientX - pan.x, y: e.clientY - pan.y }));
      }
    },
    [dispatch, mode, pan, toBlock]
  );

  const onPointerMove = useCallback(
    (e) => {
      if (mode === 'buy' && isDraggingSelection.current) {
        const b = toBlock(e.clientX, e.clientY, true);
        if (b) dispatch(setSelectionEnd(b));
        movedRef.current = true;
        return;
      }
      if (dragging) {
        dispatch(setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y }));
        movedRef.current = true;
      } else if (mode === 'view') {
        const b = toBlock(e.clientX, e.clientY);
        dispatch(setHovered(b ? adAtBlock(ads, b.bx, b.by) : null));
      }
    },
    [dispatch, mode, dragging, dragStart, ads, toBlock]
  );

  const onPointerUp = useCallback(
    (e) => {
      isDraggingSelection.current = false;
      dispatch(stopDrag());
      if (!movedRef.current && mode === 'view') {
        const b = toBlock(e.clientX, e.clientY);
        dispatch(setSelected(b ? adAtBlock(ads, b.bx, b.by) : null));
      }
    },
    [dispatch, mode, ads, toBlock]
  );

  const onPointerLeave = useCallback(() => {
    dispatch(stopDrag());
    dispatch(setHovered(null));
  }, [dispatch]);

  const onTouchStart = useCallback(
    (e) => {
      if (!isOnGrid(e)) return;

      isDraggingSelection.current = false;
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        touchRef.current.dist = Math.sqrt(dx * dx + dy * dy);
      } else if (e.touches.length === 1) {
        touchRef.current.last = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        movedRef.current = false;
        if (mode === 'buy') {
          const b = toBlock(e.touches[0].clientX, e.touches[0].clientY);
          if (b) {
            isDraggingSelection.current = true;
            dispatch(setSelectionStart(b));
          }
        }
      }
    },
    [dispatch, mode, toBlock]
  );

  const onTouchMove = useCallback(
    (e) => {
      e.preventDefault();
      movedRef.current = true;
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (touchRef.current.dist) {
          dispatch(setZoom(zoom * (d / touchRef.current.dist)));
        }
        touchRef.current.dist = d;
      } else if (e.touches.length === 1 && touchRef.current.last) {
        if (mode === 'buy' && isDraggingSelection.current) {
          const b = toBlock(e.touches[0].clientX, e.touches[0].clientY, true);
          if (b) dispatch(setSelectionEnd(b));
        } else {
          const dx = e.touches[0].clientX - touchRef.current.last.x;
          const dy = e.touches[0].clientY - touchRef.current.last.y;
          dispatch(setPan({ x: pan.x + dx, y: pan.y + dy }));
          touchRef.current.last = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        }
      }
    },
    [dispatch, mode, zoom, pan, toBlock]
  );

  const onTouchEnd = useCallback(
    (e) => {
      touchRef.current = {};
      if (!movedRef.current && e.changedTouches.length === 1 && mode === 'view') {
        const b = toBlock(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
        dispatch(setSelected(b ? adAtBlock(ads, b.bx, b.by) : null));
      }
    },
    [dispatch, mode, ads, toBlock]
  );

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
