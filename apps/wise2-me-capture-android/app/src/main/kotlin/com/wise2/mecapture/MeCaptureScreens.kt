package com.wise2.mecapture

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import java.text.DateFormat
import java.util.Date

val WiseBlack = Color(0xFF050607)
val WisePanel = Color(0xFF111416)
val WisePanel2 = Color(0xFF181C1F)
val WiseGreen = Color(0xFF76FF03)
val WiseBlue = Color(0xFF2196F3)
val WisePurple = Color(0xFF8E5CFF)
val WiseAmber = Color(0xFFFFA000)
val WiseRed = Color(0xFFFF3030)

private fun modeColor(mode: Mode) = Color(MeCaptureUiContract.modeColors.getValue(mode.name))
private fun statusColor(status: String) = when (status) {
    "TRANSCRIBED" -> WiseBlue
    "ANALYZED" -> WisePurple
    "REVIEWED" -> Color(0xFFB0BEC5)
    "APPROVED" -> WiseGreen
    "REJECTED" -> WiseRed
    else -> Color(0xFFCFD8DC)
}

@Composable
private fun TopTitle(title: String, subtitle: String? = null, accent: Color = WiseGreen) {
    Column(Modifier.fillMaxWidth().padding(horizontal = 18.dp, vertical = 14.dp)) {
        Text("WISE²  ME CAPTURE", color = accent, style = MaterialTheme.typography.labelLarge, fontWeight = FontWeight.Bold)
        Text(title, style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Black)
        subtitle?.let { Text(it, color = Color(0xFF8C969C), style = MaterialTheme.typography.bodySmall) }
    }
}

@Composable
fun CaptureScreen(vm: CaptureViewModel) {
    var clientConsent by remember { mutableStateOf(false) }
    val accent = modeColor(vm.mode)
    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(bottom = 24.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        item { TopTitle("${vm.mode.name} CAPTURE", "Capture everything. Build yourself.", accent) }
        item { ModeSelector(vm) { if (it != Mode.CLIENT) clientConsent = false } }
        item {
            Box(
                Modifier.padding(horizontal = 16.dp).fillMaxWidth().height(390.dp)
                    .background(Color(0xFF0C1012), RoundedCornerShape(22.dp))
            ) {
                Column(Modifier.align(Alignment.TopStart).padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Surface(color = if (vm.recording) WiseRed else Color(0xFF22282B), shape = RoundedCornerShape(50)) {
                        Text(if (vm.recording) "● REC   ${formatDuration(vm.elapsed)}" else "READY • 1080p HD", Modifier.padding(horizontal = 12.dp, vertical = 7.dp), fontWeight = FontWeight.Bold)
                    }
                }
                Column(Modifier.align(Alignment.Center), horizontalAlignment = Alignment.CenterHorizontally) {
                    Icon(Icons.Default.Videocam, null, tint = accent.copy(alpha = .55f), modifier = Modifier.size(72.dp))
                    Text(if (vm.recording) "CAPTURING ${vm.mode.name}" else "CAMERA PREVIEW", color = Color(0xFF7D878C), fontWeight = FontWeight.Bold)
                }
                Column(Modifier.align(Alignment.CenterEnd).padding(14.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    HudButton(Icons.Default.Cameraswitch, "Flip", accent)
                    HudButton(Icons.Default.FlashOn, "Flash", accent)
                    HudButton(Icons.Default.Mic, "Mic On", accent)
                    HudButton(Icons.Default.LocationOn, "GPS", accent)
                }
                Surface(
                    modifier = Modifier.align(Alignment.BottomStart).fillMaxWidth().padding(14.dp),
                    color = Color.Black.copy(alpha = .72f), shape = RoundedCornerShape(14.dp)
                ) {
                    Text(
                        if (vm.recording) "Live capture active. Add job context below while recording." else "Field-ready offline capture. Recording stays local until you choose to sync.",
                        Modifier.padding(14.dp), color = Color.White
                    )
                }
            }
        }
        if (vm.mode == Mode.CLIENT && !clientConsent) {
            item {
                Card(Modifier.padding(horizontal = 16.dp), colors = CardDefaults.cardColors(containerColor = Color(0xFF251F13))) {
                    Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        Text("CLIENT CONSENT REQUIRED", color = WiseAmber, fontWeight = FontWeight.Black)
                        Text("Confirm the client agreed to recording and the stated use before capture begins.", color = Color(0xFFD7DCE0))
                        Button(onClick = { clientConsent = true }, colors = ButtonDefaults.buttonColors(containerColor = WiseAmber, contentColor = Color.Black)) { Text("I HAVE CONSENT", fontWeight = FontWeight.Black) }
                    }
                }
            }
        }
        item {
            Row(Modifier.padding(horizontal = 16.dp).fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp), verticalAlignment = Alignment.CenterVertically) {
                OutlinedButton(onClick = {}, modifier = Modifier.weight(1f).height(58.dp)) { Icon(Icons.Default.Pause, null); Spacer(Modifier.width(6.dp)); Text("PAUSE") }
                Button(
                    onClick = { if (vm.mode != Mode.CLIENT || clientConsent) vm.toggleRecording() },
                    enabled = vm.mode != Mode.CLIENT || clientConsent,
                    modifier = Modifier.weight(1.35f).height(64.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = if (vm.recording) WiseRed else accent, contentColor = Color.Black)
                ) {
                    Icon(if (vm.recording) Icons.Default.Stop else Icons.Default.FiberManualRecord, null)
                    Spacer(Modifier.width(8.dp)); Text(if (vm.recording) "STOP" else "RECORD", fontWeight = FontWeight.Black)
                }
                OutlinedButton(onClick = {}, modifier = Modifier.weight(1f).height(58.dp)) { Icon(Icons.Default.PhotoCamera, null); Spacer(Modifier.width(6.dp)); Text("SNAP") }
            }
        }
        item {
            OutlinedTextField(
                value = vm.label, onValueChange = vm::updateLabel,
                label = { Text("Job / Customer") }, placeholder = { Text("Johnson Residence") },
                modifier = Modifier.padding(horizontal = 16.dp).fillMaxWidth(), singleLine = true
            )
        }
    }
}

