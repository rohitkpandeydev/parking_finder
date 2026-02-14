import pool from '../config/database';
import { Reservation, ReservationDashboardResponse } from '../models/Reservation';

const DEFAULT_OVERTIME_MULTIPLIER = 1.5;

export class ReservationService {
  async listByUser(userId: number): Promise<ReservationDashboardResponse> {
    await this.syncExpiredReservations();

    const result = await pool.query(
      `
        SELECT
          r.id,
          r.user_id,
          r.spot_id,
          s.location,
          s.price,
          r.status,
          r.reserved_at,
          r.expires_at,
          r.booked_hours,
          r.base_cost,
          r.overtime_cost,
          r.total_cost,
          r.checked_out_at,
          r.payment_status,
          r.paid_at
        FROM reservations r
        INNER JOIN parking_spots s ON s.id = r.spot_id
        WHERE r.user_id = $1
        ORDER BY r.reserved_at DESC
      `,
      [userId]
    );

    const rows = result.rows.map((row) => this.toReservation(row));

    const active: Reservation[] = [];
    const past: Reservation[] = [];

    for (const row of rows) {
      const isOpenReservation = row.checked_out_at == null && (row.status === 'active' || row.status === 'expired');
      if (isOpenReservation) {
        active.push(row);
      } else {
        past.push(row);
      }
    }

    return { active, past };
  }

  async checkout(userId: number, reservationId: number): Promise<Reservation | null> {
    await this.syncExpiredReservations();

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const reservationResult = await client.query(
        `
          SELECT
            r.id,
            r.user_id,
            r.spot_id,
            s.location,
            s.price,
            r.status,
            r.reserved_at,
            r.expires_at,
            r.booked_hours,
            r.base_cost,
            r.overtime_cost,
            r.total_cost,
            r.checked_out_at,
            r.payment_status,
            r.paid_at
          FROM reservations r
          INNER JOIN parking_spots s ON s.id = r.spot_id
          WHERE r.id = $1 AND r.user_id = $2
          FOR UPDATE
        `,
        [reservationId, userId]
      );

      if (reservationResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return null;
      }

      const reservation = this.toReservation(reservationResult.rows[0]!);
      if (reservation.checked_out_at) {
        await client.query('ROLLBACK');
        return reservation;
      }

      const now = new Date();
      const overtimeMinutes = this.getOvertimeMinutes(new Date(reservation.expires_at), now);
      const overtimeCost = this.calculateOvertimeCost(reservation.price, overtimeMinutes);
      const totalCost = this.round2(reservation.base_cost + overtimeCost);

      await client.query(
        `
          UPDATE reservations
          SET
            status = 'completed',
            checked_out_at = CURRENT_TIMESTAMP,
            overtime_cost = $2,
            total_cost = $3,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = $1
        `,
        [reservation.id, overtimeCost, totalCost]
      );

      await client.query(
        `
          UPDATE parking_spots
          SET is_available = true
          WHERE id = $1
        `,
        [reservation.spot_id]
      );

      await client.query('COMMIT');

      return {
        ...reservation,
        status: 'completed',
        checked_out_at: now.toISOString(),
        overtime_minutes: overtimeMinutes,
        is_overdue: overtimeMinutes > 0,
        overtime_cost: overtimeCost,
        total_cost: totalCost,
        estimated_total_cost: totalCost,
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async syncExpiredReservations(): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const expired = await client.query<{ spot_id: number }>(
        `
          UPDATE reservations
          SET status = 'expired', updated_at = CURRENT_TIMESTAMP
          WHERE status = 'active' AND expires_at <= CURRENT_TIMESTAMP
          RETURNING spot_id
        `
      );

      const uniqueSpotIds = Array.from(new Set(expired.rows.map((r) => r.spot_id)));
      if (uniqueSpotIds.length > 0) {
        await client.query(
          `
            UPDATE parking_spots
            SET is_available = true
            WHERE id = ANY($1::int[])
          `,
          [uniqueSpotIds]
        );
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  private getOvertimeMultiplier(): number {
    const fromEnv = Number.parseFloat(process.env.RESERVATION_OVERTIME_MULTIPLIER ?? '');
    if (!Number.isFinite(fromEnv) || fromEnv <= 1) {
      return DEFAULT_OVERTIME_MULTIPLIER;
    }
    return fromEnv;
  }

  private getOvertimeMinutes(expiresAt: Date, now = new Date()): number {
    if (now <= expiresAt) return 0;
    return Math.ceil((now.getTime() - expiresAt.getTime()) / 60000);
  }

  private calculateOvertimeCost(pricePerHour: number, overtimeMinutes: number): number {
    if (overtimeMinutes <= 0) return 0;
    const overtimeHours = overtimeMinutes / 60;
    return this.round2(pricePerHour * overtimeHours * this.getOvertimeMultiplier());
  }

  private round2(value: number): number {
    return Math.round(value * 100) / 100;
  }

  private toReservation(row: {
    id: number;
    user_id: number;
    spot_id: number;
    location: string;
    price: string | number;
    status: 'active' | 'expired' | 'cancelled' | 'completed';
    reserved_at: Date | string;
    expires_at: Date | string;
    booked_hours: number | string;
    base_cost: number | string;
    overtime_cost: number | string;
    total_cost: number | string;
    checked_out_at: Date | string | null;
    payment_status: 'unpaid' | 'paid' | 'waived';
    paid_at: Date | string | null;
  }): Reservation {
    const reservedAt = row.reserved_at instanceof Date ? row.reserved_at : new Date(row.reserved_at);
    const expiresAt = row.expires_at instanceof Date ? row.expires_at : new Date(row.expires_at);
    const checkedOutAt =
      row.checked_out_at == null
        ? null
        : row.checked_out_at instanceof Date
          ? row.checked_out_at
          : new Date(row.checked_out_at);
    const paidAt =
      row.paid_at == null ? null : row.paid_at instanceof Date ? row.paid_at : new Date(row.paid_at);

    const price = Number(row.price);
    const baseCost = Number(row.base_cost);
    const storedOvertimeCost = Number(row.overtime_cost);
    const storedTotalCost = Number(row.total_cost);
    const overtimeMinutes = checkedOutAt ? this.getOvertimeMinutes(expiresAt, checkedOutAt) : this.getOvertimeMinutes(expiresAt);
    const liveOvertimeCost = checkedOutAt ? storedOvertimeCost : this.calculateOvertimeCost(price, overtimeMinutes);
    const estimatedTotalCost = checkedOutAt ? storedTotalCost : this.round2(baseCost + liveOvertimeCost);

    return {
      id: row.id,
      user_id: row.user_id,
      spot_id: row.spot_id,
      location: row.location,
      price,
      status: row.status,
      reserved_at: reservedAt.toISOString(),
      expires_at: expiresAt.toISOString(),
      booked_hours: Number(row.booked_hours),
      base_cost: baseCost,
      overtime_cost: liveOvertimeCost,
      total_cost: checkedOutAt ? storedTotalCost : estimatedTotalCost,
      checked_out_at: checkedOutAt ? checkedOutAt.toISOString() : null,
      overtime_minutes: overtimeMinutes,
      is_overdue: overtimeMinutes > 0,
      estimated_total_cost: estimatedTotalCost,
      payment_status: row.payment_status,
      paid_at: paidAt ? paidAt.toISOString() : null,
    };
  }
}
