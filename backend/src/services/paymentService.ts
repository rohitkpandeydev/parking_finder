import pool from '../config/database';
import { Payment, PaymentIntentResponse } from '../models/Payment';

export class PaymentService {
  async createReservationPaymentIntent(userId: number, reservationId: number): Promise<PaymentIntentResponse> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const reservationResult = await client.query<{
        id: number;
        checked_out_at: Date | null;
        total_cost: string | number;
        payment_status: 'unpaid' | 'paid' | 'waived';
      }>(
        `
          SELECT id, checked_out_at, total_cost, payment_status
          FROM reservations
          WHERE id = $1 AND user_id = $2
          FOR UPDATE
        `,
        [reservationId, userId]
      );

      if (reservationResult.rows.length === 0) {
        throw new Error('Reservation not found');
      }

      const reservation = reservationResult.rows[0]!;
      if (!reservation.checked_out_at) {
        throw new Error('Checkout reservation before payment');
      }

      if (reservation.payment_status === 'paid') {
        const existing = await client.query(
          `
            SELECT id, reservation_id, user_id, amount, currency, status, provider, provider_reference, created_at, updated_at
            FROM payments
            WHERE reservation_id = $1 AND user_id = $2 AND status = 'succeeded'
            ORDER BY id DESC
            LIMIT 1
          `,
          [reservationId, userId]
        );

        if (existing.rows.length > 0) {
          await client.query('COMMIT');
          return {
            payment: this.toPayment(existing.rows[0]!),
            client_secret: 'already_paid',
          };
        }
      }

      const amount = Number(reservation.total_cost);
      const providerReference = `MOCK-${reservationId}-${Date.now()}`;

      const paymentResult = await client.query(
        `
          INSERT INTO payments (reservation_id, user_id, amount, currency, status, provider, provider_reference)
          VALUES ($1, $2, $3, 'INR', 'initiated', 'mock', $4)
          RETURNING id, reservation_id, user_id, amount, currency, status, provider, provider_reference, created_at, updated_at
        `,
        [reservationId, userId, amount, providerReference]
      );

      await client.query('COMMIT');

      return {
        payment: this.toPayment(paymentResult.rows[0]!),
        client_secret: `mock_secret_${providerReference}`,
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async confirmMockPayment(userId: number, paymentId: number): Promise<Payment> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const paymentResult = await client.query<{
        id: number;
        reservation_id: number;
        user_id: number;
        amount: string | number;
        currency: string;
        status: 'initiated' | 'succeeded' | 'failed';
        provider: string;
        provider_reference: string | null;
        created_at: Date;
        updated_at: Date;
      }>(
        `
          SELECT id, reservation_id, user_id, amount, currency, status, provider, provider_reference, created_at, updated_at
          FROM payments
          WHERE id = $1 AND user_id = $2
          FOR UPDATE
        `,
        [paymentId, userId]
      );

      if (paymentResult.rows.length === 0) {
        throw new Error('Payment not found');
      }

      const payment = paymentResult.rows[0]!;
      if (payment.status !== 'succeeded') {
        await client.query(
          `
            UPDATE payments
            SET status = 'succeeded', updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
          `,
          [paymentId]
        );

        await client.query(
          `
            UPDATE reservations
            SET payment_status = 'paid', paid_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
            WHERE id = $1 AND user_id = $2
          `,
          [payment.reservation_id, userId]
        );
      }

      const finalPaymentResult = await client.query(
        `
          SELECT id, reservation_id, user_id, amount, currency, status, provider, provider_reference, created_at, updated_at
          FROM payments
          WHERE id = $1
        `,
        [paymentId]
      );

      await client.query('COMMIT');
      return this.toPayment(finalPaymentResult.rows[0]!);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  private toPayment(row: {
    id: number;
    reservation_id: number;
    user_id: number;
    amount: string | number;
    currency: string;
    status: 'initiated' | 'succeeded' | 'failed';
    provider: string;
    provider_reference: string | null;
    created_at: Date | string;
    updated_at: Date | string;
  }): Payment {
    const createdAt = row.created_at instanceof Date ? row.created_at : new Date(row.created_at);
    const updatedAt = row.updated_at instanceof Date ? row.updated_at : new Date(row.updated_at);

    return {
      id: row.id,
      reservation_id: row.reservation_id,
      user_id: row.user_id,
      amount: Number(row.amount),
      currency: row.currency,
      status: row.status,
      provider: row.provider,
      provider_reference: row.provider_reference,
      created_at: createdAt.toISOString(),
      updated_at: updatedAt.toISOString(),
    };
  }
}
