package com.wise2.fieldtech.ui.screens.equipment

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.wise2.fieldtech.data.repository.EquipmentRepository
import com.wise2.fieldtech.domain.model.Equipment
import com.wise2.fieldtech.domain.model.ServiceHistoryEntry
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

data class EquipmentUiState(val equipment: Equipment? = null, val history: List<ServiceHistoryEntry> = emptyList())

class EquipmentViewModel(
    private val equipmentRepository: EquipmentRepository,
    private val equipmentId: String,
) : ViewModel() {

    val uiState: StateFlow<EquipmentUiState> = combine(
        equipmentRepository.observe(equipmentId),
        equipmentRepository.observeHistory(equipmentId),
    ) { equipment, history -> EquipmentUiState(equipment, history) }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), EquipmentUiState())

    init {
        viewModelScope.launch { equipmentRepository.refresh(equipmentId) }
    }
}
