package com.wise2.atak.radio

object Kiss {
    const val FEND: Byte = 0xC0.toByte()
    const val FESC: Byte = 0xDB.toByte()
    const val TFEND: Byte = 0xDC.toByte()
    const val TFESC: Byte = 0xDD.toByte()

    fun encode(payload: ByteArray, port: Int = 0): ByteArray {
        require(port in 0..15)
        val out = ArrayList<Byte>(payload.size + 3)
        out += FEND; out += (port shl 4).toByte()
        payload.forEach { b -> when (b) { FEND -> { out += FESC; out += TFEND }; FESC -> { out += FESC; out += TFESC }; else -> out += b } }
        out += FEND
        return out.toByteArray()
    }

    class Decoder(private val onFrame: (port: Int, payload: ByteArray) -> Unit) {
        private val buf = ArrayList<Byte>(); private var escaped = false; private var inFrame = false
        fun accept(bytes: ByteArray) = bytes.forEach { b ->
            if (b == FEND) { if (inFrame && buf.size > 1) onFrame((buf.removeAt(0).toInt() ushr 4) and 15, buf.toByteArray()); buf.clear(); escaped = false; inFrame = true; return@forEach }
            if (!inFrame) return@forEach
            if (escaped) { buf += when (b) { TFEND -> FEND; TFESC -> FESC; else -> b }; escaped = false }
            else if (b == FESC) escaped = true else buf += b
        }
    }
}
