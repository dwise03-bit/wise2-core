'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export default function Home() {
  const router = useRouter();
  const { user, logout, isLoading } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };

  return (
    <div className="min-h-screen bg-black p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header with logout */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">WISE² Dashboard</h1>
            {user && (
              <p className="text-gray-400">
                Welcome back, <span className="text-cyan-400">{user.email}</span>
              </p>
            )}
          </div>
          <button
            onClick={handleLogout}
            disabled={isLoading}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition disabled:opacity-50"
          >
            {isLoading ? 'Logging out...' : 'Logout'}
          </button>
        </div>

        <p className="text-gray-400 mb-8">Welcome to your WISE² Creator Dashboard</p>

        <nav className="space-y-4">
          <a href="/live" className="block p-4 bg-gray-900 rounded-lg hover:bg-gray-800">
            <h2 className="text-xl font-bold">LIVE Command Center</h2>
            <p className="text-gray-400">Stream and interact with your audience in real-time</p>
          </a>

          <a href="/community" className="block p-4 bg-gray-900 rounded-lg hover:bg-gray-800">
            <h2 className="text-xl font-bold">Community</h2>
            <p className="text-gray-400">Leaderboards, events, and creator connections</p>
          </a>
        </nav>
      </div>
    </div>
  );
}
