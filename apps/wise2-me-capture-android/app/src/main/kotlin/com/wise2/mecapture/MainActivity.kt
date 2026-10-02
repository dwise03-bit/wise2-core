package com.wise2.mecapture

import android.Manifest
import android.os.Bundle
import android.view.WindowManager
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import java.text.DateFormat
import java.util.Date

private val ConnectBlack = Color(0xFF040706)
private val ConnectPanel = Color(0xFF0A1110)
private val ConnectRaised = Color(0xFF111A18)
private val ConnectStroke = Color(0xFF20312C)
private val ConnectGreen = Color(0xFF57FF7A)
private val ConnectCyan = Color(0xFF39D8FF)
private val ConnectGold = Color(0xFFD5B874)
private val ConnectMuted = Color(0xFF8FA29B)

class MainActivity : ComponentActivity() {
    private val permissions = registerForActivityResult(ActivityResultContracts.RequestMultiplePermissions()) { }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        androidx.core.view.WindowCompat.setDecorFitsSystemWindows(window, false)
        permissions.launch(arrayOf(Manifest.permission.CAMERA, Manifest.permission.RECORD_AUDIO))
        setContent { Wise2ConnectApp() }
    }
}

private data class NavItem(val label: String, val icon: ImageVector)

@Composable
fun Wise2ConnectApp(vm: CaptureViewModel = viewModel()) {
    var tab by remember { mutableIntStateOf(0) }
    val navItems = listOf(
        NavItem("Home", Icons.Default.Home),
        NavItem("Chat", Icons.Default.ChatBubble),
        NavItem("Capture", Icons.Default.FiberManualRecord),
        NavItem("Audits", Icons.Default.VerifiedUser),
        NavItem("More", Icons.Default.GridView)
    )

    MaterialTheme(
        colorScheme = darkColorScheme(
            background = ConnectBlack,
            surface = ConnectPanel,
            surfaceVariant = ConnectRaised,
            primary = ConnectGreen,
            secondary = ConnectCyan,
            tertiary = ConnectGold,
            onSurface = Color.White,
            onBackground = Color.White
        )
    ) {
        Scaffold(
            containerColor = ConnectBlack,
            bottomBar = {
                NavigationBar(containerColor = ConnectPanel, tonalElevation = 0.dp) {
                    navItems.forEachIndexed { i, item ->
                        NavigationBarItem(
                            selected = tab == i,
                            onClick = { tab = i },
                            icon = { Icon(item.icon, null) },
                            label = { Text(item.label) },
                            colors = NavigationBarItemDefaults.colors(
                                selectedIconColor = ConnectBlack,
                                selectedTextColor = ConnectGreen,
                                indicatorColor = ConnectGreen,
                                unselectedIconColor = ConnectMuted,
                                unselectedTextColor = ConnectMuted
                            )
                        )
                    }
                }
            }
        ) { pad ->
            Box(
                Modifier
                    .padding(pad)
                    .fillMaxSize()
                    .background(Brush.verticalGradient(listOf(Color(0xFF07110D), ConnectBlack, ConnectBlack)))
            ) {
                when (tab) {
                    0 -> HomeScreen(onCapture = { tab = 2 }, onChat = { tab = 1 }, onAudits = { tab = 3 })
                    1 -> ChatScreen()
                    2 -> CaptureScreen(vm)
                    3 -> AuditScreen(vm)
                    else -> MoreScreen()
                }
            }
        }
    }
}

@Composable
private fun BrandHeader(title: String, subtitle: String? = null, badge: String? = null) {
    Column(Modifier.padding(horizontal = 18.dp, vertical = 16.dp)) {
        Row(
            Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    Modifier.size(34.dp).clip(RoundedCornerShape(9.dp)).background(ConnectGreen),
                    contentAlignment = Alignment.Center
                ) { Text("W²", color = ConnectBlack, fontWeight = FontWeight.Black) }
                Spacer(Modifier.width(10.dp))
                Column {
                    Text("WISE² CONNECT", fontWeight = FontWeight.Black, color = Color.White)
                    Text("PEOPLE × IDEAS × ACTION × RESULTS", color = ConnectMuted, style = MaterialTheme.typography.labelSmall)
                }
            }
            badge?.let {
                Surface(
                    shape = RoundedCornerShape(50),
                    color = ConnectRaised,
                    border = BorderStroke(1.dp, ConnectStroke)
                ) {
                    Text(it, color = ConnectGreen, modifier = Modifier.padding(horizontal = 10.dp, vertical = 5.dp), style = MaterialTheme.typography.labelSmall)
                }
            }
        }
        Spacer(Modifier.height(18.dp))
        Text(title, style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Black)
        subtitle?.let { Text(it, color = ConnectMuted, style = MaterialTheme.typography.bodyMedium) }
    }
}

