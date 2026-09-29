package com.wise2.fieldtech.ui.screens.jobdetail

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.wise2.fieldtech.data.repository.JobRepository
import com.wise2.fieldtech.domain.model.Job
import com.wise2.fieldtech.domain.model.JobStatus
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

class JobDetailViewModel(
    private val jobRepository: JobRepository,
    private val jobId: String,
) : ViewModel() {

    val job: StateFlow<Job?> = jobRepository.observeJob(jobId)
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), null)

    fun advanceStatus() {
        val current = job.value ?: return
        val next = when (current.status) {
            JobStatus.SCHEDULED -> JobStatus.EN_ROUTE
            JobStatus.EN_ROUTE -> JobStatus.ARRIVED
            JobStatus.ARRIVED -> JobStatus.DIAGNOSING
            JobStatus.DIAGNOSING -> JobStatus.REPAIRING
            JobStatus.REPAIRING -> JobStatus.WAITING
            JobStatus.WAITING -> JobStatus.COMPLETE
            JobStatus.COMPLETE -> return
        }
        viewModelScope.launch { jobRepository.updateStatus(jobId, next) }
    }

    fun completeJob() {
        viewModelScope.launch { jobRepository.updateStatus(jobId, JobStatus.COMPLETE) }
    }

    fun addVoiceNote(text: String) {
        if (text.isBlank()) return
        viewModelScope.launch { jobRepository.appendNote(jobId, text) }
    }

    fun attachPhoto(localPath: String) {
        viewModelScope.launch { jobRepository.attachPhoto(jobId, localPath) }
    }
}
