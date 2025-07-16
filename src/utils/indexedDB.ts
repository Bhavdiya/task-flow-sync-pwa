
interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
  synced: boolean;
  deleted?: boolean;
}

interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

class IndexedDBManager {
  private db: IDBDatabase | null = null;
  private readonly dbName = 'TaskSyncDB';
  private readonly version = 1;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Tasks store
        if (!db.objectStoreNames.contains('tasks')) {
          const tasksStore = db.createObjectStore('tasks', { keyPath: 'id' });
          tasksStore.createIndex('userId', 'userId', { unique: false });
          tasksStore.createIndex('synced', 'synced', { unique: false });
          tasksStore.createIndex('updatedAt', 'updatedAt', { unique: false });
        }

        // Users store
        if (!db.objectStoreNames.contains('users')) {
          db.createObjectStore('users', { keyPath: 'id' });
        }

        // Sync queue store
        if (!db.objectStoreNames.contains('syncQueue')) {
          const syncStore = db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
          syncStore.createIndex('action', 'action', { unique: false });
          syncStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  async addTask(task: Task): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    const transaction = this.db.transaction(['tasks'], 'readwrite');
    const store = transaction.objectStore('tasks');
    await store.add(task);
  }

  async updateTask(task: Task): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    const transaction = this.db.transaction(['tasks'], 'readwrite');
    const store = transaction.objectStore('tasks');
    await store.put(task);
  }

  async deleteTask(taskId: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    const transaction = this.db.transaction(['tasks'], 'readwrite');
    const store = transaction.objectStore('tasks');
    await store.delete(taskId);
  }

  async getTasks(userId: string): Promise<Task[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['tasks'], 'readonly');
      const store = transaction.objectStore('tasks');
      const index = store.index('userId');
      const request = index.getAll(userId);

      request.onsuccess = () => {
        const tasks = request.result.filter((task: Task) => !task.deleted);
        resolve(tasks);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getUnsyncedTasks(userId: string): Promise<Task[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['tasks'], 'readonly');
      const store = transaction.objectStore('tasks');
      const request = store.getAll();

      request.onsuccess = () => {
        const tasks = request.result.filter((task: Task) => 
          task.userId === userId && !task.synced
        );
        resolve(tasks);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async addToSyncQueue(action: string, data: any): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    const transaction = this.db.transaction(['syncQueue'], 'readwrite');
    const store = transaction.objectStore('syncQueue');
    await store.add({
      action,
      data,
      timestamp: new Date().toISOString()
    });
  }

  async getSyncQueue(): Promise<any[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['syncQueue'], 'readonly');
      const store = transaction.objectStore('syncQueue');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async clearSyncQueue(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    const transaction = this.db.transaction(['syncQueue'], 'readwrite');
    const store = transaction.objectStore('syncQueue');
    await store.clear();
  }

  async saveUser(user: User): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    const transaction = this.db.transaction(['users'], 'readwrite');
    const store = transaction.objectStore('users');
    await store.put(user);
  }

  async getUser(userId: string): Promise<User | null> {
    if (!this.db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['users'], 'readonly');
      const store = transaction.objectStore('users');
      const request = store.get(userId);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }
}

export const dbManager = new IndexedDBManager();
export type { Task, User };
