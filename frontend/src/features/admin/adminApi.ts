import api from '@lib/api';

export const adminApi = {
  me: () => api.get<{ data: { isAdmin: boolean; role: string | null; permissions: string[] } }>('/admin/me'),
  dashboard: () => api.get('/admin/dashboard'),
};

export default adminApi;
