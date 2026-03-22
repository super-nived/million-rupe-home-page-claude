import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  showTicket: false,
  ticketData: null,
  showConfetti: false,
  showMyTickets: false,
  showAbout: false,
};

const lotterySlice = createSlice({
  name: 'lottery',
  initialState,
  reducers: {
    triggerConfetti(state) {
      state.showConfetti = true;
    },
    clearConfetti(state) {
      state.showConfetti = false;
    },
    showTicketModal(state, action) {
      state.showTicket = true;
      state.ticketData = action.payload;
    },
    hideTicketModal(state) {
      state.showTicket = false;
      state.ticketData = null;
    },
    toggleMyTickets(state) {
      state.showMyTickets = !state.showMyTickets;
    },
    closeMyTickets(state) {
      state.showMyTickets = false;
    },
    openAbout(state) {
      state.showAbout = true;
    },
    closeAbout(state) {
      state.showAbout = false;
    },
  },
});

export const {
  triggerConfetti,
  clearConfetti,
  showTicketModal,
  hideTicketModal,
  toggleMyTickets,
  closeMyTickets,
  openAbout,
  closeAbout,
} = lotterySlice.actions;
export default lotterySlice.reducer;
