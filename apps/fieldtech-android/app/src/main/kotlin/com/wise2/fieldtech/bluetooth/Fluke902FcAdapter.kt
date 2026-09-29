package com.wise2.fieldtech.bluetooth

import android.Manifest
import android.annotation.SuppressLint
import android.bluetooth.BluetoothGatt
import android.bluetooth.BluetoothGattCallback
import android.bluetooth.BluetoothGattCharacteristic
import android.bluetooth.BluetoothManager
import android.bluetooth.BluetoothProfile
import android.bluetooth.le.ScanCallback
import android.bluetooth.le.ScanResult
import android.content.Context
import android.content.pm.PackageManager
import android.os.Build
import androidx.core.content.ContextCompat
import com.wise2.fieldtech.bluetooth.model.ToolConnectionState
import com.wise2.fieldtech.bluetooth.model.ToolDevice
import com.wise2.fieldtech.domain.model.ReadingSnapshot
import java.util.UUID
import kotlin.coroutines.resume
import kotlin.coroutines.resumeWithException
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import kotlinx.coroutines.suspendCancellableCoroutine

class Fluke902FcAdapter(private val context: Context) : FieldToolAdapter {
    override val brandName = "Fluke Connect"
    private val state = MutableStateFlow(ToolConnectionState.DISCONNECTED)
    private var gatt: BluetoothGatt? = null
    private var measurement: BluetoothGattCharacteristic? = null
    private var readingSink: ((ByteArray) -> Unit)? = null

    override fun connectionState(): Flow<ToolConnectionState> = state.asStateFlow()

    @SuppressLint("MissingPermission")
    override fun scan(): Flow<ToolDevice> = callbackFlow {
        checkScanPermission()
        state.value = ToolConnectionState.SCANNING
        val scanner = scanner()
        val seen = mutableSetOf<String>()
        val callback = object : ScanCallback() {
            override fun onScanResult(callbackType: Int, result: ScanResult) {
                val name = result.scanRecord?.deviceName ?: result.device.name
                if (name != "902FC" || !seen.add(result.device.address)) return
                trySend(ToolDevice(result.device.address, "Fluke 902 FC", "Fluke", isDemo = false))
            }
            override fun onScanFailed(errorCode: Int) { close(IllegalStateException("BLE scan failed: $errorCode")) }
        }
        scanner.startScan(callback)
        awaitClose { scanner.stopScan(callback) }
    }

    @SuppressLint("MissingPermission")
    override suspend fun connect(device: ToolDevice) {
        checkConnectPermission()
        state.value = ToolConnectionState.CONNECTING
        disconnect()
        suspendCancellableCoroutine { continuation ->
            val target = context.getSystemService(BluetoothManager::class.java).adapter.getRemoteDevice(device.id)
            val callback = object : BluetoothGattCallback() {
                override fun onConnectionStateChange(current: BluetoothGatt, status: Int, newState: Int) {
                    if (status == BluetoothGatt.GATT_SUCCESS && newState == BluetoothProfile.STATE_CONNECTED) {
                        current.discoverServices()
                    } else if (newState == BluetoothProfile.STATE_DISCONNECTED) {
                        state.value = ToolConnectionState.DISCONNECTED
                        if (continuation.isActive) continuation.resumeWithException(IllegalStateException("Fluke connection failed: $status"))
                    }
                }

                override fun onServicesDiscovered(current: BluetoothGatt, status: Int) {
                    val characteristic = current.getService(SERVICE_UUID)?.getCharacteristic(MEASUREMENT_UUID)
                    if (status == BluetoothGatt.GATT_SUCCESS && characteristic != null) {
                        gatt = current
                        measurement = characteristic
                        state.value = ToolConnectionState.CONNECTED
                        if (continuation.isActive) continuation.resume(Unit)
                    } else if (continuation.isActive) {
                        continuation.resumeWithException(IllegalStateException("Fluke measurement service unavailable"))
                    }
                }

                @Deprecated("Deprecated in Android API 33")
                override fun onCharacteristicRead(current: BluetoothGatt, characteristic: BluetoothGattCharacteristic, status: Int) {
                    if (status == BluetoothGatt.GATT_SUCCESS && characteristic.uuid == MEASUREMENT_UUID) {
                        readingSink?.invoke(characteristic.value ?: return)
                    }
                }
            }
            val connection = target.connectGatt(context, false, callback)
            gatt = connection
            continuation.invokeOnCancellation { connection.close() }
        }
    }

    @SuppressLint("MissingPermission")
    override suspend fun disconnect() {
        readingSink = null
        measurement = null
        gatt?.disconnect()
        gatt?.close()
        gatt = null
        state.value = ToolConnectionState.DISCONNECTED
    }

    @SuppressLint("MissingPermission")
    override fun readings(jobId: String): Flow<ReadingSnapshot> = callbackFlow {
        val currentGatt = gatt ?: error("Fluke meter is not connected")
        val currentMeasurement = measurement ?: error("Fluke measurement characteristic is unavailable")
        readingSink = { bytes ->
            FlukeReadingDecoder.decode(bytes)?.let { decoded ->
                trySend(ReadingSnapshot(
                    id = "fluke-${System.nanoTime()}", jobId = jobId, sourceDeviceName = "Fluke 902 FC",
                    capturedAtEpochMillis = System.currentTimeMillis(), isDemoData = false,
                    capacitanceMfd = decoded.capacitanceMfd,
                ))
            }
        }
        val poller = launch {
            while (isActive) {
                currentGatt.readCharacteristic(currentMeasurement)
                delay(1_000)
            }
        }
        awaitClose { poller.cancel(); readingSink = null }
    }

    private fun scanner() = context.getSystemService(BluetoothManager::class.java).adapter.bluetoothLeScanner
        ?: error("Bluetooth is disabled")

    private fun checkScanPermission() {
        val permission = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) Manifest.permission.BLUETOOTH_SCAN else Manifest.permission.ACCESS_FINE_LOCATION
        check(ContextCompat.checkSelfPermission(context, permission) == PackageManager.PERMISSION_GRANTED) { "Bluetooth scan permission is required" }
    }

    private fun checkConnectPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            check(ContextCompat.checkSelfPermission(context, Manifest.permission.BLUETOOTH_CONNECT) == PackageManager.PERMISSION_GRANTED) { "Bluetooth connect permission is required" }
        }
    }

    private companion object {
        val SERVICE_UUID: UUID = UUID.fromString("b6981800-7562-11e2-b50d-00163e46f8fe")
        val MEASUREMENT_UUID: UUID = UUID.fromString("b6982901-7562-11e2-b50d-00163e46f8fe")
    }
}
