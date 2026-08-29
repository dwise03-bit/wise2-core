package com.cjays.autorecon

import android.Manifest
import android.content.pm.PackageManager
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.camera.core.CameraSelector
import androidx.camera.core.ImageAnalysis
import androidx.camera.core.Preview
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.camera.view.PreviewView
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
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
import com.google.mlkit.vision.barcode.BarcodeScannerOptions
import com.google.mlkit.vision.barcode.BarcodeScanning
import com.google.mlkit.vision.barcode.common.Barcode
import com.google.mlkit.vision.common.InputImage
import java.util.concurrent.Executors

private val vinPattern = Regex("[A-HJ-NPR-Z0-9]{17}")

/** Extracts a VIN from raw barcode text, including CJAYS QR payloads and URLs. */
internal fun extractVin(rawValue: String?): String? {
    val normalized = rawValue?.uppercase()?.replace("%3A", ":") ?: return null
    return vinPattern.find(normalized)?.value
}

@Composable
fun BarcodeScannerView(onDetected: (String) -> Unit, onManual: () -> Unit) {
    val context = LocalContext.current
    val lifecycleOwner = LocalLifecycleOwner.current
    var granted by remember { mutableStateOf(ContextCompat.checkSelfPermission(context, Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED) }
    val permission = rememberLauncherForActivityResult(ActivityResultContracts.RequestPermission()) { granted = it }
    LaunchedEffect(Unit) { if (!granted) permission.launch(Manifest.permission.CAMERA) }

    if (!granted) {
        Column(Modifier.fillMaxWidth().height(210.dp), horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.Center) {
            Text("Camera access is needed to scan a VIN label.")
            Spacer(Modifier.height(10.dp))
            Button(onClick = { permission.launch(Manifest.permission.CAMERA) }) { Text("ALLOW CAMERA") }
            TextButton(onClick = onManual) { Text("ENTER VIN MANUALLY") }
        }
        return
    }

    val executor = remember { Executors.newSingleThreadExecutor() }
    val scanner = remember {
        val options = BarcodeScannerOptions.Builder().setBarcodeFormats(Barcode.FORMAT_CODE_39, Barcode.FORMAT_CODE_128, Barcode.FORMAT_QR_CODE, Barcode.FORMAT_DATA_MATRIX).build()
        BarcodeScanning.getClient(options)
    }
    var lastDetected by remember { mutableStateOf<String?>(null) }
    DisposableEffect(Unit) { onDispose { scanner.close(); executor.shutdown() } }
    Box(Modifier.fillMaxWidth().height(220.dp).border(BorderStroke(2.dp, Color(0xFF0878F9)), RoundedCornerShape(14.dp))) {
        AndroidView(factory = { ctx ->
            PreviewView(ctx).apply {
                scaleType = PreviewView.ScaleType.FILL_CENTER
                val providerFuture = ProcessCameraProvider.getInstance(ctx)
                providerFuture.addListener({
                    val provider = providerFuture.get()
                    val preview = Preview.Builder().build().also { it.surfaceProvider = surfaceProvider }
                    val analysis = ImageAnalysis.Builder().setBackpressureStrategy(ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST).build()
                    analysis.setAnalyzer(executor) { proxy ->
                        val image = proxy.image
                        if (image == null) { proxy.close(); return@setAnalyzer }
                        scanner.process(InputImage.fromMediaImage(image, proxy.imageInfo.rotationDegrees))
                            .addOnSuccessListener { codes ->
                                val value = codes.firstNotNullOfOrNull { extractVin(it.rawValue) }
                                if (value != null && value != lastDetected) {
                                    lastDetected = value
                                    onDetected(value)
                                }
                            }
                            .addOnCompleteListener { proxy.close() }
                    }
                    provider.unbindAll()
                    provider.bindToLifecycle(lifecycleOwner, CameraSelector.DEFAULT_BACK_CAMERA, preview, analysis)
                }, ContextCompat.getMainExecutor(ctx))
            }
        }, modifier = Modifier.fillMaxSize())
        Text("Align the VIN barcode inside the frame", color=Color.White, modifier=Modifier.align(Alignment.BottomCenter).padding(12.dp))
    }
}
