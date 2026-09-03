package com.wise2.mecapture

object MeCaptureUiContract {
    val tabs = listOf("Capture", "Library", "AI Studio", "Profile")
    val pipeline = listOf("RAW", "TRANSCRIBED", "ANALYZED", "REVIEWED", "APPROVED")
    val modeColors = mapOf(
        "FIELD" to 0xFF76FF03,
        "CLIENT" to 0xFF2196F3,
        "TEACH" to 0xFF8E5CFF,
        "THOUGHT" to 0xFFFFA000
    )
    const val requiresExplicitAiApproval = true
}
