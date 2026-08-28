package com.wise2.trading

data class MarketSetup(
    val symbol: String,
    val assetClass: String,
    val strategy: String,
    val wiseScore: Int,
    val entry: Double,
    val stop: Double,
    val target: Double,
    val quantity: Double,
    val thesis: String
) {
    val estimatedRisk: Double get() = kotlin.math.abs(entry - stop) * quantity
    val estimatedReward: Double get() = kotlin.math.abs(target - entry) * quantity
    val rewardRisk: Double get() = if (estimatedRisk == 0.0) 0.0 else estimatedReward / estimatedRisk
}

data class PaperAccount(
    val equity: Double,
    val buyingPower: Double,
    val dailyPnl: Double,
    val openExposure: Double
)

data class PaperOrderRequest(
    val symbol: String,
    val side: String,
    val quantity: Double,
    val entry: Double,
    val stop: Double,
    val target: Double,
    val strategy: String,
    val clientApproved: Boolean = true
)

data class PaperOrderResult(
    val id: String,
    val status: String,
    val symbol: String
)
