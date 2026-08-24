package com.wise2.fieldtech.data.repository

import com.wise2.fieldtech.data.local.dao.ImpMessageDao
import com.wise2.fieldtech.data.local.entity.ImpMessageEntity
import com.wise2.fieldtech.data.remote.ApiService
import com.wise2.fieldtech.data.remote.dto.HermesChatMessageDto
import com.wise2.fieldtech.data.remote.dto.HermesChatRequest
import com.wise2.fieldtech.domain.WiseResult
import com.wise2.fieldtech.domain.model.ImpMessage
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map
import java.util.UUID

/**
 * IMP is WISE²'s technician-facing brand over the existing /v1/hermes/chat endpoint (spec §13).
 * Structured job context (equipment, complaint, readings, test results — spec §13) is folded
 * into the outgoing message text, since HermesChatDto has no separate context field.
 */
class ImpRepository(
    private val api: ApiService,
    private val dao: ImpMessageDao,
) {
    fun observeForJob(jobId: String): Flow<List<ImpMessage>> =
        dao.observeForJob(jobId).map { list -> list.map { it.toDomain() } }

    suspend fun ask(jobId: String, contextBlock: String, userQuestion: String): WiseResult<ImpMessage> {
        val userMessage = ImpMessage(
            id = UUID.randomUUID().toString(),
            jobId = jobId,
            isFromUser = true,
            text = userQuestion,
            sentAtEpochMillis = System.currentTimeMillis(),
        )
        dao.insert(userMessage.toEntity())

        val history = dao.observeForJob(jobId).first().takeLast(10).map {
            HermesChatMessageDto(role = if (it.isFromUser) "user" else "assistant", content = it.text)
        }

        val fullMessage = "$contextBlock\n\nTECHNICIAN QUESTION: $userQuestion"

        return try {
            val response = api.impChat(HermesChatRequest(message = fullMessage, mode = "support", messages = history))
            val body = response.body()
            if (!response.isSuccessful || body == null) {
                WiseResult.Error("IMP couldn't respond (code ${response.code()}).")
            } else {
                val reply = ImpMessage(
                    id = UUID.randomUUID().toString(),
                    jobId = jobId,
                    isFromUser = false,
                    text = body.response,
                    sentAtEpochMillis = System.currentTimeMillis(),
                )
                dao.insert(reply.toEntity())
                WiseResult.Success(reply)
            }
        } catch (t: Throwable) {
            WiseResult.Error("IMP is unreachable right now. Your question was saved — try again once you're back online.", t)
        }
    }
}

private fun ImpMessageEntity.toDomain() = ImpMessage(id, jobId, isFromUser, text, sentAtEpochMillis, confidence)
private fun ImpMessage.toEntity() = ImpMessageEntity(id, jobId, isFromUser, text, sentAtEpochMillis, confidence)
