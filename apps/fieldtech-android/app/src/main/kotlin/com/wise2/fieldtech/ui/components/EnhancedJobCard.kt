package com.wise2.fieldtech.ui.components

import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.AnimationSpec
import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Error
import androidx.compose.material.icons.filled.Schedule
import androidx.compose.material3.Icon
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.wise2.fieldtech.domain.model.Job
import java.text.SimpleDateFormat
import java.util.Locale

// WISE² v2.0 Enhanced Job Card
// Glassmorphic design with tap animation, glow effect, and status indication

@Composable
fun EnhancedJobCard(
    job: Job,
    isHighlighted: Boolean = false,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
) {
    var isTapped by remember { mutableStateOf(false) }

    val (statusColor, statusIcon, statusLabel) = when (job.status.name) {
        "PENDING" -> Triple(
            Color(0xFF00D9FF),  // Cyan
            Icons.Filled.Schedule,
            "Pending"
        )

        "IN_PROGRESS" -> Triple(
            Color(0xFF00FF7F),  // Neon green
            Icons.Filled.CheckCircle,
            "In Progress"
        )

        "COMPLETE" -> Triple(
            Color(0xFFC4A369),  // Gold
            Icons.Filled.CheckCircle,
            "Complete"
        )

        else -> Triple(
            Color(0xFFFF4D4F),  // Red
            Icons.Filled.Error,
            "Error"
        )
    }

    val backgroundColor by animateColorAsState(
        targetValue = if (isHighlighted || isTapped) {
            Color(0xFF1A1D2E).copy(alpha = 0.4f)  // Brighter glass when highlighted
        } else {
            Color(0xFF1A1D2E).copy(alpha = 0.2f)  // Default glass
        },
        animationSpec = tween<Color>(200),
        label = "card_bg_color"
    )

    val borderColor by animateColorAsState(
        targetValue = if (isHighlighted) statusColor.copy(alpha = 0.5f) else statusColor.copy(alpha = 0.15f),
        animationSpec = tween<Color>(200),
        label = "card_border_color"
    )

    val glowAlpha by animateColorAsState(
        targetValue = if (isHighlighted) statusColor.copy(alpha = 0.3f) else statusColor.copy(alpha = 0.1f),
        animationSpec = tween<Color>(200),
        label = "card_glow_alpha"
    )

    GlassmorphicSurface(
        modifier = modifier
            .fillMaxWidth()
            .clickable(
                interactionSource = remember { MutableInteractionSource() },
                indication = null,
            ) {
                isTapped = true
                onClick()
                isTapped = false
            }
            .then(
                if (isHighlighted) {
                    Modifier.shadow(
                        elevation = 12.dp,
                        shape = RoundedCornerShape(16.dp),
                        ambientColor = statusColor.copy(alpha = 0.2f),
                        spotColor = statusColor.copy(alpha = 0.3f),
                    )
                } else {
                    Modifier
                }
            ),
        glassColor = backgroundColor,
        cornerRadius = 16.dp,
        borderColor = borderColor,
        borderWidth = 1.5.dp,
        elevation = if (isHighlighted) 12.dp else 4.dp,
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            // Header: Customer name + status badge
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Column(
                    verticalArrangement = Arrangement.spacedBy(4.dp),
                ) {
                    Text(
                        job.customerName,
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFFF5F5F5),
                    )

                    Text(
                        job.address,
                        fontSize = 12.sp,
                        color = Color(0xFFAAAAAA),
                    )
                }

                // Status badge with icon
                Surface(
                    modifier = Modifier
                        .clip(RoundedCornerShape(8.dp)),
                    color = statusColor.copy(alpha = 0.15f),
                    shadowElevation = 4.dp,
                ) {
                    Row(
                        modifier = Modifier.padding(8.dp),
                        horizontalArrangement = Arrangement.spacedBy(6.dp),
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        Icon(
                            statusIcon,
                            contentDescription = statusLabel,
                            tint = statusColor,
                            modifier = Modifier.size(14.dp),
                        )

                        Text(
                            statusLabel,
                            fontSize = 10.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = statusColor,
                        )
                    }
                }
            }

            // Job details
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Column(
                    verticalArrangement = Arrangement.spacedBy(4.dp),
                ) {
                    DetailRow(
                        label = "Phone",
                        value = job.customerPhone.ifEmpty { "—" },
                    )

                    DetailRow(
                        label = "Complaint",
                        value = job.complaint.ifEmpty { "No description" },
                    )
                }
            }

            // Footer: Appointment time + action indicator
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Text(
                    formatAppointmentTime(job.appointmentAtEpochMillis),
                    fontSize = 11.sp,
                    color = Color(0xFFAAAAAA),
                    fontWeight = FontWeight.Medium,
                )

                // Tap indicator (arrow glow)
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(6.dp))
                        .background(
                            if (isTapped || isHighlighted) {
                                statusColor.copy(alpha = 0.2f)
                            } else {
                                Color.Transparent
                            }
                        )
                        .padding(6.dp),
                ) {
                    Text(
                        "→",
                        fontSize = 14.sp,
                        color = statusColor,
                        fontWeight = FontWeight.Bold,
                    )
                }
            }
        }
    }
}

@Composable
private fun DetailRow(label: String, value: String) {
    Row(
        horizontalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        Text(
            label,
            fontSize = 11.sp,
            color = Color(0xFFAAAAAA),
            modifier = Modifier.weight(0.4f),
        )

        Text(
            value,
            fontSize = 11.sp,
            color = Color(0xFFF5F5F5),
            modifier = Modifier.weight(0.6f),
        )
    }
}

private fun formatAppointmentTime(epochMillis: Long): String {
    val date = java.util.Date(epochMillis)
    val format = java.text.SimpleDateFormat("MMM dd, HH:mm", java.util.Locale.getDefault())
    return format.format(date)
}

/**
 * Compact job card for list view
 */
@Composable
fun CompactJobCard(
    job: Job,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val statusColor = when (job.status.name) {
        "PENDING" -> Color(0xFF00D9FF)
        "IN_PROGRESS" -> Color(0xFF00FF7F)
        "COMPLETE" -> Color(0xFFC4A369)
        else -> Color(0xFFFF4D4F)
    }

    GlassmorphicSurface(
        modifier = modifier.clickable(
            interactionSource = remember { MutableInteractionSource() },
            indication = null,
            onClick = onClick,
        ),
        glassColor = Color(0xFF1A1D2E).copy(alpha = 0.2f),
        cornerRadius = 12.dp,
        borderColor = statusColor.copy(alpha = 0.15f),
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Column(
                modifier = Modifier.weight(1f),
                verticalArrangement = Arrangement.spacedBy(4.dp),
            ) {
                Text(
                    job.customerName,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFFF5F5F5),
                )

                Text(
                    job.address,
                    fontSize = 10.sp,
                    color = Color(0xFFAAAAAA),
                )
            }

            // Status indicator
            Box(
                modifier = Modifier
                    .clip(RoundedCornerShape(6.dp))
                    .background(statusColor.copy(alpha = 0.2f))
                    .padding(6.dp),
            ) {
                AnimatedStatusIndicator(status = when (job.status.name) {
                    "PENDING" -> StatusType.IDLE
                    "IN_PROGRESS" -> StatusType.ACTIVE
                    "COMPLETE" -> StatusType.IDLE
                    else -> StatusType.ERROR
                }, size = 8.dp)
            }
        }
    }
}
