package com.wise2.fieldtech.wearables

import android.content.Context
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.serialization.Serializable

/**
 * WISE² boundary for Ray-Ban Meta Gen 2.
 *
 * The concrete Meta Wearables Device Access Toolkit adapter belongs behind this
 * interface. Keeping the app independent of SDK package names lets production
 * builds remain reproducible while Meta developer-preview access is enabled.
 */
interface MetaWearablesBridge {
    val state: StateFlow<ConnectionState>
    suspend fun connect()
    suspend fun disconnect()
    suspend fun sendAudioCommand(text: String)
    suspend fun publishCameraFrame(bytes: ByteArray, mimeType: String = "image/jpeg")
}

enum class ConnectionState { UNAVAILABLE, DISCONNECTED, CONNECTING, CONNECTED, ERROR }

@Serializable
data class WearableEvent(
    val source: String = "rayban-meta-gen2",
    val type: String,
    val text: String? = null,
    val mimeType: String? = null,
)

/** Test-only bridge. It must never be used by a production provider. */
class MockMetaWearablesBridge : MetaWearablesBridge {
    private val mutableState = MutableStateFlow(ConnectionState.DISCONNECTED)
    override val state: StateFlow<ConnectionState> = mutableState.asStateFlow()

    override suspend fun connect() {
        mutableState.value = ConnectionState.CONNECTED
    }

    override suspend fun disconnect() {
        mutableState.value = ConnectionState.DISCONNECTED
    }

    override suspend fun sendAudioCommand(text: String) {
        require(text.isNotBlank()) { "Wearable command cannot be blank" }
    }

    override suspend fun publishCameraFrame(bytes: ByteArray, mimeType: String) {
        require(bytes.isNotEmpty()) { "Wearable camera frame cannot be empty" }
        require(mimeType.startsWith("image/")) { "Wearable frame must be an image" }
    }
}

/** Production-safe fallback until Meta DAT credentials and SDK are configured. */
class UnavailableMetaWearablesBridge : MetaWearablesBridge {
    private val mutableState = MutableStateFlow(ConnectionState.UNAVAILABLE)
    override val state: StateFlow<ConnectionState> = mutableState.asStateFlow()

    override suspend fun connect() = error("Ray-Ban Meta integration is not configured for this build")
    override suspend fun disconnect() = Unit
    override suspend fun sendAudioCommand(text: String) =
        error("Ray-Ban Meta audio is unavailable until Meta DAT is configured")
    override suspend fun publishCameraFrame(bytes: ByteArray, mimeType: String) =
        error("Ray-Ban Meta camera is unavailable until Meta DAT is configured")
}

/**
 * Entry point for dependency injection. Replace the provider implementation
 * here when Meta developer access and the official Android SDK artifact are
 * available; the rest of WISE² does not change.
 */
object MetaWearables {
    fun create(context: Context): MetaWearablesBridge = UnavailableMetaWearablesBridge()
}
