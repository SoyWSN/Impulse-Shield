package com.impulseshield.wear.model

data class ImpulseItem(
    val id: String = "",
    val productName: String = "",
    val price: Long = 0,
    val currency: String = "MXN",
    val durationSeconds: Long = 0,
    val createdAt: Long = 0,
    val expiresAt: Long = 0,
    val status: String = "active"
)

sealed class WearUIState {
    object Idle : WearUIState()
    data class CountingDown(val item: ImpulseItem, val remainingSeconds: Long) : WearUIState()
    data class AlertPrompt(val item: ImpulseItem) : WearUIState()
    data class Celebration(val savedAmount: Long, val currency: String = "MXN") : WearUIState()
}
