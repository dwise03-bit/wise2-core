'use client';

import { ArrowRight, Glasses, Radio, Zap, BarChart3, Mic, Camera, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function RayBanPage() {
  const [status, setStatus] = useState('checking');
  const [metrics, setMetrics] = useState({
    devicesConnected: 0,
    capturesProcessed: 0,
    avgConfidence: 0,
    avgLatency: 0,
  });

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch('/api/rayban/captures?limit=100', {
          headers: { Accept: 'application/json' },
          cache: 'no-store',
        });
        if (!response.ok) throw new Error('Capture service unavailable');
        const captures = await response.json();
        const devices = new Set(captures.map((capture: { deviceId?: string }) => capture.deviceId).filter(Boolean));
        setStatus('live');
        setMetrics((current) => ({
          ...current,
          devicesConnected: devices.size,
          capturesProcessed: captures.length,
        }));
      } catch {
        setStatus('connecting');
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Hero Section */}
      <section className="mx-auto max-w-6xl px-5 pb-16 pt-12 sm:px-8 sm:pt-20">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_.95fr]">
        <div className="mb-4">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/30">
            <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span className="text-sm font-medium text-cyan-300">
              {status === 'live' ? '🟢 Service Live' : '🟡 Initializing'}
            </span>
          </div>

          <p className="mb-4 text-xs font-semibold uppercase tracking-[.28em] text-slate-500">Field operations / live command layer</p>
          <h1 className="mb-6 text-5xl font-bold font-fira-code tracking-[-.04em] sm:text-6xl">
            Ray-Ban Integration
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">
              Field Service AI
            </span>
          </h1>

          <p className="text-xl text-slate-300 max-w-2xl mb-8">
            Real-time AI analysis for field technicians. Connect Ray-Ban Meta glasses with Motorola Razr
            for emergency diagnostics, equipment inspection, and voice-controlled operations.
          </p>

          <div className="flex flex-col gap-4 sm:flex-row">
            <Link
              href="/hermes"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 font-medium transition-all duration-300"
            >
              Open Dashboard <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#features"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-slate-700 hover:border-cyan-500 transition-colors"
            >
              Learn More
            </a>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-cyan-400/25 bg-slate-900/75 p-5 shadow-[0_0_70px_rgba(34,211,238,.10)] backdrop-blur sm:p-7">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(34,211,238,.10),transparent_45%,rgba(16,185,129,.08))]" />
          <div className="relative">
            <div className="mb-8 flex items-center justify-between border-b border-white/10 pb-4">
              <div><p className="text-[10px] font-bold uppercase tracking-[.24em] text-cyan-300">Field console</p><p className="mt-1 text-sm text-slate-300">Ray-Ban / Hermes bridge</p></div>
              <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-300">{status === 'live' ? 'Online' : 'Connecting'}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[['01','Capture','Vision input'],['02','Analyze','Hermes AI'],['03','Route','Work order']].map(([step,label,detail], index) => <div key={step} className="rounded-xl border border-white/10 bg-black/20 p-4"><div className="mb-5 flex items-center justify-between"><span className="text-xs font-mono text-cyan-300">{step}</span><span className={`h-2 w-2 rounded-full ${index < 2 ? 'bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,.8)]' : 'bg-slate-600'}`} /></div><p className="font-semibold text-white">{label}</p><p className="mt-1 text-xs text-slate-500">{detail}</p></div>)}
              <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/5 p-4"><div className="mb-5 flex items-center justify-between"><span className="text-xs font-mono text-cyan-300">SYNC</span><span className="text-xs text-cyan-200">10s</span></div><p className="font-semibold text-white">Cloud relay</p><p className="mt-1 text-xs text-slate-500">Live API heartbeat</p></div>
            </div>
            <div className="mt-4 flex items-center gap-3 rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-xs text-slate-400"><span className="h-2 w-2 rounded-full bg-emerald-400" /> Secure transport active <span className="ml-auto font-mono text-slate-600">/api/rayban</span></div>
          </div>
        </div>
        </div>

        {/* Status Card */}
        <div className="mb-12 rounded-2xl border border-cyan-400/20 bg-slate-900/70 p-5 shadow-[0_20px_70px_rgba(2,8,23,.35)] backdrop-blur-sm sm:p-8">
          <div className="grid md:grid-cols-4 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Glasses className="w-5 h-5 text-cyan-400" />
                <span className="text-sm font-medium text-slate-400">Devices Connected</span>
              </div>
              <p className="text-3xl font-bold">{metrics.devicesConnected}</p>
              <p className="text-xs text-slate-500 mt-1">Ray-Ban Pro glasses</p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Camera className="w-5 h-5 text-emerald-400" />
                <span className="text-sm font-medium text-slate-400">Captures Processed</span>
              </div>
              <p className="text-3xl font-bold">{metrics.capturesProcessed}</p>
              <p className="text-xs text-slate-500 mt-1">Video/image frames</p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-amber-400" />
                <span className="text-sm font-medium text-slate-400">Avg Confidence</span>
              </div>
              <p className="text-3xl font-bold">{metrics.avgConfidence}%</p>
              <p className="text-xs text-slate-500 mt-1">AI accuracy baseline</p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-5 h-5 text-indigo-400" />
                <span className="text-sm font-medium text-slate-400">Avg Latency</span>
              </div>
              <p className="text-3xl font-bold">{metrics.avgLatency}ms</p>
              <p className="text-xs text-slate-500 mt-1">Processing time</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="max-w-6xl mx-auto px-8 py-16 border-t border-slate-800">
        <h2 className="text-3xl font-bold mb-12 font-fira-code text-center">Hardware Integration</h2>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {/* Ray-Ban Integration */}
          <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-8 backdrop-blur-sm hover:border-cyan-500 transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                <Glasses className="w-5 h-5 text-cyan-500" />
              </div>
              <h3 className="text-lg font-bold font-fira-code">Ray-Ban Meta Pro</h3>
            </div>
            <p className="text-slate-400 mb-4">
              Full integration with Meta Ray-Ban Pro glasses for field capture, voice commands, and real-time analysis.
            </p>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>✓ 4K video capture & streaming</li>
              <li>✓ Real-time location tracking</li>
              <li>✓ Battery & status monitoring</li>
              <li>✓ Voice command execution</li>
            </ul>
          </div>

          {/* Motorola Razr Bridge */}
          <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-8 backdrop-blur-sm hover:border-emerald-500 transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <Radio className="w-5 h-5 text-emerald-500" />
              </div>
              <h3 className="text-lg font-bold font-fira-code">Motorola Razr Bridge</h3>
            </div>
            <p className="text-slate-400 mb-4">
              Bluetooth 5.2 connectivity between Ray-Ban glasses and mobile device for command relay and cloud sync.
            </p>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>✓ Bluetooth 5.2 (240m range)</li>
              <li>✓ Sub-100ms latency</li>
              <li>✓ Bidirectional communication</li>
              <li>✓ Automatic failover</li>
            </ul>
          </div>

          {/* Hermes AI Integration */}
          <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-8 backdrop-blur-sm hover:border-indigo-500 transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                <Zap className="w-5 h-5 text-indigo-500" />
              </div>
              <h3 className="text-lg font-bold font-fira-code">Hermes AI Engine</h3>
            </div>
            <p className="text-slate-400 mb-4">
              Real-time AI analysis for scene understanding, object detection, OCR, and equipment diagnostics.
            </p>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>✓ Scene understanding</li>
              <li>✓ Object detection (95%+ accuracy)</li>
              <li>✓ Text recognition (OCR)</li>
              <li>✓ Thermal analysis</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="max-w-6xl mx-auto px-8 py-16 border-t border-slate-800">
        <h2 className="text-3xl font-bold mb-12 font-fira-code text-center">Field Service Operations</h2>

        <div className="grid md:grid-cols-2 gap-8">
          {/* HVAC Diagnostics */}
          <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-8 backdrop-blur-sm">
            <h3 className="text-xl font-bold mb-4 text-cyan-400">Emergency HVAC Service</h3>
            <p className="text-slate-400 mb-4">
              Technician captures equipment details with Ray-Ban glasses. AI instantly diagnoses compressor failure,
              estimates replacement costs, and generates work orders.
            </p>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <Camera className="w-4 h-4 mt-1 text-emerald-400 flex-shrink-0" />
                <span>Capture scene and close-up details</span>
              </div>
              <div className="flex items-start gap-2">
                <Zap className="w-4 h-4 mt-1 text-amber-400 flex-shrink-0" />
                <span>AI analyzes equipment condition</span>
              </div>
              <div className="flex items-start gap-2">
                <Mic className="w-4 h-4 mt-1 text-indigo-400 flex-shrink-0" />
                <span>Voice commands: "diagnose this" or "estimate cost"</span>
              </div>
            </div>
          </div>

          {/* Multi-Service Support */}
          <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-8 backdrop-blur-sm">
            <h3 className="text-xl font-bold mb-4 text-emerald-400">Multi-Service Operations</h3>
            <p className="text-slate-400 mb-4">
              Unified platform for HVAC, plumbing, electrical, and field service. Each tech gets real-time AI
              support specific to their service type.
            </p>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 mt-1 text-emerald-400 flex-shrink-0" />
                <span>Real-time equipment diagnostics</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 mt-1 text-emerald-400 flex-shrink-0" />
                <span>Automated work order generation</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 mt-1 text-emerald-400 flex-shrink-0" />
                <span>Voice-controlled documentation</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-6xl mx-auto px-8 py-16 border-t border-slate-800">
        <div className="rounded-lg border border-cyan-500/30 bg-gradient-to-r from-cyan-500/5 to-emerald-500/5 p-12 text-center">
          <h2 className="text-3xl font-bold mb-4 font-fira-code">Ready to Deploy?</h2>
          <p className="text-slate-300 max-w-2xl mx-auto mb-8">
            Connect Ray-Ban Meta glasses with your field team today. Real-time AI diagnostics, voice commands, and
            instant documentation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/hermes"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 font-medium transition-all"
            >
              Launch Ray-Ban Dashboard <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="mailto:dwise03@gmail.com"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-lg border border-slate-700 hover:border-cyan-500 transition-colors"
            >
              Contact Support
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <section className="max-w-6xl mx-auto px-8 py-16 border-t border-slate-800 text-center">
        <p className="text-slate-500 mb-4">
          Ray-Ban Integration • Powered by WISE² • Hermes AI • Motorola Razr Bridge
        </p>
        <p className="text-slate-600 text-sm">
          Service Status: <span className={status === 'live' ? 'text-emerald-400' : 'text-amber-400'}>{status.toUpperCase()}</span>
        </p>
      </section>
    </div>
  );
}
