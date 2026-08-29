package com.wise2.fieldtech.domain.diagnose

import com.wise2.fieldtech.domain.model.DiagnosticCapture
import com.wise2.fieldtech.domain.model.DiagnosticCapturePoint
import com.wise2.fieldtech.domain.model.DiagnosticComparison
import com.wise2.fieldtech.domain.model.DiagnosticMetric
import com.wise2.fieldtech.domain.model.DiagnosticValueSource
import com.wise2.fieldtech.domain.model.FieldWorkflowStep
import com.wise2.fieldtech.domain.model.ReadingSnapshot
import com.wise2.fieldtech.domain.model.ServiceNoteOutputs
import kotlin.math.abs

object DiagnosticCockpit {
    val workflow = listOf(
        FieldWorkflowStep.SELECT_EQUIPMENT,
        FieldWorkflowStep.CONNECT_SMART_TOOLS,
        FieldWorkflowStep.START_SYSTEM,
        FieldWorkflowStep.WAIT_FOR_STABILITY,
        FieldWorkflowStep.RUN_WISE_IMP,
        FieldWorkflowStep.REVIEW_FINDINGS,
        FieldWorkflowStep.DOCUMENT_REPAIR,
        FieldWorkflowStep.CAPTURE_TEST_OUT,
        FieldWorkflowStep.GENERATE_SERVICE_NOTES,
        FieldWorkflowStep.COMPLETE_DIAGNOSTIC,
    )

    fun capture(point: DiagnosticCapturePoint, reading: ReadingSnapshot?, nowMillis: Long): DiagnosticCapture =
        DiagnosticCapture(
            point = point,
            capturedAtEpochMillis = nowMillis,
            sourceDeviceName = reading?.sourceDeviceName,
            isSimulation = reading?.isDemoData == true,
            metrics = metricsFrom(reading),
        )

    fun metricsFrom(reading: ReadingSnapshot?): List<DiagnosticMetric> {
        fun measured(key: String, label: String, value: Double?, unit: String) =
            DiagnosticMetric(key, label, value, unit, if (value == null) DiagnosticValueSource.MISSING else DiagnosticValueSource.MEASURED)

        val deltaT = if (reading?.returnTempF != null && reading.supplyTempF != null) {
            reading.returnTempF - reading.supplyTempF
        } else null
        val superheat = if (reading?.suctionLineTempF != null && reading.suctionSaturationF != null) {
            reading.suctionLineTempF - reading.suctionSaturationF
        } else null
        val subcooling = if (reading?.liquidSaturationF != null && reading.liquidLineTempF != null) {
            reading.liquidSaturationF - reading.liquidLineTempF
        } else null

        return listOf(
            measured("suction", "Suction", reading?.lowSidePsig, "psig"),
            measured("high_side", "High Side", reading?.highSidePsig, "psig"),
            DiagnosticMetric("superheat", "Superheat", superheat, "F", if (superheat == null) DiagnosticValueSource.MISSING else DiagnosticValueSource.DERIVED),
            DiagnosticMetric("subcooling", "Subcooling", subcooling, "F", if (subcooling == null) DiagnosticValueSource.MISSING else DiagnosticValueSource.DERIVED),
            DiagnosticMetric("delta_t", "Delta-T", deltaT, "F", if (deltaT == null) DiagnosticValueSource.MISSING else DiagnosticValueSource.DERIVED, 16.0, 22.0),
            measured("static", "Static", reading?.staticPressureInWc, "in WC"),
            measured("return", "Return", reading?.returnTempF, "F"),
            measured("supply", "Supply", reading?.supplyTempF, "F"),
            DiagnosticMetric("airflow", "Airflow", null, "CFM", DiagnosticValueSource.MISSING),
            measured("voltage", "Voltage", reading?.voltageL1, "V"),
            measured("amps", "Amps", reading?.currentL1, "A"),
            measured("capacitance", "Capacitance", reading?.capacitanceMfd, "uF"),
        )
    }

