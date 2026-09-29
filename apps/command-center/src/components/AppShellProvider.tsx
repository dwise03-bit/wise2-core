'use client';

import React, { ReactNode } from 'react';
import { AppShell } from './AppShell';
import { AuthProvider } from '../contexts/AuthContext';

interface AppShellProviderProps {
  children: ReactNode;
}

/**
 * AppShellProvider - Wrapper component for app router
 * Converts AppShell to work as a wrapper in Next.js 14+ app router
 */
export const AppShellProvider: React.FC<AppShellProviderProps> = ({ children }) => {
  return (
    <AuthProvider>
      <AppShell>
        {children}
      </AppShell>
    </AuthProvider>
  );
};
