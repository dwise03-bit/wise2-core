package com.wise2.fieldtech.ui.screens.settings

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.wise2.fieldtech.BuildConfig
import com.wise2.fieldtech.data.prefs.UserPreferences
import com.wise2.fieldtech.data.repository.AuthRepository
import com.wise2.fieldtech.data.repository.UpdateRepository
import com.wise2.fieldtech.domain.WiseResult
import com.wise2.fieldtech.domain.model.AppUpdateInfo
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

data class SettingsUiState(
    val technicianName: String = "",
    val demoModeEnabled: Boolean = true,
    val currentVersionName: String = BuildConfig.VERSION_NAME,
    val updateCheckState: UpdateCheckState = UpdateCheckState.Idle,
)

sealed class UpdateCheckState {
    data object Idle : UpdateCheckState()
    data object Checking : UpdateCheckState()
    data class UpToDate(val currentVersion: String) : UpdateCheckState()
    data class Available(val info: AppUpdateInfo) : UpdateCheckState()
    data class Failed(val message: String) : UpdateCheckState()
}

class SettingsViewModel(
    private val userPreferences: UserPreferences,
    private val authRepository: AuthRepository,
    private val updateRepository: UpdateRepository,
) : ViewModel() {

    private val updateState = MutableStateFlow<UpdateCheckState>(UpdateCheckState.Idle)

    val uiState: StateFlow<SettingsUiState> = kotlinx.coroutines.flow.combine(
        userPreferences.technicianName,
        userPreferences.demoModeEnabled,
        updateState,
    ) { name, demoMode, update ->
        SettingsUiState(technicianName = name, demoModeEnabled = demoMode, updateCheckState = update)
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), SettingsUiState())

    fun setDemoMode(enabled: Boolean) {
        viewModelScope.launch { userPreferences.setDemoMode(enabled) }
    }

    fun setTechnicianName(name: String) {
        viewModelScope.launch { userPreferences.setTechnicianName(name) }
    }

    fun checkForUpdate() {
        viewModelScope.launch {
            updateState.value = UpdateCheckState.Checking
            when (val result = updateRepository.checkForUpdate()) {
                is WiseResult.Success -> {
                    updateState.value = if (result.data.versionCode > BuildConfig.VERSION_CODE) {
                        UpdateCheckState.Available(result.data)
                    } else {
                        UpdateCheckState.UpToDate(BuildConfig.VERSION_NAME)
                    }
                }
                is WiseResult.Error -> updateState.value = UpdateCheckState.Failed(result.message)
                else -> Unit
            }
        }
    }

    fun logout() {
        viewModelScope.launch { authRepository.logout() }
    }
}
