package com.wise2.fieldtech.domain.model

enum class JobStatus {
    SCHEDULED, EN_ROUTE, ARRIVED, DIAGNOSING, REPAIRING, WAITING, COMPLETE
}

enum class JobPriority { LOW, NORMAL, HIGH, EMERGENCY }

data class Job(
    val id: String,
    val customerName: String,
    val customerPhone: String,
    val address: String,
    val appointmentAtEpochMillis: Long,
    val technicianId: String,
    val complaint: String,
    val equipmentId: String?,
    val status: JobStatus,
    val priority: JobPriority,
    val notes: String,
    val photoLocalPaths: List<String> = emptyList(),
    val createdAtEpochMillis: Long,
    val updatedAtEpochMillis: Long,
    val isDemoData: Boolean = false,
    val pendingSync: Boolean = false,
)
