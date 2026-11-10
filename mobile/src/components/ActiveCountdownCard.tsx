import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { formatCurrency } from '../utils/stats';
import type { ImpulseItem } from '../types/impulse';

interface Props {
  item: ImpulseItem;
  onResolve: (id: string, status: 'saved' | 'purchased' | 'dismissed') => Promise<void>;
}

export const ActiveCountdownCard: React.FC<Props> = ({ item, onResolve }) => {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);
  const [progressRatio, setProgressRatio] = useState<number>(1);
  const [isResolving, setIsResolving] = useState<boolean>(false);

  useEffect(() => {
    const updateCountdown = () => {
      const now = Date.now();
      const diffMs = item.expiresAt - now;
      const remaining = Math.max(0, Math.floor(diffMs / 1000));
      setSecondsRemaining(remaining);

      const totalDuration = item.durationSeconds || 60;
      const ratio = Math.max(0, Math.min(1, remaining / totalDuration));
      setProgressRatio(ratio);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [item.expiresAt, item.durationSeconds]);

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
    <View style={[styles.card, isExpired ? styles.cardExpired : styles.cardActive]}>
      {/* Top status bar */}
      <View style={styles.topRow}>
        <View style={[styles.statusPill, isExpired ? styles.statusPillExpired : styles.statusPillActive]}>
          <Feather
            name={isExpired ? 'bell' : 'clock'}
            size={12}
            color={isExpired ? '#f59e0b' : '#10b981'}
            style={styles.statusIcon}
          />
          <Text style={[styles.statusText, isExpired ? styles.statusTextExpired : styles.statusTextActive]}>
            {isExpired ? 'TIEMPO CUMPLIDO' : 'ENFRIAMIENTO ACTIVO'}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => handleAction('dismissed')}
          disabled={isResolving}
          style={styles.discardButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Feather name="x" size={16} color="#64748b" />
          <Text style={styles.discardText}>Descartar</Text>
        </TouchableOpacity>
      </View>

      {/* Product Details */}
      <View style={styles.infoRow}>
        <View style={styles.infoLeft}>
          <Text style={styles.productName} numberOfLines={1}>
            {item.productName}
          </Text>
          <Text style={styles.priceSubtext}>Precio evaluado</Text>
        </View>
        <Text style={styles.priceTag}>
          {formatCurrency(item.price, item.currency)}
        </Text>
      </View>

      {/* Big Timer display with progress bar */}
      <View style={styles.timerContainer}>
        <Text style={[styles.timerDigits, isExpired && styles.timerDigitsExpired]}>
          {formatTimer(secondsRemaining)}
        </Text>

        <View style={styles.progressBarTrack}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${Math.round(progressRatio * 100)}%` },
              isExpired && styles.progressBarFillExpired,
            ]}
          />
        </View>

        <Text style={styles.timerHint}>
          {isExpired
            ? 'El reloj Wear OS ha emitido la alerta háptica. Decide ahora:'
            : 'Pausa voluntaria. Espera que la emoción del momento disminuya.'}
        </Text>
      </View>

      {/* Decision Buttons */}
      {isResolving ? (
        <View style={styles.resolvingContainer}>
          <ActivityIndicator color="#10b981" />
        </View>
      ) : (
        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={styles.primaryActionButton}
            onPress={() => handleAction('saved')}
            activeOpacity={0.8}
          >
            <Feather name="check" size={16} color="#ffffff" style={styles.btnIcon} />
            <Text style={styles.primaryActionText}>Ya no lo quiero</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryActionButton}
            onPress={() => handleAction('purchased')}
            activeOpacity={0.8}
          >
            <Feather name="shopping-bag" size={15} color="#94a3b8" style={styles.btnIcon} />
            <Text style={styles.secondaryActionText}>Comprar</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#0c0f17',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 20,
    borderWidth: 1,
  },
  cardActive: {
    borderColor: '#1e293b',
    borderLeftWidth: 3,
    borderLeftColor: '#10b981',
  },
  cardExpired: {
    borderColor: '#78350f',
    borderLeftWidth: 3,
    borderLeftColor: '#f59e0b',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 9,
    borderRadius: 6,
  },
  statusPillActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  statusPillExpired: {
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
  },
  statusIcon: {
    marginRight: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  statusTextActive: {
    color: '#10b981',
  },
  statusTextExpired: {
    color: '#f59e0b',
  },
  discardButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  discardText: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoLeft: {
    flex: 1,
    marginRight: 12,
  },
  productName: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  priceSubtext: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  priceTag: {
    color: '#f8fafc',
    fontSize: 20,
    fontWeight: '800',
  },
  timerContainer: {
    backgroundColor: '#131825',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1e2638',
  },
  timerDigits: {
    color: '#ffffff',
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: 2,
    fontVariant: ['tabular-nums'],
    marginBottom: 12,
  },
  timerDigitsExpired: {
    color: '#f59e0b',
  },
  progressBarTrack: {
    width: '100%',
    height: 4,
    backgroundColor: '#1e2638',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 2,
  },
  progressBarFillExpired: {
    backgroundColor: '#f59e0b',
  },
  timerHint: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 16,
  },
  resolvingContainer: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  primaryActionButton: {
    flex: 1.2,
    backgroundColor: '#10b981',
    paddingVertical: 13,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryActionText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  secondaryActionButton: {
    flex: 1,
    backgroundColor: '#151b28',
    paddingVertical: 13,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#1e2638',
  },
  secondaryActionText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '600',
  },
  btnIcon: {
    marginRight: 6,
  },
});
