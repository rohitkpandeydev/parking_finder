import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import AppButton from '../components/AppButton';
import { Colors } from '../themes/colors';
import { api, ParkingMeter } from '../services/api';

const DURATION_OPTIONS = [15, 30, 60, 120];

export default function MeterDetailScreen({
  route,
  navigation,
}: {
  route: { params?: { meter: ParkingMeter } };
  navigation: any;
}) {
  const meter = route.params?.meter;
  if (!meter) {
    return null;
  }
  const [duration, setDuration] = useState(30);
  const [loading, setLoading] = useState(false);

  const startSession = async () => {
    if (!meter.is_available) {
      Alert.alert('Not available', 'This meter is currently in use.');
      return;
    }
    setLoading(true);
    try {
      await api.startSession({ meter_id: meter.id, duration_minutes: duration });
      Alert.alert(
        'Session started',
        `Parking for ${duration} minutes. You can see the timer on the Session screen.`,
        [{ text: 'OK', onPress: () => navigation.navigate('Home') }]
      );
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Could not start session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.meterCode}>{meter.meter_code}</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Price</Text>
          <Text style={styles.value}>${meter.price_per_hour}/hour</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Availability</Text>
          <Text style={[styles.value, meter.is_available ? styles.available : styles.occupied]}>
            {meter.is_available ? 'Available' : 'Occupied'}
          </Text>
        </View>
        {meter.distance_km != null && (
          <View style={styles.row}>
            <Text style={styles.label}>Distance</Text>
            <Text style={styles.value}>{meter.distance_km.toFixed(2)} km</Text>
          </View>
        )}
        {meter.address ? (
          <View style={styles.row}>
            <Text style={styles.label}>Address</Text>
            <Text style={styles.value}>{meter.address}</Text>
          </View>
        ) : null}
      </View>

      <Text style={styles.sectionTitle}>Duration (minutes)</Text>
      <View style={styles.durationRow}>
        {DURATION_OPTIONS.map((d) => (
          <TouchableOpacity
            key={d}
            style={[styles.durationBtn, duration === d && styles.durationBtnActive]}
            onPress={() => setDuration(d)}
          >
            <Text style={[styles.durationText, duration === d && styles.durationTextActive]}>
              {d}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={styles.loader} />
      ) : (
        <AppButton
          title={meter.is_available ? 'Start parking session' : 'Meter unavailable'}
          onPress={startSession}
          disabled={!meter.is_available}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20, paddingBottom: 40 },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  meterCode: { fontSize: 22, fontWeight: '800', color: Colors.text, marginBottom: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  label: { fontSize: 14, color: Colors.muted },
  value: { fontSize: 14, fontWeight: '600', color: Colors.text },
  available: { color: Colors.success },
  occupied: { color: Colors.muted },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: Colors.text, marginBottom: 12 },
  durationRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 24, gap: 10 },
  durationBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  durationBtnActive: { borderColor: Colors.primary, backgroundColor: '#EFF6FF' },
  durationText: { fontSize: 16, fontWeight: '600', color: Colors.text },
  durationTextActive: { color: Colors.primary },
  loader: { marginVertical: 20 },
});
