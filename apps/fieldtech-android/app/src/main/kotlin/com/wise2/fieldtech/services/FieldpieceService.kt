package com.wise2.fieldtech.services

import android.bluetooth.BluetoothAdapter
import android.bluetooth.BluetoothManager
import android.content.Context
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow

data class FieldpieceReading(
  val timestamp: Long = System.currentTimeMillis(),
  val temperature: Float = 0f,
  val pressure: Float = 0f,
  val voltage: Float = 0f,
  val humidity: Float? = null,
  val amps: Float? = null,
)

class FieldpieceService(private val context: Context) {
  private val bluetoothManager = context.getSystemService(BluetoothManager::class.java)
  private val bluetoothAdapter = bluetoothManager?.adapter

  private val _readings = MutableStateFlow<FieldpieceReading>(FieldpieceReading())
  val readings: StateFlow<FieldpieceReading> = _readings

  private val _isConnected = MutableStateFlow(false)
  val isConnected: StateFlow<Boolean> = _isConnected

  fun connect() {
    // Connect to Fieldpiece device via Bluetooth
    _isConnected.value = true
    // TODO: Implement actual Bluetooth connection
    // For now, emit mock readings for testing
    emitMockReadings()
  }

  fun disconnect() {
    _isConnected.value = false
  }

  private fun emitMockReadings() {
    // Simulate Fieldpiece data
    _readings.value = FieldpieceReading(
      temperature = 72.5f,
      pressure = 400f,
      voltage = 240f,
      humidity = 45f,
      amps = 15.2f,
    )
  }

  fun updateReading(reading: FieldpieceReading) {
    _readings.value = reading
  }
}
