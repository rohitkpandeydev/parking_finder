import { Pool } from 'pg';
import { env } from './env';

const ssl = env.dbSsl
  ? { rejectUnauthorized: env.dbSslRejectUnauthorized }
  : undefined;

const pool = new Pool({
  host: env.dbHost,
  port: env.dbPort,
  database: env.dbName,
  user: env.dbUser,
  password: env.dbPassword,
  ssl,
});

export const checkDatabaseConnection = async (): Promise<void> => {
  await pool.query('SELECT 1');
};

export const closeDatabaseConnection = async (): Promise<void> => {
  await pool.end();
};

export default pool;
