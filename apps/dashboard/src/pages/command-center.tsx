'use client';

import { useCommandCenter } from '@/hooks/useCommandCenter';
import {
  RevenueCard,
  JobsCard,
  TechUtilizationCard,
  OpenEstimatesCard,
  OutstandingARCard,
  MarginAlertsCard,
} from '@/components/CommandCenter/DashboardCards';
import {
  AIRecommendationsPanel,
  TodaySchedulePanel,
  BusinessHealthPanel,
  RecentCallsPanel,
  PermissionEnginePanel,
} from '@/components/CommandCenter/DashboardPanels';
import { CardLoading } from '@/components/CommandCenter/CardContainer';

export default function CommandCenterPage() {
  const { completeDashboard } = useCommandCenter();
  const isLoading = completeDashboard.isLoading;
  const error = completeDashboard.error;

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-neon-green mb-2">COMMAND CENTER</h1>
        <p className="text-gray-400 text-sm">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>

      {/* Top KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
        {isLoading ? (
          <>
            {[...Array(6)].map((_, i) => <CardLoading key={i} />)}
          </>
        ) : error ? (
          <div className="col-span-full text-red-500 p-4">
            Failed to load dashboard. Please try again.
          </div>
        ) : (
          <>
            <RevenueCard />
            <JobsCard />
            <TechUtilizationCard />
            <OpenEstimatesCard />
            <OutstandingARCard />
            <MarginAlertsCard />
          </>
        )}
      </div>

      {/* Main Content Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => <CardLoading key={i} className="h-96" />)}
        </div>
      ) : error ? (
        <div className="text-red-500 p-4">
          Failed to load dashboard panels. Please refresh.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-1 space-y-6">
            <AIRecommendationsPanel />
            <BusinessHealthPanel />
            <PermissionEnginePanel />
          </div>

          {/* Center Column */}
          <div className="lg:col-span-1">
            <TodaySchedulePanel />
          </div>

          {/* Right Column */}
          <div className="lg:col-span-1">
            <RecentCallsPanel />
          </div>
        </div>
      )}

      {/* Quick Actions Footer */}
      <div className="mt-8 p-4 border border-gray-700 rounded-lg bg-gray-900">
        <h3 className="text-neon-green font-bold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <QuickActionButton label="New Lead" icon="+" />
          <QuickActionButton label="New Job" icon="+" />
          <QuickActionButton label="Create Estimate" icon="+" />
          <QuickActionButton label="Schedule" icon="+" />
        </div>
      </div>
    </div>
  );
}

interface QuickActionButtonProps {
  label: string;
  icon: string;
}

function QuickActionButton({ label, icon }: QuickActionButtonProps) {
  return (
    <button className="bg-gray-800 hover:bg-gray-700 border border-gray-600 hover:border-neon-green transition-colors p-3 rounded text-sm font-semibold text-white">
      <span className="text-neon-green mr-1">{icon}</span>
      {label}
    </button>
  );
}
