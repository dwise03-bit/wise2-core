package com.wise2.fieldtech.data.remote.dto

import kotlinx.serialization.Serializable

@Serializable
data class JobDto(
    val id: String,
    val customerName: String,
    val customerPhone: String,
    val address: String,
    val appointmentAtEpochMillis: Long,
    val technicianId: String,
    val complaint: String,
    val equipmentId: String? = null,
    val status: String,
    val priority: String,
    val notes: String = "",
    val createdAtEpochMillis: Long,
    val updatedAtEpochMillis: Long,
)

@Serializable
data class CreateJobRequest(
    val customerName: String,
    val customerPhone: String,
    val address: String,
    val appointmentAtEpochMillis: Long,
    val complaint: String,
    val equipmentId: String? = null,
    val priority: String = "NORMAL",
)

@Serializable
data class UpdateJobRequest(
    val status: String? = null,
    val notes: String? = null,
    val equipmentId: String? = null,
)

@Serializable
data class EquipmentDto(
    val id: String,
    val customerName: String,
    val manufacturer: String,
    val equipmentType: String,
    val model: String,
    val serial: String,
    val refrigerant: String,
    val voltage: String,
    val phase: String,
    val tonnage: Double? = null,
    val installationDateEpochMillis: Long? = null,
    val location: String,
    val filterSize: String? = null,
    val technicianNotes: String = "",
)

@Serializable
data class ServiceHistoryDto(
    val id: String,
    val equipmentId: String,
    val jobId: String,
    val dateEpochMillis: Long,
    val summary: String,
    val technicianName: String,
)

@Serializable
data class ReadingDto(
    val id: String,
    val jobId: String,
    val sourceDeviceName: String,
    val capturedAtEpochMillis: Long,
    val lowSidePsig: Double? = null,
    val highSidePsig: Double? = null,
    val suctionSaturationF: Double? = null,
    val liquidSaturationF: Double? = null,
    val suctionLineTempF: Double? = null,
    val liquidLineTempF: Double? = null,
    val dischargeTempF: Double? = null,
    val outdoorAmbientF: Double? = null,
    val voltageL1: Double? = null,
    val voltageL2: Double? = null,
    val voltageL3: Double? = null,
    val currentL1: Double? = null,
    val currentL2: Double? = null,
    val currentL3: Double? = null,
    val frequencyHz: Double? = null,
    val capacitanceMfd: Double? = null,
    val resistanceOhms: Double? = null,
    val continuityOk: Boolean? = null,
    val returnTempF: Double? = null,
    val supplyTempF: Double? = null,
    val staticPressureInWc: Double? = null,
)

@Serializable
data class ReportMaterialDto(
    val description: String,
    val quantity: Double,
    val unit: String,
)

@Serializable
data class ReportDto(
    val jobId: String,
    val jobSummary: String,
    val systemInfo: String,
    val customerComplaint: String,
    val diagnosis: String,
    val workPerformed: List<String>,
    val materials: List<ReportMaterialDto>,
    val recommendations: String,
    val technicianNotes: String,
    val customerApprovalName: String? = null,
    val status: String,
    val updatedAtEpochMillis: Long,
)

@Serializable
data class AppUpdateInfoDto(
    val versionCode: Int,
    val versionName: String,
    val apkUrl: String,
    val sha256: String,
    val required: Boolean,
    val releaseNotes: String,
)
