
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  CheckSquare, 
  Square, 
  RefreshCw,
  Inbox
} from 'lucide-react';
import { TaskItem } from './TaskItem';
import { TaskCreateDialog } from './TaskCreateDialog';
import { useTask } from '../../contexts/TaskContext';
import { type Task } from '../../utils/indexedDB';

export const TaskList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const { tasks, loading, refreshTasks } = useTask();

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filter === 'all' || 
                         (filter === 'active' && !task.completed) ||
                         (filter === 'completed' && task.completed);
    
    return matchesSearch && matchesFilter;
  });

  const taskCounts = {
    total: tasks.length,
    active: tasks.filter(t => !t.completed).length,
    completed: tasks.filter(t => t.completed).length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5 animate-spin" />
          <span>Loading tasks...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Search and Filter Bar */}
      <div className="p-4 space-y-4 bg-background border-b">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <div className="flex gap-1">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
                className="h-8"
              >
                All ({taskCounts.total})
              </Button>
              <Button
                variant={filter === 'active' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('active')}
                className="h-8"
              >
                <Square className="h-3 w-3 mr-1" />
                Active ({taskCounts.active})
              </Button>
              <Button
                variant={filter === 'completed' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('completed')}
                className="h-8"
              >
                <CheckSquare className="h-3 w-3 mr-1" />
                Done ({taskCounts.completed})
              </Button>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={refreshTasks}
              className="h-8"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Refresh
            </Button>
            <div className="hidden md:block">
              <TaskCreateDialog />
            </div>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto">
        {filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <Inbox className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              {searchTerm ? 'No matching tasks' : 
               filter === 'completed' ? 'No completed tasks' :
               filter === 'active' ? 'No active tasks' : 'No tasks yet'}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {searchTerm ? 'Try adjusting your search terms' :
               filter === 'completed' ? 'Complete some tasks to see them here' :
               filter === 'active' ? 'All your tasks are completed!' :
               'Create your first task to get started'}
            </p>
            {!searchTerm && filter === 'all' && (
              <div className="md:hidden">
                <TaskCreateDialog />
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {filteredTasks.map((task) => (
              <TaskItem key={task.id} task={task} />
            ))}
          </div>
        )}
      </div>

      {/* Mobile FAB */}
      <div className="md:hidden">
        <TaskCreateDialog />
      </div>
    </div>
  );
};
