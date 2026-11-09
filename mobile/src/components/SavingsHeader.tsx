import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { formatCurrency } from '../utils/stats.js';
import type { UserStats } from '../types/impulse.js';

interface Props {
  stats: UserStats;
}

export const SavingsHeader: React.FC<Props> = ({ stats }) => {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.badge}>🛡️ IMPULSE SHIELD</Text>
      </View>
      <Text style={styles.label}>Total Ahorrado</Text>
      <Text style={styles.amount}>{formatCurrency(stats.totalSaved)}</Text>

      <View style={styles.metricsContainer}>
        <View style={styles.metricItem}>
          <Text style={styles.metricValue}>{stats.savedCount}</Text>
          <Text style={styles.metricLabel}>Tentaciones frenadas</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.metricItem}>
          <Text style={styles.metricValue}>{stats.purchasedCount}</Text>
          <Text style={styles.metricLabel}>Compras conscientes</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#0f172a',
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  badge: {
    fontSize: 12,
    fontWeight: '800',
    color: '#10b981',
    letterSpacing: 1.2,
  },
  label: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  amount: {
    color: '#f8fafc',
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: -0.5,
    marginBottom: 18,
  },
  metricsContainer: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  divider: {
    width: 1,
    height: 28,
    backgroundColor: '#334155',
  },
  metricValue: {
    color: '#10b981',
    fontSize: 18,
    fontWeight: '800',
  },
  metricLabel: {
    color: '#cbd5e1',
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
});
