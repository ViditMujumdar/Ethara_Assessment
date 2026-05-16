import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { Send } from 'lucide-react';
import api from '@lib/api';
import { getSocket } from '@lib/socket';
import type { RootState } from '@store/index';
import type { Message } from '@app-types/index';
import { cn } from '@lib/utils';

export function ChatPage() {
  const [message, setMessage] = useState('');
  const [channel, setChannel] = useState('general');
  const workspaceId = useSelector((s: RootState) => s.workspace.currentWorkspace?._id);
  const accessToken = useSelector((s: RootState) => s.auth.accessToken);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: messages = [], refetch } = useQuery({
    queryKey: ['messages', workspaceId, channel],
    queryFn: async () => {
      const res = await api.get<{ data: { messages: Message[] } }>(`/chat/${workspaceId}/messages`, { params: { channel } });
      return res.data.data.messages;
    },
    enabled: !!workspaceId,
  });

  useEffect(() => {
    if (!accessToken || !workspaceId) return;
    const socket = getSocket(accessToken);
    socket.emit('join:workspace', workspaceId);
    socket.on('chat:new_message', () => refetch());
    return () => { socket.off('chat:new_message'); };
  }, [accessToken, workspaceId, refetch]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendMessage = () => {
    if (!message.trim() || !accessToken || !workspaceId) return;
    getSocket(accessToken).emit('chat:message', { workspaceId, channel, content: message });
    setMessage('');
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] rounded-xl border bg-white dark:bg-slate-900">
      <aside className="w-48 border-r p-4">
        <h3 className="font-medium mb-2">Channels</h3>
        {['general', 'random', 'dev'].map((ch) => (
          <button key={ch} type="button" onClick={() => setChannel(ch)} className={cn('block w-full rounded px-2 py-1.5 text-left text-sm', channel === ch && 'bg-primary-100 text-primary-700')}>
            #{ch}
          </button>
        ))}
      </aside>
      <main className="flex flex-1 flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((m) => (
            <div key={m._id} className="flex gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-600 text-xs text-white">
                {m.sender?.name?.charAt(0)}
              </div>
              <div>
                <span className="text-sm font-medium">{m.sender?.name}</span>
                <p className="text-sm">{m.content}</p>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
        <div className="flex gap-2 border-t p-4">
          <input value={message} onChange={(e) => setMessage(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendMessage()} placeholder="Type a message..." className="flex-1 rounded-lg border px-4 py-2 text-sm dark:bg-slate-800" />
          <button type="button" onClick={sendMessage} className="rounded-lg bg-primary-600 p-2 text-white"><Send className="h-5 w-5" /></button>
        </div>
      </main>
    </div>
  );
}

export default ChatPage;
