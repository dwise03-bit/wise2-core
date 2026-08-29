package com.wise2.fieldtech.ui.components

import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

// Premium gradients
val ElectricBlueGradient = Brush.linearGradient(
  colors = listOf(Color(0xFF00D9FF), Color(0xFF0099CC))
)

val NeonGreenGradient = Brush.linearGradient(
  colors = listOf(Color(0xFF00FF41), Color(0xFF00CC33))
)

val OrangeGradient = Brush.linearGradient(
  colors = listOf(Color(0xFFFF6B35), Color(0xFFCC5428))
)

@Composable
fun PremiumCard(
  modifier: Modifier = Modifier,
  gradient: Brush? = null,
  content: @Composable () -> Unit,
) {
  Surface(
    modifier = modifier
      .clip(RoundedCornerShape(16.dp))
      .shadow(elevation = 8.dp, shape = RoundedCornerShape(16.dp))
      .border(
        width = 1.dp,
        brush = Brush.linearGradient(
          colors = listOf(Color(0xFF00D9FF).copy(alpha = 0.3f), Color(0xFF00FF41).copy(alpha = 0.3f))
        ),
        shape = RoundedCornerShape(16.dp)
      ),
    color = Color(0xFF1a2332),
  ) {
    Box(
      modifier = Modifier
        .fillMaxWidth()
        .background(gradient ?: Brush.linearGradient(listOf(Color.Transparent, Color.Transparent)))
    ) {
      content()
    }
  }
}

@Composable
fun GlassCard(
  modifier: Modifier = Modifier,
  content: @Composable () -> Unit,
) {
  Surface(
    modifier = modifier
      .clip(RoundedCornerShape(20.dp))
      .border(
        width = 1.5.dp,
        brush = Brush.linearGradient(
          colors = listOf(
            Color(0xFF00D9FF).copy(alpha = 0.4f),
            Color(0xFF00FF41).copy(alpha = 0.2f)
          )
        ),
        shape = RoundedCornerShape(20.dp)
      )
      .shadow(elevation = 12.dp, shape = RoundedCornerShape(20.dp)),
    color = Color(0xFF0A0E27).copy(alpha = 0.8f),
  ) {
    content()
  }
}

@Composable
fun PremiumButton(
  text: String,
  onClick: () -> Unit,
  modifier: Modifier = Modifier,
  gradient: Brush = ElectricBlueGradient,
  enabled: Boolean = true,
) {
  Button(
    onClick = onClick,
    modifier = modifier
      .height(56.dp)
      .clip(RoundedCornerShape(12.dp))
      .shadow(elevation = 8.dp),
    colors = ButtonDefaults.buttonColors(
      containerColor = Color.Transparent,
      disabledContainerColor = Color.Gray.copy(alpha = 0.3f)
    ),
    enabled = enabled,
  ) {
    Box(
      modifier = Modifier
        .fillMaxSize()
        .background(gradient)
        .padding(horizontal = 24.dp),
      contentAlignment = Alignment.Center,
    ) {
      Text(
        text,
        fontSize = 14.sp,
        fontWeight = FontWeight.Bold,
        color = Color.White,
      )
    }
  }
}

@Composable
fun MetricTile(
  label: String,
  value: String,
  unit: String,
  icon: @Composable () -> Unit,
  trendPercent: Float? = null,
  gradient: Brush = ElectricBlueGradient,
) {
  PremiumCard(
    modifier = Modifier
      .fillMaxWidth()
      .padding(8.dp),
    gradient = gradient,
  ) {
    Row(
      modifier = Modifier
        .fillMaxWidth()
        .padding(16.dp),
      horizontalArrangement = Arrangement.SpaceBetween,
      verticalAlignment = Alignment.CenterVertically,
    ) {
      Column(
        modifier = Modifier.weight(1f),
        verticalArrangement = Arrangement.spacedBy(8.dp)
      ) {
        Text(
          label,
          fontSize = 11.sp,
          color = Color.Gray,
          fontWeight = FontWeight.Bold,
        )
        Row(
          verticalAlignment = Alignment.CenterVertically,
          horizontalArrangement = Arrangement.spacedBy(4.dp)
        ) {
          Text(
            value,
            fontSize = 28.sp,
            fontWeight = FontWeight.Bold,
            color = Color.White,
          )
          Text(
            unit,
            fontSize = 12.sp,
            color = Color.Gray,
          )
        }
      }

      Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(4.dp)
      ) {
        Box(
          modifier = Modifier
            .size(48.dp)
            .clip(RoundedCornerShape(12.dp))
            .background(Color(0xFF2d3748)),
          contentAlignment = Alignment.Center
        ) {
          icon()
        }

        if (trendPercent != null) {
          Text(
            "${if (trendPercent > 0) "↑" else "↓"} ${String.format("%.1f", trendPercent)}%",
            fontSize = 10.sp,
            color = if (trendPercent > 0) Color(0xFF00FF41) else Color(0xFFFF6B35),
            fontWeight = FontWeight.Bold,
          )
        }
      }
    }
  }
}

@Composable
fun StatusBadgeAdvanced(
  status: String,
  severity: DiagnosticSeverity,
) {
  val (bgColor, fgColor) = when (severity) {
    DiagnosticSeverity.OK -> Pair(NeonGreenGradient, Color(0xFF0A0E27))
    DiagnosticSeverity.WARNING -> Pair(OrangeGradient, Color.White)
    DiagnosticSeverity.CRITICAL -> Pair(
      Brush.linearGradient(listOf(Color(0xFFFF4500), Color(0xFFCC0000))),
      Color.White
    )
  }

  Surface(
    modifier = Modifier
      .clip(RoundedCornerShape(8.dp))
      .shadow(elevation = 4.dp, shape = RoundedCornerShape(8.dp)),
    color = Color.Transparent,
  ) {
    Box(
      modifier = Modifier
        .background(bgColor)
        .padding(horizontal = 12.dp, vertical = 6.dp),
      contentAlignment = Alignment.Center,
    ) {
      Text(
        status,
        fontSize = 10.sp,
        fontWeight = FontWeight.Bold,
        color = fgColor,
      )
    }
  }
}
