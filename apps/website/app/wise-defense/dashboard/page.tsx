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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-gradient-to-b from-slate-900/95 to-slate-950/80 backdrop-blur-xl border-b border-red-600/30 shadow-2xl">
        <div className="px-4 sm:px-6 lg:px-8 py-4 max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-red-600 to-red-800 rounded-lg flex items-center justify-center font-black text-3xl text-white shadow-lg border border-red-500/50">
                W
              </div>
              <div>
                <p className="text-lg font-black tracking-widest text-white">KNIGHT WING</p>
                <p className="text-xs text-red-400/80 font-semibold tracking-wide">TACTICAL INTELLIGENCE NODE</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              {navigationItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className={`text-xs font-bold tracking-widest uppercase transition-all duration-200 ${
                    item.label === 'DASHBOARD'
                      ? 'text-red-500 border-b-2 border-red-500 pb-1'
                      : 'text-gray-400 hover:text-red-400'
                  }`}
                >
                  {item.label}
                </a>
              ))}
            </div>

            {/* Actions */}
            <div className="hidden lg:flex items-center gap-4">
              <button
                onClick={() => refresh()}
                disabled={loading}
                className="p-2 rounded-lg hover:bg-red-600/20 text-red-500 disabled:opacity-50 transition-all hover:border hover:border-red-600/50"
                title="Refresh data"
              >
                <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
              </button>
              <div className="w-px h-6 bg-red-600/30" />
              <div className="text-xs text-gray-400 font-mono bg-black/30 px-3 py-1 rounded border border-red-600/20">
                🔴 {lastUpdate.toLocaleTimeString()}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 hover:bg-red-600/10 rounded-lg transition-all"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="lg:hidden mt-4 pt-4 border-t border-red-600/30 space-y-2 pb-4">
              {navigationItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="block px-4 py-2 text-sm font-bold text-gray-300 hover:text-red-400 hover:bg-red-600/10 rounded-lg transition-colors"
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
          <div className="mb-6 border border-red-600/50 bg-gradient-to-r from-red-600/20 to-red-600/5 rounded-lg p-4 flex items-start gap-3 shadow-lg">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5 animate-pulse" />
            <div>
              <p className="font-bold text-white text-sm">API Connection Error</p>
              <p className="text-xs text-gray-300 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Status Strip */}
        <div className="mb-8">
          <h2 className="text-xs font-bold text-red-500 tracking-widest uppercase mb-3">System Status</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {Object.entries(systemStatus).map(([key, value]) => (
              <div
                key={key}
                className="border border-red-600/30 rounded-xl p-4 bg-gradient-to-br from-slate-800/50 to-slate-900/50 text-center hover:border-red-500/60 hover:shadow-lg hover:shadow-red-600/10 transition-all duration-300 backdrop-blur-sm"
              >
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </p>
                <div className="flex items-center justify-center gap-2">
                  <span
                    className={`w-3 h-3 rounded-full animate-pulse ${
                      value === 'ONLINE'
                        ? 'bg-green-500'
                        : value === 'UNKNOWN'
                        ? 'bg-gray-500'
                        : 'bg-yellow-500'
                    }`}
                  />
                  <p
                    className={`text-sm font-bold ${
                      value === 'ONLINE'
                        ? 'text-green-400'
                        : value === 'UNKNOWN'
                        ? 'text-gray-400'
                        : 'text-yellow-400'
                    }`}
                  >
                    {value}
                  </p>
                </div>
              </div>
            ))}
          </div>
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
        <div className="mt-16 pt-8 border-t border-red-600/20 bg-gradient-to-b from-transparent to-slate-900/30 rounded-lg p-8 text-center">
          <div className="mb-6">
            <div className="flex justify-center mb-4">
              <Shield className="w-12 h-12 text-red-500/80" />
            </div>
            <p className="text-sm font-bold tracking-widest text-red-400 uppercase mb-2">
              🎯 LOCAL AWARENESS • 🔒 OFFLINE RESILIENCE • ⚡ MISSION READY
            </p>
            <p className="text-xs text-gray-400">
              WISE² DEFENSE KNIGHT WING — TACTICAL INTELLIGENCE NODE
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-xs text-gray-500">
            <span>© 2026 WISE DEFENSE L.L.C.</span>
            <span className="text-red-600/50">•</span>
            <span>Greensboro, NC</span>
            <span className="text-red-600/50">•</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>MONITORING ACTIVE</span>
          </div>
        </div>
      </main>
    </div>
  );
}
