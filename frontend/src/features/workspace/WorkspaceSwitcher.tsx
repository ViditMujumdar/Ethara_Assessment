import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDispatch, useSelector } from 'react-redux';
import { ChevronDown, Plus } from 'lucide-react';
import { workspaceApi } from './workspaceApi';
import { setWorkspaces, setCurrentWorkspace } from './workspaceSlice';
import { CreateWorkspaceModal } from './CreateWorkspaceModal';
import type { RootState } from '@store/index';
import { cn } from '@lib/utils';

export function WorkspaceSwitcher() {
  const [open, setOpen] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const dispatch = useDispatch();
  const current = useSelector((s: RootState) => s.workspace.currentWorkspace);

  useQuery({
    queryKey: ['workspaces'],
    queryFn: async () => {
      const { data } = await workspaceApi.list();
      dispatch(setWorkspaces(data.data.workspaces));
      if (!current && data.data.workspaces.length) {
        dispatch(setCurrentWorkspace(data.data.workspaces[0]));
      }
      return data.data.workspaces;
    },
  });

  const workspaces = useSelector((s: RootState) => s.workspace.workspaces);

  return (
    <>
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          <span className="max-w-[120px] truncate">{current?.name || 'Select workspace'}</span>
          <ChevronDown className="h-4 w-4" />
        </button>
        {open && (
          <div className="absolute left-0 top-full z-50 mt-1 w-56 rounded-lg border bg-white py-1 shadow-lg dark:bg-slate-900">
            {workspaces.map((ws) => (
              <button
                key={ws._id}
                type="button"
                onClick={() => {
                  dispatch(setCurrentWorkspace(ws));
                  setOpen(false);
                }}
                className={cn(
                  'flex w-full px-4 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-800',
                  current?._id === ws._id && 'bg-primary-50 text-primary-700 dark:bg-primary-900/30',
                )}
              >
                {ws.name}
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                setShowCreate(true);
                setOpen(false);
              }}
              className="flex w-full items-center gap-2 border-t px-4 py-2 text-sm text-primary-600 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <Plus className="h-4 w-4" /> Create workspace
            </button>
          </div>
        )}
      </div>
      <CreateWorkspaceModal open={showCreate} onClose={() => setShowCreate(false)} />
    </>
  );
}

export default WorkspaceSwitcher;
