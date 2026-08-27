package com.wise2.fieldtech.data.repository

import com.wise2.fieldtech.data.prefs.SecureTokenStore
import com.wise2.fieldtech.data.remote.ApiService
import com.wise2.fieldtech.data.remote.dto.LoginRequest
import com.wise2.fieldtech.domain.WiseResult
import com.wise2.fieldtech.domain.model.User
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

class AuthRepository(
    private val api: ApiService,
    private val tokenStore: SecureTokenStore,
) {
    private val _currentUser = MutableStateFlow(tokenStore.getUser())
    val currentUser: StateFlow<User?> = _currentUser.asStateFlow()

    val isLoggedIn: Boolean get() = tokenStore.hasSession()

    suspend fun login(email: String, password: String): WiseResult<User> {
        // Demo mode: accept any email with password "demo"
        if (password.lowercase() == "demo") {
            val user = User(
                id = email.hashCode().toString(),
                name = email.split("@").first().replaceFirstChar { it.uppercase() },
                email = email,
                role = "TECHNICIAN",
            )
            val token = "demo_token_${System.currentTimeMillis()}"
            tokenStore.saveTokens(token, token)
            tokenStore.saveUser(user)
            _currentUser.value = user
            return WiseResult.Success(user)
        }

        return try {
            val response = api.login(LoginRequest(email, password))
            val body = response.body()
            if (!response.isSuccessful || body == null) {
                WiseResult.Error(loginErrorMessage(response.code()))
            } else {
                tokenStore.saveTokens(body.accessToken, body.refreshToken)
                val user = User(
                    id = body.user.id,
                    name = listOfNotNull(body.user.firstName, body.user.lastName).joinToString(" ").ifBlank { body.user.email },
                    email = body.user.email,
                    role = body.user.role,
                )
                tokenStore.saveUser(user)
                _currentUser.value = user
                WiseResult.Success(user)
            }
        } catch (t: Throwable) {
            WiseResult.Error("Couldn't reach WISE². Check your connection.", t)
        }
    }

    private fun loginErrorMessage(code: Int): String = when (code) {
        401 -> "Incorrect email or password."
        400 -> "Please verify your email before logging in."
        429 -> "Too many attempts. Try again in a few minutes."
        else -> "Login failed (code $code)."
    }

    suspend fun loginWithGoogle(idToken: String): WiseResult<User> {
        return try {
            val response = api.loginWithGoogle(mapOf("idToken" to idToken))
            val body = response.body()
            if (!response.isSuccessful || body == null) {
                WiseResult.Error("Google login failed.")
            } else {
                tokenStore.saveTokens(body.accessToken, body.refreshToken)
                val user = User(
                    id = body.user.id,
                    name = listOfNotNull(body.user.firstName, body.user.lastName).joinToString(" ").ifBlank { body.user.email },
                    email = body.user.email,
                    role = body.user.role,
                )
                tokenStore.saveUser(user)
                _currentUser.value = user
                WiseResult.Success(user)
            }
        } catch (t: Throwable) {
            WiseResult.Error("Couldn't reach WISE². Check your connection.", t)
        }
    }

    suspend fun logout() {
        runCatching { api.logout() }
        tokenStore.clear()
        _currentUser.value = null
    }
}
