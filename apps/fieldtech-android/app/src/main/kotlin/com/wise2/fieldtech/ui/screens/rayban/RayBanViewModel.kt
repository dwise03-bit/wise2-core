package com.wise2.fieldtech.ui.screens.rayban

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.wise2.fieldtech.wearables.ConnectionState
import com.wise2.fieldtech.wearables.MetaWearablesBridge
import com.wise2.fieldtech.wearables.RayBanUiState
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

class RayBanViewModel(private val bridge: MetaWearablesBridge) : ViewModel() {
    val uiState = bridge.state
        .map { RayBanUiState.from(it) }
        .stateIn(viewModelScope, SharingStarted.Lazily, RayBanUiState.from(ConnectionState.UNAVAILABLE))

    fun askWise2(query: String) {
        viewModelScope.launch {
            try {
                bridge.sendAudioCommand(query)
            } catch (e: Exception) {
                // Log or emit error state; UI shows unavailable state
            }
        }
    }

    fun captureFrame() {
        viewModelScope.launch {
            try {
                // Placeholder: frame would come from camera in production
                bridge.publishCameraFrame(byteArrayOf(), "image/jpeg")
            } catch (e: Exception) {
                // UI shows unavailable state
            }
        }
    }

    fun connectGlasses() {
        viewModelScope.launch {
            try {
                bridge.connect()
            } catch (e: Exception) {
                // Stay in unavailable state
            }
        }
    }

    fun disconnectGlasses() {
        viewModelScope.launch {
            try {
                bridge.disconnect()
            } catch (e: Exception) {
                // Stay in current state
            }
        }
    }
}
