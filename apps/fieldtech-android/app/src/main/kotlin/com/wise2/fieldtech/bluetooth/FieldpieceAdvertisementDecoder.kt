package com.wise2.fieldtech.bluetooth

data class FieldpieceSmanReading(
    val lowSidePsig: Double?,
    val highSidePsig: Double?,
    val suctionLineTempF: Double?,
    val liquidLineTempF: Double?,
)

data class FieldpiecePipeClampReading(
    val jobLinkId: String,
    val temperatureF: Double,
)

/** Clean-room SMAN advertisement decoder. Only offsets verified against a physical SM480V
 * display are decoded; unknown values remain absent rather than being guessed. */
object FieldpieceAdvertisementDecoder {
    const val MANUFACTURER_ID = 0x5046

    fun decodeSman(data: ByteArray): FieldpieceSmanReading? {
        // Android removes the two-byte manufacturer ID. The remaining payload starts with "BT".
        if (data.size < 14 || data[0] != 0x42.toByte() || data[1] != 0x54.toByte()) return null
        return FieldpieceSmanReading(
            lowSidePsig = tenths(data, 6),
            highSidePsig = tenths(data, 8),
            suctionLineTempF = tenths(data, 10),
            liquidLineTempF = tenths(data, 12),
        )
    }

    fun decodePipeClamp(data: ByteArray): FieldpiecePipeClampReading? {
        // Verified FPBF payloads from owned JL3PC pipe clamps 8791 and 8792.
        if (data.size < 13 || data[0] != 0x42.toByte() || data[1] != 0x46.toByte()) return null
        val id = data.copyOfRange(4, 6).joinToString("") { "%02x".format(it) }
        return FieldpiecePipeClampReading(
            jobLinkId = id,
            temperatureF = tenths(data, 11) ?: return null,
        )
    }

    private fun tenths(data: ByteArray, offset: Int): Double? {
        val raw = ((data[offset + 1].toInt() and 0xff) shl 8) or (data[offset].toInt() and 0xff)
        val signed = raw.toShort().toInt()
        return if (signed == -30_000) null else signed / 10.0
    }
}
