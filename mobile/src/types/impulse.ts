export type ImpulseStatus = 'active' | 'saved' | 'purchased' | 'dismissed';

export interface ImpulseItem {
  id: string;
  productName: string;
  price: number;
  currency: string;
  durationSeconds: number;
  createdAt: number; // Unix timestamp en ms
  expiresAt: number; // Unix timestamp en ms
  status: ImpulseStatus;
  resolvedAt?: number;
}

export interface UserStats {
  totalSaved: number;
  totalSpent: number;
  savedCount: number;
  purchasedCount: number;
}
