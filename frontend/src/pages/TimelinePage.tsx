import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { format, parseISO, differenceInDays } from 'date-fns';
import { taskApi } from '@features/tasks/taskApi';
import type { RootState } from '@store/index';
import { cn } from '@lib/utils';

export function TimelinePage() {
  const workspaceId = useSelector((s: RootState) => s.workspace.currentWorkspace?._id);

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks', workspaceId],
    queryFn: async () => {
      if (!workspaceId) return [];
      const { data } = await taskApi.list(workspaceId, { limit: '100' });
      return data.data.tasks.filter((t) => t.startDate || t.dueDate);
    },
    enabled: !!workspaceId,
  });

  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - 7);
  const totalDays = 30;

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold">Timeline</h1>
      <div className="space-y-4">
        {tasks.map((task) => {
          const start = task.startDate ? parseISO(task.startDate) : today;
          const end = task.dueDate ? parseISO(task.dueDate) : start;
          const offset = Math.max(0, differenceInDays(start, startDate));
          const width = Math.max(differenceInDays(end, start), 1);
          return (
            <div key={task._id} className="flex items-center gap-4">
              <span className="w-40 truncate text-sm font-medium">{task.title}</span>
              <div className="relative flex-1 h-8 rounded bg-slate-100 dark:bg-slate-800">
                <div
                  className={cn(
                    'absolute top-1 h-6 rounded bg-primary-500/80',
                    task.status === 'done' && 'bg-green-500/80',
                  )}
                  style={{
                    left: `${(offset / totalDays) * 100}%`,
                    width: `${Math.min((width / totalDays) * 100, 100 - (offset / totalDays) * 100)}%`,
                  }}
                />
              </div>
              <span className="text-xs text-slate-500 w-24">{format(end, 'MMM d')}</span>
            </div>
          );
        })}
        {!tasks.length && <p className="text-slate-500">No scheduled tasks</p>}
      </div>
    </div>
  );
}

export default TimelinePage;
