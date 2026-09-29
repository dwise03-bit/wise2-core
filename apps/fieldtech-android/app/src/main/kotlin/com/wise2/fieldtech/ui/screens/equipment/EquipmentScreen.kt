package com.wise2.fieldtech.ui.screens.equipment

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.wise2.fieldtech.ui.components.DemoDataBadge
import com.wise2.fieldtech.ui.components.WiseCard
import com.wise2.fieldtech.ui.theme.ElectricBlue
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun EquipmentScreen(viewModel: EquipmentViewModel, onBack: () -> Unit) {
    val state by viewModel.uiState.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("EQUIPMENT") },
                navigationIcon = { IconButton(onClick = onBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back") } },
            )
        },
    ) { padding ->
        val equipment = state.equipment
        LazyColumn(contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(16.dp)) {
            if (equipment == null) {
                item { Text("Loading equipment…", style = MaterialTheme.typography.bodyLarge) }
            } else {
                item {
                    WiseCard {
                        Column {
                            Text("${equipment.manufacturer} ${equipment.equipmentType}", style = MaterialTheme.typography.titleLarge)
                            Text(equipment.model, style = MaterialTheme.typography.bodyLarge)
                            Spacer(Modifier.height(8.dp))
                            InfoRow("Serial", equipment.serial)
                            InfoRow("Refrigerant", equipment.refrigerant)
                            InfoRow("Voltage / Phase", "${equipment.voltage} / ${equipment.phase}")
                            equipment.tonnage?.let { InfoRow("Tonnage", "$it ton") }
                            InfoRow("Location", equipment.location)
                            equipment.filterSize?.let { InfoRow("Filter Size", it) }
                            if (equipment.isDemoData) {
                                Spacer(Modifier.height(8.dp))
                                DemoDataBadge()
                            }
                        }
                    }
                }
                item { Text("SERVICE HISTORY", style = MaterialTheme.typography.labelLarge, color = ElectricBlue) }
                items(state.history) { entry ->
                    WiseCard {
                        Column {
                            Text(SimpleDateFormat("MMM d, yyyy", Locale.US).format(Date(entry.dateEpochMillis)), color = ElectricBlue)
                            Text(entry.summary, style = MaterialTheme.typography.bodyLarge)
                            Text(entry.technicianName, style = MaterialTheme.typography.bodyMedium)
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun InfoRow(label: String, value: String) {
    androidx.compose.foundation.layout.Row(horizontalArrangement = Arrangement.SpaceBetween, modifier = Modifier.fillMaxWidth()) {
        Text(label, style = MaterialTheme.typography.bodyMedium)
        Text(value, style = MaterialTheme.typography.bodyLarge)
    }
}
