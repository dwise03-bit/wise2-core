package com.wise2.fieldtech.ui.screens.diagnose

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class DiagnosticCockpitTest {
    @Test
    fun `missing measurements remain explicitly missing`() {
        val state = DiagnosticCockpitState(suctionPsi = 118.4, liquidPsi = null)
        assertEquals(ReadingState.MEASURED, state.stateOf(state.suctionPsi))
        assertEquals(ReadingState.MISSING, state.stateOf(state.liquidPsi))
    }

    @Test
    fun `evidence separates measured derived and inference`() {
        val evidence = listOf(
            DiagnosticEvidence("Suction pressure 118.4 PSI", EvidenceType.MEASURED),
            DiagnosticEvidence("Superheat 13.6 F", EvidenceType.DERIVED),
            DiagnosticEvidence("Airflow restriction possible", EvidenceType.AI_INFERENCE),
        )
        assertTrue(evidence.map { it.type }.containsAll(EvidenceType.entries))
    }

    @Test
    fun `next best test is missing when no recommendation exists`() {
        assertEquals("MISSING", DiagnosticCockpitState().nextBestTestLabel)
    }
}
