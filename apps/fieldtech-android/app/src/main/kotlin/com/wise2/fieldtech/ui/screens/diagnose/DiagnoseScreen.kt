package com.wise2.fieldtech.ui.screens.diagnose

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
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
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.wise2.fieldtech.domain.model.TestResult
import com.wise2.fieldtech.ui.components.WiseCard
import com.wise2.fieldtech.ui.theme.ElectricBlue
import com.wise2.fieldtech.ui.theme.StatusGreen
import com.wise2.fieldtech.ui.theme.StatusRed

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DiagnoseScreen(viewModel: DiagnoseViewModel, onBack: () -> Unit, onFinished: () -> Unit) {
    val session by viewModel.session.collectAsState()
    var note by remember { mutableStateOf("") }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("DIAGNOSE") },
                navigationIcon = { IconButton(onClick = onBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back") } },
            )
        },
    ) { padding ->
        val currentSession = session
        if (currentSession == null) {
            LazyColumn(contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                item { Text("Select a category to start guided troubleshooting.", style = MaterialTheme.typography.bodyLarge) }
                items(viewModel.categories) { category ->
                    WiseCard {
                        Column {
                            Text(category.name.replace('_', ' '), style = MaterialTheme.typography.titleMedium)
                            Spacer(Modifier.height(8.dp))
                            Button(onClick = { viewModel.startCategory(category) }, modifier = Modifier.fillMaxWidth()) {
                                Text("Start")
                            }
                        }
                    }
                }
            }
            return@Scaffold
        }

        if (currentSession.isComplete) {
            Column(Modifier.fillMaxWidth().padding(16.dp)) {
                Text("DIAGNOSTIC COMPLETE", style = MaterialTheme.typography.titleLarge, color = ElectricBlue)
                Spacer(Modifier.height(12.dp))
                Text(currentSession.finalFinding ?: "", style = MaterialTheme.typography.bodyLarge)
                Spacer(Modifier.height(24.dp))
                Text(
                    "This is decision support, not a verified fault, until confirmed by direct measurement — spec §12.",
                    style = MaterialTheme.typography.bodyMedium,
                )
                Spacer(Modifier.height(24.dp))
                Button(onClick = onFinished, modifier = Modifier.fillMaxWidth().height(56.dp)) { Text("CONTINUE TO REPORT") }
            }
            return@Scaffold
        }

        val step = viewModel.currentStep(currentSession)
        Column(Modifier.padding(16.dp)) {
            Text("STEP ${currentSession.results.size + 1}", style = MaterialTheme.typography.labelLarge, color = ElectricBlue)
            Spacer(Modifier.height(8.dp))
            Text(step.prompt, style = MaterialTheme.typography.headlineMedium)
            Spacer(Modifier.height(16.dp))
            OutlinedTextField(
                value = note,
                onValueChange = { note = it },
                placeholder = { Text("Observation note (optional)") },
                modifier = Modifier.fillMaxWidth(),
            )
            Spacer(Modifier.height(16.dp))
            Button(
                onClick = { viewModel.record(currentSession, TestResult.PASS, note); note = "" },
                modifier = Modifier.fillMaxWidth().height(56.dp),
                colors = androidx.compose.material3.ButtonDefaults.buttonColors(containerColor = StatusGreen),
            ) { Text("PASS") }
            Spacer(Modifier.height(8.dp))
            Button(
                onClick = { viewModel.record(currentSession, TestResult.FAIL, note); note = "" },
                modifier = Modifier.fillMaxWidth().height(56.dp),
                colors = androidx.compose.material3.ButtonDefaults.buttonColors(containerColor = StatusRed),
            ) { Text("FAIL") }
            Spacer(Modifier.height(8.dp))
            androidx.compose.foundation.layout.Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                OutlinedButton(onClick = { viewModel.record(currentSession, TestResult.SKIPPED, note); note = "" }) { Text("Skip") }
                OutlinedButton(onClick = { viewModel.record(currentSession, TestResult.NOT_APPLICABLE, note); note = "" }) { Text("N/A") }
            }
        }
    }
}
