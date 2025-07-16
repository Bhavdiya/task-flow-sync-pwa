
import { dbManager, type Task } from './indexedDB';
import { apiService } from './api';

interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  lastSync: string | null;
  pendingChanges: number;
}

class SyncManager {
  private syncStatus: SyncStatus = {
    isOnline: navigator.onLine,
    isSyncing: false,
    lastSync: localStorage.getItem('lastSync'),
    pendingChanges: 0
  };

  private listeners: Set<(status: SyncStatus) => void> = new Set();

  constructor() {
    this.initializeNetworkListeners();
    this.updatePendingChanges();
  }

  private initializeNetworkListeners(): void {
    window.addEventListener('online', () => {
      console.log('Network: Back online');
      this.syncStatus.isOnline = true;
      this.notifyListeners();
      this.performSync();
    });

    window.addEventListener('offline', () => {
      console.log('Network: Gone offline');
      this.syncStatus.isOnline = false;
      this.notifyListeners();
    });
  }

  private async updatePendingChanges(): Promise<void> {
    try {
      const currentUser = localStorage.getItem('currentUserId');
      if (!currentUser) return;

      const unsyncedTasks = await dbManager.getUnsyncedTasks(currentUser);
      this.syncStatus.pendingChanges = unsyncedTasks.length;
      this.notifyListeners();
    } catch (error) {
      console.error('Error updating pending changes:', error);
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener({ ...this.syncStatus }));
  }

  onStatusChange(callback: (status: SyncStatus) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  async performSync(): Promise<void> {
    if (!this.syncStatus.isOnline || this.syncStatus.isSyncing) {
      return;
    }

    if (!apiService.isAuthenticated()) {
      console.log('Sync: User not authenticated');
      return;
    }

    const currentUser = localStorage.getItem('currentUserId');
    if (!currentUser) return;

    this.syncStatus.isSyncing = true;
    this.notifyListeners();

    try {
      console.log('Sync: Starting synchronization');

      // Get unsynced local tasks
      const unsyncedTasks = await dbManager.getUnsyncedTasks(currentUser);
      console.log(`Sync: Found ${unsyncedTasks.length} unsynced tasks`);

      // Sync local changes to server
      if (unsyncedTasks.length > 0) {
        const syncResult = await apiService.syncTasks(unsyncedTasks);
        
        // Mark successfully synced tasks
        for (const task of syncResult.success) {
          await dbManager.updateTask({ ...task, synced: true });
        }

        console.log(`Sync: Successfully synced ${syncResult.success.length} tasks`);
        if (syncResult.errors.length > 0) {
          console.warn(`Sync: ${syncResult.errors.length} tasks failed to sync`, syncResult.errors);
        }
      }

      // Fetch latest tasks from server
      try {
        const serverTasks = await apiService.getTasks();
        
        // Update local database with server tasks
        for (const task of serverTasks) {
          const existingTask = await this.getLocalTask(task.id);
          
          if (!existingTask) {
            // New task from server
            await dbManager.addTask({ ...task, synced: true });
          } else if (new Date(task.updatedAt) > new Date(existingTask.updatedAt)) {
            // Server version is newer
            await dbManager.updateTask({ ...task, synced: true });
          }
        }

        console.log(`Sync: Updated with ${serverTasks.length} tasks from server`);
      } catch (error) {
        console.error('Sync: Error fetching server tasks:', error);
      }

      // Update sync status
      this.syncStatus.lastSync = new Date().toISOString();
      localStorage.setItem('lastSync', this.syncStatus.lastSync);
      
      await this.updatePendingChanges();
      
      console.log('Sync: Synchronization completed successfully');

    } catch (error) {
      console.error('Sync: Error during synchronization:', error);
    } finally {
      this.syncStatus.isSyncing = false;
      this.notifyListeners();
    }
  }

  private async getLocalTask(taskId: string): Promise<Task | null> {
    const currentUser = localStorage.getItem('currentUserId');
    if (!currentUser) return null;

    const tasks = await dbManager.getTasks(currentUser);
    return tasks.find(task => task.id === taskId) || null;
  }

  async forceSync(): Promise<void> {
    console.log('Sync: Force sync requested');
    await this.performSync();
  }

  getStatus(): SyncStatus {
    return { ...this.syncStatus };
  }
}

export const syncManager = new SyncManager();
