package com.wise2.fieldtech.bluetooth

import android.Manifest
import android.annotation.SuppressLint
import android.bluetooth.BluetoothManager
import android.bluetooth.le.ScanCallback
import android.bluetooth.le.ScanResult
import android.content.Context
import android.content.pm.PackageManager
import android.os.Build
import androidx.core.content.ContextCompat
import com.wise2.fieldtech.bluetooth.model.ToolConnectionState
import com.wise2.fieldtech.bluetooth.model.ToolDevice
import com.wise2.fieldtech.domain.model.ReadingSnapshot
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.callbackFlow

class FieldpieceAdapter(private val context: Context) : FieldToolAdapter {
    override val brandName = "Fieldpiece Job Link"
    private val state = MutableStateFlow(ToolConnectionState.DISCONNECTED)
    private var selectedAddress: String? = null

    override fun connectionState(): Flow<ToolConnectionState> = state.asStateFlow()

    @SuppressLint("MissingPermission")
    override fun scan(): Flow<ToolDevice> = callbackFlow {
        checkPermission()
        state.value = ToolConnectionState.SCANNING
        val scanner = scanner()
        val seen = mutableSetOf<String>()
        val callback = object : ScanCallback() {
            override fun onScanResult(callbackType: Int, result: ScanResult) {
                val payload = result.scanRecord?.getManufacturerSpecificData(FieldpieceAdvertisementDecoder.MANUFACTURER_ID) ?: return
                val sman = FieldpieceAdvertisementDecoder.decodeSman(payload)
                val clamp = FieldpieceAdvertisementDecoder.decodePipeClamp(payload)
                if ((sman == null && clamp == null) || !seen.add(result.device.address)) return
                val name = when (clamp?.jobLinkId) {
                    HIGH_SIDE_CLAMP_ID -> "High-side Pipe Clamp $HIGH_SIDE_CLAMP_ID"
                    LOW_SIDE_CLAMP_ID -> "Low-side Pipe Clamp $LOW_SIDE_CLAMP_ID"
                    null -> "Fieldpiece SM480V"
                    else -> "Fieldpiece Pipe Clamp ${clamp.jobLinkId}"
                }
                trySend(ToolDevice(result.device.address, name, "Fieldpiece", isDemo = false))
            }
            override fun onScanFailed(errorCode: Int) { close(IllegalStateException("BLE scan failed: $errorCode")) }
        }
        scanner.startScan(callback)
        awaitClose { scanner.stopScan(callback) }
    }

    override suspend fun connect(device: ToolDevice) {
        state.value = ToolConnectionState.CONNECTING
        selectedAddress = device.id
        state.value = ToolConnectionState.CONNECTED
    }

    override suspend fun disconnect() {
        selectedAddress = null
        state.value = ToolConnectionState.DISCONNECTED
    }

    @SuppressLint("MissingPermission")
    override fun readings(jobId: String): Flow<ReadingSnapshot> = callbackFlow {
        checkPermission()
        val scanner = scanner()
        val callback = object : ScanCallback() {
            override fun onScanResult(callbackType: Int, result: ScanResult) {
                if (result.device.address != selectedAddress) return
                val payload = result.scanRecord?.getManufacturerSpecificData(FieldpieceAdvertisementDecoder.MANUFACTURER_ID) ?: return
                val value = FieldpieceAdvertisementDecoder.decodeSman(payload)
                val clamp = FieldpieceAdvertisementDecoder.decodePipeClamp(payload)
                if (value == null && clamp == null) return
                val sourceName = when (clamp?.jobLinkId) {
                    HIGH_SIDE_CLAMP_ID -> "High-side Pipe Clamp $HIGH_SIDE_CLAMP_ID"
                    LOW_SIDE_CLAMP_ID -> "Low-side Pipe Clamp $LOW_SIDE_CLAMP_ID"
                    null -> "Fieldpiece SM480V"
                    else -> "Fieldpiece Pipe Clamp ${clamp.jobLinkId}"
                }
                trySend(ReadingSnapshot(
                    id = "fieldpiece-${System.nanoTime()}", jobId = jobId,
                    sourceDeviceName = sourceName, capturedAtEpochMillis = System.currentTimeMillis(),
                    isDemoData = false, lowSidePsig = value?.lowSidePsig, highSidePsig = value?.highSidePsig,
                    suctionLineTempF = value?.suctionLineTempF ?: clamp?.temperatureF?.takeIf { clamp.jobLinkId == LOW_SIDE_CLAMP_ID },
                    liquidLineTempF = value?.liquidLineTempF ?: clamp?.temperatureF?.takeIf { clamp.jobLinkId == HIGH_SIDE_CLAMP_ID },
                ))
            }
            override fun onScanFailed(errorCode: Int) { close(IllegalStateException("BLE reading scan failed: $errorCode")) }
        }
        scanner.startScan(callback)
        awaitClose { scanner.stopScan(callback) }
    }

    private fun scanner() = context.getSystemService(BluetoothManager::class.java).adapter.bluetoothLeScanner
        ?: error("Bluetooth is disabled")

    private fun checkPermission() {
        val permission = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) Manifest.permission.BLUETOOTH_SCAN else Manifest.permission.ACCESS_FINE_LOCATION
        check(ContextCompat.checkSelfPermission(context, permission) == PackageManager.PERMISSION_GRANTED) { "Bluetooth permission is required" }
    }

    private companion object {
        const val HIGH_SIDE_CLAMP_ID = "8792"
        const val LOW_SIDE_CLAMP_ID = "8791"
    }
}
