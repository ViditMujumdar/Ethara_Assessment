import { useDroppable } from '@dnd-kit/core';
import { cn } from '@lib/utils';

interface KanbanColumnProps {
  id: string;
  title: string;
  count: number;
  children: React.ReactNode;
}

export function KanbanColumn({ id, title, count, children }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex w-72 shrink-0 flex-col rounded-xl border bg-slate-100/50 dark:bg-slate-900/50',
        isOver && 'ring-2 ring-primary-500',
      )}
    >
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h3 className="font-medium">{title}</h3>
        <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs dark:bg-slate-700">{count}</span>
      </div>
      <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-3 min-h-[200px]">{children}</div>
    </div>
  );
}

export default KanbanColumn;
