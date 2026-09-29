using System;
using System.Collections.Generic;

namespace Wise2.XR
{
    /// <summary>
    /// Demo SoundLabs state provider for offline / fallback mode.
    /// Simulates a live multi-track recording session with realistic audio levels.
    /// </summary>
    public sealed class OfflineSoundLabsDemo : ISoundLabsDataService
    {
        private SoundLabsSnapshot snapshot;
        private Random rand = new Random();

        public SoundLabsSnapshot Latest => GetSnapshot();

        private SoundLabsSnapshot GetSnapshot()
        {
            if (snapshot == null)
            {
                snapshot = new SoundLabsSnapshot
                {
                    connectionState = "OFFLINE_DEMO",
                    capturedAt = DateTime.UtcNow.ToString("O"),
                    ageSeconds = 0,
                    reason = "Offline demo mode",
                    session = new RecordingSession
                    {
                        projectName = "Live Podcast Recording",
                        isRecording = true,
                        isPlaying = false,
                        currentTimeSeconds = 1247.5f,
                        totalDurationSeconds = 3600f,
                        trackCount = 8,
                        status = "RECORDING"
                    },
                    master = new MasterChannel
                    {
                        level = 0.85f,
                        peakLevel = 0.92f,
                        clipping = false,
                        compressorGain = -3.2f,
                        recordingBitDepth = 24,
                        recordingSampleRate = 48000
                    }
                };

                // Initialize 8 demo tracks
                snapshot.tracks = new List<AudioTrack>
                {
                    new AudioTrack { trackId = 1, name = "Vocal", level = 0.78f, pan = 0f, muted = false, solo = false, peakLevel = 0.85f, clipping = false },
                    new AudioTrack { trackId = 2, name = "Bass", level = 0.68f, pan = -0.15f, muted = false, solo = false, peakLevel = 0.72f, clipping = false },
                    new AudioTrack { trackId = 3, name = "Drums", level = 0.82f, pan = 0.1f, muted = false, solo = false, peakLevel = 0.88f, clipping = false },
                    new AudioTrack { trackId = 4, name = "Synth", level = 0.45f, pan = 0.3f, muted = false, solo = false, peakLevel = 0.52f, clipping = false },
                    new AudioTrack { trackId = 5, name = "Guitar", level = 0.55f, pan = -0.25f, muted = false, solo = false, peakLevel = 0.62f, clipping = false },
                    new AudioTrack { trackId = 6, name = "Keys", level = 0.38f, pan = 0f, muted = false, solo = false, peakLevel = 0.48f, clipping = false },
                    new AudioTrack { trackId = 7, name = "Strings", level = 0.32f, pan = -0.4f, muted = false, solo = false, peakLevel = 0.42f, clipping = false },
                    new AudioTrack { trackId = 8, name = "Ambient", level = 0.28f, pan = 0.4f, muted = false, solo = false, peakLevel = 0.35f, clipping = false }
                };

                // Add frequency spectrum (20 bands from 20Hz to 20kHz logarithmic)
                snapshot.spectrum = new List<FrequencyBand>();
                var freqs = new[] { 20f, 40f, 63f, 100f, 158f, 250f, 400f, 630f, 1000f, 1587f, 2500f, 4000f, 6300f, 10000f, 15875f, 20000f };
                foreach (var freq in freqs)
                {
                    snapshot.spectrum.Add(new FrequencyBand
                    {
                        frequency = freq,
                        magnitude = (float)rand.NextDouble() * 0.8f + 0.2f  // 0.2 - 1.0 range
                    });
                }
            }

            // Simulate real-time level changes
            if (snapshot.session.isRecording)
            {
                snapshot.session.currentTimeSeconds += 0.016f;  // ~60fps update
                snapshot.capturedAt = DateTime.UtcNow.ToString("O");

                // Simulate level variations
                snapshot.master.level = 0.85f + (float)(rand.NextDouble() - 0.5f) * 0.1f;
                snapshot.master.peakLevel = System.Math.Min(1f, snapshot.master.level + 0.1f);

                // Update all track levels with slight variations
                for (int i = 0; i < snapshot.tracks.Count; i++)
                {
                    var track = snapshot.tracks[i];
                    var variation = (float)(rand.NextDouble() - 0.5f) * 0.15f;
                    track.level = System.Math.Max(0f, System.Math.Min(1f, track.level + variation));
                    track.peakLevel = System.Math.Min(1f, track.level + 0.1f);
                }

                // Update spectrum
                for (int i = 0; i < snapshot.spectrum.Count; i++)
                {
                    var band = snapshot.spectrum[i];
                    var variation = (float)(rand.NextDouble() - 0.5f) * 0.2f;
                    band.magnitude = System.Math.Max(0.1f, System.Math.Min(1f, band.magnitude + variation));
                }
            }

            return snapshot;
        }
    }
}
