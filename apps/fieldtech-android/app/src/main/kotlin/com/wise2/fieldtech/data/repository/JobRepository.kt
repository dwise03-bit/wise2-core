package com.wise2.fieldtech.data.repository

import com.wise2.fieldtech.data.DemoData
import com.wise2.fieldtech.data.local.dao.JobDao
import com.wise2.fieldtech.data.local.dao.PendingSyncDao
import com.wise2.fieldtech.data.local.entity.JobEntity
import com.wise2.fieldtech.data.local.entity.PendingSyncEntity
import com.wise2.fieldtech.data.remote.ApiService
import com.wise2.fieldtech.data.remote.dto.CreateJobRequest
import com.wise2.fieldtech.data.remote.dto.JobDto
import com.wise2.fieldtech.data.remote.dto.UpdateJobRequest
import com.wise2.fieldtech.domain.WiseResult
import com.wise2.fieldtech.domain.model.Job
import com.wise2.fieldtech.domain.model.JobPriority
import com.wise2.fieldtech.domain.model.JobStatus
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map
import kotlinx.serialization.json.Json

class JobRepository(
    private val api: ApiService,
    private val jobDao: JobDao,
    private val pendingSyncDao: PendingSyncDao,
) {
    fun observeJobs(): Flow<List<Job>> = jobDao.observeAll().map { list -> list.map { it.toDomain() } }

    fun observeJob(id: String): Flow<Job?> = jobDao.observeById(id).map { it?.toDomain() }

    suspend fun ensureDemoSeed(nowMillis: Long) {
        if (jobDao.observeAll().first().isEmpty()) {
            jobDao.upsertAll(DemoData.jobs(nowMillis).map { it.toEntity() })
        }
    }

    /** Refreshes from the server; on failure, callers keep whatever Room already has and the
     *  UI shows OFFLINE — CHANGES SAVED LOCALLY (spec §17). */
    suspend fun refreshJobs(): WiseResult<Unit> = try {
        val response = api.getJobs()
        val body = response.body()
        if (response.isSuccessful && body != null) {
            jobDao.upsertAll(body.map { it.toEntity() })
            WiseResult.Success(Unit)
        } else {
            WiseResult.OfflineCached(Unit)
        }
    } catch (t: Throwable) {
        WiseResult.OfflineCached(Unit)
    }

    /** Always writes locally first (offline-safe), then tries the network; queues on failure. */
    suspend fun updateStatus(jobId: String, status: JobStatus) {
        val existing = jobDao.getById(jobId) ?: return
        jobDao.upsert(existing.copy(status = status.name, updatedAtEpochMillis = System.currentTimeMillis(), pendingSync = true))

        val request = UpdateJobRequest(status = status.name)
        val synced = try {
            val response = api.updateJob(jobId, request)
            response.isSuccessful
        } catch (t: Throwable) {
            false
        }

        if (synced) {
            jobDao.getById(jobId)?.let { jobDao.upsert(it.copy(pendingSync = false)) }
        } else {
            pendingSyncDao.enqueue(
                PendingSyncEntity(
                    entityType = "job",
                    entityId = jobId,
                    operation = "UPDATE",
                    payloadJson = Json.encodeToString(UpdateJobRequest.serializer(), request),
                    createdAtEpochMillis = System.currentTimeMillis(),
                )
            )
        }
    }

    suspend fun appendNote(jobId: String, note: String) {
        val existing = jobDao.getById(jobId) ?: return
        val combined = if (existing.notes.isBlank()) note else existing.notes + "\n" + note
        jobDao.upsert(existing.copy(notes = combined, updatedAtEpochMillis = System.currentTimeMillis(), pendingSync = true))
        val request = UpdateJobRequest(notes = combined)
        val synced = try { api.updateJob(jobId, request).isSuccessful } catch (t: Throwable) { false }
        if (!synced) {
            pendingSyncDao.enqueue(
                PendingSyncEntity(
                    entityType = "job",
                    entityId = jobId,
                    operation = "UPDATE",
                    payloadJson = Json.encodeToString(UpdateJobRequest.serializer(), request),
                    createdAtEpochMillis = System.currentTimeMillis(),
                )
            )
        }
    }

    /** Creates a job locally first (so it's usable immediately/offline), then tries to sync
     *  it to the server; queues on failure just like every other mutation (spec §17). */
    suspend fun createJob(
        customerName: String,
        customerPhone: String,
        address: String,
        appointmentAtEpochMillis: Long,
        complaint: String,
    ): Job {
        val now = System.currentTimeMillis()
        val localId = "local-${java.util.UUID.randomUUID()}"
        val job = Job(
            id = localId,
            customerName = customerName,
            customerPhone = customerPhone,
            address = address,
            appointmentAtEpochMillis = appointmentAtEpochMillis,
            technicianId = "me",
            complaint = complaint,
            equipmentId = null,
            status = JobStatus.SCHEDULED,
            priority = JobPriority.NORMAL,
            notes = "",
            createdAtEpochMillis = now,
            updatedAtEpochMillis = now,
            isDemoData = false,
            pendingSync = true,
        )
        jobDao.upsert(job.toEntity())

        val request = CreateJobRequest(customerName, customerPhone, address, appointmentAtEpochMillis, complaint)
        val remote = try {
            val response = api.createJob(request)
            response.body().takeIf { response.isSuccessful }
        } catch (t: Throwable) {
            null
        }

        return if (remote != null) {
            // Replace the local-id placeholder with the server-assigned record.
            jobDao.upsert(remote.toEntity())
            remote.toEntity().toDomain()
        } else {
            pendingSyncDao.enqueue(
                PendingSyncEntity(
                    entityType = "job",
                    entityId = localId,
                    operation = "CREATE",
                    payloadJson = Json.encodeToString(CreateJobRequest.serializer(), request),
                    createdAtEpochMillis = now,
                )
            )
            job
        }
    }

    suspend fun attachPhoto(jobId: String, localPath: String) {
        val existing = jobDao.getById(jobId) ?: return
        val paths = (existing.photoLocalPaths.split(",").filter { it.isNotBlank() } + localPath)
        jobDao.upsert(existing.copy(photoLocalPaths = paths.joinToString(","), updatedAtEpochMillis = System.currentTimeMillis(), pendingSync = true))
    }
}

