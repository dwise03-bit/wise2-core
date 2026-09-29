/**
 * Protected Route Component
 * Ensures user is authenticated before accessing protected content
 */

'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, isCheckingAuth } = useAuth();

  useEffect(() => {
    if (!isCheckingAuth && !isAuthenticated) {
      router.push('/auth');
    }
  }, [isAuthenticated, isCheckingAuth, router]);

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg mx-auto mb-4 flex items-center justify-center animate-pulse">
            <span className="text-xl font-bold text-black">W2</span>
          </div>
          <p className="text-gray-300">Loading studio...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
