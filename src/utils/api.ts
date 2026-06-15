import type { Task, User } from './indexedDB';

interface LoginCredentials {
  email: string;
  password?: string;
}

interface RegisterCredentials extends LoginCredentials {
  name: string;
}

interface AuthResponse {
  user: User;
  token: string;
}

interface ServerData {
  users: User[];
  tasks: Task[];
}

const DELAY_MS = 500; // Simulated network latency

class APIService {
  private token: string | null = null;
  private currentUser: User | null = null;

  constructor() {
    this.token = localStorage.getItem('auth_token');
    if (this.token) {
      const db = this.getServerDB();
      this.currentUser = db.users.find(u => u.id === this.token) || null;
    }
  }

  private getServerDB(): ServerData {
    const data = localStorage.getItem('SERVER_DB_MOCK');
    if (data) return JSON.parse(data);
    return { users: [], tasks: [] };
  }

  private saveServerDB(db: ServerData) {
    localStorage.setItem('SERVER_DB_MOCK', JSON.stringify(db));
  }

  private delay<T>(data: T): Promise<T> {
    return new Promise(resolve => setTimeout(() => resolve(data), DELAY_MS));
  }

  // Auth methods
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const db = this.getServerDB();
    let user = db.users.find(u => u.email === credentials.email);
    
    // Auto-create user for mock purposes if they don't exist
    if (!user) {
      user = {
        id: crypto.randomUUID(),
        email: credentials.email,
        name: credentials.email.split('@')[0],
        createdAt: new Date().toISOString()
      };
      db.users.push(user);
      this.saveServerDB(db);
    }

    this.token = user.id;
    this.currentUser = user;
    localStorage.setItem('auth_token', this.token);
    
    return this.delay({ user, token: this.token });
  }

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    return this.login(credentials);
  }

  async logout(): Promise<void> {
    this.token = null;
    this.currentUser = null;
    localStorage.removeItem('auth_token');
    return this.delay(undefined);
  }

  // Task methods
  async getTasks(): Promise<Task[]> {
    if (!this.token) throw new Error('Unauthorized');
    const db = this.getServerDB();
    const userTasks = db.tasks.filter(t => t.userId === this.token && !t.deleted);
    return this.delay(userTasks);
  }

  async createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'synced'>): Promise<Task> {
    if (!this.token) throw new Error('Unauthorized');
    const db = this.getServerDB();
    
    const newTask: Task = {
      ...task,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      synced: true,
      userId: this.token,
    };

    db.tasks.push(newTask);
    this.saveServerDB(db);
    
    return this.delay(newTask);
  }

  async updateTask(taskId: string, updates: Partial<Task>): Promise<Task> {
    if (!this.token) throw new Error('Unauthorized');
    const db = this.getServerDB();
    const index = db.tasks.findIndex(t => t.id === taskId && t.userId === this.token);
    
    if (index === -1) throw new Error('Task not found');
    
    db.tasks[index] = {
      ...db.tasks[index],
      ...updates,
      updatedAt: new Date().toISOString(),
      synced: true,
    };
    
    this.saveServerDB(db);
    return this.delay(db.tasks[index]);
  }

  async deleteTask(taskId: string): Promise<void> {
    if (!this.token) throw new Error('Unauthorized');
    const db = this.getServerDB();
    const index = db.tasks.findIndex(t => t.id === taskId && t.userId === this.token);
    
    if (index === -1) throw new Error('Task not found');
    
    db.tasks[index].deleted = true;
    db.tasks[index].synced = true;
    db.tasks[index].updatedAt = new Date().toISOString();
    
    this.saveServerDB(db);
    return this.delay(undefined);
  }

  // Sync methods
  async syncTasks(tasks: Task[]): Promise<{ success: Task[]; errors: Error[] }> {
    if (!this.token) throw new Error('Unauthorized');
    const db = this.getServerDB();
    const success: Task[] = [];
    const errors: Error[] = [];

    for (const localTask of tasks) {
      try {
        const index = db.tasks.findIndex(t => t.id === localTask.id && t.userId === this.token);
        
        if (index >= 0) {
          const serverTask = db.tasks[index];
          // Simple conflict resolution: last write wins
          if (new Date(localTask.updatedAt) > new Date(serverTask.updatedAt)) {
            db.tasks[index] = { ...localTask, synced: true };
            success.push(db.tasks[index]);
          } else {
            success.push(serverTask); // Server is newer, client needs to fetch
          }
        } else {
          // New task
          const newTask = { ...localTask, synced: true };
          db.tasks.push(newTask);
          success.push(newTask);
        }
      } catch (err: unknown) {
        errors.push(err instanceof Error ? err : new Error(String(err)));
      }
    }

    this.saveServerDB(db);
    return this.delay({ success, errors });
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  getToken(): string | null {
    return this.token;
  }
}

export const apiService = new APIService();
