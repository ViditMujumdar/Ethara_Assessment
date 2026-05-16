import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Workspace } from '@app-types/index';

interface WorkspaceState {
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
}

const workspaceSlice = createSlice({
  name: 'workspace',
  initialState: { workspaces: [], currentWorkspace: null } as WorkspaceState,
  reducers: {
    setWorkspaces: (state, action: PayloadAction<Workspace[]>) => {
      state.workspaces = action.payload;
    },
    setCurrentWorkspace: (state, action: PayloadAction<Workspace | null>) => {
      state.currentWorkspace = action.payload;
      if (action.payload) {
        localStorage.setItem('taskflow_workspace', action.payload._id);
      }
    },
    addWorkspace: (state, action: PayloadAction<Workspace>) => {
      state.workspaces.unshift(action.payload);
    },
  },
});

export const { setWorkspaces, setCurrentWorkspace, addWorkspace } = workspaceSlice.actions;
export default workspaceSlice.reducer;
