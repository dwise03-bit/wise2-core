package com.wise2.fieldtech.ui.screens.report

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.Button
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.wise2.fieldtech.ui.components.StatusPill
import com.wise2.fieldtech.ui.components.WiseCard
import com.wise2.fieldtech.ui.theme.ElectricBlue
import com.wise2.fieldtech.ui.theme.StatusGreen

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun JobReportScreen(viewModel: JobReportViewModel, onBack: () -> Unit) {
    val report by viewModel.report.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("JOB REPORT") },
                navigationIcon = { IconButton(onClick = onBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back") } },
            )
        },
    ) { padding ->
        val current = report
        if (current == null) {
            Text("Preparing report…", modifier = Modifier.fillMaxWidth().padding(16.dp))
            return@Scaffold
        }

        LazyColumn(contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(16.dp)) {
            item {
                StatusPill(text = current.status.name, color = if (current.status.name == "DRAFT") ElectricBlue else StatusGreen)
            }
            item { ReportSection("JOB SUMMARY", current.jobSummary) { viewModel.updateField { r -> r.copy(jobSummary = it) } } }
            item { ReportSection("SYSTEM INFORMATION", current.systemInfo) { viewModel.updateField { r -> r.copy(systemInfo = it) } } }
            item { ReportSection("CUSTOMER COMPLAINT", current.customerComplaint) { viewModel.updateField { r -> r.copy(customerComplaint = it) } } }
            item { ReportSection("DIAGNOSIS", current.diagnosis) { viewModel.updateField { r -> r.copy(diagnosis = it) } } }
            item {
                ReportSection("WORK PERFORMED", current.workPerformed.joinToString("\n")) { text ->
                    viewModel.updateField { r -> r.copy(workPerformed = text.split("\n").filter { it.isNotBlank() }) }
                }
            }
            item { ReportSection("RECOMMENDATIONS", current.recommendations) { viewModel.updateField { r -> r.copy(recommendations = it) } } }
            item { ReportSection("TECHNICIAN NOTES", current.technicianNotes) { viewModel.updateField { r -> r.copy(technicianNotes = it) } } }
            item { Text("PHOTOS (${current.photoLocalPaths.size})", style = MaterialTheme.typography.labelLarge, color = ElectricBlue) }

            item {
                androidx.compose.foundation.layout.Row(horizontalArrangement = Arrangement.spacedBy(12.dp), modifier = Modifier.fillMaxWidth()) {
                    OutlinedButton(onClick = viewModel::saveDraft, modifier = Modifier.height(56.dp)) { Text("SAVE DRAFT") }
                    Button(onClick = viewModel::finalizeAndSend, modifier = Modifier.height(56.dp)) { Text("FINALIZE & SEND") }
                }
            }
        }
    }
}

@Composable
private fun ReportSection(label: String, value: String, onChange: (String) -> Unit) {
    WiseCard {
        Column {
            Text(label, style = MaterialTheme.typography.labelLarge, color = ElectricBlue)
            Spacer(Modifier.height(8.dp))
            OutlinedTextField(value = value, onValueChange = onChange, modifier = Modifier.fillMaxWidth())
        }
    }
}
