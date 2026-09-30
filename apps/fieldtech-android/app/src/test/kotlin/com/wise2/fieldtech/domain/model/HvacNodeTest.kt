package com.wise2.fieldtech.domain.model

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class HvacNodeTest {
    @Test
    fun `pi5 and uno q share one device contract`() {
        val pi = HvacNodeDevice(
            id = "pi5-001",
            name = "Roof Node",
            model = HvacNodeModel.PI5_ULTRA,
            firmwareVersion = "1.0.0",
            capabilities = HvacNodeCapabilities(
                pressure = true,
                temperature = true,
                humidity = true,
                electrical = true,
                camera = true,
            ),
        )
        val uno = pi.copy(
            id = "unoq-001",
            model = HvacNodeModel.UNO_Q_PRO,
            capabilities = pi.capabilities.copy(camera = false),
        )

        assertEquals(HvacNodeModel.PI5_ULTRA, pi.model)
        assertEquals(HvacNodeModel.UNO_Q_PRO, uno.model)
        assertTrue(pi.capabilities.camera)
        assertFalse(uno.capabilities.camera)
    }

    @Test
    fun `optional telemetry remains unavailable instead of fabricated`() {
        val snapshot = HvacNodeSnapshot(
            deviceId = "unoq-001",
            sessionId = "session-1",
            sequence = 42,
            capturedAtEpochMillis = 1_000L,
            receivedAtEpochMillis = 1_050L,
            transport = HvacNodeTransport.WIFI,
            suctionPressurePsig = 68.2,
        )

        assertEquals(68.2, snapshot.suctionPressurePsig, 0.001)
        assertNull(snapshot.liquidPressurePsig)
        assertNull(snapshot.supplyTempF)
        assertEquals("unoq-001:session-1:42", snapshot.identityKey)
    }

    @Test
    fun `connection state carries stale data signal`() {
        val state = HvacNodeConnectionState.Connected(
            deviceId = "pi5-001",
            transport = HvacNodeTransport.WIFI,
            signalStrength = 88,
            isStale = true,
        )

        assertTrue(state.isStale)
        assertEquals(88, state.signalStrength)
    }
}
