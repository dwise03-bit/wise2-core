package com.wise2.fieldtech.ui.screens.rayban

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.wise2.fieldtech.wearables.AlertSeverity
import com.wise2.fieldtech.wearables.ConnectionState
import com.wise2.fieldtech.wearables.MetaWearablesBridge
import com.wise2.fieldtech.wearables.RayBanAlert
import com.wise2.fieldtech.wearables.RayBanAlertService
import com.wise2.fieldtech.wearables.RayBanUiState
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

class RayBanViewModel(
    private val bridge: MetaWearablesBridge,
    private val alertService: RayBanAlertService,
) : ViewModel() {
    val uiState = bridge.state
        .map { RayBanUiState.from(it) }
        .stateIn(viewModelScope, SharingStarted.Lazily, RayBanUiState.from(ConnectionState.UNAVAILABLE))

    fun askWise2(query: String) {
        viewModelScope.launch {
            try {
                bridge.sendAudioCommand(query)
                alertService.sendAlert(
                    RayBanAlert(
                        title = "Query Sent",
                        message = query,
                        severity = AlertSeverity.INFO,
                    )
                )
            } catch (e: Exception) {
                alertService.sendAlert(
                    RayBanAlert(
                        title = "Query Failed",
                        message = "Could not send query to WISE²",
                        severity = AlertSeverity.ERROR,
                    )
                )
            }
        }
    }

    fun captureFrame() {
        viewModelScope.launch {
            try {
                // Placeholder: frame would come from camera in production
                bridge.publishCameraFrame(byteArrayOf(), "image/jpeg")
                alertService.sendAlert(
                    RayBanAlert(
                        title = "Frame Captured",
                        message = "Photo saved to job",
                        severity = AlertSeverity.INFO,
                    )
                )
            } catch (e: Exception) {
                alertService.sendAlert(
                    RayBanAlert(
                        title = "Capture Failed",
                        message = "Could not capture frame",
                        severity = AlertSeverity.ERROR,
                    )
                )
            }
        }
    }

    fun connectGlasses() {
        viewModelScope.launch {
            try {
                bridge.connect()
                alertService.sendAlert(
                    RayBanAlert(
                        title = "Connected",
                        message = "Ray-Ban Meta glasses connected",
                        severity = AlertSeverity.INFO,
                    )
                )
            } catch (e: Exception) {
                alertService.sendAlert(
                    RayBanAlert(
                        title = "Connection Failed",
                        message = "Setup required for Ray-Ban Meta",
                        severity = AlertSeverity.WARNING,
                    )
                )
            }
        }
    }

    fun disconnectGlasses() {
        viewModelScope.launch {
            try {
                bridge.disconnect()
                alertService.sendAlert(
                    RayBanAlert(
                        title = "Disconnected",
                        message = "Ray-Ban Meta glasses disconnected",
                        severity = AlertSeverity.INFO,
                    )
                )
            } catch (e: Exception) {
                // Stay in current state
            }
        }
    }
}
