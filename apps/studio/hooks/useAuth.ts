/**
 * useAuth Hook
 * Manages user authentication state and provides auth functions
 */

import { useCallback, useEffect, useState } from 'react';
import { apiClient, LoginResponse } from '../lib/api-client';

export interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface UseAuthReturn extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  isCheckingAuth: boolean;
}

/**
 * Custom hook for authentication
 * Manages login/logout state and provides auth utilities
 */
export function useAuth(): UseAuthReturn {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  });

  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  /**
   * Check if user is already authenticated (on mount)
   */
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = apiClient.getAccessToken();
        if (token) {
          // Token exists, assume user is authenticated
          // In a real app, you'd verify the token with the backend
          setState((prev) => ({
            ...prev,
            isAuthenticated: true,
          }));
        }
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, []);

  /**
   * Login with email and password
   */
  const login = useCallback(
    async (email: string, password: string) => {
      setState((prev) => ({
        ...prev,
        isLoading: true,
        error: null,
      }));

      try {
        const response = await apiClient.login(email, password);

        setState({
          user: response.user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Login failed';

        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: errorMessage,
        });

        throw error;
      }
    },
    []
  );

  /**
   * Sign up a new user
   */
  const signup = useCallback(
    async (email: string, password: string, name?: string) => {
      setState((prev) => ({
        ...prev,
        isLoading: true,
        error: null,
      }));

      try {
        const response = await apiClient.signup(email, password, name);

        // Note: After signup, user still needs to verify email
        // They can log in once email is verified
        setState({
          user: response.user as User,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Signup failed';

        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: errorMessage,
        });

        throw error;
      }
    },
    []
  );

  /**
   * Log out the current user
   */
  const logout = useCallback(async () => {
    setState((prev) => ({
      ...prev,
      isLoading: true,
    }));

    try {
      await apiClient.logout();

      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      // Clear auth state even if logout fails
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  }, []);

  /**
   * Clear error messages
   */
  const clearError = useCallback(() => {
    setState((prev) => ({
      ...prev,
      error: null,
    }));
  }, []);

  return {
    ...state,
    login,
    signup,
    logout,
    clearError,
    isCheckingAuth,
  };
}
