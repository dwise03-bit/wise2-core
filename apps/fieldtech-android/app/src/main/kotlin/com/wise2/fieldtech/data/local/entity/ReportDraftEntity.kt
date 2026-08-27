package com.wise2.fieldtech.data.local.entity

import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.PrimaryKey

@Entity(
    tableName = "report_drafts",
    foreignKeys = [
        ForeignKey(entity = JobEntity::class, parentColumns = ["id"], childColumns = ["jobId"], onDelete = ForeignKey.CASCADE)
    ]
)
data class ReportDraftEntity(
    @PrimaryKey val jobId: String,
    val jobSummary: String,
    val systemInfo: String,
    val customerComplaint: String,
    val diagnosis: String,
    val workPerformedJson: String,
    val materialsJson: String,
    val recommendations: String,
    val technicianNotes: String,
    val customerApprovalName: String?,
    val photoLocalPaths: String,
    val status: String,
    val updatedAtEpochMillis: Long,
    val pendingSync: Boolean = false,
)
