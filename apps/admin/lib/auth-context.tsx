'use client';

import { createContext, useContext } from 'react';
import { useAuth as useAuthHook, UseAuthReturn } from '@wise2/shared/hooks';

const AuthContext = createContext<UseAuthReturn | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const authReturn = useAuthHook();

  return (
    <AuthContext.Provider value={authReturn}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): UseAuthReturn {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
