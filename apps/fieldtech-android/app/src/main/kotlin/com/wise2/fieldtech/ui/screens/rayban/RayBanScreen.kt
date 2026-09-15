package com.wise2.fieldtech.ui.screens.rayban

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
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
            .verticalScroll(rememberScrollState())
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
            Text(
                "Ray-Ban Meta",
                style = MaterialTheme.typography.headlineSmall,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.weight(1f).padding(start = 8.dp),
            )
        }

        // Status Card
        StatusCard(uiState = uiState, modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp))

        Spacer(modifier = Modifier.height(24.dp))

        // If unavailable, show setup message
        if (!uiState.connected) {
            UnavailableCard(
                onConnect = { viewModel.connectGlasses() },
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp)
            )
        } else {
            // Control Panel
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
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp)
            )
        }

        Spacer(modifier = Modifier.height(24.dp))
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
                        .height(16.dp)
                        .height(16.dp)
                        .weight(0.02f)
                )
                Spacer(modifier = Modifier.weight(0.02f))
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
                    uiState.connected -> "Glasses are online and ready"
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
            .background(
                color = MaterialTheme.colorScheme.surfaceVariant,
                shape = RoundedCornerShape(12.dp)
            )
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Text(
            "Ask WISE²",
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

        OutlinedButton(
            onClick = onCapture,
            modifier = Modifier.fillMaxWidth(),
            enabled = uiState.canCapture,
        ) {
            Text("Capture Frame")
        }

        OutlinedButton(
            onClick = onDisconnect,
            modifier = Modifier.fillMaxWidth(),
        ) {
            Text("Disconnect")
        }
    }
}
