import { createSlice } from '@reduxjs/toolkit';

const saved = localStorage.getItem('rizerWishlist');
const initial = saved ? JSON.parse(saved) : [];

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: { items: initial },
  reducers: {
    toggleWishlist: (s, a) => {
      const exists = s.items.find(i => i._id === a.payload._id);
      if (exists) s.items = s.items.filter(i => i._id !== a.payload._id);
      else        s.items.push(a.payload);
      localStorage.setItem('rizerWishlist', JSON.stringify(s.items));
    },
    clearWishlist: (s) => {
      s.items = [];
      localStorage.removeItem('rizerWishlist');
    },
  },
});

export const { toggleWishlist, clearWishlist } = wishlistSlice.actions;
export const selectIsWishlisted = (id) => (s) => s.wishlist.items.some(i => i._id === id);
export default wishlistSlice.reducer;
