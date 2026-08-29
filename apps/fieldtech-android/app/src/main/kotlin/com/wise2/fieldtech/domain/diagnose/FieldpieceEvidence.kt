package com.wise2.fieldtech.domain.diagnose

import com.wise2.fieldtech.domain.calc.HvacCalculations
import com.wise2.fieldtech.domain.model.ReadingSnapshot

data class FieldpieceEvidenceCard(
    val id: String,
    val label: String,
    val value: String,
    val unit: String,
    val available: Boolean,
)

data class FieldpieceEvidence(
    val sourceDeviceName: String,
    val capturedAtEpochMillis: Long,
    val isDemoData: Boolean,
    val isLive: Boolean,
    val cards: List<FieldpieceEvidenceCard>,
)

object FieldpieceEvidenceMapper {
    const val MISSING = "—"
    const val NOT_AVAILABLE = "Not available"

    fun fromReading(reading: ReadingSnapshot?, nowMillis: Long, isLive: Boolean = false): FieldpieceEvidence? {
        if (reading == null) return null
        val calculations = HvacCalculations.allApplicable(reading, nowMillis).associateBy { it.label }
        return FieldpieceEvidence(
            sourceDeviceName = reading.sourceDeviceName,
            capturedAtEpochMillis = reading.capturedAtEpochMillis,
            isDemoData = reading.isDemoData,
            isLive = isLive,
            cards = listOf(
                pressureCard("head-pressure", "HEAD PRESSURE", reading.highSidePsig, "PSIG"),
                calcCard("subcooling", "SUBCOOLING", calculations["Subcooling"], "°F"),
                calcCard("superheat", "SUPERHEAT", calculations["Superheat"], "°F"),
                calcCard("delta-t", "ΔT / AIRFLOW", calculations["Temperature Split"], "°F"),
            ),
        )
    }

    fun contextLines(reading: ReadingSnapshot?, nowMillis: Long): String {
        val evidence = fromReading(reading, nowMillis) ?: return "FIELDPIECE: no captured reading for this job"
        val demo = if (evidence.isDemoData) " (DEMO — not a live instrument)" else ""
        return buildString {
            appendLine("FIELDPIECE$demo: ${evidence.sourceDeviceName}")
            evidence.cards.forEach { card ->
                val shown = if (card.available) "${card.value} ${card.unit}".trim() else NOT_AVAILABLE
                appendLine("${card.label}: $shown")
            }
        }.trimEnd()
    }

    private fun pressureCard(id: String, label: String, value: Double?, unit: String) = FieldpieceEvidenceCard(
        id = id,
        label = label,
        value = value?.let { formatNumber(it) } ?: MISSING,
        unit = if (value == null) "" else unit,
        available = value != null,
    )

    private fun calcCard(
        id: String,
        label: String,
        calculation: com.wise2.fieldtech.domain.calc.CalculationResult?,
        unit: String,
    ) = FieldpieceEvidenceCard(
        id = id,
        label = label,
        value = calculation?.result?.let { formatNumber(it) } ?: MISSING,
        unit = if (calculation?.result == null) "" else unit,
        available = calculation?.result != null,
    )

    private fun formatNumber(value: Double): String =
        if (value % 1.0 == 0.0) value.toInt().toString() else "%.1f".format(java.util.Locale.US, value)
}
