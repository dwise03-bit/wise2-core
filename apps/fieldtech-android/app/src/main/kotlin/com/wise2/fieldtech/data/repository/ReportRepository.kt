package com.wise2.fieldtech.data.repository

import com.wise2.fieldtech.data.local.dao.ReportDao
import com.wise2.fieldtech.data.local.entity.ReportDraftEntity
import com.wise2.fieldtech.data.remote.ApiService
import com.wise2.fieldtech.data.remote.dto.ReportDto
import com.wise2.fieldtech.data.remote.dto.ReportMaterialDto
import com.wise2.fieldtech.domain.model.JobReport
import com.wise2.fieldtech.domain.model.MaterialLine
import com.wise2.fieldtech.domain.model.ReportStatus
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import kotlinx.serialization.builtins.ListSerializer
import kotlinx.serialization.json.Json

class ReportRepository(
    private val api: ApiService,
    private val dao: ReportDao,
) {
    private val json = Json { ignoreUnknownKeys = true }

    fun observe(jobId: String): Flow<JobReport?> = dao.observe(jobId).map { it?.toDomain(json) }

    suspend fun saveDraft(report: JobReport) {
        dao.upsert(report.toEntity(json, pendingSync = true))
        val synced = try { api.saveReport(report.jobId, report.toDto()).isSuccessful } catch (t: Throwable) { false }
        if (synced) dao.upsert(report.toEntity(json, pendingSync = false))
    }

    suspend fun finalize(jobId: String): Boolean = try {
        api.finalizeReport(jobId).isSuccessful
    } catch (t: Throwable) {
        false
    }
}

private fun JobReport.toEntity(json: Json, pendingSync: Boolean) = ReportDraftEntity(
    jobId = jobId,
    jobSummary = jobSummary,
    systemInfo = systemInfo,
    customerComplaint = customerComplaint,
    diagnosis = diagnosis,
    workPerformedJson = json.encodeToString(ListSerializer(kotlinx.serialization.serializer<String>()), workPerformed),
    materialsJson = json.encodeToString(
        ListSerializer(MaterialLineJson.serializer()),
        materials.map { MaterialLineJson(it.description, it.quantity, it.unit) },
    ),
    recommendations = recommendations,
    technicianNotes = technicianNotes,
    customerApprovalName = customerApprovalName,
    photoLocalPaths = photoLocalPaths.joinToString(","),
    status = status.name,
    updatedAtEpochMillis = updatedAtEpochMillis,
    pendingSync = pendingSync,
)

private fun ReportDraftEntity.toDomain(json: Json): JobReport {
    val work = runCatching {
        json.decodeFromString(ListSerializer(kotlinx.serialization.serializer<String>()), workPerformedJson)
    }.getOrDefault(emptyList())
    val materials = runCatching {
        json.decodeFromString(ListSerializer(MaterialLineJson.serializer()), materialsJson)
    }.getOrDefault(emptyList())
    return JobReport(
        jobId = jobId,
        jobSummary = jobSummary,
        systemInfo = systemInfo,
        customerComplaint = customerComplaint,
        diagnosis = diagnosis,
        workPerformed = work,
        materials = materials.map { MaterialLine(it.description, it.quantity, it.unit) },
        recommendations = recommendations,
        technicianNotes = technicianNotes,
        customerApprovalName = customerApprovalName,
        photoLocalPaths = photoLocalPaths.split(",").filter { it.isNotBlank() },
        status = runCatching { ReportStatus.valueOf(status) }.getOrDefault(ReportStatus.DRAFT),
        updatedAtEpochMillis = updatedAtEpochMillis,
    )
}

private fun JobReport.toDto() = ReportDto(
    jobId = jobId, jobSummary = jobSummary, systemInfo = systemInfo, customerComplaint = customerComplaint,
    diagnosis = diagnosis, workPerformed = workPerformed,
    materials = materials.map { ReportMaterialDto(it.description, it.quantity, it.unit) },
    recommendations = recommendations, technicianNotes = technicianNotes,
    customerApprovalName = customerApprovalName, status = status.name, updatedAtEpochMillis = updatedAtEpochMillis,
)

@kotlinx.serialization.Serializable
private data class MaterialLineJson(val description: String, val quantity: Double, val unit: String)
