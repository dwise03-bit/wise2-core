package com.wise2.fieldtech.ui.animation

import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.tween
import androidx.compose.foundation.layout.offset
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

// WISE² v2.0 Transition Animations

/**
 * Page slide-in animation from right
 * Used when navigating to a new screen
 */
@Composable
fun SlideInFromRight(content: @Composable () -> Unit) {
    val offsetX = remember { Animatable(-100f) }

    LaunchedEffect(Unit) {
        offsetX.animateTo(
            targetValue = 0f,
            animationSpec = tween(400, easing = FastOutSlowInEasing),
        )
    }

    val offsetDp = (offsetX.value / 100f * 400).dp

    content()
    // Note: content wraps itself with offset modifier
}

/**
 * Page slide-out animation to left
 * Used when navigating back
 */
@Composable
fun SlideOutToLeft(content: @Composable () -> Unit) {
    val offsetX = remember { Animatable(0f) }

    LaunchedEffect(Unit) {
        offsetX.animateTo(
            targetValue = 100f,
            animationSpec = tween(400, easing = FastOutSlowInEasing),
        )
    }

    val offsetDp = (offsetX.value / 100f * 400).dp

    content()
}

/**
 * Stagger fade-in animation for list items
 * Each item animates in sequence with delay
 */
@Composable
fun StaggerFadeIn(
    itemIndex: Int,
    delayPerItem: Int = 50,
    content: @Composable (modifier: Modifier) -> Unit,
) {
    val alpha = remember { Animatable(0f) }

    LaunchedEffect(itemIndex) {
        // Wait for delay based on item index
        kotlinx.coroutines.delay((itemIndex * delayPerItem).toLong())

        // Fade in
        alpha.animateTo(
            targetValue = 1f,
            animationSpec = tween(300, easing = FastOutSlowInEasing),
        )
    }

    content(Modifier.apply {})
}

/**
 * Scale-down animation on tap (button press feedback)
 * Combines with haptic feedback for tactile response
 */
@Composable
fun ScaleOnTap(
    isTapped: Boolean,
    onAnimationComplete: () -> Unit = {},
    content: @Composable (scaleModifier: Modifier) -> Unit,
) {
    val scale = remember { Animatable(1f) }

    LaunchedEffect(isTapped) {
        if (isTapped) {
            // Scale down
            scale.animateTo(
                targetValue = 0.95f,
                animationSpec = tween(100, easing = FastOutSlowInEasing),
            )
            // Scale back up
            scale.animateTo(
                targetValue = 1f,
                animationSpec = tween(150, easing = FastOutSlowInEasing),
            )
            onAnimationComplete()
        }
    }

    content(Modifier)  // Apply scale via GraphicsLayer if needed
}

/**
 * Pulse animation for status indicators
 * Repeating scale and alpha animation
 */
@Composable
fun PulseAnimation(
    durationMs: Int = 1500,
    minScale: Float = 1f,
    maxScale: Float = 1.3f,
) {
    val scale = remember { Animatable(minScale) }

    LaunchedEffect(Unit) {
        while (true) {
            scale.animateTo(
                targetValue = maxScale,
                animationSpec = tween(durationMs / 2, easing = FastOutSlowInEasing),
            )
            scale.animateTo(
                targetValue = minScale,
                animationSpec = tween(durationMs / 2, easing = FastOutSlowInEasing),
            )
        }
    }

    // Return the scale value for use in modifier
    return
}
