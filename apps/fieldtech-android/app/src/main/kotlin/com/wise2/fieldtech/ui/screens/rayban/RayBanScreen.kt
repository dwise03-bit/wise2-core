package com.wise2.fieldtech.ui.screens.rayban

import androidx.compose.foundation.background
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.Button
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.material3.TextField
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.wise2.fieldtech.wearables.RayBanUiState

@Composable
fun RayBanScreen(
    viewModel: RayBanViewModel,
    onBack: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val uiState by viewModel.uiState.collectAsState()
    var queryText by remember { mutableStateOf("") }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
    ) {
        // Header
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            IconButton(onClick = onBack) {
                Icon(Icons.Default.ArrowBack, contentDescription = "Back")
            }
            Column(modifier = Modifier.weight(1f).padding(start = 8.dp)) {
                Text(
                    "Ray-Ban Meta",
                    style = MaterialTheme.typography.headlineSmall,
                    fontWeight = FontWeight.Bold,
                )
                Text(
                    "Field Tech Companion",
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
            Box(
                modifier = Modifier
                    .size(12.dp)
                    .background(
                        if (uiState.connected) Color(0xFF4CAF50) else Color(0xFFF44336),
                        shape = RoundedCornerShape(6.dp)
                    )
            )
        }

        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 16.dp)
        ) {
            // Status Card
            item {
                StatusCard(uiState = uiState)
                Spacer(modifier = Modifier.height(16.dp))
            }

            // If unavailable, show setup message
            if (!uiState.connected) {
                item {
                    UnavailableCard(
                        onConnect = { viewModel.connectGlasses() },
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                }
            } else {
                // Control Panel
                item {
                    ControlPanel(
                        uiState = uiState,
                        queryText = queryText,
                        onQueryChange = { queryText = it },
                        onAskWise2 = {
                            if (queryText.isNotBlank()) {
                                viewModel.askWise2(queryText)
                                queryText = ""
                            }
                        },
                        onCapture = { viewModel.captureFrame() },
                        onDisconnect = { viewModel.disconnectGlasses() },
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                }

                // Job Context (placeholder)
                item {
                    JobContextPanel()
                    Spacer(modifier = Modifier.height(16.dp))
                }

                // Recent Captures (placeholder)
                item {
                    RecentCapturesPanel()
                    Spacer(modifier = Modifier.height(24.dp))
                }
            }
        }
    }
}

@Composable
private fun StatusCard(
    uiState: RayBanUiState,
    modifier: Modifier = Modifier,
) {
    val statusColor = when {
        uiState.connected -> Color(0xFF4CAF50)
        "CONNECTING" in uiState.statusLabel -> Color(0xFFFFC107)
        else -> Color(0xFFF44336)
    }

    Box(
        modifier = modifier
            .fillMaxWidth()
            .background(
                color = MaterialTheme.colorScheme.surfaceVariant,
                shape = RoundedCornerShape(12.dp)
            )
            .padding(16.dp)
    ) {
        Column {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.fillMaxWidth()
            ) {
                Box(
                    modifier = Modifier
                        .background(statusColor, shape = RoundedCornerShape(4.dp))
                        .size(16.dp)
                )
                Spacer(modifier = Modifier.width(12.dp))
                Text(
                    uiState.statusLabel,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = statusColor,
                )
            }
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                when {
                    uiState.connected -> "Glasses are online and ready • Field capture enabled"
                    "UNAVAILABLE" in uiState.statusLabel -> "Setup required for Ray-Ban Meta integration"
                    else -> "Attempting connection..."
                },
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
        }
    }
}

