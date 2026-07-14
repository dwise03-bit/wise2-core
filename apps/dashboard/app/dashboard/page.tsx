'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  const modules = [
    { name: 'AI COMMAND CENTER', icon: '🤖', desc: 'Intelligent automation hub' },
    { name: 'SOUNDLAB', icon: '🎵', desc: 'Professional audio branding' },
    { name: 'LIVE STUDIO', icon: '📡', desc: 'Livestream production' },
    { name: 'DROP SHIPPING AI', icon: '📦', desc: 'E-commerce automation' },
    { name: 'CRM & CLIENTS', icon: '👥', desc: 'Customer management' },
    { name: 'ANALYTICS', icon: '📊', desc: 'Real-time dashboards' },
    { name: 'MARKETING SUITE', icon: '📢', desc: 'Campaign management' },
    { name: 'DEVELOPER API', icon: '💻', desc: 'Powerful integrations' },
  ];

  if (loading) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Sidebar */}
      <div className="w-60 border-r border-gray-800 p-6 flex flex-col">
        <div className="mb-12">
          <div className="text-2xl font-black mb-1">W2</div>
          <p className="text-xs text-gray-500">COMMAND CENTER</p>
        </div>

        <nav className="space-y-4 flex-1">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Navigation</div>
          {[
            { name: 'Dashboard', icon: '🏠' },
            { name: 'AI Command Center', icon: '🤖' },
            { name: 'SoundLab', icon: '🎵' },
            { name: 'Live Studio', icon: '📡' },
            { name: 'Drop Shipping', icon: '📦' },
            { name: 'CRM & Clients', icon: '👥' },
            { name: 'Analytics', icon: '📊' },
            { name: 'Marketing Suite', icon: '📢' },
            { name: 'Developer API', icon: '💻' },
          ].map((item) => (
            <div key={item.name} className="flex items-center gap-3 px-3 py-2 hover:text-blue-400 cursor-pointer transition">
              <span className="text-lg">{item.icon}</span>
              <span className="text-sm">{item.name}</span>
            </div>
          ))}
        </nav>

        <div className="border-t border-gray-800 pt-4">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-gray-700"></div>
            <div className="text-sm">
              <p className="font-bold">{user?.name || 'User'}</p>
              <p className="text-xs text-gray-500">{user?.email || 'user@example.com'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {/* Top Bar */}
        <div className="border-b border-gray-800 p-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black">👋 WELCOME TO WISE²</h1>
            <p className="text-sm text-gray-400 mt-1">Your AI Operating System for Modern Business</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full border border-gray-600 flex items-center justify-center cursor-pointer hover:border-blue-400">
              🔔
            </div>
            <div className="w-8 h-8 rounded-full border border-gray-600 flex items-center justify-center cursor-pointer hover:border-blue-400">
              👤
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="p-6">
          <div className="grid grid-cols-3 gap-6 mb-12">
            <div className="p-6 border border-gray-700 rounded bg-gray-950 hover:border-blue-500 transition">
              <p className="text-xs text-gray-500 uppercase mb-2">REVENUE TODAY</p>
              <div className="text-3xl font-black text-blue-400 mb-4">$24,583.00</div>
              <p className="text-xs text-green-400">📈 12.5% from previous</p>
            </div>
            <div className="p-6 border border-gray-700 rounded bg-gray-950 hover:border-blue-500 transition">
              <p className="text-xs text-gray-500 uppercase mb-2">ACTIVE AUTOMATIONS</p>
              <div className="text-3xl font-black text-blue-400 mb-4">127</div>
              <p className="text-xs text-green-400">🟢 5 new today</p>
            </div>
            <div className="p-6 border border-gray-700 rounded bg-gray-950 hover:border-blue-500 transition">
              <p className="text-xs text-gray-500 uppercase mb-2">AI TASKS COMPLETED</p>
              <div className="text-3xl font-black text-blue-400 mb-4">3,245</div>
              <p className="text-xs text-green-400">📊 12.7% this week</p>
            </div>
          </div>

          {/* System Status */}
          <div className="mb-12 p-6 border border-gray-700 rounded bg-gray-950">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold">SYSTEM STATUS</h3>
              <span className="text-xs text-green-400 font-bold">✓ OPERATIONAL</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">99.99% UPTIME</span>
                <span className="text-gray-500">↗ 99.99%</span>
              </div>
            </div>
          </div>

          {/* Modules Grid */}
          <div className="mb-12">
            <h2 className="text-xl font-black mb-6">ALL-IN-ONE MODULES</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {modules.map((mod) => (
                <div
                  key={mod.name}
                  className="p-4 border border-gray-700 rounded hover:border-blue-500 hover:bg-blue-500/5 transition cursor-pointer group"
                >
                  <div className="text-3xl mb-2">{mod.icon}</div>
                  <h3 className="font-bold text-sm mb-1 group-hover:text-blue-400 transition">{mod.name}</h3>
                  <p className="text-xs text-gray-500 mb-3">{mod.desc}</p>
                  <div className="text-xs text-blue-400 group-hover:translate-x-1 transition inline-block">Learn More →</div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-4">
            <Link href="/dashboard/new" className="px-6 py-3 bg-blue-600 text-white rounded font-bold hover:bg-blue-500 transition">
              + NEW PROJECT
            </Link>
            <Link href="/billing/checkout" className="px-6 py-3 border border-gray-600 text-white rounded font-bold hover:border-blue-400 transition">
              UPGRADE PLAN
            </Link>
            <a href="https://discord.gg/wise2" target="_blank" className="px-6 py-3 border border-gray-600 text-white rounded font-bold hover:border-blue-400 transition">
              JOIN COMMUNITY
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
