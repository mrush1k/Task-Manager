import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Task, FilterOptions, SortOption, TaskStats } from '../types';
import { useAuth } from './AuthContext';

interface TaskAction {
  type: 'SET_TASKS' | 'ADD_TASK' | 'UPDATE_TASK' | 'DELETE_TASK' | 'SET_FILTERS' | 'SET_SORT';
  payload?: any;
}

interface TaskState {
  tasks: Task[];
  filteredTasks: Task[];
  filters: FilterOptions;
  sortBy: SortOption;
  stats: TaskStats;
}

interface TaskContextType extends TaskState {
  addTask: (task: Omit<Task, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskStatus: (id: string) => void;
  setFilters: (filters: FilterOptions) => void;
  setSortBy: (sort: SortOption) => void;
  clearFilters: () => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

const calculateStats = (tasks: Task[]): TaskStats => {
  const now = new Date();
  return {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    pending: tasks.filter(t => t.status !== 'completed').length,
    overdue: tasks.filter(t => 
      t.status !== 'completed' && 
      t.dueDate && 
      new Date(t.dueDate) < now
    ).length,
  };
};

const filterTasks = (tasks: Task[], filters: FilterOptions): Task[] => {
  return tasks.filter(task => {
    if (filters.category && task.category !== filters.category) return false;
    if (filters.priority && task.priority !== filters.priority) return false;
    if (filters.status && task.status !== filters.status) return false;
    if (filters.search && !task.title.toLowerCase().includes(filters.search.toLowerCase()) &&
        !task.description.toLowerCase().includes(filters.search.toLowerCase())) return false;
    
    if (filters.dueDate) {
      const taskDate = task.dueDate ? new Date(task.dueDate) : null;
      const today = new Date();
      const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      
      if (filters.dueDate === 'today' && taskDate) {
        const isToday = taskDate.toDateString() === today.toDateString();
        if (!isToday) return false;
      } else if (filters.dueDate === 'week' && taskDate) {
        if (taskDate > weekFromNow) return false;
      } else if (filters.dueDate === 'overdue' && taskDate) {
        if (taskDate >= today || task.status === 'completed') return false;
      }
    }
    
    return true;
  });
};

const sortTasks = (tasks: Task[], sortBy: SortOption): Task[] => {
  return [...tasks].sort((a, b) => {
    switch (sortBy) {
      case 'dueDate':
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      case 'priority':
        const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      case 'created':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'alphabetical':
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });
};

const taskReducer = (state: TaskState, action: TaskAction): TaskState => {
  let newTasks: Task[];
  let filteredTasks: Task[];
  
  switch (action.type) {
    case 'SET_TASKS':
      newTasks = action.payload;
      filteredTasks = sortTasks(filterTasks(newTasks, state.filters), state.sortBy);
      return {
        ...state,
        tasks: newTasks,
        filteredTasks,
        stats: calculateStats(newTasks),
      };
    case 'ADD_TASK':
      newTasks = [...state.tasks, action.payload];
      filteredTasks = sortTasks(filterTasks(newTasks, state.filters), state.sortBy);
      return {
        ...state,
        tasks: newTasks,
        filteredTasks,
        stats: calculateStats(newTasks),
      };
    case 'UPDATE_TASK':
      newTasks = state.tasks.map(task =>
        task.id === action.payload.id ? { ...task, ...action.payload.updates, updatedAt: new Date() } : task
      );
      filteredTasks = sortTasks(filterTasks(newTasks, state.filters), state.sortBy);
      return {
        ...state,
        tasks: newTasks,
        filteredTasks,
        stats: calculateStats(newTasks),
      };
    case 'DELETE_TASK':
      newTasks = state.tasks.filter(task => task.id !== action.payload);
      filteredTasks = sortTasks(filterTasks(newTasks, state.filters), state.sortBy);
      return {
        ...state,
        tasks: newTasks,
        filteredTasks,
        stats: calculateStats(newTasks),
      };
    case 'SET_FILTERS':
      filteredTasks = sortTasks(filterTasks(state.tasks, action.payload), state.sortBy);
      return {
        ...state,
        filters: action.payload,
        filteredTasks,
      };
    case 'SET_SORT':
      filteredTasks = sortTasks(filterTasks(state.tasks, state.filters), action.payload);
      return {
        ...state,
        sortBy: action.payload,
        filteredTasks,
      };
    default:
      return state;
  }
};

export const TaskProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(taskReducer, {
    tasks: [],
    filteredTasks: [],
    filters: {},
    sortBy: 'created',
    stats: { total: 0, completed: 0, pending: 0, overdue: 0 },
  });

  useEffect(() => {
    if (user) {
      const storedTasks = localStorage.getItem(`taskflow_tasks_${user.id}`);
      if (storedTasks) {
        try {
          const tasks = JSON.parse(storedTasks).map((task: any) => ({
            ...task,
            createdAt: new Date(task.createdAt),
            updatedAt: new Date(task.updatedAt),
            dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
            completedAt: task.completedAt ? new Date(task.completedAt) : undefined,
          }));
          dispatch({ type: 'SET_TASKS', payload: tasks });
        } catch (error) {
          console.error('Error loading tasks:', error);
        }
      }
    }
  }, [user]);

  const saveTasks = (tasks: Task[]) => {
    if (user) {
      localStorage.setItem(`taskflow_tasks_${user.id}`, JSON.stringify(tasks));
    }
  };

  const addTask = (taskData: Omit<Task, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;
    
    const newTask: Task = {
      ...taskData,
      id: Date.now().toString(),
      userId: user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const updatedTasks = [...state.tasks, newTask];
    saveTasks(updatedTasks);
    dispatch({ type: 'ADD_TASK', payload: newTask });
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    const updatedTasks = state.tasks.map(task =>
      task.id === id ? { ...task, ...updates, updatedAt: new Date() } : task
    );
    saveTasks(updatedTasks);
    dispatch({ type: 'UPDATE_TASK', payload: { id, updates } });
  };

  const deleteTask = (id: string) => {
    const updatedTasks = state.tasks.filter(task => task.id !== id);
    saveTasks(updatedTasks);
    dispatch({ type: 'DELETE_TASK', payload: id });
  };

  const toggleTaskStatus = (id: string) => {
    const task = state.tasks.find(t => t.id === id);
    if (!task) return;
    
    const newStatus = task.status === 'completed' ? 'todo' : 'completed';
    const updates: Partial<Task> = { 
      status: newStatus,
      completedAt: newStatus === 'completed' ? new Date() : undefined,
    };
    
    updateTask(id, updates);
  };

  const setFilters = (filters: FilterOptions) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  };

  const setSortBy = (sort: SortOption) => {
    dispatch({ type: 'SET_SORT', payload: sort });
  };

  const clearFilters = () => {
    dispatch({ type: 'SET_FILTERS', payload: {} });
  };

  return (
    <TaskContext.Provider value={{
      ...state,
      addTask,
      updateTask,
      deleteTask,
      toggleTaskStatus,
      setFilters,
      setSortBy,
      clearFilters,
    }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = (): TaskContextType => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};