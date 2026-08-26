package com.wise2.fieldtech.ui.screens.home

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.wise2.fieldtech.domain.model.Job
import com.wise2.fieldtech.domain.model.JobStatus
import com.wise2.fieldtech.ui.components.ConnectivityBanner
import com.wise2.fieldtech.ui.theme.ElectricBlue
import com.wise2.fieldtech.ui.util.ClickDebouncer
import java.text.SimpleDateFormat
import java.util.*

// Professional color palette per brief
private val CarbonBlack = Color(0xFF0A0E27)
private val GunmetalDark = Color(0xFF1a2332)
private val GunmetalLight = Color(0xFF2d3748)
private val OrangeWarmth = Color(0xFFFF6B35)
private val OrangeHeat = Color(0xFFFF4500)
private val NeonGreen = Color(0xFF00FF41)
private val MetallicSilver = Color(0xFFC0C0C0)

@Composable
fun HomeScreenV2(
    viewModel: HomeViewModel,
    onJobClick: (String) -> Unit,
    onStartCall: () -> Unit,
    onScanEquipment: () -> Unit,
    onConnectFieldpiece: (String) -> Unit,
    onDiagnose: (String) -> Unit,
    onPhotos: (String) -> Unit,
    onVoiceNote: (String) -> Unit,
    onResumeCall: (String) -> Unit,
    onMenu: () -> Unit,
) {
    val state by viewModel.uiState.collectAsState()
    val activeJob = state.jobs.firstOrNull { it.status != JobStatus.COMPLETE }

    // Debounce click handlers (500ms minimum between clicks)
    val menuDebouncer = remember { ClickDebouncer(500L) }
    val startCallDebouncer = remember { ClickDebouncer(500L) }
    val scanEquipmentDebouncer = remember { ClickDebouncer(500L) }
    val fieldpieceDebouncer = remember { ClickDebouncer(500L) }
    val diagnoseDebouncer = remember { ClickDebouncer(500L) }
    val photosDebouncer = remember { ClickDebouncer(500L) }
    val voiceNoteDebouncer = remember { ClickDebouncer(500L) }
    val resumeCallDebouncer = remember { ClickDebouncer(500L) }
    val jobClickDebouncers = remember { mutableMapOf<String, ClickDebouncer>() }

    Surface(
        modifier = Modifier.fillMaxSize(),
        color = CarbonBlack,
    ) {
        Column(modifier = Modifier.fillMaxSize()) {
            // Header with metallic branding
            Header(
                onMenu = {
                    if (menuDebouncer.onClicked()) {
                        onMenu()
                    }
                },
                isOnline = state.isOnline,
                pendingSyncCount = state.pendingSyncCount,
            )

            // Main content
            LazyColumn(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth(),
                contentPadding = PaddingValues(12.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp),
            ) {
                // Today's Calls Panel
                item {
                    TodaysCallsPanel(
                        jobs = state.jobs.filter { it.status != JobStatus.COMPLETE },
                        onJobClick = { jobId ->
                            // Get or create debouncer for this job ID
                            val debouncer = jobClickDebouncers.getOrPut(jobId) { ClickDebouncer(500L) }
                            if (debouncer.onClicked()) {
                                onJobClick(jobId)
                            }
                        },
                    )
                }

                // Primary CTA: Start Service Call
                item {
                    PrimaryActionButton(
                        label = "START SERVICE CALL",
                        subtitle = "Begin a new call",
                        onClick = {
                            if (startCallDebouncer.onClicked()) {
                                onStartCall()
                            }
                        },
                    )
                }

                // Quick Actions Grid
                item {
                    QuickActionsGrid(
                        activeJobId = activeJob?.id,
                        onScanEquipment = {
                            if (scanEquipmentDebouncer.onClicked()) {
                                onScanEquipment()
                            }
                        },
                        onConnectFieldpiece = {
                            if (fieldpieceDebouncer.onClicked()) {
                                onConnectFieldpiece(activeJob?.id ?: "")
                            }
                        },
                        onDiagnose = {
                            if (diagnoseDebouncer.onClicked()) {
                                onDiagnose(activeJob?.id ?: "")
                            }
                        },
                        onPhotos = {
                            if (photosDebouncer.onClicked()) {
                                onPhotos(activeJob?.id ?: "")
                            }
                        },
                        onVoiceNote = {
                            if (voiceNoteDebouncer.onClicked()) {
                                onVoiceNote(activeJob?.id ?: "")
                            }
                        },
                        onResumeCall = activeJob?.id?.let {
                            {
                                if (resumeCallDebouncer.onClicked()) {
                                    onResumeCall(it)
                                }
                            }
                        },
                    )
                }

                // Status Strip
                item {
                    StatusStrip(
                        isOnline = state.isOnline,
                        fieldpieceConnected = false, // TODO: get from Bluetooth state
                        pendingSyncCount = state.pendingSyncCount,
                    )
                }
            }

            // Bottom Navigation
            BottomNavigationBar()
        }
    }
}

/**
 * Header with WISE² branding and status indicators
 */
