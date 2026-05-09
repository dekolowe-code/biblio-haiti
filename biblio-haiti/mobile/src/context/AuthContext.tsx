import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { STORAGE_KEYS, USER_ROLES } from '../constants';
import apiService from '../services/api';

interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  avatar_url?: string;
  stars_balance: number;
  is_author: boolean;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    try {
      const userData = await SecureStore.getItemAsync(STORAGE_KEYS.USER_DATA);
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function login(email: string, password: string) {
    try {
      const response = await apiService.login(email, password);
      setUser(response.user);
      await SecureStore.setItemAsync(STORAGE_KEYS.USER_DATA, JSON.stringify(response.user));
    } catch (error) {
      throw error;
    }
  }

  async function register(userData: any) {
    try {
      const response = await apiService.register(userData);
      // Auto-login after registration
      await login(userData.email, userData.password);
    } catch (error) {
      throw error;
    }
  }

  async function logout() {
    try {
      await apiService.logout();
      await SecureStore.deleteItemAsync(STORAGE_KEYS.USER_DATA);
      setUser(null);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }

  async function refreshUser() {
    try {
      const currentUser = await apiService.getCurrentUser();
      setUser(currentUser);
      await SecureStore.setItemAsync(STORAGE_KEYS.USER_DATA, JSON.stringify(currentUser));
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  }

  function updateUser(data: Partial<User>) {
    if (user) {
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      SecureStore.setItemAsync(STORAGE_KEYS.USER_DATA, JSON.stringify(updatedUser));
    }
  }

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateUser,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
