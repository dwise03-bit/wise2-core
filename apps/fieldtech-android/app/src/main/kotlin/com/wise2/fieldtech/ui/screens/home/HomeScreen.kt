package com.wise2.fieldtech.ui.screens.home

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
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
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Bluetooth
import androidx.compose.material.icons.filled.Build
import androidx.compose.material.icons.filled.Call
import androidx.compose.material.icons.filled.Checklist
import androidx.compose.material.icons.filled.Cloud
import androidx.compose.material.icons.filled.Groups
import androidx.compose.material.icons.filled.Handyman
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Inventory2
import androidx.compose.material.icons.filled.ListAlt
import androidx.compose.material.icons.filled.Message
import androidx.compose.material.icons.filled.MoreHoriz
import androidx.compose.material.icons.filled.Navigation
import androidx.compose.material.icons.filled.QrCodeScanner
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.SmartToy
import androidx.compose.material.icons.filled.Speed
import androidx.compose.material.icons.filled.Summarize
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.wise2.fieldtech.domain.model.Job
import com.wise2.fieldtech.domain.model.JobStatus
import com.wise2.fieldtech.ui.components.ConnectivityBanner
import com.wise2.fieldtech.ui.components.DemoDataBadge
import com.wise2.fieldtech.ui.components.ModernNavigationBar
import com.wise2.fieldtech.ui.components.NavItem
import com.wise2.fieldtech.ui.components.StatusPill
import com.wise2.fieldtech.ui.components.WiseCard
import com.wise2.fieldtech.ui.components.color
import com.wise2.fieldtech.ui.components.label
import com.wise2.fieldtech.ui.theme.ChromeSilver
import com.wise2.fieldtech.ui.theme.ConcreteBlack
import com.wise2.fieldtech.ui.theme.ElectricBlue
import com.wise2.fieldtech.ui.theme.Gunmetal
import com.wise2.fieldtech.ui.theme.JetBlack
import com.wise2.fieldtech.ui.theme.StatusGreen
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

