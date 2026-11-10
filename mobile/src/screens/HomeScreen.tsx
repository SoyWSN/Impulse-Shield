import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';
import { SavingsHeader } from '../components/SavingsHeader';
import { ActiveCountdownCard } from '../components/ActiveCountdownCard';
import { CreateImpulseModal } from '../components/CreateImpulseModal';
import { HistoryList } from '../components/HistoryList';
import {
  subscribeToActiveImpulse,
  subscribeToAllImpulses,
  createImpulse,
  resolveImpulse,
} from '../services/impulseService';
import { calculateUserStats } from '../utils/stats';
import type { ImpulseItem, UserStats } from '../types/impulse';

export const HomeScreen: React.FC = () => {
  const [activeImpulse, setActiveImpulse] = useState<ImpulseItem | null>(null);
  const [allImpulses, setAllImpulses] = useState<ImpulseItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // 1. Suscribirse al impulso activo en tiempo real
    const unsubActive = subscribeToActiveImpulse((item) => {
      setActiveImpulse(item);
    });

    // 2. Suscribirse al historial completo en tiempo real
    const unsubAll = subscribeToAllImpulses((items) => {
      setAllImpulses(items);
    });

    return () => {
      unsubActive();
      unsubAll();
    };
  }, []);

  const stats: UserStats = calculateUserStats(allImpulses);

  const handleCreate = async (
    productName: string,
    price: number,
    durationSeconds: number
  ) => {
    if (activeImpulse) {
      Alert.alert(
        'Enfriamiento en curso',
        'Ya tienes un impulso activo. Espera a que termine o descártalo para iniciar otro.'
      );
      return;
    }
    await createImpulse(productName, price, durationSeconds);
  };

  const handleResolve = async (
    id: string,
    status: 'saved' | 'purchased' | 'dismissed'
  ) => {
    await resolveImpulse(id, status);
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />

      {/* Top App Header */}
      <View style={styles.topBar}>
        <View style={styles.topBarLeft}>
          <Text style={styles.appTitle}>ImpulseShield</Text>
        </View>
        <View style={styles.watchSyncBadge}>
          <Feather name="watch" size={13} color="#10b981" style={{ marginRight: 5 }} />
          <Text style={styles.watchSyncText}>Wear OS</Text>
        </View>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#10b981"
          />
        }
      >
        <SavingsHeader stats={stats} />

        {activeImpulse && (
          <ActiveCountdownCard
            item={activeImpulse}
            onResolve={handleResolve}
          />
        )}

        <HistoryList items={allImpulses} />
      </ScrollView>

      {/* Floating Action Button */}
      <View style={styles.fabContainer}>
        <TouchableOpacity
          style={[styles.fab, activeImpulse !== null && styles.fabDisabled]}
          onPress={() => {
            if (activeImpulse) {
              Alert.alert(
                'Enfriamiento activo',
                'Solo puedes tener 1 enfriamiento a la vez. Resuelve o descarta el actual primero.'
              );
            } else {
              setIsModalOpen(true);
            }
          }}
          activeOpacity={activeImpulse ? 1 : 0.85}
        >
          <Feather
            name={activeImpulse ? 'lock' : 'plus'}
            size={18}
            color={activeImpulse ? '#94a3b8' : '#ffffff'}
            style={styles.fabIcon}
          />
          <Text style={[styles.fabText, activeImpulse !== null && styles.fabTextDisabled]}>
            {activeImpulse ? 'Enfriamiento en curso' : 'Frenar Impulso'}
          </Text>
        </TouchableOpacity>
      </View>

      <CreateImpulseModal
        visible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreate}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#06080e',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: '#06080e',
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  watchSyncBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 14,
  },
  watchSyncText: {
    color: '#10b981',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  container: {
    flex: 1,
    backgroundColor: '#06080e',
  },
  scrollContent: {
    paddingBottom: 110,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
  },
  fab: {
    backgroundColor: '#10b981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 14,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  fabDisabled: {
    backgroundColor: '#151b28',
    borderWidth: 1,
    borderColor: '#1e2638',
    shadowOpacity: 0,
    elevation: 0,
  },
  fabIcon: {
    marginRight: 8,
  },
  fabText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  fabTextDisabled: {
    color: '#94a3b8',
    fontWeight: '600',
  },
});
