package com.wise2.fieldtech.wearables

import com.google.common.truth.Truth.assertThat
import org.junit.Test

class RayBanUiStateTest {
    @Test
    fun `unavailable state explains Meta setup without claiming connection`() {
        val state = RayBanUiState.from(ConnectionState.UNAVAILABLE)

        assertThat(state.connected).isFalse()
        assertThat(state.statusLabel).isEqualTo("META SETUP REQUIRED")
        assertThat(state.canCapture).isFalse()
        assertThat(state.canAskWise2).isFalse()
    }

    @Test
    fun `connected state enables explicit field actions`() {
        val state = RayBanUiState.from(ConnectionState.CONNECTED)

        assertThat(state.connected).isTrue()
        assertThat(state.statusLabel).isEqualTo("GLASSES ONLINE")
        assertThat(state.canCapture).isTrue()
        assertThat(state.canAskWise2).isTrue()
    }
}
