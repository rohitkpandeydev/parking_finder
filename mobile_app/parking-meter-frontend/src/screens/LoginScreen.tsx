import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import AppButton from '../components/AppButton';
import { Colors } from '../themes/colors';
import { api } from '../services/api';


export default function LoginScreen({ navigation }: any) {
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');


const handleLogin = async () => {
await api.login({ email, password });
navigation.replace('Home');
};


return (
<View style={styles.container}>
<Text style={styles.title}>Welcome Back</Text>
<TextInput placeholder="Email" style={styles.input} onChangeText={setEmail} />
<TextInput placeholder="Password" secureTextEntry style={styles.input} onChangeText={setPassword} />
<AppButton title="Login" onPress={handleLogin} />
<TouchableOpacity onPress={() => navigation.navigate('Signup')}>
<Text style={styles.link}>Create new account</Text>
</TouchableOpacity>
</View>
);
}


const styles = StyleSheet.create({
container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: Colors.background },
title: { fontSize: 28, fontWeight: '700', marginBottom: 24, color: Colors.text },
input: { backgroundColor: Colors.white, padding: 14, borderRadius: 10, marginBottom: 12 },
link: { color: Colors.primary, textAlign: 'center', marginTop: 12 },
});