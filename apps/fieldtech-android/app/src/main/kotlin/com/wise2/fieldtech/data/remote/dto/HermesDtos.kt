package com.wise2.fieldtech.data.remote.dto

import kotlinx.serialization.Serializable

@Serializable
data class HermesChatMessageDto(val role: String, val content: String)

/** Matches HermesChatDto in packages/api/src/hermes/hermes.dto.ts. mode="support" is the
 *  closest fit among the fixed executive/audit/sales/projects/support/systems enum for
 *  field-technician traffic — there is no dedicated "fieldtech" Hermes mode server-side. */
@Serializable
data class HermesChatRequest(
    val message: String,
    val mode: String = "support",
    val messages: List<HermesChatMessageDto> = emptyList(),
)

/** Matches the object literal returned by HermesService.chat(). */
@Serializable
data class HermesChatResponse(
    val response: String,
    val mode: String,
    val model: String,
    val provider: String,
    val durationMs: Long,
    val sources: List<String> = emptyList(),
    val evidenceStatus: String,
)
