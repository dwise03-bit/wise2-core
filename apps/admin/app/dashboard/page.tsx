'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export default function AdminDashboard() {
  const router = useRouter();
  const { user, logout, isLoading, isAdmin } = useAuth();

  // Redirect non-admin users
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-400 mb-6">Only administrators can access this area.</p>
          <button
            onClick={() => router.push('/auth/login')}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-lg transition"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };

  return (
    <div className="min-h-screen bg-black p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header with logout */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">WISE² Admin Dashboard</h1>
            {user && (
              <p className="text-gray-400">
                Welcome, <span className="text-cyan-400">{user.email}</span>
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

        {/* Admin Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 bg-gray-900 rounded-lg border border-gray-700 hover:border-cyan-500 transition">
            <h2 className="text-xl font-bold mb-2">User Management</h2>
            <p className="text-gray-400 mb-4">Manage users and permissions</p>
            <button className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-lg transition">
              View Users
            </button>
          </div>

          <div className="p-6 bg-gray-900 rounded-lg border border-gray-700 hover:border-cyan-500 transition">
            <h2 className="text-xl font-bold mb-2">System Logs</h2>
            <p className="text-gray-400 mb-4">View system activity and logs</p>
            <button className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-lg transition">
              View Logs
            </button>
          </div>

          <div className="p-6 bg-gray-900 rounded-lg border border-gray-700 hover:border-cyan-500 transition">
            <h2 className="text-xl font-bold mb-2">Settings</h2>
            <p className="text-gray-400 mb-4">Configure system settings</p>
            <button className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-lg transition">
              Open Settings
            </button>
          </div>
        </div>

        {/* Admin Info */}
        <div className="mt-8 p-6 bg-gray-900 rounded-lg border border-gray-700">
          <h2 className="text-xl font-bold mb-4">Admin Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-400">Email</p>
              <p className="text-white font-medium">{user?.email}</p>
            </div>
            <div>
              <p className="text-gray-400">Role</p>
              <p className="text-white font-medium">{user?.role}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
