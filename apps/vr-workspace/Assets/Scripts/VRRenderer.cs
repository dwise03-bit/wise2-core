/**
 * VRRenderer.cs
 * VR rendering pipeline optimization for Meta Quest 3S (72 FPS)
 */

using UnityEngine;
using UnityEngine.Rendering;

public class VRRenderer : MonoBehaviour
{
    [SerializeField] private int targetFrameRate = 72;
    [SerializeField] private bool useDynamicResolution = true;
    [SerializeField] private float minResolutionScale = 0.8f;
    [SerializeField] private float maxResolutionScale = 1.0f;

    private float currentResolutionScale = 1f;

    void Start()
    {
        OptimizeRendering();
    }

    void Update()
    {
        MonitorPerformance();
    }

    /**
     * Optimize rendering for Quest 3S
     */
    private void OptimizeRendering()
    {
        // Set target frame rate
        Application.targetFrameRate = targetFrameRate;

        // Optimize batching
        PlayerSettings.gpuInstancingEnabled = true;

        // Disable unused features
        QualitySettings.shadows = ShadowQuality.HardOnly;
        QualitySettings.shadowResolution = ShadowResolution.Low;
        QualitySettings.antiAliasing = 2;

        // Enable GPU instancing for materials
        SetGPUInstancing(true);

        Debug.Log($"[VRRenderer] Optimized for {targetFrameRate} FPS");
    }

    /**
     * Monitor frame rate and adjust resolution
     */
    private void MonitorPerformance()
    {
        if (!useDynamicResolution) return;

        float currentFps = 1f / Time.deltaTime;

        if (currentFps < targetFrameRate - 5)
        {
            // Lower resolution
            currentResolutionScale = Mathf.Max(minResolutionScale, currentResolutionScale - 0.05f);
            ApplyResolutionScale(currentResolutionScale);
            Debug.Log($"[VRRenderer] Lowered resolution scale to {currentResolutionScale:F2}");
        }
        else if (currentFps > targetFrameRate + 10)
        {
            // Increase resolution
            currentResolutionScale = Mathf.Min(maxResolutionScale, currentResolutionScale + 0.05f);
            ApplyResolutionScale(currentResolutionScale);
            Debug.Log($"[VRRenderer] Increased resolution scale to {currentResolutionScale:F2}");
        }
    }

    /**
     * Apply dynamic resolution scale
     */
    private void ApplyResolutionScale(float scale)
    {
        ScalableBufferManager.ResizeBuffers(scale, scale);
    }

    /**
     * Enable/disable GPU instancing on materials
     */
    private void SetGPUInstancing(bool enabled)
    {
        Shader.globalKeyword = enabled ? new GlobalKeyword("INSTANCING_ON") : new GlobalKeyword("INSTANCING_OFF");
    }

    /**
     * Get current FPS
     */
    public float GetCurrentFPS()
    {
        return 1f / Time.deltaTime;
    }

    /**
     * Initialize renderer
     */
    public void Initialize()
    {
        Debug.Log("[VRRenderer] Initialized");
    }
}
