import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  showLogin: true,
  showSignup: true,
};

const headerSlice = createSlice({
  name: 'header',
  initialState,
  reducers: {
    showAllButtons: (state) => {
      state.showLogin = true;
      state.showSignup = true;
    },
    hideLoginButton: (state) => {
      state.showLogin = false;
      state.showSignup = true;
    },
    hideSignupButton: (state) => {
      state.showLogin = true;
      state.showSignup = false;
    },
  },
});

export const { showAllButtons, hideLoginButton, hideSignupButton } = headerSlice.actions;
export default headerSlice.reducer; 