import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AppButton from '../components/AppButton';
import { api, Reservation, ReservationDashboard } from '../services/api';
import { Colors } from '../themes/colors';

const formatDateTime = (value: string): string => {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
};

function ReservationSection({
  title,
  reservations,
  onCheckout,
  checkingOutId,
  onPay,
  payingReservationId,
}: {
  title: string;
  reservations: Reservation[];
  onCheckout?: (reservationId: number) => Promise<void>;
  checkingOutId?: number | null;
  onPay?: (reservationId: number) => Promise<void>;
  payingReservationId?: number | null;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {reservations.length === 0 ? (
        <Text style={styles.emptyText}>No reservations.</Text>
      ) : (
        reservations.map((reservation) => (
          <View key={reservation.id} style={styles.card}>
            <Text style={styles.cardTitle}>Spot #{reservation.spot_id}</Text>
            <Text style={styles.cardMeta}>{reservation.location}</Text>
            <Text style={styles.cardMeta}>₹{reservation.price.toFixed(2)}/hr</Text>
            <Text style={styles.cardMeta}>Booked: {reservation.booked_hours} hour(s)</Text>
            <Text style={styles.cardMeta}>Reserved: {formatDateTime(reservation.reserved_at)}</Text>
            <Text style={styles.cardMeta}>Expires: {formatDateTime(reservation.expires_at)}</Text>
            <Text style={styles.cardMeta}>Base Cost: ₹{reservation.base_cost.toFixed(2)}</Text>
            <Text style={styles.cardMeta}>
              Overtime: {reservation.overtime_minutes} min (₹{reservation.overtime_cost.toFixed(2)})
            </Text>
            <Text style={styles.cardMeta}>
              {reservation.checked_out_at ? 'Final Total' : 'Current Total'}: ₹
              {reservation.estimated_total_cost.toFixed(2)}
            </Text>
            <Text style={styles.cardMeta}>Payment: {reservation.payment_status}</Text>
            {reservation.is_overdue && !reservation.checked_out_at ? (
              <Text style={styles.overdueText}>
                Overdue: Charges are increasing until checkout.
              </Text>
            ) : null}
            {onCheckout && !reservation.checked_out_at ? (
              <TouchableOpacity
                style={[styles.checkoutBtn, checkingOutId === reservation.id && styles.checkoutBtnDisabled]}
                onPress={() => onCheckout(reservation.id)}
                disabled={checkingOutId === reservation.id}
              >
                <Text style={styles.checkoutBtnText}>
                  {checkingOutId === reservation.id ? 'Checking out…' : 'Checkout'}
                </Text>
              </TouchableOpacity>
            ) : null}
            {onPay && reservation.checked_out_at && reservation.payment_status !== 'paid' ? (
              <TouchableOpacity
                style={[styles.payBtn, payingReservationId === reservation.id && styles.checkoutBtnDisabled]}
                onPress={() => onPay(reservation.id)}
                disabled={payingReservationId === reservation.id}
              >
                <Text style={styles.checkoutBtnText}>
                  {payingReservationId === reservation.id ? 'Processing…' : 'Pay now (Demo)'}
                </Text>
              </TouchableOpacity>
            ) : null}
            <Text style={styles.status}>Status: {reservation.status}</Text>
          </View>
        ))
      )}
    </View>
  );
}

export default function DashboardScreen({ navigation }: { navigation: any }) {
  const [data, setData] = useState<ReservationDashboard>({ active: [], past: [] });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [checkingOutId, setCheckingOutId] = useState<number | null>(null);
  const [payingReservationId, setPayingReservationId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    try {
      setError(null);
      const dashboard = await api.getReservationDashboard();
      setData(dashboard);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load reservations');
      setData({ active: [], past: [] });
    }
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await loadDashboard();
      setLoading(false);
    })();
  }, [loadDashboard]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadDashboard();
    setRefreshing(false);
  }, [loadDashboard]);

  const checkoutReservation = useCallback(
    async (reservationId: number) => {
      setCheckingOutId(reservationId);
      try {
        const { reservation } = await api.checkoutReservation(reservationId);
        Alert.alert(
          'Checked out',
          `Final payable amount: ₹${reservation.total_cost.toFixed(2)}`
        );
        await loadDashboard();
      } catch (e) {
        Alert.alert('Checkout failed', e instanceof Error ? e.message : 'Failed to checkout reservation');
      } finally {
        setCheckingOutId(null);
      }
    },
    [loadDashboard]
  );

  const payReservation = useCallback(
    async (reservationId: number) => {
      setPayingReservationId(reservationId);
      try {
        const intent = await api.createReservationPaymentIntent(reservationId);
        const confirmed = await api.confirmMockPayment(intent.payment.id);
        Alert.alert(
          'Payment successful',
          `Demo payment captured: ₹${confirmed.payment.amount.toFixed(2)} ${confirmed.payment.currency}`
        );
        await loadDashboard();
      } catch (e) {
        Alert.alert('Payment failed', e instanceof Error ? e.message : 'Failed to process payment');
      } finally {
        setPayingReservationId(null);
      }
    },
    [loadDashboard]
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.helperText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={styles.header}>Your Reservations</Text>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <ReservationSection
        title="Active Reservations"
        reservations={data.active}
        onCheckout={checkoutReservation}
        checkingOutId={checkingOutId}
        onPay={payReservation}
        payingReservationId={payingReservationId}
      />
      <ReservationSection
        title="Past Reservations"
        reservations={data.past}
        onPay={payReservation}
        payingReservationId={payingReservationId}
      />

      <AppButton title="Open map" onPress={() => navigation.navigate('Map')} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20, paddingBottom: 40 },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  header: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 16,
  },
  helperText: { marginTop: 8, color: Colors.muted },
  errorText: { color: '#B91C1C', marginBottom: 12 },
  section: { marginBottom: 20 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 10,
  },
  emptyText: { color: Colors.muted },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  cardMeta: { fontSize: 13, color: Colors.muted, marginBottom: 2 },
  status: { fontSize: 13, color: Colors.text, fontWeight: '600', marginTop: 4 },
  overdueText: {
    fontSize: 12,
    color: '#B91C1C',
    fontWeight: '600',
    marginTop: 4,
  },
  checkoutBtn: {
    marginTop: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  checkoutBtnDisabled: {
    opacity: 0.7,
  },
  checkoutBtnText: { color: Colors.white, fontWeight: '700' },
  payBtn: {
    marginTop: 8,
    backgroundColor: '#0369A1',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
});
