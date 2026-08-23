package com.wise2.fieldtech.ui.screens.home

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Bolt
import androidx.compose.material.icons.filled.Build
import androidx.compose.material.icons.filled.Handyman
import androidx.compose.material.icons.filled.Speed
import androidx.compose.material.icons.filled.SmartToy
import androidx.compose.material3.Button
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material.icons.filled.Settings
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.wise2.fieldtech.domain.model.Job
import com.wise2.fieldtech.ui.components.ConnectivityBanner
import com.wise2.fieldtech.ui.components.DemoDataBadge
import com.wise2.fieldtech.ui.components.StatusPill
import com.wise2.fieldtech.ui.components.WiseCard
import com.wise2.fieldtech.ui.components.color
import com.wise2.fieldtech.ui.components.label
import com.wise2.fieldtech.ui.theme.ElectricBlue
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(
    viewModel: HomeViewModel,
    onJobClick: (String) -> Unit,
    onDiagnose: (String) -> Unit,
    onLiveReadings: (String) -> Unit,
    onEquipment: (String) -> Unit,
    onImp: (String) -> Unit,
    onNewJob: () -> Unit,
    onSettings: () -> Unit,
) {
    val state by viewModel.uiState.collectAsState()
    val nextJobId = state.jobs.firstOrNull { it.status.name != "COMPLETE" }?.id

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("WISE² FIELD TECH", color = ElectricBlue, fontWeight = FontWeight.Bold) },
                actions = {
                    IconButton(onClick = onSettings) { Icon(Icons.Filled.Settings, contentDescription = "Settings") }
                },
            )
        },
    ) { padding ->
        Column(Modifier.fillMaxSize().padding(padding)) {
            ConnectivityBanner(isOnline = state.isOnline, pendingSyncCount = state.pendingSyncCount)

            LazyColumn(
                contentPadding = PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp),
            ) {
                item {
                    Text("Good Morning, ${state.technicianName}", style = MaterialTheme.typography.headlineMedium)
                }

                item {
                    Text("TODAY'S JOBS (${state.jobs.size})", style = MaterialTheme.typography.labelLarge, color = ElectricBlue)
                }

                items(state.jobs, key = { it.id }) { job ->
                    JobRow(job = job, onClick = { onJobClick(job.id) })
                }

                item {
                    Text("QUICK ACTIONS", style = MaterialTheme.typography.labelLarge, color = ElectricBlue)
                }

                item {
                    LazyVerticalGrid(
                        columns = GridCells.Fixed(2),
                        modifier = Modifier.height(220.dp),
                        horizontalArrangement = Arrangement.spacedBy(12.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp),
                    ) {
                        item {
                            ModuleTile("DIAGNOSE", "Run tests & get smart diagnosis", Icons.Filled.Handyman, enabled = nextJobId != null) {
                                nextJobId?.let(onDiagnose)
                            }
                        }
                        item {
                            ModuleTile("LIVE READINGS", "View real-time equipment data", Icons.Filled.Speed, enabled = nextJobId != null) {
                                nextJobId?.let(onLiveReadings)
                            }
                        }
                        item {
                            ModuleTile("EQUIPMENT", "System info & history", Icons.Filled.Build, enabled = nextJobId != null) {
                                val equipmentId = state.jobs.firstOrNull { it.id == nextJobId }?.equipmentId
                                equipmentId?.let(onEquipment)
                            }
                        }
                        item {
                            ModuleTile("AI IMP", "Ask WISE² IMP anything", Icons.Filled.SmartToy, enabled = nextJobId != null) {
                                nextJobId?.let(onImp)
                            }
                        }
                    }
                }

                item {
                    Button(onClick = onNewJob, modifier = Modifier.fillMaxWidth().height(56.dp)) {
                        Icon(Icons.Filled.Add, contentDescription = null)
                        Spacer(Modifier.height(0.dp))
                        Text("  NEW JOB")
                    }
                }
            }
        }
    }
}

@Composable
private fun JobRow(job: Job, onClick: () -> Unit) {
    WiseCard(modifier = Modifier.fillMaxWidth().clickable(onClick = onClick)) {
        Column {
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                Text(timeLabel(job.appointmentAtEpochMillis), style = MaterialTheme.typography.titleMedium, color = ElectricBlue)
                StatusPill(text = job.status.label().uppercase(), color = job.status.color())
            }
            Spacer(Modifier.height(4.dp))
            Text(job.customerName, style = MaterialTheme.typography.titleMedium)
            Text(job.address, style = MaterialTheme.typography.bodyMedium)
            if (job.isDemoData) {
                Spacer(Modifier.height(6.dp))
                DemoDataBadge()
            }
        }
    }
}

@Composable
private fun ModuleTile(title: String, subtitle: String, icon: androidx.compose.ui.graphics.vector.ImageVector, enabled: Boolean, onClick: () -> Unit) {
    WiseCard(modifier = Modifier.clickable(enabled = enabled, onClick = onClick)) {
        Column {
            Icon(icon, contentDescription = null, tint = if (enabled) ElectricBlue else MaterialTheme.colorScheme.onSurfaceVariant)
            Spacer(Modifier.height(8.dp))
            Text(title, style = MaterialTheme.typography.titleMedium)
            Text(subtitle, style = MaterialTheme.typography.bodyMedium)
        }
    }
}

private fun timeLabel(epochMillis: Long): String =
    SimpleDateFormat("h:mm a", Locale.US).format(Date(epochMillis))
