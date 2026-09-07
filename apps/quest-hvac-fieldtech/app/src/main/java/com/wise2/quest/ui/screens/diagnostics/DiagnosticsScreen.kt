package com.wise2.quest.ui.screens.diagnostics

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.wise2.quest.R

/**
 * Diagnostics screen showing live HVAC measurements
 */
@Composable
fun DiagnosticsScreen(
  workOrderId: String,
  viewModel: DiagnosticsViewModel,
  onLiveToolsClick: () -> Unit,
  onBackClick: () -> Unit
) {
  val measurement = viewModel.currentMeasurement.collectAsState()
  val impResult = viewModel.impResult.collectAsState()
  val isRunning = viewModel.isRunning.collectAsState()
  val uiState = viewModel.uiState.collectAsState()

  LaunchedEffect(Unit) {
    viewModel.startDiagnostics(workOrderId)
  }

  Column(
    modifier = Modifier
      .fillMaxSize()
      .background(Color(0xFF0A0A0A))
  ) {
    // Header
    Row(
      modifier = Modifier
        .fillMaxWidth()
        .background(Color(0xFF1A1A1A))
        .padding(16.dp),
      horizontalArrangement = Arrangement.SpaceBetween,
      verticalAlignment = Alignment.CenterVertically
    ) {
      Text(
        text = stringResource(R.string.diagnostics_title),
        style = MaterialTheme.typography.headlineSmall,
        color = Color(0xFF00D9FF),
        fontWeight = FontWeight.Bold
      )

      Button(
        onClick = onBackClick,
        colors = ButtonDefaults.buttonColors(
          containerColor = Color(0xFF1A1A1A),
          contentColor = Color(0xFF00D9FF)
        )
      ) {
        Text("Back")
      }
    }

    // Content
    Column(
      modifier = Modifier
        .fillMaxSize()
        .verticalScroll(rememberScrollState())
        .padding(16.dp)
    ) {
      // Status indicator
      if (measurement.value != null) {
        val status = impResult.value?.status ?: "unknown"
        val statusColor = when (status) {
          "healthy" -> Color(0xFF00FF41)
          "caution" -> Color(0xFFFFB700)
          "critical" -> Color(0xFFFF0040)
          else -> Color(0xFFA0A0A0)
        }

        Row(
          modifier = Modifier
            .fillMaxWidth()
            .background(Color(0xFF1A1A1A))
            .padding(16.dp),
          horizontalArrangement = Arrangement.SpaceBetween,
          verticalAlignment = Alignment.CenterVertically
        ) {
          Text(
            text = "Status: $status",
            color = statusColor,
            fontWeight = FontWeight.Bold
          )

          if (isRunning.value) {
            Text(
              text = "● Live",
              color = Color(0xFF00FF41)
            )
          }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Pressure Readings
        DiagnosticSection(
          title = stringResource(R.string.pressure_readings),
          content = {
            MeasurementRow("Suction", "${measurement.value?.suctionPressure ?: 0} psi")
            MeasurementRow("Discharge", "${measurement.value?.dischargePressure ?: 0} psi")
            MeasurementRow("Liquid", "${measurement.value?.liquidPressure ?: 0} psi")
          }
        )

        Spacer(modifier = Modifier.height(12.dp))

        // Temperature Readings
        DiagnosticSection(
          title = stringResource(R.string.temperature_readings),
          content = {
            MeasurementRow("Suction", "${measurement.value?.suctionTemperature ?: 0}°F")
            MeasurementRow("Discharge", "${measurement.value?.dischargeTemperature ?: 0}°F")
            MeasurementRow("Ambient", "${measurement.value?.ambientTemperature ?: 0}°F")
            MeasurementRow("Liquid", "${measurement.value?.liquidTemperature ?: 0}°F")
          }
        )

        Spacer(modifier = Modifier.height(12.dp))

        // Calculated Values
        DiagnosticSection(
          title = stringResource(R.string.calculated_values),
          content = {
            MeasurementRow("Superheat", "${measurement.value?.superheat ?: 0}°F")
            MeasurementRow("Subcooling", "${measurement.value?.subcooling ?: 0}°F")
          }
        )

        Spacer(modifier = Modifier.height(12.dp))

        // Electrical Measurements
        DiagnosticSection(
          title = stringResource(R.string.electrical_measurements),
          content = {
            MeasurementRow("Amperage", "${measurement.value?.amperage ?: 0} A")
            MeasurementRow("Voltage", "${measurement.value?.voltage ?: 0} V")
          }
        )

        Spacer(modifier = Modifier.height(12.dp))

        // IMP Issues and Recommendations
        if (impResult.value != null) {
          DiagnosticSection(
            title = "Analysis",
            content = {
              if (impResult.value!!.issues.isNotEmpty()) {
                Text(
                  text = "Issues:",
                  color = Color(0xFF00D9FF),
                  fontWeight = FontWeight.Bold,
                  modifier = Modifier.padding(bottom = 4.dp)
                )
                impResult.value!!.issues.forEach { issue ->
                  Text(
                    text = "• $issue",
                    color = Color(0xFFA0A0A0),
                    modifier = Modifier.padding(start = 8.dp)
                  )
                }
              }

              Spacer(modifier = Modifier.height(8.dp))

              if (impResult.value!!.recommendations.isNotEmpty()) {
                Text(
                  text = "Recommendations:",
                  color = Color(0xFF00D9FF),
                  fontWeight = FontWeight.Bold,
                  modifier = Modifier.padding(bottom = 4.dp)
                )
                impResult.value!!.recommendations.forEach { rec ->
                  Text(
                    text = "• $rec",
                    color = Color(0xFFA0A0A0),
                    modifier = Modifier.padding(start = 8.dp)
                  )
                }
              }
            }
          )
        }

        Spacer(modifier = Modifier.height(24.dp))

        // Action buttons
        Row(
          modifier = Modifier
            .fillMaxWidth(),
          horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
          Button(
            onClick = {
              if (isRunning.value) {
                viewModel.stopDiagnostics()
              } else {
                viewModel.startDiagnostics(workOrderId)
              }
            },
            modifier = Modifier.weight(1f),
            colors = ButtonDefaults.buttonColors(
              containerColor = if (isRunning.value) Color(0xFFFF0040) else Color(0xFF00FF41),
              contentColor = Color.Black
            )
          ) {
            Text(
              if (isRunning.value) stringResource(R.string.stop_diagnostics)
              else stringResource(R.string.start_diagnostics),
              fontWeight = FontWeight.Bold
            )
          }

          Button(
            onClick = onLiveToolsClick,
            modifier = Modifier.weight(1f),
            colors = ButtonDefaults.buttonColors(
              containerColor = Color(0xFF00D9FF),
              contentColor = Color.Black
            )
          ) {
            Text("Live Tools", fontWeight = FontWeight.Bold)
          }
        }
      }
    }
  }
}

/**
 * Reusable diagnostic section
 */
@Composable
fun DiagnosticSection(
  title: String,
  content: @Composable () -> Unit
) {
  Column(
    modifier = Modifier
      .fillMaxWidth()
      .background(Color(0xFF1A1A1A))
      .padding(12.dp)
  ) {
    Text(
      text = title,
      color = Color(0xFF00D9FF),
      fontWeight = FontWeight.Bold,
      style = MaterialTheme.typography.titleSmall,
      modifier = Modifier.padding(bottom = 8.dp)
    )
    content()
  }
}

/**
 * Single measurement row
 */
@Composable
fun MeasurementRow(label: String, value: String) {
  Row(
    modifier = Modifier
      .fillMaxWidth()
      .padding(vertical = 4.dp),
    horizontalArrangement = Arrangement.SpaceBetween
  ) {
    Text(label, color = Color(0xFFA0A0A0))
    Text(value, color = Color(0xFF00FF41), fontWeight = FontWeight.Bold)
  }
}
