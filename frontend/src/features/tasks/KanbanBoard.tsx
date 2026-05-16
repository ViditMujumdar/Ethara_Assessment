import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import {
  DndContext, DragOverlay, closestCorners,
  type DragEndEvent, type DragStartEvent,
  PointerSensor, useSensor, useSensors,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import { taskApi } from './taskApi';
import { KanbanColumn } from './KanbanColumn';
import { TaskCard } from './TaskCard';
import { TaskModal } from './TaskModal';
import { Button } from '@components/ui/Button';
import type { RootState } from '@store/index';
import type { Task, TaskStatus } from '@app-types/index';
import { getSocket } from '@lib/socket';

const COLUMNS: { id: TaskStatus; title: string }[] = [
  { id: 'todo', title: 'To Do' },
  { id: 'in_progress', title: 'In Progress' },
  { id: 'review', title: 'Review' },
  { id: 'done', title: 'Done' },
];

export function KanbanBoard() {
  const workspaceId = useSelector((s: RootState) => s.workspace.currentWorkspace?._id);
  const accessToken = useSelector((s: RootState) => s.auth.accessToken);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const queryClient = useQueryClient();

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks', workspaceId],
    queryFn: async () => {
      if (!workspaceId) return [];
      const { data } = await taskApi.list(workspaceId, { limit: '200' });
      return data.data.tasks;
    },
    enabled: !!workspaceId,
  });

  const updateMutation = useMutation({
    mutationFn: ({ taskId, data }: { taskId: string; data: Partial<Task> }) =>
      taskApi.update(workspaceId!, taskId, data),
    onMutate: async ({ taskId, data }) => {
      await queryClient.cancelQueries({ queryKey: ['tasks', workspaceId] });
      const prev = queryClient.getQueryData<Task[]>(['tasks', workspaceId]);
      queryClient.setQueryData<Task[]>(['tasks', workspaceId], (old) =>
        old?.map((t) => (t._id === taskId ? { ...t, ...data } : t)) || [],
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(['tasks', workspaceId], ctx.prev);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['tasks', workspaceId] }),
  });

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t._id === event.active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over || !workspaceId) return;

    const task = tasks.find((t) => t._id === active.id);
    if (!task) return;

    const overTask = tasks.find((t) => t._id === over.id);
    const status = overTask ? overTask.status : (over.id as TaskStatus);

    if (task.status !== status) {
      updateMutation.mutate({ taskId: task._id, data: { status } });
      if (accessToken) {
        getSocket(accessToken).emit('task:update', { workspaceId, taskId: task._id, status });
      }
    }
  };

  const tasksByStatus = (status: TaskStatus) =>
    tasks.filter((t) => t.status === status).sort((a, b) => a.position - b.position);

  if (!workspaceId) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-500">
        Select or create a workspace to view the board
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Kanban Board</h1>
        <Button onClick={() => { setEditingTask(null); setModalOpen(true); }}>
          <Plus className="h-4 w-4" /> New Task
        </Button>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <span className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {COLUMNS.map((col) => (
              <KanbanColumn key={col.id} id={col.id} title={col.title} count={tasksByStatus(col.id).length}>
                <SortableContext items={tasksByStatus(col.id).map((t) => t._id)} strategy={verticalListSortingStrategy}>
                  {tasksByStatus(col.id).map((task) => (
                    <TaskCard
                      key={task._id}
                      task={task}
                      onClick={() => { setEditingTask(task); setModalOpen(true); }}
                    />
                  ))}
                </SortableContext>
              </KanbanColumn>
            ))}
          </div>
          <DragOverlay>{activeTask ? <TaskCard task={activeTask} /> : null}</DragOverlay>
        </DndContext>
      )}

      <TaskModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        task={editingTask}
        workspaceId={workspaceId}
      />
    </div>
  );
}

export default KanbanBoard;
