import React, { useEffect, useState } from 'react';
import { Text, StyleSheet } from 'react-native';
import { Colors } from '../themes/colors';

export default function ParkingTimer({ active }: { active: boolean }) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!active) return;
    const timer = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(timer);
  }, [active]);

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return (
    <Text style={styles.timer}>
      Time: {mins}:{secs.toString().padStart(2, '0')}
    </Text>
  );
}

const styles = StyleSheet.create({
  timer: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginVertical: 16,
  },
});