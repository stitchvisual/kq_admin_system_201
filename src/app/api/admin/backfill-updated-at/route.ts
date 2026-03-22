 import { NextResponse } from 'next/server';
import { db } from '@/db';
import { sql } from 'drizzle-orm';
import { requireAdmin } from '@/lib/auth';

export async function POST() {
  try {
    await requireAdmin();
    
    console.log('Backfilling NULL updated_at values in invoices...');
    
    await db.execute(sql`
      UPDATE invoices 
      SET updated_at = COALESCE(updated_at, created_at)
      WHERE updated_at IS NULL
    `);
    
    const result = await db.execute(sql`
      SELECT COUNT(*) as null_count FROM invoices WHERE updated_at IS NULL
    `);
    
    const nullCount = parseInt(String(result.rows[0]?.null_count) || '0');
    
    return NextResponse.json({
      success: true,
      message: `Backfilled ${nullCount === 0 ? 'all' : 'some'} invoice updated_at values`,
      remainingNulls: nullCount,
    });
  } catch (error) {
    console.error('Error backfilling updated_at:', error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}