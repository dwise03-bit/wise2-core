package com.wise2.fieldtech.ui.screens.diagnose

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.wise2.fieldtech.data.repository.DiagnosticRepository
import com.wise2.fieldtech.data.repository.ReadingRepository
import com.wise2.fieldtech.domain.diagnose.DiagnosticCockpit
import com.wise2.fieldtech.domain.diagnose.DiagnosticTrees
import com.wise2.fieldtech.domain.model.DiagnosticCapturePoint
import com.wise2.fieldtech.domain.model.DiagnosticCategory
import com.wise2.fieldtech.domain.model.DiagnosticComparison
import com.wise2.fieldtech.domain.model.DiagnosticSession
import com.wise2.fieldtech.domain.model.DiagnosticStep
import com.wise2.fieldtech.domain.model.FieldWorkflowStep
import com.wise2.fieldtech.domain.model.ReadingSnapshot
import com.wise2.fieldtech.domain.model.SimulationFixture
import com.wise2.fieldtech.domain.model.TestResult
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

class DiagnoseViewModel(
    private val diagnosticRepository: DiagnosticRepository,
    readingRepository: ReadingRepository,
    private val jobId: String,
) : ViewModel() {

    val session: StateFlow<DiagnosticSession?> = diagnosticRepository.observe(jobId)
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), null)

    val latestReading: StateFlow<ReadingSnapshot?> = readingRepository.observeForJob(jobId)
        .combine(session) { readings, diagnostic ->
            val allowSimulation = diagnostic?.simulationFixture != null
            readings.firstOrNull { allowSimulation || !it.isDemoData }
        }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), null)

    val categories = DiagnosticCategory.values().toList()
    val workflow = DiagnosticCockpit.workflow

    fun currentStep(session: DiagnosticSession): DiagnosticStep =
        DiagnosticTrees.all.getValue(session.category).step(session.currentStepId)

    fun comparisons(session: DiagnosticSession): List<DiagnosticComparison> =
        DiagnosticCockpit.compare(session.testIn, session.testOut)

    fun startCategory(category: DiagnosticCategory) {
        viewModelScope.launch { diagnosticRepository.start(jobId, category) }
    }

    fun record(session: DiagnosticSession, result: TestResult, note: String) {
        viewModelScope.launch { diagnosticRepository.record(session, result, note, System.currentTimeMillis()) }
    }

    fun captureTestIn(session: DiagnosticSession) {
        save(session.copy(testIn = DiagnosticCockpit.capture(DiagnosticCapturePoint.TEST_IN, latestReading.value, System.currentTimeMillis())))
    }

    fun captureTestOut(session: DiagnosticSession) {
        save(session.copy(testOut = DiagnosticCockpit.capture(DiagnosticCapturePoint.TEST_OUT, latestReading.value, System.currentTimeMillis())))
    }

    fun toggleWorkflowStep(session: DiagnosticSession, step: FieldWorkflowStep) {
        val updated = if (step in session.completedWorkflowSteps) {
            session.completedWorkflowSteps - step
        } else {
            session.completedWorkflowSteps + step
        }
        save(session.copy(completedWorkflowSteps = updated))
    }

    fun updateRepair(session: DiagnosticSession, repair: String) {
        save(session.copy(documentedRepair = repair))
    }

    fun updateObservations(session: DiagnosticSession, observations: String) {
        save(session.copy(technicianObservations = observations))
    }

    fun setSimulationFixture(session: DiagnosticSession, fixture: SimulationFixture?) {
        save(session.copy(simulationFixture = fixture))
    }

    fun generateServiceNotes(session: DiagnosticSession) {
        val notes = DiagnosticCockpit.serviceNotes(
            reasonForCall = "",
            equipment = "",
            modelSerial = "",
            finalFinding = session.finalFinding,
            repair = session.documentedRepair,
            observations = session.technicianObservations,
            comparisons = comparisons(session),
            technician = "",
            testIn = session.testIn,
            testOut = session.testOut,
        )
        save(session.copy(serviceNotes = notes, completedWorkflowSteps = session.completedWorkflowSteps + FieldWorkflowStep.GENERATE_SERVICE_NOTES))
    }

    private fun save(session: DiagnosticSession) {
        viewModelScope.launch { diagnosticRepository.save(session) }
    }
}
