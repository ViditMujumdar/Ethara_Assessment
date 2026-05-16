import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { taskApi } from './taskApi';
import { Button } from '@components/ui/Button';
import { Input } from '@components/ui/Input';
import type { Task } from '@app-types/index';

const schema = z.object({
  title: z.string().min(1, 'Title required'),
  description: z.string().optional(),
  status: z.enum(['todo', 'in_progress', 'review', 'done']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  dueDate: z.string().optional(),
  labels: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  task: Task | null;
  workspaceId: string;
}

export function TaskModal({ open, onClose, task, workspaceId }: Props) {
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    values: task
      ? {
          title: task.title,
          description: task.description || '',
          status: task.status,
          priority: task.priority,
          dueDate: task.dueDate?.split('T')[0] || '',
          labels: task.labels?.join(', ') || '',
        }
      : { title: '', status: 'todo', priority: 'medium' },
  });

  const mutation = useMutation({
    mutationFn: (data: FormData) => {
      const payload = {
        ...data,
        labels: data.labels ? data.labels.split(',').map((l) => l.trim()) : [],
        dueDate: data.dueDate || undefined,
      };
      return task
        ? taskApi.update(workspaceId, task._id, payload)
        : taskApi.create(workspaceId, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', workspaceId] });
      toast.success(task ? 'Task updated' : 'Task created');
      reset();
      onClose();
    },
    onError: () => toast.error('Failed to save task'),
  });

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/50" onClick={onClose} />
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="relative w-full max-w-lg rounded-xl border bg-white p-6 shadow-xl dark:bg-slate-900">
            <h2 className="text-lg font-semibold">{task ? 'Edit Task' : 'New Task'}</h2>
            <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="mt-4 space-y-4">
              <Input label="Title" {...register('title')} />
              <div>
                <label className="text-sm font-medium">Description</label>
                <textarea {...register('description')} rows={3} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm dark:bg-slate-800" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <select {...register('status')} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm dark:bg-slate-800">
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="review">Review</option>
                    <option value="done">Done</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Priority</label>
                  <select {...register('priority')} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm dark:bg-slate-800">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>
              <Input label="Due Date" type="date" {...register('dueDate')} />
              <Input label="Labels (comma separated)" {...register('labels')} />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                <Button type="submit" isLoading={mutation.isPending}>Save</Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default TaskModal;
