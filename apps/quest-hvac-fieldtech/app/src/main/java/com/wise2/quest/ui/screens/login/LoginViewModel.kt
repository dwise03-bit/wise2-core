package com.wise2.quest.ui.screens.login

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.wise2.quest.auth.TokenStore
import com.wise2.quest.network.CompanionModeClient
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import timber.log.Timber
import javax.inject.Inject

/**
 * ViewModel for login screen
 * Handles Google OAuth and WISE² JWT authentication
 */
@HiltViewModel
class LoginViewModel @Inject constructor(
  private val tokenStore: TokenStore,
  private val companionModeClient: CompanionModeClient
) : ViewModel() {

  private val _uiState = MutableStateFlow<LoginUiState>(LoginUiState.Idle)
  val uiState: StateFlow<LoginUiState> = _uiState.asStateFlow()

  /**
   * Handle Google OAuth token and exchange for WISE² JWT
   */
  fun handleGoogleAuthToken(googleIdToken: String) {
    viewModelScope.launch {
      try {
        _uiState.value = LoginUiState.Loading

        Timber.d("Exchanging Google token for WISE² JWT")

        // In real implementation, exchange Google token for WISE² JWT via API
        // For now, store the token and proceed
        tokenStore.saveGoogleToken(googleIdToken)
        tokenStore.saveJwtToken(googleIdToken) // Placeholder - should come from backend

        // Connect to companion mode WebSocket
        companionModeClient.connect(googleIdToken)

        Timber.i("Google authentication successful")
        _uiState.value = LoginUiState.Success
      } catch (e: Exception) {
        Timber.e(e, "Google authentication failed")
        _uiState.value = LoginUiState.Error(e.message ?: "Unknown error")
      }
    }
  }

  /**
   * Handle WISE² direct authentication
   */
  fun handleWise2Login(email: String, password: String) {
    viewModelScope.launch {
      try {
        _uiState.value = LoginUiState.Loading

        Timber.d("Authenticating with WISE²: $email")

        // In real implementation, call WISE² auth API
        // For now, just validate and store
        if (email.isEmpty() || password.isEmpty()) {
          throw IllegalArgumentException("Email and password required")
        }

        // Placeholder - should come from backend
        val jwtToken = "jwt-placeholder-$email"
        tokenStore.saveJwtToken(jwtToken)

        // Connect to companion mode WebSocket
        companionModeClient.connect(jwtToken)

        Timber.i("WISE² authentication successful")
        _uiState.value = LoginUiState.Success
      } catch (e: Exception) {
        Timber.e(e, "WISE² authentication failed")
        _uiState.value = LoginUiState.Error(e.message ?: "Unknown error")
      }
    }
  }

  /**
   * Check if user is already authenticated
   */
  fun checkExistingAuth() {
    viewModelScope.launch {
      val token = tokenStore.getJwtToken()
      if (token != null) {
        Timber.i("Found existing JWT token, attempting automatic login")
        try {
          companionModeClient.connect(token)
          _uiState.value = LoginUiState.Success
        } catch (e: Exception) {
          Timber.w(e, "Failed to reconnect with existing token")
          _uiState.value = LoginUiState.Idle
        }
      }
    }
  }

  /**
   * Reset state
   */
  fun resetState() {
    _uiState.value = LoginUiState.Idle
  }
}

/**
 * Login UI state
 */
sealed class LoginUiState {
  object Idle : LoginUiState()
  object Loading : LoginUiState()
  object Success : LoginUiState()
  data class Error(val message: String) : LoginUiState()
}
