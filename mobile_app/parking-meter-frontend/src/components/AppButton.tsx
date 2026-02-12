import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Colors } from '../themes/colors';

type AppButtonProps = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
};

export default function AppButton({ title, onPress, disabled }: AppButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.button, disabled && styles.buttonDisabled]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={disabled ? 1 : 0.7}
    >
      <Text style={[styles.text, disabled && styles.textDisabled]}>{title}</Text>
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
  buttonDisabled: {
    backgroundColor: Colors.muted,
    opacity: 0.7,
  },
  text: {
    color: Colors.white,
    fontWeight: '600',
    fontSize: 16,
  },
  textDisabled: {
    color: Colors.white,
  },
});
