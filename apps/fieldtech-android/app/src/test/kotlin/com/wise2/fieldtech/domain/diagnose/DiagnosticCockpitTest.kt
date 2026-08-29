package com.wise2.fieldtech.domain.diagnose

import com.google.common.truth.Truth.assertThat
import com.wise2.fieldtech.domain.model.DiagnosticCapturePoint
import com.wise2.fieldtech.domain.model.DiagnosticValueSource
import com.wise2.fieldtech.domain.model.ReadingSnapshot
import org.junit.Test

class DiagnosticCockpitTest {

    @Test
    fun `capture classifies measured derived and missing values`() {
        val capture = DiagnosticCockpit.capture(
            DiagnosticCapturePoint.TEST_IN,
            ReadingSnapshot(
                id = "r1",
                jobId = "job-1",
                sourceDeviceName = "Fieldpiece SM480V",
                capturedAtEpochMillis = 1000L,
                isDemoData = false,
                lowSidePsig = 118.0,
                highSidePsig = 310.0,
                suctionSaturationF = 40.0,
                suctionLineTempF = 52.0,
                returnTempF = 75.0,
                supplyTempF = 56.0,
            ),
            nowMillis = 2000L,
        )

        assertThat(capture.metrics.first { it.key == "suction" }.source).isEqualTo(DiagnosticValueSource.MEASURED)
        assertThat(capture.metrics.first { it.key == "superheat" }.source).isEqualTo(DiagnosticValueSource.DERIVED)
        assertThat(capture.metrics.first { it.key == "airflow" }.source).isEqualTo(DiagnosticValueSource.MISSING)
        assertThat(capture.metrics.first { it.key == "superheat" }.value).isEqualTo(12.0)
    }

    @Test
    fun `comparison never claims improvement without a target`() {
        val testIn = DiagnosticCockpit.capture(
            DiagnosticCapturePoint.TEST_IN,
            ReadingSnapshot("in", "job-1", "Fieldpiece SM480V", 1000L, false, lowSidePsig = 80.0),
            1000L,
        )
        val testOut = DiagnosticCockpit.capture(
            DiagnosticCapturePoint.TEST_OUT,
            ReadingSnapshot("out", "job-1", "Fieldpiece SM480V", 2000L, false, lowSidePsig = 115.0),
            2000L,
        )

        val suction = DiagnosticCockpit.compare(testIn, testOut).first { it.key == "suction" }

        assertThat(suction.change).isEqualTo(35.0)
        assertThat(suction.conclusion).contains("improvement is not claimed")
    }

    @Test
    fun `service notes use missing instead of inventing undocumented values`() {
        val notes = DiagnosticCockpit.serviceNotes(
            reasonForCall = "",
            equipment = "",
            modelSerial = "",
            finalFinding = null,
            repair = "",
            observations = "",
            comparisons = emptyList(),
            technician = "",
            testIn = null,
            testOut = null,
        )

        assertThat(notes.logansReadyServiceNote).contains("Reason for call: Not documented")
        assertThat(notes.logansReadyServiceNote).contains("No captured measurements available")
        assertThat(notes.wiseDiagnosticRecord).contains("Diagnosis: MISSING")
    }
}
