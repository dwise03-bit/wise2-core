package com.wise2.fieldtech.domain.model

enum class HvacNodeModel {
    PI5_ULTRA,
    UNO_Q_PRO,
    UNKNOWN,
}

enum class HvacNodeTransport {
    WIFI,
    BLUETOOTH,
    USB,
    SIMULATED,
}

data class HvacNodeCapabilities(
    val pressure: Boolean = false,
    val temperature: Boolean = false,
    val humidity: Boolean = false,
    val electrical: Boolean = false,
    val camera: Boolean = false,
    val localAi: Boolean = false,
)

data class HvacNodeDevice(
    val id: String,
    val name: String,
    val model: HvacNodeModel,
    val firmwareVersion: String? = null,
    val capabilities: HvacNodeCapabilities = HvacNodeCapabilities(),
)

data class HvacNodeSensorHealth(
    val channel: String,
    val healthy: Boolean,
    val message: String? = null,
)

data class HvacNodeSnapshot(
    val deviceId: String,
    val sessionId: String,
    val sequence: Long,
    val capturedAtEpochMillis: Long,
    val receivedAtEpochMillis: Long,
    val transport: HvacNodeTransport,
    val suctionPressurePsig: Double? = null,
    val liquidPressurePsig: Double? = null,
    val suctionLineTempF: Double? = null,
    val liquidLineTempF: Double? = null,
    val supplyTempF: Double? = null,
    val returnTempF: Double? = null,
    val supplyRhPercent: Double? = null,
    val returnRhPercent: Double? = null,
    val voltageL1: Double? = null,
    val voltageL2: Double? = null,
    val voltageL3: Double? = null,
    val currentL1: Double? = null,
    val currentL2: Double? = null,
    val currentL3: Double? = null,
    val batteryPercent: Double? = null,
    val inputPowerWatts: Double? = null,
    val signalStrength: Int? = null,
    val refrigerant: String? = null,
    val sensorHealth: List<HvacNodeSensorHealth> = emptyList(),
) {
    val identityKey: String
        get() = "$deviceId:$sessionId:$sequence"
}

sealed interface HvacNodeConnectionState {
    data object Disconnected : HvacNodeConnectionState
    data object Scanning : HvacNodeConnectionState

    data class Connecting(
        val deviceId: String,
        val transport: HvacNodeTransport,
    ) : HvacNodeConnectionState

    data class Connected(
        val deviceId: String,
        val transport: HvacNodeTransport,
        val signalStrength: Int? = null,
        val isStale: Boolean = false,
    ) : HvacNodeConnectionState

    data class Error(
        val deviceId: String? = null,
        val message: String,
        val recoverable: Boolean = true,
    ) : HvacNodeConnectionState
}

data class HvacNodeSession(
    val id: String,
    val deviceId: String,
    val startedAtEpochMillis: Long,
    val endedAtEpochMillis: Long? = null,
    val jobId: String? = null,
    val equipmentId: String? = null,
    val notes: String? = null,
)

enum class HvacNodeAlertSeverity {
    INFO,
    WARNING,
    CRITICAL,
}

data class HvacNodeAlert(
    val id: String,
    val deviceId: String,
    val sessionId: String? = null,
    val createdAtEpochMillis: Long,
    val severity: HvacNodeAlertSeverity,
    val code: String,
    val message: String,
)
