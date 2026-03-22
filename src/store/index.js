import { configureStore } from '@reduxjs/toolkit';
import gridReducer from '../features/grid/gridSlice';
import adsReducer from '../features/ads/adsSlice';
import purchaseReducer from '../features/purchase/purchaseSlice';
import lotteryReducer from '../features/lottery/lotterySlice';

export const store = configureStore({
  reducer: {
    grid: gridReducer,
    ads: adsReducer,
    purchase: purchaseReducer,
    lottery: lotteryReducer,
  },
});
