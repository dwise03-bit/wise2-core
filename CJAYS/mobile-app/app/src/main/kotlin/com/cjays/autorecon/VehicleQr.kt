package com.cjays.autorecon

import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Print
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.core.content.FileProvider
import com.google.zxing.BarcodeFormat
import com.google.zxing.EncodeHintType
import com.google.zxing.qrcode.QRCodeWriter
import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel
import java.io.File
import java.io.FileOutputStream

fun vehicleQrPayload(vehicle: Vehicle) = "CJAYS:${vehicle.qrTagId.uppercase()}"

fun createVehicleQr(payload: String, size: Int = 720): Bitmap {
    val matrix = QRCodeWriter().encode(payload, BarcodeFormat.QR_CODE, size, size, mapOf(EncodeHintType.ERROR_CORRECTION to ErrorCorrectionLevel.H, EncodeHintType.MARGIN to 2))
    return Bitmap.createBitmap(size, size, Bitmap.Config.ARGB_8888).also { bitmap ->
        for (y in 0 until size) for (x in 0 until size) bitmap.setPixel(x, y, if (matrix[x, y]) Color.BLACK else Color.WHITE)
    }
}

private fun createVehicleLabel(vehicle: Vehicle): Bitmap {
    val result = Bitmap.createBitmap(840, 1040, Bitmap.Config.ARGB_8888)
    val canvas = Canvas(result)
    canvas.drawColor(Color.WHITE)
    val paint = Paint(Paint.ANTI_ALIAS_FLAG).apply { textAlign = Paint.Align.CENTER }
    paint.color = Color.rgb(8, 120, 249); paint.textSize = 58f; paint.isFakeBoldText = true
    canvas.drawText("CJAYS REKON", 420f, 82f, paint)
    canvas.drawBitmap(createVehicleQr(vehicleQrPayload(vehicle), 700), 70f, 125f, paint)
    paint.color = Color.BLACK; paint.textSize = 34f
    canvas.drawText("${vehicle.year} ${vehicle.make} ${vehicle.model}", 420f, 890f, paint)
    paint.textSize = 26f; paint.isFakeBoldText = false
    canvas.drawText("VIN ${vehicle.vin}", 420f, 932f, paint)
    canvas.drawText("Scan with CJAYS REKON to open this vehicle", 420f, 986f, paint)
    return result
}

private fun shareVehicleLabel(context: Context, vehicle: Vehicle) {
    val dir = File(context.cacheDir, "vehicle-qr").apply { mkdirs() }
    val file = File(dir, "CJAYS-${vehicle.vin}-QR.png")
    FileOutputStream(file).use { createVehicleLabel(vehicle).compress(Bitmap.CompressFormat.PNG, 100, it) }
    val uri = FileProvider.getUriForFile(context, "${context.packageName}.files", file)
    context.startActivity(Intent.createChooser(Intent(Intent.ACTION_SEND).apply { type = "image/png"; putExtra(Intent.EXTRA_STREAM, uri); addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION) }, "Print or share vehicle QR label"))
}

@Composable fun VehicleQrCard(vehicle: Vehicle, onMessage: (String) -> Unit) {
    val context = LocalContext.current
    val bitmap = remember(vehicle.qrTagId) { createVehicleQr(vehicleQrPayload(vehicle), 520) }
    Surface(color = MaterialTheme.colorScheme.surface, shape = RoundedCornerShape(14.dp), modifier = Modifier.padding(horizontal = 20.dp).fillMaxWidth()) {
        Column(Modifier.padding(16.dp), horizontalAlignment = Alignment.CenterHorizontally) {
            Image(bitmap.asImageBitmap(), "Permanent CJAYS REKON vehicle QR code", Modifier.size(210.dp).background(androidx.compose.ui.graphics.Color.White))
            Text("Permanent vehicle tag", fontWeight = FontWeight.Bold, modifier = Modifier.padding(top = 10.dp))
            Text("Print and place this label on the vehicle record or key tag", style = MaterialTheme.typography.bodySmall)
            Button(onClick = { runCatching { shareVehicleLabel(context, vehicle) }.onSuccess { onMessage("QR label ready to print or share.") }.onFailure { onMessage(it.message ?: "Unable to create QR label") } }, modifier = Modifier.padding(top = 12.dp).fillMaxWidth()) { Icon(Icons.Default.Print, null); Spacer(Modifier.width(8.dp)); Text("PRINT / SHARE QR LABEL") }
        }
    }
}
