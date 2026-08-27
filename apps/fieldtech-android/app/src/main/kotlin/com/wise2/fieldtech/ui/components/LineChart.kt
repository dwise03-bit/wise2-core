package com.wise2.fieldtech.ui.components

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.sp
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.wise2.fieldtech.ui.theme.ElectricBlue

@Composable
fun LineChart(
    dataPoints: List<Float>,
    label: String = "",
    unit: String = "",
    modifier: Modifier = Modifier,
    color: Color = ElectricBlue,
) {
    if (dataPoints.isEmpty()) return

    val min = dataPoints.minOrNull() ?: 0f
    val max = dataPoints.maxOrNull() ?: 100f
    val range = if (max > min) max - min else 1f

    Column(modifier = modifier.fillMaxWidth().padding(8.dp)) {
        if (label.isNotEmpty()) {
            Text(
                label,
                style = MaterialTheme.typography.labelMedium,
                fontWeight = FontWeight.SemiBold,
                fontSize = 13.sp,
            )
            Spacer(Modifier.height(8.dp))
        }

        Canvas(modifier = Modifier.fillMaxWidth().height(120.dp)) {
            val width = size.width
            val height = size.height
            val padding = 30f

            drawRect(Color(0xFF1a1a1a), size = size)
            drawRect(Color.DarkGray, size = size, alpha = 0.2f)

            val graphWidth = width - 2 * padding
            val graphHeight = height - 2 * padding

            for (i in 0 until dataPoints.size - 1) {
                val x1 = padding + (i * graphWidth) / (dataPoints.size - 1).coerceAtLeast(1).toFloat()
                val y1 = padding + graphHeight * (1f - (dataPoints[i] - min) / range)

                val x2 = padding + ((i + 1) * graphWidth) / (dataPoints.size - 1).coerceAtLeast(1).toFloat()
                val y2 = padding + graphHeight * (1f - (dataPoints[i + 1] - min) / range)

                drawLine(color, Offset(x1, y1), Offset(x2, y2), strokeWidth = 3f, cap = StrokeCap.Round)
                drawCircle(color, 4f, Offset(x1, y1))
            }

            if (dataPoints.isNotEmpty()) {
                val lastIdx = dataPoints.size - 1
                val x = padding + (lastIdx * graphWidth) / (dataPoints.size - 1).coerceAtLeast(1).toFloat()
                val y = padding + graphHeight * (1f - (dataPoints[lastIdx] - min) / range)
                drawCircle(Color(0xFF4FC3F7), 6f, Offset(x, y))
            }
        }

        Spacer(Modifier.height(6.dp))
        Text(
            "Range: %.1f – %.1f %s".format(min, max, unit),
            style = MaterialTheme.typography.labelSmall,
            color = Color.Gray,
            fontSize = 10.sp,
        )
    }
}
