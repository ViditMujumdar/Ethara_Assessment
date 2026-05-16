import api from '@lib/api';
import type { Task } from '@app-types/index';

export const taskApi = {
  list: (workspaceId: string, params?: Record<string, string>) =>
    api.get<{ data: { tasks: Task[]; pagination: unknown } }>(
      `/${workspaceId}/tasks`,
      { params },
    ),
  create: (workspaceId: string, data: Partial<Task>) =>
    api.post<{ data: { task: Task } }>(`/${workspaceId}/tasks`, data),
  update: (workspaceId: string, taskId: string, data: Partial<Task>) =>
    api.patch<{ data: { task: Task } }>(`/${workspaceId}/tasks/${taskId}`, data),
  delete: (workspaceId: string, taskId: string) =>
    api.delete(`/${workspaceId}/tasks/${taskId}`),
  reorder: (workspaceId: string, updates: { id: string; status: string; position: number }[]) =>
    api.post(`/${workspaceId}/tasks/reorder`, { updates }),
  analytics: (workspaceId: string) =>
    api.get(`/${workspaceId}/analytics`),
};

export default taskApi;
