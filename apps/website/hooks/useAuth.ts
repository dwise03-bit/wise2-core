'use client';

import { useState, useEffect, useCallback } from 'react';
import { getBrowserAuthToken, getBrowserAuthUser, clearBrowserAuthSession, BrowserAuthUser } from '@/lib/auth-session';
import { getApiUrl } from '@/lib/api-config';

interface UseAuthReturn {
  user: BrowserAuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => void;
  refreshToken: () => Promise<boolean>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<BrowserAuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = getBrowserAuthToken();
    const storedUser = getBrowserAuthUser();

    setToken(storedToken);
    setUser(storedUser);
    setIsLoading(false);
  }, []);

  const logout = useCallback(() => {
    clearBrowserAuthSession();
    setUser(null);
    setToken(null);
    window.location.href = '/auth/signin';
  }, []);

  const refreshToken = useCallback(async (): Promise<boolean> => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      logout();
      return false;
    }

    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/api/v1/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        logout();
        return false;
      }

      const data = await response.json();
      const newToken = data.data?.accessToken || data.accessToken;

      if (newToken) {
        localStorage.setItem('auth_token', newToken);
        setToken(newToken);
        return true;
      }

      logout();
      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
      return false;
    }
  }, [logout]);

  return {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    logout,
    refreshToken,
  };
}
