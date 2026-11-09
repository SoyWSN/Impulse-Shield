# ImpulseShield Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir una solución completa compuesta por una aplicación móvil en React Native y una aplicación para Wear OS sincronizadas en tiempo real mediante Firebase Firestore, diseñada para frenar compras impulsivas mediante un temporizador de enfriamiento y refuerzo positivo de ahorro acumulado.

**Architecture:** La aplicación móvil (React Native) actúa como interfaz de registro y visualización de métricas de ahorro personal. La aplicación de smartwatch (Wear OS) actúa como centinela en la muñeca, escuchando en tiempo real vía Firebase Firestore el temporizador activo, disparando vibración háptica al vencer y permitiendo tomar la decisión inmediata ("Ya no lo quiero" vs. "Comprar").

**Tech Stack:** 
- Mobile: React Native (Expo SDK 52+), TypeScript, `@react-native-async-storage/async-storage`, Firebase JS SDK / Firestore.
- Smartwatch: Android Wear OS con Kotlin & Jetpack Compose for Wear OS (o WebView circular optimizada), Firebase Firestore SDK.
- Backend/Data: Google Cloud Firestore.

**Spec:** [`docs/superpowers/specs/2026-11-09-impulse-shield-design.md`](file:///c:/Users/oskar/Desktop/Code/DesarrolloDispositivosInteligentes/ExamenAurelio2/docs/superpowers/specs/2026-11-09-impulse-shield-design.md)

## Global Constraints
- Concurrency: Estrictamente 1 solo impulso activo en estado `active` a la vez.
- Platform: Android Phone (React Native) y Android Wear OS Emulator (Circular screen).
- Timeouts demo: Debe incluir un selector de 1 minuto (`1 min`) para pruebas ágiles en presentación/evaluación.
- Persistence: Los totales ahorrados y las compras realizadas deben persistirse en Firestore y reflejarse reactivamente sin recargar la pantalla.

## Review Focus
1. **Pérdida de conectividad durante el enfriamiento:** Si el reloj o teléfono pierden internet momentáneamente, el temporizador local debe calcular el tiempo restante usando timestamps absolutos (`expiresAt`) y no contadores relativos decrementales.
2. **Condición de carrera entre reloj y móvil:** Si el usuario resuelve el impulso en el móvil mientras el reloj está vibrando, el reloj debe detectar el cambio de estado en Firestore y cancelar la alerta inmediatamente.
3. **Persistencia de sesión / usuario:** En entorno de examen, no requerir login con contraseña; usar un ID de dispositivo o usuario persistente (`demo_user`) para que las métricas no se pierdan al reiniciar la app.
4. **Pantalla circular en Wear OS:** Los botones "Ya no lo quiero" y "Comprar" deben respetar los bordes curvos de la pantalla para no quedar recortados (usando componentes específicos de Wear OS o `ScalingLazyColumn`).
5. **Precisión de precios y formateo de moneda:** Formatear siempre como `$X,XXX MXN` sin errores de redondeo en flotantes.

---

## Estructura de Fases y Tareas

### Fase 1: Arquitectura Base, Tipos y Capa de Datos (Firebase)

#### Task 1: Scaffolding del proyecto móvil y configuración de Firestore
**Files:**
- Create: `mobile/package.json`
- Create: `mobile/src/types/impulse.ts`
- Create: `mobile/src/services/firebase.ts`
- Test: `mobile/src/services/__tests__/statsCalculator.test.ts`

**Interfaces:**
- Produces: `ImpulseItem`, `UserStats`, `calculateUserStats(items: ImpulseItem[]): UserStats`

- [ ] **Step 1: Crear definición de tipos `mobile/src/types/impulse.ts`**
  Definir la interfaz `ImpulseItem` (`id`, `productName`, `price`, `currency`, `durationSeconds`, `createdAt`, `expiresAt`, `status`, `resolvedAt`) y `UserStats` (`totalSaved`, `totalSpent`, `savedCount`, `purchasedCount`).

- [ ] **Step 2: Escribir prueba unitaria para `calculateUserStats`**
  Probar que una lista con 2 items `saved` ($500 y $1500) y 1 `purchased` ($200) produce `totalSaved: 2000`, `savedCount: 2`, `totalSpent: 200`, `purchasedCount: 1`.

- [ ] **Step 3: Ejecutar pruebas y verificar fallo inicial**
  Ejecutar: `npm test` en `mobile/`.
  Resultado esperado: FAIL (módulo no implementado).

- [ ] **Step 4: Implementar `calculateUserStats` en `mobile/src/utils/stats.ts`**
  Implementar la función reductora pura.

- [ ] **Step 5: Configurar cliente de Firebase en `mobile/src/services/firebase.ts`**
  Configurar inicialización de Firebase App y exportar instancia de `db` (Firestore) con emulador/credenciales de configuración.

- [ ] **Step 6: Verificar pruebas y commit**
  Ejecutar `npm test` -> PASS.
  Commit: `git commit -m "feat(mobile): add types, stats calculator and firebase configuration"`

---

### Fase 2: Aplicación Móvil (React Native)

#### Task 2: Servicio de Gestión de Impulsos (Firestore CRUD & Listeners)
**Files:**
- Create: `mobile/src/services/impulseService.ts`
- Test: `mobile/src/services/__tests__/impulseService.test.ts`

**Interfaces:**
- Produces: 
  - `createImpulse(productName: string, price: number, durationSeconds: number): Promise<string>`
  - `subscribeToActiveImpulse(callback: (item: ImpulseItem | null) => void): () => void`
  - `resolveImpulse(id: string, status: 'saved' | 'purchased' | 'dismissed'): Promise<void>`
  - `subscribeToHistory(callback: (items: ImpulseItem[]) => void): () => void`

- [ ] **Step 1: Escribir tests mockeando Firestore para `createImpulse` y `resolveImpulse`**
  Verificar que `createImpulse` calcula `expiresAt = createdAt + (durationSeconds * 1000)` y asigna `status: 'active'`.

- [ ] **Step 2: Implementar `impulseService.ts`**
  Implementar los métodos con validación de concurrencia (no permitir crear si ya existe uno activo).

- [ ] **Step 3: Ejecutar tests y verificar éxito**
  Ejecutar `npm test` -> PASS.

- [ ] **Step 4: Commit**
  Commit: `git commit -m "feat(mobile): implement firestore impulse service with real-time listeners"`

---

#### Task 3: Pantallas del Móvil (Dashboard, Enfriamiento Activo e Historial)
**Files:**
- Create: `mobile/src/components/SavingsHeader.tsx`
- Create: `mobile/src/components/ActiveCountdownCard.tsx`
- Create: `mobile/src/components/CreateImpulseModal.tsx`
- Create: `mobile/src/components/HistoryList.tsx`
- Create: `mobile/src/screens/HomeScreen.tsx`

**Interfaces:**
- Consumes: `impulseService.ts`, `stats.ts`
- Produces: `HomeScreen` con vista integrada y actualizaciones en vivo.

- [ ] **Step 1: Implementar `SavingsHeader.tsx`**
  Mostrar banner de total ahorrado con formato de moneda `$X,XXX MXN`, conteo de impulsos frenados y compras conscientes.

- [ ] **Step 2: Implementar `ActiveCountdownCard.tsx`**
  Tarjeta de enfriamiento en vivo:
  - Nombre del producto y precio.
  - Temporizador decreciente en formato `MM:SS`.
  - Botón "Cancelar enfriamiento" (`status: 'dismissed'`).
  - Botones de fallback: "Ya no lo quiero" (`status: 'saved'`) y "Comprar" (`status: 'purchased'`).

- [ ] **Step 3: Implementar `CreateImpulseModal.tsx`**
  Formulario modal con input de producto, input numérico de precio y selector de duración rápida: `1 min` (demo), `5 min`, `15 min`, `30 min`.

- [ ] **Step 4: Implementar `HistoryList.tsx`**
  Lista de transacciones resueltas con badges de color: Verde (`Ahorrado`), Gris (`Comprado`), Neutro (`Cancelado`).

- [ ] **Step 5: Integrar en `HomeScreen.tsx`**
  Conectar los listeners de Firestore en tiempo real para refrescar estado activo e historial automáticamente.

- [ ] **Step 6: Commit**
  Commit: `git commit -m "feat(mobile): build dashboard, cooldown card, modal and history list"`

---

### Fase 3: Aplicación Smartwatch (Wear OS)

#### Task 4: Scaffolding y Conexión de Wear OS con Firestore
**Files:**
- Create: `wear/app/build.gradle.kts`
- Create: `wear/app/src/main/AndroidManifest.xml`
- Create: `wear/app/src/main/java/com/impulseshield/wear/data/ImpulseRepository.kt`
- Create: `wear/app/src/main/java/com/impulseshield/wear/model/ImpulseState.kt`

**Interfaces:**
- Produces: `ImpulseRepository.listenToActiveImpulse(): Flow<ImpulseState>`

- [ ] **Step 1: Configurar dependencias de Wear OS y Firebase en `wear/app/build.gradle.kts`**
  Incluir dependencias de `androidx.wear.compose:compose-material`, `androidx.wear:wear` y Firebase Firestore.

- [ ] **Step 2: Configurar permisos de vibración en `AndroidManifest.xml`**
  Declarar `<uses-permission android:name="android.permission.VIBRATE"/>` y soporte para pantalla circular.

- [ ] **Step 3: Implementar `ImpulseRepository.kt`**
  Escuchar el documento activo en Firestore y emitir el estado actual (`Idle`, `CountingDown(remainingSeconds)`, `AlertPending(productName, price)`, `Celebration(savedAmount)`).

- [ ] **Step 4: Commit**
  Commit: `git commit -m "feat(wear): setup wear os project structure and firestore repository"`

---

#### Task 5: Pantallas y Experiencia Háptica en Wear OS (Jetpack Compose)
**Files:**
- Create: `wear/app/src/main/java/com/impulseshield/wear/presentation/theme/Theme.kt`
- Create: `wear/app/src/main/java/com/impulseshield/wear/presentation/screens/IdleScreen.kt`
- Create: `wear/app/src/main/java/com/impulseshield/wear/presentation/screens/CountdownScreen.kt`
- Create: `wear/app/src/main/java/com/impulseshield/wear/presentation/screens/AlertScreen.kt`
- Create: `wear/app/src/main/java/com/impulseshield/wear/presentation/screens/CelebrationScreen.kt`
- Create: `wear/app/src/main/java/com/impulseshield/wear/MainActivity.kt`

**Interfaces:**
- Consumes: `ImpulseRepository.kt`
- Produces: UI interactiva completa optimizada para esfera de Wear OS.

- [ ] **Step 1: Implementar `IdleScreen.kt` y `CountdownScreen.kt`**
  - `IdleScreen`: Icono de escudo, texto: *"ImpulseShield activo"*.
  - `CountdownScreen`: Nombre del producto, precio y temporizador en minutos y segundos.

- [ ] **Step 2: Implementar disparador de vibración y `AlertScreen.kt`**
  - Activar patrón de vibración háptica al cambiar al estado de alerta.
  - Título: *"¿Aún lo quieres?"*.
  - Texto grande: `$Precio MXN` y nombre.
  - Botón destacado ❌ *"Ya no lo quiero"* (llama a `resolveImpulse(id, 'saved')`).
  - Botón secundario ✅ *"Comprar"* (llama a `resolveImpulse(id, 'purchased')`).

- [ ] **Step 3: Implementar `CelebrationScreen.kt`**
  Animación/mensaje de victoria: *"¡Ahorraste $X MXN!"*, permanece 3 segundos y regresa automáticamente a `IdleScreen`.

- [ ] **Step 4: Ensamblar en `MainActivity.kt`**
  Mapear el flujo con la máquina de estados reactiva.

- [ ] **Step 5: Commit**
  Commit: `git commit -m "feat(wear): implement wear os compose screens with haptic feedback and celebration"`

---

### Fase 4: Integración, Pruebas End-to-End y Demostración

#### Task 6: Pruebas de Sincronización y Validación del Flujo de Examen
**Files:**
- Create: `scripts/demo-test.md`
- Test: Sincronización en vivo entre Emulador Android (Teléfono) y Emulador Wear OS (Reloj).

- [ ] **Step 1: Prueba de creación y visualización**
  Registrar en el móvil: "Audífonos Bluetooth", precio "$1,200", tiempo: 1 minuto. Verificar que el reloj pasa al estado de cuenta regresiva en menos de 1 segundo.

- [ ] **Step 2: Prueba de expiración de tiempo y alerta háptica**
  Esperar a que expire el minuto. Verificar que el reloj vibra y muestra la pantalla "¿Aún lo quieres?".

- [ ] **Step 3: Prueba de rechazo de impulso (Victoria de ahorro)**
  Pulsar "Ya no lo quiero" en el reloj. Verificar:
  - En el reloj: Aparece pantalla de felicitación "¡Ahorraste $1,200!".
  - En el móvil: La tarjeta de enfriamiento desaparece, el historial muestra el item como "Ahorrado" y el contador de total ahorrado se incrementa en $1,200 MXN.

- [ ] **Step 4: Prueba de fallback en móvil**
  Registrar un segundo artículo y pulsar "Cancelar" o "Comprar" desde el teléfono. Verificar que el reloj cancela su pantalla de inmediato.

- [ ] **Step 5: Documentar instrucciones de ejecución rápida para el evaluador**
  Crear guía paso a paso en `README.md` para arrancar ambos emuladores y ejecutar la demo del examen.

- [ ] **Step 6: Commit final**
  Commit: `git commit -m "docs: add demo run guide and verify end-to-end synchronization"`
