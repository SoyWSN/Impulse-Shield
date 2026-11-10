import { spawn, execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('\n======================================================');
console.log('  🛡️   IMPULSESHIELD - INICIANDO SISTEMA COMPLETO    ');
console.log('======================================================\n');

/**
 * Revisa si ya existe un emulador Wear OS conectado y listo en ADB
 */
function isEmulatorReady() {
  try {
    const output = execSync('adb devices', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
    const lines = output.split('\n');
    for (const line of lines) {
      if (line.includes('emulator-') && line.includes('device') && !line.includes('offline') && !line.includes('unauthorized')) {
        return true;
      }
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Rutina para encender el reloj, instalar el APK y abrir la aplicación
 */
async function launchWearOS() {
  const apkPath = path.join(__dirname, 'wear', 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk');

  if (!isEmulatorReady()) {
    console.log('⌚ [Reloj] Iniciando emulador Wear OS (WearOS7)...');
    try {
      const emu = spawn('emulator', ['-avd', 'WearOS7'], {
        detached: true,
        stdio: 'ignore',
        shell: true,
      });
      emu.unref();
    } catch (err) {
      console.log('⚠️  [Reloj] No se pudo invocar emulator directamente. Si ya está abierto, se usará el actual.');
    }

    console.log('⏳ [Reloj] Esperando a que el sistema Wear OS termine de arrancar...');
    let ready = false;
    let attempts = 0;
    while (!ready && attempts < 45) {
      await new Promise((r) => setTimeout(r, 2000));
      attempts++;
      try {
        const prop = execSync('adb shell getprop sys.boot_completed', {
          encoding: 'utf8',
          stdio: ['pipe', 'pipe', 'ignore'],
        }).trim();
        if (prop === '1') {
          ready = true;
        }
      } catch {
        // Aún arrancando
      }
    }

    if (ready) {
      console.log('✨ [Reloj] Emulador Wear OS iniciado con éxito.');
    } else {
      console.log('⏳ [Reloj] Continuando arranque en segundo plano...');
    }
  } else {
    console.log('⌚ [Reloj] Emulador Wear OS detectado y listo.');
  }

  // Instalar y abrir la app en el reloj
  try {
    console.log('📲 [Reloj] Verificando e instalando app...');
    execSync(`adb install -r "${apkPath}"`, { stdio: 'ignore' });
    execSync('adb shell am start -n com.tiltmaze.app/com.impulseshield.wear.MainActivity', { stdio: 'ignore' });
    console.log('🟢 [Reloj] ¡App ImpulseShield abierta y en guardia en el reloj!\n');
  } catch (e) {
    console.log('💡 [Reloj] Nota: Cuando el reloj termine de cargar, la app se abrirá automáticamente.');
  }
}

// 1. Iniciar la rutina del reloj en paralelo
launchWearOS();

// 2. Iniciar Expo inmediatamente para mostrar el código QR interactivo
console.log('📱 [Móvil] Iniciando servidor Expo para tu celular o navegador...\n');
const expo = spawn('npx', ['expo', 'start'], {
  cwd: path.join(__dirname, 'mobile'),
  stdio: 'inherit',
  shell: true,
});

expo.on('exit', (code) => {
  process.exit(code || 0);
});
