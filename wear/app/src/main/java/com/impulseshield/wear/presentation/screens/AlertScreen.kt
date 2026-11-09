package com.impulseshield.wear.presentation.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.wear.compose.material.*
import com.impulseshield.wear.model.ImpulseItem
import com.impulseshield.wear.presentation.theme.EmeraldGreen

@Composable
fun AlertScreen(
    item: ImpulseItem,
    onReject: () -> Unit,
    onAccept: () -> Unit,
    modifier: Modifier = Modifier
) {
    Box(
        modifier = modifier
            .fillMaxSize()
            .background(MaterialTheme.colors.background)
            .padding(horizontal = 16.dp, vertical = 8.dp),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Text(
                text = "🔔 ¿AÚN LO QUIERES?",
                fontSize = 10.sp,
                fontWeight = FontWeight.Black,
                color = MaterialTheme.colors.primary,
                textAlign = TextAlign.Center
            )
            Text(
                text = item.productName,
                fontSize = 13.sp,
                fontWeight = FontWeight.Bold,
                color = Color.White,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
                textAlign = TextAlign.Center
            )
            Text(
                text = "$${item.price} ${item.currency}",
                fontSize = 11.sp,
                color = Color.LightGray,
                fontWeight = FontWeight.Medium
            )
            Spacer(modifier = Modifier.height(6.dp))

            // Botón 1: ❌ Ya no lo quiero (Acción ganadora)
            CompactChip(
                onClick = onReject,
                label = {
                    Text(
                        text = "❌ Ya no lo quiero",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White,
                        textAlign = TextAlign.Center,
                        modifier = Modifier.fillMaxWidth()
                    )
                },
                colors = ChipDefaults.chipColors(
                    backgroundColor = EmeraldGreen
                ),
                modifier = Modifier
                    .fillMaxWidth()
                    .height(30.dp)
            )

            Spacer(modifier = Modifier.height(4.dp))

            // Botón 2: ✅ Comprar
            CompactChip(
                onClick = onAccept,
                label = {
                    Text(
                        text = "✅ Sí, comprar",
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Medium,
                        color = Color.LightGray,
                        textAlign = TextAlign.Center,
                        modifier = Modifier.fillMaxWidth()
                    )
                },
                colors = ChipDefaults.chipColors(
                    backgroundColor = Color(0xFF1E293B)
                ),
                modifier = Modifier
                    .fillMaxWidth(0.85f)
                    .height(26.dp)
            )
        }
    }
}
