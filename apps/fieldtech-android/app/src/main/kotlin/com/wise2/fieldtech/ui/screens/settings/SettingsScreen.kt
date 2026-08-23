package com.wise2.fieldtech.ui.screens.settings

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.Button
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.wise2.fieldtech.ui.components.WiseCard
import com.wise2.fieldtech.ui.theme.ElectricBlue
import com.wise2.fieldtech.ui.theme.StatusGreen
import com.wise2.fieldtech.ui.theme.StatusRed

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsScreen(viewModel: SettingsViewModel, onBack: () -> Unit, onLoggedOut: () -> Unit) {
    val state by viewModel.uiState.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("SETTINGS") },
                navigationIcon = { IconButton(onClick = onBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back") } },
            )
        },
    ) { padding ->
        LazyColumn(contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(16.dp)) {
            item {
                WiseCard {
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                        Column {
                            Text("Demo Mode", style = MaterialTheme.typography.titleMedium)
                            Text("Simulated jobs, readings, and tools", style = MaterialTheme.typography.bodyMedium)
                        }
                        Switch(checked = state.demoModeEnabled, onCheckedChange = viewModel::setDemoMode)
                    }
                }
            }

            item {
                WiseCard {
                    Column {
                        Text("Application Version", style = MaterialTheme.typography.titleMedium)
                        Text(state.currentVersionName, style = MaterialTheme.typography.bodyLarge, color = ElectricBlue)
                        Spacer(Modifier.height(12.dp))
                        Button(onClick = viewModel::checkForUpdate, modifier = Modifier.fillMaxWidth()) { Text("CHECK FOR UPDATES") }
                        Spacer(Modifier.height(8.dp))
                        UpdateStatusText(state.updateCheckState)
                    }
                }
            }

            item {
                WiseCard {
                    Column {
                        Text("Server", style = MaterialTheme.typography.titleMedium)
                        Text(com.wise2.fieldtech.BuildConfig.API_BASE_URL, style = MaterialTheme.typography.bodyMedium)
                    }
                }
            }

            item {
                OutlinedButton(
                    onClick = { viewModel.logout(); onLoggedOut() },
                    modifier = Modifier.fillMaxWidth().height(56.dp),
                ) { Text("LOG OUT", color = StatusRed) }
            }
        }
    }
}

@Composable
private fun UpdateStatusText(state: UpdateCheckState) {
    when (state) {
        UpdateCheckState.Idle -> Unit
        UpdateCheckState.Checking -> Text("Checking…", style = MaterialTheme.typography.bodyMedium)
        is UpdateCheckState.UpToDate -> Text("Up to date (v${state.currentVersion})", color = StatusGreen)
        is UpdateCheckState.Available -> Text("New version available: v${state.info.versionName}\n${state.info.releaseNotes}", color = ElectricBlue)
        is UpdateCheckState.Failed -> Text(state.message, color = StatusRed)
    }
}
