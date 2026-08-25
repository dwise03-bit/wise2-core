package com.wise2.fieldtech.ui.screens.readings

import android.Manifest
import android.content.pm.PackageManager
import android.os.Build
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.Button
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.core.content.ContextCompat
import com.wise2.fieldtech.bluetooth.model.ToolConnectionState
import com.wise2.fieldtech.ui.components.DemoDataBadge
import com.wise2.fieldtech.ui.components.LineChart
import com.wise2.fieldtech.ui.components.Meter
import com.wise2.fieldtech.ui.components.WiseCard
import com.wise2.fieldtech.ui.theme.ElectricBlue
import com.wise2.fieldtech.ui.theme.StatusGreen

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LiveReadingsScreen(viewModel: LiveReadingsViewModel, onBack: () -> Unit) {
    val state by viewModel.uiState.collectAsState()
    val context = LocalContext.current
    val bluetoothPermissions = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
        arrayOf(Manifest.permission.BLUETOOTH_SCAN, Manifest.permission.BLUETOOTH_CONNECT)
    } else arrayOf(Manifest.permission.ACCESS_FINE_LOCATION)
    val permissionLauncher = rememberLauncherForActivityResult(ActivityResultContracts.RequestMultiplePermissions()) { grants ->
        if (grants.values.all { it }) viewModel.scan()
    }

    LaunchedEffect(Unit) {
        if (state.connectionState == ToolConnectionState.DISCONNECTED) {
            if (bluetoothPermissions.all { ContextCompat.checkSelfPermission(context, it) == PackageManager.PERMISSION_GRANTED }) {
                viewModel.scan()
            } else permissionLauncher.launch(bluetoothPermissions)
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("LIVE READINGS") },
                navigationIcon = { IconButton(onClick = onBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back") } },
            )
        },
    ) { padding ->
        LazyColumn(contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(16.dp)) {
            item {
                WiseCard {
                    Column {
                        Row(horizontalArrangement = Arrangement.SpaceBetween, modifier = Modifier.fillMaxWidth()) {
                            Text(state.brandName, style = MaterialTheme.typography.titleMedium)
                            Text(state.connectionState.name.replace('_', ' '), color = if (state.connectionState == ToolConnectionState.CONNECTED) StatusGreen else ElectricBlue)
                        }
                        Spacer(Modifier.height(8.dp))
                        if (state.discoveredDevices.isNotEmpty() && state.connectionState != ToolConnectionState.CONNECTED) {
                            state.discoveredDevices.forEach { device ->
                                Button(onClick = { viewModel.connect(device) }, modifier = Modifier.fillMaxWidth()) {
                                    Text("Connect ${device.name}")
                                }
                            }
                        }
                        if (state.connectionState == ToolConnectionState.CONNECTED) {
                            Spacer(Modifier.height(8.dp))
                            Button(onClick = viewModel::disconnect, modifier = Modifier.fillMaxWidth()) { Text("DISCONNECT") }
                        }
                    }
                }
            }

            val reading = state.latestReading
            if (reading != null) {
                item { if (reading.isDemoData) DemoDataBadge() }

                item { SectionHeader("REFRIGERANT") }

                reading.lowSidePsig?.let { pressure ->
                    item {
                        Meter(
                            value = pressure.toFloat(),
                            min = 0f,
                            max = 400f,
                            unit = "psig",
                            label = "Low Side Pressure",
                            modifier = Modifier.fillMaxWidth(),
                            warningThreshold = 150f,
                        )
                    }
                }

                reading.highSidePsig?.let { pressure ->
                    item {
                        Meter(
                            value = pressure.toFloat(),
                            min = 0f,
                            max = 600f,
                            unit = "psig",
                            label = "High Side Pressure",
                            modifier = Modifier.fillMaxWidth(),
                            warningThreshold = 400f,
                        )
                    }
                }

                if (state.pressureHistory.isNotEmpty()) {
                    item {
                        LineChart(
                            dataPoints = state.pressureHistory,
                            label = "Low Side Pressure Trend",
                            unit = "psig",
                            modifier = Modifier.fillMaxWidth(),
                        )
                    }
                }

                item {
                    ReadingGrid(
                        listOfNotNull(
                            reading.suctionSaturationF?.let { "SAT LOW" to "%.1f °F".format(it) },
                            reading.liquidSaturationF?.let { "SAT HIGH" to "%.1f °F".format(it) },
                            reading.suctionLineTempF?.let { "SUCTION" to "%.1f °F".format(it) },
                            reading.liquidLineTempF?.let { "LIQUID" to "%.1f °F".format(it) },
                            reading.dischargeTempF?.let { "DISCHARGE" to "%.1f °F".format(it) },
                            reading.outdoorAmbientF?.let { "AMBIENT" to "%.1f °F".format(it) },
                        )
                    )
                }

                if (state.tempHistory.isNotEmpty()) {
                    item {
                        LineChart(
                            dataPoints = state.tempHistory,
                            label = "Temperature Trend",
                            unit = "°F",
                            modifier = Modifier.fillMaxWidth(),
                        )
                    }
                }

                item { SectionHeader("CALCULATED") }
                items(state.calculations) { calc ->
                    WiseCard {
                        Column {
                            Row(horizontalArrangement = Arrangement.SpaceBetween, modifier = Modifier.fillMaxWidth()) {
                                Text(calc.label, style = MaterialTheme.typography.titleMedium)
                                Text("%.1f %s".format(calc.result, calc.unit), color = ElectricBlue, style = MaterialTheme.typography.titleMedium)
                            }
                            Text(calc.method, style = MaterialTheme.typography.bodyMedium)
                            calc.note?.let { Text(it, color = MaterialTheme.colorScheme.error, style = MaterialTheme.typography.bodyMedium) }
                        }
                    }
                }

                item { SectionHeader("ELECTRICAL") }

                reading.voltageL1?.let { voltage ->
                    item {
                        Meter(
                            value = voltage.toFloat(),
                            min = 200f,
                            max = 250f,
                            unit = "V",
                            label = "L1 Voltage",
                            modifier = Modifier.fillMaxWidth(),
                            warningThreshold = 245f,
                            criticalThreshold = 250f,
                        )
                    }
                }

                if (state.voltageHistory.isNotEmpty()) {
                    item {
                        LineChart(
                            dataPoints = state.voltageHistory,
                            label = "Voltage Trend",
                            unit = "V",
                            modifier = Modifier.fillMaxWidth(),
                        )
                    }
                }

                item {
                    ReadingGrid(
                        listOfNotNull(
                            reading.voltageL2?.let { "L2 VOLTAGE" to "%.1f V".format(it) },
                            reading.currentL1?.let { "L1 CURRENT" to "%.1f A".format(it) },
                            reading.currentL2?.let { "L2 CURRENT" to "%.1f A".format(it) },
                            reading.capacitanceMfd?.let { "CAPACITANCE" to "%.1f µF".format(it) },
                            reading.resistanceOhms?.let { "RESISTANCE" to "%.1f Ω".format(it) },
                        )
                    )
                }

                item { SectionHeader("AIRFLOW") }
                item {
                    ReadingGrid(
                        listOfNotNull(
                            reading.returnTempF?.let { "RETURN" to "%.1f °F".format(it) },
                            reading.supplyTempF?.let { "SUPPLY" to "%.1f °F".format(it) },
                            reading.staticPressureInWc?.let { "STATIC" to "%.2f in WC".format(it) },
                        )
                    )
                }

                item {
                    Button(onClick = viewModel::saveCurrentReading, modifier = Modifier.fillMaxWidth().height(56.dp)) {
                        Text("SAVE READING TO JOB")
                    }
                }
            }
        }
    }
}

@Composable
private fun SectionHeader(text: String) {
    Text(text, style = MaterialTheme.typography.labelLarge, color = ElectricBlue)
}

@Composable
private fun ReadingGrid(entries: List<Pair<String, String>>) {
    LazyVerticalGrid(
        columns = GridCells.Fixed(2),
        modifier = Modifier.height((((entries.size + 1) / 2) * 96).dp),
        horizontalArrangement = Arrangement.spacedBy(12.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        items(entries) { (label, value) ->
            WiseCard {
                Column {
                    Text(label, style = MaterialTheme.typography.labelMedium)
                    Text(value, style = MaterialTheme.typography.headlineMedium, color = ElectricBlue)
                }
            }
        }
    }
}
