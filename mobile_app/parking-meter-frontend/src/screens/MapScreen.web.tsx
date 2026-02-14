import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { api, ParkingSpot } from '../services/api';
import { Colors } from '../themes/colors';
import { Map, Marker } from 'pigeon-maps';

export default function MapScreen({ navigation }: { navigation: any }) {
  const [spots, setSpots] = useState<ParkingSpot[]>([]);
  const [selectedSpotId, setSelectedSpotId] = useState<number | null>(null);
  const [reservingSpotId, setReservingSpotId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSpots = useCallback(async () => {
    try {
      const { spots: list } = await api.getSpots();
      setSpots(list);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load parking spots');
      setSpots([]);
    }
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await fetchSpots();
      setLoading(false);
    })();
  }, [fetchSpots]);

  const selectedSpot = useMemo(
    () => spots.find((spot) => spot.id === selectedSpotId) ?? null,
    [spots, selectedSpotId]
  );

  const reserveSpot = useCallback(async () => {
    if (!selectedSpot) return;

    setReservingSpotId(selectedSpot.id);
    try {
      const { spot } = await api.reserveSpot(selectedSpot.id);
      setSpots((prev) => prev.map((item) => (item.id === spot.id ? spot : item)));
      Alert.alert('Reserved', `Spot #${spot.id} has been reserved.`);
    } catch (e) {
      Alert.alert('Reservation failed', e instanceof Error ? e.message : 'Failed to reserve spot');
      await fetchSpots();
    } finally {
      setReservingSpotId(null);
    }
  }, [fetchSpots, selectedSpot]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.webTitle}>Parking spots (Web)</Text>
        <Text style={styles.webHint}>Tap a pin to view details and reserve.</Text>
      </View>

      <View style={styles.mapWrap}>
        <Map
          defaultCenter={[12.9716, 77.5946]}
          defaultZoom={12}
          height={280}
          attributionPrefix={false}
        >
          {spots.map((spot) => (
            <Marker
              key={spot.id}
              width={selectedSpotId === spot.id ? 44 : 36}
              anchor={[spot.latitude, spot.longitude]}
              onClick={() => setSelectedSpotId(spot.id)}
              color={spot.is_available ? '#16A34A' : '#64748B'}
            />
          ))}
        </Map>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={styles.loader} />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <FlatList
          data={spots}
          keyExtractor={(spot) => String(spot.id)}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.spotCard} onPress={() => setSelectedSpotId(item.id)}>
              <Text style={styles.spotTitle}>Spot #{item.id}</Text>
              <Text style={styles.spotMeta}>{item.location}</Text>
              <Text style={styles.spotMeta}>${item.price.toFixed(2)}/hr</Text>
              <Text style={item.is_available ? styles.available : styles.unavailable}>
                {item.is_available ? 'Available' : 'Unavailable'}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}

      {selectedSpot ? (
        <View style={styles.detailCard}>
          <Text style={styles.detailTitle}>Spot #{selectedSpot.id}</Text>
          <Text style={styles.detailText}>{selectedSpot.location}</Text>
          <Text style={styles.detailText}>${selectedSpot.price.toFixed(2)}/hr</Text>
          <Text style={selectedSpot.is_available ? styles.available : styles.unavailable}>
            {selectedSpot.is_available ? 'Available' : 'Unavailable'}
          </Text>
          <TouchableOpacity
            style={[
              styles.reserveBtn,
              (!selectedSpot.is_available || reservingSpotId === selectedSpot.id) && styles.reserveBtnDisabled,
            ]}
            onPress={reserveSpot}
            disabled={!selectedSpot.is_available || reservingSpotId === selectedSpot.id}
          >
            {reservingSpotId === selectedSpot.id ? (
              <ActivityIndicator size="small" color={Colors.white} />
            ) : (
              <Text style={styles.reserveBtnText}>Reserve</Text>
            )}
          </TouchableOpacity>
        </View>
      ) : null}

      <View style={styles.footerRow}>
        <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation.navigate('Dashboard')}>
          <Text style={styles.secondaryBtnText}>Dashboard</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.navigate('Home')}>
          <Text style={styles.primaryBtnText}>Session</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={async () => {
            await api.logout();
            navigation.replace('Login');
          }}
        >
          <Text style={styles.secondaryBtnText}>Log out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, padding: 16 },
  header: { marginBottom: 12 },
  webTitle: { fontSize: 22, fontWeight: '700', color: Colors.text },
  webHint: { fontSize: 12, color: Colors.muted, marginTop: 4 },
  mapWrap: {
    overflow: 'hidden',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  loader: { marginTop: 24 },
  errorText: { color: '#B91C1C', textAlign: 'center', marginTop: 16 },
  spotCard: {
    backgroundColor: Colors.white,
    marginVertical: 6,
    padding: 14,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  spotTitle: { fontSize: 16, fontWeight: '700', color: Colors.text },
  spotMeta: { fontSize: 13, color: Colors.muted, marginTop: 4 },
  detailCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 14,
    marginTop: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  detailTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  detailText: { fontSize: 14, color: Colors.muted, marginBottom: 2 },
  reserveBtn: {
    marginTop: 10,
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  reserveBtnDisabled: { backgroundColor: Colors.muted },
  reserveBtnText: { color: Colors.white, fontWeight: '700' },
  available: { fontSize: 13, color: Colors.success, fontWeight: '600' },
  unavailable: { fontSize: 13, color: '#DC2626', fontWeight: '600' },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  primaryBtn: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  primaryBtnText: { color: Colors.white, fontWeight: '700' },
  secondaryBtn: {
    flex: 1,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  secondaryBtnText: { color: Colors.text, fontWeight: '600' },
});
