import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { formatCurrency } from '../utils/stats.js';
import type { ImpulseItem } from '../types/impulse.js';

interface Props {
  item: ImpulseItem;
  onResolve: (id: string, status: 'saved' | 'purchased' | 'dismissed') => Promise<void>;
}

export const ActiveCountdownCard: React.FC<Props> = ({ item, onResolve }) => {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);
  const [isResolving, setIsResolving] = useState<boolean>(false);

  useEffect(() => {
    const updateCountdown = () => {
      const now = Date.now();
      const diffMs = item.expiresAt - now;
      const remaining = Math.max(0, Math.floor(diffMs / 1000));
      setSecondsRemaining(remaining);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [item.expiresAt]);

  const formatTimer = (totalSeconds: number): string => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isExpired = secondsRemaining <= 0;

  const handleAction = async (status: 'saved' | 'purchased' | 'dismissed') => {
    try {
      setIsResolving(true);
      await onResolve(item.id, status);
    } finally {
      setIsResolving(false);
    }
  };

  return (
    <View style={[styles.card, isExpired && styles.cardExpired]}>
      <View style={styles.topRow}>
        <View style={styles.badgeContainer}>
          <Text style={styles.badgeText}>
            {isExpired ? '⏰ TIEMPO CUMPLIDO' : '⏳ ENFRIAMIENTO ACTIVO'}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => handleAction('dismissed')}
          disabled={isResolving}
          style={styles.cancelBtn}
        >
          <Text style={styles.cancelText}>Descartar</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.productName}>{item.productName}</Text>
      <Text style={styles.price}>{formatCurrency(item.price, item.currency)}</Text>

      <View style={styles.timerBox}>
        <Text style={styles.timerText}>{formatTimer(secondsRemaining)}</Text>
        <Text style={styles.timerSubtext}>
          {isExpired ? 'Revisa tu smartwatch o decide aquí:' : 'Tiempo de espera para enfriar el impulso'}
        </Text>
      </View>

      {isResolving ? (
        <ActivityIndicator color="#10b981" style={{ marginVertical: 16 }} />
      ) : (
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.btn, styles.btnReject]}
            onPress={() => handleAction('saved')}
            activeOpacity={0.8}
          >
            <Text style={styles.btnRejectText}>❌ Ya no lo quiero</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btn, styles.btnAccept]}
            onPress={() => handleAction('purchased')}
            activeOpacity={0.8}
          >
            <Text style={styles.btnAcceptText}>✅ Comprar</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 18,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: '#38bdf8',
  },
  cardExpired: {
    borderColor: '#f59e0b',
    backgroundColor: '#1e2538',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  badgeContainer: {
    backgroundColor: '#0284c7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  cancelBtn: {
    padding: 4,
  },
  cancelText: {
    color: '#94a3b8',
    fontSize: 12,
    textDecorationLine: 'underline',
  },
  productName: {
    color: '#f8fafc',
    fontSize: 22,
    fontWeight: '800',
    marginTop: 4,
  },
  price: {
    color: '#38bdf8',
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 14,
  },
  timerBox: {
    backgroundColor: '#0f172a',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  timerText: {
    color: '#38bdf8',
    fontSize: 40,
    fontWeight: '900',
    letterSpacing: 2,
    fontVariant: ['tabular-nums'],
  },
  timerSubtext: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  btn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnReject: {
    backgroundColor: '#10b981',
  },
  btnRejectText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 14,
  },
  btnAccept: {
    backgroundColor: '#334155',
  },
  btnAcceptText: {
    color: '#cbd5e1',
    fontWeight: '700',
    fontSize: 14,
  },
});
