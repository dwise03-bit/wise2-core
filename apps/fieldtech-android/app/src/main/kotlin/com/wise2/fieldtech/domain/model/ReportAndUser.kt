package com.wise2.fieldtech.domain.model

import kotlinx.serialization.Serializable

@Serializable
data class User(
    val id: String,
    val name: String,
    val email: String,
    val role: String,
)

enum class ReportStatus { DRAFT, FINALIZED, SENT }

data class MaterialLine(
    val description: String,
    val quantity: Double,
    val unit: String,
)

data class JobReport(
    val jobId: String,
    val jobSummary: String,
    val systemInfo: String,
    val customerComplaint: String,
    val diagnosis: String,
    val workPerformed: List<String>,
    val materials: List<MaterialLine>,
    val recommendations: String,
    val technicianNotes: String,
    val customerApprovalName: String?,
    val photoLocalPaths: List<String>,
    val status: ReportStatus,
    val updatedAtEpochMillis: Long,
)

data class ImpMessage(
    val id: String,
    val jobId: String,
    val isFromUser: Boolean,
    val text: String,
    val sentAtEpochMillis: Long,
    val confidence: String? = null,
)

data class AppUpdateInfo(
    val versionCode: Int,
    val versionName: String,
    val apkUrl: String,
    val sha256: String,
    val required: Boolean,
    val releaseNotes: String,
)
