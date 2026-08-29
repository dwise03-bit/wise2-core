package com.wise2.fieldtech.domain.diagnose

import com.google.common.truth.Truth.assertThat
import com.wise2.fieldtech.domain.model.ReadingSnapshot
import org.junit.Test

class FieldpieceEvidenceMapperTest {

    private fun reading() = ReadingSnapshot(
        id = "r1",
        jobId = "j1",
        sourceDeviceName = "Fieldpiece SM480V",
        capturedAtEpochMillis = 1_000L,
        isDemoData = false,
    )

    @Test
    fun `null reading produces no evidence panel`() {
        assertThat(FieldpieceEvidenceMapper.fromReading(null, 2_000L)).isNull()
    }

    @Test
    fun `missing measurements stay as dash and not available in context`() {
        val evidence = FieldpieceEvidenceMapper.fromReading(reading(), 2_000L)!!
        assertThat(evidence.cards).hasSize(4)
        assertThat(evidence.cards.all { !it.available }).isTrue()
        assertThat(evidence.cards.map { it.value }.toSet()).containsExactly(FieldpieceEvidenceMapper.MISSING)
        val context = FieldpieceEvidenceMapper.contextLines(reading(), 2_000L)
        assertThat(context).contains("Not available")
        assertThat(context).doesNotContain("null")
    }

    @Test
    fun `head pressure uses high side from Fieldpiece manifold`() {
        val evidence = FieldpieceEvidenceMapper.fromReading(reading().copy(highSidePsig = 318.0), 2_000L)!!
        val head = evidence.cards.first { it.id == "head-pressure" }
        assertThat(head.value).isEqualTo("318")
        assertThat(head.unit).isEqualTo("PSIG")
        assertThat(head.available).isTrue()
    }

    @Test
    fun `superheat and subcooling use existing HVAC calculations`() {
        val evidence = FieldpieceEvidenceMapper.fromReading(
            reading().copy(
                suctionLineTempF = 54.2,
                suctionSaturationF = 39.6,
                liquidSaturationF = 105.2,
                liquidLineTempF = 94.6,
            ),
            2_000L,
        )!!
        assertThat(evidence.cards.first { it.id == "superheat" }.value).isEqualTo("14.6")
        assertThat(evidence.cards.first { it.id == "subcooling" }.value).isEqualTo("10.6")
    }

    @Test
    fun `demo readings are labeled and never look like live instruments`() {
        val evidence = FieldpieceEvidenceMapper.fromReading(reading().copy(isDemoData = true), 2_000L)!!
        assertThat(evidence.isDemoData).isTrue()
        assertThat(FieldpieceEvidenceMapper.contextLines(reading().copy(isDemoData = true), 2_000L))
            .contains("DEMO")
    }
}
