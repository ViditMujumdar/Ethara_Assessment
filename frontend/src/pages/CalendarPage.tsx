import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { taskApi } from '@features/tasks/taskApi';
import type { RootState } from '@store/index';
import { cn } from '@lib/utils';

export function CalendarPage() {
  const [current, setCurrent] = useState(new Date());
  const [view, setView] = useState<'month' | 'week'>('month');
  const workspaceId = useSelector((s: RootState) => s.workspace.currentWorkspace?._id);

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks', workspaceId, 'calendar'],
    queryFn: async () => {
      if (!workspaceId) return [];
      const { data } = await taskApi.list(workspaceId, { limit: '500' });
      return data.data.tasks;
    },
    enabled: !!workspaceId,
  });

  const days = eachDayOfInterval({
    start: startOfMonth(current),
    end: endOfMonth(current),
  });

  const tasksForDay = (day: Date) =>
    tasks.filter((t) => t.dueDate && format(parseISO(t.dueDate), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd'));

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Calendar</h1>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setView('month')} className={cn('rounded-lg px-3 py-1.5 text-sm', view === 'month' && 'bg-primary-100 text-primary-700')}>Month</button>
          <button type="button" onClick={() => setView('week')} className={cn('rounded-lg px-3 py-1.5 text-sm', view === 'week' && 'bg-primary-100 text-primary-700')}>Week</button>
          <button type="button" onClick={() => setCurrent((d) => new Date(d.setMonth(d.getMonth() - 1)))}><ChevronLeft /></button>
          <span className="font-medium">{format(current, 'MMMM yyyy')}</span>
          <button type="button" onClick={() => setCurrent((d) => new Date(d.setMonth(d.getMonth() + 1)))}><ChevronRight /></button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 rounded-xl border bg-white p-4 dark:bg-slate-900">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <div key={d} className="p-2 text-center text-xs font-medium text-slate-500">{d}</div>
        ))}
        {days.map((day) => (
          <div
            key={day.toISOString()}
            className={cn(
              'min-h-24 rounded-lg border p-2',
              !isSameMonth(day, current) && 'opacity-40',
              isToday(day) && 'border-primary-500 bg-primary-50/50 dark:bg-primary-900/20',
            )}
          >
            <span className="text-sm font-medium">{format(day, 'd')}</span>
            {tasksForDay(day).map((t) => (
              <div key={t._id} className="mt-1 truncate rounded bg-primary-100 px-1 text-[10px] dark:bg-primary-900/40">
                {t.title}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default CalendarPage;
