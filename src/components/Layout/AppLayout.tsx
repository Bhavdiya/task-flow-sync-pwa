
import React from 'react';
import { Header } from './Header';
import { StatusBar } from './StatusBar';
import { TaskList } from '../Tasks/TaskList';

export const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <StatusBar />
      <TaskList />
    </div>
  );
};
