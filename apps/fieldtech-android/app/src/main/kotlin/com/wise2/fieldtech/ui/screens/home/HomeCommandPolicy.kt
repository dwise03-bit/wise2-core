package com.wise2.fieldtech.ui.screens.home

import com.wise2.fieldtech.domain.model.Job
import com.wise2.fieldtech.domain.model.JobStatus
import java.net.URLEncoder
import java.nio.charset.StandardCharsets

/** Pure action policy for the command home so button availability can be unit-tested. */
object HomeCommandPolicy {
    fun activeJob(jobs: List<Job>): Job? = jobs
        .asSequence()
        .filter { it.status != JobStatus.COMPLETE }
        .minByOrNull { it.appointmentAtEpochMillis }

    fun canCall(job: Job): Boolean = job.customerPhone.isNotBlank()

    fun canNavigate(job: Job): Boolean = job.address.isNotBlank()

    fun canOpenEquipment(job: Job?): Boolean = !job?.equipmentId.isNullOrBlank()

    fun dialUri(phone: String): String? {
        if (phone.isBlank()) return null
        val normalized = phone.filter { it.isDigit() || it == '+' }
        return normalized.takeIf { it.isNotBlank() }?.let { "tel:$it" }
    }

    fun navigationUri(address: String): String? {
        if (address.isBlank()) return null
        val encoded = URLEncoder.encode(address.trim(), StandardCharsets.UTF_8.toString()).replace("+", "%20")
        return "geo:0,0?q=$encoded"
    }
}