@Composable
private fun HudButton(icon: ImageVector, label: String, accent: Color) {
    Surface(color = Color.Black.copy(alpha = .68f), shape = RoundedCornerShape(12.dp)) {
        Column(Modifier.padding(9.dp), horizontalAlignment = Alignment.CenterHorizontally) {
            Icon(icon, null, tint = accent); Text(label, style = MaterialTheme.typography.labelSmall)
        }
    }
}

@Composable
private fun ModeSelector(vm: CaptureViewModel, onChanged: (Mode) -> Unit) {
    Row(Modifier.padding(horizontal = 16.dp).fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(6.dp)) {
        Mode.entries.forEach { mode ->
            val color = modeColor(mode)
            FilterChip(
                selected = vm.mode == mode,
                onClick = { vm.mode = mode; onChanged(mode) },
                label = { Text(mode.name, fontWeight = FontWeight.Bold) },
                colors = FilterChipDefaults.filterChipColors(selectedContainerColor = color, selectedLabelColor = Color.Black),
                modifier = Modifier.weight(1f)
            )
        }
    }
}

@Composable
fun LibraryScreen(vm: CaptureViewModel, onClip: (Clip) -> Unit) {
    var filter by remember { mutableStateOf<Mode?>(null) }
    val shown = vm.clips.filter { filter == null || it.mode == filter }
    Column(Modifier.fillMaxSize()) {
        TopTitle("LIBRARY", "${vm.clips.size} local recordings")
        Row(Modifier.padding(horizontal = 16.dp), horizontalArrangement = Arrangement.spacedBy(6.dp)) {
            FilterChip(selected = filter == null, onClick = { filter = null }, label = { Text("All") })
            Mode.entries.forEach { mode -> FilterChip(selected = filter == mode, onClick = { filter = mode }, label = { Text(mode.name.lowercase().replaceFirstChar { it.uppercase() }) }) }
        }
        LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
            items(shown, key = { it.id }) { clip ->
                Card(
                    modifier = Modifier.fillMaxWidth().clickable { onClip(clip) },
                    colors = CardDefaults.cardColors(containerColor = WisePanel)
                ) {
                    Row(Modifier.padding(12.dp), verticalAlignment = Alignment.CenterVertically) {
                        Box(Modifier.size(86.dp).background(Color(0xFF202629), RoundedCornerShape(12.dp)), contentAlignment = Alignment.Center) {
                            Icon(Icons.Default.PlayCircle, null, tint = modeColor(clip.mode), modifier = Modifier.size(38.dp))
                        }
                        Spacer(Modifier.width(12.dp))
                        Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                            Row(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
                                StatusPill(clip.mode.name, modeColor(clip.mode)); StatusPill(clip.status, statusColor(clip.status))
                            }
                            Text(clip.label.ifBlank { "Untitled ${clip.mode.name.lowercase()} capture" }, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                            Text("${DateFormat.getDateTimeInstance(DateFormat.SHORT, DateFormat.SHORT).format(Date(clip.createdAt))}  •  ${formatDuration(clip.duration)}", color = Color(0xFF899399), style = MaterialTheme.typography.bodySmall)
                        }
                        Icon(Icons.Default.ChevronRight, null, tint = Color.Gray)
                    }
                }
            }
            if (shown.isEmpty()) item { Text("No captures in this view yet.", color = Color.Gray, modifier = Modifier.padding(20.dp)) }
        }
    }
}

