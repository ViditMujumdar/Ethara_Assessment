import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: Theme;
  resolved: 'light' | 'dark';
}

const getResolved = (theme: Theme): 'light' | 'dark' => {
  if (theme === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return theme;
};

const stored = (localStorage.getItem('taskflow_theme') as Theme) || 'system';

const themeSlice = createSlice({
  name: 'theme',
  initialState: { theme: stored, resolved: getResolved(stored) } as ThemeState,
  reducers: {
    setTheme: (state, action: PayloadAction<Theme>) => {
      state.theme = action.payload;
      state.resolved = getResolved(action.payload);
      localStorage.setItem('taskflow_theme', action.payload);
      document.documentElement.classList.toggle('dark', state.resolved === 'dark');
    },
    initTheme: (state) => {
      state.resolved = getResolved(state.theme);
      document.documentElement.classList.toggle('dark', state.resolved === 'dark');
    },
  },
});

export const { setTheme, initTheme } = themeSlice.actions;
export default themeSlice.reducer;
