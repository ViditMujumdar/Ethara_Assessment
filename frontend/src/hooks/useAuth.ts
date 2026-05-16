import { useMutation, useQuery } from '@tanstack/react-query';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authApi } from '@features/auth/authApi';
import { setCredentials, logout } from '@features/auth/authSlice';
import type { RootState } from '@store/index';

export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated, accessToken } = useSelector((s: RootState) => s.auth);

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: ({ data }) => {
      dispatch(setCredentials({ user: data.data.user, accessToken: data.data.accessToken }));
      toast.success('Welcome back!');
      navigate('/dashboard');
    },
    onError: () => toast.error('Invalid credentials'),
  });

  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: () => {
      toast.success('Account created! Please verify your email.');
      navigate('/login');
    },
    onError: (err: { response?: { data?: { message?: string } } }) =>
      toast.error(err.response?.data?.message || 'Registration failed'),
  });

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSettled: () => {
      dispatch(logout());
      navigate('/login');
    },
  });

  const { data: meData, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: () => authApi.me(),
    enabled: isAuthenticated && !!accessToken,
    retry: false,
  });

  return {
    user: meData?.data?.data?.user || user,
    isAuthenticated,
    isLoading,
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout: logoutMutation.mutate,
    isLoginLoading: loginMutation.isPending,
    isRegisterLoading: registerMutation.isPending,
  };
};

export default useAuth;
