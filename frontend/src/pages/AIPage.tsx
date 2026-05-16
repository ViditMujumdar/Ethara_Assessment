import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { Send, Sparkles } from 'lucide-react';
import api from '@lib/api';
import type { RootState } from '@store/index';
import { Button } from '@components/ui/Button';

export function AIPage() {
  const workspaceId = useSelector((s: RootState) => s.workspace.currentWorkspace?._id);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [input, setInput] = useState('');

  const chatMutation = useMutation({
    mutationFn: (msgs: { role: string; content: string }[]) =>
      api.post('/ai/chat', { workspaceId, messages: msgs }),
    onSuccess: (res) => {
      setMessages((m) => [...m, { role: 'assistant', content: res.data.data.reply }]);
    },
  });

  const send = () => {
    if (!input.trim()) return;
    const newMsgs = [...messages, { role: 'user' as const, content: input }];
    setMessages(newMsgs);
    setInput('');
    chatMutation.mutate(newMsgs.map((m) => ({ role: m.role, content: m.content })));
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col rounded-xl border bg-white dark:bg-slate-900">
      <div className="flex items-center gap-2 border-b px-6 py-4">
        <Sparkles className="h-5 w-5 text-primary-600" />
        <h1 className="font-semibold">AI Assistant</h1>
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={m.role === 'user' ? 'ml-auto max-w-[80%] rounded-lg bg-primary-600 px-4 py-2 text-white' : 'max-w-[80%] rounded-lg bg-slate-100 px-4 py-2 dark:bg-slate-800'}>
            {m.content}
          </div>
        ))}
        {chatMutation.isPending && <p className="text-slate-500">Thinking...</p>}
      </div>
      <div className="flex gap-2 border-t p-4">
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} className="flex-1 rounded-lg border px-4 py-2 dark:bg-slate-800" placeholder="Ask anything about your tasks..." />
        <Button onClick={send} isLoading={chatMutation.isPending}><Send className="h-4 w-4" /></Button>
      </div>
    </div>
  );
}

export default AIPage;
