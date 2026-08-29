package com.wise2.fieldtech.data.repository

import com.wise2.fieldtech.data.local.dao.DiagnosticDao
import com.wise2.fieldtech.data.local.entity.DiagnosticSessionEntity
import com.wise2.fieldtech.domain.diagnose.DiagnosticEngine
import com.wise2.fieldtech.domain.model.DiagnosticCapture
import com.wise2.fieldtech.domain.model.DiagnosticCategory
import com.wise2.fieldtech.domain.model.DiagnosticSession
import com.wise2.fieldtech.domain.model.DiagnosticStepResult
import com.wise2.fieldtech.domain.model.FieldWorkflowStep
import com.wise2.fieldtech.domain.model.ServiceNoteOutputs
import com.wise2.fieldtech.domain.model.ServicePhoto
import com.wise2.fieldtech.domain.model.SimulationFixture
import com.wise2.fieldtech.domain.model.TestResult
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json

@Serializable
private data class StepResultJson(val stepId: String, val result: String, val note: String, val at: Long)

@Serializable
private data class DiagnosticPayloadJson(
    val results: List<StepResultJson> = emptyList(),
    val completedWorkflowSteps: List<String> = emptyList(),
    val testIn: DiagnosticCapture? = null,
    val testOut: DiagnosticCapture? = null,
    val technicianObservations: String = "",
    val documentedRepair: String = "",
    val possibleFaults: List<String> = emptyList(),
    val recommendedActions: List<String> = emptyList(),
    val photos: List<ServicePhoto> = emptyList(),
    val simulationFixture: String? = null,
    val serviceNotes: ServiceNoteOutputs = ServiceNoteOutputs(),
)

class DiagnosticRepository(private val dao: DiagnosticDao) {

    private val json = Json { ignoreUnknownKeys = true }

    fun observe(jobId: String): Flow<DiagnosticSession?> = dao.observe(jobId).map { it?.toDomain() }

    suspend fun start(jobId: String, category: DiagnosticCategory): DiagnosticSession {
        val session = DiagnosticEngine.start(jobId, category)
        dao.upsert(session.toEntity())
        return session
    }

    suspend fun record(session: DiagnosticSession, result: TestResult, note: String, nowMillis: Long): DiagnosticSession {
        val updated = DiagnosticEngine.record(session, result, note, nowMillis)
        dao.upsert(updated.toEntity())
        return updated
    }

    suspend fun save(session: DiagnosticSession) {
        dao.upsert(session.toEntity())
    }

    private fun DiagnosticSession.toEntity() = DiagnosticSessionEntity(
        jobId = jobId,
        category = category.name,
        currentStepId = currentStepId,
        isComplete = isComplete,
        finalFinding = finalFinding,
        resultsJson = json.encodeToString(
            DiagnosticPayloadJson.serializer(),
            DiagnosticPayloadJson(
                results = results.map { StepResultJson(it.stepId, it.result.name, it.technicianNote, it.recordedAtEpochMillis) },
                completedWorkflowSteps = completedWorkflowSteps.map { it.name },
                testIn = testIn,
                testOut = testOut,
                technicianObservations = technicianObservations,
                documentedRepair = documentedRepair,
                possibleFaults = possibleFaults,
                recommendedActions = recommendedActions,
                photos = photos,
                simulationFixture = simulationFixture?.name,
                serviceNotes = serviceNotes,
            ),
        ),
        pendingSync = true,
    )

    private fun DiagnosticSessionEntity.toDomain(): DiagnosticSession {
        val legacyResults = runCatching {
            json.decodeFromString(kotlinx.serialization.builtins.ListSerializer(StepResultJson.serializer()), resultsJson)
        }.getOrDefault(emptyList())
        val payload = runCatching {
            json.decodeFromString(DiagnosticPayloadJson.serializer(), resultsJson)
        }.getOrDefault(DiagnosticPayloadJson(results = legacyResults))
        return DiagnosticSession(
            jobId = jobId,
            category = DiagnosticCategory.valueOf(category),
            results = payload.results.map { DiagnosticStepResult(it.stepId, TestResult.valueOf(it.result), it.note, it.at) },
            currentStepId = currentStepId,
            isComplete = isComplete,
            finalFinding = finalFinding,
            completedWorkflowSteps = payload.completedWorkflowSteps.mapNotNull { runCatching { FieldWorkflowStep.valueOf(it) }.getOrNull() }.toSet(),
            testIn = payload.testIn,
            testOut = payload.testOut,
            technicianObservations = payload.technicianObservations,
            documentedRepair = payload.documentedRepair,
            possibleFaults = payload.possibleFaults,
            recommendedActions = payload.recommendedActions,
            photos = payload.photos,
            simulationFixture = payload.simulationFixture?.let { runCatching { SimulationFixture.valueOf(it) }.getOrNull() },
            serviceNotes = payload.serviceNotes,
        )
    }
}
