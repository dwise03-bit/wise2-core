'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { SystemStatusBar } from '@/components/dashboard/SystemStatusBar';
import { CommandCenterHeader } from '@/components/dashboard/CommandCenterHeader';
import { MetricsGrid } from '@/components/dashboard/MetricsGrid';
import { SystemHealth } from '@/components/dashboard/SystemHealth';
import { LiveActivityFeed } from '@/components/dashboard/LiveActivityFeed';
import { AICommandPanel } from '@/components/dashboard/AICommandPanel';
import { BusinessIntelligence } from '@/components/dashboard/BusinessIntelligence';
import { RaspberryPiPanel } from '@/components/dashboard/RaspberryPiPanel';
import { BottomDock } from '@/components/dashboard/BottomDock';
import { CommandPalette } from '@/components/dashboard/CommandPalette';
import { NotificationCenter } from '@/components/dashboard/NotificationCenter';
import { ThemeSwitcher } from '@/components/dashboard/ThemeSwitcher';
import { APIMonitoring } from '@/components/dashboard/APIMonitoring';
import { ExportPanel } from '@/components/dashboard/ExportPanel';
import { AdvancedAnalytics } from '@/components/dashboard/AdvancedAnalytics';
import { LayoutManager } from '@/components/dashboard/LayoutManager';
import { APIIntegrations } from '@/components/dashboard/APIIntegrations';
import { BackupRecovery } from '@/components/dashboard/BackupRecovery';

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [userRole] = useState<'admin' | 'manager' | 'operator' | 'viewer'>('admin');

  useEffect(() => {
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-emerald-500 border-t-emerald-300 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-gray-400">Initializing Command Center...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* System Status Bar */}
      <SystemStatusBar systemData={{}} />

      {/* Top Control Bar */}
      <div className="sticky top-16 z-40 bg-[#050505] border-b border-emerald-500/20 backdrop-blur-sm px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="text-xs text-gray-500">
            Role: <span className="text-emerald-400 font-semibold">{userRole.toUpperCase()}</span> • Cmd+K commands • T theme • ? help
          </div>
          <div className="flex items-center gap-3">
            <ExportPanel />
            <div className="h-6 border-l border-[#161616]" />
            <NotificationCenter />
            <ThemeSwitcher />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="pt-8">
        {/* Command Center Header */}
        <CommandCenterHeader />

        {/* Primary Metrics Grid */}
        <section className="px-6 py-8 max-w-7xl mx-auto">
          <MetricsGrid metrics={{}} />
        </section>

        {/* Enhanced Dashboard Grid - 5 Column Layout */}
        <div className="px-6 pb-32 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Column 1 - System & Infrastructure */}
            <div className="space-y-6">
              <SystemHealth systemData={{}} />
              <RaspberryPiPanel systemData={{}} />
              <BackupRecovery />
            </div>

            {/* Column 2 - AI & Real-Time */}
            <div className="space-y-6">
              <AICommandPanel />
              <APIMonitoring />
            </div>

            {/* Column 3 - Analytics & Insights */}
            <div className="space-y-6">
              <AdvancedAnalytics />
              <LayoutManager />
            </div>

            {/* Column 4 - Business Intelligence */}
            <div className="space-y-6">
              <BusinessIntelligence metrics={{}} />
              <APIIntegrations />
            </div>

            {/* Column 5 - Activity & Events */}
            <div>
              <LiveActivityFeed activities={[]} />
            </div>
          </div>
        </div>
      </main>

      {/* Command Palette */}
      <CommandPalette />

      {/* Bottom Dock */}
      <BottomDock />
    </div>
  );
}
