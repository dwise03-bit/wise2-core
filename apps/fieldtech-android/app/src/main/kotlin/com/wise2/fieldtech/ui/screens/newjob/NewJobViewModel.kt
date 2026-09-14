package com.wise2.fieldtech.ui.screens.newjob

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.wise2.fieldtech.data.repository.JobRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class NewJobUiState(
    val customerName: String = "",
    val customerPhone: String = "",
    val address: String = "",
    val complaint: String = "",
    val appointmentAtEpochMillis: Long = System.currentTimeMillis(),
    val isSaving: Boolean = false,
    val errorMessage: String? = null,
    val createdJobId: String? = null,
)

class NewJobViewModel(private val jobRepository: JobRepository) : ViewModel() {
    private val _uiState = MutableStateFlow(NewJobUiState())
    val uiState: StateFlow<NewJobUiState> = _uiState.asStateFlow()

    fun setCustomerName(value: String) = update { copy(customerName = value, errorMessage = null) }
    fun setCustomerPhone(value: String) = update { copy(customerPhone = value) }
    fun setAddress(value: String) = update { copy(address = value, errorMessage = null) }
    fun setComplaint(value: String) = update { copy(complaint = value) }
    fun setAppointmentAt(value: Long) = update { copy(appointmentAtEpochMillis = value) }

    fun createJob() {
        val current = _uiState.value
        if (current.customerName.isBlank()) {
            _uiState.value = current.copy(errorMessage = "Customer name is required")
            return
        }
        if (current.address.isBlank()) {
            _uiState.value = current.copy(errorMessage = "Service address is required")
            return
        }
        if (current.isSaving) return

        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isSaving = true, errorMessage = null)
            runCatching {
                jobRepository.createJob(
                    customerName = current.customerName.trim(),
                    customerPhone = current.customerPhone.trim(),
                    address = current.address.trim(),
                    appointmentAtEpochMillis = current.appointmentAtEpochMillis,
                    complaint = current.complaint.trim(),
                )
            }.onSuccess { job ->
                _uiState.value = _uiState.value.copy(isSaving = false, createdJobId = job.id)
            }.onFailure { error ->
                _uiState.value = _uiState.value.copy(isSaving = false, errorMessage = error.message ?: "Unable to create job")
            }
        }
    }

    private inline fun update(block: NewJobUiState.() -> NewJobUiState) {
        _uiState.value = _uiState.value.block()
    }
}