@Composable
private fun HomeScreen(onCapture: () -> Unit, onChat: () -> Unit, onAudits: () -> Unit) {
    val activity = listOf(
        "Field audit captured • HVAC",
        "Sales room • 3 new messages",
        "Client call summary ready",
        "Proposal task assigned"
    )

    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState())) {
        BrandHeader("Good morning, Daniel.", "Real conversations. Real work. Real impact.", "SYNCED")
        Row(
            Modifier.padding(horizontal = 18.dp).fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            MetricCard("24", "Messages", ConnectCyan, Modifier.weight(1f))
            MetricCard("5", "Audits", ConnectGreen, Modifier.weight(1f))
            MetricCard("3", "Actions", ConnectGold, Modifier.weight(1f))
        }
        Spacer(Modifier.height(14.dp))
        Text("QUICK ACTIONS", modifier = Modifier.padding(horizontal = 18.dp), color = ConnectMuted, style = MaterialTheme.typography.labelMedium)
        Spacer(Modifier.height(8.dp))
        Row(
            Modifier.padding(horizontal = 18.dp).fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            ActionCard("Start Capture", Icons.Default.FiberManualRecord, ConnectGreen, onCapture, Modifier.weight(1f))
            ActionCard("Open Chat", Icons.Default.ChatBubble, ConnectCyan, onChat, Modifier.weight(1f))
            ActionCard("View Audits", Icons.Default.VerifiedUser, ConnectGold, onAudits, Modifier.weight(1f))
        }
        Spacer(Modifier.height(18.dp))
        SectionTitle("LIVE ACTIVITY", "Everything that matters, one stream.")
        activity.forEachIndexed { index, line ->
            Surface(
                modifier = Modifier.padding(horizontal = 18.dp, vertical = 5.dp).fillMaxWidth(),
                color = ConnectPanel,
                shape = RoundedCornerShape(16.dp),
                border = BorderStroke(1.dp, ConnectStroke)
            ) {
                Row(Modifier.padding(14.dp), verticalAlignment = Alignment.CenterVertically) {
                    Box(Modifier.size(9.dp).clip(CircleShape).background(if (index == 0) ConnectGreen else ConnectCyan))
                    Spacer(Modifier.width(10.dp))
                    Text(line, modifier = Modifier.weight(1f), color = Color.White)
                    Icon(Icons.Default.ChevronRight, null, tint = ConnectMuted)
                }
            }
        }
        Spacer(Modifier.height(24.dp))
    }
}

@Composable
private fun ChatScreen() {
    val rooms = listOf(
        Triple("# general", "Team updates, wins, and more", "2m"),
        Triple("# field-ops", "HVAC installs, service, support", "12m"),
        Triple("# sales", "New opportunities and follow-up", "23m"),
        Triple("# product", "Ideas, feedback, roadmap", "1h"),
        Triple("# audits", "Captured activity and records", "2h"),
        Triple("# leadership", "Strategy, planning, alignment", "3h")
    )
    Column(Modifier.fillMaxSize()) {
        BrandHeader("Chat & Rooms", "One team. No silos.", "ONLINE")
        Surface(
            modifier = Modifier.padding(horizontal = 18.dp).fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            color = ConnectRaised
        ) {
            Row(Modifier.padding(horizontal = 14.dp, vertical = 11.dp), verticalAlignment = Alignment.CenterVertically) {
                Icon(Icons.Default.Search, null, tint = ConnectMuted)
                Spacer(Modifier.width(9.dp))
                Text("Search people, rooms, audits...", color = ConnectMuted)
            }
        }
        Spacer(Modifier.height(12.dp))
        LazyColumn(contentPadding = PaddingValues(horizontal = 18.dp, vertical = 4.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            items(rooms) { room ->
                Surface(
                    color = ConnectPanel,
                    shape = RoundedCornerShape(16.dp),
                    border = BorderStroke(1.dp, ConnectStroke)
                ) {
                    Row(Modifier.padding(14.dp), verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            Modifier.size(42.dp).clip(RoundedCornerShape(12.dp)).background(ConnectRaised),
                            contentAlignment = Alignment.Center
                        ) { Text("#", color = ConnectGreen, fontWeight = FontWeight.Black) }
                        Spacer(Modifier.width(12.dp))
                        Column(Modifier.weight(1f)) {
                            Text(room.first, fontWeight = FontWeight.Bold)
                            Text(room.second, color = ConnectMuted, style = MaterialTheme.typography.bodySmall)
                        }
                        Text(room.third, color = ConnectMuted, style = MaterialTheme.typography.labelSmall)
                    }
                }
            }
        }
    }
}

