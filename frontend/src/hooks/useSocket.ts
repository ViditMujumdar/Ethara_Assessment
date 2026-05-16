import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useQueryClient } from '@tanstack/react-query';
import { getSocket, disconnectSocket } from '@lib/socket';
import type { RootState } from '@store/index';
export function useSocket() {
  const { accessToken, isAuthenticated } = useSelector((s: RootState) => s.auth);
  const workspaceId = useSelector((s: RootState) => s.workspace.currentWorkspace?._id);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isAuthenticated || !accessToken) return;

    const socket = getSocket(accessToken);

    if (workspaceId) {
      socket.emit('join:workspace', workspaceId);
    }

    socket.on('task:updated', () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', workspaceId] });
    });

    socket.on('chat:new_message', () => {
      queryClient.invalidateQueries({ queryKey: ['messages', workspaceId] });
    });

    socket.on('presence:online', ({ userId }: { userId: string }) => {
      console.debug('User online:', userId);
    });

    return () => {
      if (workspaceId) socket.emit('leave:workspace', workspaceId);
    };
  }, [accessToken, isAuthenticated, workspaceId, queryClient]);

  useEffect(() => {
    return () => disconnectSocket();
  }, []);
}

export default useSocket;
