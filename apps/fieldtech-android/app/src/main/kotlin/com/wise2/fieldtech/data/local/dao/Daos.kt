package com.wise2.fieldtech.data.local.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import com.wise2.fieldtech.data.local.entity.DiagnosticSessionEntity
import com.wise2.fieldtech.data.local.entity.EquipmentEntity
import com.wise2.fieldtech.data.local.entity.ImpMessageEntity
import com.wise2.fieldtech.data.local.entity.JobEntity
import com.wise2.fieldtech.data.local.entity.PendingSyncEntity
import com.wise2.fieldtech.data.local.entity.ReadingEntity
import com.wise2.fieldtech.data.local.entity.ReportDraftEntity
import com.wise2.fieldtech.data.local.entity.ServiceHistoryEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface JobDao {
    @Query("SELECT * FROM jobs ORDER BY appointmentAtEpochMillis ASC")
    fun observeAll(): Flow<List<JobEntity>>

    @Query("SELECT * FROM jobs WHERE id = :id")
    fun observeById(id: String): Flow<JobEntity?>

    @Query("SELECT * FROM jobs WHERE id = :id")
    suspend fun getById(id: String): JobEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsertAll(jobs: List<JobEntity>)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsert(job: JobEntity)

    @Query("SELECT * FROM jobs WHERE pendingSync = 1")
    suspend fun getPendingSync(): List<JobEntity>
}

@Dao
interface EquipmentDao {
    @Query("SELECT * FROM equipment WHERE id = :id")
    fun observeById(id: String): Flow<EquipmentEntity?>

    @Query("SELECT * FROM equipment")
    fun observeAll(): Flow<List<EquipmentEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsertAll(items: List<EquipmentEntity>)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsert(item: EquipmentEntity)

    @Query("SELECT * FROM service_history WHERE equipmentId = :equipmentId ORDER BY dateEpochMillis DESC")
    fun observeHistory(equipmentId: String): Flow<List<ServiceHistoryEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsertHistory(items: List<ServiceHistoryEntity>)
}

@Dao
interface ReadingDao {
    @Query("SELECT * FROM readings WHERE jobId = :jobId ORDER BY capturedAtEpochMillis DESC")
    fun observeForJob(jobId: String): Flow<List<ReadingEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(reading: ReadingEntity)

    @Query("SELECT * FROM readings WHERE pendingSync = 1")
    suspend fun getPendingSync(): List<ReadingEntity>

    @Update
    suspend fun update(reading: ReadingEntity)
}

@Dao
interface DiagnosticDao {
    @Query("SELECT * FROM diagnostic_sessions WHERE jobId = :jobId")
    fun observe(jobId: String): Flow<DiagnosticSessionEntity?>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsert(session: DiagnosticSessionEntity)
}

@Dao
interface ReportDao {
    @Query("SELECT * FROM report_drafts WHERE jobId = :jobId")
    fun observe(jobId: String): Flow<ReportDraftEntity?>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsert(draft: ReportDraftEntity)

    @Query("SELECT * FROM report_drafts WHERE pendingSync = 1")
    suspend fun getPendingSync(): List<ReportDraftEntity>
}

@Dao
interface ImpMessageDao {
    @Query("SELECT * FROM imp_messages WHERE jobId = :jobId ORDER BY sentAtEpochMillis ASC")
    fun observeForJob(jobId: String): Flow<List<ImpMessageEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(message: ImpMessageEntity)
}

@Dao
interface PendingSyncDao {
    @Insert
    suspend fun enqueue(item: PendingSyncEntity)

    @Query("SELECT * FROM pending_sync ORDER BY createdAtEpochMillis ASC")
    suspend fun getAll(): List<PendingSyncEntity>

    @Query("SELECT COUNT(*) FROM pending_sync")
    fun observeCount(): Flow<Int>

    @Query("DELETE FROM pending_sync WHERE id = :id")
    suspend fun delete(id: Long)

    @Update
    suspend fun update(item: PendingSyncEntity)
}
