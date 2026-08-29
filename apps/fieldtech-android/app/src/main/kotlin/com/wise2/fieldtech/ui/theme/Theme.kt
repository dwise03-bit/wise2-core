package com.wise2.fieldtech.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Shapes
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.ui.unit.dp

// WISE² Field Tech palette — spec §4. Restrained glow, not a gaming dashboard: legible outside,
// on rooftops, in mechanical rooms, in service vans, while wearing gloves.
val JetBlack = Color(0xFF050505)
val CarbonBlack = Color(0xFF0A0A0A)
val ConcreteBlack = Color(0xFF111111)
val Gunmetal = Color(0xFF1A1A1A)
val PanelSteel = Color(0xFF141A20)
val OxideBlack = Color(0xFF070B0F)
val InstrumentLine = Color(0xFF2A3A48)
val ChaosBlue = Color(0xFF007BFF)
val ElectricBlue = Color(0xFF00AEEF)
val GraffitiBlue = Color(0xFF0088FF)
val NeonIceBlue = Color(0xFF4FC3FF)
val ChromeSilver = Color(0xFFC0C0C0)
val FrostWhite = Color(0xFFF4F8FB)
val MutedSteel = Color(0xFF8EA1B2)

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
    onBackground = FrostWhite,
    surface = OxideBlack,
    onSurface = FrostWhite,
    surfaceVariant = PanelSteel,
    onSurfaceVariant = MutedSteel,
    error = StatusRed,
    onError = FrostWhite,
    outline = InstrumentLine,
)

@Composable
fun WiseFieldTechTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = WiseColorScheme,
        typography = WiseTypography,
        shapes = Shapes(
            extraSmall = RoundedCornerShape(4.dp),
            small = RoundedCornerShape(6.dp),
            medium = RoundedCornerShape(8.dp),
            large = RoundedCornerShape(8.dp),
            extraLarge = RoundedCornerShape(8.dp),
        ),
        content = content,
    )
}
