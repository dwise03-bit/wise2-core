using System.Collections;
using UnityEngine;
using UnityEngine.XR.Management;

namespace Wise2.XR
{
    /// <summary>
    /// Boots the Quest command center. Responsible for bringing up the OpenXR
    /// loader so the headset renders the immersive WISE² scene instead of
    /// falling back to a flat Android surface (passthrough / black view).
    /// </summary>
    public sealed class XRCommandCenterBootstrap : MonoBehaviour
    {
        [SerializeField] private Color accent = new Color(0.725f, 1f, 0.408f, 1f);

        private bool xrRunning;

        private void Awake()
        {
            Application.targetFrameRate = 72;
            Screen.sleepTimeout = SleepTimeout.NeverSleep;
            Screen.orientation = ScreenOrientation.LandscapeLeft;

            if (FindFirstObjectByType<QuestDeepLinkRouter>() == null)
                gameObject.AddComponent<QuestDeepLinkRouter>();
        }

        private void OnEnable()
        {
            StartCoroutine(StartXR());
        }

        private IEnumerator StartXR()
        {
            var settings = XRGeneralSettings.Instance;
            if (settings == null || settings.Manager == null)
            {
                Debug.LogError("WISE² XR: XRGeneralSettings/Manager missing from the build. " +
                               "OpenXR loader was not baked in - headset will show passthrough. " +
                               "Rebuild with Wise2.XR.Editor.BuildQuest.PerformBuild.");
                yield break;
            }

            var manager = settings.Manager;

            if (manager.activeLoader != null)
            {
                EnsureRunning(manager);
                yield break;
            }

            // Retry a few times: on Quest the runtime is occasionally not ready on
            // the very first frame after the splash.
            for (var attempt = 1; attempt <= 5 && manager.activeLoader == null; attempt++)
            {
                Debug.Log($"WISE² XR: initializing OpenXR loader (attempt {attempt})...");
                yield return manager.InitializeLoader();

                if (manager.activeLoader != null)
                    break;

                yield return new WaitForSeconds(0.5f);
            }

            if (manager.activeLoader == null)
            {
                Debug.LogWarning("WISE² XR: OpenXR loader unavailable; running flat desktop preview.");
                yield break;
            }

            EnsureRunning(manager);
        }

        private void EnsureRunning(XRManagerSettings manager)
        {
            if (xrRunning)
                return;

            manager.StartSubsystems();
            xrRunning = true;
            Debug.Log($"WISE² XR: OpenXR loader started ({manager.activeLoader.name}); immersive scene is live.");
        }

        private void OnDestroy()
        {
            var manager = XRGeneralSettings.Instance != null ? XRGeneralSettings.Instance.Manager : null;
            if (xrRunning && manager != null && manager.activeLoader != null)
            {
                manager.StopSubsystems();
                manager.DeinitializeLoader();
                xrRunning = false;
            }
        }
    }
}
