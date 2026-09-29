package com.wise2.fieldtech.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
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

data class MenuItem(
  val icon: ImageVector,
  val label: String,
  val badge: String? = null,
  val onClick: () -> Unit,
)

@Composable
fun MenuDrawer(
  isOpen: Boolean,
  onClose: () -> Unit,
  menuItems: List<MenuItem>,
) {
  if (!isOpen) return

  Box(
    modifier = Modifier
      .fillMaxSize()
      .background(Color.Black.copy(alpha = 0.7f))
      .clickable { onClose() }
  ) {
    Surface(
      modifier = Modifier
        .width(280.dp)
        .fillMaxHeight()
        .align(Alignment.CenterStart),
      color = GunmetalDark,
    ) {
      Column(modifier = Modifier.fillMaxSize()) {
        // Header
        MenuHeader(onClose = onClose)

        // Menu items
        LazyColumn(
          modifier = Modifier
            .weight(1f)
            .fillMaxWidth(),
          contentPadding = PaddingValues(8.dp),
          verticalArrangement = Arrangement.spacedBy(4.dp),
        ) {
          items(menuItems) { item ->
            MenuItemRow(item = item)
          }
        }

        // Footer
        MenuFooter()
      }
    }
  }
}

@Composable
fun MenuHeader(onClose: () -> Unit) {
  Row(
    modifier = Modifier
      .fillMaxWidth()
      .background(CarbonBlack)
      .padding(16.dp),
    horizontalArrangement = Arrangement.SpaceBetween,
    verticalAlignment = Alignment.CenterVertically,
  ) {
    Column {
      Text(
        "WISE²",
        fontSize = 14.sp,
        fontWeight = FontWeight.Bold,
        color = MetallicSilver,
      )
      Text(
        "Menu",
        fontSize = 10.sp,
        color = ElectricBlue,
      )
    }

    IconButton(onClick = onClose) {
      Icon(
        Icons.Filled.Close,
        contentDescription = "Close",
        tint = MetallicSilver,
      )
    }
  }
}

@Composable
fun MenuItemRow(item: MenuItem) {
  Row(
    modifier = Modifier
      .fillMaxWidth()
      .clip(RoundedCornerShape(8.dp))
      .clickable { item.onClick() }
      .padding(12.dp),
    horizontalArrangement = Arrangement.SpaceBetween,
    verticalAlignment = Alignment.CenterVertically,
  ) {
    Row(
      horizontalArrangement = Arrangement.spacedBy(12.dp),
      verticalAlignment = Alignment.CenterVertically,
      modifier = Modifier.weight(1f),
    ) {
      Icon(
        item.icon,
        contentDescription = item.label,
        tint = ElectricBlue,
        modifier = Modifier.size(24.dp),
      )

      Text(
        item.label,
        fontSize = 12.sp,
        fontWeight = FontWeight.Bold,
        color = Color.White,
      )
    }

    if (item.badge != null) {
      Badge(
        containerColor = OrangeWarmth,
        contentColor = Color.White,
      ) {
        Text(item.badge, fontSize = 9.sp)
      }
    }
  }
}

@Composable
fun MenuFooter() {
  Column(
    modifier = Modifier
      .fillMaxWidth()
      .background(CarbonBlack)
      .padding(12.dp),
    verticalArrangement = Arrangement.spacedBy(8.dp),
  ) {
    Divider(color = GunmetalLight, thickness = 0.5.dp)

    Row(
      modifier = Modifier
        .fillMaxWidth()
        .padding(8.dp),
      horizontalArrangement = Arrangement.spacedBy(8.dp),
      verticalAlignment = Alignment.CenterVertically,
    ) {
      Icon(
        Icons.Filled.Info,
        contentDescription = "Version",
        tint = MetallicSilver,
        modifier = Modifier.size(16.dp),
      )
      Text(
        "v1.0.3 • Connected",
        fontSize = 9.sp,
        color = Color.Gray,
      )
    }

    Row(
      modifier = Modifier
        .fillMaxWidth()
        .padding(8.dp),
      horizontalArrangement = Arrangement.spacedBy(8.dp),
      verticalAlignment = Alignment.CenterVertically,
    ) {
      Icon(
        Icons.Filled.SignalCellularAlt,
        contentDescription = "Signal",
        tint = NeonGreen,
        modifier = Modifier.size(16.dp),
      )
      Text(
        "Sync: On Time",
        fontSize = 9.sp,
        color = NeonGreen,
      )
    }
  }
}
