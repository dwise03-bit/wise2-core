package com.cjays.autorecon

import android.content.Context
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.Serializable
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import java.util.UUID

@Serializable private data class LoginRequest(val email: String, val password: String)
@Serializable data class LoginResponse(val accessToken: String, val refreshToken: String? = null)
@Serializable private data class RefreshRequest(val refreshToken: String)
@Serializable private data class RefreshResponse(val accessToken: String)
@Serializable private data class SyncRequest(val requestId: String, val customers: List<Customer>, val vehicles: List<Vehicle>, val jobs: List<Job>)
@Serializable data class AiSuggestion(val task:String,val suggestion:String,val model:String="",val requiresHumanApproval:Boolean=true)
@Serializable data class GoogleConnection(val connected:Boolean,val accountName:String?=null,val scopes:List<String> = emptyList())
@Serializable data class GoogleAuthorize(val authUrl:String)

data class Wise2Session(val accessToken: String, val refreshToken: String? = null)

class SecureSessionStore(context: Context) {
    private val masterKey = MasterKey.Builder(context).setKeyScheme(MasterKey.KeyScheme.AES256_GCM).build()
    private val prefs = EncryptedSharedPreferences.create(context, "cjays_wise2_session", masterKey, EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV, EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM)
    fun load(): Wise2Session? = prefs.getString("access", null)?.let { Wise2Session(it, prefs.getString("refresh", null)) }
    fun save(value: Wise2Session) { prefs.edit().putString("access", value.accessToken).putString("refresh", value.refreshToken).apply() }
    fun clear() { prefs.edit().clear().apply() }
}

object Wise2Client {
    private val client = OkHttpClient()
    private val json = Json { ignoreUnknownKeys = true; encodeDefaults = true }
    private val mediaType = "application/json; charset=utf-8".toMediaType()
    private fun url(path: String) = BuildConfig.API_BASE_URL.trimEnd('/') + "/" + path.trimStart('/')

    suspend fun login(email: String, password: String): Result<Wise2Session> = withContext(Dispatchers.IO) { runCatching {
        val request = Request.Builder().url(url("v1/auth/login")).post(json.encodeToString(LoginRequest(email, password)).toRequestBody(mediaType)).build()
        client.newCall(request).execute().use { response ->
            if (!response.isSuccessful) error(if(response.code==401) "Email or password is incorrect" else "Wise² login failed (${response.code})")
            json.decodeFromString<LoginResponse>(response.body?.string().orEmpty()).let { Wise2Session(it.accessToken, it.refreshToken) }
        }
    } }

    private fun authenticated(token:String,path:String,method:String="GET",body:String?=null):String{val builder=Request.Builder().url(url(path)).header("Authorization","Bearer $token");if(method=="POST")builder.post((body?:"{}").toRequestBody(mediaType));return client.newCall(builder.build()).execute().use{if(!it.isSuccessful)error("Wise² request failed (${it.code})");it.body?.string().orEmpty()}}
    suspend fun googleStatus(token:String):Result<GoogleConnection> = withContext(Dispatchers.IO){runCatching{json.decodeFromString<GoogleConnection>(authenticated(token,"v1/cjays/google/status"))}}
    suspend fun googleAuthorize(token:String):Result<String> = withContext(Dispatchers.IO){runCatching{json.decodeFromString<GoogleAuthorize>(authenticated(token,"v1/cjays/google/authorize")).authUrl}}
    suspend fun aiAssist(token:String,jobId:String,task:String):Result<AiSuggestion> = withContext(Dispatchers.IO){runCatching{json.decodeFromString<AiSuggestion>(authenticated(token,"v1/cjays/ai/jobs/$jobId/assist","POST","{\"task\":${json.encodeToString(task)}}"))}}
    suspend fun saveToDrive(token:String,name:String,content:String):Result<Unit> = withContext(Dispatchers.IO){runCatching{val payload="{\"approved\":true,\"name\":${json.encodeToString(name)},\"content\":${json.encodeToString(content)}}";authenticated(token,"v1/cjays/google/drive","POST",payload);Unit}}

    suspend fun sync(session: Wise2Session, data: AppData): Result<Pair<AppData, Wise2Session>> = withContext(Dispatchers.IO) { runCatching {
        val body = SyncRequest(UUID.randomUUID().toString(), data.customers, data.vehicles, data.jobs)
        fun send(token:String): Pair<Int,String> { val request = Request.Builder().url(url("v1/cjays/sync")).header("Authorization", "Bearer $token").post(json.encodeToString(body).toRequestBody(mediaType)).build();return client.newCall(request).execute().use{it.code to (it.body?.string().orEmpty())} }
        var active=session
        var response=send(active.accessToken)
        if(response.first==401&&active.refreshToken!=null){
            val request=Request.Builder().url(url("v1/auth/refresh")).post(json.encodeToString(RefreshRequest(active.refreshToken)).toRequestBody(mediaType)).build()
            val refreshed=client.newCall(request).execute().use{r->if(!r.isSuccessful)error("SESSION_EXPIRED");json.decodeFromString<RefreshResponse>(r.body?.string().orEmpty())}
            active=active.copy(accessToken=refreshed.accessToken);response=send(active.accessToken)
        }
        if(response.first !in 200..299)error(if(response.first==401)"SESSION_EXPIRED" else "CJAYS sync failed (${response.first})")
        json.decodeFromString<AppData>(response.second) to active
    } }
}
