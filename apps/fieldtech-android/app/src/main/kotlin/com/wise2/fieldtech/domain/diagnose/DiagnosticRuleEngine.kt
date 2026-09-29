package com.wise2.fieldtech.domain.diagnose

import com.wise2.fieldtech.domain.model.ReadingSnapshot
import kotlin.math.abs

data class DiagnosticAssessment(
    val title: String,
    val confidencePercent: Int,
    val rationale: List<String>,
    val checks: List<String>,
)

/** Stateless, explainable assessment for live telemetry. Confidence is a triage score, not a replacement for service verification. */
object DiagnosticRuleEngine {
    fun assess(reading: ReadingSnapshot): DiagnosticAssessment {
        val evidence = mutableListOf<String>()
        val checks = mutableListOf("Verify airflow / filter / blower performance", "Confirm charge using manufacturer procedure")
        var score = 0
        val split = reading.returnTempF?.let { ret -> reading.supplyTempF?.let { ret - it } }
        if (split != null && split < 16.0) { score += 35; evidence += "Air delta-T is ${"%.1f".format(split)} °F, below a typical 16–22 °F cooling band" }
        val superheat = reading.suctionLineTempF?.let { line -> reading.suctionSaturationF?.let { line - it } }
        if (superheat != null && superheat > 18.0) { score += 25; evidence += "Elevated superheat suggests starved evaporator or restricted airflow" }
        val subcooling = reading.liquidSaturationF?.let { sat -> reading.liquidLineTempF?.let { sat - it } }
        if (subcooling != null && subcooling < 6.0) { score += 22; evidence += "Low subcooling suggests undercharge or insufficient liquid seal" }
        if (reading.staticPressureInWc != null && reading.staticPressureInWc > 0.8) { score += 18; evidence += "Static pressure is elevated at ${"%.2f".format(reading.staticPressureInWc)} in.w.c." }
        if (score == 0) return DiagnosticAssessment("System within measured operating envelope", 64, listOf("No high-signal rule fired"), checks)
        val confidence = score.coerceIn(0, 100)
        return DiagnosticAssessment("Airflow or Charge Issue", confidence, evidence, checks)
    }
}
