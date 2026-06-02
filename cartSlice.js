import { createSlice } from '@reduxjs/toolkit';

const saved = localStorage.getItem('rizerCart');
const initial = saved ? JSON.parse(saved) : [];

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: initial },
  reducers: {
    addToCart: (s, a) => {
      const ex = s.items.find(i => i._id === a.payload._id);
      if (ex) { ex.qty = Math.min(ex.qty + 1, a.payload.stock); }
      else     { s.items.push({ ...a.payload, qty: 1 }); }
      localStorage.setItem('rizerCart', JSON.stringify(s.items));
    },
    removeFromCart: (s, a) => {
      s.items = s.items.filter(i => i._id !== a.payload);
      localStorage.setItem('rizerCart', JSON.stringify(s.items));
    },
    updateQty: (s, a) => {
      const item = s.items.find(i => i._id === a.payload.id);
      if (item) item.qty = Math.max(1, Math.min(a.payload.qty, item.stock));
      localStorage.setItem('rizerCart', JSON.stringify(s.items));
    },
    clearCart: (s) => {
      s.items = [];
      localStorage.removeItem('rizerCart');
    },
  },
});

export const { addToCart, removeFromCart, updateQty, clearCart } = cartSlice.actions;

export const selectCartTotal  = (s) => s.cart.items.reduce((acc, i) => acc + (i.discountedPrice || i.price) * i.qty, 0);
export const selectCartCount  = (s) => s.cart.items.reduce((acc, i) => acc + i.qty, 0);

export default cartSlice.reducer;
