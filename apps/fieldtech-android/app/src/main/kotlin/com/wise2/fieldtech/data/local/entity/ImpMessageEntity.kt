package com.wise2.fieldtech.data.local.entity

import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.PrimaryKey
import androidx.room.Index

@Entity(
    tableName = "imp_messages",
    indices = [Index(value = ["jobId"])],
    foreignKeys = [
        ForeignKey(entity = JobEntity::class, parentColumns = ["id"], childColumns = ["jobId"], onDelete = ForeignKey.CASCADE)
    ]
)
data class ImpMessageEntity(
    @PrimaryKey val id: String,
    val jobId: String,
    val isFromUser: Boolean,
    val text: String,
    val sentAtEpochMillis: Long,
    val confidence: String? = null,
)
