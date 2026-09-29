package com.wise2.fieldtech.data.local.entity

import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.PrimaryKey

@Entity(
    tableName = "diagnostic_sessions",
    foreignKeys = [
        ForeignKey(entity = JobEntity::class, parentColumns = ["id"], childColumns = ["jobId"], onDelete = ForeignKey.CASCADE)
    ]
)
data class DiagnosticSessionEntity(
    @PrimaryKey val jobId: String,
    val category: String,
    val currentStepId: String,
    val isComplete: Boolean,
    val finalFinding: String?,
    val resultsJson: String,
    val pendingSync: Boolean = false,
)