@Composable
fun Header(
    onMenu: () -> Unit,
    isOnline: Boolean,
    pendingSyncCount: Int,
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .background(GunmetalDark)
            .padding(horizontal = 12.dp, vertical = 8.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically,
    ) {
        // Left: WISE² branding
        Column(modifier = Modifier.weight(1f)) {
            Text(
                "WISE²",
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold,
                color = MetallicSilver,
                letterSpacing = 1.sp,
            )
            Text(
                "HVAC FIELD TECH",
                fontSize = 14.sp,
                fontWeight = FontWeight.Bold,
                color = ElectricBlue,
            )
        }

        // Right: status indicators
        Row(
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            // Sync indicator
            if (pendingSyncCount > 0) {
                Badge(
                    containerColor = OrangeWarmth,
                    contentColor = Color.White,
                ) {
                    Text("$pendingSyncCount", fontSize = 10.sp)
                }
            }

            // Connection status
            Icon(
                Icons.Filled.SignalCellularAlt,
                contentDescription = "Signal",
                tint = if (isOnline) NeonGreen else Color.Gray,
                modifier = Modifier.size(20.dp),
            )

            // Menu
            IconButton(onClick = onMenu, modifier = Modifier.size(32.dp)) {
                Icon(
                    Icons.Filled.Menu,
                    contentDescription = "Menu",
                    tint = MetallicSilver,
                )
            }
        }
    }
}

/**
 * Today's Calls - strong dark panel with tappable rows
 */
@Composable
fun TodaysCallsPanel(
    jobs: List<Job>,
    onJobClick: (String) -> Unit,
) {
    if (jobs.isEmpty()) return

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .background(GunmetalLight, RoundedCornerShape(8.dp))
            .padding(12.dp),
    ) {
        Text(
            "TODAY'S CALLS",
            fontSize = 11.sp,
            fontWeight = FontWeight.Bold,
            color = ElectricBlue,
            letterSpacing = 0.5.sp,
        )

        Spacer(Modifier.height(8.dp))

        jobs.forEach { job ->
            JobRow(job = job, onJobClick = onJobClick)
            if (job != jobs.last()) {
                Divider(color = GunmetalDark, thickness = 0.5.dp, modifier = Modifier.padding(vertical = 6.dp))
            }
        }
    }
}

/**
 * Single job row - tappable
 */
@Composable
fun JobRow(
    job: Job,
    onJobClick: (String) -> Unit,
) {
    val timeFormat = SimpleDateFormat("h:mm a", Locale.getDefault())
    val debouncer = remember(job.id) { ClickDebouncer(500L) }

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable {
                if (debouncer.onClicked()) {
                    onJobClick(job.id)
                }
            }
            .padding(vertical = 8.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Column(modifier = Modifier.weight(1f)) {
            Text(
                timeFormat.format(Date(job.appointmentAtEpochMillis)),
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold,
                color = ElectricBlue,
            )
            Text(
                job.customerName,
                fontSize = 11.sp,
                color = Color.White,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
            )
            Text(
                job.address,
                fontSize = 9.sp,
                color = Color.Gray,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
            )
        }

        // Status badge
        StatusBadge(status = job.status)
    }
}

/**
 * Job status badge
 */
@Composable
fun StatusBadge(status: JobStatus) {
    val (bgColor, textColor, label) = when (status) {
        JobStatus.DIAGNOSING, JobStatus.REPAIRING -> Triple(OrangeHeat, Color.White, "ACTIVE")
        JobStatus.EN_ROUTE, JobStatus.ARRIVED -> Triple(OrangeWarmth, Color.White, "EN\nROUTE")
        JobStatus.SCHEDULED -> Triple(ElectricBlue, Color.White, "UP\nNEXT")
        else -> Triple(Color.Gray, Color.White, "READY")
    }

    Surface(
        modifier = Modifier
            .size(45.dp)
            .clip(RoundedCornerShape(4.dp)),
        color = bgColor,
    ) {
        Box(
            modifier = Modifier.fillMaxSize(),
            contentAlignment = Alignment.Center,
        ) {
            Text(
                label,
                fontSize = 7.sp,
                fontWeight = FontWeight.Bold,
                color = textColor,
                maxLines = 2,
            )
        }
    }
}

/**
 * Primary action button - large, illuminated CTA
 */
@Composable
fun PrimaryActionButton(
    label: String,
    subtitle: String,
    onClick: () -> Unit,
) {
    val debouncer = remember(label) { ClickDebouncer(500L) }

    Button(
        onClick = {
            if (debouncer.onClicked()) {
                onClick()
            }
        },
        modifier = Modifier
            .fillMaxWidth()
            .height(56.dp),
        colors = ButtonDefaults.buttonColors(
            containerColor = ElectricBlue,
        ),
        shape = RoundedCornerShape(8.dp),
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center,
        ) {
            Text(
                label,
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold,
                color = CarbonBlack,
                letterSpacing = 0.8.sp,
            )
            Text(
                subtitle,
                fontSize = 9.sp,
                color = GunmetalDark,
            )
        }
    }
}

/**
 * Quick Actions Grid - 3x2 tiles
 */
