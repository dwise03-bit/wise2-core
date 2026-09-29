'use client';

import { useState } from 'react';
import { useSoundLabsProduction } from '@/lib/hooks/useSoundLabsProduction';

interface StreamingPanelProps {
  client: { name: string };
}

export function StreamingPanel({ client }: StreamingPanelProps) {
  const { startStream, stopStream, isLoading } = useSoundLabsProduction();
  const [activeStream, setActiveStream] = useState<string | null>(null);
  const [streamTitle, setStreamTitle] = useState(`${client.name} Live Session`);
  const [selectedPlatform, setSelectedPlatform] = useState<'discord' | 'youtube' | 'twitch' | 'custom_rtmp'>(
    'discord'
  );

  const handleStartStream = async () => {
    const streamId = await startStream(selectedPlatform, streamTitle);
    if (streamId) {
      setActiveStream(streamId);
    }
  };

  const handleStopStream = async () => {
    if (activeStream) {
      const success = await stopStream(activeStream);
      if (success) {
        setActiveStream(null);
      }
    }
  };

  const platforms = [
    { id: 'discord', label: 'Discord', icon: '💬' },
    { id: 'youtube', label: 'YouTube', icon: '▶️' },
    { id: 'twitch', label: 'Twitch', icon: '🎮' },
    { id: 'custom_rtmp', label: 'Custom RTMP', icon: '🔗' },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Stream Setup */}
      <div className="p-6 rounded-xl bg-gradient-to-br from-[#0a0a0c] to-[#0f0f12] border border-[#00D9FF]/10">
        <h3 className="text-lg font-semibold text-white mb-6">Live Streaming Setup</h3>

        {/* Title Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-[#00D9FF] mb-2">Stream Title</label>
          <input
            type="text"
            value={streamTitle}
            onChange={(e) => setStreamTitle(e.target.value)}
            placeholder="Your stream title"
            className="w-full px-4 py-3 rounded-lg bg-[#050607] border border-[#00D9FF]/20 text-white placeholder-[#00D9FF]/40 focus:outline-none focus:border-[#00D9FF] transition-all"
            disabled={isLoading || !!activeStream}
          />
        </div>

        {/* Platform Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-[#00D9FF] mb-3">Platform</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {platforms.map((platform) => (
              <button
                key={platform.id}
                onClick={() => setSelectedPlatform(platform.id)}
                disabled={isLoading || !!activeStream}
                className={`p-4 rounded-lg transition-all ${
                  selectedPlatform === platform.id
                    ? 'bg-[#00D9FF] text-[#050607]'
                    : 'bg-[#050607] border border-[#00D9FF]/20 text-[#00D9FF] hover:border-[#00D9FF]'
                }`}
              >
                <div className="text-2xl mb-2">{platform.icon}</div>
                <p className="text-xs font-semibold">{platform.label}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Stream Control */}
        <div className="flex gap-3">
          <button
            onClick={handleStartStream}
            disabled={isLoading || !!activeStream || !streamTitle.trim()}
            className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-[#00D9FF] to-[#00FF7F] text-[#050607] font-semibold hover:shadow-lg hover:shadow-[#00D9FF]/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            📡 Go Live
          </button>

          {activeStream && (
            <button
              onClick={handleStopStream}
              disabled={isLoading}
              className="flex-1 px-6 py-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-400 font-semibold hover:border-red-500 transition-all"
            >
              ⏹ Stop Stream
            </button>
          )}
        </div>
      </div>

      {/* Stream Status */}
      {activeStream && (
        <div className="p-6 rounded-xl bg-gradient-to-br from-[#1a0000] to-[#0f0505] border border-red-500/30 animate-pulse">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            <h4 className="text-lg font-bold text-red-400">LIVE NOW</h4>
          </div>
          <p className="text-[#00D9FF]/80 text-sm mb-3">{streamTitle}</p>
          <p className="text-[#00D9FF]/60 text-xs">Platform: {selectedPlatform}</p>
        </div>
      )}

      {/* Stream Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Bitrate', value: '6 Mbps' },
          { label: 'Resolution', value: '1920x1080' },
          { label: 'Framerate', value: '60 FPS' },
        ].map((info) => (
          <div key={info.label} className="p-4 rounded-lg bg-[#050607] border border-[#00D9FF]/10">
            <p className="text-[#00D9FF]/60 text-xs mb-2">{info.label}</p>
            <p className="font-semibold text-white">{info.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
