package com.wise2.fieldtech.ui.screens.diagnose

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.wise2.fieldtech.bluetooth.ToolManager
import com.wise2.fieldtech.bluetooth.model.ToolConnectionState
import com.wise2.fieldtech.data.repository.DiagnosticRepository
import com.wise2.fieldtech.data.repository.ReadingRepository
import com.wise2.fieldtech.domain.diagnose.DiagnosticTrees
import com.wise2.fieldtech.domain.diagnose.FieldpieceEvidence
import com.wise2.fieldtech.domain.diagnose.FieldpieceEvidenceMapper
import com.wise2.fieldtech.domain.model.DiagnosticCategory
import com.wise2.fieldtech.domain.model.DiagnosticSession
import com.wise2.fieldtech.domain.model.ReadingSnapshot
import com.wise2.fieldtech.domain.model.TestResult
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

data class DiagnoseUiExtras(
    val fieldpieceEvidence: FieldpieceEvidence? = null,
    val toolConnection: ToolConnectionState = ToolConnectionState.DISCONNECTED,
)

class DiagnoseViewModel(
    private val diagnosticRepository: DiagnosticRepository,
    private val readingRepository: ReadingRepository,
    private val toolManager: ToolManager,
    private val jobId: String,
) : ViewModel() {

    val session: StateFlow<DiagnosticSession?> = diagnosticRepository.observe(jobId)
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), null)

    val categories = DiagnosticCategory.values().toList()

    private val _extras = MutableStateFlow(DiagnoseUiExtras())
    val extras: StateFlow<DiagnoseUiExtras> = _extras.asStateFlow()

    private var liveJob: Job? = null
    private var savedReading: ReadingSnapshot? = null
    private var liveReading: ReadingSnapshot? = null

    init {
        viewModelScope.launch {
            readingRepository.observeForJob(jobId).collect { readings ->
                savedReading = readings.firstOrNull()
                publishEvidence()
            }
        }
        viewModelScope.launch {
            toolManager.connectionState().collect { state ->
                _extras.value = _extras.value.copy(toolConnection = state)
                if (state == ToolConnectionState.CONNECTED) {
                    startLiveStream()
                } else {
                    liveJob?.cancel()
                    liveReading = null
                    publishEvidence()
                }
            }
        }
    }

    fun currentStep(session: DiagnosticSession) =
        DiagnosticTrees.all.getValue(session.category).step(session.currentStepId)

    fun startCategory(category: DiagnosticCategory) {
        viewModelScope.launch { diagnosticRepository.start(jobId, category) }
    }

    fun record(session: DiagnosticSession, result: TestResult, note: String) {
        viewModelScope.launch {
            val evidenceNote = FieldpieceEvidenceMapper.contextLines(
                liveReading ?: savedReading,
                System.currentTimeMillis(),
            )
            val combined = listOf(note.trim(), evidenceNote)
                .filter { it.isNotBlank() }
                .joinToString("\n")
            diagnosticRepository.record(session, result, combined, System.currentTimeMillis())
        }
    }

    private fun startLiveStream() {
        liveJob?.cancel()
        liveJob = viewModelScope.launch {
            toolManager.readingsForJob(jobId)
                .catch { }
                .collect { reading ->
                    liveReading = reading
                    publishEvidence()
                }
        }
    }

    private fun publishEvidence() {
        val live = liveReading
        val saved = savedReading
        _extras.value = _extras.value.copy(
            fieldpieceEvidence = FieldpieceEvidenceMapper.fromReading(
                reading = live ?: saved,
                nowMillis = System.currentTimeMillis(),
                isLive = live != null,
            ),
        )
    }
}
