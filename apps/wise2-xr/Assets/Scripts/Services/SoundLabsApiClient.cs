using System;
using System.Collections;
using UnityEngine;
using UnityEngine.Networking;

namespace Wise2.XR
{
    /// <summary>
    /// Connects the XR app to the real SoundLabs hardware bridge
    /// (the same <c>GET /state</c> endpoint the sound-labs-ui dashboard polls —
    /// see apps/sound-labs-ui/src/App.tsx). Falls back to offline demo if the
    /// bridge is unreachable. Mirrors the Wise2HvacApiClient pattern.
    ///
    /// IMPORTANT: the real bridge reports MIDI/Reaper/AI-mode status only — it
    /// has no per-track fader/level/spectrum data. When the bridge is reachable
    /// we surface real connection + session info but keep the mixer's visual
    /// tracks/spectrum on the demo source (connectionState "DEMO", not
    /// "CONNECTED") rather than fabricate telemetry that doesn't exist.
    /// </summary>
    public sealed class SoundLabsApiClient : ISoundLabsDataService
    {
        private const int RequestTimeoutSeconds = 5;

        private readonly string baseUrl;
        private readonly ISoundLabsDataService fallback;
        private SoundLabsSnapshot latest = new SoundLabsSnapshot { connectionState = "OFFLINE_DEMO", reason = "Awaiting first bridge poll" };

        public SoundLabsSnapshot Latest => latest;

        public SoundLabsApiClient(string baseUrl, ISoundLabsDataService fallbackService)
        {
            this.baseUrl = (baseUrl ?? string.Empty).TrimEnd('/');
            this.fallback = fallbackService ?? new OfflineSoundLabsDemo();
        }

        /// <summary>
        /// Async refresh of SoundLabs state from the real bridge.
        /// Falls back to demo if the bridge is unreachable or unparsable.
        /// Returns an IEnumerator for use with StartCoroutine.
        /// </summary>
        public IEnumerator Refresh()
        {
            if (string.IsNullOrEmpty(baseUrl))
            {
                latest = OfflineSnapshot("No SoundLabs bridge URL configured");
                yield break;
            }

            using (var request = UnityWebRequest.Get($"{baseUrl}/state"))
            {
                request.timeout = RequestTimeoutSeconds;
                yield return request.SendWebRequest();

                if (request.result != UnityWebRequest.Result.Success)
                {
                    latest = OfflineSnapshot($"Bridge request failed: {request.error}");
                    yield break;
                }

                BridgeStateDto parsed = null;
                try { parsed = JsonUtility.FromJson<BridgeStateDto>(request.downloadHandler.text); }
                catch (Exception ex) { Debug.LogWarning($"WISE² XR: SoundLabs bridge parse failed: {ex.Message}"); }

                if (parsed == null)
                {
                    latest = OfflineSnapshot("Bridge response could not be read");
                    yield break;
                }

                latest = MapToSnapshot(parsed);
            }
        }

        /// <summary>
        /// Maps the real bridge status onto the mixer contract. Tracks/spectrum/
        /// master are sourced from the demo service since the bridge does not
        /// expose per-track audio data — connectionState "DEMO" makes that
        /// distinction explicit to anything reading it.
        /// </summary>
        private SoundLabsSnapshot MapToSnapshot(BridgeStateDto dto)
        {
            var demo = fallback.Latest;
            var reaperConnected = dto.reaper != null && dto.reaper.connected;
            var transport = dto.reaper?.transport_state ?? "";
            var isRecording = string.Equals(transport, "recording", StringComparison.OrdinalIgnoreCase);
            var isPlaying = string.Equals(transport, "playing", StringComparison.OrdinalIgnoreCase);

            return new SoundLabsSnapshot
            {
                connectionState = "DEMO",
                capturedAt = DateTime.UtcNow.ToString("O"),
                ageSeconds = 0,
                reason = $"MIDI {(dto.midi != null && dto.midi.connected ? "linked" : "offline")} · " +
                         $"MODE {(string.IsNullOrEmpty(dto.mode?.current_mode) ? "unknown" : dto.mode.current_mode.ToUpperInvariant())} · " +
                         $"REAPER {(reaperConnected ? transport.ToUpperInvariant() : "offline")}",
                session = new RecordingSession
                {
                    projectName = string.IsNullOrEmpty(dto.reaper?.project_name) ? demo.session.projectName : dto.reaper.project_name,
                    isRecording = isRecording,
                    isPlaying = isPlaying,
                    currentTimeSeconds = demo.session.currentTimeSeconds,
                    totalDurationSeconds = demo.session.totalDurationSeconds,
                    trackCount = demo.session.trackCount,
                    status = reaperConnected ? transport.ToUpperInvariant() : "READY",
                },
                master = demo.master,
                tracks = demo.tracks,
                spectrum = demo.spectrum,
            };
        }

        private SoundLabsSnapshot OfflineSnapshot(string reason)
        {
            Debug.LogWarning($"WISE² XR: SoundLabs bridge offline — {reason}");
            var demo = fallback.Latest;
            demo.connectionState = "OFFLINE_DEMO";
            demo.reason = reason;
            return demo;
        }

        [Serializable]
        private sealed class BridgeMidiDto
        {
            public bool connected;
        }

        [Serializable]
        private sealed class BridgeModeDto
        {
            public string current_mode;
        }

        [Serializable]
        private sealed class BridgeReaperDto
        {
            public bool connected;
            public string transport_state;
            public string project_name;
            public float bpm;
        }

        [Serializable]
        private sealed class BridgeStateDto
        {
            public BridgeMidiDto midi;
            public BridgeModeDto mode;
            public BridgeReaperDto reaper;
        }
    }

}
