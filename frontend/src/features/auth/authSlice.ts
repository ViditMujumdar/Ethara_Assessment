import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { User } from '@app-types/index';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
}

const loadState = (): AuthState => {
  try {
    const stored = localStorage.getItem('taskflow_auth');
    if (stored) return JSON.parse(stored);
  } catch {
    // ignore
  }
  return { user: null, accessToken: null, isAuthenticated: false };
};

const persist = (state: AuthState) => {
  localStorage.setItem('taskflow_auth', JSON.stringify({
    user: state.user,
    accessToken: state.accessToken,
    isAuthenticated: state.isAuthenticated,
  }));
};

const initialState = loadState();

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: User; accessToken: string }>) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
      persist(state);
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      localStorage.removeItem('taskflow_auth');
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        persist(state);
      }
    },
  },
});

export const { setCredentials, logout, updateUser } = authSlice.actions;
export default authSlice.reducer;
