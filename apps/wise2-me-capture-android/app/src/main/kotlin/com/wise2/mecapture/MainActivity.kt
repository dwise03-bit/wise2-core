package com.wise2.mecapture

import android.Manifest
import android.content.pm.PackageManager
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import java.text.DateFormat
import java.util.Date

private val Black = Color(0xFF08090A); private val Panel = Color(0xFF171A1C); private val Green = Color(0xFFB6FF3B); private val Blue = Color(0xFF5CC8FF); private val Purple = Color(0xFFC58CFF)

class MainActivity : ComponentActivity() {
    private val permissions = registerForActivityResult(ActivityResultContracts.RequestMultiplePermissions()) { }
    override fun onCreate(savedInstanceState: Bundle?) { super.onCreate(savedInstanceState); permissions.launch(arrayOf(Manifest.permission.CAMERA, Manifest.permission.RECORD_AUDIO)); setContent { MeCaptureApp() } }
}

@Composable fun MeCaptureApp(vm: CaptureViewModel = viewModel()) {
    var tab by remember { mutableIntStateOf(0) }
    MaterialTheme(colorScheme = darkColorScheme(background = Black, surface = Panel, primary = Green, secondary = Blue)) {
        Scaffold(containerColor = Black, bottomBar = { NavigationBar(containerColor = Panel) { listOf("Capture" to Icons.Default.Videocam, "Library" to Icons.Default.VideoLibrary, "AI Studio" to Icons.Default.AutoAwesome, "Profile" to Icons.Default.Person).forEachIndexed { i, pair -> NavigationBarItem(selected = tab == i, onClick = { tab = i }, icon = { Icon(pair.second, null) }, label = { Text(pair.first) }) } } }) { pad -> Box(Modifier.padding(pad).fillMaxSize()) { when(tab) { 0 -> CaptureScreen(vm); 1 -> LibraryScreen(vm); 2 -> StudioScreen(vm); else -> ProfileScreen() } } }
    }
}

@Composable private fun Header(title: String, subtitle: String) { Column(Modifier.padding(20.dp)) { Text("WISE²", color = Green, style = MaterialTheme.typography.labelLarge); Text(title, style = MaterialTheme.typography.headlineMedium); Text(subtitle, color = Color.Gray) } }

@Composable private fun CaptureScreen(vm: CaptureViewModel) { Header("ME CAPTURE", "OFFLINE-FIRST FIELD RECORDING"); var clientConsent by remember { mutableStateOf(false) }; Column(Modifier.padding(horizontal = 20.dp), verticalArrangement = Arrangement.spacedBy(16.dp)) { ModeSelector(vm); Box(Modifier.fillMaxWidth().height(270.dp).background(Color(0xFF24292B), RoundedCornerShape(18.dp)), contentAlignment = Alignment.Center) { Text(if(vm.recording) "●  RECORDING ${vm.elapsed}s" else "CAMERA PREVIEW", color = if(vm.recording) Color.Red else Color.DarkGray) }; if(vm.mode == Mode.CLIENT && !clientConsent) { Card(colors = CardDefaults.cardColors(containerColor = Color(0xFF31251C))) { Column(Modifier.padding(16.dp)) { Text("Recording consent required", color = Green); Text("Confirm the client has agreed to this recording and its stated use.", color = Color.LightGray); Button(onClick = { clientConsent = true }) { Text("I HAVE CONSENT") } } } }; Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) { OutlinedButton(onClick = {}, Modifier.weight(1f)) { Icon(Icons.Default.Cameraswitch, null); Spacer(Modifier.width(6.dp)); Text("FLIP") }; Button(onClick = { if(vm.mode != Mode.CLIENT || clientConsent) vm.toggleRecording() }, Modifier.weight(1f), colors = ButtonDefaults.buttonColors(containerColor = if(vm.recording) Color.Red else Green, contentColor = Color.Black)) { Icon(if(vm.recording) Icons.Default.Stop else Icons.Default.FiberManualRecord, null); Spacer(Modifier.width(6.dp)); Text(if(vm.recording) "STOP" else "RECORD") } }; OutlinedTextField(value = vm.label, onValueChange = vm::updateLabel, label = { Text("Job / customer label (optional)") }, modifier = Modifier.fillMaxWidth()) } }

@Composable private fun ModeSelector(vm: CaptureViewModel) { Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(6.dp)) { Mode.entries.forEach { mode -> FilterChip(selected = vm.mode == mode, onClick = { vm.mode = mode }, label = { Text(mode.name) }) } } }

@Composable private fun LibraryScreen(vm: CaptureViewModel) { Header("LIBRARY", "${vm.clips.size} LOCAL RECORDINGS"); LazyColumn(Modifier.padding(horizontal = 20.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) { items(vm.clips) { clip -> Card(colors = CardDefaults.cardColors(containerColor = Panel)) { Column(Modifier.padding(16.dp)) { Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) { Text(clip.mode.name, color = Green); Text(clip.status, color = Blue) }; Text(clip.label.ifBlank { "Untitled capture" }, style = MaterialTheme.typography.titleMedium); Text("${DateFormat.getDateTimeInstance().format(Date(clip.createdAt))}  •  ${clip.duration}s", color = Color.Gray); Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) { TextButton(onClick = { vm.approve(clip.id) }) { Text("APPROVE FOR MY AI", color = Purple) }; TextButton(onClick = { vm.reject(clip.id) }) { Text("REJECT") } } } } } } }

@Composable private fun StudioScreen(vm: CaptureViewModel) { Header("AI STUDIO", "APPROVED TRAINING MATERIAL ONLY"); Column(Modifier.padding(20.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) { Text("Manage what your AI may learn from.", color = Color.LightGray); listOf("My Voice", "My Vocabulary", "My Sales Style", "My Field Knowledge", "My Troubleshooting Patterns", "My Customer Explanations", "My Procedures", "My Decisions").forEach { Card(Modifier.fillMaxWidth(), colors = CardDefaults.cardColors(containerColor = Panel)) { Row(Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically) { Icon(Icons.Default.AutoAwesome, null, tint = Purple); Spacer(Modifier.width(12.dp)); Text(it); Spacer(Modifier.weight(1f)); Text(vm.clips.count { c -> c.status == "APPROVED" }.toString(), color = Purple) } } } } }
@Composable private fun ProfileScreen() { Header("PROFILE", "PRIVACY & DEVICE SETTINGS"); Column(Modifier.padding(20.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) { Text("Local-first storage is enabled.", color = Green); Text("Raw recordings remain separate from derived AI data. Nothing is approved automatically.", color = Color.LightGray); Text("Location capture is optional and requires explicit Android permission.", color = Color.LightGray) } }
