'use client';

import { useEffect, useState } from 'react';
import { Menu, X, RefreshCw, AlertTriangle, Shield } from 'lucide-react';
import { useWiseDefenseApi } from '@/hooks/useWiseDefenseApi';
import { CrimeRadarWidget } from '@/components/knight-wing/CrimeRadarWidget';
import { SDRMonitoringPanel } from '@/components/knight-wing/SDRMonitoringPanel';
import { WatchZonesMap } from '@/components/knight-wing/WatchZonesMap';
import { SignalStrengthChart } from '@/components/knight-wing/SignalStrengthChart';
import { IncidentTimeline } from '@/components/knight-wing/IncidentTimeline';

export default function KnightWingDashboard() {
  const { data, loading, error, refresh } = useWiseDefenseApi({
    autoRefresh: true,
    refreshInterval: 10000,
    useWebSocket: true,
  });

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    setLastUpdate(new Date());
  }, [data]);

  const systemStatus = {
    internet: 'ONLINE',
    cellular: 'STANDBY',
    meshtastic: data?.meshNodes?.length > 0 ? 'ONLINE' : 'UNKNOWN',
    gmrs: 'ONLINE',
    hamRadio: 'ONLINE',
    sdrMonitor: data?.sdrSignals?.length > 0 ? 'ONLINE' : 'UNKNOWN',
  };

  const navigationItems = [
    { label: 'DASHBOARD', href: '#' },
    { label: 'INCIDENTS', href: '#' },
    { label: 'FREQUENCIES', href: '#' },
    { label: 'WATCH ZONES', href: '#' },
    { label: 'ALERTS', href: '#' },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-black/80 backdrop-blur-sm border-b border-red-600/20">
        <div className="px-4 sm:px-6 lg:px-8 py-4 max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-gray-300 to-gray-400 rounded flex items-center justify-center font-black text-2xl text-black">
                W
              </div>
              <div>
                <p className="text-sm font-black tracking-widest">WISE² DEFENSE KNIGHT WING</p>
                <p className="text-xs text-gray-500">TRAIN. TEACH. PROTECT.</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              {navigationItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className={`text-xs font-bold tracking-wider uppercase transition-colors ${
                    item.label === 'DASHBOARD' ? 'text-red-600' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {item.label}
                </a>
              ))}
            </div>

            {/* Actions */}
            <div className="hidden lg:flex items-center gap-3">
              <button
                onClick={() => refresh()}
                disabled={loading}
                className="p-2 rounded hover:bg-red-600/10 text-red-600 disabled:opacity-50 transition-all"
                title="Refresh data"
              >
                <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
              </button>
              <div className="w-px h-6 bg-red-600/20" />
              <div className="text-xs text-gray-500 font-mono">
                {lastUpdate.toLocaleTimeString()}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="lg:hidden mt-4 pt-4 border-t border-red-600/20 space-y-3 pb-4">
              {navigationItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="block px-4 py-2 text-sm font-bold text-gray-300 hover:text-red-500"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
        {/* Error Banner */}
        {error && (
          <div className="mb-6 border border-red-600/50 bg-red-600/10 rounded-lg p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-white text-sm">API Connection Error</p>
              <p className="text-xs text-gray-400 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Status Strip */}
        <div className="mb-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {Object.entries(systemStatus).map(([key, value]) => (
            <div
              key={key}
              className="border border-red-600/20 rounded-lg p-3 bg-black/30 text-center hover:border-red-600/40 transition-all"
            >
              <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-1">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </p>
              <p
                className={`text-sm font-black ${
                  value === 'ONLINE'
                    ? 'text-green-500'
                    : value === 'UNKNOWN'
                    ? 'text-gray-500'
                    : 'text-yellow-500'
                }`}
              >
                {value}
              </p>
            </div>
          ))}
        </div>

        {/* Primary Widgets */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Crime Radar */}
          <CrimeRadarWidget
            incidents={data?.incidents || []}
            loading={loading}
          />

          {/* SDR Monitoring */}
          <SDRMonitoringPanel
            signals={data?.sdrSignals || []}
            loading={loading}
          />
        </div>

        {/* Secondary Widgets */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Watch Zones Map */}
          <WatchZonesMap
            zones={data?.watchZones || []}
            loading={loading}
          />

          {/* Signal Strength Chart */}
          <SignalStrengthChart
            signals={data?.sdrSignals || []}
            loading={loading}
          />
        </div>

        {/* Timeline */}
        <div className="mb-6">
          <IncidentTimeline
            incidents={data?.incidents || []}
            loading={loading}
          />
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-red-600/20 text-center">
          <div className="mb-6">
            <Shield className="w-12 h-12 mx-auto text-red-600/50 mb-4" />
            <p className="text-sm font-black tracking-wider text-red-600 uppercase mb-2">
              LOCAL AWARENESS. OFFLINE RESILIENCE. MISSION READY.
            </p>
            <p className="text-xs text-gray-500">
              WISE² DEFENSE KNIGHT WING TACTICAL INTELLIGENCE NODE
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-xs text-gray-600">
            <span>© 2026 WISE DEFENSE L.L.C.</span>
            <span>•</span>
            <span>Greensboro, NC</span>
            <span>•</span>
            <span>MONITORING ACTIVE</span>
          </div>
        </div>
      </main>
    </div>
  );
}
