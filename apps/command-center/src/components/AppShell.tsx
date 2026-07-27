'use client';

import React, { ReactNode, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import CommandCenterTopBar from './CommandCenterTopBar';
import CommandCenterSidebar from './CommandCenterSidebar';

interface AppShellProps {
  children: ReactNode;
}

/**
 * AppShell - Command Center Shell
 * Phase 10C: Canonical command center layout
 * 
 * Features:
 * - Responsive sidebar (collapsible on mobile)
 * - Fixed top bar with title and user menu
 * - Main content area
 * - Design system compliance (Electric Blue primary, dark theme)
 */
export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-blue-400 text-2xl font-bold"
        >
          WISE²
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Top Bar */}
      <CommandCenterTopBar
        onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
        onSidebarToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileMenuOpen={mobileMenuOpen}
      />

      {/* Main Layout */}
      <div className="flex pt-16 min-h-screen">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <CommandCenterSidebar
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
        </div>

        {/* Mobile Sidebar Overlay */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          >
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
              className="w-64 h-full"
            >
              <CommandCenterSidebar
                collapsed={false}
                onToggle={() => setMobileMenuOpen(false)}
                mobile
              />
            </motion.div>
          </motion.div>
        )}

        {/* Main Content */}
        <main className="flex-1 min-w-0 overflow-y-auto">
          <div className="p-4 lg:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
