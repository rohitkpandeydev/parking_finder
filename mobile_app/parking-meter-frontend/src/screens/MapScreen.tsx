import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { Colors } from '../themes/colors';
import { api, ParkingSpot } from '../services/api';
import { scheduleReservationReminder } from '../services/notifications';

const DEFAULT_REGION = {
  latitude: 40.7128,
  longitude: -74.006,
  latitudeDelta: 0.02,
  longitudeDelta: 0.02,
};
const BOOKING_HOUR_OPTIONS = [1, 2, 3, 4, 6];

export default function MapScreen({ navigation }: { navigation: any }) {
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [spots, setSpots] = useState<ParkingSpot[]>([]);
  const [selectedSpotId, setSelectedSpotId] = useState<number | null>(null);
  const [reservingSpotId, setReservingSpotId] = useState<number | null>(null);
  const [bookingHours, setBookingHours] = useState<number>(2);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mapRef = useRef<MapView | null>(null);

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
    let mounted = true;
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (!mounted) return;
      if (status !== 'granted') {
        setError('Location permission denied. Showing default city center.');
        setLoading(false);
        fetchSpots();
        return;
      }

      try {
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        if (!mounted) return;
      setLocation({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
      } catch {
        if (mounted) setLocation(null);
      } finally {
        if (mounted) {
          await fetchSpots();
          setLoading(false);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, [fetchSpots]);

  const region = location
    ? {
        ...location,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      }
    : DEFAULT_REGION;

  const selectedSpot = useMemo(
    () => spots.find((spot) => spot.id === selectedSpotId) ?? null,
    [spots, selectedSpotId]
  );

  const reserveSpot = useCallback(async () => {
    if (!selectedSpot) return;

    setReservingSpotId(selectedSpot.id);
    try {
      const { spot, expires_at } = await api.reserveSpot(selectedSpot.id, bookingHours);
      setSpots((prev) => prev.map((item) => (item.id === spot.id ? spot : item)));
      try {
        await scheduleReservationReminder(new Date(expires_at), selectedSpot.location);
      } catch {
        // Notification errors should not block booking flow.
      }
      Alert.alert(
        'Reserved',
        `Spot #${spot.id} reserved for ${bookingHours} hour${bookingHours > 1 ? 's' : ''}.`
      );
    } catch (e) {
      Alert.alert('Reservation failed', e instanceof Error ? e.message : 'Failed to reserve spot');
      await fetchSpots();
    } finally {
      setReservingSpotId(null);
    }
  }, [bookingHours, fetchSpots, selectedSpot]);

  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <View style={styles.webHeader}>
          <Text style={styles.webTitle}>Parking spots</Text>
          <Text style={styles.webHint}>Use mobile app for interactive map pins</Text>
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
              <View style={styles.spotCard}>
                <Text style={styles.spotTitle}>Spot #{item.id}</Text>
                <Text style={styles.spotMeta}>{item.location}</Text>
                <Text style={styles.spotMeta}>₹{item.price.toFixed(2)}/hr</Text>
                <Text style={item.is_available ? styles.available : styles.unavailable}>
                  {item.is_available ? 'Available' : 'Unavailable'}
                </Text>
              </View>
            )}
          />
        )}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={async () => {
            await api.logout();
            navigation.replace('Login');
          }}
        >
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={region}
        region={location ? undefined : region}
        onPress={() => setSelectedSpotId(null)}
        onLayout={() => {
          if (location && mapRef.current) {
            mapRef.current.animateToRegion(region, 500);
          }
        }}
        showsUserLocation
        showsMyLocationButton
      >
        {spots.map((spot) => (
          <Marker
            key={spot.id}
            coordinate={{ latitude: spot.latitude, longitude: spot.longitude }}
            title={`Spot #${spot.id}`}
            description={`${spot.location} • ₹${spot.price.toFixed(2)}/hr`}
            pinColor={spot.is_available ? Colors.success : Colors.muted}
            onPress={() => setSelectedSpotId(spot.id)}
          />
        ))}
      </MapView>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading map…</Text>
        </View>
      )}

      {error ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {selectedSpot ? (
        <View style={styles.detailCard}>
          <Text style={styles.detailTitle}>Spot #{selectedSpot.id}</Text>
          <Text style={styles.detailText}>{selectedSpot.location}</Text>
          <Text style={styles.detailText}>₹{selectedSpot.price.toFixed(2)}/hr</Text>
          <Text style={selectedSpot.is_available ? styles.available : styles.unavailable}>
            {selectedSpot.is_available ? 'Available' : 'Unavailable'}
          </Text>
          <Text style={styles.hoursLabel}>Book for (hours)</Text>
          <View style={styles.hoursRow}>
            {BOOKING_HOUR_OPTIONS.map((hours) => (
              <TouchableOpacity
                key={hours}
                style={[styles.hourChip, bookingHours === hours && styles.hourChipActive]}
                onPress={() => setBookingHours(hours)}
              >
                <Text style={[styles.hourChipText, bookingHours === hours && styles.hourChipTextActive]}>
                  {hours}h
                </Text>
              </TouchableOpacity>
            ))}
          </View>
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

      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('Home')}>
        <Text style={styles.fabText}>Session</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.dashboardBtn} onPress={() => navigation.navigate('Dashboard')}>
        <Text style={styles.dashboardBtnText}>Dashboard</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.logoutBtnMap}
        onPress={async () => {
          await api.logout();
          navigation.replace('Login');
        }}
      >
        <Text style={styles.logoutText}>Log out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  map: { flex: 1, width: '100%', height: '100%' },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: { marginTop: 8, color: Colors.text },
  errorBanner: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 8,
  },
  errorText: { color: '#B91C1C', textAlign: 'center' },
  loader: { marginTop: 24 },
  webHeader: { padding: 16, backgroundColor: Colors.white },
  webTitle: { fontSize: 22, fontWeight: '700', color: Colors.text },
  webHint: { fontSize: 12, color: Colors.muted, marginTop: 4 },
  spotCard: {
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 14,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  spotTitle: { fontSize: 16, fontWeight: '700', color: Colors.text },
  spotMeta: { fontSize: 13, color: Colors.muted, marginTop: 4 },
  detailCard: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 86,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 14,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  detailTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  detailText: { fontSize: 14, color: Colors.muted, marginBottom: 2 },
  hoursLabel: { marginTop: 8, fontSize: 12, color: Colors.muted, fontWeight: '600' },
  hoursRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  hourChip: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: Colors.white,
  },
  hourChipActive: {
    borderColor: Colors.primary,
    backgroundColor: '#EFF6FF',
  },
  hourChipText: { color: Colors.text, fontSize: 12, fontWeight: '600' },
  hourChipTextActive: { color: Colors.primary },
  reserveBtn: {
    marginTop: 10,
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  reserveBtnDisabled: {
    backgroundColor: Colors.muted,
  },
  reserveBtnText: {
    color: Colors.white,
    fontWeight: '700',
  },
  available: { fontSize: 13, color: Colors.success, fontWeight: '600' },
  unavailable: { fontSize: 13, color: '#DC2626', fontWeight: '600' },
  fab: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  fabText: { color: Colors.white, fontWeight: '600' },
  dashboardBtn: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
  },
  dashboardBtnText: { color: Colors.text, fontWeight: '600' },
  logoutBtn: {
    alignSelf: 'center',
    marginTop: 16,
    padding: 12,
  },
  logoutBtnMap: {
    position: 'absolute',
    top: 50,
    right: 16,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  logoutText: { color: Colors.primary, fontWeight: '600' },
});
