import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { api } from './services/api';
import { Colors } from './themes/colors';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import MapScreen from './screens/MapScreen';
import MeterDetailScreen from './screens/MeterDetailScreen';
import HomeScreen from './screens/HomeScreen';
import DashboardScreen from './screens/DashboardScreen';

const Stack = createNativeStackNavigator();

export default function ParkingMeterWrapper() {
  const [loading, setLoading] = useState(true);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    api.getToken().then((token) => {
      setHasToken(!!token);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <StatusBar style="dark" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Stack.Navigator
        screenOptions={{ headerShown: true }}
        initialRouteName={hasToken ? 'Dashboard' : 'Login'}
      >
        <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Log in' }} />
        <Stack.Screen name="Signup" component={SignupScreen} options={{ title: 'Sign up' }} />
        <Stack.Screen name="Map" component={MapScreen} options={{ title: 'Parking map' }} />
        <Stack.Screen
          name="MeterDetail"
          component={MeterDetailScreen}
          options={{ title: 'Meter details' }}
        />
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Session' }} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Dashboard' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
});
