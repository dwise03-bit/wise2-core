'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { apiClient, ApiResponse } from '../lib/api-client';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'OWNER' | 'ADMIN' | 'USER';
  tenantId: string;
  createdAt: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, companyName: string) => Promise<void>;
  logout: () => Promise<void>;
  setToken: (token: string) => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load token from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('user');

    if (storedToken) {
      setTokenState(storedToken);
      apiClient.setToken(storedToken);

      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          const userData = JSON.parse(storedUser);
          apiClient.setTenantId(userData.tenantId);
        } catch (e) {
          // Ignore parse errors
        }
      }
    }

    setIsLoading(false);
  }, []);

  const handleSetToken = useCallback((newToken: string) => {
    setTokenState(newToken);
    apiClient.setToken(newToken);
    localStorage.setItem('authToken', newToken);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      setError(null);
      setIsLoading(true);

      const response = await apiClient.login(email, password);

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Login failed');
      }

      const { token: newToken, user: userData } = response.data;

      setTokenState(newToken);
      apiClient.setToken(newToken);
      apiClient.setTenantId(userData.tenantId);

      setUser(userData);

      localStorage.setItem('authToken', newToken);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signup = useCallback(async (email: string, password: string, companyName: string) => {
    try {
      setError(null);
      setIsLoading(true);

      const response = await apiClient.signup(email, password, companyName);

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Signup failed');
      }

      const { token: newToken, user: userData } = response.data;

      setTokenState(newToken);
      apiClient.setToken(newToken);
      apiClient.setTenantId(userData.tenantId);

      setUser(userData);

      localStorage.setItem('authToken', newToken);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Signup failed';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setError(null);

      if (token) {
        await apiClient.logout();
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setTokenState(null);
      setUser(null);
      apiClient.setToken(null);
      apiClient.setTenantId(null);
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    }
  }, [token]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user && !!token,
    error,
    login,
    signup,
    logout,
    setToken: handleSetToken,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
