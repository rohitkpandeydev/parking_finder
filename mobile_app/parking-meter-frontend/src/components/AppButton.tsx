import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Colors } from '../themes/colors';


export default function AppButton({ title, onPress }: any) {
return (
<TouchableOpacity style={styles.button} onPress={onPress}>
<Text style={styles.text}>{title}</Text>
</TouchableOpacity>
);
}


const styles = StyleSheet.create({
button: {
backgroundColor: Colors.primary,
padding: 16,
borderRadius: 12,
alignItems: 'center',
marginVertical: 8,
},
text: {
color: Colors.white,
fontWeight: '600',
fontSize: 16,
},
});