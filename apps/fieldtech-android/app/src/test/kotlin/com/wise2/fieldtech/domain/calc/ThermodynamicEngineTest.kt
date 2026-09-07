package com.wise2.fieldtech.domain.calc

import com.google.common.truth.Truth.assertThat
import org.junit.Test

class ThermodynamicEngineTest {
    @Test fun `interpolates R410A saturation without extrapolation`() {
        assertThat(ThermodynamicEngine.saturationF("R-410A", 109.0)).isWithin(0.01).of(36.5)
        assertThat(ThermodynamicEngine.saturationF("R-410A", 40.0)).isNull()
    }

    @Test fun `evaluates superheat and subcooling`() {
        val result = ThermodynamicEngine.evaluate("R-410A", 118.0, 300.0, 56.0, 92.0)
        assertThat(result!!.superheatF).isWithin(0.01).of(15.0)
        assertThat(result.subcoolingF).isWithin(0.01).of(9.0)
    }
}
