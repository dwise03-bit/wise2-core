package com.wise2.mecapture.studio
import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import kotlinx.coroutines.launch

class StudioViewModel(app: Application) : AndroidViewModel(app) {
    private val prefs = app.getSharedPreferences("reaper_bridge", 0)
    private val client: ReaperStudioClient = prefs.getString("url", null)?.let { url -> prefs.getString("token", null)?.let { token -> HttpReaperStudioClient(url, token) } } ?: OfflineStudioClient()
    var status by mutableStateOf(StudioStatus(false, false, "Loading…", Transport.STOPPED, false, 0, 0.0, 0, 0)); private set
    var tracks by mutableStateOf(emptyList<StudioTrack>()); private set
    var lastRender by mutableStateOf<String?>(null); private set
    init { refresh() }
    fun refresh() = viewModelScope.launch { status = client.status(); tracks = client.tracks() }
    fun transport(action: String) = viewModelScope.launch { status = client.transport(action) }
    fun marker() = viewModelScope.launch { status = client.marker("Mobile marker") }
    fun toggle(id: Int, action: String) = viewModelScope.launch { tracks = client.toggleTrack(id, action) }
    fun render() = viewModelScope.launch { lastRender = client.render("mp3", "preview") }
}
