'use client';

import React, { ReactNode, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import CommandCenterTopBar from './CommandCenterTopBar';
import CommandCenterSidebar from './CommandCenterSidebar';

interface AppShellProps {
  children: ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  useEffect(() => setMobileMenuOpen(false), [pathname]);

  if (pathname === '/login') return <>{children}</>;

  if (!mounted) {
    return (
      <div className="min-h-screen bg-wise-black flex items-center justify-center">
        <div className="text-wise-electric text-lg font-bold tracking-wider animate-pulse">WISE²</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-wise-black text-text-primary">
      <a href="#main-content" className="wise-skip-link">Skip to content</a>
      <CommandCenterTopBar
        onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
        onSidebarToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileMenuOpen={mobileMenuOpen}
      />

      <div className="flex pt-[var(--topbar-height)] min-h-screen">
        <div className="hidden lg:block">
          <CommandCenterSidebar
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
        </div>

        {mobileMenuOpen && (
          <>
            <div
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden animate-fade-in"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close navigation"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Escape' || e.key === 'Enter') setMobileMenuOpen(false); }}
            />
            <div className="fixed left-0 top-0 bottom-0 z-50 w-[260px] lg:hidden animate-slide-up">
              <CommandCenterSidebar
                collapsed={false}
                onToggle={() => setMobileMenuOpen(false)}
                mobile
              />
            </div>
          </>
        )}

        <main id="main-content" role="main" className="flex-1 min-w-0 overflow-y-auto">
          <div className="p-4 lg:p-6 max-w-[1600px]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
