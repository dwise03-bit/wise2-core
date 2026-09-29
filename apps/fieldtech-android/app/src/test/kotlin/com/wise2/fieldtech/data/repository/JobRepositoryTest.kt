package com.wise2.fieldtech.data.repository

import com.google.common.truth.Truth.assertThat
import com.wise2.fieldtech.data.local.dao.JobDao
import com.wise2.fieldtech.data.local.dao.PendingSyncDao
import com.wise2.fieldtech.data.local.entity.JobEntity
import com.wise2.fieldtech.data.local.entity.PendingSyncEntity
import com.wise2.fieldtech.data.remote.ApiService
import com.wise2.fieldtech.data.remote.dto.UpdateJobRequest
import com.wise2.fieldtech.domain.model.JobStatus
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.test.runTest
import org.junit.Test
import retrofit2.Response

/** Fake exercising only the methods JobRepository actually calls; everything else throws so an
 *  accidental new dependency fails loudly instead of silently no-op'ing. */
private class FakeJobDao(seed: JobEntity) : JobDao {
    private val state = MutableStateFlow(seed)
    override fun observeAll(): Flow<List<JobEntity>> = throw NotImplementedError()
    override fun observeById(id: String): Flow<JobEntity?> = throw NotImplementedError()
    override suspend fun getById(id: String): JobEntity? = state.value.takeIf { it.id == id }
    override suspend fun upsertAll(jobs: List<JobEntity>) = throw NotImplementedError()
    override suspend fun upsert(job: JobEntity) { state.value = job }
    override suspend fun getPendingSync(): List<JobEntity> = listOf(state.value).filter { it.pendingSync }
    fun current() = state.value
}

private class FakePendingSyncDao : PendingSyncDao {
    val enqueued = mutableListOf<PendingSyncEntity>()
    override suspend fun enqueue(item: PendingSyncEntity) { enqueued.add(item) }
    override suspend fun getAll(): List<PendingSyncEntity> = enqueued
    override fun observeCount() = throw NotImplementedError()
    override suspend fun delete(id: Long) { enqueued.removeAll { it.id == id } }
    override suspend fun update(item: PendingSyncEntity) {}
}

private fun jobEntity(status: String = "SCHEDULED") = JobEntity(
    id = "job-1", customerName = "Test Customer", customerPhone = "555-0100", address = "1 Test St",
    appointmentAtEpochMillis = 1000L, technicianId = "tech-1", complaint = "No cooling",
    equipmentId = null, status = status, priority = "NORMAL", notes = "", photoLocalPaths = "",
    createdAtEpochMillis = 1000L, updatedAtEpochMillis = 1000L, isDemoData = false, pendingSync = false,
)

class JobRepositoryTest {

    @Test
    fun `updateStatus writes to Room immediately and clears pendingSync when the network call succeeds`() = runTest {
        val jobDao = FakeJobDao(jobEntity())
        val pendingSyncDao = FakePendingSyncDao()
        val api = object : NoopApiService() {
            override suspend fun updateJob(id: String, body: UpdateJobRequest) =
                Response.success(com.wise2.fieldtech.data.remote.dto.JobDto(
                    id = id, customerName = "Test Customer", customerPhone = "555-0100", address = "1 Test St",
                    appointmentAtEpochMillis = 1000L, technicianId = "tech-1", complaint = "No cooling",
                    equipmentId = null, status = body.status ?: "SCHEDULED", priority = "NORMAL", notes = "",
                    createdAtEpochMillis = 1000L, updatedAtEpochMillis = 2000L,
                ))
        }
        val repo = JobRepository(api, jobDao, pendingSyncDao)

        repo.updateStatus("job-1", JobStatus.EN_ROUTE)

        assertThat(jobDao.current().status).isEqualTo("EN_ROUTE")
        assertThat(jobDao.current().pendingSync).isFalse()
        assertThat(pendingSyncDao.enqueued).isEmpty()
    }

    @Test
    fun `updateStatus queues the change for later sync when the network call fails`() = runTest {
        val jobDao = FakeJobDao(jobEntity())
        val pendingSyncDao = FakePendingSyncDao()
        val api = object : NoopApiService() {
            override suspend fun updateJob(id: String, body: UpdateJobRequest): Response<com.wise2.fieldtech.data.remote.dto.JobDto> {
                throw java.io.IOException("offline")
            }
        }
        val repo = JobRepository(api, jobDao, pendingSyncDao)

        repo.updateStatus("job-1", JobStatus.EN_ROUTE)

        // The technician's change is never lost: it's visible locally right away...
        assertThat(jobDao.current().status).isEqualTo("EN_ROUTE")
        assertThat(jobDao.current().pendingSync).isTrue()
        // ...and queued for SyncWorker to replay later.
        assertThat(pendingSyncDao.enqueued).hasSize(1)
        assertThat(pendingSyncDao.enqueued.first().entityType).isEqualTo("job")
        assertThat(pendingSyncDao.enqueued.first().operation).isEqualTo("UPDATE")
    }
}

/** Base fake that fails any call the test doesn't explicitly override, so tests stay honest
 *  about exactly which network calls they expect. */
private abstract class NoopApiService : ApiService {
    override suspend fun login(body: com.wise2.fieldtech.data.remote.dto.LoginRequest) = throw NotImplementedError()
    override suspend fun loginWithGoogle(body: Map<String, String>) = throw NotImplementedError()
    override suspend fun refresh(body: com.wise2.fieldtech.data.remote.dto.RefreshRequest) = throw NotImplementedError()
    override suspend fun logout() = throw NotImplementedError()
    override suspend fun impChat(body: com.wise2.fieldtech.data.remote.dto.HermesChatRequest) = throw NotImplementedError()
    override suspend fun getJobs() = throw NotImplementedError()
    override suspend fun getTodaysJobs() = throw NotImplementedError()
    override suspend fun getJob(id: String) = throw NotImplementedError()
    override suspend fun createJob(body: com.wise2.fieldtech.data.remote.dto.CreateJobRequest) = throw NotImplementedError()
    override suspend fun updateJob(id: String, body: UpdateJobRequest): Response<com.wise2.fieldtech.data.remote.dto.JobDto> = throw NotImplementedError()
    override suspend fun getEquipment(id: String) = throw NotImplementedError()
    override suspend fun getServiceHistory(id: String) = throw NotImplementedError()
    override suspend fun createEquipment(body: com.wise2.fieldtech.data.remote.dto.EquipmentDto) = throw NotImplementedError()
    override suspend fun getReadings(jobId: String) = throw NotImplementedError()
    override suspend fun submitReading(body: com.wise2.fieldtech.data.remote.dto.ReadingDto) = throw NotImplementedError()
    override suspend fun getReport(jobId: String) = throw NotImplementedError()
    override suspend fun saveReport(jobId: String, body: com.wise2.fieldtech.data.remote.dto.ReportDto) = throw NotImplementedError()
    override suspend fun finalizeReport(jobId: String) = throw NotImplementedError()
    override suspend fun getLatestRelease() = throw NotImplementedError()
}
