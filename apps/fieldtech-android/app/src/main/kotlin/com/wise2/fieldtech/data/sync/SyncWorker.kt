package com.wise2.fieldtech.data.sync

import android.content.Context
import androidx.work.Constraints
import androidx.work.CoroutineWorker
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.NetworkType
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import androidx.work.WorkerParameters
import com.wise2.fieldtech.data.local.AppDatabase
import com.wise2.fieldtech.data.remote.dto.CreateJobRequest
import com.wise2.fieldtech.data.remote.dto.UpdateJobRequest
import com.wise2.fieldtech.data.repository.toEntity
import com.wise2.fieldtech.di.AppContainer
import kotlinx.serialization.json.Json
import java.util.concurrent.TimeUnit

/**
 * Drains the offline write queue (spec §17): Local Queue → Sync Worker → WISE² API →
 * acknowledgment → local synced state. Never discards technician work — a failed attempt
 * stays queued and is retried on the next run.
 */
class SyncWorker(context: Context, params: WorkerParameters) : CoroutineWorker(context, params) {

    override suspend fun doWork(): Result {
        val container = AppContainer.get(applicationContext)
        val db = AppDatabase.get(applicationContext)
        val pendingSyncDao = db.pendingSyncDao()
        val jobDao = db.jobDao()
        val json = Json { ignoreUnknownKeys = true }

        val pending = pendingSyncDao.getAll()
        var anyFailure = false

        for (item in pending) {
            val succeeded = try {
                when {
                    item.entityType == "job" && item.operation == "UPDATE" -> {
                        val request = json.decodeFromString(UpdateJobRequest.serializer(), item.payloadJson)
                        container.apiService.updateJob(item.entityId, request).isSuccessful
                    }
                    item.entityType == "job" && item.operation == "CREATE" -> {
                        val request = json.decodeFromString(CreateJobRequest.serializer(), item.payloadJson)
                        val response = container.apiService.createJob(request)
                        val created = response.body()
                        if (response.isSuccessful && created != null) {
                            // Known limitation (see docs/OFFLINE_SYNC.md): readings/diagnostics/
                            // report drafts already saved against the offline-generated local-*
                            // id are NOT remapped to the server id here — only the job record
                            // itself is replaced.
                            jobDao.upsert(created.toEntity())
                            true
                        } else {
                            false
                        }
                    }
                    else -> true // Unknown queue entries are dropped rather than retried forever.
                }
            } catch (t: Throwable) {
                false
            }

            if (succeeded) {
                pendingSyncDao.delete(item.id)
                if (item.operation == "UPDATE") {
                    jobDao.getById(item.entityId)?.let { jobDao.upsert(it.copy(pendingSync = false)) }
                }
            } else {
                anyFailure = true
                pendingSyncDao.update(item.copy(attemptCount = item.attemptCount + 1, lastErrorMessage = "Sync failed, will retry"))
            }
        }

        return if (anyFailure) Result.retry() else Result.success()
    }

    companion object {
        private const val UNIQUE_WORK_NAME = "wise2_sync_worker"

        fun schedulePeriodic(context: Context) {
            val constraints = Constraints.Builder()
                .setRequiredNetworkType(NetworkType.CONNECTED)
                .build()
            val request = PeriodicWorkRequestBuilder<SyncWorker>(15, TimeUnit.MINUTES)
                .setConstraints(constraints)
                .build()
            WorkManager.getInstance(context)
                .enqueueUniquePeriodicWork(UNIQUE_WORK_NAME, ExistingPeriodicWorkPolicy.KEEP, request)
        }

        fun runNow(context: Context) {
            val constraints = Constraints.Builder()
                .setRequiredNetworkType(NetworkType.CONNECTED)
                .build()
            val request = androidx.work.OneTimeWorkRequestBuilder<SyncWorker>()
                .setConstraints(constraints)
                .build()
            WorkManager.getInstance(context).enqueue(request)
        }
    }
}
