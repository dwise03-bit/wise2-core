package com.wise2.fieldtech.ui.components

import androidx.compose.animation.animateColorAsState
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.Icon
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

private val CarbonBlack = Color(0xFF0A0E27)
private val GunmetalDark = Color(0xFF1a2332)
private val GunmetalLight = Color(0xFF2d3748)
private val ElectricBlue = Color(0xFF00D9FF)
private val OrangeWarmth = Color(0xFFFF6B35)
private val NeonGreen = Color(0xFF00FF41)
private val MetallicSilver = Color(0xFFC0C0C0)

data class NavItem(
  val icon: ImageVector,
  val label: String,
  val badge: Int? = null,
  val onClick: () -> Unit,
)

@Composable
fun ModernNavigationBar(
  selectedIndex: Int,
  items: List<NavItem>,
) {
  Surface(
    modifier = Modifier
      .fillMaxWidth()
      .height(80.dp)
      .background(GunmetalDark),
    color = GunmetalDark,
  ) {
    Row(
      modifier = Modifier
        .fillMaxSize()
        .padding(horizontal = 4.dp, vertical = 8.dp),
      horizontalArrangement = Arrangement.spacedBy(4.dp),
      verticalAlignment = Alignment.CenterVertically,
    ) {
      items.forEachIndexed { index, item ->
        ModernNavItemButton(
          item = item,
          isSelected = index == selectedIndex,
          onClick = item.onClick,
        )
      }
    }
  }
}

@Composable
fun RowScope.ModernNavItemButton(
  item: NavItem,
  isSelected: Boolean,
  onClick: () -> Unit,
) {
  val backgroundColor by animateColorAsState(
    targetValue = if (isSelected) ElectricBlue.copy(alpha = 0.15f) else Color.Transparent
  )

  val iconColor by animateColorAsState(
    targetValue = if (isSelected) ElectricBlue else MetallicSilver
  )

  Surface(
    modifier = Modifier
      .weight(1f)
      .fillMaxHeight()
      .clip(RoundedCornerShape(12.dp))
      .clickable { onClick() }
      .background(backgroundColor),
    color = backgroundColor,
  ) {
    Column(
      modifier = Modifier
        .fillMaxSize()
        .padding(vertical = 8.dp),
      horizontalAlignment = Alignment.CenterHorizontally,
      verticalArrangement = Arrangement.SpaceBetween,
    ) {
      // Icon with badge
      Box(
        contentAlignment = Alignment.TopEnd,
      ) {
        Icon(
          item.icon,
          contentDescription = item.label,
          tint = iconColor,
          modifier = Modifier.size(24.dp),
        )

        if (item.badge != null && item.badge > 0) {
          Surface(
            modifier = Modifier
              .size(18.dp)
              .clip(RoundedCornerShape(9.dp)),
            color = OrangeWarmth,
          ) {
            Box(
              contentAlignment = Alignment.Center,
              modifier = Modifier.fillMaxSize(),
            ) {
              Text(
                item.badge.toString(),
                fontSize = 8.sp,
                fontWeight = FontWeight.Bold,
                color = Color.White,
              )
            }
          }
        }
      }

      // Label
      Text(
        item.label,
        fontSize = 9.sp,
        fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
        color = if (isSelected) ElectricBlue else Color.Gray,
      )

      // Indicator line
      if (isSelected) {
        Box(
          modifier = Modifier
            .width(24.dp)
            .height(2.dp)
            .clip(RoundedCornerShape(1.dp))
            .background(ElectricBlue)
        )
      }
    }
  }
}

@Composable
fun TabBar(
  selectedIndex: Int,
  tabs: List<String>,
  onTabSelected: (Int) -> Unit,
) {
  Surface(
    modifier = Modifier
      .fillMaxWidth()
      .height(48.dp)
      .background(GunmetalDark),
    color = GunmetalDark,
  ) {
    Row(
      modifier = Modifier
        .fillMaxSize()
        .padding(4.dp),
      horizontalArrangement = Arrangement.spacedBy(4.dp),
    ) {
      tabs.forEachIndexed { index, tab ->
        TabButton(
          label = tab,
          isSelected = index == selectedIndex,
          onClick = { onTabSelected(index) },
        )
      }
    }
  }
}

@Composable
fun RowScope.TabButton(
  label: String,
  isSelected: Boolean,
  onClick: () -> Unit,
) {
  Surface(
    modifier = Modifier
      .weight(1f)
      .fillMaxHeight()
      .clip(RoundedCornerShape(8.dp))
      .clickable { onClick() },
    color = if (isSelected) ElectricBlue.copy(alpha = 0.2f) else Color.Transparent,
  ) {
    Box(
      contentAlignment = Alignment.Center,
      modifier = Modifier.fillMaxSize(),
    ) {
      Text(
        label,
        fontSize = 11.sp,
        fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
        color = if (isSelected) ElectricBlue else Color.Gray,
      )
    }
  }
}

@Composable
fun FloatingActionButtonPrimary(
  icon: ImageVector,
  label: String,
  onClick: () -> Unit,
) {
  Surface(
    modifier = Modifier
      .size(56.dp)
      .clip(RoundedCornerShape(16.dp))
      .clickable { onClick() },
    color = ElectricBlue,
  ) {
    Box(
      contentAlignment = Alignment.Center,
      modifier = Modifier.fillMaxSize(),
    ) {
      Icon(
        icon,
        contentDescription = label,
        tint = CarbonBlack,
        modifier = Modifier.size(28.dp),
      )
    }
  }
}