@Composable
private fun CaptureScreen(vm: CaptureViewModel) {
    var clientConsent by remember { mutableStateOf(false) }
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState())) {
        BrandHeader("Capture", "Record. Transcribe. Audit. Done.", if (vm.recording) "REC" else "FIELD READY")
        ModeSelector(vm)
        Spacer(Modifier.height(10.dp))
        Box(Modifier.padding(horizontal = 18.dp)) {
            CameraPreviewCard(enabled = vm.mode != Mode.CLIENT || clientConsent, vm = vm)
        }
        if (vm.mode == Mode.CLIENT && !clientConsent) {
            Surface(
                modifier = Modifier.padding(18.dp).fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                color = Color(0xFF1B1510),
                border = BorderStroke(1.dp, ConnectGold)
            ) {
                Column(Modifier.padding(16.dp)) {
                    Text("Client consent required", color = ConnectGold, fontWeight = FontWeight.Bold)
                    Text("Confirm the client agreed to this recording and its stated use.", color = ConnectMuted)
                    Spacer(Modifier.height(10.dp))
                    Button(onClick = { clientConsent = true }, colors = ButtonDefaults.buttonColors(containerColor = ConnectGold, contentColor = ConnectBlack)) {
                        Text("I HAVE CONSENT")
                    }
                }
            }
        }
        OutlinedTextField(
            value = vm.label,
            onValueChange = vm::updateLabel,
            label = { Text("Job / customer / project") },
            modifier = Modifier.padding(horizontal = 18.dp).fillMaxWidth(),
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = ConnectGreen,
                unfocusedBorderColor = ConnectStroke,
                focusedLabelColor = ConnectGreen
            )
        )
        Spacer(Modifier.height(16.dp))
        CaptureTypeGrid()
        Spacer(Modifier.height(28.dp))
    }
}

@Composable
private fun ModeSelector(vm: CaptureViewModel) {
    Row(
        Modifier.padding(horizontal = 18.dp).fillMaxWidth().horizontalScroll(rememberScrollState()),
        horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        Mode.entries.forEach { mode ->
            FilterChip(
                selected = vm.mode == mode,
                onClick = { vm.mode = mode },
                label = { Text(mode.name) },
                colors = FilterChipDefaults.filterChipColors(
                    selectedContainerColor = ConnectGreen,
                    selectedLabelColor = ConnectBlack,
                    containerColor = ConnectRaised,
                    labelColor = ConnectMuted
                ),
                border = FilterChipDefaults.filterChipBorder(
                    enabled = true,
                    selected = vm.mode == mode,
                    borderColor = ConnectStroke,
                    selectedBorderColor = ConnectGreen
                )
            )
        }
    }
}

