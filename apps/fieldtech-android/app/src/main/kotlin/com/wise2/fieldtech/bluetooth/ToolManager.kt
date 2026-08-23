package com.wise2.fieldtech.bluetooth

import com.wise2.fieldtech.bluetooth.model.ToolConnectionState
import com.wise2.fieldtech.bluetooth.model.ToolDevice
import com.wise2.fieldtech.domain.model.ReadingSnapshot
import kotlinx.coroutines.flow.Flow

/**
 * Facade the rest of the app talks to. Holds the active FieldToolAdapter (SimulatedToolAdapter
 * today; swap in a real brand adapter here once one exists) so screens never depend on a
 * concrete vendor implementation.
 */
class ToolManager(private val adapter: FieldToolAdapter) {

    val brandName: String get() = adapter.brandName

    fun connectionState(): Flow<ToolConnectionState> = adapter.connectionState()

    fun scan(): Flow<ToolDevice> = adapter.scan()

    suspend fun connect(device: ToolDevice) = adapter.connect(device)

    suspend fun disconnect() = adapter.disconnect()

    fun readingsForJob(jobId: String): Flow<ReadingSnapshot> = adapter.readings(jobId)
}
