package com.wise2.fieldtech.data.remote.dto

import kotlinx.serialization.Serializable

@Serializable
data class LoginRequest(val email: String, val password: String)

@Serializable
data class RefreshRequest(val refreshToken: String)

@Serializable
data class UserDto(
    val id: String,
    val email: String,
    val role: String,
    val firstName: String? = null,
    val lastName: String? = null,
)

/** Matches AuthController POST /v1/auth/login response exactly (packages/api/src/auth/auth.controller.ts). */
@Serializable
data class LoginResponse(
    val accessToken: String,
    val refreshToken: String,
    val user: UserDto,
    val expiresIn: Int,
)

/** Matches AuthController POST /v1/auth/refresh response exactly. */
@Serializable
data class RefreshResponse(
    val accessToken: String,
    val expiresIn: Int,
)
