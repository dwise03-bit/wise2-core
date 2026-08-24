package com.wise2.fieldtech.data.local.entity

import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.PrimaryKey

@Entity(
    tableName = "readings",
    foreignKeys = [
        ForeignKey(entity = JobEntity::class, parentColumns = ["id"], childColumns = ["jobId"], onDelete = ForeignKey.CASCADE)
    ]
)
data class ReadingEntity(
    @PrimaryKey val id: String,
    val jobId: String,
    val sourceDeviceName: String,
    val capturedAtEpochMillis: Long,
    val isDemoData: Boolean,
    val lowSidePsig: Double?,
    val highSidePsig: Double?,
    val suctionSaturationF: Double?,
    val liquidSaturationF: Double?,
    val suctionLineTempF: Double?,
    val liquidLineTempF: Double?,
    val dischargeTempF: Double?,
    val outdoorAmbientF: Double?,
    val voltageL1: Double?,
    val voltageL2: Double?,
    val voltageL3: Double?,
    val currentL1: Double?,
    val currentL2: Double?,
    val currentL3: Double?,
    val frequencyHz: Double?,
    val capacitanceMfd: Double?,
    val resistanceOhms: Double?,
    val continuityOk: Boolean?,
    val returnTempF: Double?,
    val supplyTempF: Double?,
    val staticPressureInWc: Double?,
    val pendingSync: Boolean = false,
)
