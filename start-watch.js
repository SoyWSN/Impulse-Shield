import { spawn, execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const apkPath = path.join(__dirname, 'wear', 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk');

console.log('⌚ Abriendo ImpulseShield en el reloj...');
try {
  execSync(`adb install -r "${apkPath}"`, { stdio: 'inherit' });
  execSync('adb shell am start -n com.tiltmaze.app/com.impulseshield.wear.MainActivity', { stdio: 'inherit' });
  console.log('🟢 App abierta en el reloj.');
} catch (e) {
  console.error('Error al comunicar con el reloj:', e.message);
}
