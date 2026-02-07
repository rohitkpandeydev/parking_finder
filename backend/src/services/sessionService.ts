import pool from '../config/database';
import { CreateSessionInput, ParkingSessionResponse } from '../models/ParkingSession';

export class SessionService {
  async startSession(userId: number, input: CreateSessionInput): Promise<ParkingSessionResponse> {
    const { meter_id, duration_minutes } = input;

    const meterResult = await pool.query(
      'SELECT id, is_available FROM parking_meters WHERE id = $1',
      [meter_id]
    );
    if (meterResult.rows.length === 0) {
      throw new Error('Parking meter not found');
    }
    if (!meterResult.rows[0].is_available) {
      throw new Error('Parking meter is not available');
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const endsAt = new Date();
      endsAt.setMinutes(endsAt.getMinutes() + duration_minutes);

      const sessionResult = await client.query(
        `INSERT INTO parking_sessions (user_id, meter_id, started_at, ends_at, duration_minutes, status)
         VALUES ($1, $2, CURRENT_TIMESTAMP, $3, $4, 'active')
         RETURNING id, user_id, meter_id, started_at, ends_at, duration_minutes, status`,
        [userId, meter_id, endsAt, duration_minutes]
      );

      await client.query(
        'UPDATE parking_meters SET is_available = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
        [meter_id]
      );

      await client.query('COMMIT');

      const row = sessionResult.rows[0];
      return this.toResponse(row);
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }

  async getActiveSession(userId: number): Promise<ParkingSessionResponse | null> {
    const result = await pool.query(
      `SELECT s.id, s.user_id, s.meter_id, s.started_at, s.ends_at, s.duration_minutes, s.status, m.meter_code
       FROM parking_sessions s
       JOIN parking_meters m ON m.id = s.meter_id
       WHERE s.user_id = $1 AND s.status = 'active' AND s.ends_at > CURRENT_TIMESTAMP
       ORDER BY s.started_at DESC LIMIT 1`,
      [userId]
    );
    if (result.rows.length === 0) return null;
    return this.toResponse(result.rows[0]);
  }

  async getById(sessionId: number, userId: number): Promise<ParkingSessionResponse | null> {
    const result = await pool.query(
      `SELECT s.id, s.user_id, s.meter_id, s.started_at, s.ends_at, s.duration_minutes, s.status, m.meter_code
       FROM parking_sessions s
       LEFT JOIN parking_meters m ON m.id = s.meter_id
       WHERE s.id = $1 AND s.user_id = $2`,
      [sessionId, userId]
    );
    if (result.rows.length === 0) return null;
    return this.toResponse(result.rows[0]);
  }

  async endSession(sessionId: number, userId: number): Promise<ParkingSessionResponse | null> {
    const sessionResult = await pool.query(
      'SELECT id, meter_id FROM parking_sessions WHERE id = $1 AND user_id = $2 AND status = $3',
      [sessionId, userId, 'active']
    );
    if (sessionResult.rows.length === 0) return null;

    const meterId = sessionResult.rows[0].meter_id;
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(
        `UPDATE parking_sessions SET status = 'ended', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
        [sessionId]
      );
      await client.query(
        'UPDATE parking_meters SET is_available = true, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
        [meterId]
      );
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }

    return this.getById(sessionId, userId);
  }

  async listByUser(userId: number, options?: { active_only?: boolean }): Promise<ParkingSessionResponse[]> {
    let query = `
      SELECT s.id, s.user_id, s.meter_id, s.started_at, s.ends_at, s.duration_minutes, s.status, m.meter_code
      FROM parking_sessions s
      LEFT JOIN parking_meters m ON m.id = s.meter_id
      WHERE s.user_id = $1
    `;
    const params: (number | boolean)[] = [userId];
    if (options?.active_only) {
      query += ` AND s.status = 'active' AND s.ends_at > CURRENT_TIMESTAMP`;
    }
    query += ' ORDER BY s.started_at DESC';

    const result = await pool.query(query, params);
    return result.rows.map((row) => this.toResponse(row));
  }

  private toResponse(row: {
    id: number;
    user_id: number;
    meter_id: number;
    started_at: Date;
    ends_at: Date;
    duration_minutes: number;
    status: string;
    meter_code?: string;
  }): ParkingSessionResponse {
    const started_at = row.started_at instanceof Date ? row.started_at : new Date(row.started_at);
    const ends_at = row.ends_at instanceof Date ? row.ends_at : new Date(row.ends_at);
    const remaining_seconds =
      row.status === 'active' && ends_at > new Date()
        ? Math.max(0, Math.floor((ends_at.getTime() - Date.now()) / 1000))
        : undefined;

    const out: ParkingSessionResponse = {
      id: row.id,
      user_id: row.user_id,
      meter_id: row.meter_id,
      started_at: started_at.toISOString(),
      ends_at: ends_at.toISOString(),
      duration_minutes: row.duration_minutes,
      status: row.status as 'active' | 'ended',
    };
    if (row.meter_code != null) out.meter_code = row.meter_code;
    if (remaining_seconds != null) out.remaining_seconds = remaining_seconds;
    return out;
  }
}
