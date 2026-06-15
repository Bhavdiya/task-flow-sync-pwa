import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { syncManager } from '../../utils/syncManager';
import { Button } from '@/components/ui/button';
import { LogOut, RefreshCw, User } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { user, logout } = useAuth();

  const handleClearData = async () => {
    if (window.confirm("Are you sure you want to clear all local data? This action cannot be undone.")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border space-y-4">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <User className="w-5 h-5 text-blue-500" />
          Account Settings
        </h3>
        <div className="text-sm text-slate-600">
          <p><strong>Name:</strong> {user?.name}</p>
          <p><strong>Email:</strong> {user?.email}</p>
        </div>
        <Button onClick={logout} variant="secondary" className="w-full sm:w-auto">
          <LogOut className="w-4 h-4 mr-2" />
          Log Out
        </Button>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border space-y-4">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <RefreshCw className="w-5 h-5 text-emerald-500" />
          Synchronization
        </h3>
        <p className="text-sm text-slate-600">
          Your tasks are automatically synced when you are online. You can also force a sync.
        </p>
        <Button onClick={() => syncManager.forceSync()} variant="outline" className="w-full sm:w-auto">
          <RefreshCw className="w-4 h-4 mr-2" />
          Force Sync Now
        </Button>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-red-100 space-y-4">
        <h3 className="text-lg font-bold text-red-600">Danger Zone</h3>
        <p className="text-sm text-slate-600">
          Clear all local application data, including unsynced tasks and authentication tokens.
        </p>
        <Button onClick={handleClearData} variant="destructive" className="w-full sm:w-auto">
          Clear All Data
        </Button>
      </div>
    </div>
  );
};
