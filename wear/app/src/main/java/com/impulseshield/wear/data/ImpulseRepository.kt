package com.impulseshield.wear.data

import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.ListenerRegistration
import com.impulseshield.wear.model.ImpulseItem
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

class ImpulseRepository {

    private val db = FirebaseFirestore.getInstance()
    private val _activeImpulse = MutableStateFlow<ImpulseItem?>(null)
    val activeImpulse: StateFlow<ImpulseItem?> = _activeImpulse.asStateFlow()

    private var listenerRegistration: ListenerRegistration? = null

    fun startListening() {
        stopListening()
        listenerRegistration = db.collection("impulses")
            .whereEqualTo("status", "active")
            .addSnapshotListener { snapshot, error ->
                if (error != null) {
                    error.printStackTrace()
                    return@addSnapshotListener
                }

                if (snapshot != null && !snapshot.isEmpty) {
                    // Ordenamos en memoria para obtener el más reciente sin requerir índices compuestos
                    val sortedDocs = snapshot.documents.sortedByDescending {
                        it.getLong("createdAt") ?: 0L
                    }
                    val doc = sortedDocs.firstOrNull()
                    if (doc != null) {
                        val item = ImpulseItem(
                            id = doc.id,
                            productName = doc.getString("productName") ?: "",
                            price = doc.getLong("price") ?: 0L,
                            currency = doc.getString("currency") ?: "MXN",
                            durationSeconds = doc.getLong("durationSeconds") ?: 0L,
                            createdAt = doc.getLong("createdAt") ?: 0L,
                            expiresAt = doc.getLong("expiresAt") ?: 0L,
                            status = doc.getString("status") ?: "active"
                        )
                        _activeImpulse.value = item
                    } else {
                        _activeImpulse.value = null
                    }
                } else {
                    _activeImpulse.value = null
                }
            }
    }

    fun stopListening() {
        listenerRegistration?.remove()
        listenerRegistration = null
    }

    fun resolveImpulse(id: String, newStatus: String, onComplete: () -> Unit = {}) {
        val updates = mapOf(
            "status" to newStatus,
            "resolvedAt" to System.currentTimeMillis()
        )
        db.collection("impulses").document(id)
            .update(updates)
            .addOnSuccessListener {
                onComplete()
            }
            .addOnFailureListener { e ->
                e.printStackTrace()
                onComplete()
            }
    }
}
