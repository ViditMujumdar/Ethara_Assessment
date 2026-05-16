import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@features/auth/authSlice';
import themeReducer from '@features/theme/themeSlice';
import workspaceReducer from '@features/workspace/workspaceSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    theme: themeReducer,
    workspace: workspaceReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
