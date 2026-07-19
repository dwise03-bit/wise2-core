/**
 * Authentication Page
 * Google OAuth sign-in/sign-up
 */

'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '../../context/AuthContext';
import { GoogleSignIn } from '../../components/Auth/GoogleSignIn';

export default function AuthPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthContext();

  // Redirect to workspace if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg mx-auto mb-4 flex items-center justify-center animate-pulse">
            <span className="text-xl font-bold text-black">W2</span>
          </div>
          <p className="text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* Background gradients */}
      <div className="fixed inset-0 opacity-30">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600 rounded-full mix-blend-screen blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-800 rounded-full mix-blend-screen blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-12">
        {/* Logo */}
        <div className="mb-12 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded flex items-center justify-center font-bold text-black">
              W2
            </div>
            <div>
              <h1 className="text-3xl font-black">WISE²</h1>
              <p className="text-xs text-gray-400">
                Organized Chaos Command Center
              </p>
            </div>
          </div>
        </div>

        {/* Auth Container */}
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold mb-2">Welcome to WISE² Studio</h2>
            <p className="text-gray-400 text-sm">
              Professional audio production, powered by AI
            </p>
          </div>

          {/* Google OAuth */}
          <GoogleSignIn />

          {/* Divider */}
          <div className="mt-8 pt-8 border-t border-blue-500/20">
            <p className="text-xs text-gray-500 text-center">
              By continuing, you agree to our Terms of Service and Privacy
              Policy
            </p>
          </div>
        </div>

        {/* Footer Links */}
        <div className="mt-12 flex gap-6 text-xs text-gray-500">
          <a href="/" className="hover:text-gray-300 transition">
            Back to Home
          </a>
          <span>•</span>
          <a href="/pricing" className="hover:text-gray-300 transition">
            Pricing
          </a>
          <span>•</span>
          <a href="mailto:support@wise2.app" className="hover:text-gray-300 transition">
            Support
          </a>
        </div>
      </div>
    </div>
  );
}
