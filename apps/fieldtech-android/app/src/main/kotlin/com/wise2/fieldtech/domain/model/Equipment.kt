package com.wise2.fieldtech.domain.model

data class Equipment(
    val id: String,
    val customerName: String,
    val manufacturer: String,
    val equipmentType: String,
    val model: String,
    val serial: String,
    val refrigerant: String,
    val voltage: String,
    val phase: String,
    val tonnage: Double?,
    val installationDateEpochMillis: Long?,
    val location: String,
    val filterSize: String?,
    val technicianNotes: String,
    val isDemoData: Boolean = false,
)

data class ServiceHistoryEntry(
    val id: String,
    val equipmentId: String,
    val jobId: String,
    val dateEpochMillis: Long,
    val summary: String,
    val technicianName: String,
)
