package com.wise2.fieldtech.ui.components

import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.ElevatedButton
import androidx.compose.material3.LocalContentColor
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.wise2.fieldtech.ui.theme.Dimens
import com.wise2.fieldtech.ui.theme.WISE2Colors

/**
 * Professional FieldTech button with proper touch feedback and accessibility.
 * Meets Material 3 guidelines and WCAG touch target requirements (>=48dp).
 */
@Composable
fun FieldTechButton(
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    label: String,
    enabled: Boolean = true,
    isLoading: Boolean = false,
    isPrimary: Boolean = true,
    contentPadding: PaddingValues = ButtonDefaults.ContentPadding,
) {
    val interactionSource = remember { MutableInteractionSource() }

    if (isPrimary) {
        Button(
            onClick = { if (!isLoading) onClick() },
            modifier = modifier
                .height(Dimens.button_height)
                .semantics { },  // Proper accessibility tree
            enabled = enabled && !isLoading,
            colors = ButtonDefaults.buttonColors(
                containerColor = WISE2Colors.CyanBrand,
                contentColor = WISE2Colors.NavyBlack,
                disabledContainerColor = WISE2Colors.Gunmetal,
                disabledContentColor = WISE2Colors.TextSecondary,
            ),
            shape = RoundedCornerShape(Dimens.radius_lg),
            elevation = ButtonDefaults.elevatedButtonElevation(
                defaultElevation = Dimens.elevation_4,
                pressedElevation = Dimens.elevation_8,
            ),
            interactionSource = interactionSource,
            contentPadding = contentPadding,
        ) {
            Text(
                text = if (isLoading) "Loading..." else label,
                style = TextStyle(fontWeight = FontWeight.SemiBold),
            )
        }
    } else {
        ElevatedButton(
            onClick = { if (!isLoading) onClick() },
            modifier = modifier
                .height(Dimens.button_height)
                .semantics { },
            enabled = enabled && !isLoading,
            colors = ButtonDefaults.elevatedButtonColors(
                containerColor = WISE2Colors.DarkGunmetal,
                contentColor = WISE2Colors.CyanBrand,
                disabledContainerColor = WISE2Colors.Gunmetal,
                disabledContentColor = WISE2Colors.TextSecondary,
            ),
            shape = RoundedCornerShape(Dimens.radius_lg),
            elevation = ButtonDefaults.elevatedButtonElevation(
                defaultElevation = Dimens.elevation_2,
                pressedElevation = Dimens.elevation_6,
            ),
            interactionSource = interactionSource,
            contentPadding = contentPadding,
        ) {
            Text(
                text = if (isLoading) "Loading..." else label,
                style = TextStyle(fontWeight = FontWeight.Medium),
            )
        }
    }
}

/**
 * Small compact button for secondary actions.
 */
@Composable
fun FieldTechButtonSmall(
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    label: String,
    enabled: Boolean = true,
) {
    Button(
        onClick = onClick,
        modifier = modifier
            .height(Dimens.button_height_sm)
            .semantics { },
        enabled = enabled,
        colors = ButtonDefaults.buttonColors(
            containerColor = WISE2Colors.NeonGreen,
            contentColor = WISE2Colors.NavyBlack,
        ),
        shape = RoundedCornerShape(Dimens.radius_md),
        elevation = ButtonDefaults.elevatedButtonElevation(
            defaultElevation = Dimens.elevation_2,
            pressedElevation = Dimens.elevation_4,
        ),
        contentPadding = PaddingValues(
            horizontal = Dimens.spacing_12,
            vertical = Dimens.spacing_8
        ),
    ) {
        Text(
            text = label,
            style = TextStyle(fontWeight = FontWeight.Medium),
        )
    }
}
