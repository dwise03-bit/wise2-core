'use client';

import { useEffect, useCallback, useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useNavigation } from '@/hooks/useNavigation';
import SidebarNav from './SidebarNav';
import TopBar from './TopBar';
import StatusBar from './StatusBar';
import CommandPalette from './CommandPalette';
import { defaultNavSections, buildDefaultCommands, sampleNotifications } from './navConfig';
import { NavItem, StatusIndicator } from '@/types/navigation';

interface AppShellProps {
  children: ReactNode;
  rightPanel?: ReactNode;
  status?: Partial<StatusIndicator>;
  showServerStats?: boolean;
}

const DEFAULT_STATUS: StatusIndicator = {
  status: 'connected',
  syncing: false,
  deploymentStatus: 'idle',
  aiProcessing: false,
  lastSyncTime: new Date(),
};

export default function AppShell({
  children,
  rightPanel,
  status: statusOverride,
  showServerStats = false,
}: AppShellProps) {
  const router = useRouter();
  const nav = useNavigation();
  const [notifications, setNotifications] = useState(sampleNotifications);

  const status: StatusIndicator = { ...DEFAULT_STATUS, ...statusOverride };

  const commands = buildDefaultCommands({ push: router.push });

  // Global keyboard shortcut: Cmd/Ctrl + K
  const handleGlobalKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        nav.toggleCommandPalette();
      }
    },
    [nav]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [handleGlobalKeyDown]);

  const handleNavItemClick = (item: NavItem) => {
    if (item.href) {
      router.push(item.href);
    }
    item.onClick?.();
    // Close mobile menu on navigation
    if (nav.mobileMenuOpen) {
      nav.toggleMobileMenu();
    }
  };

  const handleNotificationClick = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleDeployClick = () => {
    console.log('Deploy triggered');
  };

  const handleSettingsClick = () => {
    router.push('/settings');
  };

  if (!nav.mounted) {
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

  const sidebarWidth = nav.sidebarCollapsed ? 80 : nav.sidebarWidth;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Top Bar */}
      <TopBar
        onCommandPaletteOpen={nav.toggleCommandPalette}
        notifications={notifications}
        onNotificationClick={handleNotificationClick}
        onSettingsClick={handleSettingsClick}
        showMobileMenu={nav.mobileMenuOpen}
        onMobileMenuToggle={nav.toggleMobileMenu}
      />

      {/* Main Layout */}
      <div className="flex pt-16 pb-8 min-h-screen">
        {/* Sidebar - Desktop */}
        <div className="hidden lg:block flex-shrink-0" style={{ width: sidebarWidth }}>
          <SidebarNav
            sections={defaultNavSections}
            collapsed={nav.sidebarCollapsed}
            width={nav.sidebarWidth}
            onToggle={nav.toggleSidebar}
            onResize={nav.setSidebarWidth}
            onItemClick={handleNavItemClick}
          />
        </div>

        {/* Sidebar - Mobile (overlay) */}
        <AnimatePresence>
          {nav.mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={nav.toggleMobileMenu}
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
                <SidebarNav
                  sections={defaultNavSections}
                  collapsed={false}
                  width={256}
                  onToggle={nav.toggleMobileMenu}
                  onResize={() => {}}
                  onItemClick={handleNavItemClick}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Center Content */}
        <main className="flex-1 min-w-0 overflow-y-auto">
          <div className="p-4 lg:p-6">{children}</div>
        </main>

        {/* Right Panel */}
        <AnimatePresence>
          {nav.rightPanelOpen && rightPanel && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: nav.rightPanelWidth, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="hidden xl:block flex-shrink-0 border-l border-white/10 bg-slate-900/30 backdrop-blur-md overflow-y-auto"
            >
              <div className="p-4">{rightPanel}</div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      {/* Status Bar */}
      <StatusBar
        status={status}
        onDeployClick={handleDeployClick}
        showServerStats={showServerStats}
        gpuUsage={showServerStats ? 42 : undefined}
        modelStatus={showServerStats ? 'Ready' : undefined}
      />

      {/* Command Palette */}
      <CommandPalette
        isOpen={nav.commandPaletteOpen}
        onClose={nav.toggleCommandPalette}
        commands={commands}
      />
    </div>
  );
}