@Composable
private fun CaptureTypeGrid() {
    val types = listOf(
        "Business Audit" to Icons.Default.BusinessCenter,
        "Client Call" to Icons.Default.Call,
        "Meeting" to Icons.Default.Groups,
        "Field Work" to Icons.Default.Build,
        "Sales" to Icons.Default.TrendingUp,
        "SOP / Training" to Icons.Default.School,
        "Idea" to Icons.Default.Lightbulb,
        "Glasses" to Icons.Default.Visibility
    )
    Column(Modifier.padding(horizontal = 18.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
        Text("CAPTURE TYPES", color = ConnectMuted, style = MaterialTheme.typography.labelMedium)
        types.chunked(2).forEach { row ->
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                row.forEach { item ->
                    Surface(
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(16.dp),
                        color = ConnectPanel,
                        border = BorderStroke(1.dp, ConnectStroke)
                    ) {
                        Row(Modifier.padding(14.dp), verticalAlignment = Alignment.CenterVertically) {
                            Icon(item.second, null, tint = ConnectGreen)
                            Spacer(Modifier.width(10.dp))
                            Text(item.first, fontWeight = FontWeight.SemiBold)
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun AuditScreen(vm: CaptureViewModel) {
    Column(Modifier.fillMaxSize()) {
        BrandHeader("Audit Records", "Every conversation counts.", "${vm.clips.size} LOCAL")
        if (vm.clips.isEmpty()) {
            Box(Modifier.fillMaxSize().padding(24.dp), contentAlignment = Alignment.Center) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Icon(Icons.Default.VerifiedUser, null, tint = ConnectGreen, modifier = Modifier.size(52.dp))
                    Spacer(Modifier.height(12.dp))
                    Text("No audits yet", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                    Text("Your captures will appear here with transcript, summary, tasks and files.", color = ConnectMuted)
                }
            }
        } else {
            LazyColumn(contentPadding = PaddingValues(horizontal = 18.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                items(vm.clips) { clip ->
                    Surface(
                        color = ConnectPanel,
                        shape = RoundedCornerShape(18.dp),
                        border = BorderStroke(1.dp, ConnectStroke)
                    ) {
                        Column(Modifier.padding(16.dp)) {
                            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                Text(clip.mode.name, color = ConnectGreen, fontWeight = FontWeight.Bold)
                                Text(clip.status, color = ConnectCyan)
                            }
                            Spacer(Modifier.height(6.dp))
                            Text(clip.label.ifBlank { "Untitled capture" }, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                            Text("${DateFormat.getDateTimeInstance().format(Date(clip.createdAt))} • ${clip.duration}s", color = ConnectMuted)
                            Spacer(Modifier.height(12.dp))
                            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                AssistChip(onClick = { vm.approve(clip.id) }, label = { Text("Approve AI") }, leadingIcon = { Icon(Icons.Default.CheckCircle, null) })
                                AssistChip(onClick = { vm.reject(clip.id) }, label = { Text("Keep Private") }, leadingIcon = { Icon(Icons.Default.Lock, null) })
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun MoreScreen() {
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState())) {
        BrandHeader("Connect Hub", "One app. Everywhere.", "SECURE")
        val rows = listOf(
            Triple("Projects & Tasks", "Move ideas into execution.", Icons.Default.Checklist),
            Triple("CRM & Clients", "Keep every conversation connected.", Icons.Default.People),
            Triple("Knowledge", "Search the WISE² operating brain.", Icons.Default.MenuBook),
            Triple("AI Assistant", "Turn information into action.", Icons.Default.AutoAwesome),
            Triple("Glasses Integration", "Hands-free field capture.", Icons.Default.Visibility),
            Triple("Integrations", "Connect the rest of the WISE² stack.", Icons.Default.Hub),
            Triple("Privacy & Settings", "Your data. Your control.", Icons.Default.Security)
        )
        rows.forEach { row ->
            Surface(
                modifier = Modifier.padding(horizontal = 18.dp, vertical = 5.dp).fillMaxWidth(),
                color = ConnectPanel,
                shape = RoundedCornerShape(16.dp),
                border = BorderStroke(1.dp, ConnectStroke)
            ) {
                Row(Modifier.padding(15.dp), verticalAlignment = Alignment.CenterVertically) {
                    Icon(row.third, null, tint = ConnectGreen)
                    Spacer(Modifier.width(13.dp))
                    Column(Modifier.weight(1f)) {
                        Text(row.first, fontWeight = FontWeight.Bold)
                        Text(row.second, color = ConnectMuted, style = MaterialTheme.typography.bodySmall)
                    }
                    Icon(Icons.Default.ChevronRight, null, tint = ConnectMuted)
                }
            }
        }
        Spacer(Modifier.height(18.dp))
        Text("THE FUTURE WORKS TOGETHER.", modifier = Modifier.padding(horizontal = 18.dp), color = ConnectGreen, fontWeight = FontWeight.Black)
        Text(
            "Local-first storage remains enabled. Raw recordings stay separate from derived AI data and are never approved automatically.",
            modifier = Modifier.padding(18.dp),
            color = ConnectMuted
        )
    }
}

@Composable
private fun MetricCard(value: String, label: String, accent: Color, modifier: Modifier = Modifier) {
    Surface(
        modifier = modifier,
        color = ConnectPanel,
        shape = RoundedCornerShape(16.dp),
        border = BorderStroke(1.dp, ConnectStroke)
    ) {
        Column(Modifier.padding(14.dp)) {
            Text(value, color = accent, style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Black)
            Text(label, color = ConnectMuted, style = MaterialTheme.typography.bodySmall)
        }
    }
}

@Composable
private fun ActionCard(label: String, icon: ImageVector, accent: Color, onClick: () -> Unit, modifier: Modifier = Modifier) {
    Surface(
        modifier = modifier,
        onClick = onClick,
        color = ConnectPanel,
        shape = RoundedCornerShape(16.dp),
        border = BorderStroke(1.dp, ConnectStroke)
    ) {
        Column(Modifier.padding(14.dp), horizontalAlignment = Alignment.CenterHorizontally) {
            Icon(icon, null, tint = accent)
            Spacer(Modifier.height(8.dp))
            Text(label, style = MaterialTheme.typography.bodySmall, fontWeight = FontWeight.Bold)
        }
    }
}

@Composable
private fun SectionTitle(title: String, subtitle: String) {
    Column(Modifier.padding(horizontal = 18.dp, vertical = 6.dp)) {
        Text(title, color = ConnectGreen, style = MaterialTheme.typography.labelLarge, fontWeight = FontWeight.Black)
        Text(subtitle, color = ConnectMuted, style = MaterialTheme.typography.bodySmall)
    }
}
