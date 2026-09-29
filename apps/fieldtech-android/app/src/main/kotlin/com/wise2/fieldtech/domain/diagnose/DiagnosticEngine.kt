package com.wise2.fieldtech.domain.diagnose

import com.wise2.fieldtech.domain.model.DiagnosticCategory
import com.wise2.fieldtech.domain.model.DiagnosticSession
import com.wise2.fieldtech.domain.model.DiagnosticStepResult
import com.wise2.fieldtech.domain.model.TestResult

/**
 * Advances a DiagnosticSession one PASS/FAIL/SKIPPED/NOT_APPLICABLE answer at a time.
 * Pure and stateless: callers persist the returned session (spec §11 — "store the
 * results with the job").
 */
object DiagnosticEngine {

    fun start(jobId: String, category: DiagnosticCategory): DiagnosticSession {
        val tree = DiagnosticTrees.all.getValue(category)
        return DiagnosticSession(
            jobId = jobId,
            category = category,
            results = emptyList(),
            currentStepId = tree.startStepId,
            isComplete = false,
            finalFinding = null,
        )
    }

    fun record(
        session: DiagnosticSession,
        result: TestResult,
        note: String = "",
        nowMillis: Long,
    ): DiagnosticSession {
        if (session.isComplete) return session
        val tree = DiagnosticTrees.all.getValue(session.category)
        val currentStep = tree.step(session.currentStepId)

        val updatedResults = session.results + DiagnosticStepResult(
            stepId = currentStep.id,
            result = result,
            technicianNote = note,
            recordedAtEpochMillis = nowMillis,
        )

        if (currentStep.isTerminal) {
            return session.copy(results = updatedResults, isComplete = true, finalFinding = currentStep.terminalFinding)
        }

        val nextStepId = when (result) {
            TestResult.PASS, TestResult.SKIPPED, TestResult.NOT_APPLICABLE -> currentStep.onPassGoToStepId
            TestResult.FAIL -> currentStep.onFailGoToStepId
            TestResult.UNTESTED -> currentStep.id
        } ?: currentStep.id

        val nextStep = tree.step(nextStepId)
        return if (nextStep.isTerminal) {
            val terminalResults = updatedResults + DiagnosticStepResult(
                stepId = nextStep.id,
                result = TestResult.PASS,
                technicianNote = "",
                recordedAtEpochMillis = nowMillis,
            )
            session.copy(
                results = terminalResults,
                currentStepId = nextStep.id,
                isComplete = true,
                finalFinding = nextStep.terminalFinding,
            )
        } else {
            session.copy(results = updatedResults, currentStepId = nextStep.id)
        }
    }
}
