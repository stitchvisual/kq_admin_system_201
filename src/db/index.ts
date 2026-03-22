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
    value: (value: unknown) => {
      // Serialize Date objects to ISO strings for the postgres driver
      if (value instanceof Date) {
        return value.toISOString();
      }
      return value;
    },
  },
});

export const db = drizzle(client, { schema });
