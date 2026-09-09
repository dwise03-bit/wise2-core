package com.wise2.fieldtech.vr

/**
 * Hand Tracking Gesture Detector for Meta Quest
 * Uses hand joint positions to recognize and classify gestures
 * Interfaces with Meta OpenXR Hand Tracking v2
 */
class HandTrackingGestureDetector {

    // Hand joint indices (OpenXR standard)
    enum class HandJoint {
        PALM, WRIST,
        THUMB_METACARPAL, THUMB_PROXIMAL, THUMB_DISTAL, THUMB_TIP,
        INDEX_METACARPAL, INDEX_PROXIMAL, INDEX_MIDDLE, INDEX_DISTAL, INDEX_TIP,
        MIDDLE_METACARPAL, MIDDLE_PROXIMAL, MIDDLE_MIDDLE, MIDDLE_DISTAL, MIDDLE_TIP,
        RING_METACARPAL, RING_PROXIMAL, RING_MIDDLE, RING_DISTAL, RING_TIP,
        PINKY_METACARPAL, PINKY_PROXIMAL, PINKY_MIDDLE, PINKY_DISTAL, PINKY_TIP
    }

    data class HandJointPosition(
        val joint: HandJoint,
        val position: VREnvironment.Vector3,
        val confidence: Float // 0.0 to 1.0
    )

    data class HandFrame(
        val handedness: String, // "left" or "right"
        val joints: List<HandJointPosition>,
        val isTracked: Boolean,
        val timestamp: Long
    )

    // Gesture detection state
    private var lastDetectedGesture: VREnvironment.HandGesture? = null
    private var gestureStartTime = 0L
    private var gestureConfidence = 0f
    private var gestureHistory: MutableList<VREnvironment.HandGesture> = mutableListOf()

    // Gesture thresholds
    companion object {
        const val PINCH_DISTANCE_THRESHOLD = 0.04f // 4cm
        const val GRAB_FINGER_CURL_THRESHOLD = 0.8f
        const val POINT_CONFIDENCE_THRESHOLD = 0.7f
        const val GESTURE_HOLD_TIME_MS = 500L
        const val GESTURE_DEBOUNCE_TIME_MS = 100L
    }

    /**
     * Process hand frame and detect gestures
     */
    fun updateHandTracking(handFrame: HandFrame): VREnvironment.HandGesture? {
        if (!handFrame.isTracked) return null

        val detectedGesture = detectGesture(handFrame)

        // Debounce: only register if gesture is stable
        if (detectedGesture != lastDetectedGesture) {
            gestureStartTime = System.currentTimeMillis()
            lastDetectedGesture = detectedGesture
            return null
        }

        // Require gesture to be held for minimum time
        val timeSinceStart = System.currentTimeMillis() - gestureStartTime
        if (timeSinceStart > GESTURE_HOLD_TIME_MS && detectedGesture != null) {
            gestureHistory.add(detectedGesture)
            if (gestureHistory.size > 5) {
                gestureHistory.removeAt(0)
            }
            return detectedGesture
        }

        return null
    }

    private fun detectGesture(handFrame: HandFrame): VREnvironment.HandGesture? {
        val joints = handFrame.joints.associateBy { it.joint }

        return when {
            // PINCH: thumb tip and index tip close together
            isPinch(joints) -> VREnvironment.HandGesture.PINCH

            // GRAB: all fingers curled (fist)
            isGrab(joints) -> VREnvironment.HandGesture.GRAB

            // PALM_UP: open hand with palm facing up (high confidence on middle joint angles)
            isPalmUp(joints, handFrame.handedness) -> VREnvironment.HandGesture.PALM_UP

            // POINT: index finger extended, others curled
            isPoint(joints) -> VREnvironment.HandGesture.POINT

            // THUMBS_UP: thumb extended upward, fingers curled
            isThumbsUp(joints, handFrame.handedness) -> VREnvironment.HandGesture.THUMBS_UP

            else -> null
        }
    }

    private fun isPinch(joints: Map<HandJoint, HandJointPosition>): Boolean {
        val thumb = joints[HandJoint.THUMB_TIP] ?: return false
        val index = joints[HandJoint.INDEX_TIP] ?: return false

        if (thumb.confidence < POINT_CONFIDENCE_THRESHOLD || index.confidence < POINT_CONFIDENCE_THRESHOLD) {
            return false
        }

        val distance = distanceBetween(thumb.position, index.position)
        return distance < PINCH_DISTANCE_THRESHOLD
    }

    private fun isGrab(joints: Map<HandJoint, HandJointPosition>): Boolean {
        // Check if all fingers are curled (fist)
        val indexCurl = fingerCurl(joints, HandJoint.INDEX_DISTAL, HandJoint.INDEX_PROXIMAL)
        val middleCurl = fingerCurl(joints, HandJoint.MIDDLE_DISTAL, HandJoint.MIDDLE_PROXIMAL)
        val ringCurl = fingerCurl(joints, HandJoint.RING_DISTAL, HandJoint.RING_PROXIMAL)
        val pinkyCurl = fingerCurl(joints, HandJoint.PINKY_DISTAL, HandJoint.PINKY_PROXIMAL)

        return listOf(indexCurl, middleCurl, ringCurl, pinkyCurl).all { it > GRAB_FINGER_CURL_THRESHOLD }
    }

