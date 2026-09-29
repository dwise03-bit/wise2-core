package com.wise2.mecapture.studio

import kotlinx.coroutines.delay
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL

enum class Transport { PLAYING, PAUSED, STOPPED }
data class StudioStatus(val bridgeOnline: Boolean, val reaperOnline: Boolean, val project: String, val transport: Transport, val recording: Boolean, val tempo: Int, val positionSeconds: Double, val tracks: Int, val markers: Int)
data class StudioTrack(val id: Int, val name: String, val muted: Boolean = false, val solo: Boolean = false, val armed: Boolean = false)

interface ReaperStudioClient { suspend fun status(): StudioStatus; suspend fun transport(action: String): StudioStatus; suspend fun tracks(): List<StudioTrack>; suspend fun marker(name: String): StudioStatus; suspend fun toggleTrack(id: Int, action: String): List<StudioTrack>; suspend fun render(format: String, kind: String): String }

class HttpReaperStudioClient(private val baseUrl: String, private val token: String) : ReaperStudioClient {
    private fun request(path: String, method: String = "GET", body: String? = null): String { val connection = URL(baseUrl.trimEnd('/') + path).openConnection() as HttpURLConnection; connection.requestMethod = method; connection.setRequestProperty("Authorization", "Bearer $token"); connection.setRequestProperty("Content-Type", "application/json"); connection.connectTimeout = 5000; connection.readTimeout = 5000; if (body != null) { connection.doOutput = true; connection.outputStream.use { it.write(body.toByteArray()) } }; if (connection.responseCode !in 200..299) error("REAPER bridge returned ${connection.responseCode}"); return connection.inputStream.bufferedReader().use { it.readText() } }
    private fun status(json: String): StudioStatus { val o = JSONObject(json); return StudioStatus(o.optString("bridge") == "online", o.optString("reaper") == "online", o.optJSONObject("project")?.optString("name") ?: "No project", Transport.valueOf(o.optString("transport", "stopped").uppercase()), o.optBoolean("recording"), o.optInt("tempo"), o.optDouble("positionSeconds"), o.optInt("trackCount"), o.optInt("markerCount")) }
    override suspend fun status() = status(request("/reaper/status"))
    override suspend fun transport(action: String) = status(request("/reaper/$action", "POST"))
    override suspend fun tracks(): List<StudioTrack> { val array = org.json.JSONArray(request("/reaper/tracks")); return (0 until array.length()).map { val o = array.getJSONObject(it); StudioTrack(o.getInt("id"), o.getString("name"), o.optBoolean("muted"), o.optBoolean("solo"), o.optBoolean("armed")) } }
    override suspend fun marker(name: String): StudioStatus { request("/reaper/marker", "POST", JSONObject().put("name", name).toString()); return status() }
    override suspend fun toggleTrack(id: Int, action: String): List<StudioTrack> { request("/reaper/tracks/$id/$action", "POST"); return tracks() }
    override suspend fun render(format: String, kind: String): String = JSONObject(request("/reaper/render", "POST", JSONObject().put("format", format).put("kind", kind).toString())).optString("filename", "Render complete")
}

/** HTTP implementation belongs behind the WISE² bridge; credentials are supplied at runtime, never bundled. */
class OfflineStudioClient : ReaperStudioClient {
    private var current = StudioStatus(true, true, "Offline session", Transport.STOPPED, false, 120, 0.0, 2, 0)
    private var currentTracks = listOf(StudioTrack(1, "Vocals"), StudioTrack(2, "Instrumental"))
    override suspend fun status() = current
    override suspend fun transport(action: String): StudioStatus { current = current.copy(transport = when(action) { "play", "record" -> Transport.PLAYING; "pause" -> Transport.PAUSED; else -> Transport.STOPPED }, recording = action == "record"); return current }
    override suspend fun tracks() = currentTracks
    override suspend fun marker(name: String): StudioStatus { current = current.copy(markers = current.markers + 1); return current }
    override suspend fun toggleTrack(id: Int, action: String): List<StudioTrack> { currentTracks = currentTracks.map { if (it.id != id) it else when(action) { "mute" -> it.copy(muted = !it.muted); "solo" -> it.copy(solo = !it.solo); else -> it.copy(armed = !it.armed) } }; return currentTracks }
    override suspend fun render(format: String, kind: String) = "${current.project.replace(' ', '_')}_${kind}.${format}"
}
