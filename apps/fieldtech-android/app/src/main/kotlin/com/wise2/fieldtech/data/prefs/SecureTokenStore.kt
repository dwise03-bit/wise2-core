package com.wise2.fieldtech.data.prefs

import android.content.Context
import android.content.SharedPreferences
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
import com.wise2.fieldtech.domain.model.User
import kotlinx.serialization.json.Json

/**
 * Auth tokens live only in a Keystore-backed EncryptedSharedPreferences file, per spec §18
 * ("use secure Android storage for authentication secrets/tokens"; "never log ... full
 * authentication tokens"). No token value is ever logged from this class.
 */
class SecureTokenStore(context: Context) {

    private val masterKey = MasterKey.Builder(context)
        .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
        .build()

    private val prefs: SharedPreferences = EncryptedSharedPreferences.create(
        context,
        "wise2_secure_prefs",
        masterKey,
        EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
        EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM,
    )

    fun saveTokens(accessToken: String, refreshToken: String?) {
        prefs.edit()
            .putString(KEY_ACCESS_TOKEN, accessToken)
            .apply { if (refreshToken != null) putString(KEY_REFRESH_TOKEN, refreshToken) }
            .apply()
    }

    fun getAccessToken(): String? = prefs.getString(KEY_ACCESS_TOKEN, null)
    fun getRefreshToken(): String? = prefs.getString(KEY_REFRESH_TOKEN, null)

    fun clear() {
        prefs.edit().clear().apply()
    }

    fun hasSession(): Boolean = getAccessToken() != null

    fun saveUser(user: User) {
        prefs.edit().putString(KEY_USER, Json.encodeToString(User.serializer(), user)).apply()
    }

    fun getUser(): User? = prefs.getString(KEY_USER, null)?.let {
        runCatching { Json.decodeFromString(User.serializer(), it) }.getOrNull()
    }

    private companion object {
        const val KEY_ACCESS_TOKEN = "access_token"
        const val KEY_REFRESH_TOKEN = "refresh_token"
        const val KEY_USER = "user_profile"
    }
}
