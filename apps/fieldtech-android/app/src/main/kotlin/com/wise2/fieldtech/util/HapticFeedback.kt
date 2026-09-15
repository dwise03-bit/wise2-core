package com.wise2.fieldtech.util

import android.content.Context
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import androidx.core.content.ContextCompat

/**
 * WISE² Haptic Feedback Manager
 * Provides haptic feedback for interactions (tap, success, error, warning)
 * Respects device haptics capabilities
 */
class HapticFeedbackManager(private val context: Context) {
    private val vibrator: Vibrator? = ContextCompat.getSystemService(context, Vibrator::class.java)

    /**
     * Gentle tap feedback (10ms)
     * Used for button presses, list item selection
     */
    fun tapFeedback() {
        if (vibrator?.hasVibrator() == true) {
            val effect = VibrationEffect.createPredefined(VibrationEffect.EFFECT_TICK)
            vibrator.cancel()
            vibrator.vibrate(effect)
        }
    }

    /**
     * Success feedback (50ms + 100ms pause + 50ms)
     * Used for completed actions, successful submissions
     */
    fun successFeedback() {
        if (vibrator?.hasVibrator() == true) {
            val effect = VibrationEffect.createPredefined(VibrationEffect.EFFECT_DOUBLE_CLICK)
            vibrator.cancel()
            vibrator.vibrate(effect)
        }
    }

    /**
     * Error feedback (200ms long vibration)
     * Used for errors, validation failures
     */
    fun errorFeedback() {
        if (vibrator?.hasVibrator() == true) {
            val effect = VibrationEffect.createPredefined(VibrationEffect.EFFECT_HEAVY_CLICK)
            vibrator.cancel()
            vibrator.vibrate(effect)
        }
    }

    /**
     * Warning feedback (100ms + 50ms pause + 100ms)
     * Used for warnings, confirmations
     */
    fun warningFeedback() {
        if (vibrator?.hasVibrator() == true) {
            try {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    // Use pattern timing without explicit amplitudes
                    val timings = longArrayOf(0, 100, 50, 100)
                    val effect = VibrationEffect.createWaveform(timings, -1)  // -1 = default amplitude
                    vibrator?.cancel()
                    vibrator?.vibrate(effect)
                } else {
                    // Fallback for older API levels
                    @Suppress("DEPRECATION")
                    vibrator?.vibrate(250)
                }
            } catch (e: Exception) {
                // Fallback to simple vibration if waveform not supported
                heavyClickFeedback()
            }
        }
    }

    /**
     * Heavy click feedback (heavy haptic engine rumble)
     * Used for important interactions, confirmations
     */
    fun heavyClickFeedback() {
        if (vibrator?.hasVibrator() == true) {
            val effect = VibrationEffect.createPredefined(VibrationEffect.EFFECT_HEAVY_CLICK)
            vibrator.cancel()
            vibrator.vibrate(effect)
        }
    }

    /**
     * Custom pattern feedback
     * timings: array of timing in milliseconds
     */
    fun customFeedback(timings: LongArray) {
        if (vibrator?.hasVibrator() == true && timings.isNotEmpty()) {
            try {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    val effect = VibrationEffect.createWaveform(timings, -1)  // -1 = default amplitude
                    vibrator?.cancel()
                    vibrator?.vibrate(effect)
                } else {
                    // Fallback for older API levels - just use first timing value
                    @Suppress("DEPRECATION")
                    vibrator?.vibrate(timings[0])
                }
            } catch (e: Exception) {
                // Fallback if custom pattern not supported
                tapFeedback()
            }
        }
    }

    fun cancel() {
        vibrator?.cancel()
    }
}

// Global haptic feedback instance (lazy initialization)
private var hapticFeedbackInstance: HapticFeedbackManager? = null

fun Context.getHapticFeedbackManager(): HapticFeedbackManager {
    if (hapticFeedbackInstance == null) {
        hapticFeedbackInstance = HapticFeedbackManager(this)
    }
    return hapticFeedbackInstance!!
}
