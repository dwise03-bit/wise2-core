package com.wise2.fieldtech.ui.screens.diagnose

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Checkbox
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.wise2.fieldtech.domain.model.DiagnosticCapture
import com.wise2.fieldtech.domain.model.DiagnosticComparison
import com.wise2.fieldtech.domain.model.FieldWorkflowStep
import com.wise2.fieldtech.domain.model.SimulationFixture
import com.wise2.fieldtech.domain.model.TestResult
import com.wise2.fieldtech.ui.components.WiseCard
import com.wise2.fieldtech.ui.theme.CarbonBlack
import com.wise2.fieldtech.ui.theme.ChromeSilver
import com.wise2.fieldtech.ui.theme.ElectricBlue
import com.wise2.fieldtech.ui.theme.Gunmetal
import com.wise2.fieldtech.ui.theme.StatusAmber
import com.wise2.fieldtech.ui.theme.StatusGreen
import com.wise2.fieldtech.ui.theme.StatusRed

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DiagnoseScreen(viewModel: DiagnoseViewModel, onBack: () -> Unit, onFinished: () -> Unit) {
    val session by viewModel.session.collectAsState()
    val latestReading by viewModel.latestReading.collectAsState()
    var note by remember { mutableStateOf("") }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("WISE2 COMMAND DIAGNOSTICS") },
                navigationIcon = { IconButton(onClick = onBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back") } },
            )
        },
    ) { padding ->
        val currentSession = session
        if (currentSession == null) {
            LazyColumn(contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp), modifier = Modifier.padding(padding)) {
                item { CockpitHeader(simulationActive = false, source = latestReading?.sourceDeviceName ?: "No saved live reading") }
                item { Text("Select diagnostic target.", style = MaterialTheme.typography.bodyLarge) }
                items(viewModel.categories) { category ->
                    WiseCard {
                        Column {
                            Text(category.name.replace('_', ' '), style = MaterialTheme.typography.titleMedium)
                            Spacer(Modifier.height(8.dp))
                            Button(onClick = { viewModel.startCategory(category) }, modifier = Modifier.fillMaxWidth().height(56.dp)) {
                                Text("Start")
                            }
                        }
                    }
                }
            }
            return@Scaffold
        }

        LazyColumn(contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(14.dp), modifier = Modifier.padding(padding)) {
            item { CockpitHeader(currentSession.simulationFixture != null, latestReading?.sourceDeviceName ?: "No saved live reading") }
            item { FieldTestMode(currentSession.simulationFixture) { viewModel.setSimulationFixture(currentSession, it) } }
            item { WorkflowCard(viewModel.workflow, currentSession.completedWorkflowSteps) { viewModel.toggleWorkflowStep(currentSession, it) } }
            item {
                TestCaptureCard(
                    testIn = currentSession.testIn,
                    testOut = currentSession.testOut,
                    latestSource = latestReading?.sourceDeviceName ?: "No eligible saved reading",
                    onTestIn = { viewModel.captureTestIn(currentSession) },
                    onTestOut = { viewModel.captureTestOut(currentSession) },
                )
            }
            item { ComparisonGrid(viewModel.comparisons(currentSession)) }

            if (!currentSession.isComplete) {
                val step = viewModel.currentStep(currentSession)
                item {
                    WiseCard {
                        Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                            Text("NEXT TEST", style = MaterialTheme.typography.labelLarge, color = ElectricBlue)
                            Text(step.prompt, style = MaterialTheme.typography.headlineMedium)
                            OutlinedTextField(value = note, onValueChange = { note = it }, placeholder = { Text("Technician observation") }, modifier = Modifier.fillMaxWidth())
                            Button(onClick = { viewModel.record(currentSession, TestResult.PASS, note); note = "" }, modifier = Modifier.fillMaxWidth().height(56.dp), colors = ButtonDefaults.buttonColors(containerColor = StatusGreen)) { Text("PASS") }
                            Button(onClick = { viewModel.record(currentSession, TestResult.FAIL, note); note = "" }, modifier = Modifier.fillMaxWidth().height(56.dp), colors = ButtonDefaults.buttonColors(containerColor = StatusRed)) { Text("FAIL") }
                            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                                OutlinedButton(onClick = { viewModel.record(currentSession, TestResult.SKIPPED, note); note = "" }, modifier = Modifier.weight(1f).height(48.dp)) { Text("Skip") }
                                OutlinedButton(onClick = { viewModel.record(currentSession, TestResult.NOT_APPLICABLE, note); note = "" }, modifier = Modifier.weight(1f).height(48.dp)) { Text("N/A") }
                            }
                        }
                    }
                }
            } else {
                item {
                    WiseCard {
                        Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                            Text("CONFIRMED DIAGNOSIS", style = MaterialTheme.typography.labelLarge, color = ElectricBlue)
                            Text(currentSession.finalFinding ?: "No confirmed diagnosis", style = MaterialTheme.typography.bodyLarge)
                            Button(onClick = onFinished, modifier = Modifier.fillMaxWidth().height(56.dp)) { Text("CONTINUE TO REPORT") }
                        }
                    }
                }
            }

            item {
                WiseCard {
                    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                        Text("SERVICE NOTES", style = MaterialTheme.typography.labelLarge, color = ElectricBlue)
                        OutlinedTextField(currentSession.technicianObservations, { viewModel.updateObservations(currentSession, it) }, modifier = Modifier.fillMaxWidth(), minLines = 3, label = { Text("Technician observations") })
                        OutlinedTextField(currentSession.documentedRepair, { viewModel.updateRepair(currentSession, it) }, modifier = Modifier.fillMaxWidth(), minLines = 3, label = { Text("Documented repair") })
                        Button(onClick = { viewModel.generateServiceNotes(currentSession) }, modifier = Modifier.fillMaxWidth().height(56.dp)) { Text("GENERATE SERVICE NOTES") }
                        if (currentSession.serviceNotes.logansReadyServiceNote.isNotBlank()) {
                            Text("LOGAN'S-READY SERVICE NOTE", color = StatusGreen, style = MaterialTheme.typography.labelLarge)
                            Text(currentSession.serviceNotes.logansReadyServiceNote, style = MaterialTheme.typography.bodyMedium)
                            Text("CUSTOMER SUMMARY", color = StatusGreen, style = MaterialTheme.typography.labelLarge)
                            Text(currentSession.serviceNotes.customerSummary, style = MaterialTheme.typography.bodyMedium)
                            Text("WISE2 DIAGNOSTIC RECORD", color = StatusGreen, style = MaterialTheme.typography.labelLarge)
                            Text(currentSession.serviceNotes.wiseDiagnosticRecord, style = MaterialTheme.typography.bodyMedium)
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun CockpitHeader(simulationActive: Boolean, source: String) {
    WiseCard {
        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Text("LIVE | AI DIAGNOSIS | NEXT TEST", style = MaterialTheme.typography.labelLarge, color = ChromeSilver)
            Text("Smart Tools | Live System | Digital Meters | WISE2 IMP", style = MaterialTheme.typography.titleMedium, color = ElectricBlue)
            Text("Current data source: $source", style = MaterialTheme.typography.bodyMedium)
            if (simulationActive) Text("SIMULATION ACTIVE", color = StatusAmber, style = MaterialTheme.typography.titleMedium)
        }
    }
}

@Composable
private fun FieldTestMode(selected: SimulationFixture?, onSelect: (SimulationFixture?) -> Unit) {
    var expanded by remember { mutableStateOf(false) }
    WiseCard {
        Column {
            Text("FIELD TEST MODE", style = MaterialTheme.typography.labelLarge, color = ElectricBlue)
            TextButton(onClick = { expanded = true }, modifier = Modifier.fillMaxWidth().height(48.dp)) {
                Text(selected?.name?.replace('_', ' ') ?: "Production readings only")
            }
            DropdownMenu(expanded = expanded, onDismissRequest = { expanded = false }) {
                DropdownMenuItem(text = { Text("Production readings only") }, onClick = { expanded = false; onSelect(null) })
                SimulationFixture.values().forEach { fixture ->
                    DropdownMenuItem(text = { Text(fixture.name.replace('_', ' ')) }, onClick = { expanded = false; onSelect(fixture) })
                }
            }
        }
    }
}

@Composable
private fun WorkflowCard(steps: List<FieldWorkflowStep>, completed: Set<FieldWorkflowStep>, onToggle: (FieldWorkflowStep) -> Unit) {
    WiseCard {
        Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
            Text("WORKFLOW", style = MaterialTheme.typography.labelLarge, color = ElectricBlue)
            steps.forEachIndexed { index, step ->
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Checkbox(checked = step in completed, onCheckedChange = { onToggle(step) })
                    Text("${index + 1} ${step.name.replace('_', ' ')}", style = MaterialTheme.typography.bodyMedium)
                }
            }
        }
    }
}

