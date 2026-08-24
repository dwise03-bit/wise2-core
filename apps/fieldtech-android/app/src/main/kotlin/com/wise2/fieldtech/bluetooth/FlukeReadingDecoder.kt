package com.wise2.fieldtech.bluetooth

data class FlukeReading(val capacitanceMfd: Double?)

object FlukeReadingDecoder {
    fun decode(data: ByteArray): FlukeReading? {
        val display = data.toString(Charsets.US_ASCII).trim('\u0000', ' ')
        val match = Regex("^([+-]?[0-9]+(?:\\.[0-9]+)?)uF$").matchEntire(display) ?: return null
        return FlukeReading(capacitanceMfd = match.groupValues[1].toDoubleOrNull())
    }
}
