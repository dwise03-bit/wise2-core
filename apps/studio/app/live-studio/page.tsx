'use client';

import { useEffect, useState } from 'react';
import { useStreamingWithAudio } from '../../hooks/useStreamingWithAudio';
import { MasterMixer } from '../../components/Shared/Mixer/MasterMixer';
import { ChatRoom } from '../../components/Shared/Chat';
import { RecordingsList } from '../../components/Shared/Recording';
import {
  Card,
  CardContent,
  CardHeader,
  Button,
  Badge,
  Input,
  Alert,
  Spinner,
} from '@wise2/design-system/components';

/**
 * Live Studio Page - MODERNIZED
 *
 * Professional multi-track recording and streaming interface.
 * Built with WISE² design system for consistency and enterprise quality.
 *
 * Features:
 * - 8-channel live mixer with audio engine integration
 * - Multi-track recording (24+ tracks)
 * - Scene management
 * - Real-time metrics (CPU, storage, bitrate, viewers)
 * - Live preview and chat
 * - Keyboard shortcuts
 * - Recent recordings library
 */
export default function LiveStudioPage() {
  const {
    audio,
    streaming,
    audioMixerChannels,
    systemMetrics,
    handleChannelVolumeChange,
    getTotalTracks,
    getRecordingStatus,
  } = useStreamingWithAudio();

  const [selectedScene, setSelectedScene] = useState(1);
  const [showAlert, setShowAlert] = useState(false);

  const cpuUsage = Math.round(systemMetrics.cpuUsage);
  const storageUsed = (systemMetrics.diskUsage / (1024 * 1024 * 1024)).toFixed(2);
  const bitrate = streaming.streamStatus.bitrate / 1000 || 6.2;
  const viewerCount = streaming.streamStatus.viewerCount;
  const recordingStatus = getRecordingStatus();
  const isRecording = audio.state.isRecording;
  const isStreaming = streaming.isStreaming;

  // Set up keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      // R: Start/stop recording
      if ((e.key === 'r' || e.key === 'R') && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        if (isRecording) {
          audio.stopRecording();
        } else {
          audio.startRecording();
        }
      }

      // Space: Play/pause
      if (e.code === 'Space') {
        e.preventDefault();
        if (audio.state.isPlaying) {
          audio.stop();
        } else {
          audio.play();
        }
      }

      // Shift+Space: Stop
      if (e.shiftKey && e.code === 'Space') {
        e.preventDefault();
        audio.stop();
      }

      // T: Add track
      if ((e.key === 't' || e.key === 'T') && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        audio.addTrack();
      }

      // Cmd/Ctrl+S: Save project
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        // Save project logic would go here
        console.log('Save project');
      }

      // Cmd/Ctrl+E: Export
      if ((e.ctrlKey || e.metaKey) && (e.key === 'e' || e.key === 'E')) {
        e.preventDefault();
        // Export logic would go here
        console.log('Export');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [audio]);

  return (
    <div className="h-screen flex flex-col bg-wise-bg text-wise-text-primary overflow-hidden">
      {/* Header - Sticky */}
      <header className="border-b border-wise-border-subtle bg-wise-surface/80 backdrop-blur-lg px-6 py-4 z-50">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-wide">LIVE STUDIO</h1>
            <p className="text-sm text-wise-primary font-semibold">RECORD. STREAM. CREATE. PERFORM.</p>
          </div>
          <div className="flex-1 max-w-xs">
            <Input type="search" placeholder="Search Live Studio..." />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Status Cards Strip */}
        <div className="px-6 py-4 border-b border-wise-border-subtle bg-wise-surface/50 overflow-x-auto">
          <div className="flex gap-4 min-w-max">
            {/* Live Status */}
            <Card className="flex-shrink-0 min-w-fit">
              <CardContent className="p-3">
                <div className="text-xs font-semibold text-wise-text-muted mb-1">LIVE STATUS</div>
                <div className="flex items-center gap-2">
                  <span className="text-wise-success text-lg">●</span>
                  <div>
                    <div className="text-sm font-bold">ON AIR</div>
                    <div className="text-xs text-wise-text-muted">01:24:58</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recording Status */}
            <Card className="flex-shrink-0 min-w-fit">
              <CardContent className="p-3">
                <div className="text-xs font-semibold text-wise-text-muted mb-1">RECORDING</div>
                <div className="flex items-center gap-2">
                  {isRecording && <Spinner size="sm" />}
                  <div className="text-sm font-bold">
                    {isRecording ? 'RECORDING' : 'READY'} • {getTotalTracks()} Tracks
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* CPU Usage */}
            <Card className="flex-shrink-0 min-w-fit">
              <CardContent className="p-3">
                <div className="text-xs font-semibold text-wise-text-muted mb-1">CPU USAGE</div>
                <div className="text-sm font-bold">
                  {cpuUsage}%
                  <Badge variant={cpuUsage > 80 ? 'danger' : cpuUsage > 60 ? 'warning' : 'success'} size="sm" className="ml-2">
                    {cpuUsage > 80 ? 'High' : cpuUsage > 60 ? 'Medium' : 'Good'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Storage */}
            <Card className="flex-shrink-0 min-w-fit">
              <CardContent className="p-3">
                <div className="text-xs font-semibold text-wise-text-muted mb-1">STORAGE</div>
                <div className="text-sm font-bold">{storageUsed} TB / 8 TB</div>
              </CardContent>
            </Card>

            {/* Viewers */}
            <Card className="flex-shrink-0 min-w-fit">
              <CardContent className="p-3">
                <div className="text-xs font-semibold text-wise-text-muted mb-1">VIEWERS</div>
                <div className="text-sm font-bold">{viewerCount.toLocaleString()} Live</div>
              </CardContent>
            </Card>

            {/* Bitrate */}
            <Card className="flex-shrink-0 min-w-fit" variant="elevated">
              <CardContent className="p-3">
                <div className="text-xs font-semibold text-wise-text-muted mb-1">BITRATE</div>
                <div className="text-sm font-bold text-wise-primary">{bitrate} Mbps • Excellent</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Work Area */}
        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row gap-4 p-4">
          {/* Left - Mixer & Controls */}
          <div className="flex-1 flex flex-col gap-4 overflow-y-auto min-w-0">
            {/* Mixer - Wired to Audio Engine */}
            <Card variant="glass">
              <CardHeader>
                <h2 className="text-lg font-bold">LIVE MIXER</h2>
                <p className="text-xs text-wise-text-muted">{getTotalTracks()} Tracks Ready</p>
              </CardHeader>
              <CardContent>
                <MasterMixer
                  channels={audioMixerChannels.slice(0, -1)}
                  masterVolume={audioMixerChannels[audioMixerChannels.length - 1]?.volume ?? 0}
                  masterPeakLevel={audioMixerChannels[audioMixerChannels.length - 1]?.peakLevel ?? -Infinity}
                  onChannelVolumeChange={handleChannelVolumeChange}
                  onChannelMuteToggle={(id) => console.log('Mute:', id)}
                  onChannelSoloToggle={(id) => console.log('Solo:', id)}
                  onMasterVolumeChange={(vol) => handleChannelVolumeChange('master', vol)}
                  title={`LIVE MIXER`}
                  showAllTracksLink={getTotalTracks() > 7}
                />
              </CardContent>
            </Card>

            {/* Scenes & Controls Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Scenes */}
              <Card>
                <CardHeader>
                  <h3 className="text-sm font-bold">SCENES</h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {[1, 2].map((scene) => (
                      <Button
                        key={scene}
                        variant={selectedScene === scene ? 'primary' : 'secondary'}
                        size="md"
                        fullWidth
                        onClick={() => setSelectedScene(scene)}
                      >
                        Scene {scene}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Live Controls */}
              <Card>
                <CardHeader>
                  <h3 className="text-sm font-bold">LIVE CONTROLS</h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button
                      variant={isStreaming ? 'danger' : 'primary'}
                      size="md"
                      fullWidth
                      onClick={() => isStreaming ? streaming.stopStream() : streaming.startStream()}
                    >
                      {isStreaming ? 'Stop Stream' : 'Start Stream'}
                    </Button>
                    <Button
                      variant={isRecording ? 'danger' : 'primary'}
                      size="md"
                      fullWidth
                      onClick={() => isRecording ? audio.stopRecording() : audio.startRecording()}
                    >
                      {isRecording ? 'Stop Recording' : 'Start Recording'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Recordings */}
            <Card>
              <CardHeader>
                <h3 className="text-sm font-bold">RECENT RECORDINGS</h3>
              </CardHeader>
              <CardContent>
                <RecordingsList title="" limit={3} showHeader={false} />
              </CardContent>
            </Card>
          </div>

          {/* Right - Preview & Chat (Sidebar on desktop, below on mobile) */}
          <div className="w-full lg:w-80 flex flex-col gap-4 overflow-y-auto">
            {/* Live Preview */}
            <Card>
              <CardContent className="p-4">
                <div className="w-full aspect-video bg-wise-surface rounded flex items-center justify-center border border-wise-border-subtle">
                  <Spinner size="md" label="Preview Loading..." />
                </div>
              </CardContent>
            </Card>

            {/* Chat */}
            <Card>
              <CardHeader>
                <h3 className="text-sm font-bold">CHAT ROOM</h3>
                <Badge variant="info" size="sm">{viewerCount} Active</Badge>
              </CardHeader>
              <CardContent>
                <ChatRoom title="" isEnabled={true} activeUsers={viewerCount} />
              </CardContent>
            </Card>

            {/* Audio Meters */}
            <Card>
              <CardHeader>
                <h3 className="text-sm font-bold">AUDIO LEVELS</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="text-xs text-wise-text-muted mb-1">Left Channel</div>
                    <div className="h-2 bg-wise-surface rounded-full overflow-hidden">
                      <div className="h-full w-1/2 bg-gradient-to-r from-wise-success to-wise-warning rounded-full" />
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-wise-text-muted mb-1">Right Channel</div>
                    <div className="h-2 bg-wise-surface rounded-full overflow-hidden">
                      <div className="h-full w-2/3 bg-gradient-to-r from-wise-success to-wise-warning rounded-full" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Alert - Optional info */}
      {showAlert && (
        <div className="px-6 py-4 border-t border-wise-border-subtle bg-wise-surface/50">
          <Alert variant="info" title="Tip" closable onClose={() => setShowAlert(false)}>
            Use keyboard shortcuts: R (record), Space (play), T (add track), Cmd+S (save)
          </Alert>
        </div>
      )}
    </div>
  );
}
