package com.wise2.fieldtech.ui.theme

import androidx.compose.ui.unit.dp

/**
 * Spacing system based on 8dp rhythm for professional UI polish.
 * Ensures consistent spacing hierarchy across all screens.
 */
object Dimens {
    // Base spacing units (4dp increments for fine-tuning)
    val spacing_2 = 2.dp      // Micro-spacing
    val spacing_4 = 4.dp      // Tight spacing
    val spacing_8 = 8.dp      // Base unit
    val spacing_12 = 12.dp    // 1.5x base
    val spacing_16 = 16.dp    // 2x base (standard padding)
    val spacing_24 = 24.dp    // 3x base (section spacing)
    val spacing_32 = 32.dp    // 4x base (large spacing)
    val spacing_48 = 48.dp    // 6x base (huge spacing)

    // Typography sizing
    val text_xs = 12.dp
    val text_sm = 14.dp
    val text_base = 16.dp
    val text_lg = 18.dp
    val text_xl = 20.dp
    val text_2xl = 24.dp

    // Component sizing
    val touch_target_min = 48.dp  // Android minimum (>=48x48dp)
    val icon_sm = 20.dp
    val icon_md = 24.dp
    val icon_lg = 32.dp
    val icon_xl = 48.dp

    // Corner radius (smooth, modern appearance)
    val radius_sm = 4.dp
    val radius_md = 8.dp
    val radius_lg = 12.dp
    val radius_xl = 16.dp
    val radius_2xl = 24.dp

    // Elevation (depth layers)
    val elevation_none = 0.dp
    val elevation_1 = 1.dp
    val elevation_2 = 2.dp
    val elevation_4 = 4.dp
    val elevation_6 = 6.dp
    val elevation_8 = 8.dp

    // Content padding (gutters by device)
    val content_padding_sm = 12.dp  // Compact margins
    val content_padding_md = 16.dp  // Standard margins
    val content_padding_lg = 24.dp  // Generous margins

    // Component dimensions
    val button_height = 44.dp       // Touch target friendly
    val button_height_sm = 36.dp
    val button_height_lg = 52.dp

    val card_elevation = 2.dp

    // Animation timings (professionally subtle)
    val animation_duration_short = 150      // ms - micro-interactions
    val animation_duration_normal = 250     // ms - standard transitions
    val animation_duration_long = 400       // ms - complex animations
}

/**
 * Layout helpers for safe area and content management
 */
object LayoutDimens {
    val status_bar_height = 24.dp        // Android status bar
    val nav_bar_height_portrait = 56.dp  // Portrait nav bar
    val nav_bar_height_landscape = 48.dp // Landscape nav bar
    val bottom_bar_height = 56.dp        // Bottom navigation
}
