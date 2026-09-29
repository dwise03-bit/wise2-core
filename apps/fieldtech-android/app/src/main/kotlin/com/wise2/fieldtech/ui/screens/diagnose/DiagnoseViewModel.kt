package com.wise2.fieldtech.ui.screens.diagnose

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.wise2.fieldtech.data.repository.DiagnosticRepository
import com.wise2.fieldtech.domain.diagnose.DiagnosticTrees
import com.wise2.fieldtech.domain.model.DiagnosticCategory
import com.wise2.fieldtech.domain.model.DiagnosticSession
import com.wise2.fieldtech.domain.model.DiagnosticStep
import com.wise2.fieldtech.domain.model.TestResult
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

class DiagnoseViewModel(
    private val diagnosticRepository: DiagnosticRepository,
    private val jobId: String,
) : ViewModel() {

    val session: StateFlow<DiagnosticSession?> = diagnosticRepository.observe(jobId)
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), null)

    val categories = DiagnosticCategory.values().toList()

    fun currentStep(session: DiagnosticSession): DiagnosticStep =
        DiagnosticTrees.all.getValue(session.category).step(session.currentStepId)

    fun startCategory(category: DiagnosticCategory) {
        viewModelScope.launch { diagnosticRepository.start(jobId, category) }
    }

    fun record(session: DiagnosticSession, result: TestResult, note: String) {
        viewModelScope.launch { diagnosticRepository.record(session, result, note, System.currentTimeMillis()) }
    }
}
