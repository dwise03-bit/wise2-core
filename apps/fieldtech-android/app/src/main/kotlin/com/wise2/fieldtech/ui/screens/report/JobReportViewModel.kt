package com.wise2.fieldtech.ui.screens.report

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.wise2.fieldtech.data.repository.DiagnosticRepository
import com.wise2.fieldtech.data.repository.JobRepository
import com.wise2.fieldtech.data.repository.ReportRepository
import com.wise2.fieldtech.domain.model.JobReport
import com.wise2.fieldtech.domain.model.ReportStatus
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

class JobReportViewModel(
    private val reportRepository: ReportRepository,
    private val jobRepository: JobRepository,
    private val diagnosticRepository: DiagnosticRepository,
    private val jobId: String,
) : ViewModel() {

    val report: StateFlow<JobReport?> = reportRepository.observe(jobId)
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), null)

    init {
        viewModelScope.launch {
            if (report.value == null) seedFromJobAndDiagnostics()
        }
    }

    private suspend fun seedFromJobAndDiagnostics() {
        val job = jobRepository.observeJob(jobId).first() ?: return
        val diagnostic = diagnosticRepository.observe(jobId).first()
        val seeded = JobReport(
            jobId = jobId,
            jobSummary = job.complaint,
            systemInfo = "",
            customerComplaint = job.complaint,
            diagnosis = diagnostic?.finalFinding ?: "",
            workPerformed = emptyList(),
            materials = emptyList(),
            recommendations = "",
            technicianNotes = job.notes,
            customerApprovalName = null,
            photoLocalPaths = job.photoLocalPaths,
            status = ReportStatus.DRAFT,
            updatedAtEpochMillis = System.currentTimeMillis(),
        )
        reportRepository.saveDraft(seeded)
    }

    fun updateField(update: (JobReport) -> JobReport) {
        val current = report.value ?: return
        viewModelScope.launch { reportRepository.saveDraft(update(current).copy(updatedAtEpochMillis = System.currentTimeMillis())) }
    }

    fun saveDraft() {
        val current = report.value ?: return
        viewModelScope.launch { reportRepository.saveDraft(current.copy(status = ReportStatus.DRAFT)) }
    }

    fun finalizeAndSend() {
        val current = report.value ?: return
        viewModelScope.launch {
            reportRepository.saveDraft(current.copy(status = ReportStatus.FINALIZED))
            reportRepository.finalize(jobId)
        }
    }
}
