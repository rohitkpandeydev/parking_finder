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
        ('Downtown - Lot A', 2.50, true, 40.71277600, -74.00597400),
        ('Main Street - Spot 12', 3.00, true, 40.71422000, -74.00788000),
        ('City Center - Basement B2', 4.25, false, 40.71134000, -74.00371000)
    `);
  }

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
