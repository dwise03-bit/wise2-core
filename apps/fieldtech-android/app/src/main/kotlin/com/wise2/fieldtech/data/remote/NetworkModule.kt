package com.wise2.fieldtech.data.remote

import com.wise2.fieldtech.BuildConfig
import com.wise2.fieldtech.data.prefs.SecureTokenStore
import kotlinx.serialization.json.Json
import okhttp3.Interceptor
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Response
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.kotlinx.serialization.asConverterFactory
import java.util.concurrent.TimeUnit

/**
 * Attaches the bearer token to every request except those tagged "No-Auth" (login/refresh/
 * update-check). Never logs the token itself — only request method/path (spec §18).
 */
class AuthInterceptor(private val tokenStore: SecureTokenStore) : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        val original = chain.request()
        if (original.header("No-Auth") != null) {
            val stripped = original.newBuilder().removeHeader("No-Auth").build()
            return chain.proceed(stripped)
        }
        val token = tokenStore.getAccessToken()
        val request = if (token != null) {
            original.newBuilder().addHeader("Authorization", "Bearer $token").build()
        } else {
            original
        }
        return chain.proceed(request)
    }
}

/**
 * On a 401, attempts one synchronous refresh using the stored refresh token and retries once.
 * If refresh fails, clears the session so the UI routes back to Login (spec §18, "expired-session
 * handling").
 */
class TokenAuthenticator(
    private val tokenStore: SecureTokenStore,
    private val plainRetrofit: () -> Retrofit,
) : okhttp3.Authenticator {
    override fun authenticate(route: okhttp3.Route?, response: Response): okhttp3.Request? {
        if (responseCount(response) >= 2) return null
        val refreshToken = tokenStore.getRefreshToken() ?: return null

        return try {
            val api = plainRetrofit().create(ApiService::class.java)
            val result = kotlinx.coroutines.runBlocking {
                api.refresh(com.wise2.fieldtech.data.remote.dto.RefreshRequest(refreshToken))
            }
            val body = result.body()
            if (!result.isSuccessful || body == null) {
                tokenStore.clear()
                null
            } else {
                tokenStore.saveTokens(body.accessToken, refreshToken)
                response.request.newBuilder()
                    .header("Authorization", "Bearer ${body.accessToken}")
                    .build()
            }
        } catch (t: Throwable) {
            null
        }
    }

    private fun responseCount(response: Response): Int {
        var count = 1
        var prior = response.priorResponse
        while (prior != null) {
            count++
            prior = prior.priorResponse
        }
        return count
    }
}

object NetworkModule {

    val json = Json { ignoreUnknownKeys = true; explicitNulls = false }

    fun buildPlainRetrofit(): Retrofit = Retrofit.Builder()
        .baseUrl(BuildConfig.API_BASE_URL)
        .client(OkHttpClient.Builder().callTimeout(30, TimeUnit.SECONDS).build())
        .addConverterFactory(json.asConverterFactory("application/json".toMediaType()))
        .build()

    fun buildApiService(tokenStore: SecureTokenStore): ApiService {
        val logging = HttpLoggingInterceptor().apply {
            // BODY logging is intentionally disabled to avoid ever printing tokens/PII to logcat.
            level = if (com.wise2.fieldtech.BuildConfig.DEBUG) {
                HttpLoggingInterceptor.Level.BASIC
            } else {
                HttpLoggingInterceptor.Level.NONE
            }
        }
        val client = OkHttpClient.Builder()
            .connectTimeout(20, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .writeTimeout(30, TimeUnit.SECONDS)
            .addInterceptor(AuthInterceptor(tokenStore))
            .addInterceptor(logging)
            .authenticator(TokenAuthenticator(tokenStore) { buildPlainRetrofit() })
            .build()

        val retrofit = Retrofit.Builder()
            .baseUrl(BuildConfig.API_BASE_URL)
            .client(client)
            .addConverterFactory(json.asConverterFactory("application/json".toMediaType()))
            .build()

        return retrofit.create(ApiService::class.java)
    }
}
