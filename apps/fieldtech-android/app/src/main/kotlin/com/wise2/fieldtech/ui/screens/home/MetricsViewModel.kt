package com.wise2.fieldtech.ui.screens.home

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

data class EquipmentMetrics(
    val temperature: Float = 78.5f,
    val pressure: Float = 410.0f,
    val humidity: Float = 45.2f,
    val airflow: Float = 850.0f,
    val voltage: Float = 240.0f,
    val amperage: Float = 12.5f,
    val efficiency: Float = 89.5f,
    val timeElapsed: Long = 3600L,
)

data class DiagnosticReading(
    val name: String,
    val value: String,
    val unit: String,
    val status: String, // "normal", "warning", "critical"
    val timestamp: Long = System.currentTimeMillis(),
)

data class MetricsUiState(
    val metrics: EquipmentMetrics = EquipmentMetrics(),
    val diagnostics: List<DiagnosticReading> = emptyList(),
    val isRecording: Boolean = false,
    val aiAnalysis: String = "Loading analysis...",
    val recommendations: List<String> = emptyList(),
)

class MetricsViewModel : ViewModel() {
    private val _uiState = MutableStateFlow(MetricsUiState())
    val uiState: StateFlow<MetricsUiState> = _uiState

    init {
        loadMetrics()
    }

    private fun loadMetrics() {
        viewModelScope.launch {
            // Simulate real-time metric updates
            val initialMetrics = EquipmentMetrics(
                temperature = 78.5f,
                pressure = 410.0f,
                humidity = 45.2f,
                airflow = 850.0f,
                voltage = 240.0f,
                amperage = 12.5f,
                efficiency = 89.5f,
            )

            val diagnostics = listOf(
                DiagnosticReading("Compressor", "Running", "RPM", "normal"),
                DiagnosticReading("Blower", "Speed 3", "Level", "normal"),
                DiagnosticReading("Coolant Level", "85%", "Fill %", "warning"),
                DiagnosticReading("Refrigerant", "R410A", "Type", "normal"),
                DiagnosticReading("Motor Bearing", "Good", "Condition", "normal"),
                DiagnosticReading("Capacitor", "45µF", "Capacity", "critical"),
            )

            val recommendations = listOf(
                "✅ Compressor: operating normally",
                "⚠️ Coolant level low: top off within 24h",
                "🚨 Capacitor: replace immediately - 45µF vs 50µF rated",
                "💡 Efficiency: can be improved by cleaning condenser coils",
            )

            _uiState.value = MetricsUiState(
                metrics = initialMetrics,
                diagnostics = diagnostics,
                aiAnalysis = "Unit operating at 89.5% efficiency. Compressor running normally but coolant is 15% below recommended level. Critical: capacitor failing - recommend replacement before next heating season.",
                recommendations = recommendations,
            )
        }
    }

    fun startRecording() {
        _uiState.value = _uiState.value.copy(isRecording = true)
    }

    fun stopRecording() {
        _uiState.value = _uiState.value.copy(isRecording = false)
    }

    fun updateMetric(temperature: Float? = null, pressure: Float? = null, humidity: Float? = null) {
        val current = _uiState.value.metrics
        _uiState.value = _uiState.value.copy(
            metrics = current.copy(
                temperature = temperature ?: current.temperature,
                pressure = pressure ?: current.pressure,
                humidity = humidity ?: current.humidity,
            )
        )
    }
}
