import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Prefer non-pooling URL for serverless postgres driver, fall back to pooled URL
const connectionString = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("Database connection string not found. Please set POSTGRES_URL or DATABASE_URL environment variable.");
}

const client = postgres(connectionString, {
  ssl: "require",
  prepare: false, // Disable prefetch for serverless environments
  transform: {
    undefined: null,
  },
  types: {
    // Ensure Date objects are properly serialized to ISO strings
    date: {
      to: 1184, // timestamptz OID
      from: [1082, 1083, 1114, 1184], // date, time, timestamp, timestamptz
      serialize: (x: Date) => x.toISOString(),
      parse: (x: string) => new Date(x),
    },
  },
});

export const db = drizzle(client, { schema });
