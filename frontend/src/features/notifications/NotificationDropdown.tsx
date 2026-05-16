import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@lib/api';
import type { Notification } from '@app-types/index';
import { cn } from '@lib/utils';

export function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await api.get<{ data: { notifications: Notification[]; unreadCount: number } }>('/notifications');
      return res.data.data;
    },
    refetchInterval: 30000,
  });

  const markRead = useMutation({
    mutationFn: (id: string) => api.patch(`/notifications/${id}/read`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const unreadCount = data?.unreadCount || 0;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="relative rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute right-0 mt-2 w-80 rounded-lg border bg-white shadow-lg dark:bg-slate-900"
          >
            <div className="border-b px-4 py-3 font-medium">Notifications</div>
            <div className="max-h-80 overflow-y-auto">
              {data?.notifications?.length ? (
                data.notifications.map((n) => (
                  <button
                    key={n._id}
                    type="button"
                    onClick={() => !n.isRead && markRead.mutate(n._id)}
                    className={cn(
                      'w-full border-b px-4 py-3 text-left text-sm last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800',
                      !n.isRead && 'bg-primary-50/50 dark:bg-primary-900/10',
                    )}
                  >
                    <p className="font-medium">{n.title}</p>
                    <p className="text-slate-500">{n.message}</p>
                  </button>
                ))
              ) : (
                <p className="px-4 py-6 text-center text-sm text-slate-500">No notifications</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default NotificationDropdown;
