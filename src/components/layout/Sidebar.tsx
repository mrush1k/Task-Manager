import React from 'react';
import { motion } from 'framer-motion';
import {
  Home,
  CheckSquare,
  Clock,
  Star,
  Briefcase,
  User,
  ShoppingCart,
  Heart,
  BookOpen,
  MoreHorizontal,
  Plus,
  Filter,
  Calendar,
  BarChart3,
} from 'lucide-react';
import { TaskCategory, FilterOptions } from '../../types';
import { useTasks } from '../../context/TaskContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const categoryIcons: Record<TaskCategory, React.ReactNode> = {
  work: <Briefcase className="h-4 w-4" />,
  personal: <User className="h-4 w-4" />,
  shopping: <ShoppingCart className="h-4 w-4" />,
  health: <Heart className="h-4 w-4" />,
  learning: <BookOpen className="h-4 w-4" />,
  other: <MoreHorizontal className="h-4 w-4" />,
};

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { stats, filters, setFilters, clearFilters } = useTasks();

  const handleFilterClick = (newFilters: FilterOptions) => {
    setFilters({ ...filters, ...newFilters });
    // Close mobile sidebar after selection
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  const quickFilters = [
    { label: 'All Tasks', icon: <Home className="h-4 w-4" />, filters: {}, count: stats.total },
    { label: 'Completed', icon: <CheckSquare className="h-4 w-4" />, filters: { status: 'completed' as const }, count: stats.completed },
    { label: 'Pending', icon: <Clock className="h-4 w-4" />, filters: { status: 'todo' as const }, count: stats.pending },
    { label: 'High Priority', icon: <Star className="h-4 w-4" />, filters: { priority: 'high' as const }, count: 0 },
  ];

  const categories: { label: string; value: TaskCategory }[] = [
    { label: 'Work', value: 'work' },
    { label: 'Personal', value: 'personal' },
    { label: 'Shopping', value: 'shopping' },
    { label: 'Health', value: 'health' },
    { label: 'Learning', value: 'learning' },
    { label: 'Other', value: 'other' },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
        />
      )}

      {/* Sidebar - Always visible on desktop */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: isOpen || window.innerWidth >= 1024 ? 0 : -300 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed left-0 top-0 h-full w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-50 lg:relative lg:translate-x-0 lg:z-0 lg:block"
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <CheckSquare className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-gray-900 dark:text-white">TaskFlow</span>
                <p className="text-xs text-gray-500 dark:text-gray-400">Organize your life</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {/* Quick Filters */}
            <div>
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
                Quick Filters
              </h3>
              <div className="space-y-2">
                {quickFilters.map((filter) => (
                  <motion.button
                    key={filter.label}
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleFilterClick(filter.filters)}
                    className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                        {filter.icon}
                      </div>
                      <span>{filter.label}</span>
                    </div>
                    <span className="text-xs bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full min-w-[24px] text-center">
                      {filter.count}
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Categories */}
            <div>
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
                Categories
              </h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <motion.button
                    key={category.value}
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleFilterClick({ category: category.value })}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 group"
                  >
                    <div className="text-gray-500 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-200">
                      {categoryIcons[category.value]}
                    </div>
                    <span>{category.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Date Filters */}
            <div>
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
                Due Date
              </h3>
              <div className="space-y-2">
                <motion.button
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleFilterClick({ dueDate: 'today' })}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 group"
                >
                  <div className="text-gray-500 dark:text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-200">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <span>Today</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleFilterClick({ dueDate: 'week' })}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 group"
                >
                  <div className="text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <span>This Week</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleFilterClick({ dueDate: 'overdue' })}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 group"
                >
                  <div className="group-hover:text-red-700 dark:group-hover:text-red-300 transition-colors duration-200">
                    <Clock className="h-4 w-4" />
                  </div>
                  <span>Overdue ({stats.overdue})</span>
                </motion.button>
              </div>
            </div>

            {/* Progress Overview */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Progress Overview</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                    <span>Completed</span>
                    <span>{stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="text-center p-2 bg-white dark:bg-gray-800 rounded-lg">
                    <div className="font-semibold text-gray-900 dark:text-white">{stats.completed}</div>
                    <div className="text-gray-500 dark:text-gray-400">Done</div>
                  </div>
                  <div className="text-center p-2 bg-white dark:bg-gray-800 rounded-lg">
                    <div className="font-semibold text-gray-900 dark:text-white">{stats.pending}</div>
                    <div className="text-gray-500 dark:text-gray-400">Pending</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Clear Filters */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-700">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={clearFilters}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200"
            >
              <Filter className="h-4 w-4" />
              <span>Clear All Filters</span>
            </motion.button>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default Sidebar;