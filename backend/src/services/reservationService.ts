import pool from '../config/database';
import { Reservation, ReservationDashboardResponse } from '../models/Reservation';

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
          r.expires_at
        FROM reservations r
        INNER JOIN parking_spots s ON s.id = r.spot_id
        WHERE r.user_id = $1
        ORDER BY r.reserved_at DESC
      `,
      [userId]
    );

    const rows = result.rows.map((row) => this.toReservation(row));
    const now = Date.now();

    const active: Reservation[] = [];
    const past: Reservation[] = [];

    for (const row of rows) {
      const isActive = row.status === 'active' && new Date(row.expires_at).getTime() > now;
      if (isActive) {
        active.push(row);
      } else {
        past.push(row);
      }
    }

    return { active, past };
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

  private toReservation(row: {
    id: number;
    user_id: number;
    spot_id: number;
    location: string;
    price: string | number;
    status: 'active' | 'expired' | 'cancelled' | 'completed';
    reserved_at: Date | string;
    expires_at: Date | string;
  }): Reservation {
    const reservedAt = row.reserved_at instanceof Date ? row.reserved_at : new Date(row.reserved_at);
    const expiresAt = row.expires_at instanceof Date ? row.expires_at : new Date(row.expires_at);

    return {
      id: row.id,
      user_id: row.user_id,
      spot_id: row.spot_id,
      location: row.location,
      price: Number(row.price),
      status: row.status,
      reserved_at: reservedAt.toISOString(),
      expires_at: expiresAt.toISOString(),
    };
  }
}
