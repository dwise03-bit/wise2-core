'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import { TourProvider } from '@/contexts/TourContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <TourProvider>{children}</TourProvider>
    </AuthProvider>
  );
}
