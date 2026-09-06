'use client';

import React from 'react';
import { AuthProvider } from './auth-context';
import { SessionProvider } from '@wise2/auth';

export function AdminProviders({ children, session }: { children: React.ReactNode; session?: any }): React.ReactNode {
  return (
    <SessionProvider session={session}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </SessionProvider>
  );
}
