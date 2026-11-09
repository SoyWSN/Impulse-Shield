package com.impulseshield.wear

import android.content.Context
import android.os.Build
import android.os.Bundle
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import com.impulseshield.wear.data.ImpulseRepository
import com.impulseshield.wear.model.ImpulseItem
import com.impulseshield.wear.model.WearUIState
import com.impulseshield.wear.presentation.screens.*
import com.impulseshield.wear.presentation.theme.ImpulseShieldTheme
import kotlinx.coroutines.delay

class MainActivity : ComponentActivity() {

    private val repository = ImpulseRepository()
    private var vibrator: Vibrator? = null
    private var hasVibratedForCurrentAlert = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Inicializar servicio de vibración háptica
        vibrator = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            val vibratorManager = getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as? VibratorManager
            vibratorManager?.defaultVibrator
        } else {
            @Suppress("DEPRECATION")
            getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator
        }

        setContent {
            ImpulseShieldTheme {
                WearApp(
                    repository = repository,
                    triggerVibration = { triggerHapticAlert() }
                )
            }
        }
    }

    override fun onStart() {
        super.onStart()
        repository.startListening()
    }

    override fun onStop() {
        super.onStop()
        repository.stopListening()
    }

    private fun triggerHapticAlert() {
        if (hasVibratedForCurrentAlert) return
        hasVibratedForCurrentAlert = true

        val pattern = longArrayOf(0, 400, 200, 400)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            vibrator?.vibrate(VibrationEffect.createWaveform(pattern, -1))
        } else {
            @Suppress("DEPRECATION")
            vibrator?.vibrate(pattern, -1)
        }
    }

    fun resetVibration() {
        hasVibratedForCurrentAlert = false
    }
}

@Composable
fun WearApp(
    repository: ImpulseRepository,
    triggerVibration: () -> Unit
) {
    val activeItem by repository.activeImpulse.collectAsState()
    var uiState by remember { mutableStateOf<WearUIState>(WearUIState.Idle) }

    // Manejo de la cuenta regresiva y transiciones de estado
    LaunchedEffect(activeItem) {
        val item = activeItem
        if (item == null) {
            if (uiState !is WearUIState.Celebration) {
                uiState = WearUIState.Idle
            }
        } else {
            while (true) {
                val now = System.currentTimeMillis()
                val diffMs = item.expiresAt - now
                val remaining = diffMs / 1000

                if (remaining <= 0) {
                    uiState = WearUIState.AlertPrompt(item)
                    triggerVibration()
                    break
                } else {
                    uiState = WearUIState.CountingDown(item, remaining)
                }
                delay(1000)
            }
        }
    }

    when (val state = uiState) {
        is WearUIState.Idle -> {
            IdleScreen(modifier = Modifier.fillMaxSize())
        }
        is WearUIState.CountingDown -> {
            CountdownScreen(
                item = state.item,
                remainingSeconds = state.remainingSeconds,
                modifier = Modifier.fillMaxSize()
            )
        }
        is WearUIState.AlertPrompt -> {
            AlertScreen(
                item = state.item,
                onReject = {
                    val savedItem = state.item
                    repository.resolveImpulse(savedItem.id, "saved") {
                        uiState = WearUIState.Celebration(savedItem.price, savedItem.currency)
                    }
                },
                onAccept = {
                    repository.resolveImpulse(state.item.id, "purchased") {
                        uiState = WearUIState.Idle
                    }
                },
                modifier = Modifier.fillMaxSize()
            )
        }
        is WearUIState.Celebration -> {
            CelebrationScreen(
                savedAmount = state.savedAmount,
                currency = state.currency,
                modifier = Modifier.fillMaxSize()
            )
            // Regresar al estado Idle después de 3.5 segundos de celebración
            LaunchedEffect(Unit) {
                delay(3500)
                uiState = WearUIState.Idle
            }
        }
    }
}
