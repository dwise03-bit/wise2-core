package com.wise2.quest.ui.screens.jobs

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.wise2.quest.data.models.WorkOrder
import com.wise2.quest.data.repository.JobRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import timber.log.Timber
import javax.inject.Inject

/**
 * ViewModel for job list screen
 * Manages work orders from WISE² API and companion mode
 */
@HiltViewModel
class JobListViewModel @Inject constructor(
  private val jobRepository: JobRepository
) : ViewModel() {

  private val _jobs = MutableStateFlow<List<WorkOrder>>(emptyList())
  val jobs: StateFlow<List<WorkOrder>> = _jobs.asStateFlow()

  private val _uiState = MutableStateFlow<JobListUiState>(JobListUiState.Loading)
  val uiState: StateFlow<JobListUiState> = _uiState.asStateFlow()

  init {
    loadJobs()
  }

  /**
   * Load work orders from API
   */
  fun loadJobs() {
    viewModelScope.launch {
      try {
        _uiState.value = JobListUiState.Loading
        Timber.d("Loading work orders")

        val workOrders = jobRepository.getWorkOrders()
        _jobs.value = workOrders

        _uiState.value = if (workOrders.isEmpty()) {
          JobListUiState.Empty
        } else {
          JobListUiState.Success
        }

        Timber.i("Loaded ${workOrders.size} work orders")
      } catch (e: Exception) {
        Timber.e(e, "Failed to load work orders")
        _uiState.value = JobListUiState.Error(e.message ?: "Unknown error")
      }
    }
  }

  /**
   * Refresh work orders
   */
  fun refreshJobs() {
    loadJobs()
  }

  /**
   * Update job status
   */
  fun updateJobStatus(workOrderId: String, status: String) {
    viewModelScope.launch {
      try {
        jobRepository.updateWorkOrderStatus(workOrderId, status)
        loadJobs()
        Timber.i("Job status updated: $workOrderId -> $status")
      } catch (e: Exception) {
        Timber.e(e, "Failed to update job status")
      }
    }
  }
}

/**
 * Job list UI state
 */
sealed class JobListUiState {
  object Loading : JobListUiState()
  object Success : JobListUiState()
  object Empty : JobListUiState()
  data class Error(val message: String) : JobListUiState()
}