    private fun isPalmUp(joints: Map<HandJoint, HandJointPosition>, handedness: String): Boolean {
        val palm = joints[HandJoint.PALM] ?: return false
        val wrist = joints[HandJoint.WRIST] ?: return false
        val middleMid = joints[HandJoint.MIDDLE_MIDDLE] ?: return false

        // Palm is up if middle finger is above wrist and palm is open
        val palmUpward = middleMid.position.y > palm.position.y

        // Check all fingers are extended (not curled)
        val indexExtended = fingerExtension(joints, HandJoint.INDEX_DISTAL, HandJoint.INDEX_PROXIMAL)
        val middleExtended = fingerExtension(joints, HandJoint.MIDDLE_DISTAL, HandJoint.MIDDLE_PROXIMAL)
        val ringExtended = fingerExtension(joints, HandJoint.RING_DISTAL, HandJoint.RING_PROXIMAL)
        val pinkyExtended = fingerExtension(joints, HandJoint.PINKY_DISTAL, HandJoint.PINKY_PROXIMAL)

        return palmUpward && listOf(indexExtended, middleExtended, ringExtended, pinkyExtended).all { it < 0.3f }
    }

    private fun isPoint(joints: Map<HandJoint, HandJointPosition>): Boolean {
        val index = joints[HandJoint.INDEX_TIP] ?: return false
        val indexMid = joints[HandJoint.INDEX_MIDDLE] ?: return false
        val middle = joints[HandJoint.MIDDLE_PROXIMAL] ?: return false

        // Index finger extended
        val indexExtended = distanceBetween(index.position, indexMid.position) > 0.05f

        // Other fingers curled
        val middleCurl = fingerCurl(joints, HandJoint.MIDDLE_DISTAL, HandJoint.MIDDLE_PROXIMAL)
        val ringCurl = fingerCurl(joints, HandJoint.RING_DISTAL, HandJoint.RING_PROXIMAL)
        val pinkyCurl = fingerCurl(joints, HandJoint.PINKY_DISTAL, HandJoint.PINKY_PROXIMAL)

        return indexExtended && listOf(middleCurl, ringCurl, pinkyCurl).all { it > GRAB_FINGER_CURL_THRESHOLD }
    }

    private fun isThumbsUp(joints: Map<HandJoint, HandJointPosition>, handedness: String): Boolean {
        val thumb = joints[HandJoint.THUMB_TIP] ?: return false
        val thumbMid = joints[HandJoint.THUMB_PROXIMAL] ?: return false
        val palm = joints[HandJoint.PALM] ?: return false

        // Thumb extended upward
        val thumbExtended = thumb.position.y > thumbMid.position.y
        val thumbUp = thumb.position.y > palm.position.y + 0.1f

        // Other fingers curled
        val indexCurl = fingerCurl(joints, HandJoint.INDEX_DISTAL, HandJoint.INDEX_PROXIMAL)
        val middleCurl = fingerCurl(joints, HandJoint.MIDDLE_DISTAL, HandJoint.MIDDLE_PROXIMAL)
        val ringCurl = fingerCurl(joints, HandJoint.RING_DISTAL, HandJoint.RING_PROXIMAL)
        val pinkyCurl = fingerCurl(joints, HandJoint.PINKY_DISTAL, HandJoint.PINKY_PROXIMAL)

        return thumbUp && thumbExtended && listOf(indexCurl, middleCurl, ringCurl, pinkyCurl).all { it > GRAB_FINGER_CURL_THRESHOLD }
    }

    /**
     * Calculate finger curl (0.0 = extended, 1.0 = fully curled)
     */
    private fun fingerCurl(
        joints: Map<HandJoint, HandJointPosition>,
        distal: HandJoint,
        proximal: HandJoint
    ): Float {
        val distalJoint = joints[distal] ?: return 0f
        val proximalJoint = joints[proximal] ?: return 0f

        val distance = distanceBetween(distalJoint.position, proximalJoint.position)
        // Normalize: fully curled ≈ 0.02m, extended ≈ 0.08m
        return (1.0f - (distance / 0.08f)).coerceIn(0f, 1f)
    }

    /**
     * Calculate finger extension (0.0 = fully extended, 1.0 = fully curled)
     */
    private fun fingerExtension(
        joints: Map<HandJoint, HandJointPosition>,
        distal: HandJoint,
        proximal: HandJoint
    ): Float {
        return 1.0f - fingerCurl(joints, distal, proximal)
    }

    /**
     * Distance between two 3D points
     */
    private fun distanceBetween(
        a: VREnvironment.Vector3,
        b: VREnvironment.Vector3
    ): Float {
        val dx = a.x - b.x
        val dy = a.y - b.y
        val dz = a.z - b.z
        return kotlin.math.sqrt(dx * dx + dy * dy + dz * dz)
    }

    /**
     * Get recent gesture history for combo detection
     */
    fun getGestureHistory(): List<VREnvironment.HandGesture> = gestureHistory.toList()

    /**
     * Get current gesture confidence
     */
    fun getGestureConfidence(): Float = gestureConfidence

    /**
     * Reset gesture detection state
     */
    fun reset() {
        lastDetectedGesture = null
        gestureStartTime = 0L
        gestureConfidence = 0f
        gestureHistory.clear()
    }
}
