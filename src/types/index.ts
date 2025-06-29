export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  joinedAt: Date;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate?: Date;
  category: TaskCategory;
  priority: TaskPriority;
  status: TaskStatus;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export type TaskCategory = 'work' | 'personal' | 'shopping' | 'health' | 'learning' | 'other';

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export type TaskStatus = 'todo' | 'in-progress' | 'completed';

export type ViewMode = 'list' | 'board' | 'calendar';

export type FilterOptions = {
  category?: TaskCategory;
  priority?: TaskPriority;
  status?: TaskStatus;
  search?: string;
  dueDate?: 'today' | 'week' | 'overdue';
};

export type SortOption = 'dueDate' | 'priority' | 'created' | 'alphabetical';

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
}