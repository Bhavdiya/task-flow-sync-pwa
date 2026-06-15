
import React, { createContext, useContext, useEffect, useState } from 'react';
import { dbManager, type Task as TaskType } from '../utils/indexedDB';
import { syncManager } from '../utils/syncManager';
import { useAuth } from './AuthContext';
import { toast } from '@/hooks/use-toast';

interface TaskContextType {
  tasks: TaskType[];
  loading: boolean;
  createTask: (title: string, description?: string, category?: string, dueDate?: string) => Promise<void>;
  updateTask: (taskId: string, updates: Partial<TaskType>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  toggleTask: (taskId: string) => Promise<void>;
  refreshTasks: () => Promise<void>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const useTask = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTask must be used within a TaskProvider');
  }
  return context;
};

interface TaskProviderProps {
  children: React.ReactNode;
}

export const TaskProvider: React.FC<TaskProviderProps> = ({ children }) => {
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const loadTasks = React.useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const userTasks = await dbManager.getTasks(user.id);
      setTasks(userTasks.sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      ));
    } catch (error) {
      console.error('Error loading tasks:', error);
      toast({
        title: "Error",
        description: "Failed to load tasks",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadTasks();
    } else {
      setTasks([]);
      setLoading(false);
    }
  }, [user, loadTasks]);

  const createTask = async (title: string, description: string = '', category?: string, dueDate?: string) => {
    if (!user) return;

    try {
      const newTask: TaskType = {
        id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title,
        description,
        completed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: user.id,
        synced: false,
        category,
        dueDate
      };

      await dbManager.addTask(newTask);
      setTasks(prev => [newTask, ...prev]);
      
      toast({
        title: "Task created",
        description: `"${title}" has been added to your tasks`,
      });

      // Trigger background sync if online
      if (navigator.onLine) {
        syncManager.performSync();
      }

      console.log('Task created:', newTask);
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        title: "Error",
        description: "Failed to create task",
        variant: "destructive"
      });
    }
  };

  const updateTask = async (taskId: string, updates: Partial<TaskType>) => {
    if (!user) return;

    try {
      const existingTask = tasks.find(t => t.id === taskId);
      if (!existingTask) return;

      const updatedTask: TaskType = {
        ...existingTask,
        ...updates,
        updatedAt: new Date().toISOString(),
        synced: false
      };

      await dbManager.updateTask(updatedTask);
      setTasks(prev => prev.map(task => 
        task.id === taskId ? updatedTask : task
      ));

      // Trigger background sync if online
      if (navigator.onLine) {
        syncManager.performSync();
      }

      console.log('Task updated:', updatedTask);
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive"
      });
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!user) return;

    try {
      const taskToDelete = tasks.find(t => t.id === taskId);
      if (!taskToDelete) return;

      // Mark as deleted for sync purposes
      const deletedTask: TaskType = {
        ...taskToDelete,
        deleted: true,
        updatedAt: new Date().toISOString(),
        synced: false
      };

      await dbManager.updateTask(deletedTask);
      setTasks(prev => prev.filter(task => task.id !== taskId));
      
      toast({
        title: "Task deleted",
        description: `"${taskToDelete.title}" has been removed`,
      });

      // Trigger background sync if online
      if (navigator.onLine) {
        syncManager.performSync();
      }

      console.log('Task deleted:', taskId);
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive"
      });
    }
  };

  const toggleTask = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    await updateTask(taskId, { completed: !task.completed });
    
    toast({
      title: task.completed ? "Task reopened" : "Task completed",
      description: `"${task.title}" marked as ${task.completed ? 'incomplete' : 'complete'}`,
    });
  };

  const refreshTasks = async () => {
    await loadTasks();
  };

  const value: TaskContextType = {
    tasks,
    loading,
    createTask,
    updateTask,
    deleteTask,
    toggleTask,
    refreshTasks
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
};
