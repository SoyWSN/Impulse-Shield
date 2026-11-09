import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Configuración de Firebase para ImpulseShield
// Se puede reemplazar con las credenciales de tu proyecto de Firebase Console
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "AIzaSyDemoImpulseShieldKey2026",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "impulse-shield-demo.firebaseapp.com",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "impulse-shield-demo",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "impulse-shield-demo.appspot.com",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789012",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "1:123456789012:web:abcdef1234567890"
};

// Inicializar singleton de Firebase
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);

// Constantes de colecciones
export const COLLECTIONS = {
  IMPULSES: 'impulses',
  USER_STATS: 'user_stats'
} as const;
