import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import AppButton from '../components/AppButton';
import { api, Reservation, ReservationDashboard } from '../services/api';
import { Colors } from '../themes/colors';

const formatDateTime = (value: string): string => {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
};

function ReservationSection({
  title,
  reservations,
}: {
  title: string;
  reservations: Reservation[];
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {reservations.length === 0 ? (
        <Text style={styles.emptyText}>No reservations.</Text>
      ) : (
        reservations.map((reservation) => (
          <View key={reservation.id} style={styles.card}>
            <Text style={styles.cardTitle}>Spot #{reservation.spot_id}</Text>
            <Text style={styles.cardMeta}>{reservation.location}</Text>
            <Text style={styles.cardMeta}>${reservation.price.toFixed(2)}/hr</Text>
            <Text style={styles.cardMeta}>Reserved: {formatDateTime(reservation.reserved_at)}</Text>
            <Text style={styles.cardMeta}>Expires: {formatDateTime(reservation.expires_at)}</Text>
            <Text style={styles.status}>Status: {reservation.status}</Text>
          </View>
        ))
      )}
    </View>
  );
}

export default function DashboardScreen({ navigation }: { navigation: any }) {
  const [data, setData] = useState<ReservationDashboard>({ active: [], past: [] });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    try {
      setError(null);
      const dashboard = await api.getReservationDashboard();
      setData(dashboard);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load reservations');
      setData({ active: [], past: [] });
    }
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await loadDashboard();
      setLoading(false);
    })();
  }, [loadDashboard]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadDashboard();
    setRefreshing(false);
  }, [loadDashboard]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.helperText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={styles.header}>Your Reservations</Text>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <ReservationSection title="Active Reservations" reservations={data.active} />
      <ReservationSection title="Past Reservations" reservations={data.past} />

      <AppButton title="Open map" onPress={() => navigation.navigate('Map')} />
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
  header: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 16,
  },
  helperText: { marginTop: 8, color: Colors.muted },
  errorText: { color: '#B91C1C', marginBottom: 12 },
  section: { marginBottom: 20 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 10,
  },
  emptyText: { color: Colors.muted },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  cardMeta: { fontSize: 13, color: Colors.muted, marginBottom: 2 },
  status: { fontSize: 13, color: Colors.text, fontWeight: '600', marginTop: 4 },
});
