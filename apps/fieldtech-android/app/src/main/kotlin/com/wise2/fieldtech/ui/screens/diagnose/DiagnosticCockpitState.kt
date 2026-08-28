package com.wise2.fieldtech.ui.screens.diagnose

enum class ReadingState { MEASURED, MISSING }
enum class EvidenceType { MEASURED, DERIVED, AI_INFERENCE }

data class DiagnosticEvidence(val text: String, val type: EvidenceType)

data class DiagnosticCockpitState(
    val suctionPsi: Double? = null,
    val liquidPsi: Double? = null,
    val suctionLineF: Double? = null,
    val liquidLineF: Double? = null,
    val superheatF: Double? = null,
    val subcoolingF: Double? = null,
    val deltaTF: Double? = null,
    val totalStaticInWc: Double? = null,
    val returnDbF: Double? = null,
    val supplyDbF: Double? = null,
    val evidence: List<DiagnosticEvidence> = emptyList(),
    val assessment: String? = null,
    val evidenceStrength: Int? = null,
    val nextBestTest: String? = null,
) {
    fun stateOf(value: Double?) = if (value == null) ReadingState.MISSING else ReadingState.MEASURED
    val nextBestTestLabel: String get() = nextBestTest ?: "MISSING"
}
