package com.wise2.fieldtech.domain.hvacnode

import com.wise2.fieldtech.domain.model.HvacNodeSnapshot
import com.wise2.fieldtech.domain.model.HvacNodeTransport
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class HvacNodeTelemetryValidatorTest {
    private fun snapshot(
        captured: Long = 9_900L,
        received: Long = 10_000L,
        suction: Double? = 70.0,
        liquid: Double? = 250.0,
        supplyRh: Double? = 45.0,
    ) = HvacNodeSnapshot(
        deviceId = "node-1",
        sessionId = "session-1",
        sequence = 1,
        capturedAtEpochMillis = captured,
        receivedAtEpochMillis = received,
        transport = HvacNodeTransport.WIFI,
        suctionPressurePsig = suction,
        liquidPressurePsig = liquid,
        supplyRhPercent = supplyRh,
    )

    @Test
    fun `rejects impossible channel but preserves healthy channels`() {
        val result = HvacNodeTelemetryValidator.validate(snapshot(suction = -50.0, liquid = 250.0))
        assertNull(result.snapshot.suctionPressurePsig)
        assertEquals(250.0, result.snapshot.liquidPressurePsig!!, 0.001)
        assertTrue(result.rejectedChannels.contains("suctionPressurePsig"))
    }

    @Test
    fun `rejects humidity outside zero to one hundred`() {
        val result = HvacNodeTelemetryValidator.validate(snapshot(supplyRh = 120.0))
        assertNull(result.snapshot.supplyRhPercent)
        assertTrue(result.rejectedChannels.contains("supplyRhPercent"))
    }

    @Test
    fun `flags stale and clock skew separately`() {
        val stale = HvacNodeTelemetryValidator.validate(snapshot(captured = 1_000L, received = 10_000L))
        assertTrue(stale.isStale)
        assertFalse(stale.hasClockSkew)

        val future = HvacNodeTelemetryValidator.validate(snapshot(captured = 80_000L, received = 10_000L))
        assertTrue(future.hasClockSkew)
    }
}
