package com.wise2.fieldtech.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.wise2.fieldtech.domain.model.JobStatus
import com.wise2.fieldtech.ui.theme.ChromeSilver
import com.wise2.fieldtech.ui.theme.ElectricBlue
import com.wise2.fieldtech.ui.theme.Gunmetal
import com.wise2.fieldtech.ui.theme.InstrumentLine
import com.wise2.fieldtech.ui.theme.PanelSteel
import com.wise2.fieldtech.ui.theme.StatusAmber
import com.wise2.fieldtech.ui.theme.StatusGreen
import com.wise2.fieldtech.ui.theme.StatusRed

@Composable
fun WiseCard(modifier: Modifier = Modifier, content: @Composable () -> Unit) {
    val shape = RoundedCornerShape(8.dp)
    Card(
        modifier = modifier
            .fillMaxWidth()
            .shadow(10.dp, shape, ambientColor = ElectricBlue.copy(alpha = 0.08f), spotColor = ElectricBlue.copy(alpha = 0.05f))
            .border(1.dp, InstrumentLine, shape),
        colors = CardDefaults.cardColors(containerColor = PanelSteel),
        shape = shape,
    ) {
        Box(Modifier.padding(14.dp)) { content() }
    }
}

fun JobStatus.color(): Color = when (this) {
    JobStatus.SCHEDULED -> ChromeSilver
    JobStatus.EN_ROUTE, JobStatus.ARRIVED, JobStatus.DIAGNOSING, JobStatus.REPAIRING -> ElectricBlue
    JobStatus.WAITING -> StatusAmber
    JobStatus.COMPLETE -> StatusGreen
}

fun JobStatus.label(): String = name.replace('_', ' ').lowercase()
    .split(' ').joinToString(" ") { it.replaceFirstChar(Char::uppercase) }

@Composable
fun StatusPill(text: String, color: Color, modifier: Modifier = Modifier) {
    Box(
        modifier = modifier
            .border(1.dp, color.copy(alpha = 0.55f), RoundedCornerShape(4.dp))
            .background(color.copy(alpha = 0.12f), RoundedCornerShape(4.dp))
            .padding(horizontal = 9.dp, vertical = 5.dp),
    ) {
        Text(text, color = color, style = MaterialTheme.typography.labelMedium)
    }
}

@Composable
fun ConnectivityBanner(isOnline: Boolean, pendingSyncCount: Int, modifier: Modifier = Modifier) {
    if (isOnline && pendingSyncCount == 0) return
    val (bg, label) = when {
        !isOnline -> Gunmetal to "OFFLINE — CHANGES SAVED LOCALLY"
        else -> Gunmetal to "SYNCING $pendingSyncCount CHANGE${if (pendingSyncCount == 1) "" else "S"}..."
    }
    Row(
        modifier = modifier
            .fillMaxWidth()
            .background(bg)
            .padding(horizontal = 16.dp, vertical = 8.dp),
        horizontalArrangement = Arrangement.Center,
        verticalAlignment = Alignment.CenterVertically,
    ) {
        val dotColor = if (!isOnline) StatusRed else StatusAmber
        Box(Modifier.background(dotColor, RoundedCornerShape(50)).padding(4.dp))
        Text(label, color = ChromeSilver, style = MaterialTheme.typography.labelMedium, modifier = Modifier.padding(start = 8.dp))
    }
}

@Composable
fun DemoDataBadge(modifier: Modifier = Modifier) {
    StatusPill(text = "DEMO DATA", color = StatusAmber, modifier = modifier)
}
