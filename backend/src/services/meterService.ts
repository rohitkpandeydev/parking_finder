import pool from '../config/database';
import { ParkingMeter, ParkingMeterResponse } from '../models/ParkingMeter';

// Haversine formula to calculate distance in km
function distanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export class MeterService {
  async list(options?: {
    latitude?: number;
    longitude?: number;
    radius_km?: number;
    available_only?: boolean;
  }): Promise<ParkingMeterResponse[]> {
    let query = `
      SELECT id, meter_code, latitude, longitude, price_per_hour, address, is_available
      FROM parking_meters
    `;
    const params: (number | boolean)[] = [];
    let paramIndex = 1;

    if (options?.available_only) {
      query += ` WHERE is_available = $${paramIndex}`;
      params.push(true);
      paramIndex++;
    }

    query += ' ORDER BY id';

    const result = await pool.query(query, params);
    let rows = result.rows as (ParkingMeter & { latitude: string; longitude: string; price_per_hour: string })[];

    const meters: ParkingMeterResponse[] = rows.map((r) => {
      const out: ParkingMeterResponse = {
        id: r.id,
        meter_code: r.meter_code,
        latitude: parseFloat(r.latitude as unknown as string),
        longitude: parseFloat(r.longitude as unknown as string),
        price_per_hour: parseFloat(r.price_per_hour as unknown as string),
        is_available: r.is_available,
      };
      if (r.address != null) out.address = r.address;
      return out;
    });

    if (options?.latitude != null && options?.longitude != null) {
      const userLat = options.latitude;
      const userLon = options.longitude;
      const radius = options.radius_km ?? 10;

      const withDistance = meters
        .map((m) => ({
          ...m,
          distance_km: distanceKm(
            userLat,
            userLon,
            m.latitude,
            m.longitude
          ),
        }))
        .filter((m) => m.distance_km! <= radius)
        .sort((a, b) => (a.distance_km ?? 0) - (b.distance_km ?? 0));

      return withDistance;
    }

    return meters;
  }

  async getById(id: number): Promise<ParkingMeterResponse | null> {
    const result = await pool.query(
      `SELECT id, meter_code, latitude, longitude, price_per_hour, address, is_available
       FROM parking_meters WHERE id = $1`,
      [id]
    );
    if (result.rows.length === 0) return null;
    const r = result.rows[0] as ParkingMeter & { latitude: string; longitude: string; price_per_hour: string };
    const out: ParkingMeterResponse = {
      id: r.id,
      meter_code: r.meter_code,
      latitude: parseFloat(r.latitude as unknown as string),
      longitude: parseFloat(r.longitude as unknown as string),
      price_per_hour: parseFloat(r.price_per_hour as unknown as string),
      is_available: r.is_available,
    };
    if (r.address != null) out.address = r.address;
    return out;
  }
}
