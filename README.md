# 🛡️ ImpulseShield (Examen Aurelio 2)

**ImpulseShield** es una solución integral diseñada para la materia de *Desarrollo de Dispositivos Inteligentes*. Resuelve un problema cotidiano y económico real: **las compras impulsivas y los gastos emocionales**, interponiendo un período de enfriamiento voluntario entre el deseo y la acción de compra mediante un centinela físico en la muñeca (smartwatch con Wear OS).

---

## 📱 ¿Cómo funciona la solución?

1. **Captura del Impulso (Teléfono - React Native / Expo):**
   * El usuario ve un producto tentador en una tienda o en internet.
   * Abre la app e ingresa el nombre del artículo, precio aproximado (\$ MXN) y selecciona un tiempo de enfriamiento (cuenta con selector rápido de **1 minuto** para demostraciones en vivo, 5, 15 y 30 minutos).
   * La app bloquea la creación de nuevos impulsos mientras uno esté activo (concurrencia de 1 solo enfriamiento para máxima disciplina).

2. **El Momento de la Decisión (Smartwatch - Wear OS / Jetpack Compose):**
   * Mientras el tiempo transcurre, la esfera circular del reloj muestra el temporizador en cuenta regresiva decreciente (`MM:SS`).
   * Al expirar el tiempo, el reloj **vibra intensamente en la muñeca** (`Vibrator` / respuesta háptica) y despliega la pregunta clave:
     > **🔔 ¿AÚN LO QUIERES?**  
     > *Audífonos Bluetooth — \$1,200 MXN*
   * Ofrece dos botones táctiles optimizados para pantalla circular:
     * ❌ **"Ya no lo quiero"** (Acción recomendada): Frena el impulso. Muestra una pantalla de victoria en la muñeca (*"🎉 ¡Ahorraste \$1,200 MXN!"*) y suma el dinero a la alcancía acumulada.
     * ✅ **"Sí, comprar"**: Si tras el enfriamiento la persona aún lo desea, se registra como una compra consciente y meditada.

3. **Sincronización en la Nube en Tiempo Real (Firebase Cloud Firestore):**
   * Ambas aplicaciones se comunican instantáneamente sin depender de configuraciones frágiles de Bluetooth entre emuladores.
   * Cualquier acción en el reloj se refleja en menos de un segundo en el móvil y viceversa.
   * Incluye controles de respaldo en el móvil por si el usuario decide desde el teléfono o cancela anticipadamente.

---

## 🛠️ Tecnologías Utilizadas

* **Aplicación Móvil:**
  * React Native (Expo SDK 58, React 19, TypeScript).
  * Cloud Firestore SDK con listeners reactivos en tiempo real (`onSnapshot`).
* **Aplicación Smartwatch:**
  * Android Nativo Wear OS (MinSdk 30 / Wear OS 3+).
  * Jetpack Compose for Wear OS (`androidx.wear.compose.material`).
  * Servicio del sistema Android `Vibrator` para alertas hápticas en la muñeca.
  * Firebase Android SDK Firestore.
* **Backend:**
  * Google Cloud Firestore (`tiltmaze-726ca`).

---

## 🚀 Guía de Ejecución Rápida

### ⚡ Comando Todo en Uno (Recomendado)

En la carpeta raíz del proyecto, ejecuta un solo comando:
```powershell
npm start
```

Este comando automatiza todo el proceso:
1. Detecta si tu emulador de reloj `WearOS7` está abierto; si no, lo enciende automáticamente.
2. Instala la versión más reciente del APK en el reloj.
3. Abre la aplicación **ImpulseShield** en la pantalla del reloj.
4. Inicia el servidor de **Expo** en tu terminal mostrando el código QR para escanear en tu celular (o presiona `w` para navegador).

---

### Comandos individuales (Opcionales):

* **Solo la app móvil:** `npm run mobile`
* **Solo el reloj:** `npm run watch`

---

## 🧪 Demostración del Flujo para el Examen (Prueba de 1 minuto)

1. En la app móvil, pulsa **"+ Frenar Impulso"**.
2. Escribe:
   * **Producto:** `Tenis Deportivos`
   * **Precio:** `2000`
   * **Tiempo:** `⚡ 1 min (Demo)`
3. Presiona **"Iniciar Enfriamiento"**.
4. **Observa el reloj:** Inmediatamente cambiará a la pantalla circular mostrando `01:00` y descontando los segundos en tiempo real.
5. **Espera a que llegue a cero:**
   * El reloj vibrará.
   * Cambiará a la pantalla **"🔔 ¿AÚN LO QUIERES?"**.
6. En el reloj pulsa el botón verde **"❌ Ya no lo quiero"**.
7. **Resultado:**
   * El reloj muestra: *"🎉 ¡AHORRASTE! +$2000 MXN"*.
   * En el teléfono desaparece el enfriamiento y el marcador de **"Total Ahorrado"** sube en **\$2,000 MXN**, quedando registrado en el **Historial de Decisiones**.
