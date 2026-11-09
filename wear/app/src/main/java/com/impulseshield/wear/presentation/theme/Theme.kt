package com.impulseshield.wear.presentation.theme

import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.wear.compose.material.Colors
import androidx.wear.compose.material.MaterialTheme

val EmeraldGreen = Color(0xFF10B981)
val EmeraldDark = Color(0xFF047857)
val SkyBlue = Color(0xFF38BDF8)
val DarkBackground = Color(0xFF020617)
val CardBackground = Color(0xFF0F172A)
val AlertCoral = Color(0xFFEF4444)

internal val WearColorPalette: Colors = Colors(
    primary = EmeraldGreen,
    primaryVariant = EmeraldDark,
    secondary = SkyBlue,
    background = DarkBackground,
    surface = CardBackground,
    error = AlertCoral,
    onPrimary = Color.White,
    onSecondary = Color.White,
    onBackground = Color.White,
    onSurface = Color.White,
    onError = Color.White
)

@Composable
fun ImpulseShieldTheme(
    content: @Composable () -> Unit
) {
    MaterialTheme(
        colors = WearColorPalette,
        content = content
    )
}
