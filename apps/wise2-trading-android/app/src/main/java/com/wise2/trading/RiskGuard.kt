package com.wise2.trading

data class RiskDecision(
    val allowed: Boolean,
    val reasons: List<String>
)

object RiskGuard {
    private const val MAX_TRADE_RISK_PCT = 0.01
    private const val MAX_DAILY_LOSS_PCT = 0.02
    private const val MAX_EXPOSURE_PCT = 0.50

    fun evaluate(
        accountEquity: Double,
        estimatedRisk: Double,
        dailyLoss: Double,
        openExposure: Double
    ): RiskDecision {
        if (accountEquity <= 0.0) {
            return RiskDecision(false, listOf("Account equity must be positive"))
        }

        val reasons = buildList {
            if (estimatedRisk > accountEquity * MAX_TRADE_RISK_PCT) {
                add("Trade risk exceeds 1% of equity")
            }
            if (dailyLoss >= accountEquity * MAX_DAILY_LOSS_PCT) {
                add("Daily loss limit reached")
            }
            if (openExposure > accountEquity * MAX_EXPOSURE_PCT) {
                add("Open exposure exceeds 50% of equity")
            }
        }
        return RiskDecision(reasons.isEmpty(), reasons)
    }
}
