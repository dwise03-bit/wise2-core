package com.wise2.mecapture

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class UiContractTest {
    @Test
    fun navigation_matches_approved_visual() {
        assertEquals(listOf("Capture", "Library", "AI Studio", "Profile"), MeCaptureUiContract.tabs)
    }

    @Test
    fun modes_keep_the_approved_color_identity() {
        assertEquals(0xFF76FF03, MeCaptureUiContract.modeColors["FIELD"])
        assertEquals(0xFF2196F3, MeCaptureUiContract.modeColors["CLIENT"])
        assertEquals(0xFF8E5CFF, MeCaptureUiContract.modeColors["TEACH"])
        assertEquals(0xFFFFA000, MeCaptureUiContract.modeColors["THOUGHT"])
    }

    @Test
    fun ai_pipeline_never_skips_human_review() {
        assertEquals(
            listOf("RAW", "TRANSCRIBED", "ANALYZED", "REVIEWED", "APPROVED"),
            MeCaptureUiContract.pipeline
        )
        assertTrue(MeCaptureUiContract.requiresExplicitAiApproval)
    }
}
