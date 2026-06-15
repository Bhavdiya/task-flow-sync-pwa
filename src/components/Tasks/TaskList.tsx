import React, { useState } from 'react';
import { TaskItem } from './TaskItem';
import { TaskCreateDialog } from './TaskCreateDialog';
import { useTask } from '../../contexts/TaskContext';
import { ClipboardList, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaskListProps {
  viewMode?: 'dashboard' | 'tasks';
}

export const TaskList: React.FC<TaskListProps> = ({ viewMode = 'tasks' }) => {
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const { tasks, loading } = useTask();

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  const stats = {
    total: tasks.length,
    active: tasks.filter(t => !t.completed).length,
    completed: tasks.filter(t => t.completed).length,
    overdue: tasks.filter(t => !t.completed && t.dueDate && t.dueDate < new Date().toTimeString().substring(0, 5)).length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 h-full">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="h-5 w-5 animate-spin" />
          <span>Loading tasks...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 p-4 md:p-8">
      
      {/* Dashboard Stats (Only in dashboard view) */}
      {viewMode === 'dashboard' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard title="All Tasks" value={stats.total} icon={ClipboardList} iconColor="text-blue-500" bgColor="bg-blue-50" />
          <StatCard title="In Progress" value={stats.active} icon={Clock} iconColor="text-orange-500" bgColor="bg-orange-50" />
          <StatCard title="Completed" value={stats.completed} icon={CheckCircle2} iconColor="text-green-500" bgColor="bg-green-50" />
          <StatCard title="Overdue" value={stats.overdue} icon={AlertCircle} iconColor="text-red-500" bgColor="bg-red-50" />
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 bg-white rounded-2xl shadow-sm border p-4 md:p-6 overflow-hidden flex flex-col">
        
        {/* Header/Tabs */}
        <div className="flex items-center justify-between mb-6">
          {viewMode === 'dashboard' ? (
            <h2 className="text-lg font-bold text-slate-800">Today</h2>
          ) : (
            <div className="flex space-x-6 border-b w-full">
              <TabButton active={filter === 'all'} onClick={() => setFilter('all')}>All</TabButton>
              <TabButton active={filter === 'active'} onClick={() => setFilter('active')}>In Progress</TabButton>
              <TabButton active={filter === 'completed'} onClick={() => setFilter('completed')}>Completed</TabButton>
            </div>
          )}
        </div>

        {/* Task List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-2">
          {filteredTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center">
              <p className="text-slate-400 font-medium">No tasks found</p>
              <p className="text-sm text-slate-400 mt-1">Get started by creating a new task.</p>
            </div>
          ) : (
            filteredTasks.map((task) => (
              <TaskItem key={task.id} task={task} />
            ))
          )}
        </div>
        
        {viewMode === 'dashboard' && (
          <div className="mt-4 pt-4 border-t">
            <button className="text-blue-600 text-sm font-medium hover:underline">
              View all tasks →
            </button>
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <TaskCreateDialog />
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
  iconColor: string;
  bgColor: string;
}

function StatCard({ title, value, icon: Icon, iconColor, bgColor }: StatCardProps) {
  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border flex items-center justify-between">
      <div>
        <div className="text-2xl font-bold text-slate-800">{value}</div>
        <div className="text-xs font-medium text-slate-500 mt-1">{title}</div>
      </div>
      <div className={`p-3 rounded-full ${bgColor}`}>
        <Icon className={`w-6 h-6 ${iconColor}`} />
      </div>
    </div>
  );
}

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

function TabButton({ active, onClick, children }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "pb-3 text-sm font-medium transition-colors relative",
        active ? "text-blue-600" : "text-slate-500 hover:text-slate-800"
      )}
    >
      {children}
      {active && (
        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full" />
      )}
    </button>
  );
}
