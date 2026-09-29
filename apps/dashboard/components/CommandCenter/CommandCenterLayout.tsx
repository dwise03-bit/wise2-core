'use client';

import React, { useState } from 'react';
import { CommandCenterSidebar } from './Sidebar';
import { CommandCenterHeader } from './Header';
import { ToastContainer } from './Toast';

interface CommandCenterLayoutProps {
  children: React.ReactNode;
}

export function CommandCenterLayout({ children }: CommandCenterLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050607] via-[#0a0f1a] to-[#050607] text-white">
      {/* Background glow effect */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-5" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-green-500 rounded-full mix-blend-multiply filter blur-3xl opacity-5" />
      </div>

      <div className="flex h-screen relative z-10">
        {/* Sidebar */}
        <CommandCenterSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

        {/* Main content area */}
        <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? '' : ''}`}>
          {/* Header */}
          <CommandCenterHeader onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

          {/* Content */}
          <main className="flex-1 overflow-y-auto">
            <div className="px-8 py-6 max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>

      {/* Toast notifications */}
      <ToastContainer />
    </div>
  );
}
