
import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiService } from '../utils/api';
import { dbManager, type User } from '../utils/indexedDB';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      await dbManager.init();
      
      const token = apiService.getToken();
      const userId = localStorage.getItem('currentUserId');
      
      if (token && userId) {
        const savedUser = await dbManager.getUser(userId);
        if (savedUser) {
          setUser(savedUser);
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      // For demo purposes, we'll create a mock login
      const mockUser: User = {
        id: `user_${Date.now()}`,
        email,
        name: email.split('@')[0],
        createdAt: new Date().toISOString()
      };
      
      // In a real app, this would come from the API
      localStorage.setItem('auth_token', `token_${mockUser.id}`);
      localStorage.setItem('currentUserId', mockUser.id);
      
      await dbManager.saveUser(mockUser);
      setUser(mockUser);
      
      console.log('Login successful:', mockUser);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      setLoading(true);
      
      // For demo purposes, we'll create a mock registration
      const mockUser: User = {
        id: `user_${Date.now()}`,
        email,
        name,
        createdAt: new Date().toISOString()
      };
      
      localStorage.setItem('auth_token', `token_${mockUser.id}`);
      localStorage.setItem('currentUserId', mockUser.id);
      
      await dbManager.saveUser(mockUser);
      setUser(mockUser);
      
      console.log('Registration successful:', mockUser);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
      localStorage.removeItem('currentUserId');
      setUser(null);
      console.log('Logout successful');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
