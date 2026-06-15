import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2 } from 'lucide-react';
import { type Task } from '../../utils/indexedDB';
import { useTask } from '../../contexts/TaskContext';
import { TaskEditDialog } from './TaskEditDialog';

interface TaskItemProps {
  task: Task;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task }) => {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const { toggleTask, deleteTask } = useTask();

  const handleToggle = () => {
    toggleTask(task.id);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      deleteTask(task.id);
    }
  };

  const formatTime = (timeStr?: string) => {
    if (!timeStr) return '';
    // timeStr is expected to be "HH:mm" from input type="time"
    const [h, m] = timeStr.split(':');
    if (!h || !m) return timeStr;
    const hour = parseInt(h, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${m} ${ampm}`;
  };

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'Design': return 'bg-purple-50 text-purple-600';
      case 'Development': return 'bg-blue-50 text-blue-600';
      case 'Docs': return 'bg-emerald-50 text-emerald-600';
      case 'Meeting': return 'bg-fuchsia-50 text-fuchsia-600';
      default: return 'bg-gray-50 text-gray-600';
    }
  };

  return (
    <>
      <div className={`group flex items-center justify-between p-3 rounded-xl transition-all hover:bg-slate-50 ${
        task.completed ? 'opacity-60' : ''
      }`}>
        <div className="flex items-center gap-4 flex-1">
          {/* Circular Checkbox */}
          <button 
            onClick={handleToggle}
            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
              task.completed 
                ? 'bg-blue-500 border-blue-500' 
                : 'border-slate-300 hover:border-blue-500'
            }`}
          >
            {task.completed && (
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>
          
          <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3 flex-1 min-w-0">
            <h3 className={`font-medium text-slate-700 truncate ${
              task.completed ? 'line-through text-slate-400' : ''
            }`}>
              {task.title}
            </h3>
            
            {task.category && (
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium w-fit ${getCategoryColor(task.category)}`}>
                {task.category}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 pl-4 flex-shrink-0">
          <span className="text-xs text-slate-400 font-medium">
            {formatTime(task.dueDate)}
          </span>
          
          <div className="hidden group-hover:flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsEditOpen(true)}
              className="h-8 w-8 text-slate-400 hover:text-slate-700"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDelete}
              className="h-8 w-8 text-slate-400 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <TaskEditDialog
        task={task}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
      />
    </>
  );
};
