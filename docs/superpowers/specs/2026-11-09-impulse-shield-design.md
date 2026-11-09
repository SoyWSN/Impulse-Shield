# ImpulseShield — Documento de Diseño

## 1. Intención y Propósito ("The Why")
Las compras impulsivas representan una fuga silenciosa y constante en la economía personal cotidiana ("gastos hormiga" o compras emocionales). Psicológicamente, el deseo compulsivo de adquirir un producto ("calor del momento") suele decaer significativamente entre 10 y 30 minutos después de la exposición al estímulo.

**ImpulseShield** rompe el ciclo impulsivo interponiendo un período de enfriamiento voluntario. La aplicación móvil permite registrar la tentación en segundos (nombre, precio, temporizador), mientras que el smartwatch (Wear OS) asume el rol de centinela físico: al vencer el plazo, vibra en la muñeca del usuario formulando la pregunta clave: *"¿Aún quieres este artículo?"*. Si el usuario declina, la app celebra la decisión transformando la tentación rechazada en **dinero ahorrado medible y acumulativo**.

---

## 2. Metas, No-Metas y Anti-Metas

### Metas (Goals)
1. **Flujo de registro ágil en móvil (<15 segundos):** Registrar nombre del producto, precio y seleccionar tiempo de enfriamiento (con opciones cortas como 1 minuto para evaluación/demo, 5, 15, 30 min).
2. **Modelo de Concurrencia Simple (1 solo impulso activo a la vez):** Para mantener la experiencia enfocada y la interfaz limpia, solo puede haber un enfriamiento corriendo simultáneamente. Mientras esté activo, el botón de crear nuevo impulso queda bloqueado.
3. **Sincronización en tiempo real vía Firebase:** El smartwatch recibe la notificación del temporizador activo y, al completarse el tiempo, dispara la alerta háptica.
4. **Interacción táctil mínima en Smartwatch:** Pantalla circular optimizada con la pregunta, el precio y dos acciones evidentes: `❌ Ya no lo quiero` y `✅ Sí, lo compro`.
5. **Respaldo y Cancelación en Móvil:** La tarjeta de enfriamiento en el móvil permite cancelar anticipadamente (estado `dismissed`) o resolver la compra como fallback en caso de no tener el reloj a la mano.
6. **Refuerzo positivo inmediato:** Feedback visual/háptico de felicitación en el reloj ("¡Ahorraste \$X!") y actualización automática del marcador de "Total Ahorrado" en el móvil.
7. **Historial de decisiones:** Registro histórico en el teléfono dividiendo compras conscientes vs. tentaciones evitadas.

### No-Metas (Non-Goals)
- No es una app de finanzas completa (sin presupuestos mensuales complejos, sin conexión bancaria ni lectura de SMS bancarios).
- No requiere autenticación multi-usuario compleja en primera fase (un único usuario anónimo o fijo por instalación es suficiente para la evaluación).
- No incluye cámara o escaneo de código de barras para productos (el ingreso es manual y directo).

### Anti-Metas (Anti-Goals)
- **No hacer sentir culpable al usuario:** Si decide comprar el artículo ("Sí, lo compro"), no se le castiga ni se le muestra un mensaje negativo; se etiqueta como "Compra consciente".
- **No obligar al usuario a abrir el teléfono para responder:** La decisión debe poder tomarse 100% desde la muñeca.
- **Cero dependencia de emparejamiento Bluetooth local frágil entre emuladores:** La comunicación no debe caerse por problemas de conectividad local en la presentación.

---

## 3. Restricciones
- **Plataforma móvil:** React Native (Expo) para Android.
- **Plataforma reloj:** Wear OS (ejecutado en emulador de Android Studio, compatible con pantallas circulares).
- **Backend / Canal de comunicación:** Google Firebase (Cloud Firestore) para sincronización de estados y persistencia en tiempo real.
- **Tiempo de respuesta:** La transición de estado en el reloj debe reflejarse en el móvil en menos de 1 segundo vía listeners en tiempo real (`onSnapshot`).

---

## 4. Enfoques considerados y selección de arquitectura

| Enfoque | Descripción | Pros | Contras | Veredicto |
|---|---|---|---|---|
| **1. Google Wearable Data Layer API (Bluetooth/ADB)** | React Native + Módulo nativo en Kotlin y Android Wear OS API oficial. | Estándar nativo de Android. | Muy propenso a desconexiones de emparejamiento entre emuladores en Windows. | Descartado por riesgo técnico en demo. |
| **2. Sincronización en Nube vía Firebase (Firestore)** | React Native (móvil) + App Wear OS ligera, ambos conectados al mismo Firestore. | 100% confiable en demos, desacoplado, tiempo real nativo, histórico persistente. | Requiere internet activo. | **SELECCIONADO (Elegido por el usuario).** |
| **3. React Native en ambos dispositivos** | Compilar React Native en el emulador de Wear OS. | Un solo lenguaje (JS). | Alto consumo de RAM en emulador de reloj, lentitud de arranque. | Descartado. |

