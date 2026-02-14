import pool from './database';

export const initializeSchema = async (): Promise<void> => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      first_name VARCHAR(100),
      last_name VARCHAR(100),
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS parking_spots (
      id SERIAL PRIMARY KEY,
      location VARCHAR(255) NOT NULL,
      price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
      is_available BOOLEAN NOT NULL DEFAULT true,
      latitude DECIMAL(10, 8) NOT NULL,
      longitude DECIMAL(11, 8) NOT NULL
    )
  `);

  await pool.query(`
    ALTER TABLE parking_spots
    ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
    ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8)
  `);

  const countResult = await pool.query('SELECT COUNT(*) FROM parking_spots');
  const count = Number.parseInt(countResult.rows[0]?.count ?? '0', 10);

  if (count === 0) {
    await pool.query(`
      INSERT INTO parking_spots (location, price, is_available, latitude, longitude)
      VALUES
        ('MG Road - Parking Bay A', 2.50, true, 12.97582600, 77.60610200),
        ('Indiranagar 100 Feet Road - Spot 12', 3.00, true, 12.97189100, 77.64115100),
        ('Koramangala 5th Block - Basement B2', 4.25, false, 12.93522300, 77.62448100)
    `);
  }

  await pool.query(`
    UPDATE parking_spots
    SET location = CASE
      WHEN location = 'Downtown - Lot A' THEN 'MG Road - Parking Bay A'
      WHEN location = 'Main Street - Spot 12' THEN 'Indiranagar 100 Feet Road - Spot 12'
      WHEN location = 'City Center - Basement B2' THEN 'Koramangala 5th Block - Basement B2'
      ELSE location
    END
    WHERE location IN (
      'Downtown - Lot A',
      'Main Street - Spot 12',
      'City Center - Basement B2'
    )
  `);

  await pool.query(`
    UPDATE parking_spots
    SET
      latitude = CASE
        WHEN location = 'MG Road - Parking Bay A' THEN 12.97582600
        WHEN location = 'Indiranagar 100 Feet Road - Spot 12' THEN 12.97189100
        WHEN location = 'Koramangala 5th Block - Basement B2' THEN 12.93522300
        ELSE latitude
      END,
      longitude = CASE
        WHEN location = 'MG Road - Parking Bay A' THEN 77.60610200
        WHEN location = 'Indiranagar 100 Feet Road - Spot 12' THEN 77.64115100
        WHEN location = 'Koramangala 5th Block - Basement B2' THEN 77.62448100
        ELSE longitude
      END
    WHERE location IN (
      'MG Road - Parking Bay A',
      'Indiranagar 100 Feet Road - Spot 12',
      'Koramangala 5th Block - Basement B2'
    )
  `);

  await pool.query(`
    WITH new_spots(location, price, is_available, latitude, longitude) AS (
      VALUES
        ('Brigade Road - Public Parking', 3.00, true, 12.97160800, 77.60717800),
        ('UB City - Multi Level Parking', 4.50, true, 12.97170900, 77.59500900),
        ('Church Street - Street Parking Zone', 3.50, true, 12.97400100, 77.60594000),
        ('Jayanagar 4th Block - Shopping Complex Parking', 2.75, true, 12.92500700, 77.58365200),
        ('Malleswaram 8th Cross - Market Parking', 2.50, true, 13.00112600, 77.57033200),
        ('Whitefield - ITPL Main Parking', 3.25, true, 12.98509000, 77.73605300),
        ('Electronic City Phase 1 - Hub Parking', 2.25, true, 12.83993400, 77.67703200),
        ('Kempegowda International Airport - Short Stay Parking', 5.00, true, 13.19863500, 77.70658900),
        ('Majestic - City Railway Station Parking', 2.00, true, 12.97815500, 77.57287500)
    )
    INSERT INTO parking_spots (location, price, is_available, latitude, longitude)
    SELECT n.location, n.price, n.is_available, n.latitude, n.longitude
    FROM new_spots n
    WHERE NOT EXISTS (
      SELECT 1 FROM parking_spots p WHERE p.location = n.location
    )
  `);

  const rowsWithoutCoordinates = await pool.query<{
    id: number;
  }>('SELECT id FROM parking_spots WHERE latitude IS NULL OR longitude IS NULL ORDER BY id');

  const baseLat = 40.7128;
  const baseLon = -74.0060;

  for (let i = 0; i < rowsWithoutCoordinates.rows.length; i += 1) {
    const row = rowsWithoutCoordinates.rows[i]!;
    const ring = Math.floor(i / 8) + 1;
    const angle = ((i % 8) / 8) * Math.PI * 2;
    const offset = 0.0012 * ring;
    const latitude = baseLat + Math.sin(angle) * offset;
    const longitude = baseLon + Math.cos(angle) * offset;

    await pool.query(
      `
        UPDATE parking_spots
        SET latitude = $2, longitude = $3
        WHERE id = $1
      `,
      [row.id, latitude, longitude]
    );
  }

  await pool.query(`
    ALTER TABLE parking_spots
    ALTER COLUMN latitude SET NOT NULL,
    ALTER COLUMN longitude SET NOT NULL
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS reservations (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      spot_id INTEGER NOT NULL REFERENCES parking_spots(id) ON DELETE CASCADE,
      status VARCHAR(20) NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'expired', 'cancelled', 'completed')),
      reserved_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(
    'CREATE INDEX IF NOT EXISTS idx_reservations_user_id ON reservations(user_id)'
  );
  await pool.query(
    'CREATE INDEX IF NOT EXISTS idx_reservations_status_expires_at ON reservations(status, expires_at)'
  );
};
