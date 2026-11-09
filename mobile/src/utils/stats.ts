import type { ImpulseItem, UserStats } from '../types/impulse';

export function calculateUserStats(items: ImpulseItem[]): UserStats {
  return items.reduce(
    (acc, item) => {
      if (item.status === 'saved') {
        acc.totalSaved += item.price;
        acc.savedCount += 1;
      } else if (item.status === 'purchased') {
        acc.totalSpent += item.price;
        acc.purchasedCount += 1;
      }
      return acc;
    },
    {
      totalSaved: 0,
      totalSpent: 0,
      savedCount: 0,
      purchasedCount: 0,
    }
  );
}

export function formatCurrency(amount: number, currency: string = 'MXN'): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}
