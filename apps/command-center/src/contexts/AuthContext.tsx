'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role?: string;
}

interface Subscription {
  plan?: string;
  status?: string;
  price?: number;
}

interface AuthContextType {
  user: User | null;
  subscription: Subscription | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  token: string | null;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function persistSession(token: string, user: User, subscription: Subscription | null) {
  localStorage.setItem('auth_token', token);
  localStorage.setItem('authToken', token);
  localStorage.setItem('user', JSON.stringify(user));
  if (subscription) {
    localStorage.setItem('subscription', JSON.stringify(subscription));
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshSession = useCallback(async () => {
    try {
      // Prefer httpOnly cookie session (password + Google OAuth).
      const sessionRes = await fetch('/api/auth/session', { credentials: 'include' });
      if (sessionRes.ok) {
        const session = await sessionRes.json();
        if (session.authenticated && session.token && session.user) {
          persistSession(session.token, session.user, session.subscription ?? null);
          setUser(session.user);
          setToken(session.token);
          setSubscription(session.subscription ?? null);
          return;
        }
      }

      const storedToken =
        localStorage.getItem('auth_token') || localStorage.getItem('authToken');
      const storedUser = localStorage.getItem('user');
      const storedSub = localStorage.getItem('subscription');

      if (!storedToken || !storedUser) {
        setUser(null);
        setToken(null);
        setSubscription(null);
        return;
      }

      const parsedUser = JSON.parse(storedUser) as User;
      setUser(parsedUser);
      setToken(storedToken);
      if (storedSub) {
        try {
          setSubscription(JSON.parse(storedSub));
        } catch {
          /* ignore */
        }
      }

      const res = await fetch('/api/v1/billing/subscription', {
        headers: { Authorization: `Bearer ${storedToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSubscription(data);
        localStorage.setItem('subscription', JSON.stringify(data));
      }
    } catch {
      // Keep any restored local state.
    }
  }, []);

  useEffect(() => {
    refreshSession().finally(() => setIsLoading(false));
  }, [refreshSession]);

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch {
      /* ignore */
    }
    localStorage.removeItem('user');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('authToken');
    localStorage.removeItem('subscription');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userId');
    setUser(null);
    setToken(null);
    setSubscription(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        subscription,
        isLoading,
        isAuthenticated: !!user && !!token,
        token,
        logout,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
