'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion } from 'framer-motion';

interface AppShellProps {
  children: React.ReactNode;
  title: string;
}

export const AppShell = ({ children, title }: AppShellProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navItems = [
    { label: 'Build Floor', href: '/', icon: '🏗️' },
    { label: 'System Bays', href: '/systems', icon: '⚙️' },
    { label: 'Hybrid Mixer', href: '/mixer', icon: '🎚️' },
    { label: 'My Builds', href: '/builds', icon: '📋' },
    { label: 'Blueprints', href: '/blueprints', icon: '📐' },
    { label: 'Supply Depot', href: '/packs', icon: '📦' },
    { label: 'Marketplace', href: '/marketplace', icon: '🏪' },
  ];

  return (
    <div className="min-h-screen bg-machine-black text-blueprint-white">
      {/* Top Navigation */}
      <nav className="border-b border-gunmetal bg-graphite/50 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="text-3xl">🏗️</div>
            <div>
              <p className="font-bold text-laser-orange">WISE TOUCH</p>
              <p className="text-xs text-gunmetal">PROMPT SHOP™</p>
            </div>
          </Link>

          {/* Title */}
          <h1 className="text-xl font-bold absolute left-1/2 transform -translate-x-1/2">
            {title}
          </h1>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            <button className="text-sm px-3 py-1 border border-gunmetal rounded hover:border-laser-orange transition-colors">
              Account
            </button>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gunmetal/50 rounded"
            >
              ☰
            </button>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <motion.aside
          animate={{ width: sidebarOpen ? 250 : 0 }}
          className="border-r border-gunmetal bg-graphite/30 overflow-hidden"
        >
          <nav className="p-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block px-4 py-2 rounded hover:bg-gunmetal/50 transition-colors group flex items-center gap-2"
              >
                <span className="text-xl group-hover:scale-110 transition-transform">
                  {item.icon}
                </span>
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>
        </motion.aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};
