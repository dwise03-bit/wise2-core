'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CommandCenterTopBarProps {
  onMobileMenuToggle: () => void;
  onSidebarToggle: () => void;
  mobileMenuOpen: boolean;
}

/**
 * CommandCenterTopBar - Top navigation bar for command center
 * Features: logo, page title, user menu, notifications
 */
const CommandCenterTopBar: React.FC<CommandCenterTopBarProps> = ({
  onMobileMenuToggle,
  onSidebarToggle,
  mobileMenuOpen,
}) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <motion.header
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed top-0 left-0 right-0 z-30 h-16 border-b border-white/10 bg-gradient-to-r from-slate-900/80 to-slate-900/60 backdrop-blur-md"
    >
      <div className="flex h-full items-center justify-between px-4 lg:px-6">
        {/* Left: Menu & Logo */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMobileMenuToggle}
            className="p-2 lg:hidden hover:bg-white/10 rounded-lg transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="18" x2="20" y2="18" />
            </svg>
          </button>

          <div className="hidden lg:flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center font-bold text-white">
              W2
            </div>
            <span className="font-semibold text-white">WISE²</span>
          </div>
        </div>

        {/* Center: Page Title */}
        <div className="hidden md:block">
          <h1 className="text-lg font-semibold text-white">Command Center</h1>
        </div>

        {/* Right: User Menu */}
        <div className="flex items-center gap-2 lg:gap-4">
          {/* User Profile Menu */}
          <div className="relative ml-2 lg:ml-4">
            <motion.button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 rounded-lg hover:bg-white/10 transition-colors p-1"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-xs font-bold text-white">
                DW
              </div>
              <span className="hidden lg:inline text-sm font-medium text-white">Profile</span>
            </motion.button>

            <AnimatePresence>
              {userMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-48 rounded-xl border border-white/10 bg-gradient-to-b from-slate-900/95 to-slate-900/85 shadow-2xl backdrop-blur-xl overflow-hidden"
                  onClick={() => setUserMenuOpen(false)}
                >
                  <div className="px-4 py-3 border-b border-white/10">
                    <p className="text-sm font-medium text-white">Profile</p>
                    <p className="text-xs text-slate-400">user@wise2.net</p>
                  </div>
                  <button className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-white/10 transition-colors">
                    Account Settings
                  </button>
                  <button className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-white/10 transition-colors">
                    Preferences
                  </button>
                  <div className="border-t border-white/10" />
                  <button className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-600/10 transition-colors">
                    Sign Out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default CommandCenterTopBar;
