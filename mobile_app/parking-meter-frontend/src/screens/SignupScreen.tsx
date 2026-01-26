import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert } from 'react-native';
import AppButton from '../components/AppButton';
import { Colors } from '../themes/colors';
import { api } from '../services/api';
import { calculateAge } from '../utils/age';

export default function SignupScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [dob, setDob] = useState(''); // YYYY-MM-DD

  const handleSignup = async () => {
    if (!email || !password || !dob) {
      Alert.alert('Missing info', 'Fill all fields');
      return;
    }

    const age = calculateAge(dob);

    if (age < 18) {
      Alert.alert(
        'Not Eligible',
        'You must be at least 18 years old to use this app'
      );
      return;
    }

    await api.signup({ email, password, dob });
    navigation.replace('Home');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>

      <TextInput
        placeholder="Email"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        placeholder="Password"
        secureTextEntry
        style={styles.input}
        value={password}
        onChangeText={setPassword}
      />

      <TextInput
        placeholder="Date of Birth (YYYY-MM-DD)"
        style={styles.input}
        value={dob}
        onChangeText={setDob}
      />

      <Text style={styles.helper}>
        You must be 18+ to park a vehicle
      </Text>

      <AppButton title="Sign Up" onPress={handleSignup} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 24,
    color: Colors.text,
  },
  input: {
    backgroundColor: Colors.white,
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  helper: {
    fontSize: 12,
    color: Colors.muted,
    marginBottom: 12,
  },
});
