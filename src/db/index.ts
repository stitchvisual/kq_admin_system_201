import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("Database connection string not found. Please set POSTGRES_URL or DATABASE_URL environment variable.");
}

const client = postgres(connectionString, {
  ssl: "require",
  prepare: false, // Disable prefetch for serverless environments
});

export const db = drizzle(client, { schema });
