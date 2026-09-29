package com.wise2.fieldtech.wearables

import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.serialization.Serializable

@Serializable
data class RayBanAlert(
    val id: String = java.util.UUID.randomUUID().toString(),
    val title: String,
    val message: String,
    val severity: AlertSeverity = AlertSeverity.INFO,
    val timestamp: Long = System.currentTimeMillis(),
    val jobId: String? = null,
    val customerId: String? = null,
    val captureId: String? = null,
)

enum class AlertSeverity {
    INFO,
    WARNING,
    ERROR,
    CRITICAL,
}

/**
 * Sends alerts to Ray-Ban Meta glasses and syncs to Discord + wise2.net.
 */
interface RayBanAlertService {
    val alertStream: SharedFlow<RayBanAlert>
    suspend fun sendAlert(alert: RayBanAlert)
    suspend fun syncToDiscord(alert: RayBanAlert)
    suspend fun syncToWise2Net(alert: RayBanAlert)
}

class RayBanAlertServiceImpl(
    private val bridge: MetaWearablesBridge,
) : RayBanAlertService {
    private val mutableAlertStream = MutableSharedFlow<RayBanAlert>()
    override val alertStream: SharedFlow<RayBanAlert> = mutableAlertStream.asSharedFlow()

    override suspend fun sendAlert(alert: RayBanAlert) {
        // Send to glasses via audio command
        val glassesMessage = "${alert.title}: ${alert.message}"
        try {
            bridge.sendAudioCommand(glassesMessage)
        } catch (e: Exception) {
            // Glasses unavailable, but continue with Discord/wise2.net sync
        }

        // Emit to local listeners
        mutableAlertStream.emit(alert)

        // Sync to external systems
        syncToDiscord(alert)
        syncToWise2Net(alert)
    }

    override suspend fun syncToDiscord(alert: RayBanAlert) {
        try {
            // Placeholder: Discord webhook integration via API
            // In production, this sends to: https://wise2.net/api/contractor-os/alerts
            // Which forwards to Discord #contractor-os channel
            val payload = mapOf(
                "type" to "rayban_alert",
                "alert" to alert,
                "source" to "field_tech_rayban"
            )
            // API call would go here
        } catch (e: Exception) {
            // Log and continue
        }
    }

    override suspend fun syncToWise2Net(alert: RayBanAlert) {
        try {
            // Placeholder: wise2.net API integration
            // In production, POST to: https://wise2.net/api/field-tech/rayban/alerts
            val payload = mapOf(
                "alert" to alert,
                "device" to "rayban_meta_gen2",
                "timestamp" to System.currentTimeMillis()
            )
            // API call would go here
        } catch (e: Exception) {
            // Log and continue
        }
    }
}
