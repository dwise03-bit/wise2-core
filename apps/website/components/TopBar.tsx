'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NotificationItem } from '@/types/navigation';

interface TopBarProps {
  onCommandPaletteOpen: () => void;
  notifications: NotificationItem[];
  onNotificationClick?: (id: string) => void;
  onSettingsClick?: () => void;
  showMobileMenu: boolean;
  onMobileMenuToggle: () => void;
  userInitials?: string;
}

export default function TopBar({
  onCommandPaletteOpen,
  notifications,
  onNotificationClick,
  onSettingsClick,
  showMobileMenu,
  onMobileMenuToggle,
  userInitials = 'W2',
}: TopBarProps) {
  const [mounted, setMounted] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (!mounted) return null;

  return (
    <motion.header
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed top-0 left-0 right-0 z-30 h-16 border-b border-white/10 bg-gradient-to-r from-slate-900/80 to-slate-900/60 backdrop-blur-md"
    >
      <div className="flex h-full items-center justify-between px-4 lg:px-6">
        {/* Left: Logo + Search */}
        <div className="flex flex-1 items-center gap-4">
          {/* Mobile Menu Toggle */}
          <motion.button
            onClick={onMobileMenuToggle}
            className="p-2 lg:hidden hover:bg-white/10 rounded-lg transition-colors"
          >
            <motion.span
              animate={{ rotate: showMobileMenu ? 90 : 0 }}
              transition={{ duration: 0.2 }}
              className="text-xl"
            >
              ≡
            </motion.span>
          </motion.button>

          {/* Logo */}
          <div className="hidden lg:flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center font-bold text-white">
              W2
            </div>
            <span className="font-semibold text-white hidden lg:inline">WISE²</span>
          </div>

          {/* Search / Command Palette */}
          <motion.button
            onClick={onCommandPaletteOpen}
            className="hidden md:flex flex-1 max-w-xs items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-400 hover:bg-white/10 transition-colors"
            whileHover={{ borderColor: 'rgba(0, 148, 255, 0.3)' }}
          >
            <span>🔍</span>
            <span className="flex-1 text-left">Search or type a command...</span>
            <kbd className="text-xs text-slate-500 bg-slate-800 rounded px-2 py-0.5">⌘K</kbd>
          </motion.button>

          {/* Mobile Search */}
          <motion.button
            onClick={onCommandPaletteOpen}
            className="md:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            🔍
          </motion.button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 lg:gap-4">
          {/* Notifications */}
          <div className="relative">
            <motion.button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2 hover:bg-white/10 rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
            >
              🔔
              <AnimatePresence>
                {unreadCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute top-1 right-1 flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-xs font-bold text-white"
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            {/* Notifications Dropdown */}
            <AnimatePresence>
              {notificationsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                  onClick={() => setNotificationsOpen(false)}
                  className="absolute right-0 mt-2 w-96 rounded-xl border border-white/10 bg-gradient-to-b from-slate-900/95 to-slate-900/85 shadow-2xl backdrop-blur-xl max-h-96 overflow-y-auto"
                >
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-slate-400">
                      <p>No notifications</p>
                    </div>
                  ) : (
                    <div>
                      {notifications.map((notif) => (
                        <motion.button
                          key={notif.id}
                          onClick={() => {
                            onNotificationClick?.(notif.id);
                          }}
                          className={`w-full px-4 py-3 text-left border-b border-white/5 hover:bg-white/5 transition-colors ${
                            !notif.read ? 'bg-blue-600/10' : ''
                          }`}
                          whileHover={{ paddingLeft: 20 }}
                        >
                          <div className="flex items-start gap-3">
                            <span className="mt-1">
                              {notif.type === 'success' && '✓'}
                              {notif.type === 'error' && '✕'}
                              {notif.type === 'warning' && '⚠'}
                              {notif.type === 'info' && 'ℹ'}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-white">{notif.title}</p>
                              <p className="text-xs text-slate-400 mt-0.5">{notif.message}</p>
                              <p className="text-xs text-slate-600 mt-1">
                                {new Date(notif.timestamp).toLocaleTimeString()}
                              </p>
                            </div>
                            {!notif.read && (
                              <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1" />
                            )}
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Settings */}
          <motion.button
            onClick={onSettingsClick}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            whileHover={{ scale: 1.05 }}
          >
            ⚙️
          </motion.button>

          {/* Profile Menu */}
          <div className="relative ml-2 lg:ml-4">
            <motion.button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 rounded-lg hover:bg-white/10 transition-colors p-1"
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-xs font-bold text-white">
                {userInitials}
              </div>
              <span className="hidden lg:inline text-sm font-medium text-white">{userInitials}</span>
            </motion.button>

            {/* Profile Dropdown */}
            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-48 rounded-xl border border-white/10 bg-gradient-to-b from-slate-900/95 to-slate-900/85 shadow-2xl backdrop-blur-xl overflow-hidden"
                  onClick={() => setProfileOpen(false)}
                >
                  <div className="px-4 py-3 border-b border-white/10">
                    <p className="text-sm font-medium text-white">Profile</p>
                    <p className="text-xs text-slate-400">wisedefensellc@gmail.com</p>
                  </div>
                  <button className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-white/10 transition-colors">
                    👤 Account Settings
                  </button>
                  <button className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-white/10 transition-colors">
                    📋 Preferences
                  </button>
                  <button className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-white/10 transition-colors">
                    🎨 Theme
                  </button>
                  <div className="border-t border-white/10" />
                  <button className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-600/10 transition-colors">
                    🚪 Sign Out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
