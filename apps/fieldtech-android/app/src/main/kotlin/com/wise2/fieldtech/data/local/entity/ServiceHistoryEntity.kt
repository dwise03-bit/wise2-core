package com.wise2.fieldtech.data.local.entity

import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.PrimaryKey

@Entity(
    tableName = "service_history",
    foreignKeys = [
        ForeignKey(entity = EquipmentEntity::class, parentColumns = ["id"], childColumns = ["equipmentId"], onDelete = ForeignKey.CASCADE)
    ]
)
data class ServiceHistoryEntity(
    @PrimaryKey val id: String,
    val equipmentId: String,
    val jobId: String,
    val dateEpochMillis: Long,
    val summary: String,
    val technicianName: String,
)
