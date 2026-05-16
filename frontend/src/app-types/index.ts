export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'user' | 'admin';
  isEmailVerified: boolean;
  preferences?: { theme: 'light' | 'dark' | 'system'; notifications: boolean };
}

export interface Workspace {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  owner: User | string;
  members: WorkspaceMember[];
  settings?: { defaultView: string; isPublic: boolean };
}

export interface WorkspaceMember {
  user: User;
  role: 'owner' | 'admin' | 'manager' | 'member';
  joinedAt: string;
}

export interface Task {
  _id: string;
  title: string;
  description?: string;
  workspace: string;
  status: 'todo' | 'in_progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
  startDate?: string;
  labels?: string[];
  position: number;
  assignee?: User;
  subtasks?: { title: string; completed: boolean }[];
  comments?: { user: User; content: string; createdAt: string }[];
}

export interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface Message {
  _id: string;
  content: string;
  sender: User;
  channel?: string;
  reactions?: { emoji: string; user: string }[];
  createdAt: string;
}

export type TaskStatus = Task['status'];
export type TaskPriority = Task['priority'];
