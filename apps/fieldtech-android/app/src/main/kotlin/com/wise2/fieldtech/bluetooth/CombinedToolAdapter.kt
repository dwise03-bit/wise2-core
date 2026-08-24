package com.wise2.fieldtech.bluetooth

import com.wise2.fieldtech.bluetooth.model.ToolConnectionState
import com.wise2.fieldtech.bluetooth.model.ToolDevice
import com.wise2.fieldtech.domain.model.ReadingSnapshot
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.launch

class CombinedToolAdapter(
    private val fieldpiece: FieldToolAdapter,
    private val fluke: FieldToolAdapter,
) : FieldToolAdapter {
    override val brandName = "Fieldpiece + Fluke"
    private val state = MutableStateFlow(ToolConnectionState.DISCONNECTED)
    private var active: FieldToolAdapter? = null

    override fun connectionState(): Flow<ToolConnectionState> = state.asStateFlow()

    override fun scan(): Flow<ToolDevice> = callbackFlow {
        state.value = ToolConnectionState.SCANNING
        val fieldpieceJob = launch { fieldpiece.scan().collect { trySend(it) } }
        val flukeJob = launch { fluke.scan().collect { trySend(it) } }
        awaitClose { fieldpieceJob.cancel(); flukeJob.cancel() }
    }

    override suspend fun connect(device: ToolDevice) {
        state.value = ToolConnectionState.CONNECTING
        val adapter = if (device.brand == "Fluke") fluke else fieldpiece
        active?.disconnect()
        adapter.connect(device)
        active = adapter
        state.value = ToolConnectionState.CONNECTED
    }

    override suspend fun disconnect() {
        active?.disconnect()
        active = null
        state.value = ToolConnectionState.DISCONNECTED
    }

    override fun readings(jobId: String): Flow<ReadingSnapshot> =
        requireNotNull(active) { "No field tool is connected" }.readings(jobId)
}
