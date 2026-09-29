package com.wise2.fieldtech.ui.components

import androidx.compose.animation.animateColorAsState
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

private val CarbonBlack = Color(0xFF0A0E27)
private val GunmetalDark = Color(0xFF1a2332)
private val GunmetalLight = Color(0xFF2d3748)
private val ElectricBlue = Color(0xFF00D9FF)
private val OrangeWarmth = Color(0xFFFF6B35)
private val OrangeHeat = Color(0xFFFF4500)
private val NeonGreen = Color(0xFF00FF41)
private val MetallicSilver = Color(0xFFC0C0C0)

data class DiagnosticMetric(
  val name: String,
  val value: Float,
  val unit: String,
  val min: Float,
  val max: Float,
  val optimal: Float,
)

@Composable
fun DiagnosticDashboard(
  metrics: List<DiagnosticMetric>,
  diagnosis: String? = null,
  severity: DiagnosticSeverity = DiagnosticSeverity.OK,
) {
  Column(
    modifier = Modifier
      .fillMaxWidth()
      .background(CarbonBlack)
      .padding(12.dp),
    verticalArrangement = Arrangement.spacedBy(12.dp),
  ) {
    // Status banner
    if (diagnosis != null) {
      DiagnosticBanner(severity = severity, diagnosis = diagnosis)
    }

    // Metrics cards
    LazyRow(
      modifier = Modifier.fillMaxWidth(),
      horizontalArrangement = Arrangement.spacedBy(8.dp),
      contentPadding = PaddingValues(horizontal = 4.dp),
    ) {
      items(metrics) { metric ->
        MetricCard(metric = metric)
      }
    }
  }
}

@Composable
fun DiagnosticBanner(
  severity: DiagnosticSeverity,
  diagnosis: String,
) {
  val backgroundColor by animateColorAsState(
    targetValue = when (severity) {
      DiagnosticSeverity.OK -> NeonGreen.copy(alpha = 0.1f)
      DiagnosticSeverity.WARNING -> OrangeWarmth.copy(alpha = 0.1f)
      DiagnosticSeverity.CRITICAL -> OrangeHeat.copy(alpha = 0.1f)
    }
  )

  val borderColor by animateColorAsState(
    targetValue = when (severity) {
      DiagnosticSeverity.OK -> NeonGreen
      DiagnosticSeverity.WARNING -> OrangeWarmth
      DiagnosticSeverity.CRITICAL -> OrangeHeat
    }
  )

  Surface(
    modifier = Modifier
      .fillMaxWidth()
      .clip(RoundedCornerShape(8.dp)),
    color = backgroundColor,
    tonalElevation = 0.dp,
  ) {
    Row(
      modifier = Modifier
        .fillMaxWidth()
        .padding(12.dp),
      horizontalArrangement = Arrangement.spacedBy(12.dp),
      verticalAlignment = Alignment.Top,
    ) {
      // Status icon
      Surface(
        modifier = Modifier
          .size(40.dp)
          .clip(CircleShape),
        color = borderColor,
      ) {
        Box(
          contentAlignment = Alignment.Center,
          modifier = Modifier.fillMaxSize(),
        ) {
          Icon(
            when (severity) {
              DiagnosticSeverity.OK -> Icons.Filled.CheckCircle
              DiagnosticSeverity.WARNING -> Icons.Filled.Warning
              DiagnosticSeverity.CRITICAL -> Icons.Filled.Error
            },
            contentDescription = severity.name,
            tint = CarbonBlack,
            modifier = Modifier.size(24.dp),
          )
        }
      }

      // Diagnosis text
      Column(modifier = Modifier.weight(1f)) {
        Text(
          when (severity) {
            DiagnosticSeverity.OK -> "UNIT OPERATING NORMALLY"
            DiagnosticSeverity.WARNING -> "ATTENTION REQUIRED"
            DiagnosticSeverity.CRITICAL -> "CRITICAL ISSUE"
          },
          fontSize = 11.sp,
          fontWeight = FontWeight.Bold,
          color = borderColor,
        )
        Text(
          diagnosis,
          fontSize = 10.sp,
          color = Color.White,
          lineHeight = 14.sp,
        )
      }
    }
  }
}

