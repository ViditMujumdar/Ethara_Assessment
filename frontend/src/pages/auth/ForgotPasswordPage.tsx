import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { authApi } from '@features/auth/authApi';
import { Button } from '@components/ui/Button';
import { Input } from '@components/ui/Input';

const schema = z.object({ email: z.string().email() });

export function ForgotPasswordPage() {
  const { register, handleSubmit } = useForm({ resolver: zodResolver(schema) });
  const mutation = useMutation({
    mutationFn: (data: { email: string }) => authApi.forgotPassword(data.email),
    onSuccess: () => toast.success('Reset link sent if email exists'),
  });

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-md">
        <h2 className="text-2xl font-bold">Forgot password</h2>
        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="mt-8 space-y-4">
          <Input label="Email" type="email" {...register('email')} />
          <Button type="submit" className="w-full" isLoading={mutation.isPending}>Send reset link</Button>
        </form>
        <Link to="/login" className="mt-4 block text-center text-sm text-primary-600">Back to login</Link>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