@Composable
fun ClipDetailScreen(clip: Clip, vm: CaptureViewModel, onBack: () -> Unit) {
    val current = vm.clips.firstOrNull { it.id == clip.id } ?: clip
    LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(bottom = 24.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
        item {
            Row(Modifier.fillMaxWidth().padding(10.dp), verticalAlignment = Alignment.CenterVertically) {
                IconButton(onClick = onBack) { Icon(Icons.Default.ArrowBack, "Back") }
                Text("CLIP DETAIL", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Black)
            }
        }
        item {
            Box(Modifier.padding(horizontal = 16.dp).fillMaxWidth().height(220.dp).background(Color(0xFF171C1E), RoundedCornerShape(18.dp)), contentAlignment = Alignment.Center) {
                Icon(Icons.Default.PlayCircle, null, tint = modeColor(current.mode), modifier = Modifier.size(72.dp))
            }
        }
        item {
            Column(Modifier.padding(horizontal = 16.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                StatusPill(current.mode.name, modeColor(current.mode))
                Text(current.label.ifBlank { "Untitled capture" }, style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Black)
                Text(DateFormat.getDateTimeInstance().format(Date(current.createdAt)), color = Color.Gray)
            }
        }
        item { PipelineCard(current.status) }
        item {
            Card(Modifier.padding(horizontal = 16.dp), colors = CardDefaults.cardColors(containerColor = WisePanel)) {
                Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Text("SUMMARY", color = WiseGreen, fontWeight = FontWeight.Black)
                    Text("AI extraction will populate summary, transcript, chapters and detected details after processing.", color = Color(0xFFD2D8DB))
                    Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) { StatusPill(current.mode.name, modeColor(current.mode)); StatusPill("LOCAL", WiseBlue) }
                }
            }
        }
        item {
            Row(Modifier.padding(horizontal = 16.dp).fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                Button(onClick = { vm.reject(current.id) }, modifier = Modifier.weight(1f).height(58.dp), colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF8B0E0E))) { Text("REJECT\nNot for AI", fontWeight = FontWeight.Bold) }
                Button(onClick = { vm.approve(current.id) }, modifier = Modifier.weight(1f).height(58.dp), colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF167A13))) { Text("APPROVE FOR MY AI", fontWeight = FontWeight.Bold) }
            }
        }
    }
}

@Composable
private fun PipelineCard(status: String) {
    Card(Modifier.padding(horizontal = 16.dp), colors = CardDefaults.cardColors(containerColor = WisePanel)) {
        Column(Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
            Text("AI PROCESSING PIPELINE", fontWeight = FontWeight.Black)
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                MeCaptureUiContract.pipeline.forEach { stage ->
                    val active = stage == status || (status == "APPROVED" && stage == "APPROVED")
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Box(Modifier.size(28.dp).background(if (active) statusColor(stage) else Color(0xFF31373A), CircleShape), contentAlignment = Alignment.Center) { Text(if (active) "✓" else "•", color = Color.Black, fontWeight = FontWeight.Black) }
                        Text(stage.take(4), color = if (active) statusColor(stage) else Color.Gray, style = MaterialTheme.typography.labelSmall)
                    }
                }
            }
        }
    }
}

