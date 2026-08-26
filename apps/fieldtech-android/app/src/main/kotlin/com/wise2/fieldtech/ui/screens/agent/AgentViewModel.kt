package com.wise2.fieldtech.ui.screens.agent

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import java.util.UUID

data class AgentUiState(
  val messages: List<ChatMessage> = emptyList(),
  val isLoading: Boolean = false,
  val error: String? = null,
  val isConnected: Boolean = false,
)

class AgentViewModel : ViewModel() {
  private val _uiState = MutableStateFlow(AgentUiState())
  val uiState: StateFlow<AgentUiState> = _uiState

  private val sessionId = UUID.randomUUID().toString()
  private var websocket: Any? = null // WebSocket connection

  init {
    connectToAgent()
  }

  private fun connectToAgent() {
    viewModelScope.launch {
      try {
        // Connect to agent WebSocket
        // ws://wise2.net:3016/api/v1/agent/voice?sessionId=$sessionId

        _uiState.value = _uiState.value.copy(isConnected = true)

        // Send initialization message
        sendInit()
      } catch (error: Exception) {
        _uiState.value = _uiState.value.copy(
          error = "Failed to connect to agent",
          isConnected = false
        )
      }
    }
  }

  fun sendMessage(text: String) {
    viewModelScope.launch {
      try {
        // Add user message to UI
        val userMessage = ChatMessage(
          id = UUID.randomUUID().toString(),
          role = "user",
          content = text,
          timestamp = System.currentTimeMillis(),
        )

        _uiState.value = _uiState.value.copy(
          messages = _uiState.value.messages + userMessage,
          isLoading = true,
        )

        // Send message via WebSocket or REST API
        val response = sendTextViaApi(text)

        // Add agent response
        val agentMessage = ChatMessage(
          id = UUID.randomUUID().toString(),
          role = "assistant",
          content = response.text,
          timestamp = System.currentTimeMillis(),
          audioUrl = response.audioUrl,
        )

        _uiState.value = _uiState.value.copy(
          messages = _uiState.value.messages + agentMessage,
          isLoading = false,
        )
      } catch (error: Exception) {
        _uiState.value = _uiState.value.copy(
          error = "Failed to send message: ${error.message}",
          isLoading = false,
        )
      }
    }
  }

  fun startVoiceCapture() {
    viewModelScope.launch {
      try {
        // Start recording audio from microphone
        // TODO: Implement voice capture
      } catch (error: Exception) {
        _uiState.value = _uiState.value.copy(
          error = "Failed to start recording: ${error.message}",
        )
      }
    }
  }

  fun stopVoiceCapture() {
    viewModelScope.launch {
      try {
        // Stop recording and send audio to agent
        // TODO: Implement voice stop and send
      } catch (error: Exception) {
        _uiState.value = _uiState.value.copy(
          error = "Failed to stop recording: ${error.message}",
        )
      }
    }
  }

  private suspend fun sendTextViaApi(text: String): ApiResponse {
    // Call API endpoint: POST /api/v1/agent/text
    // For now, return mock response
    return ApiResponse(
      text = "I understand. Let me analyze the Fieldpiece readings...\n\n**Problem:** Low refrigerant charge detected\n**Root Cause:** Possible leak in outdoor coil\n**Solution:** Pressure test recommended\n**Next Steps:** 1. Locate leak, 2. Remove refrigerant, 3. Repair coil, 4. Recharge system",
      audioUrl = null,
    )
  }

  private fun sendInit() {
    // Send initialization message with job/technician context
    // This sets up the agent session with current job details
  }

  override fun onCleared() {
    super.onCleared()
    // Close WebSocket connection
  }

  data class ApiResponse(
    val text: String,
    val audioUrl: String?,
  )
}