fun JobEntity.toDomain() = Job(
    id = id,
    customerName = customerName,
    customerPhone = customerPhone,
    address = address,
    appointmentAtEpochMillis = appointmentAtEpochMillis,
    technicianId = technicianId,
    complaint = complaint,
    equipmentId = equipmentId,
    status = runCatching { JobStatus.valueOf(status) }.getOrDefault(JobStatus.SCHEDULED),
    priority = runCatching { JobPriority.valueOf(priority) }.getOrDefault(JobPriority.NORMAL),
    notes = notes,
    photoLocalPaths = photoLocalPaths.split(",").filter { it.isNotBlank() },
    createdAtEpochMillis = createdAtEpochMillis,
    updatedAtEpochMillis = updatedAtEpochMillis,
    isDemoData = isDemoData,
    pendingSync = pendingSync,
)

fun Job.toEntity() = JobEntity(
    id = id,
    customerName = customerName,
    customerPhone = customerPhone,
    address = address,
    appointmentAtEpochMillis = appointmentAtEpochMillis,
    technicianId = technicianId,
    complaint = complaint,
    equipmentId = equipmentId,
    status = status.name,
    priority = priority.name,
    notes = notes,
    photoLocalPaths = photoLocalPaths.joinToString(","),
    createdAtEpochMillis = createdAtEpochMillis,
    updatedAtEpochMillis = updatedAtEpochMillis,
    isDemoData = isDemoData,
    pendingSync = pendingSync,
)

fun JobDto.toEntity() = JobEntity(
    id = id,
    customerName = customerName,
    customerPhone = customerPhone,
    address = address,
    appointmentAtEpochMillis = appointmentAtEpochMillis,
    technicianId = technicianId,
    complaint = complaint,
    equipmentId = equipmentId,
    status = status,
    priority = priority,
    notes = notes,
    photoLocalPaths = "",
    createdAtEpochMillis = createdAtEpochMillis,
    updatedAtEpochMillis = updatedAtEpochMillis,
    isDemoData = false,
    pendingSync = false,
)
