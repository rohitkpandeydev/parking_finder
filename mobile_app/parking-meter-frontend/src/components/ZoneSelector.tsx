import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../themes/colors';


const ZONES = ['A1', 'B1', 'C1'];


export default function ZoneSelector({ selected, onSelect }: any) {
return (
<View style={styles.container}>
<Text style={styles.label}>Select Zone</Text>
<View style={styles.row}>
{ZONES.map(zone => (
<TouchableOpacity
key={zone}
style={[styles.zone, selected === zone && styles.active]}
onPress={() => onSelect(zone)}
>
<Text style={styles.zoneText}>{zone}</Text>
</TouchableOpacity>
))}
</View>
</View>
);
}
const styles = StyleSheet.create({
container: { marginBottom: 20 },
label: { fontWeight: '600', marginBottom: 8 },
row: { flexDirection: 'row' },
zone: {
padding: 12,
borderRadius: 10,
backgroundColor: Colors.white,
marginRight: 10,
},
active: { backgroundColor: Colors.primary },
zoneText: { color: Colors.text },
});