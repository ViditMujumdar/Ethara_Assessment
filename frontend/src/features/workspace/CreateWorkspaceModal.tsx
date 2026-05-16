import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { workspaceApi } from './workspaceApi';
import { addWorkspace, setCurrentWorkspace } from './workspaceSlice';
import { Button } from '@components/ui/Button';
import { Input } from '@components/ui/Input';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
}

export function CreateWorkspaceModal({ open, onClose }: Props) {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const mutation = useMutation({
    mutationFn: workspaceApi.create,
    onSuccess: ({ data }) => {
      dispatch(addWorkspace(data.data.workspace));
      dispatch(setCurrentWorkspace(data.data.workspace));
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      toast.success('Workspace created!');
      reset();
      onClose();
    },
    onError: () => toast.error('Failed to create workspace'),
  });

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50"
            onClick={onClose}
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full max-w-md rounded-xl border bg-white p-6 shadow-xl dark:bg-slate-900"
          >
            <h2 className="text-lg font-semibold">Create workspace</h2>
            <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="mt-4 space-y-4">
              <Input label="Name" error={errors.name?.message} {...register('name')} />
              <Input label="Description" {...register('description')} />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                <Button type="submit" isLoading={mutation.isPending}>Create</Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default CreateWorkspaceModal;