@Composable
private fun TestCaptureCard(testIn: DiagnosticCapture?, testOut: DiagnosticCapture?, latestSource: String, onTestIn: () -> Unit, onTestOut: () -> Unit) {
    WiseCard {
        Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
            Text("TEST IN / TEST OUT", style = MaterialTheme.typography.labelLarge, color = ElectricBlue)
            Text("Latest eligible reading: $latestSource", style = MaterialTheme.typography.bodyMedium)
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                Button(onClick = onTestIn, modifier = Modifier.weight(1f).height(56.dp)) { Text(if (testIn == null) "TEST IN" else "RETAKE IN") }
                Button(onClick = onTestOut, modifier = Modifier.weight(1f).height(56.dp), colors = ButtonDefaults.buttonColors(containerColor = StatusAmber)) { Text(if (testOut == null) "TEST OUT" else "RETAKE OUT") }
            }
            Text("Test In: ${testIn?.capturedAtEpochMillis ?: "Missing"}")
            Text("Test Out: ${testOut?.capturedAtEpochMillis ?: "Missing"}")
        }
    }
}

@Composable
private fun ComparisonGrid(comparisons: List<DiagnosticComparison>) {
    WiseCard {
        Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
            Text("LIVE TRENDS", style = MaterialTheme.typography.labelLarge, color = ElectricBlue)
            if (comparisons.isEmpty()) {
                Text("Capture Test In and Test Out to compare available measurements.")
                return@Column
            }
            LazyVerticalGrid(columns = GridCells.Fixed(2), modifier = Modifier.height(576.dp), horizontalArrangement = Arrangement.spacedBy(10.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                items(comparisons) { comparison ->
                    Box(Modifier.background(Gunmetal).padding(10.dp)) {
                        Column {
                            Text(comparison.label, color = ChromeSilver, style = MaterialTheme.typography.labelMedium)
                            Text("${comparison.before?.fmt() ?: "--"} -> ${comparison.after?.fmt() ?: "--"} ${comparison.unit}", color = ElectricBlue, style = MaterialTheme.typography.titleMedium)
                            Text("Change ${comparison.change?.signedFmt() ?: "--"}", color = if (comparison.source.name == "MISSING") StatusRed else StatusAmber)
                            Text(comparison.source.name, style = MaterialTheme.typography.labelSmall)
                            Text(comparison.conclusion, style = MaterialTheme.typography.bodySmall)
                        }
                    }
                }
            }
        }
    }
}

private fun Double.fmt(): String = "%.2f".format(this).trimEnd('0').trimEnd('.')
private fun Double.signedFmt(): String = "%+.2f".format(this).trimEnd('0').trimEnd('.')
