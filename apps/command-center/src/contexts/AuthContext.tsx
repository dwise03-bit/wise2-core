'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshSession = async () => {
    try {
      const storedToken = localStorage.getItem('auth_token');
      const storedUser = localStorage.getItem('user');
      const storedSub = localStorage.getItem('subscription');

      if (!storedToken || !storedUser) return;

      setUser(JSON.parse(storedUser));
      setToken(storedToken);
      if (storedSub) {
        try { setSubscription(JSON.parse(storedSub)); } catch { /* ignore */ }
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
      // Validation failed — keep localStorage state
    }
  };

  useEffect(() => {
    refreshSession().finally(() => setIsLoading(false));
  }, []);

  const logout = async () => {
    const storedToken = localStorage.getItem('auth_token');
    if (storedToken) {
      try {
        await fetch('/api/v1/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${storedToken}` },
        });
      } catch { /* server logout may fail */ }
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
        isAuthenticated: !!user,
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