@Composable
fun MetricCard(metric: DiagnosticMetric) {
  val status = when {
    metric.value < metric.min -> DiagnosticSeverity.CRITICAL
    metric.value > metric.max -> DiagnosticSeverity.CRITICAL
    Math.abs(metric.value - metric.optimal) > (metric.max - metric.min) * 0.2f -> DiagnosticSeverity.WARNING
    else -> DiagnosticSeverity.OK
  }

  val statusColor = when (status) {
    DiagnosticSeverity.OK -> NeonGreen
    DiagnosticSeverity.WARNING -> OrangeWarmth
    DiagnosticSeverity.CRITICAL -> OrangeHeat
  }

  Surface(
    modifier = Modifier
      .width(120.dp)
      .clip(RoundedCornerShape(8.dp)),
    color = GunmetalLight,
  ) {
    Column(
      modifier = Modifier
        .fillMaxWidth()
        .padding(12.dp),
      horizontalAlignment = Alignment.CenterHorizontally,
      verticalArrangement = Arrangement.spacedBy(8.dp),
    ) {
      // Circular gauge
      Box(
        modifier = Modifier
          .size(80.dp)
          .clip(CircleShape)
          .background(GunmetalDark),
        contentAlignment = Alignment.Center,
      ) {
        CircularGaugeIndicator(
          value = metric.value,
          min = metric.min,
          max = metric.max,
          color = statusColor,
        )
      }

      // Value and unit
      Text(
        "${String.format("%.1f", metric.value)} ${metric.unit}",
        fontSize = 12.sp,
        fontWeight = FontWeight.Bold,
        color = statusColor,
        textAlign = TextAlign.Center,
      )

      // Metric name
      Text(
        metric.name,
        fontSize = 9.sp,
        color = Color.Gray,
        textAlign = TextAlign.Center,
      )
    }
  }
}

@Composable
fun CircularGaugeIndicator(
  value: Float,
  min: Float,
  max: Float,
  color: Color,
) {
  Box(
    modifier = Modifier.fillMaxSize(),
    contentAlignment = Alignment.Center,
  ) {
    // Outer ring (background)
    Surface(
      modifier = Modifier
        .size(70.dp)
        .clip(CircleShape),
      color = GunmetalDark,
    ) {}

    // Percentage text
    Text(
      "${Math.round(((value - min) / (max - min)) * 100)}%",
      fontSize = 18.sp,
      fontWeight = FontWeight.Bold,
      color = color,
    )
  }
}

@Composable
fun StatusIndicatorBar(
  items: List<StatusItem>,
) {
  Row(
    modifier = Modifier
      .fillMaxWidth()
      .background(GunmetalDark, RoundedCornerShape(8.dp))
      .padding(8.dp),
    horizontalArrangement = Arrangement.spacedBy(12.dp),
    verticalAlignment = Alignment.CenterVertically,
  ) {
    items.forEach { item ->
      Box(modifier = Modifier.weight(1f)) {
        StatusIndicatorItem(item = item)
      }
    }
  }
}

data class StatusItem(
  val label: String,
  val icon: ImageVector,
  val status: StatusEnum,
)

enum class StatusEnum {
  OK, WARNING, ERROR, IDLE
}

@Composable
fun StatusIndicatorItem(item: StatusItem) {
  Column(
    horizontalAlignment = Alignment.CenterHorizontally,
    modifier = Modifier.fillMaxWidth(),
  ) {
    Surface(
      modifier = Modifier
        .size(32.dp)
        .clip(CircleShape),
      color = when (item.status) {
        StatusEnum.OK -> NeonGreen.copy(alpha = 0.2f)
        StatusEnum.WARNING -> OrangeWarmth.copy(alpha = 0.2f)
        StatusEnum.ERROR -> OrangeHeat.copy(alpha = 0.2f)
        StatusEnum.IDLE -> GunmetalLight
      },
    ) {
      Box(
        contentAlignment = Alignment.Center,
        modifier = Modifier.fillMaxSize(),
      ) {
        Icon(
          item.icon,
          contentDescription = item.label,
          tint = when (item.status) {
            StatusEnum.OK -> NeonGreen
            StatusEnum.WARNING -> OrangeWarmth
            StatusEnum.ERROR -> OrangeHeat
            StatusEnum.IDLE -> MetallicSilver
          },
          modifier = Modifier.size(18.dp),
        )
      }
    }

    Spacer(modifier = Modifier.height(4.dp))

    Text(
      item.label,
      fontSize = 8.sp,
      color = Color.Gray,
      textAlign = TextAlign.Center,
    )
  }
}

enum class DiagnosticSeverity {
  OK, WARNING, CRITICAL
}
