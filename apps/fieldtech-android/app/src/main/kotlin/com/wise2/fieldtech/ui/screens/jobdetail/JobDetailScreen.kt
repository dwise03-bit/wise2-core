package com.wise2.fieldtech.ui.screens.jobdetail

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Build
import androidx.compose.material.icons.filled.Call
import androidx.compose.material.icons.filled.CameraAlt
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Handyman
import androidx.compose.material.icons.filled.Mic
import androidx.compose.material.icons.filled.Navigation
import androidx.compose.material.icons.filled.SmartToy
import androidx.compose.material.icons.filled.Speed
import androidx.compose.material3.Button
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import com.wise2.fieldtech.camera.CameraCaptureScreen
import com.wise2.fieldtech.ui.components.DemoDataBadge
import com.wise2.fieldtech.ui.components.StatusPill
import com.wise2.fieldtech.ui.components.WiseCard
import com.wise2.fieldtech.ui.components.color
import com.wise2.fieldtech.ui.components.label

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun JobDetailScreen(
    viewModel: JobDetailViewModel,
    onBack: () -> Unit,
    onDiagnose: (String) -> Unit,
    onLiveReadings: (String) -> Unit,
    onEquipment: (String) -> Unit,
    onImp: (String) -> Unit,
    onReport: (String) -> Unit,
) {
    val job by viewModel.job.collectAsState()
    val context = LocalContext.current
    var showCamera by remember { mutableStateOf(false) }
    var voiceNoteDraft by remember { mutableStateOf("") }

    val currentJob = job
    if (currentJob == null) {
        Text("Loading job…", modifier = Modifier.fillMaxSize())
        return
    }

    if (showCamera) {
        CameraCaptureScreen(
            jobId = currentJob.id,
            onCaptured = { path -> viewModel.attachPhoto(path); showCamera = false },
            onClose = { showCamera = false },
        )
        return
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(currentJob.customerName) },
                navigationIcon = {
                    IconButton(onClick = onBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back") }
                },
            )
        },
    ) { padding ->
        LazyColumn(
            contentPadding = PaddingValues(start = 16.dp, top = padding.calculateTopPadding() + 8.dp, end = 16.dp, bottom = 16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp),
        ) {
            item {
                WiseCard {
                    Column {
                        StatusPill(text = currentJob.status.label().uppercase(), color = currentJob.status.color())
                        Spacer(Modifier.height(8.dp))
                        Text(currentJob.address, style = MaterialTheme.typography.bodyLarge)
                        Text(currentJob.customerPhone, style = MaterialTheme.typography.bodyMedium)
                        Spacer(Modifier.height(8.dp))
                        Text("COMPLAINT", style = MaterialTheme.typography.labelMedium)
                        Text(currentJob.complaint, style = MaterialTheme.typography.bodyLarge)
                        if (currentJob.notes.isNotBlank()) {
                            Spacer(Modifier.height(8.dp))
                            Text("NOTES", style = MaterialTheme.typography.labelMedium)
                            Text(currentJob.notes, style = MaterialTheme.typography.bodyMedium)
                        }
                        if (currentJob.isDemoData) {
                            Spacer(Modifier.height(8.dp))
                            DemoDataBadge()
                        }
                    }
                }
            }

            item {
                LazyVerticalGrid(
                    columns = GridCells.Fixed(2),
                    modifier = Modifier.height(340.dp),
                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp),
                ) {
                    item {
                        QuickAction("Navigate", Icons.Filled.Navigation) {
                            val uri = Uri.parse("geo:0,0?q=${Uri.encode(currentJob.address)}")
                            runCatching { context.startActivity(Intent(Intent.ACTION_VIEW, uri)) }
                        }
                    }
                    item {
                        QuickAction("Call", Icons.Filled.Call) {
                            val uri = Uri.parse("tel:${currentJob.customerPhone}")
                            runCatching { context.startActivity(Intent(Intent.ACTION_DIAL, uri)) }
                        }
                    }
                    item { QuickAction("Diagnose", Icons.Filled.Handyman) { onDiagnose(currentJob.id) } }
                    item { QuickAction("Connect Tools", Icons.Filled.Speed) { onLiveReadings(currentJob.id) } }
                    item { QuickAction("Take Photo", Icons.Filled.CameraAlt) { showCamera = true } }
                    item {
                        QuickAction("Equipment", Icons.Filled.Build) {
                            currentJob.equipmentId?.let(onEquipment)
                        }
                    }
                    item { QuickAction("Ask IMP", Icons.Filled.SmartToy) { onImp(currentJob.id) } }
                    item { QuickAction("Job Report", Icons.Filled.CheckCircle) { onReport(currentJob.id) } }
                }
            }

            item {
                WiseCard {
                    Column {
                        Text("VOICE / TEXT NOTE", style = MaterialTheme.typography.labelLarge)
                        Spacer(Modifier.height(8.dp))
                        androidx.compose.material3.OutlinedTextField(
                            value = voiceNoteDraft,
                            onValueChange = { voiceNoteDraft = it },
                            placeholder = { Text("e.g. Found pressure-switch wiring rubbing against suction line") },
                            modifier = Modifier.fillMaxWidth(),
                        )
                        Spacer(Modifier.height(8.dp))
                        Row2 {
                            OutlinedButton(onClick = {
                                voiceNoteDraft = ""
                            }) { Text("Clear") }
                            Spacer(Modifier.height(0.dp))
                            Button(onClick = {
                                viewModel.addVoiceNote(voiceNoteDraft)
                                voiceNoteDraft = ""
                            }) {
                                Icon(Icons.Filled.Mic, contentDescription = null)
                                Text("  Save Note")
                            }
                        }
                    }
                }
            }

            item {
                Row2 {
                    OutlinedButton(onClick = viewModel::advanceStatus, modifier = Modifier.fillMaxWidth().height(52.dp)) {
                        Text("ADVANCE STATUS")
                    }
                }
            }
            item {
                Button(onClick = viewModel::completeJob, modifier = Modifier.fillMaxWidth().height(56.dp)) {
                    Text("COMPLETE JOB")
                }
            }
        }
    }
}

@Composable
private fun QuickAction(label: String, icon: androidx.compose.ui.graphics.vector.ImageVector, onClick: () -> Unit) {
    WiseCard {
        Column(modifier = Modifier.fillMaxWidth()) {
            IconButton(onClick = onClick) { Icon(icon, contentDescription = label) }
            Text(label, style = MaterialTheme.typography.labelLarge)
        }
    }
}

@Composable
private fun Row2(content: @Composable androidx.compose.foundation.layout.RowScope.() -> Unit) {
    androidx.compose.foundation.layout.Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(12.dp),
        content = content,
    )
}
