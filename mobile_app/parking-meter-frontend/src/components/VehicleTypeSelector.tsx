import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../themes/colors';

const VEHICLE_TYPES = ['Car', 'Bike', 'Truck'];

export default function VehicleTypeSelector({ selected, onSelect }: any) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Vehicle Type</Text>
      <View style={styles.row}>
        {VEHICLE_TYPES.map(type => (
          <TouchableOpacity
            key={type}
            style={[styles.type, selected === type && styles.active]}
            onPress={() => onSelect(type)}
          >
            <Text style={styles.text}>{type}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 20 },
  label: { fontWeight: '600', marginBottom: 8, color: Colors.text },
  row: { flexDirection: 'row' },
  type: {
    padding: 12,
    borderRadius: 10,
    backgroundColor: Colors.white,
    marginRight: 10,
  },
  active: { backgroundColor: Colors.primary },
  text: { color: Colors.text },
});