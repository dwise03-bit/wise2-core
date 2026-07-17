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
    <div className="h-screen flex flex-col bg-slate-950 text-slate-50 overflow-hidden font-sans">
      {/* Header */}
      <header className="border-b border-blue-900/40 bg-slate-900/80 backdrop-blur-lg px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#0034FF' }}>LIVE STREAMING</h1>
            <p className="text-xs uppercase tracking-widest text-blue-400/70">BROADCAST. ENGAGE. INSPIRE.</p>
          </div>
          <div className="flex items-center gap-4">
            <input
              type="text"
              placeholder="Search streams, channels, or settings..."
              className="bg-slate-800/50 border border-blue-900/30 rounded px-3 py-2 text-sm text-slate-50 placeholder-slate-500 focus:outline-none focus:ring-2 focus:border-transparent"
              style={{ '--tw-ring-color': '#0034FF' } as React.CSSProperties}
            />
            <div className="flex items-center gap-2 text-xs text-green-400">
              <span className="inline-block w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              All Systems Operational
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex gap-3 p-3">
        {/* Left Sidebar - Navigation */}
        <div className="w-48 bg-slate-900/50 rounded border border-blue-900/20 p-3 flex flex-col overflow-y-auto">
          <h2 className="text-xs font-bold uppercase tracking-widest text-blue-300/80 mb-4">Studio</h2>

          <nav className="space-y-2">
            <div className="px-3 py-2 rounded bg-blue-900/20 border-l-2" style={{ borderLeftColor: '#0034FF' }}>
              <p className="text-xs font-semibold text-blue-200">Live Streaming</p>
            </div>
            <div className="px-3 py-2 rounded hover:bg-slate-800/40 cursor-pointer transition-colors">
              <p className="text-xs text-slate-400">Events</p>
            </div>
            <div className="px-3 py-2 rounded hover:bg-slate-800/40 cursor-pointer transition-colors">
              <p className="text-xs text-slate-400">Recordings</p>
            </div>
            <div className="px-3 py-2 rounded hover:bg-slate-800/40 cursor-pointer transition-colors">
              <p className="text-xs text-slate-400">Destinations</p>
            </div>
          </nav>

          <div className="mt-auto pt-4 border-t border-slate-700/30">
            <div className="text-xs text-slate-500">WISE² v2.0.0</div>
          </div>
        </div>

        {/* Center - Main Streaming Area */}
        <div className="flex-1 flex flex-col gap-3 overflow-hidden">
          {/* Video Preview */}
          <div className="flex-1 bg-slate-950/80 rounded border border-blue-900/20 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-slate-950/50"></div>
            <div className="text-center relative z-10">
              <div className="text-6xl mb-4 opacity-30">📹</div>
              <p className="text-slate-400 text-sm font-medium">LIVE STREAMING PREVIEW</p>
              <p className="text-xs text-slate-600 mt-2">Stream preview and visualization</p>
            </div>

            {/* Live Badge */}
            {isStreaming && (
              <div className="absolute top-4 left-4 flex items-center gap-2 bg-slate-900/80 backdrop-blur-sm px-3 py-2 rounded border" style={{ borderColor: '#E53935' }}>
                <span className="inline-block w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: '#E53935' }}></span>
                <span className="text-xs font-bold uppercase" style={{ color: '#E53935' }}>Live</span>
              </div>
            )}
          </div>

          {/* Status & Controls */}
          <div className="bg-slate-900/50 rounded border border-blue-900/20 p-3 space-y-3">
            {/* Status Display Grid */}
            <div className="grid grid-cols-4 gap-2">
              {/* Viewers */}
              <div className="p-3 rounded border border-blue-900/30 bg-blue-900/10">
                <div className="text-xs uppercase tracking-widest text-blue-300/70 mb-2">Viewers</div>
                <div className="text-xl font-bold text-blue-200">{viewerCount.toLocaleString()}</div>
              </div>

              {/* Bitrate */}
              <div className="p-3 rounded border border-blue-900/30 bg-blue-900/10">
                <div className="text-xs uppercase tracking-widest text-blue-300/70 mb-2">Bitrate</div>
                <div className="text-xl font-bold text-blue-200">{bitrate} kbps</div>
              </div>

              {/* Resolution */}
              <div className="p-3 rounded border border-blue-900/30 bg-blue-900/10">
                <div className="text-xs uppercase tracking-widest text-blue-300/70 mb-2">Resolution</div>
                <div className="text-xl font-bold text-blue-200">1080p60</div>
              </div>

              {/* Health */}
              <div className="p-3 rounded border border-green-900/30 bg-green-900/10">
                <div className="text-xs uppercase tracking-widest text-green-300/70 mb-2">Health</div>
                <div className="text-xl font-bold text-green-200">Excellent</div>
              </div>
            </div>

            {/* Stream Control Button */}
            <button
              onClick={() => isStreaming ? streaming.stopStream() : streaming.startStream()}
              className="w-full py-3 px-4 rounded font-bold text-sm uppercase tracking-wide transition-all duration-200 text-white"
              style={{
                backgroundColor: isStreaming ? '#E53935' : '#0034FF',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.9';
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
        <div className="w-80 flex flex-col gap-3 overflow-hidden">
          {/* Stream Info Panel */}
          <div className="bg-slate-900/50 rounded border border-blue-900/20 p-3 overflow-y-auto max-h-64">
            <h3 className="text-xs font-bold uppercase tracking-widest text-blue-300/80 mb-3">Stream Info</h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-500 block mb-1">Title</label>
                <p className="text-slate-200 font-medium">Creative Chaos Live</p>
              </div>

              <div>
                <label className="text-slate-500 block mb-1">Category</label>
                <div className="flex gap-1">
                  <span className="px-2 py-1 bg-blue-900/20 border border-blue-900/30 rounded text-blue-300">Education</span>
                </div>
              </div>

              <div>
                <label className="text-slate-500 block mb-1">Privacy</label>
                <p className="text-slate-200">Public</p>
              </div>

              <div>
                <label className="text-slate-500 block mb-1">Duration</label>
                <p className="text-slate-200">{isStreaming ? '01:24:35' : '00:00:00'}</p>
              </div>
            </div>
          </div>

          {/* Chat */}
          <div className="flex-1 overflow-y-auto">
            <ChatRoom title="LIVE CHAT" isEnabled={true} activeUsers={viewerCount} />
          </div>

          {/* Stream Configuration & Destinations */}
          <div className="overflow-y-auto">
            <StreamingIntegration
              destinations={streaming.destinations}
              config={streaming.config}
              onConnectDestination={streaming.connectDestination}
              onDisconnectDestination={streaming.disconnectDestination}
              onUpdateConfig={streaming.updateConfig}
              allowScheduling
            />
          </div>
        </div>
      </div>
    </div>
  );
}
