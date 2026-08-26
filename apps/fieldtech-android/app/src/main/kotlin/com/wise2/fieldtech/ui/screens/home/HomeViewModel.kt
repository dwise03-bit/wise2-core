package com.wise2.fieldtech.ui.screens.home

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.wise2.fieldtech.data.local.dao.PendingSyncDao
import com.wise2.fieldtech.data.prefs.UserPreferences
import com.wise2.fieldtech.data.repository.JobRepository
import com.wise2.fieldtech.domain.model.Job
import com.wise2.fieldtech.util.ConnectivityObserver
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import java.util.concurrent.atomic.AtomicBoolean

data class HomeUiState(
    val technicianName: String = "Technician",
    val jobs: List<Job> = emptyList(),
    val isOnline: Boolean = true,
    val pendingSyncCount: Int = 0,
    val isRefreshing: Boolean = false,
)

class HomeViewModel(
    private val jobRepository: JobRepository,
    private val userPreferences: UserPreferences,
    private val connectivityObserver: ConnectivityObserver,
    private val pendingSyncDao: PendingSyncDao,
) : ViewModel() {

    private val isRefreshing = MutableStateFlow(false)

    // Guard against duplicate refresh calls (debounce protection at ViewModel level)
    private val hasInitialized = AtomicBoolean(false)
    private var lastRefreshTime = 0L
    private val REFRESH_DEBOUNCE_MS = 1000L // Minimum 1s between refreshes

    val uiState: StateFlow<HomeUiState> = combine(
        userPreferences.technicianName,
        jobRepository.observeJobs(),
        connectivityObserver.isOnline,
        pendingSyncDao.observeCount(),
        isRefreshing,
    ) { name, jobs, online, pendingCount, refreshing ->
        HomeUiState(
            technicianName = name,
            jobs = jobs.sortedBy { it.appointmentAtEpochMillis },
            isOnline = online,
            pendingSyncCount = pendingCount,
            isRefreshing = refreshing,
        )
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), HomeUiState())

    init {
        // Only refresh once on initialization
        if (hasInitialized.compareAndSet(false, true)) {
            refresh()
        }
    }

    fun refresh() {
        val now = System.currentTimeMillis()
        // Prevent duplicate refreshes within debounce window
        if (now - lastRefreshTime < REFRESH_DEBOUNCE_MS) {
            return
        }
        lastRefreshTime = now

        viewModelScope.launch {
            if (!isRefreshing.value) {
                isRefreshing.value = true
                try {
                    jobRepository.refreshJobs()
                } finally {
                    isRefreshing.value = false
                }
            }
        }
    }
}
