package com.wise2.trading

import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class RiskGuardTest {
    @Test
    fun `allows paper trade inside limits`() {
        val result = RiskGuard.evaluate(
            accountEquity = 10_000.0,
            estimatedRisk = 75.0,
            dailyLoss = 50.0,
            openExposure = 1_500.0
        )
        assertTrue(result.allowed)
    }

    @Test
    fun `blocks paper trade above one percent trade risk`() {
        val result = RiskGuard.evaluate(
            accountEquity = 10_000.0,
            estimatedRisk = 125.0,
            dailyLoss = 0.0,
            openExposure = 1_000.0
        )
        assertFalse(result.allowed)
    }

    @Test
    fun `blocks paper trade after two percent daily loss`() {
        val result = RiskGuard.evaluate(
            accountEquity = 10_000.0,
            estimatedRisk = 20.0,
            dailyLoss = 210.0,
            openExposure = 500.0
        )
        assertFalse(result.allowed)
    }
}
