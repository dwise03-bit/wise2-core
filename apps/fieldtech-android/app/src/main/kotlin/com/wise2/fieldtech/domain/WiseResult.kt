package com.wise2.fieldtech.domain

/** Repository-layer result. OfflineCached distinguishes "we have local data but couldn't
 * reach the server" from a hard Error, so the UI can show ONLINE / OFFLINE — CHANGES SAVED
 * LOCALLY (spec §17) instead of a generic failure. */
sealed class WiseResult<out T> {
    data class Success<T>(val data: T) : WiseResult<T>()
    data class OfflineCached<T>(val data: T) : WiseResult<T>()
    data class Error(val message: String, val cause: Throwable? = null) : WiseResult<Nothing>()
    data object Loading : WiseResult<Nothing>()
}
