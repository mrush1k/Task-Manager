import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';
import TaskCard from './TaskCard';
import { Task } from '../../types';
import { useTasks } from '../../context/TaskContext';

interface TaskListProps {
  onEditTask: (task: Task) => void;
}

const TaskList: React.FC<TaskListProps> = ({ onEditTask }) => {
  const { filteredTasks, stats } = useTasks();

  if (filteredTasks.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12"
      >
        <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
          <CheckCircle className="h-12 w-12 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No tasks found</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {stats.total === 0 
            ? "You don't have any tasks yet. Create your first task to get started!"
            : "No tasks match your current filters. Try adjusting your search or filters."
          }
        </p>
      </motion.div>
    );
  }

  // Group tasks by status for better organization
  const todoTasks = filteredTasks.filter(task => task.status === 'todo');
  const inProgressTasks = filteredTasks.filter(task => task.status === 'in-progress');
  const completedTasks = filteredTasks.filter(task => task.status === 'completed');

  const TaskSection: React.FC<{ title: string; tasks: Task[]; icon: React.ReactNode; color: string }> = ({
    title,
    tasks,
    icon,
    color
  }) => {
    if (tasks.length === 0) return null;

    return (
      <div className="mb-8">
        <div className={`flex items-center space-x-2 mb-4 pb-2 border-b-2 ${color}`}>
          {icon}
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title} ({tasks.length})
          </h2>
        </div>
        <div className="space-y-3">
          <AnimatePresence>
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={onEditTask}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <TaskSection
        title="To Do"
        tasks={todoTasks}
        icon={<Clock className="h-5 w-5 text-gray-500" />}
        color="border-gray-300 dark:border-gray-600"
      />
      
      <TaskSection
        title="In Progress"
        tasks={inProgressTasks}
        icon={<AlertCircle className="h-5 w-5 text-blue-500" />}
        color="border-blue-300 dark:border-blue-600"
      />
      
      <TaskSection
        title="Completed"
        tasks={completedTasks}
        icon={<CheckCircle className="h-5 w-5 text-green-500" />}
        color="border-green-300 dark:border-green-600"
      />
    </motion.div>
  );
};

export default TaskList;