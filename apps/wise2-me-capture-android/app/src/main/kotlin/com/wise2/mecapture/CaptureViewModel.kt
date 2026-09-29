package com.wise2.mecapture

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch

enum class Mode { FIELD, CLIENT, TEACH, THOUGHT }
data class Clip(val id: Long, val mode: Mode, val label: String, val createdAt: Long, val duration: Int, val status: String)

class CaptureViewModel(app: Application) : AndroidViewModel(app) {
    private val prefs = app.getSharedPreferences("clips", 0)
    var mode by mutableStateOf(Mode.FIELD)
    var label by mutableStateOf("")
    var recording by mutableStateOf(false)
    var elapsed by mutableStateOf(0)
    var clips by mutableStateOf(load())
    fun updateLabel(value: String) { label = value }
    fun startTimer() { if (!recording) { recording = true; elapsed = 0; viewModelScope.launch { while (isActive && recording) { delay(1000); elapsed++ } } } }
    fun stopTimer() { recording = false }
    fun finishRecording(path: String) { val duration = elapsed; stopTimer(); clips = listOf(Clip(System.currentTimeMillis(), mode, label, System.currentTimeMillis(), duration, "RAW")) + clips; persist() }
    fun toggleRecording() { if (recording) { recording = false; clips = listOf(Clip(System.currentTimeMillis(), mode, label, System.currentTimeMillis(), elapsed, "RAW")) + clips; persist(); elapsed = 0 } else { recording = true; elapsed = 0; viewModelScope.launch { while (isActive && recording) { delay(1000); elapsed++ } } } }
    fun approve(id: Long) { clips = clips.map { if (it.id == id) it.copy(status = "APPROVED") else it }; persist() }
    fun reject(id: Long) { clips = clips.map { if (it.id == id) it.copy(status = "REJECTED") else it }; persist() }
    private fun persist() { prefs.edit().putString("data", clips.joinToString("|") { listOf(it.id, it.mode.name, it.label.replace("|", " "), it.createdAt, it.duration, it.status).joinToString("~") }).apply() }
    private fun load() = prefs.getString("data", "").orEmpty().split("|").filter { it.isNotBlank() }.mapNotNull { p -> p.split("~").takeIf { it.size == 6 }?.let { Clip(it[0].toLong(), Mode.valueOf(it[1]), it[2], it[3].toLong(), it[4].toInt(), it[5]) } }
}
