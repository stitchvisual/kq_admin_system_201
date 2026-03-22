import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

let connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("Database connection string not found. Please set POSTGRES_URL or DATABASE_URL environment variable.");
}

// Ensure sslmode is set in the connection string for Supabase
if (!connectionString.includes("sslmode=")) {
  connectionString += connectionString.includes("?") ? "&sslmode=require" : "?sslmode=require";
}

const pool = new Pool({ 
  connectionString,
});

export const db = drizzle(pool, { schema });
