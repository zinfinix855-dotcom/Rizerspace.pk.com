import { createSlice } from '@reduxjs/toolkit';

const userFromStorage = localStorage.getItem('rizerUser')
  ? JSON.parse(localStorage.getItem('rizerUser'))
  : null;
const tokenFromStorage = localStorage.getItem('rizerToken') || null;

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: userFromStorage, token: tokenFromStorage, loading: false, error: null },
  reducers: {
    loginStart:  (s) => { s.loading = true; s.error = null; },
    loginSuccess:(s, a) => {
      s.loading = false;
      s.user    = a.payload.user;
      s.token   = a.payload.token;
      localStorage.setItem('rizerToken', a.payload.token);
      localStorage.setItem('rizerUser', JSON.stringify(a.payload.user));
    },
    loginFail:   (s, a) => { s.loading = false; s.error = a.payload; },
    logout:      (s)    => {
      s.user = null; s.token = null;
      localStorage.removeItem('rizerToken');
      localStorage.removeItem('rizerUser');
    },
    updateUser:  (s, a) => {
      s.user = { ...s.user, ...a.payload };
      localStorage.setItem('rizerUser', JSON.stringify(s.user));
    },
    clearError:  (s)    => { s.error = null; },
  },
});

export const { loginStart, loginSuccess, loginFail, logout, updateUser, clearError } = authSlice.actions;
export default authSlice.reducer;
