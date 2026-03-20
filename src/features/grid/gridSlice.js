import { createSlice } from '@reduxjs/toolkit';
import { MIN_ZOOM, MAX_ZOOM } from '../../constants/grid';

const initialState = {
  zoom: 1,
  pan: { x: 0, y: 0 },
  dragging: false,
  dragStart: { x: 0, y: 0 },
};

const gridSlice = createSlice({
  name: 'grid',
  initialState,
  reducers: {
    setZoom(state, action) {
      state.zoom = Math.min(Math.max(action.payload, MIN_ZOOM), MAX_ZOOM);
    },
    resetView(state) {
      state.zoom = 1;
      state.pan = { x: 0, y: 0 };
    },
    setPan(state, action) {
      state.pan = action.payload;
    },
    startDrag(state, action) {
      state.dragging = true;
      state.dragStart = action.payload;
    },
    stopDrag(state) {
      state.dragging = false;
    },
  },
});

export const { setZoom, resetView, setPan, startDrag, stopDrag } = gridSlice.actions;
export default gridSlice.reducer;
