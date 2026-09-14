import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'WISE² AR/VR Dashboard',
  description: 'Real-time monitoring for AR/VR ecosystem - Ray-Ban Meta glasses & Meta Quest 3S',
};

export default function ARVRLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-indigo-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">AR</span>
            </div>
            <div>
              <h1 className="font-bold font-fira-code text-white">WISE² AR/VR</h1>
              <p className="text-xs text-slate-400">Monitoring Dashboard</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <a href="/" className="text-sm text-slate-300 hover:text-white transition-colors">
              ← Back to WISE²
            </a>
            <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700" />
          </div>
        </div>
      </nav>

      <main>{children}</main>

      <footer className="mt-20 border-t border-slate-800 bg-slate-950/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-8 py-8">
          <div className="grid grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold font-fira-code text-white mb-4">Monitoring</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="http://localhost:9090" className="hover:text-white transition-colors">Prometheus</a></li>
                <li><a href="http://localhost:3000" className="hover:text-white transition-colors">Grafana</a></li>
                <li><a href="http://localhost:9093" className="hover:text-white transition-colors">Alertmanager</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold font-fira-code text-white mb-4">Documentation</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="/docs/PRODUCTION_INTEGRATION_GUIDE.md" className="hover:text-white transition-colors">Integration Guide</a></li>
                <li><a href="/docs/monitoring/RUNBOOK.md" className="hover:text-white transition-colors">Runbook</a></li>
                <li><a href="/docs/API_EXAMPLES.md" className="hover:text-white transition-colors">API Examples</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold font-fira-code text-white mb-4">Services</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="http://localhost:3100" className="hover:text-white transition-colors">Router API</a></li>
                <li><a href="http://localhost:11434" className="hover:text-white transition-colors">Ollama</a></li>
                <li><a href="http://localhost:3012" className="hover:text-white transition-colors">Second Brain</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold font-fira-code text-white mb-4">Status</h3>
              <div className="space-y-2 text-sm">
                <p className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-slate-300">All Systems Online</span>
                </p>
                <p className="text-slate-400">Last update: 5 seconds ago</p>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-slate-800 text-center text-sm text-slate-400">
            <p>WISE² AR/VR Ecosystem v1.0.0 • Production Ready</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
