import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

/**
 * Vercel serverless + Supabase Postgres:
 * - Prefer DATABASE_URL; fall back to POSTGRES_URL (from Supabase Vercel integration).
 * - On Vercel: use explicit connection config so ssl.rejectUnauthorized: false takes effect
 *   (connectionString parsing can override our ssl config otherwise).
 */
const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

function createPool() {
  const baseConfig = {
    max: process.env.VERCEL ? 1 : 10,
    idleTimeoutMillis: process.env.VERCEL ? 20_000 : 30_000,
    connectionTimeoutMillis: 15_000,
    allowExitOnIdle: Boolean(process.env.VERCEL),
  };

  if (process.env.VERCEL && connectionString) {
    try {
      const url = new URL(connectionString);
      return new Pool({
        ...baseConfig,
        host: url.hostname,
        port: parseInt(url.port || '5432', 10),
        user: url.username || undefined,
        password: url.password || undefined,
        database: url.pathname?.slice(1) || 'postgres',
        ssl: { rejectUnauthorized: false },
      });
    } catch {
      // fallback to connectionString if URL parse fails
    }
  }

  return new Pool({
    ...baseConfig,
    connectionString,
  });
}

const pool = createPool();
export const db = drizzle(pool, { schema });
