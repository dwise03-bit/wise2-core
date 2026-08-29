package com.wise2.fieldtech.ui.screens.imp

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.wise2.fieldtech.data.repository.DiagnosticRepository
import com.wise2.fieldtech.data.repository.EquipmentRepository
import com.wise2.fieldtech.data.repository.ImpRepository
import com.wise2.fieldtech.data.repository.JobRepository
import com.wise2.fieldtech.data.repository.ReadingRepository
import com.wise2.fieldtech.domain.diagnose.FieldpieceEvidence
import com.wise2.fieldtech.domain.diagnose.FieldpieceEvidenceMapper
import com.wise2.fieldtech.domain.model.ImpMessage
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

class ImpChatViewModel(
    private val impRepository: ImpRepository,
    private val jobRepository: JobRepository,
    private val equipmentRepository: EquipmentRepository,
    private val readingRepository: ReadingRepository,
    private val diagnosticRepository: DiagnosticRepository,
    private val jobId: String,
) : ViewModel() {

    val messages: StateFlow<List<ImpMessage>> = impRepository.observeForJob(jobId)
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    private val _isSending = MutableStateFlow(false)
    val isSending: StateFlow<Boolean> = _isSending.asStateFlow()

    val fieldpieceEvidence: StateFlow<FieldpieceEvidence?> = readingRepository.observeForJob(jobId)
        .map { FieldpieceEvidenceMapper.fromReading(it.firstOrNull(), System.currentTimeMillis()) }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), null)

    fun ask(question: String) {
        if (question.isBlank()) return
        viewModelScope.launch {
            _isSending.value = true
            val context = buildContextBlock()
            impRepository.ask(jobId, context, question)
            _isSending.value = false
        }
    }

    /** Structured job context per spec §13: customer, equipment, complaint, live readings,
     *  technician test results, service history, current diagnostic step. */
    private suspend fun buildContextBlock(): String {
        val job = jobRepository.observeJob(jobId).first()
        val equipment = job?.equipmentId?.let { equipmentRepository.observe(it).first() }
        val latestReading = readingRepository.observeForJob(jobId).first().firstOrNull()
        val diagnosticSession = diagnosticRepository.observe(jobId).first()

        return buildString {
            appendLine("JOB CONTEXT (structured, supplied by the app — not verified external records):")
            appendLine("CUSTOMER: ${job?.customerName ?: "unknown"}")
            appendLine("COMPLAINT: ${job?.complaint ?: "unknown"}")
            equipment?.let { appendLine("EQUIPMENT: ${it.manufacturer} ${it.model}, ${it.refrigerant}, ${it.tonnage ?: "?"} ton") }
            appendLine(FieldpieceEvidenceMapper.contextLines(latestReading, System.currentTimeMillis()))
            diagnosticSession?.let {
                appendLine("DIAGNOSTIC CATEGORY: ${it.category}")
                appendLine("CURRENT STEP: ${it.currentStepId}, complete=${it.isComplete}")
                if (it.isComplete) appendLine("FINDING: ${it.finalFinding}")
            }
            appendLine("Distinguish observed facts from hypotheses. State a confidence level. Do not claim a fault is confirmed without supporting evidence (spec §12/§13).")
        }
    }
}
