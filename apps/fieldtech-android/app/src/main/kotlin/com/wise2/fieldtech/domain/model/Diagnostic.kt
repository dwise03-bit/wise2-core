package com.wise2.fieldtech.domain.model

import kotlinx.serialization.Serializable

enum class DiagnosticCategory {
    NO_COOLING, NO_HEATING, NO_AIRFLOW, COMPRESSOR_NOT_RUNNING, INDOOR_FAN_PROBLEM,
    OUTDOOR_FAN_PROBLEM, HIGH_HEAD_PRESSURE, LOW_SUCTION_PRESSURE, ELECTRICAL_FAULT,
    CONTROLS_THERMOSTAT, ECONOMIZER, REFRIGERATION, HEAT_PUMP, SENSOR_FAULT, INTERMITTENT_FAILURE
}

enum class TestResult { PASS, FAIL, SKIPPED, NOT_APPLICABLE, UNTESTED }

enum class DiagnosticValueSource { MEASURED, DERIVED, TECHNICIAN_ENTERED, AI_INFERENCE, MISSING }

enum class DiagnosticCapturePoint { TEST_IN, TEST_OUT }

enum class FieldWorkflowStep {
    SELECT_EQUIPMENT,
    CONNECT_SMART_TOOLS,
    START_SYSTEM,
    WAIT_FOR_STABILITY,
    RUN_WISE_IMP,
    REVIEW_FINDINGS,
    DOCUMENT_REPAIR,
    CAPTURE_TEST_OUT,
    GENERATE_SERVICE_NOTES,
    COMPLETE_DIAGNOSTIC,
}

enum class DiagnosticPhotoType {
    EQUIPMENT, MODEL_SERIAL, COIL, ELECTRICAL, METER_READING, DAMAGE, BEFORE, AFTER
}

enum class SimulationFixture {
    NORMAL_COOLING, LOW_AIRFLOW, DIRTY_CONDENSER, UNDERCHARGE, OVERCHARGE, METERING_RESTRICTION, ELECTRICAL_FAULT
}

@Serializable
data class DiagnosticMetric(
    val key: String,
    val label: String,
    val value: Double? = null,
    val unit: String,
    val source: DiagnosticValueSource,
    val targetMin: Double? = null,
    val targetMax: Double? = null,
) {
    val hasValidTarget: Boolean get() = targetMin != null || targetMax != null
}

@Serializable
data class DiagnosticCapture(
    val point: DiagnosticCapturePoint,
    val capturedAtEpochMillis: Long,
    val sourceDeviceName: String?,
    val isSimulation: Boolean,
    val metrics: List<DiagnosticMetric>,
)

@Serializable
data class DiagnosticComparison(
    val key: String,
    val label: String,
    val before: Double?,
    val after: Double?,
    val change: Double?,
    val unit: String,
    val source: DiagnosticValueSource,
    val conclusion: String,
)

@Serializable
data class ServicePhoto(
    val type: DiagnosticPhotoType,
    val localPath: String,
    val capturedAtEpochMillis: Long,
    val isSimulation: Boolean = false,
)

@Serializable
data class ServiceNoteOutputs(
    val logansReadyServiceNote: String = "",
    val customerSummary: String = "",
    val wiseDiagnosticRecord: String = "",
)

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
    val completedWorkflowSteps: Set<FieldWorkflowStep> = emptySet(),
    val testIn: DiagnosticCapture? = null,
    val testOut: DiagnosticCapture? = null,
    val technicianObservations: String = "",
    val documentedRepair: String = "",
    val possibleFaults: List<String> = emptyList(),
    val recommendedActions: List<String> = emptyList(),
    val photos: List<ServicePhoto> = emptyList(),
    val simulationFixture: SimulationFixture? = null,
    val serviceNotes: ServiceNoteOutputs = ServiceNoteOutputs(),
)
