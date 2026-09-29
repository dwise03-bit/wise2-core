package com.wise2.fieldtech.bluetooth

import com.google.common.truth.Truth.assertThat
import org.junit.Test

class FlukeReadingDecoderTest {
    @Test fun `decodes physically verified capacitance display`() {
        val reading = FlukeReadingDecoder.decode("\u0000    0.0uF\u0000        ".toByteArray())!!
        assertThat(reading.capacitanceMfd).isEqualTo(0.0)
    }

    @Test fun `does not invent unverified meter modes`() {
        assertThat(FlukeReadingDecoder.decode("120.0V".toByteArray())).isNull()
    }
}
