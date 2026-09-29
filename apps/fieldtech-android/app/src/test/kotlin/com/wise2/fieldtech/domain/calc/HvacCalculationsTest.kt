package com.wise2.fieldtech.domain.calc

import com.google.common.truth.Truth.assertThat
import com.wise2.fieldtech.domain.model.ReadingSnapshot
import org.junit.Test

class HvacCalculationsTest {

    private fun baseReading() = ReadingSnapshot(
        id = "r1",
        jobId = "j1",
        sourceDeviceName = "Fieldpiece SMAN",
        capturedAtEpochMillis = 1000L,
        isDemoData = true,
    )

    @Test
    fun `superheat is suction line minus suction saturation`() {
        val reading = baseReading().copy(suctionLineTempF = 54.2, suctionSaturationF = 39.6)
        val result = HvacCalculations.superheat(reading, 2000L)
        assertThat(result).isNotNull()
        assertThat(result!!.result).isWithin(0.001).of(14.6)
        assertThat(result.unit).isEqualTo("°F")
    }

    @Test
    fun `superheat is null when inputs missing`() {
        val reading = baseReading().copy(suctionLineTempF = 54.2)
        assertThat(HvacCalculations.superheat(reading, 2000L)).isNull()
    }

    @Test
    fun `subcooling is liquid saturation minus liquid line`() {
        val reading = baseReading().copy(liquidSaturationF = 105.2, liquidLineTempF = 94.6)
        val result = HvacCalculations.subcooling(reading, 2000L)
        assertThat(result!!.result).isWithin(0.001).of(10.6)
    }

    @Test
    fun `temperature split is return minus supply`() {
        val reading = baseReading().copy(returnTempF = 75.0, supplyTempF = 57.0)
        val result = HvacCalculations.temperatureSplit(reading, 2000L)
        assertThat(result!!.result).isWithin(0.001).of(18.0)
    }

    @Test
    fun `voltage imbalance requires at least two phases`() {
        val reading = baseReading().copy(voltageL1 = 240.0)
        assertThat(HvacCalculations.voltageImbalance(reading, 2000L)).isNull()
    }

    @Test
    fun `voltage imbalance flags over 10 percent deviation`() {
        val reading = baseReading().copy(voltageL1 = 200.0, voltageL2 = 240.0, voltageL3 = 240.0)
        val result = HvacCalculations.voltageImbalance(reading, 2000L)
        assertThat(result).isNotNull()
        assertThat(result!!.result).isGreaterThan(10.0)
        assertThat(result.note).isNotNull()
    }

    @Test
    fun `allApplicable only returns calculations with sufficient inputs`() {
        val reading = baseReading().copy(suctionLineTempF = 54.2, suctionSaturationF = 39.6)
        val results = HvacCalculations.allApplicable(reading, 2000L)
        assertThat(results).hasSize(1)
        assertThat(results.first().label).isEqualTo("Superheat")
    }
}
