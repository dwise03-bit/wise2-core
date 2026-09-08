using System;

namespace Wise2.XR
{
    /// <summary>
    /// Unity-side mirror of the <c>@wise2/hvac-contracts</c> HVAC telemetry
    /// snapshot returned by <c>GET /v1/hvac/telemetry/{nodeId}/latest</c>.
    /// Serializable field names match the JSON payload for <see cref="UnityEngine.JsonUtility"/>.
    /// </summary>
    public enum HvacConnectionState { Connected, Demo, NoTelemetry, Degraded }

    [Serializable]
    public sealed class HvacMeasurement
    {
        public double value;
        public string unit;

        public bool HasValue => !string.IsNullOrEmpty(unit);
        public override string ToString() => HasValue ? $"{value:0.0} {unit}" : "--";
    }

    [Serializable]
    public sealed class HvacReading
    {
        public string capturedAt;
        public HvacMeasurement suctionPressure;
        public HvacMeasurement dischargePressure;
        public HvacMeasurement suctionLineTemp;
        public HvacMeasurement liquidLineTemp;
        public HvacMeasurement superheat;
        public HvacMeasurement subcooling;
        public HvacMeasurement voltage;
        public HvacMeasurement current;
    }

    [Serializable]
    public sealed class HvacTelemetrySnapshot
    {
        public string nodeId;
        public string connectionState;
        public string quality;
        public string capturedAt;
        public string receivedAt;
        public double ageSeconds;
        public HvacReading reading;
        public string reason;

        public HvacConnectionState ParsedState => HvacStateMapper.ParseConnectionState(connectionState);
    }

    /// <summary>
    /// Pure, UnityEngine-free mapping from backend telemetry states to the XR
    /// <see cref="WorldState"/>. Kept separate so it is independently testable and
    /// so stale data is never rendered as <see cref="WorldState.Connected"/>.
    /// </summary>
    public static class HvacStateMapper
    {
        public static HvacConnectionState ParseConnectionState(string raw)
        {
            if (string.IsNullOrWhiteSpace(raw)) return HvacConnectionState.NoTelemetry;
            switch (raw.Trim().ToUpperInvariant())
            {
                case "CONNECTED": return HvacConnectionState.Connected;
                case "DEMO": return HvacConnectionState.Demo;
                case "DEGRADED": return HvacConnectionState.Degraded;
                case "NO_TELEMETRY":
                case "NO TELEMETRY": return HvacConnectionState.NoTelemetry;
                default: return HvacConnectionState.Degraded;
            }
        }

        public static WorldState ToWorldState(HvacConnectionState state)
        {
            switch (state)
            {
                case HvacConnectionState.Connected: return WorldState.Connected;
                case HvacConnectionState.Demo: return WorldState.OfflineDemo;
                case HvacConnectionState.Degraded: return WorldState.Degraded;
                case HvacConnectionState.NoTelemetry: return WorldState.Degraded;
                default: return WorldState.Degraded;
            }
        }

        /// <summary>Short, safe status line for the HVAC station panel.</summary>
        public static string StatusLabel(HvacConnectionState state)
        {
            switch (state)
            {
                case HvacConnectionState.Connected: return "CONNECTED";
                case HvacConnectionState.Demo: return "DEMO";
                case HvacConnectionState.Degraded: return "DEGRADED";
                case HvacConnectionState.NoTelemetry: return "NO TELEMETRY";
                default: return "DEGRADED";
            }
        }

        /// <summary>Up to two units-labeled readings for the station panel.</summary>
        public static string ReadingSummary(HvacReading reading)
        {
            if (reading == null) return string.Empty;
            var parts = new System.Collections.Generic.List<string>(2);
            if (reading.suctionPressure != null && reading.suctionPressure.HasValue)
                parts.Add($"LOW {reading.suctionPressure}");
            if (reading.dischargePressure != null && reading.dischargePressure.HasValue)
                parts.Add($"HIGH {reading.dischargePressure}");
            if (parts.Count == 0 && reading.superheat != null && reading.superheat.HasValue)
                parts.Add($"SH {reading.superheat}");
            return string.Join("  ·  ", parts);
        }
    }
}