@Composable
private fun UnavailableCard(
    onConnect: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Column(
        modifier = modifier
            .background(
                color = MaterialTheme.colorScheme.errorContainer,
                shape = RoundedCornerShape(12.dp)
            )
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Text(
            "Ray-Ban Meta Not Available",
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.Bold,
            color = MaterialTheme.colorScheme.onErrorContainer,
        )
        Text(
            "Meta Wearables Device Access Toolkit (DAT) is not configured. " +
            "To enable Ray-Ban Meta integration, install the official SDK and configure your Meta developer credentials.",
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onErrorContainer,
        )
        Button(
            onClick = onConnect,
            modifier = Modifier.fillMaxWidth()
        ) {
            Text("Retry Connection")
        }
    }
}

@Composable
private fun ControlPanel(
    uiState: RayBanUiState,
    queryText: String,
    onQueryChange: (String) -> Unit,
    onAskWise2: () -> Unit,
    onCapture: () -> Unit,
    onDisconnect: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Column(
        modifier = modifier
            .fillMaxWidth()
            .background(
                color = MaterialTheme.colorScheme.surfaceVariant,
                shape = RoundedCornerShape(12.dp)
            )
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Text(
            "🤖 Ask WISE²",
            style = MaterialTheme.typography.titleSmall,
            fontWeight = FontWeight.Bold,
        )

        TextField(
            value = queryText,
            onValueChange = onQueryChange,
            placeholder = { Text("What do you need help with?") },
            modifier = Modifier.fillMaxWidth(),
            enabled = uiState.canAskWise2,
        )

        Button(
            onClick = onAskWise2,
            modifier = Modifier.fillMaxWidth(),
            enabled = uiState.canAskWise2 && queryText.isNotBlank(),
        ) {
            Text("Send to WISE²")
        }

        Spacer(modifier = Modifier.height(8.dp))

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            OutlinedButton(
                onClick = onCapture,
                modifier = Modifier.weight(1f),
                enabled = uiState.canCapture,
            ) {
                Text("📸 Capture")
            }

            OutlinedButton(
                onClick = onDisconnect,
                modifier = Modifier.weight(1f),
            ) {
                Text("Disconnect")
            }
        }
    }
}

@Composable
private fun JobContextPanel(
    modifier: Modifier = Modifier,
) {
    Column(
        modifier = modifier
            .fillMaxWidth()
            .background(
                color = MaterialTheme.colorScheme.secondaryContainer,
                shape = RoundedCornerShape(12.dp)
            )
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        Text(
            "📋 Job Context",
            style = MaterialTheme.typography.titleSmall,
            fontWeight = FontWeight.Bold,
        )

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text("Customer", style = MaterialTheme.typography.labelSmall)
                Text("John Smith", style = MaterialTheme.typography.bodySmall, fontWeight = FontWeight.Bold)
            }
            Column(modifier = Modifier.weight(1f)) {
                Text("Address", style = MaterialTheme.typography.labelSmall)
                Text("123 Main St", style = MaterialTheme.typography.bodySmall, fontWeight = FontWeight.Bold)
            }
        }

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text("Job #", style = MaterialTheme.typography.labelSmall)
                Text("JOB-2026-001", style = MaterialTheme.typography.bodySmall, fontWeight = FontWeight.Bold)
            }
            Column(modifier = Modifier.weight(1f)) {
                Text("Service", style = MaterialTheme.typography.labelSmall)
                Text("HVAC Diagnostic", style = MaterialTheme.typography.bodySmall, fontWeight = FontWeight.Bold)
            }
        }
    }
}

@Composable
private fun RecentCapturesPanel(
    modifier: Modifier = Modifier,
) {
    Column(
        modifier = modifier.fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        Text(
            "📸 Recent Captures (0)",
            style = MaterialTheme.typography.titleSmall,
            fontWeight = FontWeight.Bold,
        )

        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(
                    color = MaterialTheme.colorScheme.surfaceVariant,
                    shape = RoundedCornerShape(8.dp)
                )
                .padding(32.dp),
            contentAlignment = Alignment.Center
        ) {
            Text(
                "No captures yet\nStart by capturing a frame with your glasses",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
        }
    }
}
