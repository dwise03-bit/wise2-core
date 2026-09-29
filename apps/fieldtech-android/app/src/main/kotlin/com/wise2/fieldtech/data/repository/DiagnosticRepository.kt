package com.wise2.fieldtech.data.repository

import com.wise2.fieldtech.data.local.dao.DiagnosticDao
import com.wise2.fieldtech.data.local.entity.DiagnosticSessionEntity
import com.wise2.fieldtech.domain.diagnose.DiagnosticEngine
import com.wise2.fieldtech.domain.model.DiagnosticCategory
import com.wise2.fieldtech.domain.model.DiagnosticSession
import com.wise2.fieldtech.domain.model.DiagnosticStepResult
import com.wise2.fieldtech.domain.model.TestResult
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json

@Serializable
private data class StepResultJson(val stepId: String, val result: String, val note: String, val at: Long)

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

    private fun DiagnosticSession.toEntity() = DiagnosticSessionEntity(
        jobId = jobId,
        category = category.name,
        currentStepId = currentStepId,
        isComplete = isComplete,
        finalFinding = finalFinding,
        resultsJson = json.encodeToString(
            kotlinx.serialization.builtins.ListSerializer(StepResultJson.serializer()),
            results.map { StepResultJson(it.stepId, it.result.name, it.technicianNote, it.recordedAtEpochMillis) },
        ),
        pendingSync = true,
    )

    private fun DiagnosticSessionEntity.toDomain(): DiagnosticSession {
        val decoded = runCatching {
            json.decodeFromString(kotlinx.serialization.builtins.ListSerializer(StepResultJson.serializer()), resultsJson)
        }.getOrDefault(emptyList())
        return DiagnosticSession(
            jobId = jobId,
            category = DiagnosticCategory.valueOf(category),
            results = decoded.map { DiagnosticStepResult(it.stepId, TestResult.valueOf(it.result), it.note, it.at) },
            currentStepId = currentStepId,
            isComplete = isComplete,
            finalFinding = finalFinding,
        )
    }
}
