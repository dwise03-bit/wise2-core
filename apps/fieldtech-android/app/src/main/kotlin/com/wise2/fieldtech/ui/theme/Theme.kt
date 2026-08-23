package com.wise2.fieldtech.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

// WISE² Field Tech palette — spec §4. Restrained glow, not a gaming dashboard: legible outside,
// on rooftops, in mechanical rooms, in service vans, while wearing gloves.
val JetBlack = Color(0xFF050505)
val CarbonBlack = Color(0xFF0A0A0A)
val ConcreteBlack = Color(0xFF111111)
val Gunmetal = Color(0xFF1A1A1A)
val ChaosBlue = Color(0xFF007BFF)
val ElectricBlue = Color(0xFF00AEEF)
val GraffitiBlue = Color(0xFF0088FF)
val NeonIceBlue = Color(0xFF4FC3FF)
val ChromeSilver = Color(0xFFC0C0C0)

val StatusGreen = Color(0xFF2ECC71)
val StatusAmber = Color(0xFFFFB020)
val StatusRed = Color(0xFFFF4D4F)

private val WiseColorScheme = darkColorScheme(
    primary = ElectricBlue,
    onPrimary = JetBlack,
    secondary = ChaosBlue,
    onSecondary = JetBlack,
    tertiary = NeonIceBlue,
    background = JetBlack,
    onBackground = ChromeSilver,
    surface = ConcreteBlack,
    onSurface = ChromeSilver,
    surfaceVariant = Gunmetal,
    onSurfaceVariant = ChromeSilver,
    error = StatusRed,
    onError = ChromeSilver,
    outline = Gunmetal,
)

@Composable
fun WiseFieldTechTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = WiseColorScheme,
        typography = WiseTypography,
        content = content,
    )
}
