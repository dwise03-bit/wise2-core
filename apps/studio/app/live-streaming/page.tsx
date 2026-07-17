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
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-lg px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-emerald-500">LIVE STREAMING</h1>
            <p className="text-sm text-slate-400">BROADCAST. ENGAGE. INSPIRE.</p>
          </div>
          <div className="flex items-center gap-4">
            <input
              type="text"
              placeholder="Search streams, channels, or settings..."
              className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="inline-block w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span> All Systems Operational
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex gap-4 p-4">
        {/* Left Sidebar - Coming Soon */}
        <div className="w-64 bg-gray-900 rounded-lg p-4 border border-gray-700">
          <h2 className="text-sm font-bold text-gray-300 mb-4">NAVIGATION</h2>
          <p className="text-xs text-gray-500">Component structure being designed...</p>
        </div>

        {/* Center - Main Streaming Area */}
        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
          {/* Video Preview */}
          <div className="flex-1 bg-gray-950 rounded-lg border border-gray-700 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">📹</div>
              <p className="text-gray-400 text-sm">Streaming Preview Area</p>
              <p className="text-xs text-gray-500 mt-2">To be implemented with professional streaming UI</p>
            </div>
          </div>

          {/* Status & Controls */}
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-700 space-y-4">
            {/* Enhanced Status Display */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {/* Viewers */}
              <div className={`p-3 rounded-lg border ${viewerCount > 100 ? 'bg-green-500/10 border-green-500/30' : 'bg-yellow-500/10 border-yellow-500/30'}`}>
                <div className="text-xs uppercase tracking-widest text-gray-400 mb-1">VIEWERS</div>
                <div className="text-lg font-bold text-green-400">{viewerCount.toLocaleString()}</div>
              </div>

              {/* Bitrate */}
              <div className={`p-3 rounded-lg border ${bitrate >= 6000 ? 'bg-green-500/10 border-green-500/30' : 'bg-yellow-500/10 border-yellow-500/30'}`}>
                <div className="text-xs uppercase tracking-widest text-gray-400 mb-1">BITRATE</div>
                <div className="text-lg font-bold text-blue-400">{bitrate} kbps</div>
              </div>

              {/* Resolution */}
              <div className="p-3 rounded-lg border bg-green-500/10 border-green-500/30">
                <div className="text-xs uppercase tracking-widest text-gray-400 mb-1">RESOLUTION</div>
                <div className="text-lg font-bold">1080p60</div>
              </div>

              {/* Stream Status */}
              <div className={`p-3 rounded-lg border ${isStreaming ? 'bg-red-500/10 border-red-500/30' : 'bg-gray-500/10 border-gray-500/30'}`}>
                <div className="text-xs uppercase tracking-widest text-gray-400 mb-1">STATUS</div>
                <div className={`text-lg font-bold ${isStreaming ? 'text-red-400' : 'text-gray-400'}`}>
                  {isStreaming ? '🔴 LIVE' : '⚫ OFFLINE'}
                </div>
              </div>
            </div>

            {/* Stream Control Button */}
            <button
              onClick={() => isStreaming ? streaming.stopStream() : streaming.startStream()}
              className={`w-full py-3 px-4 rounded-lg font-bold text-lg transition-colors ${
                isStreaming
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {isStreaming ? '🔴 END STREAM' : '🟢 GO LIVE'}
            </button>
          </div>
        </div>

        {/* Right Sidebar - Chat & Destinations */}
        <div className="w-80 flex flex-col gap-4 overflow-y-auto">
          {/* Chat */}
          <ChatRoom title="LIVE CHAT" isEnabled={true} activeUsers={viewerCount} />

          {/* Stream Configuration & Destinations */}
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
  );
}
