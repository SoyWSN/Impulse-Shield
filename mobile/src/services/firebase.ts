import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Configuración reutilizada del proyecto Firebase existente (tiltmaze-726ca)
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "AIzaSyAzIiYgdqQy2WXHGIXB5u93bRXauhe-KTo",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "tiltmaze-726ca.firebaseapp.com",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "tiltmaze-726ca",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "tiltmaze-726ca.firebasestorage.app",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "721187364574",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "1:721187364574:android:69c7e73238bb2449f4ac4f"
};

// Inicializar singleton de Firebase
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);

// Constantes de colecciones
export const COLLECTIONS = {
  IMPULSES: 'impulses',
  USER_STATS: 'user_stats'
} as const;
