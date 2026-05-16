import api from '@lib/api';
import type { Workspace } from '@app-types/index';

export const workspaceApi = {
  list: () => api.get<{ data: { workspaces: Workspace[] } }>('/workspaces'),
  get: (id: string) => api.get<{ data: { workspace: Workspace } }>(`/workspaces/${id}`),
  create: (data: { name: string; description?: string }) =>
    api.post<{ data: { workspace: Workspace } }>('/workspaces', data),
  update: (id: string, data: Partial<Workspace>) => api.patch(`/workspaces/${id}`, data),
  delete: (id: string) => api.delete(`/workspaces/${id}`),
  invite: (id: string, data: { email: string; role: string }) =>
    api.post(`/workspaces/${id}/invite`, data),
  removeMember: (id: string, memberId: string) =>
    api.delete(`/workspaces/${id}/members/${memberId}`),
};

export default workspaceApi;
