import React, { useState } from 'react';
import { Header } from './Header';
import { StatusBar } from './StatusBar';
import { TaskList } from '../Tasks/TaskList';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { ProjectsView } from '../Views/ProjectsView';
import { CalendarView } from '../Views/CalendarView';
import { SettingsView } from '../Views/SettingsView';

export const AppLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const getHeaderTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Dashboard';
      case 'tasks': return 'My Tasks';
      case 'projects': return 'Projects';
      case 'calendar': return 'Calendar';
      case 'settings': return 'Settings';
      default: return 'Task-Flow-Sync';
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
      case 'tasks':
        return <TaskList viewMode={activeTab as 'dashboard' | 'tasks'} />;
      case 'projects':
        return <ProjectsView />;
      case 'calendar':
        return <CalendarView />;
      case 'settings':
        return <SettingsView />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Desktop Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header title={getHeaderTitle()} />
        <StatusBar />
        
        <main className="flex-1 overflow-y-auto pb-16 md:pb-0 relative">
          {renderContent()}
        </main>

        {/* Mobile Bottom Navigation */}
        <BottomNav activeTab={activeTab === 'dashboard' ? 'tasks' : activeTab} setActiveTab={setActiveTab} />
      </div>
    </div>
  );
};
