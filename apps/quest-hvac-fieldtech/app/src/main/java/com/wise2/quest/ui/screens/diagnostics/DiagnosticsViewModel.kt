package com.wise2.quest.ui.screens.diagnostics

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.wise2.quest.data.models.ImpResult
import com.wise2.quest.data.models.MeasurementReading
import com.wise2.quest.data.repository.DiagnosticsRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import timber.log.Timber
import javax.inject.Inject

/**
 * ViewModel for diagnostics screen
 * Manages live HVAC measurements and IMP results
 */
@HiltViewModel
class DiagnosticsViewModel @Inject constructor(
  private val diagnosticsRepository: DiagnosticsRepository
) : ViewModel() {

  private val _currentMeasurement = MutableStateFlow<MeasurementReading?>(null)
  val currentMeasurement: StateFlow<MeasurementReading?> = _currentMeasurement.asStateFlow()

  private val _impResult = MutableStateFlow<ImpResult?>(null)
  val impResult: StateFlow<ImpResult?> = _impResult.asStateFlow()

  private val _isRunning = MutableStateFlow(false)
  val isRunning: StateFlow<Boolean> = _isRunning.asStateFlow()

  private val _uiState = MutableStateFlow<DiagnosticsUiState>(DiagnosticsUiState.Idle)
  val uiState: StateFlow<DiagnosticsUiState> = _uiState.asStateFlow()

  /**
   * Start continuous diagnostics measurement
   */
  fun startDiagnostics(workOrderId: String) {
    viewModelScope.launch {
      try {
        _isRunning.value = true
        _uiState.value = DiagnosticsUiState.Running

        Timber.i("Starting diagnostics for work order: $workOrderId")

        // Start reading measurements in a loop
        while (_isRunning.value) {
          try {
            val measurement = diagnosticsRepository.getMeasurement(workOrderId)
            _currentMeasurement.value = measurement

            // Get IMP analysis if available
            val impAnalysis = diagnosticsRepository.getImpAnalysis(workOrderId, measurement)
            _impResult.value = impAnalysis

            Timber.d("Measurement: pressure=${measurement.suctionPressure} psi, temp=${measurement.suctionTemperature}°F")

            // Update at 1Hz
            delay(1000)
          } catch (e: Exception) {
            Timber.e(e, "Error reading measurement")
            delay(2000)
          }
        }
      } catch (e: Exception) {
        Timber.e(e, "Failed to start diagnostics")
        _uiState.value = DiagnosticsUiState.Error(e.message ?: "Unknown error")
        _isRunning.value = false
      }
    }
  }

  /**
   * Stop diagnostics
   */
  fun stopDiagnostics() {
    _isRunning.value = false
    _uiState.value = DiagnosticsUiState.Idle
    Timber.i("Diagnostics stopped")
  }

  /**
   * Get current diagnostic summary
   */
  fun getDiagnosticSummary(): String {
    val measurement = _currentMeasurement.value ?: return "No data"
    val impResult = _impResult.value

    return buildString {
      append("Pressure: ${measurement.suctionPressure} psi\n")
      append("Temperature: ${measurement.suctionTemperature}°F\n")
      append("Superheat: ${measurement.superheat}°F\n")
      if (impResult != null) {
        append("Status: ${impResult.status}\n")
        append("Issues: ${impResult.issues.joinToString(", ")}\n")
      }
    }
  }
}

/**
 * Diagnostics UI state
 */
sealed class DiagnosticsUiState {
  object Idle : DiagnosticsUiState()
  object Running : DiagnosticsUiState()
  data class Error(val message: String) : DiagnosticsUiState()
}
