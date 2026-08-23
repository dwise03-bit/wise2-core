package com.wise2.fieldtech.domain.model

enum class DiagnosticCategory {
    NO_COOLING, NO_HEATING, NO_AIRFLOW, COMPRESSOR_NOT_RUNNING, INDOOR_FAN_PROBLEM,
    OUTDOOR_FAN_PROBLEM, HIGH_HEAD_PRESSURE, LOW_SUCTION_PRESSURE, ELECTRICAL_FAULT,
    CONTROLS_THERMOSTAT, ECONOMIZER, REFRIGERATION, HEAT_PUMP, SENSOR_FAULT, INTERMITTENT_FAILURE
}

enum class TestResult { PASS, FAIL, SKIPPED, NOT_APPLICABLE, UNTESTED }

data class DiagnosticStep(
    val id: String,
    val prompt: String,
    val onPassGoToStepId: String?,
    val onFailGoToStepId: String?,
    val isTerminal: Boolean = false,
    val terminalFinding: String? = null,
)

data class DiagnosticTree(
    val category: DiagnosticCategory,
    val title: String,
    val startStepId: String,
    val steps: List<DiagnosticStep>,
) {
    fun step(id: String): DiagnosticStep = steps.first { it.id == id }
}

data class DiagnosticStepResult(
    val stepId: String,
    val result: TestResult,
    val technicianNote: String = "",
    val recordedAtEpochMillis: Long,
)

data class DiagnosticSession(
    val jobId: String,
    val category: DiagnosticCategory,
    val results: List<DiagnosticStepResult>,
    val currentStepId: String,
    val isComplete: Boolean,
    val finalFinding: String?,
)
