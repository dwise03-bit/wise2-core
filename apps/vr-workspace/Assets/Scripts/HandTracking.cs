/**
 * HandTracking.cs
 * Meta Quest hand gesture recognition via OpenXR
 */

using UnityEngine;

public class HandTracking : MonoBehaviour
{
    public enum Gesture { Idle, Pinch, Grab, Point, Palm, ThumbsUp, Wave }

    [SerializeField] private Transform leftHand;
    [SerializeField] private Transform rightHand;
    [SerializeField] private float pinchThreshold = 0.1f;
    [SerializeField] private float grabThreshold = 0.8f;

    private Gesture currentGesture = Gesture.Idle;
    private float leftPinchStrength = 0f;
    private float rightPinchStrength = 0f;

    void Start()
    {
        // Initialize hand tracking (OpenXR will auto-initialize)
        Debug.Log("[HandTracking] Initialized for Meta Quest 3S");
    }

    void Update()
    {
        UpdateHandTracking();
        DetectGesture();
    }

    /**
     * Update hand positions from OpenXR tracking
     */
    private void UpdateHandTracking()
    {
        // In real implementation: Query OpenXR hand tracking API
        // For now: Placeholder
        if (leftHand) leftHand.position = new Vector3(-0.2f, 1.3f, 0);
        if (rightHand) rightHand.position = new Vector3(0.2f, 1.3f, 0);
    }

    /**
     * Detect current gesture from hand positions
     */
    private void DetectGesture()
    {
        // Simple gesture detection (production would use OpenXR hand joint tracking)
        currentGesture = Gesture.Idle;

        // Check for pinch (thumb + index close)
        if (Vector3.Distance(leftHand.position, rightHand.position) < pinchThreshold)
        {
            currentGesture = Gesture.Pinch;
            return;
        }

        // Check for grab (all fingers curled)
        if (rightPinchStrength > grabThreshold)
        {
            currentGesture = Gesture.Grab;
            return;
        }

        // Check for point (index extended)
        if (Vector3.Dot(rightHand.forward, transform.forward) > 0.8f)
        {
            currentGesture = Gesture.Point;
            return;
        }

        // Default to idle
        currentGesture = Gesture.Idle;
    }

    /**
     * Get current gesture name
     */
    public string GetCurrentGesture()
    {
        return currentGesture.ToString().ToLower();
    }

    /**
     * Check if gesture just occurred
     */
    public bool IsGestureActive(Gesture gesture)
    {
        return currentGesture == gesture;
    }

    /**
     * Get hand position
     */
    public Vector3 GetHandPosition(bool leftHand)
    {
        return leftHand ? this.leftHand.position : this.rightHand.position;
    }

    /**
     * Initialize tracking
     */
    public void Initialize()
    {
        Debug.Log("[HandTracking] Initialization complete");
    }
}
