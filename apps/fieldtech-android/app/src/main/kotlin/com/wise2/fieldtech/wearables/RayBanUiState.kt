package com.wise2.fieldtech.wearables

data class RayBanUiState(
    val connected: Boolean,
    val statusLabel: String,
    val canCapture: Boolean,
    val canAskWise2: Boolean,
) {
    companion object {
        fun from(state: ConnectionState): RayBanUiState = when (state) {
            ConnectionState.CONNECTED -> RayBanUiState(true, "GLASSES ONLINE", true, true)
            ConnectionState.CONNECTING -> RayBanUiState(false, "CONNECTING", false, false)
            ConnectionState.DISCONNECTED -> RayBanUiState(false, "GLASSES OFFLINE", false, false)
            ConnectionState.ERROR -> RayBanUiState(false, "CONNECTION ERROR", false, false)
            ConnectionState.UNAVAILABLE -> RayBanUiState(false, "META SETUP REQUIRED", false, false)
        }
    }
}
