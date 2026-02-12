import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from 'react-native';
import AppButton from '../components/AppButton';
import ParkingTimer from '../components/ParkingTimer';
import { Colors } from '../themes/colors';
import { api, ParkingSession } from '../services/api';
import { scheduleSessionReminder } from '../services/notifications';
import { useEffect } from 'react';

export default function HomeScreen({ navigation }: { navigation: any }) {
  const [activeSession, setActiveSession] = useState<ParkingSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [ending, setEnding] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadActiveSession = useCallback(async () => {
    try {
      const session = await api.getActiveSession();
      setActiveSession(session);
      if (session) {
        await scheduleSessionReminder(new Date(session.ends_at), session.meter_code);
      }
    } catch {
      setActiveSession(null);
    }
  }, []);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await loadActiveSession();
    setRefreshing(false);
  }, [loadActiveSession]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      await loadActiveSession();
      if (mounted) setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, [loadActiveSession]);

  const endSession = async () => {
    if (!activeSession) return;
    setEnding(true);
    try {
      await api.endSession(activeSession.id);
      setActiveSession(null);
      Alert.alert('Session ended', 'Your parking session has been ended.');
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Could not end session');
    } finally {
      setEnding(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading session…</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={refresh} colors={[Colors.primary]} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.brand}>ParkEase</Text>
        <Text style={styles.tagline}>Smart parking, simplified</Text>
      </View>

      <View style={styles.card}>
        {activeSession ? (
          <>
            <Text style={styles.activeText}>Parking active</Text>
            {activeSession.meter_code && (
              <Text style={styles.meterCode}>Meter: {activeSession.meter_code}</Text>
            )}
            <ParkingTimer
              active={true}
              remainingSeconds={activeSession.remaining_seconds}
              endsAt={activeSession.ends_at}
            />
            <AppButton
              title={ending ? 'Ending…' : 'End session'}
              onPress={endSession}
              disabled={ending}
            />
          </>
        ) : (
          <>
            <Text style={styles.inactiveText}>No active parking session</Text>
            <Text style={styles.hint}>
              Open the map, select a meter, and start a session to see the timer here.
            </Text>
            <AppButton title="Open map" onPress={() => navigation.navigate('Map')} />
          </>
        )}
      </View>

      <AppButton
        title="Log out"
        onPress={async () => {
          await api.logout();
          navigation.replace('Login');
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20, paddingBottom: 40 },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: { marginTop: 8, color: Colors.muted },
  header: { marginBottom: 24 },
  brand: { fontSize: 34, fontWeight: '800', color: Colors.primary },
  tagline: { fontSize: 14, color: Colors.muted, marginTop: 4 },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },
  activeText: { fontSize: 16, fontWeight: '600', color: Colors.success, marginBottom: 6 },
  meterCode: { fontSize: 14, color: Colors.muted, marginBottom: 8 },
  inactiveText: { fontSize: 16, color: Colors.muted, marginBottom: 8 },
  hint: { fontSize: 13, color: Colors.muted, marginBottom: 16 },
});
