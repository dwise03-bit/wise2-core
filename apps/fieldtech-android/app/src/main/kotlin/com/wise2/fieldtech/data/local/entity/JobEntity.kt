package com.wise2.fieldtech.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "jobs")
data class JobEntity(
    @PrimaryKey val id: String,
    val customerName: String,
    val customerPhone: String,
    val address: String,
    val appointmentAtEpochMillis: Long,
    val technicianId: String,
    val complaint: String,
    val equipmentId: String?,
    val status: String,
    val priority: String,
    val notes: String,
    val photoLocalPaths: String = "",
    val createdAtEpochMillis: Long,
    val updatedAtEpochMillis: Long,
    val isDemoData: Boolean = false,
    val pendingSync: Boolean = false,
)
