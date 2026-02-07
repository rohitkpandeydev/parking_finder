import { Pool, Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = parseInt(process.env.DB_PORT || '5432');
const DB_NAME = process.env.DB_NAME || 'parking_finder';
const DB_USER = process.env.DB_USER || 'postgres';
const DB_PASSWORD = process.env.DB_PASSWORD || 'postgres';

// Create database if it doesn't exist
const createDatabaseIfNotExists = async (): Promise<void> => {
  // Connect to default 'postgres' database to create our database
  const adminClient = new Client({
    host: DB_HOST,
    port: DB_PORT,
    database: 'postgres', // Connect to default database
    user: DB_USER,
    password: DB_PASSWORD,
  });

  try {
    await adminClient.connect();
    
    // Check if database exists
    const result = await adminClient.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [DB_NAME]
    );

    if (result.rows.length === 0) {
      // Database doesn't exist, create it
      await adminClient.query(`CREATE DATABASE ${DB_NAME}`);
      console.log(`Database "${DB_NAME}" created successfully`);
    } else {
      console.log(`Database "${DB_NAME}" already exists`);
    }
  } catch (error) {
    console.error('Error creating database:', error);
    throw error;
  } finally {
    await adminClient.end();
  }
};

const pool = new Pool({
  host: DB_HOST,
  port: DB_PORT,
  database: DB_NAME,
  user: DB_USER,
  password: DB_PASSWORD,
});

// Initialize database schema
export const initializeDatabase = async (): Promise<void> => {
  try {
    // First, ensure the database exists
    await createDatabaseIfNotExists();
    
    // Then create tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS parking_meters (
        id SERIAL PRIMARY KEY,
        meter_code VARCHAR(50) UNIQUE NOT NULL,
        latitude DECIMAL(10, 8) NOT NULL,
        longitude DECIMAL(11, 8) NOT NULL,
        price_per_hour DECIMAL(10, 2) NOT NULL,
        address VARCHAR(255),
        is_available BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS parking_sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        meter_id INTEGER NOT NULL REFERENCES parking_meters(id) ON DELETE CASCADE,
        started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        ends_at TIMESTAMP NOT NULL,
        duration_minutes INTEGER NOT NULL,
        status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'ended')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query('CREATE INDEX IF NOT EXISTS idx_parking_sessions_user_id ON parking_sessions(user_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_parking_sessions_status ON parking_sessions(status)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_parking_sessions_ends_at ON parking_sessions(ends_at)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_parking_meters_available ON parking_meters(is_available)');

    // Seed sample parking meters if none exist
    const countResult = await pool.query('SELECT COUNT(*) FROM parking_meters');
    if (parseInt(countResult.rows[0].count, 10) === 0) {
      await pool.query(`
        INSERT INTO parking_meters (meter_code, latitude, longitude, price_per_hour, address) VALUES
        ('MTR-001', 40.7128, -74.0060, 2.50, '123 Main St'),
        ('MTR-002', 40.7135, -74.0070, 3.00, '456 Oak Ave'),
        ('MTR-003', 40.7140, -74.0080, 2.75, '789 Pine Rd'),
        ('MTR-004', 40.7145, -74.0050, 2.25, '321 Elm St'),
        ('MTR-005', 40.7150, -74.0090, 3.25, '654 Maple Dr')
      `);
      console.log('Seeded sample parking meters');
    }

    console.log('Database schema initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

export default pool;
