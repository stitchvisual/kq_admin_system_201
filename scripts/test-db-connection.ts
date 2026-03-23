/**
 * Database Connection Test Script
 * 
 * Run with: npx tsx scripts/test-db-connection.ts
 * 
 * This script verifies that your DATABASE_URL is correctly configured
 * and can connect to your Supabase PostgreSQL database.
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local file
config({ path: resolve(process.cwd(), '.env.local') });

import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { sql } from 'drizzle-orm';

async function testConnection() {
  console.log('🔍 Testing database connection...\n');

  // Check if DATABASE_URL is set
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('❌ DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  // Mask the password in the URL for safe display
  const maskedUrl = dbUrl.replace(/:([^:@]+)@/, ':****@');
  console.log(`📍 Database URL: ${maskedUrl}\n`);

  // Parse the connection URL and create pool with SSL (required for Supabase)
  let pool: Pool;
  try {
    const url = new URL(dbUrl);
    pool = new Pool({
      host: url.hostname,
      port: parseInt(url.port || '5432', 10),
      user: url.username || undefined,
      password: url.password || undefined,
      database: url.pathname?.slice(1) || 'postgres',
      ssl: { rejectUnauthorized: false }, // Required for Supabase
      connectionTimeoutMillis: 15_000,
    });
  } catch (e) {
    console.error('❌ Failed to parse DATABASE_URL');
    process.exit(1);
  }

  const db = drizzle(pool);

  try {
    // Test basic connection
    const result = await db.execute(sql`SELECT 1 as test`);
    console.log('✅ Database connection successful!');
    console.log(`   Query result: ${JSON.stringify(result.rows[0])}\n`);

    // Get database version
    const versionResult = await db.execute(sql`SELECT version()`);
    console.log('📊 Database version:');
    console.log(`   ${versionResult.rows[0]?.version}\n`);

    // List existing tables
    const tablesResult = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log(`📋 Tables found (${tablesResult.rows.length}):`);
    tablesResult.rows.forEach((row: any) => {
      console.log(`   - ${row.table_name}`);
    });

    console.log('\n🎉 All database tests passed!');
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Database connection failed:');
    if (error instanceof Error) {
      console.error(`   Error: ${error.message}`);
      if (error.stack) {
        console.error(`   Stack: ${error.stack.split('\n').slice(0, 3).join('\n')}`);
      }
    } else {
      console.error(error);
    }
    await pool.end().catch(() => {});
    process.exit(1);
  }
}

testConnection();