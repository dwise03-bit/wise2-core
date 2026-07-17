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
  const studioSections = [
    ['STUDIO', 'Command Center'],
    ['BRAND DNA', 'Identity Engine'],
    ['ANTHEM CREATOR', 'Song & Lyrics Studio'],
    ['RECORDING ROOM', 'Sessions & Vocals'],
    ['MIXING CONSOLE', 'Mix & Produce'],
    ['MASTERING', 'Polish & Perfect'],
    ['LIVE', 'Watch & Interact'],
    ['COMMUNITY', 'Connect & Collaborate'],
    ['CHALLENGES', 'Compete & Win'],
    ['ACADEMY', 'Learn & Level Up'],
    ['BRAND VAULT', 'Assets & Deliverables'],
    ['ANALYTICS', 'Insights & Reports'],
    ['SETTINGS', 'System & Preferences'],
  ];

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
    <div className="min-h-screen overflow-hidden bg-[#03060d] text-white">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(20,120,255,0.22),transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(140,40,255,0.18),transparent_24%),linear-gradient(180deg,#03060d_0%,#050b17_45%,#02050a_100%)]" />
        <div className="absolute inset-0 opacity-20 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:72px_72px]" />
      </div>

      <div className="relative z-10 flex h-screen flex-col">
        <header className="border-b border-cyan-500/20 bg-black/50 backdrop-blur-xl shadow-[0_0_0_1px_rgba(59,130,246,0.08)]">
          <div className="flex items-center gap-4 px-4 py-3">
            <div className="flex items-center gap-3 w-[280px] shrink-0">
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 leading-none shadow-[0_0_30px_rgba(0,153,255,0.08)]">
                <div className="text-3xl font-black tracking-tight text-white">WISE²</div>
                <div className="text-[11px] tracking-[0.35em] text-cyan-300">SOUND LABS</div>
              </div>
              <div className="hidden xl:block text-[11px] uppercase tracking-[0.35em] text-slate-400">
                Organized chaos command center
              </div>
            </div>

            <div className="flex-1">
              <Input type="search" placeholder="Search projects, artists, files..." />
            </div>

            <div className="hidden 2xl:flex items-center gap-6 px-4 py-2 rounded-2xl border border-white/10 bg-white/5 backdrop-blur">
              <div className="text-center">
                <div className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Live viewers</div>
                <div className="text-lg font-bold text-white">{viewerCount}</div>
              </div>
              <div className="text-center">
                <div className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Projects live</div>
                <div className="text-lg font-bold text-white">{getTotalTracks() > 0 ? 4 : 0}</div>
              </div>
              <div className="text-center">
                <div className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Community online</div>
                <div className="text-lg font-bold text-white">1,247</div>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-3 py-2 backdrop-blur">
                <div className="h-10 w-10 rounded-full bg-[radial-gradient(circle_at_30%_30%,#7dd3fc,#1d4ed8_45%,#020617_100%)] ring-1 ring-cyan-400/50" />
                <div className="hidden md:block">
                  <div className="text-sm font-semibold">D.WISE</div>
                  <div className="text-xs text-slate-400">Administrator</div>
                </div>
              </div>
              <Button variant="secondary" size="md">⚙</Button>
            </div>
          </div>
        </header>

        <div className="flex min-h-0 flex-1 gap-4 p-4">
          <aside className="hidden xl:flex w-[250px] flex-col rounded-[28px] border border-cyan-500/15 bg-black/55 backdrop-blur-2xl shadow-[0_0_50px_rgba(0,153,255,0.08)] overflow-hidden">
            <div className="border-b border-white/10 px-5 py-5">
              <div className="text-sm font-semibold text-cyan-300">WISE² SOUND LABS</div>
              <div className="text-xs uppercase tracking-[0.35em] text-slate-500">Brand operating system</div>
            </div>
            <nav className="flex-1 overflow-y-auto p-3 space-y-1">
              {studioSections.map(([name, desc]) => (
                <button
                  key={name}
                  className={`w-full rounded-2xl border px-4 py-3 text-left transition-all ${
                    name === 'LIVE'
                      ? 'border-cyan-400/40 bg-cyan-500/10 text-cyan-100 shadow-[0_0_24px_rgba(0,153,255,0.12)]'
                      : 'border-transparent bg-transparent text-slate-300 hover:border-white/10 hover:bg-white/5'
                  }`}
                >
                  <div className="text-sm font-semibold">{name}</div>
                  <div className="text-xs text-slate-500">{desc}</div>
                </button>
              ))}
            </nav>
            <div className="border-t border-white/10 p-4">
              <div className="rounded-2xl border border-emerald-400/25 bg-emerald-400/10 px-4 py-3">
                <div className="text-xs uppercase tracking-[0.35em] text-emerald-300">System status</div>
                <div className="mt-1 text-sm font-semibold text-emerald-200">All systems operational</div>
              </div>
            </div>
          </aside>

          <main className="grid min-h-0 flex-1 grid-cols-1 gap-4 2xl:grid-cols-[minmax(0,1.5fr)_420px_360px]">
            <section className="min-h-0 overflow-hidden rounded-[30px] border border-cyan-500/20 bg-white/5 backdrop-blur-2xl shadow-[0_0_70px_rgba(0,153,255,0.08)]">
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold tracking-wide">LIVE STUDIO</h1>
                    <Badge variant="danger" size="sm">LIVE</Badge>
                  </div>
                  <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Real time. No filters. 100% organized chaos.</p>
                </div>
                <div className="hidden md:flex items-center gap-4 text-xs text-slate-400">
                  <span>CPU {cpuUsage}%</span>
                  <span>Storage {storageUsed} TB</span>
                  <span>{bitrate} Mbps</span>
                </div>
              </div>

              <div className="h-full overflow-y-auto p-4">
                <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(0,119,255,0.22),transparent_38%),linear-gradient(180deg,rgba(3,10,22,0.88),rgba(1,4,12,0.96))] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-fuchsia-500" />
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <div className="text-xs uppercase tracking-[0.4em] text-slate-400">Now building</div>
                      <div className="text-2xl font-semibold text-white">Urban Grind Brand Anthem</div>
                    </div>
                    <div className="rounded-full border border-red-400/40 bg-red-500/15 px-3 py-1 text-xs font-semibold text-red-300">
                      ● LIVE
                    </div>
                  </div>

                  <div className="relative overflow-hidden rounded-[26px] border border-white/10 bg-black/50">
                    <div className="aspect-[16/9] bg-[radial-gradient(circle_at_center,_rgba(0,153,255,0.28),transparent_26%),linear-gradient(180deg,#0b1424_0%,#020611_100%)]" />
                    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,transparent_0%,rgba(255,255,255,0.07)_18%,transparent_38%)]" />
                    <div className="absolute right-4 top-4 rounded-full border border-red-400/40 bg-red-500/15 px-3 py-1 text-xs font-semibold text-red-300">
                      LIVE
                    </div>
                    <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                      <div className="max-w-[70%] rounded-2xl border border-white/10 bg-black/55 px-4 py-3 backdrop-blur">
                        <div className="text-[10px] uppercase tracking-[0.4em] text-slate-400">Now building</div>
                        <div className="text-xl font-semibold text-white">Urban Grind Brand Anthem</div>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-black/55 px-4 py-3 text-right backdrop-blur">
                        <div className="text-sm font-bold text-white">00:42:17</div>
                        <div className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Elapsed</div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
                    <Card variant="glass">
                      <CardContent className="p-4">
                        <div className="mb-3 flex items-center justify-between">
                          <div className="text-sm font-semibold text-white">Live Mixer</div>
                          <div className="text-xs text-slate-400">{getTotalTracks()} tracks ready</div>
                        </div>
                        <MasterMixer
                          channels={audioMixerChannels.slice(0, -1)}
                          masterVolume={audioMixerChannels[audioMixerChannels.length - 1]?.volume ?? 0}
                          masterPeakLevel={audioMixerChannels[audioMixerChannels.length - 1]?.peakLevel ?? -Infinity}
                          onChannelVolumeChange={handleChannelVolumeChange}
                          onChannelMuteToggle={(id) => console.log('Mute:', id)}
                          onChannelSoloToggle={(id) => console.log('Solo:', id)}
                          onMasterVolumeChange={(vol) => handleChannelVolumeChange('master', vol)}
                          title="LIVE MIXER"
                          showAllTracksLink={getTotalTracks() > 7}
                        />
                      </CardContent>
                    </Card>

                    <div className="grid gap-4">
                      <Card>
                        <CardHeader>
                          <h3 className="text-sm font-bold">SCENE PIPELINE</h3>
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
                  </div>

                  <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_340px]">
                    <Card>
                      <CardHeader>
                        <h3 className="text-sm font-bold">RECENT RECORDINGS</h3>
                      </CardHeader>
                      <CardContent>
                        <RecordingsList title="" limit={3} showHeader={false} />
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <h3 className="text-sm font-bold">AUDIO LEVELS</h3>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <div className="mb-1 text-xs text-wise-text-muted">Left Channel</div>
                            <div className="h-2 overflow-hidden rounded-full bg-black/50">
                              <div className="h-full w-1/2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500" />
                            </div>
                          </div>
                          <div>
                            <div className="mb-1 text-xs text-wise-text-muted">Right Channel</div>
                            <div className="h-2 overflow-hidden rounded-full bg-black/50">
                              <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-cyan-400 to-fuchsia-500" />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </section>

            <section className="min-h-0 overflow-hidden rounded-[30px] border border-cyan-500/20 bg-white/5 backdrop-blur-2xl shadow-[0_0_70px_rgba(0,153,255,0.08)]">
              <div className="border-b border-white/10 px-5 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-white">Live Chat</div>
                    <div className="text-xs text-slate-400">Top Chat</div>
                  </div>
                  <Badge variant="info" size="sm">{viewerCount}</Badge>
                </div>
              </div>
              <div className="h-[calc(100%-64px)]">
                <ChatRoom title="" isEnabled={true} activeUsers={viewerCount} />
              </div>
            </section>

            <section className="min-h-0 overflow-hidden rounded-[30px] border border-fuchsia-500/20 bg-white/5 backdrop-blur-2xl shadow-[0_0_70px_rgba(163,70,255,0.08)]">
              <div className="flex h-full flex-col gap-4 p-4">
                <Card className="flex-1 overflow-hidden">
                  <CardHeader>
                    <h3 className="text-sm font-bold">JOIN THE COMMUNITY ON DISCORD</h3>
                  </CardHeader>
                  <CardContent className="flex h-full flex-col items-center justify-center gap-4 text-center">
                    <div className="rounded-full border border-cyan-400/20 bg-cyan-400/10 p-6 text-6xl shadow-[0_0_50px_rgba(0,153,255,0.15)]">👾</div>
                    <p className="max-w-xs text-sm text-slate-300">
                      The official hub for creators, builders, entrepreneurs and dreamers.
                    </p>
                    <ul className="space-y-2 text-left text-sm text-slate-400">
                      <li>• Connect</li>
                      <li>• Collaborate</li>
                      <li>• Get feedback</li>
                      <li>• Win prizes</li>
                      <li>• Be part of the movement</li>
                    </ul>
                    <Button variant="primary" size="md" fullWidth>
                      JOIN DISCORD
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <h3 className="text-sm font-bold">COMMUNITY LEADERBOARD</h3>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm">
                      {[
                        ['SoundWave', '12,450 XP'],
                        ['BeatMaster88', '9,870 XP'],
                        ['CreativeKye', '8,230 XP'],
                      ].map(([name, score], index) => (
                        <div key={name} className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/25 px-3 py-2">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-white/10" />
                            <div>
                              <div className="font-semibold text-white">{index + 1}. {name}</div>
                              <div className="text-xs text-slate-500">Top this month</div>
                            </div>
                          </div>
                          <div className="text-slate-300">{score}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>
          </main>
        </div>

        {showAlert && (
          <div className="border-t border-cyan-500/20 bg-black/55 px-4 py-3 backdrop-blur-xl">
            <Alert variant="info" title="Tip" closable onClose={() => setShowAlert(false)}>
              Use keyboard shortcuts: R (record), Space (play), T (add track), Cmd+S (save)
            </Alert>
          </div>
        )}
      </div>
    </div>
  );
}
