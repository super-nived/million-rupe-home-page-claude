import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  hoveredAd: null,
  selectedAd: null,
};

const adsSlice = createSlice({
  name: 'ads',
  initialState,
  reducers: {
    setHovered(state, action) {
      state.hoveredAd = action.payload;
    },
    setSelected(state, action) {
      state.selectedAd = action.payload;
    },
    clearSelection(state) {
      state.selectedAd = null;
    },
  },
});

export const { setHovered, setSelected, clearSelection } = adsSlice.actions;
export default adsSlice.reducer;
