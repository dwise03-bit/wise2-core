package com.wise2.fieldtech.ui.screens.readings

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.wise2.fieldtech.bluetooth.ToolManager
import com.wise2.fieldtech.bluetooth.model.ToolConnectionState
import com.wise2.fieldtech.bluetooth.model.ToolDevice
import com.wise2.fieldtech.data.repository.ReadingRepository
import com.wise2.fieldtech.domain.calc.CalculationResult
import com.wise2.fieldtech.domain.calc.HvacCalculations
import com.wise2.fieldtech.domain.model.ReadingSnapshot
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class LiveReadingsUiState(
    val connectionState: ToolConnectionState = ToolConnectionState.DISCONNECTED,
    val discoveredDevices: List<ToolDevice> = emptyList(),
    val latestReading: ReadingSnapshot? = null,
    val calculations: List<CalculationResult> = emptyList(),
    val brandName: String = "",
    val pressureHistory: List<Float> = emptyList(),
    val tempHistory: List<Float> = emptyList(),
    val voltageHistory: List<Float> = emptyList(),
)

class LiveReadingsViewModel(
    private val toolManager: ToolManager,
    private val readingRepository: ReadingRepository,
    private val jobId: String,
) : ViewModel() {

    private val _uiState = MutableStateFlow(LiveReadingsUiState(brandName = toolManager.brandName))
    val uiState: StateFlow<LiveReadingsUiState> = _uiState.asStateFlow()

    private var streamJob: Job? = null
    private var scanJob: Job? = null

    init {
        viewModelScope.launch {
            toolManager.connectionState().collect { state ->
                _uiState.value = _uiState.value.copy(connectionState = state)
            }
        }
    }

    fun scan() {
        scanJob?.cancel()
        scanJob = viewModelScope.launch {
            toolManager.scan().collect { device ->
                _uiState.value = _uiState.value.copy(discoveredDevices = _uiState.value.discoveredDevices + device)
            }
        }
    }

    fun connect(device: ToolDevice) {
        viewModelScope.launch {
            scanJob?.cancel()
            toolManager.connect(device)
            streamJob?.cancel()
            streamJob = viewModelScope.launch {
                toolManager.readingsForJob(jobId).collect { reading ->
                    val now = System.currentTimeMillis()
                    val state = _uiState.value
                    val pressureHistory = (state.pressureHistory + listOfNotNull(reading.lowSidePsig)).takeLast(60).toList()
                    val tempHistory = (state.tempHistory + listOfNotNull(reading.suctionLineTempF)).takeLast(60).toList()
                    val voltageHistory = (state.voltageHistory + listOfNotNull(reading.voltageL1)).takeLast(60).toList()

                    _uiState.value = state.copy(
                        latestReading = reading,
                        calculations = HvacCalculations.allApplicable(reading, now),
                        pressureHistory = pressureHistory,
                        tempHistory = tempHistory,
                        voltageHistory = voltageHistory,
                    )
                }
            }
        }
    }

    fun disconnect() {
        streamJob?.cancel()
        scanJob?.cancel()
        viewModelScope.launch { toolManager.disconnect() }
    }

    fun saveCurrentReading() {
        val reading = _uiState.value.latestReading ?: return
        viewModelScope.launch { readingRepository.save(reading) }
    }

    override fun onCleared() {
        super.onCleared()
        streamJob?.cancel()
    }
}
