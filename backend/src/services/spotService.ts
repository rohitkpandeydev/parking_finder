import pool from '../config/database';
import { ParkingSpot } from '../models/ParkingSpot';
import { ReservationService } from './reservationService';

type ReserveSpotResult =
  | {
      status: 'reserved';
      spot: ParkingSpot;
      reservation_id: number;
      expires_at: string;
      booked_hours: number;
      base_cost: number;
      total_cost: number;
    }
  | { status: 'not_found' }
  | { status: 'unavailable' };

//REVERVATION MINUTES
const DEFAULT_RESERVATION_MINUTES = 120;
const DEFAULT_RESERVATION_HOURS = 2;

export class SpotService {
  private readonly reservationService = new ReservationService();

  async list(availableOnly = false): Promise<ParkingSpot[]> {
    await this.reservationService.syncExpiredReservations();

    const query = availableOnly
      ? 'SELECT id, location, price, is_available, latitude, longitude FROM parking_spots WHERE is_available = true ORDER BY id'
      : 'SELECT id, location, price, is_available, latitude, longitude FROM parking_spots ORDER BY id';

    const result = await pool.query(query);
    return result.rows.map((row) => ({
      id: row.id as number,
      location: row.location as string,
      price: Number(row.price),
      is_available: row.is_available as boolean,
      latitude: Number(row.latitude),
      longitude: Number(row.longitude),
    }));
  }

  async reserve(userId: number, id: number, hours: number): Promise<ReserveSpotResult> {
    await this.reservationService.syncExpiredReservations();

    const reservationMinutes = Number.parseInt(process.env.RESERVATION_DURATION_MINUTES || '', 10);
    const durationMinutes = Number.isNaN(reservationMinutes) ? DEFAULT_RESERVATION_MINUTES : reservationMinutes;
    const defaultHours = Math.max(DEFAULT_RESERVATION_HOURS, Math.floor(durationMinutes / 60));
    const bookedHours = Number.isNaN(hours) ? defaultHours : hours;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const reserveResult = await client.query(
        `
          UPDATE parking_spots
          SET is_available = false
          WHERE id = $1 AND is_available = true
          RETURNING id, location, price, is_available, latitude, longitude
        `,
        [id]
      );

      if (reserveResult.rows.length === 0) {
        await client.query('ROLLBACK');
        const existsResult = await pool.query('SELECT 1 FROM parking_spots WHERE id = $1', [id]);
        if (existsResult.rows.length === 0) {
          return { status: 'not_found' };
        }

        return { status: 'unavailable' };
      }

      const reservationResult = await client.query(
        `
          INSERT INTO reservations (user_id, spot_id, status, expires_at, booked_hours, base_cost, overtime_cost, total_cost)
          VALUES (
            $1,
            $2,
            'active',
            CURRENT_TIMESTAMP + ($3::text || ' hours')::interval,
            $3,
            ROUND(($4 * $3)::numeric, 2),
            0,
            ROUND(($4 * $3)::numeric, 2)
          )
          RETURNING id, expires_at, booked_hours, base_cost, total_cost
        `,
        [userId, id, bookedHours, Number(reserveResult.rows[0]!.price)]
      );

      await client.query('COMMIT');

      const row = reserveResult.rows[0]!;
      const reservationRow = reservationResult.rows[0]!;
      const expiresAt =
        reservationRow.expires_at instanceof Date
          ? reservationRow.expires_at.toISOString()
          : new Date(reservationRow.expires_at).toISOString();

      return {
        status: 'reserved',
        reservation_id: reservationRow.id as number,
        expires_at: expiresAt,
        booked_hours: Number(reservationRow.booked_hours),
        base_cost: Number(reservationRow.base_cost),
        total_cost: Number(reservationRow.total_cost),
        spot: {
          id: row.id as number,
          location: row.location as string,
          price: Number(row.price),
          is_available: row.is_available as boolean,
          latitude: Number(row.latitude),
          longitude: Number(row.longitude),
        },
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}
