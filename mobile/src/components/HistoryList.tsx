import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { formatCurrency } from '../utils/stats';
import type { ImpulseItem } from '../types/impulse';

interface Props {
  items: ImpulseItem[];
}

export const HistoryList: React.FC<Props> = ({ items }) => {
  const resolvedItems = items.filter((item) => item.status !== 'active');

  if (resolvedItems.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconBox}>
          <Feather name="inbox" size={24} color="#475569" />
        </View>
        <Text style={styles.emptyTitle}>Sin decisiones registradas</Text>
        <Text style={styles.emptySubtitle}>
          Las compras que decidas frenar o realizar aparecerán registradas aquí.
        </Text>
      </View>
    );
  }

  const renderStatusBadge = (status: ImpulseItem['status']) => {
    switch (status) {
      case 'saved':
        return (
          <View style={[styles.badge, styles.badgeSaved]}>
            <Text style={styles.badgeTextSaved}>Ahorrado</Text>
          </View>
        );
      case 'purchased':
        return (
          <View style={[styles.badge, styles.badgePurchased]}>
            <Text style={styles.badgeTextPurchased}>Comprado</Text>
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

  const getStatusIcon = (status: ImpulseItem['status']) => {
    switch (status) {
      case 'saved':
        return <Feather name="arrow-down-left" size={15} color="#10b981" />;
      case 'purchased':
        return <Feather name="shopping-bag" size={15} color="#94a3b8" />;
      case 'dismissed':
      default:
        return <Feather name="x" size={14} color="#64748b" />;
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
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>HISTORIAL DE DECISIONES</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{resolvedItems.length}</Text>
        </View>
      </View>

      {resolvedItems.map((item) => (
        <View key={item.id} style={styles.itemCard}>
          <View
            style={[
              styles.itemIconContainer,
              item.status === 'saved'
                ? styles.iconBoxSaved
                : item.status === 'purchased'
                ? styles.iconBoxPurchased
                : styles.iconBoxDismissed,
            ]}
          >
            {getStatusIcon(item.status)}
          </View>

          <View style={styles.itemCenter}>
            <Text style={styles.itemProduct} numberOfLines={1}>
              {item.productName}
            </Text>
            <View style={styles.itemSubRow}>
              <Text style={styles.itemDate}>{formatDate(item.createdAt)}</Text>
              <View style={styles.dotSeparator} />
              {renderStatusBadge(item.status)}
            </View>
          </View>

          <View style={styles.itemRight}>
            <Text
              style={[
                styles.itemPrice,
                item.status === 'saved' && styles.itemPriceSaved,
                item.status === 'dismissed' && styles.itemPriceDismissed,
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  countBadge: {
    backgroundColor: '#151b28',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: '#1e2638',
  },
  countText: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '700',
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0c0f17',
    borderRadius: 16,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#1b2234',
  },
  itemIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconBoxSaved: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  iconBoxPurchased: {
    backgroundColor: 'rgba(148, 163, 184, 0.1)',
  },
  iconBoxDismissed: {
    backgroundColor: 'rgba(71, 85, 105, 0.1)',
  },
  itemCenter: {
    flex: 1,
    marginRight: 10,
  },
  itemProduct: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: -0.1,
  },
  itemSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  itemDate: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '500',
  },
  dotSeparator: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#334155',
    marginHorizontal: 6,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeSaved: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
  },
  badgeTextSaved: {
    color: '#10b981',
    fontSize: 10,
    fontWeight: '600',
  },
  badgePurchased: {
    backgroundColor: 'rgba(148, 163, 184, 0.12)',
  },
  badgeTextPurchased: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '600',
  },
  badgeDismissed: {
    backgroundColor: 'rgba(100, 116, 139, 0.1)',
  },
  badgeTextDismissed: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: '500',
  },
  itemRight: {
    alignItems: 'flex-end',
  },
  itemPrice: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  itemPriceSaved: {
    color: '#10b981',
  },
  itemPriceDismissed: {
    color: '#64748b',
    textDecorationLine: 'line-through',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 36,
    paddingHorizontal: 24,
    backgroundColor: '#0c0f17',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1b2234',
    borderStyle: 'dashed',
  },
  emptyIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#131825',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1e2638',
  },
  emptyTitle: {
    color: '#e2e8f0',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  emptySubtitle: {
    color: '#64748b',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 17,
  },
});
