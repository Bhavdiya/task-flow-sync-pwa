import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { useTask } from '../../contexts/TaskContext';
import { TaskItem } from '../Tasks/TaskItem';
import { format, isSameDay } from 'date-fns';

export const CalendarView: React.FC = () => {
  const { tasks } = useTask();
  const [date, setDate] = useState<Date | undefined>(new Date());

  // Filter tasks for the selected date
  // We use dueDate if available, otherwise fallback to createdAt for demonstration
  const tasksForDate = tasks.filter(task => {
    if (!date) return false;
    const taskDate = task.dueDate ? new Date(task.dueDate) : new Date(task.createdAt);
    return isSameDay(taskDate, date);
  });

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto flex flex-col md:flex-row gap-8">
      <div className="flex-none bg-white p-4 rounded-2xl shadow-sm border h-fit">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-md"
        />
      </div>
      
      <div className="flex-1 space-y-4">
        <h2 className="text-xl font-bold text-slate-800">
          Tasks for {date ? format(date, 'MMMM d, yyyy') : 'Selected Date'}
        </h2>
        
        {tasksForDate.length === 0 ? (
          <div className="bg-slate-50 border border-dashed rounded-xl p-8 text-center text-slate-500">
            No tasks scheduled for this day.
          </div>
        ) : (
          <div className="space-y-3">
            {tasksForDate.map(task => (
              <TaskItem key={task.id} task={task} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
