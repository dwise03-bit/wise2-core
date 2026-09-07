package com.wise2.fieldtech.ui.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.wise2.fieldtech.domain.diagnose.DiagnosticAssessment
import com.wise2.fieldtech.domain.model.ReadingSnapshot
import com.wise2.fieldtech.ui.theme.StatusGreen
import com.wise2.fieldtech.ui.theme.StatusRed

private val HighSide = Color(0xFFFF5722)
private val LowSide = Color(0xFF00B0FF)
private val Airflow = Color(0xFF00E676)
private val Metric = Color(0xFF2ED573)

@Composable
fun LiveSystemCenterCard(reading: ReadingSnapshot?, onRunDiagnostic: () -> Unit) {
    WiseCard {
        Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
            Text("LIVE SYSTEM CORE", style = MaterialTheme.typography.labelLarge)
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                DigitalMetric("SUCTION", reading?.lowSidePsig, "psig", LowSide, Modifier.weight(1f))
                DigitalMetric("LIQUID", reading?.highSidePsig, "psig", HighSide, Modifier.weight(1f))
            }
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                DigitalMetric("SUPERHEAT", reading?.suctionLineTempF?.let { line -> reading.suctionSaturationF?.let { line - it } }, "°F", Metric, Modifier.weight(1f))
                DigitalMetric("SUBCOOLING", reading?.liquidSaturationF?.let { sat -> reading.liquidLineTempF?.let { sat - it } }, "°F", Airflow, Modifier.weight(1f))
            }
            Button(onClick = onRunDiagnostic, Modifier.fillMaxWidth()) { Text("RUN WISE² IMP DIAGNOSTIC") }
        }
    }
}

@Composable
fun ProbeStatusRail(reading: ReadingSnapshot?) {
    WiseCard {
        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Text("SMART PROBES", style = MaterialTheme.typography.labelLarge)
            ProbeRow("Pressure transducers", reading?.lowSidePsig != null && reading.highSidePsig != null)
            ProbeRow("Pipe clamps", reading?.suctionLineTempF != null && reading.liquidLineTempF != null)
            ProbeRow("Air / psychrometrics", reading?.returnTempF != null && reading.supplyTempF != null)
            ProbeRow("Static manometer", reading?.staticPressureInWc != null)
        }
    }
}

@Composable
fun MeterDigitalCard(label: String, value: Double?, unit: String, accent: Color = Metric) {
    Surface(shape = RoundedCornerShape(12.dp), color = MaterialTheme.colorScheme.surfaceVariant) {
        Column(Modifier.padding(12.dp)) {
            Text(label, style = MaterialTheme.typography.labelSmall)
            Text(value?.let { "%.1f".format(it) } ?: "—", color = accent, style = MaterialTheme.typography.headlineSmall)
            Text(unit, style = MaterialTheme.typography.labelSmall)
        }
    }
}

@Composable
fun DiagnosticAssessmentCard(assessment: DiagnosticAssessment?) {
    val current = assessment ?: return
    WiseCard {
        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Text("WISE² IMP SYSTEM ASSESSMENT", style = MaterialTheme.typography.labelLarge)
            Text(current.title, color = if (current.confidencePercent >= 80) StatusRed else StatusGreen, style = MaterialTheme.typography.titleMedium)
            Text("${current.confidencePercent}% confidence")
            LinearProgressIndicator({ current.confidencePercent / 100f }, Modifier.fillMaxWidth())
            current.rationale.forEach { Text("• $it", style = MaterialTheme.typography.bodySmall) }
            current.checks.forEach { Text("□ $it", style = MaterialTheme.typography.bodySmall) }
        }
    }
}

@Composable
private fun DigitalMetric(label: String, value: Double?, unit: String, accent: Color, modifier: Modifier) {
    Surface(modifier, shape = RoundedCornerShape(12.dp), color = MaterialTheme.colorScheme.surfaceVariant) {
        Column(Modifier.padding(12.dp)) { Text(label, style = MaterialTheme.typography.labelSmall); Text(value?.let { "%.1f".format(it) } ?: "—", color = accent, style = MaterialTheme.typography.headlineMedium); Text(unit, style = MaterialTheme.typography.labelSmall) }
    }
}

@Composable
private fun ProbeRow(label: String, connected: Boolean) {
    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) { Text(label); Text(if (connected) "ONLINE" else "WAITING", color = if (connected) StatusGreen else MaterialTheme.colorScheme.onSurfaceVariant) }
}
