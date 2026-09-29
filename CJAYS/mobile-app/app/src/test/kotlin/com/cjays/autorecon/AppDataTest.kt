package com.cjays.autorecon

import com.google.common.truth.Truth.assertThat
import kotlinx.serialization.json.Json
import org.junit.Test

class AppDataTest {
    @Test fun newJobStartsWithIncompleteFieldWorkflow() {
        val job = Job(vehicleId = "vehicle-1", service = "Full Detail")
        assertThat(job.checklist).hasSize(6)
        assertThat(job.checklist.all { it }).isFalse()
        assertThat(job.beforePhotos).isEmpty()
        assertThat(job.afterPhotos).isEmpty()
        assertThat(job.status).isEqualTo("In Progress")
    }

    @Test fun existingVersionOneDataMigratesThroughDefaults() {
        val old = """{"customers":[],"vehicles":[],"jobs":[{"id":"1","vehicleId":"v1","service":"Wash","status":"In Progress","price":"50","checklist":[false,false,false,false,false,false]}]}"""
        val decoded = Json { ignoreUnknownKeys = true }.decodeFromString<AppData>(old)
        assertThat(decoded.jobs.single().notes).isEmpty()
        assertThat(decoded.jobs.single().beforePhotos).isEmpty()
        assertThat(decoded.jobs.single().paidAmount).isEmpty()
    }
}
