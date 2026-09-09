package com.wise2.fieldtech.vr

import android.content.Context
import android.util.Log

/**
 * OpenXR Session Management for Meta Quest Hand Tracking
 * Handles XR runtime initialization, session lifecycle, and frame callbacks
 */
class OpenXRSession(context: Context) {

    companion object {
        private const val TAG = "OpenXRSession"
        private var nativeLibraryLoaded = false

        init {
            try {
                System.loadLibrary("openxr_vr")
                nativeLibraryLoaded = true
                Log.d(TAG, "OpenXR JNI library loaded successfully")
            } catch (e: UnsatisfiedLinkError) {
                Log.w(TAG, "OpenXR JNI library not available: ${e.message}")
                nativeLibraryLoaded = false
            }
        }
    }

    private var xrInstance: Long = 0
    private var xrSession: Long = 0
    private var xrSpace: Long = 0
    private var leftHandTracker: Long = 0
    private var rightHandTracker: Long = 0
    private var isSessionActive = false
    private var frameCallbackListener: FrameCallbackListener? = null

    interface FrameCallbackListener {
        fun onXrFrame(frameTime: Long, handFrames: List<HandTrackingGestureDetector.HandFrame>)
    }

    /**
     * Initialize OpenXR runtime and create session
     */
    fun initialize(): Boolean {
        return try {
            Log.d(TAG, "Initializing OpenXR session")

            // Check if native library is available
            if (!nativeLibraryLoaded) {
                Log.w(TAG, "OpenXR native library not loaded, cannot initialize")
                return false
            }

            // Create XR instance with required extensions
            xrInstance = createXrInstance()
            if (xrInstance == 0L) {
                Log.e(TAG, "Failed to create XR instance")
                return false
            }

            // Create system
            val systemId = getSystemId(xrInstance)
            if (systemId == 0L) {
                Log.e(TAG, "Failed to get system ID")
                return false
            }

            // Create session
            xrSession = createXrSession(xrInstance, systemId)
            if (xrSession == 0L) {
                Log.e(TAG, "Failed to create XR session")
                return false
            }

            // Create reference space
            xrSpace = createReferenceSpace(xrSession)
            if (xrSpace == 0L) {
                Log.e(TAG, "Failed to create reference space")
                return false
            }

            // Setup hand tracking
            leftHandTracker = createHandTracker(xrSession, 0) // Left hand
            rightHandTracker = createHandTracker(xrSession, 1) // Right hand

            if (leftHandTracker == 0L || rightHandTracker == 0L) {
                Log.w(TAG, "Hand tracking initialization failed, continuing without it")
            }

            isSessionActive = true
            Log.d(TAG, "OpenXR session initialized successfully")
            true
        } catch (e: Exception) {
            Log.e(TAG, "OpenXR initialization error", e)
            false
        }
    }

    /**
     * Begin XR session
     */
    fun beginSession(): Boolean {
        return try {
            if (xrSession == 0L) return false

            Log.d(TAG, "Beginning XR session")
            beginXrSession(xrSession)
            true
        } catch (e: Exception) {
            Log.e(TAG, "Failed to begin XR session", e)
            false
        }
    }

    /**
     * Process XR frame with hand tracking
     */
    fun processFrame(): Boolean {
        return try {
            if (!isSessionActive || xrSession == 0L) return false

            // Wait for frame
            val frameTime = waitXrFrame(xrSession)

            // Begin frame
            beginXrFrame(xrSession)

            // Get hand tracking data
            val handFrames = mutableListOf<HandTrackingGestureDetector.HandFrame>()

            // Left hand
            if (leftHandTracker != 0L) {
                val leftFrame = getHandTrackingFrame(xrSession, leftHandTracker, "left", frameTime)
                leftFrame?.let { handFrames.add(it) }
            }

            // Right hand
            if (rightHandTracker != 0L) {
                val rightFrame = getHandTrackingFrame(xrSession, rightHandTracker, "right", frameTime)
                rightFrame?.let { handFrames.add(it) }
            }

            // End frame
            endXrFrame(xrSession)

            // Notify listener
            frameCallbackListener?.onXrFrame(frameTime, handFrames)

            true
        } catch (e: Exception) {
            Log.e(TAG, "Frame processing error", e)
            false
        }
    }

    /**
     * End XR session
     */
    fun endSession() {
        try {
            if (xrSession != 0L) {
                endXrSession(xrSession)
                isSessionActive = false
                Log.d(TAG, "XR session ended")
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error ending session", e)
        }
    }

    /**
     * Shutdown OpenXR
     */
    fun shutdown() {
        try {
            if (isSessionActive) endSession()

            if (xrSpace != 0L) {
                destroyReferenceSpace(xrSpace)
            }

            if (xrSession != 0L) {
                destroyXrSession(xrSession)
            }

            if (xrInstance != 0L) {
                destroyXrInstance(xrInstance)
            }

            Log.d(TAG, "OpenXR shutdown complete")
        } catch (e: Exception) {
            Log.e(TAG, "Error during shutdown", e)
        }
    }

    fun setFrameCallbackListener(listener: FrameCallbackListener) {
        this.frameCallbackListener = listener
    }

    fun isActive(): Boolean = isSessionActive

    // Native OpenXR calls (would be implemented via JNI)
    private external fun createXrInstance(): Long
    private external fun getSystemId(instance: Long): Long
    private external fun createXrSession(instance: Long, systemId: Long): Long
    private external fun createReferenceSpace(session: Long): Long
    private external fun createHandTracker(session: Long, hand: Int): Long
    private external fun beginXrSession(session: Long)
    private external fun waitXrFrame(session: Long): Long
    private external fun beginXrFrame(session: Long)
    private external fun endXrFrame(session: Long)
    private external fun endXrSession(session: Long)
    private external fun destroyReferenceSpace(space: Long)
    private external fun destroyXrSession(session: Long)
    private external fun destroyXrInstance(instance: Long)
    private external fun getHandTrackingFrame(
        session: Long,
        handTracker: Long,
        handedness: String,
        frameTime: Long
    ): HandTrackingGestureDetector.HandFrame?
}
