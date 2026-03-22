import { NextResponse } from 'next/server';
import { db } from '@/db';
import { sql } from 'drizzle-orm';
import { requireAdmin } from '@/lib/auth';

async function performDatabaseClear() {
    // Delete in order respecting foreign key constraints
    // 1. invoice_items first (references invoices and appointments)
    await db.execute(sql`DELETE FROM invoice_items`);
    console.log('✓ Cleared invoice_items');

    // 2. invoices (references clients)
    await db.execute(sql`DELETE FROM invoices`);
    console.log('✓ Cleared invoices');

    // 3. appointment_participants (references appointments and clients)
    await db.execute(sql`DELETE FROM appointment_participants`);
    console.log('✓ Cleared appointment_participants');

    // 4. appointments (references clients)
    await db.execute(sql`DELETE FROM appointments`);
    console.log('✓ Cleared appointments');

    // 5. clients (no dependencies)
    await db.execute(sql`DELETE FROM clients`);
    console.log('✓ Cleared clients');
}

export async function GET() {
  try {
    await requireAdmin();

    console.log('Starting database clear operation (GET request)...');

    await performDatabaseClear();

    console.log('Database clear operation completed successfully');

    return NextResponse.json({
      success: true,
      message: 'Database cleared successfully. ndis_pricing table was preserved.',
    });
  } catch (error) {
    console.error('Error clearing database:', error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    await requireAdmin();

    console.log('Starting database clear operation (POST request)...');

    await performDatabaseClear();

    console.log('Database clear operation completed successfully');

    return NextResponse.json({
      success: true,
      message: 'Database cleared successfully. ndis_pricing table was preserved.',
    });
  } catch (error) {
    console.error('Error clearing database:', error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}