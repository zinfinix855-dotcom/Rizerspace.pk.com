import { configureStore } from '@reduxjs/toolkit';
import authReducer     from './authSlice';
import cartReducer     from './cartSlice';
import currencyReducer from './currencySlice';
import wishlistReducer from './wishlistSlice';

const store = configureStore({
  reducer: {
    auth:     authReducer,
    cart:     cartReducer,
    currency: currencyReducer,
    wishlist: wishlistReducer,
  },
});

export default store;
