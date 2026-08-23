package com.wise2.fieldtech.domain.model

/**
 * Normalized reading model. WISE² owns this shape regardless of which
 * FieldToolAdapter produced the values, per the field-tool integration spec.
 */
data class ReadingSnapshot(
    val id: String,
    val jobId: String,
    val sourceDeviceName: String,
    val capturedAtEpochMillis: Long,
    val isDemoData: Boolean,

    // Refrigerant
    val lowSidePsig: Double? = null,
    val highSidePsig: Double? = null,
    val suctionSaturationF: Double? = null,
    val liquidSaturationF: Double? = null,
    val suctionLineTempF: Double? = null,
    val liquidLineTempF: Double? = null,
    val dischargeTempF: Double? = null,
    val outdoorAmbientF: Double? = null,

    // Electrical
    val voltageL1: Double? = null,
    val voltageL2: Double? = null,
    val voltageL3: Double? = null,
    val currentL1: Double? = null,
    val currentL2: Double? = null,
    val currentL3: Double? = null,
    val frequencyHz: Double? = null,
    val capacitanceMfd: Double? = null,
    val resistanceOhms: Double? = null,
    val continuityOk: Boolean? = null,

    // Airflow
    val returnTempF: Double? = null,
    val supplyTempF: Double? = null,
    val staticPressureInWc: Double? = null,
)
