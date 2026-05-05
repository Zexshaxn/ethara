export interface User {
  id: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'USER';
}

export interface Project {
  id: number;
  title: string;
  description: string;
  status: string;
  owner_id: number;
  created_at: string;
}

export interface Task {
  id: number;
  project_id: number;
  title: string;
  description: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  assignee_id: number;
  assignee_name?: string;
  project_title?: string;
  due_date: string;
}

export interface Notification {
  id: number;
  message: string;
  is_read: number;
  created_at: string;
}

export interface DashboardStats {
  projects: number;
  tasks: number;
  completed: number;
  chartData: { name: string; tasks: number }[];
}
