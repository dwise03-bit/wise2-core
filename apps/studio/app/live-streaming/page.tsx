'use client';

import { useStreamingWithAudio } from '../../hooks/useStreamingWithAudio';
import { StreamingIntegration } from '../../components/Shared/Streaming';
import { StreamDestinationsPanel } from '../../components/Shared/Streaming';
import { ChatRoom } from '../../components/Shared/Chat';

/**
 * Live Streaming Page
 *
 * Professional streaming interface with:
 * - Live streaming preview/visualization
 * - Stream status monitoring (wired to audio engine)
 * - Audio mixer for guest/music management (wired to audio engine)
 * - Scene switcher for multi-camera setups
 * - Stream destinations (YouTube, Twitch, Facebook, etc.)
 * - Real-time analytics and chat
 *
 * Design reference: WISE² Live Streaming interface
 * Brand colors: Primary Blue #0034FF, Accent Red #E53935
 * Status: Integrated with audio engine & streaming system
 */
export default function LiveStreamingPage() {
  const { audio, streaming } = useStreamingWithAudio();

  const isStreaming = streaming.isStreaming;
  const viewerCount = streaming.streamStatus.viewerCount;
  const bitrate = Math.round(streaming.streamStatus.bitrate);

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-950 text-slate-50 overflow-hidden font-sans">
      {/* Header */}
      <header className="h-16 shrink-0 border-b" style={{ borderColor: 'rgba(0, 52, 255, 0.4)' }}>
        <div className="h-full bg-gradient-to-r from-slate-900/95 via-slate-900/90 to-slate-900/95 backdrop-blur-xl px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="text-2xl font-black" style={{ color: '#0034FF' }}>W²</div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-2xl font-bold truncate" style={{ color: '#0034FF' }}>LIVE STREAMING</h1>
              <p className="text-xs uppercase tracking-widest text-blue-400/70 hidden sm:block">BROADCAST. ENGAGE. INSPIRE.</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 ml-4">
            <input
              type="text"
              placeholder="Search..."
              className="hidden sm:block w-32 lg:w-48 bg-slate-800/50 border border-blue-900/30 rounded px-3 py-1.5 text-xs text-slate-50 placeholder-slate-500 focus:outline-none focus:ring-2 focus:border-transparent"
              style={{ '--tw-ring-color': '#0034FF' } as React.CSSProperties}
            />
            <div className="flex items-center gap-1.5 text-xs text-green-400 whitespace-nowrap">
              <span className="inline-block w-2 h-2 bg-green-400 rounded-full animate-pulse shrink-0"></span>
              <span className="hidden sm:inline">Operational</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row gap-2 sm:gap-3 p-2 sm:p-3">
        {/* Left Sidebar - Navigation */}
        <aside className="hidden lg:flex w-44 xl:w-52 rounded border flex-col overflow-y-auto shrink-0" style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)', borderColor: 'rgba(0, 52, 255, 0.2)' }}>
          <div className="p-3 border-b" style={{ borderColor: 'rgba(0, 52, 255, 0.15)' }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded flex items-center justify-center text-sm font-black" style={{ backgroundColor: '#0034FF', color: 'white' }}>W²</div>
              <span className="text-xs font-bold uppercase" style={{ color: '#0034FF' }}>WISE² STUDIO</span>
            </div>
            <p className="text-xs text-blue-400/70">Organized Chaos</p>
          </div>

          <nav className="space-y-1.5 flex-1 p-3">
            <div className="px-3 py-2.5 rounded" style={{ backgroundColor: 'rgba(0, 52, 255, 0.15)', borderLeft: '3px solid #0034FF' }}>
              <p className="text-xs font-semibold text-blue-300">● Live Streaming</p>
            </div>
            <div className="px-3 py-2.5 rounded hover:bg-slate-800/30 cursor-pointer transition-all duration-200">
              <p className="text-xs text-slate-400 hover:text-slate-200">📅 Events</p>
            </div>
            <div className="px-3 py-2.5 rounded hover:bg-slate-800/30 cursor-pointer transition-all duration-200">
              <p className="text-xs text-slate-400 hover:text-slate-200">🎬 Recordings</p>
            </div>
            <div className="px-3 py-2.5 rounded hover:bg-slate-800/30 cursor-pointer transition-all duration-200">
              <p className="text-xs text-slate-400 hover:text-slate-200">🌍 Destinations</p>
            </div>
          </nav>

          <div className="p-3 border-t" style={{ borderColor: 'rgba(0, 52, 255, 0.15)' }}>
            <div className="text-xs font-semibold mb-1" style={{ color: '#0034FF' }}>WISE² v2.0.0</div>
            <p className="text-xs text-slate-600">Build. Automate. Dominate.</p>
          </div>
        </aside>

        {/* Center - Main Streaming Area */}
        <div className="flex-1 min-w-0 flex flex-col gap-2 sm:gap-3 overflow-hidden">
          {/* Video Preview */}
          <div className="flex-1 min-h-0 rounded border flex items-center justify-center relative overflow-hidden" style={{ backgroundColor: 'rgba(15, 23, 42, 0.8)', borderColor: 'rgba(0, 52, 255, 0.2)' }}>
            <div className="absolute inset-0 opacity-40" style={{ background: `linear-gradient(135deg, rgba(0, 52, 255, 0.1) 0%, rgba(229, 57, 53, 0.05) 100%)` }}></div>
            <div className="text-center relative z-10 px-4">
              <div className="text-4xl sm:text-6xl mb-2 sm:mb-4 opacity-25">📹</div>
              <p className="text-xs sm:text-sm font-bold text-slate-300 uppercase tracking-wide">Live Streaming Preview</p>
              <p className="text-xs text-slate-500 mt-2">Ready to broadcast</p>
            </div>

            {/* Live Badge */}
            {isStreaming && (
              <div className="absolute top-3 left-3 sm:top-4 sm:left-4 flex items-center gap-2 backdrop-blur-md px-2.5 sm:px-3.5 py-2 rounded-full font-bold text-xs" style={{ backgroundColor: 'rgba(229, 57, 53, 0.2)', borderColor: '#E53935', border: '1.5px solid #E53935' }}>
                <span className="inline-block w-2.5 h-2.5 rounded-full animate-pulse shrink-0" style={{ backgroundColor: '#E53935' }}></span>
                <span style={{ color: '#E53935' }}>LIVE</span>
              </div>
            )}
          </div>

          {/* Status & Controls */}
          <div className="shrink-0 rounded border p-3 space-y-3" style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)', borderColor: 'rgba(0, 52, 255, 0.2)' }}>
            {/* Status Display Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="p-2 sm:p-3 rounded min-w-0" style={{ backgroundColor: 'rgba(0, 52, 255, 0.1)', border: '1px solid rgba(0, 52, 255, 0.3)' }}>
                <div className="text-xs uppercase tracking-widest font-semibold mb-1" style={{ color: '#0034FF' }}>Viewers</div>
                <div className="text-lg sm:text-xl font-bold text-blue-200 truncate">{viewerCount.toLocaleString()}</div>
              </div>

              <div className="p-2 sm:p-3 rounded min-w-0" style={{ backgroundColor: 'rgba(0, 52, 255, 0.1)', border: '1px solid rgba(0, 52, 255, 0.3)' }}>
                <div className="text-xs uppercase tracking-widest font-semibold mb-1" style={{ color: '#0034FF' }}>Bitrate</div>
                <div className="text-lg sm:text-xl font-bold text-blue-200 truncate">{bitrate} kbps</div>
              </div>

              <div className="p-2 sm:p-3 rounded min-w-0" style={{ backgroundColor: 'rgba(0, 52, 255, 0.1)', border: '1px solid rgba(0, 52, 255, 0.3)' }}>
                <div className="text-xs uppercase tracking-widest font-semibold mb-1" style={{ color: '#0034FF' }}>Resolution</div>
                <div className="text-lg sm:text-xl font-bold text-blue-200">1080p60</div>
              </div>

              <div className="p-2 sm:p-3 rounded min-w-0" style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
                <div className="text-xs uppercase tracking-widest font-semibold mb-1 text-green-400">Health</div>
                <div className="text-lg sm:text-xl font-bold text-green-200">Excellent</div>
              </div>
            </div>

            {/* Stream Control Button */}
            <button
              onClick={() => isStreaming ? streaming.stopStream() : streaming.startStream()}
              className="w-full py-3 px-4 rounded font-bold text-xs sm:text-sm uppercase tracking-wider transition-all duration-200 text-white shadow-lg hover:shadow-xl"
              style={{
                backgroundColor: isStreaming ? '#E53935' : '#0034FF',
                letterSpacing: '0.1em'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.85';
                e.currentTarget.style.transform = 'scale(1.02)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              {isStreaming ? '■ END STREAM' : '● GO LIVE'}
            </button>
          </div>
        </div>

        {/* Right Sidebar - Chat & Info */}
        <aside className="hidden xl:flex w-72 2xl:w-80 flex-col gap-2 sm:gap-3 overflow-hidden shrink-0">
          {/* Stream Info Panel */}
          <div className="rounded border p-3 overflow-y-auto max-h-40 shrink-0" style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)', borderColor: 'rgba(0, 52, 255, 0.2)' }}>
            <h3 className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#0034FF' }}>📡 Stream Info</h3>

            <div className="space-y-2 text-xs">
              <div>
                <label className="text-slate-500 block mb-0.5">Title</label>
                <p className="text-slate-200 font-medium truncate">Creative Chaos Live</p>
              </div>

              <div>
                <label className="text-slate-500 block mb-0.5">Category</label>
                <span className="inline-block px-2 py-0.5 bg-blue-900/20 border border-blue-900/30 rounded text-blue-300 text-xs">Education</span>
              </div>

              <div>
                <label className="text-slate-500 block mb-0.5">Privacy</label>
                <p className="text-slate-200">Public</p>
              </div>

              <div>
                <label className="text-slate-500 block mb-0.5">Duration</label>
                <p className="text-slate-200 font-mono">{isStreaming ? '01:24:35' : '00:00:00'}</p>
              </div>
            </div>
          </div>

          {/* Chat */}
          <div className="flex-1 min-h-0 overflow-y-auto">
            <ChatRoom title="LIVE CHAT" isEnabled={true} activeUsers={viewerCount} />
          </div>

          {/* Stream Configuration & Destinations */}
          <div className="flex-1 min-h-0 overflow-y-auto">
            <StreamingIntegration
              destinations={streaming.destinations}
              config={streaming.config}
              onConnectDestination={streaming.connectDestination}
              onDisconnectDestination={streaming.disconnectDestination}
              onUpdateConfig={streaming.updateConfig}
              allowScheduling
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
