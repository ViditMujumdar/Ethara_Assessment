import api from '@lib/api';
import type { User } from '@app-types/index';

export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post<{ data: { user: User; accessToken: string } }>('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get<{ data: { user: User } }>('/auth/me'),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, password: string) =>
    api.post('/auth/reset-password', { token, password }),
  verifyEmail: (token: string) => api.get(`/auth/verify-email?token=${token}`),
};

export default authApi;
