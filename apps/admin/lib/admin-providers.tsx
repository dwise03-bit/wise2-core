'use client';

import React from 'react';
import { AuthProvider } from './auth-context';

export function AdminProviders({ children }: { children: React.ReactNode }): React.ReactNode {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
