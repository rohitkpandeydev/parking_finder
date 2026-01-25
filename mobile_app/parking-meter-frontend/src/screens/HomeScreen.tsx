import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AppButton from '../components/AppButton';
import { Colors } from '../themes/colors';
import { api } from '../services/api';


export default function HomeScreen() {
const [active, setActive] = useState(false);


const startParking = async () => {
await api.startParking({});
setActive(true);
};


return (
<View style={styles.container}>
<Text style={styles.title}>Parking Meter</Text>
<Text style={styles.status}>Status: {active ? 'Active' : 'Inactive'}</Text>
<AppButton title={active ? 'Parking Active' : 'Start Parking'} onPress={startParking} />
</View>
);
}


const styles = StyleSheet.create({
container: { flex: 1, padding: 24, backgroundColor: Colors.background },
title: { fontSize: 26, fontWeight: '700', marginBottom: 16 },
status: { fontSize: 16, marginBottom: 24, color: Colors.muted },
});