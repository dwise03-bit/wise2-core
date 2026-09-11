package com.wise2.fieldtech.ui.screens.newjob

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.Button
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
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import com.wise2.fieldtech.ui.theme.ElectricBlue

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun NewJobScreen(
    viewModel: NewJobViewModel,
    onBack: () -> Unit,
    onCreated: (String) -> Unit,
) {
    val state by viewModel.uiState.collectAsState()

    LaunchedEffect(state.createdJobId) {
        state.createdJobId?.let(onCreated)
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("NEW JOB", color = ElectricBlue) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                    }
                },
            )
        },
    ) { padding ->
        LazyColumn(
            contentPadding = PaddingValues(
                start = 16.dp,
                end = 16.dp,
                top = padding.calculateTopPadding() + 16.dp,
                bottom = 32.dp,
            ),
            verticalArrangement = Arrangement.spacedBy(14.dp),
        ) {
            item { Text("Create a real service call. It saves locally first and syncs when online.", style = MaterialTheme.typography.bodyMedium) }
            item {
                OutlinedTextField(
                    value = state.customerName,
                    onValueChange = viewModel::setCustomerName,
                    label = { Text("Customer name *") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth(),
                )
            }
            item {
                OutlinedTextField(
                    value = state.customerPhone,
                    onValueChange = viewModel::setCustomerPhone,
                    label = { Text("Phone") },
                    singleLine = true,
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone),
                    modifier = Modifier.fillMaxWidth(),
                )
            }
            item {
                OutlinedTextField(
                    value = state.address,
                    onValueChange = viewModel::setAddress,
                    label = { Text("Service address *") },
                    modifier = Modifier.fillMaxWidth(),
                )
            }
            item {
                OutlinedTextField(
                    value = state.complaint,
                    onValueChange = viewModel::setComplaint,
                    label = { Text("Customer complaint / scope") },
                    minLines = 3,
                    modifier = Modifier.fillMaxWidth(),
                )
            }
            state.errorMessage?.let { message ->
                item { Text(message, color = MaterialTheme.colorScheme.error) }
            }
            item {
                Button(
                    onClick = viewModel::createJob,
                    enabled = !state.isSaving,
                    modifier = Modifier.fillMaxWidth().height(56.dp),
                ) {
                    if (state.isSaving) CircularProgressIndicator(modifier = Modifier.height(22.dp))
                    else Text("CREATE JOB")
                }
            }
            item { Spacer(Modifier.height(8.dp)) }
        }
    }
}
