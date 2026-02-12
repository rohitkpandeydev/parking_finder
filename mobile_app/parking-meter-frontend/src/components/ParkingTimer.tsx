import React, { useEffect, useState } from 'react';
import { Text, StyleSheet } from 'react-native';
import { Colors } from '../themes/colors';

type ParkingTimerProps = {
  active: boolean;
  /** If provided, count down from this (seconds). Otherwise count up. */
  remainingSeconds?: number;
  /** If provided and remainingSeconds not set, compute remaining from this. */
  endsAt?: string;
};

export default function ParkingTimer({
  active,
  remainingSeconds: initialRemaining,
  endsAt,
}: ParkingTimerProps) {
  const [seconds, setSeconds] = useState(() => {
    if (initialRemaining != null && initialRemaining > 0) return initialRemaining;
    if (endsAt) {
      const end = new Date(endsAt).getTime();
      const rem = Math.max(0, Math.floor((end - Date.now()) / 1000));
      return rem;
    }
    return 0;
  });

  useEffect(() => {
    if (!active) return;
    const endMs = endsAt ? new Date(endsAt).getTime() : null;
    const interval = setInterval(() => {
      if (endMs) {
        const rem = Math.max(0, Math.floor((endMs - Date.now()) / 1000));
        setSeconds(rem);
      } else {
        setSeconds((s) => s + 1);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [active, endsAt]);

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const isExpired = seconds <= 0 && (initialRemaining != null || endsAt);

  return (
    <Text style={[styles.timer, isExpired && styles.timerExpired]}>
      {isExpired
        ? 'Session expired'
        : `Time left: ${mins}:${secs.toString().padStart(2, '0')}`}
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
  timerExpired: {
    color: '#B91C1C',
  },
});
