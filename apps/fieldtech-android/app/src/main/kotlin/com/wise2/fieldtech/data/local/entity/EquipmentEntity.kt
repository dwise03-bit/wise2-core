package com.wise2.fieldtech.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "equipment")
data class EquipmentEntity(
    @PrimaryKey val id: String,
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
