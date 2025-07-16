
import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { syncManager } from '../../utils/syncManager';
import { format } from 'date-fns';

interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  lastSync: string | null;
  pendingChanges: number;
}

export const StatusBar: React.FC = () => {
  const [status, setStatus] = useState<SyncStatus>(syncManager.getStatus());

  useEffect(() => {
    const unsubscribe = syncManager.onStatusChange(setStatus);
    return unsubscribe;
  }, []);

  const handleForceSync = () => {
    syncManager.forceSync();
  };

  const getLastSyncText = () => {
    if (!status.lastSync) return 'Never';
    
    try {
      return format(new Date(status.lastSync), 'MMM d, h:mm a');
    } catch {
      return 'Unknown';
    }
  };

  return (
    <div className="flex items-center justify-between p-3 bg-muted/30 border-b">
      <div className="flex items-center gap-3">
        {/* Network Status */}
        <div className="flex items-center gap-2">
          {status.isOnline ? (
            <div className="flex items-center gap-1">
              <Wifi className="h-4 w-4 text-green-500" />
              <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                Online
              </Badge>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <WifiOff className="h-4 w-4 text-orange-500" />
              <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700">
                Offline
              </Badge>
            </div>
          )}
        </div>

        {/* Sync Status */}
        <div className="flex items-center gap-2">
          {status.isSyncing ? (
            <div className="flex items-center gap-1">
              <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
              <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                Syncing...
              </Badge>
            </div>
          ) : status.pendingChanges > 0 ? (
            <div className="flex items-center gap-1">
              <AlertCircle className="h-4 w-4 text-orange-500" />
              <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700">
                {status.pendingChanges} pending
              </Badge>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                Synced
              </Badge>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span>Last sync: {getLastSyncText()}</span>
        </div>
        
        {status.isOnline && !status.isSyncing && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleForceSync}
            className="h-6 px-2 text-xs"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Sync
          </Button>
        )}
      </div>
    </div>
  );
};