    fun compare(testIn: DiagnosticCapture?, testOut: DiagnosticCapture?): List<DiagnosticComparison> {
        if (testIn == null || testOut == null) return emptyList()
        return testIn.metrics.map { before ->
            val after = testOut.metrics.firstOrNull { it.key == before.key }
            val change = if (before.value != null && after?.value != null) after.value - before.value else null
            DiagnosticComparison(
                key = before.key,
                label = before.label,
                before = before.value,
                after = after?.value,
                change = change,
                unit = before.unit,
                source = if (before.source == DiagnosticValueSource.MISSING) after?.source ?: before.source else before.source,
                conclusion = conclusion(before, after, change),
            )
        }
    }

    fun serviceNotes(
        reasonForCall: String,
        equipment: String,
        modelSerial: String,
        finalFinding: String?,
        repair: String,
        observations: String,
        comparisons: List<DiagnosticComparison>,
        technician: String,
        testIn: DiagnosticCapture?,
        testOut: DiagnosticCapture?,
    ): ServiceNoteOutputs {
        val measurementLines = comparisons.filter { it.before != null || it.after != null }.joinToString("\n") {
            "- ${it.label}: Test In ${it.before?.format() ?: "missing"} ${it.unit}, Test Out ${it.after?.format() ?: "missing"} ${it.unit}, change ${it.change?.signedFormat() ?: "missing"} ${it.unit}. ${it.conclusion}"
        }
        val note = buildString {
            appendLine("Reason for call: ${reasonForCall.ifBlank { "Not documented" }}")
            appendLine("Equipment: ${equipment.ifBlank { "Not documented" }}")
            appendLine("Model/serial: ${modelSerial.ifBlank { "Not documented" }}")
            appendLine("System operation: ${observations.ifBlank { "Not documented" }}")
            appendLine("Measurements:")
            appendLine(measurementLines.ifBlank { "- No captured measurements available." })
            appendLine("Diagnostic findings: ${finalFinding ?: "Not confirmed"}")
            appendLine("Work completed: ${repair.ifBlank { "Not documented" }}")
            appendLine("Test Out: ${if (testOut == null) "Not captured" else "Captured"}")
            appendLine("Final operation: ${observations.ifBlank { "Not documented" }}")
            appendLine("Recommendations/follow-up: Based on captured findings only; no additional recommendation documented.")
            appendLine("Technician: ${technician.ifBlank { "Not documented" }}")
        }.trim()
        val summary = listOf(
            "Found: ${finalFinding ?: "A confirmed diagnosis has not been documented yet."}",
            "Done: ${repair.ifBlank { "Work completed has not been documented yet." }}",
            "Current condition: ${if (testOut == null) "Test Out has not been captured." else "Test Out readings are captured in the diagnostic record."}",
            "Next recommendation: Use captured targets and follow-up notes only.",
        ).joinToString("\n")
        val record = buildString {
            appendLine("WISE2 DIAGNOSTIC RECORD")
            appendLine("Equipment: ${equipment.ifBlank { "MISSING" }}")
            appendLine("Tools: ${listOfNotNull(testIn?.sourceDeviceName, testOut?.sourceDeviceName).distinct().joinToString().ifBlank { "MISSING" }}")
            appendLine("Test In timestamp: ${testIn?.capturedAtEpochMillis ?: "MISSING"}")
            appendLine("Test Out timestamp: ${testOut?.capturedAtEpochMillis ?: "MISSING"}")
            appendLine("Diagnosis: ${finalFinding ?: "MISSING"}")
            appendLine("Evidence:")
            appendLine(measurementLines.ifBlank { "- MISSING" })
            appendLine("Technician observations: ${observations.ifBlank { "MISSING" }}")
            appendLine("Service note: $note")
        }.trim()
        return ServiceNoteOutputs(note, summary, record)
    }

    private fun conclusion(before: DiagnosticMetric, after: DiagnosticMetric?, change: Double?): String = when {
        before.value == null && after?.value == null -> "No comparison available."
        change == null -> "Change not available."
        !before.hasValidTarget -> "Changed; no valid target is assigned, so improvement is not claimed."
        after?.targetMin != null && after.value != null && after.value < after.targetMin -> "Still below target."
        after?.targetMax != null && after.value != null && after.value > after.targetMax -> "Still above target."
        abs(change) < 0.01 -> "No material change."
        else -> "Within documented target."
    }

    private fun Double.format(): String = "%.2f".format(this).trimEnd('0').trimEnd('.')
    private fun Double.signedFormat(): String = "%+.2f".format(this).trimEnd('0').trimEnd('.')
}
