import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AppButton from '../components/AppButton';
import { Colors } from '../themes/colors';
import { api } from '../services/api';

export default function LoginScreen({ navigation }: { navigation: any }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }
    setLoading(true);
    try {
      await api.login({ email: email.trim(), password });
      navigation.replace('Map');
    } catch (e) {
      Alert.alert('Login failed', e instanceof Error ? e.message : 'Please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.title}>Welcome Back</Text>
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
        placeholder="Password"
        placeholderTextColor={Colors.muted}
        secureTextEntry
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        editable={!loading}
      />
      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={styles.loader} />
      ) : (
        <AppButton title="Login" onPress={handleLogin} />
      )}
      <TouchableOpacity onPress={() => navigation.navigate('Signup')} disabled={loading}>
        <Text style={styles.link}>Create new account</Text>
      </TouchableOpacity>
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
    borderRadius: 10,
    marginBottom: 12,
    color: Colors.text,
  },
  link: {
    color: Colors.primary,
    textAlign: 'center',
    marginTop: 12,
  },
  loader: { marginVertical: 16 },
});
