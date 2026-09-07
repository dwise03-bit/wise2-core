package com.wise2.quest.auth

import android.content.Context
import android.content.SharedPreferences
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
import com.google.gson.Gson
import com.google.gson.annotations.SerializedName
import timber.log.Timber
import java.time.Instant

/**
 * OAuth token response from backend (standard format)
 */
data class TokenResponse(
  @SerializedName("access_token")
  val accessToken: String,

  @SerializedName("refresh_token")
  val refreshToken: String,

  @SerializedName("expires_in")
  val expiresIn: Long, // seconds

  @SerializedName("token_type")
  val tokenType: String = "Bearer"
)

/**
 * Stored credential with expiry tracking
 */
data class StoredToken(
  val accessToken: String,
  val refreshToken: String,
  val expiresAt: Long, // epoch milliseconds
  val userId: String,
  val accountId: String
) {
  fun isExpired(gracePeriodSeconds: Long = 300): Boolean {
    val nowMs = Instant.now().toEpochMilli()
    val gracePeriodMs = gracePeriodSeconds * 1000
    return nowMs >= (expiresAt - gracePeriodMs)
  }

  fun timeUntilExpiry(): Long {
    val nowMs = Instant.now().toEpochMilli()
    return maxOf(0, expiresAt - nowMs)
  }
}

/**
 * Encrypted token storage using Android Keystore
 */
class TokenStore(private val context: Context) {
  private val masterKey = MasterKey.Builder(context)
    .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
    .build()

  private val prefs: SharedPreferences = EncryptedSharedPreferences.create(
    context,
    PREFS_NAME,
    masterKey,
    EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
    EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
  )

  private val gson = Gson()

  /**
   * Store a token response from OAuth flow
   */
  fun storeToken(response: TokenResponse, userId: String, accountId: String) {
    val expiresAt = Instant.now().toEpochMilli() + (response.expiresIn * 1000)
    val token = StoredToken(
      accessToken = response.accessToken,
      refreshToken = response.refreshToken,
      expiresAt = expiresAt,
      userId = userId,
      accountId = accountId
    )
    val json = gson.toJson(token)
    prefs.edit().putString(KEY_STORED_TOKEN, json).apply()
    Timber.d("Token stored, expires in ${response.expiresIn}s")
  }

  /**
   * Retrieve stored token (null if not present)
   */
  fun getToken(): StoredToken? {
    val json = prefs.getString(KEY_STORED_TOKEN, null) ?: return null
    return try {
      gson.fromJson(json, StoredToken::class.java)
    } catch (e: Exception) {
      Timber.e(e, "Failed to deserialize stored token")
      null
    }
  }

  /**
   * Update token after refresh
   */
  fun updateToken(response: TokenResponse) {
    val current = getToken() ?: return
    val expiresAt = Instant.now().toEpochMilli() + (response.expiresIn * 1000)
    val updated = current.copy(
      accessToken = response.accessToken,
      refreshToken = response.refreshToken,
      expiresAt = expiresAt
    )
    val json = gson.toJson(updated)
    prefs.edit().putString(KEY_STORED_TOKEN, json).apply()
    Timber.d("Token refreshed, new expiry: ${updated.expiresAt}")
  }

  /**
   * Clear all tokens (logout)
   */
  fun clearToken() {
    prefs.edit().remove(KEY_STORED_TOKEN).apply()
    Timber.d("Token cleared")
  }

  /**
   * Check if token is stored and valid
   */
  fun hasValidToken(): Boolean {
    val token = getToken() ?: return false
    return !token.isExpired()
  }

  /**
   * Get access token (for API calls)
   */
  fun getAccessToken(): String? {
    val token = getToken() ?: return null
    return if (!token.isExpired()) token.accessToken else null
  }

  /**
   * Get refresh token (for refresh flow)
   */
  fun getRefreshToken(): String? = getToken()?.refreshToken

  /**
   * Get user info
   */
  fun getUserInfo(): Pair<String, String>? {
    val token = getToken() ?: return null
    return Pair(token.userId, token.accountId)
  }

  companion object {
    private const val PREFS_NAME = "wise2_quest_tokens"
    private const val KEY_STORED_TOKEN = "stored_token"
  }
}
