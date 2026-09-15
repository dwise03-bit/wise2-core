'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  TrendingUp,
  TrendingDown,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  Radio,
  Zap,
  Users,
  Gauge,
  Navigation,
  Settings,
  BarChart3,
  Clock,
  Activity,
  Shield,
  Smartphone,
} from 'lucide-react';

export default function FieldTechCommand() {
  const [metrics, setMetrics] = useState({
    revenue: 142680,
    orders: 18,
    completion: 94,
    callbacks: 2,
    techs: { active: 12, total: 14 },
    health: 98,
  });

  const [gauges, setGauges] = useState({
    pressure1: 72,
    pressure2: 278,
    temp: 18,
    superheat: 12,
    subcooling: 10,
  });

  // Real-time updates simulation
  useEffect(() => {
    const metricsInterval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        revenue: prev.revenue + Math.floor(Math.random() * 5000 - 2500),
        orders: Math.max(15, prev.orders + Math.floor(Math.random() * 3 - 1)),
        completion: Math.min(99, Math.max(90, prev.completion + Math.floor(Math.random() * 3 - 1))),
      }));
    }, 5000);

    const gaugesInterval = setInterval(() => {
      setGauges(prev => ({
        pressure1: Math.floor(Math.random() * 5 + 70),
        pressure2: Math.floor(Math.random() * 20 + 270),
        temp: Math.floor(Math.random() * 4 + 16),
        superheat: Math.floor(Math.random() * 4 + 10),
        subcooling: Math.floor(Math.random() * 4 + 8),
      }));
    }, 4000);

    return () => {
      clearInterval(metricsInterval);
      clearInterval(gaugesInterval);
    };
  }, []);

  const MetricCard = ({ title, value, delta, icon: Icon, trend = 'up' }: any) => (
    <Card className="group relative overflow-hidden bg-gradient-to-br from-slate-900/50 to-slate-800/30 border-cyan-500/20 hover:border-cyan-500/40 transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,217,255,0.1)]">
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <CardContent className="p-5 relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</p>
          </div>
          <Icon className="w-4 h-4 text-cyan-400/60 group-hover:text-cyan-400 transition-colors" />
        </div>
        <div className="flex items-baseline gap-2">
          <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-green to-cyan-400">
            {typeof value === 'number' && value > 1000 ? `$${(value / 1000).toFixed(1)}K` : value}
          </p>
          <div className={`flex items-center gap-1 text-xs font-semibold ${trend === 'up' ? 'text-neon-green' : 'text-red-400'}`}>
            {trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {delta}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-black">
      {/* Animated background grid */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(0,217,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,217,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none" />

      {/* Radial gradient overlays */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-[500px] h-[500px] bg-neon-green/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-slate-800/50 backdrop-blur-sm bg-black/20">
          <div className="max-w-8xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="text-2xl font-black bg-gradient-to-r from-cyan-400 via-neon-green to-cyan-400 bg-clip-text text-transparent animate-pulse">
                    W² WISE²
                  </div>
                  <div className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-cyan-500/0 via-cyan-500/60 to-cyan-500/0" />
                </div>
                <div className="hidden sm:flex items-center gap-2 pl-4 border-l border-slate-700/50">
                  <Radio className="w-3 h-3 text-neon-green animate-pulse" />
                  <span className="text-xs font-semibold text-neon-green">FIELD OPERATIONS COMMAND</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden md:flex items-center gap-2 bg-slate-900/50 rounded-lg p-2 border border-slate-800/50">
                  <Button variant="ghost" size="sm" className="h-7 text-xs bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30">
                    AUTO
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 text-xs text-slate-400 hover:text-slate-300">
                    LOCAL
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 text-xs text-slate-400 hover:text-slate-300">
                    ☁️ CLOUD
                  </Button>
                </div>
                <Badge variant="outline" className="border-neon-green/50 bg-neon-green/10 text-neon-green">
                  🟢 LIVE
                </Badge>
              </div>
            </div>
          </div>
        </header>

        {/* Sidebar + Main Content */}
        <div className="flex h-[calc(100vh-70px)]">
          {/* Sidebar */}
          <aside className="w-48 border-r border-slate-800/50 bg-black/20 backdrop-blur-sm overflow-y-auto">
            <nav className="space-y-1 p-3">
              {[
                { icon: '🏠', label: 'Dashboard', active: true },
                { icon: '📋', label: 'Work Orders' },
                { icon: '🚗', label: 'Dispatch' },
                { icon: '🔍', label: 'Diagnostics' },
                { icon: '📦', label: 'Assets' },
                { icon: '👥', label: 'Customers' },
                { icon: '📊', label: 'Inventory' },
                { icon: '🤖', label: 'AI Copilot' },
                { icon: '⚙️', label: 'Settings' },
              ].map((item, i) => (
                <button
                  key={i}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-300 flex items-center gap-2 ${
                    item.active
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-[inset_0_0_8px_rgba(0,217,255,0.1)]'
                      : 'text-slate-400 hover:text-slate-300 hover:bg-slate-900/50'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto">
            <div className="max-w-8xl mx-auto p-6 space-y-6">
              {/* KPI Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                <MetricCard title="Revenue (MTD)" value={metrics.revenue} delta="↑ 12%" icon={BarChart3} />
                <MetricCard title="Work Orders" value={metrics.orders} delta="↓ 3" icon={Navigation} trend="down" />
                <MetricCard title="Completion Rate" value={`${metrics.completion}%`} delta="↑ 6%" icon={CheckCircle2} />
                <MetricCard title="Callbacks" value={metrics.callbacks} delta="↓ 60%" icon={AlertTriangle} trend="down" />
                <MetricCard title="Active Techs" value={`${metrics.techs.active}/${metrics.techs.total}`} delta="On Field" icon={Users} />
                <MetricCard title="Equipment Health" value={`${metrics.health}%`} delta="All Systems Go" icon={Activity} />
              </div>

              {/* Live Dispatch & Diagnostics */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Map & Dispatch */}
                <Card className="lg:col-span-2 bg-gradient-to-br from-slate-900/50 to-slate-800/30 border-cyan-500/20 overflow-hidden">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-cyan-400" />
                        <CardTitle className="text-lg">Live Dispatch Map</CardTitle>
                      </div>
                      <Badge variant="secondary" className="bg-cyan-500/20 text-cyan-300">
                        5 technicians active
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 bg-gradient-to-br from-cyan-500/10 to-neon-green/5 rounded-lg border border-slate-700/50 flex items-center justify-center">
                      <div className="text-center">
                        <MapPin className="w-8 h-8 text-cyan-400/60 mx-auto mb-2 animate-pulse" />
                        <p className="text-sm text-slate-400">Interactive map loading...</p>
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-4 gap-2">
                      {[
                        { color: 'bg-neon-green', label: 'On Site' },
                        { color: 'bg-cyan-400', label: 'En Route' },
                        { color: 'bg-yellow-400', label: 'Scheduled' },
                        { color: 'bg-red-400', label: 'Alert' },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs">
                          <div className={`w-2 h-2 rounded-full ${item.color}`} />
                          <span className="text-slate-400">{item.label}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* HVAC Status */}
                <Card className="bg-gradient-to-br from-slate-900/50 to-slate-800/30 border-neon-green/20">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Gauge className="w-4 h-4 text-neon-green" />
                        HVAC Status
                      </CardTitle>
                      <Badge className="bg-neon-green/20 text-neon-green border-0">🟢 Normal</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: 'Suction', value: `${gauges.pressure1} PSI` },
                        { label: 'Discharge', value: `${gauges.pressure2} PSI` },
                        { label: 'ΔT', value: `${gauges.temp}°` },
                        { label: 'Superheat', value: `${gauges.superheat}°` },
                      ].map((item, i) => (
                        <div key={i} className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/50">
                          <p className="text-xs text-slate-400 mb-1">{item.label}</p>
                          <p className="text-lg font-bold text-cyan-300">{item.value}</p>
                        </div>
                      ))}
                    </div>
                    <div className="pt-2 border-t border-slate-700/50">
                      <p className="text-xs text-slate-400 mb-2">System Health</p>
                      <Progress value={98} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Work Orders & System Checks */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Priority Work Orders */}
                <Card className="bg-gradient-to-br from-slate-900/50 to-slate-800/30 border-red-500/20">
                  <CardHeader>
                    <CardTitle className="text-lg">Priority Work Orders</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      { id: '#1047', title: 'AC Not Cooling', priority: 'HIGH', eta: '18 min', color: 'text-red-400' },
                      { id: '#1048', title: 'No Heat', priority: 'HIGH', eta: '42 min', color: 'text-red-400' },
                      { id: '#1049', title: 'Routine Maintenance', priority: 'MED', eta: 'Today', color: 'text-yellow-400' },
                    ].map((order, i) => (
                      <div key={i} className="flex items-start justify-between p-3 bg-slate-900/30 rounded-lg border border-slate-700/30 hover:border-slate-700/60 transition-colors">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className={`text-xs ${order.color}`}>
                              {order.priority}
                            </Badge>
                            <p className="font-semibold text-sm">{order.id}</p>
                          </div>
                          <p className="text-sm text-slate-400">{order.title}</p>
                        </div>
                        <p className="text-xs text-slate-500 ml-2">{order.eta}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* System Health */}
                <Card className="bg-gradient-to-br from-slate-900/50 to-slate-800/30 border-neon-green/20">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Shield className="w-4 h-4 text-neon-green" />
                      System Health
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      { label: 'System Running', status: 'ok' },
                      { label: 'Electrical Nominal', status: 'ok' },
                      { label: 'No Fault Codes', status: 'ok' },
                      { label: 'Performance Good', status: 'ok' },
                    ].map((check, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <CheckCircle2 className="w-4 h-4 text-neon-green animate-pulse" />
                        <p className="text-sm text-slate-300">{check.label}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Connected Tools & Technician Status */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Connected Tools */}
                <Card className="bg-gradient-to-br from-slate-900/50 to-slate-800/30 border-cyan-500/20">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-cyan-400" />
                      Connected Devices
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { icon: '🔧', label: 'Fieldpiece', status: 'Connected' },
                        { icon: '📟', label: 'Pocket Node', status: 'Connected' },
                        { icon: '🌡️', label: 'K10 Sensors', status: 'Connected' },
                        { icon: 'W²', label: 'WISE² Hub', status: 'Connected' },
                      ].map((device, i) => (
                        <div key={i} className="p-3 bg-slate-900/50 rounded-lg border border-slate-700/50 text-center">
                          <p className="text-xl mb-1">{device.icon}</p>
                          <p className="text-xs font-semibold text-slate-300">{device.label}</p>
                          <p className="text-xs text-neon-green mt-1">{device.status}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Technician Status */}
                <Card className="bg-gradient-to-br from-slate-900/50 to-slate-800/30 border-cyan-500/20">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Users className="w-4 h-4 text-cyan-400" />
                      Technician Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      { name: 'Marcus T.', status: '🟢 On Site', job: '#1047', time: '18 min' },
                      { name: 'Jessica R.', status: '🔵 En Route', job: '#1048', time: '42 min' },
                      { name: 'Daniel K.', status: '🟢 On Site', job: '#1042', time: '1 hr' },
                    ].map((tech, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-slate-900/30 rounded-lg">
                        <div>
                          <p className="text-sm font-semibold text-slate-300">{tech.name}</p>
                          <p className="text-xs text-slate-500">{tech.status}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-semibold text-cyan-400">{tech.job}</p>
                          <p className="text-xs text-slate-500">{tech.time}</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
