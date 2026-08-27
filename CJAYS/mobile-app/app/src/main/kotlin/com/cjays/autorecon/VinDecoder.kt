package com.cjays.autorecon

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import okhttp3.OkHttpClient
import okhttp3.Request
import java.net.URLEncoder

@Serializable
data class DecodedVehicle(
    val Make: String = "",
    val Model: String = "",
    val ModelYear: String = "",
    val Trim: String = "",
    val BodyClass: String = "",
    val ErrorCode: String = "",
    val ErrorText: String = ""
)

@Serializable private data class VinResponse(val Results: List<DecodedVehicle> = emptyList())

object VinDecoder {
    private val client = OkHttpClient()
    private val json = Json { ignoreUnknownKeys = true }

    suspend fun decode(vin: String): Result<DecodedVehicle> = withContext(Dispatchers.IO) {
        runCatching {
            val safeVin = URLEncoder.encode(vin, Charsets.UTF_8.name())
            val request = Request.Builder()
                .url("https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValuesExtended/$safeVin?format=json")
                .header("User-Agent", "CJAYS-Auto-Recon/1.0")
                .build()
            client.newCall(request).execute().use { response ->
                check(response.isSuccessful) { "VIN provider unavailable (${response.code})" }
                val decoded = json.decodeFromString<VinResponse>(response.body?.string().orEmpty()).Results.firstOrNull()
                    ?: error("VIN provider returned no result")
                if (decoded.Make.isBlank() && decoded.Model.isBlank()) error(decoded.ErrorText.ifBlank { "VIN could not be decoded" })
                decoded
            }
        }
    }
}
