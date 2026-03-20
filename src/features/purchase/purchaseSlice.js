import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  mode: 'view',
  selA: null,
  selB: null,
  form: { label: '', url: '', color: '#f59e0b', owner: '', image: null },
};

const purchaseSlice = createSlice({
  name: 'purchase',
  initialState,
  reducers: {
    toggleMode(state) {
      state.mode = state.mode === 'buy' ? 'view' : 'buy';
      state.selA = null;
      state.selB = null;
    },
    setSelectionStart(state, action) {
      state.selA = action.payload;
      state.selB = action.payload;
    },
    setSelectionEnd(state, action) {
      state.selB = action.payload;
    },
    clearSelection(state) {
      state.selA = null;
      state.selB = null;
    },
    updateForm(state, action) {
      state.form = { ...state.form, ...action.payload };
    },
    resetForm(state) {
      state.form = { label: '', url: '', color: '#f59e0b', owner: '', image: null };
    },
    resetPurchase(state) {
      state.mode = 'view';
      state.selA = null;
      state.selB = null;
      state.form = { label: '', url: '', color: '#f59e0b', owner: '', image: null };
    },
  },
});

export const {
  toggleMode,
  setSelectionStart,
  setSelectionEnd,
  clearSelection,
  updateForm,
  resetForm,
  resetPurchase,
} = purchaseSlice.actions;
export default purchaseSlice.reducer;
