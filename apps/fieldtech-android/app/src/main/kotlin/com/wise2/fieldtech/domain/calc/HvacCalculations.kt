package com.wise2.fieldtech.domain.calc

import com.wise2.fieldtech.domain.model.ReadingSnapshot

/**
 * Every calculation exposes its inputs, the method used, the result, and when it ran
 * (spec §10) so a technician or IMP can always see how a number was derived rather
 * than trusting an opaque figure.
 */
data class CalculationResult(
    val label: String,
    val method: String,
    val inputs: Map<String, Double>,
    val result: Double?,
    val unit: String,
    val calculatedAtEpochMillis: Long,
    val note: String? = null,
)

object HvacCalculations {

    fun superheat(reading: ReadingSnapshot, nowMillis: Long): CalculationResult? {
        val lineTemp = reading.suctionLineTempF ?: return null
        val satTemp = reading.suctionSaturationF ?: return null
        return CalculationResult(
            label = "Superheat",
            method = "Suction line temperature − suction saturation temperature",
            inputs = mapOf("suctionLineTempF" to lineTemp, "suctionSaturationF" to satTemp),
            result = lineTemp - satTemp,
            unit = "°F",
            calculatedAtEpochMillis = nowMillis,
        )
    }

    fun subcooling(reading: ReadingSnapshot, nowMillis: Long): CalculationResult? {
        val satTemp = reading.liquidSaturationF ?: return null
        val lineTemp = reading.liquidLineTempF ?: return null
        return CalculationResult(
            label = "Subcooling",
            method = "Liquid saturation temperature − liquid line temperature",
            inputs = mapOf("liquidSaturationF" to satTemp, "liquidLineTempF" to lineTemp),
            result = satTemp - lineTemp,
            unit = "°F",
            calculatedAtEpochMillis = nowMillis,
        )
    }

    fun temperatureSplit(reading: ReadingSnapshot, nowMillis: Long): CalculationResult? {
        val returnTemp = reading.returnTempF ?: return null
        val supplyTemp = reading.supplyTempF ?: return null
        return CalculationResult(
            label = "Temperature Split",
            method = "Return air temperature − supply air temperature",
            inputs = mapOf("returnTempF" to returnTemp, "supplyTempF" to supplyTemp),
            result = returnTemp - supplyTemp,
            unit = "°F",
            calculatedAtEpochMillis = nowMillis,
        )
    }

    /** Standard NEMA-style voltage/current imbalance: max deviation from average, as a % of average. */
    fun voltageImbalance(reading: ReadingSnapshot, nowMillis: Long): CalculationResult? {
        val phases = listOfNotNull(reading.voltageL1, reading.voltageL2, reading.voltageL3)
        if (phases.size < 2) return null
        return imbalance("Voltage Imbalance", "V", phases, nowMillis)
    }

    fun currentImbalance(reading: ReadingSnapshot, nowMillis: Long): CalculationResult? {
        val phases = listOfNotNull(reading.currentL1, reading.currentL2, reading.currentL3)
        if (phases.size < 2) return null
        return imbalance("Current Imbalance", "A", phases, nowMillis)
    }

    private fun imbalance(label: String, unit: String, phases: List<Double>, nowMillis: Long): CalculationResult {
        val average = phases.average()
        val maxDeviation = phases.maxOf { kotlin.math.abs(it - average) }
        val percent = if (average == 0.0) 0.0 else (maxDeviation / average) * 100.0
        return CalculationResult(
            label = label,
            method = "Max deviation from average phase $unit, expressed as % of average",
            inputs = phases.mapIndexed { i, v -> "phase${i + 1}$unit" to v }.toMap() + ("average" to average),
            result = percent,
            unit = "%",
            calculatedAtEpochMillis = nowMillis,
            note = if (percent > 10.0) "Exceeds common 10% imbalance guideline — verify supply and motor condition." else null,
        )
    }

    fun allApplicable(reading: ReadingSnapshot, nowMillis: Long): List<CalculationResult> = listOfNotNull(
        superheat(reading, nowMillis),
        subcooling(reading, nowMillis),
        temperatureSplit(reading, nowMillis),
        voltageImbalance(reading, nowMillis),
        currentImbalance(reading, nowMillis),
    )
}
