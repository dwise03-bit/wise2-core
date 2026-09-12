package com.wise2.fieldtech.domain.hvacnode

import com.wise2.fieldtech.domain.model.HvacNodeSnapshot
import kotlin.math.abs

data class HvacNodeValidationResult(
    val snapshot: HvacNodeSnapshot,
    val rejectedChannels: Set<String>,
    val isStale: Boolean,
    val hasClockSkew: Boolean,
)

object HvacNodeTelemetryValidator {
    private const val STALE_AFTER_MS = 5_000L
    private const val CLOCK_SKEW_AFTER_MS = 60_000L

    fun validate(snapshot: HvacNodeSnapshot): HvacNodeValidationResult {
        val rejected = linkedSetOf<String>()

        fun channel(name: String, value: Double?, range: ClosedFloatingPointRange<Double>): Double? {
            if (value == null) return null
            if (!value.isFinite() || value !in range) {
                rejected += name
                return null
            }
            return value
        }

        val sanitized = snapshot.copy(
            suctionPressurePsig = channel("suctionPressurePsig", snapshot.suctionPressurePsig, -15.0..250.0),
            liquidPressurePsig = channel("liquidPressurePsig", snapshot.liquidPressurePsig, -15.0..800.0),
            suctionLineTempF = channel("suctionLineTempF", snapshot.suctionLineTempF, -100.0..300.0),
            liquidLineTempF = channel("liquidLineTempF", snapshot.liquidLineTempF, -100.0..350.0),
            supplyTempF = channel("supplyTempF", snapshot.supplyTempF, -100.0..250.0),
            returnTempF = channel("returnTempF", snapshot.returnTempF, -100.0..250.0),
            supplyRhPercent = channel("supplyRhPercent", snapshot.supplyRhPercent, 0.0..100.0),
            returnRhPercent = channel("returnRhPercent", snapshot.returnRhPercent, 0.0..100.0),
            voltageL1 = channel("voltageL1", snapshot.voltageL1, 0.0..1000.0),
            voltageL2 = channel("voltageL2", snapshot.voltageL2, 0.0..1000.0),
            voltageL3 = channel("voltageL3", snapshot.voltageL3, 0.0..1000.0),
            currentL1 = channel("currentL1", snapshot.currentL1, 0.0..500.0),
            currentL2 = channel("currentL2", snapshot.currentL2, 0.0..500.0),
            currentL3 = channel("currentL3", snapshot.currentL3, 0.0..500.0),
            batteryPercent = channel("batteryPercent", snapshot.batteryPercent, 0.0..100.0),
            inputPowerWatts = channel("inputPowerWatts", snapshot.inputPowerWatts, 0.0..5000.0),
        )

        val age = snapshot.receivedAtEpochMillis - snapshot.capturedAtEpochMillis
        return HvacNodeValidationResult(
            snapshot = sanitized,
            rejectedChannels = rejected,
            isStale = age > STALE_AFTER_MS,
            hasClockSkew = snapshot.capturedAtEpochMillis - snapshot.receivedAtEpochMillis > CLOCK_SKEW_AFTER_MS ||
                abs(age) > CLOCK_SKEW_AFTER_MS && age < 0,
        )
    }
}
