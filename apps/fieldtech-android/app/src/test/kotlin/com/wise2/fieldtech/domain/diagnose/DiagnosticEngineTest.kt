package com.wise2.fieldtech.domain.diagnose

import com.google.common.truth.Truth.assertThat
import com.wise2.fieldtech.domain.model.DiagnosticCategory
import com.wise2.fieldtech.domain.model.TestResult
import org.junit.Test

class DiagnosticEngineTest {

    @Test
    fun `all passes reaches analyze refrigeration terminal`() {
        var session = DiagnosticEngine.start("job-1", DiagnosticCategory.NO_COOLING)
        repeat(6) {
            session = DiagnosticEngine.record(session, TestResult.PASS, nowMillis = 1000L)
        }
        assertThat(session.isComplete).isTrue()
        assertThat(session.finalFinding).contains("Analyze the refrigeration circuit")
    }

    @Test
    fun `failing power stops immediately with power finding`() {
        var session = DiagnosticEngine.start("job-1", DiagnosticCategory.NO_COOLING)
        session = DiagnosticEngine.record(session, TestResult.FAIL, nowMillis = 1000L)
        assertThat(session.isComplete).isTrue()
        assertThat(session.finalFinding).contains("No power at disconnect")
    }

    @Test
    fun `matches spec test scenario - pressure switch wiring grounding fault`() {
        // Power, control voltage, cooling call, Y energized, contactor energized all PASS,
        // but compressor intermittently fails to run — matches the CLAUDE.md §26 demo case.
        var session = DiagnosticEngine.start("job-1", DiagnosticCategory.NO_COOLING)
        repeat(5) { session = DiagnosticEngine.record(session, TestResult.PASS, nowMillis = 1000L) }
        session = DiagnosticEngine.record(session, TestResult.FAIL, note = "Compressor cycles off intermittently; pressure switch wiring found rubbing suction line", nowMillis = 2000L)
        assertThat(session.isComplete).isTrue()
        assertThat(session.finalFinding).contains("Contactor energized but compressor not running")
        assertThat(session.results.find { it.stepId == "compressor_running" }?.technicianNote).contains("pressure switch wiring")
    }

    @Test
    fun `recording after completion is a no-op`() {
        var session = DiagnosticEngine.start("job-1", DiagnosticCategory.NO_COOLING)
        session = DiagnosticEngine.record(session, TestResult.FAIL, nowMillis = 1000L)
        val completed = session
        session = DiagnosticEngine.record(session, TestResult.PASS, nowMillis = 3000L)
        assertThat(session).isEqualTo(completed)
    }

    @Test
    fun `every category has a resolvable tree`() {
        DiagnosticCategory.values().forEach { category ->
            val session = DiagnosticEngine.start("job-1", category)
            assertThat(session.currentStepId).isNotEmpty()
        }
    }
}
