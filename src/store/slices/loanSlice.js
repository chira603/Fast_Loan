import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  loans: [],
  currentLoan: null,
  statistics: null,
  loading: false,
  error: null,
};

const loanSlice = createSlice({
  name: 'loan',
  initialState,
  reducers: {
    setLoans: (state, action) => {
      state.loans = action.payload;
      state.error = null;
    },
    setCurrentLoan: (state, action) => {
      state.currentLoan = action.payload;
      state.error = null;
    },
    setStatistics: (state, action) => {
      state.statistics = action.payload;
      state.error = null;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    addLoan: (state, action) => {
      state.loans.unshift(action.payload);
    },
    updateLoan: (state, action) => {
      const index = state.loans.findIndex(loan => loan.id === action.payload.id);
      if (index !== -1) {
        state.loans[index] = action.payload;
      }
    },
  },
});

export const {
  setLoans,
  setCurrentLoan,
  setStatistics,
  setLoading,
  setError,
  clearError,
  addLoan,
  updateLoan,
} = loanSlice.actions;

export default loanSlice.reducer;
