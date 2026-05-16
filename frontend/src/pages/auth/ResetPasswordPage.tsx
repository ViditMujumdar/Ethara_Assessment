import { useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authApi } from '@features/auth/authApi';
import { Button } from '@components/ui/Button';
import { Input } from '@components/ui/Input';

const schema = z.object({ password: z.string().min(8) });

export function ResetPasswordPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get('token') || '';
  const { register, handleSubmit } = useForm({ resolver: zodResolver(schema) });

  const mutation = useMutation({
    mutationFn: (data: { password: string }) => authApi.resetPassword(token, data.password),
    onSuccess: () => { toast.success('Password reset!'); navigate('/login'); },
  });

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-md">
        <h2 className="text-2xl font-bold">Reset password</h2>
        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="mt-8 space-y-4">
          <Input label="New password" type="password" {...register('password')} />
          <Button type="submit" className="w-full" isLoading={mutation.isPending}>Reset password</Button>
        </form>
        <Link to="/login" className="mt-4 block text-center text-sm text-primary-600">Back to login</Link>
      </div>
    </div>
  );
}

export default ResetPasswordPage;
