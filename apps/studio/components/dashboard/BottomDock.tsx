'use client';

import React, { useState } from 'react';

export function BottomDock() {
  const [activeApp, setActiveApp] = useState('dashboard');

  const apps = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'crm', label: 'CRM', icon: '👥' },
    { id: 'projects', label: 'Projects', icon: '📋' },
    { id: 'automation', label: 'Automation', icon: '⚙️' },
    { id: 'ai', label: 'AI Studio', icon: '🤖' },
    { id: 'memory', label: 'Memory', icon: '🧠' },
    { id: 'discord', label: 'Discord', icon: '💬' },
    { id: 'github', label: 'GitHub', icon: '🐙' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#050505] border-t border-emerald-500/20 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-center gap-3 overflow-x-auto scrollbar-hide">
        {apps.map((app) => (
          <button
            key={app.id}
            onClick={() => setActiveApp(app.id)}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition ${
              activeApp === app.id
                ? 'bg-emerald-500/20 border border-emerald-500/50'
                : 'bg-[#101010] border border-[#161616] hover:border-emerald-500/30'
            }`}
          >
            <span className="text-xl">{app.icon}</span>
            <span className="text-xs font-semibold text-white whitespace-nowrap">{app.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