@Composable
fun HomeScreen(
    viewModel: HomeViewModel,
    onJobClick: (String) -> Unit,
    onDiagnose: (String) -> Unit,
    onLiveReadings: (String) -> Unit,
    onEquipment: (String) -> Unit,
    onImp: (String) -> Unit,
    onReport: (String) -> Unit,
    onNewJob: () -> Unit,
    onJobs: () -> Unit,
    onCustomers: () -> Unit,
    onSettings: () -> Unit,
) {
    val state by viewModel.uiState.collectAsState()
    val activeJob = HomeCommandPolicy.activeJob(state.jobs)
    val context = LocalContext.current

    Surface(modifier = Modifier.fillMaxSize(), color = JetBlack) {
        Column(modifier = Modifier.fillMaxSize()) {
            CommandHeader(
                technicianName = state.technicianName,
                isOnline = state.isOnline,
                onRefresh = viewModel::refresh,
                onSettings = onSettings,
            )
            ConnectivityBanner(state.isOnline, state.pendingSyncCount)

            LazyColumn(
                modifier = Modifier.weight(1f),
                contentPadding = PaddingValues(12.dp),
                verticalArrangement = Arrangement.spacedBy(14.dp),
            ) {
                item {
                    Column {
                        Text("Good ${dayPart()}, ${state.technicianName}", style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold)
                        Text(SimpleDateFormat("EEEE • MMM d", Locale.US).format(Date()), color = ChromeSilver, style = MaterialTheme.typography.bodyMedium)
                    }
                }

                item {
                    SectionTitle("COMMAND SHORTCUTS")
                    Spacer(Modifier.height(8.dp))
                    ShortcutRows(
                        activeJob = activeJob,
                        onNewJob = onNewJob,
                        onCustomers = onCustomers,
                        onJobs = onJobs,
                        onImp = { activeJob?.id?.let(onImp) },
                    )
                }

                item {
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                        SectionTitle("TODAY'S JOBS (${state.jobs.count { it.status != JobStatus.COMPLETE }})")
                        Text("ALL JOBS", color = ElectricBlue, modifier = Modifier.clickable(onClick = onJobs), style = MaterialTheme.typography.labelMedium)
                    }
                }

                val visibleJobs = state.jobs.filter { it.status != JobStatus.COMPLETE }.take(4)
                if (visibleJobs.isEmpty()) item { DisabledInfoCard("No active jobs", "Create a job to unlock job-specific field actions.") }
                items(visibleJobs, key = { it.id }) { job ->
                    CommandJobCard(
                        job = job,
                        onView = { onJobClick(job.id) },
                        onNavigate = {
                            HomeCommandPolicy.navigationUri(job.address)?.let { uri ->
                                runCatching { context.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(uri))) }
                            }
                        },
                        onCall = {
                            HomeCommandPolicy.dialUri(job.customerPhone)?.let { uri ->
                                runCatching { context.startActivity(Intent(Intent.ACTION_DIAL, Uri.parse(uri))) }
                            }
                        },
                    )
                }

                item {
                    SectionTitle("QUICK ACTIONS")
                    Spacer(Modifier.height(8.dp))
                    ActionGrid(
                        actions = listOf(
                            CommandAction("DIAGNOSE", "Guided troubleshooting", Icons.Filled.Handyman, activeJob != null) { activeJob?.id?.let(onDiagnose) },
                            CommandAction("LIVE READINGS", "Fieldpiece + BLE data", Icons.Filled.Speed, activeJob != null) { activeJob?.id?.let(onLiveReadings) },
                            CommandAction("CREATE REPORT", "Build job report", Icons.Filled.Summarize, activeJob != null) { activeJob?.id?.let(onReport) },
                            CommandAction("EQUIPMENT", "Asset info & history", Icons.Filled.Build, HomeCommandPolicy.canOpenEquipment(activeJob)) { activeJob?.equipmentId?.let(onEquipment) },
                            CommandAction("CHECKLISTS", "Not configured", Icons.Filled.Checklist, false) {},
                            CommandAction("ASSET SCAN", "Not configured", Icons.Filled.QrCodeScanner, false) {},
                        ),
                    )
                }

                item {
                    SectionTitle("TOOLS & INTEGRATIONS")
                    Spacer(Modifier.height(8.dp))
                    ActionGrid(
                        actions = listOf(
                            CommandAction("FIELDPIECE / BLE", "Connect live tools", Icons.Filled.Bluetooth, activeJob != null) { activeJob?.id?.let(onLiveReadings) },
                            CommandAction("CLOUD SYNC", if (state.isOnline) "Online • ${state.pendingSyncCount} pending" else "Offline • queued locally", Icons.Filled.Cloud, true) { viewModel.refresh() },
                            CommandAction("WISE² AI", "Job-aware IMP assistant", Icons.Filled.SmartToy, activeJob != null) { activeJob?.id?.let(onImp) },
                            CommandAction("PARTS / INVENTORY", "Not configured", Icons.Filled.Inventory2, false) {},
                        ),
                    )
                }

                item {
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                        Button(onClick = onNewJob, modifier = Modifier.weight(1f).height(56.dp)) {
                            Icon(Icons.Filled.Add, contentDescription = null)
                            Text("  NEW JOB")
                        }
                        OutlinedButton(onClick = {}, enabled = false, modifier = Modifier.weight(1f).height(56.dp)) {
                            Icon(Icons.Filled.QrCodeScanner, contentDescription = null)
                            Text("  SCAN")
                        }
                    }
                    Text("Equipment scanning: Not configured", style = MaterialTheme.typography.labelSmall, color = ChromeSilver, modifier = Modifier.padding(top = 4.dp))
                }
            }

            ModernNavigationBar(
                selectedIndex = 0,
                items = listOf(
                    NavItem(Icons.Filled.Home, "Home", onClick = {}),
                    NavItem(Icons.Filled.ListAlt, "Jobs", onClick = onJobs),
                    NavItem(Icons.Filled.Groups, "Customers", onClick = onCustomers),
                    NavItem(Icons.Filled.Message, "Messages", enabled = false, unavailableLabel = "Not configured", onClick = {}),
                    NavItem(Icons.Filled.MoreHoriz, "More", onClick = onSettings),
                ),
            )
        }
    }
}

@Composable
private fun CommandHeader(technicianName: String, isOnline: Boolean, onRefresh: () -> Unit, onSettings: () -> Unit) {
    Row(
        modifier = Modifier.fillMaxWidth().background(ConcreteBlack).padding(horizontal = 14.dp, vertical = 10.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Column {
            Text("WISE²", color = ChromeSilver, fontWeight = FontWeight.Black, style = MaterialTheme.typography.titleSmall)
            Text("FIELD TECH", color = ElectricBlue, fontWeight = FontWeight.Black, style = MaterialTheme.typography.titleLarge)
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(Modifier.size(7.dp).background(if (isOnline) StatusGreen else Color.Gray, RoundedCornerShape(99.dp)))
                Text("  ${if (isOnline) "ONLINE" else "OFFLINE"} • $technicianName", style = MaterialTheme.typography.labelSmall, color = ChromeSilver)
            }
        }
        Row {
            IconButton(onClick = onRefresh) { Icon(Icons.Filled.Refresh, contentDescription = "Refresh", tint = ElectricBlue) }
            IconButton(onClick = onSettings) { Icon(Icons.Filled.Settings, contentDescription = "Settings", tint = ChromeSilver) }
        }
    }
}

