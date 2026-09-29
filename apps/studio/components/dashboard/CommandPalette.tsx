'use client';

import React, { useState, useEffect } from 'react';

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');

  const commands = [
    { label: 'Deploy', category: 'Actions', shortcut: 'D' },
    { label: 'Search', category: 'Navigation', shortcut: '/' },
    { label: 'Settings', category: 'System', shortcut: ',' },
    { label: 'Theme Toggle', category: 'Appearance', shortcut: 'T' },
    { label: 'Help', category: 'Support', shortcut: '?' },
    { label: 'Export Data', category: 'Data', shortcut: 'E' },
    { label: 'AI Assistant', category: 'AI', shortcut: 'A' },
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(!isOpen);
      }
      if (e.key === 'Escape') setIsOpen(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center pt-20">
      <div className="w-full max-w-xl bg-[#101010] border border-emerald-500/30 rounded-lg shadow-2xl">
        <div className="p-4 border-b border-[#161616]">
          <input
            autoFocus
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Search commands..."
            className="w-full bg-[#050505] border border-[#161616] rounded px-3 py-2 text-white placeholder-gray-600 focus:outline-none"
          />
        </div>
        <div className="max-h-96 overflow-y-auto">
          {commands.map((cmd, i) => (
            <button
              key={i}
              className="w-full text-left px-4 py-2 hover:bg-emerald-500/10 transition flex items-center justify-between"
            >
              <div>
                <span className="text-xs text-gray-500">{cmd.category}</span>
                <p className="text-sm text-white">{cmd.label}</p>
              </div>
              <span className="text-xs bg-[#050505] px-2 py-1 rounded text-gray-400">
                {cmd.shortcut}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
