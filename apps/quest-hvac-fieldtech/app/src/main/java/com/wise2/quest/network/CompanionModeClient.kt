package com.wise2.quest.network

import android.content.Context
import com.google.gson.Gson
import com.wise2.quest.auth.TokenStore
import com.wise2.quest.data.models.MeasurementReading
import com.wise2.quest.data.models.VoiceNote
import com.wise2.quest.data.models.WorkOrder
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.receiveAsFlow
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.WebSocket
import okhttp3.WebSocketListener
import timber.log.Timber
import java.util.concurrent.TimeUnit

/**
 * WebSocket event types
 */
sealed class CompanionEvent {
  data class WorkOrderAssigned(val workOrder: WorkOrder) : CompanionEvent()
  data class MeasurementUpdate(val reading: MeasurementReading) : CompanionEvent()
  data class VoiceNoteReceived(val note: VoiceNote) : CompanionEvent()
  data class Connected(val sessionId: String) : CompanionEvent()
  data class Disconnected(val reason: String) : CompanionEvent()
  data class Error(val message: String, val throwable: Throwable?) : CompanionEvent()
}

/**
 * WebSocket companion mode client for real-time sync between Quest and web
 */
class CompanionModeClient(
  private val context: Context,
  private val tokenStore: TokenStore,
  private val baseWssUrl: String = "wss://api.wise2.net/companion"
) {
  private var webSocket: WebSocket? = null
  private val eventChannel = Channel<CompanionEvent>(capacity = Channel.UNLIMITED)
  private val gson = Gson()
  private val httpClient = OkHttpClient.Builder()
    .connectTimeout(30, TimeUnit.SECONDS)
    .readTimeout(30, TimeUnit.SECONDS)
    .writeTimeout(30, TimeUnit.SECONDS)
    .build()

  val events: Flow<CompanionEvent> = eventChannel.receiveAsFlow()

  suspend fun connect(): Result<String> {
    return try {
      val token = tokenStore.getAccessToken() ?: run {
        return Result.failure(Exception("No valid token"))
      }

      val wssUrl = "$baseWssUrl?token=$token"
      val request = Request.Builder().url(wssUrl).build()

      val listener = QuestWebSocketListener(this)
      webSocket = httpClient.newWebSocket(request, listener)

      Result.success("Connected to companion mode")
    } catch (e: Exception) {
      Timber.e(e, "Failed to connect to companion mode")
      Result.failure(e)
    }
  }

  fun disconnect() {
    webSocket?.close(1000, "Client disconnect")
    webSocket = null
  }

  fun sendMeasurement(reading: MeasurementReading) {
    if (webSocket == null) {
      Timber.w("WebSocket not connected, cannot send measurement")
      return
    }

    val message = mapOf(
      "type" to "MEASUREMENT_READING",
      "sessionId" to reading.sessionId,
      "workOrderId" to reading.workOrderId,
      "payload" to reading,
      "timestamp" to System.currentTimeMillis()
    )

    val json = gson.toJson(message)
    webSocket?.send(json)
    Timber.d("Sent measurement: $reading")
  }

  fun sendVoiceNote(note: VoiceNote) {
    if (webSocket == null) {
      Timber.w("WebSocket not connected, cannot send voice note")
      return
    }

    val message = mapOf(
      "type" to "VOICE_NOTE",
      "sessionId" to note.sessionId,
      "workOrderId" to note.workOrderId,
      "payload" to note,
      "timestamp" to System.currentTimeMillis()
    )

    val json = gson.toJson(message)
    webSocket?.send(json)
    Timber.d("Sent voice note: ${note.id}")
  }

  fun startWorkSession(workOrderId: String, technicianId: String) {
    if (webSocket == null) {
      Timber.w("WebSocket not connected, cannot start session")
      return
    }

    val message = mapOf(
      "type" to "WORK_SESSION_START",
      "workOrderId" to workOrderId,
      "technicianId" to technicianId,
      "timestamp" to System.currentTimeMillis()
    )

    val json = gson.toJson(message)
    webSocket?.send(json)
    Timber.d("Work session started: $workOrderId")
  }

  fun endWorkSession(workOrderId: String, sessionId: String, notes: String = "") {
    if (webSocket == null) {
      Timber.w("WebSocket not connected, cannot end session")
      return
    }

    val message = mapOf(
      "type" to "WORK_SESSION_END",
      "workOrderId" to workOrderId,
      "sessionId" to sessionId,
      "notes" to notes,
      "timestamp" to System.currentTimeMillis()
    )

    val json = gson.toJson(message)
    webSocket?.send(json)
    Timber.d("Work session ended: $sessionId")
  }

  fun isConnected(): Boolean = webSocket != null

  // Internal event handling
  internal suspend fun emitEvent(event: CompanionEvent) {
    eventChannel.send(event)
  }

  private inner class QuestWebSocketListener(
    private val client: CompanionModeClient
  ) : WebSocketListener() {
    override fun onOpen(webSocket: WebSocket, response: okhttp3.Response) {
      Timber.d("WebSocket opened")
      // Extract session ID from response headers if available
      val sessionId = response.header("X-Session-Id") ?: "unknown"
      kotlinx.coroutines.runBlocking {
        client.emitEvent(CompanionEvent.Connected(sessionId))
      }
    }

    override fun onMessage(webSocket: WebSocket, text: String) {
      try {
        val json = org.json.JSONObject(text)
        val type = json.getString("type")
        val payload = json.getJSONObject("payload")

        when (type) {
          "WORK_ORDER_ASSIGNED" -> {
            val workOrder = gson.fromJson(payload.toString(), WorkOrder::class.java)
            kotlinx.coroutines.runBlocking {
              client.emitEvent(CompanionEvent.WorkOrderAssigned(workOrder))
            }
          }

          "MEASUREMENT_UPDATE" -> {
            val reading = gson.fromJson(payload.toString(), MeasurementReading::class.java)
            kotlinx.coroutines.runBlocking {
              client.emitEvent(CompanionEvent.MeasurementUpdate(reading))
            }
          }

          "VOICE_NOTE" -> {
            val note = gson.fromJson(payload.toString(), VoiceNote::class.java)
            kotlinx.coroutines.runBlocking {
              client.emitEvent(CompanionEvent.VoiceNoteReceived(note))
            }
          }

          else -> Timber.w("Unknown message type: $type")
        }
      } catch (e: Exception) {
        Timber.e(e, "Failed to parse WebSocket message")
        kotlinx.coroutines.runBlocking {
          client.emitEvent(CompanionEvent.Error("Parse error", e))
        }
      }
    }

    override fun onFailure(webSocket: WebSocket, t: Throwable, response: okhttp3.Response?) {
      Timber.e(t, "WebSocket failure")
      kotlinx.coroutines.runBlocking {
        client.emitEvent(CompanionEvent.Error("WebSocket failure", t))
      }
    }

    override fun onClosed(webSocket: WebSocket, code: Int, reason: String) {
      Timber.d("WebSocket closed: $code $reason")
      kotlinx.coroutines.runBlocking {
        client.emitEvent(CompanionEvent.Disconnected("Closed: $code $reason"))
      }
    }
  }
}