@Composable
fun QuickActionsGrid(
    activeJobId: String?,
    onScanEquipment: () -> Unit,
    onConnectFieldpiece: () -> Unit,
    onDiagnose: () -> Unit,
    onPhotos: () -> Unit,
    onVoiceNote: () -> Unit,
    onResumeCall: (() -> Unit)?,
) {
    val actions = listOf(
        QuickAction(
            icon = Icons.Filled.QrCode,
            label = "SCAN\nEQUIPMENT",
            onClick = onScanEquipment,
        ),
        QuickAction(
            icon = Icons.Filled.Bluetooth,
            label = "CONNECT\nFIELDPIECE",
            onClick = onConnectFieldpiece,
            enabled = activeJobId != null,
        ),
        QuickAction(
            icon = Icons.Filled.SmartToy,
            label = "QUICK\nDIAGNOSIS",
            onClick = onDiagnose,
            enabled = activeJobId != null,
        ),
        QuickAction(
            icon = Icons.Filled.PhotoCamera,
            label = "PHOTOS &\nDOCS",
            onClick = onPhotos,
            enabled = activeJobId != null,
        ),
        QuickAction(
            icon = Icons.Filled.Mic,
            label = "VOICE\nNOTE",
            onClick = onVoiceNote,
            enabled = activeJobId != null,
        ),
        QuickAction(
            icon = Icons.Filled.PlayArrow,
            label = "RESUME\nCALL",
            onClick = onResumeCall ?: {},
            enabled = activeJobId != null && onResumeCall != null,
        ),
    )

    LazyVerticalGrid(
        columns = GridCells.Fixed(3),
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(8.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        items(actions) { action ->
            QuickActionTile(action = action)
        }
    }
}

data class QuickAction(
    val icon: ImageVector,
    val label: String,
    val onClick: () -> Unit,
    val enabled: Boolean = true,
)

/**
 * Single quick action tile
 */
@Composable
fun QuickActionTile(action: QuickAction) {
    val debouncer = remember(action.label) { ClickDebouncer(500L) }

    Surface(
        modifier = Modifier
            .aspectRatio(1f)
            .clip(RoundedCornerShape(8.dp))
            .clickable(enabled = action.enabled) {
                if (debouncer.onClicked()) {
                    action.onClick()
                }
            },
        color = if (action.enabled) GunmetalLight else GunmetalDark,
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(8.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center,
        ) {
            Icon(
                action.icon,
                contentDescription = action.label,
                tint = if (action.enabled) ElectricBlue else Color.Gray,
                modifier = Modifier.size(24.dp),
            )
            Spacer(Modifier.height(6.dp))
            Text(
                action.label,
                fontSize = 8.sp,
                fontWeight = FontWeight.Bold,
                color = if (action.enabled) Color.White else Color.Gray,
                maxLines = 2,
            )
        }
    }
}

/**
 * Status Strip - health indicators
 */
@Composable
fun StatusStrip(
    isOnline: Boolean,
    fieldpieceConnected: Boolean,
    pendingSyncCount: Int,
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .background(GunmetalDark, RoundedCornerShape(6.dp))
            .padding(8.dp),
        horizontalArrangement = Arrangement.spacedBy(12.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        StatusIndicator("METERS", Icon.Default, NeonGreen)
        StatusIndicator("FIELDPIECE", Icon.Default, if (fieldpieceConnected) NeonGreen else Color.Gray)
        StatusIndicator("SYNC", Icon.Default, if (pendingSyncCount == 0) NeonGreen else OrangeWarmth)
        StatusIndicator("AI", Icon.Default, ElectricBlue)
    }
}

@Composable
fun StatusIndicator(label: String, icon: ImageVector, color: Color) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = Modifier.size(width = 50.dp, height = 40.dp),
    ) {
        Icon(
            icon,
            contentDescription = label,
            tint = color,
            modifier = Modifier.size(16.dp),
        )
        Text(
            label,
            fontSize = 7.sp,
            color = Color.Gray,
            maxLines = 1,
        )
    }
}

/**
 * Bottom Navigation
 */
@Composable
fun BottomNavigationBar() {
    NavigationBar(
        modifier = Modifier.background(GunmetalDark),
        containerColor = GunmetalDark,
    ) {
        listOf(
            Triple("HOME", Icons.Filled.Home, true),
            Triple("CALLS", Icons.Filled.Phone, false),
            Triple("EQUIPMENT", Icons.Filled.Build, false),
            Triple("HISTORY", Icons.Filled.History, false),
            Triple("COMMAND", Icons.Filled.Dashboard, false),
        ).forEach { (label, icon, selected) ->
            NavigationBarItem(
                icon = { Icon(icon, contentDescription = label, modifier = Modifier.size(20.dp)) },
                label = { Text(label, fontSize = 8.sp) },
                selected = selected,
                onClick = {},
                colors = NavigationBarItemDefaults.colors(
                    selectedIconColor = ElectricBlue,
                    selectedTextColor = ElectricBlue,
                    unselectedIconColor = Color.Gray,
                    unselectedTextColor = Color.Gray,
                ),
            )
        }
    }
}

// TODO: Icon.Default is placeholder - use actual icons
object Icon {
    val Default = Icons.Filled.Circle
}
