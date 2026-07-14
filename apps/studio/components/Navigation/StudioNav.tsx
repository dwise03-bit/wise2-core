'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function StudioNav() {
  const pathname = usePathname();

  const navItems = [
    {
      name: 'Recording Studio',
      href: '/',
      icon: '🎙️',
      description: 'Record & Mix',
    },
    {
      name: 'Live Streaming',
      href: '/live-streaming',
      icon: '📡',
      description: 'Stream Live',
    },
    {
      name: 'Live Studio',
      href: '/live-studio',
      icon: '🎬',
      description: 'Multi-Track Live',
    },
  ];

  return (
    <nav className="w-64 bg-gray-950 border-r border-gray-700 flex flex-col">
      {/* Logo */}
      <div className="px-6 py-4 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <div className="text-xl font-bold text-blue-400">WISE²</div>
          <div className="text-xs text-gray-500 uppercase">Studio</div>
        </div>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 px-3 py-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${
                isActive
                  ? 'bg-blue-600/20 border border-blue-500/50 text-blue-400'
                  : 'text-gray-400 hover:bg-gray-900/50 hover:text-gray-300'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <div>
                <div className="text-sm font-semibold">{item.name}</div>
                <div className="text-xs text-gray-500">{item.description}</div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-700 px-3 py-4 space-y-2">
        <button className="w-full px-3 py-2 text-xs text-gray-400 hover:text-gray-300 bg-gray-900 rounded hover:bg-gray-800 transition-colors text-left">
          ⚙️ Settings
        </button>
        <button className="w-full px-3 py-2 text-xs text-gray-400 hover:text-gray-300 bg-gray-900 rounded hover:bg-gray-800 transition-colors text-left">
          ❓ Help
        </button>
        <div className="text-xs text-gray-600 px-3 py-2">
          <div>WISE² v2.0.0</div>
          <div>© 2025 WISE Defense LLC</div>
        </div>
      </div>
    </nav>
  );
}
