using System;
using UnityEngine;

namespace Wise2.XR
{
    /// <summary>
    /// Receives the non-sensitive context handoff from wise2.net. Tenant data and
    /// authenticated actions remain behind the existing backend approval boundary.
    /// </summary>
    public sealed class QuestDeepLinkRouter : MonoBehaviour
    {
        private void Awake()
        {
            Application.deepLinkActivated += HandleDeepLink;
        }

        private void Start()
        {
            if (!string.IsNullOrWhiteSpace(Application.absoluteURL))
                HandleDeepLink(Application.absoluteURL);
        }

        private void OnDestroy()
        {
            Application.deepLinkActivated -= HandleDeepLink;
        }

        private static void HandleDeepLink(string rawUrl)
        {
            if (!Uri.TryCreate(rawUrl, UriKind.Absolute, out var uri) ||
                !string.Equals(uri.Scheme, Wise2Config.AppScheme, StringComparison.OrdinalIgnoreCase) ||
                (!string.Equals(uri.Host, Wise2Config.DigitalTwinRoute, StringComparison.OrdinalIgnoreCase) &&
                 !string.Equals(uri.Host, Wise2Config.WiseDefenseTrainingRoute, StringComparison.OrdinalIgnoreCase)))
            {
                Debug.LogWarning($"WISE² XR: Ignored unsupported deep link: {rawUrl}");
                return;
            }

            var runtime = FindFirstObjectByType<XRCommandCenterRuntime>();
            if (runtime == null)
            {
                Debug.LogWarning("WISE² XR: Digital Twin link received before the command center loaded.");
                return;
            }

            if (string.Equals(uri.Host, Wise2Config.WiseDefenseTrainingRoute, StringComparison.OrdinalIgnoreCase))
                runtime.OpenWiseDefenseTraining();
            else
                runtime.OpenDigitalTwin();
        }
    }
}
