package com.wise2.fieldtech.bluetooth

import com.wise2.fieldtech.bluetooth.model.ToolConnectionState
import com.wise2.fieldtech.bluetooth.model.ToolDevice
import com.wise2.fieldtech.domain.model.ReadingSnapshot
import kotlinx.coroutines.flow.Flow

/**
 * Normalized contract every instrument brand implements. WISE² owns the reading model
 * (domain.model.ReadingSnapshot) regardless of which adapter produced it, so new brands
 * plug in without touching UI/domain code (spec §9).
 *
 * IMPORTANT: Fieldpiece does not publish a public BLE protocol/SDK as of this build. Per
 * spec §9 ("do not invent undocumented Fieldpiece Bluetooth protocols"), no FieldpieceAdapter
 * ships here — only SimulatedToolAdapter. See docs/FIELD_TOOL_INTEGRATION.md for exactly
 * what's needed to add a real adapter once vendor SDK access is available.
 */
interface FieldToolAdapter {
    val brandName: String

    fun connectionState(): Flow<ToolConnectionState>

    /** Emits devices as they're discovered; caller stops scanning by cancelling collection. */
    fun scan(): Flow<ToolDevice>

    suspend fun connect(device: ToolDevice)

    suspend fun disconnect()

    /** Continuous, timestamped readings while connected. Empty/absent fields are left null —
     *  never fabricated (spec §10, "do not allow the AI to silently invent measurements"). */
    fun readings(jobId: String): Flow<ReadingSnapshot>
}