@Composable
private fun ShortcutRows(activeJob: Job?, onNewJob: () -> Unit, onCustomers: () -> Unit, onJobs: () -> Unit, onImp: () -> Unit) {
    val first = listOf(
        CommandAction("SCAN EQUIPMENT", "Not configured", Icons.Filled.QrCodeScanner, false) {},
        CommandAction("NEW JOB", "Create service call", Icons.Filled.Add, true, onNewJob),
        CommandAction("CUSTOMERS", "Job-backed directory", Icons.Filled.Groups, true, onCustomers),
        CommandAction("WORK ORDERS", "All jobs", Icons.Filled.ListAlt, true, onJobs),
    )
    val second = listOf(
        CommandAction("PARTS", "Not configured", Icons.Filled.Inventory2, false) {},
        CommandAction("CALL / TEXT", if (activeJob == null) "Select a job" else "Open active job", Icons.Filled.Call, activeJob != null) {},
        CommandAction("AI ASSIST", "WISE² IMP", Icons.Filled.SmartToy, activeJob != null, onImp),
    )
    ActionGrid(first)
    Spacer(Modifier.height(8.dp))
    ActionGrid(second)
}

private data class CommandAction(val title: String, val subtitle: String, val icon: ImageVector, val enabled: Boolean, val onClick: () -> Unit)

@Composable
private fun ActionGrid(actions: List<CommandAction>) {
    val rows = actions.chunked(2)
    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        rows.forEach { rowActions ->
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                rowActions.forEach { action -> ActionTile(action, Modifier.weight(1f)) }
                if (rowActions.size == 1) Spacer(Modifier.weight(1f))
            }
        }
    }
}

@Composable
private fun ActionTile(action: CommandAction, modifier: Modifier = Modifier) {
    Surface(
        modifier = modifier.height(88.dp).clickable(enabled = action.enabled, onClick = action.onClick),
        color = if (action.enabled) ConcreteBlack else Gunmetal.copy(alpha = 0.55f),
        shape = RoundedCornerShape(14.dp),
    ) {
        Row(modifier = Modifier.padding(12.dp), verticalAlignment = Alignment.CenterVertically) {
            Icon(action.icon, contentDescription = action.title, tint = if (action.enabled) ElectricBlue else Color.Gray, modifier = Modifier.size(25.dp))
            Spacer(Modifier.width(10.dp))
            Column {
                Text(action.title, fontWeight = FontWeight.Bold, style = MaterialTheme.typography.labelLarge, color = if (action.enabled) ChromeSilver else Color.Gray)
                Text(action.subtitle, style = MaterialTheme.typography.bodySmall, color = if (action.enabled) ChromeSilver else Color.Gray, maxLines = 2, overflow = TextOverflow.Ellipsis)
            }
        }
    }
}

@Composable
private fun CommandJobCard(job: Job, onView: () -> Unit, onNavigate: () -> Unit, onCall: () -> Unit) {
    WiseCard {
        Column {
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(SimpleDateFormat("h:mm a", Locale.US).format(Date(job.appointmentAtEpochMillis)), color = ElectricBlue, fontWeight = FontWeight.Bold)
                    Text(job.customerName, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                }
                StatusPill(job.status.label().uppercase(), job.status.color())
            }
            if (job.address.isNotBlank()) Text(job.address, style = MaterialTheme.typography.bodyMedium, maxLines = 2)
            if (job.complaint.isNotBlank()) Text(job.complaint, style = MaterialTheme.typography.bodySmall, maxLines = 2, overflow = TextOverflow.Ellipsis)
            if (job.isDemoData) { Spacer(Modifier.height(6.dp)); DemoDataBadge() }
            Spacer(Modifier.height(10.dp))
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                Button(onClick = onView, modifier = Modifier.weight(1f), contentPadding = PaddingValues(horizontal = 6.dp)) { Text("VIEW") }
                OutlinedButton(onClick = onNavigate, enabled = HomeCommandPolicy.canNavigate(job), modifier = Modifier.weight(1f), contentPadding = PaddingValues(horizontal = 6.dp)) {
                    Icon(Icons.Filled.Navigation, contentDescription = null, modifier = Modifier.size(16.dp)); Text(" NAV")
                }
                OutlinedButton(onClick = onCall, enabled = HomeCommandPolicy.canCall(job), modifier = Modifier.weight(1f), contentPadding = PaddingValues(horizontal = 6.dp)) {
                    Icon(Icons.Filled.Call, contentDescription = null, modifier = Modifier.size(16.dp)); Text(" CALL")
                }
            }
        }
    }
}

@Composable private fun SectionTitle(text: String) = Text(text, color = ElectricBlue, fontWeight = FontWeight.Bold, style = MaterialTheme.typography.labelLarge)

@Composable
private fun DisabledInfoCard(title: String, subtitle: String) {
    Surface(color = ConcreteBlack, shape = RoundedCornerShape(14.dp), modifier = Modifier.fillMaxWidth()) {
        Column(Modifier.padding(14.dp)) { Text(title, fontWeight = FontWeight.Bold); Text(subtitle, style = MaterialTheme.typography.bodySmall, color = ChromeSilver) }
    }
}

private fun dayPart(): String = when (java.util.Calendar.getInstance().get(java.util.Calendar.HOUR_OF_DAY)) {
    in 0..11 -> "Morning"
    in 12..16 -> "Afternoon"
    else -> "Evening"
}
