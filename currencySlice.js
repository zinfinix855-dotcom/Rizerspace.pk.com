import { createSlice } from '@reduxjs/toolkit';

// Exchange rates relative to USD (static fallback; real app would fetch from API)
const RATES = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  PKR: 278.5,
  AED: 3.67,
  SAR: 3.75,
  CAD: 1.37,
  AUD: 1.54,
};

const SYMBOLS = {
  USD: '$', EUR: '€', GBP: '£', PKR: '₨', AED: 'د.إ', SAR: '﷼', CAD: 'CA$', AUD: 'A$',
};

const currencySlice = createSlice({
  name: 'currency',
  initialState: { code: 'USD', symbol: '$', rate: 1, rates: RATES },
  reducers: {
    setCurrency: (s, a) => {
      s.code   = a.payload;
      s.symbol = SYMBOLS[a.payload] || '$';
      s.rate   = s.rates[a.payload] || 1;
    },
    updateRates: (s, a) => {
      s.rates = { ...s.rates, ...a.payload };
      s.rate  = s.rates[s.code] || 1;
    },
  },
});

export const { setCurrency, updateRates } = currencySlice.actions;

// Selector: convert a USD price to current currency
export const convertPrice = (usdPrice) => (state) => {
  const rate = state.currency.rates[state.currency.code] || 1;
  return (usdPrice * rate).toFixed(2);
};

export const CURRENCY_LIST = Object.keys(RATES);
export { SYMBOLS };

export default currencySlice.reducer;
