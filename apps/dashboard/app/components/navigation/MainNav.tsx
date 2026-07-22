'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', label: '📊 Dashboard', icon: '🎬' },
  { href: '/crm', label: '👥 CRM', icon: '👥' },
  { href: '/sales', label: '📈 Sales', icon: '📈' },
  { href: '/projects', label: '🎯 Projects', icon: '🎯' },
  { href: '/invoices', label: '💳 Invoices', icon: '💳' },
  { href: '/automation', label: '⚡ Automation', icon: '⚡' },
  { href: '/ai-studio', label: '🧠 AI Studio', icon: '🧠' },
  { href: '/settings', label: '⚙️ Settings', icon: '⚙️' },
];

export function MainNav() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <nav className="w-64 bg-[#0f0f1e] border-r border-[#2cd588] h-screen flex flex-col p-4 space-y-2">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🤖</span>
          {!collapsed && <span className="font-bold text-[#2cd588]">WISE²</span>}
        </div>
      </div>

      <div className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? 'bg-[#2cd588]/20 border border-[#2cd588] text-[#2cd588]'
                  : 'text-gray-400 hover:bg-[#2cd588]/10 hover:text-[#2cd588]'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
            </Link>
          );
        })}
      </div>

      <div className="pt-4 border-t border-[#2cd588]/20 space-y-2 text-xs">
        <div className="px-4 py-2">
          <p className="text-gray-500">Status</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-gray-400">99.98% Online</span>
          </div>
        </div>
      </div>
    </nav>
  );
}
