package com.wise2.fieldtech.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

// WISE² Command Center Sync — Black + Neon Green branding
// Matches dashboard design: black background, neon green accents, white text
val PureBlack = Color(0xFF000000)
val JetBlack = Color(0xFF050505)
val CarbonBlack = Color(0xFF0A0A0A)
val ConcreteBlack = Color(0xFF111111)
val Gunmetal = Color(0xFF1A1A1A)
val NeonGreen = Color(0xFF00FF7F)  // Command Center primary
val ElectricBlue = Color(0xFF00AEEF)
val GraffitiBlue = Color(0xFF0088FF)
val NeonIceBlue = Color(0xFF4FC3FF)
val ChromeSilver = Color(0xFFC0C0C0)
val PureWhite = Color(0xFFFFFFFF)

val StatusGreen = Color(0xFF2ECC71)
val StatusAmber = Color(0xFFFFB020)
val StatusRed = Color(0xFFFF4D4F)

private val WiseColorScheme = darkColorScheme(
    primary = NeonGreen,  // Sync with Command Center
    onPrimary = PureBlack,
    secondary = NeonGreen,
    onSecondary = PureBlack,
    tertiary = NeonGreen,
    background = PureBlack,
    onBackground = PureWhite,
    surface = ConcreteBlack,
    onSurface = PureWhite,
    surfaceVariant = Gunmetal,
    onSurfaceVariant = PureWhite,
    error = StatusRed,
    onError = ChromeSilver,
    outline = NeonGreen,
)

@Composable
fun WiseFieldTechTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = WiseColorScheme,
        typography = WiseTypography,
        content = content,
    )
}
