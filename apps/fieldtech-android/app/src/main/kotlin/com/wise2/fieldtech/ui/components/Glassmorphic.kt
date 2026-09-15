package com.wise2.fieldtech.ui.components

import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.ripple.rememberRipple
import androidx.compose.material3.BorderStroke
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp

// WISE² v2.0 Glassmorphic Design Components
// Glass effect, glow, and status indicators

enum class StatusType {
    ACTIVE,   // Neon green
    IDLE,     // Cyan
    ERROR,    // Red
    OFFLINE,  // Gray
}

/**
 * Glassmorphic surface component
 */
@Composable
fun GlassmorphicSurface(
    modifier: Modifier = Modifier,
    glassColor: Color = Color(0xFF1A1D2E).copy(alpha = 0.25f),
    cornerRadius: Dp = 16.dp,
    borderColor: Color = Color(0xFF00D9FF).copy(alpha = 0.15f),
    borderWidth: Dp = 1.dp,
    elevation: Dp = 8.dp,
    onClick: (() -> Unit)? = null,
    content: @Composable () -> Unit,
) {
    Surface(
        modifier = modifier
            .shadow(elevation, RoundedCornerShape(cornerRadius), Color(0xFF00D9FF).copy(alpha = 0.1f), Color(0xFF00D9FF).copy(alpha = 0.15f))
            .then(
                if (onClick != null) {
                    Modifier.clickable(
                        interactionSource = remember { MutableInteractionSource() },
                        indication = rememberRipple(color = Color(0xFF00D9FF)),
                        onClick = onClick
                    )
                } else {
                    Modifier
                }
            ),
        shape = RoundedCornerShape(cornerRadius),
        color = glassColor,
        border = BorderStroke(borderWidth, borderColor),
    ) {
        Box(modifier = Modifier.fillMaxSize()) {
            content()
        }
    }
}

/**
 * Animated status indicator
 */
@Composable
fun AnimatedStatusIndicator(
    modifier: Modifier = Modifier,
    status: StatusType = StatusType.ACTIVE,
    size: Dp = 12.dp,
    pulseEnabled: Boolean = true,
) {
    val infiniteTransition = rememberInfiniteTransition(label = "status_pulse")

    val pulseScale = infiniteTransition.animateFloat(
        initialValue = 1f,
        targetValue = 1.4f,
        animationSpec = infiniteRepeatable(
            animation = tween(1200, easing = FastOutSlowInEasing),
            androidx.compose.animation.core.RepeatMode.Reverse,
        ),
        label = "pulse_scale"
    )

    val (color, glowColor) = when (status) {
        StatusType.ACTIVE -> Color(0xFF00FF7F) to Color(0xFF00FF7F)     // Neon green
        StatusType.IDLE -> Color(0xFF00D9FF) to Color(0xFF00D9FF)       // Cyan
        StatusType.ERROR -> Color(0xFFFF4D4F) to Color(0xFFFF4D4F)      // Red
        StatusType.OFFLINE -> Color(0xFFAAAAAA) to Color(0xFFAAAAAA)   // Gray
    }

    Box(
        modifier = modifier
            .then(
                if (pulseEnabled) {
                    Modifier.shadow(
                        size * 2,
                        RoundedCornerShape(size / 2),
                        glowColor.copy(alpha = 0.4f),
                        glowColor.copy(alpha = 0.6f),
                    )
                } else {
                    Modifier
                }
            )
    ) {
        Surface(
            modifier = Modifier
                .background(color),
            shape = RoundedCornerShape(size / 2),
            color = color,
        ) {}
    }
}

/**
 * Glow effect wrapper
 */
@Composable
fun GlowEffect(
    modifier: Modifier = Modifier,
    glowColor: Color = Color(0xFF00D9FF),
    glowRadius: Dp = 12.dp,
    animationDuration: Int = 1500,
    isActive: Boolean = true,
    content: @Composable () -> Unit,
) {
    val infiniteTransition = rememberInfiniteTransition(label = "glow_animation")

    val glowAlpha = infiniteTransition.animateFloat(
        initialValue = 0.2f,
        targetValue = 0.6f,
        animationSpec = infiniteRepeatable(
            animation = tween(animationDuration, easing = FastOutSlowInEasing),
            androidx.compose.animation.core.RepeatMode.Reverse,
        ),
        label = "glow_alpha"
    )

    Box(
        modifier = modifier
            .then(
                if (isActive) {
                    Modifier.shadow(
                        glowRadius,
                        RoundedCornerShape(12.dp),
                        glowColor.copy(alpha = glowAlpha.value),
                        glowColor.copy(alpha = glowAlpha.value * 1.2f),
                    )
                } else {
                    Modifier
                }
            )
    ) {
        content()
    }
}
