'use client';

import React, { useState } from 'react';
import {
  Menu,
  X,
  BarChart3,
  Settings,
  Users,
  Zap,
  TrendingUp,
  MessageSquare,
  FileText,
  Brain,
} from 'lucide-react';

interface CommandCenterSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
  badge?: string;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <BarChart3 size={20} />, href: '/' },
  { id: 'analytics', label: 'Analytics', icon: <TrendingUp size={20} />, href: '/analytics', badge: 'New' },
  { id: 'team', label: 'Team', icon: <Users size={20} />, href: '/team' },
  { id: 'signals', label: 'Signals', icon: <Zap size={20} />, href: '/signals' },
  { id: 'chat', label: 'Communication', icon: <MessageSquare size={20} />, href: '/chat' },
  { id: 'brain', label: 'Second Brain', icon: <Brain size={20} />, href: '/brain' },
  { id: 'docs', label: 'Documentation', icon: <FileText size={20} />, href: '/docs' },
];

export function CommandCenterSidebar({ isOpen, onToggle }: CommandCenterSidebarProps) {
  const [activeItem, setActiveItem] = useState('dashboard');

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`
          glass-heavy flex flex-col gap-6 w-64 h-screen p-6 border-r border-cyan-500/10
          transform transition-all duration-300 overflow-hidden
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          lg:relative fixed left-0 top-0 z-40 lg:z-auto
        `}
      >
        {/* Logo section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-green-500 flex items-center justify-center font-bold text-sm">
              W²
            </div>
            <div>
              <h1 className="font-bold text-white">WISE²</h1>
              <p className="text-xs text-gray-400">Command Center</p>
            </div>
          </div>
          <button
            onClick={onToggle}
            className="lg:hidden text-gray-400 hover:text-white transition-colors"
            aria-label="Toggle sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 px-3 mb-4">
            Main
          </p>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveItem(item.id)}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium
                transition-all duration-200 relative group
                ${activeItem === item.id
                  ? 'active-neon-glow text-cyan-300'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
                }
              `}
            >
              {/* Neon left border glow for active items */}
              {activeItem === item.id && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-cyan-400 to-green-400 rounded-r-full animate-glow-pulse" />
              )}

              <span className="relative z-10">{item.icon}</span>
              <span className="flex-1 text-left relative z-10">{item.label}</span>

              {item.badge && (
                <span className="text-xs bg-gradient-to-r from-cyan-500 to-green-500 text-white px-2 py-1 rounded-full font-bold relative z-10">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Settings section */}
        <div className="border-t border-cyan-500/10 pt-6">
          <button
            className={`
              w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium
              text-gray-300 hover:text-white hover:bg-white/5
              transition-all duration-200
            `}
          >
            <Settings size={20} />
            <span>Settings</span>
          </button>

          {/* Status indicator */}
          <div className="mt-4 p-3 rounded-lg glass-light space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">System Status</span>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-green-400">Operational</span>
              </span>
            </div>
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full w-4/5 bg-gradient-to-r from-cyan-500 to-green-500 rounded-full" />
            </div>
            <p className="text-xs text-gray-500">99.8% uptime this month</p>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 lg:hidden z-30 bg-black/50 backdrop-blur-sm"
          onClick={onToggle}
        />
      )}
    </>
  );
}
