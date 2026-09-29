using System;
using UnityEngine;

namespace Wise2.XR
{
    public static class Wise2Config
    {
#if WISE2_USB_DEV
        public const string ApiBaseUrl = "http://127.0.0.1:3010";
#else
        public const string ApiBaseUrl = "https://api.wise2.net";
#endif
        // Real hardware bridge for the Maschine Mikro MK3 / Reaper SoundLabs rig —
        // the same endpoint the sound-labs-ui dashboard polls (apps/sound-labs-ui/src/App.tsx).
        // Not the general WISE² API; override with WISE2_XR_SOUNDLABS_BRIDGE_URL if the
        // bridge host changes (it's currently a Tailscale IP, not a stable DNS name).
        public static string SoundLabsBridgeUrl =>
            Environment.GetEnvironmentVariable("WISE2_XR_SOUNDLABS_BRIDGE_URL") is string url && !string.IsNullOrEmpty(url)
                ? url
                : "http://100.64.72.14:8788";

        public const string ProductName = "WISE² XR COMMAND CENTER";
        public const string AppScheme = "wise2";
        public const string DigitalTwinRoute = "digital-twin";
        public const string WiseDefenseTrainingRoute = "wise-defense-training";
    }
}
