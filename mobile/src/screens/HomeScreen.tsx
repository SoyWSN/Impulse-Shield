import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  RefreshControl,
  Alert,
} from 'react-native';
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
      <StatusBar barStyle="light-content" backgroundColor="#020617" />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
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

      {/* Botón flotante para frenar nuevo impulso */}
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
          activeOpacity={activeImpulse ? 1 : 0.8}
        >
          <Text style={styles.fabIcon}>🛡️</Text>
          <Text style={styles.fabText}>
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
    backgroundColor: '#020617',
  },
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },
  scrollContent: {
    paddingBottom: 100,
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
    paddingVertical: 16,
    borderRadius: 18,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  fabDisabled: {
    backgroundColor: '#334155',
    shadowOpacity: 0,
    elevation: 0,
  },
  fabIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  fabText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
});
