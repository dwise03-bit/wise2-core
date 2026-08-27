package com.wise2.fieldtech.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

private val CarbonBlack = Color(0xFF0A0E27)
private val GunmetalDark = Color(0xFF1a2332)
private val GunmetalLight = Color(0xFF2d3748)
private val ElectricBlue = Color(0xFF00D9FF)
private val OrangeWarmth = Color(0xFFFF6B35)
private val NeonGreen = Color(0xFF00FF41)

@Composable
fun WaveformVisualizer(
  amplitude: Float = 0.5f,
  isActive: Boolean = false,
  modifier: Modifier = Modifier,
) {
  Surface(
    modifier = modifier
      .height(60.dp)
      .fillMaxWidth()
      .clip(RoundedCornerShape(8.dp)),
    color = GunmetalLight,
  ) {
    Row(
      modifier = Modifier
        .fillMaxSize()
        .padding(8.dp),
      horizontalArrangement = Arrangement.spacedBy(2.dp),
      verticalAlignment = Alignment.CenterVertically,
    ) {
      repeat(20) { index ->
        val waveHeight = if (isActive) {
          (Math.sin(index * 0.3 + System.currentTimeMillis() / 100.0).toFloat() + 1) / 2
        } else {
          0.2f
        }

        Box(
          modifier = Modifier
            .width(2.dp)
            .fillMaxHeight(waveHeight * 0.8f + 0.2f)
            .clip(RoundedCornerShape(1.dp))
            .background(if (isActive) NeonGreen else Color.Gray)
        )
      }
    }
  }
}

@Composable
fun DataVisualizationCard(
  title: String,
  value: String,
  unit: String,
  trend: Float? = null,
  modifier: Modifier = Modifier,
) {
  Surface(
    modifier = modifier
      .clip(RoundedCornerShape(12.dp))
      .background(GunmetalLight),
    color = GunmetalLight,
  ) {
    Column(
      modifier = Modifier
        .fillMaxWidth()
        .padding(16.dp),
      verticalArrangement = Arrangement.spacedBy(8.dp),
    ) {
      // Title
      Text(
        title,
        fontSize = 10.sp,
        color = Color.Gray,
        fontWeight = FontWeight.Bold,
      )

      // Value with trend
      Row(
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(4.dp),
      ) {
        Text(
          value,
          fontSize = 24.sp,
          fontWeight = FontWeight.Bold,
          color = ElectricBlue,
        )
        Text(
          unit,
          fontSize = 12.sp,
          color = Color.Gray,
        )

        if (trend != null) {
          Text(
            "${if (trend > 0) "↑" else "↓"} ${String.format("%.1f", Math.abs(trend))}",
            fontSize = 10.sp,
            color = if (trend > 0) OrangeWarmth else NeonGreen,
            fontWeight = FontWeight.Bold,
          )
        }
      }
    }
  }
}

@Composable
fun ProgressRingIndicator(
  progress: Float,
  size: Int = 100,
  backgroundColor: Color = GunmetalLight,
  progressColor: Color = ElectricBlue,
  label: String? = null,
) {
  Box(
    contentAlignment = Alignment.Center,
    modifier = Modifier.size(size.dp),
  ) {
    // Background ring
    Surface(
      modifier = Modifier.fillMaxSize(),
      color = backgroundColor,
      shape = RoundedCornerShape(50),
    ) {}

    // Progress indicator
    Box(
      modifier = Modifier
        .size((size * 0.8).dp)
        .clip(RoundedCornerShape(50))
        .background(progressColor.copy(alpha = 0.3f))
    )

    // Center content
    if (label != null) {
      Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
      ) {
        Text(
          "${(progress * 100).toInt()}%",
          fontSize = 20.sp,
          fontWeight = FontWeight.Bold,
          color = progressColor,
        )
        Text(
          label,
          fontSize = 8.sp,
          color = Color.Gray,
        )
      }
    }
  }
}

@Composable
fun ReadingGauge(
  title: String,
  currentValue: Float,
  minValue: Float,
  maxValue: Float,
  unit: String,
  modifier: Modifier = Modifier,
) {
  val normalizedValue = (currentValue - minValue) / (maxValue - minValue)
  val gaugeColor = when {
    normalizedValue < 0.3f -> NeonGreen
    normalizedValue < 0.7f -> ElectricBlue
    normalizedValue < 0.9f -> OrangeWarmth
    else -> Color(0xFFFF0000)
  }

  Column(
    modifier = modifier
      .clip(RoundedCornerShape(12.dp))
      .background(GunmetalDark)
      .padding(12.dp),
    verticalArrangement = Arrangement.spacedBy(8.dp),
    horizontalAlignment = Alignment.CenterHorizontally,
  ) {
    Text(
      title,
      fontSize = 10.sp,
      color = Color.Gray,
      fontWeight = FontWeight.Bold,
    )

    // Gauge bar
    Box(
      modifier = Modifier
        .fillMaxWidth()
        .height(12.dp)
        .clip(RoundedCornerShape(6.dp))
        .background(GunmetalLight)
    ) {
      Box(
        modifier = Modifier
          .fillMaxHeight()
          .fillMaxWidth(normalizedValue.coerceIn(0f, 1f))
          .clip(RoundedCornerShape(6.dp))
          .background(gaugeColor)
      )
    }

    // Value display
    Row(
      modifier = Modifier.fillMaxWidth(),
      horizontalArrangement = Arrangement.SpaceBetween,
    ) {
      Text(
        "${String.format("%.1f", currentValue)} $unit",
        fontSize = 12.sp,
        fontWeight = FontWeight.Bold,
        color = gaugeColor,
      )
      Text(
        "Min: ${String.format("%.1f", minValue)} Max: ${String.format("%.1f", maxValue)}",
        fontSize = 8.sp,
        color = Color.Gray,
      )
    }
  }
}

@Composable
fun PulseIndicator(
  isActive: Boolean = false,
  size: Int = 20,
  color: Color = NeonGreen,
) {
  Box(
    modifier = Modifier.size(size.dp),
    contentAlignment = Alignment.Center,
  ) {
    if (isActive) {
      repeat(3) { index ->
        Box(
          modifier = Modifier
            .size(size.dp)
            .clip(RoundedCornerShape(50))
            .background(color.copy(alpha = 0.2f - (index * 0.06f)))
        )
      }
    }

    Box(
      modifier = Modifier
        .size((size * 0.6).dp)
        .clip(RoundedCornerShape(50))
        .background(color)
    )
  }
}
