import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { formatCurrency } from '../utils/stats.js';
import type { ImpulseItem } from '../types/impulse.js';

interface Props {
  items: ImpulseItem[];
}

export const HistoryList: React.FC<Props> = ({ items }) => {
  const resolvedItems = items.filter((item) => item.status !== 'active');

  if (resolvedItems.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyEmoji}>🎯</Text>
        <Text style={styles.emptyTitle}>Sin decisiones registradas</Text>
        <Text style={styles.emptySubtitle}>
          Las tentaciones que frenes y tus compras conscientes aparecerán aquí.
        </Text>
      </View>
    );
  }

  const renderBadge = (status: ImpulseItem['status']) => {
    switch (status) {
      case 'saved':
        return (
          <View style={[styles.badge, styles.badgeSaved]}>
            <Text style={styles.badgeTextSaved}>🎉 Ahorrado</Text>
          </View>
        );
      case 'purchased':
        return (
          <View style={[styles.badge, styles.badgePurchased]}>
            <Text style={styles.badgeTextPurchased}>🛍️ Comprado</Text>
          </View>
        );
      case 'dismissed':
      default:
        return (
          <View style={[styles.badge, styles.badgeDismissed]}>
            <Text style={styles.badgeTextDismissed}>Descartado</Text>
          </View>
        );
    }
  };

  const formatDate = (timestamp: number) => {
    const d = new Date(timestamp);
    return d.toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Historial de Decisiones</Text>
      {resolvedItems.map((item) => (
        <View key={item.id} style={styles.itemCard}>
          <View style={styles.itemHeader}>
            <Text style={styles.itemProduct}>{item.productName}</Text>
            {renderBadge(item.status)}
          </View>
          <View style={styles.itemFooter}>
            <Text style={styles.itemDate}>{formatDate(item.createdAt)}</Text>
            <Text
              style={[
                styles.itemPrice,
                item.status === 'saved' && styles.itemPriceSaved,
              ]}
            >
              {item.status === 'saved' ? `+${formatCurrency(item.price, item.currency)}` : formatCurrency(item.price, item.currency)}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 40,
  },
  sectionTitle: {
    color: '#cbd5e1',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  itemCard: {
    backgroundColor: '#0f172a',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemProduct: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
    marginRight: 10,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeSaved: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  badgeTextSaved: {
    color: '#10b981',
    fontSize: 11,
    fontWeight: '700',
  },
  badgePurchased: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
  },
  badgeTextPurchased: {
    color: '#38bdf8',
    fontSize: 11,
    fontWeight: '700',
  },
  badgeDismissed: {
    backgroundColor: 'rgba(148, 163, 184, 0.15)',
  },
  badgeTextDismissed: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '600',
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemDate: {
    color: '#64748b',
    fontSize: 12,
  },
  itemPrice: {
    color: '#cbd5e1',
    fontSize: 15,
    fontWeight: '800',
  },
  itemPriceSaved: {
    color: '#10b981',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    marginHorizontal: 24,
  },
  emptyEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  emptyTitle: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  emptySubtitle: {
    color: '#64748b',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
});
