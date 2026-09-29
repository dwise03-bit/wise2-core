package com.wise2.fieldtech.camera

import android.content.Context
import androidx.camera.core.CameraSelector
import androidx.camera.core.ImageCapture
import androidx.camera.core.ImageCaptureException
import androidx.camera.core.Preview
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.camera.view.PreviewView
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.height
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Camera
import androidx.compose.material.icons.filled.Close
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.material3.Button
import androidx.compose.material3.OutlinedButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.remember
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.getValue
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalLifecycleOwner
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.content.ContextCompat
import java.io.File
import java.text.SimpleDateFormat
import java.util.Locale

/**
 * Live CameraX preview + capture, wired to the JobDetail "Take Photo" quick action (spec §6/§15).
 * Photos are attached Customer → Job → Equipment via JobRepository.attachPhoto — the file path
 * alone; OCR of equipment labels is out of scope for this build (spec §15 explicitly requires
 * technician verification before trusting OCR output, and no OCR pipeline ships here yet).
 */
@Composable
fun CameraCaptureScreen(jobId: String, onCaptured: (String) -> Unit, onClose: () -> Unit) {
    val context = LocalContext.current
    val lifecycleOwner = LocalLifecycleOwner.current
    val imageCapture = remember { ImageCapture.Builder().build() }
    val previewView = remember { PreviewView(context) }
    var capturedPaths by remember { mutableStateOf<List<String>>(emptyList()) }
    var step by remember { mutableStateOf(0) }
    var reviewing by remember { mutableStateOf(false) }
    val steps = listOf("RTU overview", "Data plate", "Electrical connections")

    DisposableEffect(Unit) {
        val cameraProviderFuture = ProcessCameraProvider.getInstance(context)
        cameraProviderFuture.addListener({
            val provider = cameraProviderFuture.get()
            val preview = Preview.Builder().build().also { it.setSurfaceProvider(previewView.surfaceProvider) }
            provider.unbindAll()
            runCatching {
                provider.bindToLifecycle(lifecycleOwner, CameraSelector.DEFAULT_BACK_CAMERA, preview, imageCapture)
            }
        }, ContextCompat.getMainExecutor(context))
        onDispose {}
    }

    if (reviewing) {
        Box(Modifier.fillMaxSize().background(Color.Black).padding(24.dp)) {
            Column {
                Text("REVIEW RTU CAPTURE", color = Color.White, style = androidx.compose.material3.MaterialTheme.typography.headlineSmall)
                Spacer(Modifier.height(12.dp))
                Text("${capturedPaths.size} photos ready • saved locally to Job $jobId", color = Color.LightGray)
                Spacer(Modifier.height(24.dp))
                Text("Quality check: ${if (capturedPaths.size == steps.size) "PASS" else "INCOMPLETE"}", color = if (capturedPaths.size == steps.size) Color(0xFF65E6A5) else Color(0xFFFFC857))
                Spacer(Modifier.height(24.dp))
                Button(enabled = capturedPaths.size == steps.size, onClick = { capturedPaths.forEach(onCaptured); onClose() }) { Text("UPLOAD / QUEUE OFFLINE") }
                Spacer(Modifier.height(8.dp))
                OutlinedButton(onClick = { capturedPaths = emptyList(); step = 0; reviewing = false }) { Text("RETAKE ALL") }
                Spacer(Modifier.height(8.dp))
                OutlinedButton(onClick = onClose) { Text("CANCEL") }
            }
        }
        return
    }

    Box(Modifier.fillMaxSize().background(Color.Black)) {
        AndroidView(factory = { previewView }, modifier = Modifier.fillMaxSize())

        Column(modifier = Modifier.align(Alignment.TopCenter).padding(top = 24.dp)) {
            Text("RAZR • XR CAPTURE", color = Color.White, style = androidx.compose.material3.MaterialTheme.typography.titleLarge)
            Text("${step + 1}/${steps.size}  ${steps[step]}", color = Color.White)
            Text("Keep the RTU centered and well lit", color = Color.LightGray)
        }

        IconButton(onClick = onClose, modifier = Modifier.align(Alignment.TopStart).padding(16.dp)) {
            Icon(Icons.Filled.Close, contentDescription = "Close camera", tint = Color.White)
        }

        FloatingActionButton(
            onClick = {
                capturePhoto(context, jobId, imageCapture) { path ->
                    capturedPaths = capturedPaths + path
                    if (step == steps.lastIndex) reviewing = true else step += 1
                }
            },
            modifier = Modifier.align(Alignment.BottomCenter).padding(32.dp),
        ) {
            Icon(Icons.Filled.Camera, contentDescription = "Capture")
        }

        if (capturedPaths.isNotEmpty()) {
            Text("${capturedPaths.size} saved locally", color = Color.White, modifier = Modifier.align(Alignment.BottomStart).padding(24.dp))
        }
    }
}

private fun capturePhoto(context: Context, jobId: String, imageCapture: ImageCapture, onCaptured: (String) -> Unit) {
    val photosDir = File(context.getExternalFilesDir(null), "job_photos/$jobId").apply { mkdirs() }
    val fileName = "IMG_${SimpleDateFormat("yyyyMMdd_HHmmss", Locale.US).format(java.util.Date())}.jpg"
    val outputFile = File(photosDir, fileName)
    val outputOptions = ImageCapture.OutputFileOptions.Builder(outputFile).build()

    imageCapture.takePicture(
        outputOptions,
        ContextCompat.getMainExecutor(context),
        object : ImageCapture.OnImageSavedCallback {
            override fun onImageSaved(output: ImageCapture.OutputFileResults) {
                onCaptured(outputFile.absolutePath)
            }
            override fun onError(exception: ImageCaptureException) {
                // Deliberately silent-fail-safe: the technician can just retake the shot; we
                // never invent a photo path that doesn't correspond to a real saved file.
            }
        },
    )
}
