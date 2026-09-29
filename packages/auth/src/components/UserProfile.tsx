'use client';

import { useAuth, useSignOut } from '../hooks';
import Image from 'next/image';
import { useState } from 'react';

interface UserProfileProps {
  className?: string;
  showEmail?: boolean;
}

/**
 * User profile component
 * Shows current user info and sign out button
 */
export function UserProfile({ className = '', showEmail = true }: UserProfileProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const signOut = useSignOut();
  const [showMenu, setShowMenu] = useState(false);

  if (isLoading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 hover:bg-gray-100 rounded-lg p-2 transition"
      >
        {user.image && (
          <Image
            src={user.image}
            alt={user.name || 'User'}
            width={40}
            height={40}
            className="rounded-full"
          />
        )}
        <div className="text-left hidden sm:block">
          <p className="font-semibold text-sm text-gray-900">{user.name}</p>
          {showEmail && <p className="text-xs text-gray-500">{user.email}</p>}
        </div>
      </button>

      {showMenu && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-200">
            {user.image && (
              <Image
                src={user.image}
                alt={user.name || 'User'}
                width={48}
                height={48}
                className="rounded-full mb-2"
              />
            )}
            <p className="font-semibold text-gray-900">{user.name}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>

          <div className="p-4 space-y-2">
            <a
              href="/profile"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition"
            >
              Profile Settings
            </a>
            <a
              href="/account"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition"
            >
              Account
            </a>
            <button
              onClick={() => {
                signOut();
                setShowMenu(false);
              }}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded transition"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
