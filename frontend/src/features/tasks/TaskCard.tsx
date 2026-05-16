import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { format } from 'date-fns';
import { Calendar, GripVertical } from 'lucide-react';
import type { Task } from '@app-types/index';
import { cn } from '@lib/utils';

const priorityColors = {
  low: 'bg-slate-100 text-slate-600',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700',
};

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
}

export function TaskCard({ task, onClick }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task._id,
    disabled: !onClick,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group cursor-pointer rounded-lg border bg-white p-3 shadow-sm transition-shadow hover:shadow-md dark:bg-slate-800',
        isDragging && 'opacity-50 shadow-lg',
      )}
      onClick={onClick}
    >
      <div className="flex items-start gap-2">
        <button type="button" className="mt-0.5 cursor-grab text-slate-400 opacity-0 group-hover:opacity-100" {...attributes} {...listeners}>
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm">{task.title}</p>
          {task.description && (
            <p className="mt-1 line-clamp-2 text-xs text-slate-500">{task.description}</p>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className={cn('rounded px-1.5 py-0.5 text-[10px] font-medium uppercase', priorityColors[task.priority])}>
              {task.priority}
            </span>
            {task.labels?.map((label) => (
              <span key={label} className="rounded bg-primary-100 px-1.5 py-0.5 text-[10px] text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
                {label}
              </span>
            ))}
          </div>
          {task.dueDate && (
            <div className="mt-2 flex items-center gap-1 text-xs text-slate-500">
              <Calendar className="h-3 w-3" />
              {format(new Date(task.dueDate), 'MMM d')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TaskCard;
