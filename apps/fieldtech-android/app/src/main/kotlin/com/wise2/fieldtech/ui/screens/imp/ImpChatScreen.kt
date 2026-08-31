package com.wise2.fieldtech.ui.screens.imp

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.Send
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
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
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.wise2.fieldtech.domain.model.ImpMessage
import com.wise2.fieldtech.ui.theme.ConcreteBlack
import com.wise2.fieldtech.ui.theme.ElectricBlue
import com.wise2.fieldtech.ui.theme.Gunmetal

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ImpChatScreen(viewModel: ImpChatViewModel, onBack: () -> Unit) {
    val messages by viewModel.messages.collectAsState()
    val isSending by viewModel.isSending.collectAsState()
    val fieldpiece by viewModel.fieldpieceEvidence.collectAsState()
    var draft by remember { mutableStateOf("") }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Column { Text("WISE² IMP"); Text("Your AI Field Assistant", style = MaterialTheme.typography.bodyMedium) } },
                navigationIcon = { IconButton(onClick = onBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back") } },
            )
        },
        bottomBar = {
            Row(
                modifier = Modifier.fillMaxWidth().padding(12.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                OutlinedTextField(
                    value = draft,
                    onValueChange = { draft = it },
                    placeholder = { Text("Ask IMP anything…") },
                    modifier = Modifier.weight(1f),
                )
                if (isSending) {
                    CircularProgressIndicator(modifier = Modifier.padding(8.dp))
                } else {
                    IconButton(onClick = { viewModel.ask(draft); draft = "" }) {
                        Icon(Icons.AutoMirrored.Filled.Send, contentDescription = "Send", tint = ElectricBlue)
                    }
                }
            }
        },
    ) { padding ->
        LazyColumn(
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
            modifier = Modifier.fillMaxSize().padding(top = padding.calculateTopPadding()),
        ) {
            item {
                Text(
                    if (fieldpiece == null) {
                        "Fieldpiece: no captured reading. Save one from Live Readings on this Android app."
                    } else {
                        val demo = if (fieldpiece!!.isDemoData) " · DEMO" else ""
                        "Fieldpiece ${fieldpiece!!.sourceDeviceName}$demo · " +
                            fieldpiece!!.cards.joinToString("  ") { card ->
                                "${card.label} ${if (card.available) card.value else "—"}"
                            }
                    },
                    style = MaterialTheme.typography.bodySmall,
                    color = ElectricBlue,
                )
            }
            items(messages) { message -> ChatBubble(message) }
        }
    }
}

@Composable
private fun ChatBubble(message: ImpMessage) {
    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = if (message.isFromUser) Arrangement.End else Arrangement.Start) {
        Box(
            modifier = Modifier
                .background(if (message.isFromUser) Gunmetal else ConcreteBlack, RoundedCornerShape(16.dp))
                .padding(12.dp),
        ) {
            Text(message.text, style = MaterialTheme.typography.bodyLarge)
        }
    }
}
