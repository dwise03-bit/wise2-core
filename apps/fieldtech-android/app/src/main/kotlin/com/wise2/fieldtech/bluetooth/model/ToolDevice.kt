package com.wise2.fieldtech.bluetooth.model

enum class ToolConnectionState { DISCONNECTED, SCANNING, CONNECTING, CONNECTED, RECONNECTING }

data class ToolDevice(
    val id: String,
    val name: String,
    val brand: String,
    val batteryPercent: Int? = null,
    val isDemo: Boolean = false,
)
