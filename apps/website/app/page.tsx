import { Menu } from 'lucide-react';

export default function Home() {
  const modules = [
    { id: 'command', label: 'Command Center', abbr: 'CC' },
    { id: 'sound', label: 'Sound Lab', abbr: 'SL' },
    { id: 'live', label: 'Live Studio', abbr: 'LV' },
    { id: 'jingle', label: 'Jingle Lab', abbr: 'JL' },
    { id: 'voice', label: 'Voice Lab', abbr: 'VL' },
    { id: 'factory', label: 'Content Factory', abbr: 'CF' },
    { id: 'showcase', label: 'Client Showcase', abbr: 'SH' },
  ];

  return (
    <div className="flex h-screen bg-black text-white font-sans">
      {/* Sidebar */}
      <div className="w-56 flex-none bg-black border-r border-gray-800 flex flex-col p-4 gap-4">
        <div>
          <h1 className="text-2xl font-black">W2</h1>
          <p className="text-xs text-gray-500 mt-1">CREATIVE STUDIO</p>
        </div>

        <div className="text-xs uppercase tracking-wider text-gray-600 font-semibold">Studio Modules</div>

        <nav className="flex-1 space-y-2">
          {modules.map((mod) => (
            <button
              key={mod.id}
              className="w-full text-left px-3 py-2 rounded border transition border-transparent text-gray-400 hover:text-white hover:border-green-500/50"
            >
              <span className="text-xs font-mono">{mod.abbr}</span>
              <div className="text-sm font-semibold">{mod.label}</div>
            </button>
          ))}
        </nav>

        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-3 space-y-2">
          <div className="flex justify-between text-xs text-gray-500">
            <span>AI CREDITS</span>
            <span className="text-green-500 font-bold">7214</span>
          </div>
          <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
            <div className="w-2/3 h-full bg-green-500"></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>STORAGE</span>
            <span className="text-gray-300">61.8 GB</span>
          </div>
          <button className="w-full bg-green-500 hover:bg-green-600 text-black font-bold py-2 rounded text-xs uppercase">
            + Top Up Credits
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          All Systems Operational
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="border-b border-gray-800 px-8 py-4 flex items-center justify-between flex-none">
          <div>
            <h2 className="text-2xl font-black text-green-500">COMMAND CENTER</h2>
            <p className="text-xs text-gray-500 mt-1">Welcome back, Darrin. 3 renders finished overnight.</p>
          </div>
          <button className="bg-green-500 hover:bg-green-600 text-black px-6 py-2 rounded font-bold text-sm">
            + New Session
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-8">
          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <p className="text-xs text-gray-500 uppercase mb-2">Revenue Today</p>
              <p className="text-3xl font-bold text-white">$24,583.00</p>
              <p className="text-xs text-green-500 mt-2">📈 12.5% from previous</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <p className="text-xs text-gray-500 uppercase mb-2">Active Automations</p>
              <p className="text-3xl font-bold text-white">127</p>
              <p className="text-xs text-green-500 mt-2">🟢 5 new today</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <p className="text-xs text-gray-500 uppercase mb-2">AI Tasks Completed</p>
              <p className="text-3xl font-bold text-white">3,245</p>
              <p className="text-xs text-green-500 mt-2">📊 12.7% this week</p>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h3 className="font-bold text-lg mb-4">System Status</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">API Uptime</span>
                <span className="text-green-500">99.99%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Database Health</span>
                <span className="text-green-500">✓ Optimal</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Services Running</span>
                <span className="text-green-500">12/12 Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
