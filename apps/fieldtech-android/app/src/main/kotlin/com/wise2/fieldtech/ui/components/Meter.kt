package com.wise2.fieldtech.ui.components

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.size
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.graphics.drawscope.rotate
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.wise2.fieldtech.ui.theme.ElectricBlue
import kotlin.math.cos
import kotlin.math.sin

@Composable
fun Meter(
    value: Float,
    min: Float = 0f,
    max: Float = 100f,
    unit: String = "",
    label: String = "",
    modifier: Modifier = Modifier,
    color: Color = ElectricBlue,
    warningThreshold: Float? = null,
    criticalThreshold: Float? = null,
) {
    val percentage = ((value - min) / (max - min)).coerceIn(0f, 1f)
    val meterColor = when {
        criticalThreshold != null && value > criticalThreshold -> Color(0xFFFF5252)
        warningThreshold != null && value > warningThreshold -> Color(0xFFFFC107)
        else -> color
    }

    Column(
        modifier = modifier,
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
    ) {
        Canvas(modifier = Modifier.size(180.dp)) {
            val center = Offset(size.width / 2, size.height / 2)
            val radius = size.width / 2.5f

            drawCircle(color = Color.DarkGray, radius = radius, center = center)
            drawCircle(color = Color(0xFF1a1a1a), radius = radius * 0.95f, center = center)

            val arcStart = 135f
            val arcSweep = 270f
            val rotation = arcStart + (arcSweep * percentage)

            for (i in 0..27) {
                val angle = arcStart + (arcSweep * i / 27)
                val rad = Math.toRadians(angle.toDouble()).toFloat()
                val x1 = center.x + radius * 0.85f * kotlin.math.cos(rad)
                val y1 = center.y + radius * 0.85f * kotlin.math.sin(rad)
                val x2 = center.x + radius * 0.95f * kotlin.math.cos(rad)
                val y2 = center.y + radius * 0.95f * kotlin.math.sin(rad)

                val tickColor = if (i % 9 == 0) ElectricBlue else Color.Gray
                drawLine(tickColor, Offset(x1, y1), Offset(x2, y2), strokeWidth = 2f)
            }

            val needleRad = Math.toRadians(rotation.toDouble()).toFloat()
            val needleEnd = Offset(
                center.x + radius * 0.75f * kotlin.math.cos(needleRad),
                center.y + radius * 0.75f * kotlin.math.sin(needleRad),
            )
            drawLine(meterColor, center, needleEnd, strokeWidth = 4f)
            drawCircle(meterColor, radius = 8f, center = center)
        }

        Spacer(Modifier.height(16.dp))
        Text(
            "%.1f %s".format(value, unit),
            style = MaterialTheme.typography.headlineMedium,
            fontWeight = FontWeight.Bold,
            color = meterColor,
        )
        if (label.isNotEmpty()) {
            Text(label, style = MaterialTheme.typography.labelSmall, color = Color.Gray)
        }
    }
}
