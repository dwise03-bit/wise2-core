package com.wise2.fieldtech.bluetooth

import com.wise2.fieldtech.bluetooth.model.ToolConnectionState
import com.wise2.fieldtech.bluetooth.model.ToolDevice
import com.wise2.fieldtech.domain.model.ReadingSnapshot
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.flow
import kotlin.random.Random

/**
 * Demo-mode data source (spec §25). Produces plausible, clearly-labeled demo readings so the
 * full Job → Readings → Diagnose → IMP → Report flow (spec §26 test scenario) can be exercised
 * before any physical instrument is connected. All emitted readings carry isDemoData = true.
 */
class SimulatedToolAdapter : FieldToolAdapter {
    override val brandName: String = "WISE² Simulator"

    private val state = MutableStateFlow(ToolConnectionState.DISCONNECTED)
    override fun connectionState(): Flow<ToolConnectionState> = state.asStateFlow()

    override fun scan(): Flow<ToolDevice> = flow {
        state.value = ToolConnectionState.SCANNING
        delay(600)
        emit(ToolDevice(id = "demo-sman-1", name = "Fieldpiece SMAN (Demo)", brand = "Fieldpiece", batteryPercent = 82, isDemo = true))
    }

    override suspend fun connect(device: ToolDevice) {
        state.value = ToolConnectionState.CONNECTING
        delay(500)
        state.value = ToolConnectionState.CONNECTED
    }

    override suspend fun disconnect() {
        state.value = ToolConnectionState.DISCONNECTED
    }

    override fun readings(jobId: String): Flow<ReadingSnapshot> = flow {
        // Anchored on the spec's own visual mock so the demo scenario reproduces the same
        // R-410A no-cooling case end to end (docs/WISE2_DESIGN_SYSTEM_MASTER_VISUAL.png).
        while (true) {
            val jitter = { base: Double, spread: Double -> base + Random.nextDouble(-spread, spread) }
            emit(
                ReadingSnapshot(
                    id = "demo-${System.nanoTime()}",
                    jobId = jobId,
                    sourceDeviceName = "Fieldpiece SMAN (Demo)",
                    capturedAtEpochMillis = System.currentTimeMillis(),
                    isDemoData = true,
                    lowSidePsig = jitter(118.4, 2.0),
                    highSidePsig = jitter(352.1, 4.0),
                    suctionSaturationF = jitter(39.6, 0.5),
                    liquidSaturationF = jitter(105.2, 0.5),
                    suctionLineTempF = jitter(54.2, 1.0),
                    liquidLineTempF = jitter(94.6, 1.0),
                    dischargeTempF = jitter(152.3, 2.0),
                    outdoorAmbientF = jitter(87.1, 0.5),
                    voltageL1 = jitter(242.0, 2.0),
                    voltageL2 = jitter(240.0, 2.0),
                    voltageL3 = null,
                    currentL1 = jitter(12.4, 0.3),
                    currentL2 = jitter(12.1, 0.3),
                    currentL3 = null,
                    frequencyHz = jitter(60.0, 0.1),
                    capacitanceMfd = jitter(35.0, 1.0),
                    resistanceOhms = jitter(4.2, 0.2),
                    continuityOk = true,
                    returnTempF = jitter(75.0, 1.0),
                    supplyTempF = jitter(57.0, 1.0),
                    staticPressureInWc = jitter(0.5, 0.05),
                )
            )
            delay(2000)
        }
    }
}
