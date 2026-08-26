package com.wise2.fieldtech.ui.util

import androidx.compose.foundation.clickable
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import kotlinx.coroutines.Job
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

/**
 * Debounce helper for click handlers to prevent multiple rapid taps
 * Minimum delay: 500ms between consecutive clicks
 */
class ClickDebouncer(private val debounceMillis: Long = 500L) {
    private var lastClickTime = 0L
    private var clickJob: Job? = null

    fun isClickAllowed(): Boolean {
        val now = System.currentTimeMillis()
        return if (now - lastClickTime >= debounceMillis) {
            lastClickTime = now
            true
        } else {
            false
        }
    }

    fun onClicked(): Boolean = isClickAllowed()

    fun reset() {
        lastClickTime = 0L
    }
}

/**
 * Composable debounced click handler
 * Returns a click function that ignores rapid successive clicks
 */
@Composable
fun rememberClickDebouncer(debounceMillis: Long = 500L): (callback: () -> Unit) -> Unit {
    val debouncer = remember { ClickDebouncer(debounceMillis) }
    return remember(debouncer) {
        { callback: () -> Unit ->
            if (debouncer.onClicked()) {
                callback()
            }
        }
    }
}

/**
 * Extension for clickable modifier to add debounce behavior
 * Usage: modifier.debouncedClickable { onClicked() }
 */
@Composable
fun Modifier.debouncedClickable(
    debounceMillis: Long = 500L,
    enabled: Boolean = true,
    onClick: () -> Unit,
): Modifier {
    val debouncer = remember { ClickDebouncer(debounceMillis) }
    return this.then(
        clickable(
            enabled = enabled,
            onClick = {
                if (debouncer.onClicked()) {
                    onClick()
                }
            },
        ),
    )
}
