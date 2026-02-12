import React, { useState, useEffect, useRef, useCallback } from 'react';
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
import { api, ParkingMeter } from '../services/api';

const DEFAULT_REGION = {
  latitude: 40.7128,
  longitude: -74.006,
  latitudeDelta: 0.02,
  longitudeDelta: 0.02,
};

export default function MapScreen({ navigation }: { navigation: any }) {
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [meters, setMeters] = useState<ParkingMeter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mapRef = useRef<MapView | null>(null);

  const fetchMeters = useCallback(async (lat?: number, lon?: number) => {
    try {
      const params =
        lat != null && lon != null
          ? { latitude: lat, longitude: lon, radius_km: 5 }
          : undefined;
      const { meters: list } = await api.getMeters(params);
      setMeters(list);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load meters');
      setMeters([]);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (!mounted) return;
      if (status !== 'granted') {
        setError('Location permission denied');
        setLoading(false);
        fetchMeters();
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
        await fetchMeters(loc.coords.latitude, loc.coords.longitude);
      } catch {
        if (mounted) fetchMeters();
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [fetchMeters]);

  const region = location
    ? {
        ...location,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      }
    : DEFAULT_REGION;

  const onMeterPress = (meter: ParkingMeter) => {
    navigation.navigate('MeterDetail', { meter });
  };

  // Web: react-native-maps often not supported; show list
  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <View style={styles.webHeader}>
          <Text style={styles.webTitle}>Parking meters</Text>
          <Text style={styles.webHint}>Use the app on device for map view</Text>
        </View>
        {loading ? (
          <ActivityIndicator size="large" color={Colors.primary} style={styles.loader} />
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : (
          <FlatList
            data={meters}
            keyExtractor={(m) => String(m.id)}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.meterCard}
                onPress={() => onMeterPress(item)}
                activeOpacity={0.7}
              >
                <Text style={styles.meterCode}>{item.meter_code}</Text>
                <Text style={styles.meterMeta}>
                  ${item.price_per_hour}/hr • {item.is_available ? 'Available' : 'Occupied'}
                  {item.distance_km != null && ` • ${item.distance_km.toFixed(2)} km`}
                </Text>
                {item.address ? (
                  <Text style={styles.meterAddress} numberOfLines={1}>
                    {item.address}
                  </Text>
                ) : null}
              </TouchableOpacity>
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

  // Native: map with markers
  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={region}
        region={location ? undefined : region}
        onLayout={() => {
          if (location && mapRef.current) {
            mapRef.current.animateToRegion(region, 500);
          }
        }}
        showsUserLocation
        showsMyLocationButton
      >
        {meters.map((m) => (
          <Marker
            key={m.id}
            coordinate={{ latitude: m.latitude, longitude: m.longitude }}
            title={m.meter_code}
            description={m.is_available ? 'Available' : 'Occupied'}
            pinColor={m.is_available ? Colors.success : Colors.muted}
            onPress={() => onMeterPress(m)}
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
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('Home')}
      >
        <Text style={styles.fabText}>Session</Text>
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
  meterCard: {
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 14,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  meterCode: { fontSize: 16, fontWeight: '700', color: Colors.text },
  meterMeta: { fontSize: 13, color: Colors.muted, marginTop: 4 },
  meterAddress: { fontSize: 12, color: Colors.muted, marginTop: 2 },
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
