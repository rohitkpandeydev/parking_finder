import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { api, ParkingSpot } from '../services/api';
import { Colors } from '../themes/colors';

export default function SpotList() {
  const [spots, setSpots] = useState<ParkingSpot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSpots = useCallback(async () => {
    try {
      setError(null);
      const response = await api.getSpots();
      setSpots(response.spots);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch spots');
    }
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await loadSpots();
      setLoading(false);
    })();
  }, [loadSpots]);

  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator color={Colors.primary} />
        <Text style={styles.helperText}>Loading parking spots...</Text>
      </View>
    );
  }

  if (error) {
    return <Text style={styles.errorText}>{error}</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Parking Spots</Text>
      {spots.length === 0 ? (
        <Text style={styles.helperText}>No parking spots found.</Text>
      ) : (
        spots.map((item) => (
          <View style={styles.item} key={item.id}>
            <Text style={styles.location}>{item.location}</Text>
            <Text style={styles.meta}>Price: ${item.price.toFixed(2)}</Text>
            <Text style={item.is_available ? styles.available : styles.unavailable}>
              {item.is_available ? 'Available' : 'Unavailable'}
            </Text>
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 16,
    marginBottom: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
  item: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  location: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  meta: {
    fontSize: 14,
    color: Colors.muted,
    marginBottom: 4,
  },
  available: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.success,
  },
  unavailable: {
    fontSize: 13,
    fontWeight: '600',
    color: '#DC2626',
  },
  helperText: {
    fontSize: 14,
    color: Colors.muted,
    marginTop: 8,
  },
  errorText: {
    color: '#DC2626',
    marginBottom: 16,
  },
  loadingWrap: {
    padding: 16,
    alignItems: 'center',
  },
});
