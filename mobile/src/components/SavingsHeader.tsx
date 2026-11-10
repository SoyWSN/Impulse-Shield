import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { formatCurrency } from '../utils/stats';
import type { UserStats } from '../types/impulse';

interface Props {
  stats: UserStats;
}

export const SavingsHeader: React.FC<Props> = ({ stats }) => {
  return (
    <View style={styles.container}>
      {/* Hero Metric */}
      <View style={styles.heroSection}>
        <Text style={styles.heroLabel}>TOTAL AHORRADO</Text>
        <Text style={styles.heroAmount}>{formatCurrency(stats.totalSaved)}</Text>
      </View>

      {/* Metrics Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <View style={styles.statIconWrapper}>
            <Feather name="check-circle" size={15} color="#10b981" />
          </View>
          <View style={styles.statTextGroup}>
            <Text style={styles.statValue}>{stats.savedCount}</Text>
            <Text style={styles.statLabel}>Impulsos frenados</Text>
          </View>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIconWrapper, styles.statIconSecondary]}>
            <Feather name="shopping-bag" size={15} color="#94a3b8" />
          </View>
          <View style={styles.statTextGroup}>
            <Text style={styles.statValueSecondary}>{stats.purchasedCount}</Text>
            <Text style={styles.statLabel}>Compras meditadas</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0c0f17',
    borderRadius: 24,
    padding: 22,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1b2234',
  },
  heroSection: {
    marginBottom: 18,
  },
  heroLabel: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 4,
  },
  heroAmount: {
    color: '#ffffff',
    fontSize: 38,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#131825',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1e2638',
  },
  statIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  statIconSecondary: {
    backgroundColor: 'rgba(148, 163, 184, 0.1)',
  },
  statTextGroup: {
    flex: 1,
  },
  statValue: {
    color: '#10b981',
    fontSize: 17,
    fontWeight: '800',
    lineHeight: 20,
  },
  statValueSecondary: {
    color: '#e2e8f0',
    fontSize: 17,
    fontWeight: '800',
    lineHeight: 20,
  },
  statLabel: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
});