@Composable
fun AiStudioScreen(vm: CaptureViewModel) {
    val approved = vm.clips.count { it.status == "APPROVED" }
    val categories = listOf("My Voice", "My Vocabulary", "My Sales Style", "My Field Knowledge", "My Troubleshooting", "My Explanations", "My Procedures", "My Decisions")
    LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(bottom = 24.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
        item { TopTitle("AI STUDIO", "Training material you approve becomes part of your digital self.") }
        item {
            Column(Modifier.fillMaxWidth().padding(vertical = 10.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                Box(Modifier.size(118.dp).background(Color(0xFF0D1712), CircleShape), contentAlignment = Alignment.Center) { Text("W²", color = WiseGreen, style = MaterialTheme.typography.displayMedium, fontWeight = FontWeight.Black) }
                Spacer(Modifier.height(12.dp)); Text("DANIEL AI PROFILE", color = WiseGreen, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Black)
            }
        }
        items(categories) { name ->
            val progress = ((approved % 8) + categories.indexOf(name) + 1) / 16f
            Card(Modifier.padding(horizontal = 16.dp), colors = CardDefaults.cardColors(containerColor = WisePanel)) {
                Row(Modifier.padding(14.dp), verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.AutoAwesome, null, tint = WisePurple); Spacer(Modifier.width(10.dp)); Text(name, Modifier.weight(1f), fontWeight = FontWeight.Bold)
                    LinearProgressIndicator(progress = progress.coerceIn(0f, 1f), modifier = Modifier.width(92.dp), color = WiseGreen, trackColor = Color(0xFF303638))
                }
            }
        }
        item {
            Card(Modifier.padding(horizontal = 16.dp), colors = CardDefaults.cardColors(containerColor = Color(0xFF0F1D12))) {
                Column(Modifier.padding(18.dp)) { Text("TOTAL APPROVED CLIPS", color = Color.Gray); Text(approved.toString(), color = WiseGreen, style = MaterialTheme.typography.displaySmall, fontWeight = FontWeight.Black); Text("Only clips you explicitly approve count toward your AI profile.", color = Color(0xFFB9C3C7)) }
            }
        }
    }
}

@Composable
fun ProfileScreen() {
    LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(bottom = 24.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
        item { TopTitle("PROFILE", "Privacy, storage and AI controls") }
        item {
            Column(Modifier.fillMaxWidth().padding(18.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                Box(Modifier.size(92.dp).background(Color(0xFF172018), CircleShape), contentAlignment = Alignment.Center) { Text("W²", color = WiseGreen, style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Black) }
                Spacer(Modifier.height(10.dp)); Text("Daniel Wise", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Black); Text("AI Training Active", color = WiseGreen)
            }
        }
        items(listOf(
            Triple(Icons.Default.Lock, "Encrypted Local Storage", "Raw recordings remain separate from derived AI data."),
            Triple(Icons.Default.Handshake, "Recording Consent", "Client recordings require an explicit consent confirmation."),
            Triple(Icons.Default.Psychology, "AI Training Controls", "Nothing becomes training material automatically."),
            Triple(Icons.Default.CloudSync, "Backup & Sync", "Offline-first capture; sync only when configured."),
            Triple(Icons.Default.Settings, "Settings", "Camera, audio, storage and application preferences.")
        )) { item ->
            Card(Modifier.padding(horizontal = 16.dp), colors = CardDefaults.cardColors(containerColor = WisePanel)) {
                Row(Modifier.padding(15.dp), verticalAlignment = Alignment.CenterVertically) { Icon(item.first, null, tint = WiseGreen); Spacer(Modifier.width(12.dp)); Column(Modifier.weight(1f)) { Text(item.second, fontWeight = FontWeight.Bold); Text(item.third, color = Color.Gray, style = MaterialTheme.typography.bodySmall) }; Icon(Icons.Default.ChevronRight, null, tint = Color.Gray) }
            }
        }
    }
}

@Composable
private fun StatusPill(text: String, color: Color) {
    Surface(color = color.copy(alpha = .15f), shape = RoundedCornerShape(50), border = androidx.compose.foundation.BorderStroke(1.dp, color.copy(alpha = .65f))) {
        Text(text, Modifier.padding(horizontal = 8.dp, vertical = 4.dp), color = color, style = MaterialTheme.typography.labelSmall, fontWeight = FontWeight.Black)
    }
}

private fun formatDuration(seconds: Int): String = "%02d:%02d".format(seconds / 60, seconds % 60)
