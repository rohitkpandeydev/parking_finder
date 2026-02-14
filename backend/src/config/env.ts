import dotenv from 'dotenv';
import path from 'path';

// Load env from backend/.env in both src and dist runtime contexts.
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const parseBoolean = (value: string | undefined, defaultValue: boolean): boolean => {
  if (value === undefined) {
    return defaultValue;
  }

  return value.toLowerCase() === 'true';
};

const parsePort = (value: string | undefined, fallback: number): number => {
  if (!value) {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
};

export interface AppEnv {
  port: number;
  dbHost: string;
  dbPort: number;
  dbName: string;
  dbUser: string;
  dbPassword: string;
  dbSsl: boolean;
  dbSslRejectUnauthorized: boolean;
}

const dbHost = process.env.RDS_HOST || process.env.DB_HOST;
const dbPortValue = process.env.RDS_PORT || process.env.DB_PORT;
const dbName = process.env.RDS_DB_NAME || process.env.DB_NAME;
const dbUser = process.env.RDS_USERNAME || process.env.DB_USER;
const dbPassword = process.env.RDS_PASSWORD || process.env.DB_PASSWORD;

if (!dbHost || !dbName || !dbUser || !dbPassword) {
  throw new Error(
    'Missing database credentials. Set RDS_HOST/RDS_DB_NAME/RDS_USERNAME/RDS_PASSWORD (or DB_HOST/DB_NAME/DB_USER/DB_PASSWORD).',
  );
}

export const env: AppEnv = {
  port: parsePort(process.env.PORT, 3000),
  dbHost,
  dbPort: parsePort(dbPortValue, 5432),
  dbName,
  dbUser,
  dbPassword,
  dbSsl: parseBoolean(process.env.DB_SSL, true),
  dbSslRejectUnauthorized: parseBoolean(process.env.DB_SSL_REJECT_UNAUTHORIZED, false),
};
