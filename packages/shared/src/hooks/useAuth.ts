'use client';

/**
 * useAuth Hook
 * Manages authentication state and provides login/logout functionality
 */

import { useState, useCallback, useEffect } from 'react';
import {
  loginWithCredentials,
  logoutUser,
  clearTokens,
} from '../utils/fetchWithAuth';
import { TOKEN_CONFIG, USER_ROLES } from '../auth.constants';

export interface AuthUser {
  id: string;
  email: string;
  role: 'ADMIN' | 'CUSTOMER' | 'SUPPORT';
  firstName?: string;
  lastName?: string;
}

export interface UseAuthReturn {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  isAdmin: boolean;
  isCustomer: boolean;
}

/**
 * Decode JWT token without verification (client-side only)
 * Note: This should only be used client-side to get user info
 * The server should always verify the token signature
 */
function decodeToken(token: string): any {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

/**
 * Get user from local storage
 */
function getStoredUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const userJson = localStorage.getItem(TOKEN_CONFIG.userKey);
    return userJson ? JSON.parse(userJson) : null;
  } catch {
    return null;
  }
}

/**
 * Check if token is expired
 */
function isTokenExpired(expiryTime: string | null): boolean {
  if (!expiryTime) return true;
  return Date.now() >= parseInt(expiryTime, 10);
}

/**
 * Main useAuth hook
 */
export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTimer, setRefreshTimer] = useState<NodeJS.Timeout | null>(null);

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = () => {
      if (typeof window === 'undefined') {
        setIsLoading(false);
        return;
      }

      const token = localStorage.getItem(TOKEN_CONFIG.accessTokenKey);
      const expiryTime = localStorage.getItem(TOKEN_CONFIG.expiryKey);

      if (!token) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      if (isTokenExpired(expiryTime)) {
        clearTokens();
        setUser(null);
        setIsLoading(false);
        return;
      }

      // Get user from storage or decode from token
      const storedUser = getStoredUser();
      if (storedUser) {
        setUser(storedUser);
      } else {
        // Fallback: decode from token
        const decoded = decodeToken(token);
        if (decoded) {
          const userData: AuthUser = {
            id: decoded.sub,
            email: decoded.email,
            role: decoded.role || USER_ROLES.CUSTOMER,
            firstName: decoded.firstName,
            lastName: decoded.lastName,
          };
          setUser(userData);
          localStorage.setItem(TOKEN_CONFIG.userKey, JSON.stringify(userData));
        }
      }

      setIsLoading(false);

      // Schedule token refresh
      scheduleTokenRefresh();
    };

    initAuth();
  }, []);

  // Schedule automatic token refresh
  const scheduleTokenRefresh = useCallback(() => {
    if (typeof window === 'undefined') return;

    const expiryTime = localStorage.getItem(TOKEN_CONFIG.expiryKey);
    if (!expiryTime) return;

    const timeUntilExpiry = parseInt(expiryTime, 10) - Date.now();
    const refreshIn = Math.max(
      0,
      timeUntilExpiry - TOKEN_CONFIG.refreshThreshold
    );

    if (refreshTimer) {
      clearTimeout(refreshTimer);
    }

    const timer = setTimeout(() => {
      refreshToken();
    }, refreshIn);

    setRefreshTimer(timer);
  }, [refreshTimer]);

  // Refresh access token
  const refreshToken = useCallback(async (): Promise<boolean> => {
    if (typeof window === 'undefined') return false;

    const refreshTokenValue = localStorage.getItem(
      TOKEN_CONFIG.refreshTokenKey
    );
    if (!refreshTokenValue) {
      clearTokens();
      setUser(null);
      return false;
    }

    try {
      const response = await fetch(
        typeof window !== 'undefined' && window.location.hostname === 'localhost'
          ? 'http://localhost:3010/v1/auth/refresh'
          : 'https://api.wise2.net/v1/auth/refresh',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: refreshTokenValue }),
          credentials: 'include',
        }
      );

      if (!response.ok) {
        clearTokens();
        setUser(null);
        return false;
      }

      const data = await response.json();
      localStorage.setItem(TOKEN_CONFIG.accessTokenKey, data.accessToken);
      localStorage.setItem(
        TOKEN_CONFIG.expiryKey,
        String(Date.now() + data.expiresIn * 1000)
      );

      // Schedule next refresh
      scheduleTokenRefresh();
      return true;
    } catch (err) {
      clearTokens();
      setUser(null);
      return false;
    }
  }, [scheduleTokenRefresh]);

  // Login handler
  const login = useCallback(async (email: string, password: string) => {
    setError(null);
    setIsLoading(true);

    try {
      const result = await loginWithCredentials(email, password);

      if (!result.success) {
        setError(result.error || 'Login failed');
        setIsLoading(false);
        return;
      }

      const userData = result.user as AuthUser;
      setUser(userData);
      scheduleTokenRefresh();
      setIsLoading(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      setIsLoading(false);
    }
  }, [scheduleTokenRefresh]);

  // Logout handler
  const logout = useCallback(async () => {
    setError(null);
    setIsLoading(true);

    try {
      await logoutUser();
      setUser(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Logout failed';
      setError(message);
    } finally {
      setIsLoading(false);
      if (refreshTimer) {
        clearTimeout(refreshTimer);
      }
    }
  }, [refreshTimer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (refreshTimer) {
        clearTimeout(refreshTimer);
      }
    };
  }, [refreshTimer]);

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    logout,
    refreshToken,
    isAdmin: user?.role === USER_ROLES.ADMIN,
    isCustomer: user?.role === USER_ROLES.CUSTOMER,
  };
}
