'use client';

import { ReactNode } from 'react';

export function SessionProvider({ children, session }: { children: ReactNode; session?: unknown }) {
  return <>{children}</>;
}
