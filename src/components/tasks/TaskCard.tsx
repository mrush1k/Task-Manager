import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { format, isToday, isPast, isThisWeek } from 'date-fns';
import {
  Calendar,
  Clock,
  Edit,
  Trash2,
  Check,
  AlertCircle,
  Flag,
  User,
  Briefcase,
  ShoppingCart,
  Heart,
  BookOpen,
  MoreHorizontal,
} from 'lucide-react';
import { Task, TaskCategory } from '../../types';
import { useTasks } from '../../context/TaskContext';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
}

const categoryIcons: Record<TaskCategory, React.ReactNode> = {
  work: <Briefcase className="h-4 w-4" />,
  personal: <User className="h-4 w-4" />,
  shopping: <ShoppingCart className="h-4 w-4" />,
  health: <Heart className="h-4 w-4" />,
  learning: <BookOpen className="h-4 w-4" />,
  other: <MoreHorizontal className="h-4 w-4" />,
};

const priorityColors = {
  low: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20',
  medium: 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20',
  high: 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/20',
  urgent: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20',
};

const statusColors = {
  todo: 'border-l-gray-400',
  'in-progress': 'border-l-blue-500',
  completed: 'border-l-green-500',
};

const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit }) => {
  const { deleteTask, toggleTaskStatus } = useTasks();
  const [showActions, setShowActions] = useState(false);

  const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && task.status !== 'completed';
  const isDueToday = task.dueDate && isToday(new Date(task.dueDate));
  const isDueThisWeek = task.dueDate && isThisWeek(new Date(task.dueDate));

  const handleToggleComplete = () => {
    toggleTaskStatus(task.id);
  };

  const handleDelete = () => {
    deleteTask(task.id);
  };

  const getDueDateText = () => {
    if (!task.dueDate) return null;
    
    if (isDueToday) return 'Due today';
    if (isOverdue) return 'Overdue';
    if (isDueThisWeek) return `Due ${format(new Date(task.dueDate), 'EEEE')}`;
    return `Due ${format(new Date(task.dueDate), 'MMM dd')}`;
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -2 }}
      className={`bg-white dark:bg-gray-800 rounded-lg border-l-4 ${statusColors[task.status]} shadow-sm hover:shadow-md transition-all duration-200 p-4 group`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          {/* Checkbox */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleToggleComplete}
            className={`mt-1 flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
              task.status === 'completed'
                ? 'bg-green-500 border-green-500 text-white'
                : 'border-gray-300 dark:border-gray-600 hover:border-green-500 dark:hover:border-green-400'
            }`}
          >
            {task.status === 'completed' && <Check className="h-3 w-3" />}
          </motion.button>

          {/* Task content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className={`text-sm font-medium transition-all duration-200 ${
                  task.status === 'completed'
                    ? 'text-gray-500 dark:text-gray-400 line-through'
                    : 'text-gray-900 dark:text-white'
                }`}>
                  {task.title}
                </h3>
                {task.description && (
                  <p className={`text-xs mt-1 transition-all duration-200 ${
                    task.status === 'completed'
                      ? 'text-gray-400 dark:text-gray-500 line-through'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}>
                    {task.description}
                  </p>
                )}
              </div>

              {/* Actions */}
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: showActions ? 1 : 0, x: showActions ? 0 : 10 }}
                className="flex items-center space-x-1 ml-2"
              >
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onEdit(task)}
                  className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded transition-colors duration-200"
                >
                  <Edit className="h-3 w-3" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleDelete}
                  className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded transition-colors duration-200"
                >
                  <Trash2 className="h-3 w-3" />
                </motion.button>
              </motion.div>
            </div>

            {/* Meta information */}
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center space-x-3">
                {/* Category */}
                <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                  {categoryIcons[task.category]}
                  <span className="capitalize">{task.category}</span>
                </div>

                {/* Priority */}
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize ${priorityColors[task.priority]}`}>
                  <Flag className="h-3 w-3 mr-1" />
                  {task.priority}
                </span>
              </div>

              {/* Due date */}
              {task.dueDate && (
                <div className={`flex items-center space-x-1 text-xs ${
                  isOverdue ? 'text-red-600 dark:text-red-400' :
                  isDueToday ? 'text-orange-600 dark:text-orange-400' :
                  'text-gray-500 dark:text-gray-400'
                }`}>
                  {isOverdue ? <AlertCircle className="h-3 w-3" /> : <Calendar className="h-3 w-3" />}
                  <span>{getDueDateText()}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TaskCard;