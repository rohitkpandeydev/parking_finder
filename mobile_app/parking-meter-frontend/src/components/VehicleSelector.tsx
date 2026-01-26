import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../themes/colors';

export default function VehicleSelector({
  vehicles,
  selected,
  onSelect,
}: any) {
  if (!vehicles.length) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Saved Vehicles</Text>
      <View style={styles.row}>
        {vehicles.map((v: any) => (
          <TouchableOpacity
            key={v.id}
            style={[
              styles.vehicle,
              selected === v.number && styles.active,
            ]}
            onPress={() => onSelect(v.number)}
          >
            <Text style={styles.text}>{v.number}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: {
    fontWeight: '600',
    marginBottom: 6,
    color: Colors.text,
  },
  row: { flexDirection: 'row', flexWrap: 'wrap' },
  vehicle: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: Colors.background,
    marginRight: 8,
    marginBottom: 8,
  },
  active: {
    backgroundColor: Colors.primary,
  },
  text: {
    color: Colors.text,
    fontWeight: '600',
  },
});
