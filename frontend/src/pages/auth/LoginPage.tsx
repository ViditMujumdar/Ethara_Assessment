import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { useAuth } from '@hooks/useAuth';
import { Button } from '@components/ui/Button';
import { Input } from '@components/ui/Input';
import { ThemeSwitcher } from '@components/layout/ThemeSwitcher';

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type FormData = z.infer<typeof schema>;

export function LoginPage() {
  const { login, isLoginLoading } = useAuth();
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  return (
    <div className="flex min-h-screen">
      <div className="hidden flex-1 items-center justify-center bg-gradient-to-br from-primary-600 to-primary-900 p-12 lg:flex">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="max-w-md text-white">
          <h1 className="text-4xl font-bold">TaskFlow Manager</h1>
          <p className="mt-4 text-primary-100">Modern task management for high-performing teams.</p>
        </motion.div>
      </div>
      <div className="flex flex-1 flex-col justify-center px-6 py-12 lg:px-16">
        <div className="absolute right-4 top-4"><ThemeSwitcher /></div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mx-auto w-full max-w-md">
          <h2 className="text-2xl font-bold">Welcome back</h2>
          <p className="mt-2 text-slate-500">Sign in to your account</p>
          <form onSubmit={handleSubmit((d) => login(d))} className="mt-8 space-y-4">
            <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />
            <Input label="Password" type="password" error={errors.password?.message} {...register('password')} />
            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-sm text-primary-600 hover:underline">Forgot password?</Link>
            </div>
            <Button type="submit" className="w-full" isLoading={isLoginLoading}>Sign in</Button>
          </form>
          <p className="mt-6 text-center text-sm text-slate-500">
            Don&apos;t have an account? <Link to="/signup" className="text-primary-600 hover:underline">Sign up</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default LoginPage;
