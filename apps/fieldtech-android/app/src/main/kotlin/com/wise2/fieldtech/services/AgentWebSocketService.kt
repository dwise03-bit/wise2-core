package com.wise2.fieldtech.services

import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow

data class AgentMessage(
  val id: String,
  val role: String, // "user" or "assistant"
  val content: String,
  val timestamp: Long = System.currentTimeMillis(),
  val audioUrl: String? = null,
)

class AgentWebSocketService {
  private val agentUrl = "wss://wise2.net/api/v1/agent/voice"

  private val _messages = MutableStateFlow<List<AgentMessage>>(emptyList())
  val messages: StateFlow<List<AgentMessage>> = _messages

  private val _isConnected = MutableStateFlow(false)
  val isConnected: StateFlow<Boolean> = _isConnected

  private val _error = MutableStateFlow<String?>(null)
  val error: StateFlow<String?> = _error

  fun connect(sessionId: String) {
    _isConnected.value = true
    // TODO: Implement actual WebSocket connection
    // val request = Request.Builder().url("$agentUrl?sessionId=$sessionId").build()
    // val webSocket = OkHttpClient().newWebSocket(request, WebSocketListener())
  }

  fun sendMessage(text: String) {
    val userMsg = AgentMessage(
      id = java.util.UUID.randomUUID().toString(),
      role = "user",
      content = text,
    )
    _messages.value = _messages.value + userMsg

    // TODO: Send via WebSocket
    // Simulate agent response
    simulateAgentResponse(text)
  }

  private fun simulateAgentResponse(userInput: String) {
    val response = when {
      userInput.contains("pressure", ignoreCase = true) ->
        "I detect a pressure reading of 400 PSI. This is within normal range for the system."
      userInput.contains("temperature", ignoreCase = true) ->
        "Current temperature is 72°F. The compressor is operating efficiently."
      else ->
        "I'm analyzing the system data. Can you tell me more about what symptoms you're observing?"
    }

    val agentMsg = AgentMessage(
      id = java.util.UUID.randomUUID().toString(),
      role = "assistant",
      content = response,
    )
    _messages.value = _messages.value + agentMsg
  }

  fun disconnect() {
    _isConnected.value = false
  }
}