---

## 5. Diseño del Sistema y Flujo de Datos

### Modelo de Datos (Firestore)

#### Colección: `impulses`
```typescript
interface ImpulseItem {
  id: string;
  productName: string;          // Ej: "Audífonos Sony"
  price: number;                // Ej: 1800
  currency: string;             // "MXN"
  durationSeconds: number;      // Ej: 60 (demo) o 900 (15 min)
  createdAt: number;            // Timestamp en ms
  expiresAt: number;            // Timestamp de expiración en ms
  status: 'active' | 'saved' | 'purchased' | 'dismissed';
  resolvedAt?: number;          // Timestamp cuando el usuario respondió
}
```

#### Documento: `user_stats/summary`
```typescript
interface UserStats {
  totalSaved: number;           // Suma acumulada de precios de items con status === 'saved'
  totalSpent: number;           // Suma de precios de items con status === 'purchased'
  savedCount: number;           // Total de tentaciones evitadas
  purchasedCount: number;       // Total de compras conscientes
}
```

---

## 6. Pantallas y Experiencia de Usuario

### A. Aplicación Móvil (React Native)
1. **Pantalla Principal (Dashboard):**
   - Tarjeta superior de impacto: **"Has ahorrado: \$X,XXX MXN"** con icono de alcancía/escudo y contador de victorias.
   - Sección de **"Enfriamiento Activo"**: muestra la tarjeta del producto actual con cuenta regresiva en vivo si hay un temporizador corriendo.
     - Botón secundario: *"Cancelar enfriamiento"* (marca `status: 'dismissed'`).
     - Botones de respaldo de decisión: *"Ya no lo quiero"* / *"Comprar"* por si el reloj no está conectado o el usuario decide desde el teléfono.
   - Botón flotante principal: **"+ Frenar Impulso"** (deshabilitado con indicador visual si ya hay un enfriamiento activo).
   - Lista o pestaña de **"Historial de Decisiones"**: lista con etiquetas verdes (*"Ahorrado"*), grises (*"Comprado con calma"*) y neutras (*"Cancelado"*).

2. **Modal / Pantalla de Registro de Tentación:**
   - Campo: Nombre del producto (ej. "Tenis Nike").
   - Campo: Precio estimado (\$ MXN).
   - Selector de tiempo rápido:
     - `1 min` (Modo Demo / Examen)
     - `5 min`
     - `15 min`
     - `30 min`
   - Botón de acción: `🛡️ Iniciar enfriamiento`.

### B. Aplicación Smartwatch (Wear OS)
1. **Estado Reposo / Standby:**
   - Esfera circular mostrando logotipo del escudo y texto: *"ImpulseShield activo"*.
   - Si hay una cuenta regresiva corriendo: muestra el nombre del producto y el cronómetro decreciente (`MM:SS`).
2. **Estado Alerta (Al expirar el tiempo):**
   - Vibración háptica en la muñeca (`Vibrator` / Haptic feedback).
   - Encabezado: *"¿Aún lo quieres?"*
   - Texto central: **`{productName}`** y **`${price} MXN`**.
   - Dos botones táctiles accesibles:
     - ❌ **"Ya no lo quiero"** (color verde de ahorro / acento destacado).
     - ✅ **"Sí, comprar"** (color secundario/neutro).
3. **Estado Celebración (Feedback):**
   - Al tocar "Ya no lo quiero": Icono de trofeo/monedas con texto: *"¡Ahorraste ${price}!"* por 3 segundos, antes de volver al reposo.
   - Actualiza automáticamente el estado en Firestore a `'saved'`.

---

## 7. Decisiones técnicas dejadas al Constructor (Builder)
- **Implementación del cliente Wear OS:** Mini-app nativa en Android/Kotlin con Jetpack Compose for Wear OS que consulta Firebase Firestore via SDK de Android o API REST, o una vista webview ligera adaptada a Wear OS.
- **Paleta de diseño:** Modo oscuro por defecto (Dark Slate / Charcoal) con acentos verde esmeralda para el dinero ahorrado y rojo coral para las alertas de impulso.
- **Configuración de Firebase:** Uso de variables de entorno o archivo de configuración local `google-services.json` / credenciales web para pruebas en emulador.
