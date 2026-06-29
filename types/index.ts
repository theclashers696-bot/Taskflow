export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate: string | null;
  teamId: number | null;
  assigneeId: string | null;
  creatorId: string;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
  creator?: { id: string; name: string; image: string | null };
  assignee?: { id: string; name: string; image: string | null } | null;
  team?: { id: number; name: string } | null;
  labels?: TaskLabel[];
  _count?: { comments: number };
}

export interface Team {
  id: number;
  name: string;
  description: string | null;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  owner?: { id: string; name: string; image: string | null };
  members?: TeamMember[];
  _count?: { tasks: number; members: number };
}

export interface TeamMember {
  id: number;
  teamId: number;
  userId: string;
  role: string;
  joinedAt: string;
  user?: { id: string; name: string; email: string; image: string | null };
}

export interface DashboardSummary {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
  completionRate: number;
  totalTeams: number;
}

export interface TaskFormData {
  title: string;
  description?: string;
  status: string;
  priority: string;
  dueDate?: string;
  teamId?: number;
  assigneeId?: string;
}

export interface TeamFormData {
  name: string;
  description?: string;
}

export interface Notification {
  id: number;
  userId: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  link: string | null;
  createdAt: string;
}

export interface TaskComment {
  id: number;
  taskId: number;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  user?: { id: string; name: string; image: string | null };
}

export interface ActivityLog {
  id: number;
  taskId: number;
  userId: string;
  action: string;
  detail: string | null;
  createdAt: string;
  user?: { id: string; name: string; image: string | null };
}

export interface Label {
  id: number;
  name: string;
  color: string;
  userId: string;
}

export interface TaskLabel {
  taskId: number;
  labelId: number;
  label?: Label;
}
