using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Networking;

namespace Wise2.XR
{
    /// <summary>
    /// Read-only adapter for the authenticated WISE² HVAC telemetry endpoint
    /// (<c>GET /v1/hvac/telemetry/{nodeId}/latest</c>). On any transport, auth, or
    /// parse failure it falls back to the offline demo source with an explicit,
    /// non-connected state — stale data is never presented as live.
    ///
    /// No credential is stored in a serialized Unity asset. The bearer token is
    /// read at runtime from the <c>WISE2_XR_TOKEN</c> environment variable, or
    /// from an injected provider for tests.
    /// </summary>
    public sealed class Wise2HvacApiClient : IWise2ApiClient
    {
        private const int RequestTimeoutSeconds = 8;

        private readonly string _baseUrl;
        private readonly string _nodeId;
        private readonly Func<string> _tokenProvider;
        private readonly OfflineDemoServices _fallback;

        public HvacTelemetrySnapshot Latest { get; private set; }

        public Wise2HvacApiClient(string baseUrl, string nodeId, OfflineDemoServices fallback, Func<string> tokenProvider = null)
        {
            _baseUrl = (baseUrl ?? string.Empty).TrimEnd('/');
            _nodeId = string.IsNullOrWhiteSpace(nodeId) ? "pocket-node-demo" : nodeId;
            _fallback = fallback ?? new OfflineDemoServices();
            _tokenProvider = tokenProvider ?? DefaultToken;
            Latest = DemoSnapshot("Awaiting first telemetry poll");
        }

        public WorldState State => HvacStateMapper.ToWorldState(Latest.ParsedState);

        // IWise2ApiClient boundary. KPI/activity stay served by the existing
        // offline demo source; this adapter only makes the HVAC station live-capable.
        public KpiSnapshot GetKpis() => _fallback.GetKpis();
        public IReadOnlyList<ActivityItem> GetActivity() => _fallback.GetActivity();

        /// <summary>Fetch the latest snapshot once. Drive from a MonoBehaviour coroutine.</summary>
        public IEnumerator Refresh()
        {
            if (string.IsNullOrEmpty(_baseUrl))
            {
                Latest = DemoSnapshot("No API base URL configured");
                yield break;
            }

            var url = $"{_baseUrl}/v1/hvac/telemetry/{UnityWebRequest.EscapeURL(_nodeId)}/latest";
            using (var request = UnityWebRequest.Get(url))
            {
                request.timeout = RequestTimeoutSeconds;
                var token = _tokenProvider?.Invoke();
                if (!string.IsNullOrEmpty(token))
                    request.SetRequestHeader("Authorization", $"Bearer {token}");

                yield return request.SendWebRequest();

                if (request.result != UnityWebRequest.Result.Success)
                {
                    Latest = DegradedSnapshot($"Telemetry request failed: {request.error}");
                    yield break;
                }

                HvacTelemetrySnapshot parsed = null;
                try { parsed = JsonUtility.FromJson<HvacTelemetrySnapshot>(request.downloadHandler.text); }
                catch (Exception ex) { Debug.LogWarning($"WISE² XR: telemetry parse failed: {ex.Message}"); }

                if (parsed == null || string.IsNullOrEmpty(parsed.connectionState))
                {
                    Latest = DegradedSnapshot("Telemetry response could not be read");
                    yield break;
                }

                // Backend owns the freshness decision; the client never upgrades it.
                Latest = parsed;
            }
        }

        private static string DefaultToken()
        {
            var fromEnv = Environment.GetEnvironmentVariable("WISE2_XR_TOKEN");
            return string.IsNullOrEmpty(fromEnv) ? null : fromEnv;
        }

        private HvacTelemetrySnapshot DemoSnapshot(string reason) => new HvacTelemetrySnapshot
        {
            nodeId = _nodeId,
            connectionState = "DEMO",
            quality = "ok",
            reason = reason,
            reading = new HvacReading
            {
                suctionPressure = new HvacMeasurement { value = 118.0, unit = "psig" },
                dischargePressure = new HvacMeasurement { value = 300.0, unit = "psig" },
                superheat = new HvacMeasurement { value = 15.0, unit = "deltaF" },
            },
        };

        private HvacTelemetrySnapshot DegradedSnapshot(string reason)
        {
            Debug.LogWarning($"WISE² XR: {reason}");
            return new HvacTelemetrySnapshot
            {
                nodeId = _nodeId,
                connectionState = "DEGRADED",
                quality = "degraded",
                reason = reason,
                reading = null,
            };
        }
    }
}
