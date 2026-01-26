import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Alert,
    TextInput,
} from 'react-native';

import AppButton from '../components/AppButton';
import ZoneSelector from '../components/ZoneSelector';
import VehicleTypeSelector from '../components/VehicleTypeSelector';
import ParkingTimer from '../components/ParkingTimer';

import { Colors } from '../themes/colors';
import { api } from '../services/api';
import { calculateAmount } from '../utils/pricing';
import { useEffect } from 'react';
import { vehicleService } from '../services/vehicleService';
import VehicleSelector from '../components/VehicleSelector';


type VehicleType = 'Car' | 'Bike' | 'Truck';

const VEHICLE_REGEX = /^[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{4}$/;

export default function HomeScreen() {
    const [zone, setZone] = useState<string | null>(null);
    const [vehicleType, setVehicleType] = useState<VehicleType | null>(null);
    const [vehicleNumber, setVehicleNumber] = useState('');
    const [active, setActive] = useState(false);
    const [startedAt, setStartedAt] = useState<number | null>(null);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [vehicles, setVehicles] = useState<any[]>([]);


    const startParking = async () => {
        if (!zone || !vehicleType || !vehicleNumber) {
            Alert.alert('Missing info', 'Fill all details');
            return;
        }

        if (!VEHICLE_REGEX.test(vehicleNumber)) {
            Alert.alert(
                'Invalid Vehicle Number',
                'Format: MH12AB1234'
            );
            return;
        }
        await vehicleService.addVehicle(vehicleNumber);
        setVehicles(await vehicleService.getVehicles());


        const response = await api.startParking({
            zone,
            vehicleType,
            vehicleNumber,
        });

        setStartedAt(response.startedAt);
        setSessionId(response.sessionId);
        setActive(true);
    };

    const stopParking = async () => {
        if (!startedAt || !vehicleType || !sessionId) return;

        const durationMinutes = Math.ceil(
            (Date.now() - startedAt) / 60000
        );

        const totalAmount = calculateAmount(
            zone!,
            vehicleType,
            durationMinutes
        );


        await api.stopParking(sessionId);

        setActive(false);
        setSessionId(null);
        setStartedAt(null);

        Alert.alert(
            'Parking Ended',
            `Vehicle: ${vehicleNumber}\nDuration: ${durationMinutes} min\nAmount: ₹${totalAmount}`
        );
    };

    useEffect(() => {
        vehicleService.getVehicles().then(setVehicles);
    }, []);


    return (
        <View style={styles.container}>
            {/* Branding */}
            <View style={styles.header}>
                <Text style={styles.brand}>ParkEase</Text>
                <Text style={styles.tagline}>Smart parking, simplified</Text>
            </View>

            {/* Main Card */}
            <View style={styles.card}>
                <ZoneSelector selected={zone} onSelect={setZone} />
                <Text style={styles.zoneInfo}>
                    Pricing varies by zone & vehicle type
                </Text>


                <VehicleTypeSelector
                    selected={vehicleType}
                    onSelect={setVehicleType}
                />
                <VehicleSelector
                    vehicles={vehicles}
                    selected={vehicleNumber}
                    onSelect={setVehicleNumber}
                />


                <Text style={styles.label}>Vehicle Number</Text>
                <TextInput
                    placeholder="MH12AB1234"
                    style={styles.input}
                    autoCapitalize="characters"
                    value={vehicleNumber}
                    onChangeText={setVehicleNumber}
                    editable={!active}
                />
            </View>

            {/* Status */}
            <View style={styles.status}>
                {active ? (
                    <>
                        <Text style={styles.activeText}>Parking Active</Text>
                        <ParkingTimer active={active} />
                    </>
                ) : (
                    <Text style={styles.inactiveText}>
                        No active parking session
                    </Text>
                )}
            </View>

            {/* CTA */}
            <AppButton
                title={active ? 'Stop Parking' : 'Start Parking'}
                onPress={active ? stopParking : startParking}
            />
        </View>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
        padding: 20,
    },

    header: {
        marginBottom: 24,
    },

    brand: {
        fontSize: 34,
        fontWeight: '800',
        color: Colors.primary,
    },

    tagline: {
        fontSize: 14,
        color: Colors.muted,
        marginTop: 4,
    },

    card: {
        backgroundColor: Colors.white,
        borderRadius: 18,
        padding: 16,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 5,
    },

    label: {
        fontWeight: '600',
        marginBottom: 6,
        color: Colors.text,
    },

    input: {
        backgroundColor: '#EEF2FF',
        padding: 14,
        borderRadius: 12,
        marginBottom: 8,
        color: Colors.text,
        letterSpacing: 1,
    },

    status: {
        alignItems: 'center',
        marginBottom: 20,
    },

    activeText: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.success,
        marginBottom: 6,
    },

    inactiveText: {
        fontSize: 14,
        color: Colors.muted,
    },
    zoneInfo: {
        fontSize: 13,
        color: Colors.muted,
        marginBottom: 8,
    },

});
