import { describe, it, expect } from 'vitest';
import { calculateUserStats } from '../stats.js';
import type { ImpulseItem } from '../../types/impulse.js';

describe('calculateUserStats', () => {
  it('calculates total saved, total spent and counts correctly', () => {
    const items: ImpulseItem[] = [
      {
        id: '1',
        productName: 'Audífonos Sony',
        price: 1500,
        currency: 'MXN',
        durationSeconds: 900,
        createdAt: 1000,
        expiresAt: 2000,
        status: 'saved',
        resolvedAt: 2100,
      },
      {
        id: '2',
        productName: 'Funda para celular',
        price: 300,
        currency: 'MXN',
        durationSeconds: 300,
        createdAt: 3000,
        expiresAt: 4000,
        status: 'saved',
        resolvedAt: 4100,
      },
      {
        id: '3',
        productName: 'Café de especialidad',
        price: 95,
        currency: 'MXN',
        durationSeconds: 60,
        createdAt: 5000,
        expiresAt: 6000,
        status: 'purchased',
        resolvedAt: 6100,
      },
      {
        id: '4',
        productName: 'Camisa en rebaja',
        price: 450,
        currency: 'MXN',
        durationSeconds: 600,
        createdAt: 7000,
        expiresAt: 8000,
        status: 'dismissed', // Cancelado / descartado sin comprar
        resolvedAt: 7500,
      },
      {
        id: '5',
        productName: 'Tenis deportivos',
        price: 2200,
        currency: 'MXN',
        durationSeconds: 1800,
        createdAt: 9000,
        expiresAt: 10000,
        status: 'active', // Aún en enfriamiento
      },
    ];

    const stats = calculateUserStats(items);

    expect(stats.totalSaved).toBe(1800); // 1500 + 300
    expect(stats.savedCount).toBe(2);
    expect(stats.totalSpent).toBe(95);
    expect(stats.purchasedCount).toBe(1);
  });

  it('handles empty list returning zeros', () => {
    const stats = calculateUserStats([]);
    expect(stats).toEqual({
      totalSaved: 0,
      totalSpent: 0,
      savedCount: 0,
      purchasedCount: 0,
    });
  });
});
