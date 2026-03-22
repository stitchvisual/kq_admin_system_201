import { drizzle } from "drizzle-orm/postgres-js";
import postgres, { type Sql } from "postgres";
import * as schema from "./schema";

// Use pooled connection URL for serverless environments to avoid connection limits
const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("Database connection string not found. Please set POSTGRES_URL or DATABASE_URL environment variable.");
}

// Singleton pattern to prevent creating multiple connections in serverless
const globalForDb = globalThis as unknown as {
  client: Sql | undefined;
};

const client = globalForDb.client ?? postgres(connectionString, {
  ssl: "require",
  prepare: false, // Disable prepared statements for connection pooling (e.g., PgBouncer)
  max: 1, // Limit connections in serverless environment
  idle_timeout: 20, // Close idle connections after 20 seconds
  connect_timeout: 10, // Connection timeout
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

if (process.env.NODE_ENV !== "production") {
  globalForDb.client = client;
}

export const db = drizzle(client, { schema });
