import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  treasureMode: false,
  proximity: 0, // 0-1 how close to golden pixel
  showClaim: false,
  showWinner: false,
  winnerData: null,
};

const goldenSlice = createSlice({
  name: 'golden',
  initialState,
  reducers: {
    enableTreasure(state) {
      state.treasureMode = true;
    },
    disableTreasure(state) {
      state.treasureMode = false;
      state.proximity = 0;
    },
    toggleTreasure(state) {
      state.treasureMode = !state.treasureMode;
      if (!state.treasureMode) state.proximity = 0;
    },
    setProximity(state, action) {
      state.proximity = action.payload;
    },
    openClaim(state) {
      state.showClaim = true;
    },
    closeClaim(state) {
      state.showClaim = false;
    },
    showWinnerCard(state, action) {
      state.showWinner = true;
      state.winnerData = action.payload;
    },
    hideWinnerCard(state) {
      state.showWinner = false;
      state.winnerData = null;
    },
  },
});

export const {
  enableTreasure,
  disableTreasure,
  toggleTreasure,
  setProximity,
  openClaim,
  closeClaim,
  showWinnerCard,
  hideWinnerCard,
} = goldenSlice.actions;
export default goldenSlice.reducer;
