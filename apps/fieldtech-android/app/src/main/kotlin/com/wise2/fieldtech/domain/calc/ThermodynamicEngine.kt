package com.wise2.fieldtech.domain.calc

/** Refrigerants supported by the local field PT lookup. */
enum class Refrigerant(val displayName: String) {
    R410A("R-410A"), R22("R-22"), R32("R-32"), R454B("R-454B");

    companion object {
        fun parse(value: String?): Refrigerant? = value?.uppercase()?.replace("-", "")?.let {
            when (it) { "R410A", "410A" -> R410A; "R22", "22" -> R22; "R32", "32" -> R32; "R454B", "454B" -> R454B; else -> null }
        }
    }
}

data class ThermodynamicResult(
    val saturationF: Double,
    val superheatF: Double? = null,
    val subcoolingF: Double? = null,
    val enthalpyBtuPerLb: Double? = null,
)

/**
 * Deterministic, bounded PT interpolation for field diagnostics. Tables are intentionally
 * explicit and versionable; replace entries with the approved NIST export when licensed data
 * is supplied. Never extrapolate outside the validated pressure range.
 */
object ThermodynamicEngine {
    private val tables = mapOf(
        Refrigerant.R410A to listOf(80.0 to 20.0, 100.0 to 32.0, 118.0 to 41.0, 130.0 to 47.0, 150.0 to 55.0, 180.0 to 66.0, 200.0 to 73.0, 230.0 to 82.0, 250.0 to 88.0, 280.0 to 96.0, 300.0 to 101.0, 325.0 to 107.0, 350.0 to 113.0, 400.0 to 124.0, 450.0 to 134.0, 500.0 to 144.0),
        Refrigerant.R22 to listOf(40.0 to 16.0, 58.0 to 32.0, 70.0 to 41.0, 85.0 to 50.0, 100.0 to 59.0, 120.0 to 70.0, 150.0 to 84.0, 180.0 to 96.0, 200.0 to 101.0, 226.0 to 110.0, 250.0 to 118.0, 278.0 to 125.0),
        Refrigerant.R32 to listOf(80.0 to 21.0, 100.0 to 33.0, 120.0 to 43.0, 150.0 to 55.0, 180.0 to 66.0, 210.0 to 76.0, 250.0 to 88.0, 300.0 to 102.0, 350.0 to 114.0, 400.0 to 125.0, 450.0 to 135.0),
        // R-454B values are a conservative field approximation pending an approved dew/bubble table.
        Refrigerant.R454B to listOf(80.0 to 18.0, 100.0 to 30.0, 120.0 to 40.0, 150.0 to 52.0, 180.0 to 64.0, 220.0 to 78.0, 260.0 to 91.0, 300.0 to 103.0, 350.0 to 116.0, 400.0 to 128.0, 450.0 to 139.0),
    )

    fun saturationF(refrigerant: String?, pressurePsig: Double): Double? =
        saturationF(Refrigerant.parse(refrigerant), pressurePsig)

    fun saturationF(refrigerant: Refrigerant?, pressurePsig: Double): Double? {
        if (refrigerant == null || !pressurePsig.isFinite()) return null
        val table = tables[refrigerant] ?: return null
        if (pressurePsig !in table.first().first..table.last().first) return null
        val upper = table.firstOrNull { pressurePsig <= it.first } ?: return table.last().second
        if (pressurePsig == upper.first) return upper.second
        val lower = table[table.indexOf(upper) - 1]
        val ratio = (pressurePsig - lower.first) / (upper.first - lower.first)
        return (lower.second + ratio * (upper.second - lower.second)).round1()
    }

    fun evaluate(refrigerant: String?, suctionPsig: Double?, liquidPsig: Double?, suctionLineF: Double?, liquidLineF: Double?): ThermodynamicResult? {
        val suctionSat = suctionPsig?.let { saturationF(refrigerant, it) } ?: return null
        val liquidSat = liquidPsig?.let { saturationF(refrigerant, it) }
        return ThermodynamicResult(saturationF = suctionSat, superheatF = suctionLineF?.minus(suctionSat)?.round1(), subcoolingF = liquidSat?.let { liquidLineF?.let { line -> (it - line).round1() } })
    }

    private fun Double.round1() = kotlin.math.round(this * 10.0) / 10.0
}
