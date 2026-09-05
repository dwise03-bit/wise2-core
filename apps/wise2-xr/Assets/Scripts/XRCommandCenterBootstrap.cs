using UnityEngine;
using UnityEngine.XR.Management;

namespace Wise2.XR
{
    public sealed class XRCommandCenterBootstrap : MonoBehaviour
    {
        [SerializeField] private Color accent = new Color(0.725f, 1f, 0.408f, 1f);

        private void Awake()
        {
            Application.targetFrameRate = 72;
            Screen.sleepTimeout = SleepTimeout.NeverSleep;
            if (XRGeneralSettings.Instance?.Manager != null)
                StartCoroutine(StartXR());
        }

        private System.Collections.IEnumerator StartXR()
        {
            yield return XRGeneralSettings.Instance.Manager.InitializeLoader();
            if (XRGeneralSettings.Instance.Manager.activeLoader != null)
                XRGeneralSettings.Instance.Manager.StartSubsystems();
            else
                Debug.LogWarning("WISE² XR: OpenXR loader unavailable; running desktop preview.");
        }

        private void OnDestroy()
        {
            if (XRGeneralSettings.Instance?.Manager?.activeLoader != null)
                XRGeneralSettings.Instance.Manager.StopSubsystems();
        }
    }
}
