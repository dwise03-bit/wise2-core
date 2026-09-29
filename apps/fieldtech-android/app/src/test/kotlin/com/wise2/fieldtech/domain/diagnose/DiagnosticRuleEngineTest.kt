package com.wise2.fieldtech.domain.diagnose

import com.google.common.truth.Truth.assertThat
import com.wise2.fieldtech.domain.model.ReadingSnapshot
import org.junit.Test

class DiagnosticRuleEngineTest {
    @Test fun `combines airflow and charge evidence into explainable assessment`() {
        val assessment = DiagnosticRuleEngine.assess(ReadingSnapshot("r", "j", "demo", 1L, true, returnTempF = 76.0, supplyTempF = 61.0, suctionLineTempF = 60.0, suctionSaturationF = 40.0, liquidSaturationF = 104.0, liquidLineTempF = 99.0))
        assertThat(assessment.title).isEqualTo("Airflow or Charge Issue")
        assertThat(assessment.confidencePercent).isEqualTo(82)
        assertThat(assessment.rationale).hasSize(3)
    }
}
