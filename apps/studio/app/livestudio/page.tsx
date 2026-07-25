'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useCreativeStudioStore } from '@/lib/creativeStudioStore';
import { SceneManager, PreviewCanvas, StreamControl, SourceManager, OBSChatOverlay } from '@/components/LiveStudio';
import RecordingControl from '@/components/LiveStudio/RecordingControl';
import RecordingsList from '@/components/LiveStudio/RecordingsList';
import MultistreamConfig from '@/components/LiveStudio/MultistreamConfig';
import ReplayBuffer from '@/components/LiveStudio/ReplayBuffer';
import VODUpload from '@/components/LiveStudio/VODUpload';
import { SpectrumBars } from '@/components/CanvasPrimitives';
import type { Source } from '@/components/LiveStudio';
import type { Scene, SceneSource, TransitionType } from '@/components/LiveStudio';

interface StreamStats {
  bitrate: number;
  fps: number;
  droppedFrames: number;
  cpuUsage: number;
  memoryUsage: number;
  bandwidthUsage: number;
}

interface StreamDestination {
  id: string;
  type: 'youtube' | 'twitch' | 'facebook' | 'linkedin' | 'rtmp' | 'custom';
  name: string;
  isConnected: boolean;
  isActive: boolean;
}

export default function LiveStudioPage() {
  const {
    isLive,
    viewers,
    chat,
    chatDraft,
    setChatDraft,
    sendChat,
  } = useCreativeStudioStore();

  // Stream state
  const [streamStatus, setStreamStatus] = useState<'idle' | 'starting' | 'streaming' | 'stopping' | 'error'>('idle');
  const [recordingStatus, setRecordingStatus] = useState<'idle' | 'recording' | 'paused' | 'stopping'>('idle');
  const [activeTab, setActiveTab] = useState<'streaming' | 'recording' | 'advanced'>('streaming');

  // Scene management
  const [scenes, setScenes] = useState<Scene[]>([
    {
      id: '1',
      name: 'Main Camera',
      active: true,
      visible: true,
      transitionType: 'cut',
      transitionDuration: 300,
      sources: [],
      createdAt: new Date(),
      modifiedAt: new Date(),
    },
    {
      id: '2',
      name: 'Full Screen',
      active: false,
      visible: true,
      transitionType: 'fade',
      transitionDuration: 500,
      sources: [],
      createdAt: new Date(),
      modifiedAt: new Date(),
    },
  ]);
  const [activeSceneId, setActiveSceneId] = useState('1');

  // Source management
  const [sources, setSources] = useState<Source[]>([]);

  // Stream destinations
  const [destinations, setDestinations] = useState<StreamDestination[]>([
    { id: '1', type: 'youtube', name: 'YouTube', isConnected: true, isActive: true },
    { id: '2', type: 'twitch', name: 'Twitch', isConnected: true, isActive: true },
    { id: '3', type: 'facebook', name: 'Facebook', isConnected: false, isActive: false },
  ]);

  // Stream stats
  const [stats, setStats] = useState<StreamStats>({
    bitrate: 6000,
    fps: 60,
    droppedFrames: 0,
    cpuUsage: 45,
    memoryUsage: 62,
    bandwidthUsage: 7.5,
  });

  // Compute stream health metrics
  const streamHealth = {
    latency: Math.random() * 100, // Simulated latency in ms
    bufferHealth: Math.max(0, Math.min(100, 100 - (stats.droppedFrames * 5))), // Buffer health percentage
  };

  // Recording data
  const [recordings, setRecordings] = useState<Array<{ id: string; title: string; duration: number; size: string; timestamp: string }>>([]);

  // Replay buffer
  const [replayBufferActive, setReplayBufferActive] = useState(false);
  const [replayDuration, setReplayDuration] = useState(30);

  // Auto-save scene configuration
  useEffect(() => {
    const saveTimer = setTimeout(() => {
      localStorage.setItem('livestudio-scenes', JSON.stringify(scenes));
    }, 1000);
    return () => clearTimeout(saveTimer);
  }, [scenes]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+1-9: Switch scene
      if ((e.ctrlKey || e.metaKey) && /^[1-9]$/.test(e.key)) {
        const sceneIndex = parseInt(e.key) - 1;
        if (sceneIndex < scenes.length) {
          setActiveSceneId(scenes[sceneIndex].id);
        }
      }

      // Space: Play/pause
      if (e.code === 'Space') {
        e.preventDefault();
        // Toggle streaming
        setStreamStatus(streamStatus === 'streaming' ? 'idle' : 'streaming');
      }

      // R: Toggle record
      if (e.key.toLowerCase() === 'r') {
        e.preventDefault();
        setRecordingStatus(recordingStatus === 'recording' ? 'idle' : 'recording');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [scenes, streamStatus, recordingStatus]);

  // WebSocket connection for real-time stats updates
  useEffect(() => {
    // Simulate real-time stats updates
    const statsInterval = setInterval(() => {
      if (isLive) {
        setStats(prev => ({
          ...prev,
          bitrate: Math.max(4500, Math.min(8000, prev.bitrate + (Math.random() - 0.5) * 200)),
          fps: 60,
          droppedFrames: Math.random() > 0.99 ? prev.droppedFrames + 1 : prev.droppedFrames,
          cpuUsage: Math.max(20, Math.min(90, prev.cpuUsage + (Math.random() - 0.5) * 5)),
          memoryUsage: Math.max(40, Math.min(85, prev.memoryUsage + (Math.random() - 0.5) * 3)),
          bandwidthUsage: Math.max(5, Math.min(10, prev.bandwidthUsage + (Math.random() - 0.5) * 0.5)),
        }));
      }
    }, 1000);

    return () => clearInterval(statsInterval);
  }, [isLive]);

  const handleStartStream = useCallback(() => {
    setStreamStatus('starting');
    setTimeout(() => setStreamStatus('streaming'), 500);
  }, []);

  const handleStopStream = useCallback(() => {
    setStreamStatus('stopping');
    setTimeout(() => setStreamStatus('idle'), 500);
  }, []);

  const handleStartRecording = useCallback(() => {
    setRecordingStatus('recording');
  }, []);

  const handleStopRecording = useCallback(() => {
    setRecordingStatus('stopping');
    setTimeout(() => {
      setRecordingStatus('idle');
      const now = new Date();
      setRecordings(prev => [...prev, {
        id: `rec-${Date.now()}`,
        title: `Recording ${now.toLocaleTimeString()}`,
        duration: 3600,
        size: '2.4 GB',
        timestamp: now.toISOString(),
      }]);
    }, 500);
  }, []);

  const handleSceneSwitch = useCallback((sceneId: string) => {
    setScenes(prev => prev.map(s => ({ ...s, active: s.id === sceneId })));
    setActiveSceneId(sceneId);
  }, []);

  const handleSaveReplay = useCallback(() => {
    const now = new Date();
    setRecordings(prev => [...prev, {
      id: `replay-${Date.now()}`,
      title: `Replay Clip ${now.toLocaleTimeString()}`,
      duration: replayDuration,
      size: '850 MB',
      timestamp: now.toISOString(),
    }]);
  }, [replayDuration]);

  const isResponsive = typeof window !== 'undefined' && window.innerWidth < 1200;

  // Mobile stack layout
  if (isResponsive) {
    return (
      <div className="w-full h-screen flex flex-col bg-studio-bg text-white font-studio overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-studio-raised border-b border-studio-line">
          <h1 className="text-xl font-display font-black">Live Studio</h1>
          <div className={`px-3 py-1 rounded text-sm font-semibold ${streamStatus === 'streaming' ? 'bg-red-500/30 text-red-400' : 'bg-green-500/30 text-green-400'}`}>
            {streamStatus === 'streaming' ? '🔴 LIVE' : 'OFFLINE'}
          </div>
        </div>

        {/* Mobile stack */}
        <div className="flex-1 overflow-y-auto flex flex-col gap-4 p-4">
          {/* Preview Canvas */}
          <div className="w-full aspect-video bg-studio-input border border-studio-line rounded overflow-hidden">
            <div className="w-full h-full bg-gradient-to-br from-studio-raised to-studio-bg flex items-center justify-center text-gray-600">
              <div className="text-center">
                <div className="text-4xl mb-2">📹</div>
                <div className="text-sm">Preview Canvas</div>
                <div className="text-xs text-gray-700 mt-1">Scene: {scenes.find(s => s.id === activeSceneId)?.name}</div>
              </div>
            </div>
          </div>

          {/* Stream Control - simplified for mobile */}
          <div className="w-full space-y-2">
            <div className="flex gap-2">
              <button
                onClick={handleStartStream}
                disabled={streamStatus === 'streaming'}
                className={`flex-1 px-4 py-2 rounded font-semibold text-sm transition-all ${
                  streamStatus === 'streaming'
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-green-500/20 border border-green-500/50 text-green-400 hover:bg-green-500/30'
                }`}
              >
                Start Stream
              </button>
              <button
                onClick={handleStopStream}
                disabled={streamStatus !== 'streaming'}
                className={`flex-1 px-4 py-2 rounded font-semibold text-sm transition-all ${
                  streamStatus !== 'streaming'
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-red-500/20 border border-red-500/50 text-red-400 hover:bg-red-500/30'
                }`}
              >
                Stop Stream
              </button>
            </div>
            <div className="text-xs text-gray-500 space-y-1 p-2 bg-studio-input rounded border border-studio-line">
              <div>Bitrate: {Math.round(stats.bitrate / 1000)}Mbps</div>
              <div>CPU: {Math.round(stats.cpuUsage)}%</div>
              <div>Viewers: {viewers?.toLocaleString?.() || '0'}</div>
            </div>
          </div>

          {/* Chat Overlay - simplified */}
          <div className="w-full max-h-48 bg-studio-input border border-studio-line rounded p-3 space-y-2">
            <h3 className="text-xs font-semibold uppercase text-gray-400">Chat</h3>
            <div className="space-y-1 max-h-24 overflow-y-auto text-xs">
              {chat.slice(-3).map((msg, i) => (
                <div key={i} style={{ color: msg.color }}>
                  <span className="font-semibold">{msg.user}:</span> {msg.text}
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Chat message..."
                value={chatDraft}
                onChange={(e) => setChatDraft(e.target.value)}
                className="flex-1 bg-studio-raised border border-studio-line rounded px-2 py-1 text-xs text-white placeholder-gray-600"
                onKeyDown={(e) => e.key === 'Enter' && sendChat()}
              />
              <button onClick={sendChat} className="px-3 py-1 bg-wise-accent text-black text-xs font-semibold rounded hover:bg-wise-accent-bright">
                Send
              </button>
            </div>
          </div>

          {/* Scene Manager - simplified */}
          <div className="w-full bg-studio-input border border-studio-line rounded p-3 space-y-2">
            <h3 className="text-xs font-semibold uppercase text-gray-400">Scenes</h3>
            <div className="space-y-1">
              {scenes.map((scene) => (
                <button
                  key={scene.id}
                  onClick={() => handleSceneSwitch(scene.id)}
                  className={`w-full p-2 rounded text-xs text-left transition-all ${
                    activeSceneId === scene.id
                      ? 'bg-wise-accent/10 border border-wise-accent/50 text-white'
                      : 'bg-studio-raised border border-studio-line text-gray-400 hover:border-wise-accent/30'
                  }`}
                >
                  {scene.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Desktop layout
  return (
    <div className="w-full h-screen flex flex-col bg-studio-bg text-white font-studio overflow-hidden">
      {/* HEADER */}
      <div className="flex items-center justify-between px-6 py-4 bg-studio-raised border-b border-studio-line flex-none">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-display font-black">Live Studio</h1>
          <div className={`px-3 py-1 rounded text-sm font-semibold ${streamStatus === 'streaming' ? 'bg-red-500/30 text-red-400' : 'bg-green-500/30 text-green-400'}`}>
            {streamStatus === 'streaming' ? '🔴 LIVE' : 'OFFLINE'}
          </div>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center gap-6 text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Viewers:</span>
            <span className="text-white font-semibold">{viewers?.toLocaleString?.() || '0'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Bitrate:</span>
            <span className="text-white font-semibold">{Math.round(stats.bitrate / 1000)}Mbps</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-600">CPU:</span>
            <span className={`font-semibold ${stats.cpuUsage > 80 ? 'text-red-400' : stats.cpuUsage > 60 ? 'text-yellow-400' : 'text-green-400'}`}>
              {Math.round(stats.cpuUsage)}%
            </span>
          </div>
        </div>
      </div>

      {/* MAIN FLEX LAYOUT */}
      <div className="flex flex-1 gap-0 overflow-hidden">
        {/* LEFT PANEL (20%) - Scene Manager */}
        <div className="w-1/5 bg-studio-panel border-r border-studio-line flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-3">
            <h3 className="text-xs font-semibold uppercase text-gray-400 mb-3">Scenes</h3>
            <div className="space-y-2">
              {scenes.map((scene, index) => (
                <button
                  key={scene.id}
                  onClick={() => handleSceneSwitch(scene.id)}
                  className={`w-full p-3 rounded border transition-all text-left text-sm ${
                    activeSceneId === scene.id
                      ? 'bg-wise-accent/10 border-wise-accent/50 ring-1 ring-wise-accent/30'
                      : 'bg-studio-input border-studio-line hover:border-wise-accent/30'
                  }`}
                >
                  <div className="font-semibold text-white">{scene.name}</div>
                  <div className="text-xs text-gray-500 mt-1">{scene.sources?.length || 0} sources</div>
                  <div className="text-xs text-gray-600 mt-1">
                    <kbd className="bg-studio-raised px-1.5 py-0.5 rounded">Ctrl+{index + 1}</kbd>
                  </div>
                </button>
              ))}
            </div>
            <button className="w-full mt-3 p-2 rounded border border-dashed border-studio-line hover:border-wise-accent/50 text-xs text-gray-500 hover:text-wise-accent transition-colors">
              + Add Scene
            </button>
          </div>
        </div>

        {/* CENTER PANEL (60%) - Preview + Stream Control */}
        <div className="flex-1 flex flex-col gap-4 overflow-hidden p-4">
          {/* Preview Canvas */}
          <div className="flex-1 bg-studio-input border border-studio-line rounded overflow-hidden">
            <div className="w-full h-full bg-gradient-to-br from-studio-raised to-studio-bg flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">📹</div>
                <div className="text-xl font-semibold text-gray-400 mb-2">Preview Canvas</div>
                <div className="text-sm text-gray-600 mb-4">Scene: {scenes.find(s => s.id === activeSceneId)?.name}</div>
                <div className={`text-xs inline-block px-3 py-1 rounded ${
                  streamStatus === 'streaming'
                    ? 'bg-red-500/20 text-red-400'
                    : 'bg-green-500/20 text-green-400'
                }`}>
                  {streamStatus === 'streaming' ? '🔴 LIVE' : 'OFFLINE'}
                </div>
              </div>
            </div>
          </div>

          {/* Spectrum Visualization */}
          <div className="h-20 bg-studio-input border border-studio-line rounded p-3">
            <div className="text-xs text-gray-500 mb-2">Audio Activity</div>
            <SpectrumBars width={800} height={60} bars={26} className="w-full" />
          </div>

          {/* Stream Control Summary */}
          <div className="bg-studio-input border border-studio-line rounded p-4 space-y-2">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white">Stream Control</h3>
              <span className={`text-xs font-semibold px-2 py-1 rounded ${
                streamStatus === 'streaming'
                  ? 'bg-red-500/20 text-red-400'
                  : 'bg-green-500/20 text-green-400'
              }`}>
                {streamStatus.toUpperCase()}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleStartStream}
                disabled={streamStatus === 'streaming'}
                className={`flex-1 px-4 py-2 rounded font-semibold text-sm transition-all ${
                  streamStatus === 'streaming'
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-green-500/20 border border-green-500/50 text-green-400 hover:bg-green-500/30'
                }`}
              >
                Start
              </button>
              <button
                onClick={handleStopStream}
                disabled={streamStatus !== 'streaming'}
                className={`flex-1 px-4 py-2 rounded font-semibold text-sm transition-all ${
                  streamStatus !== 'streaming'
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-red-500/20 border border-red-500/50 text-red-400 hover:bg-red-500/30'
                }`}
              >
                Stop
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL (20%) - Sources + Chat */}
        <div className="w-1/5 bg-studio-panel border-l border-studio-line flex flex-col overflow-hidden gap-4 p-4">
          {/* Source Manager */}
          <div className="flex-1 overflow-y-auto">
            <h3 className="text-xs font-semibold uppercase text-gray-400 mb-3">Sources</h3>
            <div className="space-y-2 text-xs">
              <div className="p-2 bg-studio-input border border-studio-line rounded">
                <div className="text-white">Camera A</div>
                <div className="text-gray-600 mt-1">FX6 (SDI)</div>
              </div>
              <div className="p-2 bg-studio-input border border-studio-line rounded">
                <div className="text-white">Camera B</div>
                <div className="text-gray-600 mt-1">Wide (SDI)</div>
              </div>
              <div className="p-2 bg-studio-input border border-studio-line rounded">
                <div className="text-white">Screen Share</div>
                <div className="text-gray-600 mt-1">Display 1</div>
              </div>
            </div>
            <button className="w-full mt-3 p-2 rounded border border-dashed border-studio-line hover:border-wise-accent/50 text-xs text-gray-500 hover:text-wise-accent transition-colors">
              + Add Source
            </button>
          </div>

          {/* Chat Overlay */}
          <div className="flex-1 overflow-y-auto border-t border-studio-line pt-4">
            <h3 className="text-xs font-semibold uppercase text-gray-400 mb-2">Chat</h3>
            <div className="space-y-1 max-h-32 overflow-y-auto mb-2">
              {chat.slice(-4).map((msg, i) => (
                <div key={i} className="text-xs" style={{ color: msg.color }}>
                  <span className="font-semibold">{msg.user}:</span> {msg.text}
                </div>
              ))}
            </div>
            <div className="flex gap-1">
              <input
                type="text"
                placeholder="Message..."
                value={chatDraft}
                onChange={(e) => setChatDraft(e.target.value)}
                className="flex-1 bg-studio-raised border border-studio-line rounded px-2 py-1 text-xs text-white placeholder-gray-600 focus:outline-none"
                onKeyDown={(e) => e.key === 'Enter' && sendChat()}
              />
              <button onClick={sendChat} className="px-2 py-1 bg-wise-accent text-black text-xs font-semibold rounded hover:bg-wise-accent-bright transition">
                Send
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM TAB SECTION */}
      <div className="h-48 bg-studio-panel border-t border-studio-line flex flex-col overflow-hidden flex-none">
        {/* Tab Headers */}
        <div className="flex gap-0 border-b border-studio-line px-4 flex-none">
          {['streaming', 'recording', 'advanced'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-3 text-sm font-semibold uppercase transition-colors border-b-2 ${
                activeTab === tab
                  ? 'text-white border-wise-accent'
                  : 'text-gray-500 border-transparent hover:text-gray-400'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'streaming' && (
            <div className="grid grid-cols-2 gap-4 h-full">
              {/* Stream Status & Metrics */}
              <div className="space-y-2">
                <h3 className="text-xs font-semibold uppercase text-gray-400 mb-3">Stream Status</h3>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Bitrate:</span>
                    <span className="text-white">{Math.round(stats.bitrate / 1000)}Mbps</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">FPS:</span>
                    <span className="text-white">{stats.fps}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Dropped Frames:</span>
                    <span className={stats.droppedFrames > 10 ? 'text-red-400' : 'text-white'}>{stats.droppedFrames}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Latency:</span>
                    <span className="text-white">{streamHealth.latency.toFixed(1)}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Buffer Health:</span>
                    <span className="text-white">{streamHealth.bufferHealth}%</span>
                  </div>
                </div>
              </div>

              {/* Destinations */}
              <div className="space-y-2">
                <h3 className="text-xs font-semibold uppercase text-gray-400 mb-3">Multistream Destinations</h3>
                <div className="space-y-2">
                  {destinations.map(dest => (
                    <div key={dest.id} className="flex items-center justify-between p-2 bg-studio-input border border-studio-line rounded text-xs">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${dest.isActive && dest.isConnected ? 'bg-green-400' : 'bg-gray-600'}`}></div>
                        <span className="text-gray-300">{dest.name}</span>
                      </div>
                      <span className="text-gray-500">{dest.isConnected ? 'Connected' : 'Offline'}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'recording' && (
            <div className="grid grid-cols-2 gap-4">
              {/* Recording Control */}
              <div>
                <RecordingControl
                  status={recordingStatus}
                  onStart={handleStartRecording}
                  onStop={handleStopRecording}
                />
              </div>

              {/* Recordings List */}
              <div>
                <RecordingsList recordings={recordings} />
              </div>
            </div>
          )}

          {activeTab === 'advanced' && (
            <div className="grid grid-cols-3 gap-4">
              {/* Multistreaming */}
              <div>
                <MultistreamConfig destinations={destinations} />
              </div>

              {/* Replay Buffer */}
              <div>
                <ReplayBuffer
                  active={replayBufferActive}
                  duration={replayDuration}
                  onToggle={() => setReplayBufferActive(!replayBufferActive)}
                  onSaveClip={handleSaveReplay}
                  onDurationChange={setReplayDuration}
                />
              </div>

              {/* VOD Upload */}
              <div>
                <VODUpload recordings={recordings} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Keyboard Shortcuts Help */}
      <div className="fixed bottom-4 right-4 p-3 bg-studio-raised border border-studio-line rounded text-xs text-gray-400 pointer-events-none">
        <div className="font-semibold text-gray-300 mb-2">Shortcuts</div>
        <div className="space-y-1">
          <div><kbd className="bg-studio-input px-1 py-0.5 rounded mr-2">Ctrl+1-9</kbd>Switch scene</div>
          <div><kbd className="bg-studio-input px-1 py-0.5 rounded mr-2">Space</kbd>Stream toggle</div>
          <div><kbd className="bg-studio-input px-1 py-0.5 rounded mr-2">R</kbd>Toggle record</div>
        </div>
      </div>
    </div>
  );
}
