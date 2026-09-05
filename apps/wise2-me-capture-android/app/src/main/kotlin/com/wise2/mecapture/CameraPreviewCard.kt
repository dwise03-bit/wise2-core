package com.wise2.mecapture

import android.view.ViewGroup
import androidx.camera.core.*
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.camera.video.*
import androidx.camera.view.PreviewView
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.content.ContextCompat
import androidx.lifecycle.compose.LocalLifecycleOwner

@Composable
fun CameraPreviewCard(enabled: Boolean, vm: CaptureViewModel) {
    val context = LocalContext.current
    val lifecycleOwner = LocalLifecycleOwner.current
    var facing by remember { mutableIntStateOf(CameraSelector.LENS_FACING_BACK) }
    var videoCapture by remember { mutableStateOf<VideoCapture<Recorder>?>(null) }
    var recording by remember { mutableStateOf<Recording?>(null) }
    var previewView by remember { mutableStateOf<PreviewView?>(null) }
    Card(Modifier.fillMaxWidth(), shape = RoundedCornerShape(22.dp), colors = CardDefaults.cardColors(containerColor = Color(0xFF111416))) {
        Box(Modifier.fillMaxWidth().aspectRatio(0.78f).background(Color.Black)) {
            AndroidView(factory = { PreviewView(it).apply { layoutParams = ViewGroup.LayoutParams(-1, -1); previewView = this } }, modifier = Modifier.fillMaxSize()) { view ->
                val future = ProcessCameraProvider.getInstance(context)
                future.addListener({ runCatching { val provider = future.get(); provider.unbindAll(); val selector = CameraSelector.Builder().requireLensFacing(facing).build(); val recorder = Recorder.Builder().setQualitySelector(QualitySelector.from(Quality.HD)).build(); val capture = VideoCapture.withOutput(recorder); val preview = Preview.Builder().build().also { it.setSurfaceProvider(view.surfaceProvider) }; provider.bindToLifecycle(lifecycleOwner, selector, preview, capture); videoCapture = capture } }, ContextCompat.getMainExecutor(context))
            }
            Column(Modifier.align(Alignment.BottomCenter).fillMaxWidth().padding(14.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                if (vm.recording) Text("●  RECORDING  ${vm.elapsed}s", color = Color(0xFFFF5C5C), style = MaterialTheme.typography.titleMedium)
                Spacer(Modifier.height(8.dp))
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceEvenly, verticalAlignment = Alignment.CenterVertically) {
                    FilledTonalIconButton(enabled = enabled && recording == null, onClick = { facing = if (facing == CameraSelector.LENS_FACING_BACK) CameraSelector.LENS_FACING_FRONT else CameraSelector.LENS_FACING_BACK }) { Icon(Icons.Default.Cameraswitch, "Switch camera") }
                    Button(enabled = enabled && videoCapture != null, onClick = {
                        val current = recording
                        if (current != null) { current.stop(); recording = null; vm.stopTimer() } else { val file = java.io.File(context.filesDir, "reaper-${System.currentTimeMillis()}.mp4"); recording = videoCapture!!.output.prepareRecording(context, FileOutputOptions.Builder(file).build()).withAudioEnabled().start(ContextCompat.getMainExecutor(context)) { event -> when (event) { is VideoRecordEvent.Start -> vm.startTimer(); is VideoRecordEvent.Finalize -> { recording = null; vm.finishRecording(file.absolutePath) } } } }
                    }, shape = RoundedCornerShape(16.dp), colors = ButtonDefaults.buttonColors(containerColor = if (vm.recording) Color(0xFFFF5C5C) else Color(0xFFB6FF3B), contentColor = Color.Black), modifier = Modifier.height(56.dp).width(160.dp)) { Icon(if (vm.recording) Icons.Default.Stop else Icons.Default.FiberManualRecord, "Record"); Spacer(Modifier.width(8.dp)); Text(if (vm.recording) "STOP" else "RECORD") }
                }
            }
        }
    }
}
