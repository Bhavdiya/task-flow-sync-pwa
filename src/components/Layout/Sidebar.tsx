import React from 'react';
import { LayoutDashboard, CheckSquare, Folder, Calendar, Settings, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tasks', label: 'My Tasks', icon: CheckSquare },
    { id: 'projects', label: 'Projects', icon: Folder },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="hidden md:flex w-64 flex-col bg-background border-r h-screen">
      <div className="p-6 flex items-center gap-2">
        <div className="bg-blue-600 text-white rounded-lg p-1.5">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <span className="font-bold text-xl tracking-tight">Task-Flow-Sync</span>
      </div>
      
      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium transition-colors",
              activeTab === item.id
                ? "bg-blue-50 text-blue-600"
                : "text-muted-foreground hover:bg-slate-50 hover:text-foreground"
            )}
          >
            <item.icon className={cn("h-5 w-5", activeTab === item.id ? "text-blue-600" : "text-slate-400")} />
            {item.label}
          </button>
        ))}
      </nav>
      
      <div className="p-6 mt-auto">
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Synced
          </span>
          <span className="text-slate-300">•</span>
          <span>Just now</span>
        </div>
      </div>
    </div>
  );
};
