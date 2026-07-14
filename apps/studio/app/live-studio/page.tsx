'use client';

import { useState } from 'react';

/**
 * Live Studio Page
 *
 * Professional multi-track recording and streaming interface with:
 * - 8-channel live mixer with individual track control
 * - Multi-track recording management (24+ track support)
 * - Scene management for different show formats
 * - Stream destinations with connection status
 * - Real-time metrics (CPU, storage, bitrate, viewers)
 * - Live preview and integrated chat
 * - Keyboard shortcuts for quick access
 * - Recent recordings library
 *
 * Design reference: WISE² Live Studio interface
 * Status: To be implemented by agent
 */
export default function LiveStudioPage() {
  const [isStreaming, setIsStreaming] = useState(true);
  const [isRecording, setIsRecording] = useState(true);
  const [viewerCount, setViewerCount] = useState(1247);
  const [cpuUsage, setCpuUsage] = useState(28);
  const [storageUsed, setStorageUsed] = useState(2.34);
  const [bitrate, setBitrate] = useState(6.2);

  return (
    <div className="h-screen flex flex-col bg-black text-white overflow-hidden">
      {/* Header */}
      <header className="border-b border-gray-700 bg-gray-900 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">LIVE STUDIO</h1>
            <p className="text-sm text-blue-400">RECORD. STREAM. CREATE. PERFORM.</p>
          </div>
          <input
            type="text"
            placeholder="Search Live Studio..."
            className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
          />
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Hero Section */}
        <div className="h-40 bg-gradient-to-b from-gray-900 to-gray-950 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm text-gray-400 mb-2">Professional live streaming, multi-track recording, and real-time production in one powerful studio.</p>
          </div>
          <div className="w-60 h-32 bg-gray-900 rounded border border-gray-700 flex items-center justify-center">
            <span className="text-xs text-gray-500">Studio Preview</span>
          </div>
        </div>

        {/* Status Cards */}
        <div className="px-6 py-4 border-b border-gray-700 overflow-x-auto">
          <div className="flex gap-4">
            <div className="flex-shrink-0 bg-gray-900 rounded border border-green-500/30 p-3 min-w-fit">
              <div className="text-xs text-gray-400 mb-1">LIVE STATUS</div>
              <div className="flex items-center gap-2">
                <span className="text-green-400">●</span>
                <span className="text-sm font-bold">ON AIR</span>
                <span className="text-xs text-gray-500">01:24:58</span>
              </div>
            </div>
            <div className="flex-shrink-0 bg-gray-900 rounded border border-gray-700 p-3 min-w-fit">
              <div className="text-xs text-gray-400 mb-1">RECORDING</div>
              <div className="text-sm font-bold">MULTI-TRACK • 24 Tracks</div>
            </div>
            <div className="flex-shrink-0 bg-gray-900 rounded border border-gray-700 p-3 min-w-fit">
              <div className="text-xs text-gray-400 mb-1">CPU USAGE</div>
              <div className="text-sm font-bold">{cpuUsage}%</div>
            </div>
            <div className="flex-shrink-0 bg-gray-900 rounded border border-gray-700 p-3 min-w-fit">
              <div className="text-xs text-gray-400 mb-1">STORAGE</div>
              <div className="text-sm font-bold">{storageUsed} TB / 8 TB</div>
            </div>
            <div className="flex-shrink-0 bg-gray-900 rounded border border-gray-700 p-3 min-w-fit">
              <div className="text-xs text-gray-400 mb-1">VIEWERS</div>
              <div className="text-sm font-bold">{viewerCount.toLocaleString()} Live</div>
            </div>
            <div className="flex-shrink-0 bg-gray-900 rounded border border-blue-500/30 p-3 min-w-fit">
              <div className="text-xs text-gray-400 mb-1">BITRATE</div>
              <div className="text-sm font-bold text-blue-400">{bitrate} Mbps • Excellent</div>
            </div>
          </div>
        </div>

        {/* Main Work Area */}
        <div className="flex-1 overflow-hidden flex gap-4 p-4">
          {/* Left - Mixer & Controls */}
          <div className="flex-1 flex flex-col gap-4 overflow-y-auto">
            {/* Mixer */}
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-gray-300">LIVE MIXER</h3>
                <button className="text-xs text-blue-400 hover:text-blue-300">View All Tracks</button>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {['MIC 1', 'MIC 2', 'INSTR 1', 'INSTR 2', 'BEAT', 'PLAYBACK', 'MASTER'].map((ch) => (
                  <div key={ch} className="flex-shrink-0 w-12 h-24 bg-gray-800 rounded border border-gray-700" />
                ))}
              </div>
            </div>

            {/* Scenes & Controls */}
            <div className="grid grid-cols-2 gap-4">
              {/* Scenes */}
              <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                <h3 className="text-sm font-bold text-gray-300 mb-3">SCENES</h3>
                <div className="flex gap-2">
                  <button className="flex-1 py-2 px-3 bg-blue-600 rounded text-xs font-semibold">Scene 1</button>
                  <button className="flex-1 py-2 px-3 bg-gray-800 rounded text-xs font-semibold hover:bg-gray-700">Scene 2</button>
                  <button className="text-xs text-gray-400 hover:text-gray-300">More</button>
                </div>
              </div>

              {/* Controls */}
              <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                <h3 className="text-sm font-bold text-gray-300 mb-3">LIVE CONTROLS</h3>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setIsStreaming(!isStreaming)}
                    className={`py-2 px-2 rounded text-xs font-semibold transition-colors ${
                      isStreaming ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {isStreaming ? 'Stop' : 'Start'} Stream
                  </button>
                  <button
                    onClick={() => setIsRecording(!isRecording)}
                    className={`py-2 px-2 rounded text-xs font-semibold transition-colors ${
                      isRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {isRecording ? 'Stop' : 'Start'} Record
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right - Preview & Chat */}
          <div className="w-80 flex flex-col gap-4 overflow-y-auto">
            {/* Live Preview */}
            <div className="bg-gray-900 rounded-lg border border-gray-700 aspect-video flex items-center justify-center">
              <span className="text-xs text-gray-500">Live Preview</span>
            </div>

            {/* Chat */}
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-700 flex-1 flex flex-col">
              <h3 className="text-sm font-bold text-gray-300 mb-2">CHAT ROOM</h3>
              <div className="flex-1 flex items-center justify-center text-gray-500 text-xs">
                Chat component loading...
              </div>
            </div>

            {/* Audio Meters */}
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
              <h3 className="text-sm font-bold text-gray-300 mb-2">AUDIO METERS</h3>
              <div className="space-y-2">
                <div className="h-6 bg-gray-800 rounded overflow-hidden">
                  <div className="h-full w-1/2 bg-gradient-to-r from-green-500 to-yellow-500" />
                </div>
                <div className="h-6 bg-gray-800 rounded overflow-hidden">
                  <div className="h-full w-2/3 bg-gradient-to-r from-green-500 to-yellow-500" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
