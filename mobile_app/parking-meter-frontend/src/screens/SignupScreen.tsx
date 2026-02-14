import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import AppButton from '../components/AppButton';
import { Colors } from '../themes/colors';
import { api } from '../services/api';

export default function SignupScreen({ navigation }: { navigation: any }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async () => {
    setError(null);
    if (!email.trim() || !password) {
      setError('Please enter email and password.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    try {
      await api.signup({
        email: email.trim(),
        password,
        first_name: firstName.trim() || undefined,
        last_name: lastName.trim() || undefined,
      });
      navigation.replace('Login');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.title}>Create Account</Text>
      <TextInput
        placeholder="Email"
        placeholderTextColor={Colors.muted}
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        editable={!loading}
      />
      <TextInput
        placeholder="Password (min 8 chars)"
        placeholderTextColor={Colors.muted}
        secureTextEntry
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        editable={!loading}
      />
      <TextInput
        placeholder="First name (optional)"
        placeholderTextColor={Colors.muted}
        style={styles.input}
        value={firstName}
        onChangeText={setFirstName}
        editable={!loading}
      />
      <TextInput
        placeholder="Last name (optional)"
        placeholderTextColor={Colors.muted}
        style={styles.input}
        value={lastName}
        onChangeText={setLastName}
        editable={!loading}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={styles.loader} />
      ) : (
        <AppButton title="Sign Up" onPress={handleSignup} />
      )}
      <TouchableOpacity onPress={() => navigation.replace('Login')} disabled={loading}>
        <Text style={styles.link}>Back to Sign in</Text>
      </TouchableOpacity>
      <Text style={styles.hint}>Already have an account? Use Sign in.</Text>
    </KeyboardAvoidingView>
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
    color: Colors.text,
  },
  hint: {
    fontSize: 12,
    color: Colors.muted,
    marginTop: 8,
    textAlign: 'center',
  },
  errorText: {
    color: '#B91C1C',
    marginBottom: 6,
  },
  link: {
    color: Colors.primary,
    textAlign: 'center',
    marginTop: 12,
  },
  loader: { marginVertical: 16 },
});
