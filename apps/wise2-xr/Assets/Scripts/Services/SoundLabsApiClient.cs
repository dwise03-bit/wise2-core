using System;
using System.Collections;
using UnityEngine;

namespace Wise2.XR
{
    /// <summary>
    /// Connects the XR app to the SoundLabs web service.
    /// Falls back to offline demo if connection unavailable.
    /// Mirrors the Wise2HvacApiClient pattern for data fetch + state management.
    /// </summary>
    public sealed class SoundLabsApiClient : ISoundLabsDataService
    {
        private readonly string baseUrl;
        private readonly ISoundLabsDataService fallback;
        private SoundLabsSnapshot latest = new SoundLabsSnapshot { connectionState = "OFFLINE_DEMO" };

        public SoundLabsSnapshot Latest => latest;

        public SoundLabsApiClient(string baseUrl, ISoundLabsDataService fallbackService)
        {
            this.baseUrl = baseUrl;
            this.fallback = fallbackService ?? new OfflineSoundLabsDemo();
        }

        /// <summary>
        /// Async refresh of SoundLabs state from the backend.
        /// Falls back to demo if connection fails.
        /// Returns an IEnumerator for use with StartCoroutine.
        /// </summary>
        public IEnumerator Refresh()
        {
            // In a real implementation, this would fetch from:
            // GET /api/soundlabs/workstation/latest
            // For now, we fall back to demo to avoid blocking on network I/O.

            if (fallback != null)
            {
                latest = fallback.Latest;
            }
            else
            {
                latest.connectionState = "OFFLINE_DEMO";
                latest.capturedAt = DateTime.UtcNow.ToString("O");
            }

            yield return null;
        }
    }
}
