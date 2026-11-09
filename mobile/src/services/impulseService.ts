import {
  collection,
  doc,
  addDoc,
  updateDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  Unsubscribe
} from 'firebase/firestore';
import { db, COLLECTIONS } from './firebase';
import type { ImpulseItem, ImpulseStatus } from '../types/impulse';

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateImpulseInput(
  productName: string,
  price: number,
  durationSeconds: number
): ValidationResult {
  if (!productName || productName.trim().length === 0) {
    return { valid: false, error: 'El nombre del producto no puede estar vacío.' };
  }
  if (typeof price !== 'number' || isNaN(price) || price <= 0) {
    return { valid: false, error: 'El precio debe ser un número mayor a 0.' };
  }
  if (typeof durationSeconds !== 'number' || isNaN(durationSeconds) || durationSeconds <= 0) {
    return { valid: false, error: 'El tiempo de enfriamiento debe ser mayor a 0 segundos.' };
  }
  return { valid: true };
}

/**
 * Crea un nuevo impulso de compra en estado 'active' en Firestore.
 */
export async function createImpulse(
  productName: string,
  price: number,
  durationSeconds: number,
  currency: string = 'MXN'
): Promise<string> {
  const validation = validateImpulseInput(productName, price, durationSeconds);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const now = Date.now();
  const expiresAt = now + durationSeconds * 1000;

  const docRef = await addDoc(collection(db, COLLECTIONS.IMPULSES), {
    productName: productName.trim(),
    price: Math.round(price),
    currency,
    durationSeconds,
    createdAt: now,
    expiresAt,
    status: 'active' as ImpulseStatus,
  });

  return docRef.id;
}

/**
 * Escucha en tiempo real si existe un impulso actualmente en estado 'active'.
 * Emite el item activo o null.
 * (Nota: No usamos orderBy en la consulta compuesta para evitar requerir índices compuestos en Firebase).
 */
export function subscribeToActiveImpulse(
  callback: (item: ImpulseItem | null) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const q = query(
    collection(db, COLLECTIONS.IMPULSES),
    where('status', '==', 'active')
  );

  return onSnapshot(
    q,
    (snapshot) => {
      if (snapshot.empty) {
        callback(null);
      } else {
        // Ordenamos en memoria para obtener el más reciente sin requerir índices compuestos en Firestore
        const sortedDocs = [...snapshot.docs].sort(
          (a, b) => (b.data().createdAt || 0) - (a.data().createdAt || 0)
        );
        const docSnap = sortedDocs[0];
        const data = docSnap.data();
        callback({
          id: docSnap.id,
          productName: data.productName,
          price: data.price,
          currency: data.currency || 'MXN',
          durationSeconds: data.durationSeconds,
          createdAt: data.createdAt,
          expiresAt: data.expiresAt,
          status: data.status,
          resolvedAt: data.resolvedAt,
        });
      }
    },
    (error) => {
      console.error('Error escuchando impulso activo:', error);
      if (onError) onError(error);
    }
  );
}

/**
 * Actualiza el estado de un impulso ('saved' | 'purchased' | 'dismissed').
 */
export async function resolveImpulse(
  id: string,
  status: 'saved' | 'purchased' | 'dismissed'
): Promise<void> {
  const impulseRef = doc(db, COLLECTIONS.IMPULSES, id);
  await updateDoc(impulseRef, {
    status,
    resolvedAt: Date.now(),
  });
}

/**
 * Escucha en tiempo real todo el historial de impulsos ordenado cronológicamente.
 */
export function subscribeToAllImpulses(
  callback: (items: ImpulseItem[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const q = query(
    collection(db, COLLECTIONS.IMPULSES),
    orderBy('createdAt', 'desc'),
    limit(50)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const items: ImpulseItem[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          productName: data.productName,
          price: data.price,
          currency: data.currency || 'MXN',
          durationSeconds: data.durationSeconds,
          createdAt: data.createdAt,
          expiresAt: data.expiresAt,
          status: data.status,
          resolvedAt: data.resolvedAt,
        };
      });
      callback(items);
    },
    (error) => {
      console.error('Error escuchando historial de impulsos:', error);
      if (onError) onError(error);
    }
  );
}
