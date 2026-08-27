package com.wise2.fieldtech.bluetooth

import com.google.common.truth.Truth.assertThat
import org.junit.Test

class FieldpieceAdvertisementDecoderTest {
    @Test fun `decodes verified SM480V display values and preserves missing probe sentinel`() {
        val payload = "4254220545570e0200001c03d08a8f00350c0000d08a58021101aa".hex()
        val reading = FieldpieceAdvertisementDecoder.decodeSman(payload)!!
        assertThat(reading.lowSidePsig).isEqualTo(52.6)
        assertThat(reading.highSidePsig).isEqualTo(0.0)
        assertThat(reading.suctionLineTempF).isEqualTo(79.6)
        assertThat(reading.liquidLineTempF).isNull()
    }

    @Test fun `decodes verified high-side pipe clamp temperature and Job Link ID`() {
        val payload = "4246220587920420220505290310f30300070b".hex()
        val reading = FieldpieceAdvertisementDecoder.decodePipeClamp(payload)!!
        assertThat(reading.jobLinkId).isEqualTo("8792")
        assertThat(reading.temperatureF).isEqualTo(80.9)
    }

    @Test fun `decodes verified low-side pipe clamp temperature and Job Link ID`() {
        val payload = "4246220587911420220505300310f30300060e".hex()
        val reading = FieldpieceAdvertisementDecoder.decodePipeClamp(payload)!!
        assertThat(reading.jobLinkId).isEqualTo("8791")
        assertThat(reading.temperatureF).isEqualTo(81.6)
    }

    private fun String.hex() = chunked(2).map { it.toInt(16).toByte() }.toByteArray()
}
