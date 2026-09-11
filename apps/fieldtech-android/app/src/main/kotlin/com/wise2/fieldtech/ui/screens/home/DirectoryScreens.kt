package com.wise2.fieldtech.ui.screens.home

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.wise2.fieldtech.domain.model.Job
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
fun JobsScreen(viewModel: HomeViewModel, onBack: () -> Unit, onJobClick: (String) -> Unit) {
    val state by viewModel.uiState.collectAsState()
    Scaffold(topBar = { DirectoryTopBar("JOBS", onBack) }) { padding ->
        LazyColumn(contentPadding = PaddingValues(start = 16.dp, end = 16.dp, top = padding.calculateTopPadding() + 12.dp, bottom = 24.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            items(state.jobs, key = { it.id }) { job -> DirectoryJobCard(job, onJobClick) }
            if (state.jobs.isEmpty()) item { Text("No cached jobs yet.") }
        }
    }
}

private data class CustomerEntry(val key: String, val name: String, val phone: String, val address: String, val latestJob: Job)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CustomersScreen(viewModel: HomeViewModel, onBack: () -> Unit, onJobClick: (String) -> Unit) {
    val state by viewModel.uiState.collectAsState()
    val customers = state.jobs
        .groupBy { listOf(it.customerName.trim(), it.customerPhone.trim(), it.address.trim()).joinToString("|") }
        .map { (key, jobs) ->
            val latest = jobs.maxBy { it.updatedAtEpochMillis }
            CustomerEntry(key, latest.customerName, latest.customerPhone, latest.address, latest)
        }
        .sortedBy { it.name.lowercase(Locale.US) }

    Scaffold(topBar = { DirectoryTopBar("CUSTOMERS", onBack) }) { padding ->
        LazyColumn(contentPadding = PaddingValues(start = 16.dp, end = 16.dp, top = padding.calculateTopPadding() + 12.dp, bottom = 24.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            items(customers, key = { it.key }) { customer ->
                WiseCard(modifier = Modifier.clickable { onJobClick(customer.latestJob.id) }) {
                    Column {
                        Text(customer.name.ifBlank { "Unnamed customer" }, style = MaterialTheme.typography.titleMedium, color = ElectricBlue)
                        if (customer.phone.isNotBlank()) Text(customer.phone)
                        if (customer.address.isNotBlank()) Text(customer.address, style = MaterialTheme.typography.bodyMedium)
                        Spacer(Modifier.height(6.dp))
                        Text("Open latest job", style = MaterialTheme.typography.labelMedium)
                    }
                }
            }
            if (customers.isEmpty()) item { Text("No customers are available from cached jobs yet.") }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun DirectoryTopBar(title: String, onBack: () -> Unit) {
    TopAppBar(
        title = { Text(title, color = ElectricBlue) },
        navigationIcon = { IconButton(onClick = onBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back") } },
    )
}

@Composable
private fun DirectoryJobCard(job: Job, onJobClick: (String) -> Unit) {
    WiseCard(modifier = Modifier.clickable { onJobClick(job.id) }) {
        Column {
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                Text(SimpleDateFormat("MMM d • h:mm a", Locale.US).format(Date(job.appointmentAtEpochMillis)), color = ElectricBlue)
                StatusPill(job.status.label().uppercase(), job.status.color())
            }
            Spacer(Modifier.height(6.dp))
            Text(job.customerName, style = MaterialTheme.typography.titleMedium)
            Text(job.address, style = MaterialTheme.typography.bodyMedium)
        }
    }
}
