using System;
using System.Collections.Generic;

namespace Wise2.XR
{
    /// <summary>
    /// Unity-side mirror of the SoundLabs audio production data model.
    /// Matches the web-based SoundLabs interface: multi-track mixer, levels, effects.
    /// </summary>

    public enum AudioConnectionState { Connected, Demo, OfflineDemo, Degraded }

    /// <summary>Track-level audio metadata with level metering.</summary>
    [Serializable]
    public sealed class AudioTrack
    {
        public int trackId;
        public string name;
        public float level;           // 0.0 - 1.0
        public float pan;             // -1.0 (left) to 1.0 (right)
        public bool muted;
        public bool solo;
        public float peakLevel;       // Peak meter reading
        public bool clipping;         // True if signal is clipping

        public override string ToString() => $"{name}: {level * 100:0}dB";
    }

    /// <summary>Real-time frequency spectrum data for visualization.</summary>
    [Serializable]
    public sealed class FrequencyBand
    {
        public float frequency;
        public float magnitude;       // Linear magnitude (0.0 - 1.0)
    }

    /// <summary>Master channel and overall session state.</summary>
    [Serializable]
    public sealed class MasterChannel
    {
        public float level;           // Master gain (0.0 - 1.0)
        public float peakLevel;
        public bool clipping;
        public float compressorGain;  // Gain reduction from compressor
        public int recordingBitDepth = 24;
        public int recordingSampleRate = 48000;
    }

    /// <summary>Recording session metadata and state.</summary>
    [Serializable]
    public sealed class RecordingSession
    {
        public string sessionId = Guid.NewGuid().ToString("N");
        public string projectName = "Untitled Project";
        public bool isRecording;
        public bool isPlaying;
        public float currentTimeSeconds;
        public float totalDurationSeconds;
        public int trackCount = 8;
        public string status = "READY";       // READY, RECORDING, PLAYING, ERROR
    }

    /// <summary>Complete audio workstation state snapshot.</summary>
    [Serializable]
    public sealed class SoundLabsSnapshot
    {
        public string connectionState;
        public string capturedAt;
        public double ageSeconds;
        public RecordingSession session = new RecordingSession();
        public List<AudioTrack> tracks = new List<AudioTrack>();
        public MasterChannel master = new MasterChannel();
        public List<FrequencyBand> spectrum = new List<FrequencyBand>();
        public string reason;

        public AudioConnectionState ParsedState => SoundLabsStateMapper.ParseConnectionState(connectionState);
    }

    /// <summary>
    /// Pure mapping from backend audio states to XR <see cref="WorldState"/>.
    /// Testable independently; ensures stale data is never rendered as Connected.
    /// </summary>
    public static class SoundLabsStateMapper
    {
        public static AudioConnectionState ParseConnectionState(string raw)
        {
            if (string.IsNullOrWhiteSpace(raw)) return AudioConnectionState.OfflineDemo;
            switch (raw.Trim().ToUpperInvariant())
            {
                case "CONNECTED": return AudioConnectionState.Connected;
                case "DEMO": return AudioConnectionState.Demo;
                case "OFFLINE_DEMO":
                case "OFFLINE": return AudioConnectionState.OfflineDemo;
                case "DEGRADED": return AudioConnectionState.Degraded;
                default: return AudioConnectionState.OfflineDemo;
            }
        }

        public static WorldState ToWorldState(AudioConnectionState state)
        {
            switch (state)
            {
                case AudioConnectionState.Connected: return WorldState.Connected;
                case AudioConnectionState.Demo: return WorldState.OfflineDemo;
                case AudioConnectionState.OfflineDemo: return WorldState.OfflineDemo;
                case AudioConnectionState.Degraded: return WorldState.Degraded;
                default: return WorldState.OfflineDemo;
            }
        }

        public static string StatusLabel(AudioConnectionState state)
        {
            switch (state)
            {
                case AudioConnectionState.Connected: return "CONNECTED";
                case AudioConnectionState.Demo: return "DEMO";
                case AudioConnectionState.OfflineDemo: return "OFFLINE MIX";
                case AudioConnectionState.Degraded: return "DEGRADED";
                default: return "OFFLINE MIX";
            }
        }

        /// <summary>Summary of master channel state for station panel.</summary>
        public static string MasterSummary(MasterChannel master)
        {
            if (master == null) return "MASTER: --";
            var level = master.level * 100f;
            var peak = master.peakLevel * 100f;
            return $"MASTER: {level:0}dB  PEAK: {peak:0}dB";
        }

        /// <summary>Summary of current session for status display.</summary>
        public static string SessionSummary(RecordingSession session)
        {
            if (session == null) return "NO SESSION";
            var status = session.isRecording ? "RECORDING" : (session.isPlaying ? "PLAYING" : "READY");
            return $"{session.projectName} · {status} · {session.trackCount} TRACKS";
        }
    }
}
